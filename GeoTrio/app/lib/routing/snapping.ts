import { RoutingError } from "@/lib/routing/errors";
import type {
  RouteSnapResult,
  RoutingEdge,
  RoutingGraph,
  RoutingLayerKey,
  RoutingNode,
  RoutingNodeId,
  SnapCandidate,
  SnappedRoutePoint,
} from "@/lib/routing/contracts";
import type { RoutePathCoordinate, RoutePoint } from "@/lib/route-types";

export const DEFAULT_MAX_SNAP_DISTANCE_METERS = 50;
export const DEFAULT_NODE_REUSE_DISTANCE_METERS = 2;

type SnapPointToGraphOptions = {
  graph: RoutingGraph;
  point: RoutePoint;
  allowedLayers: RoutingLayerKey[];
  syntheticNodeId: RoutingNodeId;
  maxSnapDistanceMeters?: number;
  nodeReuseDistanceMeters?: number;
  tooFarMessage?: string;
};

type SnapRouteEndpointsOptions = {
  graph: RoutingGraph;
  start: RoutePoint;
  end: RoutePoint;
  allowedLayers: RoutingLayerKey[];
  syntheticNodePrefix?: string;
  maxSnapDistanceMeters?: number;
  nodeReuseDistanceMeters?: number;
  tooFarMessage?: string;
};

export function snapRouteEndpointsToGraph({
  graph,
  start,
  end,
  allowedLayers,
  syntheticNodePrefix = "snap",
  maxSnapDistanceMeters = DEFAULT_MAX_SNAP_DISTANCE_METERS,
  nodeReuseDistanceMeters = DEFAULT_NODE_REUSE_DISTANCE_METERS,
  tooFarMessage,
}: SnapRouteEndpointsOptions): RouteSnapResult {
  const augmentedGraph = cloneRoutingGraph(graph);
  const snappedStart = snapPointToGraph({
    graph: augmentedGraph,
    point: start,
    allowedLayers,
    syntheticNodeId: `${syntheticNodePrefix}:start`,
    maxSnapDistanceMeters,
    nodeReuseDistanceMeters,
    tooFarMessage,
  });
  const snappedEnd = snapPointToGraph({
    graph: snappedStart.graph,
    point: end,
    allowedLayers,
    syntheticNodeId: `${syntheticNodePrefix}:end`,
    maxSnapDistanceMeters,
    nodeReuseDistanceMeters,
    tooFarMessage,
  });

  return {
    graph: snappedEnd.graph,
    start: toRouteSnapPoint(snappedStart),
    end: toRouteSnapPoint(snappedEnd),
  };
}

