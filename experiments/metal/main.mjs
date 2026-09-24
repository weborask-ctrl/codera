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
let trigger, timeline, scrub, active = false, desiredTime = 0, pendingFrame = 0;
let loadWatchdog = 0, seekWatchdog = 0, captionFallback = 0, retries = 0;
let userMotion = null, failed = false, sampleCount = 0, latencyTotal = 0, seekStarted = 0;
const diagnostics = { targetTime: 0, displayedTime: 0, progress: 0, seeks: 0, averageSeekMs: 0, active: false, resolution: '', reason: 'initializing', lastIssue: '', retries: 0 };
Object.defineProperty(window, '__coderaMotion', { value: diagnostics });

function wantsMotion() { return userMotion ?? (!reduced.matches && !smallTouch.matches); }
function watchLoading() {
  clearTimeout(loadWatchdog);
  // A hidden preview may deliberately suspend media loading. Time spent hidden is not failure.
  if (active && !document.hidden && video.readyState < 2) loadWatchdog = setTimeout(()=>retryVideo('load-timeout'),15000);
}
function retryVideo(reason) {
  diagnostics.lastIssue = reason;
  if (!active || document.hidden) return;
  if (retries < 1) {
    retries++; diagnostics.retries++;
    video.load(); watchLoading();
  } else { failed = true; configure(); }
}
function mediaReady() {
  clearTimeout(loadWatchdog);
  // Late data must recover a timed-out opening without requiring a button click.
  if (failed && wantsMotion()) { failed=false; configure(); }
  if (active) {
    film.classList.add('is-ready');
    toggle.querySelector('.motion-label').textContent='Zastaviť pohyb';
  }
  diagnostics.resolution = `${video.videoWidth}×${video.videoHeight}`;
  retries=0; schedule();
}

