import type { NextConfig } from "next"

/**
 * Conservative security headers.
 *
 * No Content-Security-Policy yet: a correct one for the App Router needs
 * per-request nonces, and a wrong one silently breaks hydration. These four
 * are safe, static, and cover the common cases.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      /* dev-only routes stay in the build for the capture tooling but must
         never be indexed (audit 2026-09-14 §10) */
      {
        source: "/(v3|boards|directions|logo-lab)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ]
  },
  /* Amendment 3: the brand-named /koncept routes became skill demos. The old
     URLs were live briefly — send them to their skills, permanently. */
  async redirects() {
    return [
      { source: "/koncept/meridian", destination: "/ukazky/objednavky", permanent: true },
      { source: "/koncept/statut", destination: "/ukazky/dizajn", permanent: true },
      { source: "/koncept/vlna", destination: "/ukazky/rezervacie", permanent: true },
      /* the retired case studies (2026-09-14) */
      { source: "/praca/meridian", destination: "/ukazky/objednavky", permanent: true },
      { source: "/praca/statut", destination: "/ukazky/dizajn", permanent: true },
      { source: "/praca/vlna", destination: "/ukazky/rezervacie", permanent: true },
    ]
  },
}

export default nextConfig
