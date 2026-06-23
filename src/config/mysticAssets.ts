/**
 * Mystic production asset paths (migrated from Flutter).
 * Single source of truth — do not hardcode these paths in components.
 */
export const mysticAssets = {
  brand: {
    mysticLogo: "/assets/brand/mystic-logo.svg",
    mysticLogoWhite: "/assets/brand/mystic-logo-white.svg",
    mysticIcon: "/assets/brand/mystic-icon.svg",
    makoshEmblem: "/assets/brand/icon-makosh-padded.png",
    vedunyaMark: "/assets/brand/vedunya-mark.svg",
    googleIcon: "/assets/brand/google-g.svg",
    splashScreen: "/assets/brand/splash-screen.png",
    loadingMakosh: "/assets/brand/loading-makosh.png",
  },
  backgrounds: {
    appStarfield: "/assets/backgrounds/app-background.jpg",
  },
  moon: {
    phasesDir: "/assets/moon/phases",
    new: "/assets/moon/phases/moon_new.png",
    waxingCrescent: "/assets/moon/phases/moon_waxing_crescent.png",
    firstQuarter: "/assets/moon/phases/moon_first_quarter.png",
    waxingGibbous: "/assets/moon/phases/moon_waxing_gibbous.png",
    full: "/assets/moon/phases/moon_full.png",
    waningGibbous: "/assets/moon/phases/moon_waning_gibbous.png",
    waningCrescent: "/assets/moon/phases/moon_waning_crescent.png",
  },
  runes: {
    symbolsDir: "/assets/runes/symbols",
  },
  courses: {
    livingTheRunesCover: "/assets/courses/living-the-runes/prozhivanie.png",
  },
} as const;

export type MysticAssets = typeof mysticAssets;

/** All brand asset paths as a flat array (for existence tests). */
export const mysticBrandAssetPaths = Object.values(mysticAssets.brand);
