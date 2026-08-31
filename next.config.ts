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
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  /* Amendment 3: the brand-named /koncept routes became skill demos. The old
     URLs were live briefly — send them to their skills, permanently. */
  async redirects() {
    return [
      { source: "/koncept/meridian", destination: "/ukazky/objednavky", permanent: true },
      { source: "/koncept/statut", destination: "/ukazky/dizajn", permanent: true },
      { source: "/koncept/vlna", destination: "/ukazky/rezervacie", permanent: true },
    ]
  },
}

export default nextConfig
