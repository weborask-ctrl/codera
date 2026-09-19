// Offline implicit sculpt. Run after editing octopus-anatomy.mjs.
// The browser loads the baked mesh; no voxel work is done on the user's GPU.
import * as THREE from '../.prototype-cache/jellyfish/three/three.module.min.js';
import {writeFile} from 'node:fs/promises';
import {paths,armRadius,armTwist,armSection,eyes} from '../experiments/jellyfish/octopus-anatomy.mjs';

const step=.032,lo=[-3.12,-2.65,-1.80],hi=[3.15,2.18,1.66];
const dims=lo.map((v,i)=>Math.ceil((hi[i]-v)/step)+1),[nx,ny,nz]=dims,layer=nx*ny;
const size=nx*ny*nz,field=new Float32Array(size).fill(10),armField=new Float32Array(size);
const curves=paths.map(p=>new THREE.CatmullRomCurve3(p.map(p=>new THREE.Vector3(...p))));
const samples=curves.map((c,i)=>Array.from({length:101},(_,k)=>({p:c.getPointAt(k/100).toArray(),t:k/100,r:armRadius(k/100,i),i})));
const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
const index=(x,y,z)=>x+nx*y+layer*z;
function box(min,max,fn){
 const a=min.map((v,i)=>Math.max(0,Math.floor((v-lo[i])/step))),b=max.map((v,i)=>Math.min(dims[i]-1,Math.ceil((v-lo[i])/step)));
 for(let z=a[2];z<=b[2];z++)for(let y=a[1];y<=b[1];y++)for(let x=a[0];x<=b[0];x++)fn(index(x,y,z),lo[0]+x*step,lo[1]+y*step,lo[2]+z*step);
}
function ellipsoid(c,r,blend=.15,subtract=false,tilt=0){
 const pad=.25;
 const cs=Math.cos(tilt),sn=Math.sin(tilt),extent=[r[0],Math.abs(cs)*r[1]+Math.abs(sn)*r[2],Math.abs(sn)*r[1]+Math.abs(cs)*r[2]];
 box(c.map((v,i)=>v-extent[i]-pad),c.map((v,i)=>v+extent[i]+pad),(j,x,y,z)=>{
  const dy=y-c[1],dz=z-c[2],p=[x-c[0],cs*dy+sn*dz,-sn*dy+cs*dz];
  const k0=Math.hypot(...p.map((v,i)=>v/r[i])),k1=Math.hypot(...p.map((v,i)=>v/(r[i]*r[i])));
  const d=k1>1e-8?k0*(k0-1)/k1:-Math.min(...r);
  field[j]=subtract?-smin(-field[j],d,blend):smin(field[j],d,blend);
 });
}
// Iteration 1: the mantle reclines behind the cephalic mass instead of sitting
// vertically on it. A broad transverse head integrates the lateral eye sockets.
ellipsoid([.045,1.07,-.60],[.73,.85,.62],.19,false,-.43);
ellipsoid([-.025,.82,-.40],[.65,.56,.56],.20,false,-.24);
ellipsoid([.015,.69,-.19],[.57,.48,.51],.17,false,-.20);
ellipsoid([0,.34,.12],[.52,.45,.42],.24);
ellipsoid([0,-.10,.09],[.61,.34,.55],.20);
// Orbital tissue is part of the sculpt, rather than a raised eye bezel.
for(const side of [-1,1]){
 ellipsoid([side*.40,.43,.22],[.27,.245,.31],.20);
 ellipsoid([side*.455,.555,.36],[.225,.135,.20],.10);
 ellipsoid([side*.445,.335,.34],[.21,.13,.18],.10);
}

