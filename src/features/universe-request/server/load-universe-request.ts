import "server-only";

import type { SupportedLocale } from "@/config/app-config";
import { readNotificationPreferences } from "@/features/notifications/repositories/push-repository";
import { readUniverseRequest } from "@/features/universe-request/server/universe-request-repository";
import type { UniverseRequestViewModel } from "@/features/universe-request/types";
import { pickReflectionPrompt } from "@/features/universe-request/utils/reflection-prompt";

export async function loadUniverseRequestViewModel(input: {
  uid: string;
  locale: SupportedLocale;
  dateKey: string;
}): Promise<UniverseRequestViewModel> {
  const [request, preferences] = await Promise.all([
    readUniverseRequest(input.uid),
    readNotificationPreferences(input.uid, input.locale),
  ]);

  const reminderStatus = request
    ? {
        globalRemindersEnabled: preferences.enabled,
        slotEnabled: preferences.universeRequest.enabled,
        time: preferences.universeRequest.time,
      }
    : null;

  return {
    request,
    reflectionPrompt: pickReflectionPrompt(input.dateKey, input.locale),
    dateKey: input.dateKey,
    reminderStatus,
  };
}
