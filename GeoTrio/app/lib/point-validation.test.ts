import { describe, expect, it } from "vitest";

import type { RoutingGraph } from "@/lib/routing/contracts";
import {
  OUTSIDE_TORONTO_MESSAGE,
  isPointWithinDowntownBoundary,
  validatePointAgainstRoadGraph,
} from "@/lib/point-validation";

const TEST_GRAPH: RoutingGraph = {
  nodes: new Map([
    [1, { id: 1, longitude: -79.4, latitude: 43.65 }],
    [2, { id: 2, longitude: -79.38, latitude: 43.65 }],
    [3, { id: 3, longitude: -79.4, latitude: 43.653 }],
    [4, { id: 4, longitude: -79.38, latitude: 43.653 }],
  ]),
  nodeList: [
    { id: 1, longitude: -79.4, latitude: 43.65 },
    { id: 2, longitude: -79.38, latitude: 43.65 },
    { id: 3, longitude: -79.4, latitude: 43.653 },
    { id: 4, longitude: -79.38, latitude: 43.653 },
  ],
  edgesByNode: new Map(),
  edgeById: new Map([
    [
      "road-1:forward",
      {
        id: "road-1:forward",
        baseEdgeId: "road-1",
        fromNodeId: 1,
        toNodeId: 2,
        layer: "roads",
        direction: "forward",
        lengthMeters: 1_600,
        durationSeconds: 120,
        speedKph: 40,
        geometry: [
          [-79.4, 43.65],
          [-79.38, 43.65],
        ],
        cumulativeLengthsMeters: [0, 1_600],
      },
    ],
  ]),
  edgeIdsByBaseEdgeId: new Map([["road-1", ["road-1:forward"]]]),
};

describe("validatePointAgainstRoadGraph", () => {
  it("recognizes points inside the downtown boundary", () => {
    expect(
      isPointWithinDowntownBoundary({
        longitude: -79.3872,
        latitude: 43.651,
      }),
    ).toBe(true);
  });

  it("rejects points outside the downtown boundary", () => {
    expect(
      isPointWithinDowntownBoundary({
        longitude: -79.45,
        latitude: 43.7,
      }),
    ).toBe(false);
  });

  it("accepts points that are close enough to the road network", () => {
    const result = validatePointAgainstRoadGraph(TEST_GRAPH, {
      longitude: -79.3872,
      latitude: 43.6501,
    });

    expect(result.isValid).toBe(true);

    if (!result.isValid) {
      return;
    }

    expect(result.point.longitude).toBeCloseTo(-79.3872, 4);
    expect(result.point.latitude).toBeCloseTo(43.65, 4);
    expect(result.distanceToRoadMeters).toBeLessThan(20);
  });

  it("snaps points inside the downtown boundary to the nearest road even when they are farther away", () => {
    const result = validatePointAgainstRoadGraph(TEST_GRAPH, {
      longitude: -79.3872,
      latitude: 43.652,
    });

    expect(result.isValid).toBe(true);

    if (!result.isValid) {
      return;
    }

    expect(result.point.longitude).toBeCloseTo(-79.3872, 4);
    expect(result.point.latitude).toBeCloseTo(43.65, 4);
    expect(result.distanceToRoadMeters).toBeGreaterThan(50);
  });

  it("rejects points outside the downtown boundary", () => {
    const result = validatePointAgainstRoadGraph(TEST_GRAPH, {
      longitude: -79.45,
      latitude: 43.7,
    });

    expect(result).toEqual({
      isValid: false,
      reason: "outsideToronto",
      message: OUTSIDE_TORONTO_MESSAGE,
    });
  });
});
