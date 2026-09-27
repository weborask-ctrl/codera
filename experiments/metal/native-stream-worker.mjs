// Keep fetch, fMP4 byte-array allocations and append work off the UI thread.
// Video decoding/compositing still belongs to the supplied native video element.
import { createNativeStream } from './native-stream.mjs';

let stream = null;
let closed = false;
let initialized = false;
const reports = new Map();
const REPORT_MS = 100;

function report(type, data) {
  if (closed) return;
  let state = reports.get(type);
  if (!state) { state = { last:-Infinity, timer:0, data:null }; reports.set(type, state); }
  state.data = data;
  const send = () => {
    state.timer = 0;
    if (closed || !state.data) return;
    state.last = performance.now();
    self.postMessage({ type, ...state.data }); state.data = null;
  };
  const remaining = REPORT_MS - (performance.now() - state.last);
  if (data.complete || remaining <= 0) {
    clearTimeout(state.timer); send();
  } else if (!state.timer) state.timer = setTimeout(send, remaining);
}

function close() {
  if (closed) return;
  closed = true;
  for (const state of reports.values()) clearTimeout(state.timer);
  reports.clear(); stream?.close(); stream = null;
}

self.onmessage = ({ data }) => {
  if (data.type === 'close') {
    close(); self.postMessage({ type:'closed' }); self.close(); return;
  }
  if (closed || data.type !== 'init') return;
  try {
    if (initialized) throw new Error('Native stream worker is already initialized');
    initialized = true;
    stream = createNativeStream({ media:data.media, codec:data.codec,
      durationSeconds:data.durationSeconds, attachment:'handle',
      onProgress:progress => report('progress', progress),
      onBuffer:buffer => report('buffer', buffer),
      onError:error => {
        close(); self.postMessage({ type:'error', error:String(error) }); self.close();
      },
    });
    self.postMessage({ type:'handle', handle:stream.handle }, [stream.handle]);
  } catch (error) {
    close(); self.postMessage({ type:'error', error:String(error) }); self.close();
  }
};
