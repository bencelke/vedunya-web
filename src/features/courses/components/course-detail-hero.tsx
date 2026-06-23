import Image from "next/image";

import { CourseAccessNotice } from "@/features/courses/components/course-access-notice";
import type { CourseAccessState } from "@/features/courses/types/course";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { CourseProgressBar } from "./course-progress-bar";

type CourseDetailHeroProps = {
  coverPath: string | null;
  title: string;
  description: string;
  progressPercent: number | null;
  progressLabel: string | null;
  ctaHref: string | null;
  ctaLabel: string;
  access: CourseAccessState;
  lockedTitle: string;
  lockedMessage: string;
  coverAlt: string;
};

export function CourseDetailHero({
  coverPath,
  title,
  description,
  progressPercent,
  progressLabel,
  ctaHref,
  ctaLabel,
  access,
  lockedTitle,
  lockedMessage,
  coverAlt,
}: CourseDetailHeroProps) {
  const resolvedCover = coverPath ?? null;
  const showProgress =
    access.canOpenLessons &&
    progressPercent !== null &&
    progressLabel !== null &&
    progressPercent > 0;

  return (
    <section className="min-w-0 overflow-hidden">
      {resolvedCover ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-card)] border border-accent-gold/15 bg-surface-primary">
          <Image
            src={resolvedCover}
            alt={coverAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 420px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-page-bg via-page-bg/35 to-transparent" />
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0",
          resolvedCover ? "-mt-10 relative px-1" : "pt-1",
        )}
      >
        <div className="mystic-cosmic-card-elevated space-y-4 p-5 sm:p-6">
          <h1 className="text-2xl font-medium leading-tight text-text-primary sm:text-[1.75rem]">
            {title}
          </h1>
          <p className="text-sm leading-[1.72] text-text-muted">{description}</p>

          {showProgress ? (
            <CourseProgressBar
              percent={progressPercent ?? 0}
              label={progressLabel ?? ""}
            />
          ) : null}

          <div className="pt-2">
            {access.canOpenLessons && ctaHref ? (
              <Link
                href={ctaHref}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-pill)] bg-accent-gold px-6 text-sm font-medium text-page-bg transition-opacity hover:opacity-95 sm:w-auto"
              >
                {ctaLabel}
              </Link>
            ) : (
              <CourseAccessNotice title={lockedTitle} message={lockedMessage} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
