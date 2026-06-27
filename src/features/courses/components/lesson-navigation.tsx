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

const navLinkClass =
  "touch-manipulation inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden rounded-full transition-[background-color,filter,transform] duration-100 active:scale-[0.98] active:duration-0";

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
        prefetch={false}
        className="touch-manipulation inline-flex min-h-10 items-center text-sm font-medium text-text-muted underline-offset-4 transition-colors active:opacity-80 hover:text-text-primary hover:underline"
      >
        {backLabel}
      </Link>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {previousLessonId ? (
          <Link
            href={`/courses/${courseSlug}/lessons/${previousLessonId}`}
            prefetch={false}
            className={cn(
              navLinkClass,
              "border border-border-subtle bg-surface-primary px-5 text-sm font-medium text-text-primary hover:bg-surface-elevated",
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
            prefetch={false}
            className={cn(
              navLinkClass,
              "bg-accent-gold px-5 text-sm font-medium text-page-bg hover:brightness-110",
            )}
          >
            <span className="truncate">{nextLabel}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
