/**
 * Flight strips: each seam between two scenes is a short camera flight
 * rendered as an AVIF frame sequence (2304 px, cut from the 4K upscale) and
 * scrubbed by scroll on the stage canvas. Frames are fetched once per strip, decoded off the main thread
 * with createImageBitmap, and cached for the page lifetime.
 */

export const FLIGHT_FRAMES = 40

const cache = new Map<string, Promise<ImageBitmap[]>>()

export function flightSrc(name: string, index: number) {
  return `/home/flight/${name}/${String(index).padStart(2, "0")}.avif`
}

const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

/**
 * Fetches the whole strip at once (cheap) but decodes it two frames at a
 * time with a macrotask between batches: decoding thirty-two plates in one
 * go would hold the main thread for hundreds of milliseconds and stall
 * the scroll it exists to serve.
 */
async function decodeFlight(name: string): Promise<ImageBitmap[]> {
  const blobs = await Promise.all(
    Array.from({ length: FLIGHT_FRAMES }, (_, i) => fetch(flightSrc(name, i)).then((r) => r.blob()))
  )
  const frames: ImageBitmap[] = []
  for (let i = 0; i < blobs.length; i += 2) {
    const pair = await Promise.all(blobs.slice(i, i + 2).map((blob) => createImageBitmap(blob)))
    frames.push(...pair)
    await yieldToMain()
  }
  return frames
}

export function loadFlight(name: string): Promise<ImageBitmap[]> {
  let pending = cache.get(name)
  if (!pending) {
    pending = decodeFlight(name)
    cache.set(name, pending)
  }
  return pending
}

/** Streams every strip in journey order, one after another, at idle —
 *  a flight must never start on the crossfade fallback. */
export async function warmAllFlights(names: string[]) {
  for (const name of names) {
    if (settled.has(name)) {
      continue
    }
    try {
      settled.set(name, await loadFlight(name))
    } catch {
      /* a missing strip degrades to the cloud crossfade — never an error */
    }
  }
}

export function loadedFlight(name: string): ImageBitmap[] | null {
  return settled.get(name) ?? null
}

const settled = new Map<string, ImageBitmap[]>()

export function warmFlight(name: string) {
  if (settled.has(name)) {
    return
  }
  loadFlight(name)
    .then((frames) => settled.set(name, frames))
    .catch(() => {
      /* a missing strip degrades to the cloud crossfade — never an error */
    })
}

/** two adjacent frames cross-blended: slow scrolling never steps */
export function drawBlend(
  ctx: CanvasRenderingContext2D,
  a: ImageBitmap,
  b: ImageBitmap,
  t: number,
  w: number,
  h: number
) {
  ctx.globalAlpha = 1
  drawCover(ctx, a, w, h)
  if (t > 0.01) {
    ctx.globalAlpha = Math.min(1, t)
    drawCover(ctx, b, w, h)
    ctx.globalAlpha = 1
  }
}

/** cover-fit draw, like object-fit: cover */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  w: number,
  h: number
) {
  const s = Math.max(w / img.width, h / img.height)
  const dw = img.width * s
  const dh = img.height * s
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}
