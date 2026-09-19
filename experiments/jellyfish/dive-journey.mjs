import * as THREE from '/vendor/three/three.module.min.js';
import {createReef} from './reef.mjs';
import {SwimController} from './swim-controller.mjs';

const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>v*v*(3-2*v);
// These anchors are the replacement contract for future Blender assets.
export const DIVE_ANCHORS={reef:[0,-15,-22],den:[2,-12.7,-19],hiddenOctopus:[9,-12.7,-32]};

// Smooth, reversible position tracks. Derivatives are sampled for heading.
export function sampleSwim(p,mobile=false){
 const keys=[
  [0,mobile?.35:3.1,mobile?-5:-2.4,-7],
  [.18,mobile?.55:2.65,-3.1,-7.5], [.36,mobile?.1:1.65,-5.6,-9.4],
  [.53,.6,-9.0,-13.6], [.69,2,-12.2,-16.5],
  [.79,2,-12.7,-18.3], [.90,3.4,-12.7,-23], [1,...DIVE_ANCHORS.hiddenOctopus],
 ];
 let i=0;while(i<keys.length-2&&p>keys[i+1][0])i++;
 const a=keys[i],b=keys[i+1],u=clamp((p-a[0])/(b[0]-a[0]));
 return a.slice(1).map((v,c)=>{
  const prev=keys[Math.max(0,i-1)],next=keys[Math.min(keys.length-1,i+2)];
  const m0=i===0?0:(b[c+1]-prev[c+1])/(b[0]-prev[0])*(b[0]-a[0]);
  const m1=i===keys.length-2?0:(next[c+1]-a[c+1])/(next[0]-a[0])*(b[0]-a[0]);
  return (2*u**3-3*u*u+1)*v+(u**3-2*u*u+u)*m0+(-2*u**3+3*u*u)*b[c+1]+(u**3-u*u)*m1;
 });
}

