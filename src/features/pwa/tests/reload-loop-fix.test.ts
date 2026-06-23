import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("PWA reload loop fix", () => {
  it("uses central isPwaEnabled runtime flag", () => {
    const config = readSource("src/config/pwa.ts");
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(config).toContain("isPwaEnabled");
    expect(registrar).toContain("isPwaEnabled");
  });

  it("guards controllerchange reload behind explicit user update", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).toContain("consumePendingServiceWorkerUpdateReload");
    expect(registrar).toMatch(
      /handleControllerChange[\s\S]*consumePendingServiceWorkerUpdateReload/,
    );
  });

  it("reloads only after explicit update action", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).toContain("markPendingServiceWorkerUpdateReload");
    expect(registrar).toContain("applyUpdate");
    expect(registrar).toContain('type: "SKIP_WAITING"');
  });

  it("service worker does not auto skipWaiting on install", () => {
    const sw = readSource("public/sw.js");
    const installBlock =
      sw.match(/addEventListener\("install"[\s\S]*?\}\);/)?.[0] ?? "";
    expect(installBlock).not.toContain("skipWaiting");
    expect(sw).toContain('event.data?.type === "SKIP_WAITING"');
  });

  it("service worker does not repeatedly navigate clients to /ru", () => {
    const sw = readSource("public/sw.js");
    expect(sw).not.toContain('openWindow("/ru")');
    expect(sw).not.toContain("clients.navigate");
  });

  it("keeps /api routes excluded from service worker cache", () => {
    const sw = readSource("public/sw.js");
    expect(sw).toContain("\\/api\\/");
    expect(sw).toContain("NEVER_CACHE_PATTERNS");
  });

  it("landing locale route does not redirect to itself", () => {
    const landing = readSource("src/app/[locale]/page.tsx");
    expect(landing).not.toContain("redirect(");
    expect(landing).not.toContain("router.replace");
  });

  it("notification hook does not auto refresh or replace routes", () => {
    const hook = readSource("src/features/notifications/hooks/use-push-notifications.ts");
    expect(hook).not.toContain("router.refresh");
    expect(hook).not.toContain("router.replace");
    expect(hook).not.toContain("useEffect");
    expect(hook).not.toContain("setInterval");
  });
});
