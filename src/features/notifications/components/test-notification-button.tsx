"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type TestNotificationButtonProps = {
  disabled?: boolean;
  busy?: boolean;
  onSend: () => Promise<void>;
};

export function TestNotificationButton({
  disabled = false,
  busy = false,
  onSend,
}: TestNotificationButtonProps) {
  const t = useTranslations("notifications");

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={disabled || busy}
        onClick={() => {
          void onSend();
        }}
      >
        {busy ? t("testSending") : t("testAction")}
      </Button>
      <p className="text-xs leading-relaxed text-text-subtle">{t("testHint")}</p>
    </div>
  );
}
