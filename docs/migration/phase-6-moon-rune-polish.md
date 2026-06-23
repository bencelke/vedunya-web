# Phase 6 — Moon and Rune Polish

Moon and Rune screens polished to match Mystic Flutter visual hierarchy and Phase 5 Today cosmic system, with premium/free content gating review.

---

## Flutter Moon/Rune files inspected

| File | Notes |
|------|-------|
| `lib/features/moon/moon_phase_screen.dart` | 224px phase hero, phase meaning → lunar day section, premium lunar fields gated |
| `lib/widgets/moon/moon_phase_hero.dart` | Cinematic phase visual |
| `lib/services/daily_guidance/moon_engine_service.dart` | Moon calculation (unchanged on web) |
| `lib/services/daily_guidance/lunar_day_content_service.dart` | Lunar day Firestore content |
| `lib/services/rune_content_service.dart` | Rune deep content loading |
| `lib/widgets/runes/rune_hero_sigil.dart` | Large rune sigil anchor |
| `lib/features/insights/widgets/rune_insights_sections.dart` | Deep field hierarchy reference |

**Not copied to web V1:** Manual moon location, lunar timing bottom sheet, Insights tab, live paywall.

---

## Web Moon/Rune files created/modified

### Created

| Path | Purpose |
|------|---------|
| `src/features/moon/components/moon-hero.tsx` | Large phase visual + title |
| `src/features/moon/components/moon-phase-card.tsx` | Phase meaning + gated practice |
| `src/features/moon/components/moon-lunar-day-card.tsx` | Lunar day section with gating |
| `src/features/moon/components/moon-premium-lock-card.tsx` | Re-exports Today lock card |
| `src/features/moon/components/moon-screen.tsx` | Moon route shell |
| `src/features/moon/utils/moon-premium-content.ts` | Premium content detection |
| `src/features/runes/components/rune-hero.tsx` | Large rune sigil anchor |
| `src/features/runes/components/rune-meaning-card.tsx` | Short meaning card |
| `src/features/runes/components/rune-field-card.tsx` | Premium field cards |
| `src/features/runes/components/rune-detail-screen.tsx` | Rune route composition |
| `src/features/runes/components/rune-premium-lock-card.tsx` | Lock CTA |
| `src/features/runes/services/apply-rune-content-access.ts` | Strip premium at load |
| `src/features/moon/tests/moon-rune-ui-parity.test.ts` | UI + gating tests |

### Modified

| Path | Change |
|------|--------|
| `src/features/moon/components/moon-guidance-section.tsx` | Mystic hierarchy + lock card |
| `src/features/moon/components/moon-error-state.tsx` | Cosmic card styling |
| `src/features/moon/services/load-current-moon-guidance.ts` | Premium resolve + `showPremiumLock` |
| `src/features/moon/types/moon.ts` | `premiumActive`, `showPremiumLock` |
| `src/app/[locale]/moon/page.tsx` | Uses `MoonScreen` |
| `src/features/runes/components/rune-detail-content.tsx` | Gated premium sections |
| `src/features/runes/services/load-current-daily-rune.ts` | Strip premium fields at load |
| `src/features/runes/types/rune.ts` | `showPremiumLock` on detail |
| `src/app/[locale]/runes/[runeId]/page.tsx` | Mystic layout + metadata |
| `src/messages/en.json`, `ru.json` | Polished Moon/Rune copy |

**Unchanged:** moon/rune engines, alias map, Firestore contracts, Today deterministic logic.

---

## Moon screen visual decisions

| Order | Section |
|-------|---------|
| 1 | Moon rhythm eyebrow + 200px phase visual |
| 2 | Phase title + lunar day label |
| 3 | Phase meaning card (short; deep if premium) |
| 4 | Lunar day card (short; deep/action if premium) |
| 5 | Mystic Plus lock card (free users when deep exists) |

Max width: `mystic-today-column` (420px).

---

## Rune detail visual decisions

| Order | Section |
|-------|---------|
| 1 | Back to Today link |
| 2 | Large rune sigil (~168–216px) |
| 3 | Rune name + focus label |
| 4 | Short meaning (free) |
| 5 | Deep / action / boundary / affirmation / reflection (premium only) |
| 6 | Mystic Plus lock card (free users when premium content exists) |

Alias redirect preserved: `raidho` → `raido`.

---

## Premium/free gating decision

| Content | Free | Premium |
|---------|------|---------|
| Moon phase short | Yes | Yes |
| Moon phase deep/action/reflection | Hidden + lock | Shown |
| Lunar day short | Yes | Yes |
| Lunar day deep/action/reflection | Hidden + lock | Shown |
| Rune short meaning | Yes | Yes |
| Rune deep/action/warning/affirmation/reflection | Stripped at load + lock | Shown |

Entitlement: `resolvePremiumAccess` (`isPremium`, `premiumOverride`, `isOwner`).

---

## Deterministic logic preserved

Moon phase calculation, lunar day calculation, rune selection, alias map, and Firestore-first loading unchanged. Gating is display/load filtering only.

---

## Remaining gaps

| Gap | Phase |
|-----|-------|
| 224px moon hero on large desktop | Optional polish |
| Manual moon location preferences | Future |
| Lunar timing bottom sheet | Post-V1 |
| Insights tab depth parity | Post-V1 |
| Live paywall route | Payments phase |

---

## Next phase recommendation

**Phase 7 — Courses/Library migration and lesson reader parity.**
