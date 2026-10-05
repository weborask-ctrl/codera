// Automatic entry and real HTTP byte pacing against the unchanged built local site.
// SILVER_URL=http://127.0.0.1:4342 node scripts/silver-auto-check.mjs
// Optional --functional-only, --performance-only, --headed, SILVER_AUTO_REPORT.
// Only media responses are paced; ordinary page resources remain unthrottled.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const upstream = new URL(process.env.SILVER_URL || 'http://127.0.0.1:4342/');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(upstream.hostname), 'Use a local production build for controlled pacing');
const proxyPort = Number(process.env.SILVER_PROXY_PORT || 4343);
const headed = process.argv.includes('--headed');
const functional = !process.argv.includes('--performance-only');
const filter = process.env.SILVER_CHECK_FILTER ? new RegExp(process.env.SILVER_CHECK_FILTER, 'i') : null;
const performanceChecks = !process.argv.includes('--functional-only');
const output = resolve(process.env.SILVER_AUTO_REPORT || 'test-results/silver-auto/report.json');
const mainResponse = await fetch(new URL('/silver/main.mjs', upstream));
assert.ok(mainResponse.ok, 'The built Silver controller must be available');
const main = await mainResponse.text();
const mediaPath = process.env.SILVER_MEDIA_PATH || main.match(/\/motion\/metal\/journey-[^'"\s]+\.mp4/)?.[0];
assert.ok(mediaPath, 'Could not discover the actual video URL in the built controller');
const asset = await fetch(new URL(mediaPath, upstream), { method: 'HEAD' });
assert.ok(asset.ok, 'The actual production video must be available');
const assetBytes = Number(asset.headers.get('content-length'));
assert.ok(assetBytes > 0);
const report = {
  createdAt: new Date().toISOString(), upstream: upstream.href, mediaPath, assetBytes, headed,
  checks: [], scenarios: [], errors: [], violations: [],
  limitations: [
    'Only media responses are byte-paced. Page, scripts, fonts and images are unthrottled.',
    'Every cold run uses a fresh browser context and no-store media. Worker fetches pass through the actual paced HTTP response; no Playwright fulfillment or page-only CDP throttling.',
    'Frame counts are unique real requestVideoFrameCallback presentations, not filtered controller targets.',
    'Raw scroll-to-film lag is in source-video seconds, not wall-clock input latency.',
    'Headless timing and emulated touch do not certify physical presentation or every device.',
  ],
};
await mkdir(resolve(output, '..'), { recursive: true });
const save = () => writeFile(output, JSON.stringify(report, null, 2) + '\n');
let profile = { label: 'idle', mbps: 0, latencyMs: 0, holdMs: 0, requests: [] };
function scenario(label, options = {}) {
  profile = { label, mbps: 0, latencyMs: 0, holdMs: 0, requests: [], ...options };
  report.scenarios.push(profile);
  return profile;
}

// Forward real production HTML/modules/CSP. Only media timing/cache differ.
// Cumulative byte pacing prevents timer drift and works for dedicated workers.
const proxy = createServer(async (request, response) => {
  const destination = new URL(request.url, upstream);
  const isMedia = destination.pathname === mediaPath;
  const current = profile;
  const record = isMedia ? { url: destination.pathname, startedAt: performance.now(), sentBytes: 0, range: request.headers.range || null } : null;
  if (record) current.requests.push(record);
  const abort = new AbortController();
  response.on('close', () => abort.abort());
  try {
    if (current.blockMain && destination.pathname === '/silver/main.mjs') {
      response.writeHead(503, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      response.end('Intentional missing controller for entry failure test'); return;
    }
    if (isMedia && current.holdMs) await delay(current.holdMs, null, { signal: abort.signal });
    if (isMedia && current.failNext) {
      current.failNext = false; record.status = 503;
      response.writeHead(503, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      response.end('Intentional media failure for recovery test'); return;
    }
    const headers = { ...request.headers, 'accept-encoding': 'identity' };
    delete headers.host; delete headers.connection;
    const incoming = await fetch(destination, { method: request.method, headers, signal: abort.signal, redirect: 'manual' });
    const forwarded = {};
    for (const [name, value] of incoming.headers) {
      if (!['connection', 'transfer-encoding', 'content-encoding', 'keep-alive'].includes(name)) forwarded[name] = value;
    }
    if (isMedia) {
      forwarded['cache-control'] = 'no-store';
      delete forwarded.etag; delete forwarded['last-modified'];
      record.status = incoming.status; record.contentLength = Number(incoming.headers.get('content-length'));
      if (current.latencyMs) await delay(current.latencyMs, null, { signal: abort.signal });
    }
    response.writeHead(incoming.status, forwarded);
    if (request.method === 'HEAD' || !incoming.body) { response.end(); return; }
    const began = performance.now(); let bytes = 0;
    for await (const source of incoming.body) {
      for (let start = 0; start < source.length; start += 16384) {
        const chunk = source.subarray(start, start + 16384); bytes += chunk.length;
        if (isMedia && current.mbps > 0) {
          const due = began + bytes / (current.mbps * 125000) * 1000;
          if (due > performance.now()) await delay(due - performance.now(), null, { signal: abort.signal });
        }
        if (response.destroyed) break;
        if (record) { record.firstByteAt ??= performance.now(); record.sentBytes += chunk.length; }
        if (!response.write(chunk)) await once(response, 'drain', { signal: abort.signal });
      }
    }
    if (record) { record.completedAt = performance.now(); record.transferElapsedMs = record.completedAt - began; }
    response.end();
  } catch (error) {
    if (record && !record.completedAt) record.abortedAt = performance.now();
    if (!response.destroyed) {
      if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'text/plain' });
      response.end(String(error));
    }
  }
});
await new Promise((done, reject) => { proxy.once('error', reject); proxy.listen(proxyPort, '127.0.0.1', done); });
const testURL = 'http://127.0.0.1:' + proxyPort + '/';
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
  headless: !headed,
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
});
const watchdog = setTimeout(() => { report.fatal = 'Suite exceeded six minutes'; void browser.close(); }, 360000);
let openTest;

