"""Subtle independently phased distal travel over the accepted swim clip.
Keeps the 12-second seam, mantle pumping, power stroke and upstream rig intact.
"""
import bpy,math
from mathutils import Quaternion
s=bpy.context.scene;rig=bpy.data.objects['OCTOPUS_RIG']
if not rig.get('film_swim_detail'):
    for frame in range(1,290):
        s.frame_set(frame);phase=(frame-1)/24*math.tau/3
        for i in range(8):
            for j in range(5,24):
                b=rig.pose.bones[f'ARM_{i+1:02}_{j:02}'];t=j/23;fade=(j-5)/18
                b.rotation_quaternion @= Quaternion((1,0,0),math.sin(phase-t*6+i*.57)*.012*fade)
                b.rotation_quaternion @= Quaternion((0,0,1),math.sin(phase*.5-t*4+i*1.3)*.007*fade)
                b.keyframe_insert('rotation_quaternion',frame=frame)
    rig['film_swim_detail']=True
rig.animation_data.action.name='Codera Film IV | swim and sand rest'
