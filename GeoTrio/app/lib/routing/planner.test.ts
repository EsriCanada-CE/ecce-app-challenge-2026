import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRoutingStrategy } = vi.hoisted(() => ({
  getRoutingStrategy: vi.fn(),
}));

vi.mock("@/lib/routing/registry", () => ({
  getRoutingStrategy,
}));

import { normalizeTravelMode, planRouteByMode } from "@/lib/routing/planner";

describe("routing planner", () => {
  beforeEach(() => {
    getRoutingStrategy.mockReset();
  });

  it("defaults to driving when no mode is provided", async () => {
    const solve = vi.fn().mockResolvedValue(null);
    getRoutingStrategy.mockReturnValue({ solve });

    await planRouteByMode({
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.3, latitude: 43.8 },
    });

    expect(normalizeTravelMode(undefined)).toBe("driving");
    expect(getRoutingStrategy).toHaveBeenCalledWith("driving");
    expect(solve).toHaveBeenCalledWith({
      request: {
        mode: "driving",
        start: { longitude: -79.4, latitude: 43.7 },
        end: { longitude: -79.3, latitude: 43.8 },
      },
    });
  });

  it("uses the requested driving mode unchanged", async () => {
    const solve = vi.fn().mockResolvedValue(null);
    getRoutingStrategy.mockReturnValue({ solve });
    const departureTimeIso = "2026-03-30T12:30:00Z";
    const weather = {
      time: "2026-03-30T12:00",
      temperatureC: 9,
      apparentTemperatureC: 7,
      precipitationMm: 3,
      windSpeedKmh: 18,
      weatherCode: 63,
      isDay: true,
    };

    await planRouteByMode({
      mode: "driving",
      start: { longitude: -79.41, latitude: 43.71 },
      end: { longitude: -79.31, latitude: 43.81 },
      departureTimeIso,
      weather,
    });

    expect(normalizeTravelMode("driving")).toBe("driving");
    expect(getRoutingStrategy).toHaveBeenCalledWith("driving");
    expect(solve).toHaveBeenCalledWith({
      request: {
        mode: "driving",
        start: { longitude: -79.41, latitude: 43.71 },
        end: { longitude: -79.31, latitude: 43.81 },
        departureTimeIso,
        weather,
      },
    });
  });

  it("uses the requested cycling mode unchanged", async () => {
    const solve = vi.fn().mockResolvedValue(null);
    getRoutingStrategy.mockReturnValue({ solve });

    await planRouteByMode({
      mode: "cycling",
      start: { longitude: -79.41, latitude: 43.71 },
      end: { longitude: -79.31, latitude: 43.81 },
    });

    expect(normalizeTravelMode("cycling")).toBe("cycling");
    expect(getRoutingStrategy).toHaveBeenCalledWith("cycling");
    expect(solve).toHaveBeenCalledWith({
      request: {
        mode: "cycling",
        start: { longitude: -79.41, latitude: 43.71 },
        end: { longitude: -79.31, latitude: 43.81 },
      },
    });
  });
});
