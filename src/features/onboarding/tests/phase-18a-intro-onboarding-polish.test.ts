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
  it("uses improved page copy", () => {
    expect(ru.auth.intro.pages.guidance.body).toContain("Каждое утро");
    expect(ru.auth.intro.pages.guidance.body).toContain("число дня");
    expect(ru.auth.intro.pages.universe.body).toContain("без спешки");
    expect(ru.auth.intro.pages.reminders.body).toContain("Мягкие сообщения");
    expect(ru.auth.intro.pages.courses.body).toContain("глубже");
  });

  it("uses Начать on page 1", () => {
    expect(ru.auth.intro.start).toBe("Начать");
  });
});

describe("Phase 18A — EN intro copy", () => {
  it("uses improved page copy", () => {
    expect(en.auth.intro.pages.guidance.body).toContain("morning anchor");
    expect(en.auth.intro.pages.guidance.body).toContain("number of the day");
    expect(en.auth.intro.pages.universe.body).toContain("without pressure");
    expect(en.auth.intro.pages.reminders.body).toContain("Gentle messages");
    expect(en.auth.intro.pages.courses.body).toContain("go deeper");
  });

  it("uses Start on page 1", () => {
    expect(en.auth.intro.start).toBe("Start");
  });
});

describe("Phase 18A — intro layout and navigation", () => {
  const flow = () =>
    readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");

  it("renders progress dots for intro plus first glimpse", () => {
    const source = flow();
    expect(source).toContain("OnboardingProgress");
    expect(source).toContain("INTRO_STEP_COUNT = INTRO_PAGE_COUNT + 1");
    expect(source).toContain("totalSteps={INTRO_STEP_COUNT}");
  });

  it("hides back button on first page", () => {
    const source = flow();
    expect(source).toContain("step > 0 ?");
    expect(source).toContain('aria-label={t("back")}');
  });

  it("shows Log in and Create account on first glimpse step", () => {
    const source = flow();
    expect(source).toContain("IntroFirstGlimpse");
    expect(source).toContain('finishIntro("login")');
    expect(source).toContain('finishIntro("register")');
    const glimpse = readSource(
      "src/features/onboarding/components/intro-first-glimpse.tsx",
    );
    expect(glimpse).toContain("{t(\"createAccount\")}");
    expect(glimpse).toContain("{t(\"login\")}");
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
