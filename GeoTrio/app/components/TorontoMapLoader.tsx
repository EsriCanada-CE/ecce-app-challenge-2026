"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import LoadingGlobe from "@/components/LoadingGlobe";
import type {
  BikeShareRouteDetails,
  RoutePathCoordinate,
  RoutePoint,
  RouteSegment,
  TravelMode,
} from "@/lib/route-types";

type TorontoMapLoaderProps = {
  start: RoutePoint | null;
  end: RoutePoint | null;
  path: RoutePathCoordinate[];
  segments?: RouteSegment[];
  bikeShare?: BikeShareRouteDetails | null;
  mode?: TravelMode | null;
  isRideStarted: boolean;
  onMapPointSelect: (point: RoutePoint) => void;
  /** Rendered in a fixed layer on top of the map (e.g. nav); does not reserve layout space. */
  overlay?: ReactNode;
};

const TorontoMap = dynamic(() => import("@/components/TorontoMap"), {
  ssr: false,
  loading: () => <LoadingGlobe />,
});

export default function TorontoMapLoader({ overlay, ...mapProps }: TorontoMapLoaderProps) {
  return (
    <>
      <TorontoMap {...mapProps} />
      {overlay ? <div className="map-overlay">{overlay}</div> : null}
    </>
  );
}
