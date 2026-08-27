"use client"

/**
 * Step 5 prototype route (Phase F/G): the persistent world + the /01–/05
 * acts skeleton, driven by native scroll. Not linked from the site.
 * ?probe=1 shows the input-latency probe.
 */

import { useEffect, useState } from "react"
import { ExperienceActs } from "@/components/experience/acts"
import { ExperienceWorld } from "@/components/experience/world"

export default function V3() {
  const [probe, setProbe] = useState(false)
  useEffect(() => {
    setProbe(new URLSearchParams(window.location.search).has("probe"))
  }, [])
  return (
    <div className="experience">
      <ExperienceWorld />
      <ExperienceActs probe={probe} />
    </div>
  )
}
