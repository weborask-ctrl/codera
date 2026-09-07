"use client"

/**
 * The hero city builds itself (Iterácia 3.0, Ondrej 2026-09-07: "budovy sa
 * na začiatku poskladajú").
 *
 * The hero render is cut into an empty-sky base and three island layers with
 * alpha (left, centre, right), all from the same native 5504 px render. Each
 * island rises out of the cloud floor into its exact place over ~1.5 s while
 * the headline is readable from the first frame — the copy never waits for
 * the world, the world builds behind it.
 *
 * The plate is a fixed 16:9 box that covers the viewport (like object-fit:
 * cover), so the layers' percentage positions map onto the base exactly.
 * The animation is plain CSS, so it starts at first paint on the
 * server-rendered plate; when the city stage mounts it renders the same
 * markup with a negative delay equal to the time already elapsed, and takes
 * over mid-motion without a cut.
 */

const ASM = "/home/asm"
/* a transparent pixel: the <img> fallback below 768 px, where the layers are hidden */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/* percent of the 16:9 frame — written by the asset pipeline from the crops */
const LAYERS = [
  { id: "g2", left: 51.0, top: 1.986, width: 25.0, delay: "0s" },
  { id: "g1", left: 20.004, top: 19.987, width: 30.996, delay: "0.16s" },
  { id: "g3", left: 76.0, top: 22.005, width: 24.0, delay: "0.3s" },
] as const

export function HeroAssembly({ resumeFrom = 0 }: { resumeFrom?: number }) {
  return (
    <div
      className="city-asm"
      style={resumeFrom > 0 ? ({ ["--asm-t0" as string]: `${-Math.round(resumeFrom)}ms` } as React.CSSProperties) : undefined}
    >
      <div className="city-asm-base" />
      {LAYERS.map((l) => (
        <picture key={l.id}>
          {/* phones keep the portrait plate and must not download the layers:
              the sources are gated on the media query and the fallback img
              is a transparent pixel, so under 768 px nothing is fetched */}
          <source media="(min-width: 768px)" type="image/avif" srcSet={`${ASM}/${l.id}-1x.avif 1x, ${ASM}/${l.id}-2x.avif 2x`} />
          <source media="(min-width: 768px)" type="image/webp" srcSet={`${ASM}/${l.id}-1x.webp 1x, ${ASM}/${l.id}-2x.webp 2x`} />
          <img
            className="city-asm-layer"
            src={PIXEL}
            alt=""
            decoding="async"
            fetchPriority="high"
            style={{ left: `${l.left}%`, top: `${l.top}%`, width: `${l.width}%`, ["--d" as string]: l.delay } as React.CSSProperties}
          />
        </picture>
      ))}
      {/* a cloud puff settles last in front of the islands' feet */}
      {/* biome-ignore lint/performance/noImgElement: alpha cloud plate, decorative. */}
      <img className="city-asm-cloud" src="/home/cloud-one-a.webp" alt="" decoding="async" loading="lazy" />
    </div>
  )
}

/** ms since the first paint — how far the server-rendered plate's animation
 *  has already run when the stage takes over. */
export function assemblyElapsed(): number {
  if (typeof performance === "undefined") {
    return 0
  }
  const fcp = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")
  const start = fcp ? fcp.startTime : 0
  return Math.max(0, performance.now() - start)
}
