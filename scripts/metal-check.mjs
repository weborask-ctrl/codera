import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url=process.env.METAL_URL||'http://127.0.0.1:4327';
const out=resolve('test-results/metal');await mkdir(out,{recursive:true});
const report={checks:[],consoleErrors:[],measurements:{}};
function passed(name){report.checks.push(name);console.log(`PASS ${name}`);}
const range=await fetch(`${url}${process.env.METAL_PRODUCTION ? "/motion/metal" : "/media"}/journey-scroll-1080.mp4`,{headers:{Range:'bytes=0-63'}});
assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,64);passed('Video byte ranges');
// The standalone server owns invalid-range handling; production delegates static ranges to Next/CDN.
if(!process.env.METAL_PRODUCTION){const badRange=await fetch(`${url}${process.env.METAL_PRODUCTION ? "/motion/metal" : "/media"}/journey-scroll-1080.mp4`,{headers:{Range:'bytes=999999999-'}});assert.equal(badRange.status,416);passed('Invalid range rejected');}
const source=await (await fetch(url)).text();assert(!source.includes('{{'));assert(source.includes('kontakt@codera.sk'));passed('Business facts rendered without JavaScript');
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
async function installVisibilitySimulation(page) {
  await page.addInitScript(()=>{
    let hidden=false;
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});
    Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>hidden?'hidden':'visible'});
    window.__setTestHidden=value=>{hidden=value;document.dispatchEvent(new Event('visibilitychange'));};
  });
}
async function slowSeekRecovery() {
  const slow=await browser.newPage({viewport:{width:1280,height:800}});
  let requests=0;slow.on('request',r=>{if(r.url().endsWith('.mp4'))requests++;});
  try {
    await slow.goto(url,{waitUntil:'domcontentloaded'});
    await slow.waitForFunction(()=>window.__coderaMotion?.active&&window.__coderaMotion.prepared);
    await slow.waitForFunction(()=>window.__coderaMotion.fullyBuffered||window.__coderaMotion.delivery==='prepared-fallback');
    assert((await slow.locator('video').getAttribute('src')).startsWith('blob:'));
    await slow.route('**/*.mp4',route=>route.abort());
    await slow.route('**/*.m4s',route=>route.abort());
    for(const p of [.85,.15,.95]){
      await slow.evaluate(p=>scrollTo(0,p*(document.querySelector('.journey').offsetHeight-innerHeight)),p);
      await slow.waitForFunction(p=>Math.abs(window.__coderaMotion.progress-p)<.003&&Math.abs(window.__coderaMotion.displayedTime-window.__coderaMotion.targetTime)<.12&&!document.querySelector('video').seeking,p);
    }
    assert.equal(requests,1);passed('Prepared clip seeks both directions with media network blocked and only one download');
  } finally {await slow.close();}
}
async function delayedMediaRecovery() {
  const slow=await browser.newPage({viewport:{width:1280,height:800}});
  let release;const gate=new Promise(resolve=>{release=resolve;});
  await slow.route('**/*.mp4',async route=>{await gate;await route.continue().catch(()=>{});});
  try {
    await slow.goto(url,{waitUntil:'domcontentloaded'});
    await slow.locator('#praca').evaluate(el=>el.scrollIntoView());
    const workStart=await slow.locator('#praca').evaluate(el=>el.getBoundingClientRect().top);
    await slow.waitForFunction(()=>window.__coderaMotion?.reason==='preparing-video');
    assert.equal(await slow.locator('.journey').evaluate(el=>el.offsetHeight),await slow.evaluate(()=>innerHeight));
    assert(Math.abs(await slow.locator('#praca').evaluate(el=>el.getBoundingClientRect().top)-workStart)<2);
    release();
    await slow.waitForFunction(()=>window.__coderaMotion.prepared&&window.__coderaMotion.reason==='ready-to-start',{},{timeout:30000});
    assert(Math.abs(await slow.locator('#praca').evaluate(el=>el.getBoundingClientRect().top)-workStart)<2);
    await slow.evaluate(()=>scrollTo(0,0));
    await slow.waitForFunction(()=>window.__coderaMotion.active);
    await slow.mouse.wheel(0,400);
    await slow.waitForFunction(()=>window.__coderaMotion.displayedTime>2.95);
    passed('Delayed download keeps a compact intro and preserves portfolio position; returning to top activates motion');
  } finally {release();await slow.close();}
}
async function hiddenMediaRecovery() {
  const hidden=await browser.newPage({viewport:{width:1280,height:800}});
  await installVisibilitySimulation(hidden);
  let release;const gate=new Promise(resolve=>{release=resolve;});
  await hidden.route('**/*.mp4',async route=>{await gate;await route.continue().catch(()=>{});});
  try {
    await hidden.goto(url,{waitUntil:'domcontentloaded'});
    await hidden.waitForFunction(()=>window.__coderaMotion?.reason==='preparing-video');
    await hidden.evaluate(()=>window.__setTestHidden(true));
    await hidden.waitForTimeout(16000);
    assert.equal(await hidden.evaluate(()=>window.__coderaMotion.retries),0);
    assert.equal(await hidden.evaluate(()=>window.__coderaMotion.active),false);
    await hidden.evaluate(()=>window.__setTestHidden(false));release();
    await hidden.waitForFunction(()=>window.__coderaMotion.active&&document.querySelector('video').readyState>=2);
    await hidden.mouse.wheel(0,400);
    await hidden.waitForFunction(()=>window.__coderaMotion.displayedTime>2.95);
    passed('Simulated hidden-tab loading suspends watchdog and resumes scroll video');
    await hidden.locator('#motion-toggle').click();
    await hidden.evaluate(()=>{
      window.__setTestHidden(true);window.__setTestHidden(false);
      window.dispatchEvent(new Event('pageshow'));
      document.querySelector('video').dispatchEvent(new Event('loadeddata'));
    });
    assert.equal(await hidden.evaluate(()=>window.__coderaMotion.active),false);
    assert.equal(await hidden.locator('.journey').getAttribute('data-motion-state'),'paused');
    passed('Manual pause survives visibility, page restoration and late media events');
  } finally {release();await hidden.close();}
}
async function captionFallback(mode) {
  const fallback=await browser.newPage({viewport:{width:1280,height:800}});
  await fallback.addInitScript(mode=>{
    Object.defineProperty(HTMLVideoElement.prototype,'requestVideoFrameCallback',{
      configurable:true,value:mode==='absent'?undefined:(()=> 0),
    });
  },mode);
  try {
    await fallback.goto(url,{waitUntil:'domcontentloaded'});
    await fallback.waitForFunction(()=>window.__coderaMotion.active&&document.querySelector('video').readyState>=2);
    await fallback.evaluate(()=>{const journey=document.querySelector('.journey');scrollTo(0,.33*(journey.offsetHeight-innerHeight));});
    await fallback.waitForFunction(()=>Math.abs(window.__coderaMotion.progress-.33)<.002&&!document.querySelector('video').seeking);
    await fallback.waitForFunction(()=>document.querySelector('.beat-detail').getAttribute('aria-hidden')==='false');
    assert(await fallback.locator('.beat-detail').isVisible());
    passed(`Captions recover with ${mode} video frame callbacks`);
  } finally {await fallback.close();}
}
// Independent lifecycle regressions wait for real browser timers alongside the ordinary checks.
const lifecycleResults=Promise.allSettled([delayedMediaRecovery(),hiddenMediaRecovery(),slowSeekRecovery()]);
try {
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  page.on('pageerror',error=>report.consoleErrors.push(error.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('video').readyState>=2,{},{timeout:30000});
  assert(await page.evaluate(()=>window.__coderaMotion.active));
  await page.waitForFunction(()=>Math.abs(window.__coderaMotion.displayedTime-2.6)<.12);
  passed('Opening starts after the motionless video handle');
  const dimensions=await page.locator('video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
  assert.equal(dimensions.width,1920);assert.equal(dimensions.height,1080);report.measurements.video=dimensions;passed('1080p browser decode');
  await page.screenshot({path:resolve(out,'desktop-hero.png')});
  async function scrollProgress(p){await page.evaluate(p=>{const el=document.querySelector('.journey');scrollTo(0,el.offsetTop+p*(el.offsetHeight-innerHeight));},p);await page.waitForFunction(p=>Math.abs(window.__coderaMotion.progress-p)<.002,p);await page.waitForFunction(()=>Math.abs(window.__coderaMotion.displayedTime-window.__coderaMotion.targetTime)<.12&&!document.querySelector('video').seeking,{},{timeout:15000});}
  await scrollProgress(0);
  await page.evaluate(()=>{
    window.__wheelFrames=[];window.__captureWheel=true;
    const video=document.querySelector('video');
    const capture=(_now,frame)=>{window.__wheelFrames.push(frame.mediaTime+window.__coderaMotion.mediaOffset);if(window.__captureWheel)video.requestVideoFrameCallback(capture);};
    video.requestVideoFrameCallback(capture);
  });
  await page.mouse.wheel(0,600);
  await page.waitForFunction(()=>window.__coderaMotion.progress>.10&&Math.abs(window.__coderaMotion.displayedTime-window.__coderaMotion.targetTime)<.08&&!document.querySelector('video').seeking);
  const wheel=await page.evaluate(()=>{window.__captureWheel=false;return{frames:window.__wheelFrames,target:window.__coderaMotion.targetTime};});
  const intermediate=[...new Set(wheel.frames)].filter(time=>time>2.7&&time<wheel.target-.1);
  assert(intermediate.length>=2,`Expected intermediate presented wheel frames, got ${JSON.stringify(wheel)}`);
  report.measurements.wheelPresentedFrames=wheel.frames;passed('Native wheel presents multiple intermediate video frames');
  await scrollProgress(.33);assert(await page.locator('.beat-detail').isVisible());assert.equal(await page.locator('.beat-detail').getAttribute('aria-hidden'),'false');await page.screenshot({path:resolve(out,'desktop-introduction.png')});passed('Codera introduction appears during the approach');
  await scrollProgress(.59);assert.equal(await page.locator('.hero-beat[aria-hidden="false"]').count(),0);assert.equal(await page.locator('.hero-beat:visible').count(),0);passed('Camera flight has a clear interval without text');
    await scrollProgress(.415);
    assert(await page.locator('.tunnel-fade').evaluate(el=>Number(getComputedStyle(el).opacity)>.95));passed('Fade covers the source cut before revealing the tunnel');
    await scrollProgress(.48);await page.screenshot({path:resolve(out,'desktop-motion.png')});
  assert(await page.locator('.tunnel-fade').evaluate(el=>Number(getComputedStyle(el).opacity)>.1));
  const forward=await page.locator('video').evaluate(v=>v.currentTime+window.__coderaMotion.mediaOffset);assert(forward>6);
    await scrollProgress(.415);assert(await page.locator('.tunnel-fade').evaluate(el=>Number(getComputedStyle(el).opacity)>.95));
    await scrollProgress(.18);const reverse=await page.locator('video').evaluate(v=>v.currentTime+window.__coderaMotion.mediaOffset);assert(reverse<forward-2);assert(await page.locator('.tunnel-fade').evaluate(el=>Number(getComputedStyle(el).opacity)<.01));passed('Native forward and reverse video seeking with reversible fade');
  await scrollProgress(.93);await page.screenshot({path:resolve(out,'desktop-arrival.png')});
  assert(await page.locator('.tunnel-fade').evaluate(el=>Number(getComputedStyle(el).opacity)<.01));passed('Warm transition clears for the final sharp composition');
  assert.equal(await page.locator('.beat-arrival').getAttribute('aria-hidden'),'false');await page.locator('.beat-arrival a').click();await page.waitForFunction(()=>Math.abs(document.querySelector('#praca').getBoundingClientRect().top)<2);passed('Final video composition leads directly to portfolio');
  await scrollProgress(.33);assert.equal(await page.locator('.beat-detail').getAttribute('aria-hidden'),'false');passed('Reversing from portfolio restores the video narrative');
  report.measurements.seek=await page.evaluate(()=>({...window.__coderaMotion}));
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const seekDurations=[];
  for(const progress of [.25,.6,.42,.78]){const start=Date.now();await scrollProgress(progress);seekDurations.push(Date.now()-start);}
  report.measurements.throttledSettledSeekMs=seekDurations;await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await page.evaluate(()=>document.querySelector('#praca').scrollIntoView());await page.waitForTimeout(200);await page.screenshot({path:resolve(out,'desktop-work.png')});
  assert.equal(await page.locator('.project').count(),5);assert.equal(await page.locator('.project-visual[href^="https://www.codera.sk/ukazky/"]').count(),5);passed('All five concept destinations');
  await page.locator('.project').first().evaluate(el=>el.scrollIntoView({block:'start'}));
  const previewButton=page.locator('.project-preview').first();await previewButton.click();
  await page.waitForFunction(()=>document.querySelector('#preview-image').naturalHeight>5000);
  assert(await page.locator('.project-dialog').evaluate(el=>el.open));
  assert.equal(await page.locator('#preview-image').evaluate(el=>el.naturalWidth),2880);
  await page.locator('#preview-zoom').click();assert.equal(await page.locator('#preview-zoom').getAttribute('aria-pressed'),'true');
  await page.keyboard.press('Escape');assert.equal(await page.locator('.project-dialog').evaluate(el=>el.open),false);
  assert(await previewButton.evaluate(el=>el===document.activeElement));passed('Complete 2880px project preview, zoom, Escape and focus return');
  await page.locator('.offer summary').first().click();assert(await page.locator('.offer-details').first().evaluate(el=>el.open));passed('Service detail disclosure');
  await page.locator('#dopyt').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(out,'desktop-contact.png')});
  assert.equal(await page.locator('#dopyt').evaluate(form=>form.checkValidity()),false);passed('Required enquiry fields validate');
  await scrollProgress(.8);const pauseY=await page.evaluate(()=>scrollY);const journeyHeight=await page.locator('.journey').evaluate(el=>el.offsetHeight);await page.locator('#motion-toggle').click();assert.equal(await page.evaluate(()=>window.__coderaMotion.active),false);assert.equal(await page.locator('.journey').evaluate(el=>el.offsetHeight),journeyHeight);assert.equal(await page.evaluate(()=>scrollY),pauseY);passed('Pausing freezes the scene without a layout or scroll jump');
  await page.locator('#motion-toggle').click();assert(await page.evaluate(()=>window.__coderaMotion.active));passed('Motion restarts');
  await page.close();

  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  let mobileVideo=false;mobile.on('request',r=>{if(r.url().endsWith('.mp4'))mobileVideo=true;});
  await mobile.goto(url,{waitUntil:'domcontentloaded'});await mobile.evaluate(()=>document.fonts.ready);await mobile.screenshot({path:resolve(out,'mobile-hero.png')});
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(mobileVideo,false);passed('Mobile uses sharp poster without video download');
  await mobile.setViewportSize({width:844,height:390});await mobile.waitForTimeout(200);assert.equal(await mobile.evaluate(()=>window.__coderaMotion.active),false);assert.equal(mobileVideo,false);passed('Rotating a touch device preserves its media preference');
  await mobile.setViewportSize({width:390,height:844});
  await mobile.locator('.project').first().evaluate(el=>el.scrollIntoView({block:'start'}));await mobile.locator('.project-preview').first().click();await mobile.waitForFunction(()=>document.querySelector('#preview-image').naturalHeight>5000);
  assert(await mobile.locator('.close-dialog').isVisible());await mobile.screenshot({path:resolve(out,'mobile-full-preview.png')});
  await mobile.locator('#preview-image').click();assert.equal(await mobile.locator('#preview-zoom').getAttribute('aria-pressed'),'true');
  await mobile.locator('.close-dialog').click();passed('Mobile complete preview supports image zoom and dismissal');
  await mobile.locator('.menu-button').click();assert(await mobile.locator('#mobile-menu').isVisible());await mobile.locator('#mobile-menu a[href="#praca"]').click();assert.equal(await mobile.locator('#mobile-menu').isVisible(),false);
  await mobile.screenshot({path:resolve(out,'mobile-work.png')});passed('Mobile navigation');
  await mobile.locator('#kontakt').scrollIntoViewIfNeeded();await mobile.screenshot({path:resolve(out,'mobile-contact.png')});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await mobile.setViewportSize({width:320,height:568});await mobile.evaluate(()=>scrollTo(0,0));assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);passed('320px narrow layout');await mobile.close();

  const narrow=await browser.newPage({viewport:{width:600,height:700}});
  await narrow.route('**/vendor/*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,400));await route.continue();});
  await narrow.goto(url,{waitUntil:'domcontentloaded'});await narrow.waitForFunction(()=>window.__coderaMotion?.active&&document.querySelector('video').readyState>=2);passed('Narrow desktop preview and delayed libraries initialize motion');
  await narrow.mouse.wheel(0,250);await narrow.waitForFunction(()=>window.__coderaMotion.displayedTime>2.95);passed('First short wheel scroll visibly advances video');await narrow.close();
  const reduced=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});let reducedVideo=false;reduced.on('request',r=>{if(r.url().endsWith('.mp4'))reducedVideo=true;});await reduced.goto(url,{waitUntil:'domcontentloaded'});assert.equal(reducedVideo,false);assert.equal(await reduced.evaluate(()=>window.__coderaMotion.active),false);passed('Reduced motion without media request');
  await reduced.locator('#motion-toggle').click();await reduced.waitForFunction(()=>window.__coderaMotion.active&&document.querySelector('video').readyState>=2);assert(await reduced.locator('.journey').evaluate(el=>el.offsetHeight>innerHeight*2));passed('Explicit motion opt-in with reduced-motion preference');await reduced.close();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(url);assert(await nojs.locator('h1').isVisible());assert.equal(await nojs.locator('.project').count(),5);assert(await nojs.locator('a[href="mailto:kontakt@codera.sk"]').first().count());assert.equal(await nojs.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);passed('No-JavaScript content and contact');await nojs.close();
  const blocked=await browser.newPage({viewport:{width:1366,height:768}});await blocked.route('**/*.mp4',route=>route.abort());await blocked.goto(url);await blocked.waitForFunction(()=>window.__coderaMotion&&!window.__coderaMotion.active);assert(await blocked.locator('h1').isVisible());passed('Video failure returns to readable static layout');
  await blocked.unroute('**/*.mp4');await blocked.locator('#motion-toggle').click();await blocked.waitForFunction(()=>window.__coderaMotion.active&&document.querySelector('video').readyState>=2);passed('Failed video can be retried without reloading');await blocked.close();
  const captionResults=await Promise.allSettled([captionFallback('absent'),captionFallback('stalled')]);
  for(const viewport of [{width:320,height:568},{width:844,height:390}]){
    const short=await browser.newPage({viewport,hasTouch:true,isMobile:true});await short.goto(url);await short.locator('#motion-toggle').click();await short.waitForFunction(()=>window.__coderaMotion.active);
    for(const progress of [.33,.93]){
      await short.evaluate(p=>scrollTo(0,p*(document.querySelector('.journey').offsetHeight-innerHeight)),progress);
      await short.waitForFunction(p=>Math.abs(window.__coderaMotion.progress-p)<.003,progress);
      await short.waitForFunction(()=>Math.abs(window.__coderaMotion.targetTime-window.__coderaMotion.displayedTime)<.12&&!document.querySelector('video').seeking);
      const fits=await short.evaluate(()=>[document.querySelector('.stage-footer'),...document.querySelectorAll('.hero-beat[aria-hidden="false"] h2,.hero-beat[aria-hidden="false"] p,.hero-beat[aria-hidden="false"] a')].every(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1;}));
      assert(fits,`Motion content must fit ${viewport.width}×${viewport.height}`);
    }
    await short.close();
  }
  passed('Short portrait and landscape keep headings, copy and controls inside viewport');
  const recoveryResults=await lifecycleResults;
  for(const result of [...captionResults,...recoveryResults])if(result.status==='rejected')throw result.reason;
  assert.deepEqual(report.consoleErrors,[]);passed('No desktop JavaScript errors');
}finally{await browser.close();await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2));}
