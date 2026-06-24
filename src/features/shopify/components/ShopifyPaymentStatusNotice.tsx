"use client";

import { useTranslations } from "next-intl";

type ShopifyPaymentStatusNoticeProps = {
  status: "pending" | "unconfigured";
};

export function ShopifyPaymentStatusNotice({ status }: ShopifyPaymentStatusNoticeProps) {
  const t = useTranslations("shopify");

  if (status === "unconfigured") {
    return (
      <p className="text-sm leading-relaxed text-text-muted">{t("setupUnavailable")}</p>
    );
  }

  return (
    <p className="text-sm leading-relaxed text-text-muted">{t("pendingVerification")}</p>
  );
}
