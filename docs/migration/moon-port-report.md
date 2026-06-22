# Moon Port Report

## Flutter files inspected

- `lib/services/daily_guidance/moon_engine_service.dart`
- `lib/services/daily_guidance/moon_context_service.dart`
- `lib/services/daily_guidance/moon_input_builder_service.dart`
- `lib/services/daily_guidance/lunar_day_service.dart`
- `lib/services/daily_guidance/lunar_day_content_service.dart`
- `lib/services/daily_guidance/moon_phase_service.dart`
- `lib/data/daily_guidance/moon_phase_fallback_data.dart`
- `lib/constants/moon_asset_map.dart`
- `lib/models/daily_guidance/moon_phase_data.dart`
- `lib/models/daily_guidance/lunar_day_content_data.dart`
- `lib/models/daily_guidance/moon_context_data.dart`

Flutter was **not modified**.

## Constants

```text
SYNODIC_MONTH_DAYS = 29.53058867
REFERENCE_NEW_MOON_JD = 2451550.1
JD = utcMillis / 86400000 + 2440587.5
```

## Julian-date method

UTC instant → Julian date via millisecond epoch offset (matches Flutter `_julianDateUtc`).

## Moon-age method

```text
cycleProgress = normalize01((jd - REFERENCE_NEW_MOON_JD) / SYNODIC_MONTH_DAYS)
moonAgeDays = cycleProgress * SYNODIC_MONTH_DAYS
phaseAngle = cycleProgress * 360
illumination = (1 - cos(rad)) / 2 * 100
```

## Phase boundaries (phase8)

Eight equal sectors; `new_moon` at `< 1/16` or `>= 15/16`.

## Phase4 mapping

`new_moon`, `waxing` (crescent/quarter/gibbous), `full_moon`, `waning` (gibbous/quarter/crescent).

## Lunar-day method

`floor(moonAgeDays) + 1`, clamped 1–30 (Flutter approximate mode).

## Timezone strategy

- Core math uses UTC instant (`DateTime.now()` parity) — timezone **not** applied to synodic math (matches Flutter V1).
- `vedunya_tz` cookie drives calendar `dateKey` labels only.
- UTC fallback when cookie absent on first request.

## Firestore paths

- `moon_phases/{phase4Id}` — merge over fallback
- `lunar_days/{1-30}` — string doc IDs

## Fallback behavior

- Phase: bundled EN/RU copy from `moon_phase_fallback_data.dart`
- Lunar day: null/missing state (no audited fallback dataset)

## Caching

- Moon pages use `dynamic = "force-dynamic"`
- React `cache()` on public phase/lunar-day Admin reads keyed by id
- No cross-user personalized moon cache on Today (moon block uses same public calculation + content)

## Parity fixtures

25+ unit tests across engine, phase map, lunar day, timezone, and Firestore resolution mocks.

## Known limitations

- No moonrise/location-sensitive lunar-day boundaries yet
- Live Firestore requires `.env.local` credentials
- Lunar-day UI empty when Firestore doc missing

## Next recommended stage

Daily rune selection parity, canonical 24-rune ID mapping, rune asset migration, Firestore rune-content resolution, and Today rune integration.
