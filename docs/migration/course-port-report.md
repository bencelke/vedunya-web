# Course Port Report

## Flutter files inspected

- `lib/data/course/living_the_runes_course_content.dart`
- `lib/data/library/local_library_fallback.dart`
- `lib/services/course_progress_service.dart`
- `lib/services/course_local_progress_service.dart`
- `lib/services/course_content_resolver.dart`
- `lib/core/access/library_course_access.dart`
- `lib/core/access/super_admin_course_entitlement.dart`
- `lib/features/library/runes_first_steps_lesson_screen.dart`
- `lib/features/library/course_detail_hero.dart`
- `lib/features/library/courses_catalog_cards.dart`
- `lib/services/sanity_service.dart`
- `lib/models/course/course_progress.dart`

**Flutter was not modified.**

## Identifiers

| Key | Value |
|-----|-------|
| Course ID | `runes_24_inner_strength` |
| Slug | `living-the-runes` |
| Product ID | `course_runes_24_inner_strength` |
| Lessons | 28 |

## Catalog

- Preferred: Sanity `libraryItem` GROQ catalog
- Fallback: `local-course-catalog.ts`
- Deduped by slug; runtime lesson count forced to **28** for Living the Runes

## Runtime lesson content

- Local audited 28-lesson content (ported from Flutter)
- Sanity incomplete 24-lesson metadata does **not** reduce runtime count

## Access

- Paid course; **Mystic Premium does not unlock**
- Web checkout **not implemented** (`COURSE_PURCHASE_FLOW_WIRED = false`)
- Owner / super-admin email server override for QA only

## Progress

- Firestore `users/{uid}/courseProgress/{courseId}`
- Secure session-verified API writes
- Resume + completion parity with Flutter

## Known limitations

- Mobile RevenueCat purchases are not mirrored on web yet
- Sanity catalog may return zero published course rows; local fallback covers V1
- Only Living the Runes is fully migrated in this stage

## Next stage

Build the secure admin panel using Firebase custom claims and server-side authorization, then add content-management workflows for runes, Moon, notifications, and courses.
