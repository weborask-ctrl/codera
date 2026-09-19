"""Append a controlled sand-rest pose after the existing 12-second swim cycle.
Local bone rotations remain length preserving. Exported endpoint is at 14 s.
"""
import bpy,math
from mathutils import Vector,Quaternion
s=bpy.context.scene;rig=bpy.data.objects['OCTOPUS_RIG'];body=bpy.data.objects['Octopus | continuous deforming skin']
s.frame_set(289)
start={b.name:b.rotation_quaternion.copy() for b in rig.pose.bones}
rest={b.name:b.matrix_local.to_quaternion() for b in rig.data.bones}
ground={name:q.copy() for name,q in start.items()}
ground['ROOT']=Quaternion();ground['MANTLE']=Quaternion();ground['SIPHON']=Quaternion()
angles=[-2.08,-1.10,-.28,.42,1.12,1.97,2.73,-2.85]
def shelf(x,z):
    return -52.8+.38*math.sin(x*.45+z*.16)+.19*math.cos(z*.62)+2*math.exp(-((abs(x)-12)/4)**2)
SCALE=3.8*1.02;YAW=-.25;ROOT_Y=shelf(18,-151)+1.1
def sand_z(x,y):
    wx=18+SCALE*(math.cos(YAW)*x-math.sin(YAW)*y)
    wz=-151+SCALE*(-math.sin(YAW)*x-math.cos(YAW)*y)
    return (shelf(wx,wz)-ROOT_Y)/SCALE
for i in range(8):
    parent_world=rest['ROOT'];parent_rest=rest['ROOT']
    current=rig.data.bones[f'ARM_{i+1:02}_00'].head_local.copy()
    for j in range(24):
        name=f'ARM_{i+1:02}_{j:02}';bone=rig.data.bones[name];t=j/23
        length=bone.length;tangent=(bone.tail_local-bone.head_local).normalized()
        angle=angles[i]+.85*math.sin(t*3.8+i*.32)*t
        # Ease down to a common support plane; retain a slightly lifted curled
        # tip. No independent endpoint forcing or scale changes at any joint.
        nextx=current.x+math.cos(angle)*length;nexty=current.y+math.sin(angle)*length
        thickness=.065*max(0,1-j/24)**1.2+.012
        floor=sand_z(nextx,nexty)+thickness+.025*max(0,(t-.86)/.14)**2
        dz=max(-.78,min(.45,(floor-current.z)/max(.035,length*3)))
        direction=Vector((math.cos(angle)*math.sqrt(1-dz*dz),math.sin(angle)*math.sqrt(1-dz*dz),dz))
        proximal=min(1,j/5);proximal=proximal*proximal*(3-2*proximal)
        direction=tangent.lerp(direction,proximal).normalized()
        transport=tangent.rotation_difference(direction)
        facing=Vector((0,-1,-.28));normal=(facing-tangent*facing.dot(tangent)).normalized();side=tangent.cross(normal)
        authored_twist=[-.48,.40,.6,.85,1,-.9,-.65,-.4][i]*t
        normal=normal*math.cos(authored_twist)+side*math.sin(authored_twist)
        current_normal=transport@normal;down=Vector((0,0,-1));wanted=(down-direction*down.dot(direction)).normalized()
        turn=math.atan2(direction.dot(current_normal.cross(wanted)),current_normal.dot(wanted))
        target=Quaternion(direction,turn*proximal)@transport@rest[name]
        inherited=parent_world@parent_rest.inverted()@rest[name]
        ground[name]=inherited.inverted()@target
        parent_world=target;parent_rest=rest[name];current+=direction*length

for frame in range(290,338):
    u=(frame-289)/48;u=u*u*u*(u*(u*6-15)+10)
    for b in rig.pose.bones:
        b.rotation_mode='QUATERNION';b.rotation_quaternion=start[b.name].slerp(ground[b.name],u)
        b.keyframe_insert('rotation_quaternion',frame=frame)
        if b.name=='ROOT':b.location=(0,0,0);b.keyframe_insert('location',frame=frame)
    key=body.data.shape_keys.key_blocks['Mantle ventilation'];key.value=.18;key.keyframe_insert('value',frame=frame)
s.frame_end=337
rig['landing_endpoint_seconds']=14.0
rig['film_motion_note']='0–12 seconds swim loop; 12–14 authored settling transition. Web blends into the 14-second endpoint. No limb scaling or runtime joint floor snapping.'
for action in (rig.animation_data.action,body.data.shape_keys.animation_data.action):
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for key in fc.keyframe_points:key.interpolation='LINEAR'
s.frame_set(337);bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get();evaluated=body.evaluated_get(deps)
minz=min(v.co.z for v in evaluated.data.vertices)
s.render.engine='CYCLES';s.cycles.samples=12;s.render.resolution_x=800;s.render.resolution_y=800;s.render.resolution_percentage=100
cam=s.camera;cam.rotation_mode='XYZ';cam.data.shift_x=0;cam.data.shift_y=0;cam.data.type='ORTHO';cam.data.ortho_scale=1.9
cam.location=(.9,-1.7,1.05);cam.rotation_euler=(Vector((0,0,.02))-cam.location).to_track_quat('-Z','Y').to_euler()
# Temporary local copy of the actual web sand: inspect contact in the render,
# then discard it so the character export contains no duplicate environment.
verts=[];faces=[];N=60
for iy in range(N+1):
    for ix in range(N+1):
        x=-1.5+ix*3/N;y=-1.5+iy*3/N;verts.append((x,y,sand_z(x,y)))
for iy in range(N):
    for ix in range(N):
        a=iy*(N+1)+ix;faces.append((a,a+1,a+N+2,a+N+1))
me=bpy.data.meshes.new('Temporary sand contact verification');me.from_pydata(verts,[],faces);me.update()
floorobj=bpy.data.objects.new('Temporary sand contact verification',me);s.collection.objects.link(floorobj)
mat=bpy.data.materials.new('Temporary sand');mat.diffuse_color=(.24,.20,.13,1);floorobj.data.materials.append(mat)
t=artifacts.file(name='octopus-film-landing.png',media_type='image/png');s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG';s.render.filepath=t.path;bpy.ops.render.render(write_still=True);t.publish()
bpy.data.objects.remove(floorobj,do_unlink=True);bpy.data.meshes.remove(me);bpy.data.materials.remove(mat)
result={'endpoint':14,'skin_min_z':minz,'bone_scales_unit':all((b.scale-Vector((1,1,1))).length<1e-6 for b in rig.pose.bones)}
