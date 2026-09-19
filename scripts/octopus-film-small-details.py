"""Portable colour and finer cup rims; retained as editable authored geometry."""
import bpy,math
from mathutils import Vector,noise
def vertex_material(name,rough):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(1,1,1,1);p.inputs['Roughness'].default_value=rough;p.inputs['Specular IOR Level'].default_value=.3
    a=m.node_tree.nodes.new('ShaderNodeVertexColor');a.layer_name='FilmColor';m.node_tree.links.new(a.outputs['Color'],p.inputs['Base Color'])
    return m
cupmat=vertex_material('Codera suckers | tissue rings',.5)
irismat=vertex_material('Codera iris | radial fibres',.28)
housingmat=vertex_material('Codera eye housing | skin',.53)
for o in bpy.data.objects:
    if o.type!='MESH':continue
    cup='paired suckers' in o.name;iris=o.name.startswith('Iris ');housing=o.name.startswith('Eye ')
    if not(cup or iris or housing):continue
    attr=o.data.color_attributes.new(name='FilmColor',type='FLOAT_COLOR',domain='POINT')
    for v in o.data.vertices:
        if cup:
            profile=(v.index%84)//12;angle=(v.index%12)/12*math.tau;k=v.index//84
            colors=[(.22,.093,.065),(.43,.24,.16),(.65,.47,.35),(.72,.54,.42),(.47,.27,.20),(.30,.12,.092),(.24,.077,.058)]
            col=colors[profile];variation=.94+.06*math.sin(angle*3+k*1.77)
        elif iris:
            angle=math.atan2(v.co.z,v.co.x);radius=math.hypot(v.co.x,v.co.z)/.029
            fibre=.5+.5*math.sin(angle*81+math.sin(radius*28)*1.7)
            edge=max(0,min(1,(1-radius)*7));col=(.12+.20*fibre,.065+.13*fibre,.022+.07*fibre);variation=.45+.55*edge
        else:
            p=o.matrix_world@v.co;k=noise.noise(p*125)*.5+.5;col=(.16+.22*k,.035+.11*k,.018+.058*k);variation=1
        attr.data[v.index].color=(*(c*variation for c in col),1)
    o.data.materials.clear();o.data.materials.append(cupmat if cup else irismat if iris else housingmat)
    if cup and not o.get('film_cup_rims'):
        # Slight individual asymmetry; avoid identical circular stamped cups.
        for start in range(0,len(o.data.vertices),84):
            verts=list(o.data.vertices)[start:start+84];center=sum((v.co for v in verts),Vector())/len(verts)
            amount=.96+.045*math.sin(start*.071)
            for v in verts:v.co=center+(v.co-center)*amount
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
        mod=o.modifiers.new('Rounded sucker tissue','SUBSURF');mod.levels=1;mod.render_levels=1
        while list(o.modifiers).index(mod)>0:bpy.ops.object.modifier_move_up(modifier=mod.name)
        bpy.ops.object.modifier_apply(modifier=mod.name);o['film_cup_rims']=True
    if iris:
        o.scale.z*=1.10
result={'cup_tissue':True,'iris_fibres':True,'portable_vertex_color':True}
