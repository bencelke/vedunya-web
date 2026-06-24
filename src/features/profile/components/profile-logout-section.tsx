"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type ProfileLogoutSectionProps = {
  onLogout: () => void;
};

export function ProfileLogoutSection({ onLogout }: ProfileLogoutSectionProps) {
  const t = useTranslations("profile");
  const tLogout = useTranslations("profile.logout");

  return (
    <div className="flex flex-col gap-3 pt-2">
      <Button variant="ghost" className="w-full" onClick={onLogout}>
        {tLogout("action")}
      </Button>
      <Link
        href="/today"
        className="text-center text-sm text-text-muted underline-offset-4 hover:underline"
      >
        {t("backToToday")}
      </Link>
    </div>
  );
}
