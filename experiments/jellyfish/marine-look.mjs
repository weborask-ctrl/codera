import * as THREE from '/vendor/three/three.module.min.js';
import {loadMarineFilm,marineFilmMaterial} from './marine-film.mjs';
const canvas=document.querySelector('canvas'),status=document.querySelector('#status');
try{
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#142c33');
 const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.01,100);
 scene.add(new THREE.HemisphereLight('#e6f3fa','#877554',2.3));
 for(const [color,intensity,p] of [['#ffe5bf',3.8,[3,5,4]],['#83b9d4',2.1,[-3,1,-3]],['#fff1df',1.4,[-4,0,4]]]){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...p);scene.add(l);}
 const library=await loadMarineFilm(e=>{status.textContent=e.loaded===e.total?'Pripravujem povrchy…':`Načítavam modely ${Math.round(e.loaded/1048576)} MB…`;}),clock={value:0},group=new THREE.Group(),target=new THREE.Vector3();scene.add(group);
 let playing=true,yaw=.2,pitch=.07,distance=3.8,last=performance.now(),modelRadius=1;
 function choose(){
  for(const o of [...group.children]){o.geometry.dispose();o.material.dispose();group.remove(o);}
  const name=document.querySelector('#asset').value,kind=name.startsWith('Fish')?'fish':name.startsWith('Plant')?'plant':name==='Coral1'?'fan':'shell';
  for(const part of library.get(name)){
   const g=part.geometry.clone();g.setAttribute('marinePhase',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));
   const m=new THREE.Mesh(g,marineFilmMaterial(part.material,kind,clock,{value:null}));group.add(m);
  }
  const bounds=new THREE.Box3().setFromObject(group);bounds.getCenter(target);modelRadius=bounds.getSize(new THREE.Vector3()).length()*.5;distance=modelRadius*(name.startsWith('Plant')?4.2:3.4);yaw=.2;pitch=name.startsWith('Shell')?.65:.07;
  status.textContent='Blender model · vložené PBR textúry';canvas.dataset.asset=name;
 }
 choose();document.querySelector('#asset').onchange=choose;
 document.querySelector('#pause').onclick=e=>{playing=!playing;e.target.textContent=playing?'Zastaviť':'Spustiť';};
 let drag=null;canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};canvas.onpointerup=()=>drag=null;
 canvas.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag[1])*.006,-1.3,1.3);drag=[e.clientX,e.clientY];};
 canvas.onwheel=e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance*Math.exp(e.deltaY*.001),modelRadius*1.3,modelRadius*7);};
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 renderer.setAnimationLoop(now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(playing&&!reduced.matches)clock.value+=dt;
  camera.position.set(target.x+sin(yaw)*cos(pitch)*distance,target.y+sin(pitch)*distance,target.z+cos(yaw)*cos(pitch)*distance);camera.lookAt(target);renderer.render(scene,camera);canvas.dataset.ready='true';
 });
 function sin(x){return Math.sin(x);}function cos(x){return Math.cos(x);}
}catch(e){document.querySelector('#error').textContent=e.message;console.error(e);}
