"""Editable marine asset library. Blender 5.2; local axes X head, Y up, Z side.
Run in 3D Jutsu. Packed images and Principled materials survive glTF export.
"""
import bpy, math, random
import numpy as np
from mathutils import Vector
from math import sin, cos, pi, sqrt, exp
random.seed(718)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for collection in [bpy.data.meshes,bpy.data.materials,bpy.data.images]:
    for block in list(collection):
        if block.users==0: collection.remove(block)

def xyz(p): return (p[0],-p[2],p[1])
def material(name, color, rough=.5):
    m=bpy.data.materials.new(name); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=rough
    return m

def image(name, data, noncolor=False):
    h,w=data.shape[:2]; im=bpy.data.images.new(name,width=w,height=h,alpha=True)
    if noncolor: im.colorspace_settings.name='Non-Color'
    rgba=np.ones((h,w,4),np.float32); rgba[:,:,:3]=data
    im.pixels.foreach_set(rgba.ravel()); im.pack(); return im

def textured(name, rgb, height, rough=.5, strength=.3):
    m=material(name,(1,1,1),rough); nt=m.node_tree; bs=nt.nodes.get('Principled BSDF')
    tex=nt.nodes.new('ShaderNodeTexImage'); tex.image=image(name+' color',np.clip(rgb,0,1))
    nt.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
    dy,dx=np.gradient(height); n=np.stack((-dx*strength*60,-dy*strength*60,np.ones_like(dx)),axis=-1)
    n/=np.linalg.norm(n,axis=-1,keepdims=True)
    normal=nt.nodes.new('ShaderNodeTexImage'); normal.image=image(name+' normal',n*.5+.5,True)
    node=nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(normal.outputs['Color'],node.inputs['Color']); nt.links.new(node.outputs['Normal'],bs.inputs['Normal'])
    return m

class Mesh:
    def __init__(self): self.p=[]; self.f=[]; self.uv=[]
    def vert(self,p,uv=(0,0)): self.p.append(xyz(p)); self.uv.append(uv); return len(self.p)-1
    def grid(self,rows,cols,fn):
        start=len(self.p)
        for i in range(rows+1):
            for j in range(cols+1): self.vert(fn(i/rows,j/cols),(i/rows,j/cols))
        for i in range(rows):
            for j in range(cols):
                a=start+i*(cols+1)+j; self.f.append((a,a+1,a+cols+2,a+cols+1))
    def tube(self,points,radii,sides=8):
        start=len(self.p)
        for i,p in enumerate(points):
            tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])).normalized()
            ref=Vector((0,0,1)) if abs(tangent.z)<.9 else Vector((0,1,0))
            u=tangent.cross(ref).normalized(); v=tangent.cross(u)
            for j in range(sides+1):
                a=j/sides*2*pi; q=Vector(p)+(u*cos(a)+v*sin(a))*radii[i]
                self.vert(q,(i/max(1,len(points)-1),j/sides))
        for i in range(len(points)-1):
            for j in range(sides):
                a=start+i*(sides+1)+j; self.f.append((a,a+1,a+sides+2,a+sides+1))
        self.f.append(tuple(start+j for j in reversed(range(sides))))
        end=start+(len(points)-1)*(sides+1); self.f.append(tuple(end+j for j in range(sides)))
    def sphere(self,p,s,rows=12,cols=20):
        self.grid(rows,cols,lambda u,v:(p[0]+s[0]*sin(pi*u)*cos(v*2*pi),p[1]+s[1]*cos(pi*u),p[2]+s[2]*sin(pi*u)*sin(v*2*pi)))
    def object(self,name,mat,parent):
        mesh=bpy.data.meshes.new(name); mesh.from_pydata(self.p,[],self.f); mesh.update()
        layer=mesh.uv_layers.new(name='UVMap')
        for face in mesh.polygons:
            face.use_smooth=True
            for loop in face.loop_indices: layer.data[loop].uv=self.uv[mesh.loops[loop].vertex_index]
        obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj); obj.parent=parent; obj.data.materials.append(mat); return obj

