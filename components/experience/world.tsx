"use client"

/**
 * Žiara — the persistent world (AD v3).
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
  molten: number // target fog-field intensity
  ember: number // target frost-mote presence
  iridescence: number // heat-temper film on the C (OHZI: object owns the color)
  /* obsidian-shard presence 0..1 (AD v3 §Obsidián): raw matter that thins as
     the light rises — full in the fog, almost gone at the resolution */
  shards: number
}

/** Held camera poses per act; the pass act interpolates through the C. */
function desiredPose(): Pose {
  const { act } = stage
  const passP = stage.p.pass
  const resP = stage.p.resolution
  switch (act) {
    case "hero":
      /* board /01: the C sits right-of-centre, cropped by the frame edge */
      return {
        cam: [0.5, 0.36, 1.95],
        target: [-0.36, 0.0, 0],
        ribbon: 1,
        molten: 1,
        ember: 0.3,
        shards: 1,
        iridescence: 0,
      }
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
        /* the foundry breathes hardest mid-pass, then lets go */
        ember: Math.max(0.25, 4 * t * (1 - t)),
        shards: Math.max(0.35, 1 - t),
        iridescence: 0,
      }
    }
    case "resolution": {
      /* frontal pose, eye-line dropped so the C rides the upper half and
         the closing type owns the lower third (logo-lockup composition) */
      /* the bookend echoes the hero: the section-coloured C rides the RIGHT
         edge, large and half-cropped, clear of the centred copy and steps */
      const settle = 4.1 - 0.3 * resP
      return {
        cam: [0, 0.02, settle],
        target: [-0.62, 0.12, 0],
        ribbon: resP > 0.08 ? 1 : 0,
        molten: 0.35,
        ember: 0.22,
        shards: 0.55,
        /* the metal remembers the fire: thin-film temper colors bloom
           as the C settles into its final frontal pose */
        iridescence: 0.34 * resP,
      }
    }
    default:
      /* mid-journey acts: the DOM owns the frame; a few deep shards keep
         the world breathing behind it without touching the text */
      return { cam: [0, 0, 3.4], target: [0, 0, 0], ribbon: 0, molten: 0, ember: 0, iridescence: 0, shards: 0.42 }
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
  uniform vec2 uMouse;
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
    /* the pointer bends the flow — the liquid answers the hand (monopo) */
    float flow = fbm(p + vec2(t, -t * 0.6) + uMouse * 0.45 + fbm(p * 1.4 - t + uMouse * 0.25) * 0.9);

    /* Žiara fog: graphite depths, mist mids, one frost glow where the flow
       peaks [igloo: the light lives INSIDE the material]. No warmth. */
    vec3 graphite = vec3(0.055, 0.059, 0.075);
    vec3 slate    = vec3(0.118, 0.129, 0.157);
    vec3 mist     = vec3(0.31, 0.335, 0.38);
    vec3 frost    = vec3(0.862, 0.902, 0.933);

    vec3 col = graphite;
    col = mix(col, slate, smoothstep(0.3, 0.6, flow));
    col = mix(col, mist, smoothstep(0.55, 0.82, flow) * 0.7);
    col = mix(col, frost, smoothstep(0.78, 0.97, flow) * 0.35);

    /* a cool bloom trails the pointer through the fog */
    float md = distance(vUv, vec2(0.5) + uMouse * vec2(0.24, -0.18));
    col += frost * smoothstep(0.46, 0.0, md) * 0.06;

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
const mouseLerp = new THREE.Vector2()
const tone = new THREE.Color(ACT_TONES.hero)
const toneTarget = new THREE.Color()
let envTexture: THREE.Texture | null = null
let envApplied = false
let moltenTime = 0
const crystalTint = new THREE.Color("#cdd4dc")
const shardTint = new THREE.Color()
const mistTint = new THREE.Color("#6E7480")
const shardTarget = new THREE.Vector3()

/** Deterministic pseudo-random — keeps render pure (react-hooks v6). */
function prand(n: number) {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return s - Math.floor(s)
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt)
}

/**
 * The approved folded-ribbon C (Step 2), restored on Ondrej's instruction:
 * the mark from the brand reference is the mark — chevron terminals, the
 * central twist, the inner face showing through the fold. The Rig gives it
 * life instead of a new shape: a gentle side-to-side sway, crisper env
 * light, and a whisper of thin-film colour so the metal never reads dead.
 */
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

