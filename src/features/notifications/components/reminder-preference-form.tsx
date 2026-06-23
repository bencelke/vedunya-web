"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Label } from "@/components/ui/label";
import type { NotificationPreferencesRecord } from "@/features/notifications/types/push";

type ReminderPreferenceFormProps = {
  preferences: NotificationPreferencesRecord;
  disabled?: boolean;
  onSave: (preferences: NotificationPreferencesRecord) => Promise<void>;
};

export function ReminderPreferenceForm({
  preferences,
  disabled = false,
  onSave,
}: ReminderPreferenceFormProps) {
  const t = useTranslations("notifications");
  const [draft, setDraft] = useState(preferences);

  function updateSlot(
    slot: "morning" | "midday" | "evening",
    patch: Partial<{ enabled: boolean; time: string }>,
  ) {
    setDraft((current) => ({
      ...current,
      [slot]: {
        ...current[slot],
        ...patch,
      },
    }));
  }

  async function handleSave() {
    await onSave(draft);
  }

  const slots = [
    { key: "morning" as const, label: t("morningLabel"), copy: t("morningCopy") },
    { key: "midday" as const, label: t("middayLabel"), copy: t("middayCopy") },
    { key: "evening" as const, label: t("eveningLabel"), copy: t("eveningCopy") },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-text-subtle">{t("timezoneLabel", { timezone: draft.timezone })}</p>

      {slots.map((slot) => (
        <div
          key={slot.key}
          className="space-y-2 border-b border-border-subtle/60 pb-4 last:border-b-0 last:pb-0"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor={`${slot.key}-enabled`}>{slot.label}</Label>
              <p className="mt-1 text-xs text-text-subtle">{slot.copy}</p>
            </div>
            <input
              id={`${slot.key}-enabled`}
              type="checkbox"
              checked={draft[slot.key].enabled}
              disabled={disabled || !draft.enabled}
              onChange={(event) =>
                updateSlot(slot.key, { enabled: event.target.checked })
              }
              className="h-4 w-4 accent-accent-gold"
            />
          </div>
          <input
            id={`${slot.key}-time`}
            type="time"
            value={draft[slot.key].time}
            disabled={disabled || !draft.enabled || !draft[slot.key].enabled}
            onChange={(event) => updateSlot(slot.key, { time: event.target.value })}
            className="w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-3 py-2 text-sm text-text-primary"
          />
        </div>
      ))}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          void handleSave();
        }}
        className="w-full rounded-[var(--radius-pill)] border border-border-subtle px-4 py-2 text-sm text-text-muted disabled:opacity-50"
      >
        {t("savePreferences")}
      </button>
    </div>
  );
}
