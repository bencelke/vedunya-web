# Phase 19C — Premium Today visual pass + language dropdown with German support

## Flutter reference inspected (read-only)

| File | Finding |
|------|---------|
| `lib/widgets/layout/mystic_background.dart` | Full-screen JPEG + `overlayOpacity` 0.34, top linear gradient, radial vignette, center-column wash |
| `lib/widgets/common/cosmic_background.dart` | Photo base + top/bottom darkening + subtle gold radial glow (`goldGlow` at 0.045 alpha) |
| `lib/theme/cosmic_tokens.dart` | `cinematicBackgroundAsset` → `assets/background/background-jpg.jpg`, `voidDeep` `#0B0D14` |
| `lib/theme/mystic_chrome_tokens.dart` | Translucent chrome over starfield, gold accents |
| `assets/background/background-jpg.jpg` | Source cosmic starfield image (311 KB) |

## Today visual changes

### Background
- Copied Flutter asset to `public/assets/backgrounds/app-background.jpg`
- Enhanced `.mystic-app-page` in `mystic-theme.css`:
  - `::before` — starfield JPEG (fixed, cover)
  - `::after` — layered dark gradient, gold radial glow, vignette (Flutter parity)

### Daily guidance card
- Added `mystic-guidance-hero` and `mystic-guidance-action` classes
- Deeper glass surface, gold eyebrow, existing deterministic copy unchanged

### Rhythm cards
- Replaced 3-column chips with **stacked compact cards** (`flex flex-col gap-3`)
- New `mystic-rhythm-card` / `mystic-rhythm-value` styling
- **Removed `#` / Hash icon** from Number card — shows label + number only

### Request card
- Unchanged from Phase 19B: collapsed by default, below guidance/rhythm

### Layout order (preserved)
1. Brand header → 2. Date + greeting → 3. Guidance → 4. Rhythm → 5. Request → 6. Bottom nav

## Language dropdown

- New `LanguageDropdown` component (`src/components/i18n/language-dropdown.tsx`)
- Globe icon + native `<select>` with display names
- Replaces EN/RU pill toggles in `AppHeader` and `AuthLanguageBar`
- Options: English, Русский, Deutsch

## German support strategy

**Approach: real `/de` route with English fallback** (preferred)

| Item | Implementation |
|------|----------------|
| Routing | `supportedLocales: ["en", "ru", "de"]` in `app-config.ts`; `routing.ts` and `proxy.ts` pick up automatically |
| Messages | `src/messages/de.json` — full structural copy of `en.json` (English text, no machine German) |
| Spiritual content | `resolveSpiritualContentLocale()` maps `de` → `en` for numerology/runes/moon |
| Backlog | `docs/i18n/german-translation-backlog.md` |

## Tests added

`src/features/today/tests/phase-19c-premium-today-language-dropdown.test.ts`

- Premium background asset/class
- No Hash on number card
- Guidance → rhythm → request hierarchy
- Request collapsed by default
- Language dropdown (not pills)
- German locale scaffold + de.json parity with en
- Spiritual content fallback for `de`
- Reload loop guards preserved

Updated `phase-9-3-brand-locale-rune-polish.test.ts` for `resolveSpiritualContentLocale` and rhythm strip sigil.

## Manual QA

| Check | Result |
|-------|--------|
| `/en/today` | HTTP 200 — `mystic-app-page`, `mystic-guidance-hero`, `mystic-language-select`, brand wordmark present |
| `/ru/today` | HTTP 200 |
| `/de/today` | HTTP 200 — English fallback UI; no visible `>undefined<` in HTML |
| `/de/login`, `/de/` | HTTP 200 |
| Background asset | `GET /assets/backgrounds/app-background.jpg` → 200 |
| No `#` on number card | `Hash` icon removed from `today-rhythm-strip.tsx` |
| Language dropdown | Globe + `<select>` with English / Русский / Deutsch |
| Idle 90s GET spam | Not automated (requires signed-in browser session); reload-loop guards preserved in code from Phase 19A.1 |

## Known gaps

- `de.json` contains English fallback — manual German translation required (see backlog)
- Profile language picker still EN/RU only (intentional; not in scope)
- Spiritual content engines (numerology/runes/moon JSON) have no `de` locale yet

## Confirmations

- No commit
- No push
- No deploy
- `.env.local` untouched
- Flutter / `mystic_app` untouched
- No secrets printed
- Auth logic unchanged
- Onboarding flow unchanged
