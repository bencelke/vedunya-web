import "server-only";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_SLUG,
} from "@/features/courses/constants/course-ids";
import { getShopifyConfig } from "@/features/shopify/server/shopify-config";
import type { ShopifyProductKey, ShopifyProductType } from "@/features/shopify/types";

export type ShopifyCatalogProduct = {
  key: ShopifyProductKey;
  type: ShopifyProductType;
  courseId: string;
  slug: string;
  title: string;
  shopifyVariantId: string;
  currency: string;
};

function readVariantId(): string | null {
  const value = process.env.SHOPIFY_LIVING_THE_RUNES_VARIANT_ID;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function toShopifyVariantGid(variantId: string): string {
  if (variantId.startsWith("gid://shopify/ProductVariant/")) {
    return variantId;
  }
  return `gid://shopify/ProductVariant/${variantId}`;
}

export function getShopifyCatalogProduct(
  productKey: string,
): ShopifyCatalogProduct | null {
  if (productKey !== "livingTheRunes") {
    return null;
  }

  const variantId = readVariantId();
  const config = getShopifyConfig();
  if (!variantId || !config) {
    return null;
  }

  return {
    key: "livingTheRunes",
    type: "course",
    courseId: LIVING_THE_RUNES_COURSE_ID,
    slug: LIVING_THE_RUNES_SLUG,
    title: "Living the Runes",
    shopifyVariantId: toShopifyVariantGid(variantId),
    currency: config.currency,
  };
}

export function isShopifyProductKey(value: string): value is ShopifyProductKey {
  return value === "livingTheRunes";
}

export function getProductKeyForCourseId(courseId: string): ShopifyProductKey | null {
  const product = getShopifyCatalogProduct("livingTheRunes");
  if (product?.courseId === courseId) {
    return product.key;
  }
  return null;
}

export function findCatalogProductByVariantId(
  variantId: string | number,
): ShopifyCatalogProduct | null {
  const normalized = String(variantId);
  const product = getShopifyCatalogProduct("livingTheRunes");
  if (!product) {
    return null;
  }

  const gid = toShopifyVariantGid(normalized);
  const numeric = normalized.replace(/\D/g, "");
  const productNumeric = product.shopifyVariantId.replace(/\D/g, "");

  if (product.shopifyVariantId === gid || productNumeric === numeric) {
    return product;
  }

  return null;
}
