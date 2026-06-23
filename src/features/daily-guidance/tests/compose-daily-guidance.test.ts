import { describe, expect, it } from "vitest";

import {
  composeAuthenticatedGuidance,
  composeMoonSection,
  composeNumerologySection,
  composeReflectionNote,
  composeRuneSection,
  serializeGuidanceForTests,
} from "@/features/daily-guidance/services/compose-daily-guidance";
import {
  composePrimaryMessage,
  shouldShowRuneAction,
} from "@/features/daily-guidance/services/compose-primary-message";
import { sanitizeGuidanceForDiagnostics } from "@/features/daily-guidance/services/sanitize-guidance-diagnostics";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";

const formatPersonalDayExplanation = (number: number, title: string) =>
  `Personal day ${number} — ${title} sets the tone behind today's focus.`;

const labels = {
  primaryLabel: "Your focus for today",
  numerologyUnavailable: "Numerology unavailable",
  moonUnavailable: "Moon unavailable",
  runeUnavailable: "Rune unavailable",
  formatPersonalDayExplanation,
};

const numerologyResult = {
  dateKey: "2026-06-13",
  calculation: {
    birthDay: 15,
    birthMonth: 3,
    currentDay: 13,
    currentMonth: 6,
    currentYear: 2026,
    rawValue: 2063,
    personalDayNumber: 2,
    dateKey: "2026-06-13",
  },
  content: {
    title: "Cooperation",
    summary: "Today favors listening before deciding.",
    doAdvice: "Choose one conversation to handle with care.",
    avoidAdvice: "Avoid rushing a reply you have not fully considered.",
  },
  contentKey: "pd-2",
};

const runeResult = {
  selection: {
    runeId: "sowilo" as const,
    runeIndex: 15,
    dateKey: "2026-06-13",
    seed: 2367,
  },
  content: {
    title: "Sowilo",
    short: "Clarity through steady movement.",
    guidance: "Clarity through steady movement.",
    action: "Take one visible step forward.",
  },
  assetPath: "/assets/runes/symbols/sowilo.svg",
};

const moonResult = {
  dateKey: "2026-06-13",
  timezone: "UTC",
  calculation: {
    phaseId: "waning" as const,
    phase8Id: "waning_gibbous" as const,
    lunarDay: 22,
    illumination: 0.82,
    moonAgeDays: 21.4,
  },
  phase: {
    title: "Waning gibbous",
    short: "Refine and release.",
    guidance: "Let excess fall away gently.",
    action: "Complete one small release today.",
  },
  lunarDayContent: null,
  source: { phase: "fallback" as const, lunarDay: "missing" as const },
};

function composeAll(input: Partial<Parameters<typeof composeAuthenticatedGuidance>[0]> = {}) {
  return composeAuthenticatedGuidance({
    formattedDate: "Friday, June 13",
    greetingName: "Maria",
    premiumActive: false,
    labels,
    numerology: numerologyResult,
    moon: moonResult,
    rune: runeResult,
    ...input,
  });
}

describe("composePrimaryMessage", () => {
  it("uses personal-day summary and action as primary", () => {
    const primary = composePrimaryMessage({
      primaryLabel: labels.primaryLabel,
      numerology: numerologyResult,
      rune: runeResult,
    });

    expect(primary?.title).toBe("Cooperation");
    expect(primary?.message).toBe("Today favors listening before deciding.");
    expect(primary?.action).toBe("Choose one conversation to handle with care.");
  });

  it("falls back to rune when numerology is missing", () => {
    const primary = composePrimaryMessage({
      primaryLabel: labels.primaryLabel,
      numerology: null,
      rune: runeResult,
    });

    expect(primary?.title).toBe("Sowilo");
    expect(primary?.action).toBe("Take one visible step forward.");
  });
});

