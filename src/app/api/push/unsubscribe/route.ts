import { NextRequest, NextResponse } from "next/server";

import {
  disablePushSubscription,
  mergeNotificationPreferences,
  readNotificationPreferences,
} from "@/features/notifications/repositories/push-repository";
import { pushUnsubscribeRequestSchema } from "@/features/notifications/schemas/push-schema";
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

  const parsed = pushUnsubscribeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid unsubscribe payload.", 400);
  }

  try {
    await disablePushSubscription({
      uid: auth.user.uid,
      endpoint: parsed.data.endpoint,
    });

    const existing = await readNotificationPreferences(auth.user.uid, "en");
    await mergeNotificationPreferences({
      uid: auth.user.uid,
      preferences: {
        ...existing,
        enabled: false,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to unsubscribe.", 503);
  }
}
