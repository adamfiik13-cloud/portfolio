# Self-hosted typography

These files are repository assets consumed by `next/font/local` in `app/layout.tsx`.
No runtime package, download script, or network access is required to build them.
All fonts use SIL Open Font License 1.1; the full upstream notices accompany them.

| Local file | Real style/weight | Source |
| --- | --- | --- |
| `LeagueSpartan-Variable.woff2` | Normal, variable 100–900 | [The League of Moveable Type](https://github.com/theleagueof/league-spartan/tree/27341b9bf93a2c7faa140538a64ce342486c5fb5), `fonts/variable/LeagueSpartan[wght].ttf` |
| `Alata-Regular.woff2` | Normal, static 400 | [Sorkin Type](https://github.com/SorkinType/Alata/tree/3b051d2a6181deba154717cfd6be409effe32ffa), `fonts/webfonts/Alata-Regular.woff2` |
| `SourceSans3-Variable.woff2` | Normal, variable 200–900 | [Adobe](https://github.com/adobe-fonts/source-sans/tree/87b37a2daaed80fcb8e8ccb0085c4d72ddade12e), `WOFF2/VF/SourceSans3VF-Upright.ttf.woff2` |
| `SourceSans3-Italic-Variable.woff2` | Genuine italic, variable 200–900 | Same Adobe commit, `WOFF2/VF/SourceSans3VF-Italic.ttf.woff2` |

## Acquisition and conversion

Files and licenses were obtained directly from the pinned official repositories above via `raw.githubusercontent.com`. Alata and both Source Sans 3 files are byte-for-byte upstream WOFF2 assets (renamed locally for clarity). League Spartan's pinned repository provides variable TTF and static WOFF2, so its variable TTF was converted once using fontTools 4.66.0 and Brotli 1.2.0:

```python
from fontTools.ttLib import TTFont
font = TTFont("LeagueSpartan[wght].ttf")
font.flavor = "woff2"
font.save("LeagueSpartan-Variable.woff2")
```

No subsetting, outline editing, glyph removal, or weight instancing was performed. The TTF input and conversion tools were kept in a temporary directory, not added to the application dependencies or repository. Font metadata verified with fontTools confirms the weight axes and styles listed above. The internal upstream League Spartan family name includes “Thin”; its `wght` axis is genuinely 100–900, not a single thin face.

## Licenses

- `LeagueSpartan-OFL.txt`: copyright 2020 The League Spartan Project Authors.
- `Alata-OFL.txt`: copyright 2024 The Alata Project Authors.
- `SourceSans3-OFL.md`: copyright 2010–2024 Adobe; reserved font name “Source”. Both Source Sans 3 binaries are unmodified upstream files.

## Integrity

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| Alata-Regular.woff2 | 98,740 | `bfe0d753ca3f65b1e5cd47ded884621dc922d04114a0778d59da1270acf3ba61` |
| LeagueSpartan-Variable.woff2 | 41,064 | `6fa734cad4562e16fd4a890489c0f1b2bd7ea01725ed7c8b41aa773f8d697335` |
| SourceSans3-Variable.woff2 | 170,188 | `5f16566f7a40d39b339ad26be151fa5a1ab1f0c2574c7a2e619765584a1acbd8` |
| SourceSans3-Italic-Variable.woff2 | 137,996 | `b4959abc0569392f87c6c6ac612f90e3fe0104d283724189b7d8b6f61af347d3` |

Total bundled font binaries: 447,988 bytes (~438 KiB). Primary preloads total 139,804 bytes (~137 KiB); UI faces are not preloaded. Both UI faces currently have actual use in the page, so `preload: false` does not mean they will never be requested.

## Semantic roles and loading

- League Spartan → `--font-display`: headings, short emphasis, project names, metrics, buttons, and badges.
- Alata → `--font-brand-body`: marketing navigation, body, summaries, and footer; always regular 400/normal.
- Source Sans 3 → `--font-ui`: long-form modal content, contact values, functional specimens, and the existing italic quotations.
- Aliases: `--font-heading`, `--font-body`, `--font-interface`, `--font-longform`.
- Only League Spartan and Alata are preloaded. Source Sans 3 uses `preload: false`.
- Global `font-synthesis: none` prevents faux bold/italic. Strong text explicitly selects the display or UI family; mobile navigation explicitly stays Alata regular.
- Genuine Source Sans 3 italic is included because the existing Approach quotation and case-study insight already use italic. No Alata italic/bold or League Spartan italic is bundled.
- When application route layouts are introduced, move UI-font ownership into the appropriate layouts where practical; public long-form content must still load the faces it actually uses.
