import "server-only";

import { removePushSubscription } from "@/features/notifications/repositories/push-repository";

export function isExpiredPushSubscriptionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const statusCode = (error as { statusCode?: number }).statusCode;
  return statusCode === 404 || statusCode === 410;
}

export async function removeExpiredSubscription(input: {
  uid: string;
  endpoint: string;
}): Promise<void> {
  await removePushSubscription(input);
}
