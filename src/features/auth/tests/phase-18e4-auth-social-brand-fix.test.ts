import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getEnabledSocialAuthProviders,
  getSocialAuthProviderAvailability,
} from "@/features/auth/config/social-auth-providers";
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

describe("Phase 18E.4 — social provider availability", () => {
  it("renders Google when Firebase is configured", () => {
    const availability = getSocialAuthProviderAvailability(true);
    expect(getEnabledSocialAuthProviders(availability)).toContain("google");
  });

  it("hides Apple when NEXT_PUBLIC_ENABLE_APPLE_LOGIN is false", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = "false";
    expect(isAppleLoginEnabled()).toBe(false);
    expect(getEnabledSocialAuthProviders(getSocialAuthProviderAvailability(true))).not.toContain(
      "apple",
    );
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = previous;
  });

  it("hides Facebook when NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN is false", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = "false";
    expect(isFacebookLoginEnabled()).toBe(false);
    expect(
      getEnabledSocialAuthProviders(getSocialAuthProviderAvailability(true)),
    ).not.toContain("facebook");
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = previous;
  });

  it("shows Apple when flag is true", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = "true";
    expect(getEnabledSocialAuthProviders(getSocialAuthProviderAvailability(true))).toContain(
      "apple",
    );
    process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN = previous;
  });

  it("shows Facebook when flag is true", () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN;
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = "true";
    expect(getEnabledSocialAuthProviders(getSocialAuthProviderAvailability(true))).toContain(
      "facebook",
    );
    process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN = previous;
  });
});

describe("Phase 18E.4 — explicit provider rendering", () => {
  it("maps enabled providers through SocialAuthButton", () => {
    const buttons = readSource("src/features/auth/components/auth-provider-buttons.tsx");
    expect(buttons).toContain("getSocialAuthProviderAvailability");
    expect(buttons).toContain("SocialAuthButton");
    expect(buttons).toContain("SOCIAL_AUTH_PROVIDER_ORDER");
    expect(buttons).toContain("data-enabled-providers");
  });

  it("uses provider-specific sign-in handlers", () => {
    const social = readSource("src/features/auth/components/social-auth-button.tsx");
    expect(social).toContain("loginWithGoogle");
    expect(social).toContain("loginWithApple");
    expect(social).toContain("loginWithFacebook");
    expect(social).toContain('data-social-provider={providerId}');
  });

  it("uses Apple OAuthProvider and FacebookAuthProvider in auth service", () => {
    const service = readSource("src/features/auth/services/auth-service.ts");
    expect(service).toContain('new OAuthProvider("apple.com")');
    expect(service).toContain("new FacebookAuthProvider()");
    expect(service).toContain("auth/popup-blocked");
    expect(service).toContain("signInWithRedirect");
  });
});

describe("Phase 18E.4 — auth mode clarity", () => {
  it("renders sign-in title, subtitle, and CTA copy", () => {
    expect(en.auth.loginTitle).toBe("Sign in");
    expect(en.auth.loginDescription).toContain("daily practice");
    expect(en.auth.loginForm.submit).toBe("Sign in");
    expect(en.auth.forgotPasswordLink).toBe("Reset your password");
  });

  it("renders register title, subtitle, and CTA copy", () => {
    expect(en.auth.registerTitle).toBe("Create account");
    expect(en.auth.registerDescription).toContain("birth date");
    expect(en.auth.registerForm.submit).toBe("Create account");
    expect(en.auth.switchToLogin).toBe("Already have an account? Sign in");
  });

  it("applies login/register screen classes", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("auth-screen--login");
    expect(screen).toContain("auth-screen--register");
    expect(screen).toContain("data-auth-mode={mode}");
  });
});

describe("Phase 18E.4 — brand unification", () => {
  it("uses shared MysticBrandHeader on auth and onboarding", () => {
    const brand = readSource("src/components/brand/mystic-brand-header.tsx");
    const auth = readSource("src/features/auth/components/auth-brand-header.tsx");
    const intro = readSource("src/features/onboarding/components/intro-brand-header.tsx");
    const onboarding = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(brand).toContain("mystic-brand-wordmark");
    expect(auth).toContain("MysticBrandHeader");
    expect(intro).toContain("MysticBrandHeader");
    expect(onboarding).toContain("MysticBrandHeader");
  });

  it("keeps MYSTIC by Vedunya Maria brand text", () => {
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
    expect(ru.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
  });

  it("does not use oversized auth-only wordmark class in auth header", () => {
    const auth = readSource("src/features/auth/components/auth-brand-header.tsx");
    expect(auth).not.toContain("mystic-auth-wordmark");
    expect(auth).toContain("MysticBrandHeader");
  });
});

describe("Phase 18E.4 — friendly errors and DOB handoff", () => {
  it("maps cancelled and not-configured auth to friendly copy", () => {
    expect(mapFirebaseAuthError({ code: "auth/popup-closed-by-user" })).toBe("popupClosed");
    expect(mapFirebaseAuthError({ code: "auth/operation-not-allowed" })).toBe(
      "operationNotAllowed",
    );
    expect(en.auth.errors.popupClosed).toBe("Sign-in was cancelled.");
  });

  it("does not expose raw Firebase errors in UI", () => {
    const source = readSource("src/features/auth/components/auth-error-message.tsx");
    expect(source).toContain("{t(errorKey)}");
    expect(source).not.toMatch(/auth\/invalid-email/);
  });

  it("preserves pre-auth DOB handoff after register social success", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).not.toContain("clearPreAuthOnboardingDraft");
    expect(screen).toContain("handleRegisterSuccess");
    expect(screen).toContain("redirectAfterAuth(true)");
  });
});
