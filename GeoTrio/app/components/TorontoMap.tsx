"use client";

import Basemap from "@arcgis/core/Basemap.js";
import Extent from "@arcgis/core/geometry/Extent.js";
import Graphic from "@arcgis/core/Graphic.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer.js";
import Map from "@arcgis/core/Map.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import MapView from "@arcgis/core/views/MapView.js";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import LoadingGlobe from "@/components/LoadingGlobe";
import { getRouteLineColor, getRouteLineWidth, ROUTE_MAP_COLORS } from "@/lib/route-map-visuals";
import type {
  BikeShareRouteDetails,
  RoutePathCoordinate,
  RoutePoint,
  RouteSegment,
  TravelMode,
} from "@/lib/route-types";

type TorontoMapProps = {
  start: RoutePoint | null;
  end: RoutePoint | null;
  path: RoutePathCoordinate[];
  segments?: RouteSegment[];
  bikeShare?: BikeShareRouteDetails | null;
  mode?: TravelMode | null;
  isRideStarted: boolean;
  onMapPointSelect: (point: RoutePoint) => void;
};

const ARCGIS_LOAD_ERROR_MESSAGE =
  "Failed to load the CARTO basemap in the ArcGIS SDK view.";
const MAP_ARIA_LABEL = "Map of Toronto using a CARTO basemap in ArcGIS";
const INITIAL_CENTER: [number, number] = [-79.3832, 43.65];
const INITIAL_ZOOM = 14;
const MIN_ZOOM = 13;
const MAX_ROUTE_FOCUS_ZOOM = 17;
const ROUTE_DASHBOARD_OCCLUSION_RATIO = 0.7;
const DOWNTOWN_LAYER_URL = "/data/Downtown.geojson";
const CARTO_SUBDOMAINS = ["a", "b", "c", "d"];
const CARTO_VOYAGER_TILE_URL =
  "https://{subDomain}.basemaps.cartocdn.com/rastertiles/voyager/{level}/{col}/{row}@2x.png";
const CARTO_COPYRIGHT =
  "© OpenStreetMap contributors © CARTO";

