import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createAnonymousSessionId,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

export function proxy(request: NextRequest) {
  const existingSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (existingSessionId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-stride-session-id", existingSessionId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const sessionId = createAnonymousSessionId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-stride-session-id", sessionId);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|geojson)$).*)",
  ],
};
