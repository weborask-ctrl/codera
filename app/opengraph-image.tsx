import { ImageResponse } from "next/og"

import { ARC_PATH } from "@/components/site/arc"
import { siteConfig } from "@/lib/site-config"

/**
 * Generated at build time, so there is no binary asset to keep in sync with
 * the brand and nothing to re-export when the wording changes.
 *
 * It renders on the graphite ground, with the same open arc the site is built
 * around, because the social card is the first impression for anyone who
 * arrives via a shared link — a white card with a different mark on it would
 * be a worse first impression than the page it leads to.
 */
export const alt = `${siteConfig.name} — digitálne štúdio`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GROUND = "#0a0b0c"
const INK = "#f4f2ee"
const MUTED = "#a7a49e"
const SIGNAL = "#e0b06a"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: GROUND,
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* No <title> here: Satori renders it as visible text rather than as a
            label. The wordmark beside it already carries the name. */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d={ARC_PATH}
            stroke={INK}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: INK,
            letterSpacing: "-0.04em",
          }}
        >
          Codera
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 78,
            lineHeight: 1.02,
            fontWeight: 600,
            color: INK,
            letterSpacing: "-0.04em",
            maxWidth: 960,
          }}
        >
          Vaša firma je lepšia, než ukazuje váš web.
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 29,
            color: MUTED,
            letterSpacing: "-0.012em",
          }}
        >
          Navrhujeme a vyvíjame weby, ktoré menia to, ako zákazníci vnímajú
          vašu firmu.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{ width: 88, height: 5, background: SIGNAL, borderRadius: 3 }}
        />
        {/* Shows the verified contact e-mail rather than a domain: no real
            Codera domain has been chosen yet, and this must not invent one
            (see siteConfig.url's TODO). Swap to a bare domain once one is
            confirmed. */}
        <span style={{ fontSize: 24, color: MUTED }}>{siteConfig.email}</span>
      </div>
    </div>,
    size
  )
}
