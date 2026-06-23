import type { SupportedLocale } from "@/config/app-config";
import { cn } from "@/lib/utils";

type OnboardingReviewProps = {
  displayName: string;
  dateOfBirth: string;
  language: SupportedLocale;
  nameLabel: string;
  dobLabel: string;
  languageLabel: string;
  englishLabel: string;
  russianLabel: string;
  className?: string;
};

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function OnboardingReview({
  displayName,
  dateOfBirth,
  language,
  nameLabel,
  dobLabel,
  languageLabel,
  englishLabel,
  russianLabel,
  className,
}: OnboardingReviewProps) {
  return (
    <dl
      className={cn(
        "space-y-4 rounded-[var(--radius-lg)] border border-auth-border bg-auth-surface-muted/70 px-5 py-4",
        className,
      )}
    >
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.12em] text-auth-text-subtle">
          {nameLabel}
        </dt>
        <dd className="mt-1 text-base text-auth-text-primary">{displayName}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.12em] text-auth-text-subtle">
          {dobLabel}
        </dt>
        <dd className="mt-1 text-base text-auth-text-primary">
          {formatDisplayDate(dateOfBirth)}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.12em] text-auth-text-subtle">
          {languageLabel}
        </dt>
        <dd className="mt-1 text-base text-auth-text-primary">
          {language === "en" ? englishLabel : russianLabel}
        </dd>
      </div>
    </dl>
  );
}
