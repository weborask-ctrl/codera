import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

// Build from the same reviewed source as the lightweight local prototype.
await mkdir('public/silver/fonts',{recursive:true});
await mkdir('public/silver/vendor',{recursive:true});
for(const name of ['style.css','refinement.css','signature.css','main.mjs','stream.mjs']){
  const source=await readFile(`experiments/metal/${name}`,'utf8');
  await writeFile(`public/silver/${name}`,source.replaceAll('/fonts/','/silver/fonts/').replaceAll('/media/','/motion/metal/'));
}
for(const name of ['geist.woff2','montserrat.woff2','Montserrat-OFL.txt'])await copyFile(`app/fonts/${name}`,`public/silver/fonts/${name}`);
for(const name of ['gsap.min.js','ScrollTrigger.min.js'])await copyFile(`node_modules/gsap/dist/${name}`,`public/silver/vendor/${name}`);
console.log('Silver browser assets ready.');
