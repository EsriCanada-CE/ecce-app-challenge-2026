"use server";

import { revalidatePath } from "next/cache";

import { completeRide, updateUserName } from "@/lib/db/queries";
import type { RideCompletionInput } from "@/lib/ride-persistence";
import { requireCurrentSessionId } from "@/lib/server-session";

export async function completeRideAction(input: RideCompletionInput) {
  const sessionId = await requireCurrentSessionId();
  const result = await completeRide(sessionId, input);

  revalidatePath("/");
  revalidatePath("/leaderboard");

  return result;
}

export async function updateCurrentUserNameAction(name: string) {
  const sessionId = await requireCurrentSessionId();
  const user = await updateUserName(sessionId, name);

  revalidatePath("/");
  revalidatePath("/leaderboard");

  return user;
}