async function setup(label, options = {}, transport = {}) {
  const network = scenario(label, transport);
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push({ label, error: String(error) }));
  await page.addInitScript(() => {
    const audit = { frames: [], rows: [], geometry: [], violations: [], phase: null, entryMs: null, activeMs: null };
    window.__silverAuto = audit;
    document.addEventListener('securitypolicyviolation', e => audit.violations.push({ directive: e.effectiveDirective, blocked: e.blockedURI }));
    const callback = HTMLVideoElement.prototype.requestVideoFrameCallback;
    if (callback) HTMLVideoElement.prototype.requestVideoFrameCallback = function(run) {
      return callback.call(this, (now, metadata) => {
        if (audit.frames.at(-1)?.mediaTime !== metadata.mediaTime) {
          audit.frames.push({ now, mediaTime: metadata.mediaTime, presentationTime: metadata.presentationTime, presentedFrames: metadata.presentedFrames, phase: audit.phase });
        }
        run(now, metadata);
      });
    };
    const inspect = now => {
      const motion = window.__coderaMotion, journey = document.querySelector('.journey'), main = document.querySelector('main');
      if (journey && journey.offsetHeight > 0) {
        const height = journey.offsetHeight;
        if (audit.geometry.at(-1)?.height !== height) audit.geometry.push({ now, height, scrollY, inert: main?.inert });
      }
      if (main && !main.inert && !document.documentElement.classList.contains('codera-loading')) audit.entryMs ??= now;
      if (motion?.active && !motion.paused) audit.activeMs ??= now;
      if (audit.phase && motion) {
        const rect = document.querySelector('.stage').getBoundingClientRect();
        audit.rows.push({ now, phase: audit.phase, shown: motion.displayedTime, requested: motion.requestedTime, target: motion.targetTime,
          active: motion.active, paused: motion.paused, visible: rect.bottom > 0 && rect.top < innerHeight, hidden: document.hidden,
          frameCount: audit.frames.length, bufferPaced: motion.bufferPaced, scrollY });
      }
      requestAnimationFrame(inspect);
    };
    requestAnimationFrame(inspect);
  });
  const result = { label, context, page, network };
  openTest = result; return result;
}
async function close(test) {
  report.violations.push(...await test.page.evaluate(() => window.__silverAuto?.violations || []).catch(() => []));
  test.network.contextClosingAt = performance.now();
  await test.context.close();
  if (openTest === test) openTest = null;
}
const read = page => page.evaluate(() => {
  const state = window.__coderaMotion || {}, video = document.querySelector('#journey-video'), audit = window.__silverAuto;
  return {
    active: state.active, paused: state.paused, prepared: state.prepared, error: state.error, reason: state.reason,
    readyMs: state.readyMs, delivery: state.delivery, displayedTime: state.displayedTime, requestedTime: state.requestedTime,
    buffer: state.buffer, height: document.querySelector('.journey').offsetHeight, viewportHeight: innerHeight,
    hasJourney: document.querySelector('.journey').classList.contains('has-journey'),
    rootMotion: document.documentElement.classList.contains('motion-enabled'), inert: document.querySelector('main').inert,
    width: video.videoWidth, videoHeight: video.videoHeight, frames: audit.frames.length, lastFrame: audit.frames.at(-1),
    geometry: audit.geometry, entryMs: audit.entryMs, activeMs: audit.activeMs,
    button: document.querySelector('#motion-toggle').innerText,
  };
});
async function go(test, hash = '') {
  const response = await test.page.goto(testURL + hash, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  assert.match(response.headers()['content-security-policy'] || '', /worker-src/, 'Test real production CSP');
}
async function readyAuto(page, timeout = 20000) {
  await page.waitForFunction(() => (window.__coderaMotion?.active && !window.__coderaMotion.paused) || window.__coderaMotion?.error, null, { timeout });
  const state = await read(page);
  assert.equal(state.error, ''); assert.equal(state.active, true); assert.equal(state.paused, false);
  assert.deepEqual([state.width, state.videoHeight], [1920, 1080]);
  assert.ok(state.frames > 0, 'An actual frame must be presented');
  assert.doesNotMatch(state.button, /Spustiť animáciu/, 'Normal entry must not require a Start animation button');
  await page.waitForFunction(() => !document.querySelector('main').inert && window.__silverAuto.entryMs !== null && window.__silverAuto.activeMs !== null, null, { timeout: 6000 });
  return read(page);
}
const scroll = (page, progress) => page.evaluate(progress => {
  const journey = document.querySelector('.journey');
  scrollTo(0, journey.getBoundingClientRect().top + scrollY + (journey.offsetHeight - innerHeight) * progress);
}, progress);
async function check(name, action) {
  if (filter && !filter.test(name)) return;
  try {
    const detail = await action(); report.checks.push({ name, status: 'pass', detail }); console.log('PASS ' + name);
  } catch (error) {
    report.checks.push({ name, status: 'fail', error: String(error.stack || error) }); console.error('FAIL ' + name + ': ' + error.message);
  } finally { if (openTest) await close(openTest); await save(); }
}
const stats = values => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  return { count: sorted.length, median: sorted[Math.floor((sorted.length - 1) * .5)] ?? null,
    p95: sorted[Math.floor((sorted.length - 1) * .95)] ?? null, max: sorted.at(-1) ?? null };
};
function sweepMetrics(data, phase) {
  const frames = data.frames.filter(row => row.phase === phase), rows = data.rows.filter(row => row.phase === phase);
  let demandedFrom = null, lastFrameCount = null, longestDemandedHoldMs = 0;
  for (const row of rows) {
    const demanding = row.active && !row.paused && row.visible && !row.hidden && Math.abs(row.requested - row.shown) > .05;
    if (!demanding) demandedFrom = null;
    else {
      if (demandedFrom === null || row.frameCount !== lastFrameCount) demandedFrom = row.now;
      longestDemandedHoldMs = Math.max(longestDemandedHoldMs, row.now - demandedFrom);
    }
    lastFrameCount = row.frameCount;
  }
  return {
    phase, actualFrames: frames.length, rows: rows.length,
    frameIntervalsMs: stats(frames.slice(1).map((frame, i) => frame.now - frames[i].now)),
    rafIntervalsMs: stats(rows.slice(1).map((row, i) => row.now - rows[i].now)),
    rawScrollLagSourceSeconds: stats(rows.map(row => Math.abs(row.requested - row.shown))),
    filteredTargetLagSourceSeconds: stats(rows.map(row => Math.abs(row.target - row.shown))),
    longestDemandedHoldMs, bufferPacedRows: rows.filter(row => row.bufferPaced).length,
    hiddenRows: rows.filter(row => row.hidden).length, firstFrame: frames[0], lastFrame: frames.at(-1),
  };
}
async function sweep(page, label) {
  await scroll(page, .01);
  for (const direction of [1, -1]) await page.evaluate(({ phase, direction }) => new Promise(done => {
    window.__silverAuto.phase = phase;
    const journey = document.querySelector('.journey'), top = journey.getBoundingClientRect().top + scrollY, distance = journey.offsetHeight - innerHeight;
    const begin = performance.now();
    const step = now => {
      const elapsed = Math.min(1, (now - begin) / 14000);
      const progress = direction > 0 ? .01 + .98 * elapsed : .99 - .98 * elapsed;
      scrollTo(0, top + distance * progress);
      if (elapsed < 1) requestAnimationFrame(step);
      else { window.__silverAuto.phase = null; done(); }
    };
    requestAnimationFrame(step);
  }), { phase: label + '-' + (direction > 0 ? 'forward' : 'reverse'), direction });
  const data = await page.evaluate(() => ({ frames: window.__silverAuto.frames, rows: window.__silverAuto.rows }));
  return ['forward', 'reverse'].map(direction => sweepMetrics(data, label + '-' + direction));
}
function assertSweep(result) {
  for (const part of result) {
    assert.ok(part.actualFrames > 100, 'Too few actual presentations: ' + JSON.stringify(part));
    assert.equal(part.hiddenRows, 0, 'Hidden-tab results are not foreground performance');
    assert.ok(part.longestDemandedHoldMs < 500, 'Visible demanded video hold: ' + part.longestDemandedHoldMs + ' ms in ' + part.phase);
    assert.ok(part.rawScrollLagSourceSeconds.max < 1.5, 'Raw scroll-to-film lag: ' + part.rawScrollLagSourceSeconds.max + ' source seconds in ' + part.phase);
  }
}

