"use client";

import { useTranslations } from "next-intl";

import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import type { ProfileUniverseRequestSummary } from "@/features/profile/types/profile-settings-summary";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ProfileUniverseRequestSectionProps = {
  request: ProfileUniverseRequestSummary | null;
};

export function ProfileUniverseRequestSection({
  request,
}: ProfileUniverseRequestSectionProps) {
  const t = useTranslations("profile.universeRequest");

  return (
    <ProfileSectionCard label={t("label")} title={t("title")} description={t("description")}>
      {request ? (
        <div className="space-y-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-subtle">
            {t("activeSummary")}
          </p>
          <p className="text-sm leading-relaxed text-text-primary line-clamp-3">
            {request.text}
          </p>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-text-muted">{t("noRequest")}</p>
      )}

      <Link
        href="/today"
        className={cn(
          "mt-4 flex min-h-12 w-full items-center justify-center rounded-[var(--radius-pill)] px-5 text-sm font-medium",
          "border border-border-subtle bg-surface-elevated text-text-primary hover:bg-accent-violet-soft",
        )}
      >
        {t("openToday")}
      </Link>
    </ProfileSectionCard>
  );
}
