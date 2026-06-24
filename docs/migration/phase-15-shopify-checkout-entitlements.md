# Phase 15 — Shopify checkout and verified course entitlements

**Checkpoint:** builds on `4df0e8d` (scheduled notification dispatch) and replaces the prior PayPal-first Phase 15 plan.

**Goal:** One-time paid course purchases (Living the Runes first) via Shopify checkout. Firebase entitlements are granted **only** after verified Shopify webhooks — never from the browser return URL.

## Official Shopify docs consulted

| Topic | Official page |
|-------|----------------|
| Storefront API — Cart object | https://shopify.dev/docs/api/storefront/latest/objects/Cart |
| Storefront API — `cartCreate` mutation | https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate |
| Cart `checkoutUrl` | https://shopify.dev/docs/api/storefront/latest/objects/Cart#field-checkouturl |
| Cart attributes (metadata) | https://shopify.dev/docs/api/storefront/latest/input-objects/CartInput |
| Admin REST — Order resource | https://shopify.dev/docs/api/admin-rest/latest/resources/order |
| Webhooks overview | https://shopify.dev/docs/apps/build/webhooks |
| Verify webhook HMAC (`X-Shopify-Hmac-Sha256`) | https://shopify.dev/docs/apps/build/webhooks/subscribe/https#step-5-verify-the-webhook |
| Webhook topics — `orders/paid` | https://shopify.dev/docs/api/admin-rest/latest/resources/webhook#event-topics |
| Webhook topics — `orders/cancelled` | https://shopify.dev/docs/api/admin-rest/latest/resources/webhook#event-topics-orders-cancelled |
| Webhook topics — `refunds/create` | https://shopify.dev/docs/api/admin-rest/latest/resources/webhook#event-topics-refunds-create |
| Custom app access tokens | https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin |

## Architecture

```text
app.vedunya.com
  → user clicks Buy through Shopify (Living the Runes)
  → POST /api/shopify/checkout/create (authenticated)
  → server maps productKey → variant ID, creates Storefront cart
  → cart attributes carry uid, productKey, courseId, app source
  → browser redirects to Shopify checkoutUrl only
  → user pays on Shopify (PayPal may appear inside Shopify checkout)
  → Shopify POST /api/shopify/webhook (HMAC verified)
  → Firestore ownedCourses/{courseId}.status = active
  → user returns with ?checkout=pending (UI only — no unlock)
  → course access reads ownedCourses active
```

**Critical rule:** Return URL (`?checkout=pending`) shows verification copy only. It does **not** write entitlements.

## Environment variables

See `.env.example` and `docs/setup/vercel-deployment.md`.

| Variable | Scope | Purpose |
|----------|-------|---------|
| `SHOPIFY_STORE_DOMAIN` | Server | Store hostname (`vedunya.com` or `*.myshopify.com`) |
| `SHOPIFY_API_VERSION` | Server | API version (default `2025-01`) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Server | Storefront API cart creation |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Server | Reserved for future Admin lookups (refunds) |
| `SHOPIFY_WEBHOOK_SECRET` | Server | HMAC verification |
| `SHOPIFY_LIVING_THE_RUNES_VARIANT_ID` | Server | Variant for Living the Runes |
| `SHOPIFY_CURRENCY` | Server | Display/catalog currency (default EUR) |
| `NEXT_PUBLIC_APP_URL` | Public | Return paths (`https://app.vedunya.com`) |

Never commit tokens, webhook secret, or `.env.local`.

## Server product catalog

`src/features/shopify/server/shopify-products.ts`

- Browser sends only `productKey` (e.g. `livingTheRunes`)
- Server maps to `courseId: runes_24_inner_strength` and `SHOPIFY_LIVING_THE_RUNES_VARIANT_ID`
- Browser never submits price, variant ID, or course ID for trust

## Firestore model

| Path | Purpose |
|------|---------|
| `users/{uid}/ownedCourses/{courseId}` | Course entitlement (`active` / `refunded` / `pending`) |
| `users/{uid}/shopifyCheckouts/{checkoutId}` | Checkout mapping (cart ID, product key, status) |
| `users/{uid}/shopifyOrders/{orderId}` | Order record after paid webhook |
| `paymentEvents/{shopifyWebhookId}` | Idempotent webhook processing |

### Owned course shape

