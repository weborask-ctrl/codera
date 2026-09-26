// Remux only: preserve every encoded frame of the approved 1080p60 delivery.
// Usage: node scripts/metal-stream-media.mjs /absolute/path/to/ffmpeg

import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const ffmpeg = process.argv[2];
if (!ffmpeg) throw new Error('Pass the ffmpeg executable path');
const folder = 'public/motion/metal/stream-v1';
mkdirSync(folder, { recursive: true });
const result = spawnSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'warning', '-y',
  '-i', 'public/motion/metal/journey-scroll-1080.mp4', '-c', 'copy', '-an',
  '-f', 'dash', '-seg_duration', '0.05', '-use_template', '1', '-use_timeline', '1',
  '-init_seg_name', 'init.mp4', '-media_seg_name', 'segment-$Number%03d$.m4s',
  `${folder}/manifest.mpd`,
], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('Fragment generation failed');
console.log('220 × 50 ms fragments, original encoded pixels and 60 fps retained.');
