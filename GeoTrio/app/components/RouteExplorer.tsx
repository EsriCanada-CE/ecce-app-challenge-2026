"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Cloud, CloudSun, Dumbbell, Heart, Lightbulb, LocateFixed, MapPin, Scale, Settings2 } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { completeRideAction } from "@/app/actions/rides";
import AddressLoadingBar from "@/components/AddressLoadingBar";
import AppNav from "@/components/AppNav";
import BottomRouteTray from "@/components/BottomRouteTray";
import MapLegend from "@/components/MapLegend";
import TorontoMapLoader from "@/components/TorontoMapLoader";
import UiIcon from "@/components/UiIcon";
import { getCompactAddressLabel } from "@/lib/address-label";
import {
  ALL_ROUTE_MODES,
  getRouteDashboardInsight,
  ROUTE_MODE_CONFIG,
  type RouteDurationOverrides,
  type RouteMode,
} from "@/lib/route-insights";
import {
  describeWeatherCode,
  formatTemperatureC,
  formatWeatherNote,
} from "@/lib/weather";
import {
  getDrivingPresetLabel,
  type DrivingTimePreset,
} from "@/lib/routing/strategies/driving-time";
import {
  getModeDepartureTimeIso,
  isModeRouteFresh,
  modeUsesTimePreset,
} from "@/lib/route-timing";
import type {
  ReverseGeocodeApiSuccess,
  WeatherApiError,
  WeatherApiSuccess,
  RouteApiError,
  RouteApiSuccess,
  PointValidationApiError,
  PointValidationApiSuccess,
  TravelMode,
  RouteSegment,
  BikeShareRouteDetails,
  RoutePathCoordinate,
  RoutePoint,
} from "@/lib/route-types";

type ModeRouteState = {
  path: RoutePathCoordinate[];
  segments: RouteSegment[];
  bikeShare: BikeShareRouteDetails | null;
  distanceMeters: number;
  durationSeconds: number;
  timePreset?: DrivingTimePreset;
};

type RouteSelectionState = {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  routes: Partial<Record<RouteMode, ModeRouteState>>;
  loadingMode: RouteMode | null;
  isLoading: boolean;
  error: string | null;
};

const initialRouteState: RouteSelectionState = {
  origin: null,
  destination: null,
  routes: {},
  loadingMode: null,
  isLoading: false,
  error: null,
};

type AddressState = {
  origin: string | null;
  destination: string | null;
};

type WeatherState = {
  data: WeatherApiSuccess | null;
  isLoading: boolean;
  error: string | null;
};

const ADDRESS_LOOKUP_FAILED_LABEL = "Address unavailable";
const WEATHER_LOOKUP_FAILED_LABEL = "Current weather could not be loaded.";
const DEFAULT_WEATHER_POINT: RoutePoint = {
  longitude: -79.3832,
  latitude: 43.65,
};
const initialWeatherState: WeatherState = {
  data: null,
  isLoading: false,
  error: null,
};
const DRIVING_TIME_OPTIONS: DrivingTimePreset[] = ["auto", "morningRush", "eveningRush"];

