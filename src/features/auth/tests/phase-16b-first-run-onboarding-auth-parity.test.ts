import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();
const FORBIDDEN_FIRST_SCREEN = [
  "Daily guidance for a calmer, clearer day.",
  "A glimpse of today",
  "View today’s guidance",
  "How it works",
] as const;

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 16B — root entry", () => {
  it("does not render dark marketing landing on root page", () => {
    const source = readSource("src/app/[locale]/page.tsx");
    expect(source).not.toContain("LandingHero");
    expect(source).not.toContain("ValuePreview");
    expect(source).not.toContain("HowItWorks");
    expect(source).toContain("SignedOutRootRedirect");
  });

  it("redirects signed-in complete profile to Today from root", () => {
    const source = readSource("src/app/[locale]/page.tsx");
    expect(source).toContain("getTodayRedirectPath");
    expect(source).toContain("getOnboardingRedirectPath");
  });

  it("routes signed-out users via intro onboarding storage", () => {
    const redirect = readSource(
      "src/features/auth/components/signed-out-root-redirect.tsx",
    );
    expect(redirect).toContain("isIntroOnboardingSeen");
    expect(redirect).toContain('"/login"');
    expect(redirect).toContain('"/onboarding"');
  });

  it("parks marketing landing at preview route only", () => {
    const preview = readSource("src/app/[locale]/preview/page.tsx");
    expect(preview).toContain("LandingHero");
    const root = readSource("src/app/[locale]/page.tsx");
    expect(root).not.toContain("landing");
  });
});

describe("Phase 16B — intro onboarding", () => {
  it("renders four intro pages with EN copy", () => {
    expect(en.auth.intro.pages.guidance.title).toBe("Daily guidance");
    expect(en.auth.intro.pages.universe.title).toBe("Request to the Universe");
    expect(en.auth.intro.pages.reminders.title).toBe("Reminders");
    expect(en.auth.intro.pages.courses.title).toBe("Courses and deeper practice");
    expect(en.auth.intro.pages.guidance.body).toContain("number of the day");
  });

  it("renders four intro pages with RU copy", () => {
    expect(ru.auth.intro.pages.guidance.title).toBe("Ежедневная подсказка");
    expect(ru.auth.intro.pages.universe.title).toBe("Просьба к Вселенной");
    expect(ru.auth.intro.pages.reminders.title).toBe("Напоминания");
    expect(ru.auth.intro.pages.courses.title).toBe("Курсы и глубокая практика");
    expect(ru.auth.intro.pages.guidance.body).toContain("число дня");
  });

  it("marks intro seen and routes final CTA to login", () => {
    const flow = readSource(
      "src/features/onboarding/components/intro-onboarding-flow.tsx",
    );
    expect(flow).toContain("markIntroOnboardingSeen");
    expect(flow).toContain('finishIntro("login")');
    expect(flow).toContain('"/login?mode=register"');
  });

  it("redirects returning signed-out users from onboarding to login", () => {
    const gate = readSource(
      "src/features/onboarding/components/intro-onboarding-gate.tsx",
    );
    expect(gate).toContain("isIntroOnboardingSeen");
    expect(gate).toContain('router.replace("/login")');
  });
});

describe("Phase 16B — white auth screen", () => {
  it("uses mystic auth page shell with logo and brand", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("AuthShell");
    expect(screen).toContain("AuthBrandHeader");
    expect(screen).not.toContain("backToLanding");
  });

  it("renders Google login button", () => {
    const providers = readSource(
      "src/features/auth/components/auth-provider-buttons.tsx",
    );
    expect(providers).toContain("SocialAuthButton");
  });

  it("hides Apple and Facebook unless env flags are true", () => {
    const flags = readSource("src/features/auth/config/auth-provider-flags.ts");
    expect(flags).toContain("NEXT_PUBLIC_ENABLE_APPLE_LOGIN");
    expect(flags).toContain("NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN");

    const providers = readSource(
      "src/features/auth/components/auth-provider-buttons.tsx",
    );
    expect(providers).toContain("getSocialAuthProviderAvailability");
    expect(providers).toContain("social-auth-providers");
    expect(providers).not.toContain("AppleSignInPlaceholder");
  });

  it("does not fake Apple/Facebook when disabled by default", () => {
    const providers = readSource(
      "src/features/auth/components/auth-provider-buttons.tsx",
    );
    expect(providers).toContain("enabledProviders.map");
    expect(providers).toContain("data-enabled-providers");
  });
});

describe("Phase 16B — forbidden landing copy", () => {
  it("does not use forbidden strings in root or onboarding entry sources", () => {
    const sources = [
      "src/app/[locale]/page.tsx",
      "src/features/onboarding/components/intro-onboarding-flow.tsx",
      "src/features/auth/components/auth-screen.tsx",
    ];

    for (const path of sources) {
      const source = readSource(path);
      for (const phrase of FORBIDDEN_FIRST_SCREEN) {
        expect(source).not.toContain(phrase);
      }
    }
  });
});

describe("Phase 16B — signed-in redirects", () => {
  it("redirects complete profile away from onboarding page", () => {
    const page = readSource("src/app/[locale]/onboarding/page.tsx");
    expect(page).toContain("getTodayRedirectPath");
    expect(page).toContain("OnboardingRoute");
  });

  it("preserves auth redirect after login", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('? "/today"');
    expect(screen).toContain('"/onboarding"');
    expect(screen).toContain("fetchProfileStatus");
    expect(screen).toContain("handleRegisterSuccess");
  });
});

describe("Phase 16B — localization", () => {
  it("avoids known EN leaks in RU intro copy", () => {
    const ruIntro = JSON.stringify(ru.auth.intro);
    expect(ruIntro).not.toContain("Daily guidance");
    expect(ruIntro).not.toContain("Continue with");
    expect(ru.auth.intro.login).toBe("Войти");
  });
});

describe("Phase 16B — documentation", () => {
  it("documents Firebase provider setup", () => {
    const doc = readSource("docs/setup/firebase-auth-providers.md");
    expect(doc).toContain("Sign-in method");
    expect(doc).toContain("Apple");
    expect(doc).toContain("Facebook");
  });
});
