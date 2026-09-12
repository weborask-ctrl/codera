# ink linework for each layer: silhouette + tone-boundary contours, vectorised with potrace
import json, sys
import numpy as np, potrace
from PIL import Image, ImageFilter, ImageDraw, ImageOps
J=json.load(open('renders/layers2.json')); L=J['layers']
NTONES=int(sys.argv[1]) if len(sys.argv)>1 else 5
MINAREA=int(sys.argv[2]) if len(sys.argv)>2 else 60

def trace(mask, turd=MINAREA):
    bm=potrace.Bitmap(~mask)   # potracer: values below blacklevel are traced
    path=bm.trace(turdsize=turd, alphamax=1.0, opticurve=1, opttolerance=0.2)
    out=[]
    for curve in path:
        d=[]; s=curve.start_point; d.append('M%.1f %.1f'%(s.x,s.y))
        for seg in curve:
            if seg.is_corner:
                d.append('L%.1f %.1f L%.1f %.1f'%(seg.c.x,seg.c.y,seg.end_point.x,seg.end_point.y))
            else:
                d.append('C%.1f %.1f %.1f %.1f %.1f %.1f'%(seg.c1.x,seg.c1.y,seg.c2.x,seg.c2.y,seg.end_point.x,seg.end_point.y))
        d.append('Z'); out.append(''.join(d))
    return out

svg={}
for name in ('base','ground','upper','roof'):
    im=Image.open('renders/lyr-%s.png'%name).convert('RGBA'); w,h=im.size
    a=np.array(im.getchannel('A'))>(250 if name=='base' else 128)
    rgb=im.convert('RGB').filter(ImageFilter.MedianFilter(7))
    nt=3 if name=='base' else NTONES; minarea=900 if name=='base' else MINAREA
    q=rgb.quantize(colors=nt, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    qa=np.array(q)
    paths=[]
    sil=trace(a, turd=200); paths+=[('sil',p) for p in sil]
    for t in range(nt):
        m=(qa==t)&a
        if m.sum()<minarea: continue
        paths+=[('tone',p) for p in trace(m, turd=minarea)]
    svg[name]={'w':w,'h':h,'paths':paths}
    print(name, w, h, 'sil',len(sil),'tone',len(paths)-len(sil))
json.dump(svg,open('renders/ink-%d-%d.json'%(NTONES,MINAREA),'w'))

# preview: the exploded drawing on paper at 1500x1119 (rasterised from the svg via cairosvg-free approach: write an svg and rasterise with chromium later)
W,H=J['W'],J['H']
parts=[]
for name in ('base','ground','upper','roof'):
    l=L[name]; s=svg[name]
    g=''.join('<path d="%s" class="%s"/>'%(d,c) for c,d in s['paths'])
    parts.append('<g transform="translate(%d %d)">%s</g>'%(l['x'],l['y'],g))
open('renders/ink-%d-%d.svg'%(NTONES,MINAREA),'w').write(
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d"><rect width="100%%" height="100%%" fill="#f3eee3"/>'
 '<style>path{fill:none;stroke:#231f1a;stroke-width:1.1;stroke-linejoin:round}.sil{stroke-width:1.6}</style>%s</svg>'%(W,H,W,H,''.join(parts)))
print('svg bytes', len(open('renders/ink-%d-%d.svg'%(NTONES,MINAREA)).read()))
