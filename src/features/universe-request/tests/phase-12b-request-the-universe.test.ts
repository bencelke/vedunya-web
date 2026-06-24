import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  universeRequestPatchSchema,
  universeRequestTextSchema,
  universeRequestUpsertSchema,
} from "@/features/universe-request/schema";
import { pickReflectionPrompt } from "@/features/universe-request/utils/reflection-prompt";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

describe("Phase 12B — universe request schema", () => {
  it("rejects empty request text", () => {
    expect(universeRequestTextSchema.safeParse("   ").success).toBe(false);
    expect(universeRequestTextSchema.safeParse("One clear step").success).toBe(true);
  });

  it("enforces 240 character max length", () => {
    expect(universeRequestTextSchema.safeParse("a".repeat(241)).success).toBe(false);
    expect(universeRequestTextSchema.safeParse("a".repeat(240)).success).toBe(true);
  });

  it("accepts optional category on upsert", () => {
    const parsed = universeRequestUpsertSchema.safeParse({
      text: "Return to calm",
      category: "path",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires at least one field on patch", () => {
    expect(universeRequestPatchSchema.safeParse({}).success).toBe(false);
    expect(
      universeRequestPatchSchema.safeParse({ reminderEnabled: false }).success,
    ).toBe(true);
  });
});

describe("Phase 12B — deterministic reflection", () => {
  it("picks stable reflection for a date key", () => {
    const first = pickReflectionPrompt("2026-06-23", "en");
    const second = pickReflectionPrompt("2026-06-23", "en");
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(10);
  });

  it("provides Russian reflection prompts", () => {
    const prompt = pickReflectionPrompt("2026-06-23", "ru");
    expect(prompt.length).toBeGreaterThan(10);
    expect(prompt).not.toContain("The universe");
    const allRu = [
      pickReflectionPrompt("2026-06-01", "ru"),
      pickReflectionPrompt("2026-06-02", "ru"),
      pickReflectionPrompt("2026-06-03", "ru"),
    ].join(" ");
    expect(allRu).toMatch(/просьб|шаг|ясн/i);
  });
});

describe("Phase 12B — localization", () => {
  it("includes EN and RU universe request titles", () => {
    expect(en.universeRequest.title).toBe("Request the Universe");
    expect(ru.universeRequest.title).toBe("Просьба к Вселенной");
  });

  it("avoids fake universe guarantee copy", () => {
    const enCopy = JSON.stringify(en.universeRequest);
    const ruCopy = JSON.stringify(ru.universeRequest);
    expect(enCopy).not.toMatch(/universe will answer|wish is guaranteed/i);
    expect(ruCopy).not.toContain("Вселенная исполнит");
    expect(ruCopy).not.toContain("принята Вселенной");
  });

  it("uses honest reminder note", () => {
    expect(en.universeRequest.reminder.honestNote).toContain(
      "after reminders are enabled",
    );
    expect(ru.universeRequest.reminder.honestNote).toContain(
      "после включения напоминаний",
    );
  });

  it("includes all category labels in EN and RU", () => {
    for (const key of [
      "love",
      "family",
      "money",
      "protection",
      "health",
      "path",
      "work",
      "other",
    ] as const) {
      expect(en.universeRequest.categories[key]).toBeTruthy();
      expect(ru.universeRequest.categories[key]).toBeTruthy();
    }
  });
});

describe("Phase 12B — Today integration wiring", () => {
  it("loads universe request in daily guidance service", () => {
    const source = readSource("src/features/daily-guidance/services/load-daily-guidance.ts");
    expect(source).toContain("loadUniverseRequestViewModel");
    expect(source).toContain("universeRequest");
  });

  it("renders universe request section above primary guidance", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = source.slice(source.indexOf("return ("));
    const requestIndex = jsx.indexOf("UniverseRequestSection");
    const primaryIndex = jsx.indexOf("PrimaryGuidanceCard");
    expect(requestIndex).toBeGreaterThan(-1);
    expect(requestIndex).toBeLessThan(primaryIndex);
  });

  it("exposes universe request API route with auth", () => {
    const source = readSource("src/app/api/universe-request/route.ts");
    expect(source).toContain("requireApiUser");
    expect(source).toContain("pauseUniverseRequest");
    expect(source).not.toContain("body.uid");
  });

  it("stores requests under users subcollection current doc", () => {
    const source = readSource(
      "src/features/universe-request/server/universe-request-repository.ts",
    );
    expect(source).toContain("universeRequests");
    expect(source).toContain('CURRENT_DOC_ID = "current"');
  });

  it("adds universe request section on Profile", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).toContain("ProfileUniverseRequestSection");
  });
});

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}
