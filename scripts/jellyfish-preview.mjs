import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { freemem, totalmem } from 'node:os';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { commercial, packages, people, siteConfig, wordpressService } from '../lib/site-config.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = resolve(root, '.prototype-cache/jellyfish');
const lock = JSON.parse(await readFile(resolve(root, 'package-lock.json'), 'utf8'));
const libraries = {
  three: ['build/three.module.min.js', 'build/three.core.min.js', 'examples/jsm/loaders/GLTFLoader.js', 'examples/jsm/utils/BufferGeometryUtils.js', 'examples/jsm/utils/SkeletonUtils.js', 'LICENSE'],
  gsap: ['dist/gsap.min.js', 'dist/ScrollTrigger.min.js', 'README.md'],
};

// Extract only exact allowlisted regular files, never paths supplied by an archive.
for (const [name, files] of Object.entries(libraries)) {
  const pkg = lock.packages[`node_modules/${name}`];
  const folder = resolve(cache, name);
  const marker = resolve(folder, 'integrity.txt');
  let ready = false;
  try {
    ready = (await readFile(marker, 'utf8')) === pkg.integrity;
    for (const file of files) await stat(resolve(folder, file.split('/').at(-1)));
  } catch { ready = false; }
  if (ready) continue;
  console.log(`Preparing ${name} ${pkg.version} from npm (no install scripts)`);
  const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const archive = Buffer.from(await response.arrayBuffer());
  const integrity = `sha512-${createHash('sha512').update(archive).digest('base64')}`;
  if (integrity !== pkg.integrity) throw new Error(`Integrity mismatch: ${name}`);
  const tar = gunzipSync(archive);
  const found = new Set();
  await mkdir(folder, { recursive: true });
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    const entry = header.subarray(0, 100).toString().replace(/\0.*$/, '');
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
    if (!entry) break;
    const relative = entry.replace(/^package\//, '');
    if (files.includes(relative) && (header[156] === 48 || header[156] === 0)) {
      await writeFile(resolve(folder, relative.split('/').at(-1)), tar.subarray(offset + 512, offset + 512 + size));
      found.add(relative);
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (found.size !== files.length) throw new Error(`Incomplete library: ${name}`);
  await writeFile(marker, integrity);
}

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.mjs': 'text/javascript', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.woff2': 'font/woff2', '.png': 'image/png', '.glb': 'model/gltf-binary' };
const fonts = new Set(['bricolage-800.woff2', 'fraunces-italic.woff2', 'geist.woff2']);
const json = (res, body) => { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
// Preserve the exact content DOM while keeping facts available without JavaScript.
const businessHtml = (html) => html
  .replace(/<!--business:contacts-->[\s\S]*?<!--\/business:contacts-->/, `<a class="contact-link" id="email" href="mailto:${escapeHtml(siteConfig.email)}">${escapeHtml(siteConfig.email)}</a><a class="phone" id="phone" href="tel:${escapeHtml(siteConfig.phoneHref)}">${escapeHtml(siteConfig.phone)}</a>`)
  .replace('<!--business:dive-offers-->', packages.map(pkg=>`<article><h3>${escapeHtml(pkg.name)}</h3><strong class="offer-price">od ${escapeHtml(pkg.priceFrom)}</strong><p>${escapeHtml(pkg.audience)}</p><ul>${pkg.scope.map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ul><p class="offer-exclusions">Nezahŕňa: ${escapeHtml(pkg.notIncluded)}.</p></article>`).join(''))
  .replace('<!--business:packages-->', packages.map((pkg) => `<div><h3>${escapeHtml(pkg.name)}</h3><strong><small>od </small>${escapeHtml(pkg.priceFrom)}</strong><p>${escapeHtml(pkg.audience)}</p><p>${escapeHtml(pkg.scope[0])}</p></div>`).join(''))
  .replace('<!--business:wordpress-->', escapeHtml(`${wordpressService.name} — ${wordpressService.line} Cena podľa rozsahu.`))
  .replace('<!--business:response-->', `${commercial.responseHours} h`)
  .replace('<!--business:proposal-->', `${commercial.firstProposalHours} h`)
  .replace('<!--business:people-->', escapeHtml(people.map((person) => person.name).join(' · ')));
const server = createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/config.json') { json(res, { siteConfig, commercial, packages, people, wordpressService }); return; }
    if (path === '/health.json') { json(res, { freeMB: Math.round(freemem() / 2 ** 20), totalMB: Math.round(totalmem() / 2 ** 20), serverMB: Math.round(process.memoryUsage().rss / 2 ** 20) }); return; }
    if (path === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    let base = resolve(root, 'experiments/jellyfish');
    let suffix = path === '/' ? 'index.html' : path.slice(1);
    if (path.startsWith('/assets/')) { base = resolve(root, 'public'); suffix = path.slice(8); }
    if (path.startsWith('/vendor/')) { base = cache; suffix = path.slice(8); }
    // Expose only the animated interchange asset, not Blender sources or repo files.
    if (path === '/octopus-swim.glb') { base = resolve(root, 'assets/blender/octopus'); suffix = 'codera-octopus-swim.glb'; }
    if (path.startsWith('/fonts/')) {
      suffix = path.slice(7);
      if (!fonts.has(suffix)) { res.writeHead(404); res.end(); return; }
      base = resolve(root, 'app/fonts');
    }
    const file = resolve(base, suffix);
    if (!file.startsWith(base + sep)) { res.writeHead(403); res.end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404); res.end(); return; }
    if (['index.html','dive.html'].some(name=>file===resolve(root,'experiments/jellyfish',name))) {
      const html = businessHtml(await readFile(file, 'utf8'));
      res.writeHead(200, { 'Content-Type': mime['.html'], 'Content-Length': Buffer.byteLength(html), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : html);
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain', 'Content-Length': info.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4317), '127.0.0.1', () => {
  console.log(`Codera jellyfish: http://127.0.0.1:${server.address().port}`);
  console.log(`Server RAM ${Math.round(process.memoryUsage().rss / 2 ** 20)} MB; free system RAM ${Math.round(freemem() / 2 ** 20)} MB`);
});
