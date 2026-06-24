"use client";

import { useTranslations } from "next-intl";

import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import type { ProfileCourseSummary } from "@/features/profile/types/profile-settings-summary";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ProfileCoursesSectionProps = {
  course: ProfileCourseSummary | null;
};

export function ProfileCoursesSection({ course }: ProfileCoursesSectionProps) {
  const t = useTranslations("profile.courses");

  const progressText =
    course?.hasStarted && course.progressPercent !== null
      ? t("progress", { percent: course.progressPercent })
      : t("notStarted");

  return (
    <ProfileSectionCard label={t("label")} title={t("title")} description={t("description")}>
      <p className="text-sm text-text-muted">{progressText}</p>
      <Link
        href="/courses"
        className={cn(
          "mt-4 flex min-h-12 w-full items-center justify-center rounded-[var(--radius-pill)] px-5 text-sm font-medium",
          "border border-border-subtle bg-surface-elevated text-text-primary hover:bg-accent-violet-soft",
        )}
      >
        {t("openCourses")}
      </Link>
    </ProfileSectionCard>
  );
}
