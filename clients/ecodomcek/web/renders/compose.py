# composite the four layers with candidate landing drops; zoomed seam crops for review
import sys, json
from PIL import Image, ImageDraw
L=json.load(open('renders/layers2.json'))['layers']; W,H=1500,1119
dr,du,dg=[int(v) for v in sys.argv[1:4]]
bg=Image.new('RGBA',(W,H),(243,238,227,255))
def put(name,dy):
    l=L[name]; im=Image.open('renders/lyr-%s.png'%name); bg.alpha_composite(im,(l['x'],l['y']+dy))
put('base',0); put('ground',dg); put('upper',dg+du); put('roof',dg+du+dr)
out=bg.convert('RGB'); out.resize((1000,746)).save('renders/comp-full.jpg',quality=85)
# seams: (x0,y0,x1,y1) in composite coords, 3x
def z(box,tag):
    x0,y0,x1,y1=box; c=out.crop(box).resize(((x1-x0)*3,(y1-y0)*3),Image.LANCZOS)
    d=ImageDraw.Draw(c); d.text((4,4),tag,fill=(200,0,0)); return c
gy=dg; uy=dg+du; ry=dg+du+dr
a=z((640,200+ry,940,300+ry),'roof/upper x640-940 y%d'%(200+ry))
b=z((640,470+uy,940,570+uy),'upper/ground y%d'%(470+uy))
c=z((430,790+gy,730,890+gy),'ground/base y%d'%(790+gy))
sheet=Image.new('RGB',(900,900),(255,255,255)); sheet.paste(a,(0,0)); sheet.paste(b,(0,300)); sheet.paste(c,(0,600))
sheet.save('renders/comp-seams.jpg',quality=88)
print('drops roof',dr,'upper',du,'ground',dg,'| bottoms: roof',L['roof']['bottom']+ry,'upper',L['upper']['bottom']+uy,'ground',L['ground']['bottom']+gy,'base',L['base']['bottom'])