def root(name,position):
    obj=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(obj); obj.location=xyz(position); return obj

N=1024
v,u=np.mgrid[0:N,0:N].astype(np.float32)/N
noise=np.random.default_rng(83).random((N,N),dtype=np.float32)
iris=material('Iris bronze',(0.38,.27,.095),.28)
pupil=material('Cornea deep',(0.008,.019,.018),.13)
lip=material('Mouth and operculum crease',(.19,.095,.045),.48)
profiles=[
    # Tail peduncle through shoulder to snout: height and half-thickness.
    [(.035,.025),(.045,.035),(.11,.070),(.22,.13),(.28,.16),(.25,.14),(.18,.10),(.09,.068),(.02,.025)],
    [(.055,.026),(.065,.04),(.25,.10),(.47,.15),(.53,.17),(.46,.16),(.30,.12),(.12,.07),(.025,.024)],
    [(.055,.033),(.065,.04),(.23,.10),(.37,.15),(.40,.17),(.37,.16),(.28,.13),(.14,.07),(.036,.035)],
    [(.026,.026),(.035,.035),(.10,.080),(.17,.13),(.20,.145),(.20,.13),(.16,.10),(.09,.06),(.024,.025)],
]
palettes=[[(.76,.22,.046),(1,.64,.24)],[(.90,.61,.07),(.97,.88,.51)],[(.035,.16,.53),(.18,.54,.72)],[(.06,.31,.28),(.38,.65,.52)]]
for kind in range(4):
    r=root('Fish'+str(kind),[-3.3+kind*2.25,2.7,0])
    # Longitudinal UV around body. Repeating staggered, overlapping scale rows.
    x=u*1.6-.8; yy=np.cos(v*2*pi)
    belly=np.clip((-yy+.35)/1.35,0,1)[...,None]
    rgb=np.array(palettes[kind][0])*(1-belly*.58)+np.array(palettes[kind][1])*belly*.58
    rgb=np.broadcast_to(rgb,(N,N,3)).copy()
    rows=v*58; sx=(u*78+(np.floor(rows)%2)*.5)%1-.5; sy=rows%1
    rim=np.exp(-((sy-(.38+sx*sx*1.7))/.07)**2)
    height=.08*rim+.008*noise
    rgb*= (.97+.016*np.cos(sx*6.28)-.022*rim+.012*noise)[...,None]
    if kind==0:
        # Gold flank and narrow lavender eye stripe, without graphic zebra bands.
        stripe=np.exp(-((yy-.10-x*.12)/.10)**2)*np.clip((x-.15)*4,0,1)
        rgb=rgb*(1-stripe[...,None]*.55)+np.array([.48,.24,.48])*stripe[...,None]*.55
    elif kind==1:
        eye_band=np.exp(-((x-.47+yy*.11)/.095)**6)
        chevrons=(.5+.5*np.cos(x*43+abs(yy)*5))**14*.28*(1-eye_band)
        rgb*= (1-.9*eye_band-.65*chevrons)[...,None]
        spot=np.exp(-(((x+.36)/.13)**2+((yy-.35)/.25)**2)*2)
        rgb=rgb*(1-spot[...,None])+.025*spot[...,None]
    elif kind==2:
        band=np.exp(-((yy-.42-.14*np.sin(x*6))/.18)**4)*np.clip((.52-x)*4,0,1)
        rgb*= (1-.77*band)[...,None]
    else:
        stripes=(.5+.5*np.cos(yy*35+x*8))**9*.38
        rgb=rgb*(1-stripes[...,None])+np.array([.73,.28,.26])*stripes[...,None]
    skin=textured('Fish '+str(kind)+' scales',rgb,height,.40,.18)
    profile=np.array(profiles[kind])
    def shape(t,a):
        at=t*(len(profile)-1); lo=min(len(profile)-2,int(at)); f=at-lo
        p0=profile[max(0,lo-1)]; p1=profile[lo];p2=profile[lo+1];p3=profile[min(len(profile)-1,lo+2)]
        h,w=.5*((2*p1)+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f)
        return (-.8+1.6*t,cos(a*2*pi)*h,sin(a*2*pi)*w)
    body=Mesh(); body.grid(96,64,shape); body.object('Fish%d_body'%kind,skin,r)
    # Fins have actual ray geometry, thin membranes and swept, species-specific silhouettes.
    fin_rgb=np.zeros((N,N,3),np.float32)
    fin_base=([.86,.35,.095],[.83,.65,.20],[.82,.64,.065],[.53,.31,.25])[kind]
    rays=(.5+.5*np.cos(u*2*pi*22+v*.7))**16
    fin_rgb[:]=fin_base; fin_rgb*= (.78+.19*v+.17*rays)[...,None]
    fm=textured('Fish '+str(kind)+' fin membranes',fin_rgb,rays*.16,.47,.30)
    fins=Mesh(); h=max(profile[:,0])
    def fin_strip(a,b,width):
        # Root line to free edge; chord-local material UV retains narrow fin rays.
        def at(t,s):
            base=np.array(a)*(1-t)+np.array(b)*t
            return tuple(base+np.array(width(t))*s)
        fins.grid(48,8,at)
    fin_strip([-.66,.045,0],[.43,h*.80,0],lambda t:[-.10*sin(pi*t),(.14 if kind==3 else .23)*sin(pi*t)**.6+.006*sin(t*24*pi),.008*sin(t*14*pi)])
    fin_strip([-.64,-.045,0],[.23,-h*.86,0],lambda t:[-.07*sin(pi*t),-.16*sin(pi*t)**.8,.006*sin(t*19)])
    # Caudal edge has a concave fork and continuous web, not two triangles.
    fins.grid(48,12,lambda t,s:(-.78-s*(.25+.15*abs(2*t-1)**1.6),(2*t-1)*(.044+s*(h*.72+.08))*(1-.04*abs(2*t-1)**12),.009*sin(t*pi)*sin(s*pi)))
    for side in [-1,1]:
        fins.grid(28,10,lambda t,s,side=side:(.17-s*(.18+.24*sin(pi*t)),-.02-s*(.16+.1*t),side*(profile[4,1]*.9+s*.15*sin(pi*t))))
    fins.object('Fish%d_fins'%kind,fm,r)
    eyes=Mesh(); pupils=Mesh(); creases=Mesh()
    for side in [-1,1]:
        ey=(.50,h*.29,side*.096)
        eyes.sphere(ey,(.043,.044,.020),14,24)
        pupils.sphere((ey[0]+.004,ey[1],ey[2]+side*.017),(.029,.032,.009),14,24)
        pts=[(.30-.065*sin(t*pi),h*(.62-t*1.2),side*(.10+.035*sin(t*pi))) for t in np.linspace(0,1,20)]
        creases.tube(pts,[.0045]*len(pts),6)
    creases.tube([(.793,-.008,-.032),(.807,-.012,0),(.793,-.008,.032)],[.005,.007,.005],8)
    eyes.object('Fish%d_iris'%kind,iris,r); pupils.object('Fish%d_pupils'%kind,pupil,r); creases.object('Fish%d_gills'%kind,lip,r)

