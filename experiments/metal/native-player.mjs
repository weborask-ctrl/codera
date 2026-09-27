// Supplied-film adapter using the browser's native video compositor.
// The page selects controlled MSE; HTTP and completeBlob remain comparison paths.
// This adapter never changes video pixels, inserts a canvas, or writes a cache.
import { createNativeStream } from './native-stream.mjs';

const TIMEOUT_MS = 15000;

export class NativePlayer {
  constructor(video) {
    if (!video?.addEventListener || !('currentTime' in video)) throw new Error('Pass the existing HTML video element');
    this.video = video;
    this.onmessage = null;
    this.onerror = null;
    this._listeners = [];
    this._closed = false;
    this._failed = false;
    this._initialized = false;
    this._ready = false;
    this._paused = false;
    this._raf = 0;
    this._rvfc = 0;
    this._timeout = 0;
    this._controller = null;
    this._blobURL = '';
    this._stream = null;
    this._transportWorker = false;
    this._assignedHandle = null;
    this._transport = 'http';
    this._initialBufferSeconds = 0;
    this._streamState = {};
    this._assignedURL = '';
    this._fps = 60;
    this._frameCount = 660;
    this._target = 0;
    this._shown = -1;
    this._requested = -1;
    this._outstanding = false;
    this._waitingPresentation = false;
    this._waitingData = false;
    this._forceSeek = false;
    this._seekStarted = 0;
    this._loaded = 0;
    this._total = 0;
    this._lastStatus = -Infinity;
    this._lastProgress = -Infinity;
    this._seekPhase = 0;
    this.stats = { seeks:0, seeksCompleted:0, frames:0, native:true };
    this._visibility = () => {
      if (document.hidden) this._suspend();
      else if (!this._paused) this._resume();
    };
    document.addEventListener('visibilitychange', this._visibility);
  }

  postMessage(data) {
    if (data.type === 'close') { this.terminate(); return; }
    if (this._closed || this._failed) return;
    if (data.type === 'init') { void this._initialize(data).catch(error => this._fail(error)); return; }
    if (data.type === 'seek') {
      if (!Number.isFinite(data.time)) return;
      const next = Math.max(0, Math.min(this._frameCount - 1, Math.round(data.time * this._fps)));
      const changed = next !== this._target;
      this._target = next;
      // The controller already calls seek from its RAF. Do not add a second
      // display-frame delay before an immediately available native seek.
      if (changed && this._initialized && this.video.readyState >= 2) {
        cancelAnimationFrame(this._raf); this._raf = 0;
        this._pump();
      } else this._queue();
      this._status();
    } else if (data.type === 'pause') {
      this._paused = !!data.value;
      if (this._paused) this._suspend(); else this._resume();
      this._status(true);
    }
  }

  _emit(data) {
    if (!this._closed) this.onmessage?.({ data });
  }

  _listen(type, handler) {
    this.video.addEventListener(type, handler);
    this._listeners.push([type, handler]);
  }

  _deadline(phase) {
    clearTimeout(this._timeout);
    if (this._paused || document.hidden || this._closed || this._failed) return;
    this._timeout = setTimeout(() => this._fail(new Error(`Native video ${phase} exceeded 15 seconds`)), TIMEOUT_MS);
  }

