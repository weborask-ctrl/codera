# final layer export: ground keeps a thin rim, its halo on the background is dropped,
# the foundation keeps its shadow with a soft alpha
import json, time
from PIL import Image, ImageChops, ImageDraw, ImageFilter
t=time.time()
im=Image.open('renders/explod.jpg').convert('RGB'); W,H=im.size
bg=im.getpixel((12,12))
diff=ImageChops.difference(im, Image.new('RGB',im.size,bg)).convert('L')
def prep(th):
    m=diff.point(lambda v:255 if v>th else 0)
    m=m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    ImageDraw.floodfill(m,(0,0),64); return m.point(lambda v:0 if v==64 else 255)
def blob(mask,seed):
    m=mask.copy(); ImageDraw.floodfill(m,seed,128); return m.point(lambda v:255 if v==128 else 0)
lo=prep(16); hi=prep(72)
roof=blob(lo,(750,90)); upper=blob(lo,(600,435)); merged=blob(lo,(600,720))
ghi=blob(hi,(600,720)); bhi=blob(hi,(750,985))
ground=ImageChops.multiply(ghi.filter(ImageFilter.MaxFilter(5)),merged)
halo=ImageChops.subtract(ImageChops.multiply(ghi.filter(ImageFilter.MaxFilter(15)),merged),ground)
keep=ImageChops.multiply(bhi.filter(ImageFilter.MaxFilter(5)),merged)          # foundation body
basemask=ImageChops.lighter(ImageChops.subtract(ImageChops.subtract(merged,ground),halo),ImageChops.subtract(keep,ground))
soft=diff.point(lambda v:min(255,v*4))
base=ImageChops.multiply(basemask,ImageChops.lighter(bhi.filter(ImageFilter.MaxFilter(5)),soft))
layers={'roof':roof,'upper':upper,'ground':ground,'base':base}
out={}
for name,a in layers.items():
    bb=a.getbbox(); x0,y0,x1,y1=bb; pad=3
    x0=max(0,x0-pad);y0=max(0,y0-pad);x1=min(W,x1+pad);y1=min(H,y1+pad)
    a=a.filter(ImageFilter.GaussianBlur(0.6))
    rgba=im.copy().convert('RGBA'); rgba.putalpha(a); crop=rgba.crop((x0,y0,x1,y1))
    crop.save('renders/lyr-%s.webp'%name,'WEBP',quality=86,method=6)
    crop.save('renders/lyr-%s.png'%name)
    out[name]={'x':x0,'y':y0,'w':x1-x0,'h':y1-y0,'bottom':y1,'top':y0}
json.dump({'W':W,'H':H,'layers':out},open('renders/layers2.json','w'),indent=1)
print(out, round(time.time()-t,1))
