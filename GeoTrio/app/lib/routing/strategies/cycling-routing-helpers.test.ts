import { describe, expect, it } from "vitest";

import { RoutingError } from "@/lib/routing/errors";
import type { RoutingEdge, RoutingGraph } from "@/lib/routing/contracts";
import {
  buildCyclingGraphFromFeatureCollection,
  calculateCyclingDurationSeconds,
  createCyclingRoadEdges,
  CYCLING_MAX_SNAP_DISTANCE_METERS,
  CYCLING_NODE_REUSE_DISTANCE_METERS,
  snapCyclingRouteToGraph,
  solveCyclingGraph,
} from "@/lib/routing/strategies/cycling-routing-helpers";

describe("cycling routing helpers", () => {
  it("uses the cycling profile speed instead of road speed limits", () => {
    const [edge] = createCyclingRoadEdges(
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.7],
          ],
        },
        properties: {
          OBJECTID: 1,
          FROM_JUNCTION_ID: 100,
          TO_JUNCTION_ID: 200,
          LENGTH: 180,
          SPEED_LIMIT: 50,
          DIRECTION_OF_TRAFFIC_FLOW: "Both",
        },
      } as Parameters<typeof createCyclingRoadEdges>[0],
      18,
    );

    expect(CYCLING_MAX_SNAP_DISTANCE_METERS).toBe(50);
    expect(CYCLING_NODE_REUSE_DISTANCE_METERS).toBe(2);
    expect(edge.speedKph).toBe(18);
    expect(edge.durationSeconds).toBeCloseTo(36, 5);
    expect(calculateCyclingDurationSeconds(1_000, 18)).toBeCloseTo(200, 5);
  });

  it("snaps only to road edges even when a closer bike-lane edge exists", () => {
    const graph = createGraphWithNearbyCyclingEdgeOnly();

    expect(() =>
      snapCyclingRouteToGraph(
        graph,
        { longitude: -79.395, latitude: 43.7 },
        { longitude: -79.389, latitude: 43.71 },
      ),
    ).toThrowError(new RoutingError("No bikeable road is close enough to that point.", 404));
  });

  it("respects one-way road direction when solving the graph", () => {
    const graph = buildCyclingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
              ],
            },
            properties: {
              OBJECTID: 2,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              DIRECTION_OF_TRAFFIC_FLOW: "Positive",
            },
          },
        ],
      },
      18,
    );

    const forwardRoute = solveCyclingGraph(graph, 1, 2);
    const reverseRoute = solveCyclingGraph(graph, 2, 1);

    expect(forwardRoute).not.toBeNull();
    expect(forwardRoute?.distanceMeters).toBeCloseTo(100, 5);
    expect(reverseRoute).toBeNull();
  });

  it("returns no route when one-way directionality blocks the snapped traversal", () => {
    const graph = buildCyclingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
              ],
            },
            properties: {
              OBJECTID: 3,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              DIRECTION_OF_TRAFFIC_FLOW: "Positive",
            },
          },
        ],
      },
      18,
    );

    const snappedRoute = snapCyclingRouteToGraph(
      graph,
      { longitude: -79.392, latitude: 43.7 },
      { longitude: -79.398, latitude: 43.7 },
    );
    const route = solveCyclingGraph(
      snappedRoute.graph,
      snappedRoute.start.nodeId,
      snappedRoute.end.nodeId,
    );

    expect(route).toBeNull();
  });

  it("ignores unnamed non-municipal connector features", () => {
    const graph = buildCyclingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
              ],
            },
            properties: {
              OBJECTID: 10,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
              FULL_STREET_NAME: "Harbour Street",
              STANDARD_MUNICIPALITY: "City of Toronto",
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.39, 43.7],
                [-79.38, 43.7],
              ],
            },
            properties: {
              OBJECTID: 11,
              FROM_JUNCTION_ID: 2,
              TO_JUNCTION_ID: 3,
              LENGTH: 100,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
              FULL_STREET_NAME: null,
              FULL_STREET_NAME_1: null,
              ORIGINAL_STREET_NAME: null,
              STANDARD_MUNICIPALITY: null,
            },
          },
        ],
      },
      18,
    );

    expect(graph.nodes.has(1)).toBe(true);
    expect(graph.nodes.has(2)).toBe(true);
    expect(graph.nodes.has(3)).toBe(false);
    expect(solveCyclingGraph(graph, 1, 2)).not.toBeNull();
    expect(solveCyclingGraph(graph, 1, 3)).toBeNull();
  });

  it("supports applying a per-request cycling time multiplier after solve", () => {
    const graph = buildCyclingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
              ],
            },
            properties: {
              OBJECTID: 12,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      18,
    );

    const route = solveCyclingGraph(graph, 1, 2);

    expect(route).not.toBeNull();
    expect(route!.durationSeconds).toBeCloseTo(20, 5);
    expect(route!.durationSeconds * 1.065).toBeCloseTo(21.3, 5);
  });
});

function createGraphWithNearbyCyclingEdgeOnly(): RoutingGraph {
  const roadEdge: RoutingEdge = {
    id: "road:forward",
    baseEdgeId: "road",
    fromNodeId: 1,
    toNodeId: 2,
    layer: "roads",
    direction: "forward",
    lengthMeters: 100,
    durationSeconds: 20,
    speedKph: 18,
    geometry: [
      [-79.39, 43.71],
      [-79.388, 43.71],
    ],
    cumulativeLengthsMeters: [0, 100],
  };
  const cyclingEdge: RoutingEdge = {
    id: "cycling:forward",
    baseEdgeId: "cycling",
    fromNodeId: 3,
    toNodeId: 4,
    layer: "cycling",
    direction: "forward",
    lengthMeters: 100,
    durationSeconds: 20,
    speedKph: 20,
    geometry: [
      [-79.396, 43.7],
      [-79.394, 43.7],
    ],
    cumulativeLengthsMeters: [0, 100],
  };

  return {
    nodes: new Map([
      [1, { id: 1, longitude: -79.39, latitude: 43.71 }],
      [2, { id: 2, longitude: -79.388, latitude: 43.71 }],
      [3, { id: 3, longitude: -79.396, latitude: 43.7 }],
      [4, { id: 4, longitude: -79.394, latitude: 43.7 }],
    ]),
    nodeList: [
      { id: 1, longitude: -79.39, latitude: 43.71 },
      { id: 2, longitude: -79.388, latitude: 43.71 },
      { id: 3, longitude: -79.396, latitude: 43.7 },
      { id: 4, longitude: -79.394, latitude: 43.7 },
    ],
    edgesByNode: new Map([
      [1, [roadEdge]],
      [2, []],
      [3, [cyclingEdge]],
      [4, []],
    ]),
    edgeById: new Map([
      [roadEdge.id, roadEdge],
      [cyclingEdge.id, cyclingEdge],
    ]),
    edgeIdsByBaseEdgeId: new Map([
      [roadEdge.baseEdgeId, [roadEdge.id]],
      [cyclingEdge.baseEdgeId, [cyclingEdge.id]],
    ]),
  };
}
