import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 18A — RU intro copy", () => {
  it("uses improved three-screen copy", () => {
    expect(ru.auth.intro.screens.guidance.body).toContain("лунный ритм");
    expect(ru.auth.intro.screens.practice.body).toContain("намерением");
    expect(ru.auth.intro.rhythm.title).toBe("Дата рождения");
  });
});

describe("Phase 18A — EN intro copy", () => {
  it("uses improved three-screen copy", () => {
    expect(en.auth.intro.screens.guidance.body).toContain("moon rhythm");
    expect(en.auth.intro.screens.practice.body).toContain("intention");
    expect(en.auth.intro.rhythm.title).toBe("Birth date");
  });
});

describe("Phase 18A — intro layout and navigation", () => {
  const flow = () =>
    readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");

  it("renders progress dots for three premium intro screens", () => {
    const source = flow();
    expect(source).toContain("OnboardingProgress");
    expect(source).toContain("INTRO_STEP_COUNT = 3");
    expect(source).toContain("totalSteps={INTRO_STEP_COUNT}");
  });

  it("hides back button on first page", () => {
    const source = flow();
    expect(source).toContain("step > 0 ?");
    expect(source).toContain('aria-label={t("back")}');
  });

  it("shows Create account and Log in on rhythm screen", () => {
    const source = flow();
    expect(source).toContain("IntroRhythmScreen");
    const rhythm = readSource(
      "src/features/onboarding/components/intro-rhythm-screen.tsx",
    );
    expect(rhythm).toContain("{t(\"createAccount\")}");
    expect(rhythm).toContain("{t(\"login\")}");
  });

  it("routes Create account to register mode", () => {
    const source = flow();
    expect(source).toContain('"/login?mode=register"');
  });

  it("routes Log in to login mode", () => {
    const source = flow();
    expect(source).toMatch(/destination === "register" \? "\/login\?mode=register" : "\/login"/);
  });

  it("uses premium intro layout classes", () => {
    const source = flow();
    expect(source).toContain("mystic-intro-frame");
    expect(source).toContain("mystic-intro-panel");
    expect(source).toContain("IntroOnboardingHighlights");
  });
});

describe("Phase 18A — intro styles", () => {
  it("defines intro layout utilities", () => {
    const css = readSource("src/styles/mystic-theme.css");
    expect(css).toContain(".mystic-intro-frame");
    expect(css).toContain(".mystic-intro-stage");
    expect(css).toContain(".mystic-intro-panel");
  });
});
