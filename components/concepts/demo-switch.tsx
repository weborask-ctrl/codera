"use client"

/**
 * One chunk per demo. The map lives in a Client Component on purpose: a
 * Server Component that dynamically imports Client Components is not code
 * split (Next docs, lazy-loading), so with the map in the page every demo
 * route shipped all five sites — including the three.js the bronze
 * paragraph and the globe need — to every visitor (audit 2026-09-14 §9).
 * Here `next/dynamic` splits for real; the sites are still server-rendered.
 */

import dynamic from "next/dynamic"

const DEMOS = {
  dizajn: dynamic(() => import("./statut")),
  objednavky: dynamic(() => import("./meridian")),
  rezervacie: dynamic(() => import("./vlna")),
  animacie: dynamic(() => import("./observatorium")),
  wordpress: dynamic(() => import("./wordpress")),
} as const

export type DemoKey = keyof typeof DEMOS

export function DemoSwitch({ demo }: { demo: DemoKey }) {
  const Site = DEMOS[demo]
  return <Site />
}
