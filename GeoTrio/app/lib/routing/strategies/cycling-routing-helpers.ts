import fs from "node:fs/promises";
import path from "node:path";

import { MinPriorityQueue } from "@/lib/routing/priority-queue";
import { snapRouteEndpointsToGraph } from "@/lib/routing/snapping";
import { shouldIncludeRoadFeature } from "@/lib/routing/strategies/road-feature-filter";
import type {
  RouteSnapResult,
  RoutingDirection,
  RoutingEdge,
  RoutingGraph,
  RoutingNode,
  RoutingNodeId,
} from "@/lib/routing/contracts";
import type { RoutePathCoordinate, RoutePoint } from "@/lib/route-types";

type RoadFeatureCollection = {
  type: "FeatureCollection";
  features: RoadFeature[];
};

type RoadFeature = {
  geometry: RoadLineGeometry | RoadMultiLineGeometry | null;
  properties: RoadFeatureProperties;
};

type RoadLineGeometry = {
  type: "LineString";
  coordinates: RoutePathCoordinate[];
};

type RoadMultiLineGeometry = {
  type: "MultiLineString";
  coordinates: RoutePathCoordinate[][];
};

type RoadFeatureProperties = {
  OBJECTID?: number;
  FROM_JUNCTION_ID?: number;
  TO_JUNCTION_ID?: number;
  LENGTH?: number;
  FULL_STREET_NAME?: string | null;
  FULL_STREET_NAME_1?: string | null;
  ORIGINAL_STREET_NAME?: string | null;
  STANDARD_MUNICIPALITY?: string | null;
  DIRECTION_OF_TRAFFIC_FLOW?: string;
};

type RouteAccumulator = {
  distanceMeters: number;
  durationSeconds: number;
  path: RoutePathCoordinate[];
};

export type { RouteAccumulator };

type CameFrom = {
  previousNodeId: RoutingNodeId;
  edge: RoutingEdge;
};

export const CYCLING_MAX_SNAP_DISTANCE_METERS = 50;
export const CYCLING_NODE_REUSE_DISTANCE_METERS = 2;

let graphPromise: Promise<RoutingGraph> | null = null;

export async function getCyclingGraph(fallbackSpeedKph: number) {
  graphPromise ??= buildCyclingGraphFromFile(fallbackSpeedKph);
  return graphPromise;
}

export async function buildCyclingGraphFromFile(fallbackSpeedKph: number) {
  const roadsPath = path.join(process.cwd(), "public", "data", "Road.geojson");
  const roadsSource = await fs.readFile(roadsPath, "utf8");
  const collection = JSON.parse(roadsSource) as RoadFeatureCollection;

  return buildCyclingGraphFromFeatureCollection(collection, fallbackSpeedKph);
}

export function buildCyclingGraphFromFeatureCollection(
  collection: RoadFeatureCollection,
  fallbackSpeedKph: number,
): RoutingGraph {
  const nodes = new Map<RoutingNodeId, RoutingNode>();
  const edgesByNode = new Map<RoutingNodeId, RoutingEdge[]>();
  const edgeById = new Map<string, RoutingEdge>();
  const edgeIdsByBaseEdgeId = new Map<string, string[]>();

  for (const feature of collection.features) {
    if (!shouldIncludeRoadFeature(feature)) {
      continue;
    }

    const edges = createCyclingRoadEdges(feature, fallbackSpeedKph);

    for (const edge of edges) {
      upsertNode(nodes, edge.fromNodeId, edge.geometry[0]);
      upsertNode(nodes, edge.toNodeId, edge.geometry[edge.geometry.length - 1]);
      const existingEdges = edgesByNode.get(edge.fromNodeId) ?? [];
      existingEdges.push(edge);
      edgesByNode.set(edge.fromNodeId, existingEdges);
      edgeById.set(edge.id, edge);
      const siblingEdgeIds = edgeIdsByBaseEdgeId.get(edge.baseEdgeId) ?? [];
      siblingEdgeIds.push(edge.id);
      edgeIdsByBaseEdgeId.set(edge.baseEdgeId, siblingEdgeIds);
    }
  }

  return {
    nodes,
    nodeList: [...nodes.values()],
    edgesByNode,
    edgeById,
    edgeIdsByBaseEdgeId,
  };
}

