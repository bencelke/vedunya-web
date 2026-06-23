import { cn } from "@/lib/utils";

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

/** Flutter-style progress dots — active dot is slightly wider. */
export function OnboardingProgress({
  currentStep,
  totalSteps,
  className,
}: OnboardingProgressProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={totalSteps - 1}
      aria-valuenow={currentStep}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const active = index === currentStep;

        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "h-[5px] rounded-full transition-all duration-300",
              active
                ? "w-[7px] bg-auth-text-primary/88"
                : "w-[5px] bg-auth-border/55",
            )}
          />
        );
      })}
    </div>
  );
}
