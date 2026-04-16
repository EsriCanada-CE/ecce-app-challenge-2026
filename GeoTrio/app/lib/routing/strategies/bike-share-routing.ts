import fs from "node:fs/promises";
import path from "node:path";

import type {
  RouteAccumulator as CyclingRouteAccumulator,
} from "@/lib/routing/strategies/cycling-routing-helpers";
import { RoutingError } from "@/lib/routing/errors";
import { routingProfiles } from "@/lib/routing/profiles";
import { snapRouteEndpointsToGraph } from "@/lib/routing/snapping";
import {
  CYCLING_NODE_REUSE_DISTANCE_METERS,
  getCyclingGraph,
  solveCyclingGraph,
} from "@/lib/routing/strategies/cycling-routing-helpers";
import { getCyclingTimeOfDayMultiplier } from "@/lib/routing/strategies/cycling-time";
import {
  getWalkingGraph,
  solveWalkingGraph,
  WALKING_NODE_REUSE_DISTANCE_METERS,
} from "@/lib/routing/strategies/walking-routing-helpers";
import type {
  RouteAccumulator as WalkingRouteAccumulator,
} from "@/lib/routing/strategies/walking-routing-helpers";
import type {
  RoutingGraph,
  RoutingLayerKey,
  RoutingNodeId,
} from "@/lib/routing/contracts";
import type {
  BikeShareRouteDetails,
  BikeStationSummary,
  RouteApiSuccess,
  RoutePathCoordinate,
  RoutePoint,
  RouteSegment,
} from "@/lib/route-types";

type BikeStation = BikeStationSummary;

type BikeStationFeatureCollection = {
  type: "FeatureCollection";
  features: BikeStationFeature[];
};

type BikeStationFeature = {
  geometry: {
    type: "Point";
    coordinates: [longitude: number, latitude: number];
  } | null;
  properties?: {
    station_id?: number;
    name?: string | null;
    address?: string | null;
    capacity?: number | null;
  };
};

type BoundaryFeatureCollection = {
  type: "FeatureCollection";
  features: BoundaryFeature[];
};

type BoundaryFeature = {
  geometry: BoundaryGeometry | null;
};

type BoundaryGeometry =
  | {
      type: "Polygon";
      coordinates: RoutePathCoordinate[][];
    }
  | {
      type: "MultiPolygon";
      coordinates: RoutePathCoordinate[][][];
    };

type RouteAccumulator = CyclingRouteAccumulator | WalkingRouteAccumulator;

type SolvedLeg = {
  route: RouteAccumulator;
  snappedStart: RoutePoint;
  snappedEnd: RoutePoint;
};

type StationOption = {
  station: BikeStation;
  walkSegment: RouteSegment;
  crowDistanceMeters: number;
};

type JourneyOption = {
  pickupStation: BikeStation;
  dropoffStation: BikeStation;
  walkToStation: RouteSegment;
  rideSegment: RouteSegment;
  walkFromStation: RouteSegment;
  totalDurationSeconds: number;
};

const BIKE_STATIONS_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "BikeStations.geojson",
);
const SERVICE_AREA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "Downtown.geojson",
);
const BIKE_SHARE_STATION_SEARCH_LIMIT = 10;
const BIKE_SHARE_ACCESSIBLE_STATION_LIMIT = 4;
const BIKE_SHARE_WALKING_MAX_SNAP_DISTANCE_METERS = 400;
const BIKE_SHARE_CYCLING_MAX_SNAP_DISTANCE_METERS = 120;

let bikeStationsPromise: Promise<BikeStation[]> | null = null;
let serviceAreaPromise: Promise<RoutePathCoordinate[][][]> | null = null;

