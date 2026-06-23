import { Lock } from "lucide-react";

type CourseAccessNoticeProps = {
  title: string;
  message: string;
};

export function CourseAccessNotice({ title, message }: CourseAccessNoticeProps) {
  return (
    <div className="mystic-cosmic-card flex items-start gap-3 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-gold/25 bg-accent-gold-muted/50 text-accent-gold">
        <Lock className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 space-y-2">
        <h2 className="text-base font-medium text-text-primary">{title}</h2>
        <p className="text-sm leading-[1.72] text-text-muted">{message}</p>
      </div>
    </div>
  );
}
