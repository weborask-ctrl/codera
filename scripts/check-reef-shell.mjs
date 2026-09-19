import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
// Run actual geometry construction without browser texture loading. Material-only
// dependencies are substituted; shell vertices/indices are unmodified.
const three=pathToFileURL(resolve('.prototype-cache/jellyfish/three/three.module.min.js')).href;
const utils=(await readFile('.prototype-cache/jellyfish/three/BufferGeometryUtils.js','utf8')).replace(/from 'three'/g,`from '${three}'`);
const utilsURL=`data:text/javascript;base64,${Buffer.from(utils).toString('base64')}`;
let source=await readFile('experiments/jellyfish/reef.mjs','utf8');
source=source.replace("'/vendor/three/three.module.min.js'",JSON.stringify(three))
 .replace(/^import \{mergeVertices,mergeGeometries\}.*$/m,`const {mergeVertices,mergeGeometries}=await import('${utilsURL}');`)
 .replace(/^import \{photographicRock\}.*$/m,'const photographicRock=()=>new THREE.MeshStandardMaterial();')
 .replace(/^import \{underwaterMaterial\}.*$/m,'const underwaterMaterial=m=>m;');
const {createReef}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const reef=createReef(),edges=new Map();let faces=0;
reef.group.traverse(o=>{
 if(!o.name.startsWith('reef-shell-'))return;
 const p=o.geometry.attributes.position,ix=o.geometry.index;
 const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*10000)).join(',');
 for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(n=>key(ix.getX(i+n)));faces++;
  for(let n=0;n<3;n++){const k=[v[n],v[(n+1)%3]].sort().join('|');edges.set(k,(edges.get(k)||0)+1);}
 }
});
assert.ok(faces>10000);const unmatched=[...edges].filter(([,n])=>n!==2);
assert.equal(unmatched.length,0,`Open/nonmanifold shell edges: ${JSON.stringify(unmatched.slice(0,8))}`);
reef.dispose();console.log(`PASS: ${faces} shell triangles, all ${edges.size} welded edges shared by exactly two faces`);
