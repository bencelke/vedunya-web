# Phase 7 — Courses/Library Parity

Courses and lesson reader polished for Mystic Flutter library flow with honest locked-state behavior and existing progress contract preserved.

---

## Flutter course/library files inspected

| File | Notes |
|------|-------|
| `lib/features/main/library_screen.dart` | Sanity catalog → local fallback, premium course cards |
| `lib/features/library/library_detail_screen.dart` | Course hero, lesson list, progress |
| `lib/features/library/runes_first_steps_lesson_screen.dart` | Lesson reader layout |
| `lib/services/course_progress_service.dart` | Firestore progress writes |
| `lib/services/library_progress_service.dart` | Resume/progress phases |
| `lib/data/library/local_library_fallback.dart` | Local V1 course fallback |
| `lib/data/course/runes_first_steps_course_content.dart` | 28-lesson local content |

**Not copied to web V1:** PayPal purchase sheet, RevenueCat, library admin, Sanity editing.

---

## Web course files created/modified

### Created

| Path | Purpose |
|------|---------|
| `courses-screen.tsx` | Catalog shell with cosmic layout |
| `course-catalog-header.tsx` | Knowledge paths header |
| `course-detail-screen.tsx` | Detail shell composition |
| `lesson-reader-screen.tsx` | Lesson reader shell |
| `course-access-notice.tsx` | Honest locked/coming soon notice |
| `course-ui-parity.test.ts` | UI + access + fallback tests |

### Modified

| Path | Change |
|------|--------|
| `course-card.tsx` | Mystic elevated cards, coming soon badge |
| `course-detail-hero.tsx` | Cosmic hero + access notice |
| `course-locked-state.tsx` | Delegates to access notice |
| `lesson-row.tsx` | Cosmic lesson rows |
| `course-error-state.tsx` | Cosmic error card |
| `courses/page.tsx`, `[slug]/page.tsx`, lesson page | Screen wrappers |
| `en.json`, `ru.json` | Polished course copy |

**Unchanged:** progress Firestore contract, merge-safe writes, local 28-lesson content, Sanity merge logic, `COURSE_PURCHASE_FLOW_WIRED = false`.

---

## Route structure

| Route | Status |
|-------|--------|
| `/en/courses`, `/ru/courses` | Catalog |
| `/en/courses/living-the-runes` | Course detail |
| `/en/courses/living-the-runes/lessons/[lessonId]` | Lesson reader |

Slug `living-the-runes` maps to course ID `runes_24_inner_strength`.

---

## Course access/locking decision

| User | Behavior |
|------|----------|
| Free / premium (no purchase) | See catalog + detail preview; lessons locked; coming soon notice |
| Owner / dev override | Can open lessons (existing contract) |
| Mystic Premium alone | Does **not** unlock paid course |

No fake checkout. No client-side ownership writes. `ownedCourseIds` not present in web profile — owner email override only for development.

---

## Progress contract

Firestore: `users/{uid}/courseProgress/{courseId}`

Fields preserved: `completedLessonIds`, `lastLessonId`, `progressPercent`, `isCompleted`, `updatedAt`, merge-safe `set`.

- Course completes only after all 28 lessons complete
- Resume: last opened incomplete → first incomplete → first lesson

---

## Sanity/local fallback

`mergeCourseCatalog`: Sanity if available, local `Living the Runes` always present. Empty Sanity does not break V1.

---

## Remaining gaps

| Gap | Phase |
|-----|-------|
| PayPal / real purchase flow | Payments phase |
| `ownedCourseIds` read path when backend adds it | Payments phase |
| Sanity multi-course catalog visibility | Future |
| Course cover parity at full Flutter scale | Optional polish |

---

## Next phase recommendation

**Phase 8 — PWA install foundation.**
