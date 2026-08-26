"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Fog,
  PMREMGenerator,
  RepeatWrapping,
  Vector3,
} from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

import { film } from "@/components/proto/film"
import { createRibbonGeometry } from "@/lib/ribbon-mesh"

/**
 * The persistent world — prototype scope: the ribbon, its material, one
 * lighting rig, and a camera posed every frame from the shared film object.
 *
 * Deliberate absences: no postprocessing, no per-frame React state, no
 * drei scroll helpers (GSAP owns the timeline), no asset downloads — the
 * environment is generated (RoomEnvironment → PMREM) and the roughness
 * variation is a tiny procedural canvas.
 */

/** Brushed-metal roughness variation: streaks along U, generated once. */
function makeRoughnessTexture() {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
  ctx.fillStyle = "#585858"
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * size
    const w = 30 + Math.random() * 200
    const x = Math.random() * size - w / 2
    const tone = 70 + Math.floor(Math.random() * 60)
    ctx.fillStyle = `rgba(${tone},${tone},${tone},0.16)`
    ctx.fillRect(x, y, w, 1)
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

function Ribbon() {
  const geometry = useMemo(() => createRibbonGeometry(), [])
  const roughnessMap = useMemo(() => makeRoughnessTexture(), [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      roughnessMap.dispose()
    }
  }, [geometry, roughnessMap])

  useFrame((state) => {
    // Slow idle turn while the camera is close; stills as the form resolves.
    const mesh = state.scene.getObjectByName("codera-ribbon")
    if (mesh) {
      mesh.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.08 * film.idle
      mesh.rotation.x = Math.cos(state.clock.elapsedTime * 0.09) * 0.04 * film.idle
    }
  })

  return (
    <mesh name="codera-ribbon" geometry={geometry}>
      <meshPhysicalMaterial
        color="#2c2c2e"
        metalness={0.85}
        roughness={0.34}
        roughnessMap={roughnessMap}
        clearcoat={0.25}
        clearcoatRoughness={0.5}
        envMapIntensity={0.75}
      />
    </mesh>
  )
}

/**
 * Generated studio environment + fog, attached declaratively so R3F owns the
 * scene assignment and detaches both on unmount. Zero asset bytes: the env
 * map is rendered from `RoomEnvironment`, not downloaded.
 */
function Atmosphere() {
  const gl = useThree((state) => state.gl)

  const envTexture = useMemo(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
    pmrem.dispose()
    return env.texture
  }, [gl])
  const fog = useMemo(() => new Fog("#0d0d0f", 18, 42), [])

  useEffect(() => {
    return () => envTexture.dispose()
  }, [envTexture])

  return (
    <>
      <primitive object={envTexture} attach="environment" />
      <primitive object={fog} attach="fog" />
    </>
  )
}

function Rig() {
  const camera = useThree((state) => state.camera)

  const target = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    camera.position.set(
      film.cam.x + film.swayX * 0.25,
      film.cam.y - film.swayY * 0.18,
      film.cam.z
    )
    target.set(film.target.x, film.target.y, film.target.z)
    camera.lookAt(target)

    const key = state.scene.getObjectByName("key-light")
    if (key && "intensity" in key) {
      ;(key as unknown as { intensity: number }).intensity = film.key * 2.4
    }
  })

  return null
}

export default function RibbonWorld() {
  return (
    <Canvas
      // The film drives everything; render continuously while mounted.
      // Pausing when parked is a Phase 3 concern.
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.1, far: 60, position: [0.9, 4.1, 1.15] }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#0d0d0f"]} />
      <directionalLight name="key-light" position={[6, 8, 7]} intensity={1.4} />
      <directionalLight position={[-7, -2, 5]} intensity={0.35} color="#cfd4dd" />
      <Atmosphere />
      <Ribbon />
      <Rig />
    </Canvas>
  )
}
