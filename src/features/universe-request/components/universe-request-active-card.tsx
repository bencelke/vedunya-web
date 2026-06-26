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
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  async function handleSave(input: { text: string }) {
    const response = await fetch("/api/universe-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.text }),
    });

    if (!response.ok) {
      throw new Error("save_failed");
    }

    setEditing(false);
    onUpdated();
  }

  if (editing) {
    return (
      <section className="mystic-today-request-panel space-y-5 p-5">
        <p className="mystic-eyebrow">{t("title")}</p>
        <UniverseRequestForm
          initialText={request.text}
          submitLabel={t("form.save")}
          submittingLabel={t("form.saving")}
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </section>
    );
  }

  return (
    <section className="mystic-today-request-panel space-y-4 p-5">
      <p className="mystic-eyebrow">{t("title")}</p>

      <div className="space-y-3">
        <p className="text-sm font-medium text-text-muted">{t("active.currentLabel")}</p>
        <blockquote className="line-clamp-3 text-[1rem] font-normal leading-[1.55] text-text-primary">
          {request.text}
        </blockquote>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
          >
            {t("active.edit")}
          </Button>
          {!expanded ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-text-muted"
              onClick={() => setExpanded(true)}
            >
              {t("active.showMore")}
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <>
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
              size="sm"
              className="shrink-0"
              disabled={pausing}
              onClick={() => void handlePause()}
            >
              {pausing ? t("active.pausing") : t("active.pause")}
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
}
