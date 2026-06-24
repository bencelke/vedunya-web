import { createHmac } from "node:crypto";
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

describe("Phase 15 — Shopify config", () => {
  it("documents Shopify env names in .env.example", () => {
    const envExample = readSource(".env.example");
    expect(envExample).toContain("SHOPIFY_STORE_DOMAIN=");
    expect(envExample).toContain("SHOPIFY_API_VERSION=");
    expect(envExample).toContain("SHOPIFY_STOREFRONT_ACCESS_TOKEN=");
    expect(envExample).toContain("SHOPIFY_ADMIN_ACCESS_TOKEN=");
    expect(envExample).toContain("SHOPIFY_WEBHOOK_SECRET=");
    expect(envExample).toContain("SHOPIFY_LIVING_THE_RUNES_VARIANT_ID=");
    expect(envExample).toContain("SHOPIFY_CURRENCY=EUR");
    expect(envExample).toContain("NEXT_PUBLIC_APP_URL=");
    expect(envExample).not.toContain("PAYPAL_CLIENT_SECRET");
    expect(envExample).not.toMatch(/BEGIN PRIVATE KEY/);
  });

  it("normalizes store domain and validates required env", () => {
    const config = readSource("src/features/shopify/server/shopify-config.ts");
    expect(config).toContain("normalizeShopifyStoreDomain");
    expect(config).toContain("isShopifyCoursePurchaseConfigured");
    expect(config).toContain("SHOPIFY_STORE_DOMAIN");
    expect(config).not.toContain("console.log");
  });

  it("uses server catalog variant IDs", () => {
    const products = readSource("src/features/shopify/server/shopify-products.ts");
    expect(products).toContain("SHOPIFY_LIVING_THE_RUNES_VARIANT_ID");
    expect(products).toContain("livingTheRunes");
    expect(products).toContain("LIVING_THE_RUNES_COURSE_ID");
    expect(products).not.toContain("amount");
  });
});

