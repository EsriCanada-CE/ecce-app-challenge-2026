export const SESSION_COOKIE_NAME = "stride_session_id";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function createAnonymousSessionId() {
  return crypto.randomUUID();
}

export function getDefaultGuestName(sessionId: string) {
  return `Guest ${sessionId.slice(0, 4).toUpperCase()}`;
}
