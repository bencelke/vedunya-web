import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { DailyGuidanceIncompleteModel } from "@/features/daily-guidance/types/daily-guidance-view-model";

type DailyGuidanceIncompleteProps = {
  incomplete: DailyGuidanceIncompleteModel;
};

export async function DailyGuidanceIncomplete({
  incomplete,
}: DailyGuidanceIncompleteProps) {
  const tAuth = await getTranslations("auth.today");

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-5">
        <p className="text-sm leading-relaxed text-text-muted">
          {incomplete.setupMessage}
        </p>
        <Link
          href={incomplete.setupHref}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent-gold px-6 text-sm font-medium text-page-bg transition-opacity hover:opacity-95"
        >
          {tAuth("setupCta")}
        </Link>
      </div>
    </div>
  );
}
