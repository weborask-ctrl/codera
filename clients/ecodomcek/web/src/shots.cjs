// full-page screenshots of every built page, desktop + mobile
const { chromium } = require('playwright');
const BASE = process.env.PREVIEW || 'http://localhost:8811/';
(async () => {
  const B = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const pages = process.argv.slice(2);
  for (const [tag, w, h] of [['d', 1440, 900], ['m', 390, 844]]) {
    const page = await B.newPage({ viewport: { width: w, height: h } });
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      await page.waitForTimeout(1600);
      // walk the page so every reveal fires, then return to the top
      await page.evaluate(async () => {
        const step = innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
        }
        scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
      });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `shots/x-${tag}-${p.replace('.html','')}.png`, fullPage: true });
    }
    await page.close();
  }
  await B.close();
  console.log('ok');
})();
