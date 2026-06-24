"use client";

import { useTranslations } from "next-intl";

import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import { SUPPORT_EMAIL, TRUST_ROUTES } from "@/features/trust/constants";
import { Link } from "@/i18n/navigation";

export function ProfileSupportSection() {
  const t = useTranslations("profile.support");

  return (
    <ProfileSectionCard label={t("label")} title={t("title")} description={t("description")}>
      <div className="space-y-3">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="block text-sm text-accent-gold underline-offset-2 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        <Link
          href={TRUST_ROUTES.support}
          className="inline-block text-sm text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
        >
          {t("openPage")}
        </Link>
      </div>
    </ProfileSectionCard>
  );
}
