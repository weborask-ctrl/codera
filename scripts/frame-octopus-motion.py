import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
s=bpy.context.scene;c=s.camera;c.location=[-0.15806405246257782,-2.788005828857422,0.5727903842926025];c.data.ortho_scale=2.172072214612322
b=bpy.data.objects['Octopus | continuous deforming skin'];margin=1
for f in range(1,290,12):
 s.frame_set(f);o=b.evaluated_get(bpy.context.evaluated_depsgraph_get())
 for corner in o.bound_box:
  p=world_to_camera_view(s,c,o.matrix_world@Vector(corner));margin=min(margin,p.x,1-p.x,p.y,1-p.y)
assert margin>.04,margin
s.frame_set(217);s.render.engine='BLENDER_EEVEE';s.render.resolution_x=400;s.render.resolution_y=400;s.render.resolution_percentage=100;s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG'
t=artifacts.file(name='octopus-motion-centered.png',media_type='image/png');s.render.filepath=t.path;bpy.ops.render.render(write_still=True);t.publish()
s.frame_set(37)
result={'minimum_frame_margin':margin,'camera_scale':c.data.ortho_scale,'frames_checked':25}
