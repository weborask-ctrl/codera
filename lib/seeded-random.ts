/**
 * Deterministic pseudo-random helpers.
 *
 * Components that need "random-looking" values (animation delays, hues,
 * durations) must not call `Math.random()` during render: the server and the
 * client would produce different markup, desyncing hydration, and every
 * re-render would re-roll the values and restart animations.
 *
 * `seededRandom` returns a stable float in [0, 1) for a given seed string, so
 * the same seed always yields the same value on both server and client.
 */

/** FNV-1a hash of a string, as an unsigned 32-bit integer. */
function hashSeed(seed: string): number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** mulberry32-style mix. Returns a stable float in [0, 1) for `seed`. */
export function seededRandom(seed: string): number {
  let state = (hashSeed(seed) + 0x6d2b79f5) >>> 0
  state = Math.imul(state ^ (state >>> 15), state | 1)
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61)
  return ((state ^ (state >>> 14)) >>> 0) / 4294967296
}
