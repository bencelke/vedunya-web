import Image from "next/image";

import { getLessonIconPath } from "@/features/courses/constants/course-assets";
import type { CourseLessonSummary } from "@/features/courses/types/course";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type LessonRowState = "completed" | "current" | "locked" | "available";

type LessonRowProps = {
  lesson: CourseLessonSummary;
  courseSlug: string;
  state: LessonRowState;
  statusLabel: string;
  iconAlt: string;
};

export function LessonRow({
  lesson,
  courseSlug,
  state,
  statusLabel,
  iconAlt,
}: LessonRowProps) {
  const iconPath = getLessonIconPath({
    order: lesson.order,
    runeId: lesson.runeId,
  });
  const isLocked = state === "locked";
  const href = `/courses/${courseSlug}/lessons/${lesson.id}`;

  const content = (
    <>
      <div
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius-card)-0.35rem)] border bg-surface-primary",
          state === "current"
            ? "border-accent-gold/40 bg-accent-gold-muted"
            : "border-border-subtle",
          isLocked && "opacity-60",
        )}
      >
        <Image
          src={iconPath}
          alt={iconAlt}
          width={32}
          height={32}
          className="object-contain"
        />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "min-w-0 truncate text-sm font-medium",
              state === "current" ? "text-accent-gold" : "text-text-primary",
              isLocked && "text-text-muted",
            )}
          >
            {lesson.title}
          </p>
          <span
            className={cn(
              "shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.12em]",
              state === "completed"
                ? "text-accent-gold"
                : state === "current"
                  ? "text-accent-gold"
                  : "text-text-subtle",
            )}
          >
            {statusLabel}
          </span>
        </div>
        {lesson.subtitle ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
            {lesson.subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  if (isLocked) {
    return (
      <div
        aria-disabled
        className="flex min-w-0 items-start gap-4 overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/70 p-4"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 items-start gap-4 overflow-hidden rounded-[var(--radius-card)] border p-4 transition-colors focus-visible:outline-none",
        state === "current"
          ? "border-accent-gold/30 bg-surface-elevated hover:bg-accent-gold-muted/40"
          : "border-border-subtle bg-surface-primary hover:bg-surface-elevated",
      )}
    >
      {content}
    </Link>
  );
}
