// Encode the detail-first prepared delivery from the approved 1080p60 master.
// Usage: node scripts/metal-prepared-media.mjs /absolute/path/to/ffmpeg /path/to/interpolated-master-1080.mp4
import { spawnSync } from 'node:child_process';

const [ffmpeg, master] = process.argv.slice(2);
if (!ffmpeg || !master) throw new Error('Pass ffmpeg and interpolated master paths');
const result = spawnSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'warning', '-y', '-ss', '2.583333', '-i', master,
  '-t', '11', '-an', '-vf', 'cas=strength=0.55', '-c:v', 'libx264', '-preset', 'medium',
  '-crf', '15', '-g', '3', '-keyint_min', '3', '-sc_threshold', '0', '-bf', '0',
  '-pix_fmt', 'yuv420p', '-threads', '2', '-filter_threads', '2', '-movflags', '+faststart',
  '-profile:v', 'high', '-level:v', '4.2', 'public/motion/metal/journey-scroll-1080.mp4',
], { stdio: 'inherit' });
if (result.status !== 0) throw new Error('Prepared delivery encode failed');
