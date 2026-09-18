import * as THREE from '/vendor/three/three.module.min.js';

const vertex = `
uniform float clock;
attribute vec2 flex;
varying vec3 local;
varying vec3 world;
varying vec3 norm;
varying vec2 tex;
vec3 deform(vec3 p){
 float w=flex.x*flex.x;
 p.x+=sin(clock*.63+flex.y-flex.x*2.7)*.10*w;
 p.y+=sin(clock*.71+flex.y*.77-flex.x*3.1)*.13*w;
 p.z+=sin(clock*.57+flex.y*1.13-flex.x*3.6)*.19*w;
 float breath=sin(clock*.85)*.012*(1.-smoothstep(-.4,.55,p.x));
 p.y+=breath*(p.y-.55);p.z+=breath*p.z;
 p.y+=sin(clock*.43)*.035;
 return p;
}
void main(){
 local=position;tex=uv;
 vec3 baseNormal=length(normal)>.01?normalize(normal):vec3(0,0,1);
 vec3 axis=abs(baseNormal.y)<.85?vec3(0,1,0):vec3(1,0,0);
 vec3 tangent=normalize(cross(axis,baseNormal)),bitangent=cross(baseNormal,tangent);
 vec3 p=deform(position);
 vec3 n=normalize(cross(deform(position+tangent*.006)-p,deform(position+bitangent*.006)-p));
 vec4 wp=modelMatrix*vec4(p,1.);
 world=wp.xyz;norm=normalize(mat3(modelMatrix)*n);
 gl_Position=projectionMatrix*viewMatrix*wp;
}`;

