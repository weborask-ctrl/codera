"""Soften the arm/head transition on the refined Blender study.
Adds a shared fleshy crown, fuses it and smooths only the proximal region.
"""
import bpy, math
from mathutils import kdtree
body=bpy.data.objects['Octopus | continuous deforming skin']
rig=bpy.data.objects['OCTOPUS_RIG']
tree=kdtree.KDTree(len(body.data.vertices));saved=[]
for v in body.data.vertices:
    tree.insert(v.co,v.index)
    saved.append({body.vertex_groups[g.group].name:g.weight for g in v.groups})
tree.balance()
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.object.shape_key_remove(all=True)
for m in list(body.modifiers):body.modifiers.remove(m)
bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=40,location=(0,-.005,-.065))
crown=bpy.context.object;crown.name='Shared proximal crown';crown.scale=(.205,.183,.175)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
crown.data.materials.append(body.data.materials[0])
body.select_set(True);bpy.context.view_layer.objects.active=body;bpy.ops.object.join()
m=body.modifiers.new('Fuse shared crown','REMESH');m.mode='VOXEL';m.voxel_size=.0035;m.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=m.name)
mask=body.vertex_groups.new(name='CROWN_SMOOTH_MASK')
for v in body.data.vertices:
    x,y,z=v.co
    radial=math.sqrt(x*x+y*y)
    w=max(0,min(1,(.37-radial)/.13))*max(0,min(1,(z+.32)/.12))*max(0,min(1,(.15-z)/.08))
    if w:mask.add([v.index],w,'REPLACE')
m=body.modifiers.new('Soft anatomical transition','SMOOTH');m.factor=1;m.iterations=100;m.vertex_group=mask.name
bpy.ops.object.modifier_apply(modifier=m.name)
body.vertex_groups.clear();groups={}
for v in body.data.vertices:
    near=tree.find_n(v.co,3);w={}
    for _,idx,dist in near:
        f=1/max(dist,.0005)**2
        for name,value in saved[idx].items():w[name]=w.get(name,0)+value*f
    # Smooth the influence transition back into the stable head.
    root=max(0,min(1,(v.co.z+.13)/.19)) if v.co.z<.13 else 0
    total=sum(w.values());w={name:value/total*(1-root) for name,value in w.items()}
    if root:w['ROOT']=w.get('ROOT',0)+root
    strongest=sorted(w.items(),key=lambda p:p[1],reverse=True)[:4];total=sum(value for _,value in strongest)
    for name,value in strongest:
        if name not in groups:groups[name]=body.vertex_groups.new(name=name)
        groups[name].add([v.index],value/total,'REPLACE')
m=body.modifiers.new('Octopus skin deformation','ARMATURE');m.object=rig;m.use_deform_preserve_volume=True
body.shape_key_add(name='Basis');key=body.shape_key_add(name='Mantle ventilation')
for v in key.data:
    f=max(0,min(1,(v.co.z-.10)/.18));v.co.x*=1+.07*f;v.co.y*=1+.05*f
for p in body.data.polygons:p.use_smooth=True
scene=bpy.context.scene;scene.render.resolution_x=720;scene.render.resolution_y=720
result={'skin_vertices':len(body.data.vertices),'change':'shared crown volume and localized smoothing','max_influences':max(len(v.groups) for v in body.data.vertices)}
if 'artifacts' in globals():
    target=artifacts.file(name='octopus-crown-front.png',media_type='image/png');scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG';scene.render.filepath=target.path
    bpy.ops.render.render(write_still=True);target.publish()
