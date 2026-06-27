# Phase 22A — Course transfer implementation

## Summary

Transferred Mystic Flutter courses into native Vedunya Web static course modules. **Runes: First Steps** (free, 1 lesson) added to catalog and lesson reader. **Living the Runes** (paid, 28 lessons) was already ported; Phase 22A generalized routing/progress so both courses share the same infrastructure.

## Flutter sources

- `lib/data/course/runes_first_steps_course_content.dart` → `runes-first-steps.generated.ts` via `scripts/port-runes-first-steps-content.ts`
- `living-the-runes.generated.ts` — existing port (28 lessons), unchanged content

## Assets

| Asset | Source | Web path | Action |
|-------|--------|----------|--------|
| First Steps cover | Flutter `Pervie Shagi Runi-100kb.jpg` | `public/assets/courses/runes-first-steps/cover.jpg` | Already present (114KB) |
| Living the Runes cover | Flutter `prozhivanie.png` | `public/assets/courses/living-the-runes/cover.png` | Already present |
| Lesson illustrations | N/A (Flutter placeholders) | — | Not copied |

## Web files changed / added

### New

- `scripts/port-runes-first-steps-content.ts`
- `src/features/courses/content/mystic-course-content.types.ts`
- `src/features/courses/content/map-mystic-lesson-blocks.ts`
- `src/features/courses/content/runes-first-steps.generated.ts`
- `src/features/courses/content/runes-first-steps-runtime.ts`
- `src/features/courses/services/course-content-registry.ts`
- `src/features/courses/server/resolve-course-progress-gate.ts`
- `src/features/courses/tests/phase-22a-flutter-course-transfer.test.ts`
- `docs/migration/phase-22a-flutter-course-inventory.md`
- `docs/migration/phase-22a-course-transfer-implementation.md`

### Updated

- `src/features/courses/constants/course-ids.ts` — `runes-first-steps` IDs + slug order
- `src/features/courses/constants/course-assets.ts` — First Steps cover path
- `src/features/courses/content/local-course-catalog.ts` — both courses
- `src/features/courses/services/load-course-detail.ts` — multi-course lessons
- `src/features/courses/services/load-course-catalog.ts` — progress for all local courses
- `src/features/courses/services/merge-course-catalog.ts` — sort order + lesson counts
- `src/features/courses/repositories/course-progress-repository.ts` — per-course lesson totals
- `src/app/api/courses/[courseId]/progress/route.ts` — shared gate
- `src/app/api/courses/[courseId]/progress/open/route.ts` — shared gate
- `src/app/api/courses/[courseId]/progress/complete/route.ts` — shared gate
- `src/app/[locale]/courses/[slug]/lessons/[lessonId]/page.tsx` — dynamic `courseId`
- `src/features/courses/tests/course-catalog.test.ts`
- `src/features/courses/tests/course-ui-parity.test.ts`

## Courses on web after Phase 22A

| Course | ID | Slug | Lessons | Access |
|--------|-----|------|---------|--------|
| Runes: First Steps | `runes-first-steps` | `runes-first-steps` | 1 | Free |
| Living the Runes | `runes_24_inner_strength` | `living-the-runes` | 28 | Paid (Shopify `ownedCourses`) |

## Catalog behavior

- `/{locale}/courses` lists both courses (First Steps first)
- Mystic cosmic cards, cover, lesson count, progress bar, resume CTA
- Free course unlocked without purchase; paid course locked without `ownedCourses`

## Detail page behavior

- `/{locale}/courses/runes-first-steps` — hero, 1-lesson list, start/continue
- `/{locale}/courses/living-the-runes` — hero, 28-lesson list, Shopify purchase when locked

## Lesson reader behavior

- `/{locale}/courses/[slug]/lessons/[lessonId]` — premium mobile layout, blocks, prev/next, mark complete
- Free course readable without sign-in; progress saved to Firestore when signed in
- Paid lessons require verified entitlement (server gate)

## Entitlement behavior

- Unchanged Shopify path: `users/{uid}/ownedCourses/{courseId}` with `provider: "shopify"`
- `resolveCourseProgressGate` validates access server-side before progress writes
- No client-side unlock; Mystic Plus does not unlock paid courses

## Progress behavior

- Firestore: `users/{uid}/courseProgress/{courseId}`
- Resume lesson via `resolveResumeLessonId`
- Completion API supports both course IDs

