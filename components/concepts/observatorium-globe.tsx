"use client"

/**
 * The Observatórium journey — a REAL WebGL flight to Saturn (Ukážka
 * Animácie & 3D, Iterácia 1.1; Ondrej's brief 2026-09-04: full 5D, zoom
 * in and out, transitions through space, a living planet surface, vivid
 * saturated colour; the Higgsfield "camera dives into the ring" video as
 * the guide. Iterácia 1.1 fixes: the sky is layered and sharp with real
 * parallax, the rocks are rock, the surface never stands still).
 *
 * One scene, one camera on a spline: wide hero → dive toward the rings →
 * the ring resolves into boulders as you enter it → flight inside the
 * band → emerge over a planet whose storms move → pull back to rest
 * under the programme. The site's ScrollTrigger writes progress into
 * `journeyState`; the frame loop damps toward it, so scroll stays native
 * and every input interruptible. Textures generated in Higgsfield
 * (Nano Banana Pro) for this concept; reduced motion holds the hero frame.
 */

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"

/** Scroll progress (0..1 over the journey) + pointer (-0.5..0.5). */
export const journeyState = { p: 0, px: 0, py: 0 }

const IMG = "/demos/observatorium"
const R0 = 1.32
const R1 = 2.42
const PATH_R = 1.92
const SUN_DIR = new THREE.Vector3(-4, 1.4, 3.2).normalize()

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
/* camera positions and look targets, in the tilted planet's own space */
const POS = new THREE.CatmullRomCurve3(
  [V(0, 1.05, 6.6), V(1.6, 0.55, 4.6), V(2.75, 0.16, 2.1), V(2.05, 0.02, 0.35), V(1.05, 0, -1.65), V(-0.55, 0.02, -1.9), V(-1.65, 0.55, -1.05), V(-1.62, 0.28, 0.25), V(-1.35, 1.35, 3.2), V(0.25, 1.0, 6.9)],
  false,
  "centripetal",
  0.35
)
const TGT = new THREE.CatmullRomCurve3(
  [V(0, 0, 0), V(0.6, 0, 0.6), V(1.4, 0, -1.2), V(1.3, 0, -1.4), V(-0.4, 0, -1.95), V(-1.6, 0.05, -1.05), V(-0.3, 0.15, 0.1), V(-0.2, 0.05, 0.1), V(0, 0.05, 0), V(0, 0.15, 0)],
  false,
  "centripetal",
  0.35
)
const FOV = [36, 38, 44, 52, 56, 54, 46, 40, 38, 36]

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const prm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/* ------------------------------------------------ noise, on the CPU --- */

/** Compact 3D simplex noise (Gustavson), for shaping the rocks. */
const GRAD = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
]
const PERM = (() => {
  const p = new Uint8Array(512)
  const base = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    base[i] = i
  }
  let seed = 1337
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1)
    const t = base[i]
    base[i] = base[j]
    base[j] = t
  }
  for (let i = 0; i < 512; i++) {
    p[i] = base[i & 255]
  }
  return p
})()
function snoise3(x: number, y: number, z: number) {
  const F3 = 1 / 3
  const G3 = 1 / 6
  const s = (x + y + z) * F3
  const i = Math.floor(x + s)
  const j = Math.floor(y + s)
  const k = Math.floor(z + s)
  const t = (i + j + k) * G3
  const x0 = x - (i - t)
  const y0 = y - (j - t)
  const z0 = z - (k - t)
  let i1: number
  let j1: number
  let k1: number
  let i2: number
  let j2: number
  let k2: number
  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0 } else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1 } else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1 }
  } else if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1 } else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1 } else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
  const x1 = x0 - i1 + G3
  const y1 = y0 - j1 + G3
  const z1 = z0 - k1 + G3
  const x2 = x0 - i2 + 2 * G3
  const y2 = y0 - j2 + 2 * G3
  const z2 = z0 - k2 + 2 * G3
  const x3 = x0 - 1 + 3 * G3
  const y3 = y0 - 1 + 3 * G3
  const z3 = z0 - 1 + 3 * G3
  const ii = i & 255
  const jj = j & 255
  const kk = k & 255
  const corner = (gx: number, gy: number, gz: number, gi: number) => {
    let tt = 0.6 - gx * gx - gy * gy - gz * gz
    if (tt < 0) {
      return 0
    }
    const g = GRAD[gi % 12]
    tt *= tt
    return tt * tt * (g[0] * gx + g[1] * gy + g[2] * gz)
  }
  const n0 = corner(x0, y0, z0, PERM[ii + PERM[jj + PERM[kk]]])
  const n1 = corner(x1, y1, z1, PERM[ii + i1 + PERM[jj + j1 + PERM[kk + k1]]])
  const n2 = corner(x2, y2, z2, PERM[ii + i2 + PERM[jj + j2 + PERM[kk + k2]]])
  const n3 = corner(x3, y3, z3, PERM[ii + 1 + PERM[jj + 1 + PERM[kk + 1]]])
  return 32 * (n0 + n1 + n2 + n3)
}
function fbm3(x: number, y: number, z: number, oct: number) {
  let f = 0
  let a = 0.5
  let s = 1
  for (let o = 0; o < oct; o++) {
    f += a * snoise3(x * s, y * s, z * s)
    s *= 2.05
    a *= 0.5
  }
  return f
}

