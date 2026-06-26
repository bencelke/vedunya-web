import { getTranslations } from "next-intl/server";

import { DailyGuidanceAuthenticated } from "@/features/daily-guidance/components/daily-guidance-authenticated";
import { DailyGuidanceHeader } from "@/features/daily-guidance/components/daily-guidance-header";
import { TodayOracleHeader } from "@/features/today/components/today-oracle-header";
import { DailyGuidanceIncomplete } from "@/features/daily-guidance/components/daily-guidance-incomplete";
import { DailyGuidancePreview } from "@/features/daily-guidance/components/daily-guidance-preview";
import type { DailyGuidancePageModel } from "@/features/daily-guidance/types/daily-guidance-view-model";

type DailyGuidanceExperienceProps = {
  model: DailyGuidancePageModel;
};

export async function DailyGuidanceExperience({
  model,
}: DailyGuidanceExperienceProps) {
  const t = await getTranslations("dailyGuidance");

  if (model.kind === "anonymous") {
    return (
      <>
        <DailyGuidanceHeader formattedDate={model.preview.formattedDate} greetingName={null} />
        <DailyGuidancePreview preview={model.preview} />
      </>
    );
  }

  if (model.kind === "incomplete") {
    return (
      <>
        <DailyGuidanceHeader
          formattedDate={model.incomplete.formattedDate}
          greetingName={model.incomplete.greetingName}
        />
        <DailyGuidanceIncomplete incomplete={model.incomplete} />
      </>
    );
  }

  if (model.kind === "session-error") {
    return (
      <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-5">
        <p className="text-sm leading-relaxed text-text-muted">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <>
      <TodayOracleHeader />
      <DailyGuidanceHeader
        formattedDate={model.guidance.formattedDate}
        greetingName={model.guidance.greetingName}
        variant="oracle"
      />
      <DailyGuidanceAuthenticated guidance={model.guidance} />
    </>
  );
}
