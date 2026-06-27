# Phase 22A — Flutter course inventory

Read-only audit of Mystic Flutter (`/Users/boris/Documents/mystic_app`) course content as of Phase 22A.

## Flutter files inspected

| Path | Purpose |
|------|---------|
| `lib/data/course/runes_first_steps_course_content.dart` | Local source of truth for free intro course |
| `lib/data/course/README.md` | Documents `runes-first-steps` local course policy |
| `lib/data/library/local_library_fallback.dart` | Library fallback item for Runes: First Steps |
| `lib/features/library/course_templates.dart` | Template routing for `runes-first-steps` and `living-the-runes` |
| `lib/features/library/runes_first_steps_lesson_screen.dart` | Course detail + lesson reader UI |
| `lib/services/course_content_resolver.dart` | Sanity fetch with local fallback |
| `lib/services/course_progress_service.dart` | Firestore `users/{uid}/courseProgress/{courseId}` |
| `lib/services/course_local_progress_service.dart` | Local-only progress for unsigned / device state |
| `lib/models/course/premium_course_content.dart` | Course/lesson/block models |
| `mystic/scripts/mystic-runes-living-course.course.json` | Sanity seed metadata for Living the Runes |
| `mystic/scripts/runes-first-steps.*.json` | Sanity seed bundle for First Steps |
| `assets/Course Visuals/Basic Runes/` | First Steps cover assets |
| `assets/Course Visuals/Rune 2 course/` | Living the Runes cover assets |

**Note:** `lib/data/course/living_the_runes_course_content.dart` is referenced in migration docs and the web port script, but is **not present** in the current Flutter tree on this machine. Living the Runes lesson text on web comes from an earlier port (`living-the-runes.generated.ts`, 28 lessons).

## Courses found in Flutter runtime

### 1. `runes-first-steps` (free)

| Field | RU | EN |
|-------|----|----|
| **Title** | Руны: Первые шаги | Runes: First Steps |
| **Description** | Короткий вводный курс для тех, кто хочет спокойно и уверенно начать знакомство с рунами… | A short introductory course for those who want to begin working with runes in a calm and practical way… |
| **Summary** | Спокойное и понятное введение в руническую практику. | A calm and practical introduction to rune work. |

| Property | Value |
|----------|-------|
| Course ID | `runes-first-steps` |
| Slug | `runes-first-steps` |
| Access | **Free** (`accessType: free`) |
| Lessons | **1** |
| Duration | ~12 minutes |
| Product ID | none |
| Cover (Flutter) | `assets/Course Visuals/Basic Runes/Pervie Shagi Runi-100kb.jpg` (RU-oriented), `Basic Runes English-100kb.jpg` (EN) |
| Lesson images | **Placeholder keys only** (`course_intro_runes`, `chapter_1_rune_divination`, etc.) — Flutter renders illustration placeholders, no bitmap assets |

**Lesson**

| ID | Order | Title RU | Title EN |
|----|-------|----------|----------|
| `how-to-begin-working-with-runes` | 1 | Как начать работать с рунами | How to Begin Working with Runes |

**Blocks (8):** chapterIntro, text ×4, practice, reflection, completion — full RU/EN copy in `runes_first_steps_course_content.dart`.

### 2. `living-the-runes` / `runes_24_inner_strength` (paid)

| Field | RU | EN |
|-------|----|----|
| **Title** | Проживание Рун: 24 шага к внутренней силе | Living the Runes: 24 Steps to Inner Strength |
| **Description** | Этот курс создан не для механического запоминания значений рун… | This course is not about memorizing rune meanings mechanically… |

| Property | Value |
|----------|-------|
| Course ID (web/entitlement) | `runes_24_inner_strength` |
| Slug | `living-the-runes` |
| Access | **Paid** |
| Product ID | `course_runes_24_inner_strength` |
| Lessons | **28** on web (Flutter Sanity seed says 2; local Dart port used 28) |
| Cover (Flutter) | `assets/Course Visuals/Rune 2 course/prozhivanie.png` (~2.2MB), `prozhivanie 24 shaga.jpg` (~45KB) |

**Progress / entitlement (Flutter)**

- Signed-in: `users/{uid}/courseProgress/{courseId}` via `CourseProgressService`
- Device-local: `CourseLocalProgressService` (SharedPreferences)
- Paid unlock: purchase / `ownedCourses` (RevenueCat + Shopify on web)

### 3. `lunar-path-30-days` — **not in current Flutter lib**

Referenced in Vedunya migration docs and has a **web cover only** (`public/assets/courses/lunar-path-30-days/cover.png` from moon asset). No `lunar_path_30_days_course_content.dart` in current Flutter tree — **out of scope for Phase 22A transfer**.

## Web state before Phase 22A

| Course | Web status |
|--------|------------|
| Living the Runes | Already ported (28 lessons, paid, Shopify wired) |
| Runes: First Steps | Cover asset present; **catalog + lesson content missing** |
| Lunar Path 30 Days | Cover placeholder only; no lessons |

## Gaps / missing assets

| Item | Status |
|------|--------|
| Runes: First Steps lesson illustrations | Flutter uses placeholders only — no bitmaps to copy |
| Living the Runes Dart source on disk | Missing from current `mystic_app` checkout; web generated file is canonical |
| Lunar Path course content | Not in Flutter lib |
| EN typo in Flutter RU summary | `"Эта lesson помогает"` preserved exactly per transfer rules |

## RU/EN content status

| Course | RU | EN |
|--------|----|----|
| Runes: First Steps | Complete | Complete |
| Living the Runes | Complete (28 lessons) | Complete (28 lessons) |

No invented EN copy added in Phase 22A.