function MoltenField() {
  return (
    <mesh name="codera-molten" position={[-0.2, 0.1, -2.6]}>
      <planeGeometry args={[10.5, 6.2]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={MOLTEN_VERT}
        fragmentShader={MOLTEN_FRAG}
        uniforms={{
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
        }}
      />
    </mesh>
  )
}

/** Embers drifting off the molten field — Auros's particle atmosphere
    in the foundry's palette. Positions mutate in Rig's frame loop. */
const EMBER_COUNT = 130

function Embers() {
  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(EMBER_COUNT * 3)
    const spd = new Float32Array(EMBER_COUNT)
    for (let i = 0; i < EMBER_COUNT; i++) {
      pos[i * 3] = (prand(i) - 0.5) * 5.4 - 0.2
      pos[i * 3 + 1] = prand(i + 200) * 3.4 - 1.1
      pos[i * 3 + 2] = -0.4 - prand(i + 400) * 1.8
      spd[i] = 0.3 + prand(i + 600) * 0.85
    }
    return { positions: pos, seeds: spd }
  }, [])
  return (
    <points name="codera-embers" userData={{ seeds }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#dce6ee"
      />
    </points>
  )
}

/**
 * Obsidian shards — Ondrej's idea, AD v3 §Obsidián.
 *
 * Seven fractured pieces of chrome-black glass drifting in the fog: the raw
 * matter the ribbon was crafted from. Few and large, distributed in real
 * depth, biased right and up so they never sit over the copy zone
 * (bottom-left). Transforms are seeded and deterministic; all motion happens
 * in Rig's frame loop through userData, so React owns nothing on the hot
 * path. Non-uniform scale turns the icosahedron into a sliver; flat shading
 * gives it facets that catch the softbox like chrome.
 */
const SHARD_COUNT = 7

