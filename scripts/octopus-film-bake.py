"""Run once per PASS: color, normal, roughness. Packed, portable skin maps."""
import bpy
PASS='color'
s=bpy.context.scene;body=bpy.data.objects['Octopus | continuous deforming skin'];rig=bpy.data.objects['OCTOPUS_RIG']
if PASS=='color':
    source=body.data.materials[0];source.use_fake_user=True
    m=source.copy();m.name='Codera skin | baked PBR';body.data.materials[0]=m
else:m=body.data.materials[0]
n=m.node_tree.nodes;l=m.node_tree.links;p=next(v for v in n if v.type=='BSDF_PRINCIPLED');out=next(v for v in n if v.type=='OUTPUT_MATERIAL')
size=2048 if PASS!='roughness' else 1024
im=bpy.data.images.new('Codera skin '+PASS,width=size,height=size,alpha=False)
im.colorspace_settings.name='sRGB' if PASS=='color' else 'Non-Color'
node=n.new('ShaderNodeTexImage');node.name='BAKED_'+PASS;node.image=im
for v in n:v.select=False
node.select=True;n.active=node
s.render.engine='CYCLES';s.cycles.samples=4;s.render.bake.margin=12
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
previous=rig.data.pose_position;rig.data.pose_position='REST'
if PASS in ('color','roughness'):
    emission=n.new('ShaderNodeEmission')
    src=n['FILM_COLOR_SOURCE'] if PASS=='color' else n['FILM_ROUGHNESS_SOURCE']
    l.new(src.outputs[0],emission.inputs['Color']);l.new(emission.outputs[0],out.inputs['Surface'])
    bpy.ops.object.bake(type='EMIT')
    n.remove(emission);l.new(p.outputs['BSDF'],out.inputs['Surface'])
else:bpy.ops.object.bake(type='NORMAL',normal_space='TANGENT')
im.pack();rig.data.pose_position=previous
if PASS=='roughness':
    l.new(n['BAKED_color'].outputs['Color'],p.inputs['Base Color'])
    l.new(n['BAKED_roughness'].outputs['Color'],p.inputs['Roughness'])
    normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.75
    l.new(n['BAKED_normal'].outputs['Color'],normal.inputs['Color']);l.new(normal.outputs['Normal'],p.inputs['Normal'])
    p.inputs['Base Color'].default_value=(1,1,1,1)
    # Explicit portable defaults for small eye housings and siphon. Their
    # procedural source remains editable in the blend; web adds subtle grain.
    source=bpy.data.materials.get('Codera skin | chromatophores and papillae')
    source.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.29,.085,.04,1)
result={'pass':PASS,'image':im.name,'size':list(im.size),'packed':bool(im.packed_file),'finished':PASS=='roughness'}