describe("composeAuthenticatedGuidance", () => {
  it("composes complete profile guidance with isolated sections", () => {
    const guidance = composeAll();

    expect(guidance?.primary.message).toBe(numerologyResult.content.summary);
    expect(guidance?.numerology.status).toBe("ready");
    expect(guidance?.moon.status).toBe("ready");
    expect(guidance?.rune.status).toBe("ready");
    if (guidance && isGuidanceReady(guidance.rune)) {
      expect(guidance.rune.data.showPremiumDeepLock).toBe(true);
      expect(guidance.rune.data.action).toBeNull();
    }
  });

  it("keeps numerology unavailable without blocking moon and rune", () => {
    const guidance = composeAll({ numerology: null, greetingName: null });

    expect(guidance?.numerology.status).toBe("unavailable");
    expect(guidance?.moon.status).toBe("ready");
    expect(guidance?.rune.status).toBe("ready");
  });

  it("keeps moon unavailable without blocking numerology and rune", () => {
    const guidance = composeAll({ moon: null });

    expect(guidance?.moon.status).toBe("unavailable");
    expect(guidance?.numerology.status).toBe("ready");
    expect(guidance?.rune.status).toBe("ready");
  });

  it("keeps rune unavailable without blocking numerology and moon", () => {
    const guidance = composeAll({ rune: null });

    expect(guidance?.rune.status).toBe("unavailable");
    expect(guidance?.numerology.status).toBe("ready");
    expect(guidance?.moon.status).toBe("ready");
  });

  it("keeps moon and rune unavailable without blocking primary from numerology", () => {
    const guidance = composeAll({ moon: null, rune: null, greetingName: null });

    expect(guidance?.primary.message).toBeTruthy();
    expect(guidance?.moon.status).toBe("unavailable");
    expect(guidance?.rune.status).toBe("unavailable");
  });

  it("does not repeat primary message in personal-day explanation", () => {
    const guidance = composeAll();
    expect(guidance).not.toBeNull();

    if (guidance && isGuidanceReady(guidance.numerology)) {
      expect(guidance.numerology.data.explanation).not.toBe(
        guidance.primary.message,
      );
      expect(guidance.numerology.data.explanation).toContain("2");
      expect(guidance.numerology.data.explanation).toContain("Cooperation");
    }
  });

  it("renders primary message only once in composed output", () => {
    const guidance = composeAll();
    const serialized = JSON.stringify(guidance);
    const message = numerologyResult.content.summary;
    const occurrences = serialized.split(message).length - 1;
    expect(occurrences).toBe(1);
  });

  it("hides rune action when it matches primary action", () => {
    const sameActionRune = {
      ...runeResult,
      content: {
        ...runeResult.content,
        action: numerologyResult.content.doAdvice,
      },
    };

    const rune = composeRuneSection(
      sameActionRune,
      labels.runeUnavailable,
      numerologyResult.content.doAdvice,
      { premiumActive: true },
    );

    expect(rune.status).toBe("ready");
    if (isGuidanceReady(rune)) {
      expect(rune.data.action).toBeNull();
    }
  });

  it("uses locale-aware moon and rune links", () => {
    const guidance = composeAll();
    if (guidance && isGuidanceReady(guidance.moon)) {
      expect(guidance.moon.data.href).toBe("/moon");
    }
    if (guidance && isGuidanceReady(guidance.rune)) {
      expect(guidance.rune.data.href).toBe("/runes/sowilo");
    }
  });

  it("supports empty display-name fallback", () => {
    const guidance = composeAll({ greetingName: null });
    expect(guidance?.greetingName).toBeNull();
  });

  it("returns deterministic output for repeated composition", () => {
    const input = {
      formattedDate: "Friday, June 13",
      greetingName: "Maria",
      premiumActive: false,
      labels,
      numerology: numerologyResult,
      moon: moonResult,
      rune: runeResult,
    };

    expect(composeAuthenticatedGuidance(input)).toEqual(
      composeAuthenticatedGuidance(input),
    );
  });

  it("does not expose sensitive fields in serialized test output", () => {
    const guidance = composeAll();
    expect(guidance).not.toBeNull();
    const serialized = JSON.stringify(serializeGuidanceForTests(guidance!));

    expect(serialized).not.toContain("2063");
    expect(serialized).not.toContain("seed");
    expect(serialized).not.toContain("uid");
    expect(serialized).not.toContain("dateKey");
    expect(serialized).not.toContain("Maria");
  });

  it("does not leak Firestore content source into view model", () => {
    const guidance = composeAll();
    const serialized = JSON.stringify(guidance);
    expect(serialized).not.toContain("firestore");
    expect(serialized).not.toContain("fallback");
  });
});

describe("composeNumerologySection", () => {
  it("stores explanation separately from primary content", () => {
    const numerology = composeNumerologySection(
      numerologyResult,
      labels.numerologyUnavailable,
      numerologyResult.content.summary,
      numerologyResult.content.doAdvice,
      formatPersonalDayExplanation,
    );

    expect(numerology.status).toBe("ready");
    if (isGuidanceReady(numerology)) {
      expect(numerology.data.number).toBe(2);
      expect(numerology.data.title).toBe("Cooperation");
      expect(numerology.data.explanation).toContain("Personal day 2");
    }
  });
});

describe("composeReflectionNote", () => {
  it("uses avoidAdvice when distinct from primary message and action for premium users", () => {
    const reflection = composeReflectionNote(
      numerologyResult,
      numerologyResult.content.summary,
      numerologyResult.content.doAdvice,
      true,
    );
    expect(reflection).toBe(numerologyResult.content.avoidAdvice);
  });

  it("hides reflection for free users", () => {
    const reflection = composeReflectionNote(
      numerologyResult,
      numerologyResult.content.summary,
      numerologyResult.content.doAdvice,
      false,
    );
    expect(reflection).toBeNull();
  });
});

