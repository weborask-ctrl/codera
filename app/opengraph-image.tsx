import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/site-config"

/**
 * Generated at build time, so there is no binary asset to keep in sync with
 * the brand and nothing to re-export when the wording changes.
 */
export const alt = `${siteConfig.name} — webové štúdio pre firmy`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* No <title> here: Satori renders it as visible text, not as a
            label. The wordmark beside it already carries the name. */}
        <svg width="46" height="38" viewBox="0 0 22 18" fill="none" aria-hidden>
          <path
            d="M2 2.6 6.2 15.4 11 6.9 15.8 15.4 20 2.6"
            stroke="#121417"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: "#121417",
            letterSpacing: "-0.03em",
          }}
        >
          Codera
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 600,
            color: "#121417",
            letterSpacing: "-0.035em",
            maxWidth: 940,
          }}
        >
          Vaša firma je lepšia, než ukazuje váš web.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#61656c",
            letterSpacing: "-0.01em",
          }}
        >
          Webové štúdio pre firemné weby — dizajn, rýchlosť, technická kvalita.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{ width: 96, height: 6, background: "#2a5cda", borderRadius: 3 }}
        />
        {/* Shows the verified contact e-mail rather than a domain: no real
            Codera domain has been chosen yet, and this migration must not
            invent one (see siteConfig.url's TODO). Swap back to a bare
            domain once one is confirmed. */}
        <span style={{ fontSize: 24, color: "#61656c" }}>{siteConfig.email}</span>
      </div>
    </div>,
    size
  )
}
