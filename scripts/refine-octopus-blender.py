"""Second modelling pass on build-octopus-blender.py output. Blender 5.2.
Unifies the skin and transfers deformation weights from authored surfaces.
The reproducible source surfaces remain in the build script.
"""
import bpy, math
from mathutils import Vector, kdtree
rig=bpy.data.objects['OCTOPUS_RIG']
body=bpy.data.objects['Mantle head and crown']
# Broader eye-bearing head without enlarging the mantle.
for key in body.data.shape_keys.key_blocks:
    for v in key.data:
        f=math.exp(-((v.co.z-.105)/.05)**2)
        v.co.x*=1+.22*f
skin_parts=[o for o in bpy.data.objects if o.type=='MESH' and (o.name=='Mantle head and crown' or '| quad surface' in o.name or o.name.startswith('Web membrane'))]
coords=[]; weight_data=[]
for o in skin_parts:
    for v in o.data.vertices:
        coords.append(o.matrix_world@v.co)
        weight_data.append({o.vertex_groups[g.group].name:g.weight for g in v.groups})
tree=kdtree.KDTree(len(coords))
for i,c in enumerate(coords):tree.insert(c,i)
tree.balance()
# Apply only surface modifiers before joining, armatures are in their rest pose.
bpy.ops.object.select_all(action='DESELECT')
for o in skin_parts:
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    if o.data.shape_keys:bpy.ops.object.shape_key_remove(all=True)
    for mod in list(o.modifiers):
        if mod.type=='ARMATURE':o.modifiers.remove(mod)
        else:bpy.ops.object.modifier_apply(modifier=mod.name)
    o.select_set(False)
for o in skin_parts:o.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Octopus | continuous deforming skin'
rem=body.modifiers.new('Organic root fusion','REMESH');rem.mode='VOXEL';rem.voxel_size=.0035;rem.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=rem.name)
smooth=body.modifiers.new('Relax root transitions','SMOOTH');smooth.factor=.65;smooth.iterations=5
bpy.ops.object.modifier_apply(modifier=smooth.name)
body.vertex_groups.clear();groups={}
for v in body.data.vertices:
    candidates=tree.find_n(body.matrix_world@v.co,3);combined={}
    for _,idx,dist in candidates:
        factor=1/max(dist,.0005)**2
        for name,w in weight_data[idx].items():combined[name]=combined.get(name,0)+w*factor
    # Explicitly cap influences for predictable web export.
    strongest=sorted(combined.items(),key=lambda x:x[1],reverse=True)[:4];total=sum(w for _,w in strongest)
    for name,w in strongest:
        if name not in groups:groups[name]=body.vertex_groups.new(name=name)
        groups[name].add([v.index],w/total,'REPLACE')
mod=body.modifiers.new('Octopus skin deformation','ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=True
for poly in body.data.polygons:poly.use_smooth=True
body.shape_key_add(name='Basis');breath=body.shape_key_add(name='Mantle ventilation')
for v in breath.data:
    f=max(0,min(1,(v.co.z-.10)/.18));v.co.x*=1+.07*f;v.co.y*=1+.05*f
for side in [-1,1]:
    eye=bpy.data.objects[f'Eye {side}'];eye.location=(side*.111,-.074,.109);eye.scale=(.82,.58,.83)
    ir=bpy.data.objects[f'Iris {side}'];ir.location=(side*.119,-.102,.111);ir.scale=(.77,.65,.77)
    pu=bpy.data.objects[f'Horizontal pupil {side}'];pu.location=(side*.119,-.11,.111);pu.scale=(.8,.75,.77)
# Independent directional controls for the outlet and gaze, still unanimated.
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.object.mode_set(mode='EDIT')
b=rig.data.edit_bones.new('SIPHON');b.head=(.09,-.04,.052);b.tail=(.09,-.10,.052);b.parent=rig.data.edit_bones['ROOT']
for side in [-1,1]:
    b=rig.data.edit_bones.new(f'EYE_{side}');b.head=(side*.111,-.074,.109);b.tail=(side*.111,-.12,.109);b.parent=rig.data.edit_bones['ROOT']
bpy.ops.object.mode_set(mode='OBJECT')
for o in [bpy.data.objects['Siphon | hollow outlet']]+[bpy.data.objects[f'{part} {side}'] for side in [-1,1] for part in ['Eye','Iris','Horizontal pupil']]:
    name='SIPHON' if o.name.startswith('Siphon') else f'EYE_{-1 if o.name.endswith("-1") else 1}'
    o.vertex_groups.clear();vg=o.vertex_groups.new(name=name);vg.add(list(range(len(o.data.vertices))),1,'REPLACE')
skin=bpy.data.materials['Skin | copper ochre'];p=skin.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.48
for n in skin.node_tree.nodes:
    if n.type=='VALTORGB':
        n.color_ramp.elements[0].color=(.037,.009,.005,1);n.color_ramp.elements[1].color=(.29,.085,.018,1)
cup=bpy.data.materials['Suckers | warm ivory'];cup.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.32,.17,.095,1)
for name in ['Surface key','Warm fill','Blue rim']:
    o=bpy.data.objects[name];o.data.energy*=.5
result={'skin_vertices':len(body.data.vertices),'bones':len(rig.data.bones),'max_skin_influences':max(len(v.groups) for v in body.data.vertices),'rest_pose':True}
scene=bpy.context.scene
if 'artifacts' in globals():
    target=artifacts.file(name='octopus-refined-front.png',media_type='image/png');scene.render.image_settings.media_type='IMAGE'
    scene.render.image_settings.file_format='PNG';scene.render.filepath=target.path;bpy.ops.render.render(write_still=True);target.publish()
print(result)
