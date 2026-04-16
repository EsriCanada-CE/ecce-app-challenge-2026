import { readFileSync } from "node:fs";
import path from "node:path";

import type { RoutingGraph } from "@/lib/routing/contracts";
import {
  DEFAULT_MAX_SNAP_DISTANCE_METERS,
  findNearestEdgeSnapCandidate,
} from "@/lib/routing/snapping";
import type { RoutePoint } from "@/lib/route-types";

export const OUTSIDE_TORONTO_MESSAGE = "That spot isn't within the downtown boundary.";

type InvalidPointValidationResult = {
  isValid: false;
  reason: "outsideToronto";
  message: string;
};

type ValidPointValidationResult = {
  isValid: true;
  point: RoutePoint;
  distanceToRoadMeters: number;
};

export type PointValidationResult =
  | InvalidPointValidationResult
  | ValidPointValidationResult;

export function validatePointAgainstRoadGraph(
  graph: RoutingGraph,
  point: RoutePoint,
  maxSnapDistanceMeters = DEFAULT_MAX_SNAP_DISTANCE_METERS,
): PointValidationResult {
  const candidate = findNearestEdgeSnapCandidate(graph, point, ["roads"]);
  const isWithinDowntownBoundary = isPointWithinDowntownBoundary(point);

  if (!isWithinDowntownBoundary) {
    return {
      isValid: false,
      reason: "outsideToronto",
      message: OUTSIDE_TORONTO_MESSAGE,
    };
  }

  if (candidate) {
    return {
      isValid: true,
      point: candidate.snappedPoint,
      distanceToRoadMeters: candidate.distanceToClickMeters,
    };
  }

  return {
    isValid: false,
    reason: "outsideToronto",
    message: OUTSIDE_TORONTO_MESSAGE,
  };
}

type GeoJsonPolygon = [number, number][][];
type GeoJsonMultiPolygon = GeoJsonPolygon[];

type DowntownBoundaryGeoJson = {
  features: Array<{
    geometry:
      | {
          type: "Polygon";
          coordinates: GeoJsonPolygon;
        }
      | {
          type: "MultiPolygon";
          coordinates: GeoJsonMultiPolygon;
        }
      | null;
  }>;
};

let downtownRingsCache: GeoJsonPolygon[] | null = null;

export function isPointWithinDowntownBoundary(point: RoutePoint) {
  return getDowntownRings().some((polygonRings) => isPointInPolygon(point, polygonRings));
}

function getDowntownRings() {
  if (downtownRingsCache) {
    return downtownRingsCache;
  }

  const boundaryPath = path.join(process.cwd(), "public", "data", "Downtown.geojson");
  const rawBoundary = readFileSync(boundaryPath, "utf8");
  const parsedBoundary = JSON.parse(rawBoundary) as DowntownBoundaryGeoJson;

  downtownRingsCache = extractDowntownRings(parsedBoundary);

  return downtownRingsCache;
}

function extractDowntownRings(boundary: DowntownBoundaryGeoJson) {
  return boundary.features.flatMap((feature) => {
    if (!feature.geometry) {
      return [];
    }

    if (feature.geometry.type === "Polygon") {
      return [feature.geometry.coordinates as GeoJsonPolygon];
    }

    if (feature.geometry.type === "MultiPolygon") {
      return feature.geometry.coordinates as GeoJsonMultiPolygon;
    }

    return [];
  });
}

function isPointInPolygon(point: RoutePoint, polygonRings: GeoJsonPolygon) {
  const [outerRing, ...holes] = polygonRings;

  if (!outerRing || !isPointInRing(point, outerRing)) {
    return false;
  }

  return !holes.some((ring) => isPointInRing(point, ring));
}

function isPointInRing(point: RoutePoint, ring: [number, number][]) {
  let isInside = false;

  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index++) {
    const [currentLongitude, currentLatitude] = ring[index];
    const [previousLongitude, previousLatitude] = ring[previousIndex];

    const intersects =
      currentLatitude > point.latitude !== previousLatitude > point.latitude &&
      point.longitude <
        ((previousLongitude - currentLongitude) * (point.latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}
