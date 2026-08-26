import type { Metadata } from "next"

import { ProtoExperience } from "@/components/proto/proto-experience"

/**
 * Phase 2 technical prototype — throwaway route, never linked, never indexed.
 * It exists to answer the kill criteria in SPATIAL_REDESIGN_PROGRESS.md and
 * is deleted once the real scenes are built on the validated architecture.
 */
export const metadata: Metadata = {
  title: "Prototyp",
  robots: { index: false, follow: false },
}

export default function ProtoPage() {
  return (
    <main>
      <ProtoExperience />
    </main>
  )
}
