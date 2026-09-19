"""Codera editable octopus study. Run in Blender 5.2; no external assets.
Rest pose only. Rig is a deformation foundation, not a finished animation.
Cloud runner supplies `artifacts`; local execution optionally accepts --output.
"""
import bpy, bmesh, math, json, sys
from mathutils import Vector
from math import sin, cos, pi

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
S = .25
PATHS = [
 [[-.23,-.24,.44],[-.50,-.90,.88],[-.85,-1.67,1.14],[-.67,-2.25,1.13],[-.13,-2.35,.98],[.17,-2,.77],[.03,-1.74,.65]],
 [[.24,-.24,.44],[.65,-.80,.87],[1.12,-1.42,1.02],[1.63,-1.85,.85],[2.08,-1.68,.54],[2.16,-1.24,.36],[1.91,-1.04,.33]],
 [[.49,-.17,.20],[1.10,-.52,.38],[1.96,-.79,.24],[2.62,-.61,0],[2.80,-.14,-.16],[2.56,.08,-.12],[2.30,-.06,.03]],
 [[.47,-.12,-.23],[1.04,-.40,-.45],[1.64,-.10,-.61],[1.93,.47,-.55],[1.64,.81,-.44],[1.30,.62,-.33],[1.36,.33,-.25]],
 [[.19,-.14,-.46],[.43,-.75,-.71],[.98,-1.30,-.93],[1.50,-1.61,-.97],[1.82,-1.52,-.92]],
 [[-.20,-.14,-.46],[-.74,-.46,-.83],[-1.25,-.24,-.96],[-1.40,.20,-.85],[-1.14,.49,-.73],[-.88,.29,-.67]],
 [[-.48,-.13,-.22],[-1.10,-.63,-.53],[-1.90,-1.03,-.59],[-2.50,-.79,-.43],[-2.73,-.34,-.18],[-2.50,-.03,-.02],[-2.22,-.16,.07]],
 [[-.48,-.20,.21],[-1.02,-.77,.54],[-1.63,-1.39,.66],[-2.15,-1.79,.49],[-2.48,-1.65,.23],[-2.55,-1.33,.09]]]
# IDs describe spatial order of the authored proxy, not a confirmed biological L1-R4 map.
def xyz(p): return Vector((p[0]*S,-p[2]*S,p[1]*S))
def point(i,t):
    p=[xyz(v) for v in PATHS[i]]; u=min(.999999,max(0,t))*(len(p)-1); j=int(u); f=u-j
    a,b,c,d=p[max(0,j-1)],p[j],p[min(j+1,len(p)-1)],p[min(j+2,len(p)-1)]
    return .5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f)
def radius(i,t): return S*((.39 if i<2 else .32)*(1-t)**1.22+.009)
def frame(i,t):
    tangent=(point(i,min(1,t+.001))-point(i,max(0,t-.001))).normalized()
    facing=Vector((0,-1,-.28)); n=(facing-tangent*facing.dot(tangent)).normalized()
    side=tangent.cross(n).normalized()
    twist=[-.48,.40,.6,.85,1,-.9,-.65,-.4][i]*t
    return tangent,n*cos(twist)+side*sin(twist),side*cos(twist)-n*sin(twist)
def mat(name,color,rough=.38):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough
    return m
skin=mat('Skin | copper ochre',(.29,.067,.024),.38)
n=skin.node_tree.nodes; l=skin.node_tree.links; p=n.get('Principled BSDF')
p.inputs['Subsurface Weight'].default_value=.075
noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=52; noise.inputs['Detail'].default_value=3
ramp=n.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position=.2; ramp.color_ramp.elements[0].color=(.065,.014,.007,1)
ramp.color_ramp.elements[1].position=.8; ramp.color_ramp.elements[1].color=(.48,.19,.052,1)
l.new(noise.outputs['Fac'],ramp.inputs[0]); l.new(ramp.outputs[0],p.inputs['Base Color'])
micro=n.new('ShaderNodeTexNoise'); micro.inputs['Scale'].default_value=260
bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.18; bump.inputs['Distance'].default_value=.001
l.new(micro.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs[0],p.inputs['Normal'])
cupmat=mat('Suckers | warm ivory',(.48,.27,.14),.44)
iris=mat('Iris | amber',(.3,.17,.042),.24); pupil=mat('Pupil | horizontal slit',(.003,.006,.008),.18)
def mesh(name,vs,fs,material):
    me=bpy.data.meshes.new(name); me.from_pydata(vs,[],fs); me.update()
    bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
    o=bpy.data.objects.new(name,me); bpy.context.collection.objects.link(o); o.data.materials.append(material)
    for f in me.polygons: f.use_smooth=True
    return o
