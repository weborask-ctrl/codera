"""Local Silver refinement. 1080p source detail; offline optical-flow 60 fps, not native 4K."""
from pathlib import Path
import argparse
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', required=True)
parser.add_argument('--reuse-interpolated', action='store_true')
args = parser.parse_args()
source = ROOT / 'assets/motion-tests/codera-metal/review-01/silver-camera-journey.mov'
master = ROOT / '.prototype-cache/silver-polish/interpolated-master-1080.mp4'
master.parent.mkdir(parents=True, exist_ok=True)
output = ROOT / 'public/motion/metal/journey-scroll-1080.mp4'
common = [args.ffmpeg, '-hide_banner', '-loglevel', 'warning', '-y']
encode = ['-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p',
          '-sc_threshold', '0', '-bf', '0', '-threads', '2', '-filter_threads', '2', '-movflags', '+faststart']
if not args.reuse_interpolated:
    subprocess.run(common + ['-i', str(source), '-an', '-vf',
        'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:search_param=16,unsharp=5:5:0.65:3:3:0',
        *encode, '-crf', '14', '-g', '6', '-keyint_min', '6', str(master)], check=True)
# This offset is mirrored in main.mjs. Caption/story timestamps remain in source coordinates.
subprocess.run(common + ['-ss', '2.583333', '-i', str(master), '-t', '11', '-an',
    '-vf', 'cas=strength=0.55', *encode, '-crf', '15', '-g', '12', '-keyint_min', '12',
    '-profile:v', 'high', '-level:v', '4.2', str(output)], check=True)
subprocess.run(common + ['-ss', '2.6', '-i', str(source), '-an',
    '-vf', 'unsharp=5:5:0.65:3:3:0,cas=strength=0.55', '-frames:v', '1',
    '-c:v', 'libwebp', '-quality', '98', str(ROOT / 'public/motion/metal/poster-sharp.webp')], check=True)
print(f'{output.name}: {output.stat().st_size:,} bytes, 1920x1080, 60 fps, 11 s; source remains 1080p/24 fps.')
