# Numerology Port Report

## Flutter files inspected

- `lib/services/daily_guidance/personal_day_numerology_service.dart`
- `lib/data/daily_guidance/personal_day_guidance_dataset.dart`
- `lib/core/utils/card_cluster_utils.dart` (`reduceToDigit1to9`)
- `lib/models/daily_guidance/numerology_daily_data.dart`
- `lib/services/daily_guidance/daily_guidance_composer.dart` (date stripping)
- `lib/services/daily_guidance/daily_guidance_loader.dart` (`DateTime.now()` calculation date)

Flutter project was **not modified**.

## Formula ported

```text
raw = forDate.day + forDate.month + forDate.year + dob.day + dob.month
personalDay = reduceToDigit1to9(raw)
```

Birth year is **not** used in the Today Sujok path.

## Reduction rules

- Absolute value
- `0 → 1`
- Repeated digit-sum until `1..9`
- Final `0 → 1`

Matches `reduceToDigit1to9` in `card_cluster_utils.dart`.

## Date handling

- DOB stored as Firestore Timestamp with date-only read semantics
- Internal ISO `YYYY-MM-DD` strings for calculation inputs
- No `new Date("YYYY-MM-DD")` parsing for business logic
- Calculation date uses browser timezone cookie (`vedunya_tz`) with UTC fallback
- Timezone edge cases covered in unit tests

## Content contract

- Digits 1–9
- Fields: `title`, `summary`, `doAdvice`, `avoidAdvice`
- EN/RU maps ported verbatim

## Deterministic seed contract

Audited Flutter dataset has **no variant arrays**. Web reproduces fixed copy per digit/locale. Seed helpers exist for future parity if variants are added elsewhere.

## Parity fixtures

All 12 Sujok fixtures from `docs/migration/parity-test-cases.md` are covered, plus reduction, stability, invalid DOB, timezone, and bootstrap idempotency tests.

## Excluded legacy numerology logic

- `lib/core/utils/numerology_service.dart` classical pipeline
- Master numbers
- Personal year/month chains for Today

## Known content-quality issues

- `avoidAdvice` is cautionary copy, surfaced under a reflection label on web
- Editorial refresh deferred intentionally for parity

## Migration risks

- Server timezone fallback is UTC until the client timezone cookie is set
- Live Firebase verification requires real `.env.local` credentials from Boris
- Firestore rules must continue to block client writes to protected public fields

## Web implementation map

```text
src/features/numerology/
  engine/
  content/
  services/
  components/
  tests/
```

Server loader: `load-current-personal-day.ts`  
Today integration: `src/app/[locale]/today/page.tsx` (`dynamic = "force-dynamic"`)

## Commands

```powershell
npm run numerology:check -- --dob=1990-03-15 --date=2026-06-13 --locale=en
npm test
npm run verify:firebase
```
