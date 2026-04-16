import type { RoutingStrategy } from "@/lib/routing/contracts";
import type { TravelMode } from "@/lib/route-types";
import { CyclingRoutingStrategy } from "@/lib/routing/strategies/cycling-routing-strategy";
import { DrivingRoutingStrategy } from "@/lib/routing/strategies/driving-routing-strategy";
import { WalkingRoutingStrategy } from "@/lib/routing/strategies/walking-routing-strategy";

const routingStrategies: Record<TravelMode, RoutingStrategy> = {
  cycling: new CyclingRoutingStrategy(),
  walking: new WalkingRoutingStrategy(),
  driving: new DrivingRoutingStrategy(),
};

export function getRoutingStrategy(mode: TravelMode) {
  return routingStrategies[mode];
}

export function listRoutingStrategies() {
  return Object.values(routingStrategies);
}
