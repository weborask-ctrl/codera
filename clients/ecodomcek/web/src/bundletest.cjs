const { chromium } = require('playwright');
(async () => {
  const B = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await B.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  const state = () => page.evaluate(() => ({ hash: location.hash, page: document.body.dataset.page, slabs: document.querySelectorAll('.slab').length, cards: document.querySelectorAll('.card').length, curtain: getComputedStyle(document.getElementById('curtain')).display, built: !!document.querySelector('.poster.built') }));
  await page.goto('file://' + process.cwd() + '/dist/ecodomcek.html', { waitUntil: 'load' });
  await page.waitForTimeout(4800); console.log('home', JSON.stringify(await state()));
  await page.screenshot({ path: 'shots/bundle-home.png' });
  await page.click('header nav a[href="stena.html"]'); await page.waitForTimeout(2200); console.log('stena', JSON.stringify(await state()));
  await page.screenshot({ path: 'shots/bundle-stena.png' });
  await page.click('header nav a[href="realizacie.html"]'); await page.waitForTimeout(2000); console.log('realizacie', JSON.stringify(await state()));
  await page.click('.card'); await page.waitForTimeout(2000); console.log('detail', JSON.stringify(await state()), await page.evaluate(() => document.querySelector('h1').textContent.trim().slice(0,30)));
  await page.goBack(); await page.waitForTimeout(1800); console.log('back', JSON.stringify(await state()));
  await page.click('header .brand'); await page.waitForTimeout(1800); console.log('home2', JSON.stringify(await state()));
  console.log('errs', JSON.stringify(errs));
  await B.close();
})();
