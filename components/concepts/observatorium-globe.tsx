"use client"

/**
 * The Observatórium globe — a REAL WebGL Earth (Ukážka Animácie & 3D).
 *
 * One sphere wearing NASA's Blue Marble texture, an additive fresnel
 * atmosphere, and a sun key light. The globe spins slowly on its own,
 * follows the scroll through `globeState.p` (set by the site's
 * ScrollTrigger) and tilts toward the pointer — all damped in the frame
 * loop, so every input is interruptible. Reduced motion: a lit, still
 * planet. Loaded client-only via next/dynamic; the page never blocks
 * on WebGL.
 */

import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import * as THREE from "three"

/** Shared mutable input: scroll progress (0..1) + pointer (-0.5..0.5). */
export const globeState = { p: 0, px: 0, py: 0 }

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ATMO_FRAG = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
    gl_FragColor = vec4(0.42, 0.62, 1.0, 1.0) * rim * 1.35;
  }
`

function damp(c: number, t: number, l: number, dt: number) {
  return THREE.MathUtils.damp(c, t, l, dt)
}

function Earth() {
  const map = useLoader(THREE.TextureLoader, "/demos/observatorium/earth.jpg")
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  const group = useRef<THREE.Group>(null)
  const spin = useRef({ y: 4.35, tilt: 0, lean: 0 })
  useFrame((_, dt) => {
    const g = group.current
    if (!g) {
      return
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const s = spin.current
    if (!still) {
      s.y += dt * 0.05
    }
    /* the scroll carries the revolution; the pointer leans the axis */
    const targetY = s.y + globeState.p * 1.15 + globeState.px * 0.55
    const targetX = 0.18 + globeState.py * 0.35
    g.rotation.y = damp(g.rotation.y, targetY, 4, dt)
    g.rotation.x = damp(g.rotation.x, targetX, 4, dt)
  })
  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial map={map} roughness={0.95} metalness={0} />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function GlobeCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 38, near: 0.1, far: 20, position: [0, 0, 3.25] }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <directionalLight position={[-1.6, 0.8, 3.4]} intensity={2.9} color="#fff3e0" />
      <ambientLight intensity={0.28} color="#6d84a6" />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
    </Canvas>
  )
}
