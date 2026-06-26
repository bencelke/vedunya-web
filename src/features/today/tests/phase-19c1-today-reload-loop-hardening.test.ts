import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getCookieValue,
  shouldWriteTimezoneCookie,
} from "@/features/numerology/utils/timezone-cookie";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 19C.1 — timezone cookie hardening", () => {
  it("does not rewrite when encoded cookie matches decoded timezone", () => {
    const existing = getCookieValue(
      "vedunya_tz",
      "NEXT_LOCALE=ru;vedunya_tz=Europe%2FMoscow",
    );

    expect(shouldWriteTimezoneCookie("Europe/Moscow", existing)).toBe(false);
  });

  it("compares cookie before sessionStorage in TimezoneCookieSync", () => {
    const source = readSource(
      "src/features/numerology/components/timezone-cookie-sync.tsx",
    );

    const cookieCheck = source.indexOf("shouldWriteTimezoneCookie");
    const storageCheck = source.indexOf("sessionStorage.getItem");

    expect(cookieCheck).toBeGreaterThan(-1);
    expect(storageCheck).toBeGreaterThan(cookieCheck);
    expect(source).toContain("wroteCookieRef.current = true");
  });
});

describe("Phase 19C.1 — auth session churn guard", () => {
  it("does not resubscribe Firebase auth when locale changes", () => {
    const auth = readSource("src/features/auth/components/auth-provider.tsx");

    expect(auth).toContain("ensureOAuthRedirectChecked");
    expect(auth).not.toMatch(/}, \[configured, locale, syncSession\]/);
    expect(auth).toMatch(/}, \[configured, syncSession\]/);
  });

  it("dedupes server session sync", () => {
    const session = readSource("src/features/auth/services/session-service.ts");

    expect(session).toContain("lastSyncedToken");
    expect(session).toContain("fetchSessionUser");
    expect(session).toContain("serverSessionCleared");
  });
});

describe("Phase 19C.1 — PWA dev reload guard", () => {
  it("marks dev cleanup complete without reloading the page", () => {
    const script = readSource("src/components/pwa/dev-service-worker-cleanup-script.tsx");

    expect(script).toContain('setItem("${DEV_SW_CLEANUP_KEY}", "1")');
    expect(script).not.toContain("window.location.reload");
  });

  it("keeps PWA registrar inert in development", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    const gate = registrar.match(/export function PwaRegistrar\([\s\S]*?\n\}/)?.[0] ?? "";

    expect(gate).toContain("isPwaEnabled");
    expect(gate).toContain("return null");
  });
});

describe("Phase 19C.1 — Today mount safety", () => {
  it("does not refresh or replace on Today page mount", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");

    expect(todayPage).not.toContain("router.refresh");
    expect(todayPage).not.toContain("router.replace");
    expect(todayPage).not.toContain("useEffect");
  });

  it("keeps language dropdown user-initiated only", () => {
    const dropdown = readSource("src/components/i18n/language-dropdown.tsx");

    expect(dropdown).toContain("onChange={(event) => handleChange(event.target.value)}");
    expect(dropdown).not.toContain("useEffect");
    expect(dropdown).toContain("if (nextLocale === locale)");
  });

  it("only refreshes universe request after explicit save or pause", () => {
    const section = readSource(
      "src/features/universe-request/components/universe-request-section.tsx",
    );

    expect(section).toContain("router.refresh");
    expect(section).not.toContain("useEffect");
    expect(section).toContain("onCreated={refresh}");
  });
});

describe("Phase 19C.1 — premium Today preserved", () => {
  it("keeps Phase 19C language dropdown and editorial Today sections", () => {
    const header = readSource("src/components/layout/app-header.tsx");
    const rune = readSource("src/features/today/components/today-rune-section.tsx");

    expect(header).toContain("LanguageDropdown");
    expect(rune).toContain("MysticRuneSigil");
    expect(rune).not.toContain("Hash");
  });
});
