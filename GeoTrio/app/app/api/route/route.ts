import { NextResponse } from "next/server";

import { normalizeTravelMode, planRouteByMode, RoutingError } from "@/lib/routing";
import {
  isTravelMode,
  type RouteApiError,
  type RouteApiRequest,
  type RoutePoint,
} from "@/lib/route-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: Partial<RouteApiRequest>;

  try {
    payload = (await request.json()) as Partial<RouteApiRequest>;
  } catch {
    return NextResponse.json<RouteApiError>(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!isValidRoutePoint(payload.start) || !isValidRoutePoint(payload.end)) {
    return NextResponse.json<RouteApiError>(
      { error: "Route coordinates must include valid longitude and latitude values." },
      { status: 400 },
    );
  }

  if (payload.mode !== undefined && !isTravelMode(payload.mode)) {
    return NextResponse.json<RouteApiError>(
      { error: "Route mode must be one of cycling, walking, or driving." },
      { status: 400 },
    );
  }

  if (!isValidDepartureTimeIso(payload.departureTimeIso)) {
    return NextResponse.json<RouteApiError>(
      { error: "departureTimeIso must be a valid ISO datetime string." },
      { status: 400 },
    );
  }

  if (!isValidWeatherSnapshot(payload.weather)) {
    return NextResponse.json<RouteApiError>(
      { error: "weather must include valid current-condition values when provided." },
      { status: 400 },
    );
  }

  const mode = normalizeTravelMode(payload.mode);

  try {
    const route = await planRouteByMode({
      start: payload.start,
      end: payload.end,
      mode,
      departureTimeIso: payload.departureTimeIso,
      ...(payload.weather ? { weather: payload.weather } : {}),
    });

    if (!route) {
      return NextResponse.json<RouteApiError>(
        { error: getNoPathMessage(mode) },
        { status: 404 },
      );
    }

    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof RoutingError) {
      return NextResponse.json<RouteApiError>(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error(`Failed to solve ${mode} route.`, error);

    return NextResponse.json<RouteApiError>(
      { error: getNetworkLoadFailureMessage(mode) },
      { status: 500 },
    );
  }
}

function isValidRoutePoint(value: unknown): value is RoutePoint {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const point = value as Partial<RoutePoint>;

  return (
    typeof point.longitude === "number" &&
    Number.isFinite(point.longitude) &&
    point.longitude >= -180 &&
    point.longitude <= 180 &&
    typeof point.latitude === "number" &&
    Number.isFinite(point.latitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90
  );
}

function isValidDepartureTimeIso(value: unknown): value is string | undefined {
  if (value === undefined) {
    return true;
  }

  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function isValidWeatherSnapshot(
  value: Partial<RouteApiRequest>["weather"],
): value is NonNullable<RouteApiRequest["weather"]> | undefined {
  if (value === undefined) {
    return true;
  }

  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.time === "string" &&
    Number.isFinite(value.temperatureC) &&
    Number.isFinite(value.apparentTemperatureC) &&
    Number.isFinite(value.precipitationMm) &&
    Number.isFinite(value.windSpeedKmh) &&
    Number.isFinite(value.weatherCode) &&
    typeof value.isDay === "boolean"
  );
}

function getNoPathMessage(mode: "cycling" | "walking" | "driving") {
  if (mode === "cycling") {
    return "No bikeable road path could be found between those points.";
  }

  if (mode === "walking") {
    return "No walkable path could be found between those points.";
  }

  return "No drivable path could be found between those points.";
}

function getNetworkLoadFailureMessage(mode: "cycling" | "walking" | "driving") {
  if (mode === "cycling") {
    return "The road network for cycling could not be loaded right now.";
  }

  if (mode === "walking") {
    return "The walking network could not be loaded right now.";
  }

  return "The road network could not be loaded right now.";
}
