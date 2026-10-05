import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

// Build from the same reviewed source as the lightweight local prototype.
await mkdir('public/silver/fonts',{recursive:true});
await mkdir('public/silver/vendor',{recursive:true});
for(const name of ['style.css','refinement.css','signature.css','main.mjs','page-controls.mjs','native-player.mjs','native-stream.mjs','native-stream-worker.mjs','entry.js','entry.css']){
  const source=await readFile(`experiments/metal/${name}`,'utf8');
  await writeFile(`public/silver/${name}`,source.replaceAll('/fonts/','/silver/fonts/').replaceAll('/media/','/motion/metal/'));
}
for(const name of ['geist.woff2','montserrat.woff2','montserrat-700.woff2','Montserrat-OFL.txt'])await copyFile(`app/fonts/${name}`,`public/silver/fonts/${name}`);
for(const name of ['gsap.min.js','ScrollTrigger.min.js'])await copyFile(`node_modules/gsap/dist/${name}`,`public/silver/vendor/${name}`);
console.log('Silver browser assets ready.');

// Verify the reviewed size/quality compromise explicitly authorized on 2026-10-02.
const motionPath='public/motion/metal/journey-balanced-4b593baa7f9b';
const integrity=JSON.parse(await readFile(motionPath+'.integrity.json','utf8'));
const movie=await readFile(motionPath+'.mp4');
if(movie.length!==integrity.containerBytes || createHash('sha256').update(movie).digest('hex')!==integrity.fileSha256)throw Error('The approved Silver stream does not match its integrity manifest');
