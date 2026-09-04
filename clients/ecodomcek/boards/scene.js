/**
 * EcoDomček boards — the world.
 *
 * A procedural "wooden architectural model" of the vzorový dom (spatial
 * skeleton from the Matterport reference, materials EcoDomček's), rendered
 * with three.js under the four light states of the journey (morning,
 * interior, table, dusk). One scene, one camera pose per board; DOM copy
 * lives in index.html, annotations are projected from 3D anchors.
 *
 * This is a held-frame study for art direction review, not the production
 * scene — proportions are estimated from the reference scans.
 */
import * as THREE from "./vendor/three.module.js"

// ---------------------------------------------------------------- setup
const params = new URLSearchParams(location.search)
const board = params.get("board") ?? "hero"
const device = params.get("device") ?? "desktop"
document.body.dataset.board = board
document.body.dataset.device = device
for (const s of document.querySelectorAll(".board")) s.classList.toggle("on", s.dataset.for === board)
const active = document.querySelector(`.board[data-for="${board}"]`)
document.getElementById("index").textContent = active?.dataset.index ?? ""
for (const c of document.querySelectorAll(".chip")) c.classList.toggle("on", c.dataset.room === board)
const dots = { hero: [36, 82], living: [36, 22], xray: [70, 40], dollhouse: [165, 20], dusk: [36, 82] }
const dot = document.getElementById("mm-dot")
if (dot && dots[board]) {
  dot.setAttribute("cx", dots[board][0])
  dot.setAttribute("cy", dots[board][1])
}

const mode = params.get("render") ? "render" : "webgl"
document.body.dataset.mode = mode
if (mode === "render") {
  const img = document.getElementById("render")
  img.hidden = false
  img.src = `render/${board}-${device}.png`
  const labels = {
    vzorovy: { lab: "Vzorový dom", small: "koncept, nie realizácia", signal: true, side: "auto" },
    fasada: { lab: "Fasáda · smrekovec Rhombus", side: "left" },
    layer1: { lab: "Smrekovcový obklad Rhombus", small: "fasáda", col: true },
    layer2: { lab: "Odvetraná medzera", small: "laty", col: true },
    layer3: { lab: "Drevovláknitá doska", small: "difúzne otvorená", col: true },
    layer4: { lab: "Nosný rám + izolácia", small: "drevovlákno · konope", col: true, signal: true },
    layer5: { lab: "Sadrovláknitá doska", small: "vzduchotesná rovina", col: true },
    layer6: { lab: "Inštalačná vrstva", small: "ovčia vlna", col: true },
    layer7: { lab: "Sadrovláknitá doska", small: "interiér", col: true },
  }
  const place = (anchors) => {
    const host = document.getElementById("annotations")
    host.innerHTML = ""
    const w = innerWidth
    const h = innerHeight
    const list = Object.entries(anchors)
      .filter(([id]) => labels[id])
      .map(([id, [u, v]]) => ({ ...labels[id], x: u * w, y: v * h }))
    const cols = list.filter((a) => a.col).sort((a, b) => a.x - b.x)
    const rowTop = device === "mobile" ? 120 : 132
    cols.forEach((a, i) => {
      const y = rowTop + i * 36
      const el = document.createElement("div")
      el.className = `ann col${a.signal ? " signal" : ""}`
      el.style.left = `${a.x}px`
      el.style.top = `${y}px`
      el.innerHTML = `<span class="lab">${a.lab}${a.small ? `<small>${a.small}</small>` : ""}</span><span class="vline"></span><span class="dot"></span>`
      host.appendChild(el)
      const lab = el.querySelector(".lab")
      el.querySelector(".vline").style.height = `${Math.max(8, a.y - y - lab.offsetHeight - 5)}px`
    })
    for (const a of list.filter((a) => !a.col)) {
      const side = a.side === "auto" ? (a.x > w * 0.58 ? "left" : "right") : a.side
      a.y = Math.max(a.y, device === "mobile" ? 148 : 96)  // never under the nav
      const el = document.createElement("div")
      el.className = `ann ${side}${a.signal ? " signal" : ""}`
      el.style.left = `${a.x}px`
      el.style.top = `${a.y}px`
      el.innerHTML = `<span class="dot"></span><span class="line"></span><span class="lab">${a.lab}${a.small ? `<small>${a.small}</small>` : ""}</span>`
      host.appendChild(el)
    }
  }
  const ready = () => {
    window.__boardReady = true
  }
  Promise.all([
    document.fonts.ready,
    new Promise((ok) => {
      img.onload = ok
      img.onerror = ok
    }),
    fetch(`render/${board}-${device}.anchors.json`)
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({})),
  ]).then(([, , anchors]) => {
    place(anchors)
    addEventListener("resize", () => place(anchors))
    requestAnimationFrame(ready)
  })
  throw new Error("render-mode: WebGL scene skipped")
}

