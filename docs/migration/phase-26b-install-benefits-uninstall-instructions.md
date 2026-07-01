# Phase 26B — Install benefits and uninstall instructions

## Summary

Extends `/{locale}/install` with clear **why install** and **how to remove** sections. No fake uninstall capability — informational instructions only.

**Follows:** [Phase 26A — Install education page](./phase-26a-install-education-page.md)

## Sections added

### Why install Mystic?

Placed after hero, before “How it works”.

Explains:

- Home Screen icon like an app
- Faster return to daily practice
- Optional reminders (guidance, courses, Universe request)

### How to remove Mystic

Placed near bottom (after notification note, before CTAs).

Includes:

- **iPhone:** touch and hold → Remove App → Delete App
- **Android:** Settings → Apps → Mystic → Uninstall
- **Account note:** removing from phone does not delete account

## No fake uninstall decision

Web PWAs cannot reliably self-uninstall on iOS or Android.

**Not implemented:**

- “Uninstall Mystic” button
- Clearing local state as uninstall
- Disabling push subscription as uninstall

**Allowed:** informational text only.

## Profile link update

`notifications.installEducationLink`:

| Locale | Label |
|--------|-------|
| EN | How installation and removal work |
| RU | Как работает установка и удаление |
| DE | English fallback |

Link target: `/{locale}/install`

## Files changed

- `src/features/pwa/components/install-education-page.tsx`
- `src/messages/en.json`, `ru.json`, `de.json`
- `src/features/pwa/tests/phase-26b-install-benefits-uninstall-instructions.test.ts`

## Tests added

`phase-26b-install-benefits-uninstall-instructions.test.ts` (10 tests)

## Known gaps

- Removal steps are generic OS instructions; exact menu labels may vary by OS version
- No animated install demo (by design)

## Safety

- No commit / push / deploy in this phase
- `.env.local` untouched
- Flutter untouched
