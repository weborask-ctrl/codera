import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
globalThis.ProgressEvent??=class extends Event{constructor(t,o={}){super(t);Object.assign(this,o);}};
const bytes=await readFile('experiments/jellyfish/marine-film.glb');
assert.equal(bytes.toString('ascii',0,4),'glTF');
const length=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+length));
const required=['Fish0','Fish1','Fish2','Fish3','Shell0','Shell1','Shell2','Plant0','Coral0','Coral1','Coral2'];
for(const name of required)assert(j.nodes.some(n=>n.name===name),name);
for(const m of j.materials.filter(m=>/scales|membranes|mineral|blades|corallites/.test(m.name))){
 assert(m.pbrMetallicRoughness?.baseColorTexture,`${m.name} colour`);assert(m.normalTexture,`${m.name} normal`);
 if(m.name.includes('membranes'))assert.equal(m.alphaMode,'BLEND','fin translucency survives export');
}
for(const im of j.images)assert(Number.isInteger(im.bufferView)&&!im.uri,'embedded texture');
const three=pathToFileURL(resolve('.prototype-cache/jellyfish/three/three.module.min.js')).href;
const url=s=>`data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
const helper=async n=>url((await readFile(`.prototype-cache/jellyfish/three/${n}`,'utf8')).replaceAll("from 'three'",`from '${three}'`));
const loader=url((await readFile('.prototype-cache/jellyfish/three/GLTFLoader.js','utf8')).replaceAll("from 'three'",`from '${three}'`).replace("'../utils/BufferGeometryUtils.js'",JSON.stringify(await helper('BufferGeometryUtils.js'))).replace("'../utils/SkeletonUtils.js'",JSON.stringify(await helper('SkeletonUtils.js'))));
delete j.images;delete j.textures;delete j.materials;for(const m of j.meshes)for(const p of m.primitives)delete p.material;
j.buffers[0].uri=`data:application/octet-stream;base64,${bytes.subarray(28+length).toString('base64')}`;
const {GLTFLoader}=await import(loader),THREE=await import(three);
const gltf=await new GLTFLoader().parseAsync(JSON.stringify(j),'');gltf.scene.updateMatrixWorld(true);
let vertices=0;const library=new Map();
for(const name of required){
 const root=gltf.scene.getObjectByName(name),inverse=root.matrixWorld.clone().invert(),bounds=new THREE.Box3(),parts=[];
 root.traverse(o=>{if(o.isMesh){
  const g=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));
  for(const a of Object.values(g.attributes))assert(a.array.every(Number.isFinite),`${name} finite attributes`);
  assert(g.attributes.uv,`${name} UV`);g.computeBoundingBox();bounds.union(g.boundingBox);vertices+=g.attributes.position.count;parts.push({name:o.name,geometry:g,material:o.material});
 }});
 const size=bounds.getSize(new THREE.Vector3());assert(size.length()>0&&size.length()<5,`${name} metre scale`);
 if(name.startsWith('Fish')){assert(size.x>1.8&&size.x<2.3,`${name} body length`);assert(size.y>.3&&size.y<1.4,`${name} Y-up`);}
 library.set(name,parts);
}
const material=pathToFileURL(resolve('experiments/jellyfish/underwater-material.mjs')).href;
const filmURL=url((await readFile('experiments/jellyfish/marine-film.mjs','utf8')).replace("'/vendor/three/three.module.min.js'",JSON.stringify(three)).replace(/^import \{GLTFLoader\}.*$/m,`const {GLTFLoader}=await import(${JSON.stringify(loader)});`).replace("'./underwater-material.mjs'",JSON.stringify(material)));
const assetsURL=url((await readFile('experiments/jellyfish/marine-assets.mjs','utf8')).replace("'/vendor/three/three.module.min.js'",JSON.stringify(three)).replace("'/vendor/three/BufferGeometryUtils.js'",JSON.stringify(await helper('BufferGeometryUtils.js'))).replace("'./underwater-material.mjs'",JSON.stringify(material)));
const worldURL=url((await readFile('experiments/jellyfish/marine-world.mjs','utf8')).replace("'/vendor/three/three.module.min.js'",JSON.stringify(three)).replace("'./marine-assets.mjs'",JSON.stringify(assetsURL)).replace("'./marine-film.mjs'",JSON.stringify(filmURL)).replace("'./deep-path.mjs'",JSON.stringify(pathToFileURL(resolve('experiments/jellyfish/deep-path.mjs')).href)));
const {createMarineWorld}=await import(worldURL),world=createMarineWorld({value:null},[],{get:n=>library.get(n),dispose(){}}),octopus=new THREE.Group();
for(const time of [0,5,35,300]){
 world.update(time,false,octopus,0);
 for(let type=0;type<4;type++){
  const parts=world.group.children.filter(m=>m.name.startsWith(`reef-fish-species-${type}`));assert.equal(parts.length,5,'all five material parts instanced');
  for(const part of parts){assert(part.instanceMatrix.array.every(Number.isFinite));assert.deepEqual(part.instanceMatrix.array,parts[0].instanceMatrix.array,'eyes/fins remain attached while turning');}
 }
}
world.dispose();for(const parts of library.values())parts.forEach(p=>p.geometry.dispose());
console.log(`PASS: ${required.length} real Blender assets; ${vertices} finite vertices, local dimensions, UVs, embedded colour/normal maps; ${(bytes.length/1048576).toFixed(1)} MiB.`);
