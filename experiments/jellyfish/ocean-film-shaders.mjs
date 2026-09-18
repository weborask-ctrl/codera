// World-space waves and a refracted underwater light field. No photographic textures.
export const oceanFragment = `
precision highp float;
uniform vec2 resolution;
uniform float waveFootprint;
uniform bool refineSurface;
uniform vec3 cameraOffset;
uniform float time;
uniform float depth;
uniform float travel;
uniform vec2 pointer;
uniform sampler2D waveMap;
uniform bool useWaveMap;
uniform int renderMode;
uniform sampler2D volumeMap;
varying vec2 vUv;
const vec3 SUN=vec3(.55,.40,-.733);
const vec2 LIGHT_CENTER=vec2(4.5,-5.);
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
}
vec3 curvatureTensor;
// Height and exact first/second derivatives of bent, non-repeating wave trains.
vec4 spectrum(vec2 p,int bands,float footprint){
 curvatureTensor=vec3(0.);
 vec4 result=vec4(0.);float frequency=1.65,amplitude=.080;
 for(int i=0;i<22;i++){
  if(i>=bands)break;
  float fi=float(i),angle=fi*2.399963+.41*sin(fi*1.71);
  vec2 direction=vec2(cos(angle),sin(angle)),across=vec2(-direction.y,direction.x);
  vec2 waveVector=floor(direction*frequency/(6.283185/64.)+.5)*(6.283185/64.);
  vec2 bendVector=floor(across*.29/(6.283185/64.)+.5)*(6.283185/64.);
  float bend=dot(p,bendVector)+fi*2.17-time*.10;
  float phase=dot(p,waveVector)+1.6*sin(bend)-time*sqrt(9.81*frequency)*.34+fi*7.13;
  vec2 gradient=waveVector+bendVector*(1.6*cos(bend));
  float weight=1.-smoothstep(.35,2.3,frequency*footprint);
  float a=amplitude*weight;
  // A weak harmonic gives asymmetric crests, avoiding perfectly sinusoidal ripples.
  float h=sin(phase)+.16*sin(2.*phase);
  float dh=cos(phase)+.32*cos(2.*phase);
  float ddh=-sin(phase)-.64*sin(2.*phase);
  result.x+=a*h;
  result.yz+=a*dh*gradient;
  result.w+=a*(ddh*dot(gradient,gradient)-dh*1.6*dot(bendVector,bendVector)*sin(bend));
  curvatureTensor+=a*(ddh*vec3(gradient.x*gradient.x,gradient.x*gradient.y,gradient.y*gradient.y)-dh*1.6*sin(bend)*vec3(bendVector.x*bendVector.x,bendVector.x*bendVector.y,bendVector.y*bendVector.y));
  frequency*=1.365;amplitude*=i<10?.735:.64;
 }
 return result;
}
float height(vec2 p){return useWaveMap?texture2D(waveMap,p/64.+.5).x:spectrum(p,8,0.).x;}
vec3 normalAt(vec2 p){
 float pixel=max(length(dFdx(p)),length(dFdy(p)));
 vec4 w=useWaveMap?texture2D(waveMap,p/64.+.5):spectrum(p,22,pixel);
 if(useWaveMap){
  // Additional capillary scales retain near-camera detail without rerunning the spectrum per pixel.
  vec2 capillary=texture2D(waveMap,p*5.73/64.+vec2(.17,-.31)).yz;
  vec2 micro=texture2D(waveMap,p*17.31/64.+vec2(-.23,.41)).yz;
  // Keep small ripples lively nearby, but fade unresolved detail in the distance.
  float resolved=1.-smoothstep(.025,.22,pixel);
  w.yz+=capillary*.76+micro*.36*resolved;
 }
 return normalize(vec3(-w.y,1.,-w.z));
}
vec3 oceanFill(vec3 direction,float cameraDepth){
 float altitude=smoothstep(-.55,.65,direction.y);
 vec3 c=mix(vec3(.0006,.008,.045),vec3(.0015,.095,.22),altitude);
 c*=.70+.45*smoothstep(-.6,.8,direction.x);
 return c*exp(-max(0.,cameraDepth-3.)*.028);
}
float focusing(vec3 p){
 // Refracted mean sun direction. Curvature changes focusing of that same moving surface.
 vec3 wetSun=-refract(-normalize(SUN),vec3(0.,1.,0.),1./1.333);
 vec2 q=p.xz-wetSun.xz*p.y/wetSun.y;
 vec4 wave=useWaveMap?texture2D(waveMap,q/64.+.5):spectrum(q,5,.25);
 float squeeze=1.+wave.w*1.5;
 float focus=useWaveMap?wave.w:1./sqrt(.10+squeeze*squeeze);
 float key=exp(-dot(q-LIGHT_CENTER,q-LIGHT_CENTER)*.019);
 // Broad wave packets break up the light source; the pattern is world-locked.
 float packet=pow(noise(q*1.35+wave.yz*.4),2.)*2.4+.08;
 packet*=.20+1.35*pow(noise(q*1.7),2.);
 return focus*key*packet*exp(p.y*.027);
}
vec3 surfaceRadiance(vec3 p,vec3 rd,vec3 n){
  float cosine=clamp(dot(rd,n),.0001,1.);
  float critical=1.-1.333*1.333*(1.-cosine*cosine);
  vec3 air=refract(rd,-n,1.333),reflection=reflect(rd,-n);
  float ct=sqrt(max(0.,critical));
  float rs=(1.333*cosine-ct)/(1.333*cosine+ct);
  float rp=(cosine-1.333*ct)/(cosine+1.333*ct);
  float fresnel=critical>0.?clamp(.5*(rs*rs+rp*rp),0.,1.):1.;
  float solar=max(0.,dot(air,normalize(SUN)));
  vec3 sky=mix(vec3(.008,.045,.10),vec3(.045,.16,.27),sqrt(max(0.,air.y)));
  float cloud=noise(air.xz*7.+vec2(time*.008,0.));
  sky*=.74+.30*cloud;
  sky+=vec3(1.,.91,.73)*(pow(solar,65.)*.85+pow(solar,1400.)*25.);
  // The underside reflects dark water, not a uniform light turquoise sheet.
  vec3 reflected=oceanFill(reflection,depth)*.65;
  float lightDistance=length(p.xz-LIGHT_CENTER);
  float alignment=max(0.,dot(n,normalize(normalize(SUN)-rd)));
  float grazing=pow(alignment,65.)*2.3+pow(alignment,14.)*.22;
  reflected+=vec3(.03,.36,.48)*grazing*2.4*exp(-lightDistance*.025);
  vec3 boundary=mix(sky,reflected,fresnel);
  // Light transmitted across wave folds supplies cyan highlights below the critical angle.
  float fold=pow(clamp(dot(n,normalize(SUN)),0.,1.),7.);
  boundary+=vec3(.005,.14,.22)*fold*exp(-lightDistance*.025);
  return boundary;
}
void main(){
 vec2 uv=vUv*2.-1.;uv.x*=resolution.x/resolution.y;
 vec3 ro=vec3(travel*1.4,-depth+sin(time*.23)*.055,travel*5.)+cameraOffset;
 vec3 forward=normalize(vec3(pointer.x*.12,.08+pointer.y*.08,-1.));
 vec3 right=normalize(cross(forward,vec3(0.,1.,0.))),up=cross(right,forward);
 vec3 rd=normalize(forward+right*uv.x*.80+up*uv.y*.80);
 float distanceToSurface=160.;
 if(rd.y>.012){
  distanceToSurface=-ro.y/rd.y;
  for(int i=0;i<7;i++){
   vec3 p=ro+rd*distanceToSurface;
   distanceToSurface=mix(distanceToSurface,(height(p.xz)-ro.y)/rd.y,.62);
  }
  distanceToSurface=clamp(distanceToSurface,0.,160.);
 }
 vec3 fill=oceanFill(rd,depth),color=fill;
 if(distanceToSurface<150. && renderMode!=2){
  vec3 p=ro+rd*distanceToSurface,n=normalAt(p.xz);
  // Two nearby optical samples soften unresolved critical-angle edges without blurring geometry.
  vec2 footprint=dFdx(p.xz)*.31+dFdy(p.xz)*.19+vec2(.026,.019);
  vec3 boundary=surfaceRadiance(p,rd,n);
  if(refineSurface)boundary=boundary*.6+surfaceRadiance(p,rd,normalAt(p.xz+footprint))*.4;
  vec3 transmission=exp(-vec3(.10,.025,.019)*distanceToSurface);
  color=boundary*transmission+fill*(1.-transmission);
  color=mix(fill,color,exp(-distanceToSurface*.014)*(1.-smoothstep(95.,150.,distanceToSurface)));
 }
 if(renderMode==1){
  vec2 texel=1.5/vec2(textureSize(volumeMap,0));
  color+=texture2D(volumeMap,vUv).rgb*.40;
  color+=(texture2D(volumeMap,vUv+vec2(texel.x,0)).rgb+texture2D(volumeMap,vUv-vec2(texel.x,0)).rgb+texture2D(volumeMap,vUv+vec2(0,texel.y)).rgb+texture2D(volumeMap,vUv-vec2(0,texel.y)).rgb)*.15;
 }else{
 if(renderMode==2)color=vec3(0.);
 // Midpoint integration of a continuous light volume; avoids structured jitter artifacts.
 float limit=min(distanceToSurface,60.),light=0.;
 for(int i=0;i<48;i++){
  float t=(float(i)+.5)/48.*limit;
  light+=focusing(ro+rd*t)*exp(-t*.045)*limit/48.;
 }
 vec3 source=-refract(-normalize(SUN),vec3(0.,1.,0.),1./1.333);
 float forwardScatter=pow(max(0.,dot(rd,source)),9.);
 color+=vec3(.035,.29,.49)*light*(.085+.24*forwardScatter);
 // Smooth forward scattering around the source; stays in world space during camera travel.
 color+=vec3(.30,.82,.86)*pow(max(0.,dot(rd,source)),20.)*exp(-depth*.04);
 if(renderMode==2){gl_FragColor=vec4(color,1.);return;}
 }
 color*=1.-.12*dot(vUv-.5,vUv-.5);
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export const waveMapFragment = oceanFragment.slice(0,oceanFragment.indexOf('float height(')) + `
void main(){
 vec2 p=(vUv-.5)*64.;
 vec4 fine=spectrum(p,22,waveFootprint);
 vec4 coarse=spectrum(p,7,.25);
 // Thin-lens approximation of the refracted ray-density Jacobian at a nominal focal depth.
 float jacobian=1.+.8*coarse.w+.64*(curvatureTensor.x*curvatureTensor.z-curvatureTensor.y*curvatureTensor.y);
 float focus=min(5.,.6/sqrt(.028+jacobian*jacobian));
 gl_FragColor=vec4(fine.xyz,focus);
}`;
