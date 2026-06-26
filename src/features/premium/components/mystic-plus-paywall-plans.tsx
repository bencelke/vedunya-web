"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DEFAULT_MYSTIC_PLUS_PLAN,
  MYSTIC_PLUS_PRICING,
  type MysticPlusPlanId,
} from "@/features/premium/mystic-plus-pricing";
import { cn } from "@/lib/utils";

export function MysticPlusPaywallPlans() {
  const t = useTranslations("premium.paywall");
  const [selectedPlan, setSelectedPlan] =
    useState<MysticPlusPlanId>(DEFAULT_MYSTIC_PLUS_PLAN);

  const plans: Array<{
    id: MysticPlusPlanId;
    title: string;
    price: string;
    interval: string;
    description: string;
    badge?: string;
    recommended?: boolean;
  }> = [
    {
      id: "monthly",
      title: t("monthlyTitle"),
      price: MYSTIC_PLUS_PRICING.monthly.label,
      interval: t("monthlyInterval"),
      description: t("monthlyDescription"),
    },
    {
      id: "yearly",
      title: t("yearlyTitle"),
      price: MYSTIC_PLUS_PRICING.yearly.label,
      interval: t("yearlyInterval"),
      description: t("yearlyDescription", {
        percent: MYSTIC_PLUS_PRICING.yearly.savingsPercent,
      }),
      badge: t("yearlyBadge"),
      recommended: true,
    },
  ];

  return (
    <section className="mystic-plus-paywall-plans space-y-4">
      <p className="mystic-today-overline text-center">{t("plansHeading")}</p>

      <div className="grid gap-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              aria-pressed={isSelected}
              className={cn(
                "mystic-plus-plan-card relative w-full p-4 text-left transition-colors",
                isSelected && "mystic-plus-plan-card--selected",
                plan.recommended && "mystic-plus-plan-card--recommended",
              )}
            >
              {plan.badge ? (
                <span className="mystic-plus-plan-badge">{plan.badge}</span>
              ) : null}

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{plan.title}</p>
                  <span
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border",
                      isSelected
                        ? "border-accent-gold bg-accent-gold"
                        : "border-border-subtle bg-transparent",
                    )}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-[1.75rem] font-medium leading-none tracking-[-0.03em] text-text-primary">
                    {plan.price}
                  </p>
                  <p className="mt-1 text-xs text-text-subtle">{plan.interval}</p>
                </div>

                <p className="text-sm leading-relaxed text-text-muted">{plan.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 pt-1">
        <button
          type="button"
          disabled
          className="mystic-gold-pill-btn w-full cursor-not-allowed opacity-80"
        >
          <Lock className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
          <span>{t("paymentComingLater")}</span>
        </button>
        <p className="text-center text-xs leading-relaxed text-text-subtle">
          {t("paymentNotWiredNote")}
        </p>
      </div>
    </section>
  );
}
