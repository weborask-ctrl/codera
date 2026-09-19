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
const depthBands=[[-18,0],[-39,-18],[-58,-39],[-83,-58],[-111,-83],[-141,-111],[-185,-141]];
for(let time=0;time<600;time+=3){
 world.update(time,false,octopus,1);
 const coverage=depthBands.map(()=>0);
 for(let type=0;type<4;type++){
  const fish=world.group.getObjectByName(`reef-fish-species-${type}`);
  for(let i=0;i<fish.count;i++){
   fish.getMatrixAt(i,transform);position.setFromMatrixPosition(transform);
   depthBands.forEach(([near,far],index)=>{if(position.z>=near&&position.z<far)coverage[index]++;});
   if(position.z<-140)for(const x of [15,18])assert(Math.hypot(position.x-x,position.z+151)>5,'finale swim lanes must leave landing clear');
  }
 }
 assert(coverage.every(n=>n>=3),`fish must populate the whole journey: ${coverage}`);
}
const n=world.group.children.length;world.dispose();
// A deliberately broad raised gateway catches every accidental upward mount.
// Shells must hit the separate seabed, while plants may still use the gateway.
const reef=new THREE.Group(),gate=new THREE.Group();gate.name='continuous-eroded-stone-gateway';
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,400),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-18,-100);reef.add(floor);
const arch=new THREE.Mesh(new THREE.BoxGeometry(36,5,22),floor.material);arch.position.set(18,-12,-47);gate.add(arch);
const mounted=createMarineWorld({value:null},[],null,[reef,gate]);let sandShells=0;
mounted.group.traverse(o=>{if(o.name.startsWith('ribbed-shells-'))for(let i=0;i<o.count;i++){
 o.getMatrixAt(i,transform);position.setFromMatrixPosition(transform);
 if(position.z>-58&&position.z<-36){assert(Math.abs(position.y+17.992)<.001,'no shell may mount the gateway');sandShells++;}
}});
assert(sandShells>=18,'shells remain on sand beneath the gateway');mounted.dispose();floor.geometry.dispose();arch.geometry.dispose();floor.material.dispose();
console.log(`PASS: ${vertices} library vertices, ${n} world batches; finite geometry, reduced motion, 7 populated depth bands, clear landing, shells exclude gateway.`);
