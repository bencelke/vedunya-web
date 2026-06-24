import { NextRequest, NextResponse } from "next/server";

import { getNotificationCopy } from "@/features/notifications/content/notification-copy";
import { pushTestRequestSchema } from "@/features/notifications/schemas/push-schema";
import { isWebPushConfigured } from "@/features/notifications/server/web-push-config";
import { sendWebPushToEndpoint } from "@/features/notifications/server/send-web-push";
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

  const parsed = pushTestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Current device subscription is required.", 400);
  }

  const locale = parsed.data.locale === "ru" ? "ru" : "en";
  const copy = getNotificationCopy(locale, "test");

  try {
    const result = await sendWebPushToEndpoint({
      uid: auth.user.uid,
      endpoint: parsed.data.endpoint,
      payload: {
        title: copy.title,
        body: copy.body,
        url: `/${locale}/today`,
        tag: "mystic-test",
        lang: locale,
        reminderType: "test",
      },
    });

    if (result === "sent") {
      return NextResponse.json({ ok: true, status: "sent" });
    }

    if (result === "removed") {
      return jsonError("Subscription expired. Enable reminders again.", 410);
    }

    return jsonError("Unable to send test notification.", 502);
  } catch {
    return jsonError("Unable to send test notification.", 502);
  }
}
