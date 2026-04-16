import fs from "node:fs/promises";
import path from "node:path";

import type { RouteApiSuccess, RoutePathCoordinate, RoutePoint } from "@/lib/route-types";

type GraphNode = {
  id: string;
  longitude: number;
  latitude: number;
  neighbors: Map<string, number>;
};

type Graph = {
  nodes: Map<string, GraphNode>;
  nodeList: GraphNode[];
};

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type GeoJsonFeature = {
  geometry: GeoJsonLineString | GeoJsonMultiLineString | null;
};

type GeoJsonLineString = {
  type: "LineString";
  coordinates: RoutePathCoordinate[];
};

type GeoJsonMultiLineString = {
  type: "MultiLineString";
  coordinates: RoutePathCoordinate[][];
};

class MinPriorityQueue<T> {
  private readonly heap: Array<{ priority: number; value: T }> = [];

  push(value: T, priority: number) {
    this.heap.push({ value, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | null {
    if (this.heap.length === 0) {
      return null;
    }

    const top = this.heap[0];
    const end = this.heap.pop();

    if (end && this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }

    return top.value;
  }

  get size() {
    return this.heap.length;
  }

  private bubbleUp(index: number) {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);

      if (this.heap[parentIndex].priority <= this.heap[currentIndex].priority) {
        break;
      }

      [this.heap[parentIndex], this.heap[currentIndex]] = [
        this.heap[currentIndex],
        this.heap[parentIndex],
      ];

      currentIndex = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    let currentIndex = index;

    while (true) {
      const leftChildIndex = currentIndex * 2 + 1;
      const rightChildIndex = currentIndex * 2 + 2;
      let smallestIndex = currentIndex;

      if (
        leftChildIndex < this.heap.length &&
        this.heap[leftChildIndex].priority < this.heap[smallestIndex].priority
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.heap.length &&
        this.heap[rightChildIndex].priority < this.heap[smallestIndex].priority
      ) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex === currentIndex) {
        break;
      }

      [this.heap[currentIndex], this.heap[smallestIndex]] = [
        this.heap[smallestIndex],
        this.heap[currentIndex],
      ];

      currentIndex = smallestIndex;
    }
  }
}

let graphPromise: Promise<Graph> | null = null;

export async function solveCyclingRoute(
  start: RoutePoint,
  end: RoutePoint,
): Promise<RouteApiSuccess | null> {
  const defaultCyclingSpeedKph = 18;
  const graph = await getCyclingGraph();
  const snappedStart = findNearestNode(graph, start);
  const snappedEnd = findNearestNode(graph, end);
  const path = findShortestPath(graph, snappedStart.id, snappedEnd.id);

  if (!path) {
    return null;
  }

  return {
    start: {
      longitude: snappedStart.longitude,
      latitude: snappedStart.latitude,
    },
    end: {
      longitude: snappedEnd.longitude,
      latitude: snappedEnd.latitude,
    },
    distanceMeters: path.distanceMeters,
    durationSeconds: path.distanceMeters / ((defaultCyclingSpeedKph * 1_000) / 3_600),
    path: path.path,
  };
}

async function getCyclingGraph() {
  graphPromise ??= buildCyclingGraph();
  return graphPromise;
}

async function buildCyclingGraph(): Promise<Graph> {
  const shapeCollection = await loadCyclingNetwork();
  const nodes = new Map<string, GraphNode>();

  for (const feature of shapeCollection.features) {
    const segments = getFeatureSegments(feature.geometry);

    for (const segment of segments) {
      for (let index = 0; index < segment.length - 1; index += 1) {
        const current = segment[index];
        const next = segment[index + 1];
        const currentId = getNodeId(current);
        const nextId = getNodeId(next);

        if (currentId === nextId) {
          continue;
        }

        const currentNode = getOrCreateNode(nodes, currentId, current);
        const nextNode = getOrCreateNode(nodes, nextId, next);
        const weight = getDistanceMeters(current, next);

        addNeighbor(currentNode, nextNode.id, weight);
        addNeighbor(nextNode, currentNode.id, weight);
      }
    }
  }

  return {
    nodes,
    nodeList: [...nodes.values()],
  };
}

async function loadCyclingNetwork() {
  const geoJsonPath = path.join(process.cwd(), "public", "data", "BikeLanes.geojson");
  const geoJson = JSON.parse(await fs.readFile(geoJsonPath, "utf8")) as unknown;

  if (
    typeof geoJson !== "object" ||
    geoJson === null ||
    !("type" in geoJson) ||
    !("features" in geoJson) ||
    (geoJson as { type?: string }).type !== "FeatureCollection" ||
    !Array.isArray((geoJson as { features?: unknown[] }).features)
  ) {
    throw new Error("BikeLanes.geojson is not a valid GeoJSON FeatureCollection.");
  }

  return geoJson as GeoJsonFeatureCollection;
}

function getFeatureSegments(
  geometry: GeoJsonLineString | GeoJsonMultiLineString | null,
): RoutePathCoordinate[][] {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "LineString") {
    return [geometry.coordinates];
  }

