import fs from "node:fs/promises";
import path from "node:path";

import { RoutingError } from "@/lib/routing/errors";
import { MinPriorityQueue } from "@/lib/routing/priority-queue";
import { snapRouteEndpointsToGraph } from "@/lib/routing/snapping";
import type { DrivingCostFactors } from "@/lib/routing/strategies/driving-conditions";
import { getDrivingRoadType } from "@/lib/routing/strategies/driving-conditions";
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
  SPEED_LIMIT?: number;
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

type CameFrom = {
  previousStateKey: string;
  edge: RoutingEdge;
};

type DrivingState = {
  stateKey: string;
  nodeId: RoutingNodeId;
  incomingEdgeId: string | null;
};

export const BASE_JUNCTION_DELAY_SECONDS = 12;
export const LEFT_TURN_DELAY_SECONDS = 18;
export const RIGHT_TURN_DELAY_SECONDS = 4;
export const STRAIGHT_TURN_DELAY_SECONDS = 8;
export const UTURN_DELAY_SECONDS = 18;
export const DRIVING_MAX_SNAP_DISTANCE_METERS = 50;
export const DRIVING_FALLBACK_MAX_SNAP_DISTANCE_METERS =
  DRIVING_MAX_SNAP_DISTANCE_METERS * 2;
export const DRIVING_NODE_REUSE_DISTANCE_METERS = 2;
export const DRIVING_SNAP_TOO_FAR_MESSAGE = "No drivable road is close enough to that point.";

let graphPromise: Promise<RoutingGraph> | null = null;

type DrivingSolveCostOptions = number | Partial<DrivingCostFactors> | undefined;

type NormalizedDrivingSolveCostOptions = DrivingCostFactors;

export async function getDrivingGraph(fallbackSpeedKph: number) {
  graphPromise ??= buildDrivingGraphFromFile(fallbackSpeedKph);
  return graphPromise;
}

export async function buildDrivingGraphFromFile(fallbackSpeedKph: number) {
  const roadsPath = path.join(process.cwd(), "public", "data", "Road.geojson");
  const roadsSource = await fs.readFile(roadsPath, "utf8");
  const collection = JSON.parse(roadsSource) as RoadFeatureCollection;

  return buildDrivingGraphFromFeatureCollection(collection, fallbackSpeedKph);
}

export function buildDrivingGraphFromFeatureCollection(
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

    const edges = createRoadEdges(feature, fallbackSpeedKph);

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

export function createRoadEdges(feature: RoadFeature, fallbackSpeedKph: number) {
  const coordinates = getFeatureCoordinates(feature.geometry);
  const fromNodeId = feature.properties.FROM_JUNCTION_ID;
  const toNodeId = feature.properties.TO_JUNCTION_ID;

  if (!fromNodeId || !toNodeId || coordinates.length < 2) {
    return [];
  }

  const lengthMeters = getRoadLengthMeters(feature.properties.LENGTH, coordinates);
  const speedKph = getRoadEdgeSpeedKph(feature.properties.SPEED_LIMIT, fallbackSpeedKph);
  const roadType = getDrivingRoadType(speedKph);
  const durationSeconds = calculateDrivingDurationSeconds(lengthMeters, speedKph);
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
      speedKph,
      roadType,
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
      speedKph,
      roadType,
      geometry: reversedGeometry,
      cumulativeLengthsMeters: getCumulativeLengthsMeters(reversedGeometry),
    });
  }

  return edges;
}

export function getRoadEdgeSpeedKph(speedLimit: number | undefined, fallbackSpeedKph: number) {
  return Number.isFinite(speedLimit) && (speedLimit ?? 0) > 0
    ? (speedLimit as number)
    : fallbackSpeedKph;
}

export function calculateDrivingDurationSeconds(lengthMeters: number, speedKph: number) {
  const metersPerSecond = (speedKph * 1_000) / 3_600;
  return lengthMeters / metersPerSecond;
}

export function snapDrivingRouteToGraph(
  graph: RoutingGraph,
  start: RoutePoint,
  end: RoutePoint,
): RouteSnapResult {
  try {
    return snapDrivingRouteToGraphWithMaxDistance(
      graph,
      start,
      end,
      DRIVING_MAX_SNAP_DISTANCE_METERS,
    );
  } catch (error) {
    if (!isDrivingSnapDistanceError(error)) {
      throw error;
    }

    return snapDrivingRouteToGraphWithMaxDistance(
      graph,
      start,
      end,
      DRIVING_FALLBACK_MAX_SNAP_DISTANCE_METERS,
    );
  }
}

