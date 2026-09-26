import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.METAL_URL || 'http://127.0.0.1:4338';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  let fullRequests = 0; page.on('request', r => { if (r.url().endsWith('journey-scroll-1080.mp4')) fullRequests++; });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 1250000, uploadThroughput: 1250000 });
  const start = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__coderaMotion?.active && !document.documentElement.classList.contains('codera-loading'), null, { timeout: 10000 });
  const startup = { ms: Date.now() - start, ...await page.evaluate(() => ({ bytes: window.__coderaMotion.downloadedBytes, percent: window.__coderaMotion.bufferedPercent })) };
  assert(startup.ms < 7000); assert(startup.bytes < 7000000); assert(startup.percent < 100);
  assert.equal(await page.locator('main').evaluate(e => e.inert), false);
  assert.deepEqual(await page.locator('video').evaluate(v => [v.videoWidth, v.videoHeight]), [1920, 1080]);
  const jumps = [];
  for (const p of [.85, .1, .98]) {
    const began = Date.now();
    await page.evaluate(p => scrollTo(0, p * (document.querySelector('.journey').offsetHeight - innerHeight)), p);
    await page.waitForFunction(p => Math.abs(window.__coderaMotion.progress - p) < .003 && Math.abs(window.__coderaMotion.targetTime - window.__coderaMotion.displayedTime) < .1, p, { timeout: 5000 });
    jumps.push(Date.now() - began);
  }
  assert.equal(fullRequests, 0);
  console.log('PASS fast sharp entry and cold distant targets', JSON.stringify({ startup, jumps }));
  await page.waitForFunction(() => window.__coderaMotion.fullyBuffered, null, { timeout: 90000 });
  await cdp.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  for (const p of [0, 1, .5, .1]) {
    await page.evaluate(p => scrollTo(0, p * (document.querySelector('.journey').offsetHeight - innerHeight)), p);
    await page.waitForFunction(p => Math.abs(window.__coderaMotion.progress - p) < .003 && Math.abs(window.__coderaMotion.targetTime - window.__coderaMotion.displayedTime) < .1, p);
  }
  assert.deepEqual(errors, []); console.log('PASS complete background prefetch, offline reverse/endpoints, no JS errors');
  await page.evaluate(() => scrollTo(0, 0));
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 1250000, uploadThroughput: 1250000 });
  const revisit = Date.now(); await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__coderaMotion?.active && !document.documentElement.classList.contains('codera-loading'));
  assert.equal(await page.evaluate(() => window.__coderaMotion.cacheHit), true);
  console.log('PASS cached entry', Date.now() - revisit); await page.close();
  for (const mode of ['unsupported', 'failed-segment']) {
    const fallback = await browser.newPage();
    if (mode === 'unsupported') await fallback.addInitScript(() => { window.MediaSource = undefined; });
    else await fallback.route('**/stream-v1/**', r => r.abort());
    await fallback.goto(url, { waitUntil: 'domcontentloaded' });
    await fallback.waitForFunction(() => window.__coderaMotion.delivery === 'prepared-fallback' && !document.documentElement.classList.contains('codera-loading'));
    await fallback.waitForFunction(() => window.__coderaMotion.prepared);
    assert(await fallback.locator('h1').isVisible()); console.log('PASS nonblocking compatibility fallback', mode); await fallback.close();
  }
  const skip = await browser.newPage(); await skip.route('**/stream-v1/**', () => {});
  await skip.goto(url); await skip.locator('#entry-loader button').click();
  assert.equal(await skip.evaluate(() => window.__coderaMotion.active), false); assert(await skip.locator('h1').isVisible()); await skip.close();
  console.log('PASS static skip while opening data stalls');
  const failed = await browser.newPage();
  await failed.route('**/*.mp4', r => r.abort());
  await failed.goto(url); await failed.waitForFunction(() => window.__coderaMotion.reason === 'video-unavailable');
  assert(await failed.locator('h1').isVisible()); await failed.close();
  for (const options of [{ reducedMotion: 'reduce' }, { isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } }, { javaScriptEnabled: false }]) {
    const staticPage = await browser.newPage(options); let media = false;
    staticPage.on('request', r => { if (/\.(mp4|m4s)$/.test(r.url())) media = true; });
    await staticPage.goto(url); assert(await staticPage.locator('h1').isVisible()); assert.equal(media, false);
    assert.equal(await staticPage.locator('#entry-loader').count(), 0); await staticPage.close();
  }
  console.log('PASS failed media, reduced motion, touch and no-JS static entry');
} finally { await browser.close(); }
