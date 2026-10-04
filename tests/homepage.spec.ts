import { expect, test } from "@playwright/test"

test.describe("Silver production homepage", () => {
  test("indexable content, current prices and nonce-protected scripts", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", error => { errors.push(error.message) })
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    expect(response?.headers()["content-security-policy"]).toContain("strict-dynamic")
    await expect(page.locator("h1")).toContainText("Vaša firma.")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.codera.sk/")
    await expect(page.locator('.offer')).toHaveCount(2)
    await expect(page.locator('.offer').first()).toContainText("599 €")
    await expect(page.locator('.offer').last()).toContainText("1 199 €")
    await expect(page.locator('main')).toHaveJSProperty('inert', false, { timeout: 6000 })
    expect(await page.locator('script[src]').evaluateAll(nodes => nodes.every(n => Boolean((n as HTMLScriptElement).nonce)))).toBe(true)
    expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toHaveLength(2)
    expect(errors).toEqual([])
  })
  test("complete portfolio without decorative labels", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('.project')).toHaveCount(5)
    await expect(page.locator('.project .concept,.project-caption')).toHaveCount(0)
    // The entry cover intentionally blocks visitors while motion layout is prepared.
    // Do not programmatically scroll an inert page before that layout is final.
    await expect(page.locator('main')).toHaveJSProperty('inert', false, { timeout: 25000 })
    await page.locator('.project').first().evaluate(el=>el.scrollIntoView({block:'start'}))
    await page.locator('.project-preview').first().click()
    await expect(page.locator('.project-dialog')).toBeVisible()
    await expect.poll(() => page.locator('#preview-image').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(2880)
    await page.keyboard.press('Escape')
    await expect(page.locator('.project-dialog')).not.toBeVisible()
    await expect(page.locator('.project-preview').first()).toBeFocused()
  })
  test("navigation, disclosures and contact validation", async ({ page }) => {
    await page.goto('/')
    const hrefs=await page.locator('a[href^="#"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')).filter((h):h is string=>!!h&&h.length>1))
    for(const href of new Set(hrefs))await expect(page.locator(href)).toHaveCount(1)
    await page.locator('.offer summary').first().click()
    await expect(page.locator('.offer-details').first()).toHaveAttribute('open','')
    expect(await page.locator('#dopyt').evaluate(el=>(el as HTMLFormElement).checkValidity())).toBe(false)
    await expect(page.locator('.footer-wordmark img')).toHaveAttribute('src','/brand/codera-wordmark-display.svg')
  })
  test("mobile and reduced-motion content", async ({ page }) => {
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.setViewportSize({width:390,height:844})
    const videos: string[]=[]
    page.on('request',r=>{if(r.url().endsWith('.mp4'))videos.push(r.url())})
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await page.locator('.menu-button').click()
    await page.locator('#mobile-menu a[href="#praca"]').click()
    await expect(page.locator('#mobile-menu')).not.toBeVisible()
    expect(videos).toEqual([])
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    expect(await page.locator('.project').first().evaluate(el=>getComputedStyle(el).position)).toBe('relative')
  })
  test("content and SEO without JavaScript", async ({ browser, request }) => {
    const page=await browser.newPage({javaScriptEnabled:false})
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.offer')).toHaveCount(2)
    await expect(page.locator('a[href="mailto:kontakt@codera.sk"]').first()).toBeVisible()
    expect((await request.get('/robots.txt')).ok()).toBe(true)
    expect((await request.get('/sitemap.xml')).ok()).toBe(true)
    await page.close()
  })
  test("demo navigation back to the HTML homepage", async ({ page }) => {
    await page.goto('/ukazky/wordpress')
    const home=page.locator('a[href="/"]').first()
    await expect(home).toBeVisible()
    await home.click()
    await expect(page.locator('h1')).toContainText('Vaša firma.')
    await expect(page.locator('main')).toHaveJSProperty('inert', false, { timeout: 6000 })
  })
})


