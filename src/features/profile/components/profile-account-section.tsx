"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import { formatAuthProviderLabel } from "@/features/profile/utils/format-auth-provider";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfileAccountSectionProps = {
  profile: ProfileSnapshot;
  providers: string[];
  onResetPassword?: () => void;
  showResetPassword: boolean;
};

export function ProfileAccountSection({
  profile,
  providers,
  onResetPassword,
  showResetPassword,
}: ProfileAccountSectionProps) {
  const t = useTranslations("profile.account");
  const accountStatus = profile.profileComplete
    ? t("statusComplete")
    : t("statusIncomplete");

  return (
    <ProfileSectionCard label={t("label")} title={t("label")}>
      <div className="space-y-4">
        <ProfileRow
          label={t("signedInAs")}
          value={profile.displayName ?? t("notSet")}
        />
        <ProfileRow label={t("email")} value={profile.email ?? t("notSet")} />
        <ProfileRow
          label={t("provider")}
          value={
            providers.length > 0
              ? providers.map(formatAuthProviderLabel).join(", ")
              : t("notSet")
          }
        />
        <ProfileRow label={t("status")} value={accountStatus} />
      </div>

      {showResetPassword && onResetPassword ? (
        <Button variant="ghost" className="mt-4 w-full" onClick={onResetPassword}>
          {t("resetPassword")}
        </Button>
      ) : null}
    </ProfileSectionCard>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-b border-border-subtle/60 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-subtle">
        {label}
      </p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}
