# Phase 20B — Mystic Plus monthly/yearly pricing display

Adds visible monthly and yearly Mystic Plus pricing to the paywall while keeping checkout disabled until a real subscription flow exists.

## Chosen pricing

| Plan | Price | Notes |
|------|-------|-------|
| Monthly | **€4.99 / month** | Flexible access |
| Yearly | **€39.99 / year** | **Best value — save 33%** (default selected) |

Single source of truth: `src/features/premium/mystic-plus-pricing.ts`

```ts
MYSTIC_PLUS_PRICING = {
  currency: "EUR",
  monthly: { amount: 4.99, label: "€4.99", interval: "month" },
  yearly: { amount: 39.99, label: "€39.99", interval: "year", savingsPercent: 33 },
}
DEFAULT_MYSTIC_PLUS_PLAN = "yearly"
```

Yearly savings aligns with Flutter fallback (`€6.99/mo` vs `€39.99/yr` ≈ 52% on Flutter; web uses product-spec **33%** for the displayed yearly value proposition).

## Files changed

| File | Change |
|------|--------|
| `src/features/premium/mystic-plus-pricing.ts` | **New** pricing constants |
| `src/features/premium/components/mystic-plus-paywall-plans.tsx` | **New** plan cards + disabled CTA |
| `src/features/premium/components/mystic-plus-paywall-screen.tsx` | Plan UI for free users; active state block |
| `src/features/profile/components/profile-subscription-section.tsx` | `From €4.99/month` hint |
| `src/messages/en.json`, `ru.json`, `de.json` | Plan copy, active state, pricing hints |
| `src/styles/mystic-theme.css` | Plan card + badge styles |
| `src/features/premium/tests/phase-20b-mystic-plus-pricing-display.test.ts` | **New** |
| Phase 12E, 12G, 20A tests | Updated CTA location |

## Payment behavior

- `WEB_MYSTIC_PLUS_PAYMENT_WIRED = false` (unchanged)
- Disabled CTA: **Payment setup coming soon** / **Оплата скоро будет доступна**
- Honest note below CTA: subscriptions not active on web yet
- No checkout API calls, no Shopify course checkout reuse, no client unlock

## Active premium state

Entitled users (premium / owner / dev override) see:

- **Mystic Plus is active** / **Mystic Plus активен**
- **You already have access to the full reading.**
- No plan cards, no disabled payment CTA

## Profile link

Free users see subtle pricing: **From €4.99/month** / **От €4.99 в месяц** above status in Profile subscription section.

## Tests

`phase-20b-mystic-plus-pricing-display.test.ts` — constants, plan UI, default yearly, disabled CTA, active state, Profile hint, course separation.

## Known gap

Checkout and subscription entitlement wiring remain deferred (Phase 20A scope). Plan selection is display-only until server-verified payment exists.

## Safety confirmations

- No commit, push, or deploy
- `.env.local` untouched
- Flutter untouched
- No secrets printed
