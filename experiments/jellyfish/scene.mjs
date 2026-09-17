import * as THREE from '/vendor/three/three.module.min.js';

const vertex = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec2 vUv;
  void main(){
    vec3 p=position;
    float hanging=max(0.0,-p.y);
    p.x+=sin(uTime*.75+p.y*1.6+p.z*2.0)*.065*hanging;
    p.z+=cos(uTime*.55+p.y*1.4+p.x)*.045*hanging;
    float pulse=sin(uTime*1.05)*.025;
    p.xz*=1.0+pulse*(1.0-smoothstep(.0,3.0,hanging));
    p.y+=pulse*.45;
    vec4 world=modelMatrix*vec4(p,1.0);
    vWorld=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);vUv=uv;
    gl_Position=projectionMatrix*viewMatrix*world;
  }
`;
const fragment = `
  uniform float uWarm;
  uniform float uLace;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec2 vUv;
  void main(){
    vec3 n=normalize(vNormal)*(gl_FrontFacing?1.0:-1.0);
    vec3 view=normalize(cameraPosition-vWorld);
    float rim=pow(1.0-abs(dot(n,view)),2.4);
    vec3 keyDirection=normalize(vec3(-.6,1.0,1.0));
    float key=pow(max(0.0,dot(n,keyDirection)),2.0);
    float sheen=pow(max(0.0,dot(n,normalize(keyDirection+view))),18.0);
    float ribs=pow(.5+.5*cos(vUv.x*6.283185*16.0+sin(vUv.y*11.0)*.25),12.0);
    float veins=pow(.5+.5*cos(vUv.x*6.283185*96.0+sin(vUv.y*27.0)*1.2),36.0);
    veins*=1.0-smoothstep(.002,.014,fwidth(vUv.x));
    float scallop=pow(.5+.5*cos(vUv.y*110.0+sin(vUv.x*100.0)),12.0);
    vec3 pearl=mix(vec3(.80,.87,.86),vec3(.94,.82,.64),.10+uWarm*.45);
    vec3 light=pearl*(.25+rim*1.05+key*.55+ribs*.09+veins*.04)+vec3(.32,.30,.25)*sheen;
    float alpha=.13+rim*.56+key*.09+ribs*.045+veins*.02;
    alpha=mix(alpha,.17+rim*.43+scallop*.12,uLace);
    float depth=length(cameraPosition-vWorld);
    float fog=1.0-exp(-depth*.012);
    light=mix(light,vec3(.04,.085,.09),fog);
    gl_FragColor=vec4(light,alpha);
  }
`;

function surface(rows, columns, fn) {
  const positions = [], uvs = [], indices = [];
  for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
    positions.push(...fn(x / columns, y / rows));
    uvs.push(x / columns, y / rows);
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
    const a = y * (columns + 1) + x, b = a + columns + 1;
    indices.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function makeJelly() {
  const group = new THREE.Group();
  const uniforms = { uTime: { value: 0 }, uWarm: { value: 0.2 }, uLace: { value: 0 } };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const shell = surface(32, 112, (u, v) => {
    const a = u * Math.PI * 2, phi = v * Math.PI * .52;
    const r = 1.68 * Math.sin(phi) * (1 + Math.cos(a * 16) * .018 * v ** 3);
    return [r * Math.cos(a), Math.cos(phi) * 1.08 + Math.sin(a * 32) * .025 * v ** 8, r * Math.sin(a)];
  });
  group.add(new THREE.Mesh(shell, material));
  const lining = new THREE.Mesh(shell, material); lining.scale.set(.975, .94, .975); lining.position.y = -.015; group.add(lining);
  const rim = surface(8, 112, (u, v) => {
    const a = u * Math.PI * 2;
    const r = 1.64 + v * .16 + Math.sin(a * 32) * .025;
    return [Math.cos(a) * r, -.06 - v * .19 + Math.sin(a * 32) * .06 * v, Math.sin(a) * r];
  });
  group.add(new THREE.Mesh(rim, material));
  const laceUniforms = { uTime: uniforms.uTime, uWarm: uniforms.uWarm, uLace: { value: 1 } };
  const lace = new THREE.ShaderMaterial({ uniforms: laceUniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  for (let arm = 0; arm < 7; arm++) {
    const angle = arm / 7 * Math.PI * 2;
    const geometry = surface(88, 10, (u, v) => {
      const a = angle + v * 2.8;
      const width = (.20 + Math.sin(v * Math.PI) * .22) * (1 - v * .75);
      const across = (u - .5) * 2;
      const r = .27 + v * .32 + Math.sin(v * 13 + arm) * .13;
      const fold = Math.sin(v * 60 + u * 6 + arm) * .10 * Math.abs(across) ** .6;
      return [Math.cos(a) * r + Math.cos(a + 1.57) * across * width, -.2 - v * (2.75 + arm % 3 * .26) + fold, Math.sin(a) * r + Math.sin(a + 1.57) * across * width + fold];
    });
    group.add(new THREE.Mesh(geometry, lace));
  }
  const strands = [];
  for (let i = 0; i < 44; i++) {
    const angle = i / 44 * Math.PI * 2;
    const length = 2.4 + (Math.sin(i * 19.13) + 1) * 1.6;
    for (let j = 0; j < 48; j++) {
      const point = (t) => [Math.cos(angle) * (1.65 - t * .45) + Math.sin(t * 8 + i) * .12 * t, -.17 - t * length, Math.sin(angle) * (1.65 - t * .45) + Math.cos(t * 9 + i) * .12 * t];
      strands.push(...point(j / 48), ...point((j + 1) / 48));
    }
  }
  const strandGeo = new THREE.BufferGeometry();
  strandGeo.setAttribute('position', new THREE.Float32BufferAttribute(strands, 3));
  const strandMat = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime }, transparent: true, depthWrite: false,
    vertexShader: `uniform float uTime; varying float vFade; void main(){vec3 p=position;float h=max(0.0,-p.y);p.x+=sin(uTime*.75+p.y*1.6+p.z*2.0)*.065*h;p.z+=cos(uTime*.55+p.y*1.4+p.x)*.045*h;vFade=1.0-smoothstep(2.0,5.7,h);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `varying float vFade;void main(){gl_FragColor=vec4(.66,.78,.75,.26*vFade);}`,
  });
  group.add(new THREE.LineSegments(strandGeo, strandMat));
  return { group, uniforms };
}

