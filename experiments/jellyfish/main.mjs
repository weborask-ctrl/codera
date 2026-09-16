import { flattenFrame, frames, journeyAt } from './choreography.mjs';
import { createWorld } from './scene.mjs';

const $ = (selector) => document.querySelector(selector);
const root = document.documentElement;
const work = $('#praca');
const output = $('#performance');
const button = $('#motion-toggle');
const media = matchMedia('(prefers-reduced-motion: reduce)');
let world, failed = false, stopped = media.matches || new URLSearchParams(location.search).get('motion') === 'reduce', hidden = document.hidden;
let timeline, bounds, lastScroll = performance.now(), lastRender = 0, elapsed = 0;
let lastTick = 0, sampleStart = 0, rendered = 0, count = 0, slowSamples = 0;
let frameMs = 0, health = null, inWork = false, stage = 0, initialRender = false;
const state = flattenFrame(frames[0]);

async function populateBusiness() {
  const response = await fetch('/config.json');
  if (!response.ok) throw new Error('Business configuration is unavailable');
  const { siteConfig, commercial, packages, people, wordpressService } = await response.json();
  for (const pkg of packages) {
    const card = document.createElement('div');
    const title = document.createElement('h3'); title.textContent = pkg.name;
    const price = document.createElement('strong'); price.textContent = pkg.priceFrom;
    const prefix = document.createElement('small'); prefix.textContent = 'od '; price.prepend(prefix);
    const description = document.createElement('p'); description.textContent = pkg.audience;
    const scope = document.createElement('p'); scope.textContent = pkg.scope[0];
    card.append(title, price, description, scope); $('#packages').append(card);
  }
  $('#wordpress').textContent = `${wordpressService.name} — ${wordpressService.line} Cena podľa rozsahu.`;
  $('#response-time').textContent = `${commercial.responseHours} h`;
  $('#proposal-time').textContent = `${commercial.firstProposalHours} h`;
  $('#email').textContent = siteConfig.email; $('#email').href = `mailto:${siteConfig.email}`;
  $('#phone').textContent = siteConfig.phone; $('#phone').href = `tel:${siteConfig.phoneHref}`;
  $('#people').textContent = people.map((person) => person.name).join(' · ');
}

