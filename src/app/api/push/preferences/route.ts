import { NextRequest, NextResponse } from "next/server";

import { mergeNotificationPreferences } from "@/features/notifications/repositories/push-repository";
import { notificationPreferencesSchema } from "@/features/notifications/schemas/push-schema";
import { syncUniverseRequestReminderMirror } from "@/features/notifications/server/sync-universe-request-reminder";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid notification preferences.", 400);
  }

  try {
    const preferences = await mergeNotificationPreferences({
      uid: auth.user.uid,
      preferences: {
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      },
    });

    await syncUniverseRequestReminderMirror({
      uid: auth.user.uid,
      universeRequest: preferences.universeRequest,
    });

    return NextResponse.json({ ok: true, preferences });
  } catch {
    return jsonError("Unable to save preferences.", 503);
  }
}
