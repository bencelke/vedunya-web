"use client";

import { useTranslations } from "next-intl";

import { CourseShopifyCheckoutButton } from "@/features/shopify/components/CourseShopifyCheckoutButton";
import type { SupportedLocale } from "@/config/app-config";

type CourseShopifyPurchaseSectionProps = {
  locale: SupportedLocale;
  productKey: string;
  checkoutPending?: boolean;
  shopifyConfigured: boolean;
};

export function CourseShopifyPurchaseSection({
  locale,
  productKey,
  checkoutPending = false,
  shopifyConfigured,
}: CourseShopifyPurchaseSectionProps) {
  const t = useTranslations("shopify");

  if (!shopifyConfigured) {
    return (
      <p className="text-sm leading-relaxed text-text-muted">{t("setupUnavailable")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {checkoutPending ? (
        <p className="text-sm leading-relaxed text-text-muted">{t("pendingVerification")}</p>
      ) : null}
      <CourseShopifyCheckoutButton locale={locale} productKey={productKey} />
    </div>
  );
}
