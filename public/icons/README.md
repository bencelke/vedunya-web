# PWA icon placeholders

Replace these files with production PNG assets before launch:

| File | Size | Purpose |
| --- | --- | --- |
| `icon-192x192.png` | 192×192 | Home screen / install prompt |
| `icon-512x512.png` | 512×512 | Splash / high-resolution install |
| `apple-touch-icon.png` | 180×180 | iOS home screen |

Current `.placeholder.svg` files are neutral placeholders only. Update `public/manifest.webmanifest` to reference final PNG paths when assets are ready.