# Three real shell silhouettes: scallop valve, blue mussel, irregular oyster.
for kind in range(3):
    r=root('Shell'+str(kind),[-2.5+kind*1.3,.25,.1])
    ribs=(.5+.5*np.cos(v*pi*2*18))**5 if kind==0 else np.zeros_like(v)
    growth=(.5+.5*np.sin(u*(190 if kind==1 else 160)+np.sin(v*17)*1.6))**8
    base=([.70,.44,.31],[.055,.087,.10],[.43,.37,.24])[kind]
    rgb=np.ones((N,N,3))*base
    rgb*= (.72+.19*noise+.24*ribs+.16*growth)[...,None]
    if kind==1: rgb+=np.stack((u*.035,u*.04,u*.07),axis=-1)
    sm=textured('Shell '+str(kind)+' mineral growth',rgb,ribs*.12+growth*.08+noise*.025,.40 if kind==1 else .67,.36)
    sh=Mesh()
    if kind==0:
        def shell(t,a):
            angle=(a-.5)*2.5; rr=.06+t*.88
            return(sin(angle)*rr, .24*sin(pi*t)+.023*cos(angle*20)*t, cos(angle)*rr)
        sh.grid(64,96,shell)
    elif kind==1:
        sh.grid(64,64,lambda t,a:(sin(pi*t)**.65*cos(a*2*pi)*(.16+.14*t),sin(pi*t)*sin(a*2*pi)*.14+.12, t*1.1))
    else:
        sh.grid(64,96,lambda t,a:(cos(a*2*pi)*t*(.39+.04*sin(a*27)+.045*cos(a*13)),.1+.17*(1-t*t)+.018*sin(t*35+a*9)*t,sin(a*2*pi)*t*(.62+.06*cos(a*35))))
    ob=sh.object('Shell%d_valve'%kind,sm,r)
    if kind!=1:
        mod=ob.modifiers.new('Calcareous lip thickness','SOLIDIFY'); mod.thickness=.025; mod.offset=-1

