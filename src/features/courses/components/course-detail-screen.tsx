import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseDetailHero } from "@/features/courses/components/course-detail-hero";
import { LessonList } from "@/features/courses/components/lesson-list";
import type { CourseAccessState, CourseLessonSummary } from "@/features/courses/types/course";
import type { CourseProgress } from "@/features/courses/types/course-progress";

type CourseDetailScreenProps = {
  slug: string;
  coverPath: string | null;
  title: string;
  description: string;
  lessons: CourseLessonSummary[];
  progress: CourseProgress | null;
  access: CourseAccessState;
  progressPercent: number | null;
  ctaHref: string | null;
  ctaLabel: string;
  lessonsHeading: string;
  progressLabel: string | null;
  lockedTitle: string;
  lockedMessage: string;
  coverAlt: string;
  completedLabel: string;
  currentLabel: string;
  lockedLabel: string;
  getLessonIconAlt: (lesson: CourseLessonSummary) => string;
};

export function CourseDetailScreen({
  slug,
  coverPath,
  title,
  description,
  lessons,
  progress,
  access,
  progressPercent,
  ctaHref,
  ctaLabel,
  lessonsHeading,
  progressLabel,
  lockedTitle,
  lockedMessage,
  coverAlt,
  completedLabel,
  currentLabel,
  lockedLabel,
  getLessonIconAlt,
}: CourseDetailScreenProps) {
  const completedIds = progress?.completedLessonIds ?? [];

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <CourseDetailHero
            coverPath={coverPath}
            title={title}
            description={description}
            progressPercent={progressPercent}
            progressLabel={progressLabel}
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
            access={access}
            lockedTitle={lockedTitle}
            lockedMessage={lockedMessage}
            coverAlt={coverAlt}
          />

          <div className="mt-8">
            <h2 className="mystic-eyebrow mb-4">{lessonsHeading}</h2>
            <LessonList
              courseSlug={slug}
              lessons={lessons}
              completedLessonIds={completedIds}
              currentLessonId={progress?.lastOpenedLessonId ?? null}
              canOpenLessons={access.canOpenLessons}
              completedLabel={completedLabel}
              currentLabel={currentLabel}
              lockedLabel={lockedLabel}
              getLessonIconAlt={getLessonIconAlt}
            />
          </div>
        </MobilePage>
      </AppShell>
    </>
  );
}