export function createCyclingRoadEdges(feature: RoadFeature, fallbackSpeedKph: number) {
  const coordinates = getFeatureCoordinates(feature.geometry);
  const fromNodeId = feature.properties.FROM_JUNCTION_ID;
  const toNodeId = feature.properties.TO_JUNCTION_ID;

  if (!fromNodeId || !toNodeId || coordinates.length < 2) {
    return [];
  }

  const lengthMeters = getRoadLengthMeters(feature.properties.LENGTH, coordinates);
  const durationSeconds = calculateCyclingDurationSeconds(lengthMeters, fallbackSpeedKph);
  const direction = getRoadDirection(feature.properties.DIRECTION_OF_TRAFFIC_FLOW);
  const baseEdgeId = String(
    feature.properties.OBJECTID ?? `${fromNodeId}-${toNodeId}-${lengthMeters}`,
  );
  const cumulativeLengthsMeters = getCumulativeLengthsMeters(coordinates);
  const edges: RoutingEdge[] = [];

  if (direction === "both" || direction === "forward") {
    edges.push({
      id: `${baseEdgeId}:forward`,
      baseEdgeId,
      fromNodeId,
      toNodeId,
      layer: "roads",
      direction: "forward",
      lengthMeters,
      durationSeconds,
      speedKph: fallbackSpeedKph,
      geometry: coordinates,
      cumulativeLengthsMeters,
    });
  }

  if (direction === "both" || direction === "reverse") {
    const reversedGeometry = [...coordinates].reverse();

    edges.push({
      id: `${baseEdgeId}:reverse`,
      baseEdgeId,
      fromNodeId: toNodeId,
      toNodeId: fromNodeId,
      layer: "roads",
      direction: "reverse",
      lengthMeters,
      durationSeconds,
      speedKph: fallbackSpeedKph,
      geometry: reversedGeometry,
      cumulativeLengthsMeters: getCumulativeLengthsMeters(reversedGeometry),
    });
  }

  return edges;
}

export function calculateCyclingDurationSeconds(lengthMeters: number, speedKph: number) {
  const metersPerSecond = (speedKph * 1_000) / 3_600;
  return lengthMeters / metersPerSecond;
}

export function snapCyclingRouteToGraph(
  graph: RoutingGraph,
  start: RoutePoint,
  end: RoutePoint,
): RouteSnapResult {
  return snapRouteEndpointsToGraph({
    graph,
    start,
    end,
    allowedLayers: ["roads"],
    syntheticNodePrefix: "snap:cycling",
    maxSnapDistanceMeters: CYCLING_MAX_SNAP_DISTANCE_METERS,
    nodeReuseDistanceMeters: CYCLING_NODE_REUSE_DISTANCE_METERS,
    tooFarMessage: "No bikeable road is close enough to that point.",
  });
}

export function solveCyclingGraph(
  graph: RoutingGraph,
  startNodeId: RoutingNodeId,
  endNodeId: RoutingNodeId,
): RouteAccumulator | null {
  if (startNodeId === endNodeId) {
    const node = graph.nodes.get(startNodeId);

    if (!node) {
      return null;
    }

    return {
      distanceMeters: 0,
      durationSeconds: 0,
      path: [[node.longitude, node.latitude]],
    };
  }

  const startNode = graph.nodes.get(startNodeId);
  const endNode = graph.nodes.get(endNodeId);

  if (!startNode || !endNode) {
    return null;
  }

  const frontier = new MinPriorityQueue<RoutingNodeId>();
  const visited = new Set<RoutingNodeId>();
  const durationFromStart = new Map<RoutingNodeId, number>([[startNodeId, 0]]);
  const cameFrom = new Map<RoutingNodeId, CameFrom>();

  frontier.push(startNodeId, 0);

  while (frontier.size > 0) {
    const currentNodeId = frontier.pop();

    if (currentNodeId === null || visited.has(currentNodeId)) {
      continue;
    }

    if (currentNodeId === endNodeId) {
      return reconstructCyclingRoute(cameFrom, currentNodeId);
    }

    visited.add(currentNodeId);

    for (const edge of graph.edgesByNode.get(currentNodeId) ?? []) {
      if (visited.has(edge.toNodeId)) {
        continue;
      }

      const nextDuration =
        (durationFromStart.get(currentNodeId) ?? Number.POSITIVE_INFINITY) + edge.durationSeconds;
      const knownDuration = durationFromStart.get(edge.toNodeId) ?? Number.POSITIVE_INFINITY;

      if (nextDuration >= knownDuration) {
        continue;
      }

      durationFromStart.set(edge.toNodeId, nextDuration);
      cameFrom.set(edge.toNodeId, {
        previousNodeId: currentNodeId,
        edge,
      });
      frontier.push(edge.toNodeId, nextDuration);
    }
  }

  return null;
}

