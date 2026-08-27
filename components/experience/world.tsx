"use client"

/**
 * Step 5 experience — the persistent world.
 *
 * One fixed R3F canvas behind the naturally-scrolling DOM. Renders the
 * production ribbon GLB (Step 2) and the act tone environment. Reads the
 * mutable `stage` every frame and applies short critically-damped
 * smoothing to camera and tone ONLY — the world may glide, the input
 * mapping never lags (CODERA_STEP5_ARCHITECTURE.md §D/§E).
 *
 * Frame-path state lives in module scope and is applied through the
 * useFrame `state` argument — React owns nothing on the hot path
 * (react-hooks v6 immutability; the pattern proven in the v2 world).
 */

import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useEffect } from "react"
import * as THREE from "three"
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
      /* board /01: the C sits right-of-centre, cropped by the frame edge */
      return { cam: [0.5, 0.36, 1.95], target: [-0.36, 0.0, 0], ribbon: 1 }
    case "pass": {
      /* push toward and through the C's opening; ribbon releases at the end */
      const t = passP
      return {
        cam: [0.5 - 0.28 * t, 0.36 - 0.3 * t, 1.95 - 2.8 * t],
        target: [-0.36 + 0.72 * t, 0.06 * t, -2.2 * t],
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

/* ---- module-scope frame state (single world instance by design) ---- */

const camPos = new THREE.Vector3(0.5, 0.36, 1.95)
const camTarget = new THREE.Vector3(-0.36, 0, 0)
const pointerLerp = new THREE.Vector2()
const tone = new THREE.Color(ACT_TONES.hero)
const toneTarget = new THREE.Color()
let envTexture: THREE.Texture | null = null
let envApplied = false
let ribbonPrepared = false

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt)
}

function Ribbon() {
  const { scene: gltfScene } = useGLTF(RIBBON_URL)
  /* material prep happens once in Rig's frame loop via getObjectByName —
     React never mutates the loaded scene (react-hooks/immutability). */
  return (
    <group name="codera-ribbon">
      <primitive object={gltfScene} />
    </group>
  )
}

/** Builds the approved satin softbox environment once per WebGL context. */
function Atmosphere() {
  useEffect(() => {
    envApplied = false
    return () => {
      envApplied = false
      envTexture?.dispose()
      envTexture = null
    }
  }, [])
  return (
    <>
      <directionalLight position={[-0.9, 1.4, 5]} intensity={1.6} color="#fff4e2" />
      <ambientLight intensity={0.55} color="#ffffff" />
    </>
  )
}

function buildEnvironment(gl: THREE.WebGLRenderer): THREE.Texture {
  /* logo-lab look-dev: one large frontal softbox up-left, faint counter
     panel right, dark surround — orientation drives the satin tone. */
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color("#050506")
  const softbox = (
    color: string,
    intensity: number,
    w: number,
    h: number,
    pos: [number, number, number]
  ) => {
    const mat = new THREE.MeshBasicMaterial({ color })
    mat.color.multiplyScalar(intensity)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    mesh.position.set(...pos)
    mesh.lookAt(0, 0, 0)
    envScene.add(mesh)
  }
  softbox("#ffffff", 3.2, 13, 10, [-1.2, 1.8, 7.5])
  softbox("#aab0b8", 0.7, 3, 6, [6, 0, 1.5])
  const pmrem = new THREE.PMREMGenerator(gl)
  const texture = pmrem.fromScene(envScene, 0.08).texture
  pmrem.dispose()
  return texture
}

function Rig() {
  useFrame((state, dt) => {
    if (!envApplied) {
      if (!envTexture) {
        envTexture = buildEnvironment(state.gl)
      }
      state.scene.environment = envTexture
      state.scene.background = new THREE.Color(ACT_TONES.hero)
      envApplied = true
    }

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
    pointerLerp.x = damp(pointerLerp.x, stage.pointerX * sway, 6, dt)
    pointerLerp.y = damp(pointerLerp.y, stage.pointerY * sway, 6, dt)

    state.camera.position.set(
      camPos.x + pointerLerp.x * 0.07,
      camPos.y - pointerLerp.y * 0.05,
      camPos.z
    )
    state.camera.lookAt(camTarget)

    /* act tone crossfade */
    toneTarget.set(ACT_TONES[stage.act as ActName])
    tone.r = damp(tone.r, toneTarget.r, 5, dt)
    tone.g = damp(tone.g, toneTarget.g, 5, dt)
    tone.b = damp(tone.b, toneTarget.b, 5, dt)
    if (state.scene.background instanceof THREE.Color) {
      state.scene.background.copy(tone)
    }

    /* ribbon material prep (once) + visibility */
    const ribbon = state.scene.getObjectByName("codera-ribbon")
    if (ribbon) {
      ribbon.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (!ribbonPrepared) {
            mat.transparent = true
            mat.envMapIntensity = 0.7
          }
          mat.opacity = damp(mat.opacity, pose.ribbon, 10, dt)
          mesh.visible = mat.opacity > 0.02
        }
      })
      ribbonPrepared = true
    }
  })
  return null
}

export function ExperienceWorld() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 34, near: 0.05, far: 30, position: [0.5, 0.36, 1.95] }}
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
