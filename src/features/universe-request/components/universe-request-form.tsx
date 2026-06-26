"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type UniverseRequestFormProps = {
  initialText?: string;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: { text: string }) => Promise<void>;
  onCancel?: () => void;
};

export function UniverseRequestForm({
  initialText = "",
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: UniverseRequestFormProps) {
  const t = useTranslations("universeRequest");
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorKey(null);
    setSubmitting(true);

    try {
      await onSubmit({ text });
    } catch {
      setErrorKey("saveFailed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="universe-request-text">{t("form.textLabel")}</Label>
        <textarea
          id="universe-request-text"
          value={text}
          maxLength={240}
          rows={4}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("form.textPlaceholder")}
          className="min-h-[7.5rem] w-full resize-none rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/80 px-4 py-3.5 text-[0.9375rem] leading-relaxed text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-accent-gold/40"
        />
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <p className="text-xs leading-relaxed text-text-subtle">{t("form.helper")}</p>
          <p className="shrink-0 text-xs tabular-nums text-text-subtle sm:text-right">
            {t("form.charCount", { count: text.trim().length, max: 240 })}
          </p>
        </div>
      </div>

      {errorKey ? (
        <p className="text-sm text-red-300/90">{t(`errors.${errorKey}`)}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" className="w-full sm:flex-1" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={onCancel}
            disabled={submitting}
          >
            {t("form.cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