  return geometry.coordinates;
}

function getOrCreateNode(
  nodes: Map<string, GraphNode>,
  id: string,
  coordinate: RoutePathCoordinate,
) {
  const existing = nodes.get(id);

  if (existing) {
    return existing;
  }

  const node: GraphNode = {
    id,
    longitude: coordinate[0],
    latitude: coordinate[1],
    neighbors: new Map<string, number>(),
  };

  nodes.set(id, node);

  return node;
}

function addNeighbor(node: GraphNode, neighborId: string, weight: number) {
  const existingWeight = node.neighbors.get(neighborId);

  if (existingWeight === undefined || weight < existingWeight) {
    node.neighbors.set(neighborId, weight);
  }
}

function findNearestNode(graph: Graph, point: RoutePoint) {
  let nearestNode = graph.nodeList[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const node of graph.nodeList) {
    const distance = getDistanceMeters(
      [point.longitude, point.latitude],
      [node.longitude, node.latitude],
    );

    if (distance < nearestDistance) {
      nearestNode = node;
      nearestDistance = distance;
    }
  }

  return nearestNode;
}

function findShortestPath(graph: Graph, startId: string, endId: string) {
  if (startId === endId) {
    const node = graph.nodes.get(startId);

    if (!node) {
      return null;
    }

    return {
      distanceMeters: 0,
      path: [[node.longitude, node.latitude]] as RoutePathCoordinate[],
    };
  }

  const startNode = graph.nodes.get(startId);
  const endNode = graph.nodes.get(endId);

  if (!startNode || !endNode) {
    return null;
  }

  const frontier = new MinPriorityQueue<string>();
  const visited = new Set<string>();
  const cameFrom = new Map<string, string>();
  const distanceFromStart = new Map<string, number>([[startId, 0]]);

  frontier.push(startId, 0);

  while (frontier.size > 0) {
    const currentId = frontier.pop();

    if (!currentId || visited.has(currentId)) {
      continue;
    }

    if (currentId === endId) {
      return {
        distanceMeters: distanceFromStart.get(endId) ?? 0,
        path: reconstructPath(graph, cameFrom, endId),
      };
    }

    visited.add(currentId);

    const currentNode = graph.nodes.get(currentId);

    if (!currentNode) {
      continue;
    }

    const currentDistance = distanceFromStart.get(currentId) ?? Number.POSITIVE_INFINITY;

    for (const [neighborId, weight] of currentNode.neighbors.entries()) {
      if (visited.has(neighborId)) {
        continue;
      }

      const tentativeDistance = currentDistance + weight;
      const knownDistance = distanceFromStart.get(neighborId) ?? Number.POSITIVE_INFINITY;

      if (tentativeDistance >= knownDistance) {
        continue;
      }

      cameFrom.set(neighborId, currentId);
      distanceFromStart.set(neighborId, tentativeDistance);

      const neighborNode = graph.nodes.get(neighborId);

      if (!neighborNode) {
        continue;
      }

      const priority =
        tentativeDistance +
        getDistanceMeters(
          [neighborNode.longitude, neighborNode.latitude],
          [endNode.longitude, endNode.latitude],
        );

      frontier.push(neighborId, priority);
    }
  }

  return null;
}

function reconstructPath(graph: Graph, cameFrom: Map<string, string>, endId: string) {
  const route: RoutePathCoordinate[] = [];
  let currentId: string | undefined = endId;

  while (currentId) {
    const node = graph.nodes.get(currentId);

    if (!node) {
      break;
    }

    route.push([node.longitude, node.latitude]);
    currentId = cameFrom.get(currentId);
  }

  return route.reverse();
}

function getNodeId([longitude, latitude]: RoutePathCoordinate) {
  return `${longitude.toFixed(6)}:${latitude.toFixed(6)}`;
}

function getDistanceMeters(
  [startLongitude, startLatitude]: RoutePathCoordinate,
  [endLongitude, endLatitude]: RoutePathCoordinate,
) {
  const earthRadiusMeters = 6_371_000;
  const deltaLatitude = toRadians(endLatitude - startLatitude);
  const deltaLongitude = toRadians(endLongitude - startLongitude);
  const startLatitudeRadians = toRadians(startLatitude);
  const endLatitudeRadians = toRadians(endLatitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitudeRadians) *
    Math.cos(endLatitudeRadians) *
    Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
