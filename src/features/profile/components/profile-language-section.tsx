"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import { onboardingLanguageSchema } from "@/features/profile/schemas/onboarding-schema";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { SupportedLocale } from "@/config/app-config";

type ProfileLanguageSectionProps = {
  profile: ProfileSnapshot;
  routeLocale: SupportedLocale;
  onSave: (language: SupportedLocale) => Promise<void>;
};

export function ProfileLanguageSection({
  profile,
  routeLocale,
  onSave,
}: ProfileLanguageSectionProps) {
  const t = useTranslations("profile.language");
  const tProfile = useTranslations("profile");
  const [language, setLanguage] = useState<SupportedLocale>(
    profile.language ?? routeLocale,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = language !== (profile.language ?? routeLocale);

  async function handleSave() {
    const parsed = onboardingLanguageSchema.safeParse({ language });
    if (!parsed.success) {
      setError(tProfile("messageValidationError"));
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await onSave(parsed.data.language);
      setSaved(true);
    } catch {
      setError(tProfile("messageSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileSectionCard label={t("label")} title={t("title")} description={t("description")}>
      <div className="grid grid-cols-2 gap-3">
        {(["en", "ru"] as SupportedLocale[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setLanguage(option);
              setSaved(false);
            }}
            className={`min-h-11 rounded-[var(--radius-card)] border px-3 text-sm ${
              language === option
                ? "border-accent-gold bg-accent-gold-muted text-accent-gold"
                : "border-border-subtle text-text-muted"
            }`}
          >
            {option === "en" ? t("english") : t("russian")}
          </button>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-accent-gold">{error}</p> : null}
      {saved ? <p className="mt-3 text-sm text-text-muted">{t("saved")}</p> : null}

      <Button
        variant="secondary"
        className="mt-4 w-full"
        disabled={saving || !hasChanges}
        onClick={() => void handleSave()}
      >
        {saving ? t("saving") : t("save")}
      </Button>
    </ProfileSectionCard>
  );
}
