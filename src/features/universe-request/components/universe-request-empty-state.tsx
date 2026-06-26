"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { UniverseRequestForm } from "@/features/universe-request/components/universe-request-form";

type UniverseRequestEmptyStateProps = {
  onCreated: () => void;
};

export function UniverseRequestEmptyState({ onCreated }: UniverseRequestEmptyStateProps) {
  const t = useTranslations("universeRequest");
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(input: { text: string }) {
    const response = await fetch("/api/universe-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.text }),
    });

    if (!response.ok) {
      throw new Error("save_failed");
    }

    onCreated();
  }

  if (!expanded) {
    return (
      <section className="mystic-today-request-panel space-y-4 p-5">
        <div className="space-y-2">
          <p className="mystic-eyebrow">{t("title")}</p>
          <h2 className="text-lg font-medium leading-snug tracking-[-0.01em] text-text-primary">
            {t("collapsed.heading")}
          </h2>
          <p className="text-sm leading-[1.68] text-text-muted">{t("collapsed.body")}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setExpanded(true)}
        >
          {t("collapsed.cta")}
        </Button>
      </section>
    );
  }

  return (
    <section className="mystic-today-request-panel space-y-5 p-5">
      <div className="space-y-2">
        <p className="mystic-eyebrow">{t("title")}</p>
        <h2 className="text-lg font-medium leading-snug tracking-[-0.01em] text-text-primary">
          {t("empty.heading")}
        </h2>
      </div>

      <UniverseRequestForm
        submitLabel={t("form.save")}
        submittingLabel={t("form.saving")}
        onSubmit={handleSubmit}
        onCancel={() => setExpanded(false)}
      />
    </section>
  );
}
