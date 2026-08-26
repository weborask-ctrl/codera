"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useMemo } from "react"
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Color,
  DoubleSide,
  Fog,
  PMREMGenerator,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

import { film, PLANE, PLANES } from "@/components/world/film"
import { createRibbonGeometry } from "@/lib/ribbon-mesh"

/**
 * The persistent world — Phase 3 scope: the ribbon, the transformation plane,
 * one lighting rig, and a camera posed every frame from the shared film.
 *
 * Deliberate absences: no postprocessing, no per-frame React state, no drei
 * scroll helpers (GSAP owns the timeline), no downloaded environment — the
 * reflections come from RoomEnvironment rendered to a PMREM at mount.
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

/** One material recipe for the mark and its strands. */
function metalProps(roughnessMap: CanvasTexture) {
  return {
    color: "#2c2c2e",
    metalness: 0.85,
    roughness: 0.34,
    roughnessMap,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.75,
  } as const
}

/** Depth fan of the three strands at full separation. */
const STRAND_OFFSETS = [-1.7, 0, 1.7]

function Ribbon() {
  const geometry = useMemo(() => createRibbonGeometry(), [])
  const strandGeometries = useMemo(
    () => [
      createRibbonGeometry({ uMin: -1, uMax: -1 / 3 }),
      createRibbonGeometry({ uMin: -1 / 3, uMax: 1 / 3 }),
      createRibbonGeometry({ uMin: 1 / 3, uMax: 1 }),
    ],
    []
  )
  const roughnessMap = useMemo(() => makeRoughnessTexture(), [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      for (const strand of strandGeometries) {
        strand.dispose()
      }
      roughnessMap.dispose()
    }
  }, [geometry, strandGeometries, roughnessMap])

  useFrame((state) => {
    const split = film.strand > 0.001

    /* The whole mark and its three strands are the same geometry cut
       lengthwise, so swapping visibility at the moment of separation is
       seamless — and the swap happens while the camera is far away. */
    const whole = state.scene.getObjectByName("codera-ribbon")
    if (whole) {
      whole.visible = !split
      whole.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.08 * film.idle
      whole.rotation.x = Math.cos(state.clock.elapsedTime * 0.09) * 0.04 * film.idle
    }

    for (let i = 0; i < 3; i++) {
      const strand = state.scene.getObjectByName(`codera-strand-${i}`)
      if (!strand) {
        continue
      }
      strand.visible = split
      strand.position.z = STRAND_OFFSETS[i] * film.strand
      strand.position.y = (i - 1) * 0.22 * film.strand
      const material = (strand as unknown as {
        material: { emissiveIntensity: number }
      }).material
      const glow = i === 0 ? film.glow0 : i === 1 ? film.glow1 : film.glow2
      material.emissiveIntensity = glow * 0.55
    }
  })

  return (
    <>
      <mesh name="codera-ribbon" geometry={geometry}>
        <meshPhysicalMaterial {...metalProps(roughnessMap)} />
      </mesh>
      {strandGeometries.map((strand, index) => (
        <mesh
          // biome-ignore lint/suspicious/noArrayIndexKey: the strands are positional by definition.
          key={index}
          name={`codera-strand-${index}`}
          geometry={strand}
          visible={false}
        >
          <meshPhysicalMaterial
            {...metalProps(roughnessMap)}
            emissive="#c8b898"
            emissiveIntensity={0}
          />
        </mesh>
      ))}
    </>
  )
}

/**
 * The transformation surface: the 2011 site and the Codera concept as two
 * baked textures on one subdivided plane. `film.morph` drives both the
 * geometry (the dated site hangs slack; it pulls flat as it transforms) and
 * a sweep that wipes the new site across, echoing the v1 comparison.
 *
 * Unlit shader on purpose — a website is a light source, not a lit object,
 * and an unlit plane is by far the cheapest thing in the scene.
 */
const PLANE_VERTEX = /* glsl */ `
  uniform float uMorph;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Slack cloth: three soft interference dents, flattening with morph.
    float slack = 1.0 - uMorph;
    p.z += slack * 0.55 * (
      sin(uv.x * 6.8 + 1.2) * sin(uv.y * 5.1 + 0.4) * 0.6 +
      sin(uv.x * 12.4 + 3.1) * sin(uv.y * 9.7 + 2.2) * 0.25 +
      sin(uv.x * 3.1) * 0.3
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const PLANE_FRAGMENT = /* glsl */ `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uMorph;
  uniform float uReveal;
  varying vec2 vUv;

  void main() {
    vec4 a = texture2D(uTexA, vUv);
    // The dated site sits dim and slightly drained until the wipe reaches it.
    float grey = dot(a.rgb, vec3(0.299, 0.587, 0.114));
    a.rgb = mix(a.rgb, vec3(grey), 0.35) * 0.8;

    vec4 b = texture2D(uTexB, vUv);

    // The wipe travels with the morph, soft-edged, left to right — the same
    // gesture as the v1 comparison handle.
    float edge = smoothstep(vUv.x - 0.09, vUv.x + 0.09, uMorph * 1.18 - 0.09);
    vec4 c = mix(a, b, edge);
    gl_FragColor = vec4(c.rgb, c.a * uReveal);
  }
