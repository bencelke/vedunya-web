import "server-only";

import type { PayPalEnvironment } from "@/features/payments/types/payment";

export type PayPalConfig = {
  env: PayPalEnvironment;
  clientId: string;
  clientSecret: string;
  webhookId: string | null;
  currency: string;
  monthlyPlanId: string | null;
  yearlyPlanId: string | null;
  publicClientId: string;
};

function readEnv(name: string): string | null {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getPayPalEnvironment(): PayPalEnvironment {
  const env = readEnv("PAYPAL_ENV")?.toLowerCase();
  return env === "live" ? "live" : "sandbox";
}

export function getPayPalApiBaseUrl(env: PayPalEnvironment = getPayPalEnvironment()): string {
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function getPayPalConfig(): PayPalConfig | null {
  const clientId = readEnv("PAYPAL_CLIENT_ID");
  const clientSecret = readEnv("PAYPAL_CLIENT_SECRET");
  const publicClientId =
    readEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID") ?? clientId ?? null;

  if (!clientId || !clientSecret || !publicClientId) {
    return null;
  }

  return {
    env: getPayPalEnvironment(),
    clientId,
    clientSecret,
    publicClientId,
    webhookId: readEnv("PAYPAL_WEBHOOK_ID"),
    currency: readEnv("PAYPAL_CURRENCY") ?? "EUR",
    monthlyPlanId: readEnv("PAYPAL_MYSTIC_PLUS_MONTHLY_PLAN_ID"),
    yearlyPlanId: readEnv("PAYPAL_MYSTIC_PLUS_YEARLY_PLAN_ID"),
  };
}

export function isPayPalConfigured(): boolean {
  return getPayPalConfig() !== null;
}

export function isPayPalWebhookConfigured(): boolean {
  const config = getPayPalConfig();
  return Boolean(config?.webhookId);
}

export function isMysticPlusPaymentConfigured(): boolean {
  const config = getPayPalConfig();
  return Boolean(config?.monthlyPlanId && config?.yearlyPlanId);
}

export function isCoursePurchaseConfigured(): boolean {
  return isPayPalConfigured();
}
