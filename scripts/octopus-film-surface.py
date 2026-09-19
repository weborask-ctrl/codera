"""Film study pass on cloud revision 15. Geometry + exportable UV foundation.
Run with Blender bpy; no external assets. Baking is a separate bounded step.
"""
import bpy, math
from mathutils import Vector, noise
s=bpy.context.scene
body=bpy.data.objects['Octopus | continuous deforming skin']
rig=bpy.data.objects['OCTOPUS_RIG']
s.frame_set(1)
# Preserve every shape key and the existing skeleton. Surface relief follows skin.
if not body.get('film_surface_v1'):
    basis=body.data.shape_keys.key_blocks[0]
    offsets=[]
    for v in body.data.vertices:
        p=basis.data[v.index].co.copy(); n=v.normal.copy()
        mantle=max(0,min(1,(p.z-.13)/.16))
        # Less spherical mantle; soft posterior fullness, asymmetry, neck fold.
        delta=Vector((-p.x*.095*mantle,.026*mantle*mantle,.007*mantle))
        exposed=.25+.75*max(0,min(1,(n.y+.5)/1.5))
        a=noise.noise(p*76+Vector((4,1,7)))
        b=noise.noise(p*184+Vector((7,3,2)))
        papilla=max(0,a+.15)**2*.0048+max(0,b)**2*.0013
        fold=math.sin(p.z*180+noise.noise(p*32)*3)*.00055
        delta+=n*(papilla*exposed+fold*math.exp(-((p.z-.115)/.06)**2))
        offsets.append(delta)
    for key in body.data.shape_keys.key_blocks:
        for v,d in zip(key.data,offsets):v.co+=d
    body['film_surface_v1']=True
body.data.update()

# A single UV atlas lets the actual skin survive glTF export instead of being
# replaced by a uniform browser colour. Smart projection is only the bake layout.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
if not body.data.uv_layers:
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.006)
    bpy.ops.object.mode_set(mode='OBJECT')

skin=bpy.data.materials.new('Codera skin | chromatophores and papillae');skin.use_nodes=True
n=skin.node_tree.nodes;l=skin.node_tree.links;n.clear()
out=n.new('ShaderNodeOutputMaterial');p=n.new('ShaderNodeBsdfPrincipled');l.new(p.outputs['BSDF'],out.inputs['Surface'])
p.inputs['Roughness'].default_value=.53;p.inputs['Subsurface Weight'].default_value=.055
p.inputs['Subsurface Radius'].default_value=(.008,.003,.0015)
p.inputs['Specular IOR Level'].default_value=.26
tex=n.new('ShaderNodeTexCoord')
macro=n.new('ShaderNodeTexNoise');macro.inputs['Scale'].default_value=18;macro.inputs['Detail'].default_value=4;macro.inputs['Roughness'].default_value=.72
l.new(tex.outputs['Position'] if 'Position' in tex.outputs else tex.outputs['Object'],macro.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB');ramp.name='Chromatophore palette'
palette=[(.20,(.024,.009,.010,1)),(.38,(.13,.026,.019,1)),(.52,(.34,.082,.037,1)),(.64,(.55,.23,.105,1)),(.76,(.63,.46,.30,1))]
for e in list(ramp.color_ramp.elements)[2:]:ramp.color_ramp.elements.remove(e)
for i,(pos,col) in enumerate(palette):
    e=ramp.color_ramp.elements[i] if i<2 else ramp.color_ramp.elements.new(pos);e.position=pos;e.color=col
l.new(macro.outputs['Fac'],ramp.inputs[0])
fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=330;fine.inputs['Detail'].default_value=2
l.new(tex.outputs['Object'],fine.inputs['Vector'])
cells=n.new('ShaderNodeTexVoronoi');cells.inputs['Scale'].default_value=190;l.new(tex.outputs['Object'],cells.inputs['Vector'])
spots=n.new('ShaderNodeValToRGB');spots.color_ramp.elements[0].position=.13;spots.color_ramp.elements[0].color=(.15,.08,.07,1);spots.color_ramp.elements[1].position=.31;spots.color_ramp.elements[1].color=(1,1,1,1)
l.new(cells.outputs['Distance'],spots.inputs[0])
mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.55
l.new(ramp.outputs['Color'],mix.inputs[1]);l.new(spots.outputs['Color'],mix.inputs[2]);l.new(mix.outputs[0],p.inputs['Base Color'])
mix.name='FILM_COLOR_SOURCE'
rough=n.new('ShaderNodeMapRange');rough.inputs['From Min'].default_value=.15;rough.inputs['From Max'].default_value=.85;rough.inputs['To Min'].default_value=.43;rough.inputs['To Max'].default_value=.67
l.new(macro.outputs['Fac'],rough.inputs[0]);l.new(rough.outputs[0],p.inputs['Roughness']);rough.name='FILM_ROUGHNESS_SOURCE'
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.3;bump.inputs['Distance'].default_value=.0012
l.new(cells.outputs['Distance'],bump.inputs['Height'])
micro=n.new('ShaderNodeBump');micro.inputs['Strength'].default_value=.22;micro.inputs['Distance'].default_value=.00035
l.new(fine.outputs['Fac'],micro.inputs['Height']);l.new(bump.outputs['Normal'],micro.inputs['Normal']);l.new(micro.outputs['Normal'],p.inputs['Normal'])
for o in bpy.data.objects:
    if o.type!='MESH':continue
    if o==body or o.name.startswith('Eye ') or o.name.startswith('Siphon'):
        o.data.materials.clear();o.data.materials.append(skin)
    elif 'paired suckers' in o.name:
        m=o.data.materials[0];bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.53,.34,.24,1);bs.inputs['Roughness'].default_value=.52
    elif o.name.startswith('Iris '):
        bs=o.data.materials[0].node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.26,.14,.061,1);bs.inputs['Roughness'].default_value=.31
    elif o.name.startswith('Horizontal pupil'):
        bs=o.data.materials[0].node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.002,.003,.004,1);bs.inputs['Roughness'].default_value=.19

# Neutral, broad illumination reveals anatomy instead of wet plastic highlights.
for name,energy in [('Surface key',100),('Warm fill',32),('Blue rim',75)]:
    o=bpy.data.objects.get(name)
    if o:
        o.data.energy=energy
        if o.data.type=='AREA':o.data.size=1.3
sun=bpy.data.objects.get('Web_sun')
if sun:sun.data.energy=.7
s.render.engine='CYCLES';s.cycles.samples=16;s.render.resolution_x=960;s.render.resolution_y=960;s.render.resolution_percentage=100
s.frame_set(24)
t=artifacts.file(name='octopus-film-surface.png',media_type='image/png');s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG';s.render.filepath=t.path;bpy.ops.render.render(write_still=True);t.publish()
result={'skin_vertices':len(body.data.vertices),'uv_layers':[u.name for u in body.data.uv_layers],'material':skin.name,'bake_pending':True}
