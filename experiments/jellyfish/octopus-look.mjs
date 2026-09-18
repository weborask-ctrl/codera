import * as THREE from '/vendor/three/three.module.min.js';

// All environment detail is evaluated in world space, without image textures.
import { oceanFragment as fragment, waveMapFragment } from './ocean-film-shaders.mjs';

const canvas=document.querySelector('canvas');
const study=document.body.hasAttribute('data-octopus');
const stats=document.querySelector('#stats');
const pause=document.querySelector('#pause');
const controls=document.querySelector('#controls');
controls.onclick=()=>{const clean=document.body.classList.toggle('clean');controls.textContent=clean?'Zobrazi\u0165 ovl\u00e1danie':'Skry\u0165 ovl\u00e1danie';controls.setAttribute('aria-expanded',String(!clean));};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,antialias:study,alpha:false,powerPreference:'high-performance'}); }
catch { document.querySelector('#error').textContent='WebGL nie je dostupné. Živé more potrebuje hardvérové vykresľovanie v prehliadači.'; }
if(renderer){
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.10;
const uniforms={waveFootprint:{value:64/2048},refineSurface:{value:true},cameraOffset:{value:new THREE.Vector3()},resolution:{value:new THREE.Vector2()},time:{value:0},depth:{value:3},travel:{value:0},pointer:{value:new THREE.Vector2()},waveMap:{value:null},useWaveMap:{value:false},renderMode:{value:0},volumeMap:{value:null}};
const scene=new THREE.Scene();
const camera=new THREE.Camera();
const material=new THREE.ShaderMaterial({uniforms,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:fragment,depthTest:false,depthWrite:false});
const plane=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);scene.add(plane);
const waveScene=new THREE.Scene();
let waveTarget=null,volumeTarget=null;
const volumeScene=new THREE.Scene();
if(renderer.extensions.has('EXT_color_buffer_float')){
 waveTarget=new THREE.WebGLRenderTarget(2048,2048,{type:THREE.HalfFloatType,depthBuffer:false,stencilBuffer:false,wrapS:THREE.RepeatWrapping,wrapT:THREE.RepeatWrapping,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:true});
 const waveMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:material.vertexShader,fragmentShader:waveMapFragment,depthTest:false,depthWrite:false,toneMapped:false});
 waveScene.add(new THREE.Mesh(plane.geometry,waveMaterial));
 uniforms.waveMap.value=waveTarget.texture;uniforms.useWaveMap.value=true;
 volumeTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false,stencilBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
 const volumeMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:material.vertexShader,fragmentShader:fragment.replace('uniform int renderMode;','const int renderMode=2;').replace('uniform bool useWaveMap;','const bool useWaveMap=true;'),depthTest:false,depthWrite:false,toneMapped:false});
 volumeScene.add(new THREE.Mesh(plane.geometry,volumeMaterial));
 uniforms.volumeMap.value=volumeTarget.texture;
 material.fragmentShader=fragment.replace('uniform int renderMode;','const int renderMode=1;').replace('uniform bool useWaveMap;','const bool useWaveMap=true;');
 material.needsUpdate=true;
}

// Optional look-development scene. The standalone approved ocean keeps its own path.
let jelly=null,backdrop=null,presentScene=null;
const jellyScene=new THREE.Scene();
if(study){
 const {createOctopus}=await import('./octopus.mjs');
 jelly=createOctopus(uniforms.time,uniforms.waveMap);
 jelly.group.position.set(.9,-2.75,-6.6);
 jelly.group.rotation.set(.02,-.10,-.05);
 jelly.group.scale.setScalar(1.12);
 jellyScene.add(jelly.group);
 uniforms.cameraOffset.value.y=0;
 backdrop=new THREE.WebGLRenderTarget(1,1,{type:waveTarget?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:false});
 presentScene=new THREE.Scene();
 presentScene.add(new THREE.Mesh(plane.geometry,new THREE.ShaderMaterial({uniforms:{image:{value:backdrop.texture}},vertexShader:material.vertexShader,fragmentShader:'uniform sampler2D image;varying vec2 vUv;void main(){gl_FragColor=texture2D(image,vUv);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',depthTest:false,depthWrite:false})));
 document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{
  const detail=button.dataset.view==='detail';
  uniforms.cameraOffset.value.set(detail?jelly.group.position.x-.3:0,detail?.45:0,detail?-2.2:0);
  uniforms.pointer.value.set(0,0);uniforms.travel.value=0;moving=false;
  document.querySelector('#travel').textContent='Prelet kamery';
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.body.classList.toggle('detail',detail);dirty=true;wake();
 });
}

