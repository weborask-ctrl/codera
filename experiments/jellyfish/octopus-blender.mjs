import * as THREE from '/vendor/three/three.module.min.js';
import {GLTFLoader} from '/vendor/three/GLTFLoader.js';
import {shelfHeight} from './deep-path.mjs';
import {underwaterMaterial,setOceanBackdrop} from './underwater-material.mjs';

// The authoring scene stays in Blender. Only its character and deforming clips
// enter the ocean: studio cameras/lights and the demonstration root path do not.
export async function createOctopus(time,waves){
 const gltf=await new GLTFLoader().loadAsync('/octopus-swim.glb');
 const rig=gltf.scene.getObjectByName('OCTOPUS_RIG');
 if(!rig)throw new Error('Blender asset has no OCTOPUS_RIG');
 const group=new THREE.Group();group.name='Blender octopus — scroll root';
 const model=new THREE.Group();model.name='Blender octopus — metre conversion';
 model.scale.setScalar(3.8);model.add(rig);group.add(model);
 const mixer=new THREE.AnimationMixer(rig);
 for(const source of gltf.animations){
  const tracks=source.tracks.filter(track=>!/^ROOT\.(position|quaternion|scale)$/.test(track.name));
  mixer.clipAction(new THREE.AnimationClip(source.name,source.duration,tracks)).play();
 }
 const diagnostic=new URLSearchParams(location.search).get('surface');
 const materials=new Set(),geometries=new Set(),skeletons=new Set();
 rig.traverse(object=>{
  if(!object.isMesh)return;
  geometries.add(object.geometry);
  if(object.skeleton)skeletons.add(object.skeleton);
  // Avoid per-frame CPU bounds recomputation over the dense sculpt. The journey
  // controls visibility as one character; the GPU still clips its triangles.
  object.frustumCulled=false;
  // Avoid low-resolution self-shadow acne on the dense deforming skin.
  object.castShadow=true;object.receiveShadow=false;
  const old=object.material;
  const name=object.name.toLowerCase();
  const skin=name.includes('continuous')||name.startsWith('eye')||name.includes('siphon');
  const pupil=name.includes('pupil'),iris=name.includes('iris');
  const mat=new THREE.MeshStandardMaterial({color:skin?'#c47849':pupil?'#03171c':iris?'#a69b6c':'#c4a187',roughness:skin?.56:pupil?.20:.54,metalness:0});
  if(!pupil&&!diagnostic)underwaterMaterial(mat,time,waves,{skin});
  if(diagnostic==='unlit'){mat.dispose();}
  const selected=diagnostic==='unlit'?new THREE.MeshBasicMaterial({color:'#e6af83'}):mat;
  materials.add(selected);object.material=selected;
  for(const m of Array.isArray(old)?old:[old])m?.dispose();
 });
 const root=rig.getObjectByName('ROOT');
 const rootPosition=root.position.clone(),rootRotation=root.quaternion.clone();
 const bones=[];rig.traverse(o=>{if(o.isBone&&o!==root)bones.push(o);});
 mixer.setTime(2.7);
 const folded=bones.map(b=>b.quaternion.clone());
 const skinMesh=rig.getObjectByName('Octopus_|_continuous_deforming_skin');
 const foldedMorph=skinMesh?.morphTargetInfluences?.slice();
 mixer.setTime(.95);
 const resting=bones.map(b=>b.quaternion.clone());
 const tipTurns=bones.map(()=>new THREE.Quaternion());
 const tipAxis=new THREE.Vector3(1,0,0);
 const boneArm=bones.map(b=>/ARM_(\d+)_(\d+)/.exec(b.name));
 // Bounded CCD: two leading arms reach fixed points on the cave lip.
 const contacts=[{arm:'01',target:new THREE.Vector3(-.55,-13.15,-19)},{arm:'02',target:new THREE.Vector3(4.5,-13.15,-19)}].map(c=>({...c,tip:rig.getObjectByName(`ARM_${c.arm}_23`),joints:[18,14,10,6,3].map(n=>rig.getObjectByName(`ARM_${c.arm}_${String(n).padStart(2,'0')}`))}));
 const origin=new THREE.Vector3(),endpoint=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),parentQ=new THREE.Quaternion(),delta=new THREE.Quaternion(),identity=new THREE.Quaternion();
 function contactPose(progress){
  const weight=THREE.MathUtils.smoothstep(progress,.70,.77)*(1-THREE.MathUtils.smoothstep(progress,.81,.88));
  if(weight<=0)return;
  group.updateMatrixWorld(true);
  for(const c of contacts)for(let pass=0;pass<2;pass++)for(const joint of c.joints){
   if(!joint||!c.tip)continue;
   joint.getWorldPosition(origin);c.tip.getWorldPosition(endpoint);
   a.copy(endpoint).sub(origin).normalize();b.copy(c.target).sub(origin).normalize();
   delta.setFromUnitVectors(a,b);const angle=identity.angleTo(delta);
   delta.slerp(identity,1-Math.min(weight,.16/Math.max(angle,.00001)));
   joint.parent.getWorldQuaternion(parentQ);delta.premultiply(parentQ.clone().invert()).multiply(parentQ);
   joint.quaternion.premultiply(delta);joint.updateWorldMatrix(false,true);
  }
 }
 const groundArms=Array.from({length:8},(_,i)=>{const arm=String(i+1).padStart(2,'0');return {chain:Array.from({length:21},(_,j)=>rig.getObjectByName(`ARM_${arm}_${String(j+3).padStart(2,'0')}`)),tip:rig.getObjectByName(`ARM_${arm}_23`),joints:[19,15,11,7,3].map(n=>rig.getObjectByName(`ARM_${arm}_${String(n).padStart(2,'0')}`))};});
 function groundPose(weight){
  if(!weight)return;
  group.updateMatrixWorld(true);
  for(const c of groundArms){
   if(!c.tip)continue;
   c.tip.getWorldPosition(endpoint);
   const target=endpoint.clone();target.y=shelfHeight(target.x,target.z)+.09;
   for(let pass=0;pass<4;pass++)for(const joint of c.joints){
    if(!joint)continue;
    joint.getWorldPosition(origin);c.tip.getWorldPosition(endpoint);
    a.copy(endpoint).sub(origin).normalize();b.copy(target).sub(origin).normalize();
    delta.setFromUnitVectors(a,b);const angle=identity.angleTo(delta);
    delta.slerp(identity,1-Math.min(weight,.18/Math.max(angle,.00001)));
    joint.parent.getWorldQuaternion(parentQ);delta.premultiply(parentQ.clone().invert()).multiply(parentQ);
    joint.quaternion.premultiply(delta);joint.updateWorldMatrix(false,true);
   }
   // Keep intermediate arm centres above the local sand as well as the tip.
   // Bounded joint projection is a contact approximation, not soft-body physics.
   for(let pass=0;pass<2;pass++)for(const bone of c.chain){
    if(!bone?.parent?.isBone)continue;
    bone.getWorldPosition(endpoint);const ground=shelfHeight(endpoint.x,endpoint.z)+.18;
    if(endpoint.y>=ground)continue;
    const joint=bone.parent;joint.getWorldPosition(origin);
    a.copy(endpoint).sub(origin).normalize();b.copy(endpoint);b.y=ground;b.sub(origin).normalize();
    delta.setFromUnitVectors(a,b);delta.slerp(identity,1-weight);
    joint.parent.getWorldQuaternion(parentQ);delta.premultiply(parentQ.clone().invert()).multiply(parentQ);
    joint.quaternion.premultiply(delta);joint.updateWorldMatrix(false,true);
   }
  }
 }
 let elapsed=0;
 return {group,kind:'blender',setBackdrop:setOceanBackdrop,setQuality(){},
  update(value){
   elapsed=value;
   group.rotation.set(0,0,0);
  },
  setMotion(strength,phase,tucks,options={}){
   const reduced=Boolean(options.reduced),effort=reduced?0:THREE.MathUtils.clamp(strength,0,1);
   mixer.setTime(phase);
   for(let i=0;i<bones.length;i++){
    const b=bones[i];b.quaternion.slerp(resting[i],1-effort);
    const match=boneArm[i];
    if(match&&Number(match[2])>17&&!reduced){
     const amount=(Number(match[2])-17)/6;
     tipTurns[i].setFromAxisAngle(tipAxis,Math.sin(elapsed*.57+Number(match[1])*1.9-amount)*.008*amount*(1-effort));
     b.quaternion.multiply(tipTurns[i]);
    }
   }
   if(skinMesh?.morphTargetInfluences)skinMesh.morphTargetInfluences[0]=THREE.MathUtils.lerp(.24+(reduced?0:Math.sin(elapsed*.85)*.035),skinMesh.morphTargetInfluences[0],effort);
   root.position.copy(rootPosition);root.quaternion.copy(rootRotation);
   // Freeze a folded pose as it enters the actual cave; never scale the mesh
   // down to fake disappearance. The reef's depth buffer provides occlusion.
   if(options.progress>.66){
    const u=THREE.MathUtils.smoothstep(options.progress,.66,.94);
    // Each arm follows its own contact/release interval. Distal segments trail
    // the crown instead of all eight arms snapping to one folded frame.
    for(let i=0;i<bones.length;i++){
     const arm=boneArm[i],delay=arm?((Number(arm[1])-1)*.006+Number(arm[2])*.0007):0;
     const fold=THREE.MathUtils.smoothstep(options.progress,.68+delay,.91+delay);
     bones[i].quaternion.slerp(folded[i],arm?fold:u);
    }
    if(foldedMorph)for(let i=0;i<foldedMorph.length;i++)skinMesh.morphTargetInfluences[i]=THREE.MathUtils.lerp(skinMesh.morphTargetInfluences[i],foldedMorph[i],u);
    root.position.copy(rootPosition);root.quaternion.copy(rootRotation);
   }
   if(options.contact!==false)contactPose(options.progress||0);
   if(options.wallWeight>0&&options.wallTargets?.length===2){
    group.updateMatrixWorld(true);
    for(let i=0;i<2;i++){
     const c=groundArms[i===0?0:3],target=options.wallTargets[i];
     for(let pass=0;pass<3;pass++)for(const joint of c.joints){
      joint.getWorldPosition(origin);c.tip.getWorldPosition(endpoint);
      a.copy(endpoint).sub(origin).normalize();b.copy(target).sub(origin).normalize();delta.setFromUnitVectors(a,b);
      const angle=identity.angleTo(delta);delta.slerp(identity,1-Math.min(options.wallWeight,.18/Math.max(angle,.00001)));
      joint.parent.getWorldQuaternion(parentQ);delta.premultiply(parentQ.clone().invert()).multiply(parentQ);joint.quaternion.premultiply(delta);joint.updateWorldMatrix(false,true);
     }
    }
   }
   if(options.settle)groundPose(options.settle);
  },
  dispose(){mixer.stopAllAction();mixer.uncacheRoot(rig);skeletons.forEach(s=>s.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 };
}
