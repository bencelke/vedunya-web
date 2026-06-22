/**
 * Copies production-relevant image assets from Mystic Flutter → vedunya-web.
 * Read-only on Flutter. Run: npx tsx scripts/migrate-flutter-assets.ts
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const FLUTTER_ROOT = path.resolve("C:/Users/1/development/mystic_app");
const WEB_ROOT = path.resolve("C:/Users/1/development/vedunya-web");

type CopyAction = "copied" | "skipped" | "already_existed" | "conflict";

type CopyRecord = {
  category: string;
  source: string;
  destination: string;
  fileType: string;
  action: CopyAction;
  reason: string;
  productionUsage: string;
};

const CANONICAL_RUNES = [
  "fehu", "uruz", "thurisaz", "ansuz", "raido", "kenaz", "gebo", "wunjo",
  "hagalaz", "nauthiz", "isa", "jera", "eihwaz", "perthro", "algiz", "sowilo",
  "tiwaz", "berkano", "ehwaz", "mannaz", "laguz", "ingwaz", "dagaz", "othala",
];

const COPY_PLAN: Array<{
  category: string;
  source: string;
  destination: string;
  productionUsage: string;
}> = [
  // Brand
  { category: "brand", source: "assets/logo/mystic_logo.svg", destination: "public/assets/brand/mystic-logo.svg", productionUsage: "mystic_logo.dart" },
  { category: "brand", source: "assets/logo/logo-white-svg.svg", destination: "public/assets/brand/mystic-logo-white.svg", productionUsage: "brand dark backgrounds" },
  { category: "brand", source: "assets/logo/google_g.svg", destination: "public/assets/brand/google-g.svg", productionUsage: "mystic_social_sign_in_block.dart" },
  { category: "brand", source: "assets/logo/icon-makosh-padded.png", destination: "public/assets/brand/icon-makosh-padded.png", productionUsage: "launch_splash_screen.dart, mobile_app_root.dart" },
  { category: "brand", source: "assets/logo/icon-foreground-rgba-1024.png", destination: "public/assets/brand/icon-foreground-rgba-1024.png", productionUsage: "mystic_logo.dart fallback" },
  { category: "brand", source: "assets/logo/loading_makosh.png", destination: "public/assets/brand/loading-makosh.png", productionUsage: "pubspec splash reference" },
  { category: "brand", source: "assets/logo/splash-screen.png", destination: "public/assets/brand/splash-screen.png", productionUsage: "native splash reference" },
  { category: "brand", source: "assets/app_icon/mystic_icon.svg", destination: "public/assets/brand/mystic-icon.svg", productionUsage: "app icon source" },
  // PWA / launcher icons
  { category: "icons", source: "assets/logo/icon-app-launcher-1024.png", destination: "public/icons/icon-app-launcher-1024.png", productionUsage: "flutter_launcher_icons" },
  { category: "icons", source: "assets/logo/icon-launcher-ios-1024.png", destination: "public/icons/icon-launcher-ios-1024.png", productionUsage: "flutter_launcher_icons iOS" },
  { category: "icons", source: "assets/logo/icon-foreground-rgba-1024.png", destination: "public/icons/icon-foreground-rgba-1024.png", productionUsage: "adaptive icon foreground" },
  // Backgrounds
  { category: "backgrounds", source: "assets/background/background-jpg.jpg", destination: "public/assets/backgrounds/app-background.jpg", productionUsage: "cosmic_tokens.dart, mystic_background.dart" },
  // Courses
  { category: "courses", source: "assets/Course Visuals/Rune 2 course/prozhivanie.png", destination: "public/assets/courses/living-the-runes/prozhivanie.png", productionUsage: "library_item.dart living-the-runes cover" },
  { category: "courses", source: "assets/Course Visuals/Basic Runes/Pervie Shagi Runi-100kb.jpg", destination: "public/assets/courses/runes-first-steps/cover.jpg", productionUsage: "library_item.dart runes-first-steps cover" },
  { category: "courses", source: "assets/moon/svg_moon/moon_full.png", destination: "public/assets/courses/lunar-path-30-days/cover.png", productionUsage: "library_item.dart lunar-path cover fallback" },
  // Moon phases
  ...[
    "moon_new.png",
    "moon_waxing_crescent.png",
    "moon_first_quarter.png",
    "moon_waxing_gibbous.png",
    "moon_full.png",
    "moon_waning_gibbous.png",
    "moon_waning_crescent.png",
  ].map((file) => ({
    category: "moon",
    source: `assets/moon/svg_moon/${file}`,
    destination: `public/assets/moon/phases/${file}`,
    productionUsage: "moon_asset_map.dart",
  })),
  // Rune SVGs
  ...CANONICAL_RUNES.map((runeId) => ({
    category: "runes",
    source: `assets/runes/svg/${runeId}.svg`,
    destination: `public/assets/runes/symbols/${runeId}.svg`,
    productionUsage: "rune_asset_map.dart",
  })),
];

function sha256(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function extOf(filePath: string): string {
  return path.extname(filePath).replace(".", "").toLowerCase();
}

function copyOne(entry: (typeof COPY_PLAN)[number]): CopyRecord {
  const srcAbs = path.join(FLUTTER_ROOT, entry.source);
  const dstAbs = path.join(WEB_ROOT, entry.destination);
  const fileType = extOf(entry.destination);

  if (!fs.existsSync(srcAbs)) {
    return {
      category: entry.category,
      source: entry.source,
      destination: entry.destination,
      fileType,
      action: "skipped",
      reason: "source missing in Flutter project",
      productionUsage: entry.productionUsage,
    };
  }

  fs.mkdirSync(path.dirname(dstAbs), { recursive: true });

  const srcHash = sha256(srcAbs);
  if (fs.existsSync(dstAbs)) {
    const dstHash = sha256(dstAbs);
    if (srcHash === dstHash) {
      return {
        category: entry.category,
        source: entry.source,
        destination: entry.destination,
        fileType,
        action: "already_existed",
        reason: "identical file already present",
        productionUsage: entry.productionUsage,
      };
    }
    return {
      category: entry.category,
      source: entry.source,
      destination: entry.destination,
      fileType,
      action: "conflict",
      reason: "destination exists with different content — not overwritten",
      productionUsage: entry.productionUsage,
    };
  }

  fs.copyFileSync(srcAbs, dstAbs);
  return {
    category: entry.category,
    source: entry.source,
    destination: entry.destination,
    fileType,
    action: "copied",
    reason: "copied from Flutter (source unchanged)",
    productionUsage: entry.productionUsage,
  };
}

function discoverFlutterImages(): string[] {
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"]);
  const excludedDirs = [
    path.join(FLUTTER_ROOT, "assets", "fonts"),
    path.join(FLUTTER_ROOT, "build"),
    path.join(FLUTTER_ROOT, ".dart_tool"),
  ];
  const results: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    if (excludedDirs.some((ex) => dir.startsWith(ex))) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (allowed.has(ext)) {
        results.push(full.replace(FLUTTER_ROOT + path.sep, "").replace(/\\/g, "/"));
      }
    }
  }

  walk(path.join(FLUTTER_ROOT, "assets"));
  return results;
}

function main() {
  const records = COPY_PLAN.map(copyOne);
  const discovered = discoverFlutterImages();

  const summary = {
    discoveredInFlutterAssets: discovered.length,
    copied: records.filter((r) => r.action === "copied").length,
    skipped: records.filter((r) => r.action === "skipped").length,
    alreadyExisted: records.filter((r) => r.action === "already_existed").length,
    conflicts: records.filter((r) => r.action === "conflict").length,
    records,
    excludedFolders: [
      "assets/fonts/",
      "assets/cards/",
      "assets/design_reference/",
      "assets/Screnshots/",
      "assets/orb/",
      "assets/runes/*.svg (legacy root spellings)",
      "assets/moon/*.png (non-canonical experimental)",
      "build/, .dart_tool/, ios/Pods/, android/.gradle/",
    ],
  };

  const reportPath = path.join(
    WEB_ROOT,
    "docs/migration/full-asset-migration-report.json",
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: summary.conflicts === 0,
        discoveredInFlutterAssets: summary.discoveredInFlutterAssets,
        copied: summary.copied,
        skipped: summary.skipped,
        alreadyExisted: summary.alreadyExisted,
        conflicts: summary.conflicts,
        reportPath,
      },
      null,
      2,
    ),
  );

  if (summary.conflicts > 0) process.exit(1);
}

main();
