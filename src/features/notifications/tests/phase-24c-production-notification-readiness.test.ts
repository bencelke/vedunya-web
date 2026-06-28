import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import {
  getNotificationSchedulerMode,
  isNotificationSchedulerCoverageAdequate,
  isNotificationSchedulerDeliveryLimited,
} from "@/features/notifications/constants/scheduler-mode";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 24C — production setup docs", () => {
  it("documents daily cron limitation", () => {
    const migration = readSource(
      "docs/migration/phase-24c-production-notification-readiness.md",
    );
    const production = readSource("docs/production/notifications-setup.md");
    const phase24b = readSource(
      "docs/migration/phase-24b-scheduled-notification-dispatcher.md",
    );

    expect(production).toContain("0 9 * * *");
    expect(production).toContain("15-minute");
    expect(production).toContain("hourly");
    expect(phase24b).toContain("Daily cron limitation");
    expect(migration).toContain("Option C");
  });

  it("lists all required VAPID env vars in production setup doc", () => {
    const production = readSource("docs/production/notifications-setup.md");
    expect(production).toContain("NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY");
    expect(production).toContain("WEB_PUSH_PRIVATE_KEY");
    expect(production).toContain("WEB_PUSH_SUBJECT");
    expect(production).toContain("SCHEDULED_REMINDERS_SECRET");
    expect(production).not.toMatch(/WEB_PUSH_PRIVATE_KEY=.{20,}/);
  });

  it("documents external hourly scheduler requirement", () => {
    const production = readSource("docs/production/notifications-setup.md");
    expect(production).toContain("/api/cron/send-reminders");
    expect(production).toContain("Authorization: Bearer");
    expect(production).toContain("NOTIFICATION_SCHEDULER_MODE");
    expect(production).toContain("npx web-push generate-vapid-keys");
  });

  it("documents dry-run without printing secrets", () => {
    const production = readSource("docs/production/notifications-setup.md");
    expect(production).toContain("dryRun=1");
    expect(production).not.toMatch(/WEB_PUSH_PRIVATE_KEY=[A-Za-z0-9_-]{20,}/);
  });
});

describe("Phase 24C — vercel.json daily cron", () => {
  it("keeps daily schedule documented when vercel.json is daily", () => {
    const vercel = readSource("vercel.json");
    expect(vercel).toContain("0 9 * * *");
    expect(vercel).not.toContain("0 * * * *");
  });
});

describe("Phase 24C — cron route security and dry run", () => {
  it("rejects missing cron secret configuration", () => {
    const route = readSource("src/app/api/cron/send-reminders/route.ts");
    expect(route).toContain("isScheduledRemindersAuthConfigured");
    expect(route).toContain("401");
  });

  it("supports dryRun query param", () => {
    const route = readSource("src/app/api/cron/send-reminders/route.ts");
    expect(route).toContain('get("dryRun") === "1"');
  });

  it("dryRun does not call web-push send", () => {
    const dispatcher = readSource(
      "src/features/notifications/server/scheduled-reminder-dispatcher.ts",
    );
    expect(dispatcher).toContain("if (dryRun)");
    expect(dispatcher).not.toMatch(/dryRun[\s\S]{0,80}sendWebPushToUser/);
  });
});

describe("Phase 24C — scheduler status API", () => {
  it("exposes scheduler fields from push status", () => {
    const status = readSource("src/features/notifications/server/push-status.ts");
    const types = readSource("src/features/notifications/types/push.ts");
    expect(status).toContain("schedulerConfigured");
    expect(status).toContain("schedulerMode");
    expect(status).toContain("schedulerCoverageAdequate");
    expect(types).toContain('schedulerMode: "unknown"');
  });

  it("does not claim full coverage for daily or unknown modes", () => {
    expect(isNotificationSchedulerCoverageAdequate("daily")).toBe(false);
    expect(isNotificationSchedulerCoverageAdequate("unknown")).toBe(false);
    expect(isNotificationSchedulerDeliveryLimited("daily")).toBe(true);
    expect(isNotificationSchedulerCoverageAdequate("hourly")).toBe(true);
    expect(isNotificationSchedulerCoverageAdequate("external")).toBe(true);
  });

  it("defaults scheduler mode to unknown when env unset", () => {
    const previous = process.env.NOTIFICATION_SCHEDULER_MODE;
    delete process.env.NOTIFICATION_SCHEDULER_MODE;
    expect(getNotificationSchedulerMode()).toBe("unknown");
    if (previous !== undefined) {
      process.env.NOTIFICATION_SCHEDULER_MODE = previous;
    }
  });
});

describe("Phase 24C — Profile UI honesty", () => {
  it("does not overpromise scheduled delivery in scheduler note", () => {
    expect(en.notifications.schedulerNote).not.toContain("scheduled from the server");
    expect(ru.notifications.schedulerNote).not.toContain("отправляются сервером");
    expect(en.notifications.schedulerNote).toContain("saved");
    expect(ru.notifications.schedulerNote).toContain("сохраняются");
  });

  it("shows scheduler delivery note when coverage is limited", () => {
    expect(en.notifications.schedulerDeliveryNote).toContain(
      "Scheduled delivery depends on production scheduler setup",
    );
    expect(ru.notifications.schedulerDeliveryNote).toContain(
      "Расписание напоминаний зависит от настройки сервера",
    );

    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    const form = readSource(
      "src/features/notifications/components/reminder-preference-form.tsx",
    );
    expect(panel).toContain("schedulerCoverageAdequate");
    expect(panel).toContain("showSchedulerDeliveryNote");
    expect(form).toContain("schedulerDeliveryNote");
  });
});

describe("Phase 24C — env example", () => {
  it("documents scheduler mode in env example", () => {
    const envExample = readSource(".env.example");
    expect(envExample).toContain("NOTIFICATION_SCHEDULER_MODE");
    expect(envExample).toContain("SCHEDULED_REMINDERS_SECRET");
    expect(envExample).not.toMatch(/WEB_PUSH_PRIVATE_KEY=[A-Za-z0-9_-]{20,}/);
  });
});
