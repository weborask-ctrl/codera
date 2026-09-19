"""Repair isolated skin weights and author a continuous 12-second motion study.
Input: accepted revision 11. Geometry, materials and rest shape are preserved.
Animation is authored movement, not fluid simulation or scene-contact motion.
"""
import bpy, math, collections
from mathutils import Vector, Quaternion
scene=bpy.context.scene
rig=bpy.data.objects['OCTOPUS_RIG']
body=bpy.data.objects['Octopus | continuous deforming skin']
weights=[{g.group:g.weight for g in v.groups} for v in body.data.vertices]
labels=[]
for ws in weights:
    totals={}
    for idx,w in ws.items():
        n=body.vertex_groups[idx].name
        if n.startswith('ARM_'):totals[n[:6]]=totals.get(n[:6],0)+w
    labels.append(max(totals,key=totals.get) if totals and max(totals.values())>.5 else 'CROWN')
adj=[[] for _ in labels]
for e in body.data.edges:
    a,b=e.vertices;adj[a].append(b);adj[b].append(a)
seen=set();repairs=[]
for start in range(len(labels)):
    if start in seen or labels[start]=='CROWN':continue
    stack=[start];seen.add(start);component=[]
    while stack:
        v=stack.pop();component.append(v)
        for n in adj[v]:
            if n not in seen and labels[n]==labels[start]:seen.add(n);stack.append(n)
    if len(component)>32 or min(math.hypot(*body.data.vertices[v].co[:2]) for v in component)<.235:continue
    boundary={n for v in component for n in adj[v] if labels[n]!=labels[start]}
    if not boundary:continue  # Do not relabel genuine disconnected tip remnants.
    votes=collections.Counter(labels[n] for n in boundary)
    winner=votes.most_common(1)[0][0]
    if winner=='CROWN':continue
    donors=[n for n in boundary if labels[n]==winner]
    for v in component:
        ws={}
        for n in donors:
            factor=1/max((body.data.vertices[v].co-body.data.vertices[n].co).length,1e-5)**2
            for idx,w in weights[n].items():
                if body.vertex_groups[idx].name.startswith(winner+'_'):ws[idx]=ws.get(idx,0)+w*factor
        total=sum(ws.values())
        if total:
            for idx in weights[v]:body.vertex_groups[idx].remove([v])
            weights[v]={idx:w/total for idx,w in ws.items()}
            for idx,w in weights[v].items():body.vertex_groups[idx].add([v],w,'REPLACE')
            repairs.append(v)
body['isolated_weight_repairs']=str(repairs)

# Preserve earlier iterations as editable backups, not active playback tracks.
for owner in (rig,body.data.shape_keys):
    if owner.animation_data and owner.animation_data.action:
        owner.animation_data.action.use_fake_user=True;owner.animation_data.action=None
for bone in rig.pose.bones:
    bone.rotation_mode='QUATERNION';bone.rotation_quaternion=Quaternion()
    bone.location=(0,0,0);bone.scale=(1,1,1)
N=288;scene.render.fps=24;scene.frame_start=1;scene.frame_end=N+1
rest={b.name:b.matrix_local.to_quaternion() for b in rig.data.bones}
root=rig.pose.bones['ROOT'];previous={}
def ease(x):
    x=max(0,min(1,x));return x*x*x*(x*(x*6-15)+10)
def openness(p):
    p%=1
    if p<.5:return ease(p/.5)
    if p<5/6:return 1-ease((p-.5)/(1/3))
    return 0
def key_rotation(b,q,frame):
    if b.name in previous and q.dot(previous[b.name])<0:q.negate()
    previous[b.name]=q.copy();b.rotation_quaternion=q
    b.keyframe_insert('rotation_quaternion',frame=frame,group=b.name.split('_')[0])
for frame in range(1,N+2):
    scene.frame_set(frame);time=((frame-1)/24)%12;phase=(time/3)%1;theta=time/12*math.tau
    opened=openness(phase);heading=.38*math.cos(theta)
    pitch=.10*math.sin(theta*2)+.025*math.sin(phase*math.tau)
    bank=-.10*math.sin(theta)
    delta=Quaternion((0,0,1),heading)@Quaternion((1,0,0),pitch)@Quaternion((0,1,0),bank)
    root.location=rest['ROOT'].inverted()@Vector((.20*math.sin(theta),.10*(1-math.cos(theta)),.065*math.sin(2*theta)-.025*opened))
    root.keyframe_insert('location',frame=frame,group='Travel and buoyancy')
    key_rotation(root,rest['ROOT'].inverted()@delta@rest['ROOT'],frame)
    root_world=rest['ROOT']@root.rotation_quaternion
    for i in range(8):
        parent_world=root_world;parent_rest=rest['ROOT']
        for j in range(24):
            name=f'ARM_{i+1:02}_{j:02}';b=rig.pose.bones[name];t=(j+.5)/24
            delay=.085*t+[-.008,.006,.012,-.007,.003,.009,-.011,-.002][i]*t
            fold=1-openness(phase-delay)
            tangent=(rig.data.bones[name].tail_local-rig.data.bones[name].head_local).normalized()
            stream=Vector((.22*math.sin(i*1.7)+.035*math.sin(theta),.16*math.cos(i*1.3),-1)).normalized()
            influence=fold*(.025+.70*ease(min(1,t/.65)))
            direction=tangent.lerp(stream,influence).normalized()
            twist=.035*math.sin(phase*math.tau-t*3+i*.7)*t*t
            target=delta@tangent.rotation_difference(direction)@rest[name]@Quaternion((0,1,0),twist)
            inherited=parent_world@parent_rest.inverted()@rest[name]
            key_rotation(b,inherited.inverted()@target,frame)
            parent_world=target;parent_rest=rest[name]
    key_rotation(rig.pose.bones['MANTLE'],Quaternion((1,0,0),.025*math.sin(phase*math.tau-.4)),frame)
    key_rotation(rig.pose.bones['SIPHON'],Quaternion((0,0,1),-.08*math.cos(theta)),frame)
    for name in ('EYE_-1','EYE_1'):
        key_rotation(rig.pose.bones[name],Quaternion((0,0,1),.035*math.cos(theta+.15)),frame)
    key=body.data.shape_keys.key_blocks['Mantle ventilation'];key.value=.18+.38*opened
    key.keyframe_insert('value',frame=frame,group='Mantle ventilation')
rig.animation_data.action.name='Codera Motion III — swim steer rise glide'
body.data.shape_keys.animation_data.action.name='Codera Motion III — mantle'
for action in (rig.animation_data.action,body.data.shape_keys.animation_data.action):
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for k in fc.keyframe_points:k.interpolation='LINEAR'
scene.frame_set(37)
rig['swim_note']='12-second continuous authored motion study: four strokes, left/right steering, small rise/descent and body bank. No reef contact.'
result={'repaired_vertices':repairs,'frames':[1,289],'fps':24,'duration':12,'rig_action':rig.animation_data.action.name}
