import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PayPalApiError } from "@/features/payments/server/paypal-client";
import { isCoursePurchaseConfigured } from "@/features/payments/server/paypal-config";
import { captureAndVerifyCourseOrder } from "@/features/payments/server/process-paypal-payment";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export const runtime = "nodejs";

const captureSchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (!isCoursePurchaseConfigured()) {
    return jsonError("Payment setup is not configured yet.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Order ID is required.", 400);
  }

  try {
    const result = await captureAndVerifyCourseOrder({
      uid: auth.user.uid,
      orderId: parsed.data.orderId,
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      courseId: result.courseId,
      verified: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "order_not_found") {
        return jsonError("Order not found.", 404);
      }
      if (error.message === "capture_not_completed") {
        return jsonError("Payment could not be verified.", 402);
      }
      if (error.message === "amount_mismatch") {
        return jsonError("Payment could not be verified.", 409);
      }
    }
    if (error instanceof PayPalApiError) {
      return jsonError("Payment could not be verified.", error.statusCode);
    }
    return jsonError("Payment could not be verified.", 502);
  }
}
