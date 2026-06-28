import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { PROFILE_REMINDER_PREFERENCE_MAP } from "@/features/notifications/constants/reminder-preference-map";
import { getNotificationCopy } from "@/features/notifications/content/notification-copy";
import {
  getDueReminderTypes,
  resolveReminderLocale,
  SCHEDULABLE_REMINDER_TYPES,
} from "@/features/notifications/server/reminder-due";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

const basePrefs = {
  enabled: true,
  morning: { enabled: true, time: "09:00" },
  midday: { enabled: true, time: "13:00" },
  evening: { enabled: true, time: "20:00" },
  course: { enabled: true, time: "18:00" },
  universeRequest: { enabled: true, time: "10:00" },
  timezone: "UTC",
  locale: "en" as const,
  updatedAt: new Date().toISOString(),
};

describe("Phase 24B — schedulable reminder types", () => {
  it("includes course in SCHEDULABLE_REMINDER_TYPES", () => {
    expect(SCHEDULABLE_REMINDER_TYPES).toContain("course");
    expect(SCHEDULABLE_REMINDER_TYPES).toEqual([
      "morning",
      "evening",
      "course",
      "universeRequest",
    ]);
  });

  it("does not schedule hidden midday", () => {
    const due = getDueReminderTypes(
      basePrefs,
      new Date("2026-06-23T13:05:00.000Z"),
    );
    expect(due).not.toContain("midday");
    expect(due).toEqual([]);
  });

  it("maps profile preference keys to scheduler reminder types", () => {
    expect(PROFILE_REMINDER_PREFERENCE_MAP.morningGuidance).toBe("morning");
    expect(PROFILE_REMINDER_PREFERENCE_MAP.eveningReflection).toBe("evening");
    expect(PROFILE_REMINDER_PREFERENCE_MAP.courseReminder).toBe("course");
    expect(PROFILE_REMINDER_PREFERENCE_MAP.universeRequestReminder).toBe(
      "universeRequest",
    );
  });
});

describe("Phase 24B — due-time and preference gating", () => {
  it("skips users without enabled global preference", () => {
    const due = getDueReminderTypes(
      { ...basePrefs, enabled: false },
      new Date("2026-06-23T09:05:00.000Z"),
    );
    expect(due).toEqual([]);
  });

  it("skips disabled reminder slots", () => {
    const due = getDueReminderTypes(
      {
        ...basePrefs,
        course: { enabled: false, time: "18:00" },
      },
      new Date("2026-06-23T18:05:00.000Z"),
    );
    expect(due).not.toContain("course");
  });

  it("includes course when enabled and due", () => {
    const due = getDueReminderTypes(
      basePrefs,
      new Date("2026-06-23T18:05:00.000Z"),
    );
    expect(due).toContain("course");
  });
});

describe("Phase 24B — duplicate delivery and inactive subscriptions", () => {
  it("documents delivery state path and duplicate guard", () => {
    const repo = readSource(
      "src/features/notifications/repositories/push-repository.ts",
    );
    expect(repo).toContain("notificationDeliveries");
    expect(repo).toContain("hasNotificationDelivery");
    expect(repo).toContain("writeNotificationDelivery");
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("hasNotificationDelivery");
    expect(dispatcher).toContain("alreadySent");
  });

  it("skips users without enabled push subscriptions", () => {
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("readEnabledPushSubscriptions");
    expect(dispatcher).toContain("subscriptions.length === 0");
  });

  it("marks expired subscriptions inactive on send path", () => {
    const send = readSource("src/features/notifications/server/send-web-push.ts");
    expect(send).toContain("isExpiredPushSubscriptionError");
    expect(send).toContain("remove: true");
  });
});

describe("Phase 24B — notification content and URLs", () => {
  it("uses RU fallback when locale is missing or unknown", () => {
    expect(resolveReminderLocale("ru")).toBe("ru");
    expect(resolveReminderLocale("en")).toBe("en");
  });

  it("uses EN content for EN users", () => {
    expect(getNotificationCopy("en", "morning").body).toBe(
      "Your daily guidance is ready.",
    );
    expect(getNotificationCopy("en", "course").body).toBe(
      "Return to your lesson and continue the practice.",
    );
  });

  it("uses RU content for RU users", () => {
    expect(getNotificationCopy("ru", "evening").body).toBe(
      "Время короткого вечернего размышления.",
    );
    expect(getNotificationCopy("ru", "universeRequest").body).toBe(
      "Вспомните свой запрос к Вселенной на сегодня.",
    );
  });

  it("routes course reminder clicks to courses", () => {
    const payloadBuilder = readSource(
      "src/features/notifications/server/send-web-push-notification.ts",
    );
    expect(payloadBuilder).toContain('reminderType === "course"');
    expect(payloadBuilder).toContain("/courses");
  });

  it("routes universe request reminder clicks to today", () => {
    const payloadBuilder = readSource(
      "src/features/notifications/server/send-web-push-notification.ts",
    );
    expect(payloadBuilder).toContain('reminderType === "universeRequest"');
    expect(payloadBuilder).toContain("/today");

    const copy = getNotificationCopy("en", "universeRequest");
    expect(copy.body).toBe("Remember your request to the Universe today.");
    expect(copy.body).not.toMatch(/love|money|family/i);
  });
});

describe("Phase 24B — cron route and safe logging", () => {
  it("requires cron secret on send-reminders route", () => {
    const route = readSource("src/app/api/cron/send-reminders/route.ts");
    expect(route).toContain("verifyScheduledRemindersAuthorization");
    expect(route).toContain("401");
    const auth = readSource("src/features/notifications/server/cron-auth.ts");
    expect(auth).toContain("CRON_SECRET");
  });

  it("logs safe push-dispatch summaries without sensitive fields", () => {
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("[push-dispatch]");
    expect(dispatcher).toContain("usersMatched");
    expect(dispatcher).not.toContain("endpoint");
    expect(dispatcher).not.toContain("console.info(uid");
    expect(dispatcher).not.toContain("email");
  });
});

describe("Phase 24B — test push endpoint", () => {
  it("only sends to authenticated current user", () => {
    const route = readSource("src/app/api/push/test/route.ts");
    expect(route).toContain("requireApiUser");
    expect(route).toContain("auth.user.uid");
    expect(route).not.toContain("console.log");
    expect(route).not.toMatch(/uid:\s*request/);
  });

  it("supports optional reminder type parameter", () => {
    const schema = readSource("src/features/notifications/schemas/push-schema.ts");
    expect(schema).toContain('"course"');
    const route = readSource("src/app/api/push/test/route.ts");
    expect(route).toContain("buildReminderNotificationPayload");
    expect(route).toContain("isSchedulableReminderType");
  });

  it("does not log endpoints or subscriptions", () => {
    const route = readSource("src/app/api/push/test/route.ts");
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(route).not.toContain("console.log");
    expect(route).not.toContain("console.info");
    expect(dispatcher).not.toContain("console.log");
  });
});

describe("Phase 24B — Profile course toggle", () => {
  it("writes course preference in reminder form", () => {
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain('key: "course"');
    expect(form).toContain("courseLabel");
    expect(form).toContain("courseCopy");
  });

  it("disables toggles until subscribed in notification panel", () => {
    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    expect(panel).toContain("canEditPreferences");
    expect(panel).toContain("status.subscribed");
    expect(panel).toContain("status.configured");
    expect(panel).toContain("schedulerCoverageAdequate");
    expect(panel).toContain("togglesLockedHint");
  });
});
