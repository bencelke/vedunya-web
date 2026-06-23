# Phase 5 — Today Parity

Today screen rebuilt for Mystic Flutter Oracle visual hierarchy with premium/free content gating review.

---

## Flutter Today files inspected

| File | Notes |
|------|-------|
| `lib/features/main/oracle_screen.dart` | Cinematic top nav, starfield, 420px column |
| `lib/features/daily_guidance/daily_guidance_panel.dart` | Hero guidance → 272px rune sigil → numerology → moon → premium-gated action/reflection |
| `lib/theme/today_editorial.dart` | `contentMaxWidth` 420px, reveal delays |
| `lib/services/daily_guidance/daily_guidance_loader.dart` | Loads composed guidance |
| `lib/services/premium_access_service.dart` | Premium gates via profile/subscription |

**Not copied to web V1:** Ask Mystic CTA, Feed, Insights tab, Card of the Day, paywall purchase flow.

---

## Web Today files created/modified

### Created

| Path | Purpose |
|------|---------|
| `src/features/today/components/today-rune-anchor.tsx` | Large centered rune hero (~168–216px) |
| `src/features/today/components/today-premium-lock-card.tsx` | Locked depth CTA for free users |
| `src/features/today/components/today-action-card.tsx` | Premium deep/action blocks |
| `src/features/today/components/today-screen.tsx` | Today entry wrapper |
| `src/features/profile/utils/premium-access.ts` | Read-only premium resolver |
| `src/features/today/tests/today-parity.test.ts` | Today + gating tests |

### Modified

| Path | Change |
|------|--------|
| `src/features/daily-guidance/components/daily-guidance-authenticated.tsx` | Flutter order: primary → rune hero → rhythm → premium |
| `src/features/daily-guidance/components/primary-guidance-card.tsx` | Cosmic elevated card, centered hero copy |
| `src/features/daily-guidance/components/personal-day-indicator.tsx` | Cosmic card styling |
| `src/features/daily-guidance/components/moon-rhythm-summary.tsx` | Deep/action display + gating flags |
| `src/features/daily-guidance/components/daily-guidance-header.tsx` | Mystic wordmark + date hierarchy |
| `src/features/daily-guidance/components/daily-guidance-incomplete.tsx` | Cosmic CTA card |
| `src/features/daily-guidance/services/compose-daily-guidance.ts` | Premium gating in compose layer |
| `src/features/daily-guidance/services/load-daily-guidance.ts` | `resolvePremiumAccess` + rune deep load |
| `src/features/daily-guidance/types/daily-guidance-view-model.ts` | `premiumActive`, deep fields |
| `src/features/runes/services/rune-entitlement.ts` | Uses shared premium resolver |
| `src/app/[locale]/today/page.tsx` | `mystic-today-column` layout |
| `src/messages/en.json`, `ru.json` | Polished Today + premium copy |

**Unchanged:** numerology/moon/rune engines, `selectDailyRune`, `calculatePersonalDay`, Firestore contracts.

---

## Visual hierarchy decisions

| Order | Web Phase 5 | Flutter |
|-------|-------------|---------|
| 1 | Date + greeting + Mystic wordmark | Hero greeting |
| 2 | Primary focus + one clear step | Combined guidance headline |
| 3 | **Large rune anchor** (centered) | 272px `RuneHeroSigil` |
| 4 | Personal day rhythm | Numerology section |
| 5 | Moon rhythm | Moon phase block |
| 6 | Premium deep / reflection OR lock card | Premium-gated lower sections |

Max width: `mystic-today-column` (420px).

---

## Free/premium gating decision

| Content | Free | Premium (`isPremium` / `premiumOverride` / `isOwner`) |
|---------|------|------------------------------------------------------|
| Primary summary + one action | Yes | Yes |
| Rune short + hero visual | Yes | Yes |
| Rune deep + separate rune action | Hidden + lock flag | Shown |
| Moon short | Yes | Yes |
| Moon deep + moon action | Hidden + lock flag | Shown |
| Reflection (`avoidAdvice`) | Hidden | Shown |

No client-side premium writes. No fake unlock. CTA: “Mystic Plus coming soon” → `/profile`.

---

## Entitlement source

`resolvePremiumAccess(profile)` reads existing `users/{uid}` fields:
- `isPremium`
- `premiumOverride`
- `isOwner`

Same logic as `resolveRuneContentAccess`.

---

## Deterministic logic preserved

Engines and selectors unchanged. Compose layer only filters which fields appear in the view model based on `premiumActive`.

---

## Remaining Today gaps

| Gap | Phase |
|-----|-------|
| 272px rune on large desktop (web uses ~216px max) | Optional polish |
| Cinematic top nav with avatar | Future shell work |
| Ask Mystic CTA | Out of V1 |
| Live paywall route | Payments phase |
| Editorial reveal motion | Future motion pass |

---

## Next phase recommendation

**Phase 6 — Moon and Rune screen polish using the established Mystic visual system.**
