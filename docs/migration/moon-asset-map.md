# Moon Asset Map

Assets copied read-only from Flutter `assets/moon/svg_moon/` to web `public/assets/moon/phases/`.

| Flutter source | Web destination | Format | Phase mapping | Used on |
|--------------|-----------------|--------|---------------|---------|
| `assets/moon/svg_moon/moon_new.png` | `/assets/moon/phases/moon_new.png` | PNG | `new_moon` (phase8/4) | Moon page, Today summary |
| `assets/moon/svg_moon/moon_waxing_crescent.png` | `/assets/moon/phases/moon_waxing_crescent.png` | PNG | `waxing_crescent`, `waxing` fallback | Moon page, Today summary |
| `assets/moon/svg_moon/moon_first_quarter.png` | `/assets/moon/phases/moon_first_quarter.png` | PNG | `first_quarter`; `last_quarter` (CSS flip) | Moon page, Today summary |
| `assets/moon/svg_moon/moon_waxing_gibbous.png` | `/assets/moon/phases/moon_waxing_gibbous.png` | PNG | `waxing_gibbous` | Moon page |
| `assets/moon/svg_moon/moon_full.png` | `/assets/moon/phases/moon_full.png` | PNG | `full_moon` | Moon page, Today summary |
| `assets/moon/svg_moon/moon_waning_gibbous.png` | `/assets/moon/phases/moon_waning_gibbous.png` | PNG | `waning_gibbous` | Moon page |
| `assets/moon/svg_moon/moon_waning_crescent.png` | `/assets/moon/phases/moon_waning_crescent.png` | PNG | `waning_crescent`, `waning` fallback | Moon page, Today summary |

Mapping logic: `src/features/moon/engine/phase-asset-map.ts` (ported from `lib/constants/moon_asset_map.dart`).

Optimization: none (lossless copy).

Flutter originals were not modified.
