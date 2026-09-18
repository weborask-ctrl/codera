/**
 * Step 5 experience — the scroll model.
 *
 * One mutable `stage` object updated from NATIVE scroll (no pinning, no
 * synthetic smoothing on input): zone progresses are pure functions of
 * scrollY against measured section offsets. The world reads `stage` every
 * frame and applies its own short critically-damped smoothing (≤120 ms)
 * to camera/tone only — DOM-driving values (fold, stack) are consumed
 * raw so input feels immediate. See CODERA_STEP5_ARCHITECTURE.md §D.
 */

export type ActName =
  | "hero"
  | "pass"
  | "work"
  | "offer"
  | "process"
  | "resolution"

export interface StageState {
  /** raw zone progresses, 0..1, clamped, directly from scroll */
  p: Record<ActName, number>
  /** dominant act at the viewport center */
  act: ActName
  /** overall document progress 0..1 */
  total: number
  /** pointer influence, -1..1, lerped by the world only */
  pointerX: number
  pointerY: number
  reducedMotion: boolean
}

export const stage: StageState = {
  p: {
    hero: 0,
    pass: 0,
    work: 0,
    offer: 0,
    process: 0,
    resolution: 0,
  },
  act: "hero",
  total: 0,
  pointerX: 0,
  pointerY: 0,
  reducedMotion: false,
}

interface ZoneRect {
  name: ActName
  start: number
  end: number
  /** the element's own box — act detection uses this, progress uses start/end */
  boxTop: number
  boxBottom: number
}

let zones: ZoneRect[] = []

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Measures the zone rectangles from data-zone elements. A zone's progress
 * runs 0→1 while its element crosses the viewport: from "top hits bottom
 * edge" to "bottom leaves top edge" for flowing acts, and from "top hits
 * top" to "bottom hits bottom" for sticky regions (data-zone-sticky), so
 * sticky choreography maps exactly to the region's internal travel.
 */
export function measureZones() {
  if (typeof window === "undefined") {
    return
  }
  const vh = window.innerHeight
  zones = Array.from(document.querySelectorAll<HTMLElement>("[data-zone]")).map(
    (el) => {
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const sticky = el.hasAttribute("data-zone-sticky")
      return {
        name: el.getAttribute("data-zone") as ActName,
        start: sticky ? top : top - vh,
        end: sticky ? top + rect.height - vh : top + rect.height,
        boxTop: top,
        boxBottom: top + rect.height,
      }
    }
  )
}

export function updateStage() {
  if (typeof window === "undefined" || zones.length === 0) {
    return
  }
  const y = window.scrollY
  const doc = document.documentElement.scrollHeight - window.innerHeight
  stage.total = doc > 0 ? clamp01(y / doc) : 0

  const center = y + window.innerHeight / 2
  let act: ActName = stage.act
  for (const z of zones) {
    stage.p[z.name] = clamp01((y - z.start) / Math.max(1, z.end - z.start))
    if (center >= z.boxTop && center < z.boxBottom) {
      act = z.name
    }
  }

  if (act !== stage.act) {
    stage.act = act
    document.documentElement.setAttribute("data-act", act)
  }
}

/** Wires scroll/resize/pointer once; returns a cleanup. */
export function bindStage(): () => void {
  stage.reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  const onScroll = () => {
    updateStage()
    document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 24)
  }
  const onResize = () => {
    measureZones()
    updateStage()
  }
  const onPointer = (e: PointerEvent) => {
    stage.pointerX = (e.clientX / window.innerWidth) * 2 - 1
    stage.pointerY = (e.clientY / window.innerHeight) * 2 - 1
  }

  measureZones()
  updateStage()
  document.documentElement.setAttribute("data-act", stage.act)
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onResize)
  window.addEventListener("pointermove", onPointer, { passive: true })
  /* late layout shifts (fonts, images) re-measure once things settle */
  const settle = window.setTimeout(onResize, 600)

  return () => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onResize)
    window.removeEventListener("pointermove", onPointer)
    window.clearTimeout(settle)
  }
}

