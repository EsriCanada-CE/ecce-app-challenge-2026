import { NextResponse } from "next/server";

import { validatePointAgainstRoadGraph } from "@/lib/point-validation";
import { routingProfiles } from "@/lib/routing/profiles";
import { getDrivingGraph } from "@/lib/routing/strategies/driving-routing-helpers";
import type {
  PointValidationApiError,
  PointValidationApiRequest,
  PointValidationApiSuccess,
  RoutePoint,
} from "@/lib/route-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: Partial<PointValidationApiRequest>;

  try {
    payload = (await request.json()) as Partial<PointValidationApiRequest>;
  } catch {
    return NextResponse.json<PointValidationApiError>(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!isValidRoutePoint(payload.point)) {
    return NextResponse.json<PointValidationApiError>(
      { error: "Point coordinates must include valid longitude and latitude values." },
      { status: 400 },
    );
  }

  try {
    const graph = await getDrivingGraph(routingProfiles.driving.speedProfile.defaultKph);
    const validation = validatePointAgainstRoadGraph(graph, payload.point);

    if (!validation.isValid) {
      return NextResponse.json<PointValidationApiError>(
        {
          error: validation.message,
          reason: validation.reason,
        },
        { status: 404 },
      );
    }

    return NextResponse.json<PointValidationApiSuccess>({
      point: validation.point,
      distanceToRoadMeters: validation.distanceToRoadMeters,
    });
  } catch (error) {
    console.error("Failed to validate the selected map point.", error);

    return NextResponse.json<PointValidationApiError>(
      { error: "Point validation is unavailable right now." },
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
