# Phase 19D — Today numerology explanation + request-first order

## Flutter numerology files inspected (read-only)

| File | Notes |
|------|--------|
| `lib/data/numerology_meanings.dart` | Personal day 1–9 meanings source |
| `lib/core/utils/numerology_service.dart` | Builds readings from meanings |
| `lib/core/utils/personal_day_utils.dart` | Personal day calculation |
| `lib/core/i18n/strings.dart` | `today_numerology_section_title`, `main_oracle_numerology_title` |
| `lib/services/daily_guidance/personal_day_numerology_service.dart` | Daily personal day integration |

Web already ports Mystic copy in Phase 17/18:

- `src/features/numerology/content/personal-day-content.en.ts`
- `src/features/numerology/content/personal-day-content.ru.ts`
- `src/features/numerology/content/personal-day-content.ts`

## Removed generic daily guidance on Today

Signed-in Today no longer renders `PrimaryGuidanceCard` (`ПОДСКАЗКА ДНЯ` / `Today's guidance`).

Underlying `composePrimaryMessage` and preview/anonymous flows are unchanged.

## New Today order

```text
1. Header (MYSTIC by Vedunya Maria + date + greeting)
2. Просьба к Вселенной / Request to the Universe (collapsed)
3. Число дня / Number of the day (rich numerology card)
4. Rune (compact)
5. Moon (compact)
6. Premium/deeper content
7. Bottom nav
```

## Request card behavior

- First content block after greeting
- Collapsed by default (`useState(false)`)
- No category chips
- Existing EN/RU copy unchanged

## Numerology card

**Component:** `src/features/today/components/today-numerology-card.tsx`

**Content source:** `composeNumerologySection` → `PersonalDayResult.content` from `personal-day-content.{en,ru}.ts` (Mystic parity)

**Shows:**

- Label: `ЧИСЛО ДНЯ` / `Number of the day`
- Gold number medallion (no `#`)
- Mystic title (e.g. `Завершение` / `Completion`)
- Mystic summary explanation
- Focus panel with `doAdvice` (e.g. `Фокус:` / `Focus:`)

## Rune / Moon

`TodayRhythmStrip` now shows only rune + moon compact cards below numerology.

## Files changed

| File | Change |
|------|--------|
| `daily-guidance-authenticated.tsx` | Reorder; remove `PrimaryGuidanceCard` |
| `today-numerology-card.tsx` | **New** premium numerology card |
| `today-rhythm-strip.tsx` | Rune + moon only |
| `compose-daily-guidance.ts` | Numerology section uses `summary` + `focus` |
| `daily-guidance-view-model.ts` | `PersonalDayIndicatorData` fields |
| `mystic-theme.css` | Numerology medallion styles |
| `en.json` / `ru.json` / `de.json` | `numerologyCard` labels |
| Tests | phase-19d + hierarchy test updates |

## Tests added

`src/features/today/tests/phase-19d-today-numerology-request-order.test.ts`

## Manual QA

After `npm run dev`, verify `/ru/today` and `/en/today` at ~390–430px:

- Request card first after greeting
- No `ПОДСКАЗКА ДНЯ` / `Today's guidance`
- Numerology shows Mystic title + explanation + focus
- Rune and Moon below numerology
- Request collapsed until tapped

## Known gaps

- Anonymous/preview Today still uses `PrimaryGuidanceCard` (intentional)
- `heroEyebrow` message keys remain for preview/other flows
- German numerology card labels use English fallback until manual DE translation

## Safety

- No commit / push / deploy
- `.env.local` untouched
- Flutter untouched
- Numerology formulas unchanged
- No secrets printed
