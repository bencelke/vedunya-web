import type { DailyGuidancePageModel } from "@/features/daily-guidance/types/daily-guidance-view-model";

/** Safe fields exported for tests — ensures no sensitive data leaks. */
export function sanitizeGuidanceForDiagnostics(
  model: DailyGuidancePageModel,
): Record<string, unknown> {
  if (model.kind === "anonymous") {
    return { kind: model.kind, hasPreview: true };
  }
  if (model.kind === "incomplete") {
    return {
      kind: model.kind,
      hasGreetingName: Boolean(model.incomplete.greetingName),
    };
  }
  if (model.kind === "session-error") {
    return { kind: model.kind };
  }

  return {
    kind: model.kind,
    primaryTitle: model.guidance.primary.title,
    numerologyStatus: model.guidance.numerology.status,
    moonStatus: model.guidance.moon.status,
    runeStatus: model.guidance.rune.status,
  };
}
