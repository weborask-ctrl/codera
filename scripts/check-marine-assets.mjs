import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const three=pathToFileURL(resolve('.prototype-cache/jellyfish/three/three.module.min.js')).href;
const toModule=s=>`data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
const utils=toModule((await readFile('.prototype-cache/jellyfish/three/BufferGeometryUtils.js','utf8')).replace(/from 'three'/g,`from '${three}'`));
const material=pathToFileURL(resolve('experiments/jellyfish/underwater-material.mjs')).href;
const source=(await readFile('experiments/jellyfish/marine-assets.mjs','utf8')).replace("'/vendor/three/three.module.min.js'",JSON.stringify(three)).replace("'/vendor/three/BufferGeometryUtils.js'",JSON.stringify(utils)).replace("'./underwater-material.mjs'",JSON.stringify(material));
const assetsURL=toModule(source),a=await import(assetsURL);
let vertices=0;
for(const [name,count] of [['coralGeometry',3],['fishGeometry',4],['shellGeometry',3],['plantGeometry',1],['seahorseGeometry',1],['crabGeometry',1]]){
 for(let i=0;i<count;i++){
  const g=a[name](i);g.computeBoundingSphere();assert(Number.isFinite(g.boundingSphere.radius)&&g.boundingSphere.radius>0,name);
  for(const attribute of ['position','normal','color']){assert(g.attributes[attribute],`${name}: ${attribute}`);assert(g.attributes[attribute].array.every(Number.isFinite),`${name}: finite ${attribute}`);}
  if(g.index)assert(g.index.array.every(n=>n<g.attributes.position.count),`${name}: indices`);
  vertices+=g.attributes.position.count;g.dispose();
 }
}
const filmSource=(await readFile('experiments/jellyfish/marine-film.mjs','utf8')).replace("'/vendor/three/three.module.min.js'",JSON.stringify(three)).replace(/^import \{GLTFLoader\}.*$/m,'class GLTFLoader {}').replace("'./underwater-material.mjs'",JSON.stringify(material));
const worldSource=(await readFile('experiments/jellyfish/marine-world.mjs','utf8')).replace("'/vendor/three/three.module.min.js'",JSON.stringify(three)).replace("'./marine-assets.mjs'",JSON.stringify(assetsURL)).replace("'./marine-film.mjs'",JSON.stringify(toModule(filmSource))).replace("'./deep-path.mjs'",JSON.stringify(pathToFileURL(resolve('experiments/jellyfish/deep-path.mjs')).href));
const {createMarineWorld}=await import(toModule(worldSource)),THREE=await import(three),world=createMarineWorld({value:null});
const octopus=new THREE.Group();octopus.position.set(18,-51,-151);
for(const time of [0,.1,4,10,100,500])world.update(time,false,octopus,time>4?1:0);
world.group.traverse(o=>{if(o.isInstancedMesh)assert(o.instanceMatrix.array.every(Number.isFinite),o.name);});
world.update(17,true,octopus,0);const first=world.group.getObjectByName('reef-fish-species-0').instanceMatrix.array.slice();
world.update(29,true,octopus,0);assert.deepEqual(world.group.getObjectByName('reef-fish-species-0').instanceMatrix.array,first,'reduced motion should be deterministic');
const transform=new THREE.Matrix4(),position=new THREE.Vector3();
for(let time=0;time<600;time+=3){
 world.update(time,false,octopus,1);
 for(let type=0;type<4;type++){
  const fish=world.group.getObjectByName(`reef-fish-species-${type}`);
  for(let i=0;i<fish.count;i++){
   fish.getMatrixAt(i,transform);position.setFromMatrixPosition(transform);
   if(position.z<-140)for(const x of [15,18])assert(Math.hypot(position.x-x,position.z+151)>5,'finale swim lanes must leave landing clear');
  }
 }
}
const n=world.group.children.length;world.dispose();
console.log(`PASS: ${vertices} library vertices, ${n} world batches; finite geometry/transforms, index bounds, reduced motion, disposal.`);
