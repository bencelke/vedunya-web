import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  isAppleLoginEnabled,
  isFacebookLoginEnabled,
} from "@/features/auth/config/auth-provider-flags";
import { mapFirebaseAuthError } from "@/features/auth/utils/auth-error-map";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18E.3 — auth mode clarity", () => {
  it("renders sign-in title, copy, and button in login mode", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('t("loginTitle")');
    expect(screen).toContain('t("loginDescription")');
    expect(screen).toContain('data-auth-mode={mode}');
    expect(en.auth.loginTitle).toBe("Sign in");
    expect(en.auth.loginDescription).toContain("daily practice");
    expect(en.auth.loginForm.submit).toBe("Sign in");
  });

  it("renders create-account title, copy, and button in register mode", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('t("registerTitle")');
    expect(screen).toContain('t("registerDescription")');
    expect(screen).toContain("RegisterForm");
    expect(en.auth.registerTitle).toBe("Create account");
    expect(en.auth.registerDescription).toContain("birth date");
    expect(en.auth.registerForm.submit).toBe("Create account");
  });

  it("syncs register mode with login query param", () => {
    const page = readSource("src/app/[locale]/login/page.tsx");
    expect(page).toContain('mode === "register"');
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('"/login?mode=register"');
    expect(screen).toContain("setAuthMode");
  });

  it("shows forgot password only in sign-in mode", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("forgotPasswordLink");
    expect(screen).toMatch(/isLogin \? \([\s\S]*forgotPasswordLink/);
  });
});

describe("Phase 18E.3 — social provider mode copy", () => {
  it("changes Google button text by mode", () => {
    const google = readSource("src/features/auth/components/social-auth-button.tsx");
    expect(google).toContain('mode === "register"');
    expect(google).toContain('t("registerContinue")');
    expect(en.auth.google.registerContinue).toBe("Create account with Google");
    expect(en.auth.google.continue).toBe("Continue with Google");
  });

  it("routes register-mode social sign-in through register success handler", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("mode={mode}");
    expect(screen).toContain("onSuccess={isLogin ? handleAuthSuccess : handleRegisterSuccess}");
  });

  it("hides Apple when NEXT_PUBLIC_ENABLE_APPLE_LOGIN is false", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = "false";
    expect(isAppleLoginEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = previous;
  });

  it("hides Facebook when NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN is false", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = "false";
    expect(isFacebookLoginEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = previous;
  });

  it("shows Apple when flag is true", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = "true";
    expect(isAppleLoginEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = previous;
  });

  it("shows Facebook when flag is true", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = "true";
    expect(isFacebookLoginEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = previous;
  });
});

describe("Phase 18E.3 — OAuth implementation", () => {
  it("uses Apple OAuthProvider", () => {
    const source = readSource("src/features/auth/services/auth-service.ts");
    expect(source).toContain('new OAuthProvider("apple.com")');
  });

  it("uses FacebookAuthProvider", () => {
    const source = readSource("src/features/auth/services/auth-service.ts");
    expect(source).toContain("new FacebookAuthProvider()");
  });

  it("falls back to redirect when popup is blocked", () => {
    const source = readSource("src/features/auth/services/auth-service.ts");
    expect(source).toContain("auth/popup-blocked");
    expect(source).toContain("signInWithRedirect");
  });

  it("handles redirect result in AuthProvider", () => {
    const source = readSource("src/features/auth/components/auth-provider.tsx");
    expect(source).toContain("resolveOAuthRedirectResult");
    expect(source).toContain("bootstrapUserProfile");
  });

  it("routes social success through existing post-auth profile-status logic", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("fetchProfileStatus");
    expect(screen).toContain('? "/today"');
    expect(screen).toContain('"/onboarding"');
    expect(screen).toContain("redirectStartedRef");
  });
});

describe("Phase 18E.3 — friendly errors and localization", () => {
  it("maps cancelled provider login to friendly message", () => {
    expect(mapFirebaseAuthError({ code: "auth/popup-closed-by-user" })).toBe(
      "popupClosed",
    );
    expect(en.auth.errors.popupClosed).toBe("Sign-in was cancelled.");
  });

  it("maps provider-not-configured to friendly message", () => {
    expect(mapFirebaseAuthError({ code: "auth/operation-not-allowed" })).toBe(
      "operationNotAllowed",
    );
    expect(en.auth.errors.operationNotAllowed).toContain("not enabled");
  });

  it("does not expose raw Firebase errors in UI", () => {
    const source = readSource("src/features/auth/components/auth-error-message.tsx");
    expect(source).toContain("{t(errorKey)}");
    expect(source).not.toMatch(/auth\/invalid-email/);
  });

  it("renders RU mode and social copy", () => {
    expect(ru.auth.loginTitle).toBe("Войти");
    expect(ru.auth.registerTitle).toBe("Создать аккаунт");
    expect(ru.auth.google.registerContinue).toBe("Создать аккаунт через Google");
    expect(ru.auth.apple.registerContinue).toBe("Создать аккаунт через Apple");
    expect(ru.auth.facebook.registerContinue).toBe("Создать аккаунт через Facebook");
    expect(ru.auth.switchToLogin).toBe("Уже есть аккаунт? Войти");
  });
});

describe("Phase 18E.3 — pre-auth DOB handoff", () => {
  it("does not clear pre-auth draft in auth screen", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).not.toContain("clearPreAuthOnboardingDraft");
  });

  it("forces onboarding after register-mode success", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("handleRegisterSuccess");
    expect(screen).toContain("redirectAfterAuth(true)");
  });
});
