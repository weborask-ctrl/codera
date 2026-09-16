// Camera, target and organism share one continuous world. Values are world units.
// The portfolio block does not advance this timeline.
export const frames = [
  { at: 0, camera: [0, 0.7, 12], target: [0, -0.6, 0], jelly: [2.3, 0.6, 0], rotation: [0.12, 0, -0.22], room: 0, light: 0 },
  { at: 0.5, camera: [2.6, 1.4, 7], target: [1.6, 0.6, 0], jelly: [2.1, 0.8, 0], rotation: [0.3, 0.4, -0.35], room: 0, light: 0 },
  { at: 1.15, camera: [3.6, 1.9, 1.8], target: [1.8, 0.7, -0.4], jelly: [1.7, 0.8, -0.2], rotation: [0.2, 1.1, -0.4], room: 0, light: 0.08 },
  { at: 1.75, camera: [2, 1.1, -4.2], target: [0, 0.1, -12], jelly: [-1.8, 1.7, -10], rotation: [-0.2, 1.8, 0.2], room: 0, light: 0 },
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
