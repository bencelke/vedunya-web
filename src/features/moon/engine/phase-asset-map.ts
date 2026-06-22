import type {
  MoonPhase4Id,
  MoonPhase8Id,
} from "@/features/moon/types/moon";

export type MoonPhaseArtDescriptor = {
  assetPath: string;
  flipHorizontally: boolean;
};

const PHASE_DIR = "/assets/moon/phases";

export function moonPhaseArtForPhase8(phase8Id: MoonPhase8Id): MoonPhaseArtDescriptor {
  switch (phase8Id) {
    case "new_moon":
      return { assetPath: `${PHASE_DIR}/moon_new.png`, flipHorizontally: false };
    case "waxing_crescent":
      return {
        assetPath: `${PHASE_DIR}/moon_waxing_crescent.png`,
        flipHorizontally: false,
      };
    case "first_quarter":
      return {
        assetPath: `${PHASE_DIR}/moon_first_quarter.png`,
        flipHorizontally: false,
      };
    case "waxing_gibbous":
      return {
        assetPath: `${PHASE_DIR}/moon_waxing_gibbous.png`,
        flipHorizontally: false,
      };
    case "full_moon":
      return { assetPath: `${PHASE_DIR}/moon_full.png`, flipHorizontally: false };
    case "waning_gibbous":
      return {
        assetPath: `${PHASE_DIR}/moon_waning_gibbous.png`,
        flipHorizontally: false,
      };
    case "last_quarter":
      return {
        assetPath: `${PHASE_DIR}/moon_first_quarter.png`,
        flipHorizontally: true,
      };
    case "waning_crescent":
      return {
        assetPath: `${PHASE_DIR}/moon_waning_crescent.png`,
        flipHorizontally: false,
      };
    default:
      return moonPhaseArtFallbackForPhase4(
        mapPhase8ToPhase4(phase8Id as MoonPhase8Id),
      );
  }
}

export function moonPhaseArtFallbackForPhase4(
  phase4Id: MoonPhase4Id,
): MoonPhaseArtDescriptor {
  switch (phase4Id) {
    case "new_moon":
      return { assetPath: `${PHASE_DIR}/moon_new.png`, flipHorizontally: false };
    case "waxing":
      return {
        assetPath: `${PHASE_DIR}/moon_waxing_crescent.png`,
        flipHorizontally: false,
      };
    case "full_moon":
      return { assetPath: `${PHASE_DIR}/moon_full.png`, flipHorizontally: false };
    case "waning":
      return {
        assetPath: `${PHASE_DIR}/moon_waning_crescent.png`,
        flipHorizontally: false,
      };
    default:
      return { assetPath: `${PHASE_DIR}/moon_full.png`, flipHorizontally: false };
  }
}

export function moonPhaseArtDescriptor(input: {
  phase8Id?: MoonPhase8Id | null;
  phase4Id: MoonPhase4Id;
}): MoonPhaseArtDescriptor {
  const phase8 = input.phase8Id?.trim();
  if (phase8) {
    return moonPhaseArtForPhase8(phase8 as MoonPhase8Id);
  }
  return moonPhaseArtFallbackForPhase4(input.phase4Id);
}

export function mapPhase8ToPhase4(phase8Id: MoonPhase8Id): MoonPhase4Id {
  switch (phase8Id) {
    case "new_moon":
      return "new_moon";
    case "waxing_crescent":
    case "first_quarter":
    case "waxing_gibbous":
      return "waxing";
    case "full_moon":
      return "full_moon";
    case "waning_gibbous":
    case "last_quarter":
    case "waning_crescent":
    default:
      return "waning";
  }
}
