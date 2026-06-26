# Phase 19E — Flutter Mystic Today parity

Signed-in Today screen redesigned to match Mystic Flutter oracle layout: dark cosmic background, editorial sections over the starfield, MYSTIC top chrome, and floating glass bottom navigation.

## Flutter files inspected (read-only)

| Area | Path |
|------|------|
| Today shell | `lib/features/main/oracle_screen.dart` |
| Home shell + bottom nav | `lib/features/home/home_shell.dart`, `lib/widgets/navigation/mystic_bottom_nav.dart` |
| Daily guidance panel | `lib/features/daily_guidance/daily_guidance_panel.dart` |
| Top wordmark chrome | `lib/widgets/navigation/mystic_top_nav.dart` (`MysticTopWordmarkBar` / `MysticCinematicTopNav`) |
| Section divider | `lib/widgets/chrome/mystic_section_divider.dart` |
| Mystic Plus pill CTA | `lib/widgets/common/mystic_gold_pill_button.dart` |
| Strings | `lib/core/i18n/strings.dart` (`today_numerology_section_title`, `main_oracle_rune_title`, etc.) |
| Background | `lib/widgets/layout/mystic_background.dart` |

## Web files changed

| File | Change |
|------|--------|
| `src/app/[locale]/today/page.tsx` | Omit `AppHeader` for signed-in users |
| `src/features/daily-guidance/components/daily-guidance-experience.tsx` | `TodayOracleHeader` + oracle greeting variant |
| `src/features/daily-guidance/components/daily-guidance-header.tsx` | `variant="oracle"` greeting-only mode |
| `src/features/daily-guidance/components/daily-guidance-authenticated.tsx` | Editorial section order + Mystic Plus panel |
| `src/features/today/components/today-oracle-header.tsx` | **New** — MYSTIC + profile + divider |
| `src/features/today/components/today-rune-section.tsx` | **New** — large rune hero |
| `src/features/today/components/today-moon-section.tsx` | **New** — large moon hero |
| `src/features/today/components/today-numerology-section.tsx` | **New** — text-first numerology |
| `src/features/today/components/today-mystic-plus-panel.tsx` | **New** — gold pill lock |
| `src/features/universe-request/components/universe-request-empty-state.tsx` | Soft `mystic-today-request-panel` |
| `src/features/universe-request/components/universe-request-active-card.tsx` | Soft request panel |
| `src/components/layout/bottom-navigation.tsx` | Floating glass nav with gold active pill |
| `src/styles/mystic-theme.css` | Today tokens, editorial classes, floating nav |
| `src/app/globals.css` | Extra bottom safe-area for floating nav |
| `src/messages/en.json`, `ru.json`, `de.json` | `todaySections`, `oracleBrandA11y`, `openProfile` |
| `src/features/today/tests/phase-19e-flutter-today-parity.test.ts` | **New** |
| Prior phase tests | Updated for new component names / order |

Legacy components `today-numerology-card.tsx` and `today-rhythm-strip.tsx` remain in repo but are no longer used on signed-in Today.

## Background / colors

- Background: `public/assets/backgrounds/app-background.jpg` via `.mystic-app-page`
- Tokens added/aligned: `--mystic-bg`, `--mystic-surface`, `--mystic-surface-soft`, `--mystic-line`, `--mystic-text`, `--mystic-muted`, `--mystic-faint`
- Gold: `--mystic-gold: #c9aa63` (existing `--mystic-gold-soft` kept for subtle fills)
- Column width: `--today-max-width: 26.875rem` (~430px)

## Header parity

- Signed-in Today: centered **MYSTIC** wordmark, thin gold divider, circular profile icon → `/profile`
- No `LanguageDropdown` on Today (language stays in AppHeader on other routes / Profile later)
- Greeting block: date (gold overline) + time-of-day name greeting, centered

## Section order (signed-in)

1. Header: MYSTIC + divider + profile
2. Greeting / date
3. Request to Universe (collapsed soft panel)
4. Rune of the day (large sigil)
5. Moon cycle (large phase visual)
6. Numerology of the day (text-first: `5 — Title`, summary, focus)
7. Mystic Plus locked panel (when premium depth gated)
8. Bottom glass nav

## Request behavior

- Collapsed by default (`useState(false)`)
- No categories
- Soft translucent `mystic-today-request-panel` with gold border
- Backend field names unchanged

## Rune behavior

- `MysticRuneSigil` at 200px in gold circular outline
- Title + short explanation below, link to rune detail

## Moon behavior

- `MoonPhaseVisual` at 168px, centered
- Phase title + short summary, link to `/moon`

## Numerology behavior

- Title: `Нумерология дня` / `Numerology of the day`
- Headline: `{number} — {title}` (no `#`, no medallion card)
- Summary + focus from existing `personal-day-content.{en,ru}.ts`
- Energy line omitted (not in web content model)

## Bottom nav behavior

- Floating glass container (`mystic-chrome-nav--floating`)
- Rounded top, gold active pill background
- Routes unchanged: Today / Moon / Courses / Profile

## Tests added

`src/features/today/tests/phase-19e-flutter-today-parity.test.ts` — 15 assertions covering brand, order, heroes, numerology, premium honesty, nav, background, reload guards.

## Manual QA

- Dev server: `http://localhost:3001` (existing instance)
- `/ru/today`, `/en/today`: HTTP 200
- Anonymous preview still shows `Today's guidance` (preview only); signed-in flow removes `PrimaryGuidanceCard`
- Floating nav class present in HTML
- Mobile viewport visual check recommended before merge

## Idle reload check

- After loading `/ru/today` and `/en/today`, 90s idle: **no additional GET /today requests** in dev log

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass (1 pre-existing SW script warning) |
| `npm test` | **924/924** pass |
| `npm run build` | Pass |

## Known gaps

- Flutter shows combined guidance hero before rune; web intentionally omits `ПОДСКАЗКА ДНЯ` / `Today's guidance` per Phase 19D/19E
- Flutter numerology includes energy label; web omits until content model adds it
- Flutter bottom nav has Insights/Library/Feed tabs; web keeps Today/Moon/Courses/Profile (no broken routes added)
- `today-numerology-card.tsx` / `today-rhythm-strip.tsx` unused but retained
- German `de.json` uses English structural fallback for new section labels

## Safety confirmations

- No commit, push, or deploy
- `.env.local` untouched
- Flutter repo untouched
- No secrets printed
- Auth, onboarding, numerology engines unchanged
