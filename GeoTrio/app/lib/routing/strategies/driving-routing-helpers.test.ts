import { describe, expect, it } from "vitest";

import { RoutingError } from "@/lib/routing/errors";
import { getDrivingCostFactors } from "@/lib/routing/strategies/driving-conditions";
import {
  BASE_JUNCTION_DELAY_SECONDS,
  buildDrivingGraphFromFeatureCollection,
  calculateDrivingDurationSeconds,
  createRoadEdges,
  DRIVING_FALLBACK_MAX_SNAP_DISTANCE_METERS,
  DRIVING_MAX_SNAP_DISTANCE_METERS,
  DRIVING_NODE_REUSE_DISTANCE_METERS,
  LEFT_TURN_DELAY_SECONDS,
  RIGHT_TURN_DELAY_SECONDS,
  snapDrivingRouteToGraph,
  solveDrivingGraph,
  STRAIGHT_TURN_DELAY_SECONDS,
  UTURN_DELAY_SECONDS,
} from "@/lib/routing/strategies/driving-routing-helpers";
import { findNearestEdgeSnapCandidate } from "@/lib/routing/snapping";

describe("driving routing helpers", () => {
  it("creates directed edges from road traffic flow rules", () => {
    const bothEdges = createRoadEdges(
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.71],
          ],
        },
        properties: {
          OBJECTID: 1,
          FROM_JUNCTION_ID: 100,
          TO_JUNCTION_ID: 200,
          LENGTH: 100,
          SPEED_LIMIT: 50,
          DIRECTION_OF_TRAFFIC_FLOW: "Both",
        },
      },
      40,
    );
    const forwardOnlyEdges = createRoadEdges(
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.38, 43.72],
          ],
        },
        properties: {
          OBJECTID: 2,
          FROM_JUNCTION_ID: 200,
          TO_JUNCTION_ID: 300,
          LENGTH: 100,
          SPEED_LIMIT: 50,
          DIRECTION_OF_TRAFFIC_FLOW: "Positive",
        },
      },
      40,
    );
    const reverseOnlyEdges = createRoadEdges(
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.38, 43.72],
            [-79.37, 43.73],
          ],
        },
        properties: {
          OBJECTID: 3,
          FROM_JUNCTION_ID: 300,
          TO_JUNCTION_ID: 400,
          LENGTH: 100,
          SPEED_LIMIT: 50,
          DIRECTION_OF_TRAFFIC_FLOW: "Negative",
        },
      },
      40,
    );

    expect(bothEdges).toHaveLength(2);
    expect(forwardOnlyEdges).toHaveLength(1);
    expect(forwardOnlyEdges[0]).toMatchObject({
      fromNodeId: 200,
      toNodeId: 300,
      direction: "forward",
    });
    expect(reverseOnlyEdges).toHaveLength(1);
    expect(reverseOnlyEdges[0]).toMatchObject({
      fromNodeId: 400,
      toNodeId: 300,
      direction: "reverse",
    });
  });

  it("falls back to the profile speed when a road segment has no valid speed limit", () => {
    const [edge] = createRoadEdges(
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.71],
          ],
        },
        properties: {
          OBJECTID: 4,
          FROM_JUNCTION_ID: 100,
          TO_JUNCTION_ID: 200,
          LENGTH: 100,
          SPEED_LIMIT: 0,
          DIRECTION_OF_TRAFFIC_FLOW: "Both",
        },
      },
      40,
    );

    expect(edge.speedKph).toBe(40);
  });

  it("ignores unnamed non-municipal connector features", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 5,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
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
              OBJECTID: 6,
              FROM_JUNCTION_ID: 2,
              TO_JUNCTION_ID: 3,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
              FULL_STREET_NAME: null,
              FULL_STREET_NAME_1: null,
              ORIGINAL_STREET_NAME: null,
              STANDARD_MUNICIPALITY: null,
            },
          },
        ],
      },
      40,
    );

    expect(graph.nodes.has(1)).toBe(true);
    expect(graph.nodes.has(2)).toBe(true);
    expect(graph.nodes.has(3)).toBe(false);
    expect(solveDrivingGraph(graph, 1, 2)).not.toBeNull();
    expect(solveDrivingGraph(graph, 1, 3)).toBeNull();
  });

  it("calculates base duration from length and speed before traffic calibration", () => {
    expect(BASE_JUNCTION_DELAY_SECONDS).toBe(12);
    expect(LEFT_TURN_DELAY_SECONDS).toBe(18);
    expect(RIGHT_TURN_DELAY_SECONDS).toBe(4);
    expect(STRAIGHT_TURN_DELAY_SECONDS).toBe(8);
    expect(UTURN_DELAY_SECONDS).toBe(18);
    expect(DRIVING_MAX_SNAP_DISTANCE_METERS).toBe(50);
    expect(DRIVING_NODE_REUSE_DISTANCE_METERS).toBe(2);
    expect(calculateDrivingDurationSeconds(1_000, 50)).toBeCloseTo(72, 5);
  });

  it("snaps to the middle of the nearest edge segment, not just the nearest endpoint", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
                [-79.38, 43.7],
              ],
            },
            properties: {
              OBJECTID: 10,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 200,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const candidate = findNearestEdgeSnapCandidate(graph, {
      longitude: -79.385,
      latitude: 43.7003,
    }, ["roads"]);

    expect(candidate).not.toBeNull();
    expect(candidate?.snappedPoint.longitude).toBeCloseTo(-79.385, 5);
    expect(candidate?.snappedPoint.latitude).toBeCloseTo(43.7, 5);
    expect(candidate?.segmentIndex).toBe(1);
  });

  it("picks the closest segment in a multi-segment polyline", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
                [-79.39, 43.71],
              ],
            },
            properties: {
              OBJECTID: 11,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 200,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const candidate = findNearestEdgeSnapCandidate(graph, {
      longitude: -79.3897,
      latitude: 43.706,
    }, ["roads"]);

    expect(candidate).not.toBeNull();
    expect(candidate?.segmentIndex).toBe(1);
    expect(candidate?.snappedPoint.longitude).toBeCloseTo(-79.39, 5);
  });

  it("reuses an existing node when the click is within the node tolerance", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      { longitude: -79.399999, latitude: 43.700001 },
      { longitude: -79.39, latitude: 43.7 },
    );

    expect(snappedRoute.start.reusedExistingNode).toBe(true);
    expect(snappedRoute.start.nodeId).toBe(1);
  });

  it("rejects clicks that are too far from the road network", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 13,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    expect(() =>
      snapDrivingRouteToGraph(
        graph,
        { longitude: -79.4, latitude: 43.705 },
        { longitude: -79.39, latitude: 43.7 },
      ),
    ).toThrowError(RoutingError);
  });

  it("splits a bidirectional edge into child edges in both directions", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 14,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      { longitude: -79.395, latitude: 43.7 },
      { longitude: -79.39, latitude: 43.7 },
    );

    expect(snappedRoute.graph.edgeIdsByBaseEdgeId.size).toBe(2);
    expect(snappedRoute.graph.edgeById.size).toBe(4);
  });

  it("retries snapping with a doubled radius when the first driving snap misses", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 140,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      { longitude: -79.395, latitude: 43.7007 },
      { longitude: -79.39, latitude: 43.7 },
    );

    expect(snappedRoute.start.candidate.distanceToClickMeters).toBeGreaterThan(
      DRIVING_MAX_SNAP_DISTANCE_METERS,
    );
    expect(snappedRoute.start.candidate.distanceToClickMeters).toBeLessThanOrEqual(
      DRIVING_FALLBACK_MAX_SNAP_DISTANCE_METERS,
    );
    expect(snappedRoute.start.point.latitude).toBeCloseTo(43.7, 6);
  });

  it("preserves one-way direction when splitting an edge", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 15,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Positive",
            },
          },
        ],
      },
      40,
    );

    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      { longitude: -79.395, latitude: 43.7 },
      { longitude: -79.39, latitude: 43.7 },
    );

    expect(snappedRoute.graph.edgeById.size).toBe(2);
    expect([...snappedRoute.graph.edgeById.values()].every((edge) => edge.direction === "forward")).toBe(
      true,
    );
  });

  it("returns the direct sub-edge route when both points are on the same legal edge", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 16,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      { longitude: -79.398, latitude: 43.7 },
      { longitude: -79.392, latitude: 43.7 },
    );
    const route = solveDrivingGraph(
      snappedRoute.graph,
      snappedRoute.start.nodeId,
      snappedRoute.end.nodeId,
    );

    expect(route).not.toBeNull();
    expect(route?.distanceMeters).toBeCloseTo(60, 3);
    expect(route?.path[0]).toEqual([-79.398, 43.7]);
    expect(route?.path[route.path.length - 1][0]).toBeCloseTo(-79.392, 6);
    expect(route?.path[route.path.length - 1][1]).toBeCloseTo(43.7, 6);
  });

  it("prefers the faster road path even when it is longer after snapping", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 17,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 2,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.4, 43.71],
              ],
            },
            properties: {
              OBJECTID: 18,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 3,
              LENGTH: 60,
              SPEED_LIMIT: 60,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.71],
                [-79.39, 43.7],
              ],
            },
            properties: {
              OBJECTID: 19,
              FROM_JUNCTION_ID: 3,
              TO_JUNCTION_ID: 2,
              LENGTH: 60,
              SPEED_LIMIT: 60,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      { longitude: -79.399, latitude: 43.7 },
      { longitude: -79.391, latitude: 43.7 },
    );
    const route = solveDrivingGraph(
      snappedRoute.graph,
      snappedRoute.start.nodeId,
      snappedRoute.end.nodeId,
    );

    expect(route).not.toBeNull();
    expect(route?.distanceMeters).toBeGreaterThan(100);
    expect(route?.durationSeconds).toBeLessThan(100);
    expect(route?.path[0]).toEqual([-79.399, 43.7]);
    expect(route?.path[route.path.length - 1][0]).toBeCloseTo(-79.391, 6);
    expect(route?.path[route.path.length - 1][1]).toBeCloseTo(43.7, 6);
    expect(route?.path.some(([longitude, latitude]) => longitude === -79.4 && latitude === 43.71)).toBe(
      true,
    );
  });

  it("adds a larger penalty for a left turn than a right turn", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 20,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.39, 43.7],
                [-79.39, 43.71],
              ],
            },
            properties: {
              OBJECTID: 21,
              FROM_JUNCTION_ID: 2,
              TO_JUNCTION_ID: 3,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.39, 43.7],
                [-79.39, 43.69],
              ],
            },
            properties: {
              OBJECTID: 22,
              FROM_JUNCTION_ID: 2,
              TO_JUNCTION_ID: 4,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const leftTurnRoute = solveDrivingGraph(graph, 1, 3);
    const rightTurnRoute = solveDrivingGraph(graph, 1, 4);

    expect(leftTurnRoute).not.toBeNull();
    expect(rightTurnRoute).not.toBeNull();
    expect(leftTurnRoute!.durationSeconds).toBeGreaterThan(rightTurnRoute!.durationSeconds);
  });

  it("applies the supplied time-of-day multiplier at solve time", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 23,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const neutralRoute = solveDrivingGraph(graph, 1, 2, 1);
    const peakRoute = solveDrivingGraph(graph, 1, 2, 1.96);

    expect(neutralRoute).not.toBeNull();
    expect(peakRoute).not.toBeNull();
    expect(neutralRoute!.durationSeconds).toBeCloseTo(7.2, 5);
    expect(peakRoute!.durationSeconds).toBeCloseTo(7.2 * 1.96, 5);
  });

  it("reuses the same cached-style graph with different per-request time multipliers", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
      {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.4, 43.7],
                [-79.39, 43.7],
                [-79.38, 43.7],
              ],
            },
            properties: {
              OBJECTID: 24,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 200,
              SPEED_LIMIT: 50,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const offPeakRoute = solveDrivingGraph(graph, 1, 2, 1);
    const rushHourRoute = solveDrivingGraph(graph, 1, 2, 2.25);

    expect(offPeakRoute).not.toBeNull();
    expect(rushHourRoute).not.toBeNull();
    expect(rushHourRoute!.durationSeconds).toBeGreaterThan(offPeakRoute!.durationSeconds);
  });

  it("stacks speed-based traffic and weather multipliers for driving solves", () => {
    const graph = buildDrivingGraphFromFeatureCollection(
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
              OBJECTID: 25,
              FROM_JUNCTION_ID: 1,
              TO_JUNCTION_ID: 2,
              LENGTH: 100,
              SPEED_LIMIT: 40,
              DIRECTION_OF_TRAFFIC_FLOW: "Both",
            },
          },
        ],
      },
      40,
    );

    const morningRainFactors = getDrivingCostFactors("2026-03-30T12:44:00Z", {
      time: "2026-03-30T08:44",
      temperatureC: 7,
      apparentTemperatureC: 5,
      precipitationMm: 3,
      windSpeedKmh: 18,
      weatherCode: 63,
      isDay: true,
    });
    const calibratedRoute = solveDrivingGraph(graph, 1, 2, morningRainFactors);

    expect(calibratedRoute).not.toBeNull();
    expect(calibratedRoute!.durationSeconds).toBeCloseTo(21.17, 2);
  });
});
