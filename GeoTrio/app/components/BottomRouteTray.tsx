"use client";

import AddressLoadingBar from "@/components/AddressLoadingBar";
import UiIcon from "@/components/UiIcon";
import {
  ALL_ROUTE_MODES,
  formatDistanceKilometers,
  formatDurationCompact,
  getModeImpactCo2Kg,
  getModeSeconds,
  ROUTE_MODE_CONFIG,
  type RouteDurationOverrides,
  type RouteMode,
} from "@/lib/route-insights";
import type { BikeShareRouteDetails, RouteSegment } from "@/lib/route-types";

export type { RouteMode } from "@/lib/route-insights";

type BottomRouteTrayProps = {
  startLabel: string | null;
  endLabel: string | null;
  isStartLabelLoading: boolean;
  isEndLabelLoading: boolean;
  distanceMeters: number | null;
  drivingDurationSeconds: number | null;
  modeDurations?: Partial<Record<RouteMode, number | null>>;
  durationOverrides?: RouteDurationOverrides;
  segments?: RouteSegment[];
  bikeShare?: BikeShareRouteDetails | null;
  isLoading: boolean;
  error: string | null;
  selectedMode: RouteMode;
  isRideStarted: boolean;
  isSavingRide: boolean;
  activePromptStep: "start" | "destination" | null;
  canReset: boolean;
  onModeSelect: (mode: RouteMode) => void;
  onReset: () => void;
  onStart: () => void;
};

