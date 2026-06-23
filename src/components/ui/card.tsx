import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardTone = "app" | "cosmic" | "elevated";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** @deprecated Use tone="elevated" */
  elevated?: boolean;
  tone?: CardTone;
};

export function Card({
  className,
  elevated = false,
  tone,
  ...props
}: CardProps) {
  const resolvedTone: CardTone =
    tone ?? (elevated ? "elevated" : "app");

  return (
    <div
      className={cn(
        "p-5",
        resolvedTone === "cosmic" && "mystic-cosmic-card",
        resolvedTone === "elevated" && "mystic-cosmic-card-elevated",
        resolvedTone === "app" &&
          "rounded-[var(--radius-md)] border border-border-subtle bg-surface-primary",
        className,
      )}
      {...props}
    />
  );
}

export function CardLabel({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.14em] text-accent-gold",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("mt-2 text-lg font-medium text-text-primary", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-3 text-sm leading-relaxed text-text-muted", className)}
      {...props}
    />
  );
}
