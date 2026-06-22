# Full Asset Migration Report

Migration date: 2026-06-14  
Flutter source: `C:\Users\1\development\mystic_app` (read-only, **not modified**)  
Web destination: `C:\Users\1\development\vedunya-web\public\assets`

## Summary

| Metric | Count |
|--------|------:|
| Image files discovered in Flutter `assets/` | 186 |
| Production assets in copy plan | 46 |
| Copied this run | 15 |
| Already existed (identical) | 31 |
| Skipped | 0 |
| Conflicts | 0 |

Machine-readable log: `docs/migration/full-asset-migration-report.json`

## Destination folders used

```text
public/assets/brand/
public/assets/backgrounds/
public/assets/moon/phases/
public/assets/runes/symbols/
public/assets/courses/living-the-runes/
public/assets/courses/runes-first-steps/
public/assets/courses/lunar-path-30-days/
public/icons/
```

## Copy table (production plan)

| Category | Original Flutter path | Destination web path | Type | Status | Production usage |
|----------|----------------------|----------------------|------|--------|------------------|
| brand | `assets/logo/mystic_logo.svg` | `public/assets/brand/mystic-logo.svg` | svg | copied | `mystic_logo.dart` |
| brand | `assets/logo/logo-white-svg.svg` | `public/assets/brand/mystic-logo-white.svg` | svg | copied | dark backgrounds |
| brand | `assets/logo/google_g.svg` | `public/assets/brand/google-g.svg` | svg | copied | Google sign-in |
| brand | `assets/logo/icon-makosh-padded.png` | `public/assets/brand/icon-makosh-padded.png` | png | copied | splash / app root |
| brand | `assets/logo/icon-foreground-rgba-1024.png` | `public/assets/brand/icon-foreground-rgba-1024.png` | png | copied | logo fallback |
| brand | `assets/logo/loading_makosh.png` | `public/assets/brand/loading-makosh.png` | png | copied | loading reference |
| brand | `assets/logo/splash-screen.png` | `public/assets/brand/splash-screen.png` | png | copied | native splash |
| brand | `assets/app_icon/mystic_icon.svg` | `public/assets/brand/mystic-icon.svg` | svg | copied | app icon |
| icons | `assets/logo/icon-app-launcher-1024.png` | `public/icons/icon-app-launcher-1024.png` | png | copied | PWA launcher |
| icons | `assets/logo/icon-launcher-ios-1024.png` | `public/icons/icon-launcher-ios-1024.png` | png | copied | iOS launcher |
| icons | `assets/logo/icon-foreground-rgba-1024.png` | `public/icons/icon-foreground-rgba-1024.png` | png | copied | adaptive icon |
| backgrounds | `assets/background/background-jpg.jpg` | `public/assets/backgrounds/app-background.jpg` | jpg | copied | Today chrome bg |
| courses | `assets/Course Visuals/Rune 2 course/prozhivanie.png` | `public/assets/courses/living-the-runes/prozhivanie.png` | png | copied | Living the Runes |
| courses | `assets/Course Visuals/Basic Runes/Pervie Shagi Runi-100kb.jpg` | `public/assets/courses/runes-first-steps/cover.jpg` | jpg | copied | First Steps |
| courses | `assets/moon/svg_moon/moon_full.png` | `public/assets/courses/lunar-path-30-days/cover.png` | png | copied | Lunar Path cover |
| moon | `assets/moon/svg_moon/moon_*.png` (7 files) | `public/assets/moon/phases/` | png | already existed | Moon tab / Today |
| runes | `assets/runes/svg/{canonical}.svg` (24) | `public/assets/runes/symbols/` | svg | already existed | rune_asset_map |
| brand | `vedunya-mark.svg` (web) | `public/assets/brand/vedunya-mark.svg` | svg | already existed | web brand mark |
| courses | `prozhivanie.png` | `public/assets/courses/living-the-runes/cover.png` | png | already existed | course detail hero |

## Excluded folders / assets

| Path / pattern | Reason |
|----------------|--------|
| `assets/fonts/` | Fonts must not be copied to web assets |
| `assets/cards/` | Card of the Day — not in V1 web production |
| `assets/design_reference/` | Design experiments |
| `assets/Screnshots/` | Debug screenshots |
| `assets/orb/` | Unused orb experiments |
| `assets/runes/*.svg` (root legacy spellings) | Superseded by canonical `assets/runes/svg/` |
| `assets/moon/*.png` (non-`svg_moon`) | Experimental duplicates |
| `assets/dream_engine/*.json` | Not image; server-side only |
| `build/`, `.dart_tool/`, `node_modules/` | Build/cache |

## Conflicts

None. Existing destination files with different content were **not** overwritten.

## Manual review items

- Replace `public/icons/*.placeholder.svg` with production PWA icons when manifest is finalized
- `vedunya-mark.svg` remains the web Today header mark; `mystic-logo.svg` available for Mystic parity screens
- Lunar Path and Runes First Steps course routes are not yet live on web — covers copied for future use
- Noto Sans Runic font: use Google Fonts or self-host later — **not copied** into `public/assets`
- Card of the Day / feed / social imagery deliberately excluded

## Safety confirmations

- **Flutter project not modified** — copy-only from source
- **No secrets copied** — no `.env`, service accounts, `google-services.json`, or `.plist` in `public/`
- **No font files copied** under `public/assets`
- **No `raidho.svg`** — canonical `raido.svg` only

## Validation

```powershell
npm run assets:check
```

Re-run migration copy (idempotent):

```powershell
npx tsx scripts/migrate-flutter-assets.ts
```