export function findNearestEdgeSnapCandidate(
  graph: RoutingGraph,
  point: RoutePoint,
  allowedLayers: RoutingLayerKey[],
): SnapCandidate | null {
  const allowedLayerSet = new Set(allowedLayers);
  let bestCandidate: SnapCandidate | null = null;

  for (const edge of graph.edgeById.values()) {
    if (!allowedLayerSet.has(edge.layer)) {
      continue;
    }

    const candidate = projectPointOntoEdge(edge, point);

    if (!candidate) {
      continue;
    }

    if (
      !bestCandidate ||
      candidate.distanceToClickMeters < bestCandidate.distanceToClickMeters
    ) {
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

export function projectPointOntoEdge(
  edge: RoutingEdge,
  point: RoutePoint,
): SnapCandidate | null {
  if (edge.geometry.length < 2) {
    return null;
  }

  let bestCandidate: SnapCandidate | null = null;

  for (let segmentIndex = 0; segmentIndex < edge.geometry.length - 1; segmentIndex += 1) {
    const start = edge.geometry[segmentIndex];
    const end = edge.geometry[segmentIndex + 1];
    const projection = projectPointOntoSegment(point, start, end);
    const segmentLength =
      edge.cumulativeLengthsMeters[segmentIndex + 1] - edge.cumulativeLengthsMeters[segmentIndex];
    const geometryDistanceAlongMeters =
      edge.cumulativeLengthsMeters[segmentIndex] + segmentLength * projection.t;
    const geometryLengthMeters =
      edge.cumulativeLengthsMeters[edge.cumulativeLengthsMeters.length - 1] || edge.lengthMeters;
    const distanceAlongEdgeMeters =
      geometryLengthMeters > 0
        ? (edge.lengthMeters * geometryDistanceAlongMeters) / geometryLengthMeters
        : 0;
    const candidate: SnapCandidate = {
      edgeId: edge.id,
      snappedPoint: projection.snappedPoint,
      distanceToClickMeters: projection.distanceToClickMeters,
      segmentIndex,
      distanceAlongEdgeMeters,
      distanceRemainingMeters: edge.lengthMeters - distanceAlongEdgeMeters,
    };

    if (
      !bestCandidate ||
      candidate.distanceToClickMeters < bestCandidate.distanceToClickMeters
    ) {
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

export function cloneRoutingGraph(graph: RoutingGraph): RoutingGraph {
  return {
    nodes: new Map(graph.nodes),
    nodeList: [...graph.nodeList],
    edgesByNode: new Map(
      [...graph.edgesByNode.entries()].map(([nodeId, edges]) => [nodeId, [...edges]]),
    ),
    edgeById: new Map(graph.edgeById),
    edgeIdsByBaseEdgeId: new Map(
      [...graph.edgeIdsByBaseEdgeId.entries()].map(([baseEdgeId, edgeIds]) => [
        baseEdgeId,
        [...edgeIds],
      ]),
    ),
  };
}

function snapPointToGraph({
  graph,
  point,
  allowedLayers,
  syntheticNodeId,
  maxSnapDistanceMeters = DEFAULT_MAX_SNAP_DISTANCE_METERS,
  nodeReuseDistanceMeters = DEFAULT_NODE_REUSE_DISTANCE_METERS,
  tooFarMessage = "No drivable road is close enough to that point.",
}: SnapPointToGraphOptions) {
  const candidate = findNearestEdgeSnapCandidate(graph, point, allowedLayers);

  if (!candidate || candidate.distanceToClickMeters > maxSnapDistanceMeters) {
    throw new RoutingError(tooFarMessage, 404);
  }

  const snappedEdge = graph.edgeById.get(candidate.edgeId);

  if (!snappedEdge) {
    throw new RoutingError("The routing graph is missing the snapped edge.", 500);
  }

  const reusableNode = findReusableNode(graph, snappedEdge, candidate, nodeReuseDistanceMeters);

  if (reusableNode) {
    return {
      graph,
      nodeId: reusableNode.id,
      point: {
        longitude: reusableNode.longitude,
        latitude: reusableNode.latitude,
      },
      reusedExistingNode: true,
      candidate: {
        ...candidate,
        snappedPoint: {
          longitude: reusableNode.longitude,
          latitude: reusableNode.latitude,
        },
      },
    };
  }

  splitGraphEdgesAtCandidate(graph, candidate, syntheticNodeId);

  return {
    graph,
    nodeId: syntheticNodeId,
    point: candidate.snappedPoint,
    reusedExistingNode: false,
    candidate,
  };
}

function splitGraphEdgesAtCandidate(
  graph: RoutingGraph,
  candidate: SnapCandidate,
  syntheticNodeId: RoutingNodeId,
) {
  const referenceEdge = graph.edgeById.get(candidate.edgeId);

  if (!referenceEdge) {
    throw new RoutingError("The routing graph is missing the snapped edge.", 500);
  }

  const groupedEdgeIds = graph.edgeIdsByBaseEdgeId.get(referenceEdge.baseEdgeId) ?? [referenceEdge.id];
  const syntheticCoordinate: RoutePathCoordinate = [
    candidate.snappedPoint.longitude,
    candidate.snappedPoint.latitude,
  ];

  upsertNode(graph, {
    id: syntheticNodeId,
    longitude: syntheticCoordinate[0],
    latitude: syntheticCoordinate[1],
  });

  const beforeBaseEdgeId = `${referenceEdge.baseEdgeId}::${String(syntheticNodeId)}:before`;
  const afterBaseEdgeId = `${referenceEdge.baseEdgeId}::${String(syntheticNodeId)}:after`;

  for (const edgeId of groupedEdgeIds) {
    const edge = graph.edgeById.get(edgeId);

    if (!edge) {
      continue;
    }

    const edgeCandidate = projectPointOntoEdge(edge, candidate.snappedPoint);

    if (!edgeCandidate) {
      continue;
    }

    removeEdge(graph, edge);

    const orientationMatchesReference = edge.fromNodeId === referenceEdge.fromNodeId;
    const childBaseEdgeIds = orientationMatchesReference
      ? {
          first: beforeBaseEdgeId,
          second: afterBaseEdgeId,
        }
      : {
          first: afterBaseEdgeId,
          second: beforeBaseEdgeId,
        };

    for (const splitEdge of createSplitEdges(edge, edgeCandidate, syntheticNodeId, childBaseEdgeIds)) {
      addEdge(graph, splitEdge);
    }
  }
}

function createSplitEdges(
  edge: RoutingEdge,
  candidate: SnapCandidate,
  syntheticNodeId: RoutingNodeId,
  childBaseEdgeIds: { first: string; second: string },
) {
  const snappedCoordinate: RoutePathCoordinate = [
    candidate.snappedPoint.longitude,
    candidate.snappedPoint.latitude,
  ];
  const [firstGeometry, secondGeometry] = splitEdgeGeometry(edge.geometry, candidate, snappedCoordinate);
  const firstLengthMeters = candidate.distanceAlongEdgeMeters;
  const secondLengthMeters = candidate.distanceRemainingMeters;
  const splitEdges: RoutingEdge[] = [];

  if (firstGeometry.length >= 2 && firstLengthMeters > 0) {
    splitEdges.push({
      ...edge,
      id: `${edge.id}::${String(syntheticNodeId)}:first`,
      baseEdgeId: childBaseEdgeIds.first,
      fromNodeId: edge.fromNodeId,
      toNodeId: syntheticNodeId,
      lengthMeters: firstLengthMeters,
      durationSeconds: getSplitDurationSeconds(edge, firstLengthMeters),
      geometry: firstGeometry,
      cumulativeLengthsMeters: getCumulativeLengthsMeters(firstGeometry),
    });
  }

  if (secondGeometry.length >= 2 && secondLengthMeters > 0) {
    splitEdges.push({
      ...edge,
      id: `${edge.id}::${String(syntheticNodeId)}:second`,
      baseEdgeId: childBaseEdgeIds.second,
      fromNodeId: syntheticNodeId,
      toNodeId: edge.toNodeId,
      lengthMeters: secondLengthMeters,
      durationSeconds: getSplitDurationSeconds(edge, secondLengthMeters),
      geometry: secondGeometry,
      cumulativeLengthsMeters: getCumulativeLengthsMeters(secondGeometry),
    });
  }

  return splitEdges;
}

function splitEdgeGeometry(
  geometry: RoutePathCoordinate[],
  candidate: SnapCandidate,
  snappedCoordinate: RoutePathCoordinate,
) {
  const firstGeometry = geometry.slice(0, candidate.segmentIndex + 1);
  const secondGeometry = geometry.slice(candidate.segmentIndex + 1);

  if (!coordinatesEqual(firstGeometry[firstGeometry.length - 1], snappedCoordinate)) {
    firstGeometry.push(snappedCoordinate);
  }

  if (secondGeometry.length === 0 || !coordinatesEqual(secondGeometry[0], snappedCoordinate)) {
    secondGeometry.unshift(snappedCoordinate);
  }

  return [firstGeometry, secondGeometry] as const;
}

function findReusableNode(
  graph: RoutingGraph,
  edge: RoutingEdge,
  candidate: SnapCandidate,
  nodeReuseDistanceMeters: number,
) {
  const fromNode = graph.nodes.get(edge.fromNodeId);
  const toNode = graph.nodes.get(edge.toNodeId);
  const snappedCoordinate: RoutePathCoordinate = [
    candidate.snappedPoint.longitude,
    candidate.snappedPoint.latitude,
  ];

  if (
    fromNode &&
    getDistanceMeters(snappedCoordinate, [fromNode.longitude, fromNode.latitude]) <=
      nodeReuseDistanceMeters
  ) {
    return fromNode;
  }

  if (
    toNode &&
    getDistanceMeters(snappedCoordinate, [toNode.longitude, toNode.latitude]) <=
      nodeReuseDistanceMeters
  ) {
    return toNode;
  }

  return null;
}

function toRouteSnapPoint(snapResult: {
  point: RoutePoint;
  nodeId: RoutingNodeId;
  reusedExistingNode: boolean;
  candidate: SnapCandidate;
}): SnappedRoutePoint {
  return {
    point: snapResult.point,
    nodeId: snapResult.nodeId,
    reusedExistingNode: snapResult.reusedExistingNode,
    candidate: snapResult.candidate,
  };
}

function upsertNode(graph: RoutingGraph, node: RoutingNode) {
  if (graph.nodes.has(node.id)) {
    return;
  }

  graph.nodes.set(node.id, node);
  graph.nodeList.push(node);
}

function addEdge(graph: RoutingGraph, edge: RoutingEdge) {
  graph.edgeById.set(edge.id, edge);

  const nodeEdges = graph.edgesByNode.get(edge.fromNodeId) ?? [];
  nodeEdges.push(edge);
  graph.edgesByNode.set(edge.fromNodeId, nodeEdges);

  const siblingEdgeIds = graph.edgeIdsByBaseEdgeId.get(edge.baseEdgeId) ?? [];
  siblingEdgeIds.push(edge.id);
  graph.edgeIdsByBaseEdgeId.set(edge.baseEdgeId, siblingEdgeIds);
}

function removeEdge(graph: RoutingGraph, edge: RoutingEdge) {
  graph.edgeById.delete(edge.id);

  const nodeEdges = graph.edgesByNode.get(edge.fromNodeId);

  if (nodeEdges) {
    graph.edgesByNode.set(
      edge.fromNodeId,
      nodeEdges.filter((candidate) => candidate.id !== edge.id),
    );
  }

  const siblingEdgeIds = graph.edgeIdsByBaseEdgeId.get(edge.baseEdgeId);

  if (!siblingEdgeIds) {
    return;
  }

  const nextSiblingEdgeIds = siblingEdgeIds.filter((candidate) => candidate !== edge.id);

  if (nextSiblingEdgeIds.length === 0) {
    graph.edgeIdsByBaseEdgeId.delete(edge.baseEdgeId);
    return;
  }

  graph.edgeIdsByBaseEdgeId.set(edge.baseEdgeId, nextSiblingEdgeIds);
}

function getSplitDurationSeconds(edge: RoutingEdge, splitLengthMeters: number) {
  if (edge.lengthMeters <= 0) {
    return 0;
  }

  return (edge.durationSeconds * splitLengthMeters) / edge.lengthMeters;
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

function projectPointOntoSegment(
  point: RoutePoint,
  start: RoutePathCoordinate,
  end: RoutePathCoordinate,
) {
  const referenceLatitudeRadians = toRadians((point.latitude + start[1] + end[1]) / 3);
  const startVector = toProjectedMeters(start, referenceLatitudeRadians);
  const endVector = toProjectedMeters(end, referenceLatitudeRadians);
  const pointVector = toProjectedMeters([point.longitude, point.latitude], referenceLatitudeRadians);
  const segmentVector = {
    x: endVector.x - startVector.x,
    y: endVector.y - startVector.y,
  };
  const segmentLengthSquared = segmentVector.x ** 2 + segmentVector.y ** 2;
  const unclampedT =
    segmentLengthSquared === 0
      ? 0
      : ((pointVector.x - startVector.x) * segmentVector.x +
          (pointVector.y - startVector.y) * segmentVector.y) /
        segmentLengthSquared;
  const t = Math.min(1, Math.max(0, unclampedT));
  const snappedPoint: RoutePoint = {
    longitude: start[0] + (end[0] - start[0]) * t,
    latitude: start[1] + (end[1] - start[1]) * t,
  };

  return {
    snappedPoint,
    distanceToClickMeters: getDistanceMeters(
      [point.longitude, point.latitude],
      [snappedPoint.longitude, snappedPoint.latitude],
    ),
    t,
  };
}

function toProjectedMeters(
  [longitude, latitude]: RoutePathCoordinate,
  referenceLatitudeRadians: number,
) {
  const earthRadiusMeters = 6_371_000;

  return {
    x: toRadians(longitude) * earthRadiusMeters * Math.cos(referenceLatitudeRadians),
    y: toRadians(latitude) * earthRadiusMeters,
  };
}

function coordinatesEqual(
  firstCoordinate: RoutePathCoordinate | undefined,
  [secondLongitude, secondLatitude]: RoutePathCoordinate,
) {
  if (!firstCoordinate) {
    return false;
  }

  const [firstLongitude, firstLatitude] = firstCoordinate;

  if (firstLongitude === undefined || firstLatitude === undefined) {
    return false;
  }

  return (
    Math.abs(firstLongitude - secondLongitude) < 1e-9 &&
    Math.abs(firstLatitude - secondLatitude) < 1e-9
  );
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