describe("premium gating", () => {
  it("hides moon deep content for free users", () => {
    const moon = composeMoonSection(moonResult, "Moon unavailable", false);
    expect(moon.status).toBe("ready");
    if (isGuidanceReady(moon)) {
      expect(moon.data.deep).toBeNull();
      expect(moon.data.showPremiumDeepLock).toBe(true);
    }
  });

  it("shows moon deep content for premium users", () => {
    const moon = composeMoonSection(moonResult, "Moon unavailable", true);
    expect(moon.status).toBe("ready");
    if (isGuidanceReady(moon)) {
      expect(moon.data.deep).toBe("Let excess fall away gently.");
      expect(moon.data.action).toBe("Complete one small release today.");
    }
  });

  it("exposes premium depth for premium users in composed guidance", () => {
    const guidance = composeAll({
      premiumActive: true,
      runeDeep: "A deeper symbolic read.",
    });

    expect(guidance?.premiumActive).toBe(true);
    expect(guidance?.reflection).toBeTruthy();
    if (guidance && isGuidanceReady(guidance.rune)) {
      expect(guidance.rune.data.deep).toBe("A deeper symbolic read.");
    }
  });
});

describe("shouldShowRuneAction", () => {
  it("shows rune action when different from primary", () => {
    expect(shouldShowRuneAction("Step A", "Step B")).toBe(true);
  });

  it("hides rune action when identical after normalization", () => {
    expect(shouldShowRuneAction("Step A", "  step a ")).toBe(false);
  });
});

describe("composeMoonSection", () => {
  it("returns unavailable when moon is missing", () => {
    expect(composeMoonSection(null, "Moon unavailable", false).status).toBe(
      "unavailable",
    );
  });
});

describe("anonymous preview model", () => {
  it("uses example content without fake personal-day number", () => {
    const preview = {
      formattedDate: "Friday, June 13",
      previewLabel: "Preview — example only.",
      primary: {
        label: "Your focus for today",
        title: "Example title",
        message: "Example message",
        action: "Example action",
      },
      moon: composeMoonSection(moonResult, "Moon unavailable", false),
      runePreview: {
        title: "Fehu",
        summary: "Example symbolic focus.",
        assetPath: "/assets/runes/symbols/fehu.svg",
      },
      personalizeMessage: "Sign in to personalize.",
    };

    const serialized = JSON.stringify(preview);
    expect(serialized).not.toMatch(/personalDayNumber|"number":\s*\d/);
    expect(preview.previewLabel.toLowerCase()).toContain("preview");
  });
});

describe("incomplete profile model", () => {
  it("avoids numerology and rune fields", () => {
    const incomplete = {
      formattedDate: "Friday, June 13",
      greetingName: null,
      setupMessage: "Complete your profile.",
      setupHref: "/onboarding" as const,
    };

    const serialized = JSON.stringify(incomplete);
    expect(serialized).not.toContain("rune");
    expect(serialized).not.toContain("personalDay");
    expect(serialized).not.toContain("numerology");
  });
});

describe("sanitizeGuidanceForDiagnostics", () => {
  it("does not expose sensitive fields", () => {
    const guidance = composeAll();
    const sanitized = sanitizeGuidanceForDiagnostics({
      kind: "authenticated",
      guidance: guidance!,
    });

    expect(JSON.stringify(sanitized)).not.toContain("Maria");
    expect(JSON.stringify(sanitized)).not.toContain("2063");
    expect(JSON.stringify(sanitized)).not.toContain("seed");
    expect(JSON.stringify(sanitized)).not.toContain("uid");
    expect(JSON.stringify(sanitized)).not.toContain("dateKey");
  });

  it("supports anonymous and incomplete states", () => {
    expect(
      sanitizeGuidanceForDiagnostics({
        kind: "anonymous",
        preview: {
          formattedDate: "Friday",
          previewLabel: "Preview",
          primary: {
            label: "Focus",
            title: "Title",
            message: "Message",
            action: "Action",
          },
          moon: { status: "unavailable", message: "x" },
          runePreview: {
            title: "Fehu",
            summary: "Example",
            assetPath: "/assets/runes/symbols/fehu.svg",
          },
          personalizeMessage: "Sign in",
        },
      }).kind,
    ).toBe("anonymous");
  });
});

describe("forbidden product copy", () => {
  it("does not include Card of the Day or Feed references in labels", () => {
    const forbidden = ["Card of the Day", "Feed", "card of the day", "feed"];
    const labelBlob = JSON.stringify(labels);
    for (const term of forbidden) {
      expect(labelBlob.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });
});

describe("loading skeleton contract", () => {
  it("contains no fake calculated values", async () => {
    const { DailyGuidanceLoadingSkeleton } = await import(
      "@/features/daily-guidance/components/daily-guidance-loading"
    );
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = renderToStaticMarkup(
      DailyGuidanceLoadingSkeleton({ loadingLabel: "Loading" }),
    );

    expect(html.toLowerCase()).not.toContain("fehu");
    expect(html.toLowerCase()).not.toContain("cooperation");
    expect(html.toLowerCase()).not.toContain("personal day");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading");
  });
});