const fragment = `
uniform float kind;
uniform sampler2D surfaceLight;
uniform bool hasSurfaceLight;
uniform sampler2D shadowImage;
uniform mat4 shadowProjection;
uniform vec2 shadowPixel;
uniform bool shadowReady;
varying vec3 local;
varying vec3 world;
varying vec3 norm;
varying vec2 tex;
#include <packing>
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float shadow(){
 if(!shadowReady)return 1.;
 vec4 q=shadowProjection*vec4(world,1.);vec3 p=q.xyz/q.w*.5+.5;
 if(min(p.x,p.y)<.002||max(p.x,p.y)>.998||p.z>1.||p.z<0.)return 1.;
 float light=0.;
 for(int y=0;y<2;y++)for(int x=0;x<2;x++){
  vec2 offset=(vec2(float(x),float(y))-.5)*shadowPixel*1.7;
  float d=unpackRGBAToDepth(texture2D(shadowImage,p.xy+offset));
  light+=step(p.z-.0018,d)*.25;
 }
 return light;
}
void main(){
 vec3 n=normalize(norm);if(!gl_FrontFacing)n=-n;
 vec3 v=normalize(cameraPosition-world),sun=normalize(vec3(.41,.73,-.55));
 float footprint=max(length(dFdx(local)),length(dFdy(local)));
 float detail=1.-smoothstep(.007,.035,footprint);
 vec3 skinPoint=local+vec3(noise(local*2.3),noise(local*2.3+17.),noise(local*2.3+41.))*.12;
 float coarse=noise(skinPoint*3.8),cells=mix(.5,noise(skinPoint*28.),1.-smoothstep(.015,.08,footprint)),fine=mix(.5,noise(skinPoint*64.),detail);
 if(kind<.5){
  float relief=smoothstep(.35,.82,noise(skinPoint*16.))*.48+cells*.36+fine*.16;
  vec3 dx=dFdx(world),dy=dFdy(world),a=cross(dy,n),b=cross(n,dx);
  float determinant=dot(dx,a);
  vec3 gradient=sign(determinant)*(dFdx(relief)*a+dFdy(relief)*b);
  n=normalize(abs(determinant)*n-gradient*.009);
 }
 float facing=max(0.,dot(n,v)),visibility=shadow();
 vec2 lightPoint=world.xz-sun.xz*world.y/sun.y;
 float waterLight=hasSurfaceLight?mix(.82,1.30,clamp(texture2D(surfaceLight,lightPoint/64.+.5).a*.45,0.,1.)):1.;
 float diffuse=max(0.,dot(n,sun))*waterLight;
 float wrap=clamp((dot(n,sun)+.5)/1.5,0.,1.);
 vec3 fillDir=normalize(vec3(-.45,.3,.82));
 float fill=max(0.,dot(n,fillDir));
 vec3 pigment=mix(vec3(.30,.054,.022),vec3(.61,.145,.040),smoothstep(.12,.88,coarse));
 float mottles=smoothstep(.56,.75,cells+coarse*.12);
 pigment=mix(pigment,vec3(.68,.32,.13),mottles*.18);
 float pale=smoothstep(.69,.80,fine+coarse*.12);
 pigment=mix(pigment,vec3(.76,.49,.25),pale*.09);
 pigment=mix(pigment,vec3(.035,.16,.20),smoothstep(.73,.92,coarse)*.35);
 float roughness=.28+cells*.19;
 float cavity=1.;
 if(kind>.5&&kind<1.5){
  pigment=mix(vec3(.42,.17,.10),vec3(.82,.52,.30),cells);
  cavity=mix(.40,1.,smoothstep(.02,.75,tex.y));roughness=.42;
 }
 if(kind>1.5){
  vec2 p=tex*2.-1.;float r=length(p),angle=atan(p.y,p.x);
  float fibers=.5+.5*sin(angle*95.+noise(vec3(p*25.,2.))*3.);
  pigment=mix(vec3(.14,.075,.018),vec3(.77,.49,.14),fibers*.5+.25);
  pigment*=.52+.48*sin(clamp(r,0.,1.)*3.14159);
  float pupil=smoothstep(.92,1.10,length(p/vec2(.80,.18)));
  pigment=mix(vec3(.001,.004,.006),pigment,pupil);
  pigment=mix(pigment,vec3(.025,.018,.01),smoothstep(.84,1.,r));
  float catchlight=exp(-dot((p-vec2(-.30,.40))*vec2(1.,1.8),(p-vec2(-.30,.40))*vec2(1.,1.8))*95.);
  pigment+=vec3(.75,.86,.84)*catchlight*.55;roughness=.13;
 }
 vec3 h=normalize(sun+v);
 float power=mix(180.,30.,roughness);
 float spec=pow(max(0.,dot(n,h)),power);
 float frontSpec=pow(max(0.,dot(n,normalize(fillDir+v))),kind>1.5?140.:80.);
 vec3 color=pigment*(.10+diffuse*1.28*visibility+fill*.58)*cavity;
 color+=pigment*vec3(.20,.075,.025)*wrap*.35*visibility;
 color+=vec3(.025,.075,.095)*(1.-max(0.,n.y))*.48;
 color+=vec3(.95,.88,.70)*spec*.80*visibility;
 color+=vec3(.55,.75,.90)*frontSpec*(kind>1.5?.55:.18);
 color+=vec3(.025,.09,.13)*pow(1.-facing,4.);
 float fog=1.-exp(-length(cameraPosition-world)*.007);
 color=mix(color,vec3(.003,.055,.12),fog);
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function meshGrid(rows,columns,point,phase=0){
 const positions=[],uv=[],flex=[],indices=[];
 for(let j=0;j<=rows;j++)for(let k=0;k<=columns;k++){
  positions.push(...point(k/columns,j/rows));uv.push(k/columns,j/rows);flex.push(phase?j/rows:0,phase);
 }
 for(let j=0;j<rows;j++)for(let k=0;k<columns;k++){
  const a=j*(columns+1)+k,b=a+columns+1;indices.push(a,a+1,b,a+1,b+1,b);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('flex',new THREE.Float32BufferAttribute(flex,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function merge(parts){
 const p=[],n=[],uv=[],flex=[],indices=[];let offset=0;
 for(const g of parts){
  p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);flex.push(...g.attributes.flex.array);
  for(const i of g.index.array)indices.push(offset+i);offset+=g.attributes.position.count;g.dispose();
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('flex',new THREE.Float32BufferAttribute(flex,2));g.setIndex(indices);return g;
}
const V=p=>new THREE.Vector3(...p);
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const papilla=(p)=>Math.max(0,Math.sin(p[0]*23+Math.sin(p[2]*11)*2.1)*Math.sin(p[1]*27+Math.sin(p[0]*13)*1.7)*Math.sin(p[2]*19+Math.sin(p[1]*17)*2.3))**4;

// Hand-authored spatial choreography matching the accepted image, not a radial fan.
const paths=[
 [[.38,-.14,.55],[.02,-.59,1.04],[-.95,-.88,1.50],[-1.73,-1.30,1.36],[-1.67,-1.94,1.02],[-1.12,-2.12,.81],[-.73,-1.85,.82]],
 [[.55,.27,.18],[1.12,.51,.02],[1.85,1.08,-.18],[2.11,1.68,-.36],[1.87,2.02,-.38],[1.46,1.89,-.25],[1.43,1.57,-.10]],
 [[.62,.05,.48],[1.35,-.04,.96],[2.24,-.39,1.02],[2.82,-1.00,.68],[2.71,-1.55,.32],[2.29,-1.67,.23]],
 [[.45,-.40,.40],[.93,-.96,1.00],[1.38,-1.65,1.23],[1.77,-2.16,.98],[2.18,-2.24,.55],[2.44,-1.97,.31]],
 [[.32,-.49,.06],[.20,-1.11,.23],[.42,-1.87,.24],[.55,-2.52,-.04],[.23,-2.86,-.28],[-.12,-2.71,-.27]],
 [[.25,.05,-.24],[-.35,-.32,-.71],[-1.18,-.55,-1.08],[-1.92,-.37,-1.20],[-2.27,.07,-1.02],[-2.12,.39,-.77]],
 [[.26,-.33,-.25],[-.33,-1.02,-.62],[-1.16,-1.62,-.87],[-1.91,-1.82,-1.11],[-2.40,-1.56,-1.32]],
 [[.50,.01,-.28],[1.13,-.19,-.79],[1.95,-.07,-1.27],[2.68,-.39,-1.60],[2.93,-.92,-1.48],[2.70,-1.22,-1.17]],
];

export function createOctopus(time,waves={value:null}){
 const group=new THREE.Group(),geometries=[],materials=[];
 const shadowTarget=new THREE.WebGLRenderTarget(1024,1024,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true});
 const lightCamera=new THREE.OrthographicCamera(-4.5,4.5,4.5,-4.5,.1,24);
 const common={clock:time,surfaceLight:waves,hasSurfaceLight:{value:Boolean(waves.value)},shadowImage:{value:shadowTarget.texture},shadowProjection:{value:new THREE.Matrix4()},shadowPixel:{value:new THREE.Vector2(1/1024,1/1024)},shadowReady:{value:false}};
 const makeMat=kind=>{const m=new THREE.ShaderMaterial({uniforms:{...common,kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide});materials.push(m);return m;};
 const skin=makeMat(0),sucker=makeMat(1),iris=makeMat(2);
 const add=(g,m)=>{geometries.push(g);const mesh=new THREE.Mesh(g,m);group.add(mesh);return mesh;};
 // Continuous mantle-to-head surface. The front contracts into the arm crown.
 const bodyCurve=new THREE.CatmullRomCurve3([V([-1.96,.87,-.40]),V([-1.23,.86,-.30]),V([-.42,.54,-.04]),V([.29,.15,.24]),V([.69,-.05,.24])]);
 const bodyFrames=bodyCurve.computeFrenetFrames(144,false);
 add(meshGrid(144,112,(u,t)=>{
  const j=Math.round(t*144),center=bodyCurve.getPointAt(t),a=u*Math.PI*2;
  const n=bodyFrames.normals[j].clone().multiplyScalar(Math.cos(a)).addScaledVector(bodyFrames.binormals[j],Math.sin(a));
  let r=Math.sin(t*Math.PI)**.48*(1.-.39*smooth(.43,.90,t));
  const p=center.clone().addScaledVector(n,r);r+=papilla(p.toArray())*.010*Math.sin(t*Math.PI);
  return center.addScaledVector(n,r).toArray();
 }),skin);
 // Fleshy crown covers the buried arm roots and the terminal mantle cap.
 add(meshGrid(48,72,(u,t)=>{
  const a=u*Math.PI*2,b=t*Math.PI,s=Math.sin(b);
  return [.37+Math.cos(b)*.49,-.07+s*Math.cos(a)*.51,.12+s*Math.sin(a)*.47];
 }),skin);
 const curves=paths.map(p=>new THREE.CatmullRomCurve3(p.map(V))),cupParts=[];
 const radius=(t,i)=>(i===0?.39:i===1?.30:.32)*(1-t)**1.12+.008;
 for(let i=0;i<8;i++){
  const curve=curves[i],frames=curve.computeFrenetFrames(180,false),phase=i*.87+.3;
  add(meshGrid(180,40,(u,t)=>{
   const j=Math.round(t*180),a=u*Math.PI*2,c=curve.getPointAt(t),n=frames.normals[j].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[j],Math.sin(a));
   const r=radius(t,i),p=c.clone().addScaledVector(n,r);
   return c.addScaledVector(n,r+papilla(p.toArray())*.006*(1-t)).toArray();
  },phase),skin);
  // Cups grow from stalks into fleshy rims and recessed closed bowls, with progressive taper.
  for(let k=0,t=.145;k<64&&t<.93;t+=radius(t,i)*.95/curve.getLength(),k++)for(const side of [-1,1]){
   const c=curve.getPointAt(t),tangent=curve.getTangentAt(t),front=V([0,-.20,1]);
   front.addScaledVector(tangent,-front.dot(tangent)).normalize();
   const lateral=new THREE.Vector3().crossVectors(tangent,front).normalize();
   const twist=[-.45,.65,-.32,.18,-.55,1.5,1.25,1.65][i]+Math.sin(t*3+i*.8)*.22+t*.35;
   const axis=front.clone().multiplyScalar(Math.cos(side*.48+twist)).addScaledVector(lateral,Math.sin(side*.48+twist)).normalize();
   const x=new THREE.Vector3().crossVectors(tangent,axis).normalize(),y=new THREE.Vector3().crossVectors(axis,x).normalize();
   const r=radius(t,i),size=r*.38,origin=c.clone().addScaledVector(axis,r*.91);
   // Profile: stalk base -> outer rim -> inward lip -> recessed center.
   const profile=[[.43,0],[.64,.25],[.97,.48],[1.,.65],[.91,.75],[.70,.68],[.51,.48],[.30,.35],[0,.32]];
   const cup=meshGrid(8,20,(u,v)=>{
    const [rr,h]=profile[Math.round(v*8)],a=u*Math.PI*2;
    return origin.clone().addScaledVector(x,Math.cos(a)*rr*size).addScaledVector(y,Math.sin(a)*rr*size).addScaledVector(axis,h*size).toArray();
   });
   const f=cup.attributes.flex,uv=cup.attributes.uv;
   for(let n=0;n<f.count;n++){f.setXY(n,t,phase);uv.setY(n,1-Math.abs(uv.getY(n)-.55)*1.8);}
   cupParts.push(cup);
  }
 }
 add(merge(cupParts),sucker);
 // Short web surfaces bridge the arm crown; their outer edges follow the adjacent arms.
 const order=[1,2,0,3,4,6,5,7];
 for(let k=0;k<8;k++){
  const left=order[k],right=order[(k+1)%8];
  const web=meshGrid(24,24,(u,v)=>{
   const t=v*(.18-.08*Math.sin(Math.PI*u));
   const a=curves[left].getPointAt(t),b=curves[right].getPointAt(t);
   const p=a.lerp(b,u);p.z+=Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.055;
   return p.toArray();
  });add(web,skin);
 }
 // Recessed near-side eye, warm radial iris and horizontal pupil, integrated skin hood.
 const eyeCenter=V([.27,.53,.68]),eyeNormal=V([.65,.17,1]).normalize();
 const eyeX=new THREE.Vector3().crossVectors(V([0,1,0]),eyeNormal).normalize(),eyeY=new THREE.Vector3().crossVectors(eyeNormal,eyeX);
 const eyePoint=(x,y,z)=>eyeCenter.clone().addScaledVector(eyeX,x).addScaledVector(eyeY,y).addScaledVector(eyeNormal,z).toArray();
 const eye=meshGrid(32,72,(u,v)=>{
  const a=u*Math.PI*2,r=v*.17;return eyePoint(Math.cos(a)*r,Math.sin(a)*r,.060*Math.sqrt(1-v*v));
 });
 // Iris coordinates follow the face of the eye, not the body's UV layout.
 for(let j=0;j<=32;j++)for(let k=0;k<=72;k++){const a=k/72*Math.PI*2,r=j/32;eye.attributes.uv.setXY(j*73+k,.5+.5*r*Math.cos(a),.5+.5*r*Math.sin(a));}
 add(eye,iris);
 add(meshGrid(20,96,(u,v)=>{
  const a=u*Math.PI*2,r=.163+v*.13,z=.025+Math.sin(v*Math.PI)*.075;
  return eyePoint(Math.cos(a)*r,Math.sin(a)*r*(1+.10*Math.sin(a)),z-.16*v+Math.max(0,Math.sin(a))**2*.10);
 }),skin);
 const depthMaterial=new THREE.ShaderMaterial({uniforms:{clock:time},vertexShader:vertex,fragmentShader:'#include <packing>\nvoid main(){gl_FragColor=packDepthToRGBA(gl_FragCoord.z);}',side:THREE.DoubleSide,toneMapped:false});
 const oldClear=new THREE.Color();
 return {group,setBackdrop(){},
  update(elapsed){group.rotation.y=-.48+Math.sin(elapsed*.24)*.035;group.rotation.z=.04+Math.sin(elapsed*.31)*.015;},
  renderShadow(renderer,scene){
   lightCamera.position.copy(group.position).add(V([4.1,7.3,-5.5]));lightCamera.lookAt(group.position);lightCamera.updateMatrixWorld();
   common.shadowProjection.value.multiplyMatrices(lightCamera.projectionMatrix,lightCamera.matrixWorldInverse);
   const target=renderer.getRenderTarget(),override=scene.overrideMaterial,alpha=renderer.getClearAlpha();renderer.getClearColor(oldClear);
   scene.overrideMaterial=depthMaterial;renderer.setClearColor(0xffffff,1);renderer.setRenderTarget(shadowTarget);renderer.clear();renderer.render(scene,lightCamera);
   renderer.setRenderTarget(target);renderer.setClearColor(oldClear,alpha);scene.overrideMaterial=override;common.shadowReady.value=true;
  },
  dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());shadowTarget.dispose();depthMaterial.dispose();},
 };
}
