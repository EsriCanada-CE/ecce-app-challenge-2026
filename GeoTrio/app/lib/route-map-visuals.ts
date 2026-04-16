import type { TravelMode } from "@/lib/route-types";

export const ROUTE_MAP_COLORS = {
  walking: "#f59e0b",
  cycling: "#0f766e",
  driving: "#2563eb",
  start: "#16a34a",
  finish: "#ef4444",
  bikeStationPickup: "#2563eb",
  bikeStationDropoff: "#60a5fa",
  markerOutline: "#ffffff",
} as const;

export function getRouteLineColor(mode: TravelMode) {
  switch (mode) {
    case "walking":
      return ROUTE_MAP_COLORS.walking;
    case "cycling":
      return ROUTE_MAP_COLORS.cycling;
    case "driving":
      return ROUTE_MAP_COLORS.driving;
  }
}

export function getRouteLineWidth(mode: TravelMode) {
  return mode === "walking" ? 3 : 3.5;
}