## Tests added

`phase-22a-flutter-course-transfer.test.ts` — 14 assertions (catalog RU/EN, lesson content, access, assets, entitlement path)

Updated: `course-catalog.test.ts`, `course-ui-parity.test.ts`

## Manual QA

Run `npm run dev`, mobile viewport 390–430px:

- [ ] `/ru/courses` — 2 courses, First Steps first, RU titles
- [ ] `/en/courses` — EN titles for First Steps
- [ ] `/ru/courses/runes-first-steps` — 1 lesson, start opens reader
- [ ] `/ru/courses/runes-first-steps/lessons/how-to-begin-working-with-runes` — full Flutter text
- [ ] `/ru/courses/living-the-runes` — locked without purchase / unlocked when owned
- [ ] Mark complete + resume on signed-in user
- [ ] No horizontal scroll, no console errors

## Known gaps

- Lunar Path 30 Days — cover only, no Flutter content in current tree
- Runes: First Steps lesson images — placeholders in Flutter; not rendered on web yet
- Living the Runes Dart file not on disk for re-port; regenerate from backup if content drifts
- Flutter RU summary typo `"Эта lesson"` copied exactly

## Safety

- No commit / push / deploy
- Flutter untouched
- `.env.local` untouched
- No secrets printed

---

## Phase 22B visual QA results

### Routes tested (code review + local HTTP smoke)

| Route | Method |
|-------|--------|
| `/ru/courses`, `/en/courses` | HTTP 200 smoke |
| `/ru/courses/runes-first-steps` | HTTP 200 smoke |
| `/en/courses/runes-first-steps` | HTTP 200 smoke |
| `/ru/courses/runes-first-steps/lessons/how-to-begin-working-with-runes` | HTTP 200 smoke |
| `/en/courses/living-the-runes` | HTTP 200 smoke |
| `/en/courses/living-the-runes/lessons/living-01-what-it-means` | Locked body gate verified in component tests |

Full phone viewport visual pass recommended before commit.

### Issues found

| Issue | Severity | Fix |
|-------|----------|-----|
| No free/paid badge on catalog cards | UX | Added `CourseAccessBadge` |
| Catalog CTA always "View course" | UX | Free/unlocked uses `startCourse`, progress uses `resumePath` |
| Course links lacked tap feedback / prefetch control | Performance | `prefetch={false}`, `touch-manipulation`, active states |
| Lesson nav/rows missing tap polish | Performance | Same pattern on `lesson-row`, `lesson-navigation`, detail CTA |
| Catalog loading skeleton showed 1 card | UX | Two-card skeleton for 2-course catalog |
| Reader block spacing tight on mobile | UX | `space-y-6` in lesson reader |

### Fixes applied

- `course-access-badge.tsx` (new)
- `course-card.tsx` — badges, CTA labels, tap feedback
- `course-detail-hero.tsx` — badge, gold CTA with active scale
- `lesson-row.tsx`, `lesson-navigation.tsx` — prefetch + tap feedback
- `lesson-reader.tsx` — paragraph spacing
- `course-loading.tsx` — dual-card skeleton
- i18n: `accessFree`, `accessPaid`, `accessOwned` (EN/RU/DE)
- `phase-22b-course-visual-qa.test.ts`

### Locked / free behavior result

| Scenario | Result |
|----------|--------|
| Free First Steps catalog/detail/reader | Unlocked without purchase |
| Paid Living the Runes unsigned | Detail overview + locked lesson rows; reader shows `CourseAccessNotice` only |
| Direct paid lesson URL unsigned | No lesson body rendered |
| Mystic Plus without `ownedCourses` | `canOpenLessons: false` (verified in tests) |
| Shopify CTA | Shown when `productKey` + `isPaidLocked` + purchase flow configured |

### Progress behavior result

- Mark complete → `POST /api/courses/{courseId}/progress/complete` with immediate `setIsSubmitting(true)`
- Progress gate validates lesson ID + entitlement server-side
- Resume lesson resolved from `resolveResumeLessonId`

### Owned-state QA status (Phase 22B)

**Pending manual verification** — requires Firestore test user with `users/{uid}/ownedCourses/runes_24_inner_strength` active. Code path verified via `resolveCourseAccess` + `resolveCourseProgressGate` tests.

---

## Phase 22C — owned-state QA + production checkpoint

