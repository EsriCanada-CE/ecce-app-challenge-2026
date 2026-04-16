import type { RouteMode } from "@/lib/route-insights";
import {
  getDrivingPresetDepartureTimeIso,
  type DrivingTimePreset,
} from "@/lib/routing/strategies/driving-time";

type TimedRouteCache = {
  timePreset?: DrivingTimePreset;
};

export function modeUsesTimePreset(mode: RouteMode) {
  return mode === "bike" || mode === "car";
}

export function getModeDepartureTimeIso(mode: RouteMode, preset: DrivingTimePreset) {
  return modeUsesTimePreset(mode)
    ? getDrivingPresetDepartureTimeIso(preset)
    : undefined;
}

export function isModeRouteFresh(
  mode: RouteMode,
  cachedRoute: TimedRouteCache | null | undefined,
  preset: DrivingTimePreset,
) {
  if (!cachedRoute) {
    return false;
  }

  return !modeUsesTimePreset(mode) || cachedRoute.timePreset === preset;
}