def uv(name,loc,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    for f in o.data.polygons:f.use_smooth=True
    return o

armdata=bpy.data.armatures.new('Octopus deformation skeleton')
rig=bpy.data.objects.new('OCTOPUS_RIG',armdata); bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig; rig.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
root=armdata.edit_bones.new('ROOT'); root.head=(0,0,0); root.tail=(0,0,.1)
mantle=armdata.edit_bones.new('MANTLE'); mantle.head=(0,0,.06); mantle.tail=(0,.035,.32); mantle.parent=root
NB=24
for i in range(8):
    prev=root
    for j in range(NB):
        b=armdata.edit_bones.new(f'ARM_{i+1:02}_{j:02}'); b.head=point(i,j/NB); b.tail=point(i,(j+1)/NB)
        b.parent=prev; b.use_connect=j>0; prev=b
bpy.ops.object.mode_set(mode='OBJECT'); rig.show_in_front=True
rig['description']='Eight independent chains. Local Y stretch with inverse-square-root X/Z compensation preserves approximate volume. No locomotion clips yet.'
rig['arm_numbering']='Spatial proxy IDs 01-08; not asserted biological L/R mapping.'
def bind(o,weights):
    groups={}
    for idx,ws in enumerate(weights):
        for name,w in ws.items():
            if w<=0:continue
            if name not in groups:groups[name]=o.vertex_groups.new(name=name)
            groups[name].add([idx],w,'REPLACE')
    mod=o.modifiers.new('Deform with octopus rig','ARMATURE'); mod.object=rig; mod.use_deform_preserve_volume=True
    o.parent=rig
def weights(i,t):
    u=max(0,min(NB-1,t*NB-.5)); j=int(u); f=u-j
    if j==NB-1:return {f'ARM_{i+1:02}_{j:02}':1}
    return {f'ARM_{i+1:02}_{j:02}':1-f,f'ARM_{i+1:02}_{j+1:02}':f}

# Continuous ring surface from crown through neck to mantle, with editable quad topology.
rings=[(-.30,.47,.42,0),(-.17,.57,.47,0),(0,.49,.41,0),(.23,.45,.39,0),(.43,.49,.43,-.03),(.64,.59,.49,-.1),(.9,.67,.55,-.16),(1.2,.63,.54,-.21),(1.48,.47,.43,-.25),(1.65,.23,.23,-.27),(1.7,.01,.01,-.27)]
vs=[]; fs=[]; ws=[]; N=48
for z,rx,ry,depth in rings:
    for j in range(N):
        a=2*pi*j/N; vs.append((S*rx*cos(a),S*(depth+ry*sin(a)),S*z))
        w=max(0,min(1,(z-.24)/.6)); ws.append({'ROOT':1-w,'MANTLE':w})
for k in range(len(rings)-1):
    for j in range(N): fs.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
fs.extend([tuple(reversed(range(N))),tuple((len(rings)-1)*N+j for j in range(N))])
body=mesh('Mantle head and crown',vs,fs,skin); bind(body,ws)
sub=body.modifiers.new('Silhouette subdivision','SUBSURF'); sub.levels=2; sub.render_levels=2
body.shape_key_add(name='Basis'); breath=body.shape_key_add(name='Mantle ventilation')
for v in breath.data:
    f=max(0,min(1,(v.co.z/S-.4)/.7)); v.co.x*=1+.09*f; v.co.y*=1+.07*f

for i in range(8):
    vs=[]; fs=[]; ws=[]; NS=72; NR=16
    for k in range(NS+1):
        t=k/NS; c=point(i,t); _,n,b=frame(i,t); r=radius(i,t)
        for j in range(NR):
            a=2*pi*j/NR; vs.append(tuple(c+r*(n*cos(a)*.94+b*sin(a)))); ws.append(weights(i,t))
    for k in range(NS):
        for j in range(NR):fs.append((k*NR+j,k*NR+(j+1)%NR,(k+1)*NR+(j+1)%NR,(k+1)*NR+j))
    fs.append(tuple(NS*NR+j for j in range(NR)))
    fs.append(tuple(reversed(range(NR))))
    o=mesh(f'Arm {i+1:02} | quad surface',vs,fs,skin);bind(o,ws)
    sub=o.modifiers.new('Arm surface smoothing','SUBSURF');sub.levels=1;sub.render_levels=1
    # Two offset rows, attached with exactly the same arm weights; cup-shaped profiles.
    vs=[];fs=[];ws=[]; profile=[(.58,0),(.9,.25),(1,.5),(.9,.72),(.68,.62),(.48,.27),(.08,.16)]
    for k in range(30):
        for row in [-1,1]:
            t=.11+k*.027+(row+1)*.003; c=point(i,t); tangent,n,b=frame(i,t); r=radius(i,t)
            normal=(n*.88+b*row*.47).normalized(); center=c+normal*r*.87
            lateral=tangent.cross(normal).normalized(); cr=r*.43; base=len(vs)
            for rad,h in profile:
                for j in range(12):
                    a=2*pi*j/12; vs.append(tuple(center+cr*(rad*(tangent*cos(a)+lateral*sin(a))+normal*h)));ws.append(weights(i,t))
            for q in range(len(profile)-1):
                for j in range(12):fs.append((base+q*12+j,base+q*12+(j+1)%12,base+(q+1)*12+(j+1)%12,base+(q+1)*12+j))
    cups=mesh(f'Arm {i+1:02} | paired suckers',vs,fs,cupmat);bind(cups,ws)

# Short interbrachial membranes follow adjacent proximal chains.
for i in range(8):
    other=(i+1)%8; vs=[];fs=[];ws=[]; NX=10;NY=8
    for k in range(NY+1):
        r=k/NY
        for j in range(NX+1):
            u=j/NX; t=.015+r*(.17-.065*sin(pi*u)); a=point(i,t); b=point(other,t)
            pos=a.lerp(b,u); pos.z+=S*.09*sin(pi*u)*r
            vs.append(tuple(pos)); w={}
            for name,value in weights(i,t).items():w[name]=value*(1-u)
            for name,value in weights(other,t).items():w[name]=w.get(name,0)+value*u
            ws.append(w)
    for k in range(NY):
        for j in range(NX):q=k*(NX+1)+j;fs.append((q,q+1,q+NX+2,q+NX+1))
    o=mesh(f'Web membrane {i+1:02}',vs,fs,skin);bind(o,ws)
    solid=o.modifiers.new('Thin soft web','SOLIDIFY');solid.thickness=.006
    sub=o.modifiers.new('Web smoothing','SUBSURF');sub.levels=1

for side in [-1,1]:
    center=Vector((side*.49*S,-.405*S,.43*S)); normal=Vector((side*.48,-1,.08)).normalized()
    eye=uv(f'Eye {side}',center,(.044,.04,.046),skin)
    ir=uv(f'Iris {side}',center+normal*.029,(.029,.012,.029),iris)
    pu=uv(f'Horizontal pupil {side}',center+normal*.039,(.024,.005,.007),pupil)
    for o in (eye,ir,pu):bind(o,[{'ROOT':1} for v in o.data.vertices])
# Hollow directional siphon, separate from mantle to allow later aiming.
vs=[];fs=[]
for k,(r,y) in enumerate([(.038,.016),(.027,-.017),(.022,-.04),(.017,-.041),(.017,-.017)]):
    for j in range(24):a=2*pi*j/24;vs.append((.09+r*cos(a),y-.05,.052+r*sin(a)))
for k in range(4):
    for j in range(24):fs.append((k*24+j,k*24+(j+1)%24,(k+1)*24+(j+1)%24,(k+1)*24+j))
o=mesh('Siphon | hollow outlet',vs,fs,skin);bind(o,[{'ROOT':1} for v in vs])

scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.render.fps=24;scene.frame_start=1;scene.frame_end=120
world=bpy.data.worlds.new('Deep blue studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.016,.037,.058,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.45
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,color,size in [('Surface key',(-.9,-1.2,1.7),150,(.65,.86,1),.7),('Warm fill',(1,-1,.4),80,(1,.65,.35),.7),('Blue rim',(.7,.7,1),180,(.2,.65,1),.5)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;aim(o,(0,0,-.08))
camdata=bpy.data.cameras.new('Delivery camera');cam=bpy.data.objects.new('Delivery camera',camdata);bpy.context.collection.objects.link(cam)
cam.location=(.06,-2.8,.65);aim(cam,(0,0,-.10));camdata.type='ORTHO';camdata.ortho_scale=1.65;scene.camera=cam
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
result={'objects':len(bpy.data.objects),'bones':len(rig.data.bones),'base_vertices':sum(len(o.data.vertices) for o in bpy.data.objects if o.type=='MESH'),'animation':'rest pose only','arm_chains':8,'bones_per_arm':NB}
if 'artifacts' in globals():
    target=artifacts.file(name='octopus-rest-front.png',media_type='image/png')
    scene.render.image_settings.media_type='IMAGE';scene.render.filepath=target.path
    bpy.ops.render.render(write_still=True);target.publish()
elif '--output' in sys.argv:
    from pathlib import Path
    out=Path(sys.argv[sys.argv.index('--output')+1]);out.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'codera-octopus-rig.blend'))
    scene.render.filepath=str(out/'octopus-rest-front.png');bpy.ops.render.render(write_still=True)
print(json.dumps(result))
