import { NextRequest, NextResponse } from "next/server";

import {
  mergePushSubscription,
} from "@/features/notifications/repositories/push-repository";
import { pushSubscribeRequestSchema } from "@/features/notifications/schemas/push-schema";
import { isWebPushConfigured } from "@/features/notifications/server/web-push-config";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (!isWebPushConfigured()) {
    return jsonError("Web Push is not configured on this server.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = pushSubscribeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid subscription payload.", 400);
  }

  try {
    const subscription = await mergePushSubscription({
      uid: auth.user.uid,
      endpoint: parsed.data.endpoint,
      keys: parsed.data.keys,
      userAgent: parsed.data.userAgent,
      platform: parsed.data.platform,
      locale: parsed.data.locale,
      timezone: parsed.data.timezone,
    });

    return NextResponse.json({
      ok: true,
      subscription: {
        endpoint: subscription.endpoint,
        enabled: subscription.enabled,
        platform: subscription.platform,
        locale: subscription.locale,
        timezone: subscription.timezone,
      },
    });
  } catch {
    return jsonError("Unable to save push subscription.", 503);
  }
}