try {
  if (performanceChecks) {
    for (const mbps of [5, 10, 2]) await check('Cold automatic entry with real ' + mbps + ' Mbit/s media pacing', async () => {
      const test = await setup('cold-' + mbps + 'Mbps', {}, { mbps, latencyMs: 60 });
      await go(test);
      const initial = await read(test.page), state = await readyAuto(test.page);
      const measurement = { initial, ready: state, limits: { readyMs: mbps === 2 ? 11000 : 5500, entryMs: 5000 }, sweep: null, warmSweep: null };
      test.network.measurement = measurement;
      assert.ok(state.entryMs <= 5000, 'Page entry took ' + state.entryMs + ' ms');
      assert.ok(state.readyMs <= measurement.limits.readyMs, 'Video readiness took ' + state.readyMs + ' ms');
      assert.ok(state.geometry.every(sample => Math.abs(sample.height - state.height) <= 2), 'Reserve motion height from first paint');
      if (mbps >= 5) {
        measurement.sweep = await sweep(test.page, 'cold-' + mbps); assertSweep(measurement.sweep);
      } else {
        // Test bounded entry and automatic later activation, not an arbitrary
        // full traversal faster than this link can physically deliver.
        await scroll(test.page, .08);
        await test.page.waitForFunction(() => window.__coderaMotion.displayedTime > 3.1, null, { timeout: 5000 });
      }
      if (mbps === 10) {
        await test.page.waitForFunction(() => window.__coderaMotion.buffer?.fullyBuffered && window.__coderaMotion.buffer?.stream?.complete, null, { timeout: 30000 });
        measurement.warmSweep = await sweep(test.page, 'fully-buffered'); assertSweep(measurement.warmSweep);
        assert.equal(test.network.requests.length, 1, 'No repeated or range fetches during scroll');
        assert.equal(test.network.requests[0].sentBytes, assetBytes); assert.equal(test.network.requests[0].range, null);
      }
      return measurement;
    });
  }
  if (functional) {
    await check('Automatic desktop entry and explicit pause/resume preserve actual frames', async () => {
      const test = await setup('desktop-pause');
      await go(test); const automatic = await readyAuto(test.page);
      await scroll(test.page, .12); await test.page.waitForFunction(() => window.__coderaMotion.displayedTime > 3.3);
      await test.page.locator('#motion-toggle').click(); await test.page.waitForTimeout(350);
      const before = await read(test.page);
      await scroll(test.page, .25); await test.page.waitForTimeout(750);
      const paused = await read(test.page);
      assert.equal(paused.paused, true); assert.deepEqual(paused.lastFrame, before.lastFrame);
      await test.page.locator('#motion-toggle').click(); await test.page.waitForFunction(() => window.__coderaMotion.displayedTime > 4.2);
      return { automatic, paused, resumed: await read(test.page) };
    });
    await check('Four-second automatic cover escape later starts motion without a height jump', async () => {
      const test = await setup('late-automatic', {}, { holdMs: 6500 });
      await go(test);
      await test.page.waitForFunction(() => !document.querySelector('main').inert, null, { timeout: 5500 });
      const released = await read(test.page);
      assert.equal(released.prepared, false); assert.equal(released.active, false);
      assert.ok(released.entryMs <= 5000); assert.ok(released.height >= released.viewportHeight * 6.9);
      const ready = await readyAuto(test.page);
      assert.equal(ready.height, released.height);
      assert.ok(ready.geometry.every(item => Math.abs(item.height - ready.height) <= 2), JSON.stringify(ready.geometry));
      return { released, ready };
    });
    await check('Explicit entry skip remains static after delayed media arrives', async () => {
      const test = await setup('manual-skip', {}, { holdMs: 6500 });
      await go(test); await test.page.locator('#entry-loader button').click({ timeout: 3500 });
      await test.page.waitForFunction(() => !document.querySelector('main').inert);
      const skipped = await read(test.page);
      await test.page.waitForTimeout(7200);
      const late = await read(test.page);
      assert.equal(late.active, false); assert.equal(late.paused, true); assert.equal(late.height, skipped.height);
      return { skipped, late };
    });
    await check('Late media does not start offstage and automatically activates on return', async () => {
      const test = await setup('offstage-ready', {}, { holdMs: 6500 });
      await go(test);
      await test.page.waitForFunction(() => !document.querySelector('main').inert, null, { timeout: 5500 });
      const originalHeight = (await read(test.page)).height;
      await test.page.locator('#sluzby').scrollIntoViewIfNeeded(); await test.page.waitForTimeout(4200);
      const away = await read(test.page);
      assert.equal(away.active, false); assert.equal(away.height, originalHeight);
      await scroll(test.page, 0); const returned = await readyAuto(test.page);
      assert.equal(returned.height, originalHeight); return { away, returned };
    });
    await check('Ordinary coarse-touch entry automatically activates without a Start click', async () => {
      const test = await setup('coarse-touch', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
      await go(test); const automatic = await readyAuto(test.page);
      await scroll(test.page, .15); await test.page.waitForFunction(() => window.__coderaMotion.displayedTime > 3.5);
      assert.equal(await test.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      return { automatic, scrolled: await read(test.page) };
    });
    for (const mode of ['reduced-motion', 'no-js']) await check(mode + ' keeps a readable static page without a video request', async () => {
      const test = await setup(mode, mode === 'reduced-motion' ? { reducedMotion: 'reduce' } : { javaScriptEnabled: false });
      await go(test); await test.page.locator('.hero-beat h1').waitFor({ state: 'visible' }); await test.page.waitForTimeout(700);
      assert.equal(await test.page.locator('main').evaluate(element => element.inert), false);
      assert.equal(await test.page.locator('.journey').evaluate(element => element.classList.contains('has-journey')), false);
      assert.equal(test.network.requests.length, 0); return { requests: test.network.requests.length };
    });
    await check('Media failure leaves readable content without a Start control', async () => {
      const test = await setup('error-retry', {}, { failNext: true });
      await go(test); await test.page.waitForFunction(() => window.__coderaMotion?.error);
      await test.page.waitForFunction(() => !document.querySelector('main').inert);
      const failed = await read(test.page);
      assert.equal(failed.active, false); assert.equal(await test.page.locator('.hero-beat h1').isVisible(), true);
      assert.equal(await test.page.locator('#motion-toggle').isVisible(), false);
      assert.equal(test.network.requests.length, 1); return { failed, noStartControl:true };
    });
    await check('Main-thread MediaSource capability fallback also starts automatically', async () => {
      const test = await setup('main-thread-fallback');
      await test.page.addInitScript(() => Object.defineProperty(MediaSource, 'canConstructInDedicatedWorker', { configurable: true, value: false }));
      await go(test); const result = await readyAuto(test.page);
      assert.equal(result.delivery, 'native-mse-single-fetch');
      return { simulation: 'Only worker MediaSource capability is overridden; fetch and decoding remain real', result };
    });
    await check('Missing controller releases the cover into compact readable content', async () => {
      const test = await setup('missing-controller', {}, { blockMain: true });
      await go(test);
      await test.page.waitForFunction(() => !document.querySelector('main').inert && !document.documentElement.classList.contains('codera-loading'), null, { timeout: 5500 });
      await test.page.waitForTimeout(100);
      const result = await test.page.evaluate(() => ({
        height: document.querySelector('.journey').offsetHeight, viewport: innerHeight,
        entryMs: window.__silverAuto.entryMs, unavailable: window.__coderaEntry.unavailable,
        active: window.__coderaMotion?.active || false,
      }));
      assert.ok(result.entryMs <= 5000); assert.equal(result.unavailable, true);
      assert.ok(result.height <= result.viewport * 1.05); assert.equal(result.active, false);
      assert.equal(test.network.requests.length, 0);
      assert.equal(await test.page.locator('.hero-beat h1').isVisible(), true);
      return result;
    });
    await check('Deep links avoid hidden video download and activate on returning to hero', async () => {
      const test = await setup('deep-link');
      await go(test, '#praca'); await test.page.waitForTimeout(750);
      test.network.beforeReturn = { state: await read(test.page), position: await test.page.evaluate(() => ({ hash: location.hash, scrollY, hero: document.querySelector('.stage').getBoundingClientRect().toJSON() })) };
      assert.equal(test.network.requests.length, 0);
      assert.equal(await test.page.locator('main').evaluate(element => element.inert), false);
      await scroll(test.page, 0); return readyAuto(test.page);
    });
  }
  await check('No uncaught page errors or CSP violations', async () => {
    assert.deepEqual(report.errors, []); assert.deepEqual(report.violations, []);
    return { errors: report.errors, violations: report.violations };
  });
} catch (error) { report.fatal = String(error.stack || error); }
finally {
  clearTimeout(watchdog);
  if (openTest) await close(openTest);
  await browser.close(); proxy.closeAllConnections(); await new Promise(done => proxy.close(done));
  report.summary = { passed: report.checks.filter(item => item.status === 'pass').length, failed: report.checks.filter(item => item.status === 'fail').length };
  if (report.fatal || report.summary.failed) process.exitCode = 1;
  await save(); console.log(JSON.stringify({ output, ...report.summary, fatal: report.fatal }, null, 2));
}
