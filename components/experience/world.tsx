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

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { ACT_TONES, type ActName, stage } from "./stage"

interface Pose {
  cam: [number, number, number]
  target: [number, number, number]
  molten: number // target fog-field intensity
  ember: number // target frost-mote presence
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
      /* straight-on (two-Cs pass): the stone letter must read symmetric and
         sit WHOLE in the centre of the right half — no edge cropping */
      return {
        cam: [0, 0.06, 2.1],
        target: [0, 0.05, 0],
        molten: 0.45,
        ember: 0.25,
        shards: 1,
      }
    case "pass": {
      /* dolly toward the C so it swallows the frame, then release it —
         the camera never leaves the object's front (an empty frustum
         reads as a dead wash, not a pass-through) */
      const t = passP
      return {
        cam: [0.5 - 0.34 * t, 0.36 - 0.3 * t, 1.95 - 1.35 * t],
        target: [-0.36 + 0.5 * t, 0.05 * t, -1.3 * t],
        molten: 0.45 * (1 - t),
        /* the foundry breathes hardest mid-pass, then lets go */
        ember: Math.max(0.25, 4 * t * (1 - t)),
        shards: Math.max(0.35, 1 - t),
      }
    }
    case "resolution": {
      /* frontal pose, eye-line dropped so the C rides the upper half and
         the closing type owns the lower third (logo-lockup composition) */
      /* the bookend echoes the hero: the section-coloured C rides the RIGHT
         edge, large and half-cropped, clear of the centred copy and steps */
      const settle = 4.1 - 0.3 * resP
      return {
        cam: [0, 0.06, settle],
        target: [-0.72, 0.36, 0],
        molten: 0.35,
        ember: 0.22,
        /* the stones ARE the closing C now — full presence */
        shards: 1,
      }
    }
    default:
      /* mid-journey acts: the DOM owns the frame; a few deep shards keep
         the world breathing behind it without touching the text */
      return { cam: [0, 0, 3.4], target: [0, 0, 0], molten: 0, ember: 0, shards: 0.42 }
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
const SHARD_COUNT = 22

/* The C letterform as assembly slots (amendment 7): stones line the open-C
   arc — gap on the right, like the mark — with radial and depth jitter so
   the letter reads as built from rock, not beads on a wire. */
const C_CENTER = { x: 0.47, y: 0.04, z: 0 }
const C_R = 0.4
/* the SECOND letter (Ondrej: "úplne dole poskladajú druhé céčko"): the
   stones reassemble at the origin for the /04 bookend, where the far camera
   frames it right-of-centre and whole */
const C2_CENTER = { x: 0, y: 0.38, z: 0 }
const C2_R = 0.46
const C_GAP = 0.62 // half-angle of the right-facing gap
function slotFor(i: number, c = C_CENTER, radius = C_R) {
  const t = i / (SHARD_COUNT - 1)
  const a = C_GAP + t * (Math.PI * 2 - C_GAP * 2)
  const r = radius + (prand(i + 301) - 0.5) * 0.09 * (radius / C_R)
  return new THREE.Vector3(
    c.x + Math.cos(a) * r,
    c.y + Math.sin(a) * r * 1.04,
    c.z + (prand(i + 401) - 0.5) * 0.14
  )
}

function ObsidianShards() {
  const shards = useMemo(
    () =>
      Array.from({ length: SHARD_COUNT }, (_, i) => {
        const big = i < 2 // two slightly larger anchors in the letter
        const s = big ? 0.17 + prand(i + 11) * 0.05 : 0.09 + prand(i + 11) * 0.07
        return {
          key: `shard-${i}`,
          /* birth positions: scattered across the RIGHT half, so the load
             assembly happens where the letter lives and never over the copy */
          position: [
            0.15 + prand(i + 31) * 1.6,
            -0.9 + prand(i + 53) * 1.9,
            -1.6 + prand(i + 71) * 1.9,
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
            /* where this stone settles once the letter breaks apart */
            bg: new THREE.Vector3(
              i % 3 === 2 ? -1.8 + prand(i + 31) * 1.1 : -0.5 + prand(i + 31) * 3.2,
              -0.35 + prand(i + 53) * 2.2,
              -2.4 + prand(i + 71) * 1.9
            ),
            grow: 1,
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
          | {
              spin: number
              bob: number
              phase: number
              baseY: number
              parallax: number
              bg: THREE.Vector3
              baseScale?: THREE.Vector3
              grow: number
            }
          | undefined
        if (!seed) {
          continue
        }
        const mat = mesh.material as THREE.MeshPhysicalMaterial
        mat.opacity = damp(mat.opacity, pose.shards, 5, dt)
        mesh.visible = mat.opacity > 0.02

        /* the /04 camera stands far back — the stones grow so the second
           letter reads as chunky as the first */
        if (!seed.baseScale) {
          seed.baseScale = mesh.scale.clone()
        }
        seed.grow = damp(seed.grow, act === "resolution" ? 1.45 : 1, 3, dt)
        mesh.scale.copy(seed.baseScale).multiplyScalar(seed.grow)

        if (act === "hero") {
          /* ASSEMBLY (amendment 7): every stone chases its letter slot; the
             per-stone chase rates make the load build staggered and smooth */
          shardTarget.copy(slotFor(i))
        } else if (act === "pass" && !still) {
          /* the BREAK-UP, scrubbed: slot → background home, with a radial
             burst that peaks mid-flight so the letter visibly shatters —
             scroll back and it reassembles, same math in reverse */
          const k = passT * passT * (3 - 2 * passT)
          const slot = slotFor(i)
          shardTarget.lerpVectors(slot, seed.bg, k)
          const burst = Math.sin(passT * Math.PI) * 0.38
          const dx = slot.x - C_CENTER.x
          const dy = slot.y - C_CENTER.y
          const dl = Math.max(0.001, Math.hypot(dx, dy))
          shardTarget.x += (dx / dl) * burst
          shardTarget.y += (dy / dl) * burst
        } else if (act === "offer") {
          /* the quiet corner, filled (Ondrej: dole vľavo) */
          shardTarget.set(
            -1.5 + (i % 6) * 0.19,
            -0.72 + Math.floor(i / 6) * 0.21 + Math.sin(moltenTime * seed.bob * 0.3 + seed.phase) * 0.04,
            -0.5 - (i % 2) * 0.35
          )
        } else if (act === "resolution") {
          /* the SECOND assembly: the letter returns at the bookend, breathing */
          shardTarget.copy(slotFor(i, C2_CENTER, C2_R))
          shardTarget.y += Math.sin(moltenTime * seed.bob * 0.35 + seed.phase) * 0.03
        } else {
          /* the background asteroids the letter became */
          shardTarget.set(
            seed.bg.x,
            seed.bg.y + Math.sin(moltenTime * seed.bob * 0.4 + seed.phase) * 0.07 + stage.total * seed.parallax * 0.5,
            seed.bg.z
          )
        }
        const chase = act === "pass" ? 9 : act === "hero" ? 2.1 + prand(i + 501) * 1.6 : 3.2
        if (!still) {
          mesh.position.x = damp(mesh.position.x, shardTarget.x, chase, dt)
          mesh.position.y = damp(mesh.position.y, shardTarget.y, chase, dt)
          mesh.position.z = damp(mesh.position.z, shardTarget.z, chase, dt)
          const spinBoost = act === "pass" ? 1.5 : 1
          mesh.rotation.x += dt * seed.spin * spinBoost
          mesh.rotation.y += dt * seed.spin * 0.7 * spinBoost
          mesh.rotation.z = damp(mesh.rotation.z, act === "pass" ? 0 : pointerLerp.x * 0.18, 3, dt)
        }

        /* stones take the section's colour after the orbital, and the
           emissive floor keeps facets alive — never flat black in motion */
        if (act === "hero") {
          shardTint.set("#171a20")
        } else if (act === "pass") {
          shardTint.set("#171a20").lerp(mistTint, passT)
        } else if (act === "resolution") {
          shardTint.set("#262a31")
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
        <FloorGlow />
        <Rig />
      </Canvas>
    </div>
  )
}

