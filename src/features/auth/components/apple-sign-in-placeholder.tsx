"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function AppleSignInPlaceholder() {
  const t = useTranslations("auth.apple");

  return (
    <Button
      type="button"
      variant="authOutline"
      className="w-full opacity-70"
      disabled
      aria-disabled="true"
      title={t("unavailableHint")}
    >
      {t("continue")}
    </Button>
  );
}
