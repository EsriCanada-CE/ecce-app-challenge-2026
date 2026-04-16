import type {
  RouteApiSuccess,
  RoutePathCoordinate,
  RoutePoint,
  TravelMode,
  WeatherApiSuccess,
} from "@/lib/route-types";

export const routingLayerKeys = ["roads", "trails", "cycling", "sidewalks"] as const;

export type RoutingLayerKey = (typeof routingLayerKeys)[number];

export type RoutingLayerFormat = "geojson";

export type RoutingLayerAvailability = "available" | "planned";

export type RoutingDirection = "both" | "forward" | "reverse";

export type RoutingNodeId = string | number;

export type RoutingLayerSource = {
  key: RoutingLayerKey;
  label: string;
  path: string | null;
  format: RoutingLayerFormat | null;
  availability: RoutingLayerAvailability;
  notes: string;
};

export type RoutingSpeedProfile = {
  defaultKph: number;
  layerOverridesKph?: Partial<Record<RoutingLayerKey, number>>;
};

export type RoutingProfile = {
  mode: TravelMode;
  label: string;
  allowedLayers: RoutingLayerKey[];
  preferredLayers: RoutingLayerKey[];
  speedProfile: RoutingSpeedProfile;
  notes: string;
};

export type RoutingNode = {
  id: RoutingNodeId;
  longitude: number;
  latitude: number;
};

export type RoutingEdge = {
  id: string;
  baseEdgeId: string;
  fromNodeId: RoutingNodeId;
  toNodeId: RoutingNodeId;
  layer: RoutingLayerKey;
  direction: RoutingDirection;
  lengthMeters: number;
  durationSeconds: number;
  speedKph?: number | null;
  roadType?: "highway" | "arterial" | "local";
  geometry: RoutePathCoordinate[];
  cumulativeLengthsMeters: number[];
};

export type RoutingGraph = {
  nodes: Map<RoutingNodeId, RoutingNode>;
  nodeList: RoutingNode[];
  edgesByNode: Map<RoutingNodeId, RoutingEdge[]>;
  edgeById: Map<string, RoutingEdge>;
  edgeIdsByBaseEdgeId: Map<string, string[]>;
};

export type SnapCandidate = {
  edgeId: string;
  snappedPoint: RoutePoint;
  distanceToClickMeters: number;
  segmentIndex: number;
  distanceAlongEdgeMeters: number;
  distanceRemainingMeters: number;
};

export type SnappedRoutePoint = {
  point: RoutePoint;
  nodeId: RoutingNodeId;
  reusedExistingNode: boolean;
  candidate: SnapCandidate;
};

export type RouteSnapResult = {
  graph: RoutingGraph;
  start: SnappedRoutePoint;
  end: SnappedRoutePoint;
};

export type RoutePlanningRequest = {
  mode?: TravelMode;
  start: RoutePoint;
  end: RoutePoint;
  departureTimeIso?: string;
  weather?: WeatherApiSuccess;
};

export type ResolvedRoutePlanningRequest = Omit<RoutePlanningRequest, "mode"> & {
  mode: TravelMode;
};

export type RoutingBuildContext = {
  layers: Partial<Record<RoutingLayerKey, unknown>>;
};

export type RoutingSolveContext = {
  request: ResolvedRoutePlanningRequest;
  graph?: RoutingGraph;
};

export interface RoutingStrategy {
  readonly mode: TravelMode;
  readonly profile: RoutingProfile;
  buildGraph?(context: RoutingBuildContext): Promise<RoutingGraph>;
  solve(context: RoutingSolveContext): Promise<RouteApiSuccess | null>;
}
