import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const base = positional[0] || 'http://127.0.0.1:4317';
const out = resolve(positional[1] || 'test-results/jellyfish');
const functionalOnly = process.argv.includes('--functional');
const filter = process.env.JELLYFISH_TEST || '';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=default'] });
const results = { date: new Date().toISOString(), browser: browser.version(), base, functional: [], viewports: [], performance: [], limits: ['Viewport/CPU emulation is not physical-phone validation.', 'Frame timings measure submitted WebGL frames, not GPU completion.', 'Synthetic lifecycle events exercise application handlers, not browser bfcache eligibility.'] };
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

async function ready(page, path = '/') {
  await page.goto(new URL(path, base).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.dataset.ready === 'true', undefined, { timeout: 20000 });
}
async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const canvas = document.querySelector('canvas');
    const gl = canvas?.getContext('webgl2');
    const debug = gl?.getExtension('WEBGL_debug_renderer_info');
    return {
      motion: root.dataset.motion, stage: Number(root.dataset.stage), camera: root.dataset.camera,
      submitted: Number(root.dataset.renderCount || 0), portfolio: root.dataset.portfolio,
      canvases: document.querySelectorAll('canvas').length, width: canvas?.width || 0, height: canvas?.height || 0,
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable',
      static: document.body.classList.contains('static-mode'), scrollY,
      docWidth: root.scrollWidth, viewportWidth: innerWidth,
      projects: document.querySelectorAll('.project').length,
      sections: [...document.querySelectorAll('main section')].map((s) => ({ id: s.id, top: Math.round(s.getBoundingClientRect().top + scrollY), height: Math.round(s.offsetHeight) })),
    };
  });
}
async function test(name, run, options = {}) {
  if (filter && !name.includes(filter)) return;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    const detail = await run(page, context);
    assert.deepEqual(errors, [], 'Uncaught page errors');
    results.functional.push({ name, pass: true, ...detail });
    console.log('PASS ' + name);
  } catch (error) {
    results.functional.push({ name, pass: false, error: error.message, stack: error.stack, pageErrors: errors });
    console.error('FAIL ' + name + ': ' + error.message);
    await page.screenshot({ path: resolve(out, 'failure-' + name.replace(/[^a-z0-9]+/gi, '-') + '.png') }).catch(() => {});
  } finally { await context.close(); }
}
async function count(page) { return page.evaluate(() => Number(document.documentElement.dataset.renderCount || 0)); }
async function assertTickerSleeping(page) {
  await pause(150);
  const frame = await page.evaluate(() => window.gsap?.ticker.frame ?? 0);
  await pause(350);
  assert.equal(await page.evaluate(() => window.gsap?.ticker.frame ?? 0), frame, 'Inactive GSAP ticker sleeps');
}
async function assertStatic(page) {
  assert.equal((await snapshot(page)).static, true);
  assert.equal(await page.locator('canvas').count(), 0, 'Static mode must release its renderer');
  assert.equal(await page.locator('.project').count(), 5);
  assert.equal(await page.locator('#packages > div').count(), 3, 'Offer stays available');
  assert.match(await page.locator('#email').getAttribute('href'), /^mailto:/);
  assert.match(await page.locator('#phone').getAttribute('href'), /^tel:/);
}

