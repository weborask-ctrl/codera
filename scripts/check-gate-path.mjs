import assert from 'node:assert/strict';
import {gatePose} from '../experiments/jellyfish/gate-path.mjs';
assert.deepEqual(gatePose(0).camera,[.7,-12,-9]);
assert.deepEqual(gatePose(0).character,[9,-12.7,-32]);
assert.deepEqual(gatePose(1).camera,[18,-14,-55]);
for(const mobile of [false,true]){
 let previous=gatePose(0,mobile);
 for(let i=1;i<=2000;i++){
  const q=i/2000,p=gatePose(q,mobile),[x,y,z]=p.camera;
  assert.ok([...p.camera,...p.character].every(Number.isFinite));
  assert.ok(Math.hypot(...p.camera.map((v,c)=>v-previous.camera[c]))<.3,'No camera jump');
  if(z<-18&&z>-30)assert.ok(x>31,'Camera must bypass the original reef on its right');
  if(z<-43&&z>-51)assert.ok(((x-18)/5.5)**2+((y+20)/9.4)**2<.9,'Camera must fit inside arch opening');
  assert.deepEqual(gatePose(q,mobile),p,'Path must not depend on direction or history');
  previous=p;
 }
}
console.log('PASS: route continuity, reef clearance, arch clearance, deterministic reverse, desktop/mobile');
