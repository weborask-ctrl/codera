"use client"

/**
 * The Observatórium Saturn — a REAL WebGL Saturn (Ukážka Animácie & 3D,
 * Iterácia 0.7). Textures: Solar System Scope (CC BY 4.0), built from
 * NASA/JPL Cassini data.
 *
 * One planet, one ring (strip texture remapped radially), one field of
 * stars. The site's ScrollTrigger writes the choreography into
 * `saturnState` (a: hero turn, b: ring-text sweep, c: retreat into the
 * background) and the pointer leans it; the frame loop only damps toward
 * those targets, so every input stays interruptible. Reduced motion: a
 * lit, still planet. Loaded client-only via next/dynamic.
 */

import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"

/** Scroll phases (0..1 each) + pointer (-0.5..0.5), written by the site. */
export const saturnState = { a: 0, b: 0, c: 0, px: 0, py: 0 }

function damp(c: number, t: number, l: number, dt: number) {
  return THREE.MathUtils.damp(c, t, l, dt)
}

function Stars() {
  const geo = useMemo(() => {
    const n = 1900
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 26 + Math.random() * 14
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(Math.random() * 2 - 1)
      pos[i * 3] = r * Math.sin(b) * Math.cos(a)
      pos[i * 3 + 1] = r * Math.cos(b)
      pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#cfe0ff" size={0.055} sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}

function Saturn() {
  const [bodyMap, ringMap] = useLoader(THREE.TextureLoader, [
    "/demos/observatorium/saturn.jpg",
    "/demos/observatorium/saturn-ring.png",
  ])
  bodyMap.colorSpace = THREE.SRGBColorSpace
  ringMap.colorSpace = THREE.SRGBColorSpace

  /* the ring texture is a radial strip — remap the flat RingGeometry UVs */
  const ringGeo = useMemo(() => {
    const g = new THREE.RingGeometry(1.32, 2.42, 220, 1)
    const p = g.attributes.position
    const uv = g.attributes.uv as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p as THREE.BufferAttribute, i)
      uv.setXY(i, (v.length() - 1.32) / (2.42 - 1.32), 0.5)
    }
    return g
  }, [])

  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Mesh>(null)
  const sun = useRef<THREE.DirectionalLight>(null)

  useFrame((_, dt) => {
    const g = group.current
    if (!g) {
      return
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const s = saturnState
    if (!still && body.current) {
      body.current.rotation.y += dt * 0.03
    }
    /* the scroll owns the pose; the pointer only leans it */
    const rotY = s.a * 2.2 + s.b * 1.6 + s.c * 0.6 + s.px * 0.18
    const tiltX = 0.42 - s.a * 0.3 + s.c * 0.15 + s.py * 0.12
    g.rotation.y = damp(g.rotation.y, rotY, 4, dt)
    g.rotation.x = damp(g.rotation.x, tiltX, 4, dt)
    g.position.y = damp(g.position.y, -0.15 + s.a * 0.18 - s.c * 0.4, 4, dt)
    g.position.z = damp(g.position.z, -(s.b * 1.2 + s.c * 7.5), 4, dt)
    const sc = damp(g.scale.x, 1 + s.a * 0.12, 4, dt)
    g.scale.setScalar(sc)
    if (sun.current) {
      const textDim = s.b > 0 && s.b < 1 ? 0.35 * Math.sin(Math.PI * Math.min(s.b, 1)) : 0
      sun.current.intensity = 2.6 * (1 - s.c * 0.62) * (1 - textDim)
    }
  })

  return (
    <>
      {/* the sun stays fixed in the world — the planet turns, the light does not */}
      <directionalLight ref={sun} position={[-4, 1.4, 3.2]} intensity={2.6} color="#fff1d8" />
      <group ref={group} rotation={[0.42, 0, -0.26]} position={[0, -0.15, 0]}>
        <mesh ref={body}>
          <sphereGeometry args={[1, 96, 96]} />
          <meshStandardMaterial map={bodyMap} roughness={1} metalness={0} />
        </mesh>
        <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            map={ringMap}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            opacity={0.96}
          />
        </mesh>
      </group>
    </>
  )
}

export default function SaturnCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 36, near: 0.1, far: 80, position: [0, 0, 6.2] }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.55} color="#30405e" />
      <Stars />
      <Suspense fallback={null}>
        <Saturn />
      </Suspense>
    </Canvas>
  )
}
