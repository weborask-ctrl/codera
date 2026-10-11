import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {BASELINE, selectMotionProfile} from '../experiments/metal/media-profiles.mjs';

describe('Motion media choice',()=>{
  it('does not promote HEVC from sequential playback capability flags',()=>{
    let probes=0;
    const selected=selectMotionProfile({desktop:true,mseSupported:()=>{probes++;return true;},decodingInfo:async()=>{probes++;return {supported:true,smooth:true,powerEfficient:true};}});
    assert.equal(selected,BASELINE);
    assert.equal(probes,0,'Entry must not wait on a probe that cannot certify seek cadence');
  });
  it('preserves the same desktop and touch asset without capability APIs',()=>{
    assert.equal(selectMotionProfile(),BASELINE);
    assert.equal(selectMotionProfile({desktop:false}),BASELINE);
    assert.deepEqual([BASELINE.width,BASELINE.height,BASELINE.fps],[1920,1080,60]);
    assert.equal(BASELINE.media,'/media/journey-balanced-4b593baa7f9b.mp4');
  });
});