function ObsidianShards() {
  const shards = useMemo(
    () =>
      Array.from({ length: SHARD_COUNT }, (_, i) => {
        const big = i < 2 // two large ones live deep, behind the ribbon
        const s = big ? 0.34 + prand(i + 11) * 0.14 : 0.09 + prand(i + 11) * 0.1
        return {
          key: `shard-${i}`,
          position: [
            // right-and-up bias, away from the hero copy (bottom-left)
            -0.7 + prand(i + 31) * 3.4,
            -0.2 + prand(i + 53) * 2.1,
            big ? -2.3 - prand(i + 71) * 0.9 : -1.4 + prand(i + 71) * 1.6,
          ] as [number, number, number],
          scale: [s, s * (0.32 + prand(i + 97) * 0.25), s * (0.6 + prand(i + 13) * 0.3)] as [
            number,
            number,
            number,
          ],
          rotation: [prand(i + 3) * Math.PI, prand(i + 7) * Math.PI, prand(i + 19) * Math.PI] as [
            number,
            number,
            number,
          ],
          seed: {
            spin: 0.05 + prand(i + 41) * 0.09, // slow — obsidian has mass
            bob: 0.35 + prand(i + 61) * 0.5,
            phase: prand(i + 83) * Math.PI * 2,
            baseY: 0,
            parallax: big ? 0.25 : 0.6 + prand(i + 29) * 0.5,
          },
        }
      }),
    []
  )
  return (
    <group name="codera-shards">
      {shards.map((sh) => (
        <mesh
          key={sh.key}
          position={sh.position}
          scale={sh.scale}
          rotation={sh.rotation}
          userData={{ shardSeed: sh.seed }}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#171a20"
            metalness={0.3}
            roughness={0.14}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.9}
            emissive="#232a34"
            emissiveIntensity={0.4}
            flatShading
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
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
            gl_FragColor = vec4(0.86, 0.9, 0.93, a);
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
      <directionalLight position={[-0.9, 1.4, 5]} intensity={1.6} color="#edf3fa" />
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

    /* the molten field answers the pointer wherever it glows */
    const mSway = stage.reducedMotion ? 0 : 1
    mouseLerp.x = damp(mouseLerp.x, stage.pointerX * mSway, 4, dt)
    mouseLerp.y = damp(mouseLerp.y, stage.pointerY * mSway, 4, dt)

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

    /* ribbon material prep (once, per-mesh marker) + visibility. The GLB's
       standard material is upgraded to MeshPhysicalMaterial so the C can
       carry a thin-film heat-temper (iridescence) at the resolution —
       OHZI's law: the object owns all the color. */
    const ribbon = state.scene.getObjectByName("codera-ribbon")
    if (ribbon) {
      if (!stage.reducedMotion) {
        ribbon.rotation.y = Math.sin(moltenTime * 0.35) * 0.11 + pointerLerp.x * 0.08
        ribbon.rotation.x = Math.sin(moltenTime * 0.27 + 1) * 0.05 - pointerLerp.y * 0.05
      }
      ribbon.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          if (!mesh.userData.temperMaterial) {
            /* the GLB's satin-titanium is untextured PBR — rebuild it as
               physical explicitly (a prototype copy() would wipe the
               PHYSICAL define and wedge the shader compile) */
            const source = mesh.material as THREE.MeshStandardMaterial
            const phys = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0.84, 0.87, 0.9), // cool titanium (Žiara)
              metalness: source.metalness,
              roughness: source.roughness,
              side: source.side,
              transparent: true,
              opacity: source.opacity,
            })
            phys.envMapIntensity = 1.1
            phys.clearcoat = 0.5
            phys.clearcoatRoughness = 0.3
            phys.iridescence = 0
            phys.iridescenceIOR = 1.28
            phys.iridescenceThicknessRange = [120, 460]
            mesh.material = phys
            mesh.userData.temperMaterial = true
          }
          const mat = mesh.material as THREE.MeshPhysicalMaterial
          mat.opacity = damp(mat.opacity, pose.ribbon, 10, dt)
          mat.iridescence = damp(mat.iridescence, Math.max(pose.iridescence, 0.16), 5, dt)
          /* the section's own colour: cool titanium in the fog, graphite ink
             once the C stands on risen light */
          /* the mark stays WHITE like the brand reference — Ondrej's "toto C
             chcem čo najlepšie zachovať" outranks the section-ink idea; a
             graphite variant is one value away if he ever wants it */
          crystalTint.set("#d3d9df")
          mat.color.lerp(crystalTint, 1 - Math.exp(-4 * dt))
          /* metal on risen light: the bright softbox would wash the ink out,
             so the reflections dim with the act, not the colour alone */
          mat.envMapIntensity = damp(
            mat.envMapIntensity,
            stage.act === "resolution" ? 0.7 : 1.1,
            4,
            dt
          )
          /* the resolution stage is a narrow band — the C scales into it */
          const targetScale = stage.act === "resolution" ? 0.92 : 1
          const s = damp(mesh.scale.x, targetScale, 5, dt)
          mesh.scale.setScalar(s)
          mesh.visible = mat.opacity > 0.02
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
        if (mat.uniforms.uMouse) {
          ;(mat.uniforms.uMouse.value as THREE.Vector2).copy(mouseLerp)
        }
        mat.uniforms.uIntensity.value = damp(
          mat.uniforms.uIntensity.value,
          stage.reducedMotion ? pose.molten * 0.6 : pose.molten,
          4,
          dt
        )
        node.visible = mat.uniforms.uIntensity.value > 0.02
      }
    }

    /* Obsidian choreography (Iterácia 0.1). Four regimes, all scrubbed by
       real scroll state — interruptible at any point by construction:
       hero: home drift · pass: the ORBITAL — stones sweep around the C ·
       offer: they gather bottom-left to fill the quiet corner ·
       resolution: a calm frost-tinted circle around the standing C.
       Every move is a damp toward a target, so scrubbing backwards simply
       reverses the journey. Reduced motion: a composed still. */
    const shardsGroup = state.scene.getObjectByName("codera-shards")
    if (shardsGroup) {
      const still = stage.reducedMotion
      const act = stage.act
      const passT = stage.p.pass
      let i = 0
      for (const obj of shardsGroup.children) {
        const mesh = obj as THREE.Mesh
        const seed = mesh.userData.shardSeed as
          | { spin: number; bob: number; phase: number; baseY: number; parallax: number; home?: THREE.Vector3 }
          | undefined
        if (!seed) {
          continue
        }
        if (!seed.home) {
          seed.home = mesh.position.clone()
        }
        const mat = mesh.material as THREE.MeshPhysicalMaterial
        mat.opacity = damp(mat.opacity, pose.shards, 5, dt)
        mesh.visible = mat.opacity > 0.02

        if (act === "pass" && !still) {
          /* the orbital: angle rides SCROLL, radius tightens mid-flight */
          const sweep = seed.phase + passT * (Math.PI * 2.2) * (i % 2 ? 1 : -1)
          const r = 0.98 + (i % 3) * 0.09 - Math.sin(passT * Math.PI) * 0.18
          shardTarget.set(
            Math.cos(sweep) * r,
            Math.sin(sweep) * r * 0.42 + 0.05,
            Math.sin(sweep + 0.7) * 0.35 - 0.4
          )
        } else if (act === "offer") {
          /* the quiet corner, filled (Ondrej: dole vľavo) */
          shardTarget.set(
            -1.35 + (i % 3) * 0.22,
            -0.62 + Math.floor(i / 3) * 0.24 + Math.sin(moltenTime * seed.bob * 0.3 + seed.phase) * 0.04,
            -0.5 - (i % 2) * 0.3
          )
        } else if (act === "resolution") {
          const slow = moltenTime * 0.12 * (i % 2 ? 1 : -1) + seed.phase
          shardTarget.set(Math.cos(slow) * 1.5 - 0.55, Math.sin(slow) * 0.6 + 0.05, Math.sin(slow + 1.1) * 0.4 - 0.3)
        } else {
          shardTarget.set(
            seed.home.x,
            seed.home.y + Math.sin(moltenTime * seed.bob * 0.4 + seed.phase) * 0.07 + stage.total * seed.parallax * 0.9,
            seed.home.z
          )
        }
        const chase = act === "pass" ? 9 : 3.2
        if (!still) {
          mesh.position.x = damp(mesh.position.x, shardTarget.x, chase, dt)
          mesh.position.y = damp(mesh.position.y, shardTarget.y, chase, dt)
          mesh.position.z = damp(mesh.position.z, shardTarget.z, chase, dt)
          const spinBoost = act === "pass" ? 4 : 1
          mesh.rotation.x += dt * seed.spin * spinBoost
          mesh.rotation.y += dt * seed.spin * 0.7 * spinBoost
          mesh.rotation.z = damp(mesh.rotation.z, pointerLerp.x * 0.18, 3, dt)
        }

        /* stones take the section's colour after the orbital, and the
           emissive floor keeps facets alive — never flat black in motion */
        if (act === "hero") {
          shardTint.set("#171a20")
        } else if (act === "pass") {
          shardTint.set("#171a20").lerp(mistTint, passT)
        } else if (act === "resolution") {
          shardTint.set("#aeb8c4")
        } else {
          shardTint.copy(mistTint)
        }
        mat.color.lerp(shardTint, 1 - Math.exp(-3 * dt))
        i++
      }
    }

    /* embers rise off the melt; still air under reduced motion */
    const embers = state.scene.getObjectByName("codera-embers") as THREE.Points | undefined
    if (embers) {
      const mat = embers.material as THREE.PointsMaterial
      mat.opacity = damp(mat.opacity, stage.reducedMotion ? 0 : pose.ember * 0.55, 4, dt)
      embers.visible = mat.opacity > 0.01
      if (embers.visible) {
        const attr = embers.geometry.getAttribute("position") as THREE.BufferAttribute
        const seeds = embers.userData.seeds as Float32Array
        for (let i = 0; i < attr.count; i++) {
          let y = attr.getY(i) + dt * seeds[i] * 0.5
          const x = attr.getX(i) + Math.sin(moltenTime * seeds[i] + i * 1.7) * dt * 0.05
          if (y > 2.4) {
            y = -1.15
          }
          attr.setY(i, y)
          attr.setX(i, x)
        }
        attr.needsUpdate = true
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
        <Embers />
        <ObsidianShards />
        <Ribbon />
        <FloorGlow />
        <Rig />
      </Canvas>
    </div>
  )
}

useGLTF.preload(RIBBON_URL)
