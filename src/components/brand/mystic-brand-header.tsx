import { MysticLogo } from "@/components/brand/mystic-logo";
import { cn } from "@/lib/utils";

type MysticBrandHeaderProps = {
  wordmark: string;
  size?: "lg" | "md";
  showLogo?: boolean;
  showDivider?: boolean;
  className?: string;
};

export function MysticBrandHeader({
  wordmark,
  size = "md",
  showLogo = true,
  showDivider = false,
  className,
}: MysticBrandHeaderProps) {
  return (
    <div className={cn("mystic-brand-header flex flex-col items-center text-center", className)}>
      <p
        className={cn(
          "mystic-brand-wordmark font-medium uppercase text-auth-accent-gold",
          size === "lg"
            ? "text-[0.75rem] tracking-[0.2em]"
            : "text-[0.6875rem] tracking-[0.22em]",
        )}
        aria-hidden="true"
      >
        {wordmark}
      </p>
      {showLogo ? (
        <div className={size === "lg" ? "mt-5" : "mt-3"}>
          <MysticLogo showWordmark={false} size={size} />
        </div>
      ) : null}
      {showDivider ? <div className="mystic-auth-divider mt-6" aria-hidden="true" /> : null}
    </div>
  );
}
