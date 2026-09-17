import { flattenFrame, frames, journeyAt, sampleFrame } from './choreography.mjs';

const $ = (selector) => document.querySelector(selector);
const root = document.documentElement;
const work = $('#praca');
const output = $('#performance');
const button = $('#motion-toggle');
const media = matchMedia('(prefers-reduced-motion: reduce)');
const queryReduced = new URLSearchParams(location.search).get('motion') === 'reduce';
let world, gsap, ScrollTrigger, timeline, bounds, health, healthRequest, healthTimer;
let failed = false, stopped = media.matches || queryReduced, userStopped = false;
let hidden = document.hidden, pageActive = true, generation = 0;
let lastScroll = performance.now(), lastRender = 0, elapsed = 0;
let lastTick = 0, sampleStart = 0, rendered = 0, count = 0, slowMs = 0, activeMs = 0, poorWindows = 0;
let frameMs = 0, inWork = false, stage = 0, initialRender = false;
const state = flattenFrame(frames[0]);

function measure() {
  const top = (selector) => $(selector).getBoundingClientRect().top + scrollY;
  const bottom = (selector) => top(selector) + $(selector).offsetHeight;
  bounds = {
    workStart: top('#praca') - innerHeight * .55,
    workEnd: bottom('#praca') - innerHeight * .05,
    end: root.scrollHeight - innerHeight,
  };
  bounds.stops = [
    { y: bounds.workEnd, at: 2.15 },
    { y: top('#sluzby') - innerHeight * .15, at: 5.2 },
    { y: Math.max(top('#sluzby') + innerHeight * .2, bottom('#sluzby') - innerHeight * .6), at: 5.8 },
    { y: top('#proces') - innerHeight * .1, at: 6.65 },
    { y: Math.max(top('#proces') + innerHeight * .2, bottom('#proces') - innerHeight * .6), at: 7.1 },
    { y: top('#kontakt'), at: 8 },
    { y: bounds.end, at: 8 },
  ];
  updateScroll();
}

function updateScroll() {
  if (!bounds || !timeline) return;
  stage = journeyAt(scrollY, bounds);
  const wasInWork = inWork;
  inWork = scrollY >= work.offsetTop - 30 && scrollY < bounds.workEnd;
  // GSAP seeks wake its ticker; static/hidden pages only need the deterministic pose.
  if (stopped || hidden || !pageActive) sampleFrame(stage, state);
  else timeline.time(stage, false);
  $('#world').style.visibility = inWork ? 'hidden' : 'visible';
  root.dataset.stage = stage.toFixed(4);
  root.dataset.portfolio = String(inWork);
  root.dataset.camera = [state.cx, state.cy, state.cz].map((n) => n.toFixed(2)).join(',');
  lastScroll = performance.now();
  if (inWork !== wasInWork) describeStatus(0);
}

function describeStatus(fps) {
  const stats = world?.stats();
  let mode = failed ? '3D nedostupné' : stopped ? 'Statické zobrazenie' : hidden || !pageActive ? 'Neaktívna karta' : inWork ? 'Ukážky: 3D spí' : 'Priestorová scéna';
  if (world && !stopped && !inWork && !hidden && performance.now() - lastScroll > 1600) mode += ' · pokoj';
  const memory = health ? health.freeMB + ' MB voľnej RAM pri kontrole' : 'RAM sa nepodarilo zistiť';
  output.textContent = mode + '\n' + Math.round(fps) + ' vykreslení/s · limit 30\n' +
    (stats?.width || 0) + ' × ' + (stats?.height || 0) + ' px\n' +
    (stats?.triangles || 0) + ' trojuholníkov · ' + (stats?.calls || 0) + ' volaní\n' +
    Math.round(frameMs * 10) / 10 + ' ms CPU/odoslanie snímky\n' + memory;
  root.dataset.renderCount = String(count);
  root.dataset.fps = String(Math.round(fps));
  root.dataset.motion = failed ? 'error' : stopped ? 'static' : 'running';
}

function renderTick() {
  if (stopped || hidden || !pageActive || inWork) { gsap.ticker.sleep(); return; }
  const now = performance.now();
  const delta = lastTick ? Math.min(250, now - lastTick) : 33;
  lastTick = now;
  if (!sampleStart) sampleStart = now;
  if (pageActive && !hidden && !stopped && !failed && !inWork && world) {
    const active = performance.now() - lastScroll < 1600;
    // The single GSAP ticker already caps active rendering at 30 fps. A second
    // 31 ms gate would skip valid ticks when browser scheduling jitters slightly.
    if (active || now - lastRender >= 120 || !initialRender) {
      elapsed += Math.min(.12, (now - lastRender) / 1000 || .033);
      const start = performance.now();
      try { world.render(state, elapsed, stage); }
      catch (error) { console.warn('Jellyfish render stopped:', error); failed = true; void setStopped(true, '3D sa prerušilo. Obsah zostáva dostupný.'); return; }
      frameMs = frameMs * .9 + (performance.now() - start) * .1;
      lastRender = now; initialRender = true; rendered++; count++;
      root.dataset.renderCount = String(count);
    }
    if (active) { activeMs += delta; if (delta > 100) slowMs += delta; }
  }
  if (now - sampleStart >= 1500) {
    describeStatus(rendered * 1000 / (now - sampleStart));
    poorWindows = activeMs > 500 && slowMs / activeMs > .35 ? poorWindows + 1 : 0;
    if (poorWindows >= 2 && world && !stopped) {
      poorWindows = 0;
      if (!world.downgrade()) void setStopped(true, 'Výkon nestačil; 3D sa zastavilo. Obsah môžete ďalej prezerať.');
    }
    sampleStart = now; rendered = 0; slowMs = 0; activeMs = 0;
  }
}

