"""Refine revision-9 swimming without rebuilding the accepted character.
Standalone cloud mutation for the accepted revision-9 scene.
Retains previous actions as fake-user backups and repairs mixed outer-arm weights.
"""
import bpy, math
from mathutils import Quaternion
rig=bpy.data.objects['OCTOPUS_RIG'];body=bpy.data.objects['Octopus | continuous deforming skin']
for owner in (rig,body.data.shape_keys):
    if owner.animation_data and owner.animation_data.action:
        owner.animation_data.action.use_fake_user=True
        owner.animation_data.action=None
for b in rig.pose.bones:
    b.rotation_mode='QUATERNION';b.rotation_quaternion=Quaternion();b.location=(0,0,0);b.scale=(1,1,1)
# A distal vertex must not follow two different arms at a crossing. Blend this
# repair in outside the shared crown to retain the soft proximal connection.
rebound=0
for v in body.data.vertices:
    radius=math.hypot(v.co.x,v.co.y)
    if radius<=.235:continue
    original={g.group:g.weight for g in v.groups}
    totals={}
    for idx,w in original.items():
        name=body.vertex_groups[idx].name
        if name.startswith('ARM_'):totals[name[:6]]=totals.get(name[:6],0)+w
    if len(totals)<2:continue
    winner=max(totals,key=totals.get)
    kept={idx:w for idx,w in original.items() if body.vertex_groups[idx].name.startswith(winner+'_')}
    total=sum(kept.values())
    if total<1e-8:continue
    t=min(1,(radius-.235)/.075);alpha=t*t*(3-2*t)
    weights={idx:(1-alpha)*w+alpha*kept.get(idx,0)/total for idx,w in original.items()}
    for idx in original:body.vertex_groups[idx].remove([v.index])
    for idx,w in weights.items():
        if w>1e-8:body.vertex_groups[idx].add([v.index],w,'REPLACE')
    rebound+=1
body['swim_weight_refinement']='Dominant outer-arm ownership, smooth crown boundary; revision 10'
print('Repaired mixed arm vertices:',rebound)

"""First in-place swim study for the Codera Blender character.
72-frame periodic cycle at 24 fps: recovery 36, power 24, coast 12.
Timing is artistic scaling of the research phases, not measured motion capture.
Preserves object transforms/materials and creates skeletal + mantle animation.
"""
import bpy,math
from mathutils import Vector,Quaternion
scene=bpy.context.scene;rig=bpy.data.objects['OCTOPUS_RIG'];body=bpy.data.objects['Octopus | continuous deforming skin']


N=72;scene.render.fps=24;scene.frame_start=1;scene.frame_end=N+1
rest={b.name:b.matrix_local.to_quaternion() for b in rig.data.bones}
base={b.name:b.rotation_quaternion.copy() if b.rotation_mode=='QUATERNION' else b.rotation_euler.to_quaternion() for b in rig.pose.bones}
root=rig.pose.bones['ROOT'];root.rotation_mode='QUATERNION';base_loc=root.location.copy()
def ease(x):x=max(0,min(1,x));return x*x*x*(x*(x*6-15)+10)
def openness(p):
    p=p%1
    if p<.5:return ease(p/.5)
    if p<5/6:return 1-ease((p-.5)/(1/3))
    return 0
previous={}
for frame in range(1,N+2):
    scene.frame_set(frame);phase=((frame-1)/N)%1;opened=openness(phase)
    # Camera-space station keeping; translation through the ocean is a later layer.
    root.location=base_loc+Vector((0,0,-.035*opened))
    root.rotation_quaternion=base['ROOT']@Quaternion((1,0,0),.035*math.sin(phase*math.tau))
    root.keyframe_insert('location',frame=frame,group='Body station keeping')
    root.keyframe_insert('rotation_quaternion',frame=frame,group='Body station keeping')
    root_world=rest['ROOT']@root.rotation_quaternion
    root_delta=root_world@rest['ROOT'].inverted()
    for i in range(8):
        parent_world=root_world;parent_rest=rest['ROOT']
        for j in range(24):
            name=f'ARM_{i+1:02}_{j:02}';b=rig.pose.bones[name];b.rotation_mode='QUATERNION'
            t=(j+.5)/24
            # Delayed distal response; all arms share the propulsion phase while
            # retaining small individual offsets rather than unrelated sine waves.
            delay=.085*t+[-.008,.006,.012,-.007,.003,.009,-.011,-.002][i]*t
            fold=1-openness(phase-delay)
            tangent=(rig.data.bones[name].tail_local-rig.data.bones[name].head_local).normalized()
            stream=Vector((.22*math.sin(i*1.7),.16*math.cos(i*1.3),-1)).normalized()
            influence=fold*(.025+.70*ease(min(1,t/.65)))
            direction=tangent.lerp(stream,influence).normalized()
            change=tangent.rotation_difference(direction)
            twist=.035*math.sin(phase*math.tau-t*3+i*.7)*t*t
            target=root_delta@change@rest[name]@Quaternion((0,1,0),twist)
            inherited=parent_world@parent_rest.inverted()@rest[name]
            q=inherited.inverted()@target
            if name in previous and q.dot(previous[name])<0:q.negate()
            previous[name]=q.copy();b.rotation_quaternion=q
            b.keyframe_insert('rotation_quaternion',frame=frame,group=f'Arm {i+1:02}')
            parent_world=target;parent_rest=rest[name]
    mantle=rig.pose.bones['MANTLE'];mantle.rotation_mode='QUATERNION'
    mantle.rotation_quaternion=base['MANTLE']@Quaternion((1,0,0),.025*math.sin(phase*math.tau-.4))
    mantle.keyframe_insert('rotation_quaternion',frame=frame,group='Mantle follow-through')
    key=body.data.shape_keys.key_blocks['Mantle ventilation'];key.value=.18+.38*opened
    key.keyframe_insert('value',frame=frame,group='Mantle ventilation')
rig.animation_data.action.name='Codera Swim II — recovery power coast'
body.data.shape_keys.animation_data.action.name='Codera Swim II — mantle'
curves=0
for action in [rig.animation_data.action,body.data.shape_keys.animation_data.action]:
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    curves+=1
                    for k in fc.keyframe_points:k.interpolation='LINEAR'
scene.frame_set(37)
rig['swim_note']='In-place 3-second prototype. Recovery 1.5 s, power 1 s, coast .5 s. No path or den contacts.'
result={'frames':[1,73],'fps':24,'duration_seconds':3,'keyed_curves':curves,'actions':[rig.animation_data.action.name,body.data.shape_keys.animation_data.action.name],'camera':scene.camera.name if scene.camera else None}


result['rebound_vertices']=rebound

# Delivery framing pass (cloud revision 11); allow the wider closing silhouette.
c=scene.camera;c.location=(.3,-3,.6)
c.rotation_euler=(Vector((0,0,-.35))-c.location).to_track_quat('-Z','Y').to_euler()
c.data.type='ORTHO';c.data.ortho_scale=2.8
