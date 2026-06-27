import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseDetailHero } from "@/features/courses/components/course-detail-hero";
import { LessonList } from "@/features/courses/components/lesson-list";
import type { SupportedLocale } from "@/config/app-config";
import type { CourseAccessState, CourseLessonSummary } from "@/features/courses/types/course";
import type { CourseProgress } from "@/features/courses/types/course-progress";
import type { ShopifyProductKey } from "@/features/shopify/types";

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
  accessType: "free" | "paid" | "premium";
  completedLabel: string;
  currentLabel: string;
  lockedLabel: string;
  getLessonIconAlt: (lesson: CourseLessonSummary) => string;
  locale: SupportedLocale;
  courseId: string;
  showPurchase?: boolean;
  productKey?: ShopifyProductKey | null;
  shopifyConfigured?: boolean;
  checkoutPending?: boolean;
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
  accessType,
  completedLabel,
  currentLabel,
  lockedLabel,
  getLessonIconAlt,
  locale,
  courseId,
  showPurchase = false,
  productKey = null,
  shopifyConfigured = false,
  checkoutPending = false,
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
            accessType={accessType}
            locale={locale}
            courseId={courseId}
            showPurchase={showPurchase}
            productKey={productKey}
            shopifyConfigured={shopifyConfigured}
            checkoutPending={checkoutPending}
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
