"use client";

import { useTranslations } from "next-intl";

type PaymentStatusNoticeProps = {
  status: "idle" | "pending" | "verified" | "error" | "unconfigured";
};

export function PaymentStatusNotice({ status }: PaymentStatusNoticeProps) {
  const t = useTranslations("payments");

  if (status === "unconfigured") {
    return (
      <p className="text-sm leading-relaxed text-text-muted">{t("setupUnavailable")}</p>
    );
  }

  if (status === "pending") {
    return (
      <p className="text-sm leading-relaxed text-text-muted">{t("pendingVerification")}</p>
    );
  }

  if (status === "verified") {
    return (
      <p className="text-sm leading-relaxed text-text-primary">{t("verifiedAccess")}</p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm leading-relaxed text-red-300/90">{t("verificationFailed")}</p>
    );
  }

  return (
    <p className="text-sm leading-relaxed text-text-subtle">{t("securePayPalNote")}</p>
  );
}
