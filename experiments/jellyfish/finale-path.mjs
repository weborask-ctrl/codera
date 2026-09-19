import {deepPose,shelfHeight} from './deep-path.mjs';
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function finalePose(progress,mobile=false,landing=false){
 const q=clamp(progress),t=ease(q),start=deepPose(1,mobile);
 const pause={camera:[23,-40,-119],character:[mobile?23:26,-43,-127],lookY:-.19,pitch:.12,yaw:-.55};
 if(!landing)return {camera:mix(start.camera,pause.camera,t),character:mix(start.character,pause.character,t),lookY:start.lookY+(pause.lookY-start.lookY)*t,pitch:.12*t+.2*Math.sin(q*Math.PI),yaw:-.35-.2*t,settle:0};
 const x=mobile?15:18,z=-151;
 return {camera:mix(pause.camera,[15,-49,-143],t),character:mix(pause.character,[x,shelfHeight(x,z)+1.1,z],t),lookY:pause.lookY+(.01-pause.lookY)*t,pitch:.12*(1-t),yaw:-.55+.3*t,settle:ease((q-.72)/.28)};
}
