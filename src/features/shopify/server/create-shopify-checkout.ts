import "server-only";

import { createShopifyCheckoutCart } from "@/features/shopify/server/shopify-storefront-client";
import { getShopifyCatalogProduct } from "@/features/shopify/server/shopify-products";
import { saveShopifyCheckoutRecord } from "@/features/shopify/server/shopify-checkout-repository";
import { getShopifyConfig } from "@/features/shopify/server/shopify-config";

export async function createShopifyCourseCheckout(input: {
  uid: string;
  productKey: string;
  locale: "en" | "ru";
}): Promise<{ checkoutUrl: string }> {
  const product = getShopifyCatalogProduct(input.productKey);
  if (!product || product.type !== "course") {
    throw new Error("invalid_product");
  }

  const config = getShopifyConfig();
  if (!config) {
    throw new Error("shopify_not_configured");
  }

  const returnPath = `/${input.locale}/courses/${product.slug}?checkout=pending`;
  const cart = await createShopifyCheckoutCart({
    variantGid: product.shopifyVariantId,
    attributes: [
      { key: "_vedunya_uid", value: input.uid },
      { key: "_vedunya_product_key", value: product.key },
      { key: "_vedunya_course_id", value: product.courseId },
      { key: "_app_source", value: "vedunya-web" },
      { key: "_return_path", value: returnPath },
    ],
  });

  const now = new Date().toISOString();
  await saveShopifyCheckoutRecord({
    uid: input.uid,
    productKey: product.key,
    productType: product.type,
    courseId: product.courseId,
    shopifyCartId: cart.cartId,
    shopifyCheckoutUrl: cart.checkoutUrl,
    status: "created",
    createdAt: now,
    updatedAt: now,
  });

  return { checkoutUrl: cart.checkoutUrl };
}
