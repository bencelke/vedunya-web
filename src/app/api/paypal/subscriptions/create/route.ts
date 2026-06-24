import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PayPalApiError } from "@/features/payments/server/paypal-client";
import { isMysticPlusPaymentConfigured } from "@/features/payments/server/paypal-config";
import { createMysticPlusSubscription } from "@/features/payments/server/process-paypal-payment";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export const runtime = "nodejs";

const createSubscriptionSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (!isMysticPlusPaymentConfigured()) {
    return jsonError("Payment setup is not configured yet.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = createSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid subscription plan.", 400);
  }

  const origin = request.nextUrl.origin;
  const locale = request.nextUrl.searchParams.get("locale") === "ru" ? "ru" : "en";
  const returnUrl = `${origin}/${locale}/profile?subscription=return`;
  const cancelUrl = `${origin}/${locale}/profile?subscription=cancelled`;

  try {
    const result = await createMysticPlusSubscription({
      uid: auth.user.uid,
      plan: parsed.data.plan,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({
      ok: true,
      subscriptionId: result.subscriptionId,
      status: result.status,
      pendingVerification: true,
    });
  } catch (error) {
    if (error instanceof PayPalApiError) {
      return jsonError("Unable to start subscription.", error.statusCode);
    }
    return jsonError("Unable to start subscription.", 502);
  }
}
