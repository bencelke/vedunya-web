import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function LandingHero() {
  const t = await getTranslations("landing.hero");

  return (
    <section className="space-y-6 pt-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-gold">
        {t("eyebrow")}
      </p>
      <div className="space-y-4">
        <h1 className="text-[2rem] font-medium leading-[1.15] tracking-tight text-text-primary">
          {t("headline")}
        </h1>
        <p className="max-w-sm text-base leading-relaxed text-text-muted">
          {t("supporting")}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/today"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent-gold px-6 text-sm font-medium text-page-bg transition-[filter] hover:brightness-110"
        >
          {t("primaryCta")}
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-subtle bg-surface-primary px-6 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated"
        >
          {t("secondaryCta")}
        </a>
      </div>
    </section>
  );
}
