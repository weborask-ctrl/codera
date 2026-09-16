import { type NextRequest, NextResponse } from "next/server"

/**
 * Content Security Policy with a per-request nonce (issue #3).
 *
 * The site loads everything from its own origin — measured 2026-09-16:
 * scripts, styles, fonts, images and the one video — so the policy can be
 * strict: scripts run only with this request's nonce (`strict-dynamic` lets
 * the nonced Next bootstrap load its own chunks), no objects, no framing,
 * forms post only to us, http upgraded. Next reads the nonce out of the
 * request's `Content-Security-Policy` header and stamps it on every script
 * it emits; the two JSON-LD blocks are data, not code, and CSP ignores them.
 *
 * Styles keep `'unsafe-inline'`: React renders `style=""` attributes into
 * the HTML and GSAP writes them per frame, and the attribute-only carve-out
 * (`style-src-attr`) is not old enough to rely on. Script injection is what
 * a CSP is for; inline styles are not the attack surface here.
 *
 * The price of a nonce is dynamic rendering — a static page cannot carry a
 * value that changes per request — so the root layout waits for the
 * connection (`connection()` in app/layout.tsx). Measured on a preview
 * deployment before this shipped; the numbers are in the 4.8 contract.
 *
 * Previews only: Vercel's toolbar loads from vercel.live and is allowed there.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const dev = process.env.NODE_ENV === "development"
  const preview = process.env.VERCEL_ENV === "preview"
  /* WebKit honours upgrade-insecure-requests on localhost too and then fails
     every subresource over a TLS that is not there (the Playwright webkit
     project); production is https behind HSTS, so the directive only rides
     on https requests */
  const https = request.nextUrl.protocol === "https:"

  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}${preview ? " https://vercel.live" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self'${preview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    `frame-src ${preview ? "https://vercel.live" : "'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", policy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy", policy)
  return response
}

export const config = {
  matcher: [
    /* pages only: the static files under /_next and everything with a file
       extension (plates, demo photos, the video, the brand SVGs) are served
       straight from the CDN and carry no scripts to police */
    {
      source: "/((?!_next/static|_next/image|.*\\.(?:avif|webp|jpg|jpeg|png|gif|svg|ico|mp4|webm|woff2|txt|xml|json|glb)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
