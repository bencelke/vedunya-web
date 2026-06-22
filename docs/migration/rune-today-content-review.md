# Rune Today Content Review

## Source files inspected

- `mystic_app/lib/core/runes/runes_collection.dart` — `getRuneOfDay`, variant index logic
- `mystic_app/lib/core/runes/*.dart` — 24 modular rune modules (`messages`, `actions` per locale)
- `mystic_app/lib/services/daily_guidance/rune_daily_service.dart` — selection + Today composition
- `mystic_app/lib/services/daily_guidance/rune_modular_daily_service.dart` — `.first` on variant arrays

## Fields ported

| Field | Today web model | Flutter source |
|-------|-----------------|----------------|
| title | `content.title` | Rune display name (EN/RU) |
| short / guidance | `content.short`, `content.guidance` | Selected message variant |
| action | `content.action` | Selected action variant |

## Content modules

Generated file: `src/features/runes/content/today-rune-modules.generated.ts`

Each rune module contains:

```typescript
messages: { en: string[]; ru: string[] }
actions: { en: string[]; ru: string[] }
```

## Variant selection (ported)

```
messageIndex = messages.length <= 1 ? 0 : today.day % messages.length
actionIndex  = actions.length <= 1 ? 0 : today.day % actions.length
```

Locale fallback: RU → EN when RU array empty (matches `getRuneOfDay`).

## Missing translations

None detected for the 24 canonical runes — all modules include EN and RU arrays from Flutter sources.

## Missing runes

None — all 24 canonical IDs present.

## Deliberately excluded

- Firestore deep content (`runes/{id}`) — **not** used on Today
- Card of the Day
- Premium lock on Today action (Mystic shows action on Today for all users via local content)
- AI-generated or editorially rewritten copy

## Later editorial review

- Harmonize affirmation/reflection strings in deep fallback (synthetic templates in local fallback only)
- Verify RU tone consistency across all 24 modules