for(let i=0;i<8;i++){
 armField.fill(10);
 for(let k=0;k<100;k++){
  const a=samples[i][k],b=samples[i][k+1],ab=b.p.map((v,j)=>v-a.p[j]),len2=ab.reduce((s,v)=>s+v*v,0),pad=a.r*1.35+.16;
  const mid=(a.t+b.t)*.5,tangent=curves[i].getTangentAt(mid),front=new THREE.Vector3(0,-.2,1);
  front.addScaledVector(tangent,-front.dot(tangent)).normalize();
  const across=new THREE.Vector3().crossVectors(tangent,front),twist=armTwist(mid,i),under=front.clone().multiplyScalar(Math.cos(twist)).addScaledVector(across,Math.sin(twist));
  const lateral=new THREE.Vector3().crossVectors(tangent,under),section=armSection(curves[i],mid);
  const bendDirection=curves[i].getTangentAt(Math.min(1,mid+.015)).sub(curves[i].getTangentAt(Math.max(0,mid-.015))).normalize();
  box(a.p.map((v,j)=>Math.min(v,b.p[j])-pad),a.p.map((v,j)=>Math.max(v,b.p[j])+pad),(j,x,y,z)=>{
   const ap=[x-a.p[0],y-a.p[1],z-a.p[2]],t=Math.max(0,Math.min(1,ap.reduce((s,v,j)=>s+v*ab[j],0)/len2));
   const q=ap.map((v,j)=>v-ab[j]*t),dot=v=>q[0]*v.x+q[1]*v.y+q[2]*v.z;
   const inner=Math.max(0,dot(bendDirection)/(a.r+.001));
   const fold=Math.sin((a.t+(b.t-a.t)*t)*curves[i].getLength()*38)*.008*section.bend*inner;
   const d=(Math.hypot(dot(under)/section.depth,dot(lateral)/section.width,dot(tangent))-(a.r+(b.r-a.r)*t)+fold)*section.depth;
   armField[j]=Math.min(armField[j],d);
  });
 }
 for(let j=0;j<size;j++)if(armField[j]<.25)field[j]=smin(field[j],armField[j],.16);
}
// Deep webbing between proximal arms gives the crown a continuous skirt.
for(let i=0;i<8;i++){
 const a=curves[i].getPointAt(.12),b=curves[(i+1)%8].getPointAt(.12),c=a.clone().lerp(b,.5);
 ellipsoid(c.toArray(),[.31,.18,.25],.18);
}
for(const eye of eyes)ellipsoid(eye.center,[.155,.12,.155],.035,true);

// Attach cups to the actual blended skin, including the thicker proximal crown.
function sampleField(p){
 const q=p.map((v,i)=>(v-lo[i])/step),a=q.map(Math.floor),f=q.map((v,i)=>v-a[i]);
 if(a.some((v,i)=>v<0||v>=dims[i]-1))return 10;
 let d=0;
 for(let z=0;z<2;z++)for(let y=0;y<2;y++)for(let x=0;x<2;x++)d+=field[index(a[0]+x,a[1]+y,a[2]+z)]*(x?f[0]:1-f[0])*(y?f[1]:1-f[1])*(z?f[2]:1-f[2]);
 return d;
}
const cupAnchors={};
for(let i=0;i<8;i++)for(let k=0,t=.145;k<64&&t<.93;t+=armRadius(t,i)*.95/curves[i].getLength(),k++)for(const side of [-1,1]){
 const c=curves[i].getPointAt(t),tangent=curves[i].getTangentAt(t),front=new THREE.Vector3(0,-.20,1);
 front.addScaledVector(tangent,-front.dot(tangent)).normalize();
 const lateral=new THREE.Vector3().crossVectors(tangent,front),a=side*.48+armTwist(t,i);
 const axis=front.multiplyScalar(Math.cos(a)).addScaledVector(lateral,Math.sin(a));
 let low=0,high=.01;
 while(high<1.4&&sampleField(c.clone().addScaledVector(axis,high).toArray())<0)high+=.015;
 low=Math.max(0,high-.015);
 for(let n=0;n<10;n++){const mid=(low+high)*.5;if(sampleField(c.clone().addScaledVector(axis,mid).toArray())<0)low=mid;else high=mid;}
 cupAnchors[`${i}:${k}:${side}`]=Math.max(armRadius(t,i)*.65,(low+high)*.5-.004);
}
await writeFile(new URL('../experiments/jellyfish/octopus-cup-anchors.json',import.meta.url),JSON.stringify(cupAnchors));

