"""Temporary Blender deformation check; does not save a posed master.
Execute as a cloud query after both modelling passes.
"""
import bpy, math
from mathutils import Vector
rig=bpy.data.objects['OCTOPUS_RIG'];scene=bpy.context.scene
scene.render.resolution_x=480;scene.render.resolution_y=480
body=bpy.data.objects['Octopus | continuous deforming skin']
def sample(o):
    dg=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(dg)
    return [v.co.copy() for v in e.data.vertices]
before=sample(body)
for j in range(5,20):
    b=rig.pose.bones[f'ARM_03_{j:02}'];b.rotation_mode='XYZ';b.rotation_euler.x=.055*math.sin((j-5)/15*math.pi)
body.data.shape_keys.key_blocks['Mantle ventilation'].value=.65
bpy.context.view_layer.update();after=sample(body)
displacements=[(a-b).length for a,b in zip(after,before)]
result={'vertices':len(after),'max_displacement_m':max(displacements),'moved_vertices':sum(d>1e-5 for d in displacements),'finite':all(math.isfinite(c) for v in after for c in v),'unweighted_skin_vertices':sum(not v.groups for v in body.data.vertices),'all_weight_sums_valid':all(abs(sum(g.weight for g in v.groups)-1)<.0001 for v in body.data.vertices)}
parent=list(range(len(body.data.vertices)))
def find(i):
    while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
    return i
for e in body.data.edges:
    a,b=map(find,e.vertices)
    if a!=b:parent[b]=a
sizes={}
for i in range(len(parent)):
    r=find(i);sizes[r]=sizes.get(r,0)+1
result['skin_components']=len(sizes)
result['largest_component_fraction']=max(sizes.values())/len(parent)
if 'artifacts' in globals():
    for name,position in [('octopus-test-bend-side.png',(2.4,-1.9,.5))]:
        scene.camera.location=position;scene.camera.rotation_euler=(Vector((0,0,-.1))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
        t=artifacts.file(name=name,media_type='image/png');scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG';scene.render.filepath=t.path
        bpy.ops.render.render(write_still=True);t.publish()
print(result)
