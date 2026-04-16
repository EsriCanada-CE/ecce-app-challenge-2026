import { describe, expect, it } from "vitest";

import { RoutingError } from "@/lib/routing/errors";
import { findNearestEdgeSnapCandidate } from "@/lib/routing/snapping";
import {
  buildWalkingGraphFromFeatureCollection,
  calculateWalkingDurationSeconds,
  createWalkingEdges,
  isWalkableSidewalkFeature,
  snapWalkingRouteToGraph,
  solveWalkingGraph,
  WALKING_MAX_SNAP_DISTANCE_METERS,
  WALKING_NODE_REUSE_DISTANCE_METERS,
} from "@/lib/routing/strategies/walking-routing-helpers";

describe("walking routing helpers", () => {
  it("filters the sidewalk dataset to only walkable sidewalk records", () => {
    expect(
      isWalkableSidewalkFeature({
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.7],
          ],
        },
        properties: {
          SDWLK_DESC: "Sidewalk on both sides",
        },
      }),
    ).toBe(true);
    expect(
      isWalkableSidewalkFeature({
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.7],
          ],
        },
        properties: {
          SDWLK_DESC: "PAVED WALKWAY BETWEEN TWO STREETS",
        },
      }),
    ).toBe(true);
    expect(
      isWalkableSidewalkFeature({
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.7],
          ],
        },
        properties: {
          SDWLK_DESC: "No sidewalk on either side",
        },
      }),
    ).toBe(false);
    expect(
      isWalkableSidewalkFeature({
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.7],
          ],
        },
        properties: {
          SDWLK_DESC: "Not applicable",
        },
      }),
    ).toBe(false);
  });

  it("creates bidirectional sidewalk edges from feature geometry", () => {
    const edges = createWalkingEdges(
      {
        geometry: {
          type: "LineString",
          coordinates: [
            [-79.4, 43.7],
            [-79.39, 43.71],
          ],
        },
        properties: {
          FID: 1,
          SDWLK_DESC: "Sidewalk on both sides",
          Shape__Length: 100,
        },
      },
      5,
    );

    expect(edges).toHaveLength(2);
    expect(edges[0]).toMatchObject({
      fromNodeId: "sidewalk:-79.400000,43.700000",
      toNodeId: "sidewalk:-79.390000,43.710000",
      layer: "sidewalks",
      direction: "forward",
      lengthMeters: 100,
    });
    expect(edges[1]).toMatchObject({
      fromNodeId: "sidewalk:-79.390000,43.710000",
      toNodeId: "sidewalk:-79.400000,43.700000",
      direction: "reverse",
      lengthMeters: 100,
    });
  });

  it("calculates duration from walking speed", () => {
    expect(WALKING_MAX_SNAP_DISTANCE_METERS).toBe(150);
    expect(WALKING_NODE_REUSE_DISTANCE_METERS).toBe(2);
    expect(calculateWalkingDurationSeconds(1_000, 5)).toBeCloseTo(720, 5);
  });

  it("snaps only to sidewalk edges", () => {
    const graph = buildWalkingGraphFromFeatureCollection(
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
              FID: 2,
              SDWLK_DESC: "Sidewalk on both sides",
              Shape__Length: 100,
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.41, 43.71],
                [-79.4, 43.71],
              ],
            },
            properties: {
              FID: 3,
              SDWLK_DESC: "No sidewalk on either side",
              Shape__Length: 100,
            },
          },
        ],
      },
      5,
    );

    const candidate = findNearestEdgeSnapCandidate(
      graph,
      {
        longitude: -79.405,
        latitude: 43.71,
      },
      ["sidewalks"],
    );

    expect(candidate).not.toBeNull();
    expect(candidate?.snappedPoint.latitude).toBeCloseTo(43.7, 5);
  });

  it("rejects clicks that are too far from the sidewalk network", () => {
    const graph = buildWalkingGraphFromFeatureCollection(
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
              FID: 4,
              SDWLK_DESC: "Sidewalk on both sides",
              Shape__Length: 100,
            },
          },
        ],
      },
      5,
    );

    expect(() =>
      snapWalkingRouteToGraph(
        graph,
        { longitude: -79.4, latitude: 43.705 },
        { longitude: -79.39, latitude: 43.7 },
      ),
    ).toThrowError(RoutingError);
  });

  it("solves a connected sidewalk path and sums distance and duration", () => {
    const graph = buildWalkingGraphFromFeatureCollection(
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
              FID: 5,
              SDWLK_DESC: "Sidewalk on both sides",
              Shape__Length: 100,
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
              FID: 6,
              SDWLK_DESC: "City walkway",
              Shape__Length: 60,
            },
          },
        ],
      },
      5,
    );

    const route = solveWalkingGraph(
      graph,
      "sidewalk:-79.400000,43.700000",
      "sidewalk:-79.380000,43.700000",
    );

    expect(route).not.toBeNull();
    expect(route?.distanceMeters).toBeCloseTo(160, 5);
    expect(route?.durationSeconds).toBeCloseTo(calculateWalkingDurationSeconds(160, 5), 5);
    expect(route?.path).toEqual([
      [-79.4, 43.7],
      [-79.39, 43.7],
      [-79.38, 43.7],
    ]);
  });

  it("returns null when sidewalks are disconnected", () => {
    const graph = buildWalkingGraphFromFeatureCollection(
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
              FID: 7,
              SDWLK_DESC: "Sidewalk on both sides",
              Shape__Length: 100,
            },
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [-79.38, 43.71],
                [-79.37, 43.71],
              ],
            },
            properties: {
              FID: 8,
              SDWLK_DESC: "Recreational Trail",
              Shape__Length: 100,
            },
          },
        ],
      },
      5,
    );

    expect(
      solveWalkingGraph(
        graph,
        "sidewalk:-79.400000,43.700000",
        "sidewalk:-79.370000,43.710000",
      ),
    ).toBeNull();
  });
});
