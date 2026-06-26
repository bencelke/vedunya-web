import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 16C — Today reload loop guards", () => {
  it("skips initial signed-out logout ping in auth provider", () => {
    const source = readSource("src/features/auth/components/auth-provider.tsx");
    expect(source).toContain("hadFirebaseUserRef");
    expect(source).toContain("if (hadFirebaseUserRef.current)");
  });

  it("dedupes session sync and logout network calls", () => {
    const source = readSource("src/features/auth/services/session-service.ts");
    expect(source).toContain("lastSyncSucceeded");
    expect(source).toContain("serverSessionCleared");
    expect(source).toContain("syncServerSession");
    expect(source).toMatch(/if \(lastSyncedToken === idToken\)[\s\S]*lastSyncSucceeded/);
  });

  it("syncs server session via auth provider without direct createServerSession", () => {
    const source = readSource("src/features/auth/components/auth-provider.tsx");
    expect(source).toContain("syncServerSession");
    expect(source).not.toContain("createServerSession(token");
  });

  it("does not replace auth routes with the current pathname", () => {
    const authScreen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(authScreen).toContain("usePathname");
    expect(authScreen).toContain("pathname !== destination");
    expect(authScreen).toContain("redirectStartedRef");

    const rootRedirect = readSource(
      "src/features/auth/components/signed-out-root-redirect.tsx",
    );
    expect(rootRedirect).toContain("pathname === destination");

    const introGate = readSource(
      "src/features/onboarding/components/intro-onboarding-gate.tsx",
    );
    expect(introGate).toContain('pathname === "/login"');
  });

  it("compares timezone cookie using decoded existing value", () => {
    const source = readSource(
      "src/features/numerology/components/timezone-cookie-sync.tsx",
    );
    const util = readSource("src/features/numerology/utils/timezone-cookie.ts");

    expect(source).toContain("shouldWriteTimezoneCookie");
    expect(source).toContain("useRef");
    expect(source).toContain("TIMEZONE_SYNC_STORAGE_KEY");
    expect(util).toContain("safeDecodeCookieValue");
    expect(util).toContain('cookieHeader.split(";")');
  });

  it("runs beforeInteractive dev service worker cleanup once per tab", () => {
    const source = readSource(
      "src/components/pwa/dev-service-worker-cleanup-script.tsx",
    );
    expect(source).toContain("DEV_SW_CLEANUP_KEY");
    expect(source).toContain("sessionStorage.getItem");
  });

  it("keeps today route free of client redirect effects", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    expect(todayPage).not.toContain("useEffect");
    expect(todayPage).not.toContain("router.replace");
    expect(todayPage).not.toContain("router.refresh");
  });

  it("redirects signed-in complete profile from root only when server session exists", () => {
    const root = readSource("src/app/[locale]/page.tsx");
    expect(root).toContain("getCurrentUser()");
    expect(root).toContain("getTodayRedirectPath");
    expect(root).toContain("SignedOutRootRedirect");
    expect(root).not.toContain("router.replace");
  });
});
