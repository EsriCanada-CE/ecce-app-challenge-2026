import type { RoutingLayerKey, RoutingLayerSource } from "@/lib/routing/contracts";

export const routingLayerSources: Record<RoutingLayerKey, RoutingLayerSource> = {
  roads: {
    key: "roads",
    label: "Road network",
    path: "/data/Road.geojson",
    format: "geojson",
    availability: "available",
    notes: "Primary road edge dataset with junction IDs, direction, length, and speed limit.",
  },
  trails: {
    key: "trails",
    label: "Trail network",
    path: null,
    format: null,
    availability: "planned",
    notes: "Reserved for off-road multi-use paths and trail segments.",
  },
  cycling: {
    key: "cycling",
    label: "Cycling network",
    path: "/data/BikeLanes.geojson",
    format: "geojson",
    availability: "available",
    notes: "Reserved for bike-specific facilities and bike-preferred route weighting.",
  },
  sidewalks: {
    key: "sidewalks",
    label: "Sidewalk network",
    path: "/data/Sidewalk.geojson",
    format: "geojson",
    availability: "available",
    notes: "Pedestrian sidewalk and walkway dataset used for sidewalk-only walking routes.",
  },
};
