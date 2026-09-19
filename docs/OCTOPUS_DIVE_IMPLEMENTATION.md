# Codera — continuous descent working plan

Marcus's latest direction supersedes the earlier storyboard: the same octopus
guides one continuous descent through different underwater environments. It
must not disappear and reappear as an unrelated decoration. Review and design
each section together before extending the journey. No GitHub push.

## Production sequence

1. **Hero and reef entrance:** build an inexpensive scroll prototype using the
   current animal, approved water and proxy reef/fish. Establish the opening
   composition, approach and shared descent. First review gate.
2. **Work at the reef:** refine five existing project examples, text safe areas
   and octopus placement. Native vertical scroll; no animations between examples.
3. **Next section design:** with Marcus, assign the next content block to the
   reef edge and agree on the camera path, action and lighting before coding it.
4. **Deeper layers:** design twilight and deep-sea environments one at a time.
   Species and scenery are proposals, not locked deliverables. Keep the animal
   spatially continuous and the reading states calm.
5. **Whole journey review:** check reversing scroll, direct anchor navigation,
   reading time and mobile composition before committing to final asset detail.
6. **Blender production on the stronger PC:** replace proxies with authored
   geometry, textures and rigged poses. Retopology, pivots, dimensions and rig
   mapping must be verified; replacement is not guaranteed to be drop-in.
7. **Final integration:** profile actual devices and choose quality tiers. High
   resolution remains optional; stable frame pacing is the current priority.

## First implemented slice

Preview: `/dive.html`. The existing `/octopus-look.html` remains the model review.

- Hero with Bricolage/Geist/Fraunces typography, large headings and no decorative
  numbered labels. Hero copy is a design proposal, not locked commercial copy.
- One real scroll path drives camera depth, forward position and the existing
  octopus transform. One animal instance persists throughout.
- Camera settles at the reef for all five studio demos. No individual demo
  movement or horizontal scroll. The animal idles at the right of the composition.
- 44 instanced rock proxies, 240 coral branch segments and 42 simple fish with
  tails. These are layout placeholders, not photorealistic environment assets.
- Working quality defaults to the existing economy path, no MSAA for this page,
  512px creature shadows, reduced wave/volume buffers and a 500,000 pixel ceiling.
  DOM typography remains at native display resolution.
- Reduced motion uses two settled compositions rather than continuous travel.
- Demo links open the existing public pages. The project enquiry links to the
  current public contact section; no new enquiry backend is implied.

## Limits and next visual review

The first path currently provides approach/descent and an anchored reef scene.
It does not yet implement a close arm wipe, animal/reef contact, articulated
swimming or further deep-sea acts. The present arm model is not a full rig.
Those details must be authored after reviewing the camera blocking.

Initial natural-viewport inspection (740 x 646) showed about 22 fps in working
quality at an actual 555 x 484 buffer with reef visible, with no console errors.
This is a UI sample, not a controlled benchmark or a guarantee for other devices.
Mobile and final production resolutions still need their own visual review.

Review hero spacing, how much the first approach enlarges the animal, descent
length, reef composition and the space left for project previews. Keep all
future model/environment source work in this repository for transfer between PCs.