/* ---------------------------------------------------------- shaders --- */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float f=0.0,a=0.5;for(int i=0;i<3;i++){f+=a*snoise(p);p*=2.02;a*=0.5;}return f;}`

const SURFACE_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vNo; varying vec3 vW;
void main(){ vUv=uv; vNo=normal; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`

/* The living surface: zonal jets shear the bands at different speeds, three
   storms rotate, a flow map keeps the clouds drifting forever without ever
   stretching, fine grain and band relief give the definition. */
const PLANET_FRAG = /* glsl */ `
uniform sampler2D uMap; uniform float uTime; uniform vec3 uSun; uniform mat3 uModel;
varying vec2 vUv; varying vec3 vN; varying vec3 vNo; varying vec3 vW; ${NOISE}
vec2 vortex(vec2 uv, vec2 c, float r, float w){
  vec2 d = (uv - c) * vec2(1.0, 2.0);
  float f = smoothstep(r, 0.0, length(d));
  float a = f * f * w;
  float s = sin(a), co = cos(a);
  d = vec2(d.x*co - d.y*s, d.x*s + d.y*co);
  return c + d * vec2(1.0, 0.5);
}
vec2 baseUv(vec2 uv, float t){
  /* alternating jets by latitude */
  float jet = sin(uv.y * 3.14159 * 9.0) * 0.5;
  uv.x += jet * 0.004 * t;
  /* the storms turn */
  uv = vortex(uv, vec2(0.50, 0.09), 0.13, 0.55 * t);
  uv = vortex(uv, vec2(0.42, 0.66), 0.07, -0.9 * t);
  uv = vortex(uv, vec2(0.80, 0.31), 0.06, 0.8 * t);
  return uv;
}
vec3 sampleMap(vec2 uv){ return texture2D(uMap, vec2(fract(uv.x), clamp(uv.y, 0.0, 1.0))).rgb; }
void main(){
  /* flow-map double phase: two drifts a half cycle apart, cross-faded, so the motion never snaps */
  float T = 14.0;
  float p1 = fract(uTime / T), p2 = fract(uTime / T + 0.5);
  float w = abs(2.0 * p1 - 1.0);
  float t = uTime * 0.35;
  vec2 uv0 = baseUv(vUv, t);
  /* one turbulent flow field, sampled once, carried by both phases */
  vec3 q = vec3(uv0 * vec2(9.0, 5.0), uTime * 0.02);
  vec2 F = vec2(fbm(q), fbm(q + vec3(3.7, 8.1, 0.0))) * 0.022;
  vec3 col = mix(sampleMap(uv0 + F * (p1 - 0.5)), sampleMap(uv0 + F * (p2 - 0.5)), w);
  /* fine cloud grain, always moving */
  col *= 0.88 + 0.24 * (0.5 + 0.5 * snoise(vec3(vUv * vec2(160.0, 80.0), uTime * 0.03)));
  float l = dot(col, vec3(0.299,0.587,0.114)); col = mix(vec3(l), col, 1.0);
  /* band relief from the on-screen luminance slope (cheap, and it moves with the clouds) */
  mat3 Mv = mat3(viewMatrix);
  vec3 Nv = normalize(Mv * normalize(vN));
  Nv.xy -= vec2(dFdx(l), dFdy(l)) * 3.5;
  vec3 N = normalize(transpose(Mv) * normalize(Nv));
  vec3 Vv = normalize(cameraPosition - vW);
  float diff = clamp(dot(N, uSun)*0.85+0.15, 0.0, 1.0);
  float spec = pow(max(dot(reflect(-uSun, N), Vv), 0.0), 18.0) * 0.12;
  float rim = pow(1.0 - max(dot(normalize(vN),Vv),0.0), 3.0);
  vec3 lit = col * (0.05 + diff*1.3) + spec + vec3(0.35,0.75,1.0)*rim*0.35*diff + vec3(1.0,0.75,0.4)*rim*0.25;
  gl_FragColor = vec4(lit, 1.0);
}`

