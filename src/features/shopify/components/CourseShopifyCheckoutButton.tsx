"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { SupportedLocale } from "@/config/app-config";

type CourseShopifyCheckoutButtonProps = {
  locale: SupportedLocale;
  productKey: string;
  disabled?: boolean;
};

export function CourseShopifyCheckoutButton({
  locale,
  productKey,
  disabled = false,
}: CourseShopifyCheckoutButtonProps) {
  const t = useTranslations("shopify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleCheckout() {
    if (disabled || loading) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`/api/shopify/checkout/create?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });

      if (!response.ok) {
        throw new Error("checkout_failed");
      }

      const payload = (await response.json()) as { checkoutUrl?: string };
      if (!payload.checkoutUrl) {
        throw new Error("checkout_failed");
      }

      window.location.href = payload.checkoutUrl;
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-text-muted">{t("secureCheckoutNote")}</p>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          void handleCheckout();
        }}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-pill)] bg-accent-gold px-6 text-sm font-medium text-page-bg transition-opacity hover:opacity-95 disabled:opacity-60 sm:w-auto"
      >
        {loading ? t("startingCheckout") : t("buyThroughShopify")}
      </button>
      <p className="text-xs leading-relaxed text-text-subtle">{t("paypalInsideCheckoutNote")}</p>
      {error ? (
        <p className="text-sm leading-relaxed text-red-300/90">{t("checkoutFailed")}</p>
      ) : null}
    </div>
  );
}
