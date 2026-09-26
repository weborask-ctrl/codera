const video = document.querySelector('#journey-video');
const film = document.querySelector('.film');
const journey = document.querySelector('.journey');
const toggle = document.querySelector('#motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 701px)');
// Input preference does not flip when a phone rotates across a width breakpoint.
const smallTouch = matchMedia('(pointer: coarse)');
const beats = [...document.querySelectorAll('.hero-beat')];
// Continuous camera journey, compressing the still handles in the supplied film.
const cameraPoints = [[0,2.6],[.38,5.7],[.67,9.5],[1,13.5]];
// Story timestamps stay in the original master; the delivery clip omits unused handles.
const mediaOffset = 2.583333;
const mediaFps = 60;
let trigger, timeline, scrub, active = false, desiredTime = 0, pendingFrame = 0, awaitingPresentation = false;
let loadWatchdog = 0, seekWatchdog = 0, captionFallback = 0, retries = 0;
let userMotion = null, failed = false, sampleCount = 0, latencyTotal = 0, seekStarted = 0;
let preparing = false, prepared = false, deferredEntry = false, mediaBlobUrl = '', loadedPercent = 0;
const diagnostics = { targetTime: 0, displayedTime: 0, progress: 0, seeks: 0, averageSeekMs: 0, active: false, resolution: '', mediaOffset, mediaFps, reason: 'initializing', lastIssue: '', retries: 0, downloadedBytes: 0, prepared: false };
Object.defineProperty(window, '__coderaMotion', { value: diagnostics });

