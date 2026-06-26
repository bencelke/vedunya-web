type GoogleAuthDebugPayload = Record<string, string | number | boolean | undefined>;

export function isGoogleAuthDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";
}

export function logGoogleAuth(
  event: string,
  payload?: GoogleAuthDebugPayload,
): void {
  if (!isGoogleAuthDebugEnabled()) {
    return;
  }

  if (payload && Object.keys(payload).length > 0) {
    console.info(`[google-auth] ${event}`, payload);
    return;
  }

  console.info(`[google-auth] ${event}`);
}