// Indexed marching tetrahedra with normals from the field gradient.
const positions=[],normals=[],flex=[],uv=[],occlusion=[],indices=[],edges=new Map();
const hash3=(x,y,z)=>{const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return h-Math.floor(h);};
function noise3(p){
 const a=p.map(Math.floor),f=p.map((v,i)=>{const t=v-a[i];return t*t*(3-2*t);});let value=0;
 for(let z=0;z<2;z++)for(let y=0;y<2;y++)for(let x=0;x<2;x++)value+=hash3(a[0]+x,a[1]+y,a[2]+z)*(x?f[0]:1-f[0])*(y?f[1]:1-f[1])*(z?f[2]:1-f[2]);
 return value;
}
function relief(p){
 const warped=p.map((v,i)=>v+Math.sin(p[(i+1)%3]*3.7+i*4)*.065);
 const n=noise3(warped.map(v=>v*9.));
 const papillae=Math.max(0,(n-.36)/.64)**2*.008;
 const eyeMask=eyes.reduce((mask,e)=>mask*(1-Math.exp(-p.reduce((s,v,i)=>s+(v-e.center[i])**2,0)*24)),1);
 return papillae*eyeMask;
}
const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
const gradient=j=>[(field[j+1]-field[j-1])/(2*step),(field[j+nx]-field[j-nx])/(2*step),(field[j+layer]-field[j-layer])/(2*step)];
function crossing(a,b){
 const key=Math.min(a,b)*size+Math.max(a,b);if(edges.has(key))return edges.get(key);
 const t=field[a]/(field[a]-field[b]),coords=j=>[j%nx,Math.floor(j/nx)%ny,Math.floor(j/layer)];
 const ca=coords(a),cb=coords(b),p=ca.map((v,i)=>lo[i]+(v+(cb[i]-v)*t)*step);
 const ga=gradient(a),gb=gradient(b),n=ga.map((v,i)=>v+(gb[i]-v)*t),length=Math.hypot(...n)||1;
 let best=Infinity,nearest=null;
 if(p[1]<.1||Math.abs(p[0])>.95)for(const arm of samples)for(const sample of arm){const d=Math.hypot(...p.map((v,i)=>v-sample.p[i]))-sample.r;if(d<best){best=d;nearest=sample;}}
 const normal=n.map(v=>v/length),h=relief(p),epsilon=.004;
 const g=p.map((_,i)=>{const a=[...p],b=[...p];a[i]+=epsilon;b[i]-=epsilon;return (relief(a)-relief(b))/(2*epsilon);});
 const projection=g.reduce((s,v,i)=>s+v*normal[i],0),bumped=normal.map((v,i)=>v-g[i]+projection*v),bumpedLength=Math.hypot(...bumped);
 let blocked=0,weight=0;
 for(const distance of [.05,.11,.22,.42]){const d=sampleField(p.map((v,i)=>v+normal[i]*distance)),w=1/(1+distance*5);blocked+=Math.max(0,1-d/distance)*w;weight+=w;}
 const ao=Math.max(.30,1-blocked/weight*.85);
 const id=positions.length/3;positions.push(...p.map((v,i)=>v+normal[i]*h));normals.push(...bumped.map(v=>v/bumpedLength));occlusion.push(ao);
 flex.push(nearest?nearest.t:0,nearest?nearest.i*.87+.3:0);
 let underside=0;
 if(nearest){
  const tangent=curves[nearest.i].getTangentAt(nearest.t),front=new THREE.Vector3(0,-.20,1);
  front.addScaledVector(tangent,-front.dot(tangent)).normalize();
  const lateral=new THREE.Vector3().crossVectors(tangent,front),twist=armTwist(nearest.t,nearest.i);
  front.multiplyScalar(Math.cos(twist)).addScaledVector(lateral,Math.sin(twist));
  const radial=new THREE.Vector3(...p).sub(new THREE.Vector3(...nearest.p)).normalize();
  underside=Math.max(0,Math.min(1,(radial.dot(front)-.25)/.65));
 }
 uv.push(underside,nearest?nearest.t:0);edges.set(key,id);return id;
}
function triangle(a,b,c){
 const p=positions,ab=[0,1,2].map(k=>p[b*3+k]-p[a*3+k]),ac=[0,1,2].map(k=>p[c*3+k]-p[a*3+k]);
 const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
 if(n.reduce((s,v,k)=>s+v*normals[a*3+k],0)<0)indices.push(a,c,b);else indices.push(a,b,c);
}
for(let z=1;z<nz-2;z++)for(let y=1;y<ny-2;y++)for(let x=1;x<nx-2;x++){
 const ids=corners.map(c=>index(x+c[0],y+c[1],z+c[2])),values=ids.map(j=>field[j]);
 if(values.every(v=>v>=0)||values.every(v=>v<0))continue;
 for(const tet of tetra){
  const inside=tet.filter(k=>values[k]<0).map(k=>ids[k]),outside=tet.filter(k=>values[k]>=0).map(k=>ids[k]);
  if(inside.length===1){const a=inside[0];triangle(...outside.map(b=>crossing(a,b)));}
  if(inside.length===3){const a=outside[0];triangle(...inside.map(b=>crossing(a,b)));}
  if(inside.length===2){const [a,b]=inside,[c,d]=outside,q=[crossing(a,c),crossing(a,d),crossing(b,d),crossing(b,c)];triangle(q[0],q[1],q[2]);triangle(q[0],q[2],q[3]);}
 }
}
const arrays=[new Uint32Array([positions.length/3,indices.length]),new Float32Array(positions),new Float32Array(normals),new Float32Array(flex),new Float32Array(uv),new Float32Array(occlusion),new Uint32Array(indices)];
await writeFile(new URL('../experiments/jellyfish/octopus-sculpt.bin',import.meta.url),Buffer.concat(arrays.map(a=>Buffer.from(a.buffer))));
console.log(JSON.stringify({vertices:positions.length/3,triangles:indices.length/3,bytes:arrays.reduce((s,a)=>s+a.byteLength,0),grid:dims}));
