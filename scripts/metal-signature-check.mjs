import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='test-results/metal-signature';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try{
 for(const [width,height] of [[1440,900],[1078,646],[768,900],[390,844],[320,568],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<701});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.METAL_URL||'http://127.0.0.1:4327/');await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
  const measures=await page.evaluate(()=>({work:document.querySelector('#praca').offsetHeight,cards:[...document.querySelectorAll('.project')].map(el=>({height:el.offsetHeight,position:getComputedStyle(el).position})),journey:document.querySelector('.journey').offsetHeight}));
  for(const id of ['sluzby','studio','kontakt']){
   await page.locator('#'+id).evaluate(el=>el.scrollIntoView());
   await page.screenshot({path:`${out}/${width}-${id}.png`});
  }
  const gridY=await page.locator('.project-grid').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  await page.evaluate(y=>scrollTo(0,y),gridY);
  await page.screenshot({path:`${out}/${width}-work.png`});
  if(height>620){
   await page.mouse.wheel(0,Math.round(measures.cards[0].height*.75));
   await page.waitForTimeout(250);
   const overlap=await page.locator('.project').evaluateAll(els=>{const a=els[0].getBoundingClientRect(),b=els[1].getBoundingClientRect();return a.top>=0&&b.top<a.bottom&&b.top>a.top;});
   assert(overlap,`Cards should overlap at ${width}`);
   await page.screenshot({path:`${out}/${width}-stack.png`});
  }
  assert.equal(errors.length,0);results.push({width,height,...measures,errors});
  await page.close();
 }
 await writeFile(`${out}/report.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
