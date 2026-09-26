/* EcoDomček — one motion engine (GSAP + ScrollTrigger) on native scroll.
 *
 * Two layers:
 *   initPage()  everything scoped to the current <main>; re-runs after a
 *               page swap, so the router never leaves dead triggers behind.
 *   router      intercepts internal links, fetches the next document and
 *               swaps <main> under a slab curtain. Without JS every page
 *               is still a complete document, so navigation degrades to a
 *               normal page load.
 *
 * Readability overrides choreography: copy enters once and holds at full
 * ink; only the house and the image parallax are scrubbed.
 */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the intro plays on every fresh arrival at the home page — a typed link,
  // a new tab, a reload — but not when coming back from a page of this site
  // (in-page route, back button, or a link from a subpage)
  var introSeen = (function () {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var type = nav ? nav.type : 'navigate';
    if (type === 'reload') return false;
    if (type === 'back_forward') return true;
    try { return !!document.referrer && new URL(document.referrer).host === location.host; } catch (e) { return false; }
  })();
  var wide = function () { return matchMedia('(min-width:821px)').matches; };
  gsap.registerPlugin(ScrollTrigger);

  var main = document.getElementById('main');
  // header scale for big screens: 1 at 1440×900 and below, proportional above
  function hz() {
    var z = Math.min(innerWidth / 1440, innerHeight / 900);
    document.documentElement.style.setProperty('--hz', Math.max(1, Math.min(2.2, z)).toFixed(3));
  }
  hz(); addEventListener('resize', hz);
  var curtain = document.getElementById('curtain');
  var peek = document.getElementById('peek');
  var peekImg = peek && peek.querySelector('img');
  var triggers = [];   // page-scoped triggers, killed before each re-init
  var tweens = [];

  function track(t) { triggers.push(t); return t; }

  // ── page-scoped setup ───────────────────────────────────────────────
  function initPage() {
    triggers.forEach(function (t) { t.kill(); });
    triggers = [];
    tweens.forEach(function (t) { t.kill(); });
    tweens = [];

    // every band plays once when it arrives
    main.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (reduce) { el.classList.add('on'); return; }
      /* A block already on screen at rest is not a reveal — it is part of the
         first frame. The 'top 84%' line left copy sitting at opacity 0 in the
         bottom sixth of the first screen (o-nas desktop, sluzby and stena on
         a phone), which CLAUDE.md #2 does not allow. Below the fold the
         choreography is unchanged. */
      if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('on'); return; }
      track(ScrollTrigger.create({
        trigger: el, start: 'top 84%', once: true,
        onEnter: function () { el.classList.add('on'); }
      }));
    });

    initHouse();
    initParallax();
    initIndex();
    initFilters();
    initWall();
    initSheet();
    initVapour();
    initForm();
    initStory();
    initStreet();
    initMarks();
    initPanels();
    ScrollTrigger.refresh();
  }

  // ── the service panels: one open at a time ───────────────────────────
  // Pointer: hover or focus opens. Touch on a wide screen: the first tap
  // opens a closed panel, the second follows its link. Phones scroll a row
  // of open cards, so every tap is a link there.
  function initPanels() {
    var ps = [].slice.call(main.querySelectorAll('[data-panel]'));
    if (!ps.length) return;
    function open(p) { ps.forEach(function (q) { q.classList.toggle('open', q === p); }); }
    var wide = matchMedia('(min-width:821px)');
    ps.forEach(function (p) {
      p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && wide.matches) open(p); });
      // keyboard focus only: a tap focuses the link first, and opening on that
      // focus made the tap's own click follow the link
      p.addEventListener('focus', function () { if (wide.matches && p.matches(':focus-visible')) open(p); });
      p.addEventListener('click', function (e) {
        if (wide.matches && !p.classList.contains('open')) { e.preventDefault(); e.stopPropagation(); open(p); }
      }, true);
    });
  }

  // ── realisation filters: hide, never reorder ──────────────────────────
  function initFilters() {
    var bar = main.querySelector('.filters');
    if (!bar) return;
    var cards = main.querySelectorAll('.card, .job');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      bar.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var f = b.dataset.f;
      cards.forEach(function (c) {
        var tags = (c.dataset.tags || '').split('|');
        c.classList.toggle('off', !!f && tags.indexOf(f) === -1);
      });
      // a year with nothing left in it disappears with its numeral
      main.querySelectorAll('.yeargroup').forEach(function (g) {
        g.classList.toggle('empty', !g.querySelector('.job:not(.off)'));
      });
      ScrollTrigger.refresh();
    });
  }

  // ── the hero: the drawing plots itself, then the house builds — on load.
  // Each layer carries its spread (data-y0) and seated (data-y1) position as
  // a percentage of its own height. Matter arrives through the linework as
  // each layer lands. Scrolling away lifts the layers apart again, roof
  // fastest, so the poster has depth on the way out.
  function initHouse() {
    var act = main.querySelector('[data-house]');
    if (!act) return;
    var poster = act.closest('.poster');
    var L = {};
    act.querySelectorAll('.lyr').forEach(function (el) { L[el.dataset.l] = el; });
    var order = ['base', 'ground', 'upper', 'roof'];
    var paths = [];
    order.forEach(function (n) {
      L[n].querySelectorAll('path').forEach(function (p) {
        var len = p._len || (p._len = p.getTotalLength());
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len, opacity: '' });
        paths.push(p);
      });
    });
    var mats = order.map(function (n) { return L[n].querySelector('.mat'); });
    var inks = order.map(function (n) { return L[n].querySelector('.ink'); });

    var film = act.querySelector('video.film');
    if (reduce) {
      if (film) { act.classList.add('still'); poster.classList.add('typeset', 'built', 'filmed'); return; }
      order.forEach(function (n) { gsap.set(L[n], { yPercent: +L[n].dataset.y1 }); });
      gsap.set(mats, { opacity: 1 }); gsap.set(paths, { opacity: 0 });
      poster.classList.add('typeset', 'built');
      return;
    }
    order.forEach(function (n) { gsap.set(L[n], { yPercent: +L[n].dataset.y0 }); });
    gsap.set(mats, { opacity: 0 }); gsap.set(inks, { opacity: 1 });

    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.in' },
      onComplete: function () { poster.classList.add('built'); } });
    function settle(names, at) {
      names.forEach(function (n) {
        var el = L[n], seat = +el.dataset.y1, dip = 320 / (el.offsetHeight || 320) * 1.1;
        tl.to(el, { yPercent: seat + dip, duration: .07, ease: 'power1.out' }, at)
          .to(el, { yPercent: seat, duration: .14, ease: 'power2.out' }, at + .07);
      });
    }
    function ignite(i, at, dur) {
      tl.to(mats[i], { opacity: 1, duration: dur * .6, ease: 'power1.inOut' }, at)
        .to(inks[i], { opacity: 0, duration: dur * .7, ease: 'power1.in' }, at + dur * .3);
    }
    // 0.0-1.05 the drawing plots between the lines of the headline; then the
    // house builds bottom to top and is seated by ~2.5. Halved from the first
    // cut (4.46), which put the whole poster behind the animation.
    tl.to(paths, { strokeDashoffset: 0, duration: .55, ease: 'power2.inOut', stagger: { amount: .5 } }, 0);
    ignite(0, .8, .35);
    ignite(1, 1.0, .4); tl.to(L.ground, { yPercent: +L.ground.dataset.y1, duration: .4 }, 1.0); settle(['base'], 1.4);
    ignite(2, 1.45, .4); tl.to(L.upper, { yPercent: +L.upper.dataset.y1, duration: .4 }, 1.45); settle(['ground', 'base'], 1.85);
    ignite(3, 1.9, .42); tl.to(L.roof, { yPercent: +L.roof.dataset.y1, duration: .42 }, 1.9); settle(['upper', 'ground', 'base'], 2.32);
    tweens.push(tl);
    houseTl = tl;

    // ── with the film: the drawing plots and the matter ignites exactly
    // where the film's first frame has the layers (their render position,
    // yPercent 0), then the film takes over and closes the house for real.
    // Blocked autoplay or a film that never arrives: the layers seat as
    // before, so the poster is never left half-built.
    if (film) {
      tl.kill();
      var small = matchMedia('(max-width:820px)').matches;
      var webm = film.canPlayType('video/webm; codecs="vp9"');
      // the size the frame is actually drawn at, in device pixels: a 2560
      // screen or a retina laptop drew the 1200 film at 1.2–1.5× (soft), the
      // one-file build's 720 film at up to 2.4×
      var px = film.getBoundingClientRect().width * (window.devicePixelRatio || 1) * (small ? 1.45 : 1.75);   // the push-in
      // phones never take the 2 MB film, whatever their pixel density
      var tier = small ? (px <= 900 ? 'narrow' : 'wide') : (px > 1400 && film.dataset.big ? 'big' : 'wide');
      var url = film.dataset.src ? (webm && film.dataset.srcWebm ? film.dataset.srcWebm : film.dataset.src)
        : film.dataset[tier] + (webm ? '.webm' : '.mp4');
      // the whole film as a Blob: a blob is seekable on any server (the
      // opening rewinds it with the scroll), and the file is fetched in full
      // anyway. A data: URI (the one-file bundle) is already seekable.
      // low priority: on a slow line the film must not outbid its own
      // first frame and layers (the hero's largest paint)
      if (/^data:/.test(url) || !window.fetch || !window.URL) film.src = url;
      else fetch(url, { priority: 'low' }).then(function (r) { return r.blob(); })
        .then(function (b) { film.src = URL.createObjectURL(b); })
        .catch(function () { film.src = url; });
      var ft = gsap.timeline({ paused: true });
      ft.to(paths, { strokeDashoffset: 0, duration: .55, ease: 'power2.inOut', stagger: { amount: .5 } }, 0);
      mats.forEach(function (m, i) { ft.to(m, { opacity: 1, duration: .4, ease: 'power1.inOut' }, .7 + i * .08); });
      ft.to(inks, { opacity: 0, duration: .4 }, .95);
      ft.to(order.map(function (k) { return L[k]; }), { yPercent: 0, duration: .45, ease: 'power2.inOut' }, .7);
      var done = false;
      var scrubbing = false, landing = null, pin = null;
      function built() {
        if (done) return; done = true; poster.classList.add('built');
        if (intro && !intro.done) {                           // mid-intro the camera is already close:
          if (act.classList.contains('filming') && !scrubbing) landIn();   // land at once, unseen
          tweens.push(gsap.delayedCall(.6, function () { finishIntro(false); }));   // a beat on the finished house
          return;
        }
        // the landing: the camera pushes in on the closed house (the film
        // ends with it low in the frame) until it fills the room beside the
        // words — see landAim()
        if (act.classList.contains('filming') && !scrubbing) {
          landAim();
          landing = gsap.to(film, { x: LAND.x, y: LAND.y, scale: LAND.s, duration: 1.3, ease: 'power2.inOut' });
          tweens.push(landing);
        }
      }
      var builtRef = built;                                   // block functions are block-scoped in strict mode
      function seat() {                                       // the old way, if the film cannot play
        act.classList.remove('filming'); poster.classList.remove('filmed');
        if (pin) { pin.kill(true); pin = null; }                // no film, nothing to open
        var st = gsap.timeline({ onComplete: built });
        ['ground', 'upper', 'roof'].forEach(function (k, i) {
          st.to(L[k], { yPercent: +L[k].dataset.y1, duration: .42, ease: 'power2.in' }, i * .42);
        });
        tweens.push(st);
      }
      ft.call(function () {
        film.playbackRate = 1.5;
        film.addEventListener('ended', built, { once: true });
        // only a film that never STARTED hands back to the layers — an ended film is paused too
        var started = false;
        film.addEventListener('playing', function () { started = true; }, { once: true });
        var guard = setTimeout(function () { if (!started) { film.pause(); seat(); } }, 6000);
        tweens.push({ kill: function () { clearTimeout(guard); } });
        act.classList.add('filming');                         // its poster is the same frame
        poster.classList.add('filmed');
        var pr = film.play();
        if (pr && pr.catch) pr.catch(function () { clearTimeout(guard); seat(); });
      }, null, 1.25);
      tweens.push(ft);
      tl = ft; houseTl = ft;
    }
    // ── the intro (client, 2026-09-25): first the house alone, full screen,
    // while it draws, builds and closes; then it glides to its place at the
    // side, smaller, and only then the words and the menu arrive. On a fresh
    // arrival only (see introSeen) — coming back from a subpage lands on the
    // finished poster. Any
    // input (wheel, touch, key, click) skips to that end state at once, so
    // the words never wait on someone who wants to read or move on.
    var intro = null;
    var seen = introSeen;
    function reveal() {
      poster.classList.add('typeset'); poster.classList.remove('intro');
      document.body.classList.remove('intro');
    }
    // Where the house is inside the film frame, as fractions of it (paper-diff
    // bounding box of assets/hero.mp4 sampled at 10 fps; shadow included).
    // Sides and ground stay put; the top falls as the levels settle.
    var BOX = { l: .20, r: .82, b: .965 };
    var TOP = [[0, .036], [.9, .041], [1.5, .071], [2.1, .123], [2.7, .206], [3.3, .335], [3.9, .445], [4.5, .489]];
    function top(t) {
      for (var i = 1; i < TOP.length; i++) {
        if (t <= TOP[i][0]) { var a = TOP[i - 1], b = TOP[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
      }
      return TOP[TOP.length - 1][1];
    }
    // the landed house: as large as the room beside the words allows (to the
    // right of the headline, above the caption; on phones the full width),
    // centred in it. A film transform { s, x, y } in px, from the layout.
    var LAND = { s: 1.3, x: 0, y: 0 }, OPEN = { s: .86, x: 0, y: 0 };
    function landAim() {
      var p = poster.getBoundingClientRect();
      var saved = act.style.transform; act.style.transform = 'none';   // the frame as laid out
      var r = act.getBoundingClientRect(); act.style.transform = saved;
      var F = { l: r.left - p.left, t: r.top - p.top, w: r.width, h: r.height };
      var fx = F.l + F.w / 2, fy = F.t + F.h / 2, T = top(9);
      var cx0 = F.l + F.w * (BOX.l + BOX.r) / 2, cy0 = F.t + F.h * (T + BOX.b) / 2;   // the built house
      var cw = F.w * (BOX.r - BOX.l), ch = F.h * (BOX.b - T);
      var pad = parseFloat(getComputedStyle(poster).paddingRight) || 20;
      // the paper may run to the edge, the house not: 1 % (1.5 % on phones,
      // where the house spans the width)
      var edge = wide() ? Math.max(12, innerWidth * .01) : Math.max(6, innerWidth * .015);
      var L0 = edge, R0 = p.width - edge, T0 = innerHeight * .12, B0 = innerHeight * .94, cx = fx;
      if (wide()) {
        var right = 0, rg = document.createRange();
        poster.querySelectorAll('.ptext h1, .ptext .sub, .ptext .ctas > *').forEach(function (el) {
          rg.selectNodeContents(el);
          [].forEach.call(rg.getClientRects(), function (q) { right = Math.max(right, q.right - p.left); });
        });
        L0 = right + Math.max(20, innerWidth * .02);
        var vz = poster.querySelector('.vz');
        if (vz) B0 = vz.getBoundingClientRect().top - p.top - 16;
        cx = (L0 + R0) / 2;
      }
      // client, 2026-09-25: 40 % larger than the old fixed ×1.3 landing —
      // as far as the room allows (a phone is 1.56 at most: its width)
      var s = Math.max(1.3, Math.min(1.3 * 1.4, (R0 - L0) / cw, (B0 - T0) / ch));
      var cy = Math.min(Math.max(fy, T0 + ch * s / 2), B0 - ch * s / 2);
      LAND = { s: s, x: cx - fx - s * (cx0 - fx), y: cy - fy - s * (cy0 - fy) };
      // opened (client, 2026-09-25): the levels as large as the closed house,
      // on the same spot, as far as the height allows — beside the words
      // the roof may rise to the menu and the base to the screen's foot
      // (the level names are tags on the levels); stacked, it stays
      // between the buttons and the list of names under it
      var T1 = top(.18), ch1 = F.h * (BOX.b - T1), cy1 = F.t + F.h * (T1 + BOX.b) / 2;
      var leg = poster.querySelector('.olegend'), tx = poster.querySelector('.ptext'), hd = document.querySelector('header');
      var U0 = T0, U1 = B0;
      if (wide()) {
        U0 = (hd ? hd.getBoundingClientRect().bottom : 0) - p.top + 8;
        U1 = innerHeight - p.top - 16;
      } else if (leg && tx) {
        U0 = tx.getBoundingClientRect().bottom - p.top + 10;
        U1 = leg.getBoundingClientRect().top - p.top - 4;
      }
      var so = Math.max(.6, Math.min(s, (U1 - U0) / ch1));
      var oy = Math.min(Math.max(fy, U0 + ch1 * so / 2), U1 - ch1 * so / 2);
      OPEN = { s: so, x: cx - fx - so * (cx0 - fx), y: oy - fy - so * (cy1 - fy) };
      act.style.setProperty('--os', so);                      // the numbers ride on the levels
      var ols = act.querySelector('.olabels');
      if (ols) gsap.set(ols, { x: OPEN.x, y: OPEN.y });
    }
    var geo = null, cam = null;
    function measure() {                                      // the untransformed frame, once per layout
      gsap.set(act, { clearProps: 'transform' });
      var a = act.getBoundingClientRect(), f = (film || act).getBoundingClientRect();
      geo = { ax: a.left + a.width / 2, ay: a.top + a.height / 2, f: f };
    }
    function aim(t) {
      // the camera: the whole house on the screen as it starts (the levels
      // apart, at their tallest), then held at that size — it pans with the
      // house as the levels settle, it does not zoom (client, 2026-09-25:
      // the house grows after the animation, not during it)
      var f = geo.f, y0 = f.top + f.height * top(t), y1 = f.top + f.height * BOX.b;
      var x0 = f.left + f.width * BOX.l, x1 = f.left + f.width * BOX.r;
      var mx = innerWidth < innerHeight ? .98 : .9;           // portrait: edge to edge
      // … and 15 % short of filling it (client: smaller at the start)
      var s = .85 * Math.min(innerWidth * mx / (x1 - x0), innerHeight * .86 / (f.height * (BOX.b - top(0))));
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      return { x: innerWidth / 2 - geo.ax - s * (cx - geo.ax), y: innerHeight / 2 - geo.ay - s * (cy - geo.ay), s: s };
    }
    function place() {                                        // jump straight to the aim (start, resize)
      if (!intro || intro.done) return;
      measure();
      var m = aim(film ? film.currentTime : 0);
      gsap.set(act, { x: m.x, y: m.y, scale: m.s, transformOrigin: '50% 50%' });
      cam = m;
    }
    function follow(time, dt) {                               // while it builds, the camera keeps it full
      if (!intro || intro.done || !cam || !film) return;
      var m = aim(film.currentTime), k = 1 - Math.exp(-(dt || 16) / 240);   // eased, frame-rate free
      cam = { x: cam.x + (m.x - cam.x) * k, y: cam.y + (m.y - cam.y) * k, s: cam.s + (m.s - cam.s) * k };
      gsap.set(act, { x: cam.x, y: cam.y, scale: cam.s });
    }
    function landIn() {
      // the landing push-in (LAND), taken in one step and cancelled by the
      // camera — the picture does not move, only its split; the glide to
      // the layout then carries the house to its landed size
      if (!geo || !film) return;
      gsap.ticker.remove(follow);                             // the camera holds still from here
      landAim();
      var f = geo.f, s = gsap.getProperty(act, 'scale'), tx = gsap.getProperty(act, 'x'), ty = gsap.getProperty(act, 'y');
      var fx = f.left + f.width / 2, fy = f.top + f.height / 2;
      var cx = f.left + f.width * (BOX.l + BOX.r) / 2, cy = f.top + f.height * (top(9) + BOX.b) / 2;
      var sx = geo.ax + s * (cx - geo.ax) + tx, sy = geo.ay + s * (cy - geo.ay) + ty;       // on screen now
      var px = fx + LAND.s * (cx - fx) + LAND.x, py = fy + LAND.s * (cy - fy) + LAND.y;   // after the push-in
      var s2 = s / LAND.s;
      gsap.set(film, { x: LAND.x, y: LAND.y, scale: LAND.s });
      gsap.set(act, { scale: s2, x: sx - geo.ax - s2 * (px - geo.ax), y: sy - geo.ay - s2 * (py - geo.ay) });
    }
    function skip(e) {                                        // any wish to move on is honoured at once
      if (e && e.type === 'scroll') {                         // a scrollbar drag counts; the browser
        if (scrollY < 4) return;                              // restoring a reload's old position does not:
        if (performance.now() - intro.t0 < 1200) { scrollTo(0, 0); return; }   // it lands in the first second
      }
      finishIntro(true);
    }
    var INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'];
    function finishIntro(fast) {
      if (!intro || intro.done) return;
      intro.done = true;
      gsap.ticker.remove(follow);
      INPUT.forEach(function (t) { removeEventListener(t, skip, true); });
      removeEventListener('resize', place);
      introSeen = true;                                       // an in-page route home lands finished
      try { history.scrollRestoration = 'auto'; } catch (e) {}   // the rest of the site remembers as usual
      tweens.push(gsap.to(act, { x: 0, y: 0, scale: 1, duration: fast ? .55 : 1.15, ease: 'power3.inOut', overwrite: true,
        onComplete: function () { intro.settled = true; gsap.set(act, { clearProps: 'transform' }); ScrollTrigger.refresh(); } }));
      tweens.push(gsap.delayedCall(fast ? .12 : .6, reveal));
    }
    if (!seen) {
      intro = { done: false, t0: performance.now() };
      // the intro is a first frame: it starts at the top, whatever the
      // browser remembers from the last visit of this tab
      try { history.scrollRestoration = 'manual'; } catch (e) {}
      if (scrollY) scrollTo(0, 0);
      poster.classList.add('intro'); document.body.classList.add('intro');
      place();
      tl.call(place, null, 0);                                // again when it starts: fonts and layout are final
      INPUT.forEach(function (t) { addEventListener(t, skip, { capture: true, passive: true }); });
      addEventListener('resize', place);
      gsap.ticker.add(follow);
      // a film that never ends: a slow line may take seconds to deliver it,
      // and without it the layers seat after 6 s (see the guard above)
      tweens.push(gsap.delayedCall(16, function () { finishIntro(false); }));
      // leaving the page mid-intro must not leave the menu hidden elsewhere
      tweens.push({ kill: function () {
        gsap.ticker.remove(follow);
        INPUT.forEach(function (t) { removeEventListener(t, skip, true); });
        removeEventListener('resize', place);
        document.body.classList.remove('intro');
      } });
    }
    function typeset() { if (!intro) poster.classList.add('typeset'); }
    if (document.body.classList.contains('ready')) { typeset(); tl.play(); }
    else { pendingPlay = tl; pendingTypeset = typeset; }

    // ── the opening: scroll pins the poster and rewinds the film — the
    // closed house lifts apart level by level, the camera eases back out,
    // and each level is named. Input maps to the picture at once (the film
    // is the one the page already loaded; a backward seek measured 17 ms
    // median, 35 ms worst); seeks never queue — only the latest wish plays.
    if (film) {
      var END = 5.04, OPEN_T = .18, want = END, seeking = false;
      film.addEventListener('seeked', function () {
        seeking = false;
        if (Math.abs(film.currentTime - want) > .015) { seeking = true; film.currentTime = want; }
      });
      function seek(t) { want = t; if (!seeking && Math.abs(film.currentTime - t) > .015) { seeking = true; film.currentTime = t; } }
      var ease = gsap.parseEase('power1.inOut');
      function relayout() {
        // a new layout, a new landing: re-aim, and re-seat a landed house at rest
        landAim();
        if (done && !scrubbing && (!landing || !landing.isActive()) && (!intro || intro.settled))
          gsap.set(film, { x: LAND.x, y: LAND.y, scale: LAND.s });
      }
      relayout();
      pin = track(ScrollTrigger.create({
        trigger: poster, start: 'top top', end: '+=110%', pin: true, anticipatePin: 1,
        onRefresh: relayout,
        onUpdate: function (self) {
          if (!act.classList.contains('filming')) return;
          var p = self.progress;
          if (p > .002 && !scrubbing) {                         // the visitor takes the camera
            scrubbing = true; film.pause(); if (landing) landing.kill(); builtRef();
          }
          if (!scrubbing) return;
          var q = ease(Math.min(1, Math.max(0, (p - .04) / .72)));
          seek(END - q * (END - OPEN_T));
          // landed → opened (see landAim): the levels keep their size
          gsap.set(film, { scale: LAND.s + (OPEN.s - LAND.s) * q, x: LAND.x + (OPEN.x - LAND.x) * q,
            y: LAND.y + (OPEN.y - LAND.y) * q });
          var open = p > .8;
          act.classList.toggle('open', open); poster.classList.toggle('opened', open);
        }
      }));
      return;
    }
    var drift = { roof: -14, upper: -8, ground: -3, base: 2 };
    order.forEach(function (n) {
      track(tweens[tweens.push(gsap.to(L[n], { y: function () { return innerHeight * drift[n] / 100; }, ease: 'none',
        scrollTrigger: {
          trigger: poster, start: 'top top', end: 'bottom top', scrub: .4, invalidateOnRefresh: true
        } })) - 1].scrollTrigger);
    });
  }
  var houseTl = null, pendingPlay = null, pendingTypeset = null;

  // ── the wall: seven slabs, one number (spread 0..1), three inputs ─────
  // Drag, scroll and arrow keys all write the same target; a lerp loop
  // renders it. Input maps to motion within a frame (lusion.md) — no
  // synthetic smooth-scroll, the page itself never gets intercepted.
  function initWall() {
    var wrap = main.querySelector('[data-wall]');
    if (!wrap) return;
    var stage = wrap.querySelector('.slabs');
    var slabs = [].slice.call(stage.querySelectorAll('.slab'));
    var tags = [].slice.call(wrap.querySelectorAll('.tag'));
    var desc = wrap.querySelector('.tagdesc');
    var meter = wrap.querySelector('.meter b');
    var n = slabs.length, open = [], cur = 0, target = 0, dragOff = 0, scrollS = 0, raf = 0;
    var pinned = false;
    function measure() {
      var W = stage.clientWidth;
      open = slabs.map(function (s) { return s.offsetLeft; });
      // closed: the slabs stack in the middle of the stage, edges peeking out by 2.2% each
      var sw = slabs[0].offsetWidth, step = W * .022, x0 = W / 2 - sw / 2 - (n - 1) * step / 2;
      slabs.forEach(function (s, i) { s._closed = x0 + i * step; });
    }
    measure();
    addEventListener('resize', measure);
    function render() {
      cur += (target - cur) * .16;
      if (Math.abs(target - cur) < .0005) cur = target;
      slabs.forEach(function (s, i) {
        var x = s._closed + (open[i] - s._closed) * cur - open[i];
        s.style.transform = 'translate3d(' + x + 'px,0,0)';
        s.style.zIndex = n - i;
      });
      var last = -1;
      tags.forEach(function (t, i) {
        var on = i === 0 ? cur >= .06 : cur >= (i + .55) / n;
        t.classList.toggle('on', on); if (on) last = i;
      });
      tags.forEach(function (t, i) { t.classList.toggle('last', i === last); });
      if (desc) desc.textContent = last >= 0 ? tags[last].querySelector('p').textContent : '';
      if (meter) meter.style.left = (cur * 100) + '%';
      raf = (cur !== target) ? requestAnimationFrame(render) : 0;
    }
    function set(v, now) {
      target = Math.max(0, Math.min(1, v));
      if (now || reduce) { cur = target; }             // reduced motion: the wall follows the hand, no glide
      if (!raf) raf = requestAnimationFrame(render);
    }
    // reduced motion: it opens fully spread (the layout) and moves only
    // under the hand or the arrow keys — never with the scroll, never by itself
    if (reduce) { scrollS = 1; target = cur = 1; render(); }

    // drag
    var px = 0, dragging = false;
    stage.addEventListener('pointerdown', function (e) {
      dragging = true; px = e.clientX; stage.classList.add('drag'); wrap.classList.add('touched');
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dragOff += (e.clientX - px) / (stage.clientWidth * .75); px = e.clientX;
      dragOff = Math.max(-scrollS, Math.min(1 - scrollS, dragOff));
      set(scrollS + dragOff);
    });
    function up() { dragging = false; stage.classList.remove('drag'); }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    // keys
    addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { dragOff += .1; set(scrollS + dragOff); wrap.classList.add('touched'); }
      if (e.key === 'ArrowLeft') { dragOff -= .1; set(scrollS + dragOff); wrap.classList.add('touched'); }
    });
    // scroll (desktop: the stage is sticky inside a 280svh track)
    if (wide() && !reduce) {
      track(ScrollTrigger.create({
        trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: function (self) {
          if (pinned) return;
          scrollS = self.progress; set(scrollS + dragOff);
          if (self.progress > .02) wrap.classList.add('touched');
        }
      }));
    }
    // the invitation: the wall breathes open once, then waits
    if (!reduce) tweens.push(gsap.to({ v: 0 }, { v: .14, duration: 1.1, delay: .9, ease: 'power2.inOut', yoyo: true, repeat: 1,
      onUpdate: function () {
        if (pinned || wrap.classList.contains('touched')) return;
        set(this.targets()[0].v);
      } }));
    window.__wall = function (v, now) { pinned = true; wrap.classList.add('touched'); set(v, now); };
  }

  // ── parallax inside the frame: the image breathes, the frame holds ───
  function initParallax() {
    if (reduce) return;
    main.querySelectorAll('[data-par] img').forEach(function (img) {
      track(tweens[tweens.push(gsap.fromTo(img, { yPercent: -3.5, scale: 1.07 }, {
        yPercent: 3.5, scale: 1.07, ease: 'none',
        scrollTrigger: {
          trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: .5
        }
      })) - 1].scrollTrigger);
    });
    // stacked project plates drift at different speeds — depth without 3D
    main.querySelectorAll('[data-drift]').forEach(function (el) {
      var amt = parseFloat(el.dataset.drift) || 6;
      track(tweens[tweens.push(gsap.fromTo(el, { yPercent: amt }, {
        yPercent: -amt, ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: .6
        }
      })) - 1].scrollTrigger);
    });
  }

  // ── the project sheet: the plate develops from the ground up ─────────
  // One shot on arrival, then it HOLDS — never scrubbed, so a reload can
  // never land on a half-built frame and every resting state is a
  // finished annotated drawing (igloo.md: the annotation carries the
  // precision). Reduced motion gets the finished state as the layout.
  function initSheet() {
    var pl = main.querySelector('[data-plate]');
    if (!pl) return;
    var cover = pl.querySelector('.cover');
    var edge = pl.querySelector('.edge');
    var lns = [].slice.call(pl.querySelectorAll('.ln'));
    var lvs = [].slice.call(pl.querySelectorAll('.lv'));
    function put(p) {
      var y = (1 - p) * 100;
      if (cover) cover.style.clipPath = 'inset(0 0 ' + (p * 100).toFixed(2) + '% 0)';
      if (edge) {
        edge.style.top = y.toFixed(2) + '%';
        edge.style.opacity = (p > .01 && p < .99) ? 1 : 0;
      }
      lns.forEach(function (l, i) {
        var on = y <= parseFloat(l.dataset.t);
        l.classList.toggle('on', on);
        if (lvs[i]) lvs[i].classList.toggle('on', on);
      });
    }
    if (reduce) { put(1); return; }
    put(0);
    track(ScrollTrigger.create({
      trigger: pl, start: 'top 78%', once: true,
      onEnter: function () {
        tweens.push(gsap.to({ p: 0 }, {
          p: 1, duration: 1.5, delay: .3, ease: 'power2.inOut',
          onUpdate: function () { put(this.targets()[0].p); },
          onComplete: function () { put(1); }
        }));
      }
    }));
    window.__sheet = put;
  }

  // ── technológia: the wall breathes ───────────────────────────────────
  // Stena dýcha — the wall in section, drawn the way a builder reads a
  // drawing (igloo.md: mono annotation as the drawing layer over one
  // atmosphere, light as the protagonist; lusion.md: one live exhibit in
  // calm paper chrome, input maps to an answer at once; activetheory.md:
  // particles as soft light with a memory, not dots). Standard drafting
  // marks: rhombus boards cut with open joints, fibre-board hatch, the
  // insulation coil, the membrane's dash-dot, timber cut with a cross,
  // break lines where the wall goes on. The vapour is qualitative, never a
  // calculation: born in the room in a slow breathing rhythm, held back at
  // the brake, carried up and away by the ventilated gap. The loop only
  // runs while the stage is on screen; reduced motion gets one settled
  // frame of the same flow.
  function initVapour() {
    var fig = main.querySelector('[data-vapour]');
    if (!fig) return;
    var cv = fig.querySelector('canvas'), ctx = cv.getContext('2d');
    var sc = document.createElement('canvas'), sx = sc.getContext('2d');   // the drawing, repainted on change
    var desc = main.querySelector('.vdesc'), base = desc ? desc.innerHTML : '';
    var btns = [].slice.call(fig.querySelectorAll('.vb'));
    var keys = [].slice.call(main.querySelectorAll('.vkey button'));
    var fr = fig.dataset.bands.split(',').map(Number);          // outside → inside, as WALL_TEXT
    var PAPER = '243,238,227', GLOW = '242,181,99';
    var TINT = ['255,212,158', PAPER, '206,224,234'];           // room · wall · the gap (warm → cool)
    var W = 0, H = 0, dpr, small, xs = [], y0, y1, hover = -1, parts = [], raf = 0, last = 0, clock = 0, due = 0;
    function ink(a) { return 'rgba(' + PAPER + ',' + Math.min(1, a).toFixed(3) + ')'; }
    function band(x) {
      for (var i = 0; i < 7; i++) if (x >= xs[i] && x < xs[i + 1]) return i;
      return x < xs[0] ? -1 : 7;                                  // -1 outside air, 7 the room
    }
    function layout() {
      var r = fig.getBoundingClientRect(), ow = W, oh = H;
      if (!r.width) return false;
      dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = sc.width = Math.round(W * dpr); cv.height = sc.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); sx.setTransform(dpr, 0, 0, dpr, 0, 0);
      small = matchMedia('(max-width:820px)').matches;
      var O = small ? .07 : .11, I = small ? .13 : .19, a = O, i, j;
      xs = [O * W];
      fr.forEach(function (f) { a += f * (1 - O - I); xs.push(a * W); });
      // callouts fly from their band like flags on poles. A flag that
      // would cover a pole to its right climbs above that flag, so no
      // pole ever crosses text (placed right to left).
      var rh = small ? 21 : 23, top = small ? 14 : 18, lv = [], ax = [];
      for (i = 6; i >= 0; i--) {
        ax[i] = (xs[i] + xs[i + 1]) / 2;
        var w = btns[i].querySelector('.vl').offsetWidth, L = 0;
        for (j = i + 1; j < 7; j++) if (ax[j] < ax[i] + w + 12) L = Math.max(L, lv[j] + 1);
        lv[i] = L;
      }
      var rows = Math.max.apply(null, lv) + 1;
      y0 = top + rows * rh + (small ? 18 : 26);
      y1 = H - (small ? 18 : 26);
      btns.forEach(function (b, k) {
        var vl = b.querySelector('.vl');
        b.style.left = xs[k] + 'px'; b.style.width = (xs[k + 1] - xs[k]) + 'px';
        b._ax = ax[k]; b._ly = top + (rows - 1 - lv[k]) * rh;
        vl.style.left = (ax[k] - xs[k]) + 'px'; vl.style.top = b._ly + 'px';
      });
      if (ow && oh) parts.forEach(function (p) {
        p.x *= W / ow; p.y *= H / oh;
        p.h.forEach(function (q) { q[0] *= W / ow; q[1] *= H / oh; });
      });
      paint();
      return true;
    }
    // ── the drawing ──────────────────────────────────────────────────────
    function layer(i) {
      var c = sx, x0 = xs[i], x1 = xs[i + 1], w = x1 - x0, hh = y1 - y0;
      var k = hover < 0 ? 1 : i === hover ? 1.9 : .5, y, n, t;
      c.save(); c.beginPath(); c.rect(x0, y0, w, hh); c.clip();
      if (i === hover) { c.fillStyle = 'rgba(' + GLOW + ',.08)'; c.fillRect(x0, y0, w, hh); }
      c.lineWidth = .75; c.strokeStyle = ink(.22 * k); c.fillStyle = ink(.05 * k);
      c.beginPath();
      if (i === 0) {                          // rhombus profile, cut: slanted boards, open joints
        var hb = Math.max(16, w * .8), s = w * .28;
        for (y = y0 - hb * 2; y < y1 + hb; y += hb + 4) {
          c.moveTo(x0 + 1.5, y + s); c.lineTo(x1 - 1.5, y); c.lineTo(x1 - 1.5, y + hb);
          c.lineTo(x0 + 1.5, y + hb + s); c.closePath();
        }
        c.fill(); c.strokeStyle = ink(.5 * k); c.stroke();
      } else if (i === 1) {                   // the ventilated gap: air, moving up
        var gx = (x0 + x1) / 2, e = Math.min(6, w * .18);
        for (n = 1; n < 4; n++) { y = y0 + hh * n / 4; c.moveTo(gx - e, y + e * .8); c.lineTo(gx, y); c.lineTo(gx + e, y + e * .8); }
        c.strokeStyle = ink(.42 * k); c.stroke();
      } else if (i === 2) {                   // wood-fibre board: fine 45° hatch
        c.fillRect(x0, y0, w, hh);
        for (n = 0; n < w + hh; n += 5) { c.moveTo(x0 + n, y0); c.lineTo(x0 + n - hh, y1); }
        c.stroke();
      } else if (i === 3) {                   // soft insulation: the serpentine, face to face
        var P = Math.max(40, Math.min(w * .5, (y1 - y0) / 3.6)), q = P * .17, xl = x0 + 3 + q, xr = x1 - 3 - q;
        y = y0 - P;
        c.moveTo(xl, y - q);
        for (; y < y1 + P; y += P) {
          c.lineTo(xr, y - q); c.arc(xr, y, q, -Math.PI / 2, Math.PI / 2, false);
          c.lineTo(xl, y + P / 2 - q); c.arc(xl, y + P / 2, q, -Math.PI / 2, Math.PI / 2, true);
        }
        c.strokeStyle = ink(.3 * k); c.stroke();
      } else if (i === 4) {                   // the vapour brake: a membrane, dash-dot
        c.setLineDash([10, 3, 2, 3]); c.lineWidth = 1.4; c.strokeStyle = ink(.8 * k);
        c.moveTo((x0 + x1) / 2, y0); c.lineTo((x0 + x1) / 2, y1); c.stroke(); c.setLineDash([]);
      } else if (i === 5) {                   // service cavity: battens cut (the cross), a conduit
        var bw = w - 5, bh = Math.min(bw * .8, 34), step = Math.max(bh * 3.2, hh / 3.4);
        for (y = y0 + step * .35; y < y1; y += step) {
          c.rect(x0 + 2.5, y, bw, bh);
          c.moveTo(x0 + 2.5, y); c.lineTo(x0 + 2.5 + bw, y + bh);
          c.moveTo(x0 + 2.5 + bw, y); c.lineTo(x0 + 2.5, y + bh);
          var cr = Math.min(5, w * .16), cy = y + step / 2 + bh / 2;
          c.moveTo(x0 + w * .38 + cr, cy); c.arc(x0 + w * .38, cy, cr, 0, 6.283);
        }
        c.strokeStyle = ink(.36 * k); c.stroke();
      } else if (i === 6) {                   // gypsum board: stipple, then the painted face
        c.fillStyle = ink(.08 * k); c.fillRect(x0, y0, w, hh);
        var seed = 7;
        c.fillStyle = ink(.34 * k);
        for (n = 0; n < w * hh / 34; n++) {
          seed = (seed * 16807) % 2147483647; var rx = seed / 2147483647;
          seed = (seed * 16807) % 2147483647; var ry = seed / 2147483647;
          c.fillRect(x0 + rx * w, y0 + ry * hh, .9, .9);
        }
      }
      c.restore();
    }
    function paint() {
      var c = sx, i;
      c.clearRect(0, 0, W, H);
      // the air on both sides: cold outside, a warm lamp-lit room
      var g = c.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, '#1a2124'); g.addColorStop(xs[0] / W, '#151a1a');
      g.addColorStop(xs[7] / W, '#18140f'); g.addColorStop(1, '#2b1e12');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      var rg = c.createRadialGradient(W, H * .62, 0, W, H * .62, Math.max(W * .3, H * .75));
      rg.addColorStop(0, 'rgba(' + GLOW + ',.24)'); rg.addColorStop(1, 'rgba(' + GLOW + ',0)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
      c.fillStyle = '#11100e'; c.fillRect(xs[0], y0, xs[7] - xs[0], y1 - y0);   // the cut has its own ground
      for (i = 0; i < 7; i++) layer(i);
      // faces: the two outer faces are cut lines, heavier
      for (i = 0; i <= 7; i++) {
        var on = hover >= 0 && (i === hover || i === hover + 1);
        c.lineWidth = i === 0 || i === 7 ? 1.4 : .9;
        c.strokeStyle = on ? 'rgba(' + GLOW + ',.9)' : ink(i === 0 || i === 7 ? .7 : .42);
        c.beginPath(); c.moveTo(xs[i], y0); c.lineTo(xs[i], y1); c.stroke();
      }
      // break lines: the wall goes on above and below
      var xm = (xs[3] + xs[4]) / 2;
      c.lineWidth = .9; c.strokeStyle = ink(.55);
      [y0, y1].forEach(function (y) {
        c.beginPath(); c.moveTo(xs[0] - 10, y); c.lineTo(xm - 7, y); c.lineTo(xm - 2.5, y - 8);
        c.lineTo(xm + 2.5, y + 8); c.lineTo(xm + 7, y); c.lineTo(xs[7] + 10, y); c.stroke();
      });
      // the poles, from each flag down into its band
      btns.forEach(function (b, k) {
        var on = k === hover, x = Math.round(b._ax) + .5, yb = y0 + (small ? 12 : 18);
        c.lineWidth = 1; c.strokeStyle = on ? 'rgba(' + GLOW + ',1)' : ink(hover < 0 ? .38 : .2);
        c.beginPath(); c.moveTo(x, b._ly + 2); c.lineTo(x, yb); c.stroke();
        c.fillStyle = on ? 'rgba(' + GLOW + ',1)' : ink(.85);
        c.beginPath(); c.arc(x, yb, on ? 3 : 2, 0, 6.283); c.fill();
      });
      // the direction, once: from the room, out
      if (!small) {
        var ay = y1 - 16, ax0 = W - 26, ax1 = xs[7] + 18;
        c.strokeStyle = ink(.4); c.lineWidth = 1; c.beginPath();
        c.moveTo(ax0, ay); c.lineTo(ax1, ay); c.moveTo(ax1 + 7, ay - 4); c.lineTo(ax1, ay); c.lineTo(ax1 + 7, ay + 4);
        c.stroke();
      }
    }
    // ── the vapour ───────────────────────────────────────────────────────
    function spawn(p) {
      p.x = W - Math.random() * (W - xs[7]) * .8;
      p.y = y0 + 10 + Math.random() * (y1 - y0 - 20);
      p.r = .8 + Math.random() * 1.2; p.a = .4 + Math.random() * .5;
      p.j = Math.random() * 6.283; p.up = 0; p.on = 1; p.h = []; p.ht = 0;
      return p;
    }
    function step(dt) {
      clock += dt;
      var Ww = xs[7] - xs[0], v = Ww * .16, gx = (xs[1] + xs[2]) / 2, gw = xs[2] - xs[1];
      due += dt * parts.length / 19 * (.55 + .45 * Math.sin(clock * .97));   // one breath ≈ 6.5 s
      for (var k = 0; k < parts.length && due >= 1; k++) if (!parts[k].on) { spawn(parts[k]); due -= 1; }
      if (due > 2) due = 2;
      parts.forEach(function (p) {
        if (!p.on) return;
        p.j += dt * 1.7;
        if (p.up || p.x < xs[2]) {                                // the gap takes it up and away
          p.up += dt;
          p.x += (gx + Math.sin(p.j) * gw * .2 - p.x) * Math.min(1, dt * 2.5);
          p.y -= dt * v * (.25 + .45 * Math.min(1, p.up / 1.5));
          if (p.y < y0 - 2) p.on = 0;
        } else {
          var b = band(p.x), f = b === 7 ? .55 : b === 3 ? .4 : b === 4 ? .045 : b === 2 ? .5 : .62;
          var d = p.x - xs[5];                                    // closing on the brake: held back
          if (d > 0 && d < 32) f = Math.min(f, .045 + .575 * d / 32);
          p.x -= dt * v * f * (.8 + .2 * Math.sin(p.j * .6));
          p.y += Math.sin(p.j) * dt * (b === 7 ? 10 : 2.5);
          p.y = Math.max(y0 + 6, Math.min(y1 - 6, p.y));
        }
        p.ht += dt;
        if (p.ht > .05) { p.ht = 0; p.h.push([p.x, p.y]); if (p.h.length > 8) p.h.shift(); }
      });
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(sc, 0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      parts.forEach(function (p) {
        if (!p.on) return;
        var tint = TINT[p.up ? 2 : p.x > xs[7] ? 0 : 1];
        var f = p.up ? Math.max(0, Math.min(1, (p.y - y0) / 50)) : 1, n = p.h.length, m;
        ctx.lineWidth = p.r * 1.4;
        for (m = 1; m < n; m++) {                                 // the trail: older is fainter
          ctx.strokeStyle = 'rgba(' + tint + ',' + (p.a * f * .32 * m / n).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p.h[m - 1][0], p.h[m - 1][1]);
          ctx.lineTo(m === n - 1 ? p.x : p.h[m][0], m === n - 1 ? p.y : p.h[m][1]); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + tint + ',' + (p.a * f).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    function loop(t) {
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      step(dt); render();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function settle() { for (var s = 0; s < 660; s++) step(1 / 30); render(); }
    if (!layout()) return;
    for (var k = 0, n = Math.round(Math.min(380, Math.max(140, (xs[7] - xs[0]) * (y1 - y0) / 1100))); k < n; k++) parts.push({ on: 0, h: [] });
    settle();
    // pointer → answer: the band lights, the others step back, the sentence changes
    function pick(i) {
      hover = i;
      btns.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      keys.forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i); });
      if (desc) desc.innerHTML = i < 0 ? base :
        '<b>' + btns[i].querySelector('.vn').textContent + '.</b> ' + btns[i].dataset.s;
      paint();
      if (!raf) render();
    }
    function toggle(i) { pick(hover === i && !matchMedia('(hover:hover)').matches ? -1 : i); }
    btns.forEach(function (b, i) {
      b.addEventListener('mouseenter', function () { pick(i); });
      b.addEventListener('focus', function () { pick(i); });
      b.addEventListener('click', function () { toggle(i); });
    });
    keys.forEach(function (b, i) { b.addEventListener('click', function () { pick(hover === i ? -1 : i); }); });
    fig.addEventListener('mouseleave', function () { pick(-1); });
    function onResize() { if (layout() && !raf) render(); }
    addEventListener('resize', onResize);
    // the flags are measured in the mono face: measure again once it is in
    if (document.fonts) document.fonts.ready.then(function () { if (fig.isConnected) onResize(); });
    // the router kills page tweens on every swap; the loop and the
    // listener must die with this page
    tweens.push({ kill: function () { stop(); removeEventListener('resize', onResize); } });
    if (reduce) return;
    track(ScrollTrigger.create({ trigger: fig, start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { if (self.isActive) start(); else stop(); } }));
  }

  // ── the enquiry: written into the visitor's own e-mail ────────────────
  function initForm() {
    var f = main.querySelector('form.inquiry');
    if (!f) return;
    var st = f.querySelector('.fstatus'), done = f.querySelector('.fdone'), err = f.querySelector('.ferr');
    var k = f.elements.kontakt, text = '';
    function val(n) { var e = f.elements[n]; return e && e.value ? String(e.value).trim() : ''; }
    function checked(n) {
      return [].filter.call(f.querySelectorAll('input[name="' + n + '"]'), function (i) { return i.checked; })
        .map(function (i) { return i.value; });
    }
    // a phone (≥ 9 digits) or an e-mail — the one thing the client needs to answer
    function okContact(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.replace(/\D/g, '').length >= 9; }
    function flag(msg) {
      err.textContent = msg; k.setAttribute('aria-invalid', msg ? 'true' : 'false');
      k.closest('label').classList.toggle('bad', !!msg);
    }
    k.addEventListener('input', function () { if (k.getAttribute('aria-invalid') === 'true' && okContact(val('kontakt'))) flag(''); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!val('kontakt')) { flag('Napíšte telefón alebo e-mail – inak sa vám nemáme ako ozvať.'); k.focus(); return; }
      if (!okContact(val('kontakt'))) { flag('Toto nevyzerá ako telefón ani e-mail.'); k.focus(); return; }
      flag('');
      var rows = [
        ['Čo staviame', checked('co').join(', ')], ['Meno', val('meno')], ['Kontakt', val('kontakt')],
        ['Miesto stavby', val('miesto')], ['Pozemok', checked('pozemok').join('')],
        ['Projekt', checked('projekt').join('')], ['Bývať od', val('kedy')]
      ].filter(function (r) { return r[1]; }).map(function (r) { return r[0] + ': ' + r[1]; });
      text = rows.join('\n') + (val('body') ? '\n\n' + val('body') : '');
      var subj = 'Dopyt z webu' + (checked('co').length ? ' – ' + checked('co').join(', ') : '') +
                 (val('meno') ? ' (' + val('meno') + ')' : '');
      location.href = 'mailto:' + f.dataset.mail + '?subject=' + encodeURIComponent(subj) +
        '&body=' + encodeURIComponent(text);
      st.hidden = true; done.hidden = false;
    });
    var copy = f.querySelector('[data-copy]'), said = f.querySelector('.fcopied');
    copy.addEventListener('click', function () {
      function ok() { said.textContent = 'Skopírované – vložte do e-mailu alebo správy.'; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
      function fallback() {
        var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); ok(); } catch (x) { said.textContent = text; }
        t.remove();
      }
    });
  }

  // ── o nás: the paragraph in the middle of the screen chooses the picture
  function initStory() {
    var st = main.querySelector('[data-story]');
    if (!st) return;
    var figs = [].slice.call(st.querySelectorAll('.sf'));
    st.querySelectorAll('.para').forEach(function (p) {
      track(ScrollTrigger.create({
        trigger: p, start: 'top 55%', end: 'bottom 45%',
        onToggle: function (self) {
          if (!self.isActive) return;
          figs.forEach(function (f) { f.classList.toggle('on', f.dataset.i === p.dataset.i); });
        }
      }));
    });
  }

  // ── úvod: the street walks sideways as you scroll (desktop) ──────────
  function initStreet() {
    var st = main.querySelector('[data-street]');
    if (!st || reduce || !wide()) return;
    var tr = st.querySelector('.strack');
    function dist() { return Math.max(0, tr.scrollWidth - innerWidth); }
    // one tween, one trigger: a ScrollTrigger instance handed to gsap.to()
    // is turned into a second trigger — two pins fighting over one element.
    // The street walks 2.5 pixels per pixel scrolled (client, 2026-09-25:
    // the home page ran 13.6 screens, 4.8 of them this street)
    var tw = gsap.to(tr, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: st, start: 'center center', end: function () { return '+=' + dist() / 2.5; },
        pin: true, scrub: .5, invalidateOnRefresh: true, anticipatePin: 1 } });
    tweens.push(tw); track(tw.scrollTrigger);
  }

  // ── the running index: which act am I in ─────────────────────────────
  function initMarks() {
    var secs = [].slice.call(main.querySelectorAll('[data-sec]'));
    secs.forEach(function (sec, i) {
      track(ScrollTrigger.create({
        trigger: sec, start: 'top 50%', end: 'bottom 50%',
        onToggle: function (self) {
          if (!self.isActive) return;
          document.body.dataset.band = sec.dataset.band || 'paper';
        }
      }));
    });
    document.body.dataset.band = main.dataset.band || 'paper';
  }

  // ── project index: the photo follows the pointer ─────────────────────
  function initIndex() {
    if (!peek || !matchMedia('(hover:hover)').matches) return;
    var px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    function loop() {
      px += (tx - px) * .16; py += (ty - py) * .16;
      // below the pointer's line, never over the word being read; above it
      // near the bottom edge, kept inside the viewport sideways
      var x = Math.max(12, Math.min(innerWidth - 262, px - 125));
      var y = py > innerHeight - 330 ? py - 306 : py + 56;
      peek.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      raf = requestAnimationFrame(loop);
    }
    main.querySelectorAll('.index a, [data-peek] a').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        if (!a.dataset.thumb) return;
        peekImg.src = a.dataset.thumb;
        peek.classList.add('on');
        if (!raf) { px = tx; py = ty; loop(); }
      });
      a.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
      a.addEventListener('mouseleave', function () {
        peek.classList.remove('on');
        cancelAnimationFrame(raf); raf = 0;
      });
    });
  }

  // ── the router: a slab curtain, then the next page ───────────────────
  // Four slabs stack up like levels, <main> is swapped underneath, they lift
  // away. Same-document feel, real documents underneath.
  var cache = {}, busy = false;

  function samePage(url) {
    return url.pathname === location.pathname;
  }

  function internal(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#' || /^(mailto|tel|https?):/i.test(href) &&
        a.origin !== location.origin) return null;
    var url;
    try { url = new URL(a.href); } catch (e) { return null; }
    if (url.origin !== location.origin) return null;
    if (!/\.html$/.test(url.pathname) && !/\/$/.test(url.pathname)) return null;
    return url;
  }

  function swap(doc, url, push) {
    introSeen = true;                                         // moving within the site: never the intro again
    var next = doc.getElementById('main');
    if (!next) { location.href = url.href; return; }
    main.replaceWith(next);
    main = next;
    document.title = doc.title;
    var d = doc.querySelector('meta[name="description"]');
    if (d) {
      var cd = document.querySelector('meta[name="description"]');
      if (cd) cd.setAttribute('content', d.getAttribute('content'));
    }
    document.body.dataset.page = main.dataset.page || '';
    document.body.dataset.band = main.dataset.band || 'paper';
    // nav marks the page you are on
    var page = url.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === page);
    });
    document.body.classList.remove('nav-open');
    var mb = document.querySelector('header .menu'); if (mb) mb.setAttribute('aria-expanded', 'false');
    if (push) history.pushState({}, '', url.href);
    window.scrollTo(0, 0);
    initPage();
    if (url.hash) {
      var t = document.querySelector(url.hash);
      if (t) t.scrollIntoView();
    }
  }

  function fetchPage(url) {
    var key = url.pathname;
    if (cache[key]) return Promise.resolve(cache[key]);
    return fetch(url.href, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (t) {
        var doc = new DOMParser().parseFromString(t, 'text/html');
        cache[key] = doc;
        return doc;
      });
  }

  function go(url, push) {
    if (busy) return;
    busy = true;
    var label = curtain.querySelector('b');
    // the target's file: from the path, or from '#p/…' in the one-file
    // build, whose path is always index.html — every curtain said "Úvod"
    var file = url.pathname.split('/').pop() || 'index.html';
    if (url.hash && /^#p\//.test(url.hash)) file = url.hash.slice(3);
    if (/^realizacia-/.test(file)) file = 'realizacie.html';       // a sheet belongs to its chapter
    var link = document.querySelector('header nav a[href="' + file + '"]');
    label.textContent = link ? link.childNodes[0].textContent.trim() : '';   // the name, not its count
    document.documentElement.classList.add('leaving');

    var pending = fetchPage(url).catch(function () { location.href = url.href; });

    if (reduce) {
      pending.then(function (doc) { if (doc) { swap(doc, url, push); done(); } });
      return;
    }
    var slabs = curtain.querySelectorAll('i');
    var tl = gsap.timeline();
    tl.set(curtain, { display: 'block' })
      .set(slabs, { transformOrigin: '50% 100%' })
      .fromTo(slabs, { scaleY: 0 }, { scaleY: 1, duration: .34, ease: 'power3.out', stagger: .06 })
      .fromTo(label, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .26, ease: 'power2.out' }, '-=.14')
      .add(function () {
        tl.pause();
        pending.then(function (doc) {
          if (!doc) return;
          swap(doc, url, push);
          tl.play();
        });
      })
      .to(label, { opacity: 0, y: -12, duration: .2, ease: 'power2.in' }, '+=.08')
      .set(slabs, { transformOrigin: '50% 0%' })
      .to(slabs, { scaleY: 0, duration: .36, ease: 'power3.inOut', stagger: { each: .06, from: 'end' } }, '-=.04')
      .set(curtain, { display: 'none' })
      .add(done);

    function done() {
      document.documentElement.classList.remove('leaving');
      busy = false;
    }
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest && e.target.closest('a');
    var url = internal(a);
    if (!url) return;
    if (samePage(url) && url.hash) return;          // anchors scroll normally
    if (samePage(url)) { e.preventDefault(); return; }
    e.preventDefault();
    go(url, true);
  });

  addEventListener('popstate', function () {
    go(new URL(location.href), false);
  });
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    gsap.set(curtain, { display: 'none' }); gsap.set(curtain.querySelectorAll('i'), { scaleY: 0 });
    document.documentElement.classList.remove('leaving');
    busy = false;
    ScrollTrigger.refresh();
  });

  // ── chrome that lives across pages ───────────────────────────────────
  var menu = document.querySelector('header .menu');
  if (menu) {
    menu.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // the panel covers the page: Escape closes it and hands focus back
    addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !document.body.classList.contains('nav-open')) return;
      document.body.classList.remove('nav-open');
      menu.setAttribute('aria-expanded', 'false'); menu.focus();
    });
  }

  var veil = document.getElementById('veil');
  function open() {
    document.body.classList.add('ready');
    if (pendingTypeset) { pendingTypeset(); pendingTypeset = null; }
    if (pendingPlay) { pendingPlay.play(); pendingPlay = null; }
    if (veil) {
      /* the router's curtain takes .9s between pages, where it hides a swap;
         on first load it hides nothing and only delays the poster */
      veil.style.transitionDuration = '.42s';
      veil.style.opacity = 0;
      setTimeout(function () { veil.remove(); }, 460);
    }
  }
  // the poster opens when its type and its own images are in — not the
  // whole page's (window load waits for every photo below the fold)
  (function () {
    var went = false;
    function go() { if (!went) { went = true; setTimeout(open, 120); } }
    var need = [].slice.call(main.querySelectorAll('#hero .mat')).map(function (i) {
      return i.complete ? 0 : new Promise(function (r) { i.addEventListener('load', r); i.addEventListener('error', r); });
    });
    if (document.fonts && document.fonts.ready) need.push(document.fonts.ready);
    if (window.Promise) Promise.all(need).then(go, go);
    setTimeout(go, 3000);
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
  })();

  initPage();
  addEventListener('load', function () { ScrollTrigger.refresh(); });

  // review hook: ?sec=N isolates one section, &p= sets the hero progress
  var m = location.search.match(/[?&]sec=([0-9]+)/);
  if (m) {
    var secs = [].slice.call(main.querySelectorAll('[data-sec]'));
    var k = Math.min(secs.length - 1, parseInt(m[1], 10));
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    var st = document.createElement('style');
    st.textContent = '*{transition:none!important;animation:none!important}' +
      '.fade{opacity:1!important;transform:none!important}' +
      '.rl>span{transform:none!important}.clipimg{clip-path:none!important}' +
      '#veil,#curtain{display:none!important}';
    document.head.appendChild(st);
    secs.forEach(function (s, i) { if (i !== k) s.style.display = 'none'; });
    var keep = secs[k];
    document.body.dataset.band = keep.dataset.band || 'paper';
    keep.querySelectorAll('[data-reveal]').forEach(function (e2) { e2.classList.add('on'); });
    keep.classList.add('on');
    var steps = keep.querySelectorAll('.step');
    var pick = Math.min(steps.length - 1,
      parseInt((location.search.match(/[?&]step=([0-9]+)/) || [0, 0])[1], 10));
    if (steps.length) {
      steps.forEach(function (s, i) { s.classList.toggle('on', i === pick); });
      var live = (steps[pick].dataset.pins || '').split(',').filter(Boolean);
      keep.querySelectorAll('.pin').forEach(function (p) {
        p.classList.toggle('on', live.indexOf(p.dataset.p) !== -1);
      });
      keep.querySelectorAll('.rail i').forEach(function (r) {
        r.classList.toggle('on', live.indexOf(r.dataset.p) !== -1);
      });
      var hs = keep.querySelector('.house');
      if (hs) hs.classList.toggle('proof', pick === steps.length - 1);
    }
    var pm = location.search.match(/[?&]p=([0-9.]+)/);
    if (houseTl) { houseTl.pause(); houseTl.progress(pm ? parseFloat(pm[1]) : 1); pendingPlay = null; pendingTypeset = null; }
    var po = keep.querySelector('.poster');
    /* the copy is never a function of the house's progress any more */
    if (po) { po.classList.add('typeset'); if (!pm || parseFloat(pm[1]) >= 1) po.classList.add('built'); }
    var wm = location.search.match(/[?&]w=([0-9.]+)/);
    if (wm && window.__wall) window.__wall(parseFloat(wm[1]), true);
    if (veil) veil.remove();
    document.body.classList.add('ready');
  }
})();
