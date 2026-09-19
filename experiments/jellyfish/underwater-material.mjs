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
float seaHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float seaNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(seaHash(i),seaHash(i+vec3(1,0,0)),f.x),mix(seaHash(i+vec3(0,1,0)),seaHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(seaHash(i+vec3(0,0,1)),seaHash(i+vec3(1,0,1)),f.x),mix(seaHash(i+vec3(0,1,1)),seaHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`)
   .replace('#include <color_fragment>',`#include <color_fragment>
float seaDepth=max(0.,-seaWorld.y);
vec2 waterSlope=texture2D(seaWave,(seaWorld.xz+vec2(.35,-.46)*seaDepth)/64.+.5).yz;
// Guard invalid wave samples and avoid driver-sensitive pow(0, exponent).
if(!all(lessThan(abs(waterSlope),vec2(100.))))waterSlope=vec2(0.);
float ca=clamp(1.-abs(sin(seaWorld.x*1.5+seaWorld.z*.95+waterSlope.x*8.+seaTime*.09)),.001,1.);
float cb=clamp(1.-abs(sin(seaWorld.z*1.2-seaWorld.x*.7+waterSlope.y*9.)),.001,1.);
float ca2=ca*ca,ca4=ca2*ca2,ca8=ca4*ca4;
float sunlight=ca8*ca8*ca2*cb*cb*cb;
diffuseColor.rgb*=mix(vec3(1.),vec3(.63,.87,1.),clamp(seaDepth/30.,0.,.6));
diffuseColor.rgb*=1.+sunlight*.22*exp(-seaDepth*.045);
${skin?`float patches=seaNoise(seaLocal*14.+seaNoise(seaLocal*7.)*2.);float grain=seaNoise(seaLocal*95.);
float folds=.5+.5*sin(seaLocal.y*115.+seaNoise(seaLocal*23.)*5.);
diffuseColor.rgb*=mix(vec3(.88,.76,.68),vec3(1.17,1.06,.91),smoothstep(.18,.85,patches));
diffuseColor.rgb*=.96+.035*grain+.045*folds;`:''}`);
  if(skin)shader.fragmentShader=shader.fragmentShader
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(patches-.5)*.10,.45,.68);')
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
float skinHeight=(folds-.5)*.003*(1.-smoothstep(.004,.015,length(fwidth(seaLocal))));
vec3 skinX=dFdx(-vViewPosition),skinY=dFdy(-vViewPosition),skinR1=cross(skinY,normal),skinR2=cross(normal,skinX);
float skinDet=dot(skinX,skinR1);
normal=normalize(abs(skinDet)*normal-sign(skinDet)*(dFdx(skinHeight)*skinR1+dFdy(skinHeight)*skinR2));`);
 };
 material.customProgramCacheKey=()=>`codera-water-v5-${skin}`;
 return material;
}
