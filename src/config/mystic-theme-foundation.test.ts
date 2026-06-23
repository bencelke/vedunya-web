import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { mysticAssets, mysticBrandAssetPaths } from "@/config/mysticAssets";
import { mysticCssVars, mysticFlutterRefs, mysticTheme } from "@/config/mysticTheme";
import { mysticTheme as themeFacade } from "@/config/theme";
import { MysticButton } from "@/components/ui/MysticButton";
import { MysticCard } from "@/components/ui/MysticCard";
import { MysticInput } from "@/components/ui/MysticInput";

const WEB_ROOT = process.cwd();
const PUBLIC = resolve(WEB_ROOT, "public");

function publicAssetExists(relativePath: string): boolean {
  return existsSync(resolve(PUBLIC, relativePath.replace(/^\//, "")));
}

describe("Mystic theme foundation", () => {
  it("exports required CSS variable token names", () => {
    expect(mysticCssVars.brand.gold).toBe("--mystic-gold");
    expect(mysticCssVars.auth.bg).toBe("--auth-bg");
    expect(mysticCssVars.app.bg).toBe("--app-bg");
    expect(mysticCssVars.chrome.glass).toBe("--chrome-glass");
    expect(mysticCssVars.shape.todayMaxWidth).toBe("--today-max-width");
    expect(mysticCssVars.effects.glowGold).toBe("--glow-gold");
  });

  it("defines Flutter-aligned reference values", () => {
    expect(mysticFlutterRefs.appColors.mutedGold).toBe("#B89B5E");
    expect(mysticFlutterRefs.cosmicTokens.voidDeep).toBe("#0B0D14");
    expect(mysticFlutterRefs.cosmicTokens.goldGlow).toBe("#C4A86A");
    expect(mysticFlutterRefs.layout.todayMaxWidth).toBe("420px");
    expect(mysticFlutterRefs.chrome.navBlurPx).toBe(20);
  });

  it("exports layout utility class names", () => {
    expect(mysticTheme.layout.authPageClass).toBe("mystic-auth-page");
    expect(mysticTheme.layout.appPageClass).toBe("mystic-app-page");
    expect(mysticTheme.layout.chromeNavClass).toBe("mystic-chrome-nav");
    expect(mysticTheme.layout.todayClass).toBe("mystic-today-column");
  });

  it("keeps legacy theme facade palettes separate", () => {
    expect(themeFacade.auth.pageBg).not.toBe(themeFacade.app.pageBg);
    expect(themeFacade.auth.accentGold).toBe("#B89B5E");
    expect(themeFacade.app.accentGold).toBe("#C4A86A");
  });
});

describe("Mystic theme CSS variables", () => {
  const css = readFileSync(
    resolve(WEB_ROOT, "src/styles/mystic-theme.css"),
    "utf8",
  );

  const requiredVars = [
    "--mystic-gold",
    "--mystic-void",
    "--mystic-parchment",
    "--auth-bg",
    "--auth-gold",
    "--app-bg",
    "--app-glass",
    "--chrome-glass",
    "--chrome-blur",
    "--nav-active",
    "--nav-inactive",
    "--radius-pill",
    "--content-max-width",
    "--today-max-width",
    "--shadow-card",
    "--glow-gold",
  ];

  it.each(requiredVars)("declares %s in mystic-theme.css", (token) => {
    expect(css).toContain(token);
  });
});

describe("Mystic asset constants", () => {
  it("points brand assets to existing public files", () => {
    for (const assetPath of mysticBrandAssetPaths) {
      expect(publicAssetExists(assetPath)).toBe(true);
    }
  });

  it("points core backgrounds and moon phases to existing files", () => {
    expect(publicAssetExists(mysticAssets.backgrounds.appStarfield)).toBe(true);
    expect(publicAssetExists(mysticAssets.moon.new)).toBe(true);
    expect(publicAssetExists(mysticAssets.moon.full)).toBe(true);
  });

  it("keeps rune symbols directory", () => {
    expect(
      existsSync(resolve(PUBLIC, "assets/runes/symbols")),
    ).toBe(true);
  });
});

describe("Mystic shared UI primitives", () => {
  it("exports Mystic* component entry points", () => {
    expect(MysticButton).toBeTruthy();
    expect(MysticCard).toBeTypeOf("function");
    expect(MysticInput).toBeTruthy();
  });

  it("exports client shell primitives from MysticShell module source", () => {
    const source = readFileSync(
      resolve(WEB_ROOT, "src/components/ui/MysticShell.tsx"),
      "utf8",
    );
    expect(source).toContain("AppShell");
    expect(source).toContain("AuthShell");
  });

  it("exports bottom nav from MysticBottomNav module source", () => {
    const source = readFileSync(
      resolve(WEB_ROOT, "src/components/ui/MysticBottomNav.tsx"),
      "utf8",
    );
    expect(source).toContain("MysticBottomNav");
  });

  it("keeps auth shell free of Firebase imports", () => {
    const source = readFileSync(
      resolve(WEB_ROOT, "src/components/ui/auth-shell.tsx"),
      "utf8",
    );
    expect(source).not.toContain("firebase");
    expect(source).toContain("mystic-auth-page");
  });

  it("keeps app shell as a layout wrapper without data fetching", () => {
    const source = readFileSync(
      resolve(WEB_ROOT, "src/components/layout/app-shell.tsx"),
      "utf8",
    );
    expect(source).toContain("mystic-app-page");
    expect(source).toContain("mystic-app-canvas");
    expect(source).not.toContain("getFirestore");
  });
});

describe("Mystic logo variants", () => {
  it("maps dark and light variants to brand SVG assets", () => {
    const source = readFileSync(
      resolve(WEB_ROOT, "src/components/brand/mystic-logo.tsx"),
      "utf8",
    );
    expect(source).toContain("mysticAssets.brand.mysticLogo");
    expect(source).toContain("mysticAssets.brand.mysticLogoWhite");
  });
});
