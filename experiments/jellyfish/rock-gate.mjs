import * as THREE from '/vendor/three/three.module.min.js';
import {mergeVertices} from '/vendor/three/BufferGeometryUtils.js';
import {photographicRock} from './photographic-rock.mjs';
import {underwaterMaterial} from './underwater-material.mjs';

export function createRockGate(time,waves){
 const group=new THREE.Group();group.name='continuous-eroded-stone-gateway';
 const geometries=[],materials=[];
 const geo=g=>(geometries.push(g),g);
 const stone=photographicRock(time,waves,{vertexColors:true});materials.push(stone);
 const pos=[],colors=[],indices=[],uCount=128,vCount=28;
 const color=new THREE.Color();
 for(let u=0;u<=uCount;u++){
  const angle=u/uCount*Math.PI;
  for(let v=0;v<=vCount;v++){
   const around=v/vCount*Math.PI*2;
   const erosion=.22*Math.sin(angle*17+around*3)+.13*Math.sin(angle*39-around*7)+.08*Math.sin(angle*71+around*13);
   const radius=2.15+erosion+.50*Math.sin(angle*3+.6)+.25*Math.cos(angle*7);
   const x=18+Math.cos(angle)*(8+Math.cos(around)*radius)+.55*Math.sin(angle*2);
   const y=-20+Math.sin(angle)*(12+Math.cos(around)*radius+.65*Math.sin(angle*3));
   const z=-47+Math.sin(around)*(3.2+erosion)+Math.sin(angle*4)*.65;
   pos.push(x,y,z);
   const strata=.5+.5*Math.sin(y*3.2+Math.sin(x*.8));
   color.setRGB(.8+strata*.15,.84+strata*.12,.8+strata*.10);
   color.multiplyScalar(.72+.28*Math.max(0,Math.cos(around)));
   colors.push(color.r,color.g,color.b);
  }
 }
 for(let u=0;u<uCount;u++)for(let v=0;v<vCount;v++){
  const a=u*(vCount+1)+v,b=a+vCount+1;indices.push(a,b,a+1,a+1,b,b+1);
 }
 const archGeo=geo(new THREE.BufferGeometry());archGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));archGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));archGeo.setIndex(indices);archGeo.computeVertexNormals();
 const arch=new THREE.Mesh(archGeo,stone);arch.castShadow=true;arch.receiveShadow=false;group.add(arch);
 // Rooted buttresses overlap the seabed; varied silhouettes hide the arch endpoints.
 const rawBoulder=new THREE.IcosahedronGeometry(1,6);rawBoulder.deleteAttribute('uv');rawBoulder.deleteAttribute('normal');
 const boulderGeo=geo(mergeVertices(rawBoulder)),bp=boulderGeo.attributes.position;rawBoulder.dispose();
 const bc=[];
 for(let i=0;i<bp.count;i++){
  const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i),r=1+.065*Math.sin(x*8+y*4)+.025*Math.sin(z*15-y*5);
  bp.setXYZ(i,x*r,y*r,z*r);const shade=.70+.2*(y+1)/2;color.setRGB(shade,shade,shade);bc.push(color.r,color.g,color.b);
 }
 boulderGeo.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));boulderGeo.computeVertexNormals();
 const rocks=new THREE.InstancedMesh(boulderGeo,stone,18),dummy=new THREE.Object3D();
 let seed=467;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<18;i++){
  const side=i%2?-1:1;
  dummy.position.set(18+side*(8+rand()*5),-19+rand()*1.3,-47+(rand()-.5)*10);
  dummy.rotation.set(rand()*.8,rand()*6,rand()*.5);dummy.scale.set(1.3+rand()*2,1.3+rand()*3,1.6+rand()*2);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
 }
 rocks.castShadow=true;rocks.receiveShadow=false;group.add(rocks);
 const coralMat=underwaterMaterial(new THREE.MeshStandardMaterial({color:'#bc8067',roughness:.7}),time,waves);materials.push(coralMat);
 const coral=new THREE.InstancedMesh(geo(new THREE.CylinderGeometry(.025,.07,1,7)),coralMat,144);
 const up=new THREE.Vector3(0,1,0),dir=new THREE.Vector3();
 for(let i=0;i<144;i++){
  const colony=Math.floor(i/6),side=colony%2?-1:1;
  const x=18+side*(7.9+Math.sin(colony*19)*.7),z=-45+Math.cos(colony*7)*1.5;
  dummy.position.set(x+Math.sin(i*9)*.3,-16+Math.sin(colony*3)*1.8+(i%6)*.13,z);
  dir.set(Math.sin(i*2)*.4,1,Math.cos(i*3)*.25).normalize();dummy.quaternion.setFromUnitVectors(up,dir);dummy.scale.setScalar(1);dummy.scale.y=.4+rand()*.7;dummy.updateMatrix();coral.setMatrixAt(i,dummy.matrix);
 }
 coral.receiveShadow=true;group.add(coral);
 return {group,dispose(){rocks.dispose();coral.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
