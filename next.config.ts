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
}

export default nextConfig