  async _initialize(data) {
    if (this._initialized) throw new Error('Native player is already initialized');
    this._initialized = true;
    if (typeof this.video.requestVideoFrameCallback !== 'function' ||
        typeof this.video.cancelVideoFrameCallback !== 'function') {
      throw new Error('This native comparison requires requestVideoFrameCallback');
    }
    if (!data.media) throw new Error('Pass the supplied video URL');
    this._completeBlob = data.completeBlob === true;
    this._transport = data.transport === 'mse' ? 'mse' : this._completeBlob ? 'blob' : 'http';
    if (this._transport === 'mse' && this._completeBlob) throw new Error('Choose MSE or completeBlob, not both');
    this._initialBufferSeconds = this._transport === 'mse'
      ? Math.max(0, Math.min(5, Number.isFinite(data.initialBufferSeconds) ? data.initialBufferSeconds : 2)) : 0;
    this._listen('loadedmetadata', () => this._metadata());
    this._listen('loadeddata', () => { this._armFrame(); this._queue(); this._tryReady(); this._status(true); });
    this._listen('canplay', () => this._queue());
    this._listen('seeking', () => { this._outstanding = true; this._status(); });
    this._listen('seeked', () => {
      this._outstanding = false;
      if (this._seekStarted) {
        this.stats.seeksCompleted++;
        this._emit({ type:'decode', index:this._requested,
          ms:performance.now() - this._seekStarted, measurement:'native-seek-event',
          scheduler:'native-video', stats:{ ...this.stats } });
        this._seekStarted = 0;
      }
      // A newer target can start on the next RAF without waiting for the old
      // frame callback. There is no fixed 120 ms presentation gate.
      this._armFrame(); this._queue(); this._status();
    });
    this._listen('progress', () => { this._progress(); this._status(); });
    this._listen('error', () => this._fail(new Error(
      `Native video error ${this.video.error?.code || ''}: ${this.video.error?.message || 'media unavailable'}`)));
    this.video.pause();
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this._deadline('preparation');
    let source = data.media;
    if (this._transport === 'mse') {
      const options = { media:data.media, codec:data.codec || 'avc1.64002a',
        durationSeconds:data.duration ?? data.durationSeconds ?? 11,
        onProgress:progress => {
          if (this._closed || this._failed) return;
          // Preparation is an inactivity deadline. A healthy slow connection
          // may need more than 15 seconds to fill the sharp source's headroom.
          // Once ready, network progress must never renew a seek watchdog.
          if (!this._ready && progress.loaded > this._loaded) this._deadline('preparation');
          this._loaded = progress.loaded; this._total = progress.total;
          this._streamState = { ...this._streamState, ...progress };
          this._progress(progress.complete); this._tryReady();
        },
        onBuffer:buffer => {
          if (this._closed || this._failed) return;
          this._streamState = { ...this._streamState, ...buffer };
          // First rVFC often precedes the initial buffer. SourceBuffer updates
          // must release readiness without waiting for another paused frame.
          this._tryReady(); this._queue(); this._status(true);
        },
        onError:error => this._fail(error),
      };
      if (data.transportWorker === true && typeof Worker !== 'undefined' &&
          typeof MediaSource !== 'undefined' && MediaSource.canConstructInDedicatedWorker === true &&
          'srcObject' in this.video) {
        try { this._stream = this._createWorkerStream(options); this._transportWorker = true; }
        catch { this._transportWorker = false; }
        if (this._transportWorker) return;
      }
      this._stream = createNativeStream(options);
      source = this._stream.url;
    } else if (this._completeBlob) source = await this._fetchComplete(data.media);
    if (this._closed || this._failed) return;
    this._assignedURL = source;
    this._armFrame();
    // One source assignment only: direct mode leaves transport/range caching to
    // the video element, and Blob mode never performs a second network fetch.
    this.video.src = source;
    this.video.load();
  }

  _createWorkerStream(options) {
    const worker = new Worker(new URL('./native-stream-worker.mjs', import.meta.url), { type:'module' });
    let closed = false, closeTimer = 0;
    const terminate = () => { clearTimeout(closeTimer); worker.onmessage = null; worker.onerror = null; worker.terminate(); };
    worker.onmessage = ({ data }) => {
      if (data.type === 'closed') { terminate(); return; }
      if (closed || this._closed || this._failed) return;
      if (data.type === 'handle') {
        try {
          this._assignedHandle = data.handle;
          this._armFrame();
          this.video.srcObject = data.handle;
          this.video.load();
        } catch (error) { options.onError(error); }
      } else if (data.type === 'progress') options.onProgress(data);
      else if (data.type === 'buffer') options.onBuffer(data);
      else if (data.type === 'error') options.onError(new Error(data.error));
    };
    worker.onerror = event => {
      event.preventDefault?.();
      if (!closed) options.onError(new Error(event.message || 'Native stream worker failed'));
    };
    // Resolve relative media against the page, not against the module worker URL.
    try {
      worker.postMessage({ type:'init', media:new URL(options.media, document.baseURI || import.meta.url).href,
        codec:options.codec, durationSeconds:options.durationSeconds });
    } catch (error) { terminate(); throw error; }
    return { close() {
      if (closed) return;
      closed = true;
      // Allow explicit reader/SourceBuffer cleanup, with a bounded fallback if
      // the worker is already gone. Keep it alive after EOF while video uses it.
      closeTimer = setTimeout(terminate, 250);
      worker.postMessage({ type:'close' });
    } };
  }

