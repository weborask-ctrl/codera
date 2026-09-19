# Octopus skin sculpt — editable source

`octopus-skin-study.glb` is a static, indexed skin mesh exported for further sculpting in Blender or another glTF-compatible DCC. Import via File > Import > glTF 2.0.

It includes the head, mantle, arm web and baked arms. It does NOT include separate runtime eyes/corneas, suckers, fine analytical tips, shader textures, bones or animation. The copper material is only a neutral review material, not the live website shader. This is an editable triangular sculpt base, not production animation topology or a finished photoreal asset. Model units are study units, not measured animal dimensions.

Rebuild from repository root after the preview has populated the cached Three dependency:

    node scripts/build-octopus-sculpt.mjs
    node scripts/export-octopus-sculpt.mjs

The browser uses `experiments/jellyfish/octopus-sculpt.bin`; the GLB is an offline handoff and adds no browser download/rendering cost. Keep any future retopology and texture source files alongside this document with an explicit link to the replacement runtime asset.