// Exactly one outstanding seek, with latest-scroll-wins backpressure. No decoded image bank.
function requestFrame() {
  pendingFrame = 0;
  if (!active || document.hidden || video.readyState < 2 || video.seeking) return;
  const time = Math.min(desiredTime, video.duration - .08);
  if (Math.abs(video.currentTime - time) < 1 / 48) return;
  seekStarted = performance.now();
  video.currentTime = time;
  diagnostics.seeks++;
  clearTimeout(seekWatchdog);
  seekWatchdog = setTimeout(() => { if (video.seeking) retryVideo('seek-timeout'); }, 5000);
}
function schedule() { if (!pendingFrame && active && !document.hidden) pendingFrame = requestAnimationFrame(requestFrame); }
video.addEventListener('seeked', () => {
  clearTimeout(seekWatchdog);
  if (seekStarted) { latencyTotal += performance.now() - seekStarted; diagnostics.averageSeekMs = Math.round(latencyTotal / ++sampleCount); }
  if (!video.requestVideoFrameCallback) { diagnostics.displayedTime = video.currentTime; presentStory(video.currentTime); }
  else {
    // Some embedded browsers delay frame callbacks on paused video. Keep captions usable.
    clearTimeout(captionFallback);
    const settledTime=video.currentTime;
    captionFallback=setTimeout(()=>presentStory(settledTime),120);
  }
  schedule();
});
if (video.requestVideoFrameCallback) {
  const presented = (_now, info) => { clearTimeout(captionFallback); diagnostics.displayedTime = info.mediaTime; presentStory(info.mediaTime); video.requestVideoFrameCallback(presented); };
  video.requestVideoFrameCallback(presented);
}
video.addEventListener('loadeddata', mediaReady);
video.addEventListener('canplay', mediaReady);
video.addEventListener('error', ()=>retryVideo(`media-error-${video.error?.code||'unknown'}`));
function setBeatAccessibility(progress) {
  const selected = progress < .15 ? 0 : progress >= .17 && progress < .50 ? 1 : progress >= .74 ? 2 : -1;
  beats.forEach((beat,index)=>{beat.setAttribute('aria-hidden',String(index!==selected));for(const link of beat.querySelectorAll('a'))link.tabIndex=index===selected?0:-1;});
}
function update(progress) {
  const points = cameraPoints;
  let index=1;while(index<points.length-1&&progress>points[index][0])index++;
  const [a,b]=[points[index-1],points[index]];
  desiredTime=a[1]+(b[1]-a[1])*(progress-a[0])/(b[0]-a[0]);
  diagnostics.targetTime=desiredTime;
  diagnostics.progress=progress;
  schedule();
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
  cancelAnimationFrame(pendingFrame);pendingFrame=0;clearTimeout(loadWatchdog);clearTimeout(seekWatchdog);clearTimeout(captionFallback);
  const librariesReady = !!window.gsap && !!window.ScrollTrigger;
  const requested = wantsMotion();
  active = requested && !failed && librariesReady;
  diagnostics.active=active;
  diagnostics.reason = !librariesReady ? 'libraries-unavailable' : failed ? 'video-unavailable' : userMotion === false ? 'paused' : active ? 'scroll-video' : reduced.matches ? 'reduced-motion' : 'small-touch';
  journey.dataset.motionState=diagnostics.reason;
  document.documentElement.classList.toggle('motion-enabled',active);
  if(active)journey.classList.add('has-journey');
  toggle.hidden = !librariesReady;
  toggle.setAttribute('aria-pressed',String(active));
  toggle.querySelector('.motion-label').textContent=failed?'Skúsiť animáciu znova':active?(video.readyState<2?'Načítavam video…':'Zastaviť pohyb'):'Spustiť animáciu';
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
  gsap.set(beats[0],{autoAlpha:1,y:0});
  gsap.set(beats.slice(1),{autoAlpha:0,y:30});
  gsap.set('.film-shade',{'--reading-shade':0,opacity:1});
  gsap.set('.tunnel-fade',{opacity:0});
  timeline=gsap.timeline({paused:true,defaults:{ease:'none'}})
    .to(beats[0],{autoAlpha:0,y:-35,duration:.07},.08)
    .to(beats[1],{autoAlpha:1,y:0,duration:.07},.17)
    .to(beats[1],{autoAlpha:0,y:-25,duration:.06},.44)
    .to(beats[2],{autoAlpha:1,y:0,duration:.12},.74)
    .to('.film-shade',{'--reading-shade':.75,duration:.07},.17)
    .to('.film-shade',{'--reading-shade':0,opacity:.3,duration:.08},.44)
    .to('.film-shade',{opacity:1,duration:.12},.72)
    // A restrained warm dissolve follows decoded frames into the gold passage.
    // The underlying camera stays continuous and reverses with native scroll.
    .to('.tunnel-fade',{opacity:.22,duration:.10,ease:'sine.inOut'},.36)
    .to('.tunnel-fade',{opacity:0,duration:.17,ease:'sine.inOut'},.46)
    .to('.film-progress i',{scaleX:1,duration:1},0);
  const camera={progress:0};
  scrub=gsap.to(camera,{progress:1,duration:1,ease:'none',paused:true,onUpdate:()=>update(camera.progress)});
  trigger=ScrollTrigger.create({trigger:journey,start:'top top',end:'bottom bottom',animation:scrub,scrub:.85,onRefresh:self=>{scrub.progress(self.progress);update(self.progress);}});
  if(!video.getAttribute('src')){video.src='/media/journey-detail-1080.mp4';video.preload='auto';video.load();}
  else if(video.readyState>=2)film.classList.add('is-ready');
  watchLoading();
  update(trigger.progress);
  presentStory(video.currentTime);
}
toggle.addEventListener('click',()=>{
  userMotion=!active;
  if(failed){failed=false;retries=0;video.removeAttribute('src');}
  configure();
});
reduced.addEventListener('change',()=>{userMotion=null;configure();});smallTouch.addEventListener('change',configure);
function resumeMedia() {
  if(document.hidden || !wantsMotion())return;
  if(failed){failed=false;retries=0;video.removeAttribute('src');configure();}
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
