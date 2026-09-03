# EcoDomček — client project (brief + art direction stage)

Redesign of `https://ecodomcek.sk` as a scroll-driven walk through a modelled
EcoDomček house, each room a sub-page. This folder holds the brief, the art
direction and its boards; the build lives in its own repository from
`codera-starter` (process §8).

| File | What it is |
| --- | --- |
| `PLAN.md` | Design DNA, decision-engine run, the concept (rooms → routes), Matterport translation, engine and rendering tiers, reference map, phases, risks, client questions |
| `CONTENT_INVENTORY.md` | Every page of the live site, verbatim Slovak copy, facts, assets, issues |
| `ART_DIRECTION.md` | Tokens (canvas, materials, type, spacing, radius), components, imagery, motion, mobile, the held frames and their review |
| `boards/` | The held frames: a three.js wooden-model study of the vzorový dom + the DOM layer, captured to `boards/out/*.png` with `npm run capture:ecodomcek` |

Reference records harvested for this brief (verdict PENDING until Ondrej
calibrates them): `CODERA_DESIGN_REFERENCES/records/{raus, aspelin-reitan,
manna, 70materia, planpoint, moving-parts, scale, lightship}.md`.

## Boards

| Capture | Board |
| --- | --- |
| `out/hero-desktop.png`, `out/hero-mobile.png` | 01 Príjazd — the model in morning light, headline, CTA, benefit band |
| `out/living-desktop.png`, `out/living-mobile.png` | 03 Obývačka — a room holding a copy cell and two plates |
| `out/xray-desktop.png` | 04 Technológia — the diffusion-open wall exploded, mono labels |
| `out/dollhouse-desktop.png` | 07 Realizácie — roof lifted, the model as an object, real projects as plates |
| `out/dusk-desktop.png`, `out/dusk-mobile.png` | 08 Kontakt — the one dark act, windows lit, contact panel on snow |

Open `boards/index.html?board=<hero|living|xray|dollhouse|dusk>&device=<desktop|mobile>`
over any static server (the capture script starts one) to view a board live.