export async function solveBikeShareRoute({
  start,
  end,
  departureTimeIso,
}: {
  start: RoutePoint;
  end: RoutePoint;
  departureTimeIso?: string;
}): Promise<RouteApiSuccess | null> {
  const [serviceAreas, cyclingGraph, walkingGraph, stations] = await Promise.all([
    getBikeShareServiceAreas(),
    getCyclingGraph(routingProfiles.cycling.speedProfile.defaultKph),
    getWalkingGraph(routingProfiles.walking.speedProfile.defaultKph),
    getBikeStations(),
  ]);

  if (!isPointWithinAnyArea(start, serviceAreas) || !isPointWithinAnyArea(end, serviceAreas)) {
    return null;
  }

  const pickupOptions = getReachableStationOptions({
    point: start,
    kind: "walk-to-station",
    stations,
    walkingGraph,
  });
  const dropoffOptions = getReachableStationOptions({
    point: end,
    kind: "walk-from-station",
    stations,
    walkingGraph,
  });

  if (pickupOptions.length === 0 || dropoffOptions.length === 0) {
    throw new RoutingError(
      "No bike-share station with a walkable connection is close enough to one of those points.",
      404,
    );
  }

  let bestJourney: JourneyOption | null = null;
  const cyclingTimeMultiplier = getCyclingTimeOfDayMultiplier(departureTimeIso);

  for (const pickup of pickupOptions) {
    for (const dropoff of dropoffOptions) {
      const rideSegment = solveRouteSegment({
        graph: cyclingGraph,
        start: pickup.station.point,
        end: dropoff.station.point,
        allowedLayers: ["roads"],
        maxSnapDistanceMeters: BIKE_SHARE_CYCLING_MAX_SNAP_DISTANCE_METERS,
        nodeReuseDistanceMeters: CYCLING_NODE_REUSE_DISTANCE_METERS,
        syntheticNodePrefix: `bike-share:ride:${pickup.station.id}:${dropoff.station.id}`,
        tooFarMessage: "No bikeable road is close enough to one of the selected stations.",
        speedKph: routingProfiles.cycling.speedProfile.defaultKph,
        kind: "bike",
        mode: "cycling",
        solver: solveCyclingGraph,
        durationMultiplier: cyclingTimeMultiplier,
      });

      if (!rideSegment) {
        continue;
      }

      const totalDurationSeconds =
        pickup.walkSegment.durationSeconds +
        rideSegment.durationSeconds +
        dropoff.walkSegment.durationSeconds;
      const nextJourney: JourneyOption = {
        pickupStation: pickup.station,
        dropoffStation: dropoff.station,
        walkToStation: pickup.walkSegment,
        rideSegment,
        walkFromStation: dropoff.walkSegment,
        totalDurationSeconds,
      };

      if (
        !bestJourney ||
        nextJourney.totalDurationSeconds < bestJourney.totalDurationSeconds
      ) {
        bestJourney = nextJourney;
      }
    }
  }

  if (!bestJourney) {
    throw new RoutingError(
      "No bike-share route could be found between nearby stations for those points.",
      404,
    );
  }

  const segments = [
    bestJourney.walkToStation,
    bestJourney.rideSegment,
    bestJourney.walkFromStation,
  ];
  const bikeShare: BikeShareRouteDetails = {
    pickupStation: bestJourney.pickupStation,
    dropoffStation: bestJourney.dropoffStation,
  };

  return {
    start,
    end,
    distanceMeters: segments.reduce((total, segment) => total + segment.distanceMeters, 0),
    durationSeconds: bestJourney.totalDurationSeconds,
    path: mergeSegmentPaths(segments),
    segments,
    bikeShare,
  };
}

async function getBikeStations() {
  bikeStationsPromise ??= loadBikeStations();
  return bikeStationsPromise;
}

async function loadBikeStations() {
  const source = await fs.readFile(BIKE_STATIONS_PATH, "utf8");
  const collection = JSON.parse(source) as BikeStationFeatureCollection;

  return collection.features.flatMap((feature) => {
    if (!feature.geometry || feature.geometry.type !== "Point") {
      return [];
    }

    const stationId = feature.properties?.station_id;
    const name = feature.properties?.name?.trim();

    if (!stationId || !name) {
      return [];
    }

    return [{
      id: stationId,
      name,
      address: feature.properties?.address?.trim() || null,
      capacity: feature.properties?.capacity ?? null,
      point: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      },
    }] satisfies BikeStation[];
  });
}

async function getBikeShareServiceAreas() {
  serviceAreaPromise ??= loadBikeShareServiceAreas();
  return serviceAreaPromise;
}

async function loadBikeShareServiceAreas() {
  const source = await fs.readFile(SERVICE_AREA_PATH, "utf8");
  const collection = JSON.parse(source) as BoundaryFeatureCollection;

  return collection.features.flatMap((feature) => {
    if (!feature.geometry) {
      return [];
    }

    if (feature.geometry.type === "Polygon") {
      return [feature.geometry.coordinates];
    }

    return feature.geometry.coordinates;
  });
}

