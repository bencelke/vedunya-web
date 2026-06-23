import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "authPrimary"
  | "authOutline";
type ButtonSize = "default" | "sm" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-gold text-page-bg hover:brightness-110 active:brightness-95",
  secondary:
    "border border-border-subtle bg-surface-elevated text-text-primary hover:bg-accent-violet-soft",
  ghost:
    "text-text-muted hover:bg-surface-elevated hover:text-text-primary",
  authPrimary:
    "bg-auth-accent-gold text-auth-page-bg hover:brightness-110 active:brightness-95",
  authOutline:
    "border border-auth-border bg-auth-surface text-auth-text-primary hover:bg-auth-surface-muted",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  default: "min-h-12 px-5 text-sm font-medium",
  lg: "min-h-[3.25rem] px-6 text-base font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] transition-[background-color,filter,color] duration-200 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
