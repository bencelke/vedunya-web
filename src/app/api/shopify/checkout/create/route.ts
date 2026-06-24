import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createShopifyCourseCheckout } from "@/features/shopify/server/create-shopify-checkout";
import { isShopifyConfigured } from "@/features/shopify/server/shopify-config";
import { isShopifyProductKey } from "@/features/shopify/server/shopify-products";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export const runtime = "nodejs";

const createCheckoutSchema = z.object({
  productKey: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (!isShopifyConfigured()) {
    return jsonError("Payment setup is not configured yet.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = createCheckoutSchema.safeParse(body);
  if (!parsed.success || !isShopifyProductKey(parsed.data.productKey)) {
    return jsonError("Invalid product request.", 400);
  }

  const locale = request.nextUrl.searchParams.get("locale") === "ru" ? "ru" : "en";

  try {
    const result = await createShopifyCourseCheckout({
      uid: auth.user.uid,
      productKey: parsed.data.productKey,
      locale,
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_product") {
      return jsonError("Product is not available for purchase.", 400);
    }
    return jsonError("Unable to create Shopify checkout.", 502);
  }
}
