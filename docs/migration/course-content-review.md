# Course Content Review

## Source

- Flutter: `lib/data/course/living_the_runes_course_content.dart`
- Port script: `scripts/port-living-the-runes-content.ts`
- Generated runtime: `src/features/courses/content/living-the-runes.generated.ts`

## Verification

- Lesson count: **28**
- First lesson: `living-01-what-it-means`
- Last lesson: `living-28-othala`
- Rune lesson 9 source key: `raidho` → canonical web rune ID **`raido`**
- EN/RU bodies ported from adjacent Dart string literals (no machine translation)
- Structured blocks: chapter intro, text, practice, reflection, completion

## Sanity

Sanity lesson bodies are **not** used for Living the Runes V1 (Flutter short-circuit preserved).

## Diagnostics

```powershell
npm run courses:check
```