const C = {
  paper: 0xf3ede2,
  paper2: 0xe8dfce,
  ink: 0x2b2520,
  moss: 0x4e6b21,
  dusk: 0x1b2430,
  amber: 0xf2c46d,
  larch: "#c89a5b",
  larchJoint: "#8a6636",
  anth: 0x2e2f31,
  spruce: "#e9d9bd",
  spruceJoint: "#cdb996",
  glass: 0x7a8c96,
  fabric: 0x4a4a4c,
  fibre: 0xb89a5c,
  hemp: 0xcdb98a,
  wool: 0xe6dcc8,
  board: 0xd8d2c7,
  plaster: 0xefe9dd,
}

let seed = 7
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

function shade(hex, v) {
  const c = new THREE.Color(hex)
  c.offsetHSL(0, 0, v)
  return `#${c.getHexString()}`
}

/** Plank texture: `planks` boards per tile, a joint line, a bevel highlight. */
function planks({ base, joint, planks = 16, vertical = false, variance = 0.045, bevel = true }) {
  const s = 1024
  const cv = document.createElement("canvas")
  cv.width = cv.height = s
  const g = cv.getContext("2d")
  const ph = s / planks
  for (let i = 0; i < planks; i++) {
    const v = (rnd() * 2 - 1) * variance
    g.fillStyle = shade(base, v)
    if (vertical) g.fillRect(i * ph, 0, ph, s)
    else g.fillRect(0, i * ph, s, ph)
    // faint grain
    g.strokeStyle = shade(base, v - 0.05)
    g.lineWidth = 1
    for (let k = 0; k < 5; k++) {
      const off = rnd() * ph
      g.globalAlpha = 0.18
      g.beginPath()
      if (vertical) {
        g.moveTo(i * ph + off, 0)
        g.lineTo(i * ph + off + (rnd() - 0.5) * 6, s)
      } else {
        g.moveTo(0, i * ph + off)
        g.lineTo(s, i * ph + off + (rnd() - 0.5) * 6)
      }
      g.stroke()
      g.globalAlpha = 1
    }
    if (bevel) {
      g.fillStyle = shade(base, v + 0.07)
      if (vertical) g.fillRect(i * ph, 0, 3, s)
      else g.fillRect(0, i * ph, s, 3)
      g.fillStyle = shade(base, v - 0.06)
      if (vertical) g.fillRect(i * ph + ph - 7, 0, 4, s)
      else g.fillRect(0, i * ph + ph - 7, s, 4)
    }
    g.fillStyle = joint
    if (vertical) g.fillRect(i * ph + ph - 3, 0, 3, s)
    else g.fillRect(0, i * ph + ph - 3, s, 3)
  }
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

const TILE = 16 * 0.12 // metres per texture tile (16 planks × 120 mm)
const texLarch = planks({ base: C.larch, joint: C.larchJoint })
const texLarchV = planks({ base: C.larch, joint: C.larchJoint, vertical: true })
const texSpruce = planks({ base: C.spruce, joint: C.spruceJoint, variance: 0.02, bevel: false })
const texSpruceV = planks({ base: C.spruce, joint: C.spruceJoint, variance: 0.02, bevel: false, vertical: true })

const matAnth = new THREE.MeshStandardMaterial({ color: C.anth, roughness: 0.55, metalness: 0.05 })
const matFabric = new THREE.MeshStandardMaterial({ color: C.fabric, roughness: 0.95 })
const matGlass = new THREE.MeshStandardMaterial({
  color: 0xa8b6bd,
  roughness: 0.12,
  metalness: 0,
  transparent: true,
  opacity: 0.5,
})
const matFibre = new THREE.MeshStandardMaterial({ color: C.fibre, roughness: 1 })
const matHemp = new THREE.MeshStandardMaterial({ color: C.hemp, roughness: 1 })
const matWool = new THREE.MeshStandardMaterial({ color: C.wool, roughness: 1 })
const matBoard = new THREE.MeshStandardMaterial({ color: C.board, roughness: 0.9 })
const matPlaster = new THREE.MeshStandardMaterial({ color: C.plaster, roughness: 0.95 })

function woodMat(tex, w, h, extra = {}) {
  const t = tex.clone()
  t.needsUpdate = true
  t.repeat.set(w / TILE, h / TILE)
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, metalness: 0, ...extra })
}

