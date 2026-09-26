import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.METAL_URL || 'http://127.0.0.1:4337';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
await mkdir('test-results/entry', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 1250000, uploadThroughput: 1250000 });
  const start = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  assert(await page.locator('html').evaluate(el => el.classList.contains('codera-loading')));
  assert.equal(await page.locator('main').evaluate(el => el.inert), true);
  await page.mouse.wheel(0, 1000); await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => scrollY), 0);
  await page.screenshot({ path: 'test-results/entry/loader.png' });
  await page.waitForFunction(() => window.__coderaMotion.prepared && !document.documentElement.classList.contains('codera-loading'), null, { timeout: 90000 });
  const coldMs = Date.now() - start;
  assert.equal(await page.evaluate(() => window.__coderaMotion.downloadedBytes), 50378423);
  assert.equal(await page.locator('main').evaluate(el => el.inert), false);
  assert.deepEqual(await page.locator('video').evaluate(v => [v.videoWidth, v.videoHeight]), [1920, 1080]);
  await cdp.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  for (const p of [.95, .1, .5, 1, 0]) {
    await page.evaluate(p => scrollTo(0, p * (document.querySelector('.journey').offsetHeight - innerHeight)), p);
    await page.waitForFunction(p => Math.abs(window.__coderaMotion.progress - p) < .003 && Math.abs(window.__coderaMotion.targetTime - window.__coderaMotion.displayedTime) < .1, p);
  }
  assert.deepEqual(errors, []);
  console.log(`PASS complete preparation before reveal (${coldMs} ms at 10 Mbit/s), native-scroll lock during loader, full resolution, reverse/endpoints without network`);
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 1250000, uploadThroughput: 1250000 });
  const revisit = Date.now(); await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__coderaMotion.prepared && !document.documentElement.classList.contains('codera-loading'));
  assert.equal(await page.evaluate(() => window.__coderaMotion.cacheHit), true);
  const cachedMs = Date.now() - revisit; assert(cachedMs < 5000, `Cached revisit took ${cachedMs} ms`);
  console.log(`PASS cached revisit ${cachedMs} ms`); await page.close();

  const skip = await browser.newPage();
  await skip.route('**/*.mp4', () => {});
  await skip.goto(url); await skip.locator('#entry-loader button').click();
  assert.equal(await skip.locator('html').evaluate(el => el.classList.contains('codera-loading')), false);
  assert.equal(await skip.evaluate(() => window.__coderaMotion.active), false);
  assert(await skip.locator('h1').isVisible()); console.log('PASS slow connection can enter static site without starting unprepared motion'); await skip.close();

  const failed = await browser.newPage(); await failed.route('**/*.mp4', route => route.abort());
  await failed.goto(url); await failed.waitForFunction(() => window.__coderaMotion.reason === 'video-unavailable');
  assert.equal(await failed.locator('html').evaluate(el => el.classList.contains('codera-loading')), false);
  assert(await failed.locator('h1').isVisible()); console.log('PASS failed download releases loader'); await failed.close();
  for (const options of [{ reducedMotion: 'reduce' }, { isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } }, { javaScriptEnabled: false }]) {
    const staticPage = await browser.newPage(options); let media = false;
    staticPage.on('request', r => { if (r.url().endsWith('.mp4')) media = true; });
    await staticPage.goto(url); assert(await staticPage.locator('h1').isVisible()); assert.equal(media, false);
    assert.equal(await staticPage.locator('#entry-loader').count(), 0); await staticPage.close();
  }
  console.log('PASS reduced motion, touch and no-JS have immediate static entry');
} finally { await browser.close(); }
