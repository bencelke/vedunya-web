import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 9.2 hard stop dev reload loop", () => {
  it("defines central PWA runtime flag", () => {
    const config = readSource("src/config/pwa.ts");
    expect(config).toContain("isPwaEnabled");
    expect(config).toContain("isProductionRuntime");
    expect(config).toContain('process.env.NEXT_PUBLIC_ENABLE_PWA !== "false"');
  });

  it("keeps PWA registrar inert in development", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    const gate = registrar.match(/export function PwaRegistrar\([\s\S]*?\n\}/)?.[0] ?? "";
    expect(gate).toContain("isPwaEnabled");
    expect(gate).toContain("return null");
    expect(gate).not.toContain("useEffect");
  });

  it("registers service worker only in production registrar", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).toContain("PwaRegistrarProduction");
    expect(registrar).toContain("serviceWorker.register");
  });

  it("runs dev service worker cleanup once per tab", () => {
    const cleanup = readSource("src/components/pwa/dev-service-worker-cleanup.tsx");
    expect(cleanup).toContain("cleanupDevelopmentServiceWorkers");
    expect(cleanup).toContain("hasCompletedDevelopmentServiceWorkerCleanup");
    expect(cleanup).toContain("isPwaEnabled");
  });

  it("guards production reload behind explicit user update", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).toContain("consumePendingServiceWorkerUpdateReload");
    expect(registrar).toContain("markPendingServiceWorkerUpdateReload");
  });

  it("does not claim clients automatically on service worker activate", () => {
    const sw = readSource("public/sw.js");
    const activateBlock =
      sw.match(/addEventListener\("activate"[\s\S]*?\}\);/)?.[0] ?? "";
    expect(activateBlock).not.toContain("clients.claim");
    expect(sw).toContain("SKIP_WAITING");
    expect(sw).toContain("clients.claim");
  });

  it("disables push runtime in development", () => {
    const support = readSource("src/features/notifications/utils/push-support.ts");
    expect(support).toContain("isPwaEnabled");
    const subscription = readSource("src/features/notifications/utils/push-subscription.ts");
    expect(subscription).toContain("push_unavailable_in_dev");
  });

  it("notification hooks do not navigate or poll", () => {
    const hook = readSource("src/features/notifications/hooks/use-push-notifications.ts");
    expect(hook).not.toContain("router.refresh");
    expect(hook).not.toContain("router.replace");
    expect(hook).not.toContain("useEffect");
    expect(hook).not.toContain("setInterval");
  });

  it("rewrites service worker to noop file in development", () => {
    const config = readSource("next.config.ts");
    expect(config).toContain("/sw-dev-noop.js");
  });

  it("runs beforeInteractive dev service worker cleanup script", () => {
    const script = readSource("src/components/pwa/dev-service-worker-cleanup-script.tsx");
    expect(script).toContain("beforeInteractive");
    expect(script).toContain("unregister");
    expect(script).toContain("DEV_SW_CLEANUP_KEY");
    expect(script).toContain("sessionStorage.getItem");
  });

  it("keeps /api routes excluded from service worker cache", () => {
    const sw = readSource("public/sw.js");
    expect(sw).toContain("\\/api\\/");
    expect(sw).toContain("NEVER_CACHE_PATTERNS");
  });
});