const ATMO_FRAG = /* glsl */ `
uniform vec3 uSun; varying vec2 vUv; varying vec3 vN; varying vec3 vNo; varying vec3 vW;
void main(){ vec3 N=normalize(vN); vec3 Vv=normalize(cameraPosition-vW); float rim=pow(1.0-max(dot(N,Vv),0.0),3.5); float d=clamp(dot(N,uSun)*0.8+0.3,0.0,1.0);
  gl_FragColor=vec4(mix(vec3(1.0,0.72,0.35), vec3(0.4,0.8,1.0), 0.45)*rim*1.4*d, rim*0.9*d); }`

const RING_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vW;
void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`
const RING_FRAG = /* glsl */ `
uniform sampler2D uMap; uniform vec3 uSun; varying vec2 vUv; varying vec3 vW;
void main(){ vec3 c=texture2D(uMap, vec2(vUv.x, 0.5)).rgb; float l=dot(c,vec3(0.299,0.587,0.114));
  float a = smoothstep(0.05,0.30,l) * smoothstep(0.0,0.03,vUv.x) * smoothstep(1.0,0.97,vUv.x);
  float sh = 1.0 - 0.75*smoothstep(0.0,1.0, -dot(normalize(vW), uSun)) * smoothstep(0.55,0.0, length(vW - uSun*dot(vW,uSun)) - 1.0);
  gl_FragColor = vec4(c*1.15*sh, a*0.95); }`

/* the nebula layer: the generated map plus a live high-frequency detail pass, additive over the sharp star map */
const SKY_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vP;
void main(){ vUv=uv; vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
const SKY_FRAG = /* glsl */ `
uniform sampler2D uMap; uniform float uDim; uniform float uTime; varying vec2 vUv; varying vec3 vP; ${NOISE}
void main(){
  vec3 c = texture2D(uMap, vUv).rgb;
  float l = dot(c, vec3(0.299,0.587,0.114));
  /* crisp filaments where the cloud is, breathing very slowly */
  vec3 q = normalize(vP) * 38.0;
  float d = snoise(q + vec3(0.0, 0.0, uTime * 0.01));
  float d2 = snoise(q * 3.1);
  float detail = 0.8 + 0.28 * d + 0.12 * d2;
  vec3 col = c * detail * uDim;
  /* black stays black so the stars behind stay pin-sharp */
  gl_FragColor = vec4(col, smoothstep(0.02, 0.4, l));
}`

const DUST_VERT = /* glsl */ `
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = min(9.0 / -mv.z, 7.0); gl_Position = projectionMatrix * mv; }`
const DUST_FRAG = /* glsl */ `
void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.12, d); gl_FragColor = vec4(0.92, 0.95, 1.0, a * 0.7); }`

const SPARK_VERT = /* glsl */ `
attribute float phase; attribute float size; varying float vPhase;
void main(){ vPhase = phase; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * 900.0 / -mv.z; gl_Position = projectionMatrix * mv; }`
const SPARK_FRAG = /* glsl */ `
uniform float uTime; varying float vPhase;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c);
  float core = smoothstep(0.5, 0.05, d);
  float cross = max(0.0, 1.0 - abs(c.x) * 14.0) + max(0.0, 1.0 - abs(c.y) * 14.0);
  float tw = 0.35 + 0.65 * pow(max(sin(uTime * 0.55 + vPhase * 6.2831), 0.0), 7.0);
  gl_FragColor = vec4(0.9, 0.94, 1.0, (core * 0.8 + cross * 0.35) * tw); }`

/* ---------------------------------------------------------- pieces --- */

function shell(n: number, rMin: number, rMax: number) {
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const r = rMin + Math.random() * (rMax - rMin)
    const a = Math.random() * Math.PI * 2
    const b = Math.acos(Math.random() * 2 - 1)
    pos[i * 3] = r * Math.sin(b) * Math.cos(a)
    pos[i * 3 + 1] = r * Math.cos(b)
    pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  return g
}

/** Three depths of sky: the pin-sharp star map, the nebula with live detail, drifting wisps — parallax on every camera move. */
function Sky({ stars, nebula, wisps }: { stars: THREE.Texture; nebula: THREE.Texture; wisps: THREE.Texture }) {
  const nebMesh = useRef<THREE.Mesh>(null)
  const starMesh = useRef<THREE.Mesh>(null)
  const sparkMat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uMap: { value: nebula }, uDim: { value: 0.75 }, uTime: { value: 0 } }), [nebula])
  const near = useMemo(() => shell(600, 24, 40), [])
  const far = useMemo(() => shell(1400, 45, 70), [])
  const sparks = useMemo(() => {
    const n = 140
    const g = shell(n, 30, 60)
    const phase = new Float32Array(n)
    const size = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      phase[i] = Math.random()
      size[i] = 0.3 + Math.random() * 0.5
    }
    g.setAttribute("phase", new THREE.BufferAttribute(phase, 1))
    g.setAttribute("size", new THREE.BufferAttribute(size, 1))
    return g
  }, [])
  const puffs = useMemo(() => {
    const out: { id: string; pos: [number, number, number]; scale: number; q: number; rot: number; op: number }[] = []
    for (let i = 0; i < 22; i++) {
      const r = 16 + Math.random() * 30
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(Math.random() * 2 - 1)
      out.push({ id: `puff-${i}`, pos: [r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * 0.7, r * Math.sin(b) * Math.sin(a)], scale: 7 + Math.random() * 16, q: i % 4, rot: Math.random() * 6.28, op: 0.18 + Math.random() * 0.3 })
    }
    return out
  }, [])
  const puffTex = useMemo(
    () =>
      [0, 1, 2, 3].map((q) => {
        const t = wisps.clone()
        t.repeat.set(0.5, 0.5)
        t.offset.set(q % 2 ? 0.5 : 0, q < 2 ? 0.5 : 0)
        t.needsUpdate = true
        return t
      }),
    [wisps]
  )
  useFrame((state, dt) => {
    const p = journeyState.p
    /* the sky steps back for the reading page */
    uniforms.uDim.value = 0.75 - smooth(0.88, 1, p) * 0.45
    if (prm()) {
      return
    }
    uniforms.uTime.value = state.clock.elapsedTime
    if (sparkMat.current) {
      sparkMat.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (nebMesh.current) {
      nebMesh.current.rotation.y += dt * 0.004
    }
    if (starMesh.current) {
      starMesh.current.rotation.y -= dt * 0.0015
    }
  })
  return (
    <>
      <mesh ref={starMesh} rotation={[0, 1.1, 0]}>
        <sphereGeometry args={[110, 48, 32]} />
        <meshBasicMaterial map={stars} side={THREE.BackSide} color={0xd9dde6} />
      </mesh>
      <mesh ref={nebMesh} rotation={[0, 2.4, 0]}>
        <sphereGeometry args={[88, 48, 32]} />
        <shaderMaterial uniforms={uniforms} vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {puffs.map((w) => (
        <sprite key={w.id} position={w.pos} scale={[w.scale, w.scale, 1]}>
          <spriteMaterial map={puffTex[w.q]} blending={THREE.AdditiveBlending} depthWrite={false} opacity={w.op} rotation={w.rot} transparent />
        </sprite>
      ))}
      <points geometry={far}>
        <pointsMaterial color="#dde8ff" size={0.09} sizeAttenuation transparent opacity={0.85} />
      </points>
      <points geometry={near}>
        <pointsMaterial color="#ffffff" size={0.05} sizeAttenuation transparent opacity={0.9} />
      </points>
      <points geometry={sparks}>
        <shaderMaterial ref={sparkMat} vertexShader={SPARK_VERT} fragmentShader={SPARK_FRAG} uniforms={{ uTime: { value: 2 } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  )
}

function Planet({ map }: { map: THREE.Texture }) {
  const body = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({ uMap: { value: map }, uTime: { value: 0 }, uSun: { value: SUN_DIR }, uModel: { value: new THREE.Matrix3() } }),
    [map]
  )
  const atmo = useMemo(() => ({ uSun: { value: SUN_DIR } }), [])
  useFrame((state, dt) => {
    const b = body.current
    if (!b) {
      return
    }
    uniforms.uModel.value.setFromMatrix4(b.matrixWorld)
    if (prm()) {
      return
    }
    uniforms.uTime.value = state.clock.elapsedTime
    b.rotation.y += dt * 0.012
  })
  return (
    <>
      <mesh ref={body}>
        <sphereGeometry args={[1, 160, 120]} />
        <shaderMaterial uniforms={uniforms} vertexShader={SURFACE_VERT} fragmentShader={PLANET_FRAG} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial
          uniforms={atmo}
          vertexShader={SURFACE_VERT}
          fragmentShader={ATMO_FRAG}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function Rings({ map }: { map: THREE.Texture }) {
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(R0, R1, 256, 1)
    const p = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      uv.setXY(i, (v.length() - R0) / (R1 - R0), 0.5)
    }
    return g
  }, [])
  const uniforms = useMemo(() => ({ uMap: { value: map }, uSun: { value: SUN_DIR } }), [map])
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial uniforms={uniforms} vertexShader={RING_VERT} fragmentShader={RING_FRAG} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

/** A real rock: a fine icosphere carved by multi-octave noise, one of several shapes. */
function rockGeometry(seed: number, detail: number) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const p = g.attributes.position as THREE.BufferAttribute
  const sx = 0.8 + Math.random() * 0.45
  const sy = 0.65 + Math.random() * 0.5
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize()
    const big = fbm3(v.x * 1.4 + seed, v.y * 1.4, v.z * 1.4 - seed, 3)
    const fine = fbm3(v.x * 5.5 + seed * 3, v.y * 5.5, v.z * 5.5, 3)
    const r = 1 + big * 0.42 + fine * 0.12
    p.setXYZ(i, v.x * r * sx, v.y * r * sy, v.z * r)
  }
  g.computeVertexNormals()
  return g
}

/** The ring is made of rock: boulders crowd the flight path and grow from nothing as the camera dives in. */
function Rocks({ albedo, normal, light }: { albedo: THREE.Texture; normal: THREE.Texture; light: boolean }) {
  const scale = useMemo(() => ({ value: 0.15 }), [])
  const group = useRef<THREE.Group>(null)
  const meshes = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ map: albedo, normalMap: normal, normalScale: new THREE.Vector2(1.3, 1.3), roughness: 0.88, metalness: 0, color: 0xffffff })
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uScale = scale
      sh.vertexShader = `uniform float uScale;\n${sh.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = vec3(position) * uScale;")}`
    }
    const shapes = [0, 1, 2, 3, 4, 5].map((s) => rockGeometry(s * 7.3, 3))
    const smallShapes = [0, 1, 2].map((s) => rockGeometry(s * 3.1 + 40, 2))
    const scatter = (count: number, geos: THREE.BufferGeometry[], near: boolean) => {
      const per = Math.ceil(count / geos.length)
      return geos.map((geo) => {
        const mesh = new THREE.InstancedMesh(geo, mat, per)
        const m = new THREE.Matrix4()
        const q = new THREE.Quaternion()
        const e = new THREE.Euler()
        const s = new THREE.Vector3()
        const pos = new THREE.Vector3()
        for (let i = 0; i < per; i++) {
          const a = Math.random() * Math.PI * 2
          /* a clear corridor for the camera, rock on both sides of it */
          const side = Math.random() < 0.5 ? -1 : 1
          const r = near ? PATH_R + 0.04 + side * (0.09 + Math.random() * 0.17) : R0 + Math.random() * (R1 - R0)
          const y = near ? (Math.random() < 0.5 ? -1 : 1) * (0.035 + Math.random() * 0.13) : (Math.random() - 0.5) * 0.02
          pos.set(Math.cos(a) * r, y, Math.sin(a) * r)
          e.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28)
          q.setFromEuler(e)
          const sc = near ? 0.004 + Math.random() ** 2.4 * 0.016 : 0.0025 + Math.random() * 0.004
          s.set(sc, sc, sc)
          m.compose(pos, q, s)
          mesh.setMatrixAt(i, m)
        }
        mesh.instanceMatrix.needsUpdate = true
        return mesh
      })
    }
    const k = light ? 0.5 : 1
    return [...scatter(Math.round(3200 * k), shapes, true), ...scatter(Math.round(2600 * k), smallShapes, false)]
  }, [albedo, normal, light, scale])
  useFrame((_, dt) => {
    const p = journeyState.p
    scale.value = 0.15 + 0.85 * smooth(0.22, 0.36, p) * (1 - smooth(0.56, 0.66, p))
    if (group.current && !prm()) {
      group.current.rotation.y -= dt * 0.006
    }
  })
  return (
    <group ref={group}>
      {meshes.map((m) => (
        <primitive key={m.uuid} object={m} />
      ))}
    </group>
  )
}

