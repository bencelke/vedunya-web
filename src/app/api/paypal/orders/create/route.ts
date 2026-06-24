import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PayPalApiError } from "@/features/payments/server/paypal-client";
import { resolveCourseSlugFromId } from "@/features/courses/constants/course-ids";
import { isCoursePurchaseConfigured } from "@/features/payments/server/paypal-config";
import { getPurchasableCourse } from "@/features/payments/server/paypal-products";
import { createCoursePayPalOrder } from "@/features/payments/server/process-paypal-payment";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { jsonError } from "@/lib/auth/request-guards";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  productType: z.literal("course"),
  courseId: z.string().min(1),
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

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid course purchase request.", 400);
  }

  const product = getPurchasableCourse(parsed.data.courseId);
  if (!product) {
    return jsonError("Course is not available for purchase.", 400);
  }

  const origin = request.nextUrl.origin;
  const locale = request.nextUrl.searchParams.get("locale") === "ru" ? "ru" : "en";
  const slug = resolveCourseSlugFromId(product.courseId) ?? product.courseId;
  const returnUrl = `${origin}/${locale}/courses/${slug}?payment=return`;
  const cancelUrl = `${origin}/${locale}/courses/${slug}?payment=cancelled`;

  try {
    const result = await createCoursePayPalOrder({
      uid: auth.user.uid,
      courseId: product.courseId,
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      courseId: product.courseId,
    });
  } catch (error) {
    if (error instanceof PayPalApiError) {
      return jsonError("Unable to start course purchase.", error.statusCode);
    }
    return jsonError("Unable to start course purchase.", 502);
  }
}
