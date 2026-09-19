"""Temporary proximal bend check; execute as a Blender query, not a mutation."""
import bpy,math
from mathutils import Vector
rig=bpy.data.objects['OCTOPUS_RIG'];body=bpy.data.objects['Octopus | continuous deforming skin'];scene=bpy.context.scene
for j in range(8):
    b=rig.pose.bones[f'ARM_03_{j:02}'];b.rotation_mode='XYZ';b.rotation_euler.x=.04*math.sin((j+1)/9*math.pi)
bpy.context.view_layer.update()
e=body.evaluated_get(bpy.context.evaluated_depsgraph_get())
result={'finite':all(math.isfinite(c) for v in e.data.vertices for c in v.co),'unweighted':sum(not v.groups for v in body.data.vertices),'normalized':all(abs(sum(g.weight for g in v.groups)-1)<.0001 for v in body.data.vertices)}
scene.render.resolution_x=480;scene.render.resolution_y=480
scene.camera.location=(1.1,-2.6,.60);scene.camera.rotation_euler=(Vector((0,0,-.1))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
if 'artifacts' in globals():
    t=artifacts.file(name='octopus-crown-bend.png',media_type='image/png');scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG';scene.render.filepath=t.path
    bpy.ops.render.render(write_still=True);t.publish()
