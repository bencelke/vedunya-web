import { Link } from "@/i18n/navigation";
import { Lock } from "lucide-react";

type TodayPremiumLockCardProps = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref?: string;
};

export function TodayPremiumLockCard({
  title,
  body,
  ctaLabel,
  ctaHref = "/profile",
}: TodayPremiumLockCardProps) {
  return (
    <section className="mystic-cosmic-card space-y-4 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-gold/25 bg-accent-gold-muted/50 text-accent-gold">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-primary">{title}</h3>
          <p className="text-sm leading-relaxed text-text-muted">{body}</p>
        </div>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-pill)] border border-border-subtle bg-surface-elevated px-5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-violet-soft"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