  async _fetchComplete(url) {
    this._controller = new AbortController();
    const response = await fetch(url, { signal:this._controller.signal });
    if (!response.ok) throw new Error(`Unable to prepare native Blob (${response.status})`);
    this._total = Number(response.headers.get('content-length')) || 0;
    const chunks = [], reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); this._loaded += value.byteLength; this._progress();
    }
    this._progress(true);
    if (this._closed || this._failed) return '';
    const blob = new Blob(chunks, { type:response.headers.get('content-type') || 'video/mp4' });
    this._blobURL = URL.createObjectURL(blob);
    return this._blobURL;
  }

  _metadata() {
    if (this._closed || this._failed) return;
    if (this.video.videoWidth !== 1920 || this.video.videoHeight !== 1080) {
      this._fail(new Error(`Unexpected supplied film dimensions: ${this.video.videoWidth}×${this.video.videoHeight}`)); return;
    }
    if (!Number.isFinite(this.video.duration) || this.video.duration <= 0) {
      this._fail(new Error('Native video duration is unavailable')); return;
    }
    this._armFrame(); this._queue();
  }

  _queue() {
    if (this._raf || !this._initialized || this._closed || this._failed || this._paused || document.hidden) return;
    if (this._ready && this._target === this._shown && !this._forceSeek &&
        !this._outstanding && !this._waitingPresentation) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this._pump(); });
  }

  _pump() {
    if (this._closed || this._failed || this._paused || document.hidden || this.video.readyState < 2) return;
    if (this._transport === 'mse') {
      const start = this._target / this._fps;
      const end = Math.min(this.video.duration, (this._target + 1) / this._fps);
      const available = this._buffered().some(([a, b]) => a <= start + .001 && b >= end - .001);
      this._waitingData = !available;
      // Issuing an unbuffered native seek can keep `seeking` true for seconds
      // and block a newer reverse demand. Retain only its target until data is
      // appended; onBuffer wakes the pump. A return to available frames is fast.
      if (!available) { this._status(); return; }
    }
    if (this._outstanding || this.video.seeking) { this._armFrame(); return; }
    if (this._target === this._shown && !this._forceSeek) return;
    // Same target: wait for its actual frame. Changed target: latest demand wins
    // as soon as the native seek completes, without a presentation-delay timer.
    if (this._requested === this._target && this._waitingPresentation && !this._forceSeek) {
      this._armFrame(); return;
    }
    this._forceSeek = false;
    this._requested = this._target;
    this._waitingPresentation = true;
    this._outstanding = true;
    this._seekStarted = performance.now();
    this.stats.seeks++;
    this._deadline('seek/presentation');
    this._armFrame();
    // Seek inside the exact requested frame interval. A small interior offset
    // avoids landing on the preceding frame through timestamp rounding.
    this._seekPhase = this._seekPhase === .25 ? .5 : .25;
    const seconds = (this._target + this._seekPhase) / this._fps;
    try { this.video.currentTime = Math.min(seconds, Math.max(0, this.video.duration - .00001)); }
    catch (error) { this._outstanding = false; this._fail(error); }
    this._status();
  }

  _armFrame() {
    if (this._rvfc || this._closed || this._failed || this._paused || document.hidden || !this._initialized) return;
    if (this._ready && !this._waitingPresentation && !this._outstanding && this._target === this._shown) return;
    this._rvfc = this.video.requestVideoFrameCallback((now, metadata) => this._frame(now, metadata));
  }

  _frame(now, metadata) {
    this._rvfc = 0;
    if (this._closed || this._failed || this._paused || document.hidden) return;
    const frame = Math.max(0, Math.min(this._frameCount - 1, Math.round(metadata.mediaTime * this._fps)));
    if (frame !== this._shown) {
      this._shown = frame; this.stats.frames++;
      this._emit({ type:'frame', frame, target:this._target, exact:frame === this._target,
        mediaTime:metadata.mediaTime, presentationTime:metadata.presentationTime,
        expectedDisplayTime:metadata.expectedDisplayTime, presentedFrames:metadata.presentedFrames,
        processingDuration:metadata.processingDuration, callbackTime:now,
        scheduler:'native-video', measurement:'requestVideoFrameCallback' });
    }
    if (frame === this._requested || (this._requested < 0 && frame === this._target)) {
      this._waitingPresentation = false;
      if (this._ready) { clearTimeout(this._timeout); this._timeout = 0; }
    }
    this._tryReady();
    this._status();
    if (this._target !== this._shown || this._outstanding || this._waitingPresentation) {
      this._armFrame(); this._queue();
    }
  }

  _tryReady() {
    if (this._ready || this._closed || this._failed || this._paused || document.hidden || this._shown < 0 ||
        this.video.videoWidth !== 1920 || this.video.videoHeight !== 1080) return;
    if (this._transport === 'mse') {
      const needed = Math.min(this._initialBufferSeconds, this.video.duration);
      if (!Number.isFinite(needed) || !this._buffered().some(([start, end]) => start <= .01 && end >= needed - .001)) return;
    }
    this._ready = true;
    clearTimeout(this._timeout); this._timeout = 0;
    this._emit({ type:'ready', bytes:this._loaded, cacheHit:false,
      delivery:this._transport === 'mse' ? this._transportWorker ? 'native-mse-worker-single-fetch' : 'native-mse-single-fetch' : this._completeBlob ? 'native-complete-blob' : 'native-http',
      transportWorker:this._transportWorker,
      allGroupsReady:this._completeBlob || this._streamState.complete === true, fullyBuffered:this._fullyBuffered(),
      initialBufferSeconds:this._initialBufferSeconds,
      width:1920, height:1080, fps:this._fps,
      byteAccounting:this._transport === 'http' ? 'browser-managed' : 'exact-fetch',
      reason:this._transport === 'mse' ? 'actual-frame-and-initial-buffer' : 'first-actual-frame', stats:{ ...this.stats } });
  }

  _buffered() {
    const ranges = [];
    for (let i = 0; i < this.video.buffered.length; i++) ranges.push([this.video.buffered.start(i), this.video.buffered.end(i)]);
    return ranges;
  }

  _fullyBuffered() {
    const ranges = this._buffered();
    return ranges.length === 1 && ranges[0][0] <= .01 && ranges[0][1] >= this.video.duration - .05;
  }

  _progress(force = false) {
    const now = performance.now();
    if (!force && now - this._lastProgress < 100) return;
    this._lastProgress = now;
    // HTMLMediaElement exposes time ranges, not reliable downloaded-byte counts.
    // Direct mode must use external network measurements instead of invented bytes.
    this._emit({ type:'progress', loaded:this._loaded, total:this._total,
      byteAccounting:this._transport === 'http' ? 'browser-managed' : 'exact-fetch',
      transport:this._transport, buffered:this._buffered() });
  }

  _status(force = false) {
    const now = performance.now();
    if (!force && now - this._lastStatus < 100) return;
    this._lastStatus = now;
    this._emit({ type:'status', scheduler:'native-video', ready:this._ready,
      paused:this._paused || document.hidden, target:this._target, shown:this._shown,
      waiting:this._target !== this._shown, waitingData:this._waitingData,
      seeking:this._outstanding || this.video.seeking,
      readyState:this.video.readyState, networkState:this.video.networkState,
      buffered:this._buffered(), fullyBuffered:this._fullyBuffered(),
      byteAccounting:this._transport === 'http' ? 'browser-managed' : 'exact-fetch',
      receivedBytes:this._transport === 'http' ? null : this._loaded,
      transport:this._transport, initialBufferSeconds:this._initialBufferSeconds,
      transportWorker:this._transportWorker,
      stream:{ ...this._streamState },
      reason:this._ready ? 'first-actual-frame' : 'preparing-first-frame', stats:{ ...this.stats } });
  }

  _suspend() {
    cancelAnimationFrame(this._raf); this._raf = 0;
    if (this._rvfc) this.video.cancelVideoFrameCallback(this._rvfc);
    this._rvfc = 0;
    clearTimeout(this._timeout); this._timeout = 0;
    this.video.pause();
    // A seek may finish while callbacks are suspended. Reconcile that actual
    // picture with the latest target on resume, rather than trusting stale state.
    this._forceSeek = true;
  }

  _resume() {
    if (this._closed || this._failed || this._paused || document.hidden) return;
    this._outstanding = this.video.seeking;
    this._forceSeek = true;
    this._deadline(this._ready ? 'resume' : 'preparation');
    this._armFrame(); this._queue();
  }

  _fail(error) {
    if (this._closed || this._failed) return;
    this._failed = true;
    this._suspend(); this._controller?.abort(); this._stream?.close();
    const message = String(error);
    if (this.onmessage) this._emit({ type:'error', error:message, scheduler:'native-video' });
    else this.onerror?.({ message, error });
  }

  terminate() {
    if (this._closed) return;
    this._closed = true;
    this._suspend(); this._controller?.abort(); this._stream?.close();
    document.removeEventListener('visibilitychange', this._visibility);
    for (const [type, handler] of this._listeners) this.video.removeEventListener(type, handler);
    this._listeners.length = 0;
    if (this._assignedHandle && this.video.srcObject === this._assignedHandle) {
      this.video.srcObject = null; this.video.load();
    }
    this._assignedHandle = null;
    if (this._assignedURL && this.video.getAttribute('src') === this._assignedURL) {
      this.video.removeAttribute('src'); this.video.load();
    }
    if (this._blobURL) { URL.revokeObjectURL(this._blobURL); this._blobURL = ''; }
    this.onmessage = null; this.onerror = null;
  }
}

export function createNativePlayer(video) { return new NativePlayer(video); }
