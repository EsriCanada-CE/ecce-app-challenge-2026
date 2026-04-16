export type RoutePoint = {
  longitude: number;
  latitude: number;
};

export type RoutePathCoordinate = [longitude: number, latitude: number];

export const travelModes = ["cycling", "walking", "driving"] as const;

export type TravelMode = (typeof travelModes)[number];

export type RouteSegmentKind = "walk-to-station" | "bike" | "walk-from-station";

export type RouteSegment = {
  kind: RouteSegmentKind;
  mode: TravelMode;
  distanceMeters: number;
  durationSeconds: number;
  path: RoutePathCoordinate[];
};

export type BikeStationSummary = {
  id: number;
  name: string;
  address: string | null;
  capacity: number | null;
  point: RoutePoint;
};

export type BikeShareRouteDetails = {
  pickupStation: BikeStationSummary;
  dropoffStation: BikeStationSummary;
};

export type RouteApiRequest = {
  start: RoutePoint;
  end: RoutePoint;
  mode?: TravelMode;
  departureTimeIso?: string;
  weather?: WeatherApiSuccess;
};

export type RouteApiSuccess = {
  start: RoutePoint;
  end: RoutePoint;
  distanceMeters: number;
  durationSeconds: number;
  path: RoutePathCoordinate[];
  segments?: RouteSegment[];
  bikeShare?: BikeShareRouteDetails | null;
};

export type RouteApiError = {
  error: string;
};

export type PointValidationApiRequest = {
  point: RoutePoint;
};

export type PointValidationApiSuccess = {
  point: RoutePoint;
  distanceToRoadMeters: number;
};

export type PointValidationApiError = {
  error: string;
  reason?: "outsideToronto";
};

export type ReverseGeocodeApiSuccess = {
  address: string;
};

export type ReverseGeocodeApiError = {
  error: string;
};

export type WeatherApiSuccess = {
  time: string;
  temperatureC: number;
  apparentTemperatureC: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
  isDay: boolean;
};

export type WeatherApiError = {
  error: string;
};

export function isTravelMode(value: unknown): value is TravelMode {
  return typeof value === "string" && travelModes.includes(value as TravelMode);
}
