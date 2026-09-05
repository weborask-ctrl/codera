# EcoDomček — Higgsfield generation log (2026-09-05)

The plates on `/ecodomcek` are not raw Cycles renders: each Cycles plate
(`boards/render/*.png`, 1440×900 / 780×1688, 384–512 spp) was lifted to
photograph level with Higgsfield, then the camera moves were generated from
those stills. This file is the trace — which model, which reference, which
job — so every pixel on the page can be followed back to our own render.

Method, in one line: **our geometry, their light.** Every image-to-image
prompt opened with "exactly this house from exactly this camera position and
framing; keep the geometry, proportions, window positions … identical" and
only then asked for real larch grain, real glass, a real meadow, a real
forest edge and real morning/blue-hour light. The results kept the plan,
the cantilever box, the deck, the drive and the openings; what changed is
the material truth the Cycles scene could not reach in CPU time (meadow,
woodland, weathering, the sky).

## Stills — Nano Banana Pro (`nano_banana_pro`), 2K, image-to-image

| Page asset | Reference plate (media_id) | Job | Aspect |
| --- | --- | --- | --- |
| `hero.jpg` — 01 Príjazd | hero-desktop `80ee073e-…dfd12` | `9d27bdad-586a-405b-bb52-d2cba0f2b352` | 16:9 |
| `hero-mobile.jpg` — 01 on phones | hero-mobile `8b0f67de-…50248` | `37794dfc-c2e5-4d47-87d6-60c1036074b3` | 9:16 |
| `living.jpg` — 03 Obývačka | living-desktop `2d7ff8cd-…cfb3d` | `aae399c2-c541-4344-b64f-e3b372a170b4` | 16:9 |
| `wall.jpg` — 04 Technológia | xray-desktop `ea9013ad-…08538` | `daf60456-77ea-4fe1-9fed-6af2443d853d` | 16:9 |
| `model.jpg` — 05 Realizácie | dollhouse-desktop `08fbf1c7-…1cf39` | `c5b04c65-d366-4f69-afb7-41e23dfc372e` | 16:9 |
| `dusk.jpg` — 06 Kontakt | dusk-desktop `1ae07f05-…33bcb` | `47a00ebd-6ba6-4b8c-8345-21deee4ef3c6` | 16:9 |
| `cladding.jpg` — the material, close | hero-desktop (material reference) | `adb042df-bf46-415c-9ab5-385a2f7b9594` | 16:9 |
| `deck.jpg` — 02 Vstup | hero-desktop (material reference) | `49f31c8b-8353-45db-aa7c-53fa18a8eb9e` | 16:9 |

2 credits each. Exported from 2752×1536 to 2400 px wide JPEG q82 in
`public/demos/ecodomcek/`.

## Camera moves — MiniMax H3 (`minimax_h3`), 2K, 5 s, start_image = the still

| Sequence | Start frame (job above) | Job | Move |
| --- | --- | --- | --- |
| `seq/prijazd` | hero | `de25c661-039c-4d88-91e6-905a7986e827` | slow dolly forward along the drive, mist drifting |
| `seq/prijazd-m` | hero-mobile | `8d6731d2-282a-4b82-ad5f-675c3db00bd2` | the same, portrait |
| `seq/obyvacka` | living | `efa42678-c474-4740-be0f-d300d32bd216` | gimbal push-in toward the glazing |
| `seq/stena` | wall | `9e0a6dfb-d8d2-4dbb-a22d-ee20ad9d7191` | lateral dolly along the seven layers |
| `seq/model` | model | `27c0ccbb-b064-4bc0-ab52-a08087f176dd` | a few degrees of orbit, roof hovering |
| `seq/sumrak` | dusk | `433b5b01-f0eb-4cf5-8b25-60bf23eac75f` | slow push-in, clouds drifting |
| `cladding.mp4` (ambient loop) | cladding | `04a9954a-2518-4329-9f13-53d2c86f0ee9` | slide along the boards in raking light |

10 credits each. Every prompt was camera-only: "the house, its geometry,
materials and lighting stay exactly as they are — nothing appears, nothing
morphs, no people, no text". Three submissions were first answered with a
preset recommendation ("IN THE DARK") and resubmitted with
`declined_preset_id`; one hit a backend rate limit and was resubmitted once
the batch drained. The plan's concurrency cap is 8 jobs.

The MP4s were cut into 48 evenly spaced WebP frames (1280 px wide, 720 for
portrait, q74) by `clients/ecodomcek/frames.py`, so the page can draw the
frame for the scroll position directly — no video seeking, no smoothing
between the hand and the world.

Spend: 16 + 70 credits of a 544-credit balance.

## What was not used

- The Cycles plates for `dollhouse` and `xray` carried the DOM boards well
  on their own; they were still lifted, because a photographed model and a
  photographed sample read as objects in a way a render does not.
- No text-to-image: everything is image-to-image from our render, so the
  page never shows a house EcoDomček did not brief. The Vzorový dom stays a
  concept and every plate says so.
