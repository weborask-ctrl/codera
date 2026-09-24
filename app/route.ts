import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { render } from "@/lib/silver-render.mjs"
import { faqData, structuredData } from "@/lib/silver-schema"
import { siteConfig } from "@/lib/site-config"

const template = readFile(join(process.cwd(), "experiments/metal/index.html"), "utf8")
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char)

/** A complete, indexable document. The existing proxy supplies per-request CSP. */
export async function GET(request: Request) {
  const nonce = escapeHtml(request.headers.get("x-nonce") ?? "")
  let html = render(await template)
    .replace('<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="index, follow">')
    .replace(/<meta name="description"[^>]+>/, `<meta name="description" content="${escapeHtml(siteConfig.description)}">`)
    .replaceAll('href="/fonts/', 'href="/silver/fonts/')
    .replaceAll('src="/assets/', 'src="/')
    .replaceAll('href="/assets/', 'href="/')
    .replaceAll('/media/', '/motion/metal/')
    .replaceAll('/vendor/', '/silver/vendor/')
    .replace(/href="\/(style|refinement|signature)\.css"/g, 'href="/silver/$1.css"')
    .replace('src="/main.mjs"', 'src="/silver/main.mjs"')
    .replaceAll('<script ', `<script nonce="${nonce}" `)
  const metadata = `<link rel="canonical" href="${siteConfig.url}/">
    <meta property="og:type" content="website"><meta property="og:locale" content="sk_SK">
    <meta property="og:title" content="${escapeHtml(siteConfig.title)}">
    <meta property="og:description" content="${escapeHtml(siteConfig.description)}">
    <meta property="og:url" content="${siteConfig.url}/">
    <meta property="og:image" content="${siteConfig.url}/motion/metal/poster-detail.webp">
    <meta name="twitter:card" content="summary_large_image">
    <script nonce="${nonce}" type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>
    <script nonce="${nonce}" type="application/ld+json">${JSON.stringify(faqData).replaceAll('<', '\\u003c')}</script>`
  html = html.replace('</head>', `${metadata}</head>`)
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } })
}
