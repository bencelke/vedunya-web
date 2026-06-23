import { Link } from "@/i18n/navigation";

import { MysticRuneSigil } from "@/features/runes/components/mystic-rune-sigil";
import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceRuneSection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

type TodayRuneAnchorProps = {
  rune: DailyGuidanceRuneSection;
  label: string;
  viewDetailsLabel: string;
  symbolAlt: string;
};

export function TodayRuneAnchor({
  rune,
  label,
  viewDetailsLabel,
  symbolAlt,
}: TodayRuneAnchorProps) {
  if (!isGuidanceReady(rune)) {
    return <SectionUnavailable label={label} message={rune.message} />;
  }

  const data = rune.data;

  return (
    <section className="space-y-5 py-2 text-center">
      <p className="mystic-eyebrow">{label}</p>
      <div className="flex justify-center">
        <MysticRuneSigil
          runeId={data.runeId as CanonicalRuneId}
          alt={symbolAlt}
          size={168}
          className="!h-[10.5rem] !w-[10.5rem] sm:!h-[13.5rem] sm:!w-[13.5rem]"
        />
      </div>
      <div className="mx-auto max-w-[22rem] space-y-3">
        <h2 className="text-xl font-medium tracking-tight text-text-primary sm:text-2xl">
          {data.title}
        </h2>
        <p className="text-sm leading-[1.72] text-text-muted">{data.summary}</p>
        <Link
          href={data.href}
          className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
        >
          {viewDetailsLabel}
        </Link>
      </div>
    </section>
  );
}