# Kelp: holdfast, tapered stipes, air bladders and individually curled blades.
r=root('Plant0',[1.8,-.35,0])
leafheight=.20*np.cos(u*6*pi+v*8)+.30*np.exp(-((v-.5)*65)**2)+.08*np.sin(u*95+abs(v-.5)*19)
rgb=np.ones((N,N,3))*[.23,.34,.10]; rgb*=(.77+.15*noise+.22*u+.16*np.cos(v*8))[...,None]
leafmat=textured('Kelp olive blades',rgb,leafheight,.54,.45)
stipe=material('Kelp golden stipes',(.22,.27,.065),.59)
leaves=Mesh(); stems=Mesh()
for k in range(4):
    a=k*2.4; h=1.8+k*.26
    def center(t):return Vector((sin(a)*t*t*.5,h*t,cos(a)*t*t*.40))
    pts=[center(t) for t in np.linspace(0,1,35)]; stems.tube(pts,[.025*(1-t*.8) for t in np.linspace(0,1,35)],8)
    for j in range(6):
        t=.17+j*.12; p=center(t); side=-1 if j%2 else 1; length=.44+random.random()*.26
        stems.sphere(p,(.043,.070,.041),8,12)
        def blade(t,s,p=p,side=side,length=length,a=a):
            width=sin(pi*t)**.7*.10; edge=2*s-1
            return(p.x+side*(t*.32+edge*width*cos(a)),p.y+length*t-.16*t*t,p.z+sin(a)*t*.3+edge*width+sin(t*15)*width*abs(edge)+.045*sin(pi*t))
        leaves.grid(28,8,blade)
for k in range(9):
    a=k*2.4; stems.tube([(0,.10,0),(.08*cos(a),.045,.08*sin(a)),(.20*cos(a),.005,.20*sin(a))],[.023,.016,.002],6)
leaves.object('Plant0_blades',leafmat,r); stems.object('Plant0_stipes',stipe,r)

