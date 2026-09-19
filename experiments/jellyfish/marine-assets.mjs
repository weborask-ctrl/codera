import * as THREE from '/vendor/three/three.module.min.js';
import {mergeGeometries} from '/vendor/three/BufferGeometryUtils.js';
import {underwaterMaterial} from './underwater-material.mjs';

export const rng=(seed=382)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
export function paint(g,hex){
 const c=new THREE.Color(hex),p=g.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const k=.94+.06*Math.sin(p.getX(i)*27+p.getY(i)*19);colors.push(c.r*k,c.g*k,c.b*k);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;
}
export function merge(parts){
 const indexed=parts.every(g=>g.index);
 const prepared=parts.map(g=>{const n=!indexed&&g.index?g.toNonIndexed():g.clone();if(!n.attributes.uv)n.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n.attributes.position.count*2),2));return n;});
 const result=mergeGeometries(prepared);prepared.forEach(g=>g.dispose());parts.forEach(g=>g.dispose());return result;
}
export function ellipsoid(position,scale,color,segments=16){
 const g=new THREE.SphereGeometry(1,segments,Math.max(8,segments/2));g.scale(...scale);g.translate(...position);return paint(g,color);
}
export function tube(points,radius,color,segments=20,sides=7){
 return paint(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,radius,sides,false),color);
}
export function organicMaterial(time,waves,kind='coral'){
 const m=underwaterMaterial(new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:kind==='fish'?.4:.72,side:THREE.DoubleSide}),time,waves);
 m.defines={USE_UV:''};
 const compile=m.onBeforeCompile;
 m.onBeforeCompile=s=>{
  compile(s);
  if(kind==='plant')s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float bladeVein=exp(-abs(vUv.x-.5)*65.);
float sideVeins=.5+.5*sin(vUv.y*150.+abs(vUv.x-.5)*29.);
float leafMottle=seaNoise(seaLocal*24.);
diffuseColor.rgb*=mix(vec3(.68,.78,.64),vec3(1.12,1.07,.83),leafMottle);
diffuseColor.rgb*=.84+.12*sideVeins+.16*bladeVein;`);
  if(kind==='fish')s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
float scaleCell=sin(vUv.x*235.+sin(vUv.y*110.)*.65)*sin(vUv.y*110.);
float scaleAA=1.-smoothstep(.03,.10,length(fwidth(vUv)));
diffuseColor.rgb*=1.-(.035+.035*scaleCell)*scaleAA;`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
float organismNoise=seaNoise(seaLocal*42.);
roughnessFactor=clamp(roughnessFactor+(organismNoise-.5)*.16,.32,.93);`)
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
float detailWidth=length(fwidth(seaLocal));
float surfaceGrain=(seaNoise(seaLocal*70.)-.5)*.004*(1.-smoothstep(.006,.025,detailWidth));
vec3 osx=dFdx(-vViewPosition),osy=dFdy(-vViewPosition),or1=cross(osy,normal),or2=cross(normal,osx);
float od=dot(osx,or1);
if(abs(od)>1e-9)normal=normalize(abs(od)*normal-sign(od)*(dFdx(surfaceGrain)*or1+dFdy(surfaceGrain)*or2));`);
  if(kind==='fish')s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
float tailWeight=smoothstep(.15,.95,-position.x);
transformed.z+=sin(seaTime*5.5+position.x*5.)*.13*tailWeight;`)
   .replace('#include <common>','#include <common>\nuniform float seaTime;');
  if(kind==='plant')s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float seaTime;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
vec3 rootPosition=vec3(0.);
#ifdef USE_INSTANCING
rootPosition=instanceMatrix[3].xyz;
#endif
float flexibility=clamp(position.y/2.7,0.,1.);
float current=sin(seaTime*.48+rootPosition.x*.16+rootPosition.z*.11-position.y*.65);
transformed.x+=(current*.22+sin(seaTime*.19)*.12)*flexibility*flexibility;
transformed.z+=sin(seaTime*.37+position.y*.9+rootPosition.z*.12)*.13*flexibility;`);
  if(kind==='crab')s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float seaTime;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
