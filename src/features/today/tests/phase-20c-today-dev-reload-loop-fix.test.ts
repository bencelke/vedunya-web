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

describe("Phase 20C — PWA dev reload hard stop", () => {
  it("does not register or reload from PwaRegistrar in development", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    const gate = registrar.match(/export function PwaRegistrar\([\s\S]*?\n\}/)?.[0] ?? "";

    expect(gate).toContain('process.env.NODE_ENV === "development"');
    expect(gate).toContain("isPwaEnabled");
    expect(gate).toContain("return null");
    expect(gate).not.toContain("useEffect");
  });

  it("unregisters dev service workers without location.reload", () => {
    const script = readSource("src/components/pwa/dev-service-worker-cleanup-script.tsx");

    expect(script).toContain("unregister");
    expect(script).toContain("DEV_SW_CLEANUP_KEY");
    expect(script).not.toContain("window.location.reload");
    expect(script).not.toContain("location.reload");
    expect(script).not.toContain("controllerchange");
    expect(script).not.toContain("SKIP_WAITING");
  });

  it("keeps client-side dev cleanup inert after first pass", () => {
    const cleanup = readSource("src/components/pwa/dev-service-worker-cleanup.tsx");

    expect(cleanup).toContain("hasCompletedDevelopmentServiceWorkerCleanup");
    expect(cleanup).toContain("cleanupDevelopmentServiceWorkers");
    expect(cleanup).not.toContain("location.reload");
  });
});

describe("Phase 20C — timezone cookie idle safety", () => {
  it("does not rewrite when encoded cookie matches decoded timezone", () => {
    const existing = getCookieValue(
      "vedunya_tz",
      "NEXT_LOCALE=ru;vedunya_tz=Europe%2FMoscow",
    );

    expect(shouldWriteTimezoneCookie("Europe/Moscow", existing)).toBe(false);
  });

  it("compares decoded cookie before writing in TimezoneCookieSync", () => {
    const source = readSource(
      "src/features/numerology/components/timezone-cookie-sync.tsx",
    );

    expect(source).toContain("shouldWriteTimezoneCookie");
    expect(source).not.toContain("router.refresh");
  });
});

describe("Phase 20C — auth session idle safety", () => {
  it("dedupes repeated server session writes", () => {
    const session = readSource("src/features/auth/services/session-service.ts");

    expect(session).toContain("lastSyncedToken");
    expect(session).toContain("serverSessionCleared");
    expect(session).toContain("fetchSessionUser");
  });

  it("does not resubscribe auth listener when locale changes", () => {
    const auth = readSource("src/features/auth/components/auth-provider.tsx");

    expect(auth).toContain("localeRef");
    expect(auth).not.toMatch(/}, \[configured, locale, syncSession\]/);
    expect(auth).not.toContain("router.refresh");
  });
});

describe("Phase 20C — Today route idle safety", () => {
  it("does not refresh or replace on /today mount", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");

    expect(todayPage).not.toContain("router.refresh");
    expect(todayPage).not.toContain("router.replace");
    expect(todayPage).not.toContain("useEffect");
  });

  it("does not redirect-loop between locales on Today page", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");

    expect(todayPage).not.toContain("redirect(getTodayRedirectPath");
    expect(todayPage).toContain('export const dynamic = "force-dynamic"');
  });

  it("only refreshes universe request after explicit user action", () => {
    const section = readSource(
      "src/features/universe-request/components/universe-request-section.tsx",
    );

    expect(section).toContain("router.refresh");
    expect(section).not.toContain("useEffect");
    expect(section).toContain("onCreated={refresh}");
  });
});
