// Camera, target and organism share one continuous world. Values are world units.
// The portfolio block does not advance this timeline.
export const frames = [
  { at: 0, camera: [0, 0.7, 12], target: [0, -0.6, 0], jelly: [2.3, 0.6, 0], rotation: [0.12, 0, -0.22], room: 0, light: 0 },
  // A continuous dolly approaches, skims the outer bell, then opens onto the work.
  // The camera stays outside the bell; the organism never jumps between shots.
  { at: 0.5, camera: [2.6, 1.4, 7], target: [1.6, 0.6, 0], jelly: [2.1, 0.8, 0], rotation: [0.3, 0.4, -0.35], room: 0, light: 0 },
  { at: 1.05, camera: [4, 2, 2.5], target: [1.8, 0.7, -0.4], jelly: [1.7, 0.8, -0.2], rotation: [0.2, 0.85, -0.32], room: 0, light: 0.07 },
  { at: 1.35, camera: [4.3, 1.85, -0.8], target: [1.2, 0.65, -1.6], jelly: [1.15, 0.95, -1.6], rotation: [0.08, 1.15, -0.2], room: 0, light: 0.1 },
  { at: 1.75, camera: [2.8, 1.1, -4.2], target: [0, 0.1, -11], jelly: [-1.8, 1.7, -10], rotation: [-0.2, 1.8, 0.2], room: 0, light: 0.02 },
  { at: 2.15, camera: [0, 0.6, -4.5], target: [0, 0, -16], jelly: [-4, 3, -20], rotation: [0.1, 2.2, 0], room: 0, light: 0 },
  { at: 2.7, camera: [0.2, 0.6, -8], target: [-1, 0, -18], jelly: [-1.5, 1, -16], rotation: [0.1, 2.8, 0.2], room: 0.7, light: 0.1 },
  { at: 3.5, camera: [-2.5, 0.8, -14], target: [-0.2, 0, -20], jelly: [0, 0.8, -20], rotation: [0.3, 3.6, -0.2], room: 1, light: 0.35 },
  { at: 4.25, camera: [1.1, 0.9, -18], target: [0, 0.5, -20], jelly: [0, 0.8, -20], rotation: [0.6, 4.2, 0.1], room: 0.6, light: 0.55 },
  { at: 5.2, camera: [3, 4, 2], target: [0, 0.2, -20], jelly: [0, 0.8, -20], rotation: [0.15, 4.8, 0.2], room: 0, light: 0.35 },
  { at: 5.8, camera: [3, 4, 2], target: [0, 0.2, -20], jelly: [0, 0.8, -20], rotation: [0.15, 4.8, 0.2], room: 0, light: 0.35 },
  { at: 6.65, camera: [0.4, 8, -16], target: [0, 0.5, -20], jelly: [0, 0.8, -20], rotation: [0, 5.4, 0], room: 0, light: 0.92 },
  { at: 7.1, camera: [0.4, 8, -16], target: [0, 0.5, -20], jelly: [0, 0.8, -20], rotation: [0, 5.4, 0], room: 0, light: 0.92 },
  { at: 8, camera: [0, 0.7, -8], target: [0, -0.3, -20], jelly: [2.4, 0.7, -20], rotation: [0.12, 6.28, -0.22], room: 0, light: 0.05 },
];

export function flattenFrame(frame) {
  return { cx: frame.camera[0], cy: frame.camera[1], cz: frame.camera[2], tx: frame.target[0], ty: frame.target[1], tz: frame.target[2], jx: frame.jelly[0], jy: frame.jelly[1], jz: frame.jelly[2], rx: frame.rotation[0], ry: frame.rotation[1], rz: frame.rotation[2], room: frame.room, light: frame.light };
}

const poses = frames.map(flattenFrame);
const channels = Object.keys(poses[0]);
const stops = new Set([0, 2.15, 5.2, 5.8, 6.65, 7.1, 8]);

// Shape-preserving cubic Hermite tangents. A weighted harmonic mean follows
// consecutive moves without overshoot; a change of direction eases to rest.
// Reading holds and the portfolio boundary deliberately have zero velocity.
const tangents = frames.map((frame, i) => {
  const result = {};
  for (const key of channels) {
    result[key] = 0;
    if (stops.has(frame.at)) continue;
    const before = frame.at - frames[i - 1].at;
    const after = frames[i + 1].at - frame.at;
    const left = (poses[i][key] - poses[i - 1][key]) / before;
    const right = (poses[i + 1][key] - poses[i][key]) / after;
    if (left * right <= 0) continue;
    const w1 = 2 * after + before, w2 = after + 2 * before;
    result[key] = (w1 + w2) / (w1 / left + w2 / right);
  }
  return result;
});

// Pure pose lookup, not a second animation clock. GSAP owns the playhead and
// ticker; reverse scrolling samples exactly the same state at the same time.
export function sampleFrame(at, out = {}) {
  const time = Math.max(frames[0].at, Math.min(frames.at(-1).at, at));
  let i = 0;
  while (i < frames.length - 2 && time > frames[i + 1].at) i++;
  if (time === frames[i].at) return Object.assign(out, poses[i]);
  if (time === frames[i + 1].at) return Object.assign(out, poses[i + 1]);
  const duration = frames[i + 1].at - frames[i].at;
  const u = (time - frames[i].at) / duration, u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  for (const key of channels) {
    const a = poses[i][key], b = poses[i + 1][key];
    out[key] = a === b ? a : h00 * a + h10 * duration * tangents[i][key] + h01 * b + h11 * duration * tangents[i + 1][key];
  }
  return out;
}

export function journeyAt(y, bounds) {
  const clamp = (x) => Math.max(0, Math.min(1, x));
  if (y < bounds.workStart) return 2.15 * clamp(y / bounds.workStart);
  if (y <= bounds.workEnd) return 2.15;
  if (bounds.stops) {
    for (let i = 1; i < bounds.stops.length; i++) {
      const a = bounds.stops[i - 1], b = bounds.stops[i];
      if (y <= b.y) return a.at + (b.at - a.at) * clamp((y - a.y) / Math.max(1, b.y - a.y));
    }
    return 8;
  }
  return 2.15 + 5.85 * clamp((y - bounds.workEnd) / (bounds.end - bounds.workEnd));
}
