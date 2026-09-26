// The exact existing H.264 frames, remuxed into 50 ms independently seekable
// fragments. Never gate the hero on downloading the complete 50 MB film.
export function createMotionStream(video, { onData, onError, onBytes }) {
  const mime = 'video/mp4; codecs="avc1.64002a"';
  const supported = window.MediaSource?.isTypeSupported(mime);
  const base = '/media/stream-v1/';
  const count = 220, step = .05;
  let source, buffer, url, running = false, stopped = false, wanted = 0;
  let direction = 1, fetching = -1, controller, fallback = !supported;
  const present = new Set();
  function has(time) {
    for (let i = 0; i < video.buffered.length; i++) {
      if (time >= video.buffered.start(i) && time + .002 < video.buffered.end(i)) return true;
    }
    return false;
  }
  async function bytes(name, signal) {
    const response = await fetch(base + name, { signal });
    if (!response.ok) throw new Error(`Video HTTP ${response.status}`);
    const data = await response.arrayBuffer();
    onBytes(data.byteLength);
    return data;
  }
  function append(data) {
    return new Promise((resolve, reject) => {
      const done = () => { cleanup(); resolve(); };
      const fail = () => { cleanup(); reject(new Error('Video segment decode failed')); };
      const cleanup = () => { buffer.removeEventListener('updateend', done); buffer.removeEventListener('error', fail); };
      buffer.addEventListener('updateend', done, { once: true });
      buffer.addEventListener('error', fail, { once: true });
      try { buffer.appendBuffer(data); } catch (error) { cleanup(); reject(error); }
    });
  }
  function priorities() {
    // Current image first, then a small runway in the direction of travel.
    // Idle at the opening downloads 0.55 seconds, never the entire movie.
    return [wanted, ...Array.from({length: 10}, (_, i) => wanted + direction * (i + 1)), wanted - direction]
      .filter(i => i >= 0 && i < count && !present.has(i));
  }
  async function pump() {
    if (running || stopped || fallback || !buffer) return;
    running = true;
    try {
      while (!stopped && priorities().length) {
        fetching = priorities()[0];
        controller = new AbortController();
        try {
          const data = await bytes(`segment-${String(fetching + 1).padStart(3, '0')}.m4s`, AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]));
          if (stopped) break;
          await append(data);
          present.add(fetching);
          onData();
        } catch (error) {
          if (controller.signal.aborted) continue;
          throw error;
        }
      }
    } catch (error) { onError(error); }
    finally { running = false; fetching = -1; }
  }
  function request(time) {
    const next = Math.max(0, Math.min(count - 1, Math.floor(time / step)));
    if (next !== wanted) direction = next > wanted ? 1 : -1;
    wanted = next;
    // Do not discard a nearly useful neighbour on every scroll event.
    // Finish the small in-flight fragment: cancelling on every wheel tick
    // can starve decoding forever on a slow connection.
    if (!fallback && present.has(wanted) && !has(time)) present.delete(wanted);
    void pump();
    if (fallback || has(time)) return time;
    // Keep showing the closest available frame while the desired fragment loads.
    // Native scrolling stays free; captions continue to follow the actual image.
    let nearest = null;
    for (let i = 0; i < video.buffered.length; i++) {
      const start = video.buffered.start(i), end = video.buffered.end(i);
      const edge = time < start ? Math.ceil(start * 60) / 60 + .0005 : Math.floor((end - .001) * 60) / 60 + .0005;
      if (nearest === null || Math.abs(edge - time) < Math.abs(nearest - time)) nearest = edge;
    }
    return nearest;
  }
  function fallbackNative() {
    stopped = true; controller?.abort(); fallback = true;
    if (url) URL.revokeObjectURL(url);
    video.src = '/media/journey-scroll-1080.mp4';
    video.preload = 'auto'; video.load();
  }
  async function start() {
    if (!supported) { fallbackNative(); return; }
    source = new MediaSource(); url = URL.createObjectURL(source);
    const opened = new Promise(resolve => source.addEventListener('sourceopen', resolve, { once: true }));
    video.src = url; video.preload = 'auto'; video.load();
    await opened;
    if (stopped) return;
    buffer = source.addSourceBuffer(mime);
    source.duration = 11;
    await append(await bytes('init.mp4', AbortSignal.timeout(12000)));
    void pump();
  }
  return {
    start, request, fallbackNative,
    get mode() { return fallback ? 'native' : 'segments'; },
    destroy() { stopped = true; controller?.abort(); if (url) URL.revokeObjectURL(url); },
  };
}
