import { NextRequest, NextResponse } from "next/server";

import { isPayPalWebhookConfigured } from "@/features/payments/server/paypal-config";
import { verifyPayPalWebhookSignature } from "@/features/payments/server/paypal-webhook-verification";
import { processPayPalWebhookEvent } from "@/features/payments/server/process-paypal-webhook";
import { jsonError } from "@/lib/auth/request-guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isPayPalWebhookConfigured()) {
    return jsonError("Webhook is not configured.", 503);
  }

  const rawBody = await request.text();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid webhook payload.", 400);
  }

  const verified = await verifyPayPalWebhookSignature({
    headers: request.headers,
    event,
  });

  if (!verified) {
    return jsonError("Invalid PayPal signature.", 401);
  }

  try {
    const result = await processPayPalWebhookEvent(event);
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      eventType: result.eventType,
    });
  } catch {
    return jsonError("Unable to process webhook.", 500);
  }
}
