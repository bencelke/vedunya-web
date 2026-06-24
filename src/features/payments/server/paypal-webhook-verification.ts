import "server-only";

import { paypalRequest } from "@/features/payments/server/paypal-client";
import { getPayPalConfig } from "@/features/payments/server/paypal-config";

type PayPalWebhookHeaders = {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
};

function readHeader(headers: Headers, name: string): string | null {
  const value = headers.get(name);
  return value && value.trim() ? value.trim() : null;
}

export function readPayPalWebhookHeaders(headers: Headers): PayPalWebhookHeaders | null {
  const authAlgo = readHeader(headers, "paypal-auth-algo");
  const certUrl = readHeader(headers, "paypal-cert-url");
  const transmissionId = readHeader(headers, "paypal-transmission-id");
  const transmissionSig = readHeader(headers, "paypal-transmission-sig");
  const transmissionTime = readHeader(headers, "paypal-transmission-time");

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return null;
  }

  return {
    authAlgo,
    certUrl,
    transmissionId,
    transmissionSig,
    transmissionTime,
  };
}

export async function verifyPayPalWebhookSignature(input: {
  headers: Headers;
  event: Record<string, unknown>;
}): Promise<boolean> {
  const config = getPayPalConfig();
  if (!config?.webhookId) {
    return false;
  }

  const webhookHeaders = readPayPalWebhookHeaders(input.headers);
  if (!webhookHeaders) {
    return false;
  }

  const response = await paypalRequest<{
    verification_status?: string;
  }>({
    path: "/v1/notifications/verify-webhook-signature",
    method: "POST",
    body: {
      auth_algo: webhookHeaders.authAlgo,
      cert_url: webhookHeaders.certUrl,
      transmission_id: webhookHeaders.transmissionId,
      transmission_sig: webhookHeaders.transmissionSig,
      transmission_time: webhookHeaders.transmissionTime,
      webhook_id: config.webhookId,
      webhook_event: input.event,
    },
  });

  return response.verification_status === "SUCCESS";
}
