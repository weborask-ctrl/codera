# Ten passages that are not clouds — proposal, 2026-09-14

Ondrej: "navrhni iné prechody okrem mrakov… 10". A proposal, not a build.
The constraints every candidate respects:

- **One world.** Every passage is a way of moving through Codera City, not
  an effect laid over it (igloo: acts are camera positions and light
  changes; activetheory: conviction of a single world).
- **No frame sequences.** Scrubbing rendered frames steps by construction
  (the 2.7 lesson — "trhané" three rounds running). A passage is a
  continuous function of scroll: transform, opacity, clip, alpha plates.
- **Readability over choreography.** The arriving act's copy is never under
  the passage (4.3, phones measured).
- **A flat edition exists** for phones and reduced motion, or the passage is
  not shipped.
- Cost is honest: cheap = CSS on plates we have; mid = one new plate per
  scene from the existing pipeline; high = new imagery or cutouts (the
  construction lesson: cut pieces read as cut).

| # | Passage | What the camera does | Reference | Cost |
| --- | --- | --- | --- | --- |
| 1 | **Zostup po fasáde** (descent) | A vertical dolly: the leaving scene rises out of frame, the arriving one rises in from below at a slower speed, and a tower-glass plate (alpha, 1.5× speed) passes between them in the foreground. Reads as an elevator down a facade. | igloo (camera positions), lusion depth | cheap — two scenes + one existing facade layer (`brtowers`, `btall`) |
| 2 | **Cez sklo** (through the glass) | A pane of the city's glass grows toward the camera; behind it the arriving scene, pre-blurred, sharpens as the pane fills the frame and "clears" (a highlight sweep, then gone). The material cousin of the cloud, made of what the city is built of. | noomo (glass 3D), lusion (materials) | mid — one blurred variant per scene plate from `build-responsive.js`, a sweep gradient |
| 3 | **Po moste** (bridge crossing) | A horizontal dolly: the two scenes stand side by side, the world slides left, a bridge-railing plate in the foreground moves at 1.6× so the eye reads walking, not sliding. Pairs with the street walk that follows. | refokus (beat variety), kpr (chaptered scroll) | cheap — the `bridges` layer exists |
| 4 | **Svetlom** (light passage) | No plates. The leaving scene overexposes into the hour's light (white at noon, gold at evening, violet, ink at night) and the arriving scene comes out of that light. A photographic exposure change, like walking past a window into sun. | exoape (slow dissolves, never wipes; dusk warmth) | cheapest — the bloom layer from 4.2 is the whole mechanism |
| 5 | **Do detailu** (zoom into the picture) | The next act is inside the current picture: the camera pushes into one window of the leaving plate (scale 1 → 6) while the arriving scene fades in inside a growing clipped rectangle. Every pair needs its window chosen by eye. | zentry (scroll flies through chapters), kpr | mid — `clip-path` animation + a chosen window per pair |
| 6 | **Lamely** (louvres) | Six to eight horizontal fins of the city's glass rotate 90° on scroll; the arriving scene is printed on their backs (background-position slices). Architectural, mechanical. **Risk:** it is a wipe in costume — exoape's rule is against wipes. | basement (vast ↔ dense rhythm) | cheap — CSS 3D, but flagged |
| 7 | **Nadpis ako brána** (type as the gate) | The arriving act's headline lands huge (30 vw) with the next scene visible through its letters (`background-clip: text`), then shrinks to reading size as the letters open onto the scene. The type is the passage; the copy is readable the whole way, by definition. | noomo, kpr (type-layering), pangram (type as hero) | mid — big clipped type is GPU-heavy; keep it short |
| 8 | **Odraz vo vode** (reflection) | The islands float over water: the leaving scene tips down into its own reflection (rotateX + a stretched, blurred, flipped plate) and the arriving scene rises out of it. Dusk-photographic. | exoape | mid — one flipped-blurred variant per plate |
| 9 | **Otočka hodiny** (the hour turns) | The camera does not move at all: the same plate re-lit — noon → evening → night variants of one scene cross-fade while a sun/moon disc travels, then the arriving scene shares the new light. The purest "acts are light changes". | igloo | high — new lit variants of every plate from the image model (the pipeline exists, the renders do not) |
| 10 | **Vrstvy mesta** (layered dissolve) | The leaving scene splits into sky / far / near layers moving at three depths with the near layer blurring, while the arriving scene's layers assemble. The hero already has these layers; the other four scenes do not. **Risk:** cutouts of the other scenes are exactly what 3.0–3.4 tried and Ondrej cancelled. | lusion (depth) | high, flagged |

## Recommendation

Not one of them for all four seams — the refokus principle is beat variety
over effect variety, and four identical passages is what made the clouds
tire. One world, four ways to move through it, matched to where each seam
goes:

- **t1 hero → street: clouds stay.** The arrival through clouds is the
  hero's own language; the first seam continuing it is the promise kept.
- **t2 street → offer: #3 Po moste.** We are about to walk the street; the
  first move is a walk.
- **t3 offer → process: #2 Cez sklo.** The golden-hour platforms are glass;
  we leave them through it.
- **t4 process → night: #4 Svetlom.** Dusk to night is a light change, not a
  place change; the cheapest passage is also the truest one here.

Cost of that set: #3 and #4 are cheap (existing layers, existing bloom), #2
is one blurred variant per plate. Two to three days including the flat
edition, the probe on all four seams and captured frame strips. The
alternatives worth a look if the set above feels too quiet: #7 (type as the
gate) for t2 instead of the bridge — louder, more "10 000 €", but it makes
the /02 headline part of the effect, and the readable hold has to be proven
with the probe.

Waiting on Ondrej's pick before anything is built (rule 7: no step without
its contract).
