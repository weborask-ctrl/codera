import * as THREE from '/vendor/three/three.module.min.js';
import {underwaterMaterial} from './underwater-material.mjs';
// Shared 2K CC0 scan, retained once per page. See textures/SOURCES.md.
const maps=await Promise.all(['color','height','roughness'].map(n=>new THREE.TextureLoader().loadAsync(`/textures/rock-${n}.jpg`)));
maps.forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;});
maps[0].colorSpace=THREE.SRGBColorSpace;
export function photographicRock(time,waves,{vertexColors=false,sandMap=null}={}){
 const mat=underwaterMaterial(new THREE.MeshStandardMaterial({color:'#c5c5b7',roughness:.88,side:THREE.DoubleSide,vertexColors}),time,waves);
 const base=mat.onBeforeCompile;
 mat.onBeforeCompile=shader=>{
  base(shader);shader.uniforms.rockColor={value:maps[0]};shader.uniforms.rockHeight={value:maps[1]};shader.uniforms.rockRough={value:maps[2]};if(sandMap)shader.uniforms.terrainSand={value:sandMap};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 rockNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec3 mappedNormal=normal;\n#ifdef USE_INSTANCING\nmappedNormal=mat3(instanceMatrix)*mappedNormal;\n#endif\nrockNormal=normalize(mat3(modelMatrix)*mappedNormal);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 rockNormal;
uniform sampler2D rockColor,rockHeight,rockRough;
${sandMap?'uniform sampler2D terrainSand;':''}
vec4 rockSample(sampler2D tex,vec3 p,vec3 w){return texture2D(tex,p.yz)*w.x+texture2D(tex,p.xz)*w.y+texture2D(tex,p.xy)*w.z;}`)
  .replace('#include <color_fragment>',`#include <color_fragment>
vec3 rockWeights=pow(abs(normalize(rockNormal)),vec3(4.));rockWeights/=max(.001,dot(rockWeights,vec3(1.)));
vec3 rockUV=seaWorld*.55;
vec3 stoneAlbedo=rockSample(rockColor,rockUV,rockWeights).rgb;
${sandMap?`float slopeMix=smoothstep(.60,.94,abs(normalize(rockNormal).y));
float sandRidge=.5+.5*sin(seaWorld.z*9.+sin(seaWorld.x*.7)*1.8+seaNoise(seaWorld*.4)*2.);
vec3 sandAlbedo=texture2D(terrainSand,seaWorld.xz*.19).rgb*vec3(.85,.81,.65);
sandAlbedo*=.92+.08*sandRidge;
stoneAlbedo=mix(stoneAlbedo,sandAlbedo,slopeMix);`:''}
diffuseColor.rgb*=stoneAlbedo;`)
  .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(rockSample(rockRough,rockUV,rockWeights).r,.58,.98);`)
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
float elevation=rockSample(rockHeight,rockUV,rockWeights).r*.045;
${sandMap?`float rippleFilter=1.-smoothstep(.25,1.,fwidth(seaWorld.z*9.));
float sandRelief=sin(seaWorld.z*9.+sin(seaWorld.x*.7)*1.8+seaNoise(seaWorld*.4)*2.)*.023*rippleFilter;
elevation=mix(elevation,sandRelief,slopeMix);`:''}
vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition),r1=cross(sy,normal),r2=cross(normal,sx);
float det=dot(sx,r1);
normal=normalize(abs(det)*normal-sign(det)*(dFdx(elevation)*r1+dFdy(elevation)*r2));`);
 };
 mat.customProgramCacheKey=()=>`photographic-rock-3-${vertexColors}-${Boolean(sandMap)}`;
 return mat;
}
