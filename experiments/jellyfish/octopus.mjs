import * as THREE from '/vendor/three/three.module.min.js';

// First silhouette/material study: original procedural geometry, no image backdrop assets.
export function createOctopus(time){
 const group=new THREE.Group(),geometries=[],materials=[];
 const vertex=`uniform float clock;varying vec3 local;varying vec3 world;varying vec3 norm;
 void main(){local=position;vec3 p=position;float weight=smoothstep(.65,3.8,length(p.xy));
 p.z+=sin(clock*.72-length(p.xy)*1.3+p.x*.4)*.22*weight;
 p.y+=sin(clock*.61+p.x*.6)*.10*weight;
 vec4 w=modelMatrix*vec4(p,1.);world=w.xyz;norm=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
 const fragment=`uniform float clock;uniform float kind;varying vec3 local;varying vec3 world;varying vec3 norm;
 float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 void main(){vec3 n=normalize(norm),v=normalize(cameraPosition-world),light=normalize(vec3(.41,.73,-.55));
 float spots=noise(local*7.)*.62+noise(local*22.)*.38;
 vec3 pigment=mix(vec3(.24,.022,.045),vec3(.73,.13,.032),smoothstep(.18,.85,spots));
 pigment=mix(pigment,vec3(.025,.32,.33),smoothstep(.68,.9,noise(local*3.4))*.40);
 if(kind>.5)pigment=mix(vec3(.30,.06,.085),vec3(.91,.53,.29),spots);
 float wrapped=clamp((dot(n,light)+.42)/1.42,0.,1.);
 float spec=pow(max(0.,dot(n,normalize(light+v))),58.);
 float rim=pow(1.-max(0.,dot(n,v)),3.);
 vec3 color=pigment*(.27+wrapped*.92)+vec3(.025,.13,.20)*(.5-.5*n.y);
 color+=vec3(.65,.85,1.)*(spec*.34+rim*.13);
 color*=.94+.06*noise(local*115.);
 color=mix(color,vec3(.003,.07,.14),1.-exp(-length(cameraPosition-world)*.014));
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;
 function mat(kind){const m=new THREE.ShaderMaterial({uniforms:{clock:time,kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment});materials.push(m);return m;}
 const skin=mat(0),sucker=mat(1);
 function add(g,m){geometries.push(g);const mesh=new THREE.Mesh(g,m);group.add(mesh);return mesh;}
 function body(radius,scale,position){const g=new THREE.SphereGeometry(radius,72,48);g.scale(...scale);g.translate(...position);return add(g,skin);}
 body(1,[.84,1.25,.77],[0,.97,-.16]);
 body(.7,[1.05,.82,.95],[0,-.02,.16]);
 const cupParts=[];
 for(let i=0;i<8;i++){
  const a=-.18+i/7*(Math.PI+.36),c=Math.cos(a),s=Math.sin(a),length=3.1+(i%3)*.34;
  const points=[new THREE.Vector3(c*.40,-.39,.22),new THREE.Vector3(c*1.0,-.64-s*.55,.38),
   new THREE.Vector3(c*length*.72,-.63-s*length*.70,Math.sin(i*2.1)*.55),
   new THREE.Vector3(c*length,-.48-s*length,Math.cos(i*1.7)*.65),
   new THREE.Vector3(c*(length+.17),-.15-s*length,Math.cos(i*1.7)*.65+.26),
   new THREE.Vector3(c*(length-.18),.02-s*length,Math.cos(i*1.7)*.65+.31)];
  const curve=new THREE.CatmullRomCurve3(points),frames=curve.computeFrenetFrames(120,false);
  const pos=[],normals=[],uv=[],indices=[];
  for(let j=0;j<=120;j++){
   const t=j/120,p=curve.getPointAt(t),r=.32*(1-t)**1.12+.009;
   for(let k=0;k<=24;k++){
    const phi=k/24*Math.PI*2,n=frames.normals[j].clone().multiplyScalar(Math.cos(phi)).addScaledVector(frames.binormals[j],Math.sin(phi));
    pos.push(p.x+n.x*r,p.y+n.y*r,p.z+n.z*r);normals.push(n.x,n.y,n.z);uv.push(k/24,t);
    if(j<120&&k<24){const q=j*25+k;indices.push(q,q+1,q+25,q+1,q+26,q+25);}
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);add(g,skin);
  for(let j=0;j<24;j++)for(const side of [-1,1]){
   const t=.10+j/24*.78,p=curve.getPointAt(t),r=.32*(1-t)**1.12+.009;
   const tangent=curve.getTangentAt(t),front=new THREE.Vector3(0,0,1);front.addScaledVector(tangent,-front.dot(tangent)).normalize();
   const lateral=new THREE.Vector3().crossVectors(tangent,front).normalize();
   const normal=front.clone().multiplyScalar(.88).addScaledVector(lateral,side*.47).normalize();
   const center=p.clone().addScaledVector(normal,r);
   const cup=new THREE.TorusGeometry(r*.35,r*.105,8,14);
   cup.applyMatrix4(new THREE.Matrix4().compose(center,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal),new THREE.Vector3(1,1,1)));
   cupParts.push(cup);
  }
 }
 // Merge all suction rims into one draw call; their vertices share the arm deformation.
 const positions=[],normals=[],indices=[];let offset=0;
 for(const g of cupParts){positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);for(const index of g.index.array)indices.push(offset+index);offset+=g.attributes.position.count;g.dispose();}
 const cups=new THREE.BufferGeometry();cups.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));cups.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));cups.setIndex(indices);add(cups,sucker);
 const iris=new THREE.MeshPhongMaterial({color:0xd9a763,shininess:100}),black=new THREE.MeshPhongMaterial({color:0x03090c,shininess:150});materials.push(iris,black);
 for(const side of [-1,1]){
  body(.20,[1,.90,.82],[side*.56,.10,.57]);
  const eye=add(new THREE.SphereGeometry(.11,32,24),iris);eye.position.set(side*.59,.12,.70);
  const pupil=add(new THREE.SphereGeometry(.084,32,16),black);pupil.scale.set(1,.24,.3);pupil.position.set(side*.59,.12,.817);
 }
 group.add(new THREE.HemisphereLight(0x87d9ff,0x101b35,1.7));const key=new THREE.DirectionalLight(0xffe2b4,2.4);key.position.set(3,5,2);group.add(key);
 return {group,setBackdrop(){},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
