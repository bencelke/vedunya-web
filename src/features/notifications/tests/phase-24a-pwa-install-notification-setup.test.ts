import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import de from "@/messages/de.json";
import { notificationPreferencesSchema } from "@/features/notifications/schemas/push-schema";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 24A — manifest install readiness", () => {
  it("has install-ready Mystic manifest fields", () => {
    const data = manifest();
    expect(data.name).toBe("Mystic by Vedunya Maria");
    expect(data.short_name).toBe("Mystic");
    expect(data.start_url).toBe("/ru");
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#080A10");
    expect(data.icons?.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(data.icons?.some((icon) => icon.sizes === "512x512")).toBe(true);
    expect(data.icons?.some((icon) => icon.purpose === "maskable")).toBe(true);
  });
});

describe("Phase 24A — install state detection", () => {
  it("detects standalone and beforeinstallprompt client-side only", () => {
    const hook = readSource("src/features/pwa/use-pwa-install-state.ts");
    expect(hook).toContain('"use client"');
    expect(hook).toContain("isStandaloneDisplayMode");
    expect(hook).toContain("beforeinstallprompt");
    expect(hook).toContain("getNotificationPermission");
    expect(hook).not.toContain("getServerSession");
  });

  it("renders iOS install instructions when not standalone", () => {
    const card = readSource("src/features/pwa/components/install-mystic-card.tsx");
    expect(card).toContain("iosInstallFull");
    expect(card).not.toContain("beforeinstallprompt()");
  });

  it("uses beforeinstallprompt on Android install button", () => {
    const card = readSource("src/features/pwa/components/install-mystic-card.tsx");
    expect(card).toContain("promptInstall");
    const hook = readSource("src/features/pwa/use-pwa-install-state.ts");
    expect(hook).toContain("deferredPrompt.prompt()");
  });
});

describe("Phase 24A — Profile notification panel", () => {
  it("shows install requirement before enable in profile panel", () => {
    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    expect(panel).toContain("InstallMysticCard");
    expect(panel).toContain("requiresInstalledPwa");
    expect(panel).toContain("enableReminders");
    expect(panel).toContain("togglesLockedHint");
  });

  it("does not auto-request notification permission", () => {
    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    const hook = readSource("src/features/notifications/hooks/use-push-notifications.ts");
    expect(panel).not.toContain("Notification.requestPermission");
    expect(hook).toContain("requestNotificationPermissionFromUserAction");
  });

  it("disables reminder toggles until subscribed", () => {
    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    expect(panel).toContain("canEditPreferences");
    expect(panel).toContain("preferences.enabled && status.subscribed");
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain("!draft.enabled");
  });

  it("includes course reminder preference slot", () => {
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain('"course"');
    expect(en.notifications.courseLabel).toBe("Course reminder");
    expect(ru.notifications.courseLabel).toBe("Напоминание о курсе");
  });
});

describe("Phase 24A — push API auth and honesty", () => {
  it("requires auth on subscribe and preferences routes", () => {
    for (const path of [
      "src/app/api/push/subscribe/route.ts",
      "src/app/api/push/preferences/route.ts",
      "src/app/api/push/unsubscribe/route.ts",
      "src/app/api/push/test/route.ts",
    ]) {
      const route = readSource(path);
      expect(route).toContain("requireApiUser");
    }
  });

  it("reports honest VAPID missing state", () => {
    const config = readSource("src/features/notifications/server/web-push-config.ts");
    const panel = readSource(
      "src/features/notifications/components/notification-permission-state.tsx",
    );
    expect(config).toContain("isWebPushConfigured");
    expect(panel).toContain("statusNotConfigured");
  });
});

describe("Phase 24A — service worker push handling", () => {
  it("handles push and notificationclick in sw.js", () => {
    const sw = readSource("public/sw.js");
    expect(sw).toContain('addEventListener("push"');
    expect(sw).toContain('addEventListener("notificationclick"');
    expect(sw).toContain("showNotification");
    expect(sw).toContain("openWindow");
    expect(sw).toContain("/ru/today");
  });

  it("preserves no dev reload loop in registrar", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).toContain("isPwaEnabled");
    const sw = readSource("public/sw.js");
    const installBlock =
      sw.match(/addEventListener\("install"[\s\S]*?\}\);/)?.[0] ?? "";
    expect(installBlock).not.toContain("skipWaiting");
  });
});

describe("Phase 24A — localization", () => {
  it("includes EN notification panel strings", () => {
    expect(en.notifications.panelTitle).toBe("Notifications");
    expect(en.notifications.enableAction).toBe("Enable notifications");
    expect(en.pwa.iosInstallFull).toContain("enable notifications");
  });

  it("includes RU notification panel strings", () => {
    expect(ru.notifications.panelTitle).toBe("Уведомления");
    expect(ru.notifications.enableAction).toBe("Включить уведомления");
    expect(ru.pwa.iosInstallFull).toContain("уведомления");
  });

  it("DE notification keys exist without undefined", () => {
    expect(de.notifications.panelTitle).toBe("Notifications");
    expect(de.notifications.courseLabel).toBe("Course reminder");
    expect(JSON.stringify(de.notifications)).not.toContain("undefined");
  });

  it("validates course in notification preferences schema", () => {
    const parsed = notificationPreferencesSchema.safeParse({
      enabled: true,
      morning: { enabled: true, time: "09:00" },
      midday: { enabled: true, time: "13:00" },
      evening: { enabled: true, time: "20:00" },
      course: { enabled: false, time: "18:00" },
      universeRequest: { enabled: false, time: "10:00" },
      timezone: "UTC",
      locale: "en",
    });
    expect(parsed.success).toBe(true);
  });
});
