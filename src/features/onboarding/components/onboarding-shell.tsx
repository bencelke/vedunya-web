import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: ReactNode;
  topBar?: ReactNode;
  progress?: ReactNode;
  brand?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "profile";
  className?: string;
};

export function OnboardingShell({
  children,
  topBar,
  progress,
  brand,
  footer,
  variant = "default",
  className,
}: OnboardingShellProps) {
  if (variant === "profile") {
    return (
      <div className="mystic-auth-page mystic-profile-onboarding-page">
        <div className="mystic-profile-onboarding-frame">
          {topBar ? <div className="pt-[max(0.75rem,env(safe-area-inset-top))]">{topBar}</div> : null}
          {progress ? <div className="pt-5">{progress}</div> : null}
          <div className="mystic-profile-onboarding-stage">
            <div className="mystic-auth-card mystic-profile-onboarding-panel">
              {brand ? <div className="mb-8">{brand}</div> : null}
              <div className={cn("flex flex-1 flex-col", className)}>{children}</div>
            </div>
          </div>
          {footer ? <footer className="pb-6 pt-4 text-center">{footer}</footer> : null}
        </div>
      </div>
    );
  }

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
