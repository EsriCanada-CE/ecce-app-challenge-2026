import { and, asc, desc, eq, sql } from "drizzle-orm";

import { rides, users } from "@/lib/db/schema";
import { withDatabase, withDatabaseWrite } from "@/lib/db/client";
import {
  ALL_ROUTE_MODES,
  getModeCalories,
  getModeCardioMinutes,
  getModeImpactCo2Kg,
  type RouteMode,
} from "@/lib/route-insights";
import type {
  CompletedRideSummary,
  LeaderboardEntry,
  LeaderboardPageData,
  RideCompletionInput,
  RideCompletionResult,
  SessionUser,
} from "@/lib/ride-persistence";
import { getDefaultGuestName } from "@/lib/session";

type UserRow = typeof users.$inferSelect;
type RideAggregateRow = {
  rideCount: number;
  totalDistanceMeters: number;
  totalCalories: number;
  totalCardioMinutes: number;
  totalCo2Kg: number;
};

const totalRideImpactCo2KgSql = sql<number>`
  coalesce(sum(round((${rides.distanceMeters} / 1000.0) * 0.17, 1)), 0)
`;

function normalizeName(name: string, sessionId: string) {
  const collapsed = name.trim().replace(/\s+/g, " ");
  return collapsed ? collapsed.slice(0, 32) : getDefaultGuestName(sessionId);
}

function sanitizeLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const collapsed = value.trim().replace(/\s+/g, " ");
  return collapsed ? collapsed.slice(0, 120) : null;
}

function assertValidMode(mode: string): asserts mode is RouteMode {
  if (!ALL_ROUTE_MODES.includes(mode as RouteMode)) {
    throw new Error("Unsupported route mode.");
  }
}

