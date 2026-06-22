import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LessonNavigationProps = {
  courseSlug: string;
  previousLessonId: string | null;
  nextLessonId: string | null;
  backLabel: string;
  previousLabel: string;
  nextLabel: string;
};

export function LessonNavigation({
  courseSlug,
  previousLessonId,
  nextLessonId,
  backLabel,
  previousLabel,
  nextLabel,
}: LessonNavigationProps) {
  return (
    <nav
      aria-label={backLabel}
      className="grid min-w-0 gap-3 overflow-hidden border-t border-border-subtle pt-5"
    >
      <Link
        href={`/courses/${courseSlug}`}
        className="inline-flex min-h-10 items-center text-sm font-medium text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
      >
        {backLabel}
      </Link>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {previousLessonId ? (
          <Link
            href={`/courses/${courseSlug}/lessons/${previousLessonId}`}
            className={cn(
              "inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-primary px-5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated",
            )}
          >
            <span className="truncate">{previousLabel}</span>
          </Link>
        ) : (
          <span aria-hidden className="hidden sm:block" />
        )}

        {nextLessonId ? (
          <Link
            href={`/courses/${courseSlug}/lessons/${nextLessonId}`}
            className="inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden rounded-full bg-accent-gold px-5 text-sm font-medium text-page-bg transition-[filter] hover:brightness-110"
          >
            <span className="truncate">{nextLabel}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
