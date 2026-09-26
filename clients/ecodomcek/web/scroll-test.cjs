// real scroll test: sticky stage + scrubbed house at five progress points, desktop and mobile
const { chromium } = require('playwright');(async () => {
const B = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
async function run(w, h, tag) {
  const page = await B.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://localhost:8810/serve.html', { waitUntil: 'load' });
  await page.waitForTimeout(1400);
  const res = [];
  for (const t of [0, .05, .22, .45, .66, .86, 1]) {
    await page.evaluate((t) => { const a = document.getElementById('hero'); scrollTo(0, (a.offsetHeight - innerHeight) * t); }, t);
    await page.waitForTimeout(1000);
    res.push(await page.evaluate(() => { const b = document.getElementById('house').getBoundingClientRect(); const r = document.querySelector('.lyr[data-l=roof]').getBoundingClientRect(); const s = document.querySelector('#hero .stage').getBoundingClientRect(); return [Math.round(scrollY), Math.round(s.top), Math.round(b.top), Math.round(b.height), Math.round(r.top)]; }));
    await page.screenshot({ path: `${tag}${res.length - 1}.png` });
  }
  await page.close();
  return res;
}
const d = await run(1440, 900, 'r'); const m = await run(390, 844, 'q');
console.log(JSON.stringify({ d, m }));
await B.close();
})();
