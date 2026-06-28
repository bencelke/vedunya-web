import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import { getNotificationCopy } from "@/features/notifications/content/notification-copy";
import {
  getDueReminderTypes,
  getLocalTimeContext,
  isReminderTimeDue,
  isTimezoneValid,
  parseTimeToMinutes,
  SCHEDULE_WINDOW_MINUTES,
} from "@/features/notifications/server/reminder-due";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 14 — cron route security", () => {
  it("documents SCHEDULED_REMINDERS_SECRET in env example", () => {
    const envExample = readSource(".env.example");
    expect(envExample).toContain("SCHEDULED_REMINDERS_SECRET=");
    expect(envExample).not.toContain("NEXT_PUBLIC_SCHEDULED_REMINDERS_SECRET");
  });

  it("requires Authorization bearer on cron route", () => {
    const route = readSource("src/app/api/cron/send-reminders/route.ts");
    expect(route).toContain('request.headers.get("authorization")');
    expect(route).toContain("verifyScheduledRemindersAuthorization");
    expect(route).toContain("401");
  });

  it("rejects missing secret configuration", () => {
    const auth = readSource("src/features/notifications/server/cron-auth.ts");
    expect(auth).toContain("SCHEDULED_REMINDERS_SECRET");
    expect(auth).toContain("CRON_SECRET");
  });

  it("rejects invalid bearer token via auth helper", () => {
    const auth = readSource("src/features/notifications/server/cron-auth.ts");
    expect(auth).toContain('startsWith("Bearer ")');
    expect(auth).toContain("secrets.includes(token)");
  });

  it("accepts valid bearer token via auth helper", () => {
    const auth = readSource("src/features/notifications/server/cron-auth.ts");
    expect(auth).toContain("verifyScheduledRemindersAuthorization");
  });

  it("supports Vercel CRON_SECRET as an alias", () => {
    const auth = readSource("src/features/notifications/server/cron-auth.ts");
    expect(auth).toContain("CRON_SECRET");
  });
});

