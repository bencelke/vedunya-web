import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { mysticTheme } from "@/config/mysticTheme";

export type MysticCardTone = "app" | "auth" | "cosmic" | "elevated";

export type MysticCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: MysticCardTone;
};

const toneStyles: Record<MysticCardTone, string> = {
  app: "rounded-[var(--radius-md)] border border-border-subtle bg-surface-primary",
  auth: "mystic-auth-card",
  cosmic: mysticTheme.layout.cosmicCardClass,
  elevated: "mystic-cosmic-card-elevated",
};

export function MysticCard({
  className,
  tone = "app",
  ...props
}: MysticCardProps) {
  return (
    <div className={cn("p-5", toneStyles[tone], className)} {...props} />
  );
}

export function MysticCardLabel({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(mysticTheme.typography.label, "text-accent-gold", className)}
      {...props}
    />
  );
}

export function MysticCardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(mysticTheme.typography.title, "mt-2 text-text-primary", className)}
      {...props}
    />
  );
}

export function MysticCardBody({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(mysticTheme.typography.body, "mt-3 text-text-muted", className)}
      {...props}
    />
  );
}
