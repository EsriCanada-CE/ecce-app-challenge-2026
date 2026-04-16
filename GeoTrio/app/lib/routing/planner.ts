import type {
  ResolvedRoutePlanningRequest,
  RoutePlanningRequest,
} from "@/lib/routing/contracts";
import { getRoutingStrategy } from "@/lib/routing/registry";

export function normalizeTravelMode(mode?: RoutePlanningRequest["mode"]): ResolvedRoutePlanningRequest["mode"] {
  return mode ?? "driving";
}

export async function planRouteByMode(request: RoutePlanningRequest) {
  const resolvedRequest: ResolvedRoutePlanningRequest = {
    ...request,
    mode: normalizeTravelMode(request.mode),
  };
  const strategy = getRoutingStrategy(resolvedRequest.mode);

  return strategy.solve({
    request: resolvedRequest,
  });
}
