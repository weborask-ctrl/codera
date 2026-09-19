import assert from 'node:assert/strict';
import {finalePose} from '../experiments/jellyfish/finale-path.mjs';
import {deepPose,shelfHeight} from '../experiments/jellyfish/deep-path.mjs';
for(const mobile of [false,true]){
 assert.deepEqual(finalePose(0,mobile).camera,deepPose(1,mobile).camera);
 assert.deepEqual(finalePose(0,mobile).character,deepPose(1,mobile).character);
 assert.deepEqual(finalePose(1,mobile).camera,finalePose(0,mobile,true).camera);
 assert.deepEqual(finalePose(1,mobile).character,finalePose(0,mobile,true).character);
 for(const land of [false,true])for(let i=0;i<=2000;i++){
  const p=finalePose(i/2000,mobile,land);
  for(const v of [p.camera,p.character]){assert(v.every(Number.isFinite));assert(v[1]>shelfHeight(v[0],v[2])+.8,'root or camera below seabed');}
  if(i){const prev=finalePose((i-1)/2000,mobile,land);assert(Math.hypot(...p.camera.map((v,j)=>v-prev.camera[j]))<.1);}
 }
 const end=finalePose(1,mobile,true);assert.equal(end.settle,1);assert.deepEqual(end,finalePose(2,mobile,true));
}
console.log('Finale: continuous joins, bounded steps, ground clearance and fixed landing passed. Arm surface collision still requires visual review.');