function assertFiniteNumber(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} is invalid.`);
  }
}

function getRideAggregate(storeUserId: string) {
  return withDatabase(({ db }) => {
    const row = db.select({
      rideCount: sql<number>`count(${rides.id})`,
      totalDistanceMeters: sql<number>`coalesce(sum(${rides.distanceMeters}), 0)`,
      totalCalories: sql<number>`coalesce(sum(${rides.calories}), 0)`,
      totalCardioMinutes: sql<number>`coalesce(sum(${rides.cardioMinutes}), 0)`,
      totalCo2Kg: totalRideImpactCo2KgSql,
    })
      .from(rides)
      .where(eq(rides.userId, storeUserId))
      .all()[0];

    return {
      rideCount: row?.rideCount ?? 0,
      totalDistanceMeters: row?.totalDistanceMeters ?? 0,
      totalCalories: row?.totalCalories ?? 0,
      totalCardioMinutes: row?.totalCardioMinutes ?? 0,
      totalCo2Kg: row?.totalCo2Kg ?? 0,
    } satisfies RideAggregateRow;
  });
}

function mapSessionUser(user: UserRow, totals: RideAggregateRow, rank: number | null): SessionUser {
  const defaultName = getDefaultGuestName(user.sessionId);

  return {
    id: user.id,
    sessionId: user.sessionId,
    name: user.name,
    defaultName,
    isDefaultName: user.name === defaultName,
    totalRides: totals.rideCount,
    totalDistanceMeters: totals.totalDistanceMeters,
    totalCalories: totals.totalCalories,
    totalCardioMinutes: totals.totalCardioMinutes,
    totalCo2Kg: totals.totalCo2Kg,
    rank,
  };
}

async function getUserBySessionId(sessionId: string) {
  return withDatabase(({ db }) => (
    db.select()
      .from(users)
      .where(eq(users.sessionId, sessionId))
      .all()[0] ?? null
  ));
}

async function ensureRawUser(sessionId: string) {
  const existingUser = await getUserBySessionId(sessionId);

  if (existingUser) {
    return existingUser;
  }

  return withDatabaseWrite(({ db }) => {
    const currentUser = db.select()
      .from(users)
      .where(eq(users.sessionId, sessionId))
      .all()[0];

    if (currentUser) {
      return currentUser;
    }

    const timestamp = Date.now();
    const newUser: typeof users.$inferInsert = {
      id: crypto.randomUUID(),
      sessionId,
      name: getDefaultGuestName(sessionId),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.insert(users).values(newUser).run();

    return newUser as UserRow;
  });
}

async function getLeaderboardEntries(currentUserId: string | null) {
  return withDatabase(({ db }) => {
    const rows = db.select({
      userId: users.id,
      name: users.name,
      rideCount: sql<number>`count(${rides.id})`,
      totalDistanceMeters: sql<number>`coalesce(sum(${rides.distanceMeters}), 0)`,
      totalCalories: sql<number>`coalesce(sum(${rides.calories}), 0)`,
      totalCardioMinutes: sql<number>`coalesce(sum(${rides.cardioMinutes}), 0)`,
      totalCo2Kg: totalRideImpactCo2KgSql,
      latestRideAt: sql<number | null>`max(${rides.createdAt})`,
    })
      .from(users)
      .innerJoin(rides, eq(rides.userId, users.id))
      .groupBy(users.id)
      .orderBy(
        desc(sql`coalesce(sum(${rides.distanceMeters}), 0)`),
        desc(sql`count(${rides.id})`),
        desc(sql`coalesce(sum(${rides.cardioMinutes}), 0)`),
        asc(users.createdAt),
      )
      .all();

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      name: row.name,
      rideCount: row.rideCount,
      totalDistanceMeters: row.totalDistanceMeters,
      totalCalories: row.totalCalories,
      totalCardioMinutes: row.totalCardioMinutes,
      totalCo2Kg: row.totalCo2Kg,
      latestRideAtIso: row.latestRideAt ? new Date(row.latestRideAt).toISOString() : null,
      isCurrentUser: row.userId === currentUserId,
    } satisfies LeaderboardEntry));
  });
}

async function getUserSummary(sessionId: string) {
  const user = await ensureRawUser(sessionId);
  const [totals, leaderboard] = await Promise.all([
    getRideAggregate(user.id),
    getLeaderboardEntries(user.id),
  ]);
  const rank = leaderboard.find((entry) => entry.userId === user.id)?.rank ?? null;

  return mapSessionUser(user, totals, rank);
}

export async function getCurrentUser(sessionId: string) {
  return getUserSummary(sessionId);
}

export async function updateUserName(sessionId: string, name: string) {
  const user = await ensureRawUser(sessionId);
  const nextName = normalizeName(name, sessionId);

  await withDatabaseWrite(({ db }) => {
    db.update(users)
      .set({
        name: nextName,
        updatedAt: Date.now(),
      })
      .where(and(eq(users.id, user.id), eq(users.sessionId, sessionId)))
      .run();
  });

  return getUserSummary(sessionId);
}

export async function completeRide(sessionId: string, input: RideCompletionInput): Promise<RideCompletionResult> {
  assertValidMode(input.mode);
  assertFiniteNumber(input.distanceMeters, "Ride distance");
  assertFiniteNumber(input.durationSeconds, "Ride duration");
  assertFiniteNumber(input.origin.latitude, "Origin latitude");
  assertFiniteNumber(input.origin.longitude, "Origin longitude");
  assertFiniteNumber(input.destination.latitude, "Destination latitude");
  assertFiniteNumber(input.destination.longitude, "Destination longitude");

  if (input.distanceMeters < 0 || input.durationSeconds < 0) {
    throw new Error("Ride stats must be positive.");
  }

  const user = await ensureRawUser(sessionId);
  const timestamp = Date.now();
  const calories = getModeCalories(input.mode, input.durationSeconds);
  const cardioMinutes = getModeCardioMinutes(input.mode, input.durationSeconds);
  const co2Kg = getModeImpactCo2Kg(input.mode, input.distanceMeters);
  const rideId = crypto.randomUUID();

  await withDatabaseWrite(({ db }) => {
    db.insert(rides).values({
      id: rideId,
      userId: user.id,
      mode: input.mode,
      originLabel: sanitizeLabel(input.originLabel),
      destinationLabel: sanitizeLabel(input.destinationLabel),
      originLat: input.origin.latitude,
      originLng: input.origin.longitude,
      destinationLat: input.destination.latitude,
      destinationLng: input.destination.longitude,
      distanceMeters: Math.round(input.distanceMeters),
      durationSeconds: Math.round(input.durationSeconds),
      calories,
      cardioMinutes,
      co2Kg,
      createdAt: timestamp,
    }).run();
  });

  return {
    ride: {
      id: rideId,
      mode: input.mode,
      distanceMeters: Math.round(input.distanceMeters),
      durationSeconds: Math.round(input.durationSeconds),
      calories,
      cardioMinutes,
      co2Kg,
      originLabel: sanitizeLabel(input.originLabel),
      destinationLabel: sanitizeLabel(input.destinationLabel),
      completedAtIso: new Date(timestamp).toISOString(),
    },
    user: await getUserSummary(sessionId),
  };
}

export async function getLeaderboardPageData(sessionId: string): Promise<LeaderboardPageData> {
  const currentUser = await getUserSummary(sessionId);
  const leaderboard = await getLeaderboardEntries(currentUser.id);

  return {
    currentUser,
    leaderboard,
  };
}