### Test entitlement contract (verified in code)

Firestore path:

```text
users/{uid}/ownedCourses/runes_24_inner_strength
```

Minimum fields for `readOwnedCourseEntitlement` / `loadUserEntitlements`:

```json
{
  "courseId": "runes_24_inner_strength",
  "status": "active",
  "updatedAt": "<Firestore Timestamp or ISO string>"
}
```

Notes:

- `status` must be `"active"` to appear in `ownedCourseIds` (`"refunded"` / `"pending"` do not unlock).
- `provider` is written as `"shopify"` by webhook grants; reads do not require extra fields.
- Optional Shopify fields: `shopifyOrderId`, `shopifyCheckoutId`, `shopifyLineItemId`, `purchasedAt`.
- Extra fields such as `source: "manual_qa"` are ignored and safe for QA.
- Mystic Plus (`users/{uid}/entitlements/mysticPlus`) does **not** unlock paid courses.

### Test user entitlement status

- Account: `test@test.com` (UID resolved via Firebase Console Authentication — not logged in tooling).
- Manual Firestore entitlement document must be created in Firebase Console before live owned-state browser QA.

### Owned-state QA result

| Check | Result |
|-------|--------|
| `resolveCourseAccess` with `ownedCourseIds` containing `runes_24_inner_strength` | Pass (unit tests) |
| Paid badge uses `accessOwned` when `isPurchased` | Pass (component + i18n) |
| Lesson rows link when `canOpenLessons` | Pass (code + tests) |
| Lesson body gated behind `canOpenLessons` | Pass (`lesson-reader-screen.tsx`) |
| Progress API gated via `resolveCourseProgressGate` | Pass (no client unlock) |
| No Mystic Plus dependency for paid course | Pass |
| Live browser QA as entitled `test@test.com` | Requires manual Firestore doc + login |

### Locked-state regression result (unsigned)

| Route | Expected | Result |
|-------|----------|--------|
| `/ru/courses/living-the-runes` | Overview visible, lessons locked | Pass (component tests + prior HTTP smoke) |
| `/ru/courses/living-the-runes/lessons/living-01-what-it-means` | Access notice only, no body | Pass (`if (!canOpenLessons)` gate) |
| No paid content in HTML when unsigned | No lesson paragraphs | Pass (verified in Phase 22B smoke) |

### Free-course regression result

| Route | Result |
|-------|--------|
| `/ru/courses/runes-first-steps` | Pass (catalog + detail tests) |
| `/ru/courses/runes-first-steps/lessons/how-to-begin-working-with-runes` | Pass (free `canOpenLessons: true`) |

### Progress behavior result

- Path: `users/{uid}/courseProgress/runes_24_inner_strength`
- APIs: `GET/POST /api/courses/runes_24_inner_strength/progress/*` behind `resolveCourseProgressGate`
- Mark complete requires active entitlement for paid lessons (server-side)

### Mobile QA result

- Course cards: cosmic styling, badges, tap feedback (`prefetch={false}`, `touch-manipulation`, active scale)
- Reader: `space-y-6` paragraph spacing
- Catalog loading: dual-card skeleton
- Bottom nav: Phase 21 perf fixes (no new course regressions in tests)
- Full 390–430px visual pass on device recommended post-deploy

### Validation

| Command | Result |
|---------|--------|
| `npm run lint` | Pass (1 pre-existing PWA script warning) |
| `npm test` | Pass — 1040 tests |
| `npm run build` | Pass |

### Tests added

- `phase-22c-owned-state-qa.test.ts` — entitlement contract, owned unlock, progress path, no client fake unlock

### Known gaps

- Google login still needs final production verification on phone
- Mystic Plus checkout is display-only
- Lunar Path has cover only, no course content yet
- Live owned-state browser QA for `test@test.com` depends on manual Firestore entitlement in target environment
- RU owned badge: `Куплен` (not `Доступ открыт`) — current i18n copy

### Performance / tap behavior result

- Course cards, detail CTA, lesson rows, prev/next links: `prefetch={false}` + `touch-manipulation` + active scale/opacity
- No new `router.refresh()` in course paths (complete button retains intentional refresh after save)
- Progress APIs deduped through shared gate (no duplicate session logic added)

### Known source-content typos (unchanged)

- RU First Steps lesson summary: `"Эта lesson помогает"` — copied exactly from Flutter; not rewritten per product rule
