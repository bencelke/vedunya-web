# Phase 19A — Today screen UX cleanup: brand, request card, duplicate profile nav

## Issues found

1. Today content header showed `Vedunya Maria` instead of the unified `MYSTIC by Vedunya Maria` wordmark used on onboarding/auth.
2. Signed-in Today had a duplicate **Profile** link in the sticky top chrome while Profile already exists in bottom navigation.
3. **Request to the Universe** card carried optional category chips (Love, Family, Money, etc.) and verbose copy that felt like a generic form rather than a calm spiritual tool.

## Files changed

| File | Change |
|------|--------|
| `src/features/daily-guidance/components/daily-guidance-header.tsx` | Replaced inline wordmark with shared `MysticBrandHeader` + `auth.brandWordmark` |
| `src/app/[locale]/today/page.tsx` | Removed `showProfile` from `AppHeader` |
| `src/features/universe-request/components/universe-request-form.tsx` | Removed category picker; added helper text; simplified layout |
| `src/features/universe-request/components/universe-request-empty-state.tsx` | POST body text-only; spacing polish |
| `src/features/universe-request/components/universe-request-active-card.tsx` | Removed category badge; saved-state hierarchy with current label + edit |
| `src/messages/en.json` | Updated `dailyGuidance.brandWordmark` and `universeRequest.*` copy |
| `src/messages/ru.json` | Same as EN |
| `src/features/today/tests/phase-19a-today-request-brand-cleanup.test.ts` | New Phase 19A tests |
| `src/features/today/tests/phase-9-3-brand-locale-rune-polish.test.ts` | Updated brand expectations |
| `src/features/brand/tests/phase-9-4-brand-logo-consistency.test.ts` | Updated Today header expectations |
| `src/features/brand/tests/phase-12a-full-mystic-text-parity.test.ts` | Updated `dailyGuidance.brandWordmark` |
| `src/features/universe-request/tests/phase-12b-request-the-universe.test.ts` | Category labels kept in i18n; picker removed from UI |

**Not deleted:** `universe-request-category-picker.tsx` — retained for potential legacy/admin use; no longer imported by active UI.

## Brand header change

Today header now uses `MysticBrandHeader` with `auth.brandWordmark` (`MYSTIC by Vedunya Maria`), matching onboarding/auth typography (gold uppercase tracking, no duplicate logo in content — chrome still uses compact `BrandMark`).

`dailyGuidance.brandWordmark` updated to the same string for i18n parity.

## Duplicate Profile nav cleanup

- **Removed:** top `AppHeader` Profile link on `/today`
- **Kept:** bottom navigation Profile tab (`navigation.profile`)
- **Kept:** language toggle in top chrome

## Request card simplification

- Removed category chips from create and edit forms
- Removed category badge from active/saved card
- Layout: eyebrow → title → body → label → textarea → helper + char count → primary button
- Saved state: eyebrow → current label → request text → edit button → reflection → reminder → pause

## Category removal from UI

- New saves POST `{ text }` only (no category field)
- `universeRequest.categories.*` keys remain in messages for backward compatibility
- Repository/schema still accept optional `category` on stored records

## Copy changes (RU / EN)

| Key | EN | RU |
|-----|----|----|
| `empty.heading` | One intention for today | Одно намерение на день |
| `empty.body` | Write one request you want to return to calmly… | Запишите просьбу, к которой хотите возвращаться спокойно… |
| `form.textPlaceholder` | For example: I choose clarity and calm today… | Например: я выбираю ясность и спокойствие сегодня… |
| `form.helper` | One request is enough. You can change it anytime. | Одной просьбы достаточно. Её можно изменить в любой момент. |
| `active.currentLabel` | Current request | Текущая просьба |
| `active.edit` | Edit request | Изменить просьбу |

## Tests added / updated

**New:** `phase-19a-today-request-brand-cleanup.test.ts` — brand header, no top Profile, bottom nav Profile, no category UI, EN/RU copy, char count, section order, profile gate.

**Updated:** phase-9-3, phase-9-4, phase-12a, phase-12b.

## Manual QA result

Spot-checked `/en/today` on local dev (anonymous preview state):

- Top content header renders **MYSTIC by Vedunya Maria** via `MysticBrandHeader`
- Sticky chrome shows language toggle + Log in only (no top Profile link)
- Bottom navigation still includes **Profile** tab
- Page returns HTTP 200 with no raw error output in HTML
- Signed-in request card UI requires auth session for full verification; structure validated via tests

## Validation

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (0 errors; 1 pre-existing warning in `dev-service-worker-cleanup-script.tsx`) |
| `npm test` | Pass — **842/842** tests |
| `npm run build` | Pass |

## Known gaps

- Category picker component file remains in repo but is unused in UI.
- Top chrome still shows compact Vedunya mark logo separately from content wordmark (intentional — avoids double makosh emblem).
- Reminder configuration still references Profile (unchanged; honest copy).
- Manual 90s idle loop check not automated in CI.

## Safety confirmations

- No commit
- No push
- No deploy
- No secrets printed
- `.env.local` untouched
- Flutter source untouched
