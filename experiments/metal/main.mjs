import './page-controls.mjs';

// The supplied Silver film, original framing, captions and fade are preserved.
const root=document.documentElement;
const journey=document.querySelector('.journey'),stage=document.querySelector('.stage');
const video=document.querySelector('#journey-video'),film=document.querySelector('.film');
const toggle=document.querySelector('#motion-toggle'),beats=[...document.querySelectorAll('.hero-beat')];
const shade=document.querySelector('.film-shade'),tunnel=document.querySelector('.tunnel-fade');
const bar=document.querySelector('.film-progress i');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const points=[[0,2.6],[.38,5.7],[.67,9.5],[1,13.5]],offset=2.583333,initialBufferSeconds=1.6;
const state={active:false,prepared:false,preparing:false,paused:false,reason:'initial',targetTime:2.6,displayedTime:2.6,progress:0,downloadedBytes:0,readyMs:0,error:'',frames:[],decode:[],stats:{},resolution:'1920×1080',source:'reviewed 1080p60 balanced AVC'};
window.__coderaMotion=state;
let choice=window.__coderaEntry?.skipped||window.__coderaEntry?.unavailable?false:null,worker,raf=0,lastTick=0,progress=0,target=0,visible=true,selected=-2,lastSent=-1;
let deepLinkPending=Boolean(location.hash&&location.hash!=='#top'&&document.readyState!=='complete');
let bounds={top:0,distance:1};
const clamp=x=>Math.max(0,Math.min(1,x)),ramp=(a,b,p)=>clamp((p-a)/(b-a));
const bounded=(array,item)=>{array.push(item);if(array.length>1500)array.shift();};
const wanted=()=>choice??!reduced.matches;
// A fragment anchor can leave a one-pixel edge of the sticky hero visible.
// Prepare motion only when the visitor is meaningfully back in the opening.
const inStage=()=>{const rect=stage.getBoundingClientRect();const height=Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0);return height>=Math.max(1,Math.min(rect.height,innerHeight)*.25);};
function reserveJourney(){journey.classList.add('has-journey');root.classList.add('motion-enabled');}
function compactAtTop(){if(scrollY<=bounds.top+24){journey.classList.remove('has-journey');root.classList.remove('motion-enabled');}}
function presentedProgress(){return clamp(map(state.displayedTime,1,0));}
function map(value,inAxis,outAxis){let i=1;while(i<points.length-1&&value>points[i][inAxis])i++;const a=points[i-1],b=points[i];return a[outAxis]+(b[outAxis]-a[outAxis])*(value-a[inAxis])/(b[inAxis]-a[inAxis]);}
function captions(time){
  const p=clamp(map(time,1,0));
  const alpha=[1-ramp(.08,.15,p),ramp(.17,.24,p)*(1-ramp(.44,.50,p)),ramp(.74,.86,p)];
  const y=[-35*ramp(.08,.15,p),30*(1-ramp(.17,.24,p))-25*ramp(.44,.50,p),30*(1-ramp(.74,.86,p))];
  let next=-1;
  beats.forEach((beat,i)=>{beat.style.opacity=alpha[i];beat.style.visibility=alpha[i]>.001?'visible':'hidden';beat.style.transform=y[i]?`translateY(${y[i]}px)`:'none';if(alpha[i]>.5)next=i;});
  if(next!==selected){selected=next;beats.forEach((beat,i)=>{beat.setAttribute('aria-hidden',String(i!==next));beat.querySelectorAll('a').forEach(a=>{a.tabIndex=i===next?0:-1;});});}
  shade.style.setProperty('--reading-shade',String(.75*ramp(.17,.24,p)*(1-ramp(.44,.52,p))));
  shade.style.opacity=1-.7*ramp(.44,.52,p)+.7*ramp(.72,.84,p);
  const sine=v=>(1-Math.cos(Math.PI*v))/2;
  tunnel.style.opacity=sine(ramp(.33,.407,p))*(1-sine(ramp(.425,.55,p)));
  bar.style.transform=`scaleX(${p})`;
}
function label(){const pending=wanted()&&!state.error&&(!state.active||state.preparing);toggle.hidden=pending;toggle.disabled=state.preparing;toggle.setAttribute('aria-pressed',String(state.active&&!state.paused));toggle.querySelector('.motion-label').textContent=state.error?'Skúsiť animáciu znova':state.active&&!state.paused?'Zastaviť pohyb':state.prepared?'Pokračovať v pohybe':'Spustiť animáciu';toggle.querySelector('.pause-icon').textContent=state.active&&!state.paused?'Ⅱ':'▷';}
function measure(){bounds={top:journey.getBoundingClientRect().top+scrollY,distance:Math.max(1,journey.offsetHeight-stage.offsetHeight)};update();}
function update(){
  target=clamp((scrollY-bounds.top)/bounds.distance);
  if(!deepLinkPending&&wanted()&&!state.error&&!state.active&&inStage()&&!document.hidden){
    if(state.prepared){activate();return;}
    if(!state.preparing)void prepare();
  }
  if(state.error&&!state.active)compactAtTop();
  wake();
}
function stop(){cancelAnimationFrame(raf);raf=0;lastTick=0;}
function send(){const time=Math.max(0,map(progress,0,1)-offset),frame=Math.round(time*60);state.targetTime=time+offset;state.progress=progress;if(frame===lastSent)return;lastSent=frame;worker?.postMessage({type:'seek',time});}
function tick(now){
  raf=0;if(!state.active||state.paused||!visible||document.hidden)return;
  const dt=Math.min(.05,lastTick?(now-lastTick)/1000:1/60);lastTick=now;
  const error=target-progress;let step=error*(1-Math.exp(-dt/.16));
  const time=map(progress,0,1);
  // Damping is sufficient once native video is buffered.
  state.bufferPaced=false;
  // Let a slow incoming stream reduce forward camera speed continuously before
  // exhausting its buffer. The page scroll remains native; requestedTime below
  // records the raw scroll target separately so this lag is never hidden.
  if(step>0&&!state.buffer?.fullyBuffered){
    const sourceTime=time-offset;
    const end=state.buffer?.buffered?.find(([a,b])=>a<=sourceTime+.001&&b>sourceTime)?.[1];
    if(Number.isFinite(end)){
      const headroom=Math.max(0,end-sourceTime-1/60);
      const limit=dt*headroom/.75;
      if(map(clamp(progress+step),0,1)-time>limit){step=clamp(map(time+limit,1,0))-progress;state.bufferPaced=true;}
    }
  }
  progress=Math.abs(error)<.00001&&!state.bufferPaced?target:progress+step;
  state.requestedTime=map(target,0,1);send();
  if(progress!==target)raf=requestAnimationFrame(tick);else lastTick=0;
}
function wake(){if(!raf&&state.active&&!state.paused&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
function syncVisibility(){const suspended=document.hidden||!visible||(!state.preparing&&(state.paused||!state.active));worker?.postMessage({type:'pause',value:suspended,release:document.hidden||!visible});if(suspended)stop();else{lastSent=-1;wake();}}
function fail(error){state.error=String(error);state.active=false;state.prepared=false;state.preparing=false;state.paused=true;state.reason='failed';stop();worker?.terminate();worker=null;film.classList.remove('is-ready');video.style.opacity='0';captions(2.6);compactAtTop();window.__coderaEntry?.failed();label();}
function activate(){
  if(!wanted()||!inStage()||document.hidden){state.reason=wanted()?'ready-to-start':'paused';state.paused=true;syncVisibility();label();return;}
  state.active=true;state.paused=false;state.reason='scroll-video';reserveJourney();measure();
  // Late readiness must approach the scroll target through buffer-aware pacing,
  // never seek straight into an unavailable later part of the film.
  progress=presentedProgress();lastSent=-1;film.classList.add('is-ready');video.style.opacity='1';syncVisibility();label();
}
async function prepare(){
  try {
  if(state.preparing)return;
  if(state.prepared){activate();return;}
  state.preparing=true;state.paused=false;state.error='';state.reason='preparing';reserveJourney();measure();label();
  const {NativePlayer}=await import('./native-player.mjs');worker=new NativePlayer(video);
  worker.onmessage=({data})=>{
    if(data.stats)state.stats={...state.stats,...data.stats};
    if(data.type==='status'){state.buffer={...data};if(state.preparing&&data.buffered){const end=data.buffered.find(([start])=>start<=.01)?.[1]||0;window.__coderaEntry?.progress(Math.min(98,end/initialBufferSeconds*98));}}
    if(data.type==='ready'){state.preparing=false;state.prepared=true;state.readyMs=performance.now();state.delivery=data.delivery;film.classList.toggle('native-http',data.delivery==='native-http');activate();window.__coderaEntry?.ready();}
    if(data.type==='progress'){state.downloadedBytes=data.loaded;}
    if(data.type==='frame'){
      const frame=data.frame??data.frameIndex;state.displayedTime=frame/60+offset;
      bounded(state.frames,{now:performance.now(),frame,target:state.targetTime,drawMs:data.drawMs,paintWaitMs:data.paintWaitMs});
      if(state.active&&!state.paused)captions(state.displayedTime);
    }
    if(data.type==='decode')bounded(state.decode,{now:performance.now(),...data});
    if(data.type==='error')fail(data.error);
  };
  worker.onerror=event=>fail(event.message||'Prehrávač sa nespustil.');
  worker.postMessage({type:'init',media:'/media/journey-balanced-4b593baa7f9b.mp4',fallbackMedia:'/media/journey-balanced-progressive.mp4',transport:'mse',transportWorker:true,initialBufferSeconds,codec:'avc1.64002a',durationSeconds:11});
  syncVisibility();
  } catch(error){fail(error);}
}
toggle.addEventListener('click',()=>{choice=!(state.active&&!state.paused);if(choice){if(state.error){state.prepared=false;state.error='';}void prepare();}else{state.paused=true;state.reason='paused';syncVisibility();label();}});
window.addEventListener('codera:entry-skip',()=>{choice=false;state.active=false;state.paused=true;state.reason='paused';stop();film.classList.remove('is-ready');video.style.opacity='0';captions(2.6);compactAtTop();measure();syncVisibility();label();});
window.addEventListener('scroll',update,{passive:true});
window.addEventListener('resize',measure,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)measure();syncVisibility();});
new IntersectionObserver(entries=>{const returning=!visible&&entries[0].isIntersecting;visible=entries[0].isIntersecting;if(returning&&state.active&&!state.paused){measure();progress=state.buffer?.fullyBuffered?target:presentedProgress();lastSent=-1;lastTick=0;}else update();syncVisibility();},{rootMargin:'150px 0px'}).observe(stage);
reduced.addEventListener('change',()=>{
  if(reduced.matches){choice=false;state.paused=true;state.reason='paused';if(!state.active)compactAtTop();syncVisibility();label();}
  else update();
});
window.addEventListener('pageshow',()=>{deepLinkPending=false;measure();syncVisibility();});
window.addEventListener('pagehide',event=>{stop();if(!event.persisted)worker?.terminate();});
captions(2.6);if(wanted())reserveJourney();measure();label();if(!wanted()||deepLinkPending||!inStage())window.__coderaEntry?.ready();
