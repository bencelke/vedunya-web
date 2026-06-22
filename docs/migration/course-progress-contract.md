# Course Progress Contract

## Firestore path

```text
users/{uid}/courseProgress/{courseId}
```

## Course ID (Living the Runes)

```text
runes_24_inner_strength
```

## Fields (read/write)

| Field | Type | Notes |
|-------|------|-------|
| `courseId` | string | Stable course identifier |
| `completedLessonIds` | string[] | Deduped on write |
| `lastLessonId` | string | Last opened lesson |
| `progressPercent` | number | 0–100 from completed / total |
| `isCompleted` | boolean | true only when all 28 lessons complete |
| `isEnrolled` | boolean | Set on first open |
| `startedAt` | Timestamp | Set once |
| `lastOpenedAt` | Timestamp | Updated on open |
| `completedAt` | Timestamp | Set once when course completes |
| `updatedAt` | Timestamp | Server timestamp on writes |
| `bookmarkedLessonIds` | string[] | Preserved if present; not modified by web V1 |

## Completion rule

Course completion requires **28** completed lessons — not 24.

## Web progress API

- `POST /api/courses/runes_24_inner_strength/progress/open` — updates `lastLessonId`
- `POST /api/courses/runes_24_inner_strength/progress/complete` — idempotent lesson completion

Session UID is derived server-side; client never supplies UID.

## Resume behavior (Flutter parity)

1. If `lastLessonId` exists and is incomplete → resume it
2. Else first incomplete lesson
3. If all complete → course completed state (resume CTA opens lesson 1 for review)
4. If no progress → lesson 1

## Legacy IDs

Unknown lesson IDs in Firestore are ignored for UI calculations but **not deleted** from the document.
