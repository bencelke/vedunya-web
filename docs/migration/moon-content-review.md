# Moon Content Review

## Phase content (fallback)

Source: `mystic_app/lib/data/daily_guidance/moon_phase_fallback_data.dart`

| Field | Ported |
|-------|--------|
| `id` | Yes — `new_moon`, `waxing`, `full_moon`, `waning` |
| `titleRu/En` | Yes |
| `shortRu/En` | Yes |
| `deepRu/En` | Yes (guidance on Moon page) |
| `actionRu/En` | Yes |
| `warningRu/En` | Yes (reflection label on web) |

## Lunar-day content

| Item | Status |
|------|--------|
| Audited Flutter fallback dataset | **Not present** — missing docs return null |
| Firestore `lunar_days/{1-30}` | Supported via Admin reads + Zod validation |
| Missing document behavior | Controlled missing state (calm UI copy) |

## Missing translations

- Phase fallback: complete EN/RU
- Lunar-day fallback files: intentionally empty (no audited source)

## Firestore precedence

1. `moon_phases/{phase4Id}` merged field-by-field over local fallback (matches Flutter `MoonPhaseService`)
2. `lunar_days/{dayNumber}` when present and valid
3. Local phase fallback when Firestore unavailable or doc missing
4. Lunar-day missing state when Firestore unavailable or doc missing/invalid

## Editorial follow-up

- Phase copy ported verbatim for parity
- Warning fields surfaced as reflection — editorial review deferred

## Excluded

- Moon climate tags
- Premium gating on Moon page (web shows action/reflection on Moon page; Today summary stays concise)
- Rune/card editorial merge content
