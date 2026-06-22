# Mystic Asset Manifest

Reusable assets from `C:\Users\1\development\mystic_app` for web migration. **No assets were copied during this audit.** Font files are listed by path only — do not commit font binaries in audit artifacts.

---

## Brand & launcher

| Current path | Type | Used on | Recommended web path | Copy? | Notes |
|--------------|------|---------|----------------------|-------|-------|
| `assets/logo/mystic_logo.svg` | SVG | Brand marks | `/public/brand/mystic-logo.svg` | Yes | Primary wordmark |
| `assets/logo/logo-white-svg.svg` | SVG | Dark backgrounds | `/public/brand/mystic-logo-white.svg` | Yes | |
| `assets/logo/google_g.svg` | SVG | Google sign-in button | `/public/brand/google-g.svg` | Yes | Auth UI |
| `assets/logo/icon-makosh-padded.png` | PNG | Splash, loading | `/public/brand/icon-makosh-padded.png` | Yes | Splash reference |
| `assets/logo/icon-makosh-done.png` | PNG | Icons | `/public/brand/` | Optional | Variant |
| `assets/logo/icon-makosh-final.png` | PNG | Icons | `/public/brand/` | Optional | Variant |
| `assets/logo/icon-app-launcher-1024.png` | PNG 1024 | Launcher | `/public/icons/` (after design pass) | Yes → PWA | Replace placeholders |
| `assets/logo/icon-foreground-rgba-1024.png` | PNG 1024 | Native splash | PWA splash reference | Yes | |
| `assets/logo/icon-launcher-ios-1024.png` | PNG 1024 | iOS | `/public/icons/` | Optional | |
| `assets/logo/splash-screen.png` | PNG | Native splash | Marketing only | Optional | |
| `assets/logo/loading_makosh.png` | PNG | Loading | `/public/brand/loading-makosh.png` | Optional | |
| `assets/app_icon/mystic_icon.svg` | SVG | App icon | `/public/icons/mystic-icon.svg` | Yes | |

**Obsolete:** duplicate makosh PNG variants — pick one canonical set for web.

---

## Backgrounds

| Current path | Type | Used on | Recommended web path | Copy? |
|--------------|------|---------|----------------------|-------|
| `assets/background/background-jpg.jpg` | JPG | Today chrome, cinematic nav | `/public/backgrounds/app-background.jpg` | Yes | Subtle full-page bg |

---

## Rune SVGs (canonical)

Directory: `assets/runes/svg/`

| File | Canonical key | Used on | Recommended web path | Copy? |
|------|---------------|---------|----------------------|-------|
| `fehu.svg` … `othala.svg` (24 files) | see `rune_asset_map.dart` | Today, Insights, courses | `/public/runes/svg/{key}.svg` | **Yes — critical** |

**Canonical keys:** `fehu`, `uruz`, `thurisaz`, `ansuz`, `raido`, `kenaz`, `gebo`, `wunjo`, `hagalaz`, `nauthiz`, `isa`, `jera`, `eihwaz`, `perthro`, `algiz`, `sowilo`, `tiwaz`, `berkano`, `ehwaz`, `mannaz`, `laguz`, `ingwaz`, `dagaz`, `othala`

### Legacy rune assets (not recommended)

| Current path | Notes | Copy? |
|--------------|-------|-------|
| `assets/runes/*.svg` (root) | Alternate spellings (`Turisaz.svg`, `Nautiz.svg`, …) | **No** — use canonical `/svg/` set |
| Legacy PNG spellings | Duplicates | No |

---

## Moon phase images

Directory: `assets/moon/svg_moon/` (PNG despite folder name)

| Pattern | Used on | Recommended web path | Copy? |
|---------|---------|----------------------|-------|
| `moon_new.png`, `moon_waxing_crescent.png`, … (8-phase set) | Today, Moon tab | `/public/moon/{phase8Id}.png` | **Yes** |
| `moon_first_quarter.png` | Also used for `last_quarter` (flipped) | Same + CSS flip | Yes |

**Mapping:** `lib/constants/moon_asset_map.dart` → `MoonAssetPaths`

---

## Course covers

| Current path | Course | Recommended web path | Copy? |
|--------------|--------|----------------------|-------|
| `assets/Course Visuals/Basic Runes/Pervie Shagi Runi-100kb.jpg` | `runes-first-steps` | `/public/courses/runes-first-steps/cover.jpg` | Yes |
| `assets/Course Visuals/Rune 2 course/prozhivanie.png` | `living-the-runes` / `runes_24_inner_strength` | `/public/courses/living-the-runes/cover.png` | Yes |
| `assets/moon/svg_moon/moon_full.png` | `lunar-path-30-days` cover fallback | `/public/courses/lunar-path-30-days/cover.png` | Yes |

**Lesson artwork:** course content uses rune SVGs inline; no separate lesson PNG set required for V1 parity.

---

## Fonts (reference only — do not copy in audit)

| Path | Family | Used for |
|------|--------|----------|
| `assets/fonts/Noto_Sans_Runic/NotoSansRunic-Regular.ttf` | `NotoRunic` | Rune Unicode fallback rendering |
| `assets/fonts/Noto_Sans_Runic/OFL.txt` | License | Compliance |

**Web recommendation:** load Noto Sans Runic via Google Fonts or self-host under `/public/fonts/` with OFL compliance during asset migration stage.

---

## Other production media

| Current path | Type | Used on | Recommended web path | Copy? |
|--------------|------|---------|----------------------|-------|
| `assets/dream_engine/dream_symbols_v2.json` | JSON | Dream bot (server-side) | Defer | No for V1 web |
| Maria imagery in Sanity | Remote URLs | Library CMS | Serve from Sanity CDN | Via CMS |

---

## Assets not recommended for reuse

| Asset / path | Reason |
|--------------|--------|
| `assets/runes/` legacy root SVGs | Superseded by canonical `/svg/` map |
| Placeholder Next.js icons in vedunya-web | Replace during asset migration stage |
| Duplicate makosh PNG variants | Consolidate to one launcher set |
| Native-only splash composites | Regenerate for PWA splash specs |
| `public/next.svg`, `public/vercel.svg` (vedunya-web scaffold) | Remove — not product assets |

---

## Copy checklist (migration stage 1)

- [ ] 24 canonical rune SVGs → `/public/runes/svg/`
- [ ] 8 moon phase PNGs → `/public/moon/`
- [ ] 3 course covers → `/public/courses/{slug}/`
- [ ] Brand SVG + launcher PNG → `/public/brand/` + PWA manifest
- [ ] App background JPG → `/public/backgrounds/`
- [ ] Noto Sans Runic (web font strategy, not raw copy unless self-hosting)
