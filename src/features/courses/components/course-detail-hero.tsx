import Image from "next/image";

import type { CourseAccessState } from "@/features/courses/types/course";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { CourseLockedState } from "./course-locked-state";
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
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary">
          <Image
            src={resolvedCover}
            alt={coverAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 720px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-page-bg via-page-bg/30 to-transparent" />
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0",
          resolvedCover ? "-mt-10 relative px-1" : "pt-1",
        )}
      >
        <div className="rounded-[var(--radius-card)] border border-accent-gold/20 bg-surface-elevated p-5 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.85)]">
          <h1 className="text-2xl font-medium leading-tight text-text-primary">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {description}
          </p>

          {showProgress ? (
            <div className="mt-5">
              <CourseProgressBar
                percent={progressPercent ?? 0}
                label={progressLabel ?? ""}
              />
            </div>
          ) : null}

          <div className="mt-6">
            {access.canOpenLessons && ctaHref ? (
              <Link
                href={ctaHref}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent-gold px-6 text-sm font-medium text-page-bg transition-[filter] hover:brightness-110 sm:w-auto"
              >
                {ctaLabel}
              </Link>
            ) : (
              <CourseLockedState title={lockedTitle} message={lockedMessage} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