function getReachableStationOptions({
  point,
  kind,
  stations,
  walkingGraph,
}: {
  point: RoutePoint;
  kind: "walk-to-station" | "walk-from-station";
  stations: BikeStation[];
  walkingGraph: RoutingGraph;
}) {
  const nearbyStations = stations
    .map((station) => ({
      station,
      crowDistanceMeters: getDistanceMeters(point, station.point),
    }))
    .sort((a, b) => a.crowDistanceMeters - b.crowDistanceMeters)
    .slice(0, BIKE_SHARE_STATION_SEARCH_LIMIT);

  const options: StationOption[] = [];

  for (const nearbyStation of nearbyStations) {
    try {
      const walkSegment = solveRouteSegment({
        graph: walkingGraph,
        start: kind === "walk-to-station" ? point : nearbyStation.station.point,
        end: kind === "walk-to-station" ? nearbyStation.station.point : point,
        allowedLayers: ["sidewalks"],
        maxSnapDistanceMeters: BIKE_SHARE_WALKING_MAX_SNAP_DISTANCE_METERS,
        nodeReuseDistanceMeters: WALKING_NODE_REUSE_DISTANCE_METERS,
        syntheticNodePrefix: `bike-share:${kind}:${nearbyStation.station.id}`,
        tooFarMessage: "No walkable sidewalk is close enough to that point.",
        speedKph: routingProfiles.walking.speedProfile.defaultKph,
        kind,
        mode: "walking",
        solver: solveWalkingGraph,
      });

      if (!walkSegment) {
        continue;
      }

      options.push({
        station: nearbyStation.station,
        walkSegment,
        crowDistanceMeters: nearbyStation.crowDistanceMeters,
      });
    } catch (error) {
      if (error instanceof RoutingError && error.statusCode === 404) {
        continue;
      }

      throw error;
    }
  }

  return options
    .sort((a, b) =>
      a.walkSegment.durationSeconds - b.walkSegment.durationSeconds ||
      a.crowDistanceMeters - b.crowDistanceMeters,
    )
    .slice(0, BIKE_SHARE_ACCESSIBLE_STATION_LIMIT);
}

function solveRouteSegment({
  graph,
  start,
  end,
  allowedLayers,
  maxSnapDistanceMeters,
  nodeReuseDistanceMeters,
  syntheticNodePrefix,
  tooFarMessage,
  speedKph,
  kind,
  mode,
  solver,
  durationMultiplier = 1,
}: {
  graph: RoutingGraph;
  start: RoutePoint;
  end: RoutePoint;
  allowedLayers: RoutingLayerKey[];
  maxSnapDistanceMeters: number;
  nodeReuseDistanceMeters: number;
  syntheticNodePrefix: string;
  tooFarMessage: string;
  speedKph: number;
  kind: RouteSegment["kind"];
  mode: RouteSegment["mode"];
  solver: (
    graph: RoutingGraph,
    startNodeId: RoutingNodeId,
    endNodeId: RoutingNodeId,
  ) => RouteAccumulator | null;
  durationMultiplier?: number;
}) {
  const solvedLeg = solveLegOnGraph({
    graph,
    start,
    end,
    allowedLayers,
    maxSnapDistanceMeters,
    nodeReuseDistanceMeters,
    syntheticNodePrefix,
    tooFarMessage,
    solver,
  });

  if (!solvedLeg) {
    return null;
  }

  const startConnectorDistanceMeters = getDistanceMeters(start, solvedLeg.snappedStart);
  const endConnectorDistanceMeters = getDistanceMeters(solvedLeg.snappedEnd, end);
  const connectorDistanceMeters = startConnectorDistanceMeters + endConnectorDistanceMeters;
  const connectorDurationSeconds = calculateDurationSeconds(connectorDistanceMeters, speedKph);

  return {
    kind,
    mode,
    distanceMeters: solvedLeg.route.distanceMeters + connectorDistanceMeters,
    durationSeconds: (solvedLeg.route.durationSeconds + connectorDurationSeconds) * durationMultiplier,
    path: buildLegPath({
      start,
      snappedStart: solvedLeg.snappedStart,
      routePath: solvedLeg.route.path,
      snappedEnd: solvedLeg.snappedEnd,
      end,
    }),
  };
}