export default function BottomRouteTray({
  startLabel,
  endLabel,
  isStartLabelLoading,
  isEndLabelLoading,
  distanceMeters,
  drivingDurationSeconds,
  modeDurations,
  durationOverrides,
  segments = [],
  bikeShare = null,
  isLoading,
  error,
  selectedMode,
  isRideStarted,
  isSavingRide,
  activePromptStep,
  canReset,
  onModeSelect,
  onReset,
  onStart,
}: BottomRouteTrayProps) {
  const hasRoute = distanceMeters !== null;
  const hasExactDurationsForAllModes = ALL_ROUTE_MODES.every(
    (mode) => typeof modeDurations?.[mode] === "number",
  );

  const secondaryModes = ALL_ROUTE_MODES.filter((mode) => mode !== selectedMode);

  const fastestMode: RouteMode | null = hasRoute && hasExactDurationsForAllModes
    ? ALL_ROUTE_MODES.reduce<RouteMode>((fastest, mode) => {
        const a = modeDurations?.[fastest] ?? Number.POSITIVE_INFINITY;
        const b = modeDurations?.[mode] ?? Number.POSITIVE_INFINITY;
        return b < a ? mode : fastest;
      }, "bike")
    : null;

  const primarySeconds = typeof modeDurations?.[selectedMode] === "number"
    ? modeDurations[selectedMode]
    : hasRoute && distanceMeters !== null
    ? getModeSeconds(selectedMode, distanceMeters, drivingDurationSeconds, durationOverrides)
    : null;
  const primaryCo2 = hasRoute && distanceMeters !== null
    ? getModeImpactCo2Kg(selectedMode, distanceMeters)
    : null;
  const bikeShareDetail = selectedMode === "bike"
    ? getBikeShareDetail(segments, bikeShare)
    : null;

  const statusLabel = error
    ? "Issue"
    : isSavingRide
      ? "Saving"
    : isRideStarted
      ? "Saved"
      : isLoading
      ? "Routing"
      : hasRoute && fastestMode === selectedMode
        ? "Fastest"
        : null;

  const statsLine = getStatsLine({
    hasRoute,
    isLoading,
    error,
    durationSeconds: primarySeconds,
    distanceMeters,
    co2Kg: primaryCo2,
  });

  const { label: primaryLabel, icon: primaryIcon } = ROUTE_MODE_CONFIG[selectedMode];
  const canStartRide =
    hasRoute &&
    !isLoading &&
    !error &&
    !isRideStarted &&
    !isSavingRide;

  return (
    <section className="route-tray glass-dark" aria-label="Route overview">
      <div className="route-tray__header">
        <button
          className="route-tray__reset"
          type="button"
          onClick={onReset}
          disabled={!canReset}
        >
          Reset
        </button>
      </div>
      <div className="route-tray__row">
        <div className="route-stops">
          <div className={`route-stop${activePromptStep === "start" ? " route-stop--active" : ""}`}>
            <UiIcon name="location" className="route-stop__icon route-stop__icon--from" />
            <div>
              <p className="route-stop__label">From</p>
              <p className="route-stop__value">
                {isStartLabelLoading
                  ? <AddressLoadingBar label="Loading starting address" />
                  : (startLabel ?? (activePromptStep === "start"
                      ? "Tap the map…"
                      : "Set starting point"))}
              </p>
            </div>
          </div>
          <div className={`route-stop${activePromptStep === "destination" ? " route-stop--active" : ""}`}>
            <UiIcon name="flag" className="route-stop__icon route-stop__icon--to" />
            <div>
              <p className="route-stop__label">To</p>
              <p className="route-stop__value">
                {isEndLabelLoading
                  ? <AddressLoadingBar label="Loading destination address" />
                  : (endLabel ?? (activePromptStep === "destination"
                      ? "Tap the map…"
                      : "Set destination"))}
              </p>
            </div>
          </div>
        </div>

        <article className={`route-primary${error ? " route-primary--error" : ""}`}>
          <div className="route-primary__content">
            <span className="route-primary__badge-icon">
              <UiIcon
                name={error ? "location" : primaryIcon}
                className="icon icon--medium"
              />
            </span>
            <div className="route-primary__body">
              <div className="route-primary__title-row">
                <h2>{primaryLabel}</h2>
                {statusLabel && <span className="route-pill">{statusLabel}</span>}
              </div>
              <p className="route-primary__meta">{statsLine}</p>
              {bikeShareDetail ? <p className="route-primary__detail">{bikeShareDetail}</p> : null}
            </div>
          </div>
          <button
            className="route-primary__button"
            type="button"
            onClick={onStart}
            disabled={!canStartRide}
          >
            {isSavingRide ? "Saving..." : "Start ride"}
          </button>
        </article>

        <div className="route-secondary">
          {secondaryModes.map((mode) => {
            const { icon } = ROUTE_MODE_CONFIG[mode];
            const seconds = typeof modeDurations?.[mode] === "number"
              ? modeDurations[mode]
              : null;
            return (
              <button
                key={mode}
                className="route-secondary__option"
                type="button"
                onClick={() => {
                  onModeSelect(mode);
                }}
                aria-label={`Switch to ${ROUTE_MODE_CONFIG[mode].label}`}
                disabled={isRideStarted || isSavingRide}
              >
                <UiIcon name={icon} className="icon icon--small" />
                <span>{seconds !== null ? formatDurationCompact(seconds) : "–"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatDistance(distanceMeters: number | null) {
  if (distanceMeters === null) return "0.0 km";
  return formatDistanceKilometers(distanceMeters);
}

function getStatsLine({
  hasRoute,
  isLoading,
  error,
  durationSeconds,
  distanceMeters,
  co2Kg,
}: {
  hasRoute: boolean;
  isLoading: boolean;
  error: string | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  co2Kg: number | null;
}) {
  if (error) return error;
  if (isLoading) return "Finding the best route…";
  if (hasRoute) {
    const duration = durationSeconds !== null ? formatDurationCompact(durationSeconds) : "–";
    const co2 = co2Kg !== null ? `${co2Kg} kg CO₂` : "0 kg CO₂";
    const dist = formatDistance(distanceMeters);
    return `${duration} • ${co2} • ${dist}`;
  }
  return "Tap the map to set your start & end";
}

function getBikeShareDetail(
  segments: RouteSegment[],
  bikeShare: BikeShareRouteDetails | null,
) {
  const walkToStation = segments.find((segment) => segment.kind === "walk-to-station");
  const bikeLeg = segments.find((segment) => segment.kind === "bike");
  const walkFromStation = segments.find((segment) => segment.kind === "walk-from-station");

  if (!walkToStation || !bikeLeg || !walkFromStation || !bikeShare) {
    return null;
  }

  return `Start: ${bikeShare.pickupStation.name} • Final: ${bikeShare.dropoffStation.name}`;
}
