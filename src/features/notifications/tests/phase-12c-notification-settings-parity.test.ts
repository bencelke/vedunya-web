import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  getNotificationCopy,
  notificationCopyAvoidsFakeGuarantees,
} from "@/features/notifications/content/notification-copy";
import {
  notificationPreferencesSchema,
  reminderSlotSchema,
} from "@/features/notifications/schemas/push-schema";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 12C — notification preference defaults", () => {
  it("includes morning, midday, evening, and universeRequest slots", () => {
    const repo = readSource("src/features/notifications/repositories/push-repository.ts");
    expect(repo).toContain('morning: { enabled: true, time: "08:30" }');
    expect(repo).toContain('midday: { enabled: true, time: "13:00" }');
    expect(repo).toContain('evening: { enabled: true, time: "20:30" }');
    expect(repo).toContain('universeRequest: { enabled: false, time: "09:00" }');
  });
});

describe("Phase 12C — time validation", () => {
  it("accepts HH:mm reminder times", () => {
    expect(reminderSlotSchema.safeParse({ enabled: true, time: "08:30" }).success).toBe(
      true,
    );
    expect(reminderSlotSchema.safeParse({ enabled: true, time: "23:59" }).success).toBe(
      true,
    );
  });

  it("rejects invalid reminder times", () => {
    expect(reminderSlotSchema.safeParse({ enabled: true, time: "8:30" }).success).toBe(
      false,
    );
    expect(reminderSlotSchema.safeParse({ enabled: true, time: "25:00" }).success).toBe(
      false,
    );
    expect(reminderSlotSchema.safeParse({ enabled: true, time: "08:60" }).success).toBe(
      false,
    );
  });
});

describe("Phase 12C — preference API auth and merge", () => {
  it("rejects unauthenticated preference writes at route level", () => {
    const route = readSource("src/app/api/push/preferences/route.ts");
    expect(route).toContain("requireApiUser");
    expect(route).toContain("mergeNotificationPreferences");
  });

  it("merges notification preferences safely in repository", () => {
    const repo = readSource("src/features/notifications/repositories/push-repository.ts");
    expect(repo).toContain("merge: true");
  });

  it("syncs universe request reminder mirror from preferences API", () => {
    const route = readSource("src/app/api/push/preferences/route.ts");
    expect(route).toContain("syncUniverseRequestReminderMirror");
  });

  it("validates full preference payload including universeRequest", () => {
    const parsed = notificationPreferencesSchema.safeParse({
      enabled: true,
      morning: { enabled: true, time: "08:30" },
      midday: { enabled: true, time: "13:00" },
      evening: { enabled: true, time: "20:30" },
      universeRequest: { enabled: false, time: "09:00" },
      timezone: "UTC",
      locale: "en",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("Phase 12C — Profile reminders UI", () => {
  it("renders reminders section in Profile with universe request slot", () => {
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain("universeRequest");
    expect(form).toContain("hasActiveUniverseRequest");
    expect(form).toContain("universeRequestNeedsRequest");
  });

  it("passes active request state from profile page", () => {
    const page = readSource("src/app/[locale]/profile/page.tsx");
    expect(page).toContain("readUniverseRequest");
    expect(page).toContain("hasActiveUniverseRequest");
  });

  it("includes EN and RU reminders section labels", () => {
    expect(en.notifications.sectionLabel).toBe("Reminders");
    expect(ru.notifications.sectionLabel).toBe("Напоминания");
    expect(en.notifications.universeRequestLabel).toContain("Universe");
    expect(ru.notifications.universeRequestLabel).toContain("Вселенной");
  });

  it("RU notification settings avoid known EN fallback strings", () => {
    const ruNotifications = JSON.stringify(ru.notifications);
    expect(ruNotifications).not.toContain("Daily reminders");
    expect(ruNotifications).not.toContain("Morning guidance");
    expect(ruNotifications).not.toContain("Enable reminders");
    expect(ru.notifications.schedulerNote).toContain("отправляются сервером");
  });
});

describe("Phase 12C — Request reminder integration", () => {
  it("loads reminder status from notification preferences on Today", () => {
    const loader = readSource(
      "src/features/universe-request/server/load-universe-request.ts",
    );
    expect(loader).toContain("readNotificationPreferences");
    expect(loader).toContain("reminderStatus");
  });

  it("shows read-only reminder status on active request card", () => {
    const card = readSource(
      "src/features/universe-request/components/universe-request-active-card.tsx",
    );
    expect(card).toContain("UniverseRequestReminderStatus");
    expect(card).not.toContain("UniverseRequestReminderToggle");
  });

  it("disables universe request reminder when no active request in Profile form", () => {
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain("requiresActiveRequest");
    expect(en.notifications.universeRequestNeedsRequest).toContain("Create a request first");
    expect(ru.notifications.universeRequestNeedsRequest).toContain("Сначала создайте просьбу");
  });
});

describe("Phase 12C — PWA and dev mode behavior", () => {
  it("includes iPhone install copy in EN and RU", () => {
    expect(en.notifications.iosInstallBody).toContain("Home Screen");
    expect(ru.notifications.iosInstallBody).toContain("Домой");
  });

  it("does not auto-request push permission", () => {
    const hook = readSource("src/features/notifications/hooks/use-push-notifications.ts");
    expect(hook).toContain("enableReminders");
    expect(hook).not.toContain("useEffect");
  });
});

describe("Phase 12C — notification copy library", () => {
  it("provides EN and RU templates for all reminder slots", () => {
    expect(getNotificationCopy("en", "morning").body).toContain("quiet start");
    expect(getNotificationCopy("ru", "morning").body).toContain("Спокойное начало");
    expect(getNotificationCopy("en", "universeRequest").body).toContain("request");
    expect(getNotificationCopy("ru", "universeRequest").body).toContain("просьбе");
  });

  it("does not contain fake guarantee phrases", () => {
    expect(notificationCopyAvoidsFakeGuarantees()).toBe(true);
  });

  it("test notification route uses shared copy library", () => {
    const route = readSource("src/app/api/push/test/route.ts");
    expect(route).toContain("getNotificationCopy");
    expect(route).not.toContain("BEGIN PRIVATE KEY");
    expect(route).not.toContain("WEB_PUSH_PRIVATE_KEY");
  });
});

describe("Phase 12C — honest scheduler status", () => {
  it("includes subtle scheduler note in Profile form", () => {
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(form).toContain("schedulerNote");
    expect(en.notifications.schedulerNote).toContain("scheduled from the server");
    expect(ru.notifications.schedulerNote).toContain("отправляются сервером");
  });
});