function Dust({ light }: { light: boolean }) {
  const geo = useMemo(() => {
    const n = light ? 12000 : 26000
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283
      const r = R0 + Math.random() * (R1 - R0)
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.05
      pos[i * 3 + 2] = Math.sin(a) * r
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return g
  }, [light])
  return (
    <points geometry={geo}>
      <shaderMaterial vertexShader={DUST_VERT} fragmentShader={DUST_FRAG} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

/** The camera on its spline, damped toward the scroll, leaning with the pointer. */
function Rig({ world }: { world: React.RefObject<THREE.Group | null> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const sun = useRef<THREE.DirectionalLight>(null)
  const cur = useRef(0)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const g = world.current
    if (!g) {
      return
    }
    cur.current += (journeyState.p - cur.current) * (1 - 0.0008 ** dt)
    const p = cur.current
    POS.getPoint(p, pos)
    pos.x += journeyState.px * 0.12
    pos.y -= journeyState.py * 0.08
    g.localToWorld(pos)
    camera.position.copy(pos)
    TGT.getPoint(p, look)
    g.localToWorld(look)
    camera.lookAt(look)
    const fi = p * (FOV.length - 1)
    const i0 = Math.floor(fi)
    const i1 = Math.min(i0 + 1, FOV.length - 1)
    camera.fov = FOV[i0] + (FOV[i1] - FOV[i0]) * (fi - i0)
    camera.updateProjectionMatrix()
    if (sun.current) {
      sun.current.intensity = 2.4 * (1 - smooth(0.9, 1, p) * 0.45)
    }
  })
  return <directionalLight ref={sun} position={[-4, 1.4, 3.2]} intensity={2.4} color="#fff6ea" />
}

function Scene() {
  const [surface, nebula, stars, wisps, ring, rock, rockN] = useLoader(THREE.TextureLoader, [
    `${IMG}/saturn-surface.jpg`,
    `${IMG}/nebula.jpg`,
    `${IMG}/stars.jpg`,
    `${IMG}/nebula-wisps.jpg`,
    `${IMG}/ring-strip.jpg`,
    `${IMG}/rock.jpg`,
    `${IMG}/rock-normal.jpg`,
  ])
  for (const t of [surface, nebula, stars, wisps, ring, rock]) {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
  }
  rock.wrapS = rock.wrapT = THREE.RepeatWrapping
  rockN.wrapS = rockN.wrapT = THREE.RepeatWrapping
  const world = useRef<THREE.Group>(null)
  const light = useMemo(() => window.innerWidth < 768, [])
  return (
    <>
      <Sky stars={stars} nebula={nebula} wisps={wisps} />
      <group ref={world} rotation={[0.42, 0, -0.26]}>
        <Planet map={surface} />
        <Rings map={ring} />
        <Rocks albedo={rock} normal={rockN} light={light} />
        <Dust light={light} />
      </group>
      <Rig world={world} />
      <ambientLight intensity={0.8} color="#aab2cc" />
      <hemisphereLight args={["#a9c4ff", "#4a3a2a", 0.9]} />
    </>
  )
}

export default function SaturnCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 36, near: 0.02, far: 300, position: [0, 1.05, 6.6] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
