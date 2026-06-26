"use client";

import { Bell, BookOpen, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type PracticeFeature = {
  title: string;
  body: string;
};

type IntroPracticeFeaturesProps = {
  items: PracticeFeature[];
  className?: string;
};

const icons = [Sparkles, Bell, BookOpen] as const;

export function IntroPracticeFeatures({
  items,
  className,
}: IntroPracticeFeaturesProps) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item, index) => {
        const Icon = icons[index] ?? Sparkles;
        return (
          <li
            key={item.title}
            className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-auth-border/80 bg-auth-surface-muted/50 px-4 py-3.5"
          >
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-auth-accent-gold/25 bg-auth-accent-gold/10">
              <Icon className="h-4 w-4 text-auth-accent-gold" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-snug text-auth-text-primary">
                {item.title}
              </p>
              <p className="text-xs leading-relaxed text-auth-text-muted">{item.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
