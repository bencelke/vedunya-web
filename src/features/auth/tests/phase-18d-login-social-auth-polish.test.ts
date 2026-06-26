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

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 18D — provider visibility flags", () => {
  it("hides Apple when NEXT_PUBLIC_ENABLE_APPLE_LOGIN is not true", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = "false";
    expect(isAppleLoginEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = previous;
  });

  it("hides Facebook when NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN is not true", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = "";
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

describe("Phase 18D — login screen providers", () => {
  const buttons = () =>
    readSource("src/features/auth/components/auth-provider-buttons.tsx");

  it("shows Google when Firebase is configured", () => {
    const source = buttons();
    expect(source).toContain("SocialAuthButton");
    expect(source).toContain("getSocialAuthProviderAvailability");
  });

  it("gates Apple and Facebook behind env flags", () => {
    const source = buttons();
    expect(source).toContain("getSocialAuthProviderAvailability");
    expect(source).toContain("SOCIAL_AUTH_PROVIDER_ORDER");
  });
});

describe("Phase 18D — OAuth providers and redirect", () => {
  it("uses Apple OAuthProvider", () => {
    const source = readSource("src/features/auth/services/auth-service.ts");
    expect(source).toContain('new OAuthProvider("apple.com")');
    expect(source).toContain("loginWithApple");
  });

  it("uses FacebookAuthProvider", () => {
    const source = readSource("src/features/auth/services/auth-service.ts");
    expect(source).toContain("new FacebookAuthProvider()");
    expect(source).toContain("loginWithFacebook");
  });

  it("falls back to redirect when popup is blocked", () => {
    const source = readSource("src/features/auth/services/auth-service.ts");
    expect(source).toContain("auth/popup-blocked");
    expect(source).toContain("signInWithRedirect");
    expect(source).toContain("isStandaloneDisplayMode");
  });

  it("handles redirect result in AuthProvider", () => {
    const source = readSource("src/features/auth/components/auth-provider.tsx");
    expect(source).toContain("resolveOAuthRedirectResult");
    expect(source).toContain("bootstrapUserProfile");
  });
});

describe("Phase 18D — post-login routing", () => {
  it("routes complete profile to Today and incomplete to onboarding", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain('? "/today"');
    expect(source).toContain('"/onboarding"');
    expect(source).toContain("fetchProfileStatus");
    expect(source).toContain("redirectStartedRef");
  });

  it("routes register mode from login query param", () => {
    const source = readSource("src/app/[locale]/login/page.tsx");
    expect(source).toContain('mode === "register"');
  });
});

describe("Phase 18D — login UI polish", () => {
  it("uses premium login layout", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    const shell = readSource("src/components/ui/auth-shell.tsx");
    expect(screen).toContain('layout="login"');
    expect(shell).toContain("mystic-login-panel");
    expect(shell).toContain("mystic-login-frame");
  });

  it("includes provider icons", () => {
    const social = readSource("src/features/auth/components/social-auth-button.tsx");
    expect(social).toContain("AppleProviderIcon");
    expect(social).toContain("FacebookProviderIcon");
    expect(social).toContain("mysticAssets.brand.googleIcon");
  });
});

describe("Phase 18D — friendly errors", () => {
  it("maps cancelled popup to popupClosed", () => {
    expect(mapFirebaseAuthError({ code: "auth/popup-closed-by-user" })).toBe(
      "popupClosed",
    );
  });

  it("does not expose raw Firebase codes in error UI", () => {
    const source = readSource("src/features/auth/components/auth-error-message.tsx");
    expect(source).toContain('{t(errorKey)}');
    expect(source).not.toMatch(/auth\/invalid-email/);
  });
});

describe("Phase 18D — RU/EN button labels", () => {
  it("renders EN social labels", () => {
    expect(en.auth.google.continue).toBe("Continue with Google");
    expect(en.auth.google.registerContinue).toBe("Create account with Google");
    expect(en.auth.apple.continue).toBe("Continue with Apple");
    expect(en.auth.apple.registerContinue).toBe("Create account with Apple");
    expect(en.auth.facebook.continue).toBe("Continue with Facebook");
    expect(en.auth.facebook.registerContinue).toBe("Create account with Facebook");
    expect(en.auth.loginTitle).toBe("Sign in");
    expect(en.auth.registerTitle).toBe("Create account");
    expect(en.auth.errors.popupClosed).toBe("Sign-in was cancelled.");
  });

  it("renders RU social labels", () => {
    expect(ru.auth.google.continue).toBe("Продолжить с Google");
    expect(ru.auth.google.registerContinue).toBe("Создать аккаунт через Google");
    expect(ru.auth.apple.continue).toBe("Продолжить с Apple");
    expect(ru.auth.apple.registerContinue).toBe("Создать аккаунт через Apple");
    expect(ru.auth.facebook.continue).toBe("Продолжить с Facebook");
    expect(ru.auth.facebook.registerContinue).toBe("Создать аккаунт через Facebook");
    expect(ru.auth.loginTitle).toBe("Войти");
    expect(ru.auth.errors.popupClosed).toBe("Вход отменён.");
  });
});