const scene = new THREE.Scene()
const dusk = board === "dusk"
const bg = dusk ? C.dusk : board === "dollhouse" ? C.paper2 : C.paper
scene.background = new THREE.Color(bg)
scene.fog = new THREE.Fog(bg, dusk ? 22 : 30, dusk ? 60 : 80)

function box(w, h, d, mat, x, y, z, { shadow = true } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = shadow
  m.receiveShadow = true
  scene.add(m)
  return m
}
/** Box from bounds [x0,x1],[y0,y1],[z0,z1]. */
function span(mat, [x0, x1], [y0, y1], [z0, z1], opt) {
  return box(x1 - x0, y1 - y0, z1 - z0, mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, opt)
}
const larch = (w, h) => woodMat(texLarch, w, h)
const larchV = (w, h) => woodMat(texLarchV, w, h)
const spruce = (w, h) => woodMat(texSpruce, w, h, { roughness: 0.9 })

// ---------------------------------------------------------------- ground
function buildGround() {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ color: bg, roughness: 1 }),
  )
  g.rotation.x = -Math.PI / 2
  g.receiveShadow = true
  scene.add(g)
}
buildGround()

// ---------------------------------------------------------------- house
// Footprint 8 × 10 m, two storeys over the garden side (the street-level
// garage of the reference sits below grade on the far side — not modelled
// in this study). +z faces the garden and the camera.
const T = 0.32 // wall thickness
const H1 = 3.15 // ground-floor height (to the slab)
const H = 6.3 // top of the second storey
const roofGroup = new THREE.Group()
scene.add(roofGroup)

// walls
span(larch(8, H), [-4, 4], [0, H], [-5, -5 + T]) // back
span(larch(10, H), [-4, -4 + T], [0, H], [-5, 5]) // left
span(larch(10, H), [4 - T, 4], [0, H], [-5, 5]) // right
// front wall with the ground-floor opening x∈[-2.7,1.5], y∈[0.15,2.55]
span(larch(1.3, 2.55), [-4, -2.7], [0, 2.55], [5 - T, 5])
span(larch(2.5, 2.55), [1.5, 4], [0, 2.55], [5 - T, 5])
span(larch(8, H - 2.55), [-4, 4], [2.55, H], [5 - T, 5])

// slabs and linings
span(spruce(8, 10), [-4 + T, 4 - T], [0, 0.15], [-5 + T, 5]) // ground floor
span(spruce(8, 10), [-4 + T, 4 - T], [H1 - 0.3, H1], [-5 + T, 5 - T]) // first-floor slab (ceiling of the living room)
function buildLinings() {
  // interior lining: spruce faces just inside the larch boxes
  const lin = (mat, ...b) => span(mat, ...b, { shadow: false })
  lin(spruce(8, H1), [-4 + T, 4 - T], [0.15, H1 - 0.3], [-5 + T, -5 + T + 0.02])
  lin(woodMat(texSpruceV, 10, H1), [-4 + T, -4 + T + 0.02], [0.15, H1 - 0.3], [-5 + T, 5 - T])
  lin(woodMat(texSpruceV, 10, H1), [4 - T - 0.02, 4 - T], [0.15, H1 - 0.3], [-5 + T, 5 - T])
  // upper floor partition (visible in the dollhouse)
  span(spruce(5, H - H1), [-0.06, 0.06], [H1, H - 0.05], [-5 + T, 0.4])
}
buildLinings()

