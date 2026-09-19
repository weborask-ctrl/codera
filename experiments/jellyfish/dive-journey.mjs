import * as THREE from '/vendor/three/three.module.min.js';

const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>v*v*(3-2*v);
// These anchors are the replacement contract for future Blender assets.
export const DIVE_ANCHORS={reef:[0,-15,-22],readingOctopus:[3.7,-11.1,-17.8]};

export function createDiveJourney(){
 const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#07506b',.035);
 scene.add(new THREE.HemisphereLight('#a4ebf1','#132a38',2.5));
 const light=new THREE.DirectionalLight('#ffddad',2.8);light.position.set(-4,12,5);scene.add(light);
 const geometries=[],materials=[];
 const geometry=g=>(geometries.push(g),g),material=m=>(materials.push(m),m);
 const rockMaterial=material(new THREE.MeshStandardMaterial({color:'#254958',roughness:1}));
 const coralMaterial=material(new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.85}));
 const rocks=new THREE.InstancedMesh(geometry(new THREE.IcosahedronGeometry(1,1)),rockMaterial,44);
 const coral=new THREE.InstancedMesh(geometry(new THREE.CylinderGeometry(.055,.11,1,5)),coralMaterial,240);
 rocks.name='reef-rock-proxies';coral.name='reef-coral-proxies';scene.add(rocks,coral);
 let seed=829;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const dummy=new THREE.Object3D(),colour=new THREE.Color(),up=new THREE.Vector3(0,1,0);
 for(let i=0;i<44;i++){
  const side=i%2?1:-1;
  dummy.position.set(side*(5+random()*7),-16+random()*2,-15-random()*26);
  dummy.rotation.set(random(),random()*3,random());dummy.scale.set(1+random()*3,.6+random()*2,1+random()*3);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
 }
 for(let i=0;i<80;i++){
  const side=i%2?1:-1,root=new THREE.Vector3(side*(4.6+random()*7),-14.7+random(),-16-random()*22);
  const height=.5+random()*1.7;
  for(let branch=0;branch<3;branch++){
   const start=root.clone().add(new THREE.Vector3(0,branch?height*.45:0,0));
   const end=start.clone().add(new THREE.Vector3(branch?(branch===1?-.5:.5):.08,height*(branch?.6:1),random()*.28));
   dummy.position.copy(start).lerp(end,.5);dummy.quaternion.setFromUnitVectors(up,end.clone().sub(start).normalize());dummy.scale.set(1,end.distanceTo(start),1);dummy.updateMatrix();coral.setMatrixAt(i*3+branch,dummy.matrix);
   colour.set(['#d48063','#d9ae79','#9176b0','#68a6a0'][i%4]);coral.setColorAt(i*3+branch,colour);
  }
 }
 const fishMaterial=material(new THREE.MeshStandardMaterial({color:'#afd8d9',roughness:.55,metalness:.12}));
 const fish=new THREE.InstancedMesh(geometry(new THREE.SphereGeometry(1,8,4)),fishMaterial,42);
 const tails=new THREE.InstancedMesh(geometry(new THREE.ConeGeometry(.12,.22,3)),fishMaterial,42);
 fish.name='reef-fish-proxies';tails.name='reef-fish-tail-proxies';scene.add(fish,tails);
 const fishData=Array.from({length:42},()=>({x:(random()-.5)*16,y:-11.5+random()*4,z:-21-random()*14,phase:random()*6.28,size:.7+random()*.7}));
 let workTop=0;
 function measure(){workTop=document.querySelector('#praca').getBoundingClientRect().top+scrollY;}
 measure();
 return {scene,measure,
  update({octopus,uniforms,time,reduced}){
   const mobile=innerWidth<700;
   const progress=clamp(scrollY/Math.max(1,workTop-innerHeight*.25));
   const p=reduced?(progress>.8?1:0):progress;
   // Approach, then continuous descent. The same object persists throughout.
   const travel=ease(clamp((p-.22)/.78)),approach=Math.sin(clamp(p/.58)*Math.PI)*1.65;
   uniforms.depth.value=3+travel*9;
   uniforms.cameraOffset.value.set(Math.sin(p*Math.PI)*.45,0,-travel*9-approach);
   uniforms.pointer.value.set(Math.sin(p*Math.PI)*.45,0);
   octopus.group.position.set(THREE.MathUtils.lerp(mobile?1.2:3.1,DIVE_ANCHORS.readingOctopus[0],travel),THREE.MathUtils.lerp(mobile?-5:-2.4,-11.1,travel),THREE.MathUtils.lerp(-7,-17.8,travel));
   octopus.group.scale.setScalar(mobile?.67:1.02);
   octopus.group.rotation.y+=Math.sin(p*Math.PI)*.8;
   octopus.group.rotation.z-=Math.sin(p*Math.PI)*.24;
   document.documentElement.style.setProperty('--reading',String(ease(clamp((progress-.74)/.26))));
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
  dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());rocks.dispose();coral.dispose();fish.dispose();tails.dispose();}
 };
}