function measure() {
  const top = (selector) => $(selector).getBoundingClientRect().top + scrollY;
  const bottom = (selector) => top(selector) + $(selector).offsetHeight;
  bounds = {
    workStart: top('#praca') - innerHeight * .55,
    workEnd: bottom('#praca') - innerHeight * .05,
    end: document.documentElement.scrollHeight - innerHeight,
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
  const y = scrollY;
  stage = journeyAt(y, bounds);
  timeline.time(stage, false);
  inWork = y >= work.offsetTop - 30 && y < bounds.workEnd;
  $('#world').style.visibility = inWork ? 'hidden' : 'visible';
  root.dataset.stage = stage.toFixed(4);
  root.dataset.portfolio = String(inWork);
  root.dataset.camera = [state.cx, state.cy, state.cz].map((n) => n.toFixed(2)).join(',');
  // Native scroll moves the hero text. Only the actual 3D camera is choreographed.
  lastScroll = performance.now();
}

function describeStatus(fps) {
  const stats = world?.stats();
  let mode = failed ? '3D nedostupné' : stopped ? 'Statické zobrazenie' : hidden ? 'Neaktívna karta' : inWork ? 'Ukážky: 3D spí' : 'Priestorová scéna';
  if (world && !stopped && !inWork && performance.now() - lastScroll > 1600) mode += ' · pokoj';
  output.textContent = `${mode}\n${Math.round(fps)} vykreslení/s · limit 30\n${stats?.width || 0} × ${stats?.height || 0} px\n${stats?.triangles || 0} trojuholníkov · ${stats?.calls || 0} volaní\n${Math.round(frameMs * 10) / 10} ms CPU/odoslanie snímky\n${health ? `${health.freeMB} MB voľnej RAM pri kontrole` : 'RAM sa zisťuje…'}`;
  root.dataset.renderCount = String(count);
  root.dataset.fps = String(Math.round(fps));
  root.dataset.camera = [state.cx, state.cy, state.cz].map((n) => n.toFixed(2)).join(',');
}

function renderTick(seconds) {
  const now = seconds * 1000;
  const delta = lastTick ? Math.min(250, now - lastTick) : 33;
  lastTick = now;
  if (!sampleStart) sampleStart = now;
  if (!hidden && !stopped && !failed && !inWork && world) {
    const active = performance.now() - lastScroll < 1600;
    const interval = active ? 31 : 120;
    if (now - lastRender >= interval || !initialRender) {
      elapsed += Math.min(.12, (now - lastRender) / 1000 || .033);
      const start = performance.now();
      world.render(state, elapsed, stage);
      frameMs = frameMs * .9 + (performance.now() - start) * .1;
      lastRender = now; initialRender = true; rendered++; count++;
    }
    if (active && delta > 100) slowSamples++;
  }
  if (now - sampleStart >= 1500) {
    describeStatus(rendered * 1000 / (now - sampleStart));
    if (slowSamples > 12 && world && !stopped) {
      if (!world.downgrade()) setStopped(true, 'Výkon nestačil; 3D sa zastavilo. Obsah môžete ďalej prezerať.');
    }
    sampleStart = now; rendered = 0; slowSamples = 0;
  }
}

function setStopped(value, reason = '') {
  if (!value && !world && !failed) {
    try { world = createWorld($('#world')); }
    catch { failed = true; value = true; reason = '3D sa nepodarilo spustiť. Obsah zostáva dostupný.'; }
  }
  stopped = value;
  const sections = [...document.querySelectorAll('main section')];
  const visible = sections.find((s) => s.getBoundingClientRect().bottom > innerHeight * .4);
  document.body.classList.toggle('static-mode', stopped);
  button.textContent = stopped ? 'Spustiť 3D' : 'Zastaviť 3D';
  button.setAttribute('aria-pressed', String(stopped));
  $('#fallback').hidden = !reason;
  if (reason) $('#fallback').textContent = reason;
  if (visible && scrollY > innerHeight) visible.scrollIntoView({ block: 'start' });
  measure();
  if (!stopped) { world?.resize(); initialRender = false; }
  describeStatus(0);
}

await populateBusiness().catch((error) => { console.error(error); $('#packages').textContent = 'Ponuku nájdete na www.codera.sk.'; });
if (!window.gsap || !window.ScrollTrigger) await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
const { gsap, ScrollTrigger } = window;
if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  timeline = gsap.timeline({ paused: true });
  for (let i = 1; i < frames.length; i++) timeline.to(state, { ...flattenFrame(frames[i]), duration: frames[i].at - frames[i - 1].at, ease: 'sine.inOut' }, frames[i - 1].at);
  measure();
  ScrollTrigger.create({ start: 0, end: () => ScrollTrigger.maxScroll(window), onUpdate: updateScroll, onRefresh: measure });
  try {
    if (!stopped) world = createWorld($('#world'));
  } catch (error) {
    failed = true; stopped = true; console.error(error);
    $('#fallback').hidden = false; $('#fallback').textContent = 'Prehliadač nepovolil 3D. Ukážky a obsah môžete ďalej prezerať.';
  }
  gsap.ticker.fps(30);
  gsap.ticker.add(renderTick);
  if (stopped) setStopped(true);
  button.addEventListener('click', () => {
    if (failed) return;
    if (stopped && !world) {
      try { world = createWorld($('#world')); }
      catch { failed = true; return; }
    }
    setStopped(!stopped);
  });
  $('#quality').addEventListener('change', (event) => { world?.setQuality(event.target.value); initialRender = false; lastScroll = performance.now(); });
  media.addEventListener('change', () => setStopped(media.matches));
  window.addEventListener('resize', () => { world?.resize(); measure(); });
  window.addEventListener('pageshow', () => { measure(); ScrollTrigger.refresh(); });
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; if (hidden) gsap.ticker.sleep(); else { lastTick = 0; sampleStart = 0; initialRender = false; gsap.ticker.wake(); updateScroll(); } });
  world?.canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); failed = true; setStopped(true, 'Grafický kontext sa prerušil. Obsah zostáva dostupný.'); });
  window.addEventListener('pagehide', () => gsap.ticker.sleep());
} else {
  failed = true; document.body.classList.add('static-mode'); output.textContent = 'Animácia sa nenačítala. Obsah zostáva dostupný.';
}
async function readHealth() {
  try { health = await (await fetch('/health.json')).json(); if (health.freeMB < 750 && !stopped) setStopped(true, 'PC má málo voľnej pamäte. 3D sa zastavilo.'); }
  catch { health = null; }
}
await readHealth();
const healthTimer = setInterval(() => { if (!document.hidden && !stopped) readHealth(); }, 15000);
window.addEventListener('pagehide', () => clearInterval(healthTimer));
$('#diagnostics').addEventListener('toggle', () => { if ($('#diagnostics').open) readHealth(); });
await document.fonts.ready;
if (timeline) { measure(); ScrollTrigger.refresh(); }
root.dataset.ready = 'true';
