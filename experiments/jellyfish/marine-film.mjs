import * as THREE from '/vendor/three/three.module.min.js';
import {GLTFLoader} from '/vendor/three/GLTFLoader.js';
import {underwaterMaterial} from './underwater-material.mjs';

// Extract asset-local geometry from the editable Blender presentation scene.
// Keeping separate material parts preserves eyes, membranes and packed PBR maps.
export async function loadMarineFilm(onProgress){
 const gltf=await new GLTFLoader().loadAsync('/marine-film.glb',onProgress);
 const library=new Map(),textures=new Set();gltf.scene.updateMatrixWorld(true);
 for(const name of ['Fish0','Fish1','Fish2','Fish3','Shell0','Shell1','Shell2','Plant0','Coral0','Coral1','Coral2']){
  const root=gltf.scene.getObjectByName(name);if(!root)throw new Error(`Marine asset missing: ${name}`);
  const inverse=root.matrixWorld.clone().invert(),parts=[];
  root.traverse(o=>{if(o.isMesh){
   const geometry=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));
   for(const value of Object.values(o.material))if(value?.isTexture){value.anisotropy=4;textures.add(value);}
   parts.push({geometry,material:o.material,name:o.name});
  }});library.set(name,parts);
 }
 const sourceGeometries=new Set(),sourceMaterials=new Set();
 gltf.scene.traverse(o=>{if(o.isMesh){sourceGeometries.add(o.geometry);sourceMaterials.add(o.material);}});
 sourceGeometries.forEach(g=>g.dispose());
 return {get:name=>library.get(name),dispose(){for(const parts of library.values())parts.forEach(p=>p.geometry.dispose());sourceMaterials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}

export function marineFilmMaterial(source,kind,time,waves){
 const m=underwaterMaterial(source.clone(),time,waves);m.side=THREE.DoubleSide;
 if(m.transparent)m.depthWrite=false;
 const base=m.onBeforeCompile;
 m.onBeforeCompile=s=>{
  base(s);
  s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
uniform float seaTime;
attribute float marinePhase;
vec3 marineDisplace(vec3 p){
 ${kind==='fish'?`
 float w=smoothstep(.05,.82,-p.x);
 float beat=seaTime*(4.1+.35*sin(marinePhase))+marinePhase+p.x*4.8;
 p.z+=sin(beat)*.105*w*w;
 ${source.name.includes('membranes')?`float pectoral=smoothstep(.13,.25,abs(p.z))*(1.-smoothstep(.35,.5,abs(p.x)));
 p.y+=sin(seaTime*7.5+marinePhase)*.024*pectoral;`:''}
 `:kind==='plant'?`
 float flex=clamp(p.y/2.7,0.,1.);
 vec3 root=vec3(0.);
 #ifdef USE_INSTANCING
 root=instanceMatrix[3].xyz;
 #endif
 float current=seaTime*.48+root.x*.16+root.z*.11-p.y*.65;
 p.x+=(sin(current)*.26+sin(seaTime*.19+root.z*.04)*.12)*flex*flex;
 p.z+=sin(seaTime*.37+p.y*.9+root.z*.12)*.12*flex;
 `:kind==='fan'?`
 p.z+=sin(seaTime*.45+marinePhase-p.y*.8)*p.y*p.y*.014;
 `:''}
 return p;
}`);
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=marineDisplace(transformed);');
  // Deform normals with the same displacement Jacobian, including tail flex.
  if(['fish','plant','fan'].includes(kind))s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
vec3 n0=normalize(objectNormal);
vec3 axis=abs(n0.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.);
vec3 tangent=normalize(cross(axis,n0)),bitangent=cross(n0,tangent);
vec3 p0=marineDisplace(position);
objectNormal=normalize(cross(marineDisplace(position+tangent*.002)-p0,marineDisplace(position+bitangent*.002)-p0));`);
 };
 m.customProgramCacheKey=()=>`marine-film-1-${kind}-${source.name}`;
 return m;
}
