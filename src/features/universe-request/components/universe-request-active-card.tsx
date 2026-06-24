"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { UniverseRequestForm } from "@/features/universe-request/components/universe-request-form";
import { UniverseRequestReminderStatus } from "@/features/universe-request/components/universe-request-reminder-status";
import type {
  UniverseRequestRecord,
  UniverseRequestReminderStatus as UniverseRequestReminderStatusType,
} from "@/features/universe-request/types";

type UniverseRequestActiveCardProps = {
  request: UniverseRequestRecord;
  reflectionPrompt: string;
  reminderStatus: UniverseRequestReminderStatusType;
  onUpdated: () => void;
  onPaused: () => void;
};

export function UniverseRequestActiveCard({
  request,
  reflectionPrompt,
  reminderStatus,
  onUpdated,
  onPaused,
}: UniverseRequestActiveCardProps) {
  const t = useTranslations("universeRequest");
  const tCategories = useTranslations("universeRequest.categories");
  const [editing, setEditing] = useState(false);
  const [pausing, setPausing] = useState(false);

  async function handlePause() {
    setPausing(true);
    try {
      const response = await fetch("/api/universe-request", { method: "DELETE" });
      if (!response.ok) {
        throw new Error("pause_failed");
      }
      onPaused();
    } finally {
      setPausing(false);
    }
  }

  async function handleSave(input: {
    text: string;
    category: import("@/features/universe-request/types").UniverseRequestCategory | null;
  }) {
    const response = await fetch("/api/universe-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("save_failed");
    }

    setEditing(false);
    onUpdated();
  }

  return (
    <section className="guidance-primary-surface mystic-cosmic-card-elevated space-y-5 p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="mystic-eyebrow">{t("title")}</p>
          {request.category ? (
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
              {tCategories(request.category)}
            </p>
          ) : null}
        </div>
        {!editing ? (
          <Button
            type="button"
            variant="secondary"
            className="shrink-0"
            onClick={() => setEditing(true)}
          >
            {t("active.edit")}
          </Button>
        ) : null}
      </div>

      {editing ? (
        <UniverseRequestForm
          initialText={request.text}
          initialCategory={request.category}
          submitLabel={t("form.save")}
          submittingLabel={t("form.saving")}
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <blockquote className="text-[1.0625rem] font-normal leading-[1.55] text-text-primary">
            {request.text}
          </blockquote>

          <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60 p-4">
            <p className="mystic-eyebrow">{t("active.reflectionLabel")}</p>
            <p className="mt-2 text-sm leading-[1.72] text-text-muted">
              {reflectionPrompt}
            </p>
          </div>

          <UniverseRequestReminderStatus status={reminderStatus} />

          <div className="flex flex-col gap-3 border-t border-border-subtle/80 pt-4 sm:flex-row">
            <p className="flex-1 text-xs leading-relaxed text-text-subtle">
              {t("active.savedNote")}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={pausing}
              onClick={() => void handlePause()}
            >
              {pausing ? t("active.pausing") : t("active.pause")}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
