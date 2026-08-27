"use client"

/**
 * Dev-only validation bakery for the 3D ribbon mark (same pattern as
 * /textures): renders public/brand/codera-c-ribbon.glb with neutral studio
 * lighting and exposes the frame as a PNG data URL on window.__shot for the
 * capture tooling. Not linked from the site.
 *
 * ?view=front   — orthographic front identity view
 * ?view=oblique — 3/4 perspective view
 * ?size=1200    — canvas size (square)
 */

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    __shot?: string
    __shotReady?: boolean
  }
}

export default function LogoLab() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState("loading three…")

  useEffect(() => {
    let disposed = false
    async function run() {
      const three = await import("three")
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js")
      if (disposed || !mountRef.current) {
        return
      }

      const params = new URLSearchParams(window.location.search)
      const view = params.get("view") ?? "front"
      const size = Number.parseInt(params.get("size") ?? "1200", 10)

      const renderer = new three.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      })
      renderer.setSize(size, size)
      renderer.setPixelRatio(1)
      renderer.toneMapping = three.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.92
      mountRef.current.appendChild(renderer.domElement)

      const scene = new three.Scene()
      scene.background = new three.Color("#101012")

      /* Custom softbox environment: one large soft panel upper-front-left,
         a faint counter panel right, black surround — the studio look of
         the approved reference, so orientation drives tone. */
      const envScene = new three.Scene()
      envScene.background = new three.Color("#050506")
      const softbox = (color: string, intensity: number, w: number, h: number, pos: [number, number, number], look: [number, number, number]) => {
        const mat = new three.MeshBasicMaterial({ color })
        mat.color.multiplyScalar(intensity)
        const mesh = new three.Mesh(new three.PlaneGeometry(w, h), mat)
        mesh.position.set(...pos)
        mesh.lookAt(...look)
        envScene.add(mesh)
      }
      softbox("#ffffff", 3.2, 13, 10, [-1.2, 1.8, 7.5], [0, 0, 0])
      softbox("#aab0b8", 0.7, 3, 6, [6, 0, 1.5], [0, 0, 0])
      const pmrem = new three.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(envScene, 0.08).texture

      /* Frontal product-photography key: near the camera axis, slightly
         up-left. Viewer-facing straps light fully; the tilted bowl falls
         off — the shading logic of the approved reference. */
      const key = new three.DirectionalLight("#ffffff", 1.6)
      key.position.set(-0.9, 1.4, 5)
      scene.add(key)
      /* Ambient lift: brings the folded-back band to the reference's
         mid-grey instead of dropping it to black. */
      scene.add(new three.AmbientLight("#ffffff", 0.6))

      const loader = new GLTFLoader()
      loader.load(
        "/brand/codera-c-ribbon.glb?ts=" + Date.now(),
        (gltf) => {
          if (disposed) {
            return
          }
          gltf.scene.traverse((obj) => {
            const mesh = obj as { material?: { envMapIntensity?: number } }
            if (mesh.material) {
              mesh.material.envMapIntensity = 1.0
            }
          })
          scene.add(gltf.scene)

          let camera: InstanceType<typeof three.OrthographicCamera> | InstanceType<typeof three.PerspectiveCamera>
          if (view === "front") {
            const half = 0.62
            camera = new three.OrthographicCamera(-half, half, half, -half, 0.01, 10)
            camera.position.set(0, 0, 3)
          } else {
            camera = new three.PerspectiveCamera(32, 1, 0.01, 20)
            camera.position.set(1.35, 0.65, 1.75)
          }
          camera.lookAt(0, 0, 0)

          renderer.render(scene, camera)
          window.__shot = renderer.domElement.toDataURL("image/png")
          window.__shotReady = true
          setStatus(`rendered: ${view}`)
        },
        undefined,
        (error) => setStatus(`load error: ${String(error)}`)
      )
    }
    run()
    return () => {
      disposed = true
    }
  }, [])

  return (
    <div style={{ background: "#101012", minHeight: "100svh", color: "#888" }}>
      <p style={{ position: "fixed", top: 4, left: 8, fontSize: 12 }}>{status}</p>
      <div ref={mountRef} />
    </div>
  )
}