// roof: anthracite slab with fascia, lifted in the dollhouse act
function buildRoof() {
  const slab = span(matAnth, [-4.18, 4.18], [H, H + 0.34], [-5.18, 5.18])
  const fascia = span(matAnth, [-4.2, 4.2], [H - 0.28, H + 0.34], [-5.2, 5.2])
  scene.remove(slab, fascia)
  roofGroup.add(slab, fascia)
}
buildRoof()

// the anthracite cantilever box over the entrance (Lúčina motif)
function buildCantilever() {
  const b = span(matAnth, [1.5, 4.7], [H1, H - 0.02], [3.6, 6.3])
  scene.remove(b)
  const g = new THREE.Group()
  g.add(b)
  // a window in its front face
  const f = span(matAnth, [2.2, 4.0], [4.1, 5.5], [6.3, 6.36])
  scene.remove(f)
  const back = span(spruce(1.8, 1.4), [2.3, 3.9], [4.2, 5.4], [6.26, 6.3], { shadow: false })
  scene.remove(back)
  const gl = span(matGlass, [2.3, 3.9], [4.2, 5.4], [6.32, 6.34], { shadow: false })
  scene.remove(gl)
  g.add(f, back, gl)
  scene.add(g)
  // entrance door under the box, set back into the front wall
  span(matAnth, [2.3, 3.4], [0.15, 2.35], [5 - T - 0.02, 5 - T + 0.02])
}
buildCantilever()

// windows on the larch faces: proud anthracite frame + inset glass
function win([x0, x1], [y0, y1], z, dir = 1) {
  const f = 0.08
  const zf = z + dir * 0.04
  span(matAnth, [x0 - f, x1 + f], [y0 - f, y1 + f], [zf - 0.03, zf + 0.03])
  span(matGlass, [x0, x1], [y0, y1], [zf + dir * 0.005, zf + dir * 0.015], { shadow: false })
}
win([-3.3, -2.3], [3.9, 5.7], 5) // upper front, left
win([-1.4, 0.0], [3.9, 5.7], 5) // upper front, right
// left wall windows (x = -4)
function winX([z0, z1], [y0, y1], x) {
  const f = 0.08
  const xf = x - 0.04
  span(matAnth, [xf - 0.03, xf + 0.03], [y0 - f, y1 + f], [z0 - f, z1 + f])
  span(matGlass, [xf - 0.015, xf - 0.005], [y0, y1], [z0, z1], { shadow: false })
}
winX([-1.2, 0.6], [1.0, 2.5], -4)
winX([-3.4, -2.4], [3.9, 5.7], -4)
winX([1.0, 2.0], [3.9, 5.7], -4)

// the living-room opening: glass wall in an anthracite frame
function buildOpening() {
  span(matAnth, [-2.78, 1.58], [2.55, 2.63], [5 - T, 5]) // lintel edge
  span(matAnth, [-2.78, -2.7], [0.15, 2.55], [5 - T, 5])
  span(matAnth, [1.5, 1.58], [0.15, 2.55], [5 - T, 5])
  span(matAnth, [-0.62, -0.56], [0.15, 2.55], [5 - T, 5]) // mullion
  span(matGlass, [-2.7, 1.5], [0.15, 2.55], [5 - T + 0.14, 5 - T + 0.16], { shadow: false })
}
buildOpening()

// deck (terrace) — larch, boards running along x
function buildDeck() {
  const m = woodMat(texLarch, 3.8, 6.2)
  m.map.rotation = Math.PI / 2
  m.map.center.set(0.5, 0.5)
  span(m, [-4.4, 1.8], [0.0, 0.14], [5, 8.8])
  // edge board
  span(matAnth, [-4.4, 1.8], [0.0, 0.14], [8.8, 8.86])
}
buildDeck()

