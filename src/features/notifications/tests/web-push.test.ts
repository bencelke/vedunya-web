import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import {
  notificationPreferencesSchema,
  pushSubscribeRequestSchema,
} from "@/features/notifications/schemas/push-schema";
import { hashSubscriptionEndpoint } from "@/features/notifications/utils/subscription-hash";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Web Push env documentation", () => {
  it("documents required VAPID env names", () => {
    const setupDoc = readSource("docs/setup/web-push-vapid-setup.md");
    expect(setupDoc).toContain("NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY");
    expect(setupDoc).toContain("WEB_PUSH_PRIVATE_KEY");
    expect(setupDoc).toContain("WEB_PUSH_SUBJECT");
    expect(setupDoc).not.toMatch(/BEGIN PRIVATE KEY/);
  });
});

describe("Web Push Profile UI", () => {
  it("renders notification settings card in Profile", () => {
    const profile = readSource("src/features/profile/components/profile-content.tsx");
    expect(profile).toContain("NotificationSettingsCard");
  });

  it("shows iPhone install requirement component", () => {
    const card = readSource(
      "src/features/notifications/components/notification-settings-card.tsx",
    );
    expect(card).toContain("IosPushInstallRequirement");
    expect(card).toContain("requiresInstalledPwa");
  });

  it("requests permission only from enable action", () => {
    const hook = readSource("src/features/notifications/hooks/use-push-notifications.ts");
    expect(hook).toContain("enableReminders");
    expect(hook).toContain("requestNotificationPermissionFromUserAction");
    expect(hook).not.toContain("useEffect");
  });
});

describe("Web Push client utilities", () => {
  it("uses PushManager subscribe only after user-driven enable flow", () => {
    const subscription = readSource(
      "src/features/notifications/utils/push-subscription.ts",
    );
    const hook = readSource("src/features/notifications/hooks/use-push-notifications.ts");
    expect(subscription).toContain("pushManager.subscribe");
    expect(subscription).toContain("requestNotificationPermissionFromUserAction");
    expect(hook).toContain("enableReminders");
    expect(hook).not.toContain("useEffect");
  });

  it("detects installed PWA requirement for iPhone Safari", () => {
    const support = readSource("src/features/notifications/utils/push-support.ts");
    expect(support).toContain("requiresInstalledPwaForPush");
    expect(support).toContain("isIosSafari");
  });
});

describe("Web Push API routes", () => {
  it("requires auth for subscribe route", () => {
    const route = readSource("src/app/api/push/subscribe/route.ts");
    expect(route).toContain("requireApiUser");
    expect(route).toContain("pushSubscribeRequestSchema");
  });

  it("validates subscribe payload and stores via repository", () => {
    const route = readSource("src/app/api/push/subscribe/route.ts");
    expect(route).toContain("mergePushSubscription");
    expect(route).toContain("auth.user.uid");
  });

  it("requires auth for test send route", () => {
    const route = readSource("src/app/api/push/test/route.ts");
    expect(route).toContain("requireApiUser");
    expect(route).toContain("sendWebPushToEndpoint");
  });

  it("hashes subscription endpoint for Firestore document id", () => {
    const endpoint = "https://push.example.test/device/abc";
    const hash = hashSubscriptionEndpoint(endpoint);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});

describe("Web Push service worker", () => {
  it("handles push and notification clicks without caching API routes", () => {
    const source = readSource("public/sw.js");
    expect(source).toContain('addEventListener("push"');
    expect(source).toContain('addEventListener("notificationclick"');
    expect(source).toContain('addEventListener("pushsubscriptionchange"');
    expect(source).toContain("showNotification");
    expect(source).toContain("NEVER_CACHE_PATTERNS");
    expect(source).toContain("\\/api\\/");
  });

  it("keeps notification payload generic without profile fields", () => {
    const source = readSource("public/sw.js");
    expect(source).not.toContain("displayName");
    expect(source).not.toContain("email");
    expect(source).toContain("title");
    expect(source).toContain("body");
  });
});

describe("Web Push localization", () => {
  it("includes EN/RU reminder copy", () => {
    expect(en.notifications.morningCopy).toContain("daily guidance");
    expect(en.notifications.middayCopy).toContain("clear step");
    expect(en.notifications.eveningCopy).toContain("reflect");
    expect(en.notifications.testCopy).toContain("working on this device");

    expect(ru.notifications.morningCopy).toContain("подсказка дня");
    expect(ru.notifications.middayCopy).toContain("точный шаг");
    expect(ru.notifications.eveningCopy).toContain("итог дня");
    expect(ru.notifications.testCopy).toContain("работают на этом устройстве");
  });
});

describe("Web Push exclusions", () => {
  it("does not add FCM or OneSignal dependencies", () => {
    const pkg = JSON.parse(readSource("package.json")) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies?.["web-push"]).toBeTruthy();
    expect(pkg.dependencies?.["onesignal-node"]).toBeUndefined();
    expect(readSource("src/features/notifications/server/send-web-push.ts")).not.toContain(
      "firebase/messaging",
    );
  });

  it("does not auto-request permission in PWA registrar", () => {
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(registrar).not.toContain("Notification.requestPermission");
    expect(registrar).not.toContain("pushManager");
  });
});

describe("Web Push schemas", () => {
  it("validates subscribe payload shape", () => {
    const parsed = pushSubscribeRequestSchema.safeParse({
      endpoint: "https://push.example.test/subscription",
      keys: { p256dh: "abc", auth: "def" },
      locale: "en",
      timezone: "Europe/London",
    });
    expect(parsed.success).toBe(true);
  });

  it("validates notification preferences", () => {
    const parsed = notificationPreferencesSchema.safeParse({
      enabled: true,
      morning: { enabled: true, time: "08:00" },
      midday: { enabled: true, time: "13:00" },
      evening: { enabled: true, time: "21:00" },
      timezone: "UTC",
      locale: "en",
    });
    expect(parsed.success).toBe(true);
  });
});
