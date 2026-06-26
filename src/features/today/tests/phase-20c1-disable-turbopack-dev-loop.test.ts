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

describe("Phase 20C.1 — stable webpack dev scripts", () => {
  it("uses webpack for default dev and keeps turbopack optional", () => {
    const pkg = JSON.parse(readSource("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(pkg.scripts?.dev).toBe("next dev --webpack");
    expect(pkg.scripts?.["dev:turbo"]).toBe("next dev --turbopack");
    expect(pkg.scripts?.build).toBe("next build --webpack");
  });
});

describe("Phase 20C.1 — PWA dev hardening", () => {
  it("keeps PwaRegistrar inert in development", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    const gate = registrar.match(/export function PwaRegistrar\([\s\S]*?\n\}/)?.[0] ?? "";

    expect(gate).toContain('process.env.NODE_ENV === "development"');
    expect(gate).toContain("return null");
  });

  it("does not reload from dev service worker cleanup script", () => {
    const script = readSource("src/components/pwa/dev-service-worker-cleanup-script.tsx");

    expect(script).not.toContain("window.location.reload");
    expect(script).not.toContain("controllerchange");
    expect(script).not.toContain("SKIP_WAITING");
  });
});

describe("Phase 20C.1 — timezone and auth idle guards", () => {
  it("does not rewrite timezone cookie when encoded value matches", () => {
    const existing = getCookieValue(
      "vedunya_tz",
      "NEXT_LOCALE=ru;vedunya_tz=Europe%2FMoscow",
    );

    expect(shouldWriteTimezoneCookie("Europe/Moscow", existing)).toBe(false);
  });

  it("dedupes auth session sync", () => {
    const session = readSource("src/features/auth/services/session-service.ts");

    expect(session).toContain("lastSyncedToken");
    expect(session).toContain("fetchSessionUser");
    expect(session).toContain("serverSessionCleared");
  });
});
