import * as THREE from '/vendor/three/three.module.min.js';

const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>v*v*(3-2*v);
// These anchors are the replacement contract for future Blender assets.
export const DIVE_ANCHORS={reef:[0,-15,-22],den:[2,-12.7,-19],hiddenOctopus:[5,-12.7,-27]};

// Smooth, reversible position tracks. Derivatives are sampled for heading.
export function sampleSwim(p,mobile=false){
 const keys=[
  [0,mobile?1.2:3.1,mobile?-5:-2.4,-7],
  [.16,2.4,-2.9,-7.5], [.34,.35,-5.0,-10.5],
  [.53,1.35,-9.0,-15], [.69,2,-12.2,-17.2],
  [.79,2,-12.7,-18.5], [.88,2.15,-12.7,-21], [1,...DIVE_ANCHORS.hiddenOctopus],
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
 // A real opening, throat and opaque back wall. The creature is hidden by
 // depth-tested geometry, never by opacity or a visibility toggle.
 const den=new THREE.Group();den.name='octopus-den';den.position.set(...DIVE_ANCHORS.den);scene.add(den);
 const rimGeometry=geometry(new THREE.TorusGeometry(2.15,.65,6,23));
 const rimPositions=rimGeometry.attributes.position;
 for(let i=0;i<rimPositions.count;i++){
  const x=rimPositions.getX(i),y=rimPositions.getY(i),z=rimPositions.getZ(i),a=Math.atan2(y,x);
  const rough=1+.09*Math.sin(a*5)+.055*Math.cos(a*9);
  rimPositions.setXYZ(i,x*rough,y*rough,z+.13*Math.sin(a*7));
 }
 rimGeometry.computeVertexNormals();
 const rim=new THREE.Mesh(rimGeometry,rockMaterial);
 rim.scale.set(1.22,.95,1);den.add(rim);
 const dark=material(new THREE.MeshStandardMaterial({color:'#031d29',roughness:1,side:THREE.DoubleSide}));
 const throat=new THREE.Mesh(geometry(new THREE.CylinderGeometry(1.55,1.15,6,20,1,true)),dark);
 throat.rotation.x=Math.PI/2;throat.position.z=-3;den.add(throat);
 const back=new THREE.Mesh(geometry(new THREE.CircleGeometry(4,24)),dark);back.position.z=-6;den.add(back);
 // Solid rock outside the throat hides the animal as it turns inside the den.
 const sideWall=new THREE.Mesh(rocks.geometry,rockMaterial);
 sideWall.scale.set(2.8,2.7,3.1);sideWall.rotation.z=.23;
 sideWall.position.set(3.7,0,-3.5);den.add(sideWall);
 for(const [x,y,sx,sy,sz] of [[-2.8,-1,1.8,2.3,1.4],[2.9,-1,2.1,2.5,1.8],[0,-2.3,2.7,.9,1.6],[.6,2.0,2.5,.9,1.5]]){
  const rock=new THREE.Mesh(rocks.geometry,rockMaterial);rock.position.set(x,y,-.4);rock.scale.set(sx,sy,sz);rock.rotation.z=x*.17;den.add(rock);
 }
 let seed=829;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const dummy=new THREE.Object3D(),colour=new THREE.Color(),up=new THREE.Vector3(0,1,0);
 for(let i=0;i<44;i++){
  const side=i%2?1:-1;
  dummy.position.set(side*(5+random()*7),-16+random()*2,-15-random()*26);
  dummy.rotation.set(random(),random()*3,random());dummy.scale.set(1+random()*3,.6+random()*2,1+random()*3);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
 }
 // Coral branches dress the entrance without blocking its centre.
 const denCoral=material(new THREE.MeshStandardMaterial({color:'#d19b81',roughness:.9}));
 for(let i=0;i<12;i++){
  const a=i/12*Math.PI*2,r=2.8;
  const branch=new THREE.Mesh(coral.geometry,denCoral);
  branch.position.set(Math.cos(a)*r,Math.sin(a)*r*.8,.2);
  branch.rotation.z=a-Math.PI/2;branch.scale.set(1.4,.6+random()*.7,1.4);den.add(branch);
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
 const tucks=new Float32Array(8);
 function measure(){workTop=document.querySelector('#praca').getBoundingClientRect().top+scrollY;}
 measure();
 return {scene,measure,
  update({octopus,uniforms,time,reduced}){
   const mobile=innerWidth<700;
   const progress=clamp(scrollY/Math.max(1,workTop-innerHeight*1.05));
   const p=reduced?(progress>.8?1:0):progress;
   // Approach, then continuous descent. The same object persists throughout.
   const travel=ease(clamp((p-.16)/.53)),approach=Math.sin(clamp(p/.58)*Math.PI)*1.65;
   uniforms.depth.value=3+travel*9;
   uniforms.cameraOffset.value.set(travel*.7,0,-travel*9-approach);
   uniforms.pointer.value.set(0,0);
   const position=sampleSwim(p,mobile),ahead=sampleSwim(Math.min(1,p+.018),mobile),behind=sampleSwim(Math.max(0,p-.018),mobile);
   const swimming=(1-ease(clamp((p-.64)/.17)))*(.35+.65*Math.sin(clamp(p/.7)*Math.PI));
   const phase=p*25+time*.95*(1-ease(clamp((p-.64)/.16)));
   const pulse=Math.sin(phase)*.065*swimming;
   octopus.group.position.set(position[0]+pulse,position[1]+pulse*.6,position[2]);
   octopus.group.scale.setScalar(mobile?.67:1.02);
   const heading=Math.atan2(ahead[0]-behind[0],Math.max(.12,behind[2]-ahead[2]));
   octopus.group.rotation.y+=heading*.65*(1-ease(clamp((p-.70)/.16)))+ease(clamp((p-.87)/.13))*1.25;
   octopus.group.rotation.x=ease(clamp((p-.58)/.23))*.48;
   octopus.group.rotation.z-=Math.sin(p*Math.PI)*.22;
   for(let i=0;i<8;i++)tucks[i]=ease(clamp((p-(i===1?.80:.68+(7-i)*.012))/.19));
   octopus.setMotion(reduced?0:swimming,phase,tucks);
   document.documentElement.style.setProperty('--reading',String(ease(clamp((scrollY-workTop+innerHeight*.3)/(innerHeight*.6)))));
   document.querySelector('canvas').dataset.journey=JSON.stringify({progress:p,position,phase:p<.64?'swim':p<.82?'approach':p<.995?'enter':'hidden'});
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
