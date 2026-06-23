import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export type InputTone = "app" | "auth";
export type InputVariant = "boxed" | "underline";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  tone?: InputTone;
  variant?: InputVariant;
};

const toneStyles: Record<InputTone, string> = {
  app: "border-border-subtle bg-surface-primary text-text-primary focus-visible:ring-focus-ring",
  auth: "border-auth-border bg-auth-surface-muted text-auth-text-primary focus-visible:ring-auth-accent-gold",
};

const variantStyles: Record<InputVariant, Record<InputTone, string>> = {
  boxed: {
    app: "min-h-12 rounded-[var(--radius-card)] border px-4 text-sm outline-none focus-visible:ring-2",
    auth: "min-h-12 rounded-[var(--radius-card)] border px-4 text-sm outline-none focus-visible:ring-2",
  },
  underline: {
    app: "mystic-auth-input-underline text-sm",
    auth: "mystic-auth-input-underline",
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, tone = "app", variant = "boxed", type = "text", ...props },
    ref,
  ) => {
    const isUnderline = variant === "underline";

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          isUnderline ? variantStyles.underline[tone] : variantStyles.boxed[tone],
          !isUnderline && toneStyles[tone],
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
