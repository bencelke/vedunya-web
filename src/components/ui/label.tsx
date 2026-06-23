import { type LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type LabelTone = "app" | "auth";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  tone?: LabelTone;
};

const toneStyles: Record<LabelTone, string> = {
  app: "text-text-muted",
  auth: "text-auth-text-muted text-[0.9375rem] font-normal",
};

export function Label({ className, tone = "app", ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium", toneStyles[tone], className)}
      {...props}
    />
  );
}
