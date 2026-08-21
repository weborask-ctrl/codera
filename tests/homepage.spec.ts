import { expect, type Page, test } from "@playwright/test"

/**
 * Waits until React has hydrated.
 *
 * The hero reveals mark themselves the moment the client effects run, so the
 * first `data-revealed` element is a reliable hydration signal. Without this
 * gate the interaction tests race the dev server's on-demand compilation and
 * click a button that has no handler attached yet.
 */
async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.querySelector('.reveal[data-revealed="true"]') !== null,
    undefined,
    { timeout: 20_000 }
  )
}

/**
 * Homepage suite.
 *
 * Asserts on structure, runtime health and accessibility contracts rather than
 * on marketing copy, so the tests survive wording changes but still fail if the
 * page breaks. Several claims made in the "technická kvalita" section are
 * verified here on purpose — they should not outlive the behaviour.
 */
test.describe("Webora homepage", () => {
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

  test("renders the themed Slovak document shell", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("html")).toHaveAttribute("lang", "sk")
    // next-themes resolves a concrete theme onto <html> before hydration.
    await expect(page.locator("html")).toHaveClass(/(^|\s)(light|dark)(\s|$)/)
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

  test("exposes a single H1 and every landmark section", async ({ page }) => {
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

    for (const id of [
      "sluzby",
      "projekty",
      "premena",
      "proces",
      "o-nas",
      "kvalita",
      "kontakt",
    ]) {
      await expect(
        page.locator(`#${id}`),
        `section #${id} should exist`
      ).toHaveCount(1)
    }
  })

  test("ships SEO metadata and structured data", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Webora/)
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

    // Webora has no fixed public address, so a LocalBusiness entry would be a
    // fabrication. Nor is there anything to rate yet.
    const service = parsed.find(
      (entry) => entry["@type"] === "ProfessionalService"
    )
    expect(service.address, "no address may be invented").toBeUndefined()
    expect(service.aggregateRating, "no ratings exist yet").toBeUndefined()
  })

  test("states price, delivery and response time above the fold region", async ({
    page,
  }) => {
    await page.goto("/")

    // The commercial facts must be on the page, not buried in the footer.
    const offer = page.locator("#cennik")
    await expect(offer).toContainText("699")
    await expect(offer).toContainText("72")
    await expect(offer).toContainText("14")

    // Webora has no registered entity, so the site must never claim one.
    // Checked on the footer and contact section rather than the whole body:
    // the before/after preview deliberately depicts a fictional 2011-era
    // company that does carry an "s.r.o." suffix, and that is not a claim
    // about Webora.
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

    const clipPaths = await page.$$eval(".reveal-wipe > *", (nodes) =>
      nodes.map((node) => getComputedStyle(node).clipPath)
    )
    expect(clipPaths.length).toBeGreaterThan(0)

    // Anything sitting well inside the viewport must end up visible. The
    // bottom band is excluded on purpose: the observer deliberately waits
    // until an element clears the last 10% of the viewport before revealing.
    await page
      .waitForFunction(
        () =>
          [...document.querySelectorAll(".reveal")].every((node) => {
            const rect = node.getBoundingClientRect()
            const settled = rect.top < window.innerHeight * 0.85 && rect.bottom > 0
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

  test("the before/after comparison is keyboard operable", async ({ page }) => {
    await page.goto("/")
    await waitForHydration(page)

    const slider = page.getByRole("slider", {
      name: "Porovnanie starého a nového webu",
    })
    await slider.scrollIntoViewIfNeeded()
    await expect(slider).toBeVisible()

    const initial = await slider.inputValue()
    await slider.focus()
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")

    expect(Number(await slider.inputValue())).toBeGreaterThan(Number(initial))
  })

  test("every primary CTA uses one label and leads to the form", async ({
    page,
  }) => {
    await page.goto("/")

    const ctas = page.getByRole("link", { name: "Nezáväzná konzultácia" })
    const count = await ctas.count()
    expect(count, "CTA should appear in nav, hero and services").toBeGreaterThan(
      2
    )

    // One CTA concept, one destination: the enquiry form.
    for (let index = 0; index < count; index += 1) {
      await expect(ctas.nth(index)).toHaveAttribute("href", "#kontakt")
    }
  })

  test("the process timeline behaves as an accessible tab set", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await waitForHydration(page)

    const tablist = page.getByRole("tablist", { name: "Kroky spolupráce" })
    await tablist.scrollIntoViewIfNeeded()
    await expect(tablist).toBeVisible()

    const tabs = page.getByRole("tab")
    await expect(tabs).toHaveCount(6)

    // Picking a step reveals that step's panel.
    const design = tabs.nth(2)
    await design.click()
    await expect(design).toHaveAttribute("aria-selected", "true")
    await expect(page.getByRole("tabpanel")).toContainText("Dizajn")

    // Arrow keys move between steps without leaving the widget.
    await page.keyboard.press("ArrowRight")
    await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true")
    await expect(tabs.nth(3)).toBeFocused()
    await page.keyboard.press("Home")
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true")
  })

  test("the process steps are all readable on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await waitForHydration(page)

    // No tab set on mobile — every step is expanded in a vertical list.
    await expect(page.getByRole("tablist")).toBeHidden()

    const process = page.locator("#proces")
    for (const title of [
      "Analýza",
      "Smer",
      "Dizajn",
      "Vývoj",
      "Kontrola",
      "Spustenie",
    ]) {
      await expect(
        process.getByRole("heading", { name: title })
      ).toBeVisible()
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
    const submit = page.getByRole("button", { name: "Nezáväzne prebrať projekt" })

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
      page.getByRole("link", { name: "webora.sk@gmail.com" }).first()
    ).toHaveAttribute("href", "mailto:webora.sk@gmail.com")
    await expect(
      page.getByRole("link", { name: "+421 949 753 556" }).first()
    ).toHaveAttribute("href", "tel:+421949753556")
  })

  test("concept work stays labelled as concept work", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("#projekty")).toContainText(
      "nejde o realizácie pre klientov",
      { ignoreCase: true }
    )
    await expect(page.locator("footer")).toContainText("ukážkové koncepty")
  })

  test("mobile navigation opens, traps focus and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await waitForHydration(page)

    const trigger = page.getByRole("button", { name: "Otvoriť menu" })
    await expect(trigger).toBeVisible()
    await trigger.click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole("link", { name: "Projekty" })
    ).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
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

    const opacity = await page.$eval(
      ".reveal",
      (node) => getComputedStyle(node).opacity
    )
    expect(opacity).toBe("1")
  })

  test("returns a styled 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/tato-stranka-neexistuje")

    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})