export default function TorontoMap({
  start,
  end,
  path,
  segments = [],
  bikeShare = null,
  mode = null,
  isRideStarted,
  onMapPointSelect,
}: TorontoMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<MapView | null>(null);
  const routeLayerRef = useRef<GraphicsLayer | null>(null);
  const downtownLayerRef = useRef<GeoJSONLayer | null>(null);
  const isRideStartedRef = useRef(isRideStarted);
  const startRef = useRef(start);
  const endRef = useRef(end);
  const pathRef = useRef(path);
  const segmentsRef = useRef(segments);
  const bikeShareRef = useRef(bikeShare);
  const modeRef = useRef(mode);
  const onMapPointSelectEvent = useEffectEvent(onMapPointSelect);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    isRideStartedRef.current = isRideStarted;
  }, [isRideStarted]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    endRef.current = end;
  }, [end]);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    bikeShareRef.current = bikeShare;
  }, [bikeShare]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!mapElementRef.current) {
      return;
    }

    let isActive = true;
    let resizeListener: (() => void) | null = null;
    let clickHandle: { remove: () => void } | null = null;

    const map = new Map({
      basemap: createCartoBasemap(),
    });

    const view = new MapView({
      container: mapElementRef.current,
      map,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      constraints: {
        minZoom: MIN_ZOOM,
        rotationEnabled: false,
      },
      popupEnabled: false,
      ui: {
        components: [],
      },
    });

    viewRef.current = view;

    const syncViewPadding = () => {
      if (typeof window === "undefined") {
        return;
      }

      view.padding = getViewPadding({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        isRideStarted: isRideStartedRef.current,
      });
    };

    const initializeMap = async () => {
      try {
        await view.when();

        if (!isActive) {
          return;
        }

        const downtownLayer = new GeoJSONLayer({
          url: new URL(DOWNTOWN_LAYER_URL, window.location.origin).toString(),
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-line",
              color: [8, 145, 178, 0.95],
              width: 2,
            },
          },
          listMode: "hide",
          opacity: 1,
        });

        const routeLayer = new GraphicsLayer({
          listMode: "hide",
        });

        map.addMany([downtownLayer, routeLayer]);

        downtownLayerRef.current = downtownLayer;
        routeLayerRef.current = routeLayer;

        syncRouteOverlay(
          routeLayer,
          pathRef.current,
          segmentsRef.current,
          bikeShareRef.current,
          startRef.current,
          endRef.current,
          modeRef.current,
        );
        syncViewPadding();

        clickHandle = view.on("click", (event) => {
          if (!event.mapPoint) {
            return;
          }

          const longitude = event.mapPoint.longitude;
          const latitude = event.mapPoint.latitude;

          if (longitude == null || latitude == null) {
            return;
          }

          onMapPointSelectEvent({ longitude, latitude });
        });

        resizeListener = () => {
          syncViewPadding();
        };

        window.addEventListener("resize", resizeListener);
        setMapError(null);
        setIsMapReady(true);
      } catch (error) {
        console.error("Failed to load the ArcGIS basemap.", error);

        if (!isActive) {
          return;
        }

        setMapError(ARCGIS_LOAD_ERROR_MESSAGE);
        setIsMapReady(true);
      }
    };

    void initializeMap();

    return () => {
      isActive = false;
      clickHandle?.remove();

      if (resizeListener) {
        window.removeEventListener("resize", resizeListener);
      }

      const routeLayer = routeLayerRef.current;
      const downtownLayer = downtownLayerRef.current;

      routeLayer?.removeAll();

      if (view.map) {
        if (routeLayer) {
          view.map.remove(routeLayer);
        }

        if (downtownLayer) {
          view.map.remove(downtownLayer);
        }
      }

      routeLayerRef.current = null;
      downtownLayerRef.current = null;
      viewRef.current = null;
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const routeLayer = routeLayerRef.current;

    if (!routeLayer) {
      return;
    }

    syncRouteOverlay(routeLayer, path, segments, bikeShare, start, end, mode);
  }, [bikeShare, end, mode, path, segments, start]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view || typeof window === "undefined") {
      return;
    }

    view.padding = getViewPadding({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      isRideStarted,
    });

    if (!isRideStarted) {
      return;
    }

    const extent = createRouteFocusExtent({ start, end, path });

    if (!extent) {
      return;
    }

    void view.goTo(extent, {
      animate: true,
      duration: 900,
    }).then(() => {
      if (view.zoom > MAX_ROUTE_FOCUS_ZOOM) {
        view.zoom = MAX_ROUTE_FOCUS_ZOOM;
      }
    }).catch((error: unknown) => {
      if (isViewNavigationInterrupted(error)) {
        return;
      }

      console.error("Failed to focus the route on the ArcGIS map.", error);
    });
  }, [end, isRideStarted, path, start]);

  return (
    <section className="map-panel">
      {!isMapReady ? <LoadingGlobe className="loading-globe--overlay" /> : null}
      {mapError ? (
        <div className="map-panel__notice" role="status" aria-live="polite">
          <p className="map-panel__notice-eyebrow">Basemap Unavailable</p>
          <p className="map-panel__notice-copy">{mapError}</p>
        </div>
      ) : null}
      <div
        ref={mapElementRef}
        className="toronto-map"
        aria-label={MAP_ARIA_LABEL}
      />
    </section>
  );
}

function syncRouteOverlay(
  routeLayer: GraphicsLayer,
  path: RoutePathCoordinate[],
  segments: RouteSegment[],
  bikeShare: BikeShareRouteDetails | null,
  start: RoutePoint | null,
  end: RoutePoint | null,
  mode: TravelMode | null,
) {
  routeLayer.removeAll();

  const graphics: Graphic[] = [];

  if (segments.length > 0) {
    for (const segment of segments) {
      if (segment.path.length < 2) {
        continue;
      }

      graphics.push(new Graphic({
        geometry: new Polyline({
          paths: [segment.path],
          spatialReference: { wkid: 4326 },
        }),
        symbol: getSegmentLineSymbol(segment, mode),
      }));
    }
  } else if (path.length >= 2) {
    graphics.push(new Graphic({
      geometry: new Polyline({
        paths: [path],
        spatialReference: { wkid: 4326 },
      }),
      symbol: getSegmentLineSymbol(null, mode),
    }));
  }

  if (start) {
    graphics.push(createMarkerGraphic(start, "start"));
  }

  if (end) {
    graphics.push(createMarkerGraphic(end, "finish"));
  }

  if (bikeShare) {
    graphics.push(createBikeStationGraphic(bikeShare.pickupStation.point, "pickup"));
    graphics.push(createBikeStationGraphic(bikeShare.dropoffStation.point, "dropoff"));
  }

  if (graphics.length > 0) {
    routeLayer.addMany(graphics);
  }
}

function getSegmentLineSymbol(segment: RouteSegment | null, fallbackMode: TravelMode | null) {
  const visualMode = segment?.mode ?? fallbackMode ?? "cycling";

  return {
    type: "simple-line" as const,
    color: getRouteLineColor(visualMode),
    width: getRouteLineWidth(visualMode),
    cap: "round" as const,
    join: "round" as const,
  };
}