export function createDiveJourney(time,waves){
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#063e54',.066);
 scene.add(new THREE.HemisphereLight('#9acfdc','#102d39',1.8));
 const light=new THREE.DirectionalLight('#ffddad',2.8);light.position.set(11,8,-14.66);light.castShadow=true;light.shadow.mapSize.set(512,512);Object.assign(light.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:60});light.shadow.bias=-.0004;light.shadow.normalBias=.035;scene.add(light,light.target);
 const fill=new THREE.DirectionalLight('#a6d9e5',1.2);fill.position.set(-4,4,8);scene.add(fill);
 const geometries=[],materials=[];
 const geometry=g=>(geometries.push(g),g),material=m=>(materials.push(m),m);
 const reef=createReef(time,waves);scene.add(reef.group);
 let seed=829;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const dummy=new THREE.Object3D();
 const fishMaterial=material(new THREE.MeshStandardMaterial({color:'#afd8d9',roughness:.55,metalness:.12}));
 const fish=new THREE.InstancedMesh(geometry(new THREE.SphereGeometry(1,8,4)),fishMaterial,42);
 const tails=new THREE.InstancedMesh(geometry(new THREE.ConeGeometry(.12,.22,3)),fishMaterial,42);
 fish.name='reef-fish-proxies';tails.name='reef-fish-tail-proxies';scene.add(fish,tails);
 const fishData=Array.from({length:42},()=>({x:(random()-.5)*16,y:-11.5+random()*4,z:-21-random()*14,phase:random()*6.28,size:.7+random()*.7}));
 let workTop=0,lastTime=0;
 const controller=new SwimController();
 const tucks=new Float32Array(8);
 function measure(){workTop=document.querySelector('#praca').getBoundingClientRect().top+scrollY;}
 measure();
 return {scene,measure,setQuality(eco){const n=eco?512:1024;if(light.shadow.mapSize.x!==n){light.shadow.map?.dispose();light.shadow.map=null;light.shadow.mapSize.set(n,n);}},
  update({octopus,uniforms,time,reduced}){
   const mobile=innerWidth<700;
   const progress=clamp(scrollY/Math.max(1,workTop-innerHeight*1.05));
   const motion=controller.update(progress,Math.max(0,time-lastTime),reduced);lastTime=time;
   const p=motion.progress;
   // Approach, then continuous descent. The same object persists throughout.
   const travel=ease(clamp((p-.16)/.53)),approach=Math.sin(clamp(p/.58)*Math.PI)*.85;
   uniforms.depth.value=3+travel*9;scene.fog.density=.095-travel*.029;
   uniforms.cameraOffset.value.set(travel*.7+Math.sin(p*Math.PI)*.45,0,-travel*9-approach);
   uniforms.pointer.value.set(-Math.sin(p*Math.PI)*.3,-travel*.55);
   const position=sampleSwim(p,mobile),ahead=sampleSwim(Math.min(1,p+.018),mobile),behind=sampleSwim(Math.max(0,p-.018),mobile);
   const swimming=motion.effort*(1-ease(clamp((p-.64)/.17)));
   const phase=motion.clock;
   const pulse=Math.sin(phase)*.045*swimming;
   octopus.group.position.set(position[0]+pulse,position[1]+pulse*.6,position[2]);
   octopus.group.scale.setScalar(mobile?.60:1.02);
   const heading=Math.atan2(ahead[0]-behind[0],Math.max(.12,behind[2]-ahead[2]));
   const entering=ease(clamp((p-.58)/.23));
   octopus.group.rotation.y=(-.28-Math.sin(clamp(p/.68)*Math.PI)*.78+heading*.25)*(1-entering);
   octopus.group.rotation.x=.06+entering*1.17;
   octopus.group.rotation.z=-Math.sin(p*Math.PI)*.12;
   for(let i=0;i<8;i++)tucks[i]=ease(clamp((p-(i===1?.80:.68+(7-i)*.012))/.19));
   // The character is already fully occluded at this endpoint. Skip its dense
   // draw and bone work during the portfolio, restore before any reverse travel.
   octopus.group.visible=p<1;
   if(p<1)octopus.setMotion(reduced?0:swimming,phase,tucks,{progress:p,reduced});
   light.intensity=2.8*(1-.8*ease(clamp((p-.80)/.2)));light.target.position.copy(octopus.group.position);light.position.copy(octopus.group.position).add(new THREE.Vector3(11,8,-14.66));
   document.documentElement.style.setProperty('--reading',String(ease(clamp((scrollY-workTop+innerHeight*.3)/(innerHeight*.6)))));
   document.querySelector('canvas').dataset.journey=JSON.stringify({progress:p,position,phase:p<.64?motion.state:p<.82?'approach':p<.995?'enter':'hidden',effort:motion.effort,speed:motion.speed,clock:motion.clock});
   // The reef exists at the same world coordinates even before we reach it.
   // Do not reveal it with a visibility switch during the descent.
   for(let i=0;i<fishData.length;i++){
    const f=fishData[i],t=time*.3+f.phase;
    dummy.position.set(f.x+Math.sin(t)*1.6,f.y+Math.sin(t*.7)*.18,f.z+Math.cos(t)*.6);
    dummy.rotation.set(0,-Math.cos(t)*.2,Math.sin(t*4)*.035);dummy.scale.set(.26*f.size,.10*f.size,.075*f.size);dummy.updateMatrix();fish.setMatrixAt(i,dummy.matrix);
    dummy.position.x-=.29*f.size;dummy.rotation.z=-Math.PI/2;dummy.rotation.y=Math.sin(time*3+f.phase)*.35;dummy.scale.setScalar(f.size);dummy.updateMatrix();tails.setMatrixAt(i,dummy.matrix);
   }
   fish.instanceMatrix.needsUpdate=true;tails.instanceMatrix.needsUpdate=true;
  },
  dispose(){reef.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());fish.dispose();tails.dispose();}
 };
}
