import { expect, type Page, test } from "@playwright/test"

/**
 * Waits until React has hydrated.
 *
 * Each scene stamps `data-motion="on"` on its own root from the effect that
 * builds its timelines, so the first one to appear is a reliable hydration
 * signal. Without this gate the interaction tests race the server's on-demand
 * compilation and drive a control that has no handler attached yet.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.querySelector("[data-motion='on']") !== null,
    undefined,
    { timeout: 20_000 }
  )
}

/**
 * Perceived lightness of a computed colour, normalised to 0–1.
 *
 * `getComputedStyle` does not hand back a consistent format for a colour
 * authored in `oklch`: Chromium resolves it to `lab()`, other engines may
 * return `oklch()` or `color()`, and only the legacy sRGB path gives `rgb()`.
 * Reading "the first three numbers" and treating them as 0–255 quietly reports
 * a near-black page as blinding white, so each form is scaled on its own
 * terms.
 */
function lightness(value: string): number {
  const numbers = value.match(/-?[\d.]+/g)?.map(Number) ?? []
  if (numbers.length === 0) {
    return 1
  }
  if (value.startsWith("rgb")) {
    return Math.max(numbers[0], numbers[1], numbers[2]) / 255
  }
  // CIE Lab lightness runs 0–100; oklab/oklch lightness runs 0–1.
  if (value.startsWith("lab")) {
    return numbers[0] / 100
  }
  if (value.startsWith("oklab") || value.startsWith("oklch")) {
    return numbers[0]
  }
  return 1
}

/**
 * Waits until the spatial world has handed over to scroll: its master pin
 * exists only after the intro completes and every trigger start has been
 * re-measured. On DOM-tier runs this never appears — callers that support
 * both tiers should catch the timeout.
 */
async function waitForWorld(page: Page) {
  await page.waitForFunction(
    () => document.querySelector(".pin-spacer > #top") !== null,
    undefined,
    { timeout: 20_000 }
  )
}

/**
 * Homepage suite.
 *
 * Asserts on structure, runtime health and accessibility contracts rather than
 * on marketing copy, so the tests survive wording changes but still fail if
 * the page breaks. The claims this site makes about its own technical quality
 * are verified here on purpose — they should not outlive the behaviour.
 */