`

function TransformPlane() {
  const gl = useThree((state) => state.gl)

  const { material, textures } = useMemo(() => {
    const loader = new TextureLoader()
    const load = (url: string) => {
      const texture = loader.load(url)
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
      return texture
    }
    const texA = load("/work/legacy.jpg")
    const texB = load("/work/konstrukt.jpg")
    return {
      textures: [texA, texB],
      material: new ShaderMaterial({
        uniforms: {
          uTexA: { value: texA },
          uTexB: { value: texB },
          uMorph: { value: 0 },
          uReveal: { value: 0 },
        },
        vertexShader: PLANE_VERTEX,
        fragmentShader: PLANE_FRAGMENT,
        side: DoubleSide,
        transparent: true,
      }),
    }
  }, [gl])

  useEffect(() => {
    return () => {
      material.dispose()
      for (const texture of textures) {
        texture.dispose()
      }
    }
  }, [material, textures])

  /* Uniforms are written through the frame state's scene lookup — the same
     route the ribbon's idle motion takes — so the per-frame mutation never
     touches a hook-tracked value. */
  useFrame((state) => {
    const mesh = state.scene.getObjectByName("transform-plane")
    const shader = (mesh as { material?: ShaderMaterial } | null)?.material
    if (shader?.uniforms) {
      shader.uniforms.uMorph.value = film.morph
      shader.uniforms.uReveal.value = film.planeReveal
    }
  })

  return (
    <mesh
      name="transform-plane"
      position={[PLANE.position[0], PLANE.position[1], PLANE.position[2]]}
      material={material}
    >
      <planeGeometry args={[PLANE.width, PLANE.height, 48, 30]} />
    </mesh>
  )
}

/**
 * A project surface: one baked texture, revealed as the camera approaches.
 * Unlit, transparent, opacity driven per-frame through the scene lookup.
 */
function ProjectPlane({
  name,
  url,
  position,
  rotationY,
  width,
  height,
  filmKey,
}: {
  name: string
  url: string
  position: readonly [number, number, number]
  rotationY: number
  width: number
  height: number
  filmKey: "planeVitalis" | "planeForma"
}) {
  const gl = useThree((state) => state.gl)

  const texture = useMemo(() => {
    const loaded = new TextureLoader().load(url)
    loaded.colorSpace = SRGBColorSpace
    loaded.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
    return loaded
  }, [gl, url])

  useEffect(() => {
    return () => texture.dispose()
  }, [texture])

  useFrame((state) => {
    const mesh = state.scene.getObjectByName(name)
    const material = (mesh as { material?: { opacity: number } } | null)
      ?.material
    if (material) {
      material.opacity = film[filmKey]
    }
  })

  return (
    <mesh
      name={name}
      position={[position[0], position[1], position[2]]}
      rotation={[0, rotationY, 0]}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={0} />
    </mesh>
  )
}

/**
 * Generated studio environment + fog, attached declaratively so R3F owns the
 * scene assignment and detaches both on unmount.
 */
function Atmosphere() {
  const gl = useThree((state) => state.gl)

  const envTexture = useMemo(() => {
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04)
    pmrem.dispose()
    return env.texture
  }, [gl])
  const fog = useMemo(() => new Fog("#0d0d0f", 18, 46), [])

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

/**
 * Environment tones: the world takes on the character of the project it is
 * showing — the dark → light → dark rhythm from v1, now carried by the
 * atmosphere itself. Fog and background always agree, so depth reads as air
 * rather than as a gradient.
 */
const TONES = [
  new Color("#0d0d0f"), // graphite — Konštrukt
  new Color("#e8e6e0"), // paper — Vitalis
  new Color("#e9e2d6"), // warm paper — Forma
]

function Rig() {
  const camera = useThree((state) => state.camera)
  const target = useMemo(() => new Vector3(), [])
  const tone = useMemo(() => new Color(), [])

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

    /* Piecewise lerp through the three tones, written straight onto the
       scene's background and fog so they can never disagree. */
    const t = Math.max(0, Math.min(2, film.envTone))
    if (t <= 1) {
      tone.lerpColors(TONES[0], TONES[1], t)
    } else {
      tone.lerpColors(TONES[1], TONES[2], t - 1)
    }
    const scene = state.scene
    if (scene.background instanceof Color) {
      scene.background.copy(tone)
    }
    if (scene.fog) {
      scene.fog.color.copy(tone)
    }
  })

  return null
}

export default function RibbonWorld() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.1, far: 70, position: [1.7, 4.75, 2.1] }}
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
      <Suspense fallback={null}>
        <TransformPlane />
        <ProjectPlane
          name="plane-vitalis"
          url="/work/vitalis.jpg"
          filmKey="planeVitalis"
          {...PLANES.vitalis}
        />
        <ProjectPlane
          name="plane-forma"
          url="/work/forma.jpg"
          filmKey="planeForma"
          {...PLANES.forma}
        />
      </Suspense>
      <Rig />
    </Canvas>
  )
}
