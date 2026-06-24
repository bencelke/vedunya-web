import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getShopifyConfig } from "@/features/shopify/server/shopify-config";

export function verifyShopifyWebhookHmac(input: {
  rawBody: string;
  hmacHeader: string | null;
}): boolean {
  const secret = getShopifyConfig()?.webhookSecret;
  if (!secret || !input.hmacHeader) {
    return false;
  }

  const digest = createHmac("sha256", secret).update(input.rawBody, "utf8").digest("base64");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(input.hmacHeader));
  } catch {
    return false;
  }
}

export function readShopifyWebhookTopic(headers: Headers): string | null {
  const topic = headers.get("x-shopify-topic");
  return topic && topic.trim() ? topic.trim() : null;
}

export function readShopifyWebhookId(headers: Headers): string | null {
  const webhookId = headers.get("x-shopify-webhook-id");
  return webhookId && webhookId.trim() ? webhookId.trim() : null;
}