test.describe("Codera homepage", () => {
  test("loads without console or runtime errors", async ({ page }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text())
      }
    })
    page.on("pageerror", (error) => {
      pageErrors.push(error.message)
    })

    const response = await page.goto("/", { waitUntil: "load" })

    expect(response, "homepage should return a response").not.toBeNull()
    expect(
      response?.status(),
      "homepage should not respond with an error status"
    ).toBeLessThan(400)

    await expect(page.locator("body")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    // Wait for hydration so mismatches surface as console errors.
    await waitForHydration(page)
    await page.waitForTimeout(500)

    expect(
      pageErrors,
      `uncaught runtime errors: ${pageErrors.join(" | ")}`
    ).toEqual([])
    expect(
      consoleErrors,
      `console errors: ${consoleErrors.join(" | ")}`
    ).toEqual([])
  })

  test("serves a Slovak document on the graphite ground", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("html")).toHaveAttribute("lang", "sk")

    // There is no user-toggled theme: the page's dark/light rhythm is authored
    // per scene. The ground must therefore be dark on first paint, with no
    // class swap and no flash to wait for.
    const ground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    )

    expect(
      lightness(ground),
      `body ground should be near-black, got ${ground}`
    ).toBeLessThan(0.25)
  })

  test("offers a working skip link", async ({ page, browserName }) => {
    await page.goto("/")
    await waitForHydration(page)

    const skip = page.getByRole("link", { name: "Preskočiť na hlavný obsah" })

    // WebKit does not move focus to links on Tab unless the OS "Tab
    // highlights each item" preference is on, so only assert tab order where
    // the browser actually tabs to links.
    if (browserName === "webkit") {
      await skip.focus()
    } else {
      await page.keyboard.press("Tab")
      await expect(skip).toBeFocused()
    }

    // `sr-only` must lift once focused, otherwise the link cannot be used.
    await expect(skip).toBeVisible()
    await expect(skip).toHaveAttribute("href", "#hlavny-obsah")
    await expect(page.locator("#hlavny-obsah")).toHaveCount(1)
  })

  test("exposes a single H1 and every scene landmark", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.locator("main")).toHaveCount(1)
    await expect(page.locator("footer")).toHaveCount(1)

    // Heading levels must not skip: h1 → h2 → h3, never h1 → h3.
    const levels = await page.$$eval("h1, h2, h3, h4", (nodes) =>
      nodes.map((node) => Number(node.tagName.slice(1)))
    )
    let previous = 0
    for (const level of levels) {
      if (previous !== 0) {
        expect(
          level,
          `heading level jumped from h${previous} to h${level}`
        ).toBeLessThanOrEqual(previous + 1)
      }
      previous = level
    }

    // Every destination the navigation offers has to exist.
    for (const id of ["top", "praca", "sluzby", "kontakt"]) {
      await expect(
        page.locator(`#${id}`),
        `scene #${id} should exist`
      ).toHaveCount(1)
    }
  })

  test("every navigation link resolves to a real target", async ({ page }) => {
    await page.goto("/")

    const hrefs = await page
      .locator('header nav a[href^="#"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href"))
      )

    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      await expect(
        page.locator(href as string),
        `nav points at ${href}, which does not exist`
      ).toHaveCount(1)
    }
  })

  test("ships SEO metadata and structured data", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Codera/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{80,}/
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    expect(blocks.length, "expects ProfessionalService and FAQPage").toBe(2)

    const parsed = blocks.map((block) => JSON.parse(block))
    const types = parsed.map((entry) => entry["@type"])
    expect(types).toContain("ProfessionalService")
    expect(types).toContain("FAQPage")

    // Codera has no fixed public address, so a LocalBusiness entry would be a
    // fabrication. Nor is there anything to rate yet.
    const service = parsed.find(
      (entry) => entry["@type"] === "ProfessionalService"
    )
    expect(service.address, "no address may be invented").toBeUndefined()
    expect(service.aggregateRating, "no ratings exist yet").toBeUndefined()
  })

  test("never claims a company registration it does not have", async ({
    page,
  }) => {
    await page.goto("/")

    // Checked on the footer and the contact scene rather than the whole body:
    // the before/after comparison deliberately depicts a fictional 2011-era
    // company that does carry an "s.r.o." suffix, and that is not a claim
    // about Codera.
    for (const scope of ["footer", "#kontakt"]) {
      const text = (await page.locator(scope).textContent()) ?? ""
      expect(text, `${scope} must not claim a company registration`).not.toMatch(
        /IČO|DIČ|s\.r\.o\.|DPH/
      )
    }
  })

  test("serves robots.txt and sitemap.xml", async ({ request }) => {
    const robots = await request.get("/robots.txt")
    expect(robots.status()).toBe(200)
    expect(await robots.text()).toContain("Sitemap:")

    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain("<urlset")
  })

  test("the hero headline is present and unclipped", async ({ page }) => {
    await page.goto("/")
    // The intro clips each line group and slides it up; the master pin exists
    // only once that entrance has fully landed. If the timeline ever fails,
    // the text sits outside its own clip — visible to a DOM assertion and
    // invisible to a human.
    await waitForWorld(page)
    await page.waitForTimeout(400)

    const heading = page.getByRole("heading", { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText("Vaša firma je lepšia")

    const offsets = await page.$$eval("[data-hero-line]", (nodes) =>
      nodes.map((node) => {
        const line = node.getBoundingClientRect()
        const clip = (node.parentElement as HTMLElement).getBoundingClientRect()
        return line.top - clip.top
      })
    )
    expect(offsets.length).toBeGreaterThan(0)
    for (const offset of offsets) {
      expect(
        Math.abs(offset),
        "a headline line finished outside its own clip"
      ).toBeLessThan(4)
    }
  })

  test("every scene is readable with JavaScript disabled", async ({
    browser,
  }) => {
    // The motion system is progressive enhancement: the DOM's resting state
    // is the finished state, and scenes only ever animate *towards* it. So
    // with scripting off nothing pins, nothing is clipped to nothing, and
    // every scene's content is simply present.
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto("/")

    for (const id of ["top", "premena", "praca", "sluzby", "kontakt"]) {
      await expect(
        page.locator(`#${id}`),
        `scene #${id} should render without scripting`
      ).toBeVisible()
    }

    // All three projects, not just the one the stage would open on.
    for (const name of ["Konštrukt", "Vitalis", "Forma"]) {
      await expect(
        page.getByRole("heading", { name, exact: true })
      ).toBeVisible()
    }

    // All three service words, none of them outlined into invisibility.
    const words = page.locator("#sluzby .offer-word")
    await expect(words).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) {
      await expect(words.nth(index)).toBeVisible()
    }

    await expect(page.locator("#dopyt form")).toBeVisible()

    await context.close()
  })

  test("the transformation is keyboard operable and moves the split", async ({
    page,
  }) => {
    // Reduced motion routes to the DOM tier, where the transformation is the
    // accessible range-input comparison. (On capable desktops it is the
    // spatial morph — covered by the world test below.)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")

    const slider = page.getByRole("slider", {
      name: "Porovnanie starého a nového webu",
    })
    await slider.scrollIntoViewIfNeeded()
    await expect(slider).toBeVisible()

    const readSplit = () =>
      page.$eval("#premena [data-stage]", (node) =>
        Number(getComputedStyle(node).getPropertyValue("--split"))
      )

    await slider.focus()
    const before = await readSplit()

    await page.keyboard.press("Home")
    expect(
      await readSplit(),
      "Home should drive the comparison to one end"
    ).toBe(0)

    await page.keyboard.press("End")
    expect(await readSplit(), "End should drive it to the other").toBe(100)

    // The visible divider has to follow the same value the control reports —
    // if they ever drift, the page shows one thing and announces another.
    expect(await slider.inputValue()).toBe("100")
    expect(typeof before).toBe("number")
  })

  test("the spatial world mounts, pins and advances through its states", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))

    await page.goto("/")

    // The world tier: canvas mounted, and the master pin's spacer wraps the
    // stage once the intro hands over to scroll.
    await page.waitForFunction(
      () => document.querySelector(".pin-spacer > #top") !== null,
      undefined,
      { timeout: 20_000 }
    )
    await expect(page.locator("#top canvas")).toHaveCount(1)

    // The headline is on screen without any scrolling — the intro autoplays
    // precisely because commercial clarity outranks spatial storytelling.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.locator("#top")).toHaveAttribute("data-world-state", "b")

    // Scroll advances the film: portal, then transformation.
    const pinEnd = await page.evaluate(() => {
      const spacer = document.querySelector(".pin-spacer > #top")
        ?.parentElement as HTMLElement
      return spacer.getBoundingClientRect().height - window.innerHeight
    })

    await page.evaluate((y) => window.scrollTo(0, y), Math.round(pinEnd * 0.16))
    await page.waitForTimeout(900)
    await expect(page.locator("#top")).toHaveAttribute("data-world-state", "c")

    await page.evaluate((y) => window.scrollTo(0, y), Math.round(pinEnd * 0.45))
    await page.waitForTimeout(900)
    await expect(page.locator("#top")).toHaveAttribute("data-world-state", "d")
    await expect(page.locator("#premena")).toBeVisible()

    // The work chapter: three states, and the world turns to paper — which
    // must also flip the stage's chapter so the nav inverts with it.
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(pinEnd * 0.62))
    await page.waitForTimeout(900)
    await expect(page.locator("#top")).toHaveAttribute("data-world-state", "e1")

    await page.evaluate((y) => window.scrollTo(0, y), Math.round(pinEnd * 0.78))
    await page.waitForTimeout(900)
    await expect(page.locator("#top")).toHaveAttribute("data-world-state", "e2")
    await expect(page.locator("#top")).toHaveAttribute("data-chapter", "paper")

    await page.evaluate((y) => window.scrollTo(0, y), Math.round(pinEnd * 0.97))
    await page.waitForTimeout(900)
    await expect(page.locator("#top")).toHaveAttribute("data-world-state", "e3")

    // The world must stay pinned for its whole runway — the sections below
    // must never pin on top of it (the stale-start regression).
    const stageTop = await page.$eval("#top", (node) =>
      Math.round(node.getBoundingClientRect().top)
    )
    expect(Math.abs(stageTop), "the stage should still be pinned").toBeLessThan(3)

    expect(errors, `runtime errors: ${errors.join(" | ")}`).toEqual([])
  })

  test("the work stage advances through all three projects", async ({
    page,
  }) => {
    // Under 1024px the world never mounts; this covers the DOM tier's v1
    // pinned stage, which is what phones and weak devices actually get.
    await page.setViewportSize({ width: 1000, height: 800 })
    await page.goto("/")
    await waitForHydration(page)

    const stage = page.locator("#praca")
    const sceneTop = await page.$eval(
      "#praca",
      (node) => node.getBoundingClientRect().top + window.scrollY
    )

    const seen: string[] = []
    for (const offset of [40, 900, 1700]) {
      await page.evaluate((y) => window.scrollTo(0, y), sceneTop + offset)
      await page.waitForTimeout(900)
      const current = await stage.getAttribute("data-project")
      if (current && seen.at(-1) !== current) {
        seen.push(current)
      }
    }

    expect(seen, "each project should take the stage in turn").toEqual([
      "konstrukt",
      "vitalis",
      "forma",
    ])

    // The ground follows the work: the two paper projects put the whole scene
    // — and the navigation bar over it — onto the light palette.
    await expect(stage).toHaveAttribute("data-chapter", "paper")
    const navGround = await page.evaluate(
      () => getComputedStyle(document.querySelector("header") as Element).color
    )
    expect(
      lightness(navGround),
      `nav text should invert to dark over a paper chapter, got ${navGround}`
    ).toBeLessThan(0.45)
  })

  test("the offer scene lights one service word at a time", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForWorld(page)

    const scene = page.locator("#sluzby")
    const sceneTop = await page.$eval(
      "#sluzby",
      (node) => node.getBoundingClientRect().top + window.scrollY
    )

    const seen: string[] = []
    for (const offset of [40, 750, 1400]) {
      await page.evaluate((y) => window.scrollTo(0, y), sceneTop + offset)
      await page.waitForTimeout(900)
      const current = await scene.getAttribute("data-active")
      if (current && seen.at(-1) !== current) {
        seen.push(current)
      }
    }

    expect(seen).toEqual(["strategia", "dizajn", "vyvoj"])

    // Exactly one row may be lit; the rest are outlined.
    const lit = await page.locator('#sluzby [data-service-row][data-active="true"]')
    await expect(lit).toHaveCount(1)

    // The width axis is what distinguishes them — not a font-size change.
    const widths = await page.$$eval("#sluzby .offer-word", (nodes) =>
      nodes.map((node) =>
        getComputedStyle(node).getPropertyValue("--wdth").trim()
      )
    )
    expect(new Set(widths).size, "the active word should differ in width").toBe(
      2
    )
  })

  test("the commercial figures are correct without JavaScript", async ({
    browser,
  }) => {
    // The price counts up when it scrolls into view. If that animation is the
    // only thing that ever writes the number, the page ships "od  €" to
    // anything that does not run it — which is a factual error about price,
    // not a missing flourish.
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto("/")

    const facts = (await page.locator("#kontakt dl").innerText()).replace(
      /\s+/g,
      " "
    )
    expect(facts).toContain("od 699 €")
    expect(facts).toContain("do 72 h")
    expect(facts).toContain("do 24 h")

    await context.close()
  })

  test("every primary CTA uses one label and leads to the form", async ({
    page,
  }) => {
    await page.goto("/")

    const ctas = page.getByRole("link", { name: "Začať projekt" })
    const count = await ctas.count()
    expect(
      count,
      "the CTA should appear in the nav, the hero and the offer"
    ).toBeGreaterThan(2)

    // One CTA concept, one destination: the enquiry form itself.
    for (let index = 0; index < count; index += 1) {
      await expect(ctas.nth(index)).toHaveAttribute("href", "#dopyt")
    }
  })

  test("the enquiry form validates before it hands anything off", async ({
    page,
  }) => {
    await page.goto("/")
    await waitForHydration(page)

    const form = page.locator("#kontakt form")
    await form.scrollIntoViewIfNeeded()

    const name = page.getByLabel("Meno")
    const contact = page.getByLabel("E-mail alebo telefón")
    const message = page.getByLabel("Čo potrebujete?")
    const submit = page.getByRole("button", {
      name: "Nezáväzne prebrať projekt",
    })

    // Empty submit must not navigate; it must explain what is missing.
    await submit.click()
    await expect(page.locator("#kontakt")).toBeVisible()
    await expect(name).toHaveAttribute("aria-invalid", "true")
    await expect(form).toContainText("Uveďte prosím svoje meno.")

    // The error is wired to the field for screen readers.
    const describedBy = await name.getAttribute("aria-describedby")
    expect(describedBy).toBeTruthy()
    await expect(page.locator(`#${describedBy}`)).toBeVisible()

    // A bad contact value is caught too.
    await name.fill("Ján Novák")
    await contact.fill("nezmysel")
    await message.fill("Potrebujeme nový firemný web.")
    await submit.click()
    await expect(contact).toHaveAttribute("aria-invalid", "true")

    // Valid input clears every error state.
    await contact.fill("jan@firma.sk")
    await expect(name).not.toHaveAttribute("aria-invalid", "true")
  })

  test("secondary contact details are real and reachable", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("link", { name: "coderaslovakia@gmail.com" }).first()
    ).toHaveAttribute("href", "mailto:coderaslovakia@gmail.com")
    await expect(
      page.getByRole("link", { name: "+421 949 753 556" }).first()
    ).toHaveAttribute("href", "tel:+421949753556")
  })

  test("concept work stays labelled as concept work", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("#praca")).toContainText(
      "nejde o realizácie pre klientov",
      { ignoreCase: true }
    )
    await expect(page.locator("footer")).toContainText("ukážkové koncepty")
  })

  test("the immersive menu opens, closes and stays out of the tab order", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    await waitForHydration(page)

    const panel = page.locator("#codera-menu")
    const trigger = page.getByRole("button", { name: "Otvoriť menu" })
    await expect(trigger).toBeVisible()

    // While closed the panel is inert: its links must not be reachable at all.
    await expect(panel).toHaveAttribute("inert", "")

    await trigger.click()
    await expect(panel).not.toHaveAttribute("inert", "")
    await expect(panel.getByRole("link", { name: "Práca" })).toBeVisible()

    // Escape closes it and focus returns to the control that opened it.
    await page.keyboard.press("Escape")
    await expect(panel).toHaveAttribute("inert", "")
    await expect(page.getByRole("button", { name: "Otvoriť menu" })).toBeFocused()
  })

  test("layout does not scroll horizontally at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto("/")
    await waitForHydration(page)

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
    expect(overflow, "page must not overflow horizontally").toBeLessThanOrEqual(
      1
    )
  })

  test("honours prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    await page.waitForTimeout(600)

    // No scene registers a scroll-linked timeline at all — so nothing can
    // pin, scrub, or trap the scroll. This is the strong version of the
    // guarantee: not "the animations are fast", but "they do not exist".
    await expect(page.locator("[data-motion='on']")).toHaveCount(0)
    await expect(page.locator(".pin-spacer")).toHaveCount(0)

    // And every scene still reads, because the resting DOM is the finished
    // state rather than a starting position waiting to be animated.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Začať projekt" }).first()
    ).toBeVisible()

    for (const name of ["Konštrukt", "Vitalis", "Forma"]) {
      await expect(
        page.getByRole("heading", { name, exact: true })
      ).toBeVisible()
    }

    // The comparison rests mid-way and stays operable.
    const split = await page.$eval("#premena [data-stage]", (node) =>
      Number(getComputedStyle(node).getPropertyValue("--split"))
    )
    expect(split).toBe(50)
  })

  test("keyboard users reach every control and always see focus", async ({
    page,
    browserName,
  }) => {
    // WebKit does not put links in the tab order unless the OS "Tab highlights
    // each item" preference is on, so the walk would stop at the first link.
    test.skip(
      browserName === "webkit",
      "WebKit does not tab to links by default"
    )

    await page.goto("/")
    await waitForHydration(page)

    const seen: string[] = []
    let invisibleFocus: string | null = null

    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press("Tab")

      const info = await page.evaluate(() => {
        const node = document.activeElement as HTMLElement | null
        if (!node || node === document.body) {
          return null
        }
        const style = getComputedStyle(node)
        const outline =
          style.outlineStyle !== "none" &&
          Number.parseFloat(style.outlineWidth) > 0
        return {
          tag: node.tagName.toLowerCase(),
          label: (node.textContent ?? "").trim().slice(0, 30),
          outline,
          hidden: node.offsetParent === null && style.position !== "fixed",
        }
      })

      if (!info) {
        break
      }

      // Nothing off-screen or inside a closed overlay may take focus.
      expect(
        info.hidden,
        `focus landed on a hidden element: ${info.tag} "${info.label}"`
      ).toBe(false)

      if (!info.outline && !invisibleFocus) {
        invisibleFocus = `${info.tag} "${info.label}"`
      }
      seen.push(`${info.tag}:${info.label}`)
    }

    expect(
      invisibleFocus,
      `an element took focus with no visible ring: ${invisibleFocus}`
    ).toBeNull()

    // The skip link, the nav, the CTAs and the form all have to be in there.
    expect(seen.length).toBeGreaterThan(10)
  })

  test("pinned scenes never trap the scroll", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    // End must reach the bottom of the document even though three scenes pin
    // on the way. A pin that swallows scroll shows up here as a page that
    // cannot be left.
    await page.locator("body").click({ position: { x: 5, y: 5 } })
    await page.keyboard.press("End")
    await page.waitForTimeout(1500)

    const atBottom = await page.evaluate(
      () =>
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4
    )
    expect(atBottom, "End should reach the footer").toBe(true)
    await expect(page.locator("footer")).toBeVisible()
  })

  test("text clears WCAG AA contrast on both grounds", async ({ page }) => {
    // DOM tier: the selectors below live in the v1 markup, and the world's
    // paper states get their contrast pass in visual QA (Phase 10).
    await page.setViewportSize({ width: 1000, height: 800 })
    await page.goto("/")
    await waitForHydration(page)

    const check = async (selector: string, minimum: number) =>
      page.evaluate(
        ([sel, min]) => {
          // Resolve any CSS Color 4 syntax to sRGB by round-tripping it
          // through a canvas — `getComputedStyle` hands back `lab()` in
          // Chromium and `oklch()` elsewhere, and neither parses as rgb().
          const toRgb = (color: string) => {
            const canvas = document.createElement("canvas")
            canvas.width = 1
            canvas.height = 1
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
            ctx.fillStyle = "#000"
            ctx.fillStyle = color
            ctx.fillRect(0, 0, 1, 1)
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
            return [r, g, b] as const
          }

          const luminance = (rgb: readonly number[]) => {
            const [r, g, b] = rgb.map((v) => {
              const s = v / 255
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
            })
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }

          const node = document.querySelector(sel as string)
          if (!node) {
            return { ok: false, ratio: 0, reason: "missing" }
          }

          const style = getComputedStyle(node)
          let ground = node as Element | null
          let background = "rgba(0, 0, 0, 0)"
          while (ground) {
            const value = getComputedStyle(ground).backgroundColor
            if (value && !value.endsWith(", 0)")) {
              background = value
              break
            }
            ground = ground.parentElement
          }

          const a = luminance(toRgb(style.color))
          const b = luminance(toRgb(background))
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
          return { ok: ratio >= (min as number), ratio, reason: "" }
        },
        [selector, minimum] as const
      )

    // Body copy on the graphite ground.
    const lead = await check("#top [data-hero-lead]", 4.5)
    expect(
      lead.ratio,
      `hero lead contrast was ${lead.ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(4.5)

    // Large display type only needs 3:1, but the headline should clear AA for
    // body text anyway — it is the first thing anyone reads.
    const heading = await check("#hero-heading", 4.5)
    expect(
      heading.ratio,
      `hero headline contrast was ${heading.ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(4.5)

    // And on the paper chapter, where the tokens are re-pointed.
    await page.locator("#praca").scrollIntoViewIfNeeded()
    await page.evaluate(() => {
      const stage = document.querySelector("#praca") as HTMLElement
      stage.dataset.chapter = "paper"
    })
    await page.waitForTimeout(900)

    const onPaper = await check("#praca [data-project-panel] p", 4.5)
    expect(
      onPaper.ratio,
      `paper-chapter body contrast was ${onPaper.ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(4.5)
  })

  test("returns a styled 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/tato-stranka-neexistuje")

    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})
