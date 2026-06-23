# Phase 8 — PWA Install Foundation

Vedunya Web is installable as a mobile Progressive Web App with manifest, icons, service worker offline shell, Profile install guidance, and safe update handling.

---

## Files inspected

| Path | Notes |
|------|-------|
| `public/manifest.webmanifest` | Replaced by `src/app/manifest.ts` |
| `public/icons/*` | 1024px Flutter-migrated launcher icons |
| `src/app/[locale]/layout.tsx` | Metadata + viewport |
| `src/features/profile/components/profile-content.tsx` | Install section placement |

Flutter read-only: `/Users/boris/Documents/mystic_app/assets/app_icon/`

---

## Files created/modified

### Created

| Path | Purpose |
|------|---------|
| `src/config/pwa.ts` | Shared PWA constants |
| `src/app/manifest.ts` | Next.js App Router manifest |
| `public/sw.js` | Offline shell service worker |
| `public/icons/icon-192x192.png` | Manifest icon |
| `public/icons/icon-512x512.png` | Manifest icon |
| `public/icons/icon-512x512-maskable.png` | Maskable icon |
| `public/icons/apple-touch-icon.png` | iOS home screen |
| `src/components/pwa/pwa-registrar.tsx` | SW registration + update banner |
| `src/features/pwa/**` | Install UX, detection, offline actions |
| `src/app/[locale]/offline/page.tsx` | Offline fallback page |
| `src/features/pwa/tests/pwa-foundation.test.ts` | PWA tests |

### Modified

| Path | Change |
|------|--------|
| `src/app/[locale]/layout.tsx` | PWA metadata, icons, theme color, registrar |
| `src/features/profile/components/profile-content.tsx` | Install section |
| `src/messages/en.json`, `ru.json` | PWA copy |
| `scripts/validate-assets.ts` | PWA icon + SW checks |
| `public/icons/README.md` | Icon documentation |

**Deleted:** `public/manifest.webmanifest` (superseded by `manifest.ts`)

---

## Manifest decisions

- `name`: Mystic by Vedunya Maria
- `short_name`: Mystic
- `start_url`: `/en/today` (locale routing preserved in-app)
- `display`: standalone
- `theme_color` / `background_color`: `#0B0D14` (matches `--app-bg`)
- PNG icons 192/512 + maskable 512

---

## Service worker strategy

- Register `/sw.js` client-side only
- Precache offline shell pages (`/en/offline`, `/ru/offline`) + icons
- Navigation: network-first; offline fallback to locale offline page
- Static assets (`/_next/static`, `/icons`, `/assets`): cache-on-success
- **Never cache:** `/api/*`, Firebase auth/identity endpoints
- **No push** event handlers
- Update: waiting worker + user-triggered `SKIP_WAITING` refresh

---

## Install UX

**Placement:** Profile → App section → Install Mystic

| Platform | Behavior |
|----------|----------|
| Android Chromium | `beforeinstallprompt` card with Install / Not now |
| iPhone Safari | Manual Add to Home Screen guide |
| Installed standalone | “Mystic is installed” hint; prompts hidden |

Dismissal stored in `localStorage` (`mystic:pwa-install-dismissed`).

---

## Intentionally not implemented

- Push notifications
- Notification permission requests
- Firebase Messaging / push subscriptions
- Cloud Functions
- Aggressive precache of authenticated pages

---

## Remaining PWA gaps

| Gap | Phase |
|-----|-------|
| Web Push notifications | Phase 9 |
| Rich offline Today content | Future (only shell today) |
| Full app-shell precache of routes | Optional |
| `start_url` locale auto-detection in manifest | Future enhancement |

---

## Next phase recommendation

**Phase 9 — Web Push notifications.**
