import * as THREE from '/vendor/three/three.module.min.js';
import {shelfHeight} from './deep-path.mjs';
import {rng,organicMaterial,shellGeometry,plantGeometry,coralGeometry,fishGeometry,seahorseGeometry,crabGeometry} from './marine-assets.mjs';
import {marineFilmMaterial} from './marine-film.mjs';

export function createMarineWorld(waves,vents,library=null,surfaces=[]){
 const group=new THREE.Group();group.name='living-reef';
 const clock={value:0},random=rng(908),dummy=new THREE.Object3D(),geometries=[],materials=[],instances=[];
 const geo=g=>(geometries.push(g),g),mat=k=>{const m=organicMaterial(clock,waves,k);materials.push(m);return m;};
 const coralMat=mat('coral'),shellMat=mat('shell'),plantMat=mat('plant'),fishMat=mat('fish');
 const batch=(g,m,records,name)=>{
  g.setAttribute('marinePhase',new THREE.InstancedBufferAttribute(Float32Array.from(records,(_,i)=>i*2.399963),1));
  const mesh=new THREE.InstancedMesh(g,m,records.length);mesh.name=name;
  records.forEach((r,i)=>{dummy.position.set(...r.p);dummy.rotation.set(...(r.r||[0,0,0]));if(Array.isArray(r.s))dummy.scale.set(...r.s);else dummy.scale.setScalar(r.s||1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
  mesh.castShadow=false;mesh.frustumCulled=false;group.add(mesh);instances.push(mesh);return mesh;
 };
 const assetBatch=(asset,kind,records,name,fallback,fallbackMaterial)=>{
  const parts=library?.get(asset);
  if(!parts)return [batch(geo(fallback()),fallbackMaterial,records,name)];
  // Bound stationary gardens independently so distant high-detail plants/shells
  // leave the GPU workload as the camera descends to the next environment.
  const zones=new Map();for(const r of records){const key=kind==='fish'?0:Math.floor(r.p[2]/35);if(!zones.has(key))zones.set(key,[]);zones.get(key).push(r);}
  let index=0;const meshes=[];
  for(const zone of zones.values())for(const p of parts){
   const material=marineFilmMaterial(p.material,kind,clock,waves);materials.push(material);
   const mesh=batch(geo(p.geometry.clone()),material,zone,index?`${name}-${index}-${p.name}`:name);index++;
   if(kind!=='fish'){mesh.computeBoundingSphere();mesh.boundingSphere.radius+=.65;mesh.frustumCulled=true;}
   meshes.push(mesh);
  }return meshes;
 };
 const mountColony=r=>{
  if(!surfaces.length)return r;
  surfaces.forEach(o=>o.updateMatrixWorld(true));
  const ray=new THREE.Raycaster(new THREE.Vector3(r.p[0],r.p[1],r.p[2]+12),new THREE.Vector3(0,0,-1),0,25);
  const hit=ray.intersectObjects(surfaces,true)[0];if(!hit)return r;
  const transform=hit.object.matrixWorld.clone();
  if(hit.object.isInstancedMesh){const instance=new THREE.Matrix4();hit.object.getMatrixAt(hit.instanceId,instance);transform.multiply(instance);}
  const normal=hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(transform));
  const lean=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
  const rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(...(r.r||[0,0,0])));
  rotation.premultiply(new THREE.Quaternion().slerp(lean,.58));
  return {...r,p:hit.point.addScaledVector(normal,-.035).toArray(),r:new THREE.Euler().setFromQuaternion(rotation).toArray().slice(0,3)};
 };
 const mountGround=r=>{
  if(!surfaces.length)return r;
  surfaces.forEach(o=>o.updateMatrixWorld(true));
  const ray=new THREE.Raycaster(new THREE.Vector3(r.p[0],r.p[1]+9,r.p[2]),new THREE.Vector3(0,-1,0),0,16);
  const hit=ray.intersectObjects(surfaces,true)[0];
  return hit?{...r,p:[r.p[0],hit.point.y+.008,r.p[2]]}:r;
 };
 // Anchors are on the front shelf or buried into its ledges; leave the den clear.
 const colonies=[
  {p:[-5.8,-13.7,-20.5],s:2.2,r:[-.15,0,-.12]},
  {p:[7.8,-12.7,-20.4],s:2.35,r:[0,.3,.16]},
  {p:[-1.8,-9.1,-24.3],s:1.8,r:[-.25,.6,0]},
  {p:[11.8,-15,-23],s:2.0},
  {p:[-11,-15,-23.8],s:2.6},
  {p:[3.8,-8.9,-25],s:1.4},
  {p:[9.4,-17.3,-42.7],s:1.0},
  {p:[26.9,-16.9,-44.2],s:1.25},
 ];
 for(let type=0;type<3;type++){
  const records=colonies.filter((_,i)=>i%3===type);
  for(let i=0;i<7;i++)records.push({p:[(i%2?1:-1)*(7+random()*8),-15.5+random()*3,-23-random()*3],s:.6+random()*.55,r:[-.25,random()*6,.1]});
  for(let i=0;i<3;i++)records.push({p:[18+(i%2?1:-1)*(7.6+random()*1.6),-17+random()*2,-43],s:.55+random()*.7,r:[0,random()*3,.1]});
  const meshes=assetBatch(`Coral${type}`,type===1?'fan':'coral',records.map(mountColony),`coral-colonies-${type}`,()=>coralGeometry(type),type===2?shellMat:coralMat);
  for(const mesh of meshes){mesh.computeBoundingSphere();mesh.boundingSphere.radius+=.6;mesh.frustumCulled=true;}
 }
 const plants=[];
 // Gate side gardens, right-hand rocky stop, then islands around the final clearing.
 const gardens=[[8.2,-44,15],[28.4,-45,15],[20,-125,12],[11,-149,12],[23,-151,12],[19,-163,10]];
 for(const [x,z,count] of gardens)for(let i=0;i<count;i++){
  const px=x+(random()-.5)*4,pz=z+(random()-.5)*4;
  plants.push({p:[px,shelfHeight(px,pz)-.1,pz],s:.55+random()*.8,r:[0,random()*6.28,0]});
 }
 for(const [x,z] of [[11.7,-149],[23,-151],[19.8,-161]])plants.push({p:[x-.2,shelfHeight(x,z),z],s:.65,r:[0,0,0]});
 assetBatch('Plant0','plant',plants.map(mountGround),'current-driven-seagrass',plantGeometry,plantMat);
 for(let variant=0;variant<3;variant++){
  const records=[];
  for(let i=0;i<38;i++){
   const section=i%3,px=(section===0?18:section===1?23:18)+(random()-.5)*(section===0?22:16),pz=(section===0?-45:section===1?-127:-151)+(random()-.5)*15;
   records.push(mountGround({p:[px,shelfHeight(px,pz)+.02,pz],s:.16+random()*.48,r:[(random()-.5)*.25,random()*6.28,0]}));
  }
  // Attached clusters on the camera-facing arch surface. Parametric points use
  // the same arch formula as rock-gate, with shells facing toward the viewer.
  for(let i=0;i<24;i++){
   const a=.19+random()*2.76,around=Math.PI*.5;
   const erosion=.22*Math.sin(a*17+around*3)+.13*Math.sin(a*39-around*7)+.08*Math.sin(a*71+around*13);
   const x=18+Math.cos(a)*8+.55*Math.sin(a*2),y=-20+Math.sin(a)*(12+.65*Math.sin(a*3)),z=-47+3.2+erosion+Math.sin(a*4)*.65;
   records.push({p:[x,y,z+.01],s:.18+random()*.25,r:[Math.PI*.48,0,random()*6.28]});
  }
  assetBatch(`Shell${variant}`,'shell',records,`ribbed-shells-${variant}`,()=>shellGeometry(variant),shellMat);
 }
 const fishSchools=[];
 for(let type=0;type<4;type++){
  // Separate open-water lanes flank the route. The final landing corridor stays
  // clear for every phase, rather than pushing a central swarm aside at runtime.
  const lanes=[[-7,-8.5,-15],[10,-7,-18],[9,-12,-40],[28,-12.5,-43],[4,-47.5,-150],[30,-48,-155],[15,-45.5,-166]];
  const data=Array.from({length:type===0?14:7},(_,i)=>{
   const lane=(i+type*2)%lanes.length,base=lanes[lane],center=[base[0]+(random()-.5)*2.6,base[1]+(random()-.5)*1.8,base[2]+(random()-.5)*4.2];
   return {center,radius:1.5+random()*1.6,depthRadius:.6+random()*1.2,phase:random()*6.28,level:(random()-.5)*2.5,scale:(type===0?.36:.46)+random()*.25,speed:.055+random()*.065};
  });
  const meshes=assetBatch(`Fish${type}`,'fish',data.map(()=>({p:[0,0,0]})),`reef-fish-species-${type}`,()=>fishGeometry(type),fishMat);fishSchools.push({meshes,data});
 }
 const seahorses=batch(geo(seahorseGeometry()),mat('shell'),[{p:[11.7,shelfHeight(11.7,-149)+.7,-149],s:1.0},{p:[23,shelfHeight(23,-151)+.75,-151],s:1.1},{p:[19.8,shelfHeight(19.8,-161)+.6,-161],s:.9}], 'seahorses');
 const horseRoots=[[11.7,-149],[23,-151],[19.8,-161]];
 const crabRoots=[[22,-126],[29,-130],[15,-153]];
 const crabs=batch(geo(crabGeometry()),mat('crab'),crabRoots.map(([x,z])=>({p:[x,shelfHeight(x,z),z],s:1})), 'sand-crabs');
 // Short finite-lived streams, tied to existing rock boundaries.
 const sources=vents?.length?vents:[[14.7,-42.5,-98],[26.4,-41,-103],[41,-43,-115]];
 const bubbleMat=new THREE.MeshStandardMaterial({color:'#d9ece6',roughness:.17,metalness:.1,transparent:true,opacity:.27,depthWrite:false});materials.push(bubbleMat);
 const bubbleData=Array.from({length:60},(_,i)=>({source:sources[i%sources.length],phase:random(),size:.025+random()*.065}));
 const bubbles=batch(geo(new THREE.SphereGeometry(1,9,7)),bubbleMat,bubbleData.map(()=>({p:[0,0,0]})),'rock-seep-bubbles');
 const sedimentGeometry=geo(new THREE.BufferGeometry()),dust=new Float32Array(90*3);sedimentGeometry.setAttribute('position',new THREE.BufferAttribute(dust,3));
 const sedimentMat=new THREE.PointsMaterial({color:'#d9c7a3',size:.025,transparent:true,opacity:0,depthWrite:false});materials.push(sedimentMat);
 const sediment=new THREE.Points(sedimentGeometry,sedimentMat);sediment.frustumCulled=false;group.add(sediment);
 const dustSeeds=Array.from({length:90},()=>[random()*6.28,random(),random()]);
 let lastSettle=0,dustBirth=-100;
 return {group,
  update(time,reduced,octopus,settle,mobile=false){
   clock.value=reduced?0:time;
   const t=clock.value;
   for(const {meshes,data} of fishSchools){
    data.forEach((f,i)=>{
     const a=f.phase+t*f.speed,x=f.center[0]+Math.cos(a)*f.radius,z=f.center[2]+Math.sin(a)*f.depthRadius;
     const finalMobile=mobile&&f.center[2]<-140;
     dummy.position.set(x,Math.max(shelfHeight(x,z)+1.3,f.center[1]+f.level+Math.sin(a*2)*.18),z);
     const away=new THREE.Vector3().subVectors(dummy.position,octopus.position),distance=away.length();
     if(distance<2.5&&distance>.001)dummy.position.addScaledVector(away,(2.5-distance)*.36/distance);
     dummy.rotation.set(0,Math.atan2(-Math.cos(a)*f.depthRadius,-Math.sin(a)*f.radius),Math.cos(a)*.035);dummy.scale.setScalar(f.scale*(finalMobile?.85:1));dummy.updateMatrix();for(const mesh of meshes)mesh.setMatrixAt(i,dummy.matrix);
    });for(const mesh of meshes)mesh.instanceMatrix.needsUpdate=true;
   }
   horseRoots.forEach(([x,z],i)=>{
    dummy.position.set(x+Math.sin(t*.19+i)*.06,shelfHeight(x,z)+.70+Math.sin(t*.29+i)*.025,z);dummy.rotation.set(0,i*1.8,Math.sin(t*.33+i)*.035);dummy.scale.setScalar(i===1?1.1:1);dummy.updateMatrix();seahorses.setMatrixAt(i,dummy.matrix);
   });seahorses.instanceMatrix.needsUpdate=true;
   crabRoots.forEach(([x,z],i)=>{
    const cycle=t*.17+z*.3,step=Math.max(0,Math.sin(cycle)),px=x+step*.65;
    dummy.position.set(px,shelfHeight(px,z)+.025+Math.abs(Math.sin(t*6))*step*.01,z);dummy.rotation.set(0,i*1.7,0);dummy.scale.setScalar(i===2?.75:1.1);dummy.updateMatrix();crabs.setMatrixAt(i,dummy.matrix);
   });crabs.instanceMatrix.needsUpdate=true;
   bubbleData.forEach((b,i)=>{
    const age=(b.phase+t*.08)%1;dummy.position.set(b.source[0]+Math.sin(age*8+i)*.10+age*.6,b.source[1]+age*14,b.source[2]+Math.sin(age*10+i)*.14);
    dummy.rotation.set(0,0,0);dummy.scale.setScalar(b.size*Math.sin(age*Math.PI));dummy.scale.y*=1.13;dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);
   });bubbles.instanceMatrix.needsUpdate=true;
   if(settle>.35&&lastSettle<=.35&&!reduced)dustBirth=t;
   lastSettle=settle;
   const age=t-dustBirth,active=age>=0&&age<4&&!reduced;
   sediment.visible=active;
   if(active){
    sedimentMat.opacity=.34*Math.sin(age/4*Math.PI);
    dustSeeds.forEach(([a,r,h],i)=>{const x=octopus.position.x+Math.cos(a)*(r*1.7+age*.22),z=octopus.position.z+Math.sin(a)*(r*1.7+age*.22);dust[i*3]=x;dust[i*3+1]=shelfHeight(x,z)+.04+h*.3+Math.sin(age/4*Math.PI)*.35;dust[i*3+2]=z;});sedimentGeometry.attributes.position.needsUpdate=true;
   }
  },
  dispose(){instances.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());library?.dispose();}
 };
}
