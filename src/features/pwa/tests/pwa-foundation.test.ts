import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import { pwaConfig, PWA_NEVER_CACHE_PATTERNS } from "@/config/pwa";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("PWA manifest", () => {
  it("has correct Mystic identity and display settings", () => {
    const data = manifest();
    expect(data.name).toBe("Mystic by Vedunya Maria");
    expect(data.short_name).toBe("Mystic");
    expect(data.start_url).toBe("/en/today");
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#0B0D14");
    expect(data.background_color).toBe("#0B0D14");
  });

  it("references PNG manifest icons", () => {
    const data = manifest();
    const icons = data.icons ?? [];
    expect(icons.some((icon) => icon.src === "/icons/icon-192x192.png")).toBe(true);
    expect(icons.some((icon) => icon.src === "/icons/icon-512x512.png")).toBe(true);
    expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    expect(icons.every((icon) => icon.type === "image/png")).toBe(true);
  });

  it("has manifest icon files on disk", () => {
    for (const iconPath of Object.values(pwaConfig.icons)) {
      const relative = iconPath.replace(/^\//, "");
      expect(existsSync(resolve(WEB_ROOT, "public", relative))).toBe(true);
    }
  });
});

describe("PWA service worker", () => {
  it("exists and avoids caching auth/API paths", () => {
    const source = readSource("public/sw.js");
    expect(source).toContain("addEventListener");
    expect(source).toContain('addEventListener("push"');
    expect(source).toContain("showNotification");
    expect(source).toContain("NEVER_CACHE_PATTERNS");
    expect(source).toContain("identitytoolkit");
  });

  it("documents forbidden cache patterns in shared config", () => {
    expect(PWA_NEVER_CACHE_PATTERNS.some((pattern) => pattern.test("/api/auth/me"))).toBe(
      true,
    );
  });
});

describe("PWA install UX", () => {
  it("renders install section in Profile", () => {
    const profile = readSource("src/features/profile/components/profile-content.tsx");
    expect(profile).toContain("PwaInstallSection");
  });

  it("hides install prompt logic when standalone", () => {
    const hook = readSource("src/features/pwa/hooks/use-pwa-install.ts");
    expect(hook).toContain("isStandaloneDisplayMode");
    expect(hook).toContain("showInstalledHint");
  });

  it("includes iPhone install guide copy EN/RU", () => {
    expect(en.pwa.iosGuide).toContain("Add to Home Screen");
    expect(ru.pwa.iosGuide).toContain("На экран Домой");
  });

  it("registers service worker only in production from client registrar", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).toContain("isPwaEnabled");
    expect(registrar).toContain("PwaRegistrarProduction");
    expect(registrar).toContain("serviceWorker.register");
    expect(registrar).not.toContain("Notification");
    expect(registrar).not.toContain("pushManager");
  });
});

describe("PWA offline route", () => {
  it("renders offline page route", () => {
    const source = readSource("src/app/[locale]/offline/page.tsx");
    expect(source).toContain("offlineTitle");
    expect(source).toContain("mystic-today-column");
  });
});

describe("PWA push exclusion", () => {
  it("does not request notification permission automatically in Phase 8 PWA shell", () => {
    const pwaFiles = [
      "src/components/pwa/pwa-registrar.tsx",
      "src/features/pwa/hooks/use-pwa-install.ts",
      "src/features/pwa/components/pwa-install-section.tsx",
    ];

    for (const file of pwaFiles) {
      const source = readSource(file);
      expect(source).not.toContain("Notification.requestPermission");
      expect(source).not.toContain("pushManager");
      expect(source).not.toContain("firebase.messaging");
    }
  });
});
