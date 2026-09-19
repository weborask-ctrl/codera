"""Diffuse remaining local weight discontinuities, preserving mesh and action.
Seeds are measured stretched edges, not arbitrary regions of the character.
"""
import bpy, numpy as np
scene=bpy.context.scene;body=bpy.data.objects['Octopus | continuous deforming skin']
scene.frame_set(61);obj=body.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=obj.to_mesh()
edges=np.empty(len(body.data.edges)*2,dtype=np.int32);body.data.edges.foreach_get('vertices',edges);edges=edges.reshape(-1,2)
rest=np.empty(len(body.data.vertices)*3);body.data.vertices.foreach_get('co',rest);rest=rest.reshape(-1,3)
posed=np.empty(len(mesh.vertices)*3);mesh.vertices.foreach_get('co',posed);posed=posed.reshape(-1,3);obj.to_mesh_clear()
rl=np.linalg.norm(rest[edges[:,0]]-rest[edges[:,1]],axis=1)
pl=np.linalg.norm(posed[edges[:,0]]-posed[edges[:,1]],axis=1)
seeds=set(int(v) for edge in edges[(pl>.015)&(pl>rl*5)] for v in edge)
adj=[[] for _ in body.data.vertices]
for a,b in edges:adj[a].append(int(b));adj[b].append(int(a))
distance={v:0 for v in seeds};front=set(seeds)
for level in range(1,9):
    next_front={n for v in front for n in adj[v] if n not in distance}
    for v in next_front:distance[v]=level
    front=next_front
original={v:{g.group:g.weight for g in body.data.vertices[v].groups} for v in distance}
current={v:dict(ws) for v,ws in original.items()}
for iteration in range(48):
    updated={}
    for v,depth in distance.items():
        if depth==8:updated[v]=original[v];continue
        merged={};total=0
        for n in adj[v]:
            ws=current.get(n)
            if ws is None:ws={g.group:g.weight for g in body.data.vertices[n].groups}
            w=1/max(float(np.linalg.norm(rest[v]-rest[n])),.0002)
            for idx,value in ws.items():merged[idx]=merged.get(idx,0)+value*w
            total+=w
        alpha=.75*(1-(depth/8)**3)
        updated[v]={idx:(1-alpha)*original[v].get(idx,0)+alpha*merged.get(idx,0)/total for idx in set(original[v])|set(merged)}
    current=updated
for v,ws in current.items():
    if distance[v]==8:continue
    for g in list(body.data.vertices[v].groups):body.vertex_groups[g.group].remove([v])
    keep=sorted(ws.items(),key=lambda p:p[1],reverse=True)[:4];total=sum(w for _,w in keep)
    for idx,w in keep:
        if w>1e-8:body.vertex_groups[idx].add([v],w/total,'REPLACE')
scene.frame_set(37)
result={'seed_vertices':len(seeds),'affected_vertices':sum(d<8 for d in distance.values())}
