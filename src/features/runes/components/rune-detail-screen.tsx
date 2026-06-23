import { Link } from "@/i18n/navigation";
import { RuneDetailContent } from "@/features/runes/components/rune-detail-content";
import { RuneErrorState } from "@/features/runes/components/rune-error-state";
import { RuneHero } from "@/features/runes/components/rune-hero";
import type { RuneDetailLoadResult } from "@/features/runes/types/rune";

type RuneDetailScreenProps = {
  loaded: RuneDetailLoadResult;
  backLabel: string;
  focusLabel: string;
  symbolAlt: string;
};

export function RuneDetailScreen({
  loaded,
  backLabel,
  focusLabel,
  symbolAlt,
}: RuneDetailScreenProps) {
  return (
    <>
      <Link
        href="/today"
        className="mb-6 inline-flex min-h-11 items-center text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
      >
        {backLabel}
      </Link>

      {loaded.status === "ready" ? (
        <div className="space-y-6">
          <RuneHero
            runeId={loaded.detail.runeId}
            title={loaded.detail.content.title}
            subtitle={focusLabel}
            symbolAlt={symbolAlt}
          />
          <RuneDetailContent detail={loaded.detail} />
        </div>
      ) : (
        <RuneErrorState />
      )}
    </>
  );
}
