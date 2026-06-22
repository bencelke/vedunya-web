# Today Screen Audit

## Flutter production Today (read-only inspection)

**Primary route:** `lib/features/today/today_page.dart`

**Loader:** `lib/services/daily_guidance/daily_guidance_loader.dart`

**Composer:** `lib/services/daily_guidance/daily_guidance_composer.dart` + `premium_daily_guidance_composer.dart`

**UI:** `lib/features/daily_guidance/daily_guidance_panel.dart`

### Production hierarchy (Flutter)

1. Hero greeting with display name (`TodayHeroGreeting`)
2. **Rune anchor** — large sigil, name, summary (dominant visual)
3. Moon phase block with hero visual
4. Personal-day numerology section
5. Premium-gated deep fields

Editorial premium headline can override legacy combined guidance line.

### Deprecated / excluded Flutter surfaces

- Card of the Day mirror (`OracleCardMirrorEngine`) — **not ported**
- Social feed copy and curated overline strings — **excluded**
- Experimental 3D gnome / cinematic nav backgrounds — **excluded**
- Abandoned oracle redesign files — not used as web reference

## Web Today before this task

**Route:** `src/app/[locale]/today/page.tsx`

### Problems identified

| Issue | Detail |
|-------|--------|
| Three equal cards | Personal day, Moon, rune rendered as same-weight stacked cards |
| Duplicated content | Summary + action repeated across personal-day card and rune card |
| Developer demo | Disabled “Save guidance” button, `mockNotice` banner |
| Repeated profile reads | Separate loaders each called `getCurrentUser` + `getProfileSnapshot` |
| No primary message | No single “what matters today” block |
| Weak hierarchy | Header repeated product framing; no visual depth |
| No route loading UI | Missing `loading.tsx` skeleton |

## Web Today after this task

**Unified loader:** `src/features/daily-guidance/services/load-daily-guidance.ts`

**Composition:** `compose-daily-guidance.ts`, `compose-primary-message.ts`

### Final hierarchy (authenticated)

1. Header — brand, date, greeting, profile link
2. **Primary guidance** — personal-day summary + one action (strongest surface)
3. Personal-day indicator — number + title + boundary note (no summary repeat)
4. Moon rhythm — compact supporting card + link
5. Rune focus — symbol + summary + action only when different from primary

### Content sources (unchanged engines)

| Section | Source |
|---------|--------|
| Primary | Sujok personal-day local content |
| Numerology indicator | Same personal-day result |
| Moon | Existing moon loader + Firestore/fallback |
| Rune | Existing deterministic selector + local Today modules |

### Performance improvements

- One session + profile read per Today request
- Parallel Moon / numerology / rune resolution after shared context
- Personal day uses `buildPersonalDayResult` (no redundant Firestore gate)

### Assets reused

- Moon phase PNGs (already migrated)
- Rune SVGs (already migrated)
- Brand mark SVG → `public/assets/brand/vedunya-mark.svg`

### Assets excluded

- Card assets, feed assets, course covers, fonts, 3D experiments, full-page background JPG
