import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: ReactNode;
  topBar?: ReactNode;
  progress?: ReactNode;
  className?: string;
};

export function OnboardingShell({
  children,
  topBar,
  progress,
  className,
}: OnboardingShellProps) {
  return (
    <div className="mystic-auth-page">
      <div className="mystic-shell flex min-h-dvh flex-col px-[var(--spacing-page)] pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        {topBar ? <div className="mb-2">{topBar}</div> : null}
        {progress ? <div className="mb-9 pt-2">{progress}</div> : null}
        <div className={cn("mystic-auth-content flex flex-1 flex-col", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
