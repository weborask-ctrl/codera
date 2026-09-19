// Shared water response for skin, stone and coral, driven by the approved wave map.
export function underwaterMaterial(material,time,waves,{skin=false}={}){
 material.onBeforeCompile=shader=>{
  shader.uniforms.seaTime=time;shader.uniforms.seaWave=waves;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 seaWorld; varying vec3 seaLocal;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nseaLocal=position;')
   .replace('#include <project_vertex>',`#include <project_vertex>
vec4 seaPoint=vec4(transformed,1.);
#ifdef USE_INSTANCING
seaPoint=instanceMatrix*seaPoint;
#endif
seaWorld=(modelMatrix*seaPoint).xyz;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
uniform float seaTime; uniform sampler2D seaWave;
varying vec3 seaWorld; varying vec3 seaLocal;
float seaHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float seaNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(seaHash(i),seaHash(i+vec3(1,0,0)),f.x),mix(seaHash(i+vec3(0,1,0)),seaHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(seaHash(i+vec3(0,0,1)),seaHash(i+vec3(1,0,1)),f.x),mix(seaHash(i+vec3(0,1,1)),seaHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`)
   .replace('#include <color_fragment>',`#include <color_fragment>
float seaDepth=max(0.,-seaWorld.y);
vec2 waterSlope=texture2D(seaWave,(seaWorld.xz+vec2(.35,-.46)*seaDepth)/64.+.5).yz;
float sunlight=pow(max(0.,1.-abs(sin(seaWorld.x*1.5+seaWorld.z*.95+waterSlope.x*8.+seaTime*.09))),18.)*pow(max(0.,1.-abs(sin(seaWorld.z*1.2-seaWorld.x*.7+waterSlope.y*9.))),3.);
diffuseColor.rgb*=mix(vec3(1.),vec3(.63,.87,1.),clamp(seaDepth/30.,0.,.6));
diffuseColor.rgb*=1.+sunlight*.30*exp(-seaDepth*.045);
${skin?`float patches=seaNoise(seaLocal*35.);float grain=seaNoise(seaLocal*190.);
diffuseColor.rgb*=mix(vec3(.69,.63,.57),vec3(1.12,1.06,.97),smoothstep(.15,.86,patches));
diffuseColor.rgb*=.97+.06*grain;`:''}`);
  if(skin)shader.fragmentShader=shader.fragmentShader
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(patches-.5)*.13,.29,.61);')
   .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(dFdx(grain),dFdy(grain),0.)*.09);');
 };
 material.customProgramCacheKey=()=>`codera-water-v2-${skin}`;
 return material;
}
