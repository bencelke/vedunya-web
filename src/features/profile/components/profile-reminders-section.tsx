"use client";

import { useTranslations } from "next-intl";

import { NotificationSettingsCard } from "@/features/notifications/components/notification-settings-card";
import { PwaInstallSection } from "@/features/pwa/components/pwa-install-section";
import type { PushStatusSummary } from "@/features/notifications/types/push";
import type { SupportedLocale } from "@/config/app-config";

type ProfileRemindersSectionProps = {
  locale: SupportedLocale;
  pushStatus: PushStatusSummary;
  hasActiveUniverseRequest: boolean;
};

export function ProfileRemindersSection({
  locale,
  pushStatus,
  hasActiveUniverseRequest,
}: ProfileRemindersSectionProps) {
  const tReminders = useTranslations("profile.reminders");

  return (
    <section className="space-y-3" aria-label={tReminders("label")}>
      <PwaInstallSection />
      <NotificationSettingsCard
        locale={locale}
        initialStatus={pushStatus}
        hasActiveUniverseRequest={hasActiveUniverseRequest}
      />
    </section>
  );
}
