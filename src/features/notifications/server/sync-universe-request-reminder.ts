import "server-only";

import { patchUniverseRequest } from "@/features/universe-request/server/universe-request-repository";
import type { ReminderSlotPreference } from "@/features/notifications/types/push";

export async function syncUniverseRequestReminderMirror(input: {
  uid: string;
  universeRequest: ReminderSlotPreference;
}): Promise<void> {
  try {
    await patchUniverseRequest({
      uid: input.uid,
      reminderEnabled: input.universeRequest.enabled,
      reminderTime: input.universeRequest.enabled ? input.universeRequest.time : null,
    });
  } catch {
    // Mirror sync is best-effort; notification preferences remain source of truth.
  }
}
