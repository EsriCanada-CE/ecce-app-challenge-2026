import fs from "node:fs/promises";
import path from "node:path";

import { MinPriorityQueue } from "@/lib/routing/priority-queue";
import { snapRouteEndpointsToGraph } from "@/lib/routing/snapping";
import type {
  RouteSnapResult,
  RoutingEdge,
  RoutingGraph,
  RoutingNode,
  RoutingNodeId,
} from "@/lib/routing/contracts";
import type { RoutePathCoordinate, RoutePoint } from "@/lib/route-types";

type SidewalkFeatureCollection = {
  type: "FeatureCollection";
  features: SidewalkFeature[];
};

type SidewalkFeature = {
  geometry: SidewalkLineGeometry | SidewalkMultiLineGeometry | null;
  properties?: SidewalkFeatureProperties;
};

type SidewalkLineGeometry = {
  type: "LineString";
  coordinates: RoutePathCoordinate[];
};

type SidewalkMultiLineGeometry = {
  type: "MultiLineString";
  coordinates: RoutePathCoordinate[][];
};

type SidewalkFeatureProperties = {
  FID?: number;
  GEO_ID?: number;
  SDWLK_DESC?: string;
  Shape_Leng?: number;
  Shape__Length?: number;
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

export const WALKING_MAX_SNAP_DISTANCE_METERS = 150;
export const WALKING_NODE_REUSE_DISTANCE_METERS = 2;

let graphPromise: Promise<RoutingGraph> | null = null;

export async function getWalkingGraph(fallbackSpeedKph: number) {
  graphPromise ??= buildWalkingGraphFromFile(fallbackSpeedKph);
  return graphPromise;
}

export async function buildWalkingGraphFromFile(fallbackSpeedKph: number) {
  const sidewalksPath = path.join(process.cwd(), "public", "data", "Sidewalk.geojson");
  const sidewalksSource = await fs.readFile(sidewalksPath, "utf8");
  const collection = JSON.parse(sidewalksSource) as SidewalkFeatureCollection;

  return buildWalkingGraphFromFeatureCollection(collection, fallbackSpeedKph);
}

export function buildWalkingGraphFromFeatureCollection(
  collection: SidewalkFeatureCollection,
  fallbackSpeedKph: number,
): RoutingGraph {
  const nodes = new Map<RoutingNodeId, RoutingNode>();
  const edgesByNode = new Map<RoutingNodeId, RoutingEdge[]>();
  const edgeById = new Map<string, RoutingEdge>();
  const edgeIdsByBaseEdgeId = new Map<string, string[]>();

  for (const feature of collection.features) {
    if (!isWalkableSidewalkFeature(feature)) {
      continue;
    }

    const edges = createWalkingEdges(feature, fallbackSpeedKph);

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

export function isWalkableSidewalkFeature(feature: SidewalkFeature) {
  const description = feature.properties?.SDWLK_DESC?.trim();

  if (!description) {
    return false;
  }

  if (
    /no sidewalk/i.test(description) ||
    /without any sidewalks/i.test(description) ||
    /not applicable/i.test(description) ||
    /under development/i.test(description)
  ) {
    return false;
  }

  return /sidewalk|walkway|trail/i.test(description);
}

export function createWalkingEdges(feature: SidewalkFeature, fallbackSpeedKph: number) {
  const coordinateSets = getFeatureCoordinateSets(feature.geometry);

  if (coordinateSets.length === 0) {
    return [];
  }

  const measuredSegmentLengths = coordinateSets.map((coordinates) =>
    getGeometryLengthMeters(coordinates),
  );
  const totalMeasuredLengthMeters = measuredSegmentLengths.reduce(
    (total, lengthMeters) => total + lengthMeters,
    0,
  );
  const featureLengthMeters = getFeatureLengthMeters(feature.properties);
  const edges: RoutingEdge[] = [];

  for (const [segmentIndex, coordinates] of coordinateSets.entries()) {
    if (coordinates.length < 2) {
      continue;
    }

    const measuredSegmentLengthMeters = measuredSegmentLengths[segmentIndex];

    if (measuredSegmentLengthMeters <= 0) {
      continue;
    }

    const lengthMeters =
      featureLengthMeters && totalMeasuredLengthMeters > 0
        ? (featureLengthMeters * measuredSegmentLengthMeters) / totalMeasuredLengthMeters
        : measuredSegmentLengthMeters;
    const durationSeconds = calculateWalkingDurationSeconds(lengthMeters, fallbackSpeedKph);
    const fromNodeId = getNodeId(coordinates[0]);
    const toNodeId = getNodeId(coordinates[coordinates.length - 1]);
    const featureId =
      feature.properties?.FID ?? feature.properties?.GEO_ID ?? `segment-${segmentIndex}`;
    const baseEdgeId = `${String(featureId)}:${segmentIndex}`;
    const cumulativeLengthsMeters = getCumulativeLengthsMeters(coordinates);

    edges.push({
      id: `${baseEdgeId}:forward`,
      baseEdgeId,
      fromNodeId,
      toNodeId,
      layer: "sidewalks",
      direction: "forward",
      lengthMeters,
      durationSeconds,
      speedKph: fallbackSpeedKph,
      geometry: coordinates,
      cumulativeLengthsMeters,
    });

    const reversedGeometry = [...coordinates].reverse();

    edges.push({
      id: `${baseEdgeId}:reverse`,
      baseEdgeId,
      fromNodeId: toNodeId,
      toNodeId: fromNodeId,
      layer: "sidewalks",
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

export function calculateWalkingDurationSeconds(lengthMeters: number, speedKph: number) {
  const metersPerSecond = (speedKph * 1_000) / 3_600;
  return lengthMeters / metersPerSecond;
}

export function snapWalkingRouteToGraph(
  graph: RoutingGraph,
  start: RoutePoint,
  end: RoutePoint,
): RouteSnapResult {
  return snapRouteEndpointsToGraph({
    graph,
    start,
    end,
    allowedLayers: ["sidewalks"],
    syntheticNodePrefix: "snap:walking",
    maxSnapDistanceMeters: WALKING_MAX_SNAP_DISTANCE_METERS,
    nodeReuseDistanceMeters: WALKING_NODE_REUSE_DISTANCE_METERS,
    tooFarMessage: "No walkable sidewalk is close enough to that point.",
  });
}

export function solveWalkingGraph(
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
      return reconstructWalkingRoute(cameFrom, endNodeId);
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

function reconstructWalkingRoute(
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

function getFeatureCoordinateSets(geometry: SidewalkFeature["geometry"]) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "LineString") {
    return [geometry.coordinates];
  }

  return geometry.coordinates;
}

function getFeatureLengthMeters(properties: SidewalkFeatureProperties | undefined) {
  if (Number.isFinite(properties?.Shape__Length) && (properties?.Shape__Length ?? 0) > 0) {
    return properties?.Shape__Length as number;
  }

  if (Number.isFinite(properties?.Shape_Leng) && (properties?.Shape_Leng ?? 0) > 0) {
    return properties?.Shape_Leng as number;
  }

  return null;
}

function getNodeId(coordinate: RoutePathCoordinate) {
  return `sidewalk:${coordinate[0].toFixed(6)},${coordinate[1].toFixed(6)}`;
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

function getGeometryLengthMeters(coordinates: RoutePathCoordinate[]) {
  return coordinates.slice(1).reduce((total, coordinate, index) => {
    return total + getDistanceMeters(coordinates[index], coordinate);
  }, 0);
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
