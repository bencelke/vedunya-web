# Rune Asset Map — Mystic → Vedunya Web

All assets **copied** from Flutter (never moved). Source: `mystic_app/assets/runes/svg/`.

| Canonical ID | Flutter source | Web destination | Format | Alias notes |
|--------------|----------------|-----------------|--------|-------------|
| fehu | `assets/runes/svg/fehu.svg` | `/assets/runes/symbols/fehu.svg` | SVG | — |
| uruz | `assets/runes/svg/uruz.svg` | `/assets/runes/symbols/uruz.svg` | SVG | — |
| thurisaz | `assets/runes/svg/thurisaz.svg` | `/assets/runes/symbols/thurisaz.svg` | SVG | `turisaz` alias |
| ansuz | `assets/runes/svg/ansuz.svg` | `/assets/runes/symbols/ansuz.svg` | SVG | — |
| raido | `assets/runes/svg/raido.svg` | `/assets/runes/symbols/raido.svg` | SVG | **`raidho` is alias only** |
| kenaz | `assets/runes/svg/kenaz.svg` | `/assets/runes/symbols/kenaz.svg` | SVG | `kano` alias |
| gebo | `assets/runes/svg/gebo.svg` | `/assets/runes/symbols/gebo.svg` | SVG | — |
| wunjo | `assets/runes/svg/wunjo.svg` | `/assets/runes/symbols/wunjo.svg` | SVG | — |
| hagalaz | `assets/runes/svg/hagalaz.svg` | `/assets/runes/symbols/hagalaz.svg` | SVG | — |
| nauthiz | `assets/runes/svg/nauthiz.svg` | `/assets/runes/symbols/nauthiz.svg` | SVG | `nautiz` alias |
| isa | `assets/runes/svg/isa.svg` | `/assets/runes/symbols/isa.svg` | SVG | — |
| jera | `assets/runes/svg/jera.svg` | `/assets/runes/symbols/jera.svg` | SVG | — |
| eihwaz | `assets/runes/svg/eihwaz.svg` | `/assets/runes/symbols/eihwaz.svg` | SVG | `eiwaz` alias |
| perthro | `assets/runes/svg/perthro.svg` | `/assets/runes/symbols/perthro.svg` | SVG | `pertha` alias |
| algiz | `assets/runes/svg/algiz.svg` | `/assets/runes/symbols/algiz.svg` | SVG | — |
| sowilo | `assets/runes/svg/sowilo.svg` | `/assets/runes/symbols/sowilo.svg` | SVG | `sowulo` alias |
| tiwaz | `assets/runes/svg/tiwaz.svg` | `/assets/runes/symbols/tiwaz.svg` | SVG | — |
| berkano | `assets/runes/svg/berkano.svg` | `/assets/runes/symbols/berkano.svg` | SVG | `berkana` alias |
| ehwaz | `assets/runes/svg/ehwaz.svg` | `/assets/runes/symbols/ehwaz.svg` | SVG | — |
| mannaz | `assets/runes/svg/mannaz.svg` | `/assets/runes/symbols/mannaz.svg` | SVG | — |
| laguz | `assets/runes/svg/laguz.svg` | `/assets/runes/symbols/laguz.svg` | SVG | — |
| ingwaz | `assets/runes/svg/ingwaz.svg` | `/assets/runes/symbols/ingwaz.svg` | SVG | — |
| dagaz | `assets/runes/svg/dagaz.svg` | `/assets/runes/symbols/dagaz.svg` | SVG | — |
| othala | `assets/runes/svg/othala.svg` | `/assets/runes/symbols/othala.svg` | SVG | — |

## Screens

- Today daily rune card (`DailyRuneCard`)
- Rune detail page (`RuneSymbol`, 120px)
- Optional Unicode glyph fallback in `RuneSymbol` when SVG fails

## Optimization

None applied — SVGs copied as-is from Mystic production assets.

## Excluded

- Course cover assets
- Card assets
- Font files
- Background textures (not used in Today/detail MVP)
- Legacy PNG spellings (`Raidho.svg`, etc.)