float crabPhase=0.;
#ifdef USE_INSTANCING
crabPhase=instanceMatrix[3].z*.3;
#endif
float walking=max(0.,sin(seaTime*.17+crabPhase));
float leg=smoothstep(.30,.48,abs(position.x))*(1.-smoothstep(.12,.32,position.z));
float gait=seaTime*5.+position.z*25.+step(0.,position.x)*3.14159;
transformed.x+=sin(gait)*.055*leg*walking;
transformed.y+=max(0.,cos(gait))*.035*leg*walking;`);
  if(kind==='coral')s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float seaTime;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
vec3 colonyRoot=vec3(0.);
#ifdef USE_INSTANCING
colonyRoot=instanceMatrix[3].xyz;
#endif
float coralBend=max(0.,position.y)*max(0.,position.y)*.012;
transformed.x+=sin(seaTime*.48+colonyRoot.x*.16+colonyRoot.z*.11-position.y*.65)*coralBend;`);
 };
 m.customProgramCacheKey=()=>`marine-organism-6-${kind}`;return m;
}

// Ribbed shell with two real surfaces and a closed outer lip, not a flat decal.
export function shellGeometry(variant=0){
 const positions=[],colors=[],indices=[],rows=20,cols=40,c=new THREE.Color();
 const palettes=[['#d8a894','#f4e1c2'],['#6a6473','#baa9af'],['#b17a59','#e8bd86']];
 for(let side=0;side<2;side++)for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
  const t=i/rows,a=-1.18+j/cols*2.36,r=(.12+t*.9)*(1+.014*Math.cos(a*24));
  const ridge=Math.cos(a*(variant===1?34:22))*.018*t;
  const x=Math.sin(a)*r*(variant===1?.58:1),z=Math.cos(a)*r;
  const y=Math.sin(t*Math.PI)*(.23+ridge)+(side?-.035:.035)*(1-t*.6);
  positions.push(x,y,z);
  c.set(palettes[variant%3][side?1:0]);c.multiplyScalar(.82+.18*Math.sin(t*39+a*.6)**2);colors.push(c.r,c.g,c.b);
 }
 const n=(rows+1)*(cols+1);
 for(let side=0;side<2;side++)for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
  const a=side*n+i*(cols+1)+j,b=a+cols+1;indices.push(...(side?[a,a+1,b,b,a+1,b+1]:[a,b,a+1,b,b+1,a+1]));
 }
 const edge=[];for(let j=0;j<=cols;j++)edge.push(j);for(let i=1;i<=rows;i++)edge.push(i*(cols+1)+cols);for(let j=cols-1;j>=0;j--)edge.push(rows*(cols+1)+j);for(let i=rows-1;i>0;i--)edge.push(i*(cols+1));
 for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];indices.push(a,b,a+n,b,b+n,a+n);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function plantGeometry(){
 const parts=[];
 for(let leaf=0;leaf<7;leaf++){
  const p=[],uv=[],ix=[],h=1.1+leaf*.22,angle=leaf*2.4,rows=24,cols=6,n=(rows+1)*(cols+1);
  for(let face=0;face<2;face++)for(let i=0;i<=rows;i++){
   const t=i/rows,w=Math.sin(Math.PI*t)*(.045+leaf*.009)+.002;
   for(let j=0;j<=cols;j++){
    const side=j/cols*2-1;
    p.push(Math.sin(angle)*t*t*.45+side*w,h*t,Math.cos(angle)*t*t*.35+Math.sin(t*9+leaf)*t*.09+(1-side*side)*w*.32+(face?-.004:.004));uv.push(j/cols,t);
   }
  }
  for(let face=0;face<2;face++)for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
   const a=face*n+i*(cols+1)+j,b=a+cols+1;ix.push(...(face?[a,b,a+1,b,b+1,a+1]:[a,a+1,b,b,a+1,b+1]));
  }
  for(let i=0;i<rows;i++)for(const j of [0,cols]){const a=i*(cols+1)+j,b=a+cols+1;ix.push(a,b,a+n,b,b+n,a+n);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();parts.push(paint(g,leaf%2?'#737641':'#4b7055'));
 }
 return merge(parts);
}

