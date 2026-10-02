(() => {
  // Reserve the scroll story before first layout, including anchored visits.
  // Reduced motion and no-JS retain the compact static entry.
  const eligible = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enabled = eligible && (!location.hash || location.hash === '#top');
  let cover, progress, skip, finished = !enabled, percent = 0, watchdog, skipTimer;
  const root = document.documentElement;
  if (eligible) root.classList.add('motion-enabled');
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
  function leave() {
    window.__coderaEntry.skipped = true;
    root.classList.remove('motion-enabled');
    document.querySelector('.journey')?.classList.remove('has-journey');
    close();
    window.dispatchEvent(new Event('codera:entry-skip'));
  }
  // An elapsed cover is not a visitor's decision to disable animation.
  function release() {
    // A missing controller must not leave seven viewports of dead poster.
    // Record failure so an unusually late module cannot expand the page again.
    if (!window.__coderaMotion) {
      window.__coderaEntry.unavailable = true;
      root.classList.remove('motion-enabled');
    }
    close();
  }
  window.__coderaEntry = {
    active: enabled,
    skipped: false,
    unavailable: false,
    progress(value) { percent = Math.min(99, Math.max(0, value)); if (progress) { progress.value = percent; progress.textContent = `${percent} %`; } },
    async ready() { await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2000))]); if(progress)progress.value=100; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); close(); },
    failed: close,
  };
  window.addEventListener('error', event => {
    if (event.target?.tagName === 'SCRIPT' && /\/main\.mjs(?:$|\?)/.test(event.target.src) && !window.__coderaMotion) {
      window.__coderaEntry.unavailable = true;
      root.classList.remove('motion-enabled');
      close();
    }
  }, true);
  if (!enabled) return;
  // The page becomes usable after four foreground seconds even on a slow link.
  watchdog = setTimeout(release, 4000);
  document.addEventListener('visibilitychange', () => {
    clearTimeout(watchdog);
    if (!finished && !document.hidden) watchdog = setTimeout(release, 4000);
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (finished) return;
    cover = document.createElement('div'); cover.id = 'entry-loader'; cover.setAttribute('role', 'status'); cover.setAttribute('aria-label', 'Pripravujeme úvod Codery');
    cover.innerHTML = '<img src="/brand/codera-wordmark-display.svg" width="1200" height="220" alt="Codera"><progress max="100" value="0" aria-label="Načítanie videa">0 %</progress><button type="button" hidden>Prejsť bez animácie</button>';
    document.body.append(cover); progress = cover.querySelector('progress'); skip = cover.querySelector('button'); progress.value = percent;
    for (const el of document.body.children) { if (el !== cover && !el.inert) { el.inert = true; el.dataset.entryInert = ''; } }
    skip.addEventListener('click', leave);
    skipTimer = setTimeout(() => { skip.hidden = false; }, 1500);
  }, { once: true });
})();