describe("Phase 15 — API route security", () => {
  it("requires auth for checkout create route", () => {
    const route = readSource("src/app/api/shopify/checkout/create/route.ts");
    expect(route).toContain("requireApiUser");
    expect(route).toContain("isShopifyProductKey");
    expect(route).not.toContain("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    expect(route).not.toContain("SHOPIFY_ADMIN_ACCESS_TOKEN");
  });

  it("validates productKey on checkout create", () => {
    const route = readSource("src/app/api/shopify/checkout/create/route.ts");
    expect(route).toContain('productKey: z.string().min(1)');
    expect(route).toContain("Invalid product request");
    expect(route).not.toContain("courseId");
    expect(route).not.toContain("price");
  });

  it("returns checkoutUrl only from checkout create", () => {
    const route = readSource("src/app/api/shopify/checkout/create/route.ts");
    expect(route).toContain("checkoutUrl: result.checkoutUrl");
    expect(route).not.toContain("shopifyCartId");
    expect(route).not.toMatch(/NextResponse\.json\([\s\S]*uid/);
  });

  it("stores checkout mapping under authenticated UID", () => {
    const checkout = readSource("src/features/shopify/server/create-shopify-checkout.ts");
    expect(checkout).toContain("saveShopifyCheckoutRecord");
    expect(checkout).toContain("uid: input.uid");
    expect(checkout).toContain("_vedunya_uid");
    expect(checkout).not.toContain("markShopifyCoursePending");
  });

  it("verifies webhook HMAC with raw body", () => {
    const route = readSource("src/app/api/shopify/webhook/route.ts");
    expect(route).toContain("request.text()");
    expect(route).toContain("verifyShopifyWebhookHmac");
    expect(route).toContain("Invalid Shopify signature");
    expect(route.indexOf("verifyShopifyWebhookHmac")).toBeLessThan(
      route.indexOf("JSON.parse(rawBody"),
    );
  });
});

describe("Phase 15 — webhook verification", () => {
  function computeShopifyHmac(rawBody: string, secret: string): string {
    return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  }

  it("implements HMAC verification contract in server module", () => {
    const verification = readSource(
      "src/features/shopify/server/shopify-webhook-verification.ts",
    );
    expect(verification).toContain("verifyShopifyWebhookHmac");
    expect(verification).toContain('createHmac("sha256"');
    expect(verification).toContain("timingSafeEqual");
    expect(verification).toContain("x-shopify-topic");
    expect(verification).toContain("x-shopify-webhook-id");
  });

  it("rejects missing HMAC header", () => {
    const verification = readSource(
      "src/features/shopify/server/shopify-webhook-verification.ts",
    );
    expect(verification).toContain("if (!secret || !input.hmacHeader)");
  });

  it("rejects invalid HMAC digest", () => {
    const secret = "test-secret";
    const rawBody = '{"id":1}';
    const digest = computeShopifyHmac(rawBody, secret);
    expect(digest).not.toBe("invalid");
  });

  it("accepts valid HMAC digest", () => {
    const secret = "test-secret";
    const rawBody = '{"id":123}';
    const digest = computeShopifyHmac(rawBody, secret);
    expect(digest).toBe(computeShopifyHmac(rawBody, secret));
  });
});

describe("Phase 15 — idempotency and entitlements", () => {
  it("tracks processed webhook events idempotently", () => {
    const repo = readSource("src/features/shopify/server/shopify-checkout-repository.ts");
    expect(repo).toContain("hasProcessedShopifyWebhook");
    expect(repo).toContain("markShopifyWebhookProcessed");
    expect(repo).toContain("paymentEvents");
  });

  it("grants ownedCourses active only from verified webhook processor", () => {
    const processor = readSource("src/features/shopify/server/process-shopify-webhook.ts");
    expect(processor).toContain('case "orders/paid"');
    expect(processor).toContain("grantShopifyCourseEntitlement");
    expect(processor).toContain("if (!resolved.uid)");
  });

  it("marks refunded on cancel without deleting progress paths", () => {
    const processor = readSource("src/features/shopify/server/process-shopify-webhook.ts");
    expect(processor).toContain('case "orders/cancelled"');
    expect(processor).toContain("markShopifyCourseRefunded");
    expect(processor).not.toContain("delete");
  });

  it("stores ownedCourses with shopify provider fields", () => {
    const entitlements = readSource("src/features/payments/server/entitlement-repository.ts");
    expect(entitlements).toContain('provider: "shopify"');
    expect(entitlements).toContain("shopifyOrderId");
    expect(entitlements).toContain('status === "active"');
  });

  it("does not unlock paid courses with Mystic Plus alone", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: "runes_24_inner_strength",
      profile: null,
      isPremiumUser: true,
    });
    expect(access.canOpenLessons).toBe(false);
    expect(access.isPaidLocked).toBe(true);
  });

  it("includes Mystic Plus entitlement in premium resolver when active", () => {
    expect(
      resolvePremiumAccess(null, {
        type: "mysticPlus",
        status: "active",
        provider: "shopify",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true);
    expect(
      hasPremiumEntitlement(null, {
        type: "mysticPlus",
        status: "active",
        provider: "shopify",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true);
    expect(
      hasActiveMysticPlusEntitlement({
        type: "mysticPlus",
        status: "active",
        provider: "shopify",
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true);
  });
});

describe("Phase 15 — UI and localization", () => {
  it("includes Shopify payment copy in EN and RU", () => {
    expect(en.shopify.buyThroughShopify).toContain("Shopify");
    expect(ru.shopify.buyThroughShopify).toContain("Shopify");
    expect(en.shopify.pendingVerification).toContain("verified");
    expect(ru.shopify.pendingVerification).toContain("проверяется");
    expect(en.payments.setupUnavailable).toContain("not configured");
    expect(ru.payments.setupUnavailable).toContain("не настроена");
  });

  it("gracefully handles missing Shopify env in UI", () => {
    const purchaseSection = readSource(
      "src/features/shopify/components/CourseShopifyPurchaseSection.tsx",
    );
    expect(purchaseSection).toContain("shopifyConfigured");
    expect(purchaseSection).toContain("setupUnavailable");

    const coursePage = readSource("src/app/[locale]/courses/[slug]/page.tsx");
    expect(coursePage).toContain("isShopifyCoursePurchaseConfigured");
  });

  it("does not unlock from return URL pending state", () => {
    const coursePage = readSource("src/app/[locale]/courses/[slug]/page.tsx");
    expect(coursePage).toContain('checkout === "pending"');
    expect(coursePage).not.toContain("grantShopifyCourseEntitlement");

    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: "runes_24_inner_strength",
      profile: null,
      isPremiumUser: false,
    });
    expect(access.canOpenLessons).toBe(false);
  });

  it("does not show fake purchase success copy in course UI", () => {
    const button = readSource("src/features/shopify/components/CourseShopifyCheckoutButton.tsx");
    expect(button).not.toContain("Access granted");
    expect(button).not.toContain("Purchase complete");
    expect(button).not.toContain("You own this course");
    expect(button).toContain("checkoutUrl");
  });

  it("defers Mystic Plus subscription checkout", () => {
    expect(en.premium.webComingSoon).toContain("configured later");
    expect(ru.premium.webComingSoon).toContain("подключено позже");
    const profileSection = readSource(
      "src/features/profile/components/profile-subscription-section.tsx",
    );
    expect(profileSection).not.toContain("PayPal");
    expect(profileSection).not.toContain("checkout");
  });
});

describe("Phase 15 — documentation", () => {
  it("documents official Shopify integration", () => {
    const doc = readSource("docs/migration/phase-15-shopify-checkout-entitlements.md");
    expect(doc).toContain("shopify.dev");
    expect(doc).toContain("/api/shopify/webhook");
    expect(doc).toContain("Decision deferred");
  });
});
