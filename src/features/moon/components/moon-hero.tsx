import { MoonPhaseVisual } from "@/features/moon/components/moon-phase-visual";
import type { MoonGuidanceResult } from "@/features/moon/types/moon";

type MoonHeroProps = {
  guidance: MoonGuidanceResult;
  rhythmLabel: string;
  lunarDayLabel: string;
  phaseVisualAlt: string;
};

export function MoonHero({
  guidance,
  rhythmLabel,
  lunarDayLabel,
  phaseVisualAlt,
}: MoonHeroProps) {
  return (
    <header className="space-y-6 text-center">
      <p className="mystic-eyebrow">{rhythmLabel}</p>
      <div className="flex justify-center">
        <MoonPhaseVisual
          phase4Id={guidance.calculation.phaseId}
          phase8Id={guidance.calculation.phase8Id}
          alt={phaseVisualAlt}
          size={200}
          className="sm:!h-[14rem] sm:!w-[14rem]"
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight text-text-primary sm:text-[1.75rem]">
          {guidance.phase.title}
        </h1>
        <p className="text-sm text-text-subtle">{lunarDayLabel}</p>
      </div>
    </header>
  );
}
