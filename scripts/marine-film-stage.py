"""Portable review lighting and non-overlapping asset presentation."""
import bpy
for i in range(4): bpy.data.objects['Fish'+str(i)].location.x=-3.3+i*2.25
scene=bpy.context.scene
scene.camera.data.ortho_scale=10.5
for name,power in [('Key',3000),('Fill',2125),('Rim',2500)]:
    light=bpy.data.objects[name].data;light.type='POINT';light.energy=power;light.shadow_soft_size=2
scene.eevee.taa_render_samples=16
scene.render.resolution_x=960;scene.render.resolution_y=800
scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG'
target=artifacts.file(name='marine-library-delivery.png',media_type='image/png');scene.render.filepath=target.path
bpy.ops.render.render(write_still=True);target.publish()
result={'camera':scene.camera.name,'separated_fish_roots':4,'portable_lights':3,'render_samples':16}