```ts
{
  courseId: string;
  status: "active" | "refunded" | "pending";
  provider: "shopify";
  shopifyOrderId?: string;
  shopifyCheckoutId?: string;
  shopifyLineItemId?: string;
  purchasedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

Only `status === "active"` unlocks lessons. Course progress is never deleted on refund/cancel.

## Checkout creation flow

1. `POST /api/shopify/checkout/create` with `{ productKey: "livingTheRunes" }`
2. `requireApiUser()` — unauthenticated requests rejected
3. Validate `productKey` against server catalog
4. `cartCreate` via Storefront API with cart attributes:
   - `_vedunya_uid`, `_vedunya_product_key`, `_vedunya_course_id`, `_app_source`, `_return_path`
5. Save `shopifyCheckouts` record under authenticated UID
6. Return `{ checkoutUrl }` only — no tokens or internal metadata

## Return URL behavior

After checkout, Shopify may return the user to:

- `/{locale}/courses/living-the-runes?checkout=pending`
- `/{locale}/profile?checkout=pending`

Copy (EN): *Payment is being verified. Access appears here after Shopify confirms the order.*

This state does **not** grant access.

## Webhook verification

`POST /api/shopify/webhook`

1. Read raw body (`request.text()`)
2. Verify `X-Shopify-Hmac-Sha256` with `SHOPIFY_WEBHOOK_SECRET`
3. Read `X-Shopify-Topic` and `X-Shopify-Webhook-Id`
4. Reject invalid signatures (401)
5. Process supported topics; mark `paymentEvents/{webhookId}` idempotently

### Supported topics

| Topic | Behavior |
|-------|----------|
| `orders/paid` | Match line item variant IDs to catalog; resolve UID from note attributes or checkout mapping; grant `ownedCourses` active |
| `orders/cancelled` | Mark owned course `refunded` when UID + courseId resolved |
| `refunds/create` | Documented limitation — payload may lack UID; primary path is `orders/cancelled` / future Admin lookup |

If UID cannot be resolved safely, **do not grant access**.

## Entitlement rules

- Shopify paid course unlocks that course only
- Mystic Plus does **not** unlock paid courses
- Owner / dev override preserved
- Free previews unchanged
- Physical products / bundles: catalog type supported; full shop UI deferred

## Mystic Plus subscription — deferred

**Decision deferred** until one-time Shopify course purchases work reliably.

- **Option A:** Shopify Subscriptions
- **Option B:** Direct PayPal subscriptions

Profile shows placeholder: *Mystic Plus subscription checkout will be configured later.*

## Course UI

Locked Living the Runes shows:

- **Buy through Shopify**
- Secure checkout copy
- Pending verification when `?checkout=pending`
- Graceful message when Shopify env missing

## Profile

- Mystic Plus: deferred copy only (no checkout buttons)
- Learning section: shows active course access when `ownedCourses` is active
- `?checkout=pending` shows verification notice

## Manual Shopify setup checklist

1. Create product **Living the Runes** in Shopify admin (`vedunya.com`)
2. Create variant; copy variant ID → `SHOPIFY_LIVING_THE_RUNES_VARIANT_ID`
3. Enable PayPal in Shopify Payments settings (inside Shopify checkout)
4. Create custom app with Storefront API + Admin API scopes as needed
5. Copy Storefront access token → `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
6. Copy Admin access token → `SHOPIFY_ADMIN_ACCESS_TOKEN` (optional for refunds)
7. Create webhook: `https://app.vedunya.com/api/shopify/webhook`
8. Subscribe to `orders/paid`, `orders/cancelled`, `refunds/create`
9. Set webhook signing secret → `SHOPIFY_WEBHOOK_SECRET` in Vercel
10. Set all env vars in Vercel; redeploy
11. Test with Shopify test order or Bogus gateway

## Vercel env setup

Add all Shopify variables from `.env.example` to Production and Preview. Set:

```env
NEXT_PUBLIC_APP_URL=https://app.vedunya.com
```

For temporary Vercel hostname testing, use your `*.vercel.app` URL.

## Known limitations

- `refunds/create` webhook does not always include order note attributes; full refund handling may need Admin API order lookup
- Cart GID vs `cart_token` on REST order payload — primary UID resolution uses note attributes from cart attributes
- Mystic Plus subscription not implemented
- No in-app physical product shop UI
- Firestore collection group query on `shopifyCartId` may require an index in production

## Validation results

Run before deploy:

```bash
npm run assets:check
npm run lint
npm test
npm run build
```

Optional when Firebase is configured:

```bash
npm run verify:firebase
npm run content:check
npm run sanity:check
npm run courses:check
```

## Ready for Phase 16?

Yes, after:

- Vercel Shopify env vars configured
- Shopify product + webhook registered on production domain
- At least one successful test purchase → webhook → `ownedCourses` active

**Next:** Phase 16 — Services / booking system.
