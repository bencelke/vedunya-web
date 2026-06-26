import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { MysticPlusPaywallPlans } from "@/features/premium/components/mystic-plus-paywall-plans";
import { hasPremiumEntitlement } from "@/features/premium/utils/resolve-premium-display-status";
import type { MysticPlusEntitlement } from "@/features/payments/types/payment";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type MysticPlusPaywallScreenProps = {
  profile: ProfileSnapshot | null;
  mysticPlus: MysticPlusEntitlement | null;
};

export async function MysticPlusPaywallScreen({
  profile,
  mysticPlus,
}: MysticPlusPaywallScreenProps) {
  const t = await getTranslations("premium.paywall");
  const hasAccess = hasPremiumEntitlement(profile, mysticPlus);

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
    t("benefit5"),
  ];

  return (
    <div className="mystic-plus-paywall space-y-8 pb-4">
      <header className="space-y-4 text-center">
        <p className="mystic-today-overline">{t("overline")}</p>
        <h1 className="text-[clamp(1.75rem,6vw,2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-text-primary">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-[22rem] text-[0.9375rem] leading-[1.68] text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      <section className="mystic-plus-paywall-hero space-y-3 p-5 text-center">
        <h2 className="text-[clamp(1.25rem,4.8vw,1.5rem)] font-medium leading-[1.2] tracking-[-0.02em] text-text-primary">
          {t("heroTitle")}
        </h2>
        <p className="mx-auto max-w-[22rem] text-sm leading-[1.68] text-text-muted">
          {t("heroBody")}
        </p>
      </section>

      <section className="space-y-4">
        <p className="mystic-today-overline">{t("benefitsHeading")}</p>
        <ul className="space-y-3">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3 text-sm leading-[1.6] text-text-muted"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-gold"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {hasAccess ? (
        <section className="mystic-plus-paywall-plan space-y-4 p-5 text-center">
          <div className="space-y-2">
            <p className="text-base font-medium text-text-primary">{t("statusActive")}</p>
            <p className="text-sm leading-relaxed text-text-muted">{t("activeAccessNote")}</p>
          </div>
          <div className="mystic-gold-pill-btn mx-auto w-full max-w-none cursor-default opacity-95">
            <Check className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
            <span>{t("ctaActive")}</span>
          </div>
        </section>
      ) : (
        <MysticPlusPaywallPlans />
      )}

      <p className="text-center text-xs leading-relaxed text-text-subtle">{t("disclaimer")}</p>

      <p className="text-center text-xs leading-relaxed text-text-subtle">
        {t("courseSeparateNote")}
      </p>
    </div>
  );
}
