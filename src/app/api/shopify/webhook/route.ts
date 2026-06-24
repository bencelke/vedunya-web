import { NextRequest, NextResponse } from "next/server";

import { isShopifyWebhookConfigured } from "@/features/shopify/server/shopify-config";
import { processShopifyWebhook } from "@/features/shopify/server/process-shopify-webhook";
import {
  readShopifyWebhookId,
  readShopifyWebhookTopic,
  verifyShopifyWebhookHmac,
} from "@/features/shopify/server/shopify-webhook-verification";
import { jsonError } from "@/lib/auth/request-guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  if (!isShopifyWebhookConfigured()) {
    return jsonError("Webhook is not configured.", 503);
  }

  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  const verified = verifyShopifyWebhookHmac({
    rawBody,
    hmacHeader,
  });

  if (!verified) {
    return jsonError("Invalid Shopify signature.", 401);
  }

  const topic = readShopifyWebhookTopic(request.headers);
  const eventId = readShopifyWebhookId(request.headers);

  if (!topic || !eventId) {
    return jsonError("Invalid webhook headers.", 400);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid webhook payload.", 400);
  }

  try {
    const result = await processShopifyWebhook({
      topic,
      eventId,
      payload,
    });

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      topic: result.topic,
    });
  } catch {
    return jsonError("Unable to process webhook.", 500);
  }
}
