import type { MetadataRoute } from "next";

import { pwaConfig } from "@/config/pwa";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: pwaConfig.name,
    short_name: pwaConfig.shortName,
    description: pwaConfig.description,
    start_url: pwaConfig.startUrl,
    scope: pwaConfig.scope,
    display: pwaConfig.display,
    orientation: pwaConfig.orientation,
    theme_color: pwaConfig.themeColor,
    background_color: pwaConfig.backgroundColor,
    categories: [...pwaConfig.categories],
    lang: pwaConfig.lang,
    dir: pwaConfig.dir,
    icons: [
      {
        src: pwaConfig.icons.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: pwaConfig.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: pwaConfig.icons.icon512Maskable,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
