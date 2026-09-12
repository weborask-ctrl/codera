import { expect, test } from "@playwright/test"

/**
 * The demo subpages do the thing they demonstrate (Iterácia 4.0):
 * Rezervácie books, keeps, frees and waitlists; WordPress edits, publishes,
 * restores and sells. Everything is client-side, so each test starts from a
 * clean browser context and a clean store, and waits for the store to hydrate
 * (data-ready) before touching anything — an input filled before React attaches
 * keeps its text but never reaches the state.
 */

test.describe("Rezervácie demo", () => {
  test("books a lesson end to end, keeps it over a reload and cancels it", async ({ page }) => {
    await page.goto("/ukazky/rezervacie")
    await expect(page.locator("[data-schedule][data-ready]")).toBeAttached()
    const row = page.locator('[data-lesson="DNES · ŠTVRTOK-07:00"]')
    await expect(row).toContainText("4 MIESTA")

    await row.getByRole("button", { name: "Rezervovať" }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toContainText("Mobilita")
    await dialog.getByRole("button", { name: "Viac miest" }).click()
    await dialog.getByLabel("Meno a priezvisko").fill("Jana Nováková")
    await dialog.getByLabel("E-mail").fill("jana@priklad.sk")
    await dialog.getByLabel("Telefón").fill("+421 900 000 000")
    await dialog.getByRole("button", { name: /Pokračovať na platbu/ }).click()

    /* pay at the studio: no card needed */
    await dialog.getByRole("button", { name: "V štúdiu" }).click()
    await dialog.getByRole("button", { name: "Rezervovať", exact: true }).click()
    await expect(dialog).toContainText("REZERVÁCIA POTVRDENÁ")
    await expect(dialog).toContainText("ST-")
    /* the connections that really work: the calendar file and the Google link */
    await expect(dialog.locator("a[download$='.ics']")).toBeAttached()
    await expect(dialog.locator("a[href^='https://calendar.google.com/']")).toBeAttached()
    /* what the client receives */
    await expect(dialog).toContainText("E-MAIL · jana@priklad.sk")
    await expect(dialog).toContainText("SMS · +421 900 000 000")
    await dialog.getByRole("button", { name: "Hotovo" }).click()

    /* two seats gone, the booking listed, and still there after a reload */
    await expect(row).toContainText("2 MIESTA")
    await expect(page.locator("[data-my-bookings]")).toContainText("Mobilita")
    await page.reload()
    await expect(page.locator("[data-schedule][data-ready]")).toBeAttached()
    await expect(page.locator('[data-lesson="DNES · ŠTVRTOK-07:00"]')).toContainText("2 MIESTA")
    await expect(page.locator("[data-my-bookings]")).toContainText("Mobilita")

    /* the owner sees it too */
    await page.locator("[data-owner]").getByRole("button", { name: /Otvoriť/ }).click()
    await expect(page.locator("[data-owner]")).toContainText("Jana Nováková +1")
    await expect(page.locator("[data-owner] a[download='studio-rezervacie.csv']")).toBeAttached()

    /* cancelling frees the seats */
    await page.locator("[data-my-bookings]").getByRole("button", { name: "Zrušiť" }).click()
    await expect(page.locator('[data-lesson="DNES · ŠTVRTOK-07:00"]')).toContainText("4 MIESTA")
  })

  test("pays by card with real number checks", async ({ page }) => {
    await page.goto("/ukazky/rezervacie")
    await expect(page.locator("[data-schedule][data-ready]")).toBeAttached()
    await page.locator('[data-lesson="DNES · ŠTVRTOK-17:15"]').getByRole("button", { name: "Rezervovať" }).click()
    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("Meno a priezvisko").fill("Peter Kováč")
    await dialog.getByLabel("E-mail").fill("peter@priklad.sk")
    await dialog.getByLabel("Telefón").fill("0900 123 456")
    await dialog.getByRole("button", { name: /Pokračovať na platbu/ }).click()
    await dialog.getByLabel("Číslo karty").fill("4242 4242 4242 4241")
    await dialog.getByLabel("Platnosť").fill("12/30")
    await dialog.getByLabel("CVC").fill("123")
    await dialog.getByRole("button", { name: /Zaplatiť/ }).click()
    /* a wrong number is refused, a right one goes through */
    await expect(dialog).toContainText("Číslo karty nesedí")
    await dialog.getByLabel("Číslo karty").fill("4242 4242 4242 4242")
    await dialog.getByRole("button", { name: /Zaplatiť/ }).click()
    await expect(dialog).toContainText("REZERVÁCIA POTVRDENÁ")
    await expect(dialog).toContainText("zaplatené kartou")
  })

  test("a full lesson takes a waitlist and tells it when a seat frees", async ({ page }) => {
    await page.goto("/ukazky/rezervacie")
    await expect(page.locator("[data-schedule][data-ready]")).toBeAttached()
    await page.getByRole("button", { name: "PIATOK" }).click()
    const full = page.locator('[data-lesson="PIATOK-17:15"]')
    await expect(full).toContainText("OBSADENÉ")
    await full.getByRole("button", { name: /Čakačka/ }).click()
    await full.getByPlaceholder("váš e-mail").fill("cakam@priklad.sk")
    await full.getByRole("button", { name: "Dať vedieť" }).click()
    await expect(full).toContainText("Ste na čakačke")
  })
})

test.describe("WordPress demo", () => {
  test("the editor changes the site, publishes a revision, restores it and sells", async ({ page }) => {
    await page.goto("/ukazky/wordpress")
    const editor = page.locator("[data-editor]")
    /* the store marks the editor ready once hydrated; typing before that is lost */
    await expect(page.locator("[data-editor][data-ready]")).toBeAttached()
    /* the hero and the close carry previews of their own; the editor's is the one being edited */
    const desktop = editor.locator('[data-preview="desktop"]')

    const headline = editor.getByLabel("Nadpis", { exact: true })
    await headline.fill("Rožky sú na pulte.")
    await expect(desktop.locator(".wp-headline")).toHaveText("Rožky sú na pulte.")

    await editor.getByRole("button", { name: "Publikovať" }).click()
    await expect(editor).toContainText("Zverejnené o")
    await headline.fill("Iný nadpis")
    await expect(desktop.locator(".wp-headline")).toHaveText("Iný nadpis")
    await editor.locator("[data-revisions] summary").click()
    await editor.getByRole("button", { name: "Obnoviť" }).first().click()
    await expect(headline).toHaveValue("Rožky sú na pulte.")

    /* the shop: a product with a cart that counts */
    await editor.getByRole("tab", { name: "Obchod" }).click()
    await editor.getByRole("checkbox").check()
    await desktop.locator("[data-add-to-cart]").click()
    await expect(desktop.locator("[data-cart]")).toHaveAttribute("data-cart", "1")

    /* a dish and a post */
    await editor.getByRole("tab", { name: "Sekcie" }).click()
    await editor.getByRole("button", { name: "+ Pridať" }).click()
    await editor.getByLabel("Názov jedla").last().fill("Makový závin")
    await expect(desktop).toContainText("Makový závin")
    await editor.getByRole("tab", { name: "Novinky" }).click()
    await editor.getByRole("button", { name: "+ Nový článok" }).click()
    await editor.getByLabel("Nadpis článku").first().fill("Sobota: pečieme naživo")
    await expect(desktop).toContainText("Sobota: pečieme naživo")

    /* the language: the whole site turns English, the visitor's own words
       included, and the English can be corrected by hand */
    await editor.getByRole("tab", { name: "Jazyk" }).click()
    await editor.getByRole("button", { name: "EN", exact: true }).click()
    await expect(desktop.locator(".wp-headline")).toHaveText("Rolls are on the counter.")
    await expect(desktop).toContainText("Poppy seed strudel")
    await expect(desktop).toContainText("Saturday: we bake live")
    await expect(desktop).toContainText("Booking")
    await expect(desktop).toContainText("ADD TO CART")
    await editor.getByLabel("Nadpis (EN)").fill("Fresh rolls from six.")
    await expect(desktop.locator(".wp-headline")).toHaveText("Fresh rolls from six.")
    await expect(editor).toContainText("UPRAVENÉ")
    await editor.getByRole("button", { name: "SK", exact: true }).click()
    await expect(desktop.locator(".wp-headline")).toHaveText("Rožky sú na pulte.")

    /* the phone preview, and the close that names the changes */
    await page.getByRole("button", { name: "Telefón" }).click()
    await expect(editor.locator('[data-preview="phone"]')).toBeVisible()
    await expect(page.locator("[data-changes]")).toContainText("nadpis")
    await expect(page.locator("[data-changes]")).toContainText("obchod")

    /* the work survives a reload */
    await page.reload()
    await expect(page.locator("[data-editor][data-ready]")).toBeAttached()
    await expect(page.locator("[data-editor]").getByLabel("Nadpis", { exact: true })).toHaveValue("Rožky sú na pulte.")
  })
})
