import { cookies } from "next/headers";
import { headers } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function getCurrentSessionId() {
  const cookieStore = await cookies();

  return (
    cookieStore.get(SESSION_COOKIE_NAME)?.value ??
    (await headers()).get("x-stride-session-id") ??
    null
  );
}

export async function requireCurrentSessionId() {
  const sessionId = await getCurrentSessionId();

  if (!sessionId) {
    throw new Error("Anonymous session is missing.");
  }

  return sessionId;
}
