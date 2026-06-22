# Mystic Parity Test Cases

Synthetic deterministic fixtures for web migration QA. **No real user data.**

**Timezone assumption:** device-local calendar date parts only (matches Flutter `DateTime` year/month/day usage). Moon engine uses UTC instant derived from local `DateTime` — document UTC edge cases separately in moon stage.

**Sources:**

- Sujok numerology: `lib/services/daily_guidance/personal_day_numerology_service.dart`
- Classical numerology: `lib/core/utils/numerology_service.dart`
- Rune selection: `lib/services/daily_guidance/rune_daily_service.dart`, `lib/core/runes/runes_collection.dart`
- Rune order: `lib/core/runes/runes_collection.dart` (`allRunes` array)

---

## Shared primitives

```typescript
function sumDigits(n: number): number {
  let sum = 0;
  let x = Math.abs(Math.floor(n));
  while (x > 0) {
    sum += x % 10;
    x = Math.floor(x / 10);
  }
  return sum;
}

function reduceToDigit1to9(value: number): number {
  let n = Math.abs(value);
  if (n === 0) return 1;
  while (n > 9) {
    n = sumDigits(n);
  }
  return n === 0 ? 1 : n;
}

function reduceNumber(n: number, allowMaster = true): number {
  let x = Math.abs(n);
  if (x === 0) return 0;
  if (allowMaster && (x === 11 || x === 22 || x === 33)) return x;
  while (x > 9 && !(allowMaster && (x === 11 || x === 22 || x === 33))) {
    x = sumDigits(x);
  }
  return x;
}
```

---

## Numerology — Sujok (Today authoritative)

Formula:

```
raw = forDate.day + forDate.month + forDate.year + dob.day + dob.month
personalDay = reduceToDigit1to9(raw)
```

| # | DOB | Calculation date | TZ | Raw sum | Expected PD |
|---|-----|------------------|-----|---------|-------------|
| 1 | 1990-03-15 | 2026-06-13 | local | 2063 | **2** |
| 2 | 1985-11-29 | 2026-01-01 | local | 2068 | **7** |
| 3 | 1977-07-07 | 2026-06-13 | local | 2059 | **7** |
| 4 | 2000-02-29 | 2026-03-01 | local | 2061 | **9** |
| 5 | 1999-12-31 | 2026-12-31 | local | 2112 | **6** |
| 6 | 1988-08-08 | 2026-08-08 | local | 2058 | **6** |
| 7 | 1995-05-05 | 2026-05-05 | local | 2046 | **3** |
| 8 | 1992-02-02 | 2026-02-02 | local | 2034 | **9** |
| 9 | 1980-01-01 | 2026-01-01 | local | 2030 | **5** |
| 10 | 2005-09-09 | 2026-09-09 | local | 2062 | **1** |
| 11 | 1993-06-06 | 2026-06-06 | local | 2050 | **7** |
| 12 | 1970-04-04 | 2026-04-04 | local | 2042 | **8** |

### Fixture #1 detail (reference)

```
DOB: 1990-03-15
Date: 2026-06-13
raw = 13 + 6 + 2026 + 15 + 3 = 2063
2063 → 2+0+6+3 = 11 → 1+1 = 2
Expected Sujok personal day: 2
```

---

## Numerology — Classical (profile / legacy)

Formula chain:

```
personalYear  = reduceNumber(sumDigits(dob.day) + sumDigits(dob.month) + sumDigits(forDate.year))
personalMonth = reduceNumber(personalYear + forDate.month)
personalDay   = reduceToDigit1to9(reduceNumber(personalMonth + forDate.day))
```

| # | DOB | Date | PY | PM | PD 1–9 |
|---|-----|------|----|----|--------|
| 1 | 1990-03-15 | 2026-06-13 | 1 | 7 | 2 |
| 2 | 1985-11-29 | 2026-01-01 | 5 | 6 | 7 |
| 3 | 1977-07-07 | 2026-06-13 | 6 | 3 | 7 |
| 4 | 2000-02-29 | 2026-03-01 | 5 | 8 | 9 |
| 5 | 1999-12-31 | 2026-12-31 | 8 | 2 | 6 |
| 6 | 1988-08-08 | 2026-08-08 | 8 | 7 | 6 |
| 7 | 1995-05-05 | 2026-05-05 | 2 | 7 | 3 |
| 8 | 1992-02-02 | 2026-02-02 | 5 | 7 | 9 |
| 9 | 1980-01-01 | 2026-01-01 | 3 | 4 | 5 |
| 10 | 2005-09-09 | 2026-09-09 | 1 | 1 | 1 |
| 11 | 1993-06-06 | 2026-06-06 | **22** | 1 | 7 |
| 12 | 1970-04-04 | 2026-04-04 | 9 | 4 | 8 |

