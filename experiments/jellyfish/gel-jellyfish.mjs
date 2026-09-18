import * as THREE from '/vendor/three/three.module.min.js';

const vertex = `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vLocal;
void main(){
 vec3 p=position;
 float hanging=max(0.,-p.y);
 float phase=uTime*1.08;
 float pulse=sin(phase)+.22*sin(phase*2.-.7);
 p.xz*=1.+.045*pulse*exp(-hanging*.7);
 p.y+=.055*pulse*max(0.,p.y);
 p.y+=.055*sin(phase-.65);
 p.x+=sin(uTime*.73-hanging*1.05+p.z*.6)*.052*hanging;
 p.z+=sin(uTime*.59-hanging*.78+p.x*.5)*.035*hanging;
 vec4 world=modelMatrix*vec4(p,1.);
 vWorld=world.xyz;vUv=uv;vLocal=position;
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
varying vec3 vLocal;
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
 vec3 eye=normalize(cameraPosition-vWorld);
 vec3 n=normalize(vNormal);
 if(dot(n,eye)<0.)n=-n;
 float facing=max(.001,dot(n,eye));
 float rim=pow(1.-facing,3.);
 float shell=1.-step(.5,uKind);
 vec3 sun=normalize(vec3(.285,.726,-.625));
 vec3 halfVector=normalize(sun+eye);
 float spec=pow(max(0.,dot(n,halfVector)),mix(24.,150.,shell));
 float wrapped=clamp((dot(n,sun)+.65)/1.65,0.,1.);
 float tissue=.5;
 if(uKind>.5&&uKind<1.5)tissue=noise(vLocal*5.3)*.65+noise(vLocal*17.7)*.35;
 float thickness=mix(.18,.68,tissue);
 float backlight=pow(max(0.,dot(-eye,sun)),2.)*exp(-thickness*1.5);
 float lightField=uHasWaves?clamp(texture2D(uWaves,vWorld.xz/64.+.5).a,.3,2.):1.;
 float illumination=.80+lightField*.20;
 vec3 viewNormal=mat3(viewMatrix)*n;
 vec2 uv=gl_FragCoord.xy/uResolution;
 float bend=(.002+.009*rim)*shell;
 vec3 background=texture2D(uBackdrop,clamp(uv+viewNormal.xy*bend,.002,.998)).rgb;
 // Warm transmitted tissue against cool water; thickness controls attenuation.
 vec3 pearl=mix(vec3(.66,.48,.29),vec3(.91,.84,.64),tissue);
 vec3 transmitted=background*exp(-vec3(.24,.12,.055)*thickness);
 vec3 flesh=pearl*(.19+.46*wrapped)*illumination;
 flesh+=vec3(.66,.48,.24)*backlight*.32;

 vec3 color=mix(transmitted,flesh,shell>.5?.09:.88);
 color+=vec3(.85,.93,1.)*rim*mix(.055,.30,shell);
 color+=vec3(1.,.92,.72)*spec*mix(.10,1.6,shell)*illumination;
 float alpha=shell>.5?(.14+rim*.51+spec*.15):(.83+thickness*.12);
 if(uKind>.5&&uKind<.9)alpha=.54+thickness*.20;
 if(shell>.5){
  float micro=noise(vLocal*65.);
  float angle=atan(vLocal.z,vLocal.x);
  float radial=pow(.5+.5*cos(angle*24.+sin(vLocal.y*7.)*.24),32.);
  radial*=smoothstep(.25,1.3,length(vLocal.xz));
  color+=vec3(.48,.34,.14)*radial*.035;
  color+=vec3(.36,.49,.44)*(micro-.5)*.018;
 }
 if(uKind>1.5){color=mix(vec3(.47,.62,.61),vec3(.86,.74,.48),wrapped)*(.40+rim*.22);alpha=.28+rim*.32;}
 if(uKind>2.5){color=vec3(.56,.49,.32)*(.38+wrapped*.28);alpha=.19+rim*.12;}
 float fog=1.-exp(-length(cameraPosition-vWorld)*.025);
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
 const gel=material(0),flesh=material(1),membrane=material(.75),thread=material(2),canal=material(3);
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
  canals.push({points,radius:t=>.0035*(.55+.45*t)});
  for(const side of [-1,1]){
   const branch=[];
   for(let j=0;j<=32;j++){
    const t=j/32,v=.46+t*.49;
    const u=i/24+side*.014*t+Math.sin(v*12+i)*.0013*t;
    branch.push(new THREE.Vector3(...bellPoint(u,v,.028)));
   }
   canals.push({points:branch,radius:t=>.0022*(1-t*.5)});
  }
 }
 add(tubes(canals,5),canal,23);

 // Irregular horseshoe-shaped folds suspended inside the bell.
 const lobes=[];
 for(let i=0;i<4;i++){
  const points=[],a=i*Math.PI*.5;
  for(let j=0;j<=70;j++){
   const t=j/70,phi=.25+t*Math.PI*1.65;
   const radius=.16+.018*Math.sin(phi*3+i);
   points.push(new THREE.Vector3(Math.cos(a)*.29+Math.cos(phi)*radius,.12+Math.sin(phi*2+i)*.025,Math.sin(a)*.29+Math.sin(phi)*radius*.78));
  }
  lobes.push({points,radius:t=>.014+.014*Math.sin(t*Math.PI)**.5});
 }
 add(tubes(lobes,10),membrane,12);
 const stalk=add(new THREE.SphereGeometry(.24,40,28),membrane,13);stalk.position.y=-.05;stalk.scale.set(1,.80,1);
 // Four flowing oral arms: broad folds at independent phases, fine folded margins.
 // Low frequency envelope breaks the old repeated stacked-ring silhouette.
 for(let i=0;i<4;i++){
  const angle=i/4*Math.PI*2,length=2.70+Math.sin(i*3.1)*.32;
  add(surface(240,64,(u,v)=>{
   const a=u*Math.PI*2+v*2.1+i*.71;
   const centerAngle=angle+v*.48;
   const center=.15+v*.40+Math.sin(v*6+i)*.10;
   const taper=(1-v)**.6*Math.min(1,v*9+.25);
   const width=(.12+.08*Math.sin(v*5+i*.8))*taper;
   const phase=v*49+Math.sin(v*13+i)*2.3;
   const lobed=1+.32*Math.sin(a*3+v*8)+.16*Math.sin(a*5-v*11+i);
   const margin=(.5+.5*Math.sin(a*3+v*8))**3;
   const frill=1+margin*(.28*Math.sin(phase+a*2)+.11*Math.sin(v*113+a*5+i));
   const radius=width*lobed*frill;
   return [Math.cos(centerAngle)*center+Math.cos(a)*radius+v*v*.22,
    -.13-v*length+Math.sin(a*3+phase)*.019*taper,
    Math.sin(centerAngle)*center+Math.sin(a)*radius+Math.sin(v*8+i)*.08];
  }),flesh,15+i*.01);
  // Thin, folded membranes spread from each arm, with independently curled edges.
  for(let fin=0;fin<3;fin++){
   add(surface(210,16,(u,v)=>{
    const centerAngle=angle+v*.48;
    const center=.15+v*.40+Math.sin(v*6+i)*.10;
    const taper=(1-v)**.6*Math.min(1,v*9+.25);
    const a=fin*Math.PI*2/3+i*.71+v*2.1;
    const edge=.11+u*(.13+.045*Math.sin(v*21+i+fin));
    const r=edge*taper;
    const flutter=(Math.sin(v*79+Math.sin(v*15+fin)*2+i)*.039+Math.sin(v*149-fin)*.015)*u*u*taper;
    return [Math.cos(centerAngle)*center+Math.cos(a)*r+Math.sin(a)*flutter+v*v*.22,
     -.13-v*length+flutter,
     Math.sin(centerAngle)*center+Math.sin(a)*r+Math.cos(a)*flutter+Math.sin(v*8+i)*.08];
   }),membrane,16+i*.01+fin*.001);
  }
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
