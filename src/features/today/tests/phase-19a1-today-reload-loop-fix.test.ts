import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveTimeZone } from "@/features/numerology/engine/date-only";
import {
  getCookieValue,
  shouldWriteTimezoneCookie,
} from "@/features/numerology/utils/timezone-cookie";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 19A.1 — Today reload loop fix", () => {
  it("parses timezone cookie when it is not the first cookie", () => {
    const existing = getCookieValue(
      "vedunya_tz",
      "NEXT_LOCALE=ru;vedunya_tz=Europe%2FBerlin",
    );

    expect(existing).toBe("Europe%2FBerlin");
    expect(shouldWriteTimezoneCookie("Europe/Berlin", existing)).toBe(false);
  });

  it("decodes encoded timezone values on the server", () => {
    expect(resolveTimeZone("Europe%2FBerlin")).toBe("Europe/Berlin");
    expect(resolveTimeZone("Europe/Berlin")).toBe("Europe/Berlin");
  });

  it("does not rewrite timezone cookie when sessionStorage guard is present", () => {
    const source = readSource(
      "src/features/numerology/components/timezone-cookie-sync.tsx",
    );

    expect(source).toContain("useRef");
    expect(source).toContain("TIMEZONE_SYNC_STORAGE_KEY");
    expect(source).toContain("sessionStorage.getItem");
    expect(source).toContain("shouldWriteTimezoneCookie");
  });

  it("keeps today route free of client router refresh on mount", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    const header = readSource(
      "src/features/daily-guidance/components/daily-guidance-header.tsx",
    );
    const requestForm = readSource(
      "src/features/universe-request/components/universe-request-form.tsx",
    );

    expect(todayPage).not.toContain("router.refresh");
    expect(todayPage).not.toContain("useEffect");
    expect(header).not.toContain("useEffect");
    expect(header).not.toContain("router.refresh");
    expect(requestForm).not.toContain("useEffect");
    expect(requestForm).not.toContain("router.refresh");
  });

  it("only refreshes universe request after explicit save or pause", () => {
    const section = readSource(
      "src/features/universe-request/components/universe-request-section.tsx",
    );

    expect(section).toContain("router.refresh");
    expect(section).not.toContain("useEffect");
    expect(section).toContain("onCreated={refresh}");
    expect(section).toContain("onUpdated={refresh}");
    expect(section).toContain("onPaused={refresh}");
  });

  it("dedupes auth session sync before posting a new session cookie", () => {
    const session = readSource("src/features/auth/services/session-service.ts");
    const auth = readSource("src/features/auth/components/auth-provider.tsx");

    expect(session).toContain("syncServerSession");
    expect(session).toContain("fetchSessionUser");
    expect(auth).toContain("syncServerSession");
    expect(auth).not.toContain("createServerSession(token");
  });

  it("does not register PWA or reload in development", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    const gate = registrar.match(/export function PwaRegistrar\([\s\S]*?\n\}/)?.[0] ?? "";

    expect(gate).toContain("isPwaEnabled");
    expect(gate).toContain("return null");
    expect(gate).not.toContain("useEffect");
  });

  it("reloads at most once after unregistering stale dev service workers", () => {
    const script = readSource("src/components/pwa/dev-service-worker-cleanup-script.tsx");
    const lifecycle = readSource("src/features/pwa/utils/service-worker-lifecycle.ts");

    expect(script).toContain("DEV_SW_RELOAD_KEY");
    expect(lifecycle).toContain('DEV_SW_RELOAD_KEY = "mystic:dev-sw-reload-done"');
    expect(script).toContain("DEV_SW_CLEANUP_KEY");
    expect(script).toContain("window.location.reload");
    const cleanupSet = script.indexOf('setItem("${DEV_SW_CLEANUP_KEY}", "1")');
    const reload = script.indexOf("window.location.reload");
    expect(cleanupSet).toBeLessThan(reload);
  });

  it("keeps profile gate redirects server-side without client replace loops", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");

    expect(todayPage).toContain("isProfileComplete");
    expect(todayPage).toContain("getOnboardingRedirectPath(locale)");
    expect(todayPage).not.toContain("router.replace");
  });
});