function onContextLost(event) {
  event.preventDefault();
  failed = true;
  void setStopped(true, 'Grafický kontext sa prerušil. Obsah zostáva dostupný. 3D môžete skúsiť spustiť znova.');
}

function releaseWorld() {
  if (!world) return;
  world.canvas.removeEventListener('webglcontextlost', onContextLost);
  world.dispose();
  world = undefined;
}

function syncActivity() {
  clearInterval(healthTimer);
  healthTimer = undefined;
  if (!pageActive || hidden || stopped) gsap?.ticker.sleep();
  else {
    lastTick = 0; sampleStart = 0; rendered = 0; slowMs = 0; activeMs = 0; poorWindows = 0; initialRender = false;
    gsap?.ticker.wake();
    healthTimer = setInterval(() => { if (!inWork) void readHealth(); }, 15000);
  }
}

async function setStopped(value, reason = '') {
  const request = ++generation;
  button.disabled = true;
  if (!value) {
    root.dataset.motion = 'starting';
    await readHealth();
    if (request !== generation) return;
    if (health?.freeMB < 750) { value = true; reason = 'PC má málo voľnej pamäte. Obsah môžete prezerať staticky.'; }
    else {
      try {
        const { createWorld } = await import('./scene.mjs');
        if (request !== generation) return;
        if (!world) {
          world = createWorld($('#world'));
          world.canvas.addEventListener('webglcontextlost', onContextLost);
        }
        world.setQuality($('#quality').value);
        failed = false;
      } catch (error) {
        console.warn('Jellyfish initialization unavailable:', error);
        failed = true; value = true;
        reason = '3D sa nepodarilo spustiť. Ukážky a kontakty zostávajú dostupné.';
      }
    }
  }
  // Keep the current readable section in place when transition gaps collapse.
  const visible = [...document.querySelectorAll('main section')].find((section) => section.getBoundingClientRect().bottom > innerHeight * .4);
  const offset = visible?.getBoundingClientRect().top;
  const preserve = scrollY > innerHeight;
  stopped = value;
  document.body.classList.toggle('static-mode', stopped);
  document.body.classList.toggle('spatial-mode', !stopped);
  if (stopped) releaseWorld();
  button.textContent = failed ? 'Skúsiť 3D znova' : stopped ? 'Spustiť 3D' : 'Zastaviť 3D';
  button.setAttribute('aria-pressed', String(stopped));
  button.disabled = !timeline;
  $('#quality').disabled = stopped;
  $('#fallback').hidden = !reason;
  if (reason) $('#fallback').textContent = reason;
  if (visible && preserve) {
    const targetOffset = Math.min(offset, innerHeight * .4);
    scrollTo(0, scrollY + visible.getBoundingClientRect().top - targetOffset);
  }
  measure();
  ScrollTrigger?.refresh();
  if (!stopped) world?.resize();
  syncActivity();
  describeStatus(0);
}

async function readHealth() {
  if (healthRequest) return healthRequest;
  healthRequest = (async () => {
    try {
      const response = await fetch('/health.json', { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error('Health unavailable');
      const value = await response.json();
      health = Number.isFinite(value.freeMB) ? value : null;
      if (health?.freeMB < 750 && world && !stopped) await setStopped(true, 'PC má málo voľnej pamäte. 3D sa zastavilo.');
    } catch { health = null; }
    finally { healthRequest = undefined; }
  })();
  return healthRequest;
}

// All business content is server-rendered from lib/site-config.ts, including no-JS.
if ((!window.gsap || !window.ScrollTrigger) && document.readyState !== 'complete') {
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 5000);
    window.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
  });
}
({ gsap, ScrollTrigger } = window);
if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const playhead = { at: 0 };
  timeline = gsap.timeline({ paused: true }).to(playhead, { at: 8, duration: 8, ease: 'none', onUpdate: () => sampleFrame(playhead.at, state) });
  ScrollTrigger.create({ start: 0, end: () => ScrollTrigger.maxScroll(window), onUpdate: updateScroll, onRefresh: measure });
  gsap.ticker.fps(30);
  gsap.ticker.add(renderTick);
  await setStopped(stopped);
  button.addEventListener('click', () => { userStopped = !stopped; void setStopped(!stopped); });
  $('#quality').addEventListener('change', (event) => { world?.setQuality(event.target.value); initialRender = false; lastScroll = performance.now(); });
  media.addEventListener('change', () => { if (media.matches || (!userStopped && !queryReduced)) void setStopped(media.matches); });
  window.addEventListener('resize', () => { world?.resize(); measure(); });
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; syncActivity(); if (!hidden) { updateScroll(); void readHealth(); } describeStatus(0); });
  window.addEventListener('pagehide', () => { pageActive = false; syncActivity(); });
  window.addEventListener('pageshow', () => { pageActive = true; hidden = document.hidden; measure(); ScrollTrigger.refresh(); syncActivity(); void readHealth(); });
} else {
  failed = true; stopped = true;
  button.disabled = true;
  $('#quality').disabled = true;
  $('#fallback').hidden = false;
  $('#fallback').textContent = 'Animácia sa nenačítala. Ukážky a kontakty zostávajú dostupné.';
  describeStatus(0);
}
$('#diagnostics').addEventListener('toggle', () => { if ($('#diagnostics').open) void readHealth().then(() => describeStatus(0)); });
await document.fonts.ready;
if (timeline) { measure(); ScrollTrigger.refresh(); }
// Reapply a deep link after fonts and spatial gaps settle, without intercepting native links.
try { if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); }
catch { /* A malformed fragment is not a reason to lose the page. */ }
updateScroll();
root.dataset.ready = 'true';