export function solveDrivingGraph(
  graph: RoutingGraph,
  startNodeId: RoutingNodeId,
  endNodeId: RoutingNodeId,
  costOptions?: DrivingSolveCostOptions,
): RouteAccumulator | null {
  const normalizedCostOptions = normalizeDrivingSolveCostOptions(costOptions);

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

  const startState: DrivingState = {
    stateKey: getStateKey(startNodeId, null),
    nodeId: startNodeId,
    incomingEdgeId: null,
  };
  const frontier = new MinPriorityQueue<DrivingState>();
  const visited = new Set<string>();
  const durationFromStart = new Map<string, number>([[startState.stateKey, 0]]);
  const cameFrom = new Map<string, CameFrom>();

  frontier.push(startState, 0);

  while (frontier.size > 0) {
    const currentState = frontier.pop();

    if (!currentState || visited.has(currentState.stateKey)) {
      continue;
    }

    if (currentState.nodeId === endNodeId) {
      return reconstructDrivingRoute(cameFrom, currentState.stateKey, normalizedCostOptions);
    }

    visited.add(currentState.stateKey);

    for (const edge of graph.edgesByNode.get(currentState.nodeId) ?? []) {
      const nextStateKey = getStateKey(edge.toNodeId, edge.id);

      if (visited.has(nextStateKey)) {
        continue;
      }

      const incomingEdge = currentState.incomingEdgeId
        ? graph.edgeById.get(currentState.incomingEdgeId) ?? null
        : null;
      const junctionPenaltySeconds = calculateJunctionPenaltySeconds(incomingEdge, edge);
      const nextDuration =
        (durationFromStart.get(currentState.stateKey) ?? Number.POSITIVE_INFINITY) +
        getEffectiveDrivingEdgeDurationSeconds(edge, normalizedCostOptions) +
        junctionPenaltySeconds;
      const knownDuration = durationFromStart.get(nextStateKey) ?? Number.POSITIVE_INFINITY;

      if (nextDuration >= knownDuration) {
        continue;
      }

      durationFromStart.set(nextStateKey, nextDuration);
      cameFrom.set(nextStateKey, {
        previousStateKey: currentState.stateKey,
        edge,
      });
      frontier.push(
        {
          stateKey: nextStateKey,
          nodeId: edge.toNodeId,
          incomingEdgeId: edge.id,
        },
        nextDuration,
      );
    }
  }

  return null;
}

