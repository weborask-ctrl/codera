"""Quick exposure read-out of a render: python3 _stats.py <png> [<png> …]."""
import sys
import numpy as np
from PIL import Image

for path in sys.argv[1:]:
    im = np.asarray(Image.open(path).convert("RGB")).astype(float) / 255
    h, w, _ = im.shape
    lum = im @ [0.2126, 0.7152, 0.0722]
    q = {p: float(np.percentile(lum, p)) for p in (1, 5, 50, 95, 99)}
    print(f"{path}  {w}×{h}")
    print("  luma p1 %.3f  p5 %.3f  p50 %.3f  p95 %.3f  p99 %.3f" % (q[1], q[5], q[50], q[95], q[99]))
    print("  sky %.3f  lower-left %.3f  centre %.3f  saturation %.3f" % (
        lum[: int(h * 0.10)].mean(),
        lum[int(h * 0.72) :, : int(w * 0.35)].mean(),
        lum[int(h * 0.35) : int(h * 0.65), int(w * 0.35) : int(w * 0.65)].mean(),
        float((im.max(axis=2) - im.min(axis=2)).mean()),
    ))
