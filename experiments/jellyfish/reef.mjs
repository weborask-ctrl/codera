import * as THREE from '/vendor/three/three.module.min.js';
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
 const stone=mat(new THREE.MeshStandardMaterial({color:'#7e8d80',map:texture,bumpMap:texture,bumpScale:.16,roughness:.88,side:THREE.DoubleSide}));
 const sand=mat(new THREE.MeshStandardMaterial({color:'#9caa92',map:texture,bumpMap:texture,bumpScale:.025,roughness:.98}));
 const dark=mat(new THREE.MeshStandardMaterial({color:'#153d44',map:texture,bumpMap:texture,bumpScale:.1,roughness:.98,side:THREE.DoubleSide}));
 const floorY=(x,z)=>-17.8+.38*Math.sin(x*.45+z*.16)+.19*Math.cos(z*.62)+2*Math.exp(-(((Math.abs(x)-12)/4)**2));
 const floor=geo(new THREE.PlaneGeometry(90,95,70,80));floor.rotateX(-Math.PI/2);floor.translate(0,0,-40);
 const fp=floor.attributes.position;
 for(let i=0;i<fp.count;i++){const x=fp.getX(i),z=fp.getZ(i);fp.setY(i,floorY(x,z));floor.attributes.uv.setXY(i,x*.19,z*.19);}
 floor.computeVertexNormals();const seabed=new THREE.Mesh(floor,sand);seabed.receiveShadow=true;group.add(seabed);
 const surface=(a,t)=>{
  const c=Math.cos(a),s=Math.sin(a),edge=1+.07*Math.sin(a*3)+.05*Math.cos(a*7);
  const innerX=c*2.65*edge,innerY=s*2.25*edge;
  const top=5.2+1.7*Math.sin(c*7)+.9*Math.sin(c*19)+.4*Math.sin(c*43);
  const extent=1/Math.max(Math.abs(c)/29,Math.abs(s)/(s>0?top:9));
  const x=2+THREE.MathUtils.lerp(innerX,c*extent,t),y=-12.7+THREE.MathUtils.lerp(innerY,s*extent,t);
  const relief=(Math.sin(x*.67+y*.36)*.72+Math.sin(y*1.7-x*.46)*.38+Math.sin(x*2.8+y*.9)*.10)*Math.sin(t*Math.PI);
  return new THREE.Vector3(x,y,-19-t*10+relief);
 };
 const vs=[],uv=[],ix=[],segments=100,rings=30;
 for(let r=0;r<=rings;r++)for(let j=0;j<=segments;j++){const p=surface(j/segments*Math.PI*2,r/rings);vs.push(p.x,p.y,p.z);uv.push(p.x*.21,p.y*.21);}
 for(let r=0;r<rings;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;ix.push(a,b,a+1,b,b+1,a+1);}
 const face=geo(new THREE.BufferGeometry());face.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));face.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));face.setIndex(ix);face.computeVertexNormals();const shelf=new THREE.Mesh(face,stone);shelf.castShadow=true;shelf.receiveShadow=true;group.add(shelf);
 const tv=[],tu=[],ti=[];
 for(let r=0;r<=12;r++)for(let j=0;j<=segments;j++){const t=r/12,a=j/segments*Math.PI*2,p=surface(a,0);tv.push(p.x+7*t*t,THREE.MathUtils.lerp(p.y,-12.9+Math.sin(a)*2.25,t),THREE.MathUtils.lerp(p.z,-33,t));tu.push(j/segments*3,t*4);}
 for(let r=0;r<12;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;ti.push(a,a+1,b,b,a+1,b+1);}
 const tunnel=geo(new THREE.BufferGeometry());tunnel.setAttribute('position',new THREE.Float32BufferAttribute(tv,3));tunnel.setAttribute('uv',new THREE.Float32BufferAttribute(tu,2));tunnel.setIndex(ti);tunnel.computeVertexNormals();const passage=new THREE.Mesh(tunnel,dark);passage.receiveShadow=true;group.add(passage);
 const back=new THREE.Mesh(geo(new THREE.CircleGeometry(3.7,48)),dark);back.position.set(9,-12.9,-33);group.add(back);
 const dummy=new THREE.Object3D(),color=new THREE.Color(),up=new THREE.Vector3(0,1,0);
 const rockGeo=geo(new THREE.IcosahedronGeometry(1,2)),rp=rockGeo.attributes.position;
 for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),f=1+.10*Math.sin(x*8+y*3)+.08*Math.sin(z*11-x*5);rp.setXYZ(i,x*f,y*f,z*f);}
 rockGeo.computeVertexNormals();
 const rocks=new THREE.InstancedMesh(rockGeo,stone,65);rocks.castShadow=true;rocks.receiveShadow=true;
 for(let i=0;i<65;i++){const a=random()*Math.PI*2,t=.18+random()*.72,p=surface(a,t),s=.4+random()*1.2;dummy.position.copy(p);dummy.position.z-=s*.25;dummy.rotation.set(random(),random()*6,random());dummy.scale.set(s*(1.3+random()),s*(.45+random()*.5),s*.9);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}
 group.add(rocks);
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
 return {group,dispose(){for(const o of [rocks,branches,ends])o.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
