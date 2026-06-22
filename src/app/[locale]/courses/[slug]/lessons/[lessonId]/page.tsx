import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseLockedState } from "@/features/courses/components/course-locked-state";
import { LessonCompleteButton } from "@/features/courses/components/lesson-complete-button";
import { LessonNavigation } from "@/features/courses/components/lesson-navigation";
import { LessonReader } from "@/features/courses/components/lesson-reader";
import {
  isKnownCourseSlug,
  LIVING_THE_RUNES_COURSE_ID,
} from "@/features/courses/constants/course-ids";
import { mergeCourseProgressOpen } from "@/features/courses/repositories/course-progress-repository";
import {
  isPremiumUser,
  resolveLivingTheRunesAccess,
} from "@/features/courses/services/resolve-course-access";
import { loadLesson } from "@/features/courses/services/load-lesson";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
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
    const profile = await getProfileSnapshot(sessionUser.uid);
    const access = resolveLivingTheRunesAccess(profile, isPremiumUser(profile));
    if (access.canOpenLessons) {
      await mergeCourseProgressOpen({
        uid: sessionUser.uid,
        courseId: LIVING_THE_RUNES_COURSE_ID,
        lessonId,
      });
    }
  }

  if (!data.access.canOpenLessons) {
    return (
      <>
        <AppHeader showLogin={false} />
        <AppShell>
          <MobilePage title={data.course.title}>
            <CourseLockedState
              title={t("purchaseUnavailableTitle")}
              message={t("purchaseUnavailable")}
            />
            <div className="mt-6">
            <LessonNavigation
              courseSlug={slug}
              previousLessonId={null}
              nextLessonId={null}
              backLabel={t("backToCourse")}
              previousLabel={t("previousLesson")}
              nextLabel={t("nextLesson")}
            />
            </div>
          </MobilePage>
        </AppShell>
      </>
    );
  }

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage>
          <header className="mb-6 space-y-2">
            <p className="text-xs tracking-[0.12em] text-text-subtle">
              {t("lessonNumber", { number: data.lesson.order })}
            </p>
            <h1 className="text-2xl font-medium leading-snug text-text-primary">
              {data.lesson.title}
            </h1>
            {data.lesson.subtitle ? (
              <p className="text-sm leading-relaxed text-text-muted">
                {data.lesson.subtitle}
              </p>
            ) : null}
          </header>

          <LessonReader
            blocks={data.lesson.body}
            practiceLabel={t("contentPractice")}
            reflectionLabel={t("contentReflection")}
          />

          <div className="mt-8 space-y-4">
            {sessionUser ? (
              <LessonCompleteButton
                courseId={LIVING_THE_RUNES_COURSE_ID}
                lessonId={lessonId}
                completed={data.isCompleted}
                locked={!data.access.canOpenLessons}
              />
            ) : (
              <p className="text-sm text-text-muted">{t("signInToSaveProgress")}</p>
            )}

            <LessonNavigation
              courseSlug={slug}
              previousLessonId={data.previousLessonId}
              nextLessonId={data.nextLessonId}
              backLabel={t("backToCourse")}
              previousLabel={t("previousLesson")}
              nextLabel={t("nextLesson")}
            />
          </div>
        </MobilePage>
      </AppShell>
    </>
  );
}