function wantsMotion() { return userMotion ?? (!reduced.matches && !smallTouch.matches); }
// Fetch once before entering the long scene. Random range requests during a
// scroll caused 300–800 ms stalls even when the browser itself ran at 60 Hz.
// Retain compressed video only (~50 MB), never hundreds of decoded bitmaps.
async function prepareVideo() {
  if(preparing || prepared || mediaBlobUrl)return;
  preparing=true;loadedPercent=0;
  try {
    const mediaUrl='/media/journey-prepared-v2.mp4';
    let cache, cached;
    try{cache=await caches.open('codera-motion');cached=await cache.match(mediaUrl);}catch{}
    diagnostics.cacheHit=!!cached;
    const response=cached||await fetch(mediaUrl,{cache:'force-cache',signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const total=Number(response.headers.get('content-length'));
    const chunks=[];let loaded=0;
    if(response.body){
      const reader=response.body.getReader();
      while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;diagnostics.downloadedBytes=loaded;
        const percent=total>0?Math.min(100,Math.floor(loaded/total*100)):0;
        window.__coderaEntry?.progress(Math.round(percent*.96));
        if(percent!==loadedPercent){loadedPercent=percent;toggle.querySelector('.motion-label').textContent=`Pripravujem video · ${percent} %`;}
      }
    }else{chunks.push(await response.arrayBuffer());}
    const blob=new Blob(chunks,{type:'video/mp4'});
    if(cache&&!cached){try{await cache.put(mediaUrl,new Response(blob,{headers:{'Content-Type':'video/mp4','Content-Length':String(blob.size)}}));}catch{}}
    mediaBlobUrl=URL.createObjectURL(blob);
    video.src=mediaBlobUrl;video.preload='auto';video.load();watchLoading();
  }catch(error){
    window.__coderaEntry?.failed();preparing=false;failed=true;diagnostics.lastIssue=`download: ${error.message}`;configure();
  }
}
function watchLoading() {
  clearTimeout(loadWatchdog);
  // A hidden preview may deliberately suspend media loading. Time spent hidden is not failure.
  if ((active || preparing) && !document.hidden && video.readyState < 2) loadWatchdog = setTimeout(()=>retryVideo('load-timeout'),15000);
}
function retryVideo(reason) {
  diagnostics.lastIssue = reason;
  if ((!active && !preparing) || document.hidden) return;
  if (retries < 1) {
    retries++; diagnostics.retries++;
    video.load(); watchLoading();
  } else { preparing=false;failed = true;window.__coderaEntry?.failed(); configure(); }
}
function watchSeek() {
  clearTimeout(seekWatchdog);
  // Remote range requests may take longer than a local seek. Allow slow downloads
  // to make progress instead of discarding their buffer every five seconds.
  if (active && !document.hidden && video.seeking) {
    seekWatchdog=setTimeout(()=>{if(video.seeking)retryVideo('seek-timeout');},30000);
  }
}
video.addEventListener('progress',watchSeek);
function mediaReady() {
  clearTimeout(loadWatchdog);
  if(!prepared && mediaBlobUrl){
    preparing=false;prepared=true;diagnostics.prepared=true;
    // A background download must not push down content someone already reads.
    deferredEntry=userMotion!==true && !journey.classList.contains('has-journey') && window.scrollY>24;
    configure();
  }
  // Late data must recover a timed-out opening without requiring a button click.
  if (failed && wantsMotion()) { failed=false; configure(); }
  if (active) {
    film.classList.add('is-ready');
    toggle.querySelector('.motion-label').textContent='Zastaviť pohyb';
  }
  diagnostics.resolution = `${video.videoWidth}×${video.videoHeight}`;
  if(prepared){window.__coderaEntry?.progress(99);void window.__coderaEntry?.ready();}
  schedule();
}

// Exactly one outstanding seek, with latest-scroll-wins backpressure. No decoded image bank.
function requestFrame() {
  cancelAnimationFrame(pendingFrame); pendingFrame = 0;
  if (!active || document.hidden || video.readyState < 2 || video.seeking || awaitingPresentation) return;
  const localTime = Math.max(0,Math.min(desiredTime-mediaOffset,video.duration-1/mediaFps));
  // Seek only distinct frames, just inside the timestamp to avoid boundary rounding.
  const time = Math.min(Math.round(localTime*mediaFps)/mediaFps+.0005,video.duration-.001);
  if (Math.abs(video.currentTime - time) < .5/mediaFps) return;
  seekStarted = performance.now();
  awaitingPresentation = !!video.requestVideoFrameCallback;
  video.currentTime = time;
  diagnostics.seeks++;
  watchSeek();
}
function schedule() { if (!pendingFrame && active && !document.hidden) pendingFrame = requestAnimationFrame(requestFrame); }
video.addEventListener('seeked', () => {
  clearTimeout(seekWatchdog);
  // Reloading the opening frame is not a successful recovery of a distant seek.
  if(Math.abs(video.currentTime+mediaOffset-desiredTime)<.1)retries=0;
  if (seekStarted) { latencyTotal += performance.now() - seekStarted; diagnostics.averageSeekMs = Math.round(latencyTotal / ++sampleCount); }
  if (!video.requestVideoFrameCallback) { diagnostics.displayedTime = video.currentTime+mediaOffset; presentStory(video.currentTime+mediaOffset); }
  else {
    // Some embedded browsers delay frame callbacks on paused video. Keep captions usable.
    clearTimeout(captionFallback);
    const settledTime=video.currentTime+mediaOffset;
    captionFallback=setTimeout(()=>{awaitingPresentation=false;presentStory(settledTime);schedule();},120);
  }
  schedule();
});
if (video.requestVideoFrameCallback) {
  const presented = (_now, info) => { clearTimeout(captionFallback); awaitingPresentation=false;diagnostics.displayedTime = info.mediaTime+mediaOffset; presentStory(info.mediaTime+mediaOffset); video.requestVideoFrameCallback(presented);schedule(); };
  video.requestVideoFrameCallback(presented);
}
video.addEventListener('loadeddata', mediaReady);
video.addEventListener('canplay', mediaReady);
video.addEventListener('error', ()=>retryVideo(`media-error-${video.error?.code||'unknown'}`));
let selectedBeat = null;
function setBeatAccessibility(progress) {
  const selected = progress < .15 ? 0 : progress >= .17 && progress < .50 ? 1 : progress >= .74 ? 2 : -1;
  if(selected===selectedBeat)return;
  selectedBeat=selected;
  beats.forEach((beat,index)=>{beat.setAttribute('aria-hidden',String(index!==selected));for(const link of beat.querySelectorAll('a'))link.tabIndex=index===selected?0:-1;});
}
function update(progress) {
  const points = cameraPoints;
  let index=1;while(index<points.length-1&&progress>points[index][0])index++;
  const [a,b]=[points[index-1],points[index]];
  desiredTime=a[1]+(b[1]-a[1])*(progress-a[0])/(b[0]-a[0]);
  diagnostics.targetTime=desiredTime;
  diagnostics.progress=progress;
  // ScrollTrigger already updates on an animation frame. Do not queue another
  // display-frame delay; the seeking guard still allows only one decode at a time.
  requestFrame();
}
function presentStory(time) {
  if (!active || !timeline) return;
  // Text follows the decoded image, including reverse scrolling and slow seeks.
  let index=1;while(index<cameraPoints.length-1&&time>cameraPoints[index][1])index++;
  const [a,b]=[cameraPoints[index-1],cameraPoints[index]];
  const progress=Math.max(0,Math.min(1,a[0]+(b[0]-a[0])*(time-a[1])/(b[1]-a[1])));
  timeline.progress(progress);
  setBeatAccessibility(progress);
}
function configure() {
  
  trigger?.kill();timeline?.kill();scrub?.kill();trigger=undefined;timeline=undefined;scrub=undefined;
  cancelAnimationFrame(pendingFrame);pendingFrame=0;awaitingPresentation=false;clearTimeout(loadWatchdog);clearTimeout(seekWatchdog);clearTimeout(captionFallback);
  const librariesReady = !!window.gsap && !!window.ScrollTrigger;
  const requested = wantsMotion();
  if(!librariesReady)window.__coderaEntry?.failed();
  active = requested && !failed && librariesReady && prepared && !deferredEntry;
  if(requested && !failed && librariesReady && !prepared)prepareVideo();
  diagnostics.active=active;
  diagnostics.reason = !librariesReady ? 'libraries-unavailable' : failed ? 'video-unavailable' : userMotion === false ? 'paused' : active ? 'scroll-video' : requested && !prepared ? 'preparing-video' : deferredEntry ? 'ready-to-start' : reduced.matches ? 'reduced-motion' : 'small-touch';
  journey.dataset.motionState=diagnostics.reason;
  document.documentElement.classList.toggle('motion-enabled',active);
  if(active)journey.classList.add('has-journey');
  toggle.hidden = !librariesReady;
  toggle.disabled = preparing;
  toggle.setAttribute('aria-pressed',String(active));
  toggle.querySelector('.motion-label').textContent=failed?'Skúsiť animáciu znova':preparing?`Pripravujem video${loadedPercent?` · ${loadedPercent} %`:'…'}`:active?'Zastaviť pohyb':'Spustiť animáciu';
  toggle.querySelector('.pause-icon').textContent=active?'Ⅱ':'▷';
  if (!active) {
    video.pause();
    // Freeze the current frame/composition without collapsing 2.6 screens of layout.
    // Initial reduced-motion/touch visits still use the compact static opening.
    if(!journey.classList.contains('has-journey')){
      film.classList.remove('is-ready');
      beats.forEach(beat=>{beat.removeAttribute('style');});
      setBeatAccessibility(0);
      document.querySelector('.film-progress i').style.transform='scaleX(0)';
      document.querySelector('.film-shade').removeAttribute('style');
    }
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});
  gsap.set(beats[0],{autoAlpha:1,y:0,force3D:false});
  gsap.set(beats.slice(1),{autoAlpha:0,y:30,force3D:false});
  gsap.set('.film-shade',{'--reading-shade':0,opacity:1});
  gsap.set('.tunnel-fade',{opacity:0});
  timeline=gsap.timeline({paused:true,defaults:{ease:'none',force3D:false}})
    .to(beats[0],{autoAlpha:0,y:-35,duration:.07},.08)
    .to(beats[1],{autoAlpha:1,y:0,duration:.07},.17)
    .to(beats[1],{autoAlpha:0,y:-25,duration:.06},.44)
    .to(beats[2],{autoAlpha:1,y:0,duration:.12},.74)
    .to('.film-shade',{'--reading-shade':.75,duration:.07},.17)
    .to('.film-shade',{'--reading-shade':0,opacity:.3,duration:.08},.44)
    .to('.film-shade',{opacity:1,duration:.12},.72)
    // Fade through the scene's warm shadow before the source changes at ~6s.
    // The short opaque hold bridges that cut; decoded frames drive both directions.
    .to('.tunnel-fade',{opacity:1,duration:.077,ease:'sine.inOut'},.33)
    .to('.tunnel-fade',{opacity:0,duration:.125,ease:'sine.inOut'},.425)
    .to('.film-progress i',{scaleX:1,duration:1},0);
  const camera={progress:0};
  scrub=gsap.to(camera,{progress:1,duration:1,ease:'none',paused:true,onUpdate:()=>update(camera.progress)});
  trigger=ScrollTrigger.create({trigger:journey,start:'top top',end:'bottom bottom',animation:scrub,scrub:.55,onRefresh:self=>{scrub.progress(self.progress);update(self.progress);}});
  if(video.readyState>=2)film.classList.add('is-ready');
  watchLoading();
  update(trigger.progress);
  presentStory(video.currentTime+mediaOffset);
}
window.addEventListener('codera:entry-skip',()=>{userMotion=false;configure();});
toggle.addEventListener('click',()=>{
  userMotion=!active;
  deferredEntry=false;
  if(failed){failed=false;retries=0;if(mediaBlobUrl){URL.revokeObjectURL(mediaBlobUrl);mediaBlobUrl='';}prepared=false;diagnostics.prepared=false;video.removeAttribute('src');}
  configure();
});
window.addEventListener('scroll',()=>{if(deferredEntry && window.scrollY<=24){deferredEntry=false;configure();}},{passive:true});
reduced.addEventListener('change',()=>{userMotion=null;configure();});smallTouch.addEventListener('change',configure);
function resumeMedia() {
  if(document.hidden || !wantsMotion())return;
  if(failed && !mediaBlobUrl){failed=false;retries=0;configure();}
  else if(failed && mediaBlobUrl){failed=false;retries=0;video.load();configure();}
  else if(preparing && mediaBlobUrl){video.load();watchLoading();}
  else if(active){if(video.readyState<2){video.load();watchLoading();}else mediaReady();}
  window.ScrollTrigger?.refresh();schedule();
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(pendingFrame);pendingFrame=0;clearTimeout(loadWatchdog);clearTimeout(seekWatchdog);}
  else resumeMedia();
});
window.addEventListener('pageshow',resumeMedia);
// Deferred library scripts must finish before deciding whether motion is available.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',configure,{once:true});
else configure();

