import type { RoutingProfile } from "@/lib/routing/contracts";

export const routingProfiles: Record<RoutingProfile["mode"], RoutingProfile> = {
  cycling: {
    mode: "cycling",
    label: "Cycling",
    allowedLayers: ["roads"],
    preferredLayers: ["roads"],
    speedProfile: {
      defaultKph: 18,
      layerOverridesKph: {
        roads: 18,
      },
    },
    notes: "Cycling stays on the road graph, respects one-way direction, and uses a steady bike travel speed.",
  },
  walking: {
    mode: "walking",
    label: "Walking",
    allowedLayers: ["sidewalks"],
    preferredLayers: ["sidewalks"],
    speedProfile: {
      defaultKph: 5,
      layerOverridesKph: {
        sidewalks: 5,
      },
    },
    notes: "Walking stays on the sidewalk graph only and does not fall back to roads or trails.",
  },
  driving: {
    mode: "driving",
    label: "Driving",
    allowedLayers: ["roads"],
    preferredLayers: ["roads"],
    speedProfile: {
      defaultKph: 40,
      layerOverridesKph: {
        roads: 40,
      },
    },
    notes: "Driving will stay on the road graph and later use speed limit, direction, and turn logic.",
  },
};
