import * as THREE from '/vendor/three/three.module.min.js';

const vertex = `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
void main(){
 vec3 p=position;
 float hanging=max(0.,-p.y);
 float pulse=sin(uTime*1.08);
 p.xz*=1.+.032*pulse*exp(-hanging*.7);
 p.y+=.025*pulse*max(0.,p.y);
 p.x+=sin(uTime*.73-hanging*1.05+p.z*.6)*.052*hanging;
 p.z+=sin(uTime*.59-hanging*.78+p.x*.5)*.035*hanging;
 vec4 world=modelMatrix*vec4(p,1.);
 vWorld=world.xyz;vUv=uv;
 vNormal=normalize(mat3(modelMatrix)*normal);
 gl_Position=projectionMatrix*viewMatrix*world;
}`;

const fragment = `
uniform sampler2D uBackdrop;
uniform sampler2D uWaves;
uniform bool uHasWaves;
uniform vec2 uResolution;
uniform float uKind;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
 vec3 eye=normalize(cameraPosition-vWorld);
 vec3 geometric=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
 vec3 n=normalize(vNormal);
 if(dot(n,eye)<0.)n=-n;
 float facing=max(.001,dot(n,eye)),rim=pow(1.-facing,3.);
 vec3 sun=normalize(vec3(.285,.74,-.625));
 vec3 halfVector=normalize(sun+eye);
 float spec=pow(max(0.,dot(n,halfVector)),uKind<.5?110.:38.);
 float broad=pow(max(0.,dot(n,halfVector)),12.);
 float backlight=pow(max(0.,dot(-eye,sun)),3.);
 float lightField=uHasWaves?clamp(texture2D(uWaves,vWorld.xz/64.+.5).a,.25,2.):1.;
 float illumination=.85+lightField*.15;
 vec3 viewNormal=mat3(viewMatrix)*n;
 vec2 uv=gl_FragCoord.xy/uResolution;
 float shell=1.-step(.5,uKind);
 float bend=(.003+.013*rim)*shell;
 vec3 background=texture2D(uBackdrop,clamp(uv+viewNormal.xy*bend,.002,.998)).rgb;
 float grain=hash(floor(vWorld*160.));
 float freckles=smoothstep(.984,1.,grain)*.035;
 vec3 pearl=mix(vec3(.63,.78,.78),vec3(.91,.80,.59),.34);
 vec3 transmitted=background*vec3(.93,.985,.97);
 vec3 flesh=pearl*(.28+.26*max(0.,dot(n,sun))+.22*backlight);
 vec3 color=mix(transmitted,flesh,shell>.5?.12:.84);
 color+=vec3(.86,.92,.88)*(rim*mix(.20,.65,shell)+spec*mix(.38,1.8,shell)+broad*.10)*illumination;
 color+=vec3(.83,.72,.51)*freckles;
 float alpha=shell>.5?(.22+rim*.57+spec*.18):(.72+rim*.22);
 if(uKind>1.5){color=pearl*(.42+rim*.42+spec*.8);alpha=.36+rim*.32;}
 if(uKind>2.5){color=vec3(.78,.67,.43)*(.43+rim*.30);alpha=.22+rim*.18;}
 float distanceToEye=length(cameraPosition-vWorld);
 float fog=1.-exp(-distanceToEye*.025);
 color=mix(color,background,fog*.45);
 gl_FragColor=vec4(color,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function surface(rows,columns,point){
 const positions=[],uvs=[],indices=[];
 for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
  positions.push(...point(x/columns,y/rows));uvs.push(x/columns,y/rows);
 }
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
  const a=y*(columns+1)+x,b=a+columns+1;
  indices.push(a,b,a+1,b,b+1,a+1);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

// Merge tubes into a single draw call; no line-width dependency at high resolution.
function tubes(paths,sides=5){
 const positions=[],normals=[],uvs=[],indices=[];
 for(const {points,radius} of paths){
  const base=positions.length/3;
  for(let j=0;j<points.length;j++){
   const t=j/(points.length-1),p=points[j];
   const tangent=points[Math.min(j+1,points.length-1)].clone().sub(points[Math.max(j-1,0)]).normalize();
   const axis=Math.abs(tangent.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
   const normal=new THREE.Vector3().crossVectors(tangent,axis).normalize();
   const binormal=new THREE.Vector3().crossVectors(tangent,normal);
   for(let k=0;k<=sides;k++){
    const a=k/sides*Math.PI*2,n=normal.clone().multiplyScalar(Math.cos(a)).addScaledVector(binormal,Math.sin(a));
    const r=typeof radius==='function'?radius(t):radius;
    positions.push(p.x+n.x*r,p.y+n.y*r,p.z+n.z*r);normals.push(n.x,n.y,n.z);uvs.push(k/sides,t);
    if(j<points.length-1&&k<sides){const i=base+j*(sides+1)+k;indices.push(i,i+sides+1,i+1,i+1,i+sides+1,i+sides+2);}
   }
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);return geometry;
}

export function createGelJellyfish(timeUniform,wavesUniform){
 const group=new THREE.Group();
 const shared={uTime:timeUniform,uBackdrop:{value:null},uResolution:{value:new THREE.Vector2(1,1)},uWaves:wavesUniform,uHasWaves:{value:Boolean(wavesUniform.value)}};
 const materials=[];
 function material(kind){const m=new THREE.ShaderMaterial({uniforms:{...shared,uKind:{value:kind}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide,transparent:true,depthWrite:false});materials.push(m);return m;}
 const gel=material(0),flesh=material(1),thread=material(2),canal=material(3);
 function add(geometry,mat,order){const mesh=new THREE.Mesh(geometry,mat);mesh.renderOrder=order;group.add(mesh);return mesh;}
 const bellPoint=(u,v,inset=0)=>{
  const a=u*Math.PI*2,phi=v*Math.PI*.51;
  const r=(1.64-inset)*Math.sin(phi)*(1+.012*Math.cos(a*24)*v**5);
  return [r*Math.cos(a),1.12*Math.cos(phi)-.04*inset+Math.cos(a*24)*.024*v**9,r*Math.sin(a)];
 };
 add(surface(72,256,(u,v)=>bellPoint(u,v)),gel,30);
 const lining=add(surface(48,192,(u,v)=>bellPoint(u,v,.065)),gel,20);lining.scale.y=.93;
 add(surface(18,256,(u,v)=>{
  const a=u*Math.PI*2,r=1.63+v*.10+.025*Math.sin(a*24);
  return [r*Math.cos(a),-.045-v*.16+Math.sin(a*24)*.048*v,r*Math.sin(a)];
 }),gel,31);

 const canals=[];
 for(let i=0;i<24;i++){
  const points=[];
  for(let j=0;j<=54;j++){
   const v=.10+j/54*.87,u=i/24+Math.sin(v*8+i)*.0019;
   points.push(new THREE.Vector3(...bellPoint(u,v,.025)));
  }
  canals.push({points,radius:t=>.005*(.55+.45*t)});
 }
 add(tubes(canals,5),canal,23);

 // Soft internal lobes avoid rigid, perfectly circular rings in close-up.
 for(let i=0;i<4;i++){
  const a=i*Math.PI*.5,mesh=add(new THREE.SphereGeometry(.23,32,20),flesh,12);
  mesh.position.set(Math.cos(a)*.30,.26,Math.sin(a)*.30);
  mesh.scale.set(1,.28,.80);mesh.rotation.y=a;
 }
 // Closed, irregular folded tissue gives oral arms volume from every camera angle.
 for(let i=0;i<6;i++){
  const angle=i/6*Math.PI*2,length=2.45+(i%3)*.19;
  add(surface(200,48,(u,v)=>{
   const a=u*Math.PI*2+v*3.5+i;
   const centerAngle=angle+v*.7;
   const center=.22+v*.24+Math.sin(v*9+i)*.12;
   const taper=Math.sin(Math.PI*(.06+v*.90))**.6;
   const width=(.12+.13*Math.sin(v*Math.PI))*taper;
   const frill=1+.40*Math.sin(v*92+Math.sin(a*3+i)*2)+.21*Math.sin(v*183-a*5);
   const radius=width*frill*(1+.20*Math.cos(a*5+v*23));
   return [Math.cos(centerAngle)*center+Math.cos(a)*radius,
    -.10-v*length+Math.sin(a*4+v*83)*.034*taper,
    Math.sin(centerAngle)*center+Math.sin(a)*radius+Math.sin(v*13+i)*.065];
  }),flesh,15+i*.01);
 }
 const strands=[];
 for(let i=0;i<64;i++){
  const a=(i+.23*Math.sin(i*13.7))/64*Math.PI*2,length=2.3+(Math.sin(i*17.13)+1)*.88,points=[];
  for(let j=0;j<=80;j++){
   const t=j/80,r=1.64-t*.33;
   points.push(new THREE.Vector3(Math.cos(a)*r+(Math.sin(t*8+i)*.18+Math.sin(t*21+i)*.035)*t,-.12-t*length,Math.sin(a)*r+(Math.sin(t*6+i*2)*.21+Math.sin(t*17+i)*.045)*t));
  }
  strands.push({points,radius:t=>.0065*(1-t*.85)});
 }
 add(tubes(strands,5),thread,25);
 return {group,
  setBackdrop(texture,width,height){shared.uBackdrop.value=texture;shared.uResolution.value.set(width,height);},
  dispose(){group.traverse(object=>object.geometry?.dispose());materials.forEach(m=>m.dispose());},
 };
}