// interior — living room furniture as simple volumes
function buildFurniture() {
  // kitchen block along the back wall
  span(spruce(3.2, 0.9), [-3.4, -0.2], [0.15, 1.05], [-5 + T, -5 + T + 0.65])
  span(matAnth, [-3.45, -0.15], [1.05, 1.09], [-5 + T, -5 + T + 0.68])
  // table + stools
  span(spruce(1.9, 0.9), [-2.3, -0.4], [0.86, 0.92], [-1.3, -0.4])
  for (const [x, z] of [
    [-2.1, -0.9],
    [-1.35, -0.9],
    [-0.6, -0.9],
  ])
    span(matAnth, [x - 0.03, x + 0.03], [0.15, 0.86], [z - 0.03, z + 0.03])
  for (const [x, z] of [
    [-2.0, 0.1],
    [-1.35, 0.1],
    [-0.7, 0.1],
    [-2.0, -1.8],
    [-1.35, -1.8],
    [-0.7, -1.8],
  ])
    span(spruce(0.4, 0.45), [x - 0.2, x + 0.2], [0.15, 0.6], [z - 0.2, z + 0.2])
  // sofa facing the garden
  span(matFabric, [-2.4, -0.1], [0.15, 0.58], [1.8, 2.8])
  span(matFabric, [-2.4, -0.1], [0.58, 0.95], [1.8, 2.1])
  // stair along the right wall, rising toward the back
  for (let i = 0; i < 15; i++) {
    const z0 = 3.2 - i * 0.27
    span(spruce(1, 0.2), [4 - T - 1.0, 4 - T], [0.15, 0.15 + (i + 1) * 0.2], [z0 - 0.27, z0])
  }
  // upper floor: two beds
  span(spruce(1.6, 2), [-3.2, -1.4], [H1, H1 + 0.45], [-4.2, -2.2])
  span(matWool, [-3.1, -1.5], [H1 + 0.45, H1 + 0.6], [-4.1, -2.3])
  span(spruce(1.6, 2), [1.4, 3.2], [H1, H1 + 0.45], [-4.2, -2.2])
  span(matWool, [1.5, 3.1], [H1 + 0.45, H1 + 0.6], [-4.1, -2.3])
}
buildFurniture()

// ---------------------------------------------------------------- x-ray wall sample (far away, own stage)
const X0 = 200
const layers = [] // { z, label, small }
if (board === "xray") {
  const W = 1.2
  const Hs = 2.4
  let z = 1.4
  const step = 0.44
  const put = (label, small, build) => {
    build(z)
    layers.push({ z, label, small })
    z -= step
  }
  // 1 cladding — rhombus slats
  put("Smrekovcový obklad Rhombus", "fasáda", (z) => {
    for (let i = 0; i < 20; i++) {
      const y = 0.06 + i * 0.12
      span(larchV(0.1, 1.2), [X0 - W / 2, X0 + W / 2], [y, y + 0.1], [z - 0.012, z + 0.012])
    }
  })
  // 2 ventilated gap — battens
  put("Odvetraná medzera", "laty", (z) => {
    for (const x of [-0.55, 0, 0.55]) span(larchV(0.05, Hs), [X0 + x - 0.025, X0 + x + 0.025], [0, Hs], [z - 0.02, z + 0.02])
  })
  // 3 wood-fibre board
  put("Drevovláknitá doska", "difúzne otvorená", (z) => span(matFibre, [X0 - W / 2, X0 + W / 2], [0, Hs], [z - 0.03, z + 0.03]))
  // 4 frame + insulation
  put("Nosný rám + izolácia", "drevovlákno · konope", (z) => {
    for (const x of [-0.57, 0, 0.57]) span(spruce(0.06, Hs), [X0 + x - 0.03, X0 + x + 0.03], [0, Hs], [z - 0.08, z + 0.08])
    for (const [a, b] of [
      [-0.54, -0.03],
      [0.03, 0.54],
    ])
      span(matHemp, [X0 + a, X0 + b], [0, Hs], [z - 0.065, z + 0.065])
  })
  // 5 board
  put("Sadrovláknitá doska", "vzduchotesná rovina", (z) => span(matBoard, [X0 - W / 2, X0 + W / 2], [0, Hs], [z - 0.008, z + 0.008]))
  // 6 installation layer — sheep wool
  put("Inštalačná vrstva", "ovčia vlna", (z) => {
    for (const y of [0.6, 1.8]) span(spruce(W, 0.05), [X0 - W / 2, X0 + W / 2], [y - 0.025, y + 0.025], [z - 0.025, z + 0.025])
    span(matWool, [X0 - W / 2, X0 + W / 2], [0, Hs], [z - 0.02, z + 0.02])
  })
  // 7 interior board
  put("Sadrovláknitá doska", "interiér", (z) => span(matPlaster, [X0 - W / 2, X0 + W / 2], [0, Hs], [z - 0.007, z + 0.007]))
  // stage
  const st = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: C.paper, roughness: 1 }))
  st.rotation.x = -Math.PI / 2
  st.position.set(X0, 0.001, 0)
  st.receiveShadow = true
  scene.add(st)
}

