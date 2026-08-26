import { expect, type Page, test } from "@playwright/test"

/**
 * Waits until React has hydrated.
 *
 * The scroll entrances mark themselves the moment the client effects run, so
 * the first `data-revealed` element is a reliable hydration signal. Without
 * this gate the interaction tests race the server's on-demand compilation and
 * click a control that has no handler attached yet.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () =>
      document.querySelector('.reveal[data-revealed="true"]') !== null ||
      document.querySelector("[data-motion='on']") !== null,
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
    await waitForHydration(page)
    // The entrance clips each line group and slides it up. If the timeline
    // ever fails to run, the text is in the DOM but sitting outside its own
    // clip — visible to a DOM assertion and invisible to a human.
    await page.waitForTimeout(2600)

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

  test("scroll entrances actually reveal their content", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    await page.locator("#contact-heading").scrollIntoViewIfNeeded()

    // The closing headline uses a clip-path wipe. If the reveal ever stops
    // firing, the text is present in the DOM but invisible — assert on the
    // resolved clip instead of on visibility, which would not catch it.
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll(".reveal-wipe > *")].every(
          (node) => !getComputedStyle(node).clipPath.includes("110%")
        ),
      undefined,
      { timeout: 10_000 }
    )

    // Anything sitting well inside the viewport must end up visible. The
    // bottom band is excluded on purpose: the observer deliberately waits
    // until an element clears the last 10% of the viewport before revealing.
    await page
      .waitForFunction(
        () =>
          [...document.querySelectorAll(".reveal")].every((node) => {
            const rect = node.getBoundingClientRect()
            const settled =
              rect.top < window.innerHeight * 0.85 && rect.bottom > 0
            return !settled || getComputedStyle(node).opacity !== "0"
          }),
        undefined,
        { timeout: 8_000 }
      )
      .catch(async () => {
        const stuck = await page.$$eval(".reveal", (nodes) =>
          nodes
            .filter((node) => {
              const rect = node.getBoundingClientRect()
              return (
                rect.top < window.innerHeight * 0.85 &&
                rect.bottom > 0 &&
                getComputedStyle(node).opacity === "0"
              )
            })
            .map((node) => node.textContent?.slice(0, 60))
        )
        throw new Error(
          `reveals stayed invisible on screen: ${JSON.stringify(stuck)}`
        )
      })
  })

  test("the transformation is keyboard operable and moves the split", async ({
    page,
  }) => {
    await page.goto("/")
    await waitForHydration(page)

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

  test("scrolling through the pinned scene performs the transformation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForHydration(page)

    const readSplit = () =>
      page.$eval("#premena [data-stage]", (node) =>
        Number(getComputedStyle(node).getPropertyValue("--split"))
      )

    // Land at the start of the pin: the old site should still be covering the
    // stage almost completely.
    const sceneTop = await page.$eval(
      "#premena",
      (node) => node.getBoundingClientRect().top + window.scrollY
    )
    await page.evaluate((y) => window.scrollTo(0, y + 40), sceneTop)
    await page.waitForTimeout(900)
    expect(
      await readSplit(),
      "the scene should open on the old site"
    ).toBeGreaterThan(70)

    // Scroll to the far end of the pin: the concept should have taken over.
    await page.evaluate((y) => window.scrollTo(0, y + 1400), sceneTop)
    await page.waitForTimeout(1200)
    expect(
      await readSplit(),
      "the scene should end on the Codera concept"
    ).toBeLessThan(25)
  })

  test("the work stage advances through all three projects", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
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

    // One CTA concept, one destination: the enquiry form.
    for (let index = 0; index < count; index += 1) {
      await expect(ctas.nth(index)).toHaveAttribute("href", "#kontakt")
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

    // CSS entrances resolve to their end state...
    const opacity = await page.$eval(
      ".reveal",
      (node) => getComputedStyle(node).opacity
    )
    expect(opacity).toBe("1")

    // ...and no scene registers a scroll-linked timeline at all, so nothing
    // can pin, scrub or trap the scroll.
    await expect(page.locator("[data-motion='on']")).toHaveCount(0)

    // The hero must still read correctly with every timeline skipped.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Začať projekt" }).first()
    ).toBeVisible()
  })

  test("returns a styled 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/tato-stranka-neexistuje")

    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})
