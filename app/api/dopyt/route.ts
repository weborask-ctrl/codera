import { sendEnquiry } from "@/app/actions/enquiry"
import { siteConfig } from "@/lib/site-config"

/**
 * The homepage form's endpoint. The Silver homepage is a static template, so
 * it cannot call the server action directly; this route hands its three
 * fields to the same `sendEnquiry` (validation, honeypot, rate limit, Resend).
 * Without `RESEND_API_KEY` it answers `configured: false` and the page falls
 * back to the visitor's mail client, exactly as before.
 */
export async function POST(request: Request) {
  /* same-origin only: the form lives on our own page */
  const origin = request.headers.get("origin")
  const own = new URL(request.url).origin
  if (origin && origin !== own && origin !== siteConfig.url) {
    return Response.json({ ok: false, configured: true, error: "Nepovolený pôvod požiadavky." }, { status: 403 })
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const field = (key: string) => (typeof body?.[key] === "string" ? (body[key] as string) : "")
  const result = await sendEnquiry({
    name: field("name"),
    company: "",
    contact: field("email"),
    budget: "",
    message: field("message"),
    website: field("website"),
  })
  return Response.json(result, { headers: { "Cache-Control": "no-store" } })
}