export function createWorld(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power', stencil: false, preserveDrawingBuffer: false });
  let disposed = false;
  renderer.setPixelRatio(1);
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const dark = new THREE.Color('#041115'), bright = new THREE.Color('#34535b');
  scene.background = dark.clone();
  scene.fog = new THREE.FogExp2(dark, .017);
  const camera = new THREE.PerspectiveCamera(43, 1, .09, 160);
  const { group, uniforms } = makeJelly();
  scene.add(group);
  scene.add(new THREE.HemisphereLight('#a8d5d8', '#0b1516', 2));
  const key = new THREE.DirectionalLight('#d3c0a3', 2.5); key.position.set(-3, 8, 3); scene.add(key);
  const corridor = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: '#172a2e', roughness: .93, metalness: .12, flatShading: true });
  for (let i = 0; i < 8; i++) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), stone);
    block.position.set((i % 2 === 0 ? -1 : 1) * (3.5 + Math.floor(i / 2) * .35), -1, -12 - Math.floor(i / 2) * 4.3);
    block.scale.set(1.4, 16 + i % 3 * 3, 3.8);
    block.rotation.set(.1, .12 * (i % 2 ? 1 : -1), .13 * (i % 2 ? 1 : -1));
    corridor.add(block);
  }
  scene.add(corridor);
  const dots = [];
  let seed = 9121;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 390; i++) dots.push((random() - .5) * 45, (random() - .5) * 30, -random() * 65 + 10);
  const dotGeo = new THREE.BufferGeometry(); dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
  const particles = new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: '#b4ccca', size: .024, transparent: true, opacity: .34, depthWrite: false, sizeAttenuation: true }));
  scene.add(particles);
  const rayMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec2 vUv;void main(){float x=pow(max(0.0,1.0-abs(vUv.x-.5)*2.0),3.0);float y=sin(vUv.y*3.14159);gl_FragColor=vec4(.18,.32,.33,x*y*.07);}` });
  for (let i = 0; i < 3; i++) {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(4 + i * 2, 32), rayMat);
    ray.position.set(-5 + i * 5, 6, -12 - i * 7); ray.rotation.z = -.24;
    scene.add(ray);
  }
  let quality = 'eco', factor = 1;
  const resize = () => {
    if (disposed) return;
    const width = innerWidth, height = innerHeight;
    const cap = quality === 'balanced' ? 1500000 : 850000;
    const scale = Math.min(1, Math.sqrt(cap / (width * height))) * factor;
    renderer.setSize(Math.floor(width * scale), Math.floor(height * scale), false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  };
  resize();
  const target = new THREE.Vector3();
  const render = (state, time, stage) => {
    if (disposed) return;
    uniforms.uTime.value = time;
    uniforms.uWarm.value = state.light;
    group.position.set(state.jx, state.jy, state.jz);
    group.rotation.set(state.rx, state.ry, state.rz);
    camera.position.set(state.cx, state.cy, state.cz);
    // Preserve the animal on narrow screens while keeping the hero title legible.
    const portrait = innerWidth < 760 ? Math.max(0, 1 - stage / .6, (stage - 7.1) / .9) : 0;
    camera.position.z += 3 * portrait;
    group.position.x -= .8 * portrait;
    group.position.y -= 2.7 * portrait;
    group.scale.setScalar(1 - .12 * portrait);
    target.set(state.tx, state.ty, state.tz); camera.lookAt(target);
    scene.background.copy(dark).lerp(bright, state.light);
    scene.fog.color.copy(scene.background);
    corridor.visible = state.room > .04;
    corridor.scale.x = 1 + (1 - state.room) * 5;
    renderer.render(scene, camera);
  };
  return {
    render, resize, canvas: renderer.domElement,
    setQuality(value) { quality = value; factor = 1; resize(); },
    downgrade() { if (factor > .7) { factor = .65; resize(); return true; } return false; },
    stats() { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, width: renderer.domElement.width, height: renderer.domElement.height }; },
    dispose() {
      if (disposed) return;
      disposed = true;
      const geometries = new Set(), materials = new Set();
      scene.traverse((obj) => {
        if (obj.geometry) geometries.add(obj.geometry);
        if (obj.material) for (const material of Array.isArray(obj.material) ? obj.material : [obj.material]) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
