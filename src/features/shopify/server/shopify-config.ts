import "server-only";

export type ShopifyConfig = {
  storeDomain: string;
  apiVersion: string;
  storefrontAccessToken: string;
  adminAccessToken: string | null;
  webhookSecret: string | null;
  currency: string;
  appUrl: string;
};

function readEnv(name: string): string | null {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeShopifyStoreDomain(domain: string): string {
  const trimmed = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return trimmed.includes(".") ? trimmed : `${trimmed}.myshopify.com`;
}

export function getShopifyConfig(): ShopifyConfig | null {
  const storeDomain = readEnv("SHOPIFY_STORE_DOMAIN");
  const storefrontAccessToken = readEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const apiVersion = readEnv("SHOPIFY_API_VERSION") ?? "2025-01";
  const appUrl = readEnv("NEXT_PUBLIC_APP_URL");

  if (!storeDomain || !storefrontAccessToken || !appUrl) {
    return null;
  }

  return {
    storeDomain: normalizeShopifyStoreDomain(storeDomain),
    apiVersion,
    storefrontAccessToken,
    adminAccessToken: readEnv("SHOPIFY_ADMIN_ACCESS_TOKEN"),
    webhookSecret: readEnv("SHOPIFY_WEBHOOK_SECRET"),
    currency: readEnv("SHOPIFY_CURRENCY") ?? "EUR",
    appUrl: appUrl.replace(/\/$/, ""),
  };
}

export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}

export function isShopifyCoursePurchaseConfigured(): boolean {
  if (!isShopifyConfigured()) {
    return false;
  }

  const variantId = process.env.SHOPIFY_LIVING_THE_RUNES_VARIANT_ID;
  return typeof variantId === "string" && variantId.trim().length > 0;
}

export function isShopifyWebhookConfigured(): boolean {
  const config = getShopifyConfig();
  return Boolean(config?.webhookSecret);
}

export function getShopifyStorefrontApiUrl(config: ShopifyConfig = getShopifyConfig()!): string {
  return `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`;
}

export function getShopifyAdminApiUrl(
  path: string,
  config: ShopifyConfig = getShopifyConfig()!,
): string {
  return `https://${config.storeDomain}/admin/api/${config.apiVersion}${path}`;
}
