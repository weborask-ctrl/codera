import * as THREE from '/vendor/three/three.module.min.js';
import {paths,armRadius,armTwist,armSection,eyes} from './octopus-anatomy.mjs';
import {oceanFragment} from './ocean-film-shaders.mjs';

// Reuse the approved water's optical functions for reflections on the animal.
// This does not modify the environment shader or render another full scene.
const oceanOptics=(
 oceanFragment.slice(oceanFragment.indexOf('const vec3 SUN'),oceanFragment.indexOf('vec3 curvatureTensor'))+
 oceanFragment.slice(oceanFragment.indexOf('vec3 oceanFill'),oceanFragment.indexOf('float focusing'))+
 oceanFragment.slice(oceanFragment.indexOf('vec3 surfaceRadiance'),oceanFragment.indexOf('void main()'))
).replace(/\btime\b/g,'clock').replace('oceanFill(reflection,depth)','oceanFill(reflection,-world.y)');

const vertex = `
uniform float clock;
uniform vec3 armRoots[8];
attribute vec2 flex;
attribute float occlusion;
varying float ambientOcclusion;
varying vec3 local;
varying vec3 world;
varying vec3 norm;
varying vec2 tex;
vec3 deform(vec3 p,inout vec3 n){
 if(flex.y>.01){
  int arm=int(clamp(floor((flex.y-.3)/.87+.5),0.,7.));
  float w=flex.x*flex.x,lag=flex.x*2.5;
  float az=sin(clock*.49+flex.y*.73-lag)*.075*w;
  float ay=sin(clock*.37+flex.y-lag*.8)*.105*w;
  float cz=cos(az),sz=sin(az),cy=cos(ay),sy=sin(ay);
  mat3 rz=mat3(cz,sz,0.,-sz,cz,0.,0.,0.,1.);
  mat3 ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy);
  mat3 rotation=ry*rz;
  p=armRoots[arm]+rotation*(p-armRoots[arm]);n=rotation*n;
 }else{
  float breath=sin(clock*.70)*.018*smoothstep(.15,.95,p.y);
  float scale=1.+breath;vec3 stretch=vec3(scale,1./(scale*scale),scale),center=vec3(.03,.9,-.35);
  p=center+(p-center)*stretch;n/=stretch;
 }
 p.y+=sin(clock*.43)*.035;
 return p;
}
void main(){
 local=position;tex=uv;ambientOcclusion=occlusion;
 vec3 n=length(normal)>.01?normalize(normal):vec3(0,0,1);
 vec3 p=deform(position,n);n=normalize(n);
 vec4 wp=modelMatrix*vec4(p,1.);
 world=wp.xyz;norm=normalize(mat3(modelMatrix)*n);
 gl_Position=projectionMatrix*viewMatrix*wp;
}`;

