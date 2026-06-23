/**
 * Mystic theme facade — re-exports canonical tokens with legacy flat accessors.
 * Prefer mysticTheme.ts + mysticAssets.ts + mystic-theme.css for new code.
 */
import { mysticAssets } from "@/config/mysticAssets";
import {
  mysticCssVars,
  mysticFlutterRefs,
  mysticTheme as coreMysticTheme,
  type MysticTheme as CoreMysticTheme,
} from "@/config/mysticTheme";

export { mysticAssets, mysticCssVars, mysticFlutterRefs };
export type MysticTheme = CoreMysticTheme;

const { appColors, cosmicTokens } = mysticFlutterRefs;

/** Flat asset paths for components that predate mysticAssets.ts grouping. */
const legacyAssets = {
  mysticLogo: mysticAssets.brand.mysticLogo,
  mysticLogoWhite: mysticAssets.brand.mysticLogoWhite,
  mysticIcon: mysticAssets.brand.mysticIcon,
  makoshEmblem: mysticAssets.brand.makoshEmblem,
  vedunyaMark: mysticAssets.brand.vedunyaMark,
  googleIcon: mysticAssets.brand.googleIcon,
  appBackground: mysticAssets.backgrounds.appStarfield,
} as const;

export const mysticTheme = {
  ...coreMysticTheme,
  assets: {
    ...mysticAssets,
    ...legacyAssets,
  },
  app: {
    pageBg: cosmicTokens.voidDeep,
    surfacePrimary: "#12182a",
    surfaceElevated: "#1a2238",
    textPrimary: cosmicTokens.textGoldHero,
    textMuted: cosmicTokens.parchment,
    textSubtle: cosmicTokens.textGoldWhisper,
    accentGold: cosmicTokens.goldGlow,
    accentViolet: "#2d1f3d",
    radiusCard: mysticFlutterRefs.radii.md,
    bottomNavHeight: mysticFlutterRefs.layout.bottomNavHeight,
    maxContentWidth: mysticFlutterRefs.layout.shellMaxWidth,
    maxReadingWidth: "36rem",
  },
  auth: {
    pageBg: appColors.background,
    surface: appColors.background,
    surfaceMuted: appColors.surfaceIvory,
    textPrimary: appColors.textPrimary,
    textMuted: "#444444",
    textSubtle: "#8a7f72",
    border: appColors.border,
    accentGold: appColors.mutedGold,
    accentGoldSoft: "rgba(184, 155, 94, 0.12)",
    shadow: "0 24px 48px -28px rgba(0, 0, 0, 0.08)",
    radiusCard: mysticFlutterRefs.radii.lg,
  },
} as const;