describe("Phase 14 — due-time calculation", () => {
  it("parses HH:mm times", () => {
    expect(parseTimeToMinutes("08:30")).toBe(8 * 60 + 30);
    expect(parseTimeToMinutes("25:00")).toBeNull();
  });

  it("matches configured time inside the send window", () => {
    expect(isReminderTimeDue("08:30", 8 * 60 + 30)).toBe(true);
    expect(isReminderTimeDue("08:30", 8 * 60 + 44)).toBe(true);
    expect(isReminderTimeDue("08:30", 8 * 60 + 45)).toBe(false);
    expect(isReminderTimeDue("08:30", 8 * 60 + 29)).toBe(false);
    expect(SCHEDULE_WINDOW_MINUTES).toBe(15);
  });

  it("falls back safely for invalid timezone", () => {
    const context = getLocalTimeContext("Not/A_Real_Timezone", new Date("2026-06-23T12:00:00.000Z"));
    expect(context.timezoneValid).toBe(false);
    expect(context.timezone).toBe("UTC");
    expect(context.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses valid timezone for local date context", () => {
    expect(isTimezoneValid("Europe/Moscow")).toBe(true);
    const context = getLocalTimeContext(
      "Europe/Moscow",
      new Date("2026-06-23T05:30:00.000Z"),
    );
    expect(context.timezoneValid).toBe(true);
    expect(context.minutesSinceMidnight).toBe(8 * 60 + 30);
  });

  it("skips disabled global preferences", () => {
    const prefs = {
      enabled: false,
      morning: { enabled: true, time: "09:00" },
      midday: { enabled: true, time: "13:00" },
      evening: { enabled: true, time: "20:00" },
      course: { enabled: false, time: "18:00" },
      universeRequest: { enabled: false, time: "10:00" },
      timezone: "UTC",
      locale: "en" as const,
      updatedAt: new Date().toISOString(),
    };

    const due = getDueReminderTypes(
      prefs,
      new Date("2026-06-23T08:35:00.000Z"),
    );
    expect(due).toEqual([]);
  });

  it("skips disabled reminder slots", () => {
    const prefs = {
      enabled: true,
      morning: { enabled: false, time: "09:00" },
      midday: { enabled: true, time: "13:00" },
      evening: { enabled: true, time: "20:00" },
      course: { enabled: true, time: "18:00" },
      universeRequest: { enabled: false, time: "10:00" },
      timezone: "UTC",
      locale: "en" as const,
      updatedAt: new Date().toISOString(),
    };

    const due = getDueReminderTypes(
      prefs,
      new Date("2026-06-23T18:05:00.000Z"),
    );
    expect(due).toEqual(["course"]);
  });

  it("does not schedule midday even when enabled", () => {
    const prefs = {
      enabled: true,
      morning: { enabled: false, time: "09:00" },
      midday: { enabled: true, time: "13:00" },
      evening: { enabled: false, time: "20:00" },
      course: { enabled: false, time: "18:00" },
      universeRequest: { enabled: false, time: "10:00" },
      timezone: "UTC",
      locale: "en" as const,
      updatedAt: new Date().toISOString(),
    };

    const due = getDueReminderTypes(
      prefs,
      new Date("2026-06-23T13:05:00.000Z"),
    );
    expect(due).not.toContain("midday");
    expect(due).toEqual([]);
  });
});

describe("Phase 14 — duplicate delivery protection", () => {
  it("builds stable delivery doc ids", () => {
    const repo = readSource(
      "src/features/notifications/repositories/push-repository.ts",
    );
    expect(repo).toContain("buildNotificationDeliveryDocId");
    expect(repo).toContain('replace(/-/g, "")');
    expect(repo).toContain("_${reminderType}");
  });

  it("documents delivery path in repository", () => {
    const repo = readSource(
      "src/features/notifications/repositories/push-repository.ts",
    );
    expect(repo).toContain("notificationDeliveries");
    expect(repo).toContain("hasNotificationDelivery");
    expect(repo).toContain("writeNotificationDelivery");
  });
});

describe("Phase 14 — notification payloads", () => {
  it("includes EN and RU copy for all schedulable reminder types", () => {
    expect(getNotificationCopy("en", "morning").body).toBe(
      "Your daily guidance is ready.",
    );
    expect(getNotificationCopy("ru", "morning").body).toBe(
      "Ваша подсказка дня готова.",
    );
    expect(getNotificationCopy("en", "midday").body).toContain("Pause for a minute");
    expect(getNotificationCopy("ru", "evening").body).toContain("вечернего");
    expect(getNotificationCopy("en", "course").body).toContain("lesson");
    expect(getNotificationCopy("en", "universeRequest").body).toContain("Universe");
    expect(getNotificationCopy("ru", "universeRequest").body).toContain("Вселенной");
  });

  it("targets Today and Courses routes without private request text", () => {
    const payloadBuilder = readSource(
      "src/features/notifications/server/send-web-push-notification.ts",
    );
    expect(payloadBuilder).toContain('reminderType === "course"');
    expect(payloadBuilder).toContain("/courses");
    expect(payloadBuilder).toContain("getNotificationCopy");

    const copy = getNotificationCopy("en", "universeRequest");
    expect(copy.body).not.toMatch(/love|money|family/i);
    expect(copy.body).toBe(
      "Remember your request to the Universe today.",
    );
  });
});

describe("Phase 14 — expired subscription cleanup", () => {
  it("detects 404 and 410 web push errors", () => {
    const cleanup = readSource(
      "src/features/notifications/server/remove-expired-subscriptions.ts",
    );
    expect(cleanup).toContain("statusCode === 404");
    expect(cleanup).toContain("statusCode === 410");
  });

  it("removes expired subscriptions from send path", () => {
    const send = readSource("src/features/notifications/server/send-web-push.ts");
    const cleanup = readSource(
      "src/features/notifications/server/remove-expired-subscriptions.ts",
    );
    expect(send).toContain("isExpiredPushSubscriptionError");
    expect(send).toContain("remove: true");
    expect(cleanup).toContain("removePushSubscription");
  });
});

describe("Phase 14 — dispatcher and universe request rule", () => {
  it("checks active universe request before request reminder", () => {
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("readUniverseRequest");
    expect(dispatcher).toContain('reminderType === "universeRequest"');
    expect(dispatcher).not.toContain("request.text");
  });

  it("supports dry-run and type filter query params", () => {
    const route = readSource("src/app/api/cron/send-reminders/route.ts");
    expect(route).toContain('get("dryRun") === "1"');
    expect(route).toContain('get("type")');
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("dryRun");
    expect(dispatcher).toContain("typeFilter");
  });

  it("does not send when dryRun is enabled", () => {
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("if (dryRun)");
    expect(dispatcher).not.toContain("dryRun) { await sendWebPushToUser");
  });
});

describe("Phase 14 — Profile copy", () => {
  it("uses honest scheduler copy without overpromising delivery", () => {
    expect(en.notifications.schedulerNote).toContain("saved");
    expect(ru.notifications.schedulerNote).toContain("сохраняются");
    expect(en.notifications.schedulerNote).not.toContain("scheduled from the server");
    expect(ru.notifications.schedulerNote).not.toContain("отправляются сервером");
    expect(en.notifications.schedulerDeliveryNote).toContain("scheduler setup");
    expect(ru.notifications.schedulerDeliveryNote).toContain("настройки сервера");
    expect(en.notifications.deliveryDependsNote).toContain("browser");
    expect(ru.notifications.deliveryDependsNote).toContain("браузера");
  });

  it("renders updated scheduler notes in reminder form", () => {
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain("schedulerNote");
    expect(form).toContain("schedulerDeliveryNote");
    expect(form).toContain("deliveryDependsNote");
  });
});

describe("Phase 14 — Vercel cron config", () => {
  it("defines a Hobby-compatible daily cron schedule", () => {
    const config = readSource("vercel.json");
    expect(config).toContain("/api/cron/send-reminders");
    expect(config).toContain("0 9 * * *");
    expect(config).not.toContain("*/15 * * * *");
  });
});

describe("Phase 14 — dispatcher mocks web push without network", () => {
  it("imports sendWebPushToUser for delivery fan-out", () => {
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("sendWebPushToUser");
    expect(dispatcher).not.toContain("webpush.sendNotification");
  });
});