export function coralGeometry(type=0){
 const random=rng(872+type),parts=[];
 const hue=type===0?'#d9826d':type===1?'#ba618c':'#ceaa70';
 if(type===1){
  // A sea fan is a thin branching network with an irregular scalloped edge.
  for(let spoke=0;spoke<29;spoke++){
   const a=-1.16+spoke/28*2.32,h=1.8+random()*.35,points=[];
   for(let j=0;j<=9;j++){const t=j/9;points.push([Math.sin(a)*h*t,Math.cos(a)*h*t,.09*Math.sin(t*5+a*3)]);}
   parts.push(tube(points,.016+random()*.008,'#b86a81',20,5));
   for(let branch=3;branch<9;branch++){
    const t=branch/9,theta=a+.075;
    parts.push(tube([points[branch],[Math.sin(theta)*h*(t+.035),Math.cos(theta)*h*(t+.035),.09*Math.sin(t*5+a*3)]],.009,'#d6939a',3,4));
   }
  }
  parts.push(tube([[0,0,0],[0,.3,0],[.06,.7,.02]],.05,'#bc7a75',12,8));
 }else if(type===0){
  const grow=(a,d,len,radius,depth)=>{
   const b=a.clone().addScaledVector(d,len),mid=a.clone().lerp(b,.5);mid.x+=(random()-.5)*len*.25;
   const path=new THREE.CatmullRomCurve3([a,mid,b]),stem=new THREE.TubeGeometry(path,8,radius,8,false),sp=stem.attributes.position;
   for(let i=0;i<sp.count;i++){const t=stem.attributes.uv.getX(i),center=path.getPointAt(t),v=new THREE.Vector3().fromBufferAttribute(sp,i).sub(center).multiplyScalar(1-t*.34).add(center);sp.setXYZ(i,v.x,v.y,v.z);}
   stem.computeVertexNormals();parts.push(paint(stem,hue));
   parts.push(ellipsoid(b.toArray(),[radius*.7,radius*.7,radius*.7],'#e3a08d',8));
   if(depth<3)for(let i=0;i<3;i++){
    const direction=d.clone().add(new THREE.Vector3((i-1)*.72,.18,(random()-.5)*(type===1?.18:.9))).normalize();
    grow(b,direction,len*(.58+random()*.16),radius*.62,depth+1);
   }
   else for(let k=0;k<4;k++){
    const t=k/4,v=a.clone().lerp(b,t);v.z+=radius;
    for(let flower=0;flower<5;flower++){
     const angle=flower/5*Math.PI*2;
     parts.push(ellipsoid([v.x+Math.cos(angle)*.035,v.y,v.z+Math.sin(angle)*.035],[.032,.048,.027],'#eead94',7));
    }
   }
  };
  for(let i=0;i<5;i++)grow(new THREE.Vector3((i-2)*.13,0,(random()-.5)*.3),new THREE.Vector3((i-2)*.24,1,(random()-.5)*.35).normalize(),.45+random()*.35,.065,0);
 }else{
  for(let plate=0;plate<5;plate++){
   const g=new THREE.SphereGeometry(1,44,20),p=g.attributes.position,r=.55+plate*.17;
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),radial=Math.hypot(x,z),f=1+.09*Math.sin(a*9+plate);p.setXYZ(i,x*r*f+Math.sin(plate*3)*.3,p.getY(i)*.065+plate*.25+.035*Math.sin(a*16)*radial,z*r*f);}
   g.computeVertexNormals();parts.push(paint(g,plate%2?'#daba83':'#b9976e'));
  }
 }
 return merge(parts);
}

// Different body profiles, fins, eyes, mouth, gill marks and species patterns.
export function fishGeometry(type=0){
 const parts=[],body=new THREE.SphereGeometry(1,36,20),p=body.attributes.position,colors=[];
 const tall=[.27,.57,.48,.23][type],thick=[.17,.16,.19,.15][type],base=new THREE.Color(['#e39140','#efcf6b','#508ab0','#56aa99'][type]);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),taper=.35+.65*THREE.MathUtils.smoothstep(x,-.95,.15);
  p.setXYZ(i,x*.8,y*tall*taper,z*thick*taper);
  const c=base.clone(),belly=THREE.MathUtils.smoothstep(-y,-.1,.9);c.lerp(new THREE.Color('#efdbb7'),belly*.45);
  const stripe=type===1?(Math.sin(x*22+y*3)>.25?.36:1):type===2?(x<.45&&x>-.4&&y>.2?.25:1):type===3?(.7+.3*Math.sin(y*24+x*6)**2):1;
  c.multiplyScalar(stripe*(.94+.06*Math.cos(x*140+y*35)*Math.cos(y*150)));colors.push(c.r,c.g,c.b);
 }
 body.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));body.computeVertexNormals();parts.push(body);
 const finColor=['#dfac75','#edd595','#e7cc59','#cd988c'][type];
 function fin(points){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));const idx=[];for(let i=1;i<points.length-1;i++)idx.push(0,i,i+1);g.setIndex(idx);g.computeVertexNormals();parts.push(paint(g,finColor));}
 fin([[-.62,0,0],[-1.08,tall*.9,0],[-.94,0,0],[-1.08,-tall*.9,0]]);
 fin([[.43,tall*.65,0],[.02,tall*1.40,0],[-.62,tall*.9,0],[-.52,tall*.3,0]]);
 fin([[.25,-tall*.6,0],[-.35,-tall*1.24,0],[-.64,-tall*.4,0]]);
 for(const sign of [-1,1]){
  parts.push(ellipsoid([.49,tall*.25,sign*thick*.83],[.045,.048,.025],'#d3b881',12));
  parts.push(ellipsoid([.51,tall*.25,sign*(thick*.83+.019)],[.025,.031,.009],'#061b20',10));
  fin([[.12,0,sign*thick],[-.18,-.23,sign*.37],[-.34,-.1,sign*thick]]);
  parts.push(tube([[.29,tall*.46,sign*thick*.72],[.24,0,sign*thick],[.29,-tall*.4,sign*thick*.72]],.007,'#8b705c',8,4));
 }
 parts.push(ellipsoid([.79,-.03,0],[.025,.024,.05],'#73543b',8));
 return merge(parts);
}

