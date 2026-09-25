// real interaction test: drag the wall and scroll the track, report the spread meter position
const { chromium } = require('playwright');
const BASE = process.env.PREVIEW || 'http://localhost:8811/';
(async () => {
  const B = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await B.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(BASE + 'stena.html', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const box = await page.locator('.slabs').boundingBox();
  const m0 = await page.evaluate(() => document.querySelector('.meter b').style.left);
  await page.mouse.move(box.x + 200, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + 700, box.y + box.height / 2, { steps: 20 }); await page.mouse.up();
  await page.waitForTimeout(700);
  const m1 = await page.evaluate(() => document.querySelector('.meter b').style.left);
  await page.screenshot({ path: 'shots/wall-drag.png' });
  const on = await page.evaluate(() => document.querySelectorAll('.slab.on').length);
  await page.evaluate(() => scrollTo(0, document.querySelector('[data-wall]').offsetHeight - innerHeight));
  await page.waitForTimeout(900);
  const m2 = await page.evaluate(() => document.querySelector('.meter b').style.left);
  await page.screenshot({ path: 'shots/wall-scroll.png' });
  console.log(JSON.stringify({ m0, m1, on, m2, errs }));
  await B.close();
})();
