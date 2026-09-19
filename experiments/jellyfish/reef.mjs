import * as THREE from '/vendor/three/three.module.min.js';
import {mergeVertices,mergeGeometries} from '/vendor/three/BufferGeometryUtils.js';
import {shelfHeight} from './deep-path.mjs';
import {photographicRock} from './photographic-rock.mjs';
import {underwaterMaterial} from './underwater-material.mjs';

// A continuous eroded shelf. Instances add embedded ledges and coral colonies.
export function createReef(time={value:0},waves={value:null}){
 const group=new THREE.Group();group.name='eroded-reef-and-contact-cave';
 const geometries=[],materials=[],textures=[];
 const geo=g=>(geometries.push(g),g),mat=m=>(materials.push(m),underwaterMaterial(m,time,waves));
 let seed=721;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const size=256,data=new Uint8Array(size*size*4);
 const hash=(x,y,n)=>{const v=Math.sin(((x%n+n)%n)*127.1+((y%n+n)%n)*311.7)*43758.5453;return v-Math.floor(v);};
 const noise=(u,v,n)=>{const x=u*n,y=v*n,a=Math.floor(x),b=Math.floor(y);let fx=x-a,fy=y-b;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(a,b,n),hash(a+1,b,n),fx),THREE.MathUtils.lerp(hash(a,b+1,n),hash(a+1,b+1,n),fx),fy);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,k=(x+y*size)*4;
  const r=noise(u,v,5)*.35+noise(u,v,13)*.3+noise(u,v,37)*.2+noise(u,v,89)*.15;
  const pore=Math.max(0,.26-noise(u,v,89))*200;
  data[k]=125+r*75-pore;data[k+1]=122+r*63-pore;data[k+2]=104+r*57-pore;data[k+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
 const stone=photographicRock(time,waves);materials.push(stone);
 const sand=mat(new THREE.MeshStandardMaterial({color:'#9caa92',map:texture,bumpMap:texture,bumpScale:.025,roughness:.98}));
 const dark=mat(new THREE.MeshStandardMaterial({color:'#153d44',map:texture,bumpMap:texture,bumpScale:.1,roughness:.98,side:THREE.DoubleSide}));
 const floorY=shelfHeight;
 const floor=geo(new THREE.PlaneGeometry(140,340,100,272));floor.rotateX(-Math.PI/2);floor.translate(0,0,-145);
 const fp=floor.attributes.position;
 for(let i=0;i<fp.count;i++){const x=fp.getX(i),z=fp.getZ(i);fp.setY(i,floorY(x,z));floor.attributes.uv.setXY(i,x*.19,z*.19);}
 floor.computeVertexNormals();
 const terrainMaterial=photographicRock(time,waves,{sandMap:texture});materials.push(terrainMaterial);
 const seabed=new THREE.Mesh(floor,terrainMaterial);seabed.name='continuous-terrace-and-drop';seabed.receiveShadow=true;group.add(seabed);
 const dummy=new THREE.Object3D(),color=new THREE.Color(),up=new THREE.Vector3(0,1,0);
 const savedSeed=seed;
 const grains=new THREE.InstancedMesh(geo(new THREE.IcosahedronGeometry(1,1)),stone,110);
 for(let i=0;i<110;i++){
  const x=-4+random()*46,z=-128-random()*43,s=.025+random()*.09;
  dummy.position.set(x,shelfHeight(x,z)+s*.25,z);dummy.rotation.set(random(),random()*6,random());dummy.scale.set(s*1.4,s*.55,s);dummy.updateMatrix();grains.setMatrixAt(i,dummy.matrix);
 }
 grains.name='seabed-shell-fragments';group.add(grains);seed=savedSeed;
 const surface=(a,t)=>{
  const c=Math.cos(a),s=Math.sin(a),edge=1+.07*Math.sin(a*3)+.05*Math.cos(a*7);
  const innerX=c*2.65*edge,innerY=s*2.25*edge;
  const top=5.2+1.7*Math.sin(c*7)+.9*Math.sin(c*19)+.4*Math.sin(c*43);
  const extent=1/Math.sqrt((c/27)**2+(s/(s>0?top:9))**2);
  const x=2+THREE.MathUtils.lerp(innerX,c*extent,t),y=-12.7+THREE.MathUtils.lerp(innerY,s*extent,t);
  const relief=(Math.sin(x*.67+y*.36)*.72+Math.sin(y*1.7-x*.46)*.38+Math.sin(x*2.8+y*.9)*.10)*Math.sin(t*Math.PI);
  return new THREE.Vector3(x+.45*Math.sin(y*.6)*t,y,-19-t*10+relief);
 };
 const vs=[],uv=[],ix=[],segments=100,rings=30;
 for(let r=0;r<=rings;r++)for(let j=0;j<=segments;j++){const p=surface(j/segments*Math.PI*2,r/rings);vs.push(p.x,p.y,p.z);uv.push(p.x*.21,p.y*.21);}
 for(let r=0;r<rings;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;ix.push(a,b,a+1,b,b+1,a+1);}
 const face=geo(new THREE.BufferGeometry());face.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));face.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));face.setIndex(ix);face.computeVertexNormals();const shelf=new THREE.Mesh(face,stone);shelf.name='reef-shell-front';shelf.castShadow=true;shelf.receiveShadow=false;group.add(shelf);
 const tv=[],tu=[],ti=[];
 for(let r=0;r<=12;r++)for(let j=0;j<=segments;j++){const t=r/12,a=j/segments*Math.PI*2,p=surface(a,0);tv.push(p.x+7*t*t,THREE.MathUtils.lerp(p.y,-12.9+Math.sin(a)*2.25,t),THREE.MathUtils.lerp(p.z,-33,t));tu.push(j/segments*3,t*4);}
 for(let r=0;r<12;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;ti.push(a,a+1,b,b,a+1,b+1);}
 const tunnel=geo(new THREE.BufferGeometry());tunnel.setAttribute('position',new THREE.Float32BufferAttribute(tv,3));tunnel.setAttribute('uv',new THREE.Float32BufferAttribute(tu,2));tunnel.setIndex(ti);tunnel.computeVertexNormals();const passage=new THREE.Mesh(tunnel,dark);passage.name='reef-shell-tunnel';passage.receiveShadow=true;group.add(passage);
 // Rear annulus and perimeter bridge close the shell while preserving the exit.
 const rear=[],rearUV=[],rearIndex=[],side=[],sideUV=[],sideIndex=[];
 const rearPoint=(a,t)=>{const lip=surface(a,0),edge=surface(a,1);return new THREE.Vector3(THREE.MathUtils.lerp(lip.x+7,edge.x,t),THREE.MathUtils.lerp(-12.9+Math.sin(a)*2.25,edge.y,t),-33-2*t-1.1*Math.sin(t*Math.PI)*Math.sin(a*3+.5));};
 for(let r=0;r<=rings;r++)for(let j=0;j<=segments;j++){const p=rearPoint(j/segments*Math.PI*2,r/rings);rear.push(p.x,p.y,p.z);rearUV.push(p.x*.21,p.y*.21);}
 for(let r=0;r<rings;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;rearIndex.push(a,a+1,b,b,a+1,b+1);}
 for(let r=0;r<=8;r++)for(let j=0;j<=segments;j++){const a=j/segments*Math.PI*2,p=surface(a,1),q=rearPoint(a,1),t=r/8;p.lerp(q,t);p.y+=Math.sin(a)*.6*Math.sin(t*Math.PI);p.x+=Math.cos(a)*.85*Math.sin(t*Math.PI);side.push(p.x,p.y,p.z);sideUV.push(j/segments*16,t*2);}
 for(let r=0;r<8;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;sideIndex.push(a,b,a+1,b,b+1,a+1);}
 for(const [p,u,i] of [[rear,rearUV,rearIndex],[side,sideUV,sideIndex]]){const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setIndex(i);g.computeVertexNormals();const m=new THREE.Mesh(g,stone);m.name='reef-shell-closure';m.castShadow=true;group.add(m);}
 // Weld the exterior/tunnel into one smooth watertight render surface.
 const shellParts=group.children.filter(o=>o.name.startsWith('reef-shell-'));
 const shellCopies=shellParts.map(o=>{const g=o.geometry.clone();g.deleteAttribute('uv');g.deleteAttribute('normal');return g;});
 const joined=mergeGeometries(shellCopies);const sealed=geo(mergeVertices(joined,.0001));sealed.computeVertexNormals();
 const sp=sealed.attributes.position,sn=sealed.attributes.normal;
 for(let i=0;i<sp.count;i++){const x=sp.getX(i),y=sp.getY(i),z=sp.getZ(i),relief=.32*Math.sin(x*.85+y*.9+z*.3)+.10*Math.sin(x*2.1-y*1.3+z*.9);sp.setXYZ(i,x+sn.getX(i)*relief,y+sn.getY(i)*relief,z+sn.getZ(i)*relief);}
 sealed.computeVertexNormals();joined.dispose();shellCopies.forEach(g=>g.dispose());
 shellParts.forEach(o=>group.remove(o));const shellMesh=new THREE.Mesh(sealed,stone);shellMesh.name='reef-shell-closed';shellMesh.castShadow=true;group.add(shellMesh);

 const rawRock=new THREE.IcosahedronGeometry(1,5);rawRock.deleteAttribute('normal');rawRock.deleteAttribute('uv');const rockGeo=geo(mergeVertices(rawRock)),rp=rockGeo.attributes.position;rawRock.dispose();
 for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),f=1+.10*Math.sin(x*8+y*3)+.08*Math.sin(z*11-x*5);rp.setXYZ(i,x*f,y*f,z*f);}
 rockGeo.computeVertexNormals();
 const rocks=new THREE.InstancedMesh(rockGeo,stone,65);rocks.castShadow=true;rocks.receiveShadow=false;
 for(let i=0;i<65;i++){const a=random()*Math.PI*2,t=.18+random()*.72,p=surface(a,t),s=.4+random()*1.2;dummy.position.copy(p);dummy.position.z-=s*.25;dummy.rotation.set(random(),random()*6,random());dummy.scale.set(s*(1.3+random()),s*(.45+random()*.5),s*.9);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}
 group.add(rocks);
 const deepRocks=new THREE.InstancedMesh(rockGeo,stone,7);
 [[-7,-45,-98,8,19,12],[43,-46,-103,8,22,15],[-15,-51,-120,12,20,17],[50,-51,-128,15,24,17],[35,-51,-147,12,12,10],[12,-50,-97,5,16,9],[30,-50,-101,5,15,11]].forEach((r,i)=>{dummy.position.set(...r.slice(0,3));dummy.rotation.set(.05*i,.3*i,.08*i);dummy.scale.set(...r.slice(3));dummy.updateMatrix();deepRocks.setMatrixAt(i,dummy.matrix);});group.add(deepRocks);
 const perch=new THREE.Mesh(rockGeo,stone);perch.name='octopus-resting-buttress';perch.position.set(28,-49,-132);perch.scale.set(4.5,8,4);group.add(perch);perch.updateMatrixWorld(true);
 const wallTargets=[];const contactRay=new THREE.Raycaster();
 for(const x of [25.4,28.4]){
  const origin=new THREE.Vector3(x,-44.1,-120),direction=new THREE.Vector3(0,0,-1);contactRay.set(origin,direction);
  const hit=contactRay.intersectObject(perch,false)[0];if(hit)wallTargets.push(hit.point.addScaledVector(hit.face.normal.clone().transformDirection(perch.matrixWorld),.08));
 }
 const vents=[],ventRing=geo(new THREE.TorusGeometry(.19,.045,8,18)),ventDark=mat(new THREE.MeshStandardMaterial({color:'#293832',roughness:1}));
 deepRocks.updateMatrixWorld(true);
 for(const [x,y] of [[13,-41],[30,-40],[43,-43]]){
  contactRay.set(new THREE.Vector3(x,y,-70),new THREE.Vector3(0,0,-1));
  const hit=contactRay.intersectObject(deepRocks,false)[0];if(!hit)continue;
  const transform=new THREE.Matrix4();deepRocks.getMatrixAt(hit.instanceId,transform);transform.premultiply(deepRocks.matrixWorld);
  const normal=hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(transform));
  const p=hit.point.addScaledVector(normal,.025),ring=new THREE.Mesh(ventRing,stone);ring.position.copy(p);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);group.add(ring);
  const recess=new THREE.Mesh(geo(new THREE.CircleGeometry(.17,18)),ventDark);recess.position.copy(p).addScaledVector(normal,-.018);recess.quaternion.copy(ring.quaternion);group.add(recess);vents.push(p.toArray());
 }
 const coral=mat(new THREE.MeshStandardMaterial({color:'white',roughness:.72,bumpMap:texture,bumpScale:.018}));
 const branchRecords=[],tips=[],lobes=[],palette=['#ad785f','#98716c','#9a876b','#75938b'];
 for(let colony=0;colony<35;colony++){
  const a=random()*Math.PI*2,t=.13+random()*.61,root=surface(a,t);root.z+=.02;
  const hue=palette[colony%palette.length],height=.5+random()*1.3;
  const grow=(base,direction,length,radius,level)=>{
   const end=base.clone().addScaledVector(direction,length);branchRecords.push({base,end,radius,hue});tips.push({p:end,r:radius,hue});
   if(level<3){for(let j=0;j<2;j++){const dir=direction.clone().add(new THREE.Vector3((j?1:-1)*(.32+random()*.35),.1,(random()-.5)*.8)).normalize();grow(end,dir,length*(.61+random()*.14),radius*.68,level+1);}}
  };
  grow(root,new THREE.Vector3((random()-.5)*.35,.8,.4).normalize(),height*.5,.09*height,0);
  if(colony%3===0)for(let j=0;j<7;j++)lobes.push({p:root.clone().add(new THREE.Vector3((random()-.5)*.6,random()*.45,(random()-.5)*.3)),r:.18+random()*.25,hue});
 }
 const branches=new THREE.InstancedMesh(geo(new THREE.CylinderGeometry(.65,1,1,7)),coral,branchRecords.length);
 const ends=new THREE.InstancedMesh(geo(new THREE.IcosahedronGeometry(1,1)),coral,tips.length+lobes.length);
 branchRecords.forEach((b,i)=>{const d=b.end.clone().sub(b.base);dummy.position.copy(b.base).lerp(b.end,.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(b.radius,d.length(),b.radius);dummy.updateMatrix();branches.setMatrixAt(i,dummy.matrix);branches.setColorAt(i,color.set(b.hue));});
 [...tips,...lobes.map(l=>({p:l.p,r:l.r,hue:l.hue}))].forEach((b,i)=>{dummy.position.copy(b.p);dummy.rotation.set(0,0,0);dummy.scale.set(b.r,b.r*.9,b.r*.8);dummy.updateMatrix();ends.setMatrixAt(i,dummy.matrix);ends.setColorAt(i,color.set(b.hue));});
 branches.castShadow=true;branches.receiveShadow=true;ends.castShadow=true;ends.receiveShadow=true;group.add(branches,ends);
 return {group,wallTargets,vents,dispose(){for(const o of [rocks,branches,ends,deepRocks,grains])o.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
