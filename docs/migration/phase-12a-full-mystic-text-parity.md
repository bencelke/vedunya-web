# Phase 12A — Full Mystic text parity

## Objective

Audit and polish all visible app copy so Vedunya Web matches the Mystic Flutter tone: calm, human, premium, grounded — not robotic translation or debug prototype wording.

## Routes audited

| Route | Focus |
|-------|--------|
| `/en`, `/ru` | Landing hero, preview, how-it-works, CTAs |
| `/en/login`, `/ru/login` | Auth titles, errors, Google/Apple, legal notice |
| `/en/onboarding`, `/ru/onboarding` | Welcome, name, DOB, language, ready |
| `/en/today`, `/ru/today` | Greeting, focus, personal day, moon, rune, locks |
| `/en/moon`, `/ru/moon` | Phase, lunar day, practice, premium lock |
| `/en/runes/*`, `/ru/runes/*` | Meaning, action, reflection, premium lock |
| `/en/courses`, `/ru/courses` | Catalog, lessons, progress, locked states |
| `/en/profile`, `/ru/profile` | Account, PWA, notifications, subscription placeholder |
| `/en/offline`, `/ru/offline` | Offline shell copy |

## Flutter copy sources inspected (read-only)

- `lib/core/i18n/strings.dart` — main EN/RU app strings
- `lib/core/i18n/auth_localizations.dart` — auth entry tone
- `lib/features/main/oracle_screen.dart` — Today screen structure
- `lib/features/onboarding/onboarding_flow.dart` — onboarding flow
- `lib/features/profile/notification_settings_screen.dart` — reminder copy patterns
- `lib/features/premium/premium_paywall_screen.dart` — Mystic Plus wording

Flutter was **not modified**.

## Web copy sources inspected

- `src/messages/en.json`
- `src/messages/ru.json`
- `src/features/numerology/content/personal-day-content.ru.ts` (verified RU parity)
- Component hardcoded strings grep — no major leaks found outside message files

## Issues found

1. **RU English leaks:** `guidance`, `onboarding`, `preview`, `production` jargon in user-visible RU strings
2. **Prototype/debug tone:** `signedInPreview` referenced “next release”; `mockNotice` sounded like disconnected backend
3. **Auth config copy:** referenced `.env.local` in user-facing Firebase-missing state (bad on production)
4. **Notifications RU:** “утреннее guidance”, “вечерняя рефлексия”, “production-сборке”
5. **Courses/profile RU:** mostly good; catalog already “Пути знания”
6. **Trust disclaimer:** missing — prepared for Phase 12F

## Files modified

- `src/messages/en.json` — EN polish, trust disclaimer, config copy, onboarding tone
- `src/messages/ru.json` — full RU natural-language pass
- `src/features/onboarding/tests/onboarding-parity.test.ts` — DOB body assertion
- `src/features/brand/tests/phase-12a-full-mystic-text-parity.test.ts` — new
- `docs/migration/phase-12a-full-mystic-text-parity.md` — this document

## RU fixes (summary)

- Replaced visible `guidance` → подсказка / поддержка / ежедневная практика
- Replaced `onboarding` → настройка
- Notifications: утренняя подсказка, вечернее размышление
- Removed `production` jargon from user strings
- Profile language labels: Английский / Русский
- Premium lock: natural Russian, kept Mystic Plus product name

## EN fixes (summary)

- Calmer premium lock bodies
- Auth: “daily practice” instead of repetitive “daily guidance”
- Onboarding welcome aligned with Flutter ritual tone
- Config/error states environment-neutral (no `.env.local` in UI)
- `trust.disclaimer` added for future legal surfaces
- Removed “next release” from `signedInPreview`

## Brand wording decisions

| Context | Wording |
|---------|---------|
| Main headers | Vedunya Maria |
| Product/legal | Mystic by Vedunya Maria |
| PWA / install / push | Mystic (short product name) |
| Subscription | Mystic Plus |

## Known remaining copy gaps

- Firestore-backed rune/moon body text — content team / CMS parity not in this pass
- `courses` lesson bodies in generated TS — Flutter parity for 28 lessons is separate
- Full legal/terms/privacy pages — Phase 12F
- Request the Universe — Phase 12B
- Logo visual polish — later pass

## Tests added/updated

- **New:** `phase-12a-full-mystic-text-parity.test.ts` (RU leak scan, EN polish, trust disclaimer, brand, key parity)
- **Updated:** `onboarding-parity.test.ts`

## Safe for Phase 12B?

**Yes.** Visible message copy is polished; deterministic engines, Firestore contracts, and feature scope unchanged. Ready for Request the Universe as main Today feature.

## Constraints honored

- Flutter not modified
- `.env.local` not touched
- No commit / push in this phase
