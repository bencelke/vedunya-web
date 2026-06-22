# Numerology Content Review

Migration review for Sujok personal-day copy ported from Flutter `PersonalDayGuidanceDataset`.

## Source

- `mystic_app/lib/data/daily_guidance/personal_day_guidance_dataset.dart`
- `mystic_app/lib/models/daily_guidance/numerology_daily_data.dart`

## Fields ported

| Flutter field | Web field | Notes |
|---------------|-----------|-------|
| `personalDayNumber` | `calculation.personalDayNumber` | Clamped 1–9 |
| `title` | `content.title` | EN + RU |
| `summary` | `content.summary` | Short daily guidance |
| `doAdvice` | `content.doAdvice` | Practical action |
| `avoidAdvice` | `content.avoidAdvice` | Shown as reflection on web Today card |

## Missing fields

- No premium/free split in the audited Sujok dataset
- No multi-variant arrays in the audited dataset
- No AI interpretation layer
- No classical numerology meanings from `numerology_service.dart`

## Missing translations

- None for digits 1–9 in EN/RU — both locales are complete in the audited source

## Editorial follow-up

- EN/RU copy is ported verbatim for parity
- Wording should receive a later editorial review before public marketing refresh
- `avoidAdvice` is labeled “Reflection” on web for calmer UX; source field name remains `avoidAdvice`

## Deliberately excluded legacy content

- Classical profile numerology (`lifePath`, personal year/month chains)
- Master numbers (11/22/33)
- Legacy numerology datasets outside `personal_day_guidance_dataset.dart`
- Moon, rune, editorial premium merge copy

## Deterministic selection

Flutter Today uses one fixed string per digit and locale. No `Math.random()` or timestamp seed is applied in the audited Sujok content path.
