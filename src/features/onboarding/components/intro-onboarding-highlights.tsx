import { Bell, BookOpen, Hash, Moon, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type IntroHighlight = {
  icon: LucideIcon;
  label: string;
};

type IntroOnboardingHighlightsProps = {
  items: IntroHighlight[];
  className?: string;
};

export function IntroOnboardingHighlights({
  items,
  className,
}: IntroOnboardingHighlightsProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 sm:gap-2.5",
        className,
      )}
      aria-label="Feature highlights"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-auth-border/80 bg-auth-surface-muted/60 px-3 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-auth-text-muted"
          >
            <Icon className="h-3.5 w-3.5 text-auth-accent-gold" strokeWidth={1.5} aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export const introHighlightIcons = {
  moon: Moon,
  sparkles: Sparkles,
  bell: Bell,
  book: BookOpen,
  hash: Hash,
  refresh: RefreshCw,
} as const;
