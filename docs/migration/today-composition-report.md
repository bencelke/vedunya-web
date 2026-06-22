# Today Composition Report

## Flutter files inspected

- `lib/features/today/today_page.dart`
- `lib/features/daily_guidance/daily_guidance_panel.dart`
- `lib/services/daily_guidance/daily_guidance_loader.dart`
- `lib/services/daily_guidance/daily_guidance_composer.dart`
- `lib/services/daily_guidance/premium_daily_guidance_composer.dart`
- `lib/core/today_greeting.dart`
- `lib/theme/today_editorial.dart`

**Flutter was not modified.**

## Web files created / updated

- `src/features/daily-guidance/**` — view model (`GuidanceSection<T>`), compose, load, UI components
- `src/app/[locale]/today/page.tsx` — unified experience
- `src/app/[locale]/today/loading.tsx` — skeleton
- `src/components/brand/brand-mark.tsx` — Vedunya Maria + logo
- `src/messages/en.json`, `ru.json` — `dailyGuidance` namespace

## Final hierarchy

1. Header (brand, date, greeting, profile)
2. Primary guidance (focus label, title, message, one action)
3. Personal-day indicator
4. Moon rhythm
5. Rune symbolic focus

## View-model contract

See `src/features/daily-guidance/types/daily-guidance-view-model.ts`.

Generic section shape:

```typescript
type GuidanceSection<T> =
  | { status: "ready"; data: T }
  | { status: "unavailable"; message: string };
```

Page states: `anonymous` | `incomplete` | `authenticated` | `session-error`.

No UID, DOB, `dateKey`, seeds, Firestore paths, content source flags, or premium override in the view model.

## Primary-message composition rule

1. **Primary title + message** from Sujok personal-day content when available
2. **Primary action** from personal-day `doAdvice`; falls back to rune action only if personal-day action is empty
3. **Rune section action** shown only when it differs from primary action (normalized case-insensitive compare)
4. **Personal-day indicator** shows number + title + localized explanation — never repeats primary summary/action
5. **Quiet reflection** uses personal-day `avoidAdvice` when distinct from primary message/action
6. Moon provides rhythm context only — does not dominate the primary message

Deterministic — no AI, no randomness.

## Profile / session loading

Single `loadDailyGuidance()` call:

1. `getCurrentUser()` once
2. `getProfileSnapshot()` once when signed in
3. Shared timezone + `dateKey` from cookies
4. `Promise.all` for numerology, moon, rune after profile validated

## Integrations

| Feature | Integration |
|---------|-------------|
| Numerology | `buildPersonalDayResult` |
| Moon | `loadCurrentMoonGuidance` |
| Rune | `buildDailyRuneResult` via shared PD + date |

Engine logic unchanged.

## Isolated error strategy

Each section returns `ready | unavailable` independently. Moon/rune/numerology failures do not collapse the page. Profile incomplete → single setup CTA.

## Responsive strategy

- Primary target 375–430px via `max-w-xl` reading column
- Safe-area bottom padding via `pb-safe-nav`
- No horizontal scroll; compact Moon/rune rows at 320px

## Accessibility

- One H1 in header
- Section H2/H3 hierarchy
- Links (not div buttons) for navigation
- Loading skeleton with `role="status"`
- Meaningful alt text on Moon/rune visuals
- `motion-reduce:animate-none` on skeleton pulse

## Performance

- Removed triple profile/session reads on Today
- Server Components throughout experience
- No Firestore deep rune load on Today
- Moon loader reused (React `cache` inside feature)

## Known limitations

- Firebase credentials blank — live Firestore moon content not verified in dev
- Save guidance feature not implemented (placeholder removed)
- Flutter rune-first visual order inverted intentionally for web clarity (primary message first)

## Next migration stage

Migrate the Living the Runes course, connect the Sanity course catalog, and preserve Firestore course progress.