try {
  await test('native journey reverse portfolio sleep restart', async (page) => {
    await ready(page);
    assert.equal((await snapshot(page)).scrollY, 0, 'A plain load starts at the hero');
    assert.equal((await snapshot(page)).motion, 'running');
    const positions = await page.evaluate(() => [0, innerHeight, document.querySelector('#praca').offsetTop + 200, document.querySelector('#sluzby').offsetTop, document.querySelector('#kontakt').offsetTop]);
    const forward = [];
    for (const y of positions) { await page.evaluate((value) => scrollTo(0, value), y); await pause(180); const s = await snapshot(page); forward.push([s.stage, s.camera]); }
    const reverse = [];
    for (const y of [...positions].reverse()) { await page.evaluate((value) => scrollTo(0, value), y); await pause(180); const s = await snapshot(page); reverse.push([s.stage, s.camera]); }
    assert.deepEqual(reverse.reverse(), forward);
    await page.locator('nav a[href="#praca"]').click();
    await page.evaluate(() => scrollBy(0, 250));
    await pause(300);
    assert.equal((await snapshot(page)).portfolio, 'true');
    const before = await count(page); await pause(1700); assert.equal(await count(page), before, 'Portfolio submits zero frames');
    await assertTickerSleeping(page);
    await page.locator('nav a[href="#kontakt"]').click();
    await page.waitForFunction((previous) => Number(document.documentElement.dataset.renderCount) > previous, before);
    for (let i = 0; i < 3; i++) {
      await page.locator('#motion-toggle').click(); await assertStatic(page); await assertTickerSleeping(page);
      await page.locator('#motion-toggle').click();
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'running');
      assert.equal(await page.locator('canvas').count(), 1);
    }
    return { reversalPositions: positions.length, portfolioFrames: 0, restartCycles: 3 };
  });
  await test('direct anchor after initial layout settles', async (page) => {
    for (const id of ['praca', 'sluzby', 'proces', 'kontakt']) {
      await ready(page, '/#' + id);
      const top = await page.locator('#' + id).evaluate((element) => element.getBoundingClientRect().top);
      assert.ok(Math.abs(top) <= (id === 'praca' ? 101 : 2), id + ' direct anchor top ' + top);
    }
    return { anchors: 4 };
  });
  await test('reduced motion start context loss manual recovery', async (page) => {
    await ready(page); await assertStatic(page); await assertTickerSleeping(page);
    await page.locator('#motion-toggle').click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'running');
    assert.ok(await page.locator('#uvod').evaluate((el) => el.offsetHeight > innerHeight * 3), 'Explicit start restores the spatial layout');
    await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'error');
    await assertStatic(page);
    assert.equal(await page.locator('#fallback').isVisible(), true);
    await page.locator('#motion-toggle').click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'running');
    assert.equal(await page.locator('canvas').count(), 1);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await pause(150); // Let the browser deliver the distinct media-query change.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'static');
    await assertStatic(page);
  }, { reducedMotion: 'reduce' });
  await test('query static', async (page) => { await ready(page, '/?motion=reduce'); await assertStatic(page); });
  await test('no JavaScript retains contacts offer and compact layout', async (page) => {
    await page.goto(base); await assertStatic(page);
    assert.equal(await page.locator('#motion-toggle').isDisabled(), true);
  }, { javaScriptEnabled: false });
  await test('unavailable WebGL readable failure', async (page) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (name, ...args) { return name.includes('webgl') ? null : original.call(this, name, ...args); };
    });
    await ready(page); await assertStatic(page);
    assert.equal(await page.locator('#fallback').isVisible(), true);
    await page.locator('#motion-toggle').click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'error');
    assert.equal(await page.locator('#fallback').isVisible(), true);
  });
  for (const dependency of ['gsap/gsap.min.js', 'gsap/ScrollTrigger.min.js', 'three/three.module.min.js']) {
    await test('missing dependency ' + dependency, async (page) => {
      await page.route('**/vendor/' + dependency, (route) => route.abort());
      await ready(page); await assertStatic(page);
      assert.equal(await page.locator('#fallback').isVisible(), true);
    });
  }
  await test('business API failure does not remove server content', async (page) => {
    await page.route('**/config.json', (route) => route.fulfill({ status: 503, body: 'unavailable' }));
    await ready(page, '/?motion=reduce'); await assertStatic(page);
    assert.notEqual(await page.locator('#response-time').textContent(), '');
  });
  await test('low memory prevents scene allocation and later stops it', async (page) => {
    let freeMB = 500;
    await page.route('**/health.json', (route) => route.fulfill({ json: { freeMB, totalMB: 8000, serverMB: 80 } }));
    await ready(page); await assertStatic(page);
    assert.equal(await page.locator('#fallback').isVisible(), true);
    freeMB = 2000;
    await page.locator('#motion-toggle').click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'running');
    freeMB = 500;
    await page.locator('#diagnostics summary').click();
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'static');
    await assertStatic(page);
  });
  await test('unavailable health endpoint cannot stall startup', async (page) => {
    await page.route('**/health.json', (route) => route.fulfill({ status: 503, body: 'unavailable' }));
    await ready(page);
    assert.equal((await snapshot(page)).motion, 'running');
  });
  await test('health timeout cannot stall startup', async (page) => {
    await page.route('**/health.json', () => {});
    await ready(page);
    assert.equal((await snapshot(page)).motion, 'running');
  });
  await test('keyboard skip and accessible controls', async (page) => {
    await ready(page, '/?motion=reduce');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip').evaluate((el) => el === document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, '#praca');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('project-image')), true);
    assert.equal(await page.getByRole('button', { name: 'Spustiť 3D' }).count(), 1);
    const controls = await page.locator('#motion-toggle, #diagnostics summary').evaluateAll((elements) => elements.map((el) => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
    assert.ok(controls.every((rect) => rect.width >= 24 && rect.height >= 24));
  });
  await test('pagehide pageshow and visibility lifecycle handlers', async (page) => {
    await ready(page);
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    const before = await count(page); await pause(500); assert.equal(await count(page), before);
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await page.waitForFunction((previous) => Number(document.documentElement.dataset.renderCount) > previous, before);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hidden = await count(page); await pause(500); assert.equal(await count(page), hidden);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForFunction((previous) => Number(document.documentElement.dataset.renderCount) > previous, hidden);
    return { evidence: 'Synthetic persisted page transitions and visibility events; handler regression coverage, not a bfcache/device claim.' };
  });

  for (const [width, height] of [[1440, 900], [1920, 1080], [1798, 1216], [768, 1024], [390, 844], [320, 740]]) {
    await test('viewport ' + width + 'x' + height, async (page) => {
      await ready(page);
      const s = await snapshot(page);
      assert.ok(s.docWidth <= width + 1, 'Document horizontal overflow');
      const brand = await page.locator('.brand').boundingBox(), nav = await page.locator('nav').boundingBox();
      assert.ok(brand.x + brand.width <= nav.x, 'Brand and navigation do not overlap');
      assert.ok(s.width * s.height <= 850000, 'Eco drawing-buffer budget');
      await page.screenshot({ path: resolve(out, 'hero-' + width + '.jpg'), quality: 80 });
      if (width === 1440) {
        await page.evaluate(() => scrollTo(0, (document.querySelector('#praca').offsetTop - innerHeight * .55) * 1.35 / 2.15));
        await pause(200);
        await page.screenshot({ path: resolve(out, 'intro-oblique-1440.jpg'), quality: 80 });
        await page.locator('nav a[href="#praca"]').click(); await pause(200);
        await page.screenshot({ path: resolve(out, 'portfolio-entry-1440.jpg'), quality: 80 });
        await page.evaluate(() => scrollTo(0, document.querySelector('#proces').offsetTop - innerHeight * .1)); await pause(200);
        await page.screenshot({ path: resolve(out, 'top-view-1440.jpg'), quality: 80 });
      }
      await page.locator('nav a[href="#kontakt"]').click();
      const link = await page.locator('#email').boundingBox();
      assert.ok(link.x >= 0 && link.x + link.width <= width + 1, 'Email fits viewport');
      await page.screenshot({ path: resolve(out, 'contact-' + width + '.jpg'), quality: 80 });
      await page.locator('#diagnostics summary').click();
      const panel = await page.locator('#performance').boundingBox();
      assert.ok(panel.x >= 0 && panel.x + panel.width <= width + 1, 'Diagnostics fits viewport');
      await page.locator('#quality').selectOption('balanced');
      const quality = await snapshot(page);
      assert.ok(quality.width * quality.height <= 1500000, 'Balanced drawing-buffer budget');
      results.viewports.push(s);
      return { bufferPixels: s.width * s.height, horizontalOverflow: false };
    }, { viewport: { width, height }, deviceScaleFactor: width <= 390 ? 3 : 1 });
  }

  if (!functionalOnly) {
    for (const profile of [{ width: 1440, height: 900, rate: 1 }, { width: 1920, height: 1080, rate: 1 }, { width: 1440, height: 900, rate: 4 }, { width: 390, height: 844, rate: 4 }]) {
      const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height } });
      try {
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.rate });
        await ready(page);
        const initial = await snapshot(page);
        const metrics = await page.evaluate(async () => {
          const root = document.documentElement;
          const frameTimes = [], longTasks = [];
          let last = 0, priorCount = Number(root.dataset.renderCount);
          const observer = new MutationObserver(() => { const current = Number(root.dataset.renderCount); if (current === priorCount) return; priorCount = current; const now = performance.now(); if (last) frameTimes.push(now - last); last = now; });
          observer.observe(root, { attributes: true, attributeFilter: ['data-render-count'] });
          const tasks = new PerformanceObserver((list) => longTasks.push(...list.getEntries().map((entry) => entry.duration)));
          tasks.observe({ type: 'longtask' });
          const work = document.querySelector('#praca');
          const workTop = work.offsetTop, workEnd = workTop + work.offsetHeight;
          const legs = [[0, workTop - innerHeight * .6], [workEnd + 10, root.scrollHeight - innerHeight], [root.scrollHeight - innerHeight, workEnd + 10]];
          const startCount = Number(root.dataset.renderCount), start = performance.now();
          for (const [from, to] of legs) {
            last = 0;
            const begin = performance.now();
            await new Promise((done) => {
              const advance = () => { const t = Math.min(1, (performance.now() - begin) / 6000); scrollTo(0, from + (to - from) * t); if (t < 1) setTimeout(advance, 16); else done(); };
              advance();
            });
          }
          observer.disconnect(); tasks.disconnect();
          frameTimes.sort((a, b) => a - b);
          const pick = (q) => Math.round((frameTimes[Math.min(frameTimes.length - 1, Math.floor(frameTimes.length * q))] || 0) * 10) / 10;
          return { submitted: Number(root.dataset.renderCount) - startCount, durationMs: Math.round(performance.now() - start), medianMs: pick(.5), p95Ms: pick(.95), over50ms: frameTimes.filter((ms) => ms > 50).length, longTasks: longTasks.length, maxLongTaskMs: Math.round(Math.max(0, ...longTasks)), finalMotion: root.dataset.motion, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 2 ** 20) : null };
        });
        const final = await snapshot(page);
        results.performance.push({ ...profile, renderer: initial.renderer, ...metrics, initialBuffer: [initial.width, initial.height], finalBuffer: [final.width, final.height] });
        console.log('MEASURE ' + JSON.stringify(results.performance.at(-1)));
      } finally { await context.close(); }
    }
  }
} finally {
  await browser.close();
  results.filter = filter || null;
  results.pass = results.functional.length > 0 && results.functional.every((result) => result.pass);
  await writeFile(resolve(out, 'report.json'), JSON.stringify(results, null, 2));
  console.log('Report: ' + resolve(out, 'report.json'));
  if (!results.pass) process.exitCode = 1;
}
