(() => {
  // This tiny synchronous head script establishes the cover before first paint.
  // No JS, reduced motion, touch and deep links keep the ordinary static entry.
  const enabled = !matchMedia('(prefers-reduced-motion: reduce)').matches && !matchMedia('(pointer: coarse)').matches && (!location.hash || location.hash === '#top');
  let cover, progress, skip, finished = !enabled, percent = 0, watchdog, skipTimer;
  const root = document.documentElement;
  if (enabled) root.classList.add('codera-loading');
  function close() {
    if (finished) return;
    finished = true; clearTimeout(watchdog); clearTimeout(skipTimer);
    root.classList.remove('codera-loading');
    root.classList.add('codera-revealing');
    document.querySelectorAll('[data-entry-inert]').forEach(el => { el.inert = false; delete el.dataset.entryInert; });
    if (cover) { cover.setAttribute('aria-hidden', 'true'); cover.inert = true; }
    setTimeout(() => { cover?.remove(); root.classList.remove('codera-revealing'); }, 550);
  }
  function leave() { close(); window.dispatchEvent(new Event('codera:entry-skip')); }
  window.__coderaEntry = {
    active: enabled,
    progress(value) { percent = Math.min(99, Math.max(0, value)); if (progress) { progress.value = percent; progress.textContent = `${percent} %`; } },
    async ready() { await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2000))]); if(progress)progress.value=100; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); close(); },
    failed: close,
  };
  if (!enabled) return;
  // Fail open even when the main bundle is blocked or fails to initialize.
  watchdog = setTimeout(leave, 12000);
  document.addEventListener('visibilitychange', () => {
    clearTimeout(watchdog);
    if (!finished && !document.hidden) watchdog = setTimeout(leave, 12000);
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (finished) return;
    cover = document.createElement('div'); cover.id = 'entry-loader'; cover.setAttribute('role', 'status'); cover.setAttribute('aria-label', 'Pripravujeme úvod Codery');
    cover.innerHTML = '<img src="/brand/codera-wordmark-display.svg" width="1200" height="220" alt="Codera"><progress max="100" value="0" aria-label="Načítanie videa">0 %</progress><button type="button" hidden>Prejsť na web</button>';
    document.body.append(cover); progress = cover.querySelector('progress'); skip = cover.querySelector('button'); progress.value = percent;
    for (const el of document.body.children) { if (el !== cover && !el.inert) { el.inert = true; el.dataset.entryInert = ''; } }
    skip.addEventListener('click', leave);
    skipTimer = setTimeout(() => { skip.hidden = false; }, 3000);
  }, { once: true });
})();
