"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { UniverseRequestReminderStatus } from "@/features/universe-request/types";

type UniverseRequestReminderStatusProps = {
  status: UniverseRequestReminderStatus;
};

export function UniverseRequestReminderStatus({
  status,
}: UniverseRequestReminderStatusProps) {
  const t = useTranslations("universeRequest.reminder");

  let message = t("statusOff");
  if (!status.globalRemindersEnabled) {
    message = t("statusGlobalOff");
  } else if (status.slotEnabled) {
    message = t("statusOn", { time: status.time });
  }

  return (
    <div className="space-y-2 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/50 p-4">
      <p className="text-sm font-medium text-text-primary">{t("toggleLabel")}</p>
      <p className="text-xs leading-relaxed text-text-muted">{message}</p>
      <p className="text-xs leading-relaxed text-text-subtle">
        {t("profileHint")}{" "}
        <Link href="/profile" className="text-accent-gold underline-offset-2 hover:underline">
          {t("profileLink")}
        </Link>
      </p>
    </div>
  );
}
