import "server-only";

import {
  activateMysticPlusFromSubscription,
  grantCourseFromVerifiedCapture,
  refundOwnedCourse,
  updateMysticPlusSubscriptionStatus,
} from "@/features/payments/server/process-paypal-payment";
import {
  hasProcessedPaymentEvent,
  markPaymentEventProcessed,
  readPayPalOrderById,
  readPayPalSubscription,
} from "@/features/payments/server/payment-repository";

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readResourceId(event: PayPalWebhookEvent): string | null {
  const resource = event.resource;
  if (!resource) {
    return null;
  }

  return (
    readString(resource.id) ??
    readString((resource as { supplementary_data?: { related_ids?: { order_id?: string } } }).supplementary_data?.related_ids?.order_id)
  );
}

async function resolveUidFromEvent(event: PayPalWebhookEvent): Promise<string | null> {
  const customId = readString(event.resource?.custom_id);
  if (customId && !customId.includes("|")) {
    return customId;
  }

  const orderId = readString(event.resource?.id) ?? readResourceId(event);
  if (orderId) {
    const order = await readPayPalOrderById(orderId);
    if (order?.uid) {
      return order.uid;
    }
  }

  const subscriptionId = readString(event.resource?.id);
  if (subscriptionId) {
    const subscription = await readPayPalSubscription(subscriptionId);
    if (subscription?.uid) {
      return subscription.uid;
    }
  }

  if (customId?.includes("|")) {
    return customId.split("|")[0] ?? null;
  }

  return null;
}

export async function processPayPalWebhookEvent(
  event: PayPalWebhookEvent,
): Promise<{ ok: true; processed: boolean; eventType: string }> {
  const eventId = readString(event.id);
  const eventType = readString(event.event_type) ?? "UNKNOWN";

  if (!eventId) {
    throw new Error("missing_event_id");
  }

  if (await hasProcessedPaymentEvent(eventId)) {
    return { ok: true, processed: false, eventType };
  }

  const uid = await resolveUidFromEvent(event);

  switch (eventType) {
    case "PAYMENT.CAPTURE.COMPLETED": {
      const captureId = readString(event.resource?.id);
      const orderId = readString(
        (event.resource as { supplementary_data?: { related_ids?: { order_id?: string } } })
          ?.supplementary_data?.related_ids?.order_id,
      );
      const amount = readString(
        (event.resource as { amount?: { value?: string } })?.amount?.value,
      );
      const currency = readString(
        (event.resource as { amount?: { currency_code?: string } })?.amount?.currency_code,
      );

      if (orderId) {
        const order = await readPayPalOrderById(orderId);
        if (order) {
          await grantCourseFromVerifiedCapture({
            uid: order.uid,
            paypalOrderId: orderId,
            paypalCaptureId: captureId ?? undefined,
            amount: amount ?? undefined,
            currency: currency ?? undefined,
          });
        }
      }
      break;
    }
    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.REVERSED":
    case "PAYMENT.CAPTURE.REFUNDED": {
      const orderId = readString(
        (event.resource as { supplementary_data?: { related_ids?: { order_id?: string } } })
          ?.supplementary_data?.related_ids?.order_id,
      );
      if (orderId) {
        await refundOwnedCourse({ paypalOrderId: orderId });
      }
      break;
    }
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const subscriptionId = readString(event.resource?.id);
      const planId = readString(event.resource?.plan_id);
      if (subscriptionId) {
        await activateMysticPlusFromSubscription({
          paypalSubscriptionId: subscriptionId,
          paypalPlanId: planId ?? undefined,
        });
      }
      break;
    }
    case "BILLING.SUBSCRIPTION.CANCELLED": {
      const subscriptionId = readString(event.resource?.id);
      if (subscriptionId) {
        await updateMysticPlusSubscriptionStatus({
          paypalSubscriptionId: subscriptionId,
          status: "cancelled",
        });
      }
      break;
    }
    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
      const subscriptionId = readString(event.resource?.id);
      if (subscriptionId) {
        await updateMysticPlusSubscriptionStatus({
          paypalSubscriptionId: subscriptionId,
          status: "past_due",
        });
      }
      break;
    }
    case "BILLING.SUBSCRIPTION.EXPIRED": {
      const subscriptionId = readString(event.resource?.id);
      if (subscriptionId) {
        await updateMysticPlusSubscriptionStatus({
          paypalSubscriptionId: subscriptionId,
          status: "inactive",
        });
      }
      break;
    }
    default:
      break;
  }

  await markPaymentEventProcessed({
    uid: uid ?? undefined,
    event: {
      provider: "paypal",
      eventId,
      eventType,
      resourceId: readResourceId(event) ?? undefined,
      processedAt: new Date().toISOString(),
      rawStored: false,
    },
  });

  return { ok: true, processed: true, eventType };
}
