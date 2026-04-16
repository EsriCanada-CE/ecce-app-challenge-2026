"use client";

import type { RouteMode } from "@/lib/route-insights";
import type {
  BikeShareRouteDetails,
  RoutePathCoordinate,
  RoutePoint,
  RouteSegment,
} from "@/lib/route-types";

type MapLegendProps = {
  start: RoutePoint | null;
  end: RoutePoint | null;
  path: RoutePathCoordinate[];
  segments: RouteSegment[];
  bikeShare: BikeShareRouteDetails | null;
  selectedMode: RouteMode;
  isRideStarted: boolean;
};

type MapLegendItem = {
  id: string;
  label: string;
  swatch: "start" | "destination" | "walking" | "biking" | "driving" | "bike-station";
};

export default function MapLegend({
  start,
  end,
  path,
  segments,
  bikeShare,
  selectedMode,
  isRideStarted,
}: MapLegendProps) {
  const items = getLegendItems({
    start,
    end,
    path,
    segments,
    bikeShare,
    selectedMode,
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={`map-legend${isRideStarted ? " map-legend--with-nav" : ""}`}
      aria-label="Map legend"
    >
      <p className="map-legend__title">Legend</p>
      <div className="map-legend__items">
        {items.map((item) => (
          <div key={item.id} className="map-legend__item">
            <LegendSwatch type={item.swatch} />
            <span className="map-legend__label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LegendSwatch({ type }: { type: MapLegendItem["swatch"] }) {
  switch (type) {
    case "start":
      return (
        <span
          className="map-legend__marker map-legend__marker--start"
          aria-hidden={true}
        />
      );
    case "destination":
      return (
        <span className="map-legend__destination-pin" aria-hidden={true} />
      );
    case "walking":
      return <span className="map-legend__line map-legend__line--walking" aria-hidden={true} />;
    case "biking":
      return <span className="map-legend__line map-legend__line--biking" aria-hidden={true} />;
    case "driving":
      return <span className="map-legend__line map-legend__line--driving" aria-hidden={true} />;
    case "bike-station":
      return <span className="map-legend__station" aria-hidden={true} />;
  }
}

function getLegendItems({
  start,
  end,
  path,
  segments,
  bikeShare,
  selectedMode,
}: {
  start: RoutePoint | null;
  end: RoutePoint | null;
  path: RoutePathCoordinate[];
  segments: RouteSegment[];
  bikeShare: BikeShareRouteDetails | null;
  selectedMode: RouteMode;
}) {
  const items: MapLegendItem[] = [];
  const hasRoutePath = path.length >= 2 || segments.some((segment) => segment.path.length >= 2);

  if (start) {
    items.push({
      id: "start",
      label: "Start location",
      swatch: "start",
    });
  }

  if (end) {
    items.push({
      id: "destination",
      label: "Destination",
      swatch: "destination",
    });
  }

  if (!hasRoutePath) {
    return items;
  }

  if (selectedMode === "walk") {
    items.push({
      id: "walking-path",
      label: "Walking path",
      swatch: "walking",
    });
    return items;
  }

  if (selectedMode === "car") {
    items.push({
      id: "driving-path",
      label: "Driving path",
      swatch: "driving",
    });
    return items;
  }

  const hasWalkingSegments = segments.some((segment) => segment.mode === "walking");
  const hasCyclingPath = segments.length === 0 || segments.some((segment) => segment.mode === "cycling");

  if (hasWalkingSegments) {
    items.push({
      id: "walking-path",
      label: "Walking path",
      swatch: "walking",
    });
  }

  if (hasCyclingPath) {
    items.push({
      id: "biking-path",
      label: "Biking path",
      swatch: "biking",
    });
  }

  if (bikeShare) {
    items.push({
      id: "bike-station",
      label: "Bike station",
      swatch: "bike-station",
    });
  }

  return items;
}
