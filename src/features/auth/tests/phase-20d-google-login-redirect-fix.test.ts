import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 20D — Google OAuth redirect handling", () => {
  it("resolves redirect result once through a shared gate", () => {
    const gate = readSource("src/features/auth/services/oauth-redirect-gate.ts");
    const provider = readSource("src/features/auth/components/auth-provider.tsx");

    expect(gate).toContain("ensureOAuthRedirectChecked");
    expect(gate).toContain("resolveOAuthRedirectResult");
    expect(provider).toContain("ensureOAuthRedirectChecked");
    expect(provider).not.toContain("bootstrapUserProfile");
  });

  it("handles redirect result on login mount with a single-use ref", () => {
    const hook = readSource("src/features/auth/hooks/use-oauth-redirect-handler.ts");

    expect(hook).toContain("handledRef");
    expect(hook).toContain("ensureOAuthRedirectChecked");
    expect(hook).toContain("completeSocialSignIn");
    expect(hook).not.toContain("getRedirectResult");
  });

  it("posts to session through the same social sign-in helper as popup", () => {
    const flow = readSource("src/features/auth/services/social-sign-in-flow.ts");
    const hook = readSource("src/features/auth/hooks/use-oauth-redirect-handler.ts");

    expect(flow).toContain("createServerSession");
    expect(flow).toContain("bootstrapUserProfile");
    expect(hook).toContain("completeSocialSignIn");
  });

  it("redirects authenticated users after OAuth without hadUserOnMount gate", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");

    expect(screen).toContain("useOAuthRedirectHandler");
    expect(screen).not.toContain("hadUserOnMountRef");
    expect(screen).toContain("void redirectAfterAuth(false)");
  });
});

describe("Phase 20D — Google mobile/desktop strategy", () => {
  it("uses redirect on mobile and Safari", () => {
    const strategy = readSource("src/features/auth/utils/google-oauth-strategy.ts");
    const service = readSource("src/features/auth/services/auth-service.ts");

    expect(strategy).toContain("shouldUseRedirectForGoogleAuth");
    expect(strategy).toContain("isSafari");
    expect(service).toContain("shouldUseRedirectForGoogleAuth");
    expect(service).toContain("signInWithPopup");
    expect(service).toContain("signInWithRedirect");
  });

  it("falls back to redirect when popup is blocked", () => {
    const service = readSource("src/features/auth/services/auth-service.ts");

    expect(service).toContain("auth/popup-blocked");
    expect(service).toContain("signInWithRedirect");
  });
});

describe("Phase 20D — safe Google diagnostics", () => {
  it("logs only when NEXT_PUBLIC_AUTH_DEBUG is true", () => {
    const debug = readSource("src/features/auth/utils/google-auth-debug.ts");

    expect(debug).toContain('NEXT_PUBLIC_AUTH_DEBUG === "true"');
    expect(debug).not.toContain("idToken");
    expect(debug).not.toContain("getIdToken");
  });

  it("documents optional auth debug flag in env example", () => {
    const example = readSource(".env.example");

    expect(example).toContain("NEXT_PUBLIC_AUTH_DEBUG");
  });
});

describe("Phase 20D — Google visible errors", () => {
  it("maps EN Google auth errors", () => {
    expect(en.auth.errors.unauthorizedDomain).toContain("Google login");
    expect(en.auth.errors.googleSignInFailed).toBe(
      "Google login could not be completed.",
    );
  });

  it("maps RU Google auth errors", () => {
    expect(ru.auth.errors.unauthorizedDomain).toContain("Google");
    expect(ru.auth.errors.googleSignInFailed).toBe(
      "Не удалось завершить вход через Google.",
    );
  });

  it("shows OAuth redirect errors on the auth screen", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");

    expect(screen).toContain("oauthRedirectError");
    expect(screen).toContain("<AuthErrorMessage errorKey={oauthRedirectError}");
  });
});

describe("Phase 20D — email/password preserved", () => {
  it("keeps email login session handoff in LoginForm", () => {
    const login = readSource("src/features/auth/components/login-form.tsx");

    expect(login).toContain("createServerSession");
    expect(login).toContain("loginWithEmail");
    expect(login).not.toContain("signInWithRedirect");
  });
});

describe("Phase 20D — production checklist doc", () => {
  it("documents Firebase and Google Cloud manual settings", () => {
    const doc = readSource("docs/migration/production-google-login-checklist.md");

    expect(doc).toContain("mystic-app-fb9ce");
    expect(doc).toContain("vedunya-web.vercel.app");
    expect(doc).toContain("Test users");
  });
});
