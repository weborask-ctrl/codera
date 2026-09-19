const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const damp=(a,b,dt,tau)=>a+(b-a)*(1-Math.exp(-dt/tau));

// Scroll position chooses the route; measured scroll speed chooses effort.
// The stroke clock is always forward, including during reverse scrolling.
export class SwimController {
 constructor(){this.initialized=false;this.progress=0;this.previous=0;this.speed=0;this.effort=0;this.clock=1.35;}
 update(raw,dt,reduced=false){
  raw=clamp(raw);dt=clamp(dt,0,.1);
  if(!this.initialized){this.previous=raw;this.progress=raw;this.initialized=true;}
  if(reduced||dt===0){this.progress=raw;this.previous=raw;this.speed=0;this.effort=0;return this.snapshot();}
  const velocity=clamp((raw-this.previous)/dt,-1.6,1.6);this.previous=raw;
  this.speed=damp(this.speed,velocity,dt,.12);
  this.progress=damp(this.progress,raw,dt,.14);
  if(Math.abs(this.progress-raw)<.00003)this.progress=raw;
  const drive=clamp((Math.abs(this.speed)-.0008)/.20);
  this.effort=damp(this.effort,drive,dt,drive>this.effort?.13:.28);
  if(this.effort<.0001)this.effort=0;
  this.clock+=dt*(.45+.95*this.effort)*this.effort;
  return this.snapshot();
 }
 snapshot(){return {progress:this.progress,speed:this.speed,effort:this.effort,clock:this.clock,state:this.effort>.15?'swim':this.effort>.005?'coast':'idle'};}
}
