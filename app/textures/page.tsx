import type { Metadata } from "next"

import { FormaPreview } from "@/components/site/previews/forma"
import { KonstruktPreview } from "@/components/site/previews/konstrukt"
import { LegacyPreview } from "@/components/site/previews/legacy"
import { VitalisPreview } from "@/components/site/previews/vitalis"

/**
 * Texture bakery — a build tool, not a page.
 *
 * The spatial world shows the concept sites as textures on WebGL planes;
 * `scripts/capture-work-textures.mjs` screenshots each frame below into
 * `public/work/*.jpg`. The live-markup previews stay the single source of
 * truth: change a preview, re-run the script, and the world updates.
 *
 * Never linked, never indexed.
 */
export const metadata: Metadata = {
  title: "Textúry",
  robots: { index: false, follow: false },
}

const FRAMES = [
  { id: "legacy", node: <LegacyPreview /> },
  { id: "konstrukt", node: <KonstruktPreview /> },
  { id: "vitalis", node: <VitalisPreview /> },
  { id: "forma", node: <FormaPreview /> },
]

export default function TexturesPage() {
  return (
    <main className="flex flex-col gap-8 bg-black p-8">
      {FRAMES.map((frame) => (
        <div
          key={frame.id}
          id={`texture-${frame.id}`}
          className="@container relative isolate aspect-16/10 w-[1440px] overflow-hidden bg-background"
        >
          {frame.node}
        </div>
      ))}
    </main>
  )
}