function createMarkerGraphic(point: RoutePoint, kind: "start" | "finish") {
  return new Graphic({
    geometry: {
      type: "point",
      longitude: point.longitude,
      latitude: point.latitude,
    },
    symbol: kind === "start"
      ? {
          type: "simple-marker",
          style: "circle",
          size: 16,
          color: ROUTE_MAP_COLORS.start,
          outline: {
            color: ROUTE_MAP_COLORS.markerOutline,
            width: 3,
          },
        }
      : {
          type: "picture-marker",
          url: FINISH_MARKER_URL,
          width: 28,
          height: 36,
          yoffset: 18,
        },
  });
}

function createBikeStationGraphic(point: RoutePoint, kind: "pickup" | "dropoff") {
  return new Graphic({
    geometry: {
      type: "point",
      longitude: point.longitude,
      latitude: point.latitude,
    },
    symbol: {
      type: "simple-marker",
      style: "diamond",
      size: 10,
      color: ROUTE_MAP_COLORS.bikeStationPickup,
      outline: {
        color: ROUTE_MAP_COLORS.markerOutline,
        width: 2,
      },
    },
  });
}

function createCartoBasemap() {
  return new Basemap({
    id: "carto-voyager-retina",
    title: "CARTO Voyager",
    baseLayers: [
      new WebTileLayer({
        urlTemplate: CARTO_VOYAGER_TILE_URL,
        subDomains: CARTO_SUBDOMAINS,
        copyright: CARTO_COPYRIGHT,
      }),
    ],
  });
}

const FINISH_MARKER_URL = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
    <path fill="#ef4444" d="M24 3C13.5 3 5 11.5 5 22c0 13.8 12 25 17.2 29.2a3 3 0 0 0 3.6 0C31 47 43 35.8 43 22 43 11.5 34.5 3 24 3Z"/>
    <path fill="#dc2626" d="M24 7c-8.4 0-15 6.6-15 15 0 10.7 9.2 20.1 15 24.9 5.8-4.8 15-14.2 15-24.9 0-8.4-6.6-15-15-15Z"/>
    <circle cx="24" cy="22" r="8.5" fill="#7f1d1d" opacity="0.14"/>
    <circle cx="24" cy="22" r="7" fill="#ffffff"/>
  </svg>
`);

function createSvgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function getViewPadding({
  viewportWidth,
  viewportHeight,
  isRideStarted,
}: {
  viewportWidth: number;
  viewportHeight: number;
  isRideStarted: boolean;
}) {
  if (isRideStarted) {
    const sidebarWidth = getRouteDashboardWidth(viewportWidth);
    const occludedWidth = Math.round(sidebarWidth * ROUTE_DASHBOARD_OCCLUSION_RATIO);

    return {
      top: 72,
      right: occludedWidth + 20,
      bottom: 28,
      left: 28,
    };
  }

  const compactTray = viewportWidth >= 760;
  const bottomPadding = compactTray
    ? Math.min(Math.max(viewportHeight * 0.14, 88), 164)
    : Math.min(Math.max(viewportHeight * 0.22, 148), 260);

  return {
    top: 0,
    right: 0,
    bottom: Math.round(bottomPadding),
    left: 0,
  };
}

function getRouteDashboardWidth(viewportWidth: number) {
  return Math.max(
    Math.min(448, viewportWidth * 0.42),
    352,
  );
}

function createRouteFocusExtent({
  start,
  end,
  path,
}: {
  start: RoutePoint | null;
  end: RoutePoint | null;
  path: RoutePathCoordinate[];
}) {
  const coordinates: RoutePathCoordinate[] = [];

  if (start) {
    coordinates.push([start.longitude, start.latitude]);
  }

  if (end) {
    coordinates.push([end.longitude, end.latitude]);
  }

  coordinates.push(...path);

  if (coordinates.length === 0) {
    return null;
  }

  let xmin = coordinates[0][0];
  let xmax = coordinates[0][0];
  let ymin = coordinates[0][1];
  let ymax = coordinates[0][1];

  for (const [longitude, latitude] of coordinates) {
    xmin = Math.min(xmin, longitude);
    xmax = Math.max(xmax, longitude);
    ymin = Math.min(ymin, latitude);
    ymax = Math.max(ymax, latitude);
  }

  const longitudeSpan = Math.max(xmax - xmin, 0.01);
  const latitudeSpan = Math.max(ymax - ymin, 0.008);

  return new Extent({
    xmin: xmin - longitudeSpan * 0.35,
    ymin: ymin - latitudeSpan * 0.4,
    xmax: xmax + longitudeSpan * 0.35,
    ymax: ymax + latitudeSpan * 0.4,
    spatialReference: { wkid: 4326 },
  });
}

function isViewNavigationInterrupted(error: unknown) {
  return error instanceof Error && (
    error.name === "AbortError" ||
    error.message.toLowerCase().includes("interrupted")
  );
}
