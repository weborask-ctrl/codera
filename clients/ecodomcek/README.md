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
| `boards/` | The held frames: the DOM layer over a rendered plate, captured to `boards/out/*.png` with `npm run capture:ecodomcek -- --render` |
| `HIGGSFIELD.md` | The generation log: which Higgsfield model lifted which Cycles plate to a photograph, and which camera move came from which still |
| `frames.py` | Cuts the camera-move clips into the frame sequences `/ecodomcek` scrubs |
| `cycles/` | The Blender scene that renders those plates: `SPEC.md` is the contract, `python3 build.py --all --quality final` writes `boards/render/<board>-<device>.png` and its annotation anchors |

Reference records harvested for this brief (verdict PENDING until Ondrej
calibrates them): `CODERA_DESIGN_REFERENCES/records/{raus, aspelin-reitan,
manna, 70materia, planpoint, moving-parts, scale, lightship}.md`.

## The live page — `/ecodomcek`

`app/ecodomcek/page.tsx` → `components/concepts/ecodomcek.tsx`: the walk
through the house as a real route in the studio site (noindex until the
client signs it off). Six rooms, each a sticky stage that draws one frame of
a camera move for the scroll position; the copy enters, holds fully
readable, and leaves. Plates and sequences live in `public/demos/ecodomcek/`
and come from the Cycles scene via Higgsfield (`HIGGSFIELD.md`). The
boards below are the art-direction stage that preceded it.

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
Add `&render=1` to composite the Cycles plate under the DOM instead of the
three.js study, which is what the captures do.

## Making the plates

```
cd clients/ecodomcek/cycles
python3 build.py --board hero --device desktop --quality test     # ~8 s, 360×225
python3 build.py --all --quality final                            # the eight plates
python3 _stats.py ../boards/render/hero-desktop.png               # exposure read-out
node ../boards/capture.mjs --render                               # composite the boards
```

Blender runs as a Python module (`pip install bpy`, 5.0.1), CPU only, no
external assets — every material and every plant is procedural. The scene
modules (`materials`, `geometry`, `cladding`, `interior`, `environment`) each
run standalone and write their own test render to `cycles/_test/`.

The house is the **Vzorový dom**: the spatial skeleton of the Matterport tour
EcoDomček published, re-skinned in EcoDomček's own materials. It is a concept,
never a realised project, and every board that shows it says so.