// ---------------------------------------------------------------- dollhouse
if (board === "dollhouse") {
  roofGroup.position.y += 3.2
  roofGroup.position.x += 1.2
  roofGroup.rotation.z = -0.05
}

// ---------------------------------------------------------------- light
const lights = new THREE.Group()
scene.add(lights)
function sun(color, intensity, pos, size = 16) {
  const d = new THREE.DirectionalLight(color, intensity)
  d.position.set(...pos)
  d.castShadow = true
  d.shadow.mapSize.set(4096, 4096)
  const c = d.shadow.camera
  c.left = c.bottom = -size
  c.right = c.top = size
  c.near = 1
  c.far = 80
  d.shadow.bias = -0.0004
  d.shadow.normalBias = 0.02
  d.shadow.radius = 2
  lights.add(d, d.target)
  return d
}
if (dusk) {
  lights.add(new THREE.HemisphereLight(0x33465f, 0x141a24, 0.9))
  const s = sun(0x8fa6c8, 0.5, [-8, 9, -10])
  s.target.position.set(0, 2, 0)
  // windows glow
  matGlass.emissive = new THREE.Color(C.amber)
  matGlass.emissiveIntensity = 1.1
  matGlass.opacity = 0.92
  for (const [x, y, z] of [
    [-0.8, 1.9, 1.5],
    [-2.6, 4.8, 1.0],
    [3.0, 4.8, 4.6],
  ]) {
    const p = new THREE.PointLight(0xffb85c, 14, 9, 1.6)
    p.position.set(x, y, z)
    lights.add(p)
  }
  // a low warm wash on the deck from the living room
  const deck = new THREE.PointLight(0xffb85c, 5, 8, 2)
  deck.position.set(-0.6, 0.9, 6.2)
  lights.add(deck)
} else if (board === "living") {
  lights.add(new THREE.HemisphereLight(0xfff4e0, 0xd8ccb6, 1.7))
  lights.add(new THREE.AmbientLight(0xfff2dc, 0.35))
  const s = sun(0xfff0d6, 2.2, [-5, 9, 15], 18)
  s.target.position.set(0, 1.2, 0)
} else if (board === "xray") {
  lights.add(new THREE.HemisphereLight(0xfff4e0, 0xcfc3ae, 1.1))
  const s = sun(0xfff0d6, 2.0, [X0 - 5, 9, 8], 6)
  s.target.position.set(X0, 1.2, 0)
  s.shadow.camera.far = 60
} else if (board === "dollhouse") {
  lights.add(new THREE.HemisphereLight(0xfff4e0, 0xcfc3ae, 0.85))
  const s = sun(0xfff0d6, 2.6, [-12, 9, -5], 16) // raking key from the left-back
  s.target.position.set(0, 2, 0)
} else {
  lights.add(new THREE.HemisphereLight(0xfff4e0, 0xcfc3ae, 1.0))
  const s = sun(0xfff0d6, 2.2, [-9, 12, 11], 18) // morning, front-left
  s.target.position.set(0, 2.5, 0)
}

