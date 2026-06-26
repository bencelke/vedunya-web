# Phase 19B — Premium Today mobile layout: value-first, not form-first

## Current issue

On a narrow phone viewport, the signed-in Today screen led with a large “Request to the Universe” textarea card. The first impression felt like a form/task instead of a premium daily guidance experience.

## Files changed

| File | Change |
|------|--------|
| `src/features/daily-guidance/components/daily-guidance-authenticated.tsx` | Value-first section order |
| `src/features/daily-guidance/components/primary-guidance-card.tsx` | Stronger hero typography |
| `src/features/daily-guidance/services/load-daily-guidance.ts` | `heroEyebrow` for primary card label |
| `src/features/today/components/today-rhythm-strip.tsx` | **New** compact number/rune/moon row |
| `src/features/universe-request/components/universe-request-empty-state.tsx` | Collapsed CTA → expand form |
| `src/features/universe-request/components/universe-request-active-card.tsx` | Compact saved card + optional expand |
| `src/messages/en.json`, `src/messages/ru.json` | Hero eyebrow, rhythm strip, collapsed request copy |
| `src/styles/mystic-theme.css` | `--today-max-width: 28.125rem` (450px) |
| `src/config/mysticTheme.ts` | `todayMaxWidth: 450px` |
| `src/features/today/tests/phase-19b-premium-today-mobile-layout.test.ts` | **New** regression tests |
| Updated: `today-parity`, `phase-12g`, `phase-12b`, `phase-19a`, `mystic-theme-foundation` tests |

## New Today hierarchy (signed-in)

1. Header — `MYSTIC by Vedunya Maria`, date, greeting, subtitle
2. **Primary guidance hero** — today’s focus, message, one clear step
3. **Compact rhythm strip** — personal number, daily rune, moon phase (links where available)
4. **Request CTA** — collapsed by default; form on user action
5. Lower priority — premium deep cards, reflection, Mystic Plus lock
6. Bottom navigation — Profile tab only (no duplicate top Profile)

## Brand header

Unchanged from Phase 19A: shared `MysticBrandHeader` with `MYSTIC by Vedunya Maria`. No top Profile button.

## Request collapsed behavior

**Empty state:** Collapsed card with eyebrow, heading, body, “Write request” / “Записать просьбу” button. Tapping expands inline form with textarea, char count, Save/Cancel.

**Saved state:** Compact card with current request (line-clamp), Edit button. “More” reveals reflection, reminder status, pause — no categories.

## Daily guidance hero

Uses existing deterministic `primary` content from numerology/personal-day pipeline. Eyebrow: “Today’s guidance” / “Подсказка дня”. Larger title weight, calm gold action block.

## Compact rhythm section

Three-column chip row: Number (personal day), Rune (link to detail), Moon (link to `/moon`). Unavailable sections show `—`, not fake data.

## Tests added

`phase-19b-premium-today-mobile-layout.test.ts` — hierarchy, collapsed request, copy, mobile width, reload guards.

## Manual QA

Run `npm run dev`, test `/en/today` and `/ru/today` at ~390–430px width.

| Check | Expected |
|-------|----------|
| First card | Guidance hero, not textarea |
| Request | Collapsed CTA until tapped |
| Rhythm | Compact 3-chip row |
| Brand | MYSTIC by Vedunya Maria |
| Profile | Bottom nav only |
| Idle loop | No GET spam (19A.1 guards preserved) |

## Known gaps

- Large `TodayRuneAnchor` / `MoonRhythmSummary` components remain in codebase for other routes; not used on signed-in Today main flow.
- Browser 90s idle not automated in CI.
- Active request “More” panel is optional expand — reflection not shown in default compact view.

## Safety

- No commit / push / deploy
- `.env.local` untouched
- Flutter untouched
- No secrets printed
