import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.METAL_URL||'http://127.0.0.1:4327';
const out='test-results/silver-polish';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={layout:[],motion:[],checks:[]};
function pass(message){report.checks.push(message);console.log(`PASS ${message}`);}
try {
  for(const [width,height] of [[1440,900],[1078,646],[768,900],[390,844],[320,568],[844,390]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:width<701});
    await page.goto(url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const type=await page.locator('h1,h2,h3,.proposal-unit,.offer-price').evaluateAll(elements=>elements.filter(el=>!el.closest('dialog')&&!el.classList.contains('visually-hidden')).map(el=>{
      const range=document.createRange();range.selectNodeContents(el);const rect=range.getBoundingClientRect();
      const parent=el.closest('.offer')||el.parentElement,box=parent.getBoundingClientRect(),style=getComputedStyle(el);
      return{text:el.textContent,left:rect.left,right:rect.right,boxLeft:box.left,boxRight:box.right,font:style.fontFamily,italic:style.fontStyle};
    }));
    for(const heading of type){
      assert(heading.font.includes('Montserrat')&&heading.italic==='normal',`${heading.text}: consistent native sans-serif type`);
      assert(heading.left>=heading.boxLeft-1&&heading.right<=heading.boxRight+1,`${width}: ${heading.text} must stay inside its surface`);
    }
    const headings=await page.locator('.section-heading,.studio-intro,.contact-top').evaluateAll(elements=>elements.map(el=>({left:el.getBoundingClientRect().left,width:el.offsetWidth,copy:el.querySelector('p').getBoundingClientRect().left})));
    for(const heading of headings){assert(Math.abs(heading.left-headings[0].left)<1);assert(Math.abs(heading.copy-headings[0].copy)<1);}
    const centered=await page.locator('.proposal').evaluate(el=>{const card=el.getBoundingClientRect(),number=el.querySelector('.proposal-time').getBoundingClientRect();return Math.abs(number.x+number.width/2-card.x-card.width/2);});
    assert(centered<1,'The complete 72 hodín group must be centered');
    await page.locator('.project').first().evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.waitForFunction(()=>document.querySelector('.project-visual img').complete&&document.querySelector('.project-visual img').naturalWidth>0);
    const frame=await page.locator('.project').first().evaluate(el=>{const img=el.querySelector('img'),glass=el.querySelector('.project-frame'),a=glass.getBoundingClientRect(),b=img.getBoundingClientRect();return{inside:b.left>a.left&&b.right<a.right,fit:getComputedStyle(img).objectFit,radius:parseFloat(getComputedStyle(glass).borderTopLeftRadius),imageRadius:parseFloat(getComputedStyle(img).borderTopLeftRadius),gaps:[b.top-a.top,a.right-b.right,a.bottom-b.bottom,b.left-a.left],height:el.getBoundingClientRect().height};});
    assert(frame.inside&&frame.fit==='contain'&&frame.radius>20);
    assert(frame.imageRadius>10);
    assert(Math.max(...frame.gaps)-Math.min(...frame.gaps)<1,'Glass spacing must match on all four sides');
    const backgrounds=await page.locator('.project-frame').evaluateAll(els=>els.map(el=>getComputedStyle(el).backgroundImage));
    assert.equal(new Set(backgrounds).size,1,'Every glass frame must use the same colour');
    if(height>620)assert(frame.height<height-40,'Sticky frame and actions must fit the viewport');
    await page.screenshot({path:`${out}/checked-${width}-card.png`});
    await page.locator('.project-preview').first().click();
    await page.waitForFunction(()=>document.querySelector('#preview-image').naturalWidth===2880);
    assert(await page.locator('.close-dialog').isVisible());
    const close=await page.locator('.close-dialog').boundingBox();assert(close.x>=0&&close.x+close.width<=width);
    await page.screenshot({path:`${out}/checked-${width}-dialog.png`});
    await page.locator('.close-dialog').click();
    assert(await page.locator('.project-preview').first().evaluate(el=>el===document.activeElement));
    report.layout.push({width,height,centered,headings,frame});await page.close();
  }
  pass('Aligned headings, centered number, complete framed previews and usable dialogs at six sizes');
  const pointer=await browser.newPage({viewport:{width:1440,height:900}});await pointer.goto(url);
  await pointer.waitForFunction(()=>window.__coderaMotion?.active);
  const before=await pointer.locator('.film-camera').boundingBox();
  await pointer.mouse.move(1350,300);await pointer.waitForTimeout(800);
  assert.deepEqual(before,await pointer.locator('.film-camera').boundingBox());
  await pointer.mouse.move(20,650);await pointer.waitForTimeout(800);
  assert.deepEqual(before,await pointer.locator('.film-camera').boundingBox());
  await pointer.close();pass('Mouse movement leaves the film completely stationary');
  for(const width of [1440,1078]){
    const page=await browser.newPage({viewport:{width,height:1000}});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
    const selectors=['h3','.offer-audience','.offer-price','.offer-details','a'];
    for(const state of ['closed','first-open','both-open']){
      if(state==='first-open')await page.locator('.offer summary').first().click();
      if(state==='both-open')await page.locator('.offer summary').last().click();
      const rows=await page.locator('.offer').evaluateAll((cards,selectors)=>cards.map(card=>selectors.map(selector=>card.querySelector(selector).getBoundingClientRect().top)),selectors);
      for(let i=0;i<selectors.length;i++)assert(Math.abs(rows[0][i]-rows[1][i])<1,`${width} ${state}: ${selectors[i]} must align`);
    }
    await page.locator('.offer summary').first().click();await page.locator('.offer summary').last().click();
    await page.locator('.offers').screenshot({path:`${out}/pricing-${width}.png`});await page.close();
  }
  pass('Pricing rows align on desktop, including independently expanded details');
  if(!process.argv.includes('--layout-only')){
    const source=await readFile('experiments/metal/main.mjs','utf8');
    for(const variant of ['original','smooth']){
      const page=await browser.newPage({viewport:{width:1440,height:900}});
      if(variant==='original')await page.route('**/main.mjs',route=>route.fulfill({contentType:'text/javascript',body:source.replace('const mediaOffset = 2.583333;','const mediaOffset = 0;').replace('const mediaFps = 60;','const mediaFps = 24;').replace('journey-scroll-1080.mp4','journey-detail-1080.mp4')}));
      await page.goto(url);await page.waitForFunction(()=>window.__coderaMotion.displayedTime>2.5&&!document.querySelector('video').seeking);
      const result=await page.evaluate(async()=>{
        const video=document.querySelector('video'),frames=[];let collecting=true;
        const sample=(now,info)=>{frames.push({now,time:info.mediaTime});if(collecting)video.requestVideoFrameCallback(sample);};video.requestVideoFrameCallback(sample);
        await new Promise(resolve=>{const start=performance.now();function move(now){const p=Math.min(1,(now-start)/4000);scrollTo(0,1800*p);if(p<1)requestAnimationFrame(move);else resolve();}requestAnimationFrame(move);});
        await new Promise(resolve=>setTimeout(resolve,1000));collecting=false;
        return{frames:frames.length,distinctFrames:new Set(frames.map(f=>f.time)).size,diagnostics:{...window.__coderaMotion}};
      });
      report.motion.push({variant,...result});console.log(JSON.stringify({variant,...result}));await page.close();
    }
    assert(report.motion[1].distinctFrames>report.motion[0].distinctFrames*1.35,'The actual presented motion must be smoother, not only the file metadata');
    pass('Same scroll presents at least 35% more distinct frames than the previous 24 fps media');
  }
}finally{await browser.close();await writeFile(`${out}/polish-report.json`,JSON.stringify(report,null,2));}
