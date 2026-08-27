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

import { useGLTF } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { ACT_TONES, type ActName, stage } from "./stage"

const RIBBON_URL = "/brand/codera-c-ribbon.glb"

interface Pose {
  cam: [number, number, number]
  target: [number, number, number]
  ribbon: number // target ribbon opacity
  molten: number // target molten-field intensity
}

/** Held camera poses per act; the pass act interpolates through the C. */
function desiredPose(): Pose {
  const { act } = stage
  const passP = stage.p.pass
  const resP = stage.p.resolution
  switch (act) {
    case "hero":
      /* board /01: the C sits right-of-centre, cropped by the frame edge */
      return { cam: [0.5, 0.36, 1.95], target: [-0.36, 0.0, 0], ribbon: 1, molten: 1 }
    case "pass": {
      /* dolly toward the C so it swallows the frame, then release it —
         the camera never leaves the object's front (an empty frustum
         reads as a dead wash, not a pass-through) */
      const t = passP
      return {
        cam: [0.5 - 0.34 * t, 0.36 - 0.3 * t, 1.95 - 1.35 * t],
        target: [-0.36 + 0.5 * t, 0.05 * t, -1.3 * t],
        ribbon: t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15,
        molten: 1 - t,
      }
    }
    case "resolution": {
      /* frontal pose, eye-line dropped so the C rides the upper half and
         the closing type owns the lower third (logo-lockup composition) */
      const settle = 3.4 - 0.3 * resP
      return { cam: [0, -0.42, settle], target: [0, -0.42, 0], ribbon: resP > 0.08 ? 1 : 0, molten: 0.35 }
    }
    default:
      return { cam: [0, 0, 3.4], target: [0, 0, 0], ribbon: 0, molten: 0 }
  }
}

/* Molten-titanium field shader — the foundry glow behind the C
   (monopo's liquid media gesture in the Codera metal palette). */
const MOLTEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const MOLTEN_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    v += 0.55 * noise(p);
    v += 0.28 * noise(p * 2.1 + 3.7);
    v += 0.17 * noise(p * 4.3 - 1.9);
    return v;
  }

  void main() {
    vec2 p = vUv * vec2(2.4, 1.6);
    float t = uTime * 0.045;
    float flow = fbm(p + vec2(t, -t * 0.6) + fbm(p * 1.4 - t) * 0.9);

    vec3 graphite = vec3(0.078, 0.082, 0.098);
    vec3 oxblood  = vec3(0.29, 0.121, 0.086);
    vec3 amber    = vec3(0.69, 0.404, 0.165);
    vec3 champagne= vec3(0.91, 0.788, 0.604);

    vec3 col = graphite;
    col = mix(col, oxblood, smoothstep(0.32, 0.62, flow));
    col = mix(col, amber, smoothstep(0.55, 0.8, flow) * 0.85);
    col = mix(col, champagne, smoothstep(0.74, 0.95, flow) * 0.7);

    /* vignette so the field melts into the scene tone at its edges */
    float vig = smoothstep(0.0, 0.42, vUv.x) * smoothstep(1.0, 0.58, vUv.x)
              * smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
    gl_FragColor = vec4(mix(graphite, col, vig), uIntensity);
  }
`

/* ---- module-scope frame state (single world instance by design) ---- */

const camPos = new THREE.Vector3(0.5, 0.36, 1.95)
const camTarget = new THREE.Vector3(-0.36, 0, 0)
const pointerLerp = new THREE.Vector2()
const tone = new THREE.Color(ACT_TONES.hero)
const toneTarget = new THREE.Color()
let envTexture: THREE.Texture | null = null
let envApplied = false
let ribbonPrepared = false
let moltenTime = 0

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

/** Mirrored clone below the floor line — OHZI's wet-floor gallery. */
function RibbonReflection() {
  const { scene: gltfScene } = useGLTF(RIBBON_URL)
  const clone = useMemo(() => gltfScene.clone(true), [gltfScene])
  return (
    <group name="codera-ribbon-reflection" position={[0, -1.06, 0]} scale={[1, -1, 1]}>
      <primitive object={clone} />
    </group>
  )
}

function MoltenField() {
  return (
    <mesh name="codera-molten" position={[-0.2, 0.1, -2.6]}>
      <planeGeometry args={[10.5, 6.2]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={MOLTEN_VERT}
        fragmentShader={MOLTEN_FRAG}
        uniforms={{ uTime: { value: 0 }, uIntensity: { value: 0 } }}
      />
    </mesh>
  )
}

/** Soft contact glow where the C meets its floor. */
function FloorGlow() {
  return (
    <mesh name="codera-floor-glow" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]}>
      <planeGeometry args={[3.4, 1.6]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={MOLTEN_VERT}
        fragmentShader={/* glsl */ `
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            float d = distance(vUv, vec2(0.5));
            float a = smoothstep(0.5, 0.05, d) * 0.32 * uIntensity;
            gl_FragColor = vec4(0.91, 0.79, 0.6, a);
          }
        `}
        uniforms={{ uTime: { value: 0 }, uIntensity: { value: 0 } }}
      />
    </mesh>
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
            mat.color.setRGB(0.9, 0.86, 0.79) // warm titanium
          }
          mat.opacity = damp(mat.opacity, pose.ribbon, 10, dt)
          mesh.visible = mat.opacity > 0.02
        }
      })
      ribbonPrepared = true
    }

    /* floor reflection follows the ribbon at low opacity; its clone shares
       materials with the gltf cache, so each mesh gets its own copy once
       (userData marker survives world-mode remounts). */
    const reflection = state.scene.getObjectByName("codera-ribbon-reflection")
    if (reflection) {
      reflection.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          if (!mesh.userData.reflectionMaterial) {
            const own = (mesh.material as THREE.MeshStandardMaterial).clone()
            own.transparent = true
            own.opacity = 0
            own.envMapIntensity = 0.35
            own.color.setRGB(0.55, 0.53, 0.5)
            mesh.material = own
            mesh.userData.reflectionMaterial = true
          }
          const m = mesh.material as THREE.MeshStandardMaterial
          m.opacity = damp(m.opacity, pose.ribbon * 0.15, 10, dt)
          mesh.visible = m.opacity > 0.01
        }
      })
    }

    /* molten field + floor glow intensity */
    moltenTime += dt
    for (const name of ["codera-molten", "codera-floor-glow"]) {
      const node = state.scene.getObjectByName(name) as THREE.Mesh | undefined
      if (node) {
        const mat = node.material as THREE.ShaderMaterial
        mat.uniforms.uTime.value = moltenTime
        mat.uniforms.uIntensity.value = damp(
          mat.uniforms.uIntensity.value,
          stage.reducedMotion ? pose.molten * 0.6 : pose.molten,
          4,
          dt
        )
        node.visible = mat.uniforms.uIntensity.value > 0.02
      }
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
        <MoltenField />
        <Ribbon />
        <RibbonReflection />
        <FloorGlow />
        <Rig />
      </Canvas>
    </div>
  )
}

useGLTF.preload(RIBBON_URL)
