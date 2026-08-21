import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site-config"

/**
 * Only routes that actually exist are listed.
 *
 * Planned service landing pages — `/tvorba-web-stranok`, `/redizajn-webu`,
 * `/firemne-webstranky` — are deliberately absent until they hold real
 * content. Listing thin or missing pages costs crawl budget and can suppress
 * the pages that do rank; add each entry here as its route ships.
 *
 * The same applies to a future English version: add `/en` alongside, and set
 * `alternates.languages` in `app/layout.tsx`, once the translation exists.
 */
const routes: { path: string; changeFrequency: "monthly" | "weekly" }[] = [
  { path: "", changeFrequency: "monthly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((route, index) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: index === 0 ? 1 : 0.7,
  }))
}
