import type { RoutingSolveContext, RoutingStrategy } from "@/lib/routing/contracts";
import { routingProfiles } from "@/lib/routing/profiles";
import {
  getCyclingGraph,
  snapCyclingRouteToGraph,
  solveCyclingGraph,
} from "@/lib/routing/strategies/cycling-routing-helpers";
import { getCyclingTimeOfDayMultiplier } from "@/lib/routing/strategies/cycling-time";
import { solveBikeShareRoute } from "@/lib/routing/strategies/bike-share-routing";

export class CyclingRoutingStrategy implements RoutingStrategy {
  readonly mode = "cycling";

  readonly profile = routingProfiles.cycling;

  async buildGraph() {
    return getCyclingGraph(this.profile.speedProfile.defaultKph);
  }

  async solve(context: RoutingSolveContext) {
    const timeOfDayMultiplier = getCyclingTimeOfDayMultiplier(
      context.request.departureTimeIso,
    );
    const bikeShareRoute = await solveBikeShareRoute({
      start: context.request.start,
      end: context.request.end,
      departureTimeIso: context.request.departureTimeIso,
    });

    if (bikeShareRoute) {
      return bikeShareRoute;
    }

    const graph = context.graph ?? (await this.buildGraph());
    const snappedRoute = snapCyclingRouteToGraph(
      graph,
      context.request.start,
      context.request.end,
    );
    const route = solveCyclingGraph(
      snappedRoute.graph,
      snappedRoute.start.nodeId,
      snappedRoute.end.nodeId,
    );

    if (!route) {
      return null;
    }

    return {
      start: snappedRoute.start.point,
      end: snappedRoute.end.point,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds * timeOfDayMultiplier,
      path: route.path,
    };
  }
}
