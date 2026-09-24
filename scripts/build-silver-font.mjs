// Self-host the OFL-licensed alternative selected for the Silver typography study.

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

const base='https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/';
async function download(name){
  const response=await fetch(base+encodeURIComponent(name));
  if(!response.ok)throw new Error(`${name}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
const source=await download('Montserrat[wght].ttf');
const license=await download('OFL.txt');
let glyphs='';
for(const [start,end] of [[0x20,0x7e],[0xa0,0x17f],[0x2000,0x206f],[0x20ac,0x20ac],[0x2190,0x2199],[0x25b6,0x25b6],[0x2713,0x2713]]){
  for(let code=start;code<=end;code++)glyphs+=String.fromCodePoint(code);
}
const font=await subsetFont(source,glyphs,{targetFormat:'woff2',variationAxes:{wght:{min:400,max:700}}});
await mkdir('app/fonts',{recursive:true});
await writeFile('app/fonts/montserrat.woff2',font);
await writeFile('app/fonts/Montserrat-OFL.txt',license);
console.log(JSON.stringify({bytes:font.length,sourceSha256:createHash('sha256').update(source).digest('hex')}));
