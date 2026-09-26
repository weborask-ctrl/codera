// Original H.264 packets. Short opening gate, concurrent whole-film prefetch.
export function createMotionStream(video, { onData, onReady, onError, onBytes, onProgress }) {
  const mime = 'video/mp4; codecs="avc1.64002a"';
  if (!window.MediaSource?.isTypeSupported(mime)) return null;
  const base = '/media/stream-v1/', count = 220, step = .05, opening = 8;
  const present = new Set(), pending = new Set(), controllers = new Set();
  let source, buffer, url, cache, queue = Promise.resolve(), stopped = false;
  let wanted = 0, direction = 1, ready = false, cachedBytes = 0;
  function has(time) {
    for (let i = 0; i < video.buffered.length; i++) {
      if (time >= video.buffered.start(i) && Math.min(10.999, time + 1 / 60 + .002) < video.buffered.end(i)) return true;
    }
    return false;
  }
  function priorities() {
    const ahead = Array.from({ length: 32 }, (_, i) => wanted + direction * i);
    const behind = Array.from({ length: 12 }, (_, i) => wanted - direction * (i + 1));
    const all = Array.from({ length: count }, (_, i) => i);
    return [...new Set([...(ready ? [] : all.slice(0, opening)), ...ahead, ...behind, ...all])]
      .filter(i => i >= 0 && i < count && !present.has(i) && !pending.has(i));
  }
  async function bytes(name) {
    const path = base + name;
    let hit; try { hit = await cache?.match(path); } catch {}
    const controller = new AbortController(); controllers.add(controller);
    try {
      const response = hit || await fetch(path, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
      if (!response.ok) throw new Error(`Video HTTP ${response.status}`);
      const data = await response.arrayBuffer();
      if (hit) cachedBytes += data.byteLength;
      onBytes(data.byteLength, cachedBytes);
      if (cache && !hit) void cache.put(path, new Response(data, { headers: { 'Content-Type': 'video/mp4' } })).catch(() => {});
      return data;
    } finally { controllers.delete(controller); }
  }
  function append(data) {
    const work = queue.then(() => new Promise((resolve, reject) => {
      if (stopped) { resolve(); return; }
      const cleanup = () => { buffer.removeEventListener('updateend', done); buffer.removeEventListener('error', fail); };
      const done = () => { cleanup(); resolve(); };
      const fail = () => { cleanup(); reject(new Error('Video segment decode failed')); };
      buffer.addEventListener('updateend', done, { once: true });
      buffer.addEventListener('error', fail, { once: true });
      try { buffer.appendBuffer(data); } catch (error) { cleanup(); reject(error); }
    }));
    queue = work.catch(() => {});
    return work;
  }
  function fail(error) {
    if (stopped) return;
    stopped = true;
    for (const controller of controllers) controller.abort();
    onError(error);
  }
  async function worker() {
    while (!stopped) {
      const index = priorities()[0];
      if (index === undefined) return;
      pending.add(index);
      try {
        let data;
        for (let attempt = 0; attempt < 2; attempt++) {
          try { data = await bytes(`segment-${String(index + 1).padStart(3, '0')}.m4s`); break; }
          catch (error) { if (stopped || attempt) throw error; }
        }
        if (stopped) return;
        await append(data); present.add(index);
        const openingCount = Array.from({ length: opening }, (_, i) => i).filter(i => present.has(i)).length;
        onProgress(openingCount / opening, present.size / count);
        if (!ready && openingCount === opening) { ready = true; onReady(); }
        onData();
      } catch (error) { fail(error); }
      finally { pending.delete(index); }
    }
  }
  return {
    async start() {
      try {
        try { cache = await caches.open('codera-motion-segments-v1'); } catch {}
        source = new MediaSource(); url = URL.createObjectURL(source);
        const opened = new Promise(resolve => source.addEventListener('sourceopen', resolve, { once: true }));
        video.src = url; video.preload = 'auto'; video.load();
        await opened;
        if (stopped) return;
        buffer = source.addSourceBuffer(mime); source.duration = 11;
        await append(await bytes('init.mp4'));
        await Promise.all(Array.from({ length: 6 }, () => worker()));
        if (!stopped && present.size === count && source.readyState === 'open') source.endOfStream();
      } catch (error) { fail(error); }
    },
    request(time) {
      const next = Math.max(0, Math.min(count - 1, Math.floor(time / step)));
      if (next !== wanted) direction = next > wanted ? 1 : -1;
      wanted = next;
      // Hold the actual last frame instead of seeking to missing data/buffer edges.
      return has(time) ? time : null;
    },
    get complete() { return present.size === count; },
    destroy() { stopped = true; for (const controller of controllers) controller.abort(); if (url) URL.revokeObjectURL(url); },
  };
}
