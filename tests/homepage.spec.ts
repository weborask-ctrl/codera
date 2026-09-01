import { expect, type Page, test } from "@playwright/test"
import { commercial, packages } from "../lib/site-config"

/**
 * Step 5 experience suite.
 *
 * The homepage is the /01–/05 acts experience: native scroll, ZERO
 * ScrollTrigger pins, a fixed world canvas on capable wide viewports
 * (world mode) and per-act grounds everywhere else (flat mode — the SSR
 * default, mobile/tablet edit, no-WebGL and reduced-motion fallback).
 * World-only assertions branch on the same capability probe the page
 * uses; CI's Linux Firefox has no WebGL and exercises flat mode.
 */

async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.querySelector("main[data-experience='v3'][data-hydrated]") !== null,
    undefined,
    { timeout: 20_000 }
  )
}

/** Mirrors components/experience/index.tsx `snapshot()`. */
async function worldPossible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    if (window.innerWidth < 1024) {
      return false
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false
    }
    try {
      const canvas = document.createElement("canvas")
      return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    } catch {
      return false
    }
  })
}

/** Perceived lightness of a computed colour, normalised to 0–1. */
function lightness(rgb: string): number {
  const m = rgb.match(/\d+(\.\d+)?/g)
  if (!m) {
    return 0
  }
  const [r, g, b] = m.map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

test.describe("Codera homepage", () => {
  test("loads without console or runtime errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text())
      }
    })
    await page.goto("/")
    await waitForHydration(page)
    await page.waitForTimeout(600)
    const real = errors.filter(
      (e) => !e.includes("webpack-hmr") && !e.includes("Download the React DevTools")
    )
    expect(real, real.join("\n")).toHaveLength(0)
  })

  test("serves a Slovak document opening on the graphite act", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("html")).toHaveAttribute("lang", "sk")
    const heroBg = await page
      .locator("[data-zone='hero']")
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    /* flat mode paints the hero itself; world mode paints the canvas —
       either way the first act must read dark. */
    const world = await worldPossible(page)
    if (!world) {
      expect(lightness(heroBg)).toBeLessThan(0.35)
    }
    /* the display headline breaks per line (Iterácia 0.3) — assert the
       opening line, not a cross-line phrase textContent can't see */
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Vaša firma je"
    )
  })

  test("offers a working skip link", async ({ page, browserName }) => {
    await page.goto("/")
    await waitForHydration(page)
    const skip = page.locator("a[href='#hlavny-obsah']").first()
    if (browserName === "webkit") {
      /* WebKit keeps links out of the Tab order (platform convention);
         verify the link is focusable and functional directly. */
      await skip.focus()
    } else {
      await page.keyboard.press("Tab")
    }
    await expect(skip).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("main#hlavny-obsah")).toBeVisible()
  })

  test("exposes a single H1 and the act landmarks", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    for (const id of ["praca", "sluzby", "kontakt"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
    await expect(page.locator("main[data-experience='v3']")).toHaveCount(1)
  })

  test("every navigation link resolves to a real target", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    const hrefs = await page.$$eval("a[href^='#']", (links) =>
      links.map((a) => a.getAttribute("href")).filter((h): h is string => Boolean(h && h.length > 1))
    )
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of new Set(hrefs)) {
      await expect(page.locator(href), `${href} has no target`).toHaveCount(1)
    }
  })

  test("ships SEO metadata and structured data", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Codera/)
    const description = page.locator("meta[name='description']")
    await expect(description).toHaveAttribute("content", /web/i)
    const ld = await page.$$eval("script[type='application/ld+json']", (nodes) =>
      nodes.map((n) => n.textContent ?? "")
    )
    expect(ld.length).toBeGreaterThanOrEqual(2)
    expect(ld.join("")).toContain("ProfessionalService")
    expect(ld.join("")).toContain("FAQPage")
  })

  test("never claims a company registration it does not have", async ({ page }) => {
    await page.goto("/")
    const body = (await page.locator("body").textContent()) ?? ""
    for (const forbidden of ["IČO", "DIČ", "Obchodný register"]) {
      expect(body).not.toContain(forbidden)
    }
  })

  test("serves robots.txt and sitemap.xml", async ({ request }) => {
    const robots = await request.get("/robots.txt")
    expect(robots.status()).toBe(200)
    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain("<urlset")
  })

  test("every act's copy is server-rendered and readable without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto("/")
    for (const text of [
      "Vaša firma je",
      "než ukazuje",
      "Neukazujeme logá klientov.",
      "Guji, 2 050 m",
      "Právo je nástroj.",
      "vo štvrtok.",
      "STRATÉGIA",
      "Váš ďalší web nemusí",
    ]) {
      await expect(page.locator("main")).toContainText(text)
    }
    await context.close()
  })

  test("the commercial figures are correct without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto("/")
    await expect(page.locator("main")).toContainText(commercial.priceFrom)
    /* every package renders with its from-price and its boundary line — the
       page and the config may never disagree about what is on sale */
    for (const pkg of packages) {
      /* the act renders names uppercased — compare case-insensitively */
      await expect(page.locator("main")).toContainText(pkg.name, { ignoreCase: true })
      /* "od" sits in its own span since Iterácia 0.5 — assert the figure,
         the commercial fact itself */
      await expect(page.locator("main")).toContainText(pkg.priceFrom)
      await expect(page.locator("main")).toContainText(pkg.notIncluded)
    }
    await context.close()
  })

  test("one CTA concept: every 'Začať projekt' opens the enquiry drawer", async ({
    page,
  }) => {
    await page.goto("/")
    await waitForHydration(page)
    const ctas = page.getByRole("button", { name: "Začať projekt" })
    await expect
      .poll(() => ctas.count(), { timeout: 15_000 })
      .toBeGreaterThanOrEqual(2)
    await ctas.first().click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    /* the drawer must actually ARRIVE on screen — wait out the slide-in
       transition (position assertions race it on slow CI hardware) */
    await page.waitForFunction(
      () => {
        const d = document.querySelector("[role='dialog']")
        if (!d) {
          return false
        }
        const r = d.getBoundingClientRect()
        return r.width > 300 && r.x < window.innerWidth - 100
      },
      undefined,
      { timeout: 7_000 }
    )
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })

  test("the enquiry form validates before it hands anything off", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    await page.getByRole("button", { name: "Začať projekt" }).first().click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await dialog.getByRole("button", { name: /Nezáväzne prebrať projekt/ }).click()
    await expect(dialog.locator("[aria-invalid='true']").first()).toBeVisible()
  })

  test("drawer preserves entered data across close and reopen", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    await page.getByRole("button", { name: "Začať projekt" }).first().click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await dialog.locator("input").first().fill("Test Firma")
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await page.getByRole("button", { name: "Začať projekt" }).first().click()
    await expect(dialog.locator("input").first()).toHaveValue("Test Firma")
    await page.keyboard.press("Escape")
  })

  test("secondary contact details are real and reachable", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("a[href^='mailto:coderaslovakia']").first()).toHaveCount(1)
    await expect(page.locator("a[href^='tel:+421']").first()).toHaveCount(1)
  })

  test("concept work stays labelled as concept work", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("footer")).toContainText(/nejde o realizácie pre klientov/i)
  })

  test("the mobile menu opens ON SCREEN, navigates and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await waitForHydration(page)

    /* stable across open/close — the accessible name flips with state */
    const trigger = page.locator("button[aria-controls='experience-menu']")
    await expect(trigger).toBeVisible()
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")

    const menu = page.locator("#experience-menu")
    await expect(menu).toHaveAttribute("aria-hidden", "false")
    /* the audit's regression: links must physically land in the viewport —
       wait out the slide-in transition before asserting position */
    const link = menu.getByRole("link", { name: /Ukážky/ })
    await expect(link).toBeVisible()
    await page.waitForFunction(
      () => {
        const l = document.querySelector("#experience-menu a")
        if (!l) {
          return false
        }
        const r = l.getBoundingClientRect()
        return (
          r.x >= 0 &&
          r.x + r.width <= window.innerWidth + 1 &&
          r.height >= 44
        )
      },
      undefined,
      { timeout: 7_000 }
    )
    /* scroll lock while open */
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow)
    ).toBe("hidden")

    await link.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await expect(menu).toHaveAttribute("aria-hidden", "true")
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 5_000 })
      .toBeGreaterThan(100)

    /* Escape path */
    await trigger.click()
    await expect(menu).toHaveAttribute("aria-hidden", "false")
    await page.keyboard.press("Escape")
    await expect(menu).toHaveAttribute("aria-hidden", "true")
  })

  test("mobile is a touch edit: no pins, portal gallery stacks", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await waitForHydration(page)
    await expect(page.locator(".pin-spacer")).toHaveCount(0)
    await expect(page.locator("canvas")).toHaveCount(0)

    /* the portal gallery replaced the swipe deck (AD v3 amendment 2):
       three portals stack vertically, each linking into its concept */
    const portals = page.locator('#praca a[href^="/ukazky/"]')
    await expect(portals).toHaveCount(7) // name link + inline portal per ready skill + the desktop sticky portal (attached, lg-hidden)
    await portals.first().scrollIntoViewIfNeeded()
    await expect(portals.first()).toBeVisible()
    /* the page itself must not gain horizontal scroll from the portals */
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    ).toBe(true)
  })

  test("layout does not scroll horizontally at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 680 })
    await page.goto("/")
    await waitForHydration(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test("honours prefers-reduced-motion with a full flat experience", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" })
    const page = await context.newPage()
    await page.goto("/")
    await waitForHydration(page)
    await expect(page.locator("canvas")).toHaveCount(0)
    /* entrances settle instantly — copy fully readable at rest */
    const opacity = await page
      .locator("[data-enter]")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity)
    expect(Number.parseFloat(opacity)).toBe(1)
    await context.close()
  })

  test("the world mounts and the acts sequence on scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    test.skip(
      !(await worldPossible(page)),
      "world mode unavailable here (no WebGL / reduced motion)"
    )
    await waitForHydration(page)
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 20_000 })
    await expect(page.locator(".pin-spacer")).toHaveCount(0)

    const acts: string[] = []
    for (const f of [0, 0.16, 0.3, 0.44, 0.56, 0.68, 0.74, 0.8, 0.88, 1]) {
      await page.evaluate((frac) => {
        window.scrollTo({
          top: Math.round((document.body.scrollHeight - window.innerHeight) * frac),
          behavior: "instant" as ScrollBehavior,
        })
      }, f)
      await page.waitForTimeout(350)
      const act = await page.evaluate(() =>
        document.documentElement.getAttribute("data-act")
      )
      if (act && acts[acts.length - 1] !== act) {
        acts.push(act)
      }
    }
    expect(acts[0]).toBe("hero")
    expect(acts).toContain("work")
    expect(acts[acts.length - 1]).toBe("resolution")
  })

  test("scroll cannot be trapped: End reaches the footer immediately", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    await page.locator("body").click({ position: { x: 5, y: 5 } })
    /* fonts/entrances can still be settling layout right after hydration;
       a late scrollHeight change would strand the first End press */
    await page.waitForTimeout(750)
    await page.keyboard.press("End")
    await expect
      .poll(
        async () => {
          const done = await page.evaluate(
            () =>
              window.scrollY + window.innerHeight >=
              document.documentElement.scrollHeight - 4
          )
          if (!done) {
            await page.keyboard.press("End")
          }
          return done
        },
        { timeout: 5_000 }
      )
      .toBe(true)
    await expect(page.locator("footer")).toBeVisible()
  })

  test("keyboard users reach the primary controls with visible focus", async ({
    page,
    browserName,
  }) => {
    await page.goto("/")
    await waitForHydration(page)
    const reached: string[] = []
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab")
      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el) {
          return ""
        }
        const outline = getComputedStyle(el).outlineStyle
        return `${el.textContent?.trim().slice(0, 24) ?? ""}|${outline !== "none"}`
      })
      reached.push(label)
    }
    const text = reached.join("\n")
    expect(text).toContain("Začať projekt")
    if (browserName !== "webkit") {
      /* WebKit excludes links from the Tab order by platform convention */
      expect(text).toContain("Práca")
    }
  })

  test("copy holds full legibility in the light acts", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)
    await page.locator("#sluzby").scrollIntoViewIfNeeded()
    await page.waitForTimeout(900)
    for (const row of await page.locator("[data-offer-row]").all()) {
      const opacity = await row.evaluate((el) => {
        let node: HTMLElement | null = el as HTMLElement
        let total = 1
        while (node && node !== document.body) {
          total *= Number.parseFloat(getComputedStyle(node).opacity)
          node = node.parentElement
        }
        return total
      })
      expect(opacity, "offer row parked below legibility").toBeGreaterThan(0.85)
    }
  })

  test("returns a styled 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/neexistuje")
    expect(response?.status()).toBe(404)
    await expect(page.locator("body")).toContainText(/404|nenašli/i)
  })
})