// Sparse particles are actual world-space points; camera travel produces parallax.
const particleScene=new THREE.Scene();
const particleCamera=new THREE.PerspectiveCamera(77.3196,1,.1,100);
const positions=new Float32Array(3200*3);
let seed=27183;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<3200;i++){positions[i*3]=(random()-.5)*38;positions[i*3+1]=-random()*19;positions[i*3+2]=8-random()*65;}
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
const particles=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:uniforms.time,pixels:{value:1}},vertexShader:'uniform float time;uniform float pixels;varying float fade;void main(){vec3 p=position;p.x+=sin(time*.18+p.z)*.13;p.y+=sin(time*.23+p.x)*.10;vec4 mv=modelViewMatrix*vec4(p,1.);fade=exp(-length(mv.xyz)*.040)*.32;gl_PointSize=clamp(38.*pixels/max(1.,-mv.z),.65,12.*pixels);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float fade;void main(){float r=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(.45,.87,1.,(1.-smoothstep(.1,1.,r))*fade);}'});
particleScene.add(new THREE.Points(geometry,particles));
let playing=!reduced.matches, moving=false, travelPhase=0, elapsed=0,last=0,raf=0,frames=0,report=performance.now(),dirty=true;
function resize(){if(jelly){jelly.group.position.x=innerWidth/innerHeight<.8?0:.9;jelly.group.scale.setScalar(innerWidth/innerHeight<.8?.60:1.12);if(document.body.classList.contains('detail'))uniforms.cameraOffset.value.x=jelly.group.position.x-.3;}const budget=Number(document.querySelector('#quality').value);const waveSize=budget<1000000?1024:2048;if(waveTarget&&waveTarget.width!==waveSize)waveTarget.setSize(waveSize,waveSize);uniforms.waveFootprint.value=64/waveSize;uniforms.refineSurface.value=budget>=1000000;const ratio=Math.min(devicePixelRatio,2,Math.sqrt(budget/(innerWidth*innerHeight)));renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);if(volumeTarget)volumeTarget.setSize(Math.max(1,Math.ceil(innerWidth*ratio*.5)),Math.max(1,Math.ceil(innerHeight*ratio*.5)));if(backdrop){const size=renderer.getDrawingBufferSize(new THREE.Vector2());backdrop.setSize(size.x,size.y);jelly.setBackdrop(backdrop.texture,size.x,size.y);}uniforms.resolution.value.set(innerWidth,innerHeight);particleCamera.aspect=innerWidth/innerHeight;particleCamera.updateProjectionMatrix();particles.uniforms.pixels.value=ratio;dirty=true;wake();}
function draw(){
 uniforms.time.value=elapsed;jelly?.update?.(elapsed);const t=uniforms.travel.value;
 particleCamera.position.set(t*1.4,-uniforms.depth.value+Math.sin(elapsed*.23)*.055,t*5).add(uniforms.cameraOffset.value);
 particleCamera.lookAt(particleCamera.position.clone().add(new THREE.Vector3(uniforms.pointer.value.x*.12,.08+uniforms.pointer.value.y*.08,-1)));
 renderer.autoClear=true;
 jelly?.renderShadow?.(renderer,jellyScene);
 if(waveTarget){renderer.setRenderTarget(waveTarget);renderer.render(waveScene,camera);renderer.setRenderTarget(null);}
 if(volumeTarget){
  uniforms.renderMode.value=2;
  // Avoid a feedback binding even though this branch does not sample its input.
  uniforms.volumeMap.value=null;
  renderer.setRenderTarget(volumeTarget);renderer.render(volumeScene,camera);renderer.setRenderTarget(null);
  uniforms.volumeMap.value=volumeTarget.texture;uniforms.renderMode.value=1;
 }
 if(backdrop){renderer.setRenderTarget(backdrop);renderer.toneMapping=THREE.NoToneMapping;}
 renderer.render(scene,camera);renderer.autoClear=false;renderer.render(particleScene,particleCamera);
 if(backdrop){
  renderer.setRenderTarget(null);renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.autoClear=true;renderer.render(presentScene,camera);renderer.autoClear=false;
  renderer.render(jellyScene,particleCamera);
 }
 canvas.dataset.ready=String(!document.querySelector('#error').textContent);
 canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);
 canvas.dataset.waveMap=String(Boolean(waveTarget));
}
function tick(now){raf=0;if(document.hidden)return;if(now-last>=1000/30||dirty){const dt=last?Math.min((now-last)/1000,.08):0;last=now;if(playing){elapsed+=dt;if(moving){travelPhase+=dt*.16;uniforms.travel.value=Math.sin(travelPhase)*2.;}}draw();dirty=false;frames++;if(!playing){const size=renderer.getDrawingBufferSize(new THREE.Vector2());stats.textContent=`Pozastaven\u00e9 · ${size.x} × ${size.y}`;}if(playing&&now-report>1000){const size=renderer.getDrawingBufferSize(new THREE.Vector2());stats.textContent=`${Math.round(frames*1000/(now-report))} fps · ${size.x} × ${size.y} · procedurálne 3D`;frames=0;report=now;}}if(playing)raf=requestAnimationFrame(tick);}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
pause.textContent=playing?'Zastaviť':'Spustiť';
pause.onclick=()=>{playing=!playing;pause.textContent=playing?'Zastaviť':'Spustiť';last=0;frames=0;report=performance.now();dirty=true;wake();};
document.querySelector('#travel').onclick=(event)=>{moving=!moving;event.target.textContent=moving?'Zastaviť prelet':'Prelet kamery';};
document.querySelector('#depth').oninput=(event)=>{uniforms.depth.value=Number(event.target.value);dirty=true;wake();};
document.querySelector('#quality').onchange=resize;
addEventListener('pointermove',event=>{if(event.target!==canvas)return;uniforms.pointer.value.set(event.clientX/innerWidth-.5,.5-event.clientY/innerHeight);dirty=true;wake();});
addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;dirty=true;wake();}});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();playing=false;cancelAnimationFrame(raf);document.querySelector('#error').textContent='Grafický kontext sa prerušil. Obnov stránku a použi úspornú kvalitu.';});
renderer.debug.onShaderError=(gl,program,vs,fs)=>{console.error(gl.getShaderInfoLog(fs));document.querySelector('#error').textContent='Shader sa nepodarilo skompilovať. Táto verzia potrebuje opravu pre tento grafický ovládač.';};
reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;pause.textContent='Spusti\u0165';dirty=true;wake();}});
addEventListener('pagehide',event=>{
 cancelAnimationFrame(raf);raf=0;
 if(!event.persisted){jelly?.dispose();backdrop?.dispose();presentScene?.traverse(object=>object.material?.dispose());waveTarget?.dispose();volumeTarget?.dispose();volumeScene.traverse(object=>object.material?.dispose());waveScene.traverse(object=>object.material?.dispose());material.dispose();plane.geometry.dispose();particles.dispose();geometry.dispose();renderer.dispose();}
});
addEventListener('pageshow',()=>{last=0;dirty=true;wake();});
resize();
}
