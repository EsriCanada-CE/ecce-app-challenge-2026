import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getWalkingGraph,
  snapWalkingRouteToGraph,
  solveWalkingGraph,
} = vi.hoisted(() => ({
  getWalkingGraph: vi.fn(),
  snapWalkingRouteToGraph: vi.fn(),
  solveWalkingGraph: vi.fn(),
}));

vi.mock("@/lib/routing/strategies/walking-routing-helpers", () => ({
  getWalkingGraph,
  snapWalkingRouteToGraph,
  solveWalkingGraph,
}));

import { WalkingRoutingStrategy } from "@/lib/routing/strategies/walking-routing-strategy";

describe("walking routing strategy", () => {
  beforeEach(() => {
    getWalkingGraph.mockReset();
    snapWalkingRouteToGraph.mockReset();
    solveWalkingGraph.mockReset();
  });

  it("includes connector legs from the selected points to the snapped sidewalk route", async () => {
    const strategy = new WalkingRoutingStrategy();
    const graph = { id: "graph" };

    getWalkingGraph.mockResolvedValue(graph);
    snapWalkingRouteToGraph.mockReturnValue({
      graph,
      start: {
        nodeId: "start-node",
        point: { longitude: -79.4, latitude: 43.7 },
        reusedExistingNode: false,
        candidate: {
          edgeId: "start-edge",
          snappedPoint: { longitude: -79.4, latitude: 43.7 },
          distanceToClickMeters: 60,
          segmentIndex: 0,
          distanceAlongEdgeMeters: 10,
          distanceRemainingMeters: 90,
        },
      },
      end: {
        nodeId: "end-node",
        point: { longitude: -79.39, latitude: 43.7 },
        reusedExistingNode: false,
        candidate: {
          edgeId: "end-edge",
          snappedPoint: { longitude: -79.39, latitude: 43.7 },
          distanceToClickMeters: 30,
          segmentIndex: 0,
          distanceAlongEdgeMeters: 40,
          distanceRemainingMeters: 60,
        },
      },
    });
    solveWalkingGraph.mockReturnValue({
      distanceMeters: 100,
      durationSeconds: 72,
      path: [
        [-79.4, 43.7],
        [-79.39, 43.7],
      ],
    });

    const result = await strategy.solve({
      request: {
        mode: "walking",
        start: { longitude: -79.401, latitude: 43.701 },
        end: { longitude: -79.389, latitude: 43.701 },
      },
    });

    expect(result).toEqual({
      start: { longitude: -79.401, latitude: 43.701 },
      end: { longitude: -79.389, latitude: 43.701 },
      distanceMeters: 190,
      durationSeconds: 136.8,
      path: [
        [-79.401, 43.701],
        [-79.4, 43.7],
        [-79.39, 43.7],
        [-79.389, 43.701],
      ],
    });
  });
});