function reconstructDrivingRoute(
  cameFrom: Map<string, CameFrom>,
  endStateKey: string,
  costOptions: NormalizedDrivingSolveCostOptions,
): RouteAccumulator | null {
  const traversedEdges: RoutingEdge[] = [];
  let currentStateKey: string | undefined = endStateKey;

  while (currentStateKey !== undefined) {
    const step = cameFrom.get(currentStateKey);

    if (!step) {
      break;
    }

    traversedEdges.push(step.edge);
    currentStateKey = step.previousStateKey;
  }

  if (traversedEdges.length === 0) {
    return null;
  }

  traversedEdges.reverse();

  return {
    distanceMeters: traversedEdges.reduce((total, edge) => total + edge.lengthMeters, 0),
    durationSeconds: calculateRouteDurationSeconds(traversedEdges, costOptions),
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

function calculateRouteDurationSeconds(
  edges: RoutingEdge[],
  costOptions: NormalizedDrivingSolveCostOptions,
) {
  return edges.reduce((total, edge, index) => {
    const previousEdge = index > 0 ? edges[index - 1] : null;
    return (
      total +
      getEffectiveDrivingEdgeDurationSeconds(edge, costOptions) +
      calculateJunctionPenaltySeconds(previousEdge, edge)
    );
  }, 0);
}

function getEffectiveDrivingEdgeDurationSeconds(
  edge: RoutingEdge,
  costOptions: NormalizedDrivingSolveCostOptions,
) {
  return (
    edge.durationSeconds *
    costOptions.routeLevelTrafficMultiplier *
    costOptions.weatherMultiplier
  );
}

function normalizeDrivingSolveCostOptions(
  costOptions: DrivingSolveCostOptions,
): NormalizedDrivingSolveCostOptions {
  if (typeof costOptions === "number") {
    return {
      departureDate: new Date(0),
      routeLevelTrafficMultiplier: costOptions,
      weatherMultiplier: 1,
    };
  }

  return {
    departureDate: costOptions?.departureDate ?? new Date(0),
    routeLevelTrafficMultiplier: costOptions?.routeLevelTrafficMultiplier ?? 1,
    weatherMultiplier: costOptions?.weatherMultiplier ?? 1,
  };
}

function snapDrivingRouteToGraphWithMaxDistance(
  graph: RoutingGraph,
  start: RoutePoint,
  end: RoutePoint,
  maxSnapDistanceMeters: number,
) {
  return snapRouteEndpointsToGraph({
    graph,
    start,
    end,
    allowedLayers: ["roads"],
    syntheticNodePrefix: "snap:driving",
    maxSnapDistanceMeters,
    nodeReuseDistanceMeters: DRIVING_NODE_REUSE_DISTANCE_METERS,
    tooFarMessage: DRIVING_SNAP_TOO_FAR_MESSAGE,
  });
}

function isDrivingSnapDistanceError(error: unknown): error is RoutingError {
  return (
    error instanceof RoutingError &&
    error.statusCode === 404 &&
    error.message === DRIVING_SNAP_TOO_FAR_MESSAGE
  );
}

function calculateJunctionPenaltySeconds(previousEdge: RoutingEdge | null, nextEdge: RoutingEdge) {
  if (!previousEdge) {
    return 0;
  }

  const turnClassification = classifyTurn(previousEdge, nextEdge);

  if (turnClassification === "straight") {
    return BASE_JUNCTION_DELAY_SECONDS + STRAIGHT_TURN_DELAY_SECONDS;
  }

  if (turnClassification === "right") {
    return BASE_JUNCTION_DELAY_SECONDS + RIGHT_TURN_DELAY_SECONDS;
  }

  if (turnClassification === "uturn") {
    return BASE_JUNCTION_DELAY_SECONDS + UTURN_DELAY_SECONDS;
  }

  return BASE_JUNCTION_DELAY_SECONDS + LEFT_TURN_DELAY_SECONDS;
}

function classifyTurn(previousEdge: RoutingEdge, nextEdge: RoutingEdge) {
  const previousBearing = getEdgeExitBearing(previousEdge);
  const nextBearing = getEdgeEntryBearing(nextEdge);

  if (previousBearing === null || nextBearing === null) {
    return "straight" as const;
  }

  const turnAngleDegrees = getSignedTurnAngleDegrees(previousBearing, nextBearing);
  const absoluteTurnAngleDegrees = Math.abs(turnAngleDegrees);

  if (absoluteTurnAngleDegrees >= 150) {
    return "uturn" as const;
  }

  if (absoluteTurnAngleDegrees <= 30) {
    return "straight" as const;
  }

  if (turnAngleDegrees < 0) {
    return "right" as const;
  }

  return "left" as const;
}

function getEdgeExitBearing(edge: RoutingEdge) {
  if (edge.geometry.length < 2) {
    return null;
  }

  return getBearingDegrees(
    edge.geometry[edge.geometry.length - 2],
    edge.geometry[edge.geometry.length - 1],
  );
}

function getEdgeEntryBearing(edge: RoutingEdge) {
  if (edge.geometry.length < 2) {
    return null;
  }

  return getBearingDegrees(edge.geometry[0], edge.geometry[1]);
}

function getBearingDegrees(start: RoutePathCoordinate, end: RoutePathCoordinate) {
  const averageLatitudeRadians = toRadians((start[1] + end[1]) / 2);
  const deltaX = (end[0] - start[0]) * Math.cos(averageLatitudeRadians);
  const deltaY = end[1] - start[1];

  if (deltaX === 0 && deltaY === 0) {
    return null;
  }

  return (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
}

function getSignedTurnAngleDegrees(previousBearing: number, nextBearing: number) {
  let delta = nextBearing - previousBearing;

  while (delta <= -180) {
    delta += 360;
  }

  while (delta > 180) {
    delta -= 360;
  }

  return delta;
}

function getStateKey(nodeId: RoutingNodeId, incomingEdgeId: string | null) {
  return `${String(nodeId)}::${incomingEdgeId ?? "start"}`;
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
