"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Label } from "@/components/ui/label";
import type { NotificationPreferencesRecord } from "@/features/notifications/types/push";

type ReminderSlotKey = "morning" | "midday" | "evening" | "universeRequest";

type ReminderPreferenceFormProps = {
  preferences: NotificationPreferencesRecord;
  hasActiveUniverseRequest: boolean;
  disabled?: boolean;
  onSave: (preferences: NotificationPreferencesRecord) => Promise<void>;
};

export function ReminderPreferenceForm({
  preferences,
  hasActiveUniverseRequest,
  disabled = false,
  onSave,
}: ReminderPreferenceFormProps) {
  const t = useTranslations("notifications");
  const [draft, setDraft] = useState(preferences);
  const [saving, setSaving] = useState(false);

  function updateSlot(
    slot: ReminderSlotKey,
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
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  const slots: Array<{
    key: ReminderSlotKey;
    label: string;
    copy: string;
    requiresActiveRequest?: boolean;
  }> = [
    { key: "morning", label: t("morningLabel"), copy: t("morningCopy") },
    { key: "midday", label: t("middayLabel"), copy: t("middayCopy") },
    { key: "evening", label: t("eveningLabel"), copy: t("eveningCopy") },
    {
      key: "universeRequest",
      label: t("universeRequestLabel"),
      copy: t("universeRequestCopy"),
      requiresActiveRequest: true,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-text-subtle">
        {t("timezoneLabel", { timezone: draft.timezone })}
      </p>

      <p className="text-xs leading-relaxed text-text-subtle">{t("schedulerNote")}</p>
      <p className="text-xs leading-relaxed text-text-subtle">{t("deliveryDependsNote")}</p>

      {slots.map((slot) => {
        const slotDisabled =
          disabled ||
          !draft.enabled ||
          (slot.requiresActiveRequest && !hasActiveUniverseRequest);

        return (
          <div
            key={slot.key}
            className="space-y-2 border-b border-border-subtle/60 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor={`${slot.key}-enabled`}>{slot.label}</Label>
                <p className="mt-1 text-xs text-text-subtle">{slot.copy}</p>
                {slot.requiresActiveRequest && !hasActiveUniverseRequest ? (
                  <p className="mt-2 text-xs leading-relaxed text-text-subtle">
                    {t("universeRequestNeedsRequest")}
                  </p>
                ) : null}
              </div>
              <input
                id={`${slot.key}-enabled`}
                type="checkbox"
                checked={draft[slot.key].enabled}
                disabled={slotDisabled}
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
              disabled={slotDisabled || !draft[slot.key].enabled}
              onChange={(event) => updateSlot(slot.key, { time: event.target.value })}
              className="w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-3 py-2 text-sm text-text-primary"
            />
          </div>
        );
      })}

      <button
        type="button"
        disabled={disabled || saving}
        onClick={() => {
          void handleSave();
        }}
        className="w-full rounded-[var(--radius-pill)] border border-border-subtle px-4 py-2 text-sm text-text-muted disabled:opacity-50"
      >
        {saving ? t("savingPreferences") : t("savePreferences")}
      </button>
    </div>
  );
}
