import * as THREE from '/vendor/three/three.module.min.js';
import {underwaterMaterial} from './underwater-material.mjs';
// Shared 2K CC0 scan, retained once per page. See textures/SOURCES.md.
const maps=await Promise.all(['color','height','roughness'].map(n=>new THREE.TextureLoader().loadAsync(`/textures/rock-${n}.jpg`)));
maps.forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;});
maps[0].colorSpace=THREE.SRGBColorSpace;
export function photographicRock(time,waves,{vertexColors=false}={}){
 const mat=underwaterMaterial(new THREE.MeshStandardMaterial({color:'#c5c5b7',roughness:.88,side:THREE.DoubleSide,vertexColors}),time,waves);
 const base=mat.onBeforeCompile;
 mat.onBeforeCompile=shader=>{
  base(shader);shader.uniforms.rockColor={value:maps[0]};shader.uniforms.rockHeight={value:maps[1]};shader.uniforms.rockRough={value:maps[2]};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 rockNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nrockNormal=normalize(mat3(modelMatrix)*normal);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 rockNormal;
uniform sampler2D rockColor,rockHeight,rockRough;
vec4 rockSample(sampler2D tex,vec3 p,vec3 w){return texture2D(tex,p.yz)*w.x+texture2D(tex,p.xz)*w.y+texture2D(tex,p.xy)*w.z;}`)
  .replace('#include <color_fragment>',`#include <color_fragment>
vec3 rockWeights=pow(abs(normalize(rockNormal)),vec3(4.));rockWeights/=max(.001,dot(rockWeights,vec3(1.)));
vec3 rockUV=seaWorld*.55;
diffuseColor.rgb*=rockSample(rockColor,rockUV,rockWeights).rgb;`)
  .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(rockSample(rockRough,rockUV,rockWeights).r,.58,.98);`)
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
float elevation=rockSample(rockHeight,rockUV,rockWeights).r*.045;
vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition),r1=cross(sy,normal),r2=cross(normal,sx);
float det=dot(sx,r1);
normal=normalize(abs(det)*normal-sign(det)*(dFdx(elevation)*r1+dFdy(elevation)*r2));`);
 };
 mat.customProgramCacheKey=()=>`photographic-rock-1-${vertexColors}`;
 return mat;
}
