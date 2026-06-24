"use client";

import { useTranslations } from "next-intl";

import { CardLabel } from "@/components/ui/card";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfileHeaderProps = {
  profile: ProfileSnapshot;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const t = useTranslations("profile");

  return (
    <header className="space-y-2">
      <CardLabel>{t("eyebrow")}</CardLabel>
      <h1 className="text-[1.75rem] font-medium leading-tight text-text-primary">
        {profile.displayName ?? t("heading")}
      </h1>
      <p className="text-sm leading-relaxed text-text-muted">{t("description")}</p>
    </header>
  );
}
