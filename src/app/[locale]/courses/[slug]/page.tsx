import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseDetailHero } from "@/features/courses/components/course-detail-hero";
import { LessonList } from "@/features/courses/components/lesson-list";
import { isKnownCourseSlug } from "@/features/courses/constants/course-ids";
import { loadCourseDetail } from "@/features/courses/services/load-course-detail";
import type { SupportedLocale } from "@/config/app-config";

type CourseDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isKnownCourseSlug(slug)) {
    return { title: "Course" };
  }
  const detail = await loadCourseDetail(slug, locale as SupportedLocale);
  return { title: detail?.summary.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("courses");

  if (!isKnownCourseSlug(slug)) {
    notFound();
  }

  const detail = await loadCourseDetail(slug, locale as SupportedLocale);
  if (!detail) {
    notFound();
  }

  const completedIds = detail.progress?.completedLessonIds ?? [];
  const progressPercent =
    detail.progress && detail.summary.lessonCount > 0
      ? Math.round((completedIds.length / detail.summary.lessonCount) * 100)
      : null;

  const firstLessonId = detail.lessons[0]?.id ?? null;
  const targetLessonId = detail.resumeLessonId ?? firstLessonId;
  const ctaHref =
    detail.access.canOpenLessons && targetLessonId
      ? `/courses/${slug}/lessons/${targetLessonId}`
      : null;

  const ctaLabel = detail.progress?.isCompleted
    ? t("continueLearning")
    : completedIds.length > 0
      ? t("resumeCourse")
      : t("startCourse");

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage>
          <CourseDetailHero
            coverPath={detail.summary.coverAssetPath}
            title={detail.summary.title}
            description={detail.summary.description}
            progressPercent={progressPercent}
            progressLabel={
              progressPercent !== null
                ? t("progressPercent", { percent: progressPercent })
                : null
            }
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
            access={detail.access}
            lockedTitle={t("purchaseUnavailableTitle")}
            lockedMessage={t("purchaseUnavailable")}
            coverAlt={t("coverA11y", { title: detail.summary.title })}
          />

          <div className="mt-8">
            <h2 className="mb-4 text-sm font-medium tracking-[0.12em] text-accent-gold">
              {t("lessonsHeading")}
            </h2>
            <LessonList
              courseSlug={slug}
              lessons={detail.lessons}
              completedLessonIds={completedIds}
              currentLessonId={detail.progress?.lastOpenedLessonId ?? null}
              canOpenLessons={detail.access.canOpenLessons}
              completedLabel={t("lessonCompleted")}
              currentLabel={t("lessonCurrent")}
              lockedLabel={t("lessonLocked")}
              getLessonIconAlt={(lesson) =>
                t("lessonIconA11y", { title: lesson.title })
              }
            />
          </div>
        </MobilePage>
      </AppShell>
    </>
  );
}