export function seahorseGeometry(){
 const parts=[ellipsoid([0,.7,0],[.15,.34,.12],'#ccaa61',24),ellipsoid([.03,1.22,0],[.14,.15,.11],'#d5b575',20)];
 const spine=[[0,.52,0],[-.13,.9,0],[-.14,1.14,0],[.03,1.28,0]];
 parts.push(tube(spine,.065,'#bca168',28,10));
 parts.push(tube([[.1,1.23,0],[.24,1.17,0],[.34,1.16,0]],.041,'#d8b777',12,10));
 const tail=[];for(let i=0;i<=38;i++){const t=i/38,a=t*Math.PI*2.5,r=.23*(1-t)+.035;tail.push([-.08+r*Math.sin(a),.32-t*.31+r*Math.cos(a),0]);}
 parts.push(tube([[0,.45,0],...tail],.033,'#c3a463',50,8));
 for(let i=0;i<12;i++){
  const y=.43+i*.056,r=.125*Math.sin((i+1)/14*Math.PI)+.025;
  const g=new THREE.TorusGeometry(r,.010,4,16);g.rotateX(Math.PI/2);g.scale(1,1,.8);g.translate(0,y,0);parts.push(paint(g,'#e1c794'));
 }
 for(const sign of [-1,1]){parts.push(ellipsoid([.095,1.27,sign*.095],[.041,.042,.022],'#e5ce96',10));parts.push(ellipsoid([.11,1.27,sign*.113],[.022,.025,.008],'#152520',8));}
 for(let i=0;i<5;i++)parts.push(ellipsoid([-.04+i*.023,1.36+Math.sin(i)*.035,0],[.012,.075,.027],'#bfa368',8));
 parts.push(ellipsoid([-.15,.80,0],[.08,.18,.012],'#cebf92',12));return merge(parts);
}

export function crabGeometry(){
 const parts=[ellipsoid([0,.18,0],[.36,.15,.26],'#aa785e',28)];
 for(const side of [-1,1]){
  for(let leg=0;leg<4;leg++){
   const z=-.20+leg*.12,x=side*(.48+Math.sin(leg)*.1);
   parts.push(tube([[side*.22,.18,z],[x,.23,z-.09],[x+side*.17,.035,z-.16]],.025,'#ac8068',12,6));
  }
  parts.push(tube([[side*.25,.18,.12],[side*.47,.28,.34],[side*.39,.32,.51]],.055,'#9a6852',12,8));
  parts.push(ellipsoid([side*.39,.32,.56],[.10,.07,.13],'#b7886a',14));
  parts.push(tube([[side*.35,.32,.60],[side*.32,.32,.74]],.028,'#dcc8a4',5,6));
  parts.push(tube([[side*.44,.32,.60],[side*.43,.32,.72]],.025,'#dcc8a4',5,6));
  parts.push(tube([[side*.14,.25,.16],[side*.17,.36,.24]],.021,'#af9175',6,6));
  parts.push(ellipsoid([side*.17,.36,.24],[.032,.025,.033],'#142622',10));
 }
 return merge(parts);
}
