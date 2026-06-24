import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isCoursePurchaseConfigured } from "@/features/payments/server/paypal-config";
import { CourseDetailScreen } from "@/features/courses/components/course-detail-screen";
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
  const tPremium = await getTranslations("premium");

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
    ? t("continueLesson")
    : completedIds.length > 0
      ? t("resumePath")
      : t("startCourse");

  const lockedTitle = detail.access.isPremiumLocked
    ? tPremium("lockTitle")
    : detail.access.showComingSoon
      ? t("comingSoon")
      : t("purchaseUnavailableTitle");
  const lockedMessage = detail.access.isPremiumLocked
    ? tPremium("lockBody")
    : detail.access.showComingSoon
      ? t("comingSoonCourseMessage")
      : t("purchaseUnavailable");

  return (
    <CourseDetailScreen
      slug={slug}
      coverPath={detail.summary.coverAssetPath}
      title={detail.summary.title}
      description={detail.summary.description}
      lessons={detail.lessons}
      progress={detail.progress}
      access={detail.access}
      progressPercent={progressPercent}
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      lessonsHeading={t("lessonsHeading")}
      progressLabel={
        progressPercent !== null
          ? t("progressPercent", { percent: progressPercent })
          : null
      }
      lockedTitle={lockedTitle}
      lockedMessage={lockedMessage}
      coverAlt={t("coverA11y", { title: detail.summary.title })}
      completedLabel={t("lessonCompleted")}
      currentLabel={t("lessonCurrent")}
      lockedLabel={t("lessonLocked")}
      locale={locale as SupportedLocale}
      courseId={detail.summary.id}
      showPurchase={
        detail.access.isPaidLocked &&
        !detail.access.showComingSoon &&
        isCoursePurchaseConfigured()
      }
      getLessonIconAlt={(lesson) => t("lessonIconA11y", { title: lesson.title })}
    />
  );
}
