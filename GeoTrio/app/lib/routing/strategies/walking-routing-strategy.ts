import type { RoutingSolveContext, RoutingStrategy } from "@/lib/routing/contracts";
import { routingProfiles } from "@/lib/routing/profiles";
import {
  getWalkingGraph,
  snapWalkingRouteToGraph,
  solveWalkingGraph,
} from "@/lib/routing/strategies/walking-routing-helpers";

export class WalkingRoutingStrategy implements RoutingStrategy {
  readonly mode = "walking";

  readonly profile = routingProfiles.walking;

  async buildGraph() {
    return getWalkingGraph(this.profile.speedProfile.defaultKph);
  }

  async solve(context: RoutingSolveContext) {
    const graph = context.graph ?? (await this.buildGraph());
    const snappedRoute = snapWalkingRouteToGraph(
      graph,
      context.request.start,
      context.request.end,
    );
    const route = solveWalkingGraph(
      snappedRoute.graph,
      snappedRoute.start.nodeId,
      snappedRoute.end.nodeId,
    );

    if (!route) {
      return null;
    }

    const connectorDistanceMeters =
      snappedRoute.start.candidate.distanceToClickMeters +
      snappedRoute.end.candidate.distanceToClickMeters;
    const connectorDurationSeconds =
      connectorDistanceMeters /
      ((this.profile.speedProfile.defaultKph * 1_000) / 3_600);

    return {
      start: context.request.start,
      end: context.request.end,
      distanceMeters: route.distanceMeters + connectorDistanceMeters,
      durationSeconds: route.durationSeconds + connectorDurationSeconds,
      path: buildWalkingPath(
        context.request.start,
        route.path,
        context.request.end,
      ),
    };
  }
}

function buildWalkingPath(
  start: RoutingSolveContext["request"]["start"],
  routePath: Array<[longitude: number, latitude: number]>,
  end: RoutingSolveContext["request"]["end"],
) {
  const path: Array<[longitude: number, latitude: number]> = [];

  pushCoordinate(path, [start.longitude, start.latitude]);

  for (const coordinate of routePath) {
    pushCoordinate(path, coordinate);
  }

  pushCoordinate(path, [end.longitude, end.latitude]);

  return path;
}

function pushCoordinate(
  path: Array<[longitude: number, latitude: number]>,
  coordinate: [longitude: number, latitude: number],
) {
  const previous = path.at(-1);

  if (
    previous &&
    previous[0] === coordinate[0] &&
    previous[1] === coordinate[1]
  ) {
    return;
  }

  path.push(coordinate);
}
