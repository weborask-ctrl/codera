"use client"

import { SceneHero } from "@/components/site/scene-hero"
import { SceneOffer } from "@/components/site/scene-offer"
import { SceneTransformation } from "@/components/site/scene-transformation"
import { SceneWork } from "@/components/site/scene-work"

/**
 * The v1 desktop scenes, bundled as one lazy chunk.
 *
 * After Phase 6 this experience serves exactly one audience: wide viewports
 * without WebGL or with reduced motion. Every other tier was paying its
 * bundle cost anyway — the static imports pulled the whole v1 scene graph
 * into the shared chunk, which is most of why a phone was downloading
 * 731 KB of JavaScript for a page with no scrubbed timelines. Splitting it
 * means each tier downloads only the experience it renders.
 */
export default function DomFallback() {
  return (
    <>
      <SceneHero />
      <SceneTransformation />
      <SceneWork />
      <SceneOffer />
    </>
  )
}
