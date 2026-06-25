import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProgressStepsProps = {
  currentStep: number;
  totalSteps: number;
  label: string;
  className?: string;
};

export function ProgressSteps({
  currentStep,
  totalSteps,
  label,
  className,
}: ProgressStepsProps) {
  const progress = Math.min(
    100,
    Math.max(0, ((currentStep + 1) / totalSteps) * 100),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium uppercase tracking-[0.14em] text-auth-accent-gold">
          {label}
        </span>
        <span className="tabular-nums text-auth-text-subtle">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={label}
        className="h-1.5 overflow-hidden rounded-full bg-auth-accent-gold-soft"
      >
        <div
          className="h-full rounded-full bg-auth-accent-gold transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

type AuthShellProps = {
  children: ReactNode;
  topBar?: ReactNode;
  className?: string;
  /** `page` flat content. `card` elevated surface. `login` centered premium panel. */
  layout?: "page" | "card" | "login";
};

export function AuthShell({
  children,
  topBar,
  className,
  layout = "page",
}: AuthShellProps) {
  if (layout === "login") {
    return (
      <div className="mystic-auth-page mystic-login-page">
        <div className="mystic-login-frame">
          {topBar ? (
            <header className="flex justify-end pt-[max(0.75rem,env(safe-area-inset-top))]">
              {topBar}
            </header>
          ) : null}
          <div className="mystic-login-stage">
            <div className={cn("mystic-auth-card mystic-login-panel", className)}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mystic-auth-page">
      <div className="mystic-shell px-[var(--spacing-page)] pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        {topBar ? <div className="mb-8">{topBar}</div> : null}
        {layout === "card" ? (
          <div className={cn("mystic-auth-card p-6 sm:p-8", className)}>
            {children}
          </div>
        ) : (
          <div className={cn("mystic-auth-content", className)}>{children}</div>
        )}
      </div>
    </div>
  );
}

type OnboardingShellProps = {
  children: ReactNode;
  topBar?: ReactNode;
  progress?: ReactNode;
};

export function OnboardingShell({
  children,
  topBar,
  progress,
}: OnboardingShellProps) {
  return (
    <div className="mystic-auth-page">
      <div className="mystic-shell space-y-5 px-[var(--spacing-page)] pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        {topBar}
        {progress}
        <div className="mystic-auth-card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
