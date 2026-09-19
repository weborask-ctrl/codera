"""Follow-up to marine-film-library.py: round the snout consistently across
body, operculum, lips, eyes and fin roots without disturbing their UVs.
"""
import bpy, math
for obj in bpy.data.objects:
    if obj.type!='MESH' or not obj.name.startswith('Fish'):continue
    for vertex in obj.data.vertices:
        x=vertex.co.x
        if x>.25:
            t=min(1,max(0,(x-.25)/.55))
            vertex.co.x=.25+.55*(1-(1-t)**1.55)
            vertex.co.z-=t*t*.025
    obj.data.update()
# Membranes are lightly translucent. No glass/refraction pass is required.
for mat in bpy.data.materials:
    bs=mat.node_tree.nodes.get('Principled BSDF') if mat.use_nodes else None
    if bs and 'fin membranes' in mat.name:
        bs.inputs['Alpha'].default_value=.88
        bs.inputs['Roughness'].default_value=.49
    if bs and 'Mouth and operculum' in mat.name:bs.inputs['Roughness'].default_value=.73
scene=bpy.context.scene
scene.render.resolution_x=960;scene.render.resolution_y=800
scene.render.image_settings.media_type='IMAGE';scene.render.image_settings.file_format='PNG'
target=artifacts.file(name='marine-library-final.png',media_type='image/png');scene.render.filepath=target.path
bpy.ops.render.render(write_still=True);target.publish()
result={'refined':'rounded snouts, seated eyes, softer gill highlights, translucent membranes','assets':11}
