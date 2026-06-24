# Phase 12B — Request the Universe

## Feature purpose

**Request the Universe** / **Просьба к Вселенной** is the top emotional anchor on Today. It holds one personal intention the user returns to daily — not a fake AI reading or fortune-telling.

Product boundaries:

- Personal intention + daily reflection anchor
- One active request per user
- Deterministic reflection prompts (no AI)
- Private Firestore storage under authenticated UID
- Honest reminder UX (preference saved; scheduled dispatch not live in Phase 9)

Not implemented:

- Universe “answers” or guarantees
- Free-text AI interpretation
- Scheduled request push dispatch (Phase 12C)
- Admin tooling

## Flutter reference

No direct `universe_request` feature found in Flutter file search (read-only). Web adds this as the new product anchor per roadmap. Flutter `universe_request_screen.dart` is referenced in `docs/migration/mystic-source-audit.md` as future parity target.

## Firestore data model

**Path:** `users/{uid}/universeRequests/current`

```typescript
{
  text: string;              // 1–240 chars, trimmed
  category: "love" | "family" | "money" | "protection" | "health" | "path" | "work" | "other" | null;
  isActive: boolean;
  reminderEnabled: boolean;
  reminderTime?: string;     // HH:mm
  createdAt: Timestamp;
  updatedAt: Timestamp;
  pausedAt?: Timestamp | null;
}
```

- UID from server session only
- Merge-safe writes via Admin SDK
- DELETE API soft-pauses (`isActive: false`, `pausedAt` set)

## API routes

`src/app/api/universe-request/route.ts`

| Method | Behavior |
|--------|----------|
| GET | Load current active request |
| POST | Create / replace active request |
| PATCH | Partial update (reminder, text, etc.) |
| DELETE | Pause (soft delete) |

Auth: `requireApiUser()` — same pattern as push routes.

## Today placement

Order after Phase 12B:

1. Header (brand + greeting)
2. **Request the Universe**
3. Daily focus / primary guidance
4. Rune of the day
5. Moon rhythm + personal day (numerology de-emphasized in layout order)
6. Reflection / premium sections

Files: `daily-guidance-authenticated.tsx`, `load-daily-guidance.ts`

## Categories

| Key | EN | RU |
|-----|----|----|
| love | Love | Любовь |
| family | Family | Семья |
| money | Money | Деньги |
| protection | Protection | Защита |
| health | Health | Здоровье |
| path | Path | Путь |
| work | Work | Дело |
| other | Other | Другое |

## Reminder behavior

- `reminderEnabled` + `reminderTime` stored on request document
- UI copy states reminders work **after** device reminders are enabled in Profile
- No scheduled request push dispatch in this phase
- Phase 12C will integrate with notification preferences

## Profile integration

Small link card: **Request the Universe** → `/today` (`universe-request-profile-link.tsx`)

## Tests

`src/features/universe-request/tests/phase-12b-request-the-universe.test.ts`

- Schema validation
- Deterministic reflection
- EN/RU copy (no fake guarantees)
- Today wiring order
- API auth pattern
- Firestore path

## Safe for Phase 12C?

**Yes.** Request CRUD and Today UI are in place. Phase 12C can add notification settings parity and scheduled request reminder dispatch.

## Constraints

- Flutter not modified
- `.env.local` not touched
- Numerology / moon / rune engines unchanged