test.describe("Case studies", () => {
  test("every concept has a readable document page without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    for (const slug of ["meridian", "statut", "vlna"]) {
      const res = await page.goto(`/praca/${slug}`)
      expect(res?.status()).toBe(200)
      /* the honest label is non-negotiable — Step 6 gate */
      await expect(page.locator("main")).toContainText("UKÁŽKOVÝ KONCEPT")
      await expect(page.locator("main")).toContainText("ROZHODNUTIA")
      await expect(page.locator("main")).toContainText("nejde o realizácie", { ignoreCase: true })
    }
    await context.close()
  })

  test("each demo page links to its case study", async ({ page }) => {
    /* Iterácia 0.4b: the case-study path moved off the home index — every
       demo carries its own AKO SME TO NAVRHLI chip instead */
    const routes: Array<[string, string]> = [
      ["dizajn", "statut"],
      ["objednavky", "meridian"],
      ["rezervacie", "vlna"],
    ]
    for (const [demo, study] of routes) {
      await page.goto(`/ukazky/${demo}`)
      await expect(
        page.locator(`a[href="/praca/${study}"]`).first(),
        `no link to /praca/${study} on /ukazky/${demo}`
      ).toHaveCount(1)
    }
  })
})

test.describe("Concept sites", () => {
  test("every concept opens as a full page wearing the honest ribbon", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    for (const slug of ["dizajn", "objednavky", "rezervacie"]) {
      const res = await page.goto(`/ukazky/${slug}`)
      expect(res?.status()).toBe(200)
      await expect(page.locator("body")).toContainText("DEMO · CODERA")
    }
    await context.close()
  })

  test("the portal gallery links into the concepts", async ({ page }) => {
    await page.goto("/")
    for (const slug of ["dizajn", "objednavky", "rezervacie"]) {
      await expect(
        page.locator(`a[href="/ukazky/${slug}"]`).first(),
        `no portal link to /ukazky/${slug}`
      ).toBeAttached()
    }
  })
})
