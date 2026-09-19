// Export the sculpted skin as a standard editable GLB for Blender or other DCCs.
// Eyes, cups and analytical arm tips are separate runtime meshes, not included.
// The procedural shader and idle motion are intentionally not represented as PBR/rig.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const source=new URL('../experiments/jellyfish/octopus-sculpt.bin',import.meta.url);
const data=await readFile(source),vertices=data.readUInt32LE(0),indices=data.readUInt32LE(4);
if(data.length!==8+vertices*44+indices*4)throw new Error('Invalid sculpt binary');
const positions=data.subarray(8,8+vertices*12),normals=data.subarray(8+vertices*12,8+vertices*24),faces=data.subarray(8+vertices*44);
const minimum=[Infinity,Infinity,Infinity],maximum=[-Infinity,-Infinity,-Infinity];
for(let i=0;i<vertices;i++)for(let axis=0;axis<3;axis++){
 const v=positions.readFloatLE(i*12+axis*4);
 if(!Number.isFinite(v))throw new Error('Non-finite position');
 minimum[axis]=Math.min(minimum[axis],v);maximum[axis]=Math.max(maximum[axis],v);
}
for(let i=0;i<indices;i++)if(faces.readUInt32LE(i*4)>=vertices)throw new Error('Invalid index');
const binary=Buffer.concat([positions,normals,faces]);
const gltf={asset:{version:'2.0',generator:'Codera offline sculpt exporter'},scene:0,
 scenes:[{nodes:[0]}],nodes:[{name:'Codera octopus — sculpted skin',mesh:0}],
 meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:0}]}],
 materials:[{name:'Neutral copper review material',pbrMetallicRoughness:{baseColorFactor:[.36,.115,.07,1],metallicFactor:0,roughnessFactor:.48}}],
 buffers:[{byteLength:binary.length}],
 bufferViews:[{buffer:0,byteOffset:0,byteLength:positions.length,target:34962},{buffer:0,byteOffset:positions.length,byteLength:normals.length,target:34962},{buffer:0,byteOffset:positions.length+normals.length,byteLength:faces.length,target:34963}],
 accessors:[{bufferView:0,componentType:5126,count:vertices,type:'VEC3',min:minimum,max:maximum},{bufferView:1,componentType:5126,count:vertices,type:'VEC3'},{bufferView:2,componentType:5125,count:indices,type:'SCALAR'}],
 extras:{purpose:'Editable skin sculpt. Runtime eyes, suckers, fine tips, shader and animation remain in octopus.mjs.',source:'scripts/build-octopus-sculpt.mjs'}};
const json=Buffer.from(JSON.stringify(gltf)),padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
const header=Buffer.alloc(12),jsonHeader=Buffer.alloc(8),binHeader=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+padded.length+binary.length,8);
jsonHeader.writeUInt32LE(padded.length,0);jsonHeader.writeUInt32LE(0x4e4f534a,4);
binHeader.writeUInt32LE(binary.length,0);binHeader.writeUInt32LE(0x004e4942,4);
const output=new URL('../assets/models/octopus-skin-study.glb',import.meta.url);
await mkdir(new URL('../assets/models/',import.meta.url),{recursive:true});
await writeFile(output,Buffer.concat([header,jsonHeader,padded,binHeader,binary]));
console.log(JSON.stringify({output:output.pathname,vertices,triangles:indices/3,bytes:header.readUInt32LE(8)}));
