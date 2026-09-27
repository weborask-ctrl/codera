// Production smoke/behavior checks. Run separately from performance benchmarks.
// SILVER_URL=https://www.codera.sk node scripts/silver-stream-check.mjs
// Optional: --headed; BROWSER_CHANNEL=msedge (default on Windows).
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const url = process.env.SILVER_URL || 'http://127.0.0.1:4342/';
const headed = process.argv.includes('--headed');
const output = resolve(process.env.SILVER_REPORT || 'test-results/silver-stream/functional.json');
const mediaPattern = /\/journey-stream-f60088d67cff\.mp4(?:\?|$)/;
const checks = [], errors = [], violations = [];
const report = { url, createdAt: new Date().toISOString(), headed, checks, limitations: [
  'Browser automation does not establish physical presentation or universal smoothness.',
  'Touch is emulated. The fallback capability override is explicitly a simulation.',
  'Frame intervals come from real requestVideoFrameCallback metadata during the recorded sweep; no hardware FPS guarantee follows.',
] };
await mkdir(resolve(output, '..'), { recursive: true });
async function save() { await writeFile(output, JSON.stringify(report, null, 2) + '\n'); }
async function check(name, run) {
  try { const detail = await run(); checks.push({ name, status: detail?.skipped ? 'skipped' : 'pass', detail }); console.log(`${detail?.skipped ? 'SKIP' : 'PASS'} ${name}`); return !detail?.skipped; }
  catch (error) { checks.push({ name, status: 'fail', error: String(error.stack || error) }); console.error(`FAIL ${name}: ${error.message}`); return false; }
  finally { await save(); }
}
const browser = await chromium.launch({
  headless: !headed,
  channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
});
const watchdog = setTimeout(() => { report.fatal = 'Suite exceeded 240 seconds'; void browser.close(); }, 240000);
async function setup(options = {}, label = 'desktop') {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...options });
  const requests = [], responses = [];
  context.on('request', request => { if (/\.mp4(?:\?|$)/.test(request.url())) requests.push({ url: request.url(), range: request.headers().range || null }); });
  context.on('response', response => { if (mediaPattern.test(response.url())) responses.push({ url: response.url(), status: response.status(), headers: response.headers() }); });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push({ label, error: String(error) }));
  await page.addInitScript(() => {
    window.__streamCheck = { frames: [], violations: [] };
    document.addEventListener('securitypolicyviolation', event => window.__streamCheck.violations.push({ directive: event.effectiveDirective, blocked: event.blockedURI }));
    const request = HTMLVideoElement.prototype.requestVideoFrameCallback;
    if (request) HTMLVideoElement.prototype.requestVideoFrameCallback = function(callback) {
      return request.call(this, (now, metadata) => {
        const frames = window.__streamCheck.frames;
        if (frames.at(-1)?.mediaTime !== metadata.mediaTime) {
          frames.push({ now, mediaTime: metadata.mediaTime, presentationTime: metadata.presentationTime, presentedFrames: metadata.presentedFrames });
          if (frames.length > 3000) frames.shift();
        }
        callback(now, metadata);
      });
    };
  });
  return { context, page, requests, responses, label };
}
async function close(test) {
  if (!test.page.isClosed()) violations.push(...await test.page.evaluate(() => window.__streamCheck?.violations || []).catch(() => []));
  await test.context.close();
}
const state = page => page.evaluate(() => {
  const motion = window.__coderaMotion || {}, video = document.querySelector('#journey-video');
  return { active: motion.active, paused: motion.paused, prepared: motion.prepared, error: motion.error, reason: motion.reason,
    readyMs: motion.readyMs, delivery: motion.delivery, displayedTime: motion.displayedTime, targetTime: motion.targetTime,
    actualFrameCount: window.__streamCheck.frames.length, lastFrame: window.__streamCheck.frames.at(-1),
    buffered: motion.buffer, stats: motion.stats, hasJourney: document.querySelector('.journey').classList.contains('has-journey'),
    height: document.querySelector('.journey').offsetHeight,
    media: { width: video.videoWidth, height: video.videoHeight, opacity: getComputedStyle(video).opacity, src: video.currentSrc, srcObject: video.srcObject?.constructor.name || null },
    workerSupported: typeof MediaSource !== 'undefined' && MediaSource.canConstructInDedicatedWorker === true,
  };
});
async function ready(page) {
  await page.waitForFunction(() => window.__coderaMotion?.prepared || window.__coderaMotion?.error, null, { timeout: 45000 });
  const result = await state(page);
  assert.equal(result.error, '', result.error || 'Motion error'); assert.equal(result.prepared, true);
  await page.waitForFunction(() => !document.documentElement.classList.contains('codera-loading') && !document.querySelector('main').inert, null, { timeout: 6000 });
  return result;
}
async function active(page) {
  const result = await ready(page);
  if (!result.active || result.paused) await page.locator('#motion-toggle').click();
  await page.waitForFunction(() => window.__coderaMotion?.active && !window.__coderaMotion.paused);
}
const scroll = (page, progress) => page.evaluate(progress => {
  const journey = document.querySelector('.journey');
  scrollTo(0, journey.getBoundingClientRect().top + scrollY + (journey.offsetHeight - innerHeight) * progress);
}, progress);
async function motionPast(page, threshold, direction) {
  await page.waitForFunction(({ threshold, direction }) => direction * (window.__coderaMotion.displayedTime - threshold) > 0, { threshold, direction }, { timeout: 15000 });
  const result = await state(page); assert.equal(result.error, ''); assert.ok(Number(result.media.opacity) > .9);
  assert.ok(result.lastFrame && Number.isFinite(result.lastFrame.mediaTime), 'No actual rVFC presentation observed');
  return result;
}
const percentile = (values, fraction) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.floor((sorted.length - 1) * fraction)] : null; };
let desktop;
try {
  desktop = await setup();
  const page = desktop.page;
  const motionReady = await check('Native 1080p streaming starts under the real response CSP', async () => {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    const csp = response.headers()['content-security-policy'];
    assert.ok(csp && /worker-src/.test(csp), 'Expected production CSP with worker policy');
    await active(page); const result = await state(page);
    assert.deepEqual([result.media.width, result.media.height], [1920, 1080]);
    assert.equal(result.delivery, result.workerSupported ? 'native-mse-worker-single-fetch' : 'native-mse-single-fetch');
    assert.equal(result.buffered.transportWorker, result.workerSupported);
    assert.ok(result.actualFrameCount > 0);
    assert.equal(await page.locator('canvas#motion-canvas').count(), 0, 'Native video must remain the renderer');
    return { csp, ...result };
  });
  if (motionReady) {
    await check('Forward and reverse scrolling present actual video frames', async () => {
      await scroll(page, .72); const forward = await motionPast(page, 9.7, 1);
      await scroll(page, .1); const reverse = await motionPast(page, 4.0, -1);
      assert.ok(reverse.actualFrameCount > forward.actualFrameCount); return { forward, reverse };
    });
    await check('The content-hashed original stream uses one completed fetch without seek ranges', async () => {
      await page.waitForFunction(() => window.__coderaMotion.buffer?.fullyBuffered, null, { timeout: 60000 });
      assert.equal(desktop.requests.length, 1, JSON.stringify(desktop.requests));
      assert.match(desktop.requests[0].url, mediaPattern); assert.equal(desktop.requests[0].range, null);
      assert.equal(desktop.responses.length, 1); assert.equal(desktop.responses[0].status, 200);
      assert.equal(Number(desktop.responses[0].headers['content-length']), 50405743);
      return { requests: desktop.requests, responses: desktop.responses, state: await state(page) };
    });
    await check('Pause freezes presented frames; resume reaches the new position', async () => {
      await page.locator('#motion-toggle').click(); await page.waitForTimeout(350);
      const before = await state(page); await scroll(page, .4); await page.waitForTimeout(700);
      const paused = await state(page); assert.equal(paused.paused, true); assert.deepEqual(paused.lastFrame, before.lastFrame);
      await page.locator('#motion-toggle').click(); const resumed = await motionPast(page, 5.8, 1);
      assert.equal(resumed.paused, false); return { paused, resumed };
    });
    await check('Offstage motion stops and a top return restores the opening', async () => {
      await page.locator('#sluzby').scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
      const before = await state(page); await page.waitForTimeout(700); const after = await state(page);
      assert.deepEqual(after.lastFrame, before.lastFrame);
      await scroll(page, 0); await motionPast(page, 2.65, -1); return { before, after, returned: await state(page) };
    });
    await check('Record real frame intervals during a continuous warm forward/reverse sweep', async () => {
      const start = await page.evaluate(() => performance.now());
      for (const direction of [1, -1]) for (let i = 1; i <= 80; i++) { await scroll(page, direction > 0 ? i / 80 : 1 - i / 80); await page.waitForTimeout(50); }
      const frames = await page.evaluate(start => window.__streamCheck.frames.filter(frame => frame.now >= start), start);
      const intervals = frames.slice(1).map((frame, i) => frame.now - frames[i].now);
      assert.ok(frames.length > 100, 'Too few actual frames for a useful sweep');
      return { frames: frames.length, intervalMedianMs: percentile(intervals, .5), intervalP95Ms: percentile(intervals, .95), longestIntervalMs: Math.max(...intervals), acceptance: 'Observation, not a universal FPS assertion', firstFrame: frames[0], lastFrame: frames.at(-1) };
    });
  }
  await check('Both individual pricing controls expand and collapse both offers', async () => {
    const summaries = page.locator('.offer-details summary'); assert.equal(await summaries.count(), 2);
    await summaries.first().click(); assert.deepEqual(await page.locator('.offer-details').evaluateAll(items => items.map(item => item.open)), [true, true]);
    await summaries.nth(1).click(); assert.deepEqual(await page.locator('.offer-details').evaluateAll(items => items.map(item => item.open)), [false, false]);
  });
  await check('All five full previews retain sufficient resolution and contain framing', async () => {
    const images = page.locator('.project-visual img'), rows = []; assert.equal(await images.count(), 5);
    for (let i = 0; i < 5; i++) {
      await images.nth(i).scrollIntoViewIfNeeded();
      await page.waitForFunction(i => { const image = document.querySelectorAll('.project-visual img')[i]; return image.complete && image.naturalWidth > 0; }, i, { timeout: 15000 });
      const row = await images.nth(i).evaluate(image => ({ src: image.currentSrc, width: image.getBoundingClientRect().width, dpr: devicePixelRatio, objectFit: getComputedStyle(image).objectFit }));
      const sourceWidth = Number(/-(1440|2880)\.webp/.exec(row.src)?.[1]);
      assert.ok(sourceWidth >= row.width * row.dpr * .98); assert.equal(row.objectFit, 'contain'); rows.push({ ...row, sourceWidth });
    }
    return rows;
  });
  await close(desktop); desktop = null;
  for (const mode of ['reduced-motion', 'touch', 'no-js']) await check(`${mode} keeps static readable entry and makes no video request`, async () => {
    const test = await setup(mode === 'reduced-motion' ? { reducedMotion: 'reduce' } : mode === 'touch' ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : { javaScriptEnabled: false }, mode);
    try {
      await test.page.goto(url, { waitUntil: 'load' }); await test.page.locator('.hero-beat h1').waitFor({ state: 'visible' }); await test.page.waitForTimeout(700);
      assert.deepEqual(test.requests, []); assert.equal(await test.page.locator('.journey').evaluate(element => element.classList.contains('has-journey')), false);
      assert.equal(await test.page.locator('main').evaluate(element => element.inert), false);
      return { mediaRequests: test.requests.length, title: await test.page.locator('.hero-beat h1').innerText() };
    } finally { await close(test); }
  });
  await check('Explicit simulation: unavailable worker MediaSource falls back to main-thread MSE', async () => {
    const test = await setup({}, 'main-thread-fallback');
    try {
      await test.page.addInitScript(() => Object.defineProperty(MediaSource, 'canConstructInDedicatedWorker', { configurable: true, value: false }));
      await test.page.goto(url, { waitUntil: 'domcontentloaded' }); await active(test.page);
      const result = await state(test.page); assert.equal(result.delivery, 'native-mse-single-fetch'); assert.equal(result.buffered.transportWorker, false);
      await scroll(test.page, .2); await motionPast(test.page, 3.5, 1);
      return { simulation: 'Only MediaSource.canConstructInDedicatedWorker is overridden; real media fetching and decoding remain active', result };
    } finally { await close(test); }
  });
  await check('Skipping entry before delayed real media readiness never expands or starts the hero', async () => {
    const test = await setup({}, 'entry-skip'); let release, blocked = 0;
    const gate = new Promise(resolve => { release = resolve; });
    try {
      await test.context.route(mediaPattern, async route => { blocked++; await gate; await route.continue().catch(() => {}); });
      await test.page.goto(url, { waitUntil: 'domcontentloaded' });
      await test.page.locator('#entry-loader button').waitFor({ state: 'visible', timeout: 3500 }); assert.ok(blocked > 0);
      await test.page.locator('#entry-loader button').click(); const before = await state(test.page); release(); await ready(test.page);
      const late = await state(test.page); assert.equal(late.active, false); assert.equal(late.paused, true); assert.equal(late.hasJourney, false); assert.equal(late.height, before.height);
      return { blocked, before, late };
    } finally { release(); await close(test); }
  });
  await check('No uncaught JavaScript errors or browser CSP violations', async () => { assert.deepEqual(errors, []); assert.deepEqual(violations, []); return { errors, violations }; });
} catch (error) { report.fatal = String(error.stack || error); }
finally {
  clearTimeout(watchdog); if (desktop) await close(desktop); await browser.close();
  report.errors = errors; report.violations = violations;
  report.summary = { passed: checks.filter(item => item.status === 'pass').length, failed: checks.filter(item => item.status === 'fail').length, skipped: checks.filter(item => item.status === 'skipped').length };
  if (report.fatal || report.summary.failed) process.exitCode = 1;
  await save(); console.log(JSON.stringify({ output, ...report.summary, fatal: report.fatal }, null, 2));
}