const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('#mobile-menu');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Otvoriť menu');}
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Zatvoriť menu':'Otvoriť menu');});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
desktop.addEventListener('change',()=>{if(desktop.matches)closeMenu();});
document.querySelector('#dopyt button[type="submit"]').disabled=false;

const preview=document.querySelector('.project-dialog');
const previewImage=document.querySelector('#preview-image');
const previewScroll=document.querySelector('.preview-scroll');
let previewTrigger;
function resetZoom(){previewScroll.classList.remove('is-zoomed');document.querySelector('#preview-zoom').setAttribute('aria-pressed','false');document.querySelector('#preview-zoom').textContent='Zväčšiť';}
document.querySelectorAll('.project-preview').forEach(button=>{
  button.hidden=false;
  button.addEventListener('click',()=>{
    previewTrigger=button;
    document.querySelector('#preview-title').textContent=button.dataset.title;
    document.querySelector('#preview-live').href=button.dataset.url;
    previewImage.alt=`${button.dataset.title} — celá stránka, statický náhľad`;
    previewImage.width=Number(button.dataset.width);previewImage.height=Number(button.dataset.height);
    previewImage.src=`/media/projects/${button.dataset.project}-full.webp`;
    resetZoom();preview.showModal();previewScroll.scrollTo(0,0);
  });
});
document.querySelector('.close-dialog').addEventListener('click',()=>preview.close());
document.querySelector('#preview-zoom').addEventListener('click',event=>{
  const zoomed=previewScroll.classList.toggle('is-zoomed');
  event.currentTarget.setAttribute('aria-pressed',String(zoomed));event.currentTarget.textContent=zoomed?'Prispôsobiť':'Zväčšiť';
});
previewImage.addEventListener('click',()=>document.querySelector('#preview-zoom').click());
preview.addEventListener('close',()=>{previewImage.removeAttribute('src');resetZoom();previewTrigger?.focus({preventScroll:true});});
document.querySelector('#dopyt').addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const body=`Meno: ${data.get('name')}\nE-mail: ${data.get('email')}\n\n${data.get('message')}`;
  const mailto=`mailto:${form.dataset.email}?subject=${encodeURIComponent('Nový projekt — Codera')}&body=${encodeURIComponent(body)}`;
  const status=document.querySelector('#form-status');
  status.textContent='Dopyt je pripravený na odoslanie vo vašom e-mailovom programe. Ak sa neotvoril, napíšte nám priamo na uvedený e-mail.';
  window.location.href=mailto;
});
