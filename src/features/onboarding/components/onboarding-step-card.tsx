import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type OnboardingStepCardProps = {
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
  align?: "start" | "center";
  hideHeader?: boolean;
};

export function OnboardingStepCard({
  title,
  body,
  children,
  className,
  align = "start",
  hideHeader = false,
}: OnboardingStepCardProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        align === "center" && "text-center",
        className,
      )}
    >
      {!hideHeader ? (
        <header
          className={cn(
            "space-y-3",
            align === "center" ? "mx-auto max-w-[22rem]" : "max-w-[24rem]",
          )}
        >
          <h1 className="text-[clamp(1.625rem,5vw,2rem)] font-normal leading-[1.08] tracking-[-0.03em] text-auth-text-primary">
            {title}
          </h1>
          {body ? (
            <p className="whitespace-pre-line text-sm leading-[1.72] text-auth-text-muted">{body}</p>
          ) : null}
        </header>
      ) : null}
      {children ? <div className={cn("flex-1", hideHeader ? "" : "mt-8")}>{children}</div> : null}
    </div>
  );
}
