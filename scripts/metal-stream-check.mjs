import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.METAL_URL || 'http://127.0.0.1:4334';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let monolithic = 0;
  page.on('request', r => { if (r.url().endsWith('journey-scroll-1080.mp4')) monolithic++; });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 1250000, uploadThroughput: 1250000 });
  const start = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__coderaMotion?.active && window.__coderaMotion.prepared);
  const startupMs = Date.now() - start;
  const initial = await page.evaluate(() => window.__coderaMotion);
  assert(startupMs < 6000, `Startup took ${startupMs} ms at 10 Mbit/s`);
  assert(initial.downloadedBytes < 500000);
  assert.equal(initial.delivery, 'segments');
  await page.waitForTimeout(5000);
  assert((await page.evaluate(() => window.__coderaMotion.downloadedBytes)) < 9000000, 'Idle hero must not download the whole film');
  const motion = await page.evaluate(async () => {
    const video = document.querySelector('video');
    let count = 0, last = performance.now(), longestGap = 0, running = true;
    const frame = now => { if (!running) return; longestGap = Math.max(longestGap, now - last); last = now; count++; video.requestVideoFrameCallback(frame); };
    video.requestVideoFrameCallback(frame);
    const start = performance.now(), travel = document.querySelector('.journey').offsetHeight - innerHeight;
    await new Promise(resolve => {
      function tick(now) {
        const p = Math.min(1, (now - start) / 8000);
        scrollTo(0, travel * (p < .5 ? p * 1.9 : (1 - p) * 1.9));
        if (p < 1) requestAnimationFrame(tick); else resolve();
      }
      requestAnimationFrame(tick);
    });
    running = false;
    return { count, longestGap };
  });
  assert(motion.count > 20, 'Continuous cold scroll must present intermediate frames');
  assert(motion.longestGap < 1500, `Cold scroll starved decoding for ${motion.longestGap} ms`);
  for (const p of [.95, .1, .5, 1, 0]) {
    await page.evaluate(p => scrollTo(0, p * (document.querySelector('.journey').offsetHeight - innerHeight)), p);
    await page.waitForFunction(p => Math.abs(window.__coderaMotion.progress - p) < .003 && Math.abs(window.__coderaMotion.targetTime - window.__coderaMotion.displayedTime) < .1, p, { timeout: 8000 });
  }
  assert.equal(monolithic, 0);
  assert.deepEqual(await page.locator('video').evaluate(v => [v.videoWidth, v.videoHeight]), [1920, 1080]);
  console.log(`PASS cold 10 Mbit/s startup ${startupMs} ms / ${initial.downloadedBytes} bytes; bounded idle transfer; cold jumps/reverse/endpoints; no monolithic fetch`);
  await page.close();

  for (const mode of ['unsupported', 'segment-failure']) {
    const fallback = await browser.newPage();
    if (mode === 'unsupported') await fallback.addInitScript(() => { window.MediaSource = undefined; });
    else await fallback.route('**/*.m4s', r => r.abort());
    await fallback.goto(url, { waitUntil: 'domcontentloaded' });
    await fallback.waitForFunction(() => window.__coderaMotion?.active && window.__coderaMotion.delivery === 'native');
    await fallback.mouse.wheel(0, 400);
    await fallback.waitForFunction(() => window.__coderaMotion.displayedTime > 2.95);
    console.log(`PASS progressive native fallback: ${mode}`);
    await fallback.close();
  }
} finally { await browser.close(); }
