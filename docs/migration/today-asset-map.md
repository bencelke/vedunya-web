# Today Asset Map

| Asset | Flutter source | Web destination | Format | Use |
|-------|----------------|-----------------|--------|-----|
| Brand mark | `assets/logo/mystic_logo.svg` | `/assets/brand/vedunya-mark.svg` | SVG | Today header |
| Moon phases | `assets/moon/*.png` | `/assets/moon/phases/` | PNG | Moon rhythm section (prior migration) |
| Rune symbols | `assets/runes/svg/*.svg` | `/assets/runes/symbols/` | SVG | Rune focus + preview (prior migration) |

## Excluded

- `assets/background/background-jpg.jpg` — would compete with near-black app shell
- Card of the Day artwork
- Social / feed imagery
- Course covers
- Font files
- Loading gnome PNG experiments
- 3D nav experiments

## Optimization

Brand SVG copied as-is. No lossy compression applied.
