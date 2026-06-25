import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type OnboardingStepCardProps = {
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
  align?: "start" | "center";
};

export function OnboardingStepCard({
  title,
  body,
  children,
  className,
  align = "start",
}: OnboardingStepCardProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        align === "center" && "text-center",
        className,
      )}
    >
      <header
        className={cn(
          "space-y-4",
          align === "center" ? "mx-auto max-w-[22rem]" : "max-w-[24rem]",
        )}
      >
        <h1 className="text-[clamp(1.75rem,5.4vw,2.25rem)] font-normal leading-[1.06] tracking-[-0.03em] text-auth-text-primary">
          {title}
        </h1>
        <p className="text-sm leading-[1.72] text-auth-text-muted">{body}</p>
      </header>
      {children ? <div className="mt-8 flex-1">{children}</div> : null}
    </div>
  );
}
