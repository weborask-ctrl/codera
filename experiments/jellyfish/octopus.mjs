import * as THREE from '/vendor/three/three.module.min.js';
import {paths,armRadius,armTwist,eyes} from './octopus-anatomy.mjs';
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
attribute vec2 flex;
attribute float occlusion;
varying float ambientOcclusion;
varying vec3 local;
varying vec3 world;
varying vec3 norm;
varying vec2 tex;
vec3 deform(vec3 p){
 float w=flex.x*flex.x;
 p.x+=sin(clock*.63+flex.y-flex.x*2.7)*.10*w;
 p.y+=sin(clock*.71+flex.y*.77-flex.x*3.1)*.13*w;
 p.z+=sin(clock*.57+flex.y*1.13-flex.x*3.6)*.19*w;
 float breath=sin(clock*.85)*.012*smoothstep(.0,.9,p.y);
 p.x+=breath*p.x;p.z+=breath*p.z;
 p.y+=sin(clock*.43)*.035;
 return p;
}
void main(){
 local=position;tex=uv;ambientOcclusion=occlusion;
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
 float footprint=max(length(dFdx(local)),length(dFdy(local)));
 float detail=1.-smoothstep(.007,.035,footprint);
 vec3 skinPoint=local+vec3(noise(local*2.3),noise(local*2.3+17.),noise(local*2.3+41.))*.12;
 float coarse=noise(skinPoint*3.8),cells=mix(.5,noise(skinPoint*28.),1.-smoothstep(.015,.08,footprint)),fine=mix(.5,noise(skinPoint*64.),detail);
 if(kind<.5){
  float papillae=pow(smoothstep(.28,.86,noise(skinPoint*19.)),2.);
  float fold=sin(local.y*65.+noise(skinPoint*6.)*5.)*.5+.5;
  float folds=fold*exp(-pow((local.y-.12)*4.,2.))*.08;
  float relief=papillae*.62+cells*.23+fine*.07+folds;
  vec3 dx=dFdx(world),dy=dFdy(world),a=cross(dy,n),b=cross(n,dx);
  float determinant=dot(dx,a);
  vec3 gradient=sign(determinant)*(dFdx(relief)*a+dFdy(relief)*b);
  n=normalize(abs(determinant)*n-gradient*.008);
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
 if(kind<.5)pigment=mix(pigment,vec3(.49,.29,.21),smoothstep(.25,.95,tex.x)*.64);
 pigment=mix(pigment,vec3(.035,.16,.20),smoothstep(.73,.92,coarse)*.35);
 float roughness=.28+cells*.20;
 float cavity=1.;
 if(kind>.5&&kind<1.5){
  pigment=mix(vec3(.36,.18,.13),vec3(.69,.48,.33),cells);
  cavity=mix(.10,1.,smoothstep(.10,.80,tex.y));roughness=.27;
 }
 if(kind>1.5){
  vec2 p=tex*2.-1.;float r=length(p),angle=atan(p.y,p.x);
  float fibers=.5+.5*sin(angle*43.+noise(vec3(p*16.,2.))*2.);
  pigment=mix(vec3(.065,.029,.010),vec3(.31,.15,.036),fibers*.35+.25);
  pigment*=.52+.48*sin(clamp(r,0.,1.)*3.14159);
  float pupil=smoothstep(.94,1.03,length(p/vec2(.83,.32)));
  pigment=mix(vec3(.001,.004,.006),pigment,pupil);
  pigment=mix(pigment,vec3(.025,.018,.01),smoothstep(.84,1.,r));
  // Reflections come from the live water and light; the iris has no painted glint.
  roughness=.105;
 }
 vec3 color=directBRDF(n,v,sun,pigment,roughness,vec3(4.2,3.8,3.2)*waterLight*visibility)*cavity;
 color+=directBRDF(n,v,fillDir,pigment,clamp(roughness+.22,0.,1.),vec3(1.6,1.95,2.15))*cavity*ambientOcclusion;
 color+=pigment*(vec3(.045,.065,.082)+oceanFill(n,-world.y)*.3)*cavity*ambientOcclusion;
 vec3 reflection=environmentReflection(reflect(-v,n),roughness);
 color+=reflection*fresnel(facing,vec3(kind>1.5?.045:.028))*(kind>1.5?2.2:1.2)*cavity*ambientOcclusion;
 // Soft subsurface fill is strongest in thin tissue; it is not emissive.
 color+=pigment*vec3(.20,.068,.030)*wrap*.48*visibility;
 float thin=kind<.5?smoothstep(.35,.9,tex.y):.0;
 color+=pigment*vec3(1.,.23,.09)*pow(max(0.,dot(-sun,v)),3.)*thin*.24;
 float fog=1.-exp(-length(cameraPosition-world)*.013);
 color=mix(color,vec3(.003,.055,.12),fog);
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
 const group=new THREE.Group(),geometries=[],materials=[];
 const requestedAngle=Number(new URLSearchParams(location.search).get('angle')||0);
 const reviewAngle=Number.isFinite(requestedAngle)?Math.max(-90,Math.min(90,requestedAngle))*Math.PI/180:0;
 const shadowTarget=new THREE.WebGLRenderTarget(1024,1024,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true});
 const lightCamera=new THREE.OrthographicCamera(-4.5,4.5,4.5,-4.5,.1,24);
 const common={clayMode:{value:new URLSearchParams(location.search).has('clay')},clock:time,surfaceLight:waves,hasSurfaceLight:{value:Boolean(waves.value)},shadowImage:{value:shadowTarget.texture},shadowProjection:{value:new THREE.Matrix4()},shadowPixel:{value:new THREE.Vector2(1/1024,1/1024)},shadowReady:{value:false}};
 const makeMat=kind=>{const m=new THREE.ShaderMaterial({uniforms:{...common,kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide});materials.push(m);return m;};
 const skin=makeMat(0),sucker=makeMat(1),iris=makeMat(2);
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
   const lateral=new THREE.Vector3().crossVectors(tangent,front),a=u*Math.PI*2+armTwist(t,i);
   return c.addScaledVector(front,Math.cos(a)*(radius(t,i)+.005)).addScaledVector(lateral,Math.sin(a)*(radius(t,i)+.005)).toArray();
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
   const profile=[[.48,0],[.73,.17],[.96,.37],[1.,.52],[.87,.56],[.66,.43],[.44,.19],[.22,.07],[0,.05]];
   const cup=meshGrid(8,20,(u,v)=>{
    const [rr,h]=profile[Math.round(v*8)],a=u*Math.PI*2;
    return origin.clone().addScaledVector(x,Math.cos(a)*rr*size).addScaledVector(y,Math.sin(a)*rr*size).addScaledVector(axis,h*size).toArray();
   });
   const f=cup.attributes.flex,uv=cup.attributes.uv;
   for(let n=0;n<f.count;n++){f.setXY(n,t,phase);uv.setY(n,profile[Math.round(uv.getY(n)*8)][0]);}
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
  const a=u*Math.PI*2,r=v*.155;return eyePoint(Math.cos(a)*r,Math.sin(a)*r*.78,.042*Math.sqrt(1-v*v));
 });
 // Iris coordinates follow the face of the eye, not the body's UV layout.
 for(let j=0;j<=32;j++)for(let k=0;k<=72;k++){const a=k/72*Math.PI*2,r=j/32;eye.attributes.uv.setXY(j*73+k,.5+.5*r*Math.cos(a),.5+.5*r*Math.sin(a));}
 add(eye,iris);
 add(meshGrid(20,96,(u,v)=>{
  const a=u*Math.PI*2,r=.148+v*.09,z=.005+Math.sin(v*Math.PI)*.009;
  return eyePoint(Math.cos(a)*r,Math.sin(a)*r*.80,z-.095*v+Math.max(0,Math.sin(a))**2*.020);
 }),skin);
 }
 const depthMaterial=new THREE.ShaderMaterial({uniforms:{clock:time},vertexShader:vertex,fragmentShader:'#include <packing>\nvoid main(){gl_FragColor=packDepthToRGBA(gl_FragCoord.z);}',side:THREE.DoubleSide,toneMapped:false});
 const oldClear=new THREE.Color();
 return {group,setBackdrop(){},
  update(elapsed){group.rotation.y=reviewAngle+Math.sin(elapsed*.24)*.025;group.rotation.z=-.025+Math.sin(elapsed*.31)*.012;},
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
