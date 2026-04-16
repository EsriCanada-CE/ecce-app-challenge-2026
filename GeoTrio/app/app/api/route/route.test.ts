import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoutingError } from "@/lib/routing/errors";
import type { RouteApiSuccess } from "@/lib/route-types";

const { planRouteByMode } = vi.hoisted(() => ({
  planRouteByMode: vi.fn(),
}));

vi.mock("@/lib/routing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/routing")>();

  return {
    ...actual,
    normalizeTravelMode: (mode?: "cycling" | "walking" | "driving") => mode ?? "driving",
    planRouteByMode,
  };
});

import { POST } from "@/app/api/route/route";

describe("POST /api/route", () => {
  beforeEach(() => {
    planRouteByMode.mockReset();
  });

  it("defaults missing mode to driving and returns duration in the response", async () => {
    const route: RouteApiSuccess = {
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      distanceMeters: 120,
      durationSeconds: 8,
      path: [
        [-79.4, 43.7],
        [-79.39, 43.71],
      ],
    };
    planRouteByMode.mockResolvedValue(route);

    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
        }),
      }),
    );
    const payload = (await response.json()) as RouteApiSuccess;

    expect(response.status).toBe(200);
    expect(planRouteByMode).toHaveBeenCalledWith({
      mode: "driving",
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      departureTimeIso: undefined,
    });
    expect(payload.durationSeconds).toBe(8);
  });

  it("forwards a valid departureTimeIso override to the planner", async () => {
    const route: RouteApiSuccess = {
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      distanceMeters: 120,
      durationSeconds: 8,
      path: [
        [-79.4, 43.7],
        [-79.39, 43.71],
      ],
    };
    const departureTimeIso = "2026-03-30T12:30:00Z";
    planRouteByMode.mockResolvedValue(route);

    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
          departureTimeIso,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(planRouteByMode).toHaveBeenCalledWith({
      mode: "driving",
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      departureTimeIso,
    });
  });

  it("forwards optional weather conditions to the planner", async () => {
    const route: RouteApiSuccess = {
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      distanceMeters: 120,
      durationSeconds: 8,
      path: [
        [-79.4, 43.7],
        [-79.39, 43.71],
      ],
    };
    const weather = {
      time: "2026-03-30T12:00",
      temperatureC: 9,
      apparentTemperatureC: 7,
      precipitationMm: 3,
      windSpeedKmh: 18,
      weatherCode: 63,
      isDay: true,
    };
    planRouteByMode.mockResolvedValue(route);

    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
          weather,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(planRouteByMode).toHaveBeenCalledWith({
      mode: "driving",
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      departureTimeIso: undefined,
      weather,
    });
  });

  it("forwards walking route requests to the planner", async () => {
    const route: RouteApiSuccess = {
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      distanceMeters: 150,
      durationSeconds: 120,
      path: [
        [-79.4, 43.7],
        [-79.39, 43.71],
      ],
    };
    planRouteByMode.mockResolvedValue(route);

    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          mode: "walking",
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
        }),
      }),
    );
    const payload = (await response.json()) as RouteApiSuccess;

    expect(response.status).toBe(200);
    expect(planRouteByMode).toHaveBeenCalledWith({
      mode: "walking",
      start: { longitude: -79.4, latitude: 43.7 },
      end: { longitude: -79.39, latitude: 43.71 },
      departureTimeIso: undefined,
    });
    expect(payload.durationSeconds).toBe(120);
  });

  it("returns a snap-distance error when no drivable road is nearby", async () => {
    planRouteByMode.mockRejectedValue(
      new RoutingError("No drivable road is close enough to that point.", 404),
    );

    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
        }),
      }),
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(404);
    expect(payload.error).toBe("No drivable road is close enough to that point.");
  });

  it("rejects an invalid departureTimeIso override", async () => {
    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
          departureTimeIso: "not-a-date",
        }),
      }),
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(planRouteByMode).not.toHaveBeenCalled();
    expect(payload.error).toBe("departureTimeIso must be a valid ISO datetime string.");
  });

  it("rejects an invalid weather snapshot", async () => {
    const response = await POST(
      new Request("http://localhost/api/route", {
        method: "POST",
        body: JSON.stringify({
          start: { longitude: -79.4, latitude: 43.7 },
          end: { longitude: -79.39, latitude: 43.71 },
          weather: {
            precipitationMm: "stormy",
          },
        }),
      }),
    );
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(planRouteByMode).not.toHaveBeenCalled();
    expect(payload.error).toBe("weather must include valid current-condition values when provided.");
  });
});
