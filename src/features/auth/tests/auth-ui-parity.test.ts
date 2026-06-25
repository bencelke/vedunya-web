import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { shouldShowBottomNav } from "@/config/navigation";
import {
  mapFirebaseAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Auth UI parity — routes and shell", () => {
  it("uses Mystic auth page layout on login screen", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    const shell = readSource("src/components/ui/auth-shell.tsx");
    expect(screen).toContain("AuthShell");
    expect(screen).toContain("AuthBrandHeader");
    expect(shell).toContain("mystic-auth-page");
  });

  it("renders register mode toggle in combined auth screen", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain('"register"');
    expect(source).toContain("RegisterForm");
    expect(source).toContain("switchToRegister");
  });

  it("renders forgot-password route with branded shell", () => {
    const source = readSource("src/app/[locale]/forgot-password/page.tsx");
    expect(source).toContain("AuthBrandHeader");
    expect(source).toContain("ForgotPasswordForm");
    expect(source).toContain("AuthShell");
  });

  it("does not show bottom navigation on auth routes", () => {
    expect(shouldShowBottomNav("/login")).toBe(false);
    expect(shouldShowBottomNav("/forgot-password")).toBe(false);
    expect(shouldShowBottomNav("/onboarding")).toBe(false);
  });

  it("uses flat page layout for auth shell by default", () => {
    const source = readSource("src/components/ui/auth-shell.tsx");
    expect(source).toContain('layout = "page"');
    expect(source).toContain('layout === "login"');
    expect(source).toContain("mystic-auth-content");
  });
});

describe("Auth UI parity — providers", () => {
  it("wires Google button to existing loginWithGoogle handler", () => {
    const source = readSource(
      "src/features/auth/components/google-sign-in-button.tsx",
    );
    expect(source).toContain("loginWithGoogle");
    expect(source).toContain("completeSocialSignIn");
    expect(source).toContain("mysticAssets.brand.googleIcon");
  });

  it("groups provider buttons with flag-gated Apple and Facebook", () => {
    const source = readSource(
      "src/features/auth/components/auth-provider-buttons.tsx",
    );
    expect(source).toContain("GoogleSignInButton");
    expect(source).toContain("isAppleLoginEnabled");
    expect(source).toContain("isFacebookLoginEnabled");
  });
});

describe("Auth UI parity — branding and inputs", () => {
  it("references Mystic logo asset in brand header", () => {
    const source = readSource(
      "src/features/auth/components/auth-brand-header.tsx",
    );
    expect(source).toContain("MysticLogo");
    expect(source).toContain('t("brandWordmark")');
    expect(source).toContain("mystic-auth-wordmark");
    expect(source).toContain("mystic-auth-divider");
    expect(source).not.toContain(">Mystic<");
  });

  it("uses underline auth inputs matching Flutter decoration", () => {
    const login = readSource("src/features/auth/components/login-form.tsx");
    const register = readSource(
      "src/features/auth/components/register-form.tsx",
    );
    const forgot = readSource(
      "src/features/auth/components/forgot-password-form.tsx",
    );
    expect(login).toContain('variant="underline"');
    expect(register).toContain('variant="underline"');
    expect(forgot).toContain('variant="underline"');
  });

  it("renders Firebase missing-config state without throwing", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain("configuration.title");
    expect(source).toContain("configuration.body");
    expect(source).not.toContain("throw new Error");
  });
});

describe("Auth UI parity — error mapping", () => {
  const cases: Array<[string, AuthErrorKey]> = [
    ["auth/invalid-email", "invalidEmail"],
    ["auth/wrong-password", "invalidCredential"],
    ["auth/user-not-found", "invalidCredential"],
    ["auth/email-already-in-use", "emailAlreadyInUse"],
    ["auth/popup-closed-by-user", "popupClosed"],
    ["auth/unknown-code", "generic"],
  ];

  it.each(cases)("maps %s to friendly key %s", (code, key) => {
    expect(mapFirebaseAuthError({ code })).toBe(key);
  });

  it("does not expose raw Firebase codes in error message component", () => {
    const source = readSource(
      "src/features/auth/components/auth-error-message.tsx",
    );
    expect(source).toContain('useTranslations("auth.errors")');
    expect(source).toContain("{t(errorKey)}");
    expect(source).not.toMatch(/auth\/invalid-email/);
  });
});

describe("Auth UI parity — localization", () => {
  it("includes polished EN auth copy", () => {
    expect(en.auth.brandWordmark).toBe("Vedunya Maria");
    expect(en.auth.welcomeHeadline).toContain("Mystic by Vedunya Maria");
    expect(en.auth.loginDescription).toContain("daily practice");
    expect(en.auth.google.continue).toBe("Continue with Google");
    expect(en.auth.apple.continue).toBe("Continue with Apple");
  });

  it("includes polished RU auth copy", () => {
    expect(ru.auth.brandWordmark).toBe("Vedunya Maria");
    expect(ru.auth.welcomeHeadline).toContain("Mystic by Vedunya Maria");
    expect(ru.auth.loginDescription).toContain("ежедневную практику");
    expect(ru.auth.google.continue).toBe("Продолжить с Google");
    expect(ru.auth.apple.continue).toBe("Продолжить с Apple");
  });
});

describe("Auth UI parity — navigation scope", () => {
  it("does not expose Feed, Cards, or Admin links in auth screen source", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).not.toContain("/feed");
    expect(source).not.toContain("/admin");
    expect(source).not.toContain("/cards");
  });
});

describe("Auth UI parity — redirect behavior preserved", () => {
  it("redirects completed profiles to Today and incomplete to onboarding", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain('complete ? "/today" : "/onboarding"');
    expect(source).toContain("/api/auth/profile-status");
  });
});