function reconstructCyclingRoute(
  cameFrom: Map<RoutingNodeId, CameFrom>,
  endNodeId: RoutingNodeId,
): RouteAccumulator | null {
  const traversedEdges: RoutingEdge[] = [];
  let currentNodeId: RoutingNodeId | undefined = endNodeId;

  while (currentNodeId !== undefined) {
    const step = cameFrom.get(currentNodeId);

    if (!step) {
      break;
    }

    traversedEdges.push(step.edge);
    currentNodeId = step.previousNodeId;
  }

  if (traversedEdges.length === 0) {
    return null;
  }

  traversedEdges.reverse();

  return {
    distanceMeters: traversedEdges.reduce((total, edge) => total + edge.lengthMeters, 0),
    durationSeconds: traversedEdges.reduce((total, edge) => total + edge.durationSeconds, 0),
    path: mergeEdgeGeometries(traversedEdges),
  };
}

function upsertNode(
  nodes: Map<RoutingNodeId, RoutingNode>,
  nodeId: RoutingNodeId,
  coordinate: RoutePathCoordinate,
) {
  if (nodes.has(nodeId)) {
    return;
  }

  nodes.set(nodeId, {
    id: nodeId,
    longitude: coordinate[0],
    latitude: coordinate[1],
  });
}

function getRoadDirection(directionOfTrafficFlow: string | undefined): RoutingDirection {
  if (directionOfTrafficFlow === "Positive") {
    return "forward";
  }

  if (directionOfTrafficFlow === "Negative") {
    return "reverse";
  }

  return "both";
}

function getRoadLengthMeters(
  lengthMeters: number | undefined,
  coordinates: RoutePathCoordinate[],
) {
  if (Number.isFinite(lengthMeters) && (lengthMeters ?? 0) > 0) {
    return lengthMeters as number;
  }

  return coordinates.slice(1).reduce((total, coordinate, index) => {
    return total + getDistanceMeters(coordinates[index], coordinate);
  }, 0);
}

function getFeatureCoordinates(geometry: RoadFeature["geometry"]) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "LineString") {
    return geometry.coordinates;
  }

  const merged: RoutePathCoordinate[] = [];

  for (const segment of geometry.coordinates) {
    if (merged.length === 0) {
      merged.push(...segment);
      continue;
    }

    merged.push(...segment.slice(1));
  }

  return merged;
}

function mergeEdgeGeometries(edges: RoutingEdge[]) {
  const path: RoutePathCoordinate[] = [];

  for (const edge of edges) {
    if (path.length === 0) {
      path.push(...edge.geometry);
      continue;
    }

    path.push(...edge.geometry.slice(1));
  }

  return path;
}

function getCumulativeLengthsMeters(geometry: RoutePathCoordinate[]) {
  const cumulativeLengthsMeters = [0];

  for (let index = 1; index < geometry.length; index += 1) {
    cumulativeLengthsMeters.push(
      cumulativeLengthsMeters[index - 1] + getDistanceMeters(geometry[index - 1], geometry[index]),
    );
  }

  return cumulativeLengthsMeters;
}

function getDistanceMeters(
  [startLongitude, startLatitude]: RoutePathCoordinate,
  [endLongitude, endLatitude]: RoutePathCoordinate,
) {
  const earthRadiusMeters = 6_371_000;
  const deltaLatitude = toRadians(endLatitude - startLatitude);
  const deltaLongitude = toRadians(endLongitude - startLongitude);
  const startLatitudeRadians = toRadians(startLatitude);
  const endLatitudeRadians = toRadians(endLatitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitudeRadians) *
    Math.cos(endLatitudeRadians) *
    Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
