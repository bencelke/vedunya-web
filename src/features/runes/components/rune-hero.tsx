import { MysticRuneSigil } from "@/features/runes/components/mystic-rune-sigil";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

type RuneHeroProps = {
  runeId: CanonicalRuneId;
  title: string;
  subtitle: string;
  symbolAlt: string;
};

export function RuneHero({
  runeId,
  title,
  subtitle,
  symbolAlt,
}: RuneHeroProps) {
  return (
    <header className="space-y-5 py-2 text-center">
      <p className="mystic-eyebrow">{subtitle}</p>
      <div className="flex justify-center">
        <MysticRuneSigil
          runeId={runeId}
          alt={symbolAlt}
          size={168}
          className="!h-[10.5rem] !w-[10.5rem] sm:!h-[13.5rem] sm:!w-[13.5rem]"
        />
      </div>
      <h1 className="text-2xl font-medium tracking-tight text-text-primary sm:text-[1.75rem]">
        {title}
      </h1>
    </header>
  );
}
