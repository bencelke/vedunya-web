"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { PaymentStatusNotice } from "@/features/payments/components/PaymentStatusNotice";
import { usePayPalScript } from "@/features/payments/components/PayPalScriptProviderWrapper";
import type { SupportedLocale } from "@/config/app-config";

type MysticPlusPayPalButtonsProps = {
  locale: SupportedLocale;
  disabled?: boolean;
};

export function MysticPlusPayPalButtons({
  locale,
  disabled = false,
}: MysticPlusPayPalButtonsProps) {
  const t = useTranslations("payments");
  const { ready, configured } = usePayPalScript();
  const monthlyRef = useRef<HTMLDivElement>(null);
  const yearlyRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  useEffect(() => {
    if (!ready || disabled || !window.paypal?.Buttons) {
      return;
    }

    const containers = [
      { ref: monthlyRef, plan: "monthly" as const },
      { ref: yearlyRef, plan: "yearly" as const },
    ];

    const cleanups: Array<() => void> = [];

    for (const container of containers) {
      const element = container.ref.current;
      if (!element) {
        continue;
      }

      element.replaceChildren();
      const buttons = window.paypal.Buttons({
        style: { layout: "vertical", shape: "pill" },
        createSubscription: () => {
          setStatus("pending");
          return fetch(`/api/paypal/subscriptions/create?locale=${locale}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: container.plan }),
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error("subscription_create_failed");
              }
              const payload = (await response.json()) as { subscriptionId?: string };
              if (!payload.subscriptionId) {
                throw new Error("subscription_create_failed");
              }
              return payload.subscriptionId;
            })
            .catch(() => {
              setStatus("error");
              throw new Error("subscription_create_failed");
            });
        },
        onApprove: () => {
          setStatus("pending");
        },
        onError: () => {
          setStatus("error");
        },
      });

      void buttons.render(element);
      cleanups.push(() => buttons.close());
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [ready, disabled, locale]);

  if (!configured) {
    return <PaymentStatusNotice status="unconfigured" />;
  }

  return (
    <div className="space-y-4">
      <PaymentStatusNotice status={status === "pending" ? "pending" : status === "error" ? "error" : "idle"} />
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
          {t("monthlyPlan")}
        </p>
        <div ref={monthlyRef} className="min-h-11" />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
          {t("yearlyPlan")}
        </p>
        <div ref={yearlyRef} className="min-h-11" />
      </div>
    </div>
  );
}