// ---------------------------------------------------------------- camera
const cams = {
  desktop: {
    hero: { p: [16, 4.6, 24], t: [-5.4, 2.5, 0], fov: 25 },
    living: { p: [2.5, 1.5, -3.7], t: [-1.7, 1.15, 5.0], fov: 47 },
    xray: { p: [X0 + 4.6, 3.1, 6.4], t: [X0 - 1.0, 1.0, -0.1], fov: 30 },
    dollhouse: { p: [25, 19, 25], t: [-3.4, 1.0, 0], fov: 28 },
    dusk: { p: [14.5, 3.4, 23], t: [-3.8, 2.4, 0], fov: 26 },
  },
  mobile: {
    hero: { p: [12, 4.4, 34], t: [-1.0, -2.2, 0], fov: 36 },
    living: { p: [-2.4, 1.5, -3.4], t: [1.4, 0.2, 5.0], fov: 56 },
    dusk: { p: [10, 3.4, 29], t: [0.4, -1.0, 0], fov: 36 },
  },
}
const cfg = cams[device]?.[board] ?? cams.desktop[board] ?? cams.desktop.hero
const camera = new THREE.PerspectiveCamera(cfg.fov, 1, 0.1, 200)
camera.position.set(...cfg.p)
camera.lookAt(...cfg.t)

// ---------------------------------------------------------------- annotations
const anns = {
  hero: [{ p: [4.2, H + 0.3, 5.2], side: "right", lab: "Vzorový dom", small: "koncept, nie realizácia", signal: true }],
  living: [],
  xray: [],
  dollhouse: [
    { p: [5.4, H + 3.5, 0.5], side: "right", lab: "Vzorový dom", small: "koncept, nie realizácia", signal: true },
    { p: [-4.0, 1.6, 2.0], side: "left", lab: "Fasáda · smrekovec Rhombus" },
  ],
  dusk: [],
}
if (board === "xray") {
  layers.forEach((l, i) => {
    anns.xray.push({ p: [X0 + 0.6, 2.4, l.z], col: true, lab: l.label, small: l.small, signal: i === 3 })
  })
}
if (device === "mobile") {
  for (const k of Object.keys(anns)) anns[k] = anns[k].slice(0, 1)
  anns.hero = [{ p: [-4.2, H + 0.34, 5.2], side: "right", lab: "Vzorový dom", small: "koncept, nie realizácia", signal: true }]
}

function placeAnnotations() {
  const host = document.getElementById("annotations")
  host.innerHTML = ""
  const w = innerWidth
  const h = innerHeight
  const list = (anns[board] ?? []).map((a) => {
    const v = new THREE.Vector3(...a.p).project(camera)
    return { ...a, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h }
  })
  // exploded-diagram labels: a row of labels above the slabs, vertical leaders down to each anchor
  const cols = list.filter((a) => a.col).sort((a, b) => a.x - b.x)
  const rowTop = device === "mobile" ? 120 : 132
  cols.forEach((a, i) => {
    const y = rowTop + i * 36
    const el = document.createElement("div")
    el.className = `ann col${a.signal ? " signal" : ""}`
    el.style.left = `${a.x}px`
    el.style.top = `${y}px`
    el.innerHTML = `<span class="lab">${a.lab}${a.small ? `<small>${a.small}</small>` : ""}</span><span class="vline"></span><span class="dot"></span>`
    host.appendChild(el)
    const lab = el.querySelector(".lab")
    const len = Math.max(8, a.y - y - lab.offsetHeight - 5)
    el.querySelector(".vline").style.height = `${len}px`
  })
  for (const a of list.filter((a) => !a.col)) {
    const side = a.side === "auto" ? (a.x > w * 0.58 ? "left" : "right") : a.side
    const el = document.createElement("div")
    el.className = `ann ${side}${a.signal ? " signal" : ""}`
    el.style.left = `${a.x}px`
    el.style.top = `${a.y}px`
    el.innerHTML = `<span class="dot"></span><span class="line"></span><span class="lab">${a.lab}${a.small ? `<small>${a.small}</small>` : ""}</span>`
    host.appendChild(el)
  }
}

// ---------------------------------------------------------------- render
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("world"), antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.NoToneMapping

function frame() {
  const w = innerWidth
  const h = innerHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.render(scene, camera)
  placeAnnotations()
}
addEventListener("resize", frame)

await document.fonts.ready
frame()
requestAnimationFrame(() => {
  frame()
  window.__boardReady = true
})
