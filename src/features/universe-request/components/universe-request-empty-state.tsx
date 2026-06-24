"use client";

import { useTranslations } from "next-intl";

import { UniverseRequestForm } from "@/features/universe-request/components/universe-request-form";

type UniverseRequestEmptyStateProps = {
  onCreated: () => void;
};

export function UniverseRequestEmptyState({ onCreated }: UniverseRequestEmptyStateProps) {
  const t = useTranslations("universeRequest");

  async function handleSubmit(input: {
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

    onCreated();
  }

  return (
    <section className="guidance-primary-surface mystic-cosmic-card-elevated space-y-5 p-6 sm:p-7">
      <div className="space-y-2">
        <p className="mystic-eyebrow">{t("title")}</p>
        <h2 className="text-xl font-medium leading-snug text-text-primary">
          {t("empty.heading")}
        </h2>
        <p className="text-sm leading-[1.72] text-text-muted">{t("empty.body")}</p>
      </div>

      <UniverseRequestForm
        submitLabel={t("form.save")}
        submittingLabel={t("form.saving")}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
