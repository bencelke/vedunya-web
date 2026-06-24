import "server-only";

import { findCatalogProductByVariantId } from "@/features/shopify/server/shopify-products";
import {
  grantShopifyCourseEntitlement,
  markShopifyCourseRefunded,
} from "@/features/shopify/server/shopify-entitlement-repository";
import {
  markShopifyWebhookProcessed,
  hasProcessedShopifyWebhook,
  readShopifyCheckoutByCartId,
  saveShopifyOrderRecord,
} from "@/features/shopify/server/shopify-checkout-repository";

type ShopifyOrderPayload = {
  id?: number | string;
  cart_token?: string;
  note_attributes?: Array<{ name?: string; value?: string }>;
  line_items?: Array<{
    id?: number | string;
    variant_id?: number | string;
    product_id?: number | string;
  }>;
};

type ShopifyRefundPayload = {
  order_id?: number | string;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNoteAttribute(
  order: ShopifyOrderPayload,
  key: string,
): string | null {
  for (const attribute of order.note_attributes ?? []) {
    if (attribute.name === key) {
      return readString(attribute.value);
    }
  }
  return null;
}

async function resolveUidFromOrder(order: ShopifyOrderPayload): Promise<{
  uid: string | null;
  productKey: string | null;
  courseId: string | null;
  cartId: string | null;
}> {
  const uid =
    readNoteAttribute(order, "_vedunya_uid") ??
    readNoteAttribute(order, "vedunya_uid");
  const productKey =
    readNoteAttribute(order, "_vedunya_product_key") ??
    readNoteAttribute(order, "vedunya_product_key");
  const courseId =
    readNoteAttribute(order, "_vedunya_course_id") ??
    readNoteAttribute(order, "vedunya_course_id");
  const cartToken = readString(order.cart_token);

  if (uid && courseId) {
    return { uid, productKey, courseId, cartId: cartToken };
  }

  if (cartToken) {
    const checkout = await readShopifyCheckoutByCartId(cartToken);
    if (checkout?.uid) {
      return {
        uid: checkout.uid,
        productKey: checkout.productKey,
        courseId: checkout.courseId ?? courseId,
        cartId: cartToken,
      };
    }
  }

  return { uid: null, productKey, courseId, cartId: cartToken };
}

export async function processShopifyWebhook(input: {
  topic: string;
  eventId: string;
  payload: Record<string, unknown>;
}): Promise<{ ok: true; processed: boolean; topic: string }> {
  if (await hasProcessedShopifyWebhook(input.eventId)) {
    return { ok: true, processed: false, topic: input.topic };
  }

  switch (input.topic) {
    case "orders/paid": {
      const order = input.payload as ShopifyOrderPayload;
      const orderId = order.id ? String(order.id) : null;
      if (!orderId) {
        break;
      }

      const resolved = await resolveUidFromOrder(order);
      if (!resolved.uid) {
        break;
      }

      let granted = false;

      for (const lineItem of order.line_items ?? []) {
        const product = lineItem.variant_id
          ? findCatalogProductByVariantId(lineItem.variant_id)
          : null;

        const courseId = product?.courseId ?? resolved.courseId;
        if (!courseId || product?.type !== "course") {
          continue;
        }

        await grantShopifyCourseEntitlement({
          uid: resolved.uid,
          courseId,
          shopifyOrderId: orderId,
          shopifyCheckoutId: resolved.cartId ?? undefined,
          shopifyLineItemId: lineItem.id ? String(lineItem.id) : undefined,
        });
        granted = true;
      }

      if (granted) {
        const now = new Date().toISOString();
        await saveShopifyOrderRecord({
          uid: resolved.uid,
          productKey: resolved.productKey === "livingTheRunes" ? "livingTheRunes" : undefined,
          courseId: resolved.courseId ?? undefined,
          shopifyOrderId: orderId,
          status: "paid",
          createdAt: now,
          updatedAt: now,
        });
      }
      break;
    }
    case "orders/cancelled": {
      const order = input.payload as ShopifyOrderPayload;
      const orderId = order.id ? String(order.id) : null;
      const resolved = await resolveUidFromOrder(order);
      if (!orderId || !resolved.uid || !resolved.courseId) {
        break;
      }

      await markShopifyCourseRefunded({
        uid: resolved.uid,
        courseId: resolved.courseId,
        shopifyOrderId: orderId,
      });
      break;
    }
    case "refunds/create": {
      const refund = input.payload as ShopifyRefundPayload;
      const orderId = refund.order_id ? String(refund.order_id) : null;
      if (!orderId) {
        break;
      }

      // Refund webhook alone may not include uid; order record lookup would need Admin API.
      // Safe path: only process when note attributes exist on nested order is unavailable here.
      // Document as limitation; checkout mapping + orders/paid remains primary grant path.
      break;
    }
    default:
      break;
  }

  await markShopifyWebhookProcessed({
    provider: "shopify",
    eventId: input.eventId,
    topic: input.topic,
    orderId:
      typeof input.payload.id === "string" || typeof input.payload.id === "number"
        ? String(input.payload.id)
        : undefined,
    processedAt: new Date().toISOString(),
    rawStored: false,
  });

  return { ok: true, processed: true, topic: input.topic };
}
