const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function track(p,keys){
 let i=0;while(i<keys.length-2&&p>keys[i+1][0])i++;
 const a=keys[i],b=keys[i+1],prev=keys[Math.max(0,i-1)],next=keys[Math.min(keys.length-1,i+2)];
 const t=clamp((p-a[0])/(b[0]-a[0]));
 return a.slice(1).map((v,c)=>{
  const m0=i===0?0:(b[c+1]-prev[c+1])/(b[0]-prev[0])*(b[0]-a[0]);
  const m1=i===keys.length-2?0:(next[c+1]-a[c+1])/(next[0]-a[0])*(b[0]-a[0]);
  return (2*t**3-3*t*t+1)*v+(t**3-2*t*t+t)*m0+(-2*t**3+3*t*t)*b[c+1]+(t**3-t*t)*m1;
 });
}
// Fixed world anchors; both scroll directions sample exactly the same route.
export function gatePose(progress,mobile=false){
 const q=clamp(progress);
 const emerge=ease(q/.34),swim=ease((q-.22)/.78);
 return {
  camera:track(q,[[0,.7,-12,-9],[.18,34,-12,-12],[.4,34,-13,-34],[.58,18,-14,-39],[.76,18,-14,-47],[1,18,-14,-55]]),
  character:track(q,[[0,9,-12.7,-32],[.23,29,-12.7,-33],[.4,29,-13.1,-40],[.58,18,-13.7,-46],[1,mobile?18:21,-14.5,-61]]),
  pitch:1.23*(1-emerge),yaw:-.6*emerge+.25*swim,
  fold:1-emerge,progress:q,
 };
}
