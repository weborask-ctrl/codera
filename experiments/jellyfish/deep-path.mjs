const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function shelfHeight(x,z){
 const edge=69+2.2*Math.sin(x*.17)+.8*Math.sin(x*.49);
 const drop=ease((-z-edge)/17);
 return -17.8+.38*Math.sin(x*.45+z*.16)+.19*Math.cos(z*.62)+2*Math.exp(-(((Math.abs(x)-12)/4)**2))-35*drop;
}
export function deepPose(p,mobile=false){
 const q=clamp(p),travel=ease(q),tilt=Math.sin(q*Math.PI);
 return {camera:[18+3*travel,-14-15*ease((q-.42)/.58),-55-35*travel],
 character:[(mobile?18:21)+3*travel,-14.5-15.5*ease((q-.26)/.74),-61-37*travel],
 lookY:.056-.42*tilt-.13*travel,
 pitch:.43*tilt,yaw:-.35-.65*tilt,progress:q};
}
