import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import { resolveCourseAccess } from "@/features/courses/services/resolve-course-access";
import { hasActiveMysticPlusEntitlement } from "@/features/payments/utils/entitlement-access";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import { hasPremiumEntitlement } from "@/features/premium/utils/resolve-premium-display-status";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 15 — PayPal config", () => {
  it("documents PayPal env names in .env.example", () => {
    const envExample = readSource(".env.example");
    expect(envExample).toContain("PAYPAL_ENV=sandbox");
    expect(envExample).toContain("NEXT_PUBLIC_PAYPAL_CLIENT_ID=");
    expect(envExample).toContain("PAYPAL_CLIENT_SECRET=");
    expect(envExample).toContain("PAYPAL_WEBHOOK_ID=");
    expect(envExample).not.toMatch(/BEGIN PRIVATE KEY/);
  });

  it("resolves sandbox and live API base URLs", () => {
    const config = readSource("src/features/payments/server/paypal-config.ts");
    expect(config).toContain("https://api-m.sandbox.paypal.com");
    expect(config).toContain("https://api-m.paypal.com");
    expect(config).toContain('env === "live"');
  });

  it("uses server catalog prices", () => {
    const products = readSource("src/features/payments/server/paypal-products.ts");
    expect(products).toContain('LIVING_THE_RUNES_AMOUNT = "79.00"');
    expect(products).toContain('MYSTIC_PLUS_MONTHLY_AMOUNT = "9.99"');
    expect(products).toContain("amountsMatch");
  });
});

describe("Phase 15 — API route security", () => {
  it("requires auth for order create route", () => {
    const route = readSource("src/app/api/paypal/orders/create/route.ts");
    expect(route).toContain("requireApiUser");
    expect(route).toContain("getPurchasableCourse");
    expect(route).not.toContain("PAYPAL_CLIENT_SECRET");
  });

  it("validates courseId on order create", () => {
    const route = readSource("src/app/api/paypal/orders/create/route.ts");
    expect(route).toContain('productType: z.literal("course")');
    expect(route).toContain("Course is not available for purchase");
  });

  it("verifies capture on server before granting access", () => {
    const route = readSource("src/app/api/paypal/orders/capture/route.ts");
    expect(route).toContain("captureAndVerifyCourseOrder");
    expect(route).toContain("verified: true");
    expect(route).not.toContain("unlock");
  });

  it("does not mark subscription active on creation", () => {
    const payment = readSource("src/features/payments/server/process-paypal-payment.ts");
    expect(payment).toContain('status: "pending"');
    const route = readSource("src/app/api/paypal/subscriptions/create/route.ts");
    expect(route).toContain("pendingVerification: true");
  });

  it("verifies webhook signatures", () => {
    const route = readSource("src/app/api/paypal/webhook/route.ts");
    expect(route).toContain("verifyPayPalWebhookSignature");
    expect(route).toContain("Invalid PayPal signature");
    expect(route).not.toContain("return NextResponse.json(event");
  });
});

describe("Phase 15 — idempotency and entitlements", () => {
  it("tracks processed webhook events", () => {
    const repo = readSource("src/features/payments/server/payment-repository.ts");
    expect(repo).toContain("hasProcessedPaymentEvent");
    expect(repo).toContain("markPaymentEventProcessed");
    const processor = readSource("src/features/payments/server/process-paypal-webhook.ts");
    expect(processor).toContain("hasProcessedPaymentEvent");
  });

  it("grants Mystic Plus only from active entitlement", () => {
    expect(
      hasActiveMysticPlusEntitlement({
        type: "mysticPlus",
        status: "active",
        provider: "paypal",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true);
    expect(
      hasActiveMysticPlusEntitlement({
        type: "mysticPlus",
        status: "pending",
        provider: "paypal",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(false);
  });

  it("includes PayPal active subscription in premium resolver", () => {
    expect(
      resolvePremiumAccess(null, {
        type: "mysticPlus",
        status: "active",
        provider: "paypal",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true);
    expect(
      hasPremiumEntitlement(null, {
        type: "mysticPlus",
        status: "pending",
        provider: "paypal",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(false);
  });

  it("does not unlock paid course with Mystic Plus alone", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      courseId: "runes_24_inner_strength",
      profile: null,
      isPremiumUser: true,
    });
    expect(access.canOpenLessons).toBe(false);
  });
});

describe("Phase 15 — UI honesty", () => {
  it("shows pending verification copy in EN and RU", () => {
    expect(en.payments.pendingVerification).toContain("pending verification");
    expect(ru.payments.pendingVerification).toContain("ожидает подтверждения");
    expect(en.payments.securePayPalNote).toContain("PayPal");
    expect(ru.payments.securePayPalNote).toContain("PayPal");
  });

  it("does not fake success before verification in payment notice", () => {
    const notice = readSource("src/features/payments/components/PaymentStatusNotice.tsx");
    expect(notice).toContain("pendingVerification");
    expect(notice).toContain("verificationFailed");
    expect(notice).not.toContain("Payment successful");
  });

  it("gracefully handles missing PayPal env in UI", () => {
    const profileSection = readSource(
      "src/features/profile/components/profile-subscription-section.tsx",
    );
    expect(profileSection).toContain("setupUnavailable");
    expect(profileSection).toContain("paypalConfigured");
  });
});

describe("Phase 15 — refund and cancel behavior", () => {
  it("marks refunded courses without deleting progress docs", () => {
    const payment = readSource("src/features/payments/server/process-paypal-payment.ts");
    expect(payment).toContain('status: "refunded"');
    const webhook = readSource("src/features/payments/server/process-paypal-webhook.ts");
    expect(webhook).toContain("PAYMENT.CAPTURE.REFUNDED");
    expect(webhook).toContain("refundOwnedCourse");
    expect(webhook).not.toContain("delete");
  });

  it("updates subscription status on cancel and suspend events", () => {
    const webhook = readSource("src/features/payments/server/process-paypal-webhook.ts");
    expect(webhook).toContain("BILLING.SUBSCRIPTION.CANCELLED");
    expect(webhook).toContain("BILLING.SUBSCRIPTION.SUSPENDED");
    expect(webhook).toContain("BILLING.SUBSCRIPTION.EXPIRED");
  });
});

describe("Phase 15 — migration doc", () => {
  it("documents official PayPal integration", () => {
    const doc = readSource("docs/migration/phase-15-paypal-payments-entitlements.md");
    expect(doc).toContain("developer.paypal.com");
    expect(doc).toContain("/api/paypal/webhook");
    expect(doc).toContain("verify-webhook-signature");
  });
});