# Branched staghorn, interconnected gorgonian fan, and thin foliose coral plates.
for kind in range(3):
    r=root('Coral'+str(kind),[-2.4+kind*2.0,-2.8,0])
    pores=(.5+.5*np.sin(u*280)*np.sin(v*250))**14
    bases=[[.57,.23,.14],[.43,.13,.25],[.64,.43,.19]]
    rgb=np.ones((N,N,3))*bases[kind]; rgb*=(.88+.12*noise-.22*pores+.10*np.sin(u*18)*np.sin(v*25))[...,None]
    cm=textured('Coral '+str(kind)+' corallites',rgb,pores*.27+noise*.035,.69,.7)
    mesh=Mesh()
    if kind==0:
        def branch(p,d,length,radius,depth):
            end=p+d*length; bend=Vector((random.uniform(-.07,.07),0,random.uniform(-.08,.08)))
            pts=[p.lerp(end,t)+bend*sin(pi*t) for t in np.linspace(0,1,12)]
            mesh.tube(pts,[max(.002,radius*(1-t*.58)) for t in np.linspace(0,1,12)],10)
            mesh.sphere(end,(radius*.42,)*3,6,10)
            if depth<3:
                for side in [-1,1]:
                    direction=(d+Vector((side*random.uniform(.3,.65),.13,random.uniform(-.4,.4)))).normalized()
                    branch(end,direction,length*random.uniform(.61,.8),radius*.61,depth+1)
        for k in range(5):branch(Vector(((k-2)*.13,0,0)),Vector(((k-2)*.24,1,.18*sin(k))).normalized(),.53,.065,0)
    elif kind==1:
        # Reticulate fan, with shared nodes at every crossing (no floating cross bars).
        rows,cols=26,29; nodes={}
        for i in range(rows+1):
            t=i/rows
            for j in range(cols+1):
                a=(j/cols-.5)*2.35; jitter=.019*sin(i*7.37+j*4.13)*t
                edge=1+.07*sin(j*.91)+.03*cos(j*2.71)
                nodes[i,j]=(sin(a)*t*1.28+jitter,cos(a)*t*1.9*edge+.018*sin(j*9.1+i*2.7)*t,.045*sin(i*.31+j*.22))
        mesh.tube([(0,0,0),(0,.18,0),(0,.4,0)],[.055,.037,.025],10)
        for i in range(rows):
            for j in range(cols):
                if i<2 and j%4:continue
                p=nodes[i,j]; q=nodes[i+1,j]; radius=.018*(1-i/rows*.60)
                mid=Vector(p).lerp(Vector(q),.5)+Vector((.007*sin(i*5+j),0,.007*cos(j*3)))
                mesh.tube([p,mid,q],[radius,radius*.85,radius*.9],6)
                if i>2:
                    q=nodes[i+1,j+1];mid=Vector(p).lerp(Vector(q),.5)+Vector((0,.012*sin(j+i),0)); mesh.tube([p,mid,q],[radius*.62,radius*.52,radius*.55],5)
    else:
        for k in range(6):
            rad=.49+k*.08
            mesh.grid(28,96,lambda t,a,k=k,rad=rad:(cos(a*2*pi)*rad*t+.18*sin(k*2),.16+k*.22+.12*t*t+.025*sin(a*40)*t**3,sin(a*2*pi)*rad*t+.15*cos(k*3)))
    ob=mesh.object('Coral%d_colony'%kind,cm,r)
    if kind==2:
        mod=ob.modifiers.new('Living plate thickness','SOLIDIFY');mod.thickness=.023

# Neutral review stage. Library loader extracts named roots, omitting staging objects.
scene=bpy.context.scene; scene.render.engine='BLENDER_EEVEE'
if scene.world is None: scene.world=bpy.data.worlds.new('Marine ambient')
scene.world.color=(.16,.16,.16)
def aim(obj,point): obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-11,5)); cam=bpy.context.object; cam.name='Marine delivery camera'; aim(cam,(0,0,.2));cam.data.type='ORTHO';cam.data.ortho_scale=10.5;scene.camera=cam
for name,loc,energy,col in [('Key',(1,-4,7),1200,(1,.86,.68)),('Fill',(-4,-2,2),850,(.66,.85,1)),('Rim',(3,3,4),1000,(.73,.86,1))]:
    data=bpy.data.lights.new(name,'POINT');data.energy=energy;data.shadow_soft_size=2;data.color=col
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.location=loc;aim(ob,(0,0,0))
scene.render.resolution_x=960;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX'
target=artifacts.file(name='marine-library-review.png',media_type='image/png');scene.render.filepath=target.path
bpy.ops.render.render(write_still=True);target.publish()
result={'meshes':len([o for o in bpy.data.objects if o.type=='MESH']),'vertices':sum(len(o.data.vertices) for o in bpy.data.objects if o.type=='MESH'),'assets':['Fish0','Fish1','Fish2','Fish3','Shell0','Shell1','Shell2','Plant0','Coral0','Coral1','Coral2'],'textures':len(bpy.data.images)}
