/**
 * Mystic design tokens — mapped from Flutter AppColors, CosmicTokens, MysticChromeTokens.
 * Runtime styling uses CSS variables in src/styles/mystic-theme.css.
 */
import { mysticAssets } from "@/config/mysticAssets";

export const mysticCssVars = {
  brand: {
    gold: "--mystic-gold",
    goldSoft: "--mystic-gold-soft",
    goldDeep: "--mystic-gold-deep",
    void: "--mystic-void",
    parchment: "--mystic-parchment",
    ivory: "--mystic-ivory",
    ink: "--mystic-ink",
  },
  auth: {
    bg: "--auth-bg",
    card: "--auth-card",
    text: "--auth-text",
    muted: "--auth-muted",
    border: "--auth-border",
    gold: "--auth-gold",
  },
  app: {
    bg: "--app-bg",
    surface: "--app-surface",
    surfaceElevated: "--app-surface-elevated",
    text: "--app-text",
    muted: "--app-muted",
    border: "--app-border",
    glass: "--app-glass",
  },
  chrome: {
    glass: "--chrome-glass",
    border: "--chrome-border",
    blur: "--chrome-blur",
    navActive: "--nav-active",
    navInactive: "--nav-inactive",
  },
  shape: {
    radiusSm: "--radius-sm",
    radiusMd: "--radius-md",
    radiusLg: "--radius-lg",
    radiusXl: "--radius-xl",
    radiusPill: "--radius-pill",
    contentPadding: "--content-mobile-padding",
    contentMaxWidth: "--content-max-width",
    todayMaxWidth: "--today-max-width",
  },
  effects: {
    shadowSoft: "--shadow-soft",
    shadowCard: "--shadow-card",
    shadowGold: "--shadow-gold",
    glowGold: "--glow-gold",
  },
} as const;

/** Flutter source reference values (for tests and documentation). */
export const mysticFlutterRefs = {
  appColors: {
    background: "#FFFFFF",
    mutedGold: "#B89B5E",
    textPrimary: "#000000",
    surfaceIvory: "#F8F6F0",
    surfaceCream: "#F5F1E8",
    border: "#E5E5E5",
  },
  cosmicTokens: {
    voidDeep: "#0B0D14",
    goldGlow: "#C4A86A",
    parchment: "#F3EDE3",
    textGoldHero: "#FAF6EC",
    textGoldLabel: "#C4B090",
    textGoldWhisper: "#A89878",
  },
  chrome: {
    surfaceGlass: "rgba(12, 16, 24, 0.784)",
    iconMuted: "#6B6458",
    dividerSoft: "rgba(196, 168, 106, 0.2)",
    navBlurPx: 20,
  },
  radii: {
    sm: "12px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    pill: "9999px",
  },
  layout: {
    todayMaxWidth: "420px",
    shellMaxWidth: "512px",
    bottomNavHeight: "72px",
  },
} as const;

export const mysticTheme = {
  assets: mysticAssets,
  cssVars: mysticCssVars,
  flutterRefs: mysticFlutterRefs,
  typography: {
    eyebrow: "text-[0.6875rem] font-semibold uppercase tracking-[0.16em]",
    label: "text-xs font-medium uppercase tracking-[0.14em]",
    body: "text-sm leading-relaxed",
    title: "text-lg font-medium leading-snug",
    hero: "text-[1.875rem] font-medium leading-[1.15] tracking-tight",
  },
  layout: {
    shellClass: "mystic-shell",
    readingClass: "mystic-reading-column",
    todayClass: "mystic-today-column",
    authPageClass: "mystic-auth-page",
    authCardClass: "mystic-auth-card",
    appPageClass: "mystic-app-page",
    appCanvasClass: "mystic-app-canvas",
    chromeNavClass: "mystic-chrome-nav",
    chromeHeaderClass: "mystic-chrome-header",
    cosmicCardClass: "mystic-cosmic-card",
  },
} as const;

export type MysticTheme = typeof mysticTheme;