test('original film streams through native MediaSource and reverses under CSP', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native AVC motion is covered here in Chromium; other engines retain the static homepage checks.')
  await page.goto('/')
  await page.waitForFunction(() => {
    const state = (window as unknown as { __coderaMotion?: { prepared: boolean; error: string } }).__coderaMotion
    return state?.prepared || state?.error
  }, null, { timeout: 45000 })
  const read = () => page.evaluate(() => {
    const state = (window as unknown as { __coderaMotion: { error: string; delivery: string; active: boolean; paused: boolean; displayedTime: number; frames: unknown[] } }).__coderaMotion
    const video = document.querySelector('video') as HTMLVideoElement
    return { ...state, width: video.videoWidth, height: video.videoHeight }
  })
  let motion = await read()
  expect(motion.error).toBe('')
  expect(motion.delivery).toMatch(/^native-mse-(worker-)?single-fetch$/)
  expect([motion.width, motion.height]).toEqual([1920, 1080])
  await expect(page.locator('main')).toHaveJSProperty('inert', false, { timeout: 6000 })
  expect(motion.active).toBe(true)
  expect(motion.paused).toBe(false)
  await expect(page.locator('#motion-toggle')).toBeVisible()
  await page.locator('.journey').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY + (element.clientHeight - innerHeight) * 0.7))
  await expect.poll(async () => (await read()).displayedTime, { timeout: 20000 }).toBeGreaterThan(9.5)
  await page.locator('.journey').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY + (element.clientHeight - innerHeight) * 0.1))
  await expect.poll(async () => (await read()).displayedTime, { timeout: 15000 }).toBeLessThan(4)
  motion = await read()
  expect(motion.frames.length).toBeGreaterThan(2)
  expect(motion.error).toBe('')
})

test('automatic cover escape retains reserved geometry and starts late video without a click', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Real AVC/MSE automatic entry is covered in Chromium.')
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.context().route('**/motion/metal/*.mp4', async route => {
    await gate
    await route.continue().catch(() => {})
  })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const initial = await page.locator('.journey').evaluate(element => ({ height: element.clientHeight, viewport: innerHeight }))
    expect(initial.height).toBeGreaterThanOrEqual(initial.viewport * 6.9)
    await expect(page.locator('main')).toHaveJSProperty('inert', false, { timeout: 6000 })
    expect(await page.locator('.journey').evaluate(element => element.clientHeight)).toBe(initial.height)
    expect(await page.evaluate(() => (window as unknown as { __coderaMotion?: { prepared: boolean } }).__coderaMotion?.prepared)).toBe(false)
    release()
    await page.waitForFunction(() => (window as unknown as { __coderaMotion?: { active: boolean; paused: boolean } }).__coderaMotion?.active, null, { timeout: 20000 })
    expect(await page.locator('.journey').evaluate(element => element.clientHeight)).toBe(initial.height)
    await expect(page.locator('#motion-toggle')).toBeVisible()
    await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true')
  } finally {
    release()
  }
})

test('explicit entry skip is respected when the video arrives later', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Real AVC/MSE automatic entry is covered in Chromium.')
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.context().route('**/motion/metal/*.mp4', async route => {
    await gate
    await route.continue().catch(() => {})
  })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.locator('#entry-loader button').click({ timeout: 3500 })
    await expect(page.locator('main')).toHaveJSProperty('inert', false)
    const compactHeight = await page.locator('.journey').evaluate(element => element.clientHeight)
    release()
    await page.waitForFunction(() => (window as unknown as { __coderaMotion?: { prepared: boolean } }).__coderaMotion?.prepared, null, { timeout: 20000 })
    const state = await page.evaluate(() => (window as unknown as { __coderaMotion: { active: boolean; paused: boolean } }).__coderaMotion)
    expect(state.active).toBe(false)
    expect(state.paused).toBe(true)
    expect(await page.locator('.journey').evaluate(element => element.clientHeight)).toBe(compactHeight)
  } finally {
    release()
  }
})