**Master number case (#11):** `personalYear = 22` preserved by `reduceNumber` before month/day chain.

**Sujok vs classical divergence:** same PD in fixtures #1–#10 for listed dates except when classical PY is master — still verify both pipelines independently.

---

## Daily rune selection

Formula:

```
dayOfYear = forDate.difference(DateTime(forDate.year, 1, 1)).inDays  // local
seed = personalDayNumber * 1009 + dayOfYear + forDate.month * 31
runeIndex = seed % 24
runeKey = ELDER_FUTHARK_ORDER[runeIndex]
```

| # | DOB | Date | Sujok PD | dayOfYear | Seed | Index | Expected rune |
|---|-----|------|----------|-----------|------|-------|---------------|
| 1 | 1990-03-15 | 2026-06-13 | 2 | 163 | 2367 | 15 | **sowilo** |
| 2 | 1985-11-29 | 2026-01-01 | 7 | 0 | 7094 | 14 | **algiz** |
| 3 | 1977-07-07 | 2026-06-13 | 7 | 163 | 7412 | 20 | **laguz** |
| 4 | 2000-02-29 | 2026-03-01 | 9 | 59 | 9233 | 17 | **berkano** |
| 5 | 1999-12-31 | 2026-12-31 | 6 | 364 | 6790 | 22 | **dagaz** |
| 6 | 1988-08-08 | 2026-08-08 | 6 | 219 | 6521 | 17 | **berkano** |
| 7 | 1995-05-05 | 2026-05-05 | 3 | 124 | 3306 | 18 | **ehwaz** |
| 8 | 1992-02-02 | 2026-02-02 | 9 | 32 | 9175 | 7 | **wunjo** |
| 9 | 1980-01-01 | 2026-01-01 | 5 | 0 | 5076 | 12 | **eihwaz** |
| 10 | 2005-09-09 | 2026-09-09 | 1 | 251 | 1539 | 3 | **ansuz** |
| 11 | 1993-06-06 | 2026-06-06 | 7 | 156 | 7405 | 13 | **perthro** |
| 12 | 1970-04-04 | 2026-04-04 | 8 | 93 | 8289 | 9 | **nauthiz** |

### Alias normalization tests

| Input key | Expected canonical | Firestore doc ID |
|-----------|-------------------|------------------|
| `raidho` | `raido` | `runes/raido` |
| `kano` | `kenaz` | `runes/kenaz` |
| `berkana` | `berkano` | `runes/berkano` |
| `turisaz` | `thurisaz` | `runes/thurisaz` |
| `nautiz` | `nauthiz` | `runes/nauthiz` |
| `sowulo` | `sowilo` | `runes/sowilo` |
| `eiwaz` | `eihwaz` | `runes/eihwaz` |
| `pertha` | `perthro` | `runes/perthro` |

---

## Locale fallback

| Scenario | Input | Expected behavior |
|----------|-------|-------------------|
| Rune modular message missing RU | `locale=ru`, rune module has EN only | Fall back to `messages['en']` per `getRuneOfDay` |
| Firestore rune missing RU translation | Insights load | Fall back to EN translation in `RuneContentService` |
| Notification copy missing state doc | Unknown `dailyStateId` | Embedded bank in `notification_copy_provider.dart` |
| Sanity library fetch fails | Network timeout | `localV1CourseCatalog` merged rows |
| Lunar day doc missing | `lunar_days/{n}` null | Empty lunar strings; guidance still composes |
| Moon phase doc missing | `moon_phases/{id}` | `fallbackMoonPhaseById()` bundled map |

---

## Missing DOB

| Profile state | Expected Today result |
|---------------|----------------------|
| `profileComplete=false` | Fallback: `guidance_fallback_incomplete` (EN/RU via `AppStrings`) |
| `profileComplete=true`, `dob=null` | Fallback: `guidance_fallback_no_dob` |
| Onboarding preview with DOB set | Full pipeline via `loadOnboardingPreview` — same compose as signed-in |

---

## Free vs premium output

| Surface | Free user sees | Premium user sees |
|---------|----------------|---------------------|
| Today moon block | `short` text only | `short + deep`; `action` text populated |
| Today rune action section | Locked CTA → paywall | `actionAdvice` + optional `deep` |
| Insights topic sections | Headings/teaser; bodies locked | Full Firestore `insights` bodies |
| Moon tab lunar day | Short copy | action, deep, warning, ritual, reflection |
| Midday notification | Not scheduled | Scheduled 13:00 |
| Mirror moment notifications | Disabled in settings | Available when toggle on |
| Library `accessType.premium` | Paywall | Opens for subscribers |
| Library `accessType.paid` | Purchase CTA (RevenueCat product) | Opens after `ownsProduct` |

**Premium resolution test matrix:**

| isOwner | premiumOverride | RC premium | Super-admin email | Expected premium |
|---------|-----------------|------------|-------------------|------------------|
| false | false | false | false | **free** |
| false | false | true | false | **premium** |
| false | true | false | false | **premium** |
| true | false | false | false | **premium** |
| false | false | false | true | **premium** |

---

## Course progress

| Scenario | Expected behavior |
|----------|-------------------|
| New user opens `runes_24_inner_strength` lesson 1 | Firestore doc created with `lastLessonId`, `completedLessonIds=[]` |
| Complete all 28 local lessons | `isCompleted=true`, `progressPercent=100` |
| Resume after close | `lastOpenedLessonId` or first incomplete lesson index |
| Paid course without purchase | `LibraryCourseAccess.canOpenCourse` false → commerce CTA |
| Super-admin email | `SuperAdminCourseEntitlement` bypasses paid check |

**Lesson ID convention (local runtime):** `living-05-fehu` … `living-28-othala` (not Sanity `mystic-rune-fehu` IDs).

---

## Moon engine spot check (2026-06-13 local noon)

Use UTC-normalized instant from local `DateTime`. Expected phase8 for mid-June 2026 synodic cycle: approximately **waning gibbous** (verify against Flutter `MoonEngineService.calculate` in integration test — illumination ~75–95%).

**Web must port exact constants:**

```
SYNODIC_MONTH = 29.53058867
REFERENCE_NEW_MOON_JD = 2451550.1
lunarDayNumber = floor(moonAgeDays) + 1, clamp 1..30
```

Recompute fixtures with the shared primitives in this document whenever formulas change.
