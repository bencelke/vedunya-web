import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function FinalCta() {
  const t = await getTranslations("landing.finalCta");

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2
            id="final-cta-heading"
            className="text-xl font-medium text-text-primary"
          >
            {t("heading")}
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/today"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent-gold px-6 text-sm font-medium text-page-bg transition-[filter] hover:brightness-110"
          >
            {t("primaryCta")}
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-subtle px-6 text-sm font-medium text-text-primary transition-colors hover:bg-surface-primary"
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
