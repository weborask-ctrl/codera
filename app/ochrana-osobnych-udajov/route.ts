import { privacyPage, renderLegalPage } from "@/lib/legal-pages"

/** A plain, script-free document in the homepage's type system. */
export function GET() {
  return new Response(renderLegalPage(privacyPage), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  })
}
