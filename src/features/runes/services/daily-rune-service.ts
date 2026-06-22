import { getRuneAssetPath } from "@/features/runes/constants/rune-assets";
import {
  buildDailyRuneContent,
  selectDailyRune,
} from "@/features/runes/engine/select-daily-rune";
import type {
  DailyRuneResult,
  DailyRuneSelectionInput,
} from "@/features/runes/types/rune";

export function buildDailyRuneResult(
  input: DailyRuneSelectionInput,
): DailyRuneResult {
  const selection = selectDailyRune(input);
  const content = buildDailyRuneContent({ ...input, selection });

  return {
    selection,
    content,
    assetPath: getRuneAssetPath(selection.runeId),
  };
}
