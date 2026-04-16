import type { RoutePoint } from "@/lib/route-types";
import type { RouteMode } from "@/lib/route-insights";

export type SessionUser = {
  id: string;
  sessionId: string;
  name: string;
  defaultName: string;
  isDefaultName: boolean;
  totalRides: number;
  totalDistanceMeters: number;
  totalCalories: number;
  totalCardioMinutes: number;
  totalCo2Kg: number;
  rank: number | null;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  rideCount: number;
  totalDistanceMeters: number;
  totalCalories: number;
  totalCardioMinutes: number;
  totalCo2Kg: number;
  latestRideAtIso: string | null;
  isCurrentUser: boolean;
};

export type RideCompletionInput = {
  mode: RouteMode;
  distanceMeters: number;
  durationSeconds: number;
  origin: RoutePoint;
  destination: RoutePoint;
  originLabel: string | null;
  destinationLabel: string | null;
};

export type CompletedRideSummary = {
  id: string;
  mode: RouteMode;
  distanceMeters: number;
  durationSeconds: number;
  calories: number;
  cardioMinutes: number;
  co2Kg: number;
  originLabel: string | null;
  destinationLabel: string | null;
  completedAtIso: string;
};

export type RideCompletionResult = {
  ride: CompletedRideSummary;
  user: SessionUser;
};

export type LeaderboardPageData = {
  currentUser: SessionUser;
  leaderboard: LeaderboardEntry[];
};