const fragment = `
uniform float kind;
uniform bool clayMode;
uniform float clock;
varying float ambientOcclusion;
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
${oceanOptics}
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
vec3 environmentReflection(vec3 direction,float roughness){
 vec3 fill=oceanFill(direction,-world.y);
 if(direction.y<.035||!hasSurfaceLight)return fill;
 float distanceToWater=clamp(-world.y/direction.y,0.,90.);
 vec3 p=world+direction*distanceToWater;
 vec4 wave=texture2D(surfaceLight,p.xz/64.+.5,roughness*5.);
 vec3 waterNormal=normalize(vec3(-wave.y,1.,-wave.z));
 vec3 boundary=surfaceRadiance(p,direction,waterNormal);
 vec3 transmission=exp(-vec3(.10,.025,.019)*distanceToWater);
 return mix(fill,boundary*transmission+fill*(1.-transmission),1.-roughness*.55);
}
vec3 fresnel(float cosine,vec3 f0){return f0+(1.-f0)*pow(1.-clamp(cosine,0.,1.),5.);}
vec3 directBRDF(vec3 n,vec3 v,vec3 l,vec3 albedo,float roughness,vec3 radiance){
 vec3 h=normalize(v+l);float nl=max(dot(n,l),0.),nv=max(dot(n,v),.001),nh=max(dot(n,h),0.),vh=max(dot(v,h),0.);
 float a=roughness*roughness,a2=a*a,d=nh*nh*(a2-1.)+1.;
 float distribution=a2/(3.141593*d*d+.00001),k=(roughness+1.)*(roughness+1.)/8.;
 float geometry=nv/(nv*(1.-k)+k)*nl/(nl*(1.-k)+k);
 vec3 f=fresnel(vh,vec3(kind>1.5?.035:.022));
 vec3 spec=distribution*geometry*f/max(4.*nl*nv,.001);
 return ((1.-f)*albedo/3.141593+spec)*radiance*nl;
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
 vec3 v=normalize(cameraPosition-world),sun=-refract(-normalize(SUN),vec3(0,1,0),1./1.333);
 if(kind>2.5){
  if(clayMode){gl_FragColor=vec4(0.);return;}
  // Separate transparent cornea over the recessed iris. Reflected radiance is
  // supplied by the same animated water as the rest of the study.
  float nv=max(dot(n,v),0.);
  vec3 f=fresnel(nv,vec3(.024));
  vec3 reflected=environmentReflection(reflect(-v,n),.065);
  vec3 specular=directBRDF(n,v,sun,vec3(0.),.10,vec3(4.2,3.8,3.2));
  specular+=directBRDF(n,v,normalize(vec3(-.45,.65,.82)),vec3(0.),.16,vec3(1.6,1.95,2.15));
  vec3 cornea=reflected+specular/max(f.x,.024);
  gl_FragColor=vec4(cornea,clamp(f.x,.024,.85));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  return;
 }
 float footprint=max(length(dFdx(local)),length(dFdy(local)));
 float detail=1.-smoothstep(.003,.014,footprint);
 vec3 skinPoint=local+vec3(noise(local*2.3),noise(local*2.3+17.),noise(local*2.3+41.))*.12;
 float coarse=noise(skinPoint*3.8),cells=mix(.5,noise(skinPoint*28.),1.-smoothstep(.015,.08,footprint)),fine=mix(.5,noise(skinPoint*64.),detail);
 // Anatomical masks stay in object space and travel with the deformation.
 float mantle=smoothstep(.55,1.10,local.y);
 float underside=smoothstep(.25,.95,tex.x)*(1.-smoothstep(-.65,-.20,local.y));
 vec3 eyeDelta=local-vec3(local.x<0.?-.50:.50,local.x<0.?.43:.45,.43);
 float eyeDistance=length(eyeDelta);
 float orbital=(1.-smoothstep(.22,.43,eyeDistance))*smoothstep(.11,.18,eyeDistance);
 float armSkin=(1.-smoothstep(-.15,.30,local.y))*(1.-underside);
 if(kind<.5){
  float papillae=pow(smoothstep(.28,.86,noise(skinPoint*19.)),2.);
  float foldWarp=noise(skinPoint*7.);
  float orbitalFolds=sin(eyeDistance*115.+foldWarp*3.+atan(eyeDelta.y,eyeDelta.x)*2.)*.5+.5;
  float stretchFolds=sin(tex.y*128.+foldWarp*4.)*.5+.5;
  float relief=papillae*(.30+mantle*.32+armSkin*.12)*(1.-underside*.80);
  relief+=cells*.12+fine*.035;
  relief+=orbitalFolds*orbital*.18+stretchFolds*underside*.075;
  vec3 dx=dFdx(world),dy=dFdy(world),a=cross(dy,n),b=cross(n,dx);
  float determinant=dot(dx,a);
  vec3 gradient=sign(determinant)*(dFdx(relief)*a+dFdy(relief)*b);
  n=normalize(abs(determinant)*n-gradient*.007);
 }
 float facing=max(0.,dot(n,v)),visibility=shadow();
 vec2 lightPoint=world.xz-sun.xz*world.y/sun.y;
 float waterLight=hasSurfaceLight?mix(.82,1.30,clamp(texture2D(surfaceLight,lightPoint/64.+.5).a*.45,0.,1.)):1.;
 float diffuse=max(0.,dot(n,sun))*waterLight;
 float wrap=clamp((dot(n,sun)+.5)/1.5,0.,1.);
 vec3 fillDir=normalize(vec3(-.45,.65,.82));
 float fill=max(0.,dot(n,fillDir));
 vec3 pigment=mix(vec3(.25,.071,.052),vec3(.43,.142,.078),smoothstep(.08,.92,coarse));
 float mottles=smoothstep(.56,.75,cells+coarse*.12);
 pigment=mix(pigment,vec3(.56,.29,.16),mottles*.13);
 float pale=smoothstep(.69,.80,fine+coarse*.12);
 pigment=mix(pigment,vec3(.64,.45,.29),pale*.05);
 float spots=smoothstep(.63,.77,noise(skinPoint*115.))*detail;
 pigment*=1.-spots*.14;
 if(kind<.5){
  vec3 mantlePigment=mix(vec3(.22,.048,.047),vec3(.39,.113,.068),smoothstep(.18,.84,coarse));
  pigment=mix(pigment,mantlePigment,mantle*.70);
  vec3 ventralPigment=mix(vec3(.39,.215,.155),vec3(.57,.365,.235),coarse);
  pigment=mix(pigment,ventralPigment,underside*.86);
  pigment=mix(pigment,pigment*vec3(.82,.84,.90),orbital*.32);
  float brokenMarbling=smoothstep(.63,.81,noise(skinPoint*10.)+coarse*.10);
  pigment=mix(pigment,vec3(.55,.32,.19),brokenMarbling*(.075+mantle*.045)*(1.-underside));
 }
 pigment=mix(pigment,vec3(.035,.16,.20),smoothstep(.73,.92,coarse)*.35);
 float roughness=.30+cells*.14+mantle*.07-underside*.10;
 float cavity=1.;
 if(kind>.5&&kind<1.5){
  pigment=mix(vec3(.43,.255,.185),vec3(.69,.49,.34),cells*.55+.20);
  cavity=mix(.10,1.,smoothstep(.10,.80,tex.y));roughness=.27;
 }
 if(kind>1.5){
  vec2 p=tex*2.-1.;float r=length(p),angle=atan(p.y,p.x);
  float fibers=.5+.5*sin(angle*71.+noise(vec3(p*24.,2.))*3.+r*11.);
  float flecks=noise(vec3(p*55.,4.));
  pigment=mix(vec3(.12,.063,.024),vec3(.43,.27,.11),fibers*.32+flecks*.25);
  pigment*=.60+.40*sin(clamp(r,0.,1.)*3.14159);
  // A softened horizontal slit with small organic edge variation.
  float pupil=smoothstep(.96,1.035,length(p/vec2(.77,.28))+(flecks-.5)*.045);
  pigment=mix(vec3(.001,.004,.006),pigment,pupil);
  pigment=mix(pigment,vec3(.025,.018,.01),smoothstep(.84,1.,r));
  // Reflections come from the live water and light; the iris has no painted glint.
  roughness=.44;
 }
 vec3 color=directBRDF(n,v,sun,pigment,roughness,vec3(4.2,3.8,3.2)*waterLight*visibility)*cavity;
 // Three directions approximate a broad reflected-sky source, softening the
 // skin highlight without blurring the surface or the image.
 vec3 skyLight=directBRDF(n,v,fillDir,pigment,clamp(roughness+.22,0.,1.),vec3(1.6,1.95,2.15))*.50;
 skyLight+=directBRDF(n,v,normalize(fillDir+vec3(.22,.08,0)),pigment,clamp(roughness+.22,0.,1.),vec3(1.6,1.95,2.15))*.25;
 skyLight+=directBRDF(n,v,normalize(fillDir-vec3(.22,.08,0)),pigment,clamp(roughness+.22,0.,1.),vec3(1.6,1.95,2.15))*.25;
 color+=skyLight*cavity*ambientOcclusion;
 color+=pigment*(vec3(.045,.065,.082)+oceanFill(n,-world.y)*.3)*cavity*ambientOcclusion;
 vec3 reflection=environmentReflection(reflect(-v,n),roughness);
 color+=reflection*fresnel(facing,vec3(kind>1.5?.045:.028))*(kind>1.5?2.2:1.2)*cavity*ambientOcclusion;
 // Local thickness estimate: broad mantle, tapered arms, thin sucker rims.
 // This is a single-scattering approximation, not a volumetric tissue solver.
 float tissueThickness=mix(.78*pow(1.-clamp(tex.y,0.,1.),1.22)+.018,1.1,mantle);
 if(kind>.5&&kind<1.5)tissueThickness=mix(.10,.025,smoothstep(.65,1.,tex.y));
 if(kind<1.5){
  vec3 penetration=exp(-vec3(4.8,10.,17.)*tissueThickness);
  float backLight=max(dot(-n,sun),0.);
  float forwardScatter=.35+.65*pow(max(dot(v,-sun),0.),3.);
  color+=penetration*vec3(.64,.27,.13)*backLight*forwardScatter*waterLight*mix(.55,1.,ambientOcclusion)*cavity;
  color+=pigment*vec3(.17,.070,.038)*wrap*.48*mix(.35,1.,visibility)*ambientOcclusion;
 }
 // Wavelength-dependent attenuation separates near and far arms in water.
 float waterDistance=length(cameraPosition-world);
 vec3 transmission=exp(-vec3(.026,.012,.008)*waterDistance);
 vec3 waterFill=oceanFill(normalize(world-cameraPosition),-cameraPosition.y);
 color=color*transmission+waterFill*(1.-transmission);
 if(clayMode)color=vec3(.29)*(.18+diffuse*visibility*.9+fill*.55)+vec3(.06)*pow(1.-facing,3.);
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

// Frontal resting pose: mantle above the crown, arms distributed in depth.


export async function createOctopus(time,waves={value:null}){
 const group=new THREE.Group(),geometries=[],materials=[],corneas=[];
 const requestedAngle=Number(new URLSearchParams(location.search).get('angle')||0);
 const reviewAngle=Number.isFinite(requestedAngle)?Math.max(-90,Math.min(90,requestedAngle))*Math.PI/180:0;
 const shadowTarget=new THREE.WebGLRenderTarget(1024,1024,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true});
 const lightCamera=new THREE.OrthographicCamera(-4.5,4.5,4.5,-4.5,.1,24);
 const common={armRoots:{value:paths.map(path=>V(path[0]))},clayMode:{value:new URLSearchParams(location.search).has('clay')},clock:time,surfaceLight:waves,hasSurfaceLight:{value:Boolean(waves.value)},shadowImage:{value:shadowTarget.texture},shadowProjection:{value:new THREE.Matrix4()},shadowPixel:{value:new THREE.Vector2(1/1024,1/1024)},shadowReady:{value:false}};
 const makeMat=kind=>{const m=new THREE.ShaderMaterial({uniforms:{...common,kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide});materials.push(m);return m;};
 const skin=makeMat(0),sucker=makeMat(1),iris=makeMat(2),cornea=makeMat(3);
 cornea.transparent=true;cornea.depthWrite=false;cornea.side=THREE.FrontSide;
 const add=(g,m)=>{if(!g.hasAttribute('occlusion'))g.setAttribute('occlusion',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(1),1));geometries.push(g);const mesh=new THREE.Mesh(g,m);group.add(mesh);return mesh;};
 // Baked continuous body/arm surface; regenerated by scripts/build-octopus-sculpt.mjs.
 const response=await fetch(new URL('./octopus-sculpt.bin',import.meta.url));
 if(!response.ok)throw new Error('Octopus sculpt failed to load: '+response.status);
 const binary=await response.arrayBuffer(),header=new Uint32Array(binary,0,2),count=header[0],indexCount=header[1];
 if(binary.byteLength!==8+count*44+indexCount*4)throw new Error('Invalid octopus sculpt');
 const sculpt=new THREE.BufferGeometry();
 sculpt.setAttribute('position',new THREE.BufferAttribute(new Float32Array(binary,8,count*3),3));
 sculpt.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(binary,8+count*12,count*3),3));
 sculpt.setAttribute('flex',new THREE.BufferAttribute(new Float32Array(binary,8+count*24,count*2),2));
 sculpt.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(binary,8+count*32,count*2),2));
 sculpt.setAttribute('occlusion',new THREE.BufferAttribute(new Float32Array(binary,8+count*40,count),1));
 sculpt.setIndex(new THREE.BufferAttribute(new Uint32Array(binary,8+count*44,indexCount),1));
 add(sculpt,skin);
 const anchorResponse=await fetch(new URL('./octopus-cup-anchors.json',import.meta.url));
 if(!anchorResponse.ok)throw new Error('Octopus cup anchors failed to load');
 const cupAnchors=await anchorResponse.json();
 const curves=paths.map(p=>new THREE.CatmullRomCurve3(p.map(V))),cupParts=[];
 const radius=armRadius;
 for(let i=0;i<8;i++){
  const curve=curves[i],phase=i*.87+.3;
  // Analytic tips preserve a clean silhouette below the baked voxel spacing.
  const tip=meshGrid(96,32,(u,v)=>{
   const t=.62+v*.38,c=curve.getPointAt(t),tangent=curve.getTangentAt(t),front=V([0,-.20,1]);
   front.addScaledVector(tangent,-front.dot(tangent)).normalize();
   const lateral=new THREE.Vector3().crossVectors(tangent,front),twist=armTwist(t,i),a=u*Math.PI*2,section=armSection(curve,t);
   const under=front.clone().multiplyScalar(Math.cos(twist)).addScaledVector(lateral,Math.sin(twist));
   const across=new THREE.Vector3().crossVectors(tangent,under);
   return c.addScaledVector(under,Math.cos(a)*(radius(t,i)*section.depth+.005)).addScaledVector(across,Math.sin(a)*(radius(t,i)*section.width+.005)).toArray();
  });
  for(let j=0;j<tip.attributes.flex.count;j++){
   const u=tip.attributes.uv.getX(j),t=.62+tip.attributes.uv.getY(j)*.38;
   tip.attributes.flex.setXY(j,t,phase);tip.attributes.uv.setXY(j,Math.max(0,(Math.cos(u*Math.PI*2)-.25)/.65),t);
  }
  add(tip,skin);
  // Cups grow from stalks into fleshy rims and recessed closed bowls, with progressive taper.
  for(let k=0,t=.145;k<64&&t<.93;t+=radius(t,i)*.95/curve.getLength(),k++)for(const side of [-1,1]){
   // The frontal web is dorsal tissue: exposed cup rows begin below the crown.
   if(t<(i<2?.26:.20))continue;
   const c=curve.getPointAt(t),tangent=curve.getTangentAt(t),front=V([0,-.20,1]);
   front.addScaledVector(tangent,-front.dot(tangent)).normalize();
   const lateral=new THREE.Vector3().crossVectors(tangent,front).normalize();
   const twist=armTwist(t,i);
   const axis=front.clone().multiplyScalar(Math.cos(side*.48+twist)).addScaledVector(lateral,Math.sin(side*.48+twist)).normalize();
   const x=new THREE.Vector3().crossVectors(tangent,axis).normalize(),y=new THREE.Vector3().crossVectors(axis,x).normalize();
   const r=radius(t,i),size=r*.33*(1+Math.sin(k*2.7+i)*.08),origin=c.clone().addScaledVector(axis,cupAnchors[`${i}:${k}:${side}`]??r*.96);
   // Profile: stalk base -> outer rim -> inward lip -> recessed center.
   const profile=[[.58,-.06],[.66,.13],[.88,.31],[1.,.48],[.98,.60],[.88,.65],[.73,.58],[.57,.40],[.40,.20],[.23,.08],[0,.055]];
   const cup=meshGrid(10,24,(u,v)=>{
    const f=v*10,j=Math.min(9,Math.floor(f)),blend=f-j;
    const rr=profile[j][0]+(profile[j+1][0]-profile[j][0])*blend,h=profile[j][1]+(profile[j+1][1]-profile[j][1])*blend,a=u*Math.PI*2;
    const oval=1+.065*Math.sin(k*1.71+i),lip=1+.035*Math.sin(a*3+k*.8);
    return origin.clone().addScaledVector(x,Math.cos(a)*rr*size*oval*lip).addScaledVector(y,Math.sin(a)*rr*size/oval*lip).addScaledVector(axis,h*size).toArray();
   });
   const f=cup.attributes.flex,uv=cup.attributes.uv;
   for(let n=0;n<f.count;n++){f.setXY(n,t,phase);const p=uv.getY(n)*10,j=Math.min(9,Math.floor(p));uv.setY(n,profile[j][0]+(profile[j+1][0]-profile[j][0])*(p-j));}
   cupParts.push(cup);
  }
 }
 add(merge(cupParts),sucker);
 // Both eyes are visible in the frontal reference; retain lateral placement.
 for(const {side,center,normal} of eyes){
 const eyeCenter=V(center),eyeNormal=V(normal).normalize();
 const eyeX=new THREE.Vector3().crossVectors(V([0,1,0]),eyeNormal).normalize(),eyeY=new THREE.Vector3().crossVectors(eyeNormal,eyeX);
 const eyePoint=(x,y,z)=>eyeCenter.clone().addScaledVector(eyeX,x).addScaledVector(eyeY,y).addScaledVector(eyeNormal,z).toArray();
 const eye=meshGrid(32,72,(u,v)=>{
  const a=u*Math.PI*2,r=v*.155;return eyePoint(Math.cos(a)*r,Math.sin(a)*r*.73,-.010+.020*v*v);
 });
 // Iris coordinates follow the face of the eye, not the body's UV layout.
 for(let j=0;j<=32;j++)for(let k=0;k<=72;k++){const a=k/72*Math.PI*2,r=j/32;eye.attributes.uv.setXY(j*73+k,.5+.5*r*Math.cos(a),.5+.5*r*Math.sin(a));}
 add(eye,iris);
 // Broad skin apron and asymmetric folds replace the uniform circular bezel.
 add(meshGrid(40,112,(u,v)=>{
  const a=u*Math.PI*2,upper=Math.max(0,Math.sin(a)),lower=Math.max(0,-Math.sin(a));
  const r=.151+v*.135,asym=1+side*.035*Math.cos(a);
  const fold=Math.exp(-(((v-.24)/.14)**2))*.019+Math.exp(-(((v-.62)/.13)**2))*.009;
  const wrinkle=Math.sin(a*9+side+v*7)*.003*Math.sin(v*Math.PI);
  const z=.012+fold*(.45+upper)-v*.23+wrinkle;
  const y=Math.sin(a)*r*(.66+.05*lower)*asym-upper*.015*(1-v);
  return eyePoint(Math.cos(a)*r,y,z);
 }),skin);
 const lens=add(meshGrid(40,96,(u,v)=>{
  const a=u*Math.PI*2,r=v*.151;
  return eyePoint(Math.cos(a)*r,Math.sin(a)*r*.60,.013+.053*Math.sqrt(1-v*v));
 }),cornea);
 const lensIndices=lens.geometry.index;
 for(let j=0;j<lensIndices.count;j+=3){const b=lensIndices.getX(j+1);lensIndices.setX(j+1,lensIndices.getX(j+2));lensIndices.setX(j+2,b);}
 lens.geometry.computeVertexNormals();corneas.push(lens);
 lens.renderOrder=2;
 }
 const depthMaterial=new THREE.ShaderMaterial({uniforms:{clock:time,armRoots:common.armRoots},vertexShader:vertex,fragmentShader:'#include <packing>\nvoid main(){gl_FragColor=packDepthToRGBA(gl_FragCoord.z);}',side:THREE.DoubleSide,toneMapped:false});
 let shadowInterval=0,lastShadow=-Infinity;
 const oldClear=new THREE.Color();
 return {group,setBackdrop(){},
  setQuality(eco){const size=eco?512:1024;shadowTarget.setSize(size,size);common.shadowPixel.value.set(1/size,1/size);shadowInterval=eco?1/15:0;common.shadowReady.value=false;lastShadow=-Infinity;},
  update(elapsed){group.rotation.y=reviewAngle+Math.sin(elapsed*.24)*.025;group.rotation.z=-.025+Math.sin(elapsed*.31)*.012;},
  renderShadow(renderer,scene){
   if(common.shadowReady.value&&time.value-lastShadow<shadowInterval)return;
   lastShadow=time.value;
   lightCamera.position.copy(group.position).add(V([4.1,7.3,-5.5]));lightCamera.lookAt(group.position);lightCamera.updateMatrixWorld();
   common.shadowProjection.value.multiplyMatrices(lightCamera.projectionMatrix,lightCamera.matrixWorldInverse);
   const target=renderer.getRenderTarget(),override=scene.overrideMaterial,alpha=renderer.getClearAlpha();renderer.getClearColor(oldClear);
   corneas.forEach(mesh=>{mesh.visible=false;});
   scene.overrideMaterial=depthMaterial;renderer.setClearColor(0xffffff,1);renderer.setRenderTarget(shadowTarget);renderer.clear();renderer.render(scene,lightCamera);
   corneas.forEach(mesh=>{mesh.visible=true;});
   renderer.setRenderTarget(target);renderer.setClearColor(oldClear,alpha);scene.overrideMaterial=override;common.shadowReady.value=true;
  },
  dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());shadowTarget.dispose();depthMaterial.dispose();},
 };
}
