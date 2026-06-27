import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonReaderScreen } from "@/features/courses/components/lesson-reader-screen";
import { isKnownCourseSlug } from "@/features/courses/constants/course-ids";
import { mergeCourseProgressOpen } from "@/features/courses/repositories/course-progress-repository";
import { loadLesson } from "@/features/courses/services/load-lesson";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { SupportedLocale } from "@/config/app-config";

type LessonPageProps = {
  params: Promise<{ locale: string; slug: string; lessonId: string }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { locale, slug, lessonId } = await params;
  const lesson = await loadLesson({
    slug,
    lessonId,
    locale: locale as SupportedLocale,
  });
  return { title: lesson?.lesson.title ?? "Lesson" };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { locale, slug, lessonId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("courses");
  const tPremium = await getTranslations("premium");

  if (!isKnownCourseSlug(slug)) {
    notFound();
  }

  const data = await loadLesson({
    slug,
    lessonId,
    locale: locale as SupportedLocale,
  });

  if (!data) {
    notFound();
  }

  const sessionUser = await getCurrentUser();
  if (sessionUser && data.access.canOpenLessons) {
    await mergeCourseProgressOpen({
      uid: sessionUser.uid,
      courseId: data.course.id,
      lessonId,
    });
  }

  const lockedTitle = data.access.isPremiumLocked
    ? tPremium("lockTitle")
    : data.access.showComingSoon
      ? t("comingSoon")
      : t("purchaseUnavailableTitle");
  const lockedMessage = data.access.isPremiumLocked
    ? tPremium("lockBody")
    : data.access.showComingSoon
      ? t("comingSoonCourseMessage")
      : t("purchaseUnavailable");

  return (
    <LessonReaderScreen
      courseSlug={slug}
      courseId={data.course.id}
      courseTitle={data.course.title}
      lessonId={lessonId}
      lessonTitle={data.lesson.title}
      lessonSubtitle={data.lesson.subtitle}
      blocks={data.lesson.body}
      canOpenLessons={data.access.canOpenLessons}
      isCompleted={data.isCompleted}
      isAuthenticated={Boolean(sessionUser)}
      previousLessonId={data.previousLessonId}
      nextLessonId={data.nextLessonId}
      lessonNumberLabel={t("lessonNumber", { number: data.lesson.order })}
      practiceLabel={t("contentPractice")}
      reflectionLabel={t("contentReflection")}
      lockedTitle={lockedTitle}
      lockedMessage={lockedMessage}
      signInMessage={t("signInToSaveProgress")}
      backLabel={t("backToCourse")}
      previousLabel={t("previousLesson")}
      nextLabel={t("nextLesson")}
    />
  );
}
