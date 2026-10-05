import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {BASELINE,DETAIL, selectMotionProfile} from '../experiments/metal/media-profiles.mjs';

const yes={supported:true,smooth:true,powerEfficient:true};
const desktop={desktop:true,mseSupported:()=>true,decodingInfo:async()=>yes,timeoutMs:50};
describe('Motion media choice',()=>{
it('keeps mobile on baseline without probing',async()=>{let called=false;assert.equal(await selectMotionProfile({...desktop,desktop:false,decodingInfo:async()=>{called=true;return yes}}),BASELINE);assert.equal(called,false)});
it('selects smaller detail video only with decode evidence',async()=>assert.equal(await selectMotionProfile(desktop),DETAIL));
it('falls back on unsupported, inefficient, missing, rejected and slow capability probes',async()=>{for(const opts of [{mseSupported:()=>false},{decodingInfo:null},{decodingInfo:async()=>({...yes,powerEfficient:false})},{decodingInfo:async()=>{throw Error('probe')}},{decodingInfo:()=>new Promise(()=>{}),timeoutMs:1}])assert.equal(await selectMotionProfile({...desktop,...opts}),BASELINE)});
});
