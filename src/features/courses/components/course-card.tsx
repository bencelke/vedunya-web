"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
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

  const ctaLabel = hasProgress ? t("resume") : t("viewCourse");
  const progressLabel =
    course.progressPercent !== null
      ? t("progressPercent", { percent: course.progressPercent })
      : null;

  return (
    <Card
      elevated
      className={cn(
        "min-w-0 overflow-hidden border-accent-gold/15 p-0",
        isLocked && "opacity-95",
      )}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="block min-w-0 overflow-hidden focus-visible:outline-none"
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
            <div className="absolute inset-0 bg-gradient-to-t from-page-bg/80 via-page-bg/10 to-transparent" />
            {course.access.showComingSoon ? (
              <span className="absolute left-4 top-4 rounded-full border border-border-subtle bg-surface-elevated/90 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-text-muted">
                {t("comingSoon")}
              </span>
            ) : null}
            {showCompleted ? (
              <span className="absolute right-4 top-4 rounded-full border border-accent-gold/30 bg-accent-gold-muted px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent-gold">
                {t("completed")}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="min-w-0 p-5">
          <CardLabel>{t("lessonCount", { count: course.lessonCount })}</CardLabel>
          <CardTitle className="mt-2 line-clamp-2">{course.title}</CardTitle>
          <CardBody className="line-clamp-3">{course.description}</CardBody>

          {course.estimatedDuration ? (
            <p className="mt-3 text-xs text-text-subtle">
              {t("estimatedDuration", { duration: course.estimatedDuration })}
            </p>
          ) : null}

          {hasProgress && progressLabel ? (
            <div className="mt-4">
              <CourseProgressBar
                percent={course.progressPercent ?? 0}
                label={progressLabel}
              />
            </div>
          ) : null}

          <span className="mt-5 inline-flex text-sm font-medium text-accent-gold underline-offset-4 hover:underline">
            {ctaLabel}
          </span>
        </div>
      </Link>
    </Card>
  );
}
