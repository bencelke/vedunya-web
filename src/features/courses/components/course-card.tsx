"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { CourseAccessBadge } from "@/features/courses/components/course-access-badge";
import { getCourseCoverPath } from "@/features/courses/constants/course-assets";
import type { CourseCatalogItem } from "@/features/courses/types/course";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { CourseProgressBar } from "./course-progress-bar";

type CourseCardProps = {
  course: CourseCatalogItem;
};

export function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations("courses");
  const coverPath =
    course.coverAssetPath ?? getCourseCoverPath(course.slug);
  const hasProgress =
    course.progressPercent !== null && course.progressPercent > 0;
  const showCompleted = course.isCompleted === true;
  const isLocked = !course.access.canOpenLessons;

  const ctaLabel = hasProgress
    ? t("resumePath")
    : isLocked
      ? t("viewCourse")
      : t("startCourse");

  const progressLabel =
    course.progressPercent !== null
      ? t("progressPercent", { percent: course.progressPercent })
      : null;

  return (
    <article
      className={cn(
        "mystic-cosmic-card-elevated min-w-0 overflow-hidden p-0",
        isLocked && "opacity-[0.97]",
      )}
    >
      <Link
        href={`/courses/${course.slug}`}
        prefetch={false}
        className="touch-manipulation block min-w-0 overflow-hidden focus-visible:outline-none active:opacity-90 active:duration-0"
      >
        {coverPath ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-primary">
            <Image
              src={coverPath}
              alt={t("coverA11y", { title: course.title })}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-page-bg/85 via-page-bg/15 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <CourseAccessBadge
                accessType={course.accessType}
                isLocked={isLocked}
                isPurchased={course.access.isPurchased}
              />
              {course.access.showComingSoon ? (
                <span className="rounded-full border border-border-subtle bg-surface-elevated/90 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-text-muted">
                  {t("comingSoon")}
                </span>
              ) : null}
            </div>
            {showCompleted ? (
              <span className="absolute right-4 top-4 rounded-full border border-accent-gold/30 bg-accent-gold-muted px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent-gold">
                {t("completed")}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="min-w-0 space-y-3 p-5">
          <p className="mystic-eyebrow">
            {t("lessonCount", { count: course.lessonCount })}
          </p>
          <h2 className="line-clamp-2 text-xl font-medium tracking-tight text-text-primary">
            {course.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-[1.72] text-text-muted">
            {course.description}
          </p>

          {course.estimatedDuration ? (
            <p className="text-xs text-text-subtle">
              {t("estimatedDuration", { duration: course.estimatedDuration })}
            </p>
          ) : null}

          {hasProgress && progressLabel ? (
            <CourseProgressBar
              percent={course.progressPercent ?? 0}
              label={progressLabel}
            />
          ) : null}

          <span className="inline-flex min-h-11 items-center text-sm font-medium text-accent-gold underline-offset-4">
            {ctaLabel}
          </span>
        </div>
      </Link>
    </article>
  );
}
