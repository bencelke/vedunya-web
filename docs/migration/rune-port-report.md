# Rune Port Report — Mystic → Vedunya Web

## Flutter files inspected (read-only)

- `lib/services/daily_guidance/rune_daily_service.dart`
- `lib/services/daily_guidance/rune_modular_daily_service.dart`
- `lib/core/runes/runes_collection.dart`
- `lib/constants/rune_asset_map.dart`
- `lib/services/rune_content_service.dart`
- `lib/core/runes/*.dart` (24 modules)

**Flutter repository was not modified.**

## Canonical 24-rune order

```
fehu, uruz, thurisaz, ansuz, raido, kenaz, gebo, wunjo,
hagalaz, nauthiz, isa, jera, eihwaz, perthro, algiz, sowilo,
tiwaz, berkano, ehwaz, mannaz, laguz, ingwaz, dagaz, othala
```

## Canonical IDs and aliases

| Alias | Canonical |
|-------|-----------|
| raidho | **raido** |
| kano | kenaz |
| nautiz | nauthiz |
| turisaz | thurisaz |
| pertha | perthro |
| sowulo | sowilo |
| eiwaz | eihwaz |
| berkana | berkano |

## Daily selection algorithm

**Not UID-based.** Requires Sujok personal day number + local calendar date.

```
dayOfYear = days since Jan 1 (local date parts, 0-indexed like Dart)
seed = personalDayNumber * 1009 + dayOfYear + month * 31
runeIndex = positiveModulo(seed, 24)
runeId = CANONICAL_RUNE_ORDER[runeIndex]
```

## Hash / variant behavior

- **Selection:** integer seed + modulo (no string hash)
- **Today variants:** `day % array.length`
- **Firestore deep variants:** FNV-1a hash of `{runeId, field, daySeed}` → index

## Date-key strategy

- Uses device timezone cookie (`vedunya_tz`) via `resolveMoonDateKey`
- Date parts parsed as `YYYY-MM-DD` without UTC shift for selection

## Local Today content

Modular EN/RU messages + actions per rune. See `rune-today-content-review.md`.

## Firestore deep content

Server Admin read at `runes/{canonicalRuneId}`. React `cache()` per rune+locale. See `rune-deep-content-review.md`.

## Fallback precedence

Firestore → local modular → minimal title

## Asset migration

24 SVGs in `public/assets/runes/symbols/`. See `rune-asset-map.md`.

## Entitlement behavior

Read-only from profile. Free: title + short. Premium: all deep fields. Default free when profile missing.

## Caching strategy

- Today: no Firestore cache (local only)
- Detail: `cache()` on Firestore read keyed by canonical ID + locale
- Entitlement evaluated separately per request (not cached into content)
- `dynamic = "force-dynamic"` on Today and rune detail routes

## Parity fixtures

- 12 audited fixtures from `parity-test-cases.md`
- 30 extended synthetic fixtures
- **42 total** selection parity tests

## Known limitations

- Firebase credentials blank — Firestore reads fall back locally
- No `/runes` index grid (skipped to avoid scope creep)
- No Card of the Day
- Affirmation/reflection fallback uses template strings

## Next recommended stage

Complete Today screen composition and visual parity, then migrate the Living the Runes course, Sanity catalog, and Firestore course progress.
