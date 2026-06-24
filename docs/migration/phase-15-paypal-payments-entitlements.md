# Phase 15 — PayPal payments and verified entitlements

Server-verified PayPal sandbox-ready payments for Mystic Plus subscriptions and one-time course purchases.

## Official PayPal docs consulted

- [PayPal REST API — Get started](https://developer.paypal.com/api/rest/)
- [Orders v2 — Create order](https://developer.paypal.com/docs/api/orders/v2/#orders_create)
- [Orders v2 — Capture order](https://developer.paypal.com/docs/api/orders/v2/#orders_capture)
- [Subscriptions v1 — Create subscription](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_create)
- [Webhooks — REST integration](https://developer.paypal.com/api/rest/webhooks/rest/)
- [Webhooks — Verify webhook signature](https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post)
- [PayPal JS SDK — Subscribe](https://developer.paypal.com/docs/subscriptions/integrate/)

## Architecture

```text
Client PayPal Buttons
  → POST /api/paypal/orders/create | /subscriptions/create (auth required)
  → PayPal approval UI
  → POST /api/paypal/orders/capture (server verifies with PayPal API)
  → Firestore ownedCourses / entitlements/mysticPlus (server-only)

PayPal Webhook
  → POST /api/paypal/webhook
  → verify-webhook-signature (PAYPAL_WEBHOOK_ID)
  → idempotent event processing
  → entitlement writes
```

**Critical rule:** browser return URL alone never unlocks access. Capture route and webhooks verify with PayPal before granting entitlements.

## Environment variables

| Variable | Role |
|----------|------|
| `PAYPAL_ENV` | `sandbox` or `live` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal JS SDK (public) |
| `PAYPAL_CLIENT_ID` | Server REST API |
| `PAYPAL_CLIENT_SECRET` | Server-only OAuth |
| `PAYPAL_WEBHOOK_ID` | Webhook signature verification |
| `PAYPAL_MYSTIC_PLUS_MONTHLY_PLAN_ID` | Sandbox/live plan ID |
| `PAYPAL_MYSTIC_PLUS_YEARLY_PLAN_ID` | Sandbox/live plan ID |
| `PAYPAL_CURRENCY` | Default `EUR` |
| `PAYPAL_WEBHOOK_PATH` | Documented path `/api/paypal/webhook` |

## Product catalog (server constants)

| Product | Price | ID |
|---------|-------|-----|
| Mystic Plus Monthly | €9.99 | Plan ID from env |
| Mystic Plus Yearly | €79.99 | Plan ID from env |
| Living the Runes | €79.00 | `runes_24_inner_strength` |

**Confirm prices with Boris before live mode.**

## Firestore model

| Path | Purpose |
|------|---------|
| `users/{uid}/entitlements/mysticPlus` | Subscription entitlement |
| `users/{uid}/ownedCourses/{courseId}` | One-time course purchase |
| `users/{uid}/paymentEvents/{eventId}` | Per-user audit |
| `users/{uid}/paypalOrders/{orderId}` | Pending/completed orders |
| `users/{uid}/paypalSubscriptions/{subscriptionId}` | Pending/active subscriptions |
| `paymentEvents/{paypalEventId}` | Global idempotency guard |

## Course order flow

1. Authenticated `POST /api/paypal/orders/create` with `{ productType: "course", courseId }`
2. Server validates catalog price/currency, creates PayPal order, stores pending mapping
3. Client PayPal button approves payment
4. Authenticated `POST /api/paypal/orders/capture` with `{ orderId }`
5. Server calls PayPal capture API, verifies amount/currency/status
6. Writes `ownedCourses/{courseId}` with `status: active`
7. Webhook `PAYMENT.CAPTURE.COMPLETED` provides redundant verification

## Subscription flow

1. Authenticated `POST /api/paypal/subscriptions/create` with `{ plan: "monthly" | "yearly" }`
2. Server creates PayPal subscription, stores pending mapping, sets entitlement `pending`
3. Client approves in PayPal UI
4. **Not active until** `BILLING.SUBSCRIPTION.ACTIVATED` webhook (or verified status fetch)
5. Writes `entitlements/mysticPlus` `active` + `users.isPremium = true`

## Webhook verification

Uses PayPal `POST /v1/notifications/verify-webhook-signature` with `PAYPAL_WEBHOOK_ID`. Invalid signatures return 401.

## Entitlement rules

### Mystic Plus

Granted if: `isPremium`, `premiumOverride`, `isOwner`, or `entitlements/mysticPlus.status === "active"`

### Course access

Granted if: owner/dev override or `ownedCourses/{courseId}.status === "active"`

**Mystic Plus does not unlock paid courses.**

## Idempotency

`paymentEvents/{eventId}` global collection prevents duplicate webhook processing.

## Refund / cancel behavior

- `PAYMENT.CAPTURE.REFUNDED` / reversed → `ownedCourses` → `refunded` (progress preserved)
- `BILLING.SUBSCRIPTION.CANCELLED` → `cancelled`
- `BILLING.SUBSCRIPTION.SUSPENDED` / payment failed → `past_due`
- `BILLING.SUBSCRIPTION.EXPIRED` → `inactive`

## PayPal Developer Dashboard checklist

1. Create Sandbox REST app → Client ID + Secret
2. Create Mystic Plus monthly/yearly subscription plans
3. Create webhook: `https://YOUR_DOMAIN/api/paypal/webhook`
4. Subscribe to order, capture, refund, subscription events
5. Copy Webhook ID to `PAYPAL_WEBHOOK_ID`
6. Use sandbox buyer account for testing

## Local testing

1. Add PayPal sandbox vars to `.env.local` (not committed)
2. `npm run dev`
3. Visit `/en/profile` and `/en/courses/living-the-runes`
4. Without env: honest “not configured” copy, no crash
5. With env: PayPal buttons render; access appears only after server-verified capture/webhook

## Vercel setup

Add all PayPal env vars to Production and Preview, redeploy, register webhook URL on production domain.

## Known limitations

- Subscription approval may show pending until webhook arrives
- No in-app subscription management UI (cancel via PayPal account)
- Single purchasable course in catalog (Living the Runes)
- Prices are placeholder constants until live confirmation

## Validation results

Run before release:

```bash
npm run assets:check && npm run lint && npm test && npm run build
```

## Ready for Phase 16?

**Yes**, after sandbox end-to-end payment test with real PayPal sandbox accounts and webhook delivery verified.

Next: **Phase 16 — Services / booking system.**
