import * as THREE from '/vendor/three/three.module.min.js';
import {createReef} from './reef.mjs';
import {createRockGate} from './rock-gate.mjs';
import {finalePose} from './finale-path.mjs';
import {deepPose} from './deep-path.mjs';
import {gatePose} from './gate-path.mjs';
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
 const inspect=new URLSearchParams(location.search).has('inspect');
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#063e54',.066);
 scene.add(new THREE.HemisphereLight('#9acfdc','#102d39',1.8));
 const light=new THREE.DirectionalLight('#ffddad',2.8);light.position.set(11,8,-14.66);light.castShadow=true;light.shadow.mapSize.set(512,512);Object.assign(light.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:60});light.shadow.bias=-.0004;light.shadow.normalBias=.035;scene.add(light,light.target);
 const fill=new THREE.DirectionalLight('#a6d9e5',1.2);fill.position.set(-4,4,8);scene.add(fill);
 const gateBounce=new THREE.PointLight('#73bfd3',0,35,1.5);gateBounce.position.set(18,-9,-39);scene.add(gateBounce);
 const geometries=[],materials=[];
 const geometry=g=>(geometries.push(g),g),material=m=>(materials.push(m),m);
 const reef=createReef(time,waves);scene.add(reef.group);
 const gate=createRockGate(time,waves);scene.add(gate.group);
 let seed=829;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const dummy=new THREE.Object3D();
 const fishMaterial=material(new THREE.MeshStandardMaterial({color:'#afd8d9',roughness:.55,metalness:.12}));
 const fish=new THREE.InstancedMesh(geometry(new THREE.SphereGeometry(1,8,4)),fishMaterial,42);
 const tails=new THREE.InstancedMesh(geometry(new THREE.ConeGeometry(.12,.22,3)),fishMaterial,42);
 fish.name='reef-fish-proxies';tails.name='reef-fish-tail-proxies';scene.add(fish,tails);
 const fishData=Array.from({length:42},()=>({x:(random()-.5)*16,y:-11.5+random()*4,z:-21-random()*14,phase:random()*6.28,size:.7+random()*.7}));
 let workTop=0,gateTop=0,servicesTop=0,deepTop=0,offerTop=0,processTop=0,processEnd=0,landingTop=0,contactTop=0,lastTime=0;
 const processController=new SwimController(),landingController=new SwimController();
 const deepController=new SwimController();
 const gateController=new SwimController();
 const controller=new SwimController();
 const tucks=new Float32Array(8);
 function measure(){workTop=document.querySelector('#praca').getBoundingClientRect().top+scrollY;gateTop=document.querySelector('#brana').getBoundingClientRect().top+scrollY;servicesTop=document.querySelector('#sluzby').getBoundingClientRect().top+scrollY;deepTop=document.querySelector('#hrana').getBoundingClientRect().top+scrollY;offerTop=document.querySelector('#ponuka').getBoundingClientRect().top+scrollY;processTop=document.querySelector('#spolupraca').offsetTop;processEnd=document.querySelector('#postup').offsetTop;landingTop=document.querySelector('#dno').offsetTop;contactTop=document.querySelector('#kontakt').offsetTop;}
 measure();
 const layoutObserver=new ResizeObserver(measure);layoutObserver.observe(document.querySelector('#praca'));layoutObserver.observe(document.querySelector('#sluzby'));layoutObserver.observe(document.querySelector('#ponuka'));layoutObserver.observe(document.querySelector('#postup'));
 return {scene,measure,setQuality(eco){const n=eco?512:1024;if(light.shadow.mapSize.x!==n){light.shadow.map?.dispose();light.shadow.map=null;light.shadow.mapSize.set(n,n);}},
  update({octopus,uniforms,time,reduced}){
   const mobile=innerWidth<700;
   const progress=clamp(scrollY/Math.max(1,workTop-innerHeight*1.05));
   const dt=Math.max(0,time-lastTime);
   const motion=controller.update(progress,dt,reduced);
   const gateStart=gateTop-innerHeight*.7,gateEnd=servicesTop-innerHeight*.65;
   const next=gateController.update(clamp((scrollY-gateStart)/Math.max(1,gateEnd-gateStart)),dt,reduced);
   const descent=deepController.update(clamp((scrollY-deepTop+innerHeight*.7)/Math.max(1,offerTop-deepTop+innerHeight*.05)),dt,reduced);
   const processMotion=processController.update(clamp((scrollY-processTop+innerHeight*.7)/Math.max(1,processEnd-processTop+innerHeight*.05)),dt,reduced);
   const landingMotion=landingController.update(clamp((scrollY-landingTop+innerHeight*.7)/Math.max(1,contactTop-landingTop+innerHeight*.05)),dt,reduced);lastTime=time;
   const p=motion.progress;scene.fog.color.set('#063e54');
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
   const q=next.progress;gateBounce.intensity=30*ease(clamp((q-.32)/.3));
   if(q>0){
    const pose=gatePose(q,mobile);
    uniforms.cameraOffset.value.set(pose.camera[0],0,pose.camera[2]);uniforms.depth.value=-pose.camera[1];
    const aim=mobile?(pose.character[0]-pose.camera[0])/Math.max(2,pose.camera[2]-pose.character[2]):-.65*Math.sin(clamp((q-.15)/.48)*Math.PI);
    uniforms.pointer.value.set(aim/.12,-.3);scene.fog.density=.045;
    octopus.group.visible=true;octopus.group.position.fromArray(pose.character);octopus.group.scale.setScalar(mobile?.62:1.02);
    octopus.group.rotation.set(pose.pitch,pose.yaw,-Math.sin(q*Math.PI)*.10);
    octopus.setMotion(next.effort,next.clock,tucks,{progress:.66+pose.fold*.34,reduced,contact:false});
   }
   const d=descent.progress;
   if(d>0){
    const pose=deepPose(d,mobile);
    uniforms.depth.value=-pose.camera[1];uniforms.cameraOffset.value.set(pose.camera[0],0,pose.camera[2]);uniforms.pointer.value.set(0,(pose.lookY-.08)/.08);
    scene.fog.density=.045-d*.014;scene.fog.color.lerp(new THREE.Color('#03243d'),d);gateBounce.intensity*=1-d;
    octopus.group.position.fromArray(pose.character);octopus.group.rotation.set(pose.pitch,pose.yaw,-Math.sin(d*Math.PI)*.08);
    octopus.setMotion(descent.effort,descent.clock,tucks,{progress:0,reduced,contact:false});
   }
   const f=processMotion.progress,l=landingMotion.progress;
   if(f>0){
    const finalMotion=l>0?landingMotion:processMotion,pose=finalePose(l>0?l:f,mobile,l>0);
    uniforms.depth.value=-pose.camera[1];uniforms.cameraOffset.value.set(pose.camera[0],0,pose.camera[2]);uniforms.pointer.value.set(0,(pose.lookY-.08)/.08);
    scene.fog.density=.031-f*.007-l*.006;
    octopus.group.position.fromArray(pose.character);octopus.group.rotation.set(pose.pitch,pose.yaw,0);
    octopus.setMotion(finalMotion.effort*(1-pose.settle),finalMotion.clock,tucks,{progress:0,reduced,contact:false,settle:pose.settle});
   }
   if(inspect&&p<.01){uniforms.cameraOffset.value.set(3.1,0,-4);uniforms.pointer.value.set(0,0);}
   light.intensity=2.8*(1-.8*ease(clamp((p-.80)/.2)))*(1-ease(clamp(q/.4)))+2.5*ease(clamp(q/.4));light.intensity*=1-d*.3;light.target.position.copy(octopus.group.position);light.position.copy(octopus.group.position).add(new THREE.Vector3(11-16*f,8+4*f,-14.66+22.66*f));
   document.documentElement.style.setProperty('--reading',String(ease(clamp((scrollY-workTop+innerHeight*.3)/(innerHeight*.6)))*(1-ease(clamp(q/.19)))));
   document.querySelector('canvas').dataset.journey=JSON.stringify({progress:p,gateProgress:q,deepProgress:d,processProgress:f,landingProgress:l,position:octopus.group.position.toArray(),phase:l>0?(l<1?'landing-'+landingMotion.state:'seabed'):f>0?(f<1?'process-'+processMotion.state:'process'):d>0?(d<1?'descent-'+descent.state:'offer'):q>0?(q<1?'gate-'+next.state:'services'):p<.64?motion.state:p<.82?'approach':p<.995?'enter':'hidden',effort:l>0?landingMotion.effort:f>0?processMotion.effort:d>0?descent.effort:q>0?next.effort:motion.effort,speed:l>0?landingMotion.speed:f>0?processMotion.speed:d>0?descent.speed:q>0?next.speed:motion.speed,clock:l>0?landingMotion.clock:f>0?processMotion.clock:d>0?descent.clock:q>0?next.clock:motion.clock});
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
  dispose(){layoutObserver.disconnect();gate.dispose();reef.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());fish.dispose();tails.dispose();}
 };
}
