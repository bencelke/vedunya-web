import "server-only";

import {
  getShopifyConfig,
  getShopifyStorefrontApiUrl,
  type ShopifyConfig,
} from "@/features/shopify/server/shopify-config";

export class ShopifyStorefrontError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ShopifyStorefrontError";
    this.statusCode = statusCode;
  }
}

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export async function shopifyStorefrontRequest<T>(input: {
  query: string;
  variables?: Record<string, unknown>;
  config?: ShopifyConfig;
}): Promise<T> {
  const config = input.config ?? getShopifyConfig();
  if (!config) {
    throw new ShopifyStorefrontError("Shopify is not configured.", 503);
  }

  const response = await fetch(getShopifyStorefrontApiUrl(config), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
    },
    body: JSON.stringify({
      query: input.query,
      variables: input.variables ?? {},
    }),
  });

  const payload = (await response.json()) as GraphQlResponse<T>;

  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.[0]?.message ?? "Shopify Storefront request failed.";
    throw new ShopifyStorefrontError(message, response.status || 502);
  }

  if (!payload.data) {
    throw new ShopifyStorefrontError("Shopify Storefront returned no data.", 502);
  }

  return payload.data;
}

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createShopifyCheckoutCart(input: {
  variantGid: string;
  quantity?: number;
  attributes: Array<{ key: string; value: string }>;
}): Promise<{ cartId: string; checkoutUrl: string }> {
  const data = await shopifyStorefrontRequest<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: Array<{ message?: string }>;
    };
  }>({
    query: CART_CREATE_MUTATION,
    variables: {
      input: {
        lines: [
          {
            merchandiseId: input.variantGid,
            quantity: input.quantity ?? 1,
          },
        ],
        attributes: input.attributes,
      },
    },
  });

  const cart = data.cartCreate.cart;
  const userError = data.cartCreate.userErrors[0]?.message;

  if (!cart?.checkoutUrl || !cart.id) {
    throw new ShopifyStorefrontError(userError ?? "Unable to create Shopify cart.", 502);
  }

  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
  };
}
