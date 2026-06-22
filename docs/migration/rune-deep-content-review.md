# Rune Deep Content Review

## Firestore contract

**Path:** `runes/{canonicalRuneId}` (e.g. `runes/raido`, never `runes/raidho`)

**Expected shape** (from `rune_content_service.dart` + audit):

```typescript
{
  translations: {
    en: { title?, short?, deep?, action?, warning?, affirmation?, reflection? },
    ru: { ... }
  },
  insights?: ...
}
```

Fields may be `string` or `string[]`. Array fields use FNV-1a day-seeded variant index (ported from Flutter).

## Local fallback fields

When Firestore missing/unavailable/malformed:

1. `buildLocalDeepFallback` — maps Today modular `messages`/`actions` to deep fields
2. `buildMinimalDeepContent` — title + short only when module missing

| Field | Fallback source |
|-------|-----------------|
| title | Canonical display name |
| short | `messages[0]` |
| deep | `messages[1]` or `messages[0]` |
| action | `actions[0]` |
| warning | `actions[1]` |
| affirmation | Synthetic localized template |
| reflection | Synthetic localized template |

## Content precedence

1. Firestore document (Admin SDK, server-only)
2. Local modular fallback
3. Minimal title-only fallback

## Missing content

- Full Firestore parity not live-verified (Firebase credentials blank in dev)
- Affirmation/reflection in fallback are template strings, not Flutter Firestore copy

## Premium fields

Free users see: `title`, `short`

Premium users see additionally: `deep`, `action`, `warning`, `affirmation`, `reflection`

Entitlement read from profile only (`isPremium`, `premiumOverride`, `isOwner`). No billing changes.

## Later editorial review

- Replace synthetic affirmation/reflection in fallback with Firestore or audited local strings
- Live-verify all 24 Firestore documents once credentials available
