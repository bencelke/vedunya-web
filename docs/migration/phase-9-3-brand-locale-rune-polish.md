# Phase 9.3 — Brand, Russian localization, and rune visual polish

## Issue observed

On `/ru/today`:

- Top wordmark showed `MYSTIC` instead of Vedunya branding
- Personal-day focus and action were English (`Expression`, `Say the thing`, `Share a draft...`)
- Rune sigil was nearly invisible (black SVG on dark circular background)

## Root cause

1. **Brand:** `daily-guidance-header.tsx` hardcoded `Mystic` as the Today wordmark.
2. **RU content:** `load-daily-guidance.ts` used `profile.language` for `contentLocale`, so an English-profile user on `/ru/today` received English numerology/rune copy even though the route was Russian.
3. **Rune visuals:** Web rune SVGs are black paths rendered with `next/image` and no gold color filter, unlike Flutter's `ColorFilter.mode(#F2E6C9)`.

## Files inspected

- Flutter: `lib/widgets/runes/rune_hero_sigil.dart`
- Web: `daily-guidance-header.tsx`, `load-daily-guidance.ts`, `personal-day-content.ru.ts`, `today-rune-anchor.tsx`, `rune-hero.tsx`, `mystic-theme.css`

## Files modified

- `src/features/daily-guidance/components/daily-guidance-header.tsx`
- `src/features/daily-guidance/services/load-daily-guidance.ts`
- `src/features/numerology/content/personal-day-content.ru.ts`
- `src/features/runes/components/mystic-rune-sigil.tsx` (new)
- `src/features/today/components/today-rune-anchor.tsx`
- `src/features/runes/components/rune-hero.tsx`
- `src/features/daily-guidance/components/daily-rune-summary.tsx`
- `src/styles/mystic-theme.css`
- `src/messages/en.json`, `src/messages/ru.json`
- Tests: `phase-9-3-brand-locale-rune-polish.test.ts`, `today-parity.test.ts`, `moon-rune-ui-parity.test.ts`

## Brand decision

Main app header and Today wordmark use **Vedunya Maria**. `Mystic` remains for product/PWA short name, Mystic Plus, and auth welcome copy where appropriate.

## RU localization fix

Today content now uses **route locale** (`/ru` → Russian, `/en` → English). Personal day 3 RU copy polished in `personal-day-content.ru.ts`.

## Rune visual fix

Added `MysticRuneSigil` with Flutter-inspired gold ring, parchment glyph filter (`#F3EDE3` / `#C4A86A` palette), and soft glow on dark cosmic background.

## Remaining visual gaps

- Auth onboarding still shows `Mystic` wordmark above logo (intentional product entry branding)
- Small inline `RuneSymbol` usages in preview cards not yet migrated to `MysticRuneSigil`
- Moon/rune detail pages on `/ru` with English profile may still use profile language in their dedicated loaders (out of Today scope)

## Safe to continue Phase 10?

Yes, after manual QA on `/ru/today` confirms Russian content, Vedunya Maria wordmark, and visible rune sigil.
