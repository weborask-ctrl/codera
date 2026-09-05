/**
 * Flight strips: each seam between two scenes is a short camera flight
 * rendered as a WebP frame sequence and scrubbed by scroll on the stage
 * canvas. Frames are fetched once per strip, decoded off the main thread
 * with createImageBitmap, and cached for the page lifetime.
 */

export const FLIGHT_FRAMES = 32

const cache = new Map<string, Promise<ImageBitmap[]>>()

export function flightSrc(name: string, index: number) {
  return `/home/flight/${name}/${String(index).padStart(2, "0")}.webp`
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
