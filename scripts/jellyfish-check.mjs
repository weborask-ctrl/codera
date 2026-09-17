import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { flattenFrame, frames, journeyAt, sampleFrame } from '../experiments/jellyfish/choreography.mjs';

// These are behavioral invariants, not snapshots of the generated mesh.
const bounds = { workStart: 2000, workEnd: 8000, end: 14000,
  stops: [{ y: 8000, at: 2.15 }, { y: 10000, at: 5.2 }, { y: 11000, at: 5.8 }, { y: 12000, at: 6.65 }, { y: 13000, at: 7.1 }, { y: 14000, at: 8 }] };
assert.equal(journeyAt(-100, bounds), 0);
for (let y = 2000; y <= 8000; y += 20) assert.equal(journeyAt(y, bounds), 2.15, 'Portfolio must not advance camera');
assert.ok(journeyAt(8200, bounds) > 2.15, 'Motion resumes after portfolio');
const positions = [0, 972, 1800, 2500, 6500, 8200, 10000, 11900, 14000];
const forward = positions.map((y) => journeyAt(y, bounds));
const backward = [...positions].reverse().map((y) => journeyAt(y, bounds)).reverse();
assert.deepEqual(forward, backward, 'Scroll reversal must select the same camera time');
assert.ok(forward.every((value, index) => index === 0 || value >= forward[index - 1]));
assert.equal(journeyAt(99999, bounds), 8);
assert.ok(frames.every((frame, index) => index === 0 || frame.at > frames[index - 1].at));
const distances = frames.map((f) => Math.hypot(...f.camera.map((n, i) => n - f.jelly[i])));
assert.ok(Math.max(...distances) / Math.min(...distances) > 8, 'Journey needs a substantial near/far contrast');

// Sample the actual camera path, not just its authored waypoints. These gates
// catch overshoot, broken holds and a curve that differs when sought backward.
const channels = Object.keys(flattenFrame(frames[0]));
for (const frame of frames) assert.deepEqual(sampleFrame(frame.at), flattenFrame(frame), 'Authored pose must be exact');
assert.deepEqual(sampleFrame(-10), flattenFrame(frames[0]));
assert.deepEqual(sampleFrame(100), flattenFrame(frames.at(-1)));
const sampled = [];
let segment = 0, minBell = Infinity, minTarget = Infinity, maxBell = 0;
for (let i = 0; i <= 8000; i++) {
  const at = i / 1000, pose = sampleFrame(at);
  while (segment < frames.length - 2 && at > frames[segment + 1].at) segment++;
  const a = flattenFrame(frames[segment]), b = flattenFrame(frames[segment + 1]);
  for (const key of channels) {
    assert.ok(Number.isFinite(pose[key]), `Nonfinite ${key} at ${at}`);
    assert.ok(pose[key] >= Math.min(a[key], b[key]) - 1e-9 && pose[key] <= Math.max(a[key], b[key]) + 1e-9, `Overshoot in ${key} at ${at}`);
  }
  const bell = Math.hypot(pose.cx - pose.jx, pose.cy - pose.jy, pose.cz - pose.jz);
  minBell = Math.min(minBell, bell); maxBell = Math.max(maxBell, bell);
  minTarget = Math.min(minTarget, Math.hypot(pose.cx - pose.tx, pose.cy - pose.ty, pose.cz - pose.tz));
  sampled.push(pose);
}
for (let i = 8000; i >= 0; i--) assert.deepEqual(sampleFrame(i / 1000), sampled[i], `Reverse seek drift at ${i / 1000}`);
assert.ok(minBell > 2.1, 'Camera must clear the bell-centre safety radius (not a full tentacle collision test)');
assert.ok(minTarget > 2, 'Camera must not cross its look target');
assert.ok(maxBell / minBell > 8, 'Sampled path must retain near/far contrast');
for (const [start, end] of [[5.2, 5.8], [6.65, 7.1]]) {
  const hold = sampleFrame(start);
  for (let i = 0; i <= 100; i++) assert.deepEqual(sampleFrame(start + (end - start) * i / 100), hold, 'Reading hold must not drift');
}
const epsilon = 1e-5;
for (const frame of frames.slice(1, -1)) {
  const before = sampleFrame(frame.at - epsilon), here = sampleFrame(frame.at), after = sampleFrame(frame.at + epsilon);
  for (const key of channels) {
    const left = (here[key] - before[key]) / epsilon, right = (after[key] - here[key]) / epsilon;
    assert.ok(Math.abs(left - right) < .01, `Velocity discontinuity in ${key} at ${frame.at}`);
    if ([2.15, 5.2, 5.8, 6.65, 7.1].includes(frame.at)) assert.ok(Math.abs(left) < .01 && Math.abs(right) < .01, `Nonzero hold-boundary velocity at ${frame.at}`);
  }
}
const html = await readFile(new URL('../experiments/jellyfish/index.html', import.meta.url), 'utf8');
assert.equal((html.match(/class="project"/g) || []).length, 5);
assert.ok(!html.includes('exec-'), 'Generated concept screenshots are not a spatial implementation');
const base = 'http://127.0.0.1:4317';
for (const path of ['/', '/scene.mjs', '/main.mjs', '/fonts/bricolage-800.woff2', '/vendor/three/three.module.min.js', '/vendor/three/three.core.min.js', '/vendor/gsap/ScrollTrigger.min.js', '/assets/home/demos/animacie-3d-1600.jpg']) {
  const response = await fetch(base + path, { method: 'HEAD' });
  assert.equal(response.status, 200, path);
}
for (const path of ['/%2e%2e%2f.git/config', '/assets/%2e%2e%2f.git/config', '/fonts/../site-config.ts', '/.env']) {
  const response = await fetch(base + path);
  assert.ok([403, 404].includes(response.status), `Must not expose repository secrets: ${path}`);
}
assert.equal((await fetch(base, { method: 'POST' })).status, 405);
const config = await (await fetch(`${base}/config.json`)).json();
assert.equal(config.siteConfig.email, 'kontakt@codera.sk');
const servedHtml = await (await fetch(base)).text();
assert.ok(servedHtml.includes(`href="mailto:${config.siteConfig.email}"`), 'Email must work without JavaScript');
assert.ok(servedHtml.includes(`href="tel:${config.siteConfig.phoneHref}"`), 'Phone must work without JavaScript');
for (const pkg of config.packages) {
  assert.ok(servedHtml.includes(pkg.name) && servedHtml.includes(pkg.priceFrom), 'Offer is server-rendered from config');
}
assert.ok(!servedHtml.includes('<!--business:'), 'All business template slots are filled');
assert.ok(servedHtml.includes('<body class="static-mode">'), 'No-JS and failed-module loads use the compact readable layout');
const health = await (await fetch(`${base}/health.json`)).json();
assert.ok(health.serverMB < 200, 'Preview server unexpectedly large');
console.log(`PASS: portfolio pause, reversible journey, near/far scale, five concepts, asset serving, path boundaries. Server ${health.serverMB} MB; free RAM ${health.freeMB} MB.`);