export default function RouteExplorer() {
  const [routeState, setRouteState] = useState<RouteSelectionState>(initialRouteState);
  const [selectedMode, setSelectedMode] = useState<RouteMode>("bike");
  const [drivingTimePreset, setDrivingTimePreset] = useState<DrivingTimePreset>("auto");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRideDashboardOpen, setIsRideDashboardOpen] = useState(false);
  const [addresses, setAddresses] = useState<AddressState>({
    origin: null,
    destination: null,
  });
  const [addressLoading, setAddressLoading] = useState({
    origin: false,
    destination: false,
  });
  const [weatherState, setWeatherState] = useState<WeatherState>(initialWeatherState);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isValidatingPoint, setIsValidatingPoint] = useState(false);
  const [isCompletingRide, startRideCompletion] = useTransition();
  const routeStateRef = useRef(routeState);
  const pointValidationRequestIdRef = useRef(0);
  const routeToastIdRef = useRef<string | null>(null);
  const routeRequestAbortRef = useRef<AbortController | null>(null);
  const backgroundRouteAbortRefs = useRef<Partial<Record<RouteMode, AbortController>>>({});
  const weatherAbortRef = useRef<AbortController | null>(null);
  const addressCacheRef = useRef(new Map<string, string>());
  const addressAbortControllersRef = useRef<{
    origin: AbortController | null;
    destination: AbortController | null;
  }>({
    origin: null,
    destination: null,
  });

  useEffect(() => {
    routeStateRef.current = routeState;
  }, [routeState]);

  useEffect(() => {
    if (routeState.isLoading && routeState.loadingMode) {
      routeToastIdRef.current = toast.loading("Calculating route", {
        id: "route-calculation",
      });
      return;
    }

    if (routeToastIdRef.current) {
      toast.dismiss(routeToastIdRef.current);
      routeToastIdRef.current = null;
    }
  }, [routeState.isLoading, routeState.loadingMode]);

  useEffect(() => {
    const routeRequestAbortControllerRef = routeRequestAbortRef;
    const backgroundRouteAbortControllerRefs = backgroundRouteAbortRefs;
    const addressAbortControllerRef = addressAbortControllersRef;

    return () => {
      if (routeToastIdRef.current) {
        toast.dismiss(routeToastIdRef.current);
        routeToastIdRef.current = null;
      }
      routeRequestAbortControllerRef.current?.abort();
      for (const mode of ALL_ROUTE_MODES) {
        backgroundRouteAbortControllerRefs.current[mode]?.abort();
      }
      weatherAbortRef.current?.abort();
      addressAbortControllerRef.current.origin?.abort();
      addressAbortControllerRef.current.destination?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  const resolveAddress = useEffectEvent(async (
    point: RoutePoint,
    kind: keyof AddressState,
  ) => {
    const pointKey = getPointKey(point);
    const cachedAddress = addressCacheRef.current.get(pointKey);

    if (cachedAddress) {
      setAddressLoading((current) => ({
        ...current,
        [kind]: false,
      }));
      setAddresses((current) => ({
        ...current,
        [kind]: cachedAddress,
      }));
      return;
    }

    addressAbortControllersRef.current[kind]?.abort();

    const abortController = new AbortController();
    addressAbortControllersRef.current[kind] = abortController;

    setAddressLoading((current) => ({
      ...current,
      [kind]: true,
    }));
    setAddresses((current) => ({
      ...current,
      [kind]: null,
    }));

    try {
      const response = await fetch(
        `/api/reverse-geocode?lat=${point.latitude}&lon=${point.longitude}`,
        { signal: abortController.signal },
      );

      if (!response.ok) {
        throw new Error("Reverse geocode request failed.");
      }

      const payload = (await response.json()) as ReverseGeocodeApiSuccess;
      const address = getCompactAddressLabel(payload.address.trim());

      addressCacheRef.current.set(pointKey, address);

      setAddressLoading((current) => ({
        ...current,
        [kind]: false,
      }));
      setAddresses((current) => ({
        ...current,
        [kind]: address,
      }));
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      console.error(`Failed to resolve the ${kind} address.`, error);

      setAddressLoading((current) => ({
        ...current,
        [kind]: false,
      }));
      setAddresses((current) => ({
        ...current,
        [kind]: ADDRESS_LOOKUP_FAILED_LABEL,
      }));
    }
  });

  const startNewRoute = (point: RoutePoint) => {
    routeRequestAbortRef.current?.abort();
    routeRequestAbortRef.current = null;
    for (const mode of ALL_ROUTE_MODES) {
      backgroundRouteAbortRefs.current[mode]?.abort();
      delete backgroundRouteAbortRefs.current[mode];
    }
    setIsRideDashboardOpen(false);
    setRouteState({
      origin: point,
      destination: null,
      routes: {},
      loadingMode: null,
      isLoading: false,
      error: null,
    });
  };

  const fetchRouteData = async (
    origin: RoutePoint,
    destination: RoutePoint,
    mode: RouteMode,
    preset: DrivingTimePreset,
    signal?: AbortSignal,
  ) => {
    const departureTimeIso = getModeDepartureTimeIso(mode, preset);

    const response = await fetch("/api/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: toTravelMode(mode),
        start: origin,
        end: destination,
        departureTimeIso,
        ...(mode === "car" && weatherState.data ? { weather: weatherState.data } : {}),
      }),
      signal,
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as RouteApiError | null;

      throw new Error(errorPayload?.error ?? getRouteFailureMessage(mode));
    }

    return (await response.json()) as RouteApiSuccess;
  };

  const prefetchAlternateRoutes = async (
    origin: RoutePoint,
    destination: RoutePoint,
    primaryMode: RouteMode,
    preset: DrivingTimePreset,
  ) => {
    const originKey = getPointKey(origin);
    const destinationKey = getPointKey(destination);

    for (const mode of ALL_ROUTE_MODES) {
      if (mode === primaryMode || backgroundRouteAbortRefs.current[mode]) {
        continue;
      }

      const cachedRoute = routeStateRef.current.routes[mode];
      const hasFreshRoute = isModeRouteFresh(mode, cachedRoute, preset);

      if (hasFreshRoute) {
        continue;
      }

      const abortController = new AbortController();
      backgroundRouteAbortRefs.current[mode] = abortController;

      try {
        const routePayload = await fetchRouteData(
          origin,
          destination,
          mode,
          preset,
          abortController.signal,
        );

        setRouteState((currentState) => {
          const currentOriginKey = currentState.origin ? getPointKey(currentState.origin) : null;
          const currentDestinationKey = currentState.destination
            ? getPointKey(currentState.destination)
            : null;

          if (
            currentOriginKey !== originKey ||
            currentDestinationKey !== destinationKey
          ) {
            return currentState;
          }

          return {
            ...currentState,
            routes: {
              ...currentState.routes,
              [mode]: {
                path: routePayload.path,
                segments: routePayload.segments ?? [],
                bikeShare: routePayload.bikeShare ?? null,
                distanceMeters: routePayload.distanceMeters,
                durationSeconds: routePayload.durationSeconds,
                timePreset: modeUsesTimePreset(mode) ? preset : undefined,
              },
            },
          };
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error(`Failed to prefetch the ${mode} route.`, error);
        }
      } finally {
        if (backgroundRouteAbortRefs.current[mode] === abortController) {
          delete backgroundRouteAbortRefs.current[mode];
        }
      }
    }
  };

  const requestRoute = async (
    origin: RoutePoint,
    destination: RoutePoint,
    mode: RouteMode,
    preset = drivingTimePreset,
  ) => {
    routeRequestAbortRef.current?.abort();
    backgroundRouteAbortRefs.current[mode]?.abort();
    delete backgroundRouteAbortRefs.current[mode];

    const abortController = new AbortController();
    routeRequestAbortRef.current = abortController;
    setIsRideDashboardOpen(false);

    setRouteState((currentState) => ({
      ...currentState,
      destination,
      loadingMode: mode,
      isLoading: true,
      error: null,
    }));

    try {
      const routePayload = await fetchRouteData(
        origin,
        destination,
        mode,
        preset,
        abortController.signal,
      );

      setRouteState((currentState) => ({
        origin,
        destination,
        routes: {
          ...currentState.routes,
          [mode]: {
            path: routePayload.path,
            segments: routePayload.segments ?? [],
            bikeShare: routePayload.bikeShare ?? null,
            distanceMeters: routePayload.distanceMeters,
            durationSeconds: routePayload.durationSeconds,
            timePreset: modeUsesTimePreset(mode) ? preset : undefined,
          },
        },
        loadingMode: null,
        isLoading: false,
        error: null,
      }));

      void prefetchAlternateRoutes(origin, destination, mode, preset);
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      setRouteState((currentState) => ({
        ...currentState,
        destination,
        loadingMode: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Route lookup failed.",
      }));
    }
  };

  const validateSelectablePoint = async (point: RoutePoint) => {
    const response = await fetch("/api/validate-point", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ point }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as PointValidationApiError | null;

      throw new Error(payload?.error ?? "That location can't be used right now.");
    }

    const payload = (await response.json()) as PointValidationApiSuccess;

    return payload.point;
  };

  const selectPoint = async (point: RoutePoint) => {
    const requestId = pointValidationRequestIdRef.current + 1;
    pointValidationRequestIdRef.current = requestId;
    setIsValidatingPoint(true);
    setRouteState((currentState) => ({
      ...currentState,
      error: null,
    }));

    try {
      const validatedPoint = await validateSelectablePoint(point);

      if (pointValidationRequestIdRef.current !== requestId) {
        return;
      }

      const currentState = routeStateRef.current;

      if (!currentState.origin || currentState.isLoading || currentState.destination) {
        startNewRoute(validatedPoint);
        return;
      }

      void requestRoute(currentState.origin, validatedPoint, selectedMode);
    } catch (error) {
      if (pointValidationRequestIdRef.current !== requestId) {
        return;
      }

      const message = error instanceof Error
        ? error.message
        : "That location can't be used right now.";

      toast.error(message, {
        id: "point-validation-error",
      });

      setRouteState((currentState) => ({
        ...currentState,
        isLoading: false,
        loadingMode: null,
        error: message,
      }));
    } finally {
      if (pointValidationRequestIdRef.current === requestId) {
        setIsValidatingPoint(false);
      }
    }
  };

  const handleMapPointSelect = (point: RoutePoint) => {
    if (isRideDashboardOpen) {
      return;
    }

    if (isLocatingUser || isValidatingPoint) {
      return;
    }

    void selectPoint(point);
  };

  const displayOrigin = routeState.origin;
  const displayDestination = routeState.destination;
  const activeRoute = routeState.routes[selectedMode] ?? null;
  const displayOriginKey = displayOrigin ? getPointKey(displayOrigin) : null;
  const displayDestinationKey = displayDestination ? getPointKey(displayDestination) : null;
  const hasRouteReady =
    activeRoute !== null &&
    routeState.destination !== null &&
    !routeState.isLoading &&
    !routeState.error;
  const showTripOverlay = isRideDashboardOpen;
  const weatherPoint = DEFAULT_WEATHER_POINT;
  const weatherPointKey = getPointKey(weatherPoint);
  const weatherLocationLabel = "Toronto";
  const durationOverrides: RouteDurationOverrides = {
    bike: routeState.routes.bike?.durationSeconds ?? null,
    walk: routeState.routes.walk?.durationSeconds ?? null,
    car: routeState.routes.car?.durationSeconds ?? null,
  };
  const dashboardInsight = hasRouteReady && activeRoute
    ? getRouteDashboardInsight({
      mode: selectedMode,
      distanceMeters: activeRoute.distanceMeters,
      drivingDurationSeconds: routeState.routes.car?.durationSeconds ?? null,
      durationOverrides,
    })
    : null;

  const navTransition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    if (!displayOrigin) {
      addressAbortControllersRef.current.origin?.abort();
      setAddressLoading((current) => ({
        ...current,
        origin: false,
      }));
      setAddresses((current) => ({
        ...current,
        origin: null,
      }));
      return;
    }

    void resolveAddress(displayOrigin, "origin");
  }, [displayOrigin, displayOriginKey]);

  useEffect(() => {
    if (!displayDestination) {
      addressAbortControllersRef.current.destination?.abort();
      setAddressLoading((current) => ({
        ...current,
        destination: false,
      }));
      setAddresses((current) => ({
        ...current,
        destination: null,
      }));
      return;
    }

    void resolveAddress(displayDestination, "destination");
  }, [displayDestination, displayDestinationKey]);

  useEffect(() => {
    weatherAbortRef.current?.abort();

    const abortController = new AbortController();
    weatherAbortRef.current = abortController;

    setWeatherState((current) => ({
      data: current.data,
      isLoading: true,
      error: null,
    }));

    void (async () => {
      try {
        const response = await fetch(
          `/api/weather?lat=${weatherPoint.latitude}&lon=${weatherPoint.longitude}`,
          { signal: abortController.signal },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as WeatherApiError | null;
          throw new Error(payload?.error ?? WEATHER_LOOKUP_FAILED_LABEL);
        }

        const payload = (await response.json()) as WeatherApiSuccess;

        setWeatherState({
          data: payload,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.error("Failed to load weather for the route dashboard.", error);

        setWeatherState((current) => ({
          data: current.data,
          isLoading: false,
          error: error instanceof Error ? error.message : WEATHER_LOOKUP_FAILED_LABEL,
        }));
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [weatherPoint, weatherPointKey]);

  const handleRideStart = () => {
    if (
      !hasRouteReady ||
      !displayOrigin ||
      !displayDestination ||
      !activeRoute
    ) {
      return;
    }

    setIsSettingsOpen(false);
    setIsRideDashboardOpen(true);
  };

  const handleTrackRide = () => {
    if (
      !hasRouteReady ||
      !displayOrigin ||
      !displayDestination ||
      !activeRoute
    ) {
      return;
    }

    startRideCompletion(async () => {
      toast.loading("Saving ride", { id: "ride-save" });

      try {
        await completeRideAction({
          mode: selectedMode,
          distanceMeters: activeRoute.distanceMeters,
          durationSeconds: activeRoute.durationSeconds,
          origin: displayOrigin,
          destination: displayDestination,
          originLabel: addresses.origin,
          destinationLabel: addresses.destination,
        });

        if (selectedMode !== "car") {
          launchRideCelebration();
        }
        setIsRideDashboardOpen(false);
        toast.success("Ride tracked!", { id: "ride-save" });
      } catch (error) {
        console.error("Failed to save the completed ride.", error);
        toast.error("The ride could not be saved.", { id: "ride-save" });
      }
    });
  };

  const handleRideExit = () => {
    setIsRideDashboardOpen(false);
  };

  const handleResetSelection = () => {
    pointValidationRequestIdRef.current += 1;
    routeRequestAbortRef.current?.abort();
    routeRequestAbortRef.current = null;
    for (const mode of ALL_ROUTE_MODES) {
      backgroundRouteAbortRefs.current[mode]?.abort();
      delete backgroundRouteAbortRefs.current[mode];
    }
    addressAbortControllersRef.current.origin?.abort();
    addressAbortControllersRef.current.destination?.abort();
    setIsSettingsOpen(false);
    setIsRideDashboardOpen(false);
    setIsValidatingPoint(false);
    setAddressLoading({
      origin: false,
      destination: false,
    });
    setAddresses({
      origin: null,
      destination: null,
    });
    setRouteState(initialRouteState);
  };

  const handleDrivingTimePresetSelect = (preset: DrivingTimePreset) => {
    setDrivingTimePreset(preset);
    setIsSettingsOpen(false);
    if (routeState.origin && routeState.destination) {
      void requestRoute(routeState.origin, routeState.destination, selectedMode, preset);
    }
  };

  const handleModeSelect = (mode: RouteMode) => {
    setSelectedMode(mode);

    if (!routeState.origin || !routeState.destination) {
      return;
    }

    const cachedRoute = routeStateRef.current.routes[mode];
    const needsRefresh = !isModeRouteFresh(mode, cachedRoute, drivingTimePreset);

    if (needsRefresh) {
      void requestRoute(routeState.origin, routeState.destination, mode);
      return;
    }

    setRouteState((currentState) => ({
      ...currentState,
      loadingMode: null,
      isLoading: false,
      error: null,
    }));
  };

  useEffect(() => {
    if (!showTripOverlay) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsRideDashboardOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTripOverlay]);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  const promptStep: "start" | "destination" | null =
    showTripOverlay || routeState.isLoading
      ? null
      : !routeState.origin
        ? "start"
        : !routeState.destination
          ? "destination"
          : null;

  const handleUseMyLocation = () => {
    if (
      promptStep !== "start" ||
      showTripOverlay ||
      isLocatingUser ||
      isValidatingPoint
    ) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setRouteState((currentState) => ({
        ...currentState,
        error: "Your browser can't access your current location.",
      }));
      return;
    }

    setIsLocatingUser(true);
    setRouteState((currentState) => ({
      ...currentState,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);

        if (routeStateRef.current.origin) {
          return;
        }

        void selectPoint({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
      },
      (error) => {
        setIsLocatingUser(false);
        setRouteState((currentState) => ({
          ...currentState,
          error: getGeolocationErrorMessage(error),
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    );
  };

  const mapOverlay = (
    <>
      <AnimatePresence>
        {promptStep ? (
          <div key={`map-prompt-wrap-${promptStep}`} className="map-prompt-anchor">
            <motion.div
              className="map-prompt"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="map-prompt__icon">
                <MapPin size={20} strokeWidth={2.5} />
              </span>
              <span className="map-prompt__text">
                {promptStep === "start"
                  ? "Tap the map to place your starting point"
                  : "Now tap the map to set your destination"}
              </span>
              {promptStep === "start" ? (
                <button
                  type="button"
                  className="map-prompt__action"
                  onClick={handleUseMyLocation}
                  disabled={isLocatingUser || isValidatingPoint}
                >
                  <LocateFixed size={14} strokeWidth={2.4} />
                  <span>
                    {isLocatingUser
                      ? "Locating..."
                      : isValidatingPoint
                        ? "Checking..."
                        : "Use My Location"}
                  </span>
                </button>
              ) : null}
              <span className="map-prompt__step">
                {promptStep === "start" ? "1 of 2" : "2 of 2"}
              </span>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {showTripOverlay ? (
          <motion.div
            key="route-map-tint"
            className="map-overlay-tint"
            aria-hidden={true}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={navTransition}
          />
        ) : null}
      </AnimatePresence>
      <div className={`map-top-group${showTripOverlay ? " map-top-group--with-nav" : ""}`}>
        <div
          className="map-weather"
          role="status"
          aria-live="polite"
        >
          <div className="map-weather__row">
            <span className="map-weather__icon">
              <CloudSun size={20} strokeWidth={2.5} />
            </span>
            <div className="map-weather__body">
              <p className="map-weather__eyebrow">{weatherLocationLabel}</p>
              <div className="map-weather__headline">
                <span className="map-weather__temperature">
                  {weatherState.data ? formatTemperatureC(weatherState.data.temperatureC) : "—"}
                </span>
                <span className="map-weather__condition">
                  {weatherState.data
                    ? describeWeatherCode(weatherState.data.weatherCode, weatherState.data.isDay)
                    : "Current weather"}
                </span>
              </div>
              <p className="map-weather__meta">
                {weatherState.isLoading && !weatherState.data
                  ? "Checking current conditions…"
                  : weatherState.error
                    ? weatherState.error
                    : weatherState.data
                      ? formatWeatherNote(weatherState.data)
                      : "Current conditions unavailable."}
              </p>
            </div>
          </div>
        </div>
        <div className="map-stride-mark" aria-hidden={true}>
          <img
            src="/stride.png"
            alt=""
            className="map-stride-mark__image"
          />
        </div>
        <MapLegend
          start={displayOrigin}
          end={displayDestination}
          path={activeRoute?.path ?? []}
          segments={activeRoute?.segments ?? []}
          bikeShare={activeRoute?.bikeShare ?? null}
          selectedMode={selectedMode}
          isRideStarted={showTripOverlay}
        />
      </div>
      <AnimatePresence>
        {showTripOverlay ? (
          <motion.div
            key="route-top-nav"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={navTransition}
          >
            <AppNav onBack={() => handleRideExit()} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {showTripOverlay && dashboardInsight ? (
          <motion.aside
            key="route-dashboard"
            className="route-dashboard"
            aria-label="Route details"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={navTransition}
          >
            <div className="route-dashboard__inner">
              <div className="route-dashboard__header">
                <div>
                  <p className="route-dashboard__eyebrow">Ride complete</p>
                  <h1 className="route-dashboard__title">
                    {displayDestination
                      ? (addressLoading.destination
                        ? (
                          <AddressLoadingBar
                            className="address-loading-bar--title"
                            label="Loading destination address"
                          />
                        )
                        : (addresses.destination ?? "Destination"))
                      : "Destination"}
                  </h1>
                  <p className="route-dashboard__subtitle">{dashboardInsight.subtitle}</p>
                </div>
                <div className="route-dashboard__icon-badge">
                  <UiIcon
                    name={ROUTE_MODE_CONFIG[selectedMode].icon}
                    className="icon route-dashboard__mode-icon"
                  />
                </div>
              </div>

              <div className="route-dashboard__grid">
                <div className="route-dashboard__card">
                  <Cloud size={30} className="text-primary" strokeWidth={2.5} />
                  <div>
                    <span className="route-dashboard__card-value">{dashboardInsight.co2Value}</span>
                    <span className="route-dashboard__card-label">{dashboardInsight.co2Label}</span>
                  </div>
                </div>
                <div className="route-dashboard__card">
                  <Dumbbell size={30} className="text-secondary" strokeWidth={2.5} />
                  <div>
                    <span className="route-dashboard__card-value">{dashboardInsight.caloriesValue}</span>
                    <span className="route-dashboard__card-label">kcal Burned</span>
                  </div>
                </div>
                <div className="route-dashboard__card route-dashboard__card--wide">
                  <div className="route-dashboard__card-row">
                    <Heart size={30} className="text-tertiary" strokeWidth={2.5} />
                    <div>
                      <span className="route-dashboard__card-value route-dashboard__card-value--medium">
                        {dashboardInsight.cardioValue}
                      </span>
                      <span className="route-dashboard__card-label">Cardio Exercise</span>
                    </div>
                  </div>
                  <p className="route-dashboard__card-note">
                    {dashboardInsight.cardioNote}
                  </p>
                </div>
              </div>

              <div className="route-dashboard__tips">
                <h3 className="route-dashboard__tips-title">
                  <Lightbulb size={24} className="text-primary" strokeWidth={2.5} />
                  Route Impact
                </h3>
                <div className="route-dashboard__tips-list">
                  {dashboardInsight.tips.map((tip, index) => (
                    <div
                      key={tip.text}
                      className={`route-dashboard__tip route-dashboard__tip--${tip.tone}`}
                    >
                      {index === 0 ? (
                        <Clock3 size={20} strokeWidth={2.5} className="text-primary route-dashboard__tip-icon" />
                      ) : (
                        <Scale size={20} strokeWidth={2.5} className="text-secondary route-dashboard__tip-icon" />
                      )}
                      <p>{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {routeState.isLoading ? <p className="route-dashboard__status">Loading route…</p> : null}
              {routeState.error ? <p className="route-dashboard__error">{routeState.error}</p> : null}

              <div className="route-dashboard__actions">
                <button
                  className="route-dashboard__button"
                  type="button"
                  onClick={handleTrackRide}
                  disabled={isCompletingRide}
                >
                  <MapPin size={24} strokeWidth={2.5} />
                  {isCompletingRide ? "Saving..." : "Track Ride"}
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {!showTripOverlay ? (
          <>
            {isSettingsOpen ? (
              <motion.button
                key="route-settings-backdrop"
                type="button"
                className="route-settings-backdrop"
                aria-label="Close driving settings"
                onClick={() => setIsSettingsOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={navTransition}
              />
            ) : null}
            <div className="route-settings-anchor">
              <motion.button
                key="route-settings-button"
                type="button"
                className={`route-settings-button${isSettingsOpen ? " route-settings-button--active" : ""}`}
                onClick={() => setIsSettingsOpen((current) => !current)}
                aria-haspopup="dialog"
                aria-expanded={isSettingsOpen}
                aria-controls="route-settings-overlay"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={navTransition}
              >
                <span className="route-settings-button__icon">
                  <Settings2 size={18} strokeWidth={2.3} />
                </span>
                <span className="route-settings-button__body">
                  <span className="route-settings-button__label">Time of Day</span>
                  <span className="route-settings-button__value">
                    {getDrivingPresetLabel(drivingTimePreset)}
                  </span>
                </span>
              </motion.button>
            </div>
            <AnimatePresence>
              {isSettingsOpen ? (
                <div className="route-settings-modal">
                  <motion.aside
                    id="route-settings-overlay"
                    key="route-settings-overlay"
                    className="route-settings-overlay"
                    role="dialog"
                    aria-modal={true}
                    aria-label="Driving settings"
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={navTransition}
                  >
                    <div className="route-settings-overlay__header">
                      <p className="route-settings-overlay__eyebrow">Driving conditions</p>
                      <h2 className="route-settings-overlay__title">Traffic timing</h2>
                      <p className="route-settings-overlay__copy">
                        Default to current Toronto time, or preview a Wednesday rush-hour snapshot.
                      </p>
                    </div>
                    <div className="route-settings-options" role="radiogroup" aria-label="Traffic timing">
                      {DRIVING_TIME_OPTIONS.map((option) => {
                        const isSelected = drivingTimePreset === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`route-settings-option${isSelected ? " route-settings-option--selected" : ""}`}
                            onClick={() => handleDrivingTimePresetSelect(option)}
                          >
                            <span className="route-settings-option__text">
                              <span className="route-settings-option__title">
                                {getDrivingPresetLabel(option)}
                              </span>
                              <span className="route-settings-option__meta">
                                {option === "auto"
                                  ? "Uses the live Toronto-local time by default."
                                  : option === "morningRush"
                                    ? "Pins routing to Wednesday at 8:30 AM."
                                    : "Pins routing to Wednesday at 5:30 PM."}
                              </span>
                            </span>
                            <span className="route-settings-option__indicator" aria-hidden={true} />
                          </button>
                        );
                      })}
                    </div>
                  </motion.aside>
                </div>
              ) : null}
            </AnimatePresence>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );

  return (
    <main className="explorer-shell">
      <TorontoMapLoader
        start={displayOrigin}
        end={displayDestination}
        path={activeRoute?.path ?? []}
        segments={activeRoute?.segments ?? []}
        bikeShare={activeRoute?.bikeShare ?? null}
        mode={activeRoute ? toTravelMode(selectedMode) : null}
        isRideStarted={showTripOverlay}
        onMapPointSelect={handleMapPointSelect}
        overlay={mapOverlay}
      />
      <AnimatePresence>
        {!showTripOverlay ? (
          <div className="tray-anchor">
            <motion.div
              key="route-tray"
              className="tray-motion-shell"
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "110%", opacity: 0 }}
              transition={navTransition}
            >
              <BottomRouteTray
                startLabel={addresses.origin}
                endLabel={addresses.destination}
                isStartLabelLoading={addressLoading.origin}
                isEndLabelLoading={addressLoading.destination}
                distanceMeters={activeRoute?.distanceMeters ?? null}
                drivingDurationSeconds={routeState.routes.car?.durationSeconds ?? null}
                modeDurations={{
                  bike: routeState.routes.bike?.durationSeconds ?? null,
                  walk: routeState.routes.walk?.durationSeconds ?? null,
                  car: routeState.routes.car?.durationSeconds ?? null,
                }}
                durationOverrides={durationOverrides}
                segments={activeRoute?.segments ?? []}
                bikeShare={activeRoute?.bikeShare ?? null}
                isLoading={routeState.isLoading}
                error={routeState.error}
                selectedMode={selectedMode}
                isRideStarted={showTripOverlay}
                isSavingRide={isCompletingRide}
                activePromptStep={promptStep}
                canReset={
                  routeState.origin !== null ||
                  routeState.destination !== null ||
                  routeState.isLoading ||
                  routeState.error !== null ||
                  isValidatingPoint
                }
                onModeSelect={handleModeSelect}
                onReset={handleResetSelection}
                onStart={handleRideStart}
              />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function getPointKey(point: RoutePoint) {
  return `${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`;
}

function toTravelMode(mode: RouteMode): TravelMode {
  switch (mode) {
    case "bike":
      return "cycling";
    case "walk":
      return "walking";
    case "car":
      return "driving";
  }
}

function getRouteFailureMessage(mode: RouteMode) {
  switch (mode) {
    case "bike":
      return "No cycling path could be found.";
    case "walk":
      return "No walking path could be found.";
    case "car":
      return "No driving path could be found.";
  }
}

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location couldn't be determined.";
    case error.TIMEOUT:
      return "Finding your current location timed out.";
    default:
      return "Your current location couldn't be used.";
  }
}

function launchRideCelebration() {
  const end = Date.now() + 1_500;
  const origins = [
    { x: 0.1, y: 0.2 },
    { x: 0.25, y: 0.1 },
    { x: 0.5, y: 0.08 },
    { x: 0.75, y: 0.1 },
    { x: 0.9, y: 0.2 },
    { x: 0.2, y: 0.35 },
    { x: 0.5, y: 0.3 },
    { x: 0.8, y: 0.35 },
  ];

  const burst = () => {
    origins.forEach((origin, index) => {
      confetti({
        particleCount: index < 5 ? 30 : 18,
        spread: 95,
        startVelocity: 42,
        scalar: 1.05,
        ticks: 220,
        gravity: 0.95,
        origin,
        colors: ["#176a21", "#49bb61", "#9df197", "#005f99", "#facc15"],
      });
    });
  };

  burst();

  const interval = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(interval);
      return;
    }

    burst();
  }, 300);
}
