import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
globalThis.ProgressEvent ??= class ProgressEvent extends Event {constructor(type,init={}){super(type);Object.assign(this,init);}};
const bytes=await readFile('assets/blender/octopus/codera-octopus-swim.glb');
assert.equal(bytes.toString('ascii',0,4),'glTF');
const length=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+length));
const skin=j.materials.find(m=>m.name.includes('baked PBR'));
assert(skin?.pbrMetallicRoughness.baseColorTexture,'portable base colour');
assert(skin.normalTexture,'portable normal map');
assert(skin.pbrMetallicRoughness.metallicRoughnessTexture,'portable roughness');
assert(j.images.length>=3,'embedded maps');
for(const im of j.images)assert(Number.isInteger(im.bufferView)&&!im.uri,'self-contained image');
const threeURL=pathToFileURL(resolve('.prototype-cache/jellyfish/three/three.module.min.js')).href;
const moduleURL=s=>`data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
const helper=async file=>moduleURL((await readFile(`.prototype-cache/jellyfish/three/${file}`,'utf8')).replaceAll("from 'three'",`from '${threeURL}'`));
const loaderURL=moduleURL((await readFile('.prototype-cache/jellyfish/three/GLTFLoader.js','utf8')).replaceAll("from 'three'",`from '${threeURL}'`).replace("'../utils/BufferGeometryUtils.js'",JSON.stringify(await helper('BufferGeometryUtils.js'))).replace("'../utils/SkeletonUtils.js'",JSON.stringify(await helper('SkeletonUtils.js'))));
const THREE=await import(threeURL),{GLTFLoader}=await import(loaderURL);
// CPU rig verification uses the real binary buffers; images are checked above
// and visually in the browser, not decoded by a mocked image implementation.
delete j.images;delete j.textures;delete j.materials;
for(const m of j.meshes)for(const p of m.primitives)delete p.material;
j.buffers[0].uri=`data:application/octet-stream;base64,${bytes.subarray(28+length).toString('base64')}`;
const gltf=await new GLTFLoader().parseAsync(JSON.stringify(j),'');
const rig=gltf.scene.getObjectByName('OCTOPUS_RIG'),mixer=new THREE.AnimationMixer(rig);
assert(rig);assert(gltf.animations.every(a=>a.duration>=14),'landing endpoint exported');
for(const clip of gltf.animations)mixer.clipAction(clip).play();
const poses=[];
for(const time of [0,.95,1.5,2.7,5,9,11.999,12.5,13,13.5,13.999]){
 mixer.setTime(time);rig.updateMatrixWorld(true);const row=[];
 rig.traverse(o=>{if(o.isBone){assert(o.matrixWorld.elements.every(Number.isFinite));assert(Math.abs(o.scale.x-1)<1e-5&&Math.abs(o.scale.y-1)<1e-5&&Math.abs(o.scale.z-1)<1e-5,`scale ${o.name}`);row.push(...o.quaternion.toArray());}});poses.push(row);
}
assert(poses[1].some((v,i)=>Math.abs(v-poses.at(-1)[i])>.1),'landing differs from idle');
mixer.setTime(0);const seam=[];rig.traverse(o=>{if(o.isBone)seam.push(o.quaternion.clone());});
mixer.setTime(12);let seamIndex=0;rig.traverse(o=>{if(o.isBone)assert(o.quaternion.angleTo(seam[seamIndex++])<.002,`swim loop seam ${o.name}`);});
console.log(`PASS: ${j.animations.length} animation tracks, 11 finite rig poses, unit bone scales, distinct landing, embedded base/normal/roughness maps; ${(bytes.length/1048576).toFixed(1)} MiB.`);
