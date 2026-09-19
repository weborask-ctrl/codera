import * as THREE from '/vendor/three/three.module.min.js';

// Lightweight continuous reef. The floor, escarpment and cave mouth share
// the same world; all colonies are rooted to a sampled surface.
export function createReef(){
 const group=new THREE.Group();group.name='continuous-reef';
 const geometries=[],materials=[],textures=[];
 const geo=g=>(geometries.push(g),g),mat=m=>(materials.push(m),m);
 let seed=721;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const size=256,data=new Uint8Array(size*size*4);
 const hash=(x,y,n)=>{const v=Math.sin((x%n)*127.1+(y%n)*311.7)*43758.5453;return v-Math.floor(v);};
 const noise=(u,v,n)=>{const x=u*n,y=v*n,a=Math.floor(x),b=Math.floor(y);let fx=x-a,fy=y-b;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(a,b,n),hash(a+1,b,n),fx),THREE.MathUtils.lerp(hash(a,b+1,n),hash(a+1,b+1,n),fx),fy);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;
  const relief=noise(u,v,8)*.45+noise(u,v,16)*.25+noise(u,v,32)*.19+noise(u,v,64)*.11;
  const k=(x+y*size)*4;
  data[k]=Math.round(98+relief*90);data[k+1]=Math.round(100+relief*83);data[k+2]=Math.round(93+relief*70);data[k+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
 const stone=mat(new THREE.MeshStandardMaterial({color:'#a4b6a3',map:texture,bumpMap:texture,bumpScale:.11,roughness:.96}));
 const sand=mat(new THREE.MeshStandardMaterial({color:'#c6c3a5',map:texture,bumpMap:texture,bumpScale:.035,roughness:1}));
 const dark=mat(new THREE.MeshStandardMaterial({color:'#0b2630',map:texture,roughness:1,side:THREE.DoubleSide}));
 const floorY=(x,z)=>-17.4+.32*Math.sin(x*.55+z*.18)+.22*Math.cos(z*.62)+2.1*Math.exp(-(((Math.abs(x)-10)/4)**2));
 const floor=geo(new THREE.PlaneGeometry(90,95,90,95));floor.rotateX(-Math.PI/2);floor.translate(0,0,-40);
 const fp=floor.attributes.position;
 for(let i=0;i<fp.count;i++){const x=fp.getX(i),z=fp.getZ(i);fp.setY(i,floorY(x,z));floor.attributes.uv.setXY(i,x*.18,z*.18);}
 floor.computeVertexNormals();group.add(new THREE.Mesh(floor,sand));

 // A broad rock face with an irregular actual opening, rather than a ring of
 // suspended boulders. Its lower edge extends through the connected seabed.
 const surface=(a,t)=>{
  const c=Math.cos(a),s=Math.sin(a),edge=1+.09*Math.sin(a*5)+.06*Math.cos(a*7);
  const innerX=c*1.65*edge,innerY=s*1.65*edge;
  const extent=1/Math.max(Math.abs(c)/35,Math.abs(s)/(s>0?2.8:8));
  const outerX=c*extent,outerY=s*extent+(s>0?.35*Math.sin(c*extent*.6):0);
  const x=2+THREE.MathUtils.lerp(innerX,outerX,t),y=-12.7+THREE.MathUtils.lerp(innerY,outerY,t);
  const z=-19-t*7+Math.sin(x*1.7+y*.8)*.23+Math.sin(y*2.1-x*.6)*.17;
  return new THREE.Vector3(x,y,z);
 };
 const positions=[],uv=[],indices=[],segments=112,rings=18;
 for(let r=0;r<=rings;r++)for(let j=0;j<=segments;j++){
  const p=surface(j/segments*Math.PI*2,r/rings);positions.push(p.x,p.y,p.z);uv.push(p.x*.24,p.y*.24);
 }
 for(let r=0;r<rings;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const face=geo(new THREE.BufferGeometry());face.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));face.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));face.setIndex(indices);face.computeVertexNormals();
 stone.side=THREE.DoubleSide;group.add(new THREE.Mesh(face,stone));
 const tunnelPositions=[],tunnelUv=[],tunnelIndices=[];
 for(let r=0;r<=8;r++)for(let j=0;j<=segments;j++){
  const t=r/8,a=j/segments*Math.PI*2,p=surface(a,0);
  tunnelPositions.push(THREE.MathUtils.lerp(p.x,2+Math.cos(a)*1.3,t),THREE.MathUtils.lerp(p.y,-12.7+Math.sin(a)*1.3,t),THREE.MathUtils.lerp(p.z,-26,t));tunnelUv.push(j/segments*3,t*3);
 }
 for(let r=0;r<8;r++)for(let j=0;j<segments;j++){const a=r*(segments+1)+j,b=a+segments+1;tunnelIndices.push(a,a+1,b,b,a+1,b+1);}
 const tunnel=geo(new THREE.BufferGeometry());tunnel.setAttribute('position',new THREE.Float32BufferAttribute(tunnelPositions,3));tunnel.setAttribute('uv',new THREE.Float32BufferAttribute(tunnelUv,2));tunnel.setIndex(tunnelIndices);tunnel.computeVertexNormals();group.add(new THREE.Mesh(tunnel,dark));
 const back=new THREE.Mesh(geo(new THREE.CircleGeometry(2.1,32)),dark);back.position.set(2,-12.7,-26);group.add(back);
 const interior=new THREE.Mesh(geo(new THREE.IcosahedronGeometry(1,2)),dark);interior.scale.set(3,2.2,3);interior.position.set(5.6,-12.7,-26);group.add(interior);

 const coralMat=mat(new THREE.MeshStandardMaterial({color:'white',roughness:.8,bumpMap:texture,bumpScale:.018}));
 const branches=new THREE.InstancedMesh(geo(new THREE.CylinderGeometry(.025,.085,1,7)),coralMat,630);
 const plates=new THREE.InstancedMesh(geo(new THREE.SphereGeometry(1,14,7)),coralMat,90);
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
 const colors=['#bc8266','#aa976a','#a77e92','#728b79','#baab89'];
 for(let i=0;i<90;i++){
  let root;
  if(i<55){const a=random()*Math.PI*2,t=.12+random()*.7;root=surface(a,t);root.z+=.08;}
  else{const x=(random()-.5)*29,z=-11-random()*28;root=new THREE.Vector3(x,floorY(x,z)-.03,z);}
  const height=.35+random()*.9;
  const endpoints=[];
  for(let j=0;j<7;j++){
   const parent=j?endpoints[Math.floor((j-1)/2)]:root;
   const level=j===0?0:j<3?1:2;
   const direction=new THREE.Vector3(j?((j%2?1:-1)*(.28+random()*.16)):.03,.65/(1+level*.2),(random()-.5)*.35).multiplyScalar(height);
   const end=parent.clone().add(direction);endpoints.push(end);
   dummy.position.copy(parent).lerp(end,.5);dummy.quaternion.setFromUnitVectors(up,direction.clone().normalize());dummy.scale.set(1-level*.24,direction.length(),1-level*.24);dummy.updateMatrix();branches.setMatrixAt(i*7+j,dummy.matrix);
   color.set(colors[i%colors.length]);branches.setColorAt(i*7+j,color);
  }
  dummy.position.copy(root);dummy.position.y+=.08;dummy.rotation.set(.08,random()*6,.10);dummy.scale.set(.25+height*.3,.10+height*.08,.22+height*.3);dummy.updateMatrix();plates.setMatrixAt(i,dummy.matrix);plates.setColorAt(i,color);
 }
 group.add(branches,plates);
 return {group,dispose(){branches.dispose();plates.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
