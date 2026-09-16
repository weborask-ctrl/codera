import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { frames, journeyAt } from '../experiments/jellyfish/choreography.mjs';

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
const health = await (await fetch(`${base}/health.json`)).json();
assert.ok(health.serverMB < 200, 'Preview server unexpectedly large');
console.log(`PASS: portfolio pause, reversible journey, near/far scale, five concepts, asset serving, path boundaries. Server ${health.serverMB} MB; free RAM ${health.freeMB} MB.`);
