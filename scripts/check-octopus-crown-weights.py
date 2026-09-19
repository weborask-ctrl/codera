"""Keep outer arms independent of the shared crown and validate weight sums.
Run after blend-octopus-crown.py. Leaves the model in its rest pose.
"""
import bpy, math
from mathutils import kdtree,Vector
body=bpy.data.objects['Octopus | continuous deforming skin'];rig=bpy.data.objects['OCTOPUS_RIG']
segments=[]
for i in range(8):
    for j in range(24):
        b=rig.data.bones[f'ARM_{i+1:02}_{j:02}'];segments.append((i,j,b.head_local.copy(),b.tail_local.copy()))
samples=[]
# Transfer from the original arm surface, not the nearest centreline: thick
# neighbouring arms can otherwise steal each other's vertices at crossings.
for i in range(8):
    for k in range(73):
        t=k/72;u=min(23.99999,t*24);j=int(u);f=u-j
        _,_,a,b=segments[i*24+j];c=a.lerp(b,f);tangent=(b-a).normalized()
        n=Vector((0,-1,-.28));n=(n-tangent*n.dot(tangent)).normalized();side=tangent.cross(n).normalized()
        angle=[-.48,.40,.6,.85,1,-.9,-.65,-.4][i]*t
        normal=n*math.cos(angle)+side*math.sin(angle);lateral=side*math.cos(angle)-n*math.sin(angle)
        radius=.25*((.39 if i<2 else .32)*(1-t)**1.22+.009)
        for q in range(16):
            angle=q*math.tau/16;samples.append((c+radius*(normal*math.cos(angle)*.94+lateral*math.sin(angle)),i,t))
tree=kdtree.KDTree(len(samples))
for idx,(co,_,_) in enumerate(samples):tree.insert(co,idx)
tree.balance();corrected=0
for v in body.data.vertices:
    radial=math.hypot(v.co.x,v.co.y)
    if radial<.235:continue
    merged={}
    for _,idx,dist in tree.find_n(v.co,4):
        _,i,t=samples[idx];u=max(0,min(23,t*24-.5));j=int(u);f=u-j;factor=1/max(dist,.001)**2
        for name,w in [(f'ARM_{i+1:02}_{j:02}',1-f),(f'ARM_{i+1:02}_{min(23,j+1):02}',f)]:merged[name]=merged.get(name,0)+w*factor
    for g in list(v.groups):body.vertex_groups[g.group].remove([v.index])
    names=sorted(merged.items(),key=lambda p:p[1],reverse=True)[:4];total=sum(w for _,w in names)
    for name,w in names:
        if not w:continue
        vg=body.vertex_groups.get(name) or body.vertex_groups.new(name=name);vg.add([v.index],w/total,'REPLACE')
    corrected+=1
result={'outer_arm_vertices_rebound':corrected,'unweighted':sum(not v.groups for v in body.data.vertices),'normalized':all(abs(sum(g.weight for g in v.groups)-1)<.0001 for v in body.data.vertices)}
