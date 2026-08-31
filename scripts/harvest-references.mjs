/**
 * CODERA_DESIGN_REFERENCES harvest — Step 7 phase A.
 *
 * For each candidate site: hero screenshot after the intro settles, a second
 * shot one scroll-beat in, and measured facts probed from computed styles
 * (display/body font stacks, sizes, ground colour, canvas presence). Writes
 * shots to CODERA_DESIGN_REFERENCES/shots/ and a PENDING-verdict record per
 * site to records/. Deep analysis is added by hand only for LIKED records —
 * dissecting sites the calibration will reject is wasted work.
 *
 *   node scripts/harvest-references.mjs [slug ...]   (no args = all)
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { chromium } from "playwright"

const OUT = "CODERA_DESIGN_REFERENCES"
mkdirSync(`${OUT}/shots`, { recursive: true })
mkdirSync(`${OUT}/records`, { recursive: true })

/** The canon of the modern 5D/spatial genre, curated 2026-08-31. */
const SITES = [
  ["lusion", "https://lusion.co/"],
  ["activetheory", "https://activetheory.net/"],
  ["refokus", "https://www.refokus.com/"],
  ["exoape", "https://www.exoape.com/"],
  ["igloo", "https://www.igloo.inc/"],
  ["zentry", "https://zentry.com/"],
  ["chartogne", "https://chartogne-taillet.com/en"],
  ["obys", "https://obys.agency/"],
  ["basement", "https://basement.studio/"],
  ["14islands", "https://14islands.com/"],
  ["cuberto", "https://cuberto.com/"],
  ["buildinams", "https://www.buildinamsterdam.com/"],
  ["locomotive", "https://locomotive.ca/en"],
  ["unseen", "https://unseen.co/"],
  ["snellenberg", "https://dennissnellenberg.com/"],
  ["miumiu-bags", "https://immersivebags.miumiu.com/"],
  ["monopo", "https://monopo.london/"],
  ["antinomy", "https://antinomy.studio/"],
  ["darkroom", "https://darkroom.engineering/"],
  ["vucko", "https://vucko.co/"],
]

const only = process.argv.slice(2)
const list = only.length ? SITES.filter(([s]) => only.includes(s)) : SITES

const browser = await chromium.launch({ args: ["--use-angle=default"] })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  locale: "en-US",
})

const results = []
for (const [slug, url] of list) {
  const page = await context.newPage()
  try {
    await page.goto(url, { waitUntil: "load", timeout: 45_000 })
    /* WebGL intros need real time; networkidle never fires on many of these */
    await page.waitForTimeout(6_000)
    await page.mouse.move(720, 450)
    await page.screenshot({ path: `${OUT}/shots/${slug}-01.png` })

    /* one scroll-beat in */
    await page.mouse.wheel(0, 1_400)
    await page.waitForTimeout(2_500)
    await page.screenshot({ path: `${OUT}/shots/${slug}-02.png` })

    const facts = await page.evaluate(() => {
      const pick = (el) => {
        if (!el) {
          return null
        }
        const s = getComputedStyle(el)
        return {
          family: s.fontFamily.split(",")[0].replaceAll('"', "").trim(),
          size: s.fontSize,
          weight: s.fontWeight,
          spacing: s.letterSpacing,
        }
      }
      const biggest = [...document.querySelectorAll("h1,h2,[class*=title],[class*=display]")]
        .filter((el) => el.textContent?.trim())
        .sort((a, b) => Number.parseFloat(getComputedStyle(b).fontSize) - Number.parseFloat(getComputedStyle(a).fontSize))[0]
      return {
        display: pick(biggest),
        body: pick(document.body),
        ground: getComputedStyle(document.body).backgroundColor,
        canvases: document.querySelectorAll("canvas").length,
        title: document.title,
      }
    })
    results.push({ slug, url, ok: true, facts })
    console.log(`ok    ${slug}  canvas:${facts.canvases}  display:${facts.display?.family ?? "?"}`)
  } catch (error) {
    results.push({ slug, url, ok: false, error: String(error).slice(0, 120) })
    console.log(`FAIL  ${slug}  ${String(error).slice(0, 90)}`)
  }
  await page.close()
}

const today = new Date().toISOString().slice(0, 10)
for (const r of results.filter((r) => r.ok)) {
  const f = r.facts
  writeFileSync(
    `${OUT}/records/${r.slug}.md`,
    `---
id: ${r.slug}
url: ${r.url}
captured: ${today}
tags: [5d]
verdict: PENDING
verdict-note:
---

# ${f.title || r.slug}

## Shots

shots/${r.slug}-01.png · shots/${r.slug}-02.png

## Measured

- Ground: ${f.ground}
- Display type: ${f.display ? `${f.display.family} · ${f.display.size} · weight ${f.display.weight} · tracking ${f.display.spacing}` : "n/a"}
- Body type: ${f.body ? `${f.body.family} · ${f.body.size}` : "n/a"}
- Canvas elements: ${f.canvases} ${f.canvases > 0 ? "(WebGL/2D world present)" : "(DOM-only)"}

## Why it works

_Filled after calibration, LIKED records only._

## What we take / what we refuse

_Filled after calibration, LIKED records only._
`
  )
}

writeFileSync(
  `${OUT}/records/_harvest-log.md`,
  `# Harvest log — ${today}\n\n${results
    .map((r) => (r.ok ? `- ok — ${r.slug} (${r.url})` : `- FAILED — ${r.slug} (${r.url}): ${r.error}`))
    .join("\n")}\n`
)

await browser.close()
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} harvested`)