function solveLegOnGraph({
  graph,
  start,
  end,
  allowedLayers,
  maxSnapDistanceMeters,
  nodeReuseDistanceMeters,
  syntheticNodePrefix,
  tooFarMessage,
  solver,
}: {
  graph: RoutingGraph;
  start: RoutePoint;
  end: RoutePoint;
  allowedLayers: RoutingLayerKey[];
  maxSnapDistanceMeters: number;
  nodeReuseDistanceMeters: number;
  syntheticNodePrefix: string;
  tooFarMessage: string;
  solver: (
    graph: RoutingGraph,
    startNodeId: RoutingNodeId,
    endNodeId: RoutingNodeId,
  ) => RouteAccumulator | null;
}): SolvedLeg | null {
  const snappedRoute = snapRouteEndpointsToGraph({
    graph,
    start,
    end,
    allowedLayers,
    syntheticNodePrefix,
    maxSnapDistanceMeters,
    nodeReuseDistanceMeters,
    tooFarMessage,
  });
  const route = solver(
    snappedRoute.graph,
    snappedRoute.start.nodeId,
    snappedRoute.end.nodeId,
  );

  if (!route) {
    return null;
  }

  return {
    route,
    snappedStart: snappedRoute.start.point,
    snappedEnd: snappedRoute.end.point,
  };
}

function buildLegPath({
  start,
  snappedStart,
  routePath,
  snappedEnd,
  end,
}: {
  start: RoutePoint;
  snappedStart: RoutePoint;
  routePath: RoutePathCoordinate[];
  snappedEnd: RoutePoint;
  end: RoutePoint;
}) {
  const path: RoutePathCoordinate[] = [];

  pushCoordinate(path, toCoordinate(start));

  if (routePath.length > 0) {
    pushCoordinates(path, routePath);
  } else {
    pushCoordinate(path, toCoordinate(snappedStart));
    pushCoordinate(path, toCoordinate(snappedEnd));
  }

  pushCoordinate(path, toCoordinate(end));

  return path;
}

function mergeSegmentPaths(segments: RouteSegment[]) {
  const path: RoutePathCoordinate[] = [];

  for (const segment of segments) {
    pushCoordinates(path, segment.path);
  }

  return path;
}

function pushCoordinates(path: RoutePathCoordinate[], nextCoordinates: RoutePathCoordinate[]) {
  for (const coordinate of nextCoordinates) {
    pushCoordinate(path, coordinate);
  }
}

function pushCoordinate(path: RoutePathCoordinate[], coordinate: RoutePathCoordinate) {
  const previous = path.at(-1);

  if (
    previous &&
    previous[0] === coordinate[0] &&
    previous[1] === coordinate[1]
  ) {
    return;
  }

  path.push(coordinate);
}

function calculateDurationSeconds(distanceMeters: number, speedKph: number) {
  const metersPerSecond = (speedKph * 1_000) / 3_600;
  return distanceMeters / metersPerSecond;
}

function getDistanceMeters(start: RoutePoint, end: RoutePoint) {
  const earthRadiusMeters = 6_371_000;
  const deltaLatitude = toRadians(end.latitude - start.latitude);
  const deltaLongitude = toRadians(end.longitude - start.longitude);
  const startLatitudeRadians = toRadians(start.latitude);
  const endLatitudeRadians = toRadians(end.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitudeRadians) *
    Math.cos(endLatitudeRadians) *
    Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function isPointWithinAnyArea(point: RoutePoint, areas: RoutePathCoordinate[][][]) {
  return areas.some((rings) => isPointWithinPolygon(point, rings));
}

function isPointWithinPolygon(point: RoutePoint, rings: RoutePathCoordinate[][]) {
  const [outerRing, ...holes] = rings;

  if (!outerRing || !isPointInsideRing(point, outerRing)) {
    return false;
  }

  return holes.every((hole) => !isPointInsideRing(point, hole));
}

function isPointInsideRing(point: RoutePoint, ring: RoutePathCoordinate[]) {
  let inside = false;

  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index, index += 1) {
    const current = ring[index];
    const previous = ring[previousIndex];

    const intersects =
      ((current[1] > point.latitude) !== (previous[1] > point.latitude)) &&
      point.longitude < (
        ((previous[0] - current[0]) * (point.latitude - current[1])) /
        ((previous[1] - current[1]) || Number.EPSILON) +
        current[0]
      );

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function toCoordinate(point: RoutePoint): RoutePathCoordinate {
  return [point.longitude, point.latitude];
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
