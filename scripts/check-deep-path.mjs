import assert from 'node:assert/strict';
import {deepPose,shelfHeight} from '../experiments/jellyfish/deep-path.mjs';
import {gatePose} from '../experiments/jellyfish/gate-path.mjs';
for(const mobile of [false,true]){
 assert.deepEqual(deepPose(0,mobile).camera,gatePose(1,mobile).camera);
 assert.deepEqual(deepPose(0,mobile).character,gatePose(1,mobile).character);
 let previous=deepPose(0,mobile);
 for(let i=0;i<=2000;i++){
  const p=deepPose(i/2000,mobile);
  for(const position of [p.camera,p.character]){
   assert.ok(position.every(Number.isFinite));
   assert.ok(position[1]-shelfHeight(position[0],position[2])>2,'Clearance above terrace');
  }
  assert.ok(Math.hypot(...p.camera.map((v,c)=>v-previous.camera[c]))<.1,'Continuous camera');
  previous=p;
 }
 assert.deepEqual(deepPose(1,mobile),deepPose(10,mobile),'Hold final pose throughout offer');
}
console.log('PASS: gate handoff, 2000 terrain-clearance samples, continuity, offer hold, desktop/mobile');
