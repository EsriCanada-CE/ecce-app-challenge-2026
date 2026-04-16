import type { RoutingSolveContext, RoutingStrategy } from "@/lib/routing/contracts";
import { routingProfiles } from "@/lib/routing/profiles";
import { getDrivingCostFactors } from "@/lib/routing/strategies/driving-conditions";
import {
  getDrivingGraph,
  snapDrivingRouteToGraph,
  solveDrivingGraph,
} from "@/lib/routing/strategies/driving-routing-helpers";

export class DrivingRoutingStrategy implements RoutingStrategy {
  readonly mode = "driving";

  readonly profile = routingProfiles.driving;

  async buildGraph() {
    return getDrivingGraph(this.profile.speedProfile.defaultKph);
  }

  async solve(context: RoutingSolveContext) {
    const graph = context.graph ?? (await this.buildGraph());
    const drivingCostFactors = getDrivingCostFactors(
      context.request.departureTimeIso,
      context.request.weather,
    );
    const snappedRoute = snapDrivingRouteToGraph(
      graph,
      context.request.start,
      context.request.end,
    );
    const route = solveDrivingGraph(
      snappedRoute.graph,
      snappedRoute.start.nodeId,
      snappedRoute.end.nodeId,
      drivingCostFactors,
    );

    if (!route) {
      return null;
    }

    return {
      start: snappedRoute.start.point,
      end: snappedRoute.end.point,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      path: route.path,
    };
  }
}
