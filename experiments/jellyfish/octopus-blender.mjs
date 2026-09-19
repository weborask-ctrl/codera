import * as THREE from '/vendor/three/three.module.min.js';
import {GLTFLoader} from '/vendor/three/GLTFLoader.js';

// The authoring scene stays in Blender. Only its character and deforming clips
// enter the ocean: studio cameras/lights and the demonstration root path do not.
export async function createOctopus(time){
 const gltf=await new GLTFLoader().loadAsync('/octopus-swim.glb');
 const rig=gltf.scene.getObjectByName('OCTOPUS_RIG');
 if(!rig)throw new Error('Blender asset has no OCTOPUS_RIG');
 const group=new THREE.Group();group.name='Blender octopus — scroll root';
 const model=new THREE.Group();model.name='Blender octopus — metre conversion';
 model.scale.setScalar(3.8);model.add(rig);group.add(model);
 const mixer=new THREE.AnimationMixer(rig);
 for(const source of gltf.animations){
  const tracks=source.tracks.filter(track=>!/^ROOT\.(position|quaternion|scale)$/.test(track.name));
  mixer.clipAction(new THREE.AnimationClip(source.name,source.duration,tracks)).play();
 }
 const materials=new Set(),geometries=new Set(),skeletons=new Set();
 rig.traverse(object=>{
  if(!object.isMesh)return;
  geometries.add(object.geometry);
  if(object.skeleton)skeletons.add(object.skeleton);
  // Avoid per-frame CPU bounds recomputation over the dense sculpt. The journey
  // controls visibility as one character; the GPU still clips its triangles.
  object.frustumCulled=false;
  const old=object.material;
  const name=object.name.toLowerCase();
  const skin=name.includes('continuous')||name.startsWith('eye')||name.includes('siphon');
  const pupil=name.includes('pupil'),iris=name.includes('iris');
  const mat=new THREE.MeshStandardMaterial({color:skin?'#b45b2c':pupil?'#03171c':iris?'#b9a66a':'#d6b18b',roughness:skin?.43:pupil?.20:.49,metalness:0});
  if(skin){
   mat.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 skinPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nskinPoint=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 skinPoint;
float skinHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float skinNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(skinHash(i),skinHash(i+vec3(1,0,0)),f.x),mix(skinHash(i+vec3(0,1,0)),skinHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(skinHash(i+vec3(0,0,1)),skinHash(i+vec3(1,0,1)),f.x),mix(skinHash(i+vec3(0,1,1)),skinHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`)
     .replace('#include <color_fragment>',`#include <color_fragment>
float mottling=skinNoise(skinPoint*48.);
float pores=skinNoise(skinPoint*240.);
diffuseColor.rgb*=mix(vec3(.40,.36,.32),vec3(1.32,1.17,.96),smoothstep(.22,.78,mottling));
diffuseColor.rgb*=.9+.16*pores;`);
   };
   mat.customProgramCacheKey=()=> 'codera-blender-skin-v1';
  }
  materials.add(mat);object.material=mat;
  for(const m of Array.isArray(old)?old:[old])m?.dispose();
 });
 const root=rig.getObjectByName('ROOT');
 const rootPosition=root.position.clone(),rootRotation=root.quaternion.clone();
 const bones=[];rig.traverse(o=>{if(o.isBone&&o!==root)bones.push(o);});
 mixer.setTime(2.7);
 const folded=bones.map(b=>b.quaternion.clone());
 const skinMesh=rig.getObjectByName('Octopus_|_continuous_deforming_skin');
 const foldedMorph=skinMesh?.morphTargetInfluences?.slice();
 let lastTime=0,clock=0,reduced=false;
 mixer.setTime(1.5);
 return {group,kind:'blender',setBackdrop(){},setQuality(){},
  update(elapsed){
   const dt=Math.max(0,Math.min(.1,elapsed-lastTime));lastTime=elapsed;
   if(!reduced)clock+=dt;
   mixer.setTime(reduced?1.5:clock);
   // Seeking the clip must never reintroduce the Blender showcase trajectory.
   root.position.copy(rootPosition);root.quaternion.copy(rootRotation);
   group.rotation.set(0,0,0);
  },
  setMotion(strength,phase,tucks,options={}){
   reduced=Boolean(options.reduced);
   if(reduced){mixer.setTime(1.5);root.position.copy(rootPosition);root.quaternion.copy(rootRotation);}
   // Freeze a folded pose as it enters the actual cave; never scale the mesh
   // down to fake disappearance. The reef's depth buffer provides occlusion.
   if(options.progress>.66){
    const u=THREE.MathUtils.smoothstep(options.progress,.66,.87);
    for(let i=0;i<bones.length;i++)bones[i].quaternion.slerp(folded[i],u);
    if(foldedMorph)for(let i=0;i<foldedMorph.length;i++)skinMesh.morphTargetInfluences[i]=THREE.MathUtils.lerp(skinMesh.morphTargetInfluences[i],foldedMorph[i],u);
    root.position.copy(rootPosition);root.quaternion.copy(rootRotation);
   }
  },
  dispose(){mixer.stopAllAction();mixer.uncacheRoot(rig);skeletons.forEach(s=>s.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 };
}
