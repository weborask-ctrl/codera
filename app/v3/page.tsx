"use client"

/**
 * Step 5 dev route: the full experience, identical to the homepage wiring.
 * ?probe=1 shows the input-latency probe. Not linked from the site.
 */

import { useEffect, useState } from "react"
import { Experience } from "@/components/experience"

export default function V3() {
  const [probe, setProbe] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setProbe(new URLSearchParams(window.location.search).has("probe")), 0)
    return () => clearTimeout(t)
  }, [])
  return <Experience probe={probe} />
}
