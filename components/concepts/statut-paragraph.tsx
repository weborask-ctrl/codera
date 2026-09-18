"use client"

/**
 * The bronze § — the Kancelária ornament as a REAL object (Iterácia 1.3,
 * Ondrej's brief 2026-09-04: lift 01 to the level of 04). A Georgia Bold
 * paragraph glyph extruded and bevelled in WebGL, cast in bronze under a
 * room environment. It idles slowly, leans toward the pointer and turns
 * and sinks with the scroll (the site writes `paraState` from its
 * ScrollTrigger; the frame loop damps toward it). Reduced motion: a still,
 * lit cast. Loaded client-only; the homepage portal keeps the CSS glyph.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

/** Scroll progress through the hero (0..1) + pointer (-0.5..0.5). */
export const paraState = { p: 0, px: 0, py: 0 }

/* Georgia Bold §, y flipped for three, 100 units per em */
const CMDS: (string | number)[][] = [["M",50.44,31.45],["L",50.44,31.45],["Q",50.44,26.27,47,22.61],["Q",43.55,18.95,37.79,17.04],["L",37.79,17.04],["Q",42.77,14.99,45.31,11.57],["Q",47.85,8.15,47.85,4.05],["L",47.85,4.05],["Q",47.85,-2.54,41.72,-6.93],["Q",35.6,-11.33,24.95,-11.33],["L",24.95,-11.33],["Q",19.87,-11.33,16.5,-10.38],["Q",13.13,-9.42,11.08,-7.96],["L",11.08,-7.96],["Q",9.03,-6.49,8.18,-4.76],["Q",7.32,-3.03,7.32,-1.51],["L",7.32,-1.51],["Q",7.32,1.17,8.91,2.91],["Q",10.5,4.64,13.53,4.64],["L",13.53,4.64],["Q",15.67,4.64,17.24,3.52],["Q",18.8,2.39,19.87,0.59],["L",19.87,0.59],["Q",20.9,-1.12,21.61,-3.05],["Q",22.31,-4.98,23.1,-7.18],["L",23.1,-7.18],["Q",23.34,-7.23,23.78,-7.28],["Q",24.22,-7.32,24.46,-7.32],["L",24.46,-7.32],["Q",29.05,-7.32,32.06,-5.57],["Q",35.06,-3.81,35.06,0.1],["L",35.06,0.1],["Q",35.06,2.44,34.08,4.05],["Q",33.11,5.66,31.2,6.93],["L",31.2,6.93],["Q",29.35,8.25,26.27,9.55],["Q",23.19,10.84,20.17,12.06],["L",20.17,12.06],["Q",12.79,15.04,9.35,18.82],["Q",5.91,22.61,5.91,28.22],["L",5.91,28.22],["Q",5.91,33.01,8.69,36.52],["Q",11.47,40.04,18.55,42.63],["L",18.55,42.63],["Q",13.09,44.87,10.6,48.32],["Q",8.11,51.76,8.11,56.1],["L",8.11,56.1],["Q",8.11,62.5,14.45,66.75],["Q",20.8,71,30.91,71],["L",30.91,71],["Q",35.74,71,39.21,70.07],["Q",42.68,69.14,44.78,67.63],["L",44.78,67.63],["Q",46.78,66.21,47.66,64.48],["Q",48.54,62.74,48.54,61.18],["L",48.54,61.18],["Q",48.54,58.59,47.05,56.81],["Q",45.56,55.03,42.33,55.03],["L",42.33,55.03],["Q",40.09,55.03,38.6,56.15],["Q",37.11,57.28,35.99,59.08],["L",35.99,59.08],["Q",35.06,60.55,34.2,62.92],["Q",33.35,65.28,32.76,66.85],["L",32.76,66.85],["Q",32.42,66.94,32.03,66.97],["Q",31.64,66.99,31.4,66.99],["L",31.4,66.99],["Q",26.81,66.99,23.85,65.16],["Q",20.9,63.33,20.9,59.57],["L",20.9,59.57],["Q",20.9,57.13,21.9,55.57],["Q",22.9,54,24.95,52.69],["L",24.95,52.69],["Q",27,51.37,29.98,50.15],["Q",32.96,48.93,36.18,47.61],["L",36.18,47.61],["Q",43.51,44.68,46.97,40.97],["Q",50.44,37.26,50.44,31.45],["M",37.99,28.17],["L",37.99,28.17],["Q",37.99,30.71,36.87,32.5],["Q",35.74,34.28,33.64,35.69],["L",33.64,35.69],["Q",31.74,37.01,28.34,38.48],["Q",24.95,39.94,22.51,41.02],["L",22.51,41.02],["Q",20.7,39.45,19.53,36.69],["Q",18.36,33.94,18.36,31.49],["L",18.36,31.49],["Q",18.36,28.91,19.58,27.08],["Q",20.8,25.24,22.85,23.88],["L",22.85,23.88],["Q",25.1,22.41,28,21.17],["Q",30.91,19.92,33.84,18.65],["L",33.84,18.65],["Q",36.23,20.75,37.11,23.14],["Q",37.99,25.54,37.99,28.17]]

function glyphGeometry() {
  const path = new THREE.ShapePath()
  for (const c of CMDS) {
    const n = c.slice(1) as number[]
    if (c[0] === "M") {
      path.moveTo(n[0], n[1])
    } else if (c[0] === "L") {
      path.lineTo(n[0], n[1])
    } else if (c[0] === "Q") {
      path.quadraticCurveTo(n[0], n[1], n[2], n[3])
    } else if (c[0] === "C") {
      path.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5])
    }
  }
  const geo = new THREE.ExtrudeGeometry(path.toShapes(), {
    depth: 13,
    bevelEnabled: true,
    bevelThickness: 2.4,
    bevelSize: 2.2,
    bevelSegments: 5,
    curveSegments: 14,
  })
  geo.center()
  geo.scale(0.03, 0.03, 0.03)
  return geo
}

function Bronze() {
  const mesh = useRef<THREE.Mesh>(null)
  const geo = useMemo(glyphGeometry, [])
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const cur = useRef({ p: 0, px: 0, py: 0 })
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    pm.dispose()
    return () => {
      env.dispose()
    }
  }, [gl, scene])
  useEffect(() => {
    const move = (e: PointerEvent) => {
      paraState.px = e.clientX / window.innerWidth - 0.5
      paraState.py = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [])
  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) {
      return
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const k = 1 - 0.002 ** dt
    const c = cur.current
    c.p += (paraState.p - c.p) * k
    c.px += (paraState.px - c.px) * k
    c.py += (paraState.py - c.py) * k
    const t = still ? 0 : state.clock.elapsedTime
    m.rotation.y = 0.35 + Math.sin(t * 0.35) * 0.28 + c.px * 0.7 + c.p * 1.7
    m.rotation.x = 0.1 + c.py * 0.4 + c.p * 0.5
    m.rotation.z = 0.16
    m.position.y = -c.p * 1.6
  })
  return (
    <mesh ref={mesh} geometry={geo}>
      <meshStandardMaterial color="#C98F5F" metalness={1} roughness={0.22} envMapIntensity={1.15} />
    </mesh>
  )
}

export default function ParagraphCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 30, near: 0.1, far: 30, position: [0, 0, 5.6] }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <directionalLight position={[2.5, 3, 4]} intensity={2.2} color="#fff0dc" />
      <directionalLight position={[-3, -1, 2]} intensity={0.9} color="#6E1F26" />
      <Bronze />
    </Canvas>
  )
}
