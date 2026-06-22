import { getTranslations } from "next-intl/server";

export async function HowItWorks() {
  const t = await getTranslations("landing.howItWorks");

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-24 space-y-5"
    >
      <div className="space-y-2">
        <h2
          id="how-it-works-heading"
          className="text-xl font-medium text-text-primary"
        >
          {t("heading")}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted">
          {t("description")}
        </p>
      </div>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-gold-muted text-sm font-medium text-accent-gold"
            >
              {index + 1}
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
