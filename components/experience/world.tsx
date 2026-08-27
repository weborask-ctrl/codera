"use client"

/**
 * Step 5 experience — the persistent world.
 *
 * One fixed R3F canvas behind the naturally-scrolling DOM. Renders the
 * production ribbon GLB (Step 2) and the act tone environment. Reads the
 * mutable `stage` every frame and applies short critically-damped
 * smoothing to camera and tone ONLY — the world may glide, the input
 * mapping never lags (CODERA_STEP5_ARCHITECTURE.md §D/§E).
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { ACT_TONES, stage, type ActName } from "./stage"

const RIBBON_URL = "/brand/codera-c-ribbon.glb"

interface Pose {
  cam: [number, number, number]
  target: [number, number, number]
  ribbon: number // target ribbon opacity
}

/** Held camera poses per act; the pass act interpolates through the C. */
function desiredPose(): Pose {
  const { act } = stage
  const passP = stage.p.pass
  const resP = stage.p.resolution
  switch (act) {
    case "hero":
      return { cam: [1.12, 0.42, 1.9], target: [0.16, 0.03, 0], ribbon: 1 }
    case "pass": {
      /* push toward and through the C's opening; ribbon releases at the end */
      const t = passP
      return {
        cam: [1.12 - 0.75 * t, 0.42 - 0.34 * t, 1.9 - 2.75 * t],
        target: [0.16 + 0.28 * t, 0.03 + 0.05 * t, -2.2 * t],
        ribbon: t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35,
      }
    }
    case "resolution": {
      /* frontal pose: the GLB's front IS the logo, by construction */
      const settle = 3.4 - 0.3 * resP
      return { cam: [0, 0, settle], target: [0, 0, 0], ribbon: resP > 0.08 ? 1 : 0 }
    }
    default:
      return { cam: [0, 0, 3.4], target: [0, 0, 0], ribbon: 0 }
  }
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt)
}

function Ribbon() {
  const { scene: gltfScene } = useGLTF(RIBBON_URL)
  const prepared = useMemo(() => {
    const clone = gltfScene
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.name = "codera-ribbon-mesh"
        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.transparent = true
        mat.envMapIntensity = 0.7
      }
    })
    clone.name = "codera-ribbon"
    return clone
  }, [gltfScene])
  return <primitive object={prepared} />
}

function Rig() {
  const { scene } = useThree()
  const tone = useMemo(() => new THREE.Color(ACT_TONES.hero), [])
  const toneTarget = useMemo(() => new THREE.Color(), [])
  const camPos = useMemo(() => new THREE.Vector3(1.12, 0.42, 1.9), [])
  const camTarget = useMemo(() => new THREE.Vector3(0.16, 0.03, 0), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])

  useFrame((state, dt) => {
    const pose = desiredPose()
    const λ = stage.reducedMotion ? 100 : 9 // ≈120 ms glide, instant under PRM

    camPos.x = damp(camPos.x, pose.cam[0], λ, dt)
    camPos.y = damp(camPos.y, pose.cam[1], λ, dt)
    camPos.z = damp(camPos.z, pose.cam[2], λ, dt)
    camTarget.x = damp(camTarget.x, pose.target[0], λ, dt)
    camTarget.y = damp(camTarget.y, pose.target[1], λ, dt)
    camTarget.z = damp(camTarget.z, pose.target[2], λ, dt)

    /* pointer sways the key composition only in the hero act, ≤ ~2.5° */
    const sway = stage.act === "hero" && !stage.reducedMotion ? 1 : 0
    pointer.x = damp(pointer.x, stage.pointerX * sway, 6, dt)
    pointer.y = damp(pointer.y, stage.pointerY * sway, 6, dt)

    state.camera.position.set(
      camPos.x + pointer.x * 0.07,
      camPos.y - pointer.y * 0.05,
      camPos.z
    )
    state.camera.lookAt(camTarget)

    /* act tone crossfade */
    toneTarget.set(ACT_TONES[stage.act as ActName])
    tone.r = damp(tone.r, toneTarget.r, 5, dt)
    tone.g = damp(tone.g, toneTarget.g, 5, dt)
    tone.b = damp(tone.b, toneTarget.b, 5, dt)
    ;(scene.background as THREE.Color).copy(tone)

    /* ribbon visibility */
    const ribbon = scene.getObjectByName("codera-ribbon")
    if (ribbon) {
      ribbon.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.opacity = damp(mat.opacity, pose.ribbon, 10, dt)
          mesh.visible = mat.opacity > 0.02
        }
      })
    }
  })
  return null
}

function Atmosphere() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.06).texture
    scene.environment = env
    scene.background = new THREE.Color(ACT_TONES.hero)
    return () => {
      pmrem.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <directionalLight position={[-2.4, 2.8, 3.4]} intensity={1.35} color="#fff4e2" />
      <directionalLight position={[2.6, -0.6, 2.2]} intensity={0.3} color="#dfe3ea" />
    </>
  )
}

export function ExperienceWorld() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 34, near: 0.05, far: 30, position: [1.12, 0.42, 1.9] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Atmosphere />
        <Ribbon />
        <Rig />
      </Canvas>
    </div>
  )
}

useGLTF.preload(RIBBON_URL)
