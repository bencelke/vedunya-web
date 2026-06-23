import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseAccessNotice } from "@/features/courses/components/course-access-notice";
import { LessonCompleteButton } from "@/features/courses/components/lesson-complete-button";
import { LessonNavigation } from "@/features/courses/components/lesson-navigation";
import { LessonReader } from "@/features/courses/components/lesson-reader";
import type { CourseContentBlock } from "@/features/courses/types/course";

type LessonReaderScreenProps = {
  courseSlug: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonSubtitle?: string;
  blocks: CourseContentBlock[];
  canOpenLessons: boolean;
  isCompleted: boolean;
  isAuthenticated: boolean;
  previousLessonId: string | null;
  nextLessonId: string | null;
  lessonNumberLabel: string;
  practiceLabel: string;
  reflectionLabel: string;
  lockedTitle: string;
  lockedMessage: string;
  signInMessage: string;
  backLabel: string;
  previousLabel: string;
  nextLabel: string;
};

export function LessonReaderScreen({
  courseSlug,
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
  lessonSubtitle,
  blocks,
  canOpenLessons,
  isCompleted,
  isAuthenticated,
  previousLessonId,
  nextLessonId,
  lessonNumberLabel,
  practiceLabel,
  reflectionLabel,
  lockedTitle,
  lockedMessage,
  signInMessage,
  backLabel,
  previousLabel,
  nextLabel,
}: LessonReaderScreenProps) {
  if (!canOpenLessons) {
    return (
      <>
        <AppHeader showLogin={false} />
        <AppShell>
          <MobilePage className="mystic-today-column py-6 pt-safe-top">
            <header className="mb-6 space-y-2">
              <p className="mystic-eyebrow">{courseTitle}</p>
              <h1 className="text-2xl font-medium text-text-primary">{lessonTitle}</h1>
            </header>
            <CourseAccessNotice title={lockedTitle} message={lockedMessage} />
            <div className="mt-6">
              <LessonNavigation
                courseSlug={courseSlug}
                previousLessonId={null}
                nextLessonId={null}
                backLabel={backLabel}
                previousLabel={previousLabel}
                nextLabel={nextLabel}
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
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <header className="mb-6 space-y-2">
            <p className="mystic-eyebrow">{lessonNumberLabel}</p>
            <h1 className="text-2xl font-medium leading-snug text-text-primary sm:text-[1.75rem]">
              {lessonTitle}
            </h1>
            {lessonSubtitle ? (
              <p className="text-sm leading-[1.72] text-text-muted">
                {lessonSubtitle}
              </p>
            ) : null}
          </header>

          <div className="mystic-cosmic-card p-5 sm:p-6">
            <LessonReader
              blocks={blocks}
              practiceLabel={practiceLabel}
              reflectionLabel={reflectionLabel}
            />
          </div>

          <div className="mt-8 space-y-4">
            {isAuthenticated ? (
              <LessonCompleteButton
                courseId={courseId}
                lessonId={lessonId}
                completed={isCompleted}
                locked={!canOpenLessons}
              />
            ) : (
              <p className="text-sm text-text-muted">{signInMessage}</p>
            )}

            <LessonNavigation
              courseSlug={courseSlug}
              previousLessonId={previousLessonId}
              nextLessonId={nextLessonId}
              backLabel={backLabel}
              previousLabel={previousLabel}
              nextLabel={nextLabel}
            />
          </div>
        </MobilePage>
      </AppShell>
    </>
  );
}
