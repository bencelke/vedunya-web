import "server-only";

import {
  getShopifyAdminApiUrl,
  getShopifyConfig,
  type ShopifyConfig,
} from "@/features/shopify/server/shopify-config";

export class ShopifyAdminError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ShopifyAdminError";
    this.statusCode = statusCode;
  }
}

export async function shopifyAdminRequest<T>(input: {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  config?: ShopifyConfig;
}): Promise<T> {
  const config = input.config ?? getShopifyConfig();
  if (!config?.adminAccessToken) {
    throw new ShopifyAdminError("Shopify Admin API is not configured.", 503);
  }

  const response = await fetch(getShopifyAdminApiUrl(input.path, config), {
    method: input.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.adminAccessToken,
    },
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  });

  if (!response.ok) {
    throw new ShopifyAdminError("Shopify Admin request failed.", response.status);
  }

  return (await response.json()) as T;
}
