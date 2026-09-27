// One-fetch transport for the exact supplied-film fMP4 remux. Encoded samples
// are never transformed here. Only one complete fragment is appended at a time.
const MAX_BOX_BYTES = 16 * 1024 * 1024;

function join(parts) {
  const out = new Uint8Array(parts.reduce((size, part) => size + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.byteLength; }
  return out;
}

function ranges(buffered) {
  const result = [];
  for (let i = 0; i < buffered.length; i++) result.push([buffered.start(i), buffered.end(i)]);
  return result;
}

export function createNativeStream({ media, codec = 'avc1.64002a', durationSeconds = 11,
  attachment = 'url', onProgress = () => {}, onBuffer = () => {}, onError = () => {} }) {
  const mime = `video/mp4; codecs="${codec}"`;
  if (typeof MediaSource === 'undefined' || !MediaSource.isTypeSupported(mime)) {
    throw new Error(`Native MediaSource does not support ${mime}`);
  }
  const source = new MediaSource();
  // Dedicated workers expose a transferable handle; their MediaSource stays
  // in the worker that owns the parser and SourceBuffer append lifecycle.
  const handle = attachment === 'handle' ? source.handle : null;
  if (attachment === 'handle' && !handle) throw new Error('Worker MediaSourceHandle is unavailable');
  const url = handle ? '' : URL.createObjectURL(source);
  const controller = new AbortController();
  let buffer, reader, closed = false, loaded = 0, total = 0, done = false;
  let queuedBytes = 0, peakQueuedBytes = 0, appendedBytes = 0, fragments = 0;
  const queue = [];
  let firstOffset = 0;
  let rejectAppend = null;

  function close() {
    if (closed) return;
    closed = true;
    source.removeEventListener('sourceopen', open);
    controller.abort();
    void reader?.cancel().catch(() => {});
    rejectAppend?.(new Error('Native stream closed'));
    if (buffer?.updating && source.readyState === 'open') {
      try { buffer.abort(); } catch {}
    }
    if (url) URL.revokeObjectURL(url);
    queue.length = 0; queuedBytes = 0;
  }

  function reportBuffer(complete = false) {
    if (closed || !buffer) return;
    onBuffer({ buffered:ranges(buffer.buffered), complete, loaded, total,
      appendedBytes, fragments, queuedBytes, peakQueuedBytes, transport:'mse-single-fetch' });
  }

  async function fill(bytes) {
    while (queuedBytes < bytes && !done && !closed) {
      const result = await reader.read();
      if (result.done) { done = true; break; }
      if (!result.value.byteLength) continue;
      queue.push(result.value); queuedBytes += result.value.byteLength;
      loaded += result.value.byteLength; peakQueuedBytes = Math.max(peakQueuedBytes, queuedBytes);
      onProgress({ loaded, total, appendedBytes, fragments, queuedBytes, peakQueuedBytes,
        byteAccounting:'exact-fetch', transport:'mse-single-fetch' });
    }
    return queuedBytes >= bytes;
  }

  function peek(bytes) {
    const first = queue[0];
    if (first.byteLength - firstOffset >= bytes) return first.subarray(firstOffset, firstOffset + bytes);
    const out = new Uint8Array(bytes);
    let written = 0;
    for (let i = 0; i < queue.length && written < bytes; i++) {
      const part = queue[i].subarray(i === 0 ? firstOffset : 0);
      const count = Math.min(part.byteLength, bytes - written);
      out.set(part.subarray(0, count), written); written += count;
    }
    return out;
  }

  function take(bytes) {
    const out = new Uint8Array(bytes);
    let written = 0;
    while (written < bytes) {
      const part = queue[0];
      const count = Math.min(part.byteLength - firstOffset, bytes - written);
      out.set(part.subarray(firstOffset, firstOffset + count), written);
      firstOffset += count; written += count; queuedBytes -= count;
      if (firstOffset === part.byteLength) { queue.shift(); firstOffset = 0; }
    }
    return out;
  }

  async function nextBox() {
    if (!await fill(8)) {
      if (queuedBytes) throw new Error('Truncated fragmented MP4 box header');
      return null;
    }
    let header = peek(8);
    let length = new DataView(header.buffer, header.byteOffset, header.byteLength).getUint32(0);
    const type = String.fromCharCode(...header.subarray(4, 8));
    let headerSize = 8;
    if (length === 1) {
      if (!await fill(16)) throw new Error('Truncated extended MP4 box header');
      header = peek(16); headerSize = 16;
      const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
      length = view.getUint32(8) * 4294967296 + view.getUint32(12);
    }
    // A zero-sized mdat extends to EOF and would require full-file buffering.
    // The controlled frag_keyframe remux must use bounded complete boxes.
    if (!Number.isSafeInteger(length) || length < headerSize || length > MAX_BOX_BYTES) {
      throw new Error(`Unbounded or invalid ${type} MP4 box (${length} bytes)`);
    }
    if (!await fill(length)) throw new Error(`Truncated ${type} MP4 box`);
    return { type, bytes:take(length) };
  }

  async function append(bytes) {
    if (closed) throw new Error('Native stream closed');
    if (source.readyState !== 'open' || buffer.updating) throw new Error('MediaSource is not ready for a bounded append');
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        buffer.removeEventListener('updateend', updated);
        buffer.removeEventListener('error', errored);
        buffer.removeEventListener('abort', aborted);
        source.removeEventListener('sourceclose', ended);
        rejectAppend = null;
      };
      const updated = () => { cleanup(); appendedBytes += bytes.byteLength; resolve(); };
      const errored = () => { cleanup(); reject(new Error('MediaSource rejected the supplied fragment')); };
      const aborted = () => { cleanup(); reject(new Error('MediaSource append was aborted')); };
      const ended = () => { cleanup(); reject(new Error('MediaSource closed during append')); };
      rejectAppend = error => { cleanup(); reject(error); };
      buffer.addEventListener('updateend', updated, { once:true });
      buffer.addEventListener('error', errored, { once:true });
      buffer.addEventListener('abort', aborted, { once:true });
      source.addEventListener('sourceclose', ended, { once:true });
      try { buffer.appendBuffer(bytes); } catch (error) { cleanup(); reject(error); }
    });
    reportBuffer();
  }

  async function run() {
    buffer = source.addSourceBuffer(mime);
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) source.duration = durationSeconds;
    const response = await fetch(media, { signal:controller.signal, priority:'high' });
    if (!response.ok) throw new Error(`Unable to fetch supplied fMP4 (${response.status})`);
    total = Number(response.headers.get('content-length')) || 0;
    reader = response.body.getReader();
    const initialization = [];
    let initialized = false, fragment = [], hasMoof = false;
    while (!closed) {
      const box = await nextBox();
      if (!box) break;
      if (!initialized) {
        if (box.type === 'ftyp' || box.type === 'free') initialization.push(box.bytes);
        else if (box.type === 'moov') {
          initialization.push(box.bytes);
          await append(join(initialization)); initialization.length = 0; initialized = true;
          if (source.readyState === 'open' && Number.isFinite(durationSeconds) && durationSeconds > 0 && source.duration !== durationSeconds) {
            source.duration = durationSeconds;
          }
        } else throw new Error(`Expected fMP4 initialization, received ${box.type}`);
      } else if (box.type === 'styp') {
        if (hasMoof) throw new Error('Unexpected styp inside a media fragment');
        fragment.push(box.bytes);
      } else if (box.type === 'moof') {
        if (hasMoof) throw new Error('Missing mdat between media fragments');
        fragment.push(box.bytes); hasMoof = true;
      } else if (box.type === 'mdat') {
        if (!hasMoof) throw new Error('Media mdat has no preceding moof');
        fragment.push(box.bytes);
        // Await updateend before reading/appending another fragment. There is
        // no unbounded append queue or second full-file JavaScript cache.
        await append(join(fragment)); fragments++; fragment = []; hasMoof = false;
      } else if (!['free', 'skip', 'sidx', 'mfra'].includes(box.type)) {
        throw new Error(`Unsupported top-level fMP4 box ${box.type}`);
      }
    }
    if (closed) return;
    if (!initialized || hasMoof || fragment.length) throw new Error('Incomplete fragmented MP4 stream');
    if (source.readyState === 'open') source.endOfStream();
    reportBuffer(true);
    onProgress({ loaded, total, appendedBytes, fragments, complete:true,
      byteAccounting:'exact-fetch', transport:'mse-single-fetch', queuedBytes, peakQueuedBytes });
  }

  function open() {
    source.removeEventListener('sourceopen', open);
    void run().catch(error => {
      if (closed) return;
      close(); onError(error);
    });
  }
  source.addEventListener('sourceopen', open, { once:true });
  return { url, handle, close, get buffered() { return buffer ? ranges(buffer.buffered) : []; } };
}
