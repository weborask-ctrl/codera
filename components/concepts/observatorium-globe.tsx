"use client"

/**
 * The Observatórium journey — a REAL WebGL flight to Saturn (Ukážka
 * Animácie & 3D, Iterácia 1.0; Ondrej's brief 2026-09-04: full 5D, zoom
 * in and out, transitions through space, a living planet surface, vivid
 * saturated colour; the Higgsfield "camera dives into the ring" video as
 * the guide).
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

/* ---------------------------------------------------------- shaders --- */

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float f=0.0,a=0.5;for(int i=0;i<3;i++){f+=a*snoise(p);p*=2.02;a*=0.5;}return f;}`

const SURFACE_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`

/* the bands shear at different speeds by latitude; storms swirl through a domain warp */
const PLANET_FRAG = /* glsl */ `
uniform sampler2D uMap; uniform float uTime; uniform vec3 uSun; varying vec2 vUv; varying vec3 vN; varying vec3 vW; ${NOISE}
void main(){
  float shear = (0.5 - abs(vUv.y-0.5)) * 0.010 * uTime;
  vec3 q = vec3(vUv*vec2(7.0,4.0), uTime*0.06);
  vec2 warp = vec2(fbm(q), fbm(q+vec3(5.2,1.3,0.0))) * 0.014;
  vec2 uv = vec2(fract(vUv.x + shear + warp.x), clamp(vUv.y + warp.y*0.6, 0.0, 1.0));
  vec3 col = texture2D(uMap, uv).rgb;
  float l = dot(col, vec3(0.299,0.587,0.114)); col = mix(vec3(l), col, 1.08);
  vec3 N = normalize(vN); vec3 Vv = normalize(cameraPosition - vW);
  float diff = clamp(dot(N, uSun)*0.85+0.15, 0.0, 1.0);
  float rim = pow(1.0 - max(dot(N,Vv),0.0), 3.0);
  vec3 lit = col * (0.06 + diff*1.25) + vec3(0.35,0.75,1.0)*rim*0.35*diff + vec3(1.0,0.75,0.4)*rim*0.25;
  gl_FragColor = vec4(lit, 1.0);
}`

const ATMO_FRAG = /* glsl */ `
uniform vec3 uSun; varying vec2 vUv; varying vec3 vN; varying vec3 vW;
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

const DUST_VERT = /* glsl */ `
void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = min(9.0 / -mv.z, 7.0); gl_Position = projectionMatrix * mv; }`
const DUST_FRAG = /* glsl */ `
void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.12, d); gl_FragColor = vec4(0.92, 0.95, 1.0, a * 0.7); }`

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

function Sky({ map }: { map: THREE.Texture }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const stars = useMemo(() => shell(3200, 40, 70), [])
  useFrame((_, dt) => {
    if (mat.current) {
      /* the nebula steps back for the reading page */
      mat.current.color.setScalar(0.5 - smooth(0.88, 1, journeyState.p) * 0.32)
    }
    if (mesh.current && !prm()) {
      mesh.current.rotation.y += dt * 0.004
    }
  })
  return (
    <>
      <mesh ref={mesh} rotation={[0, 2.4, 0]}>
        <sphereGeometry args={[90, 48, 32]} />
        <meshBasicMaterial ref={mat} map={map} side={THREE.BackSide} color={0x808080} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial color="#dde8ff" size={0.22} sizeAttenuation transparent opacity={0.9} />
      </points>
    </>
  )
}

function Planet({ map }: { map: THREE.Texture }) {
  const body = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(() => ({ uMap: { value: map }, uTime: { value: 0 }, uSun: { value: SUN_DIR } }), [map])
  const atmo = useMemo(() => ({ uSun: { value: SUN_DIR } }), [])
  useFrame((state, dt) => {
    if (prm()) {
      return
    }
    uniforms.uTime.value = state.clock.elapsedTime
    if (body.current) {
      body.current.rotation.y += dt * 0.02
    }
  })
  return (
    <>
      <mesh ref={body}>
        <sphereGeometry args={[1, 128, 96]} />
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

/** The ring is made of rock: boulders crowd the flight path and grow from nothing as the camera dives in. */
function Rocks({ ice, light }: { ice: THREE.Texture; light: boolean }) {
  const scale = useMemo(() => ({ value: 0.15 }), [])
  const group = useRef<THREE.Group>(null)
  const meshes = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ map: ice, roughness: 0.9, metalness: 0, color: 0xf2f1ec })
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uScale = scale
      sh.vertexShader = `uniform float uScale;\n${sh.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = vec3(position) * uScale;")}`
    }
    const rockGeometry = (detail: number, jitter: number) => {
      const g = new THREE.IcosahedronGeometry(1, detail)
      const p = g.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < p.count; i++) {
        const s = 1 - jitter / 2 + Math.random() * jitter
        p.setXYZ(i, p.getX(i) * s, p.getY(i) * (0.8 + Math.random() * 0.3), p.getZ(i) * s)
      }
      g.computeVertexNormals()
      return g
    }
    const scatter = (count: number, geo: THREE.BufferGeometry, near: boolean) => {
      const mesh = new THREE.InstancedMesh(geo, mat, count)
      const m = new THREE.Matrix4()
      const q = new THREE.Quaternion()
      const e = new THREE.Euler()
      const s = new THREE.Vector3()
      const pos = new THREE.Vector3()
      for (let i = 0; i < count; i++) {
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
    }
    const k = light ? 0.5 : 1
    return [scatter(Math.round(3200 * k), rockGeometry(2, 0.35), true), scatter(Math.round(2600 * k), rockGeometry(1, 0.5), false)]
  }, [ice, light, scale])
  useFrame((_, dt) => {
    const p = journeyState.p
    scale.value = 0.15 + 0.85 * smooth(0.22, 0.36, p) * (1 - smooth(0.56, 0.66, p))
    if (group.current && !prm()) {
      group.current.rotation.y -= dt * 0.006
    }
  })
  return (
    <group ref={group}>
      {meshes.map((m, i) => (
        <primitive key={i === 0 ? "boulders" : "grain"} object={m} />
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
  const [surface, nebula, ring, ice] = useLoader(THREE.TextureLoader, [
    `${IMG}/saturn-surface.jpg`,
    `${IMG}/nebula.jpg`,
    `${IMG}/ring-strip.jpg`,
    `${IMG}/ice.jpg`,
  ])
  for (const t of [surface, nebula, ring, ice]) {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
  }
  const world = useRef<THREE.Group>(null)
  const light = useMemo(() => window.innerWidth < 768, [])
  return (
    <>
      <Sky map={nebula} />
      <group ref={world} rotation={[0.42, 0, -0.26]}>
        <Planet map={surface} />
        <Rings map={ring} />
        <Rocks ice={ice} light={light} />
        <Dust light={light} />
      </group>
      <Rig world={world} />
      <ambientLight intensity={0.55} color="#9aa3c0" />
    </>
  )
}

export default function SaturnCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 36, near: 0.02, far: 200, position: [0, 1.05, 6.6] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
