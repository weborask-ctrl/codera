/* EcoDomček — one motion engine (GSAP + ScrollTrigger) on native scroll.
 *
 * Two layers:
 *   initPage()  everything scoped to the current <main>; re-runs after a
 *               page swap, so the router never leaves dead triggers behind.
 *   router      intercepts internal links, fetches the next document and
 *               swaps <main> under a paper curtain. Without JS every page
 *               is still a complete document, so navigation degrades to a
 *               normal page load.
 *
 * Readability overrides choreography: copy enters once and holds at full
 * ink; only the house and the image parallax are scrubbed.
 */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = function () { return matchMedia('(min-width:821px)').matches; };
  gsap.registerPlugin(ScrollTrigger);

  var main = document.getElementById('main');
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
    initMarks();
    ScrollTrigger.refresh();
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

  // ── the hero: a 5 s film of the house assembling, played once on load
  // (renders/fal, src/fal_hero.py). The film is media, not a second motion
  // engine: GSAP only moves its box on the way out. Reduced motion never
  // loads it; the CSS shows the built house as a still instead.
  function initHouse() {
    var act = main.querySelector('[data-house]');
    if (!act) return;
    var poster = act.closest('.poster');
    var film = act.querySelector('video');
    function typeset() { poster.classList.add('typeset'); }
    if (reduce || !film) { poster.classList.add('typeset', 'built'); return; }

    film.preload = 'auto';
    film.addEventListener('ended', function () { poster.classList.add('built'); });
    // houseTl keeps the timeline's surface, so ?p= captures and page swaps
    // treat the film like the old tween: play, pause, jump to a fraction
    var ctl = {
      play: function () { var r = film.play(); if (r && r.catch) r.catch(function () {}); },
      pause: function () { film.pause(); },
      progress: function (f) {
        function seek() { film.currentTime = Math.min(film.duration - .01, f * film.duration); }
        if (film.readyState >= 1) return seek();
        film.addEventListener('loadedmetadata', seek, { once: true });
        if (film.networkState === film.NETWORK_EMPTY) film.load();
      },
      kill: function () { film.pause(); }
    };
    tweens.push(ctl);
    houseTl = ctl;
    /* the words do not wait for the house */
    if (document.body.classList.contains('ready')) { typeset(); ctl.play(); }
    else { pendingPlay = ctl; pendingTypeset = typeset; }

    // the way out: the house lifts a little as the poster scrolls off
    tweens.push(gsap.to(act, { y: function () { return -innerHeight * .06; }, ease: 'none',
      scrollTrigger: track(ScrollTrigger.create({
        trigger: poster, start: 'top top', end: 'bottom top', scrub: .4, invalidateOnRefresh: true
      })) }));
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
      if (now) { cur = target; }
      if (!raf) raf = requestAnimationFrame(render);
    }
    if (reduce) { target = cur = 1; render(); return; }

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
    if (wide()) {
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
    tweens.push(gsap.to({ v: 0 }, { v: .14, duration: 1.1, delay: .9, ease: 'power2.inOut', yoyo: true, repeat: 1,
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
      tweens.push(gsap.fromTo(img, { yPercent: -3.5, scale: 1.07 }, {
        yPercent: 3.5, scale: 1.07, ease: 'none',
        scrollTrigger: track(ScrollTrigger.create({
          trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: .5
        }))
      }));
    });
    // stacked project plates drift at different speeds — depth without 3D
    main.querySelectorAll('[data-drift]').forEach(function (el) {
      var amt = parseFloat(el.dataset.drift) || 6;
      tweens.push(gsap.fromTo(el, { yPercent: amt }, {
        yPercent: -amt, ease: 'none',
        scrollTrigger: track(ScrollTrigger.create({
          trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: .6
        }))
      }));
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
  // A section through the seven layers with vapour moving from the room
  // out. Qualitative, never a calculation: the brake slows it, the
  // ventilated gap carries it away along the wall. The loop only runs
  // while the stage is on screen (ScrollTrigger decides when), and the
  // pointer maps to an answer at once — hover or tap a layer, read it
  // (lusion.md). Reduced motion: one settled frame, drawn once.
  function initVapour() {
    var fig = main.querySelector('[data-vapour]');
    if (!fig) return;
    var cv = fig.querySelector('canvas'), ctx = cv.getContext('2d');
    var desc = main.querySelector('.vdesc'), base = desc ? desc.innerHTML : '';
    var btns = [].slice.call(fig.querySelectorAll('.vb'));
    var fr = fig.dataset.bands.split(',').map(Number);          // outside → inside, as WALL_TEXT
    // through-wall position u: 0 = outside edge of the stage, 1 = room edge.
    var W, H, dpr, vert, O, I, edges = [], hover = -1, parts = [], raf = 0, last = 0;
    var sp = .085;                                                // wall widths per second in open air
    // speed factor per band, outside → inside (obklad … sadrokartón)
    var SPEED = [.5, 0, .55, .42, .1, .7, .7];
    var FILL = ['#4a3322', '#0e0d0c', '#3b2b1d', '#2d2820', '#1c1b18', '#221f1b', '#4b4740'];
    function layout() {
      var r = fig.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vert = matchMedia('(max-width:820px)').matches;
      O = vert ? .12 : .11; I = vert ? .16 : .19;
      edges = [O]; var a = O;
      fr.forEach(function (f) { a += f * (1 - O - I); edges.push(a); });
    }
    function band(u) {
      for (var i = 0; i < fr.length; i++) if (u >= edges[i] && u < edges[i + 1]) return i;
      return u < O ? -1 : 7;                                      // -1 outside air, 7 room
    }
    // map (u through the wall, v along it) to the screen
    function X(u, v) { return vert ? v * W : u * W; }
    function Y(u, v) { return vert ? u * H : v * H; }
    function rect(u0, u1, v0, v1, fill) {
      ctx.fillStyle = fill;
      if (vert) ctx.fillRect(v0 * W, u0 * H, (v1 - v0) * W, (u1 - u0) * H);
      else ctx.fillRect(u0 * W, v0 * H, (u1 - u0) * W, (v1 - v0) * H);
    }
    function line(u0, v0, u1, v1) {
      ctx.beginPath(); ctx.moveTo(X(u0, v0), Y(u0, v0)); ctx.lineTo(X(u1, v1), Y(u1, v1)); ctx.stroke();
    }
    function spawn(p, anywhere) {
      p.u = anywhere ? O * .2 + Math.random() * (1 - O * .2) : 1 - Math.random() * I * .9;
      p.v = .06 + Math.random() * .88;
      p.r = .8 + Math.random() * 1.4;
      p.a = .45 + Math.random() * .5;
      p.j = Math.random() * 6.28;
      return p;
    }
    function step(dt) {
      parts.forEach(function (p) {
        var b = band(p.u);
        p.j += dt * 2;
        if (b === 1) {                                            // the ventilated gap: carried along the wall
          p.v -= dt * .2; p.u -= dt * sp * .05; p.s = -1;
          if (p.v < .01) spawn(p);
          return;
        }
        var f = b === 7 ? .45 : b === -1 ? 1.3 : SPEED[b];
        p.s = sp * f * (.75 + .25 * Math.sin(p.j * .7));
        p.u -= dt * p.s;
        p.v += Math.sin(p.j) * dt * (b === 7 ? .05 : .008);
        if (b === 7) p.u += Math.cos(p.j * 1.3) * dt * .012;
        if (p.u > 1) p.u = 1;
        if (p.u < 0) spawn(p);
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      // outside: cold; the room: warm, lamp-lit (the season story in light)
      var g = vert ? ctx.createLinearGradient(0, 0, 0, H) : ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, '#111615'); g.addColorStop(O, '#171b19');
      g.addColorStop(1 - I, '#241b13'); g.addColorStop(1, '#33241a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var rg = ctx.createRadialGradient(X(1, .55), Y(1, .55), 0, X(1, .55), Y(1, .55), Math.max(W, H) * .32);
      rg.addColorStop(0, 'rgba(242,181,99,.20)'); rg.addColorStop(1, 'rgba(242,181,99,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      // the bands, outside → inside
      for (var i = 0; i < 7; i++) {
        var u0 = edges[i], u1 = edges[i + 1];
        rect(u0, u1, 0, 1, FILL[i]);
        ctx.strokeStyle = 'rgba(243,238,227,.07)'; ctx.lineWidth = 1;
        var k, n;
        if (i === 0) for (k = 1; k < 5; k++) line(u0 + (u1 - u0) * k / 5, 0, u0 + (u1 - u0) * k / 5, 1);
        if (i === 1 || i === 5) {                                 // battens at intervals along the wall
          for (k = 0; k < 7; k++) rect(u0 + (u1 - u0) * .22, u1 - (u1 - u0) * .22, k / 7 + .04, k / 7 + .085, '#3a2c20');
        }
        if (i === 2) { ctx.strokeStyle = 'rgba(243,238,227,.05)'; for (k = 0; k < 40; k++) line(u0, k / 40, u1, k / 40 + .01); }
        if (i === 3) {                                            // studs across the frame, insulation between
          ctx.strokeStyle = 'rgba(243,238,227,.06)';
          for (k = 0; k < 26; k++) { var vv = k / 26; line(u0, vv, u1, vv + .02); }
          for (k = 0; k < 3; k++) rect(u0, u1, k / 3 + .12, k / 3 + .165, '#5a4028');
        }
        if (i === 4) {                                            // the brake: a membrane, dashed
          ctx.strokeStyle = 'rgba(214,206,190,.75)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
          line((u0 + u1) / 2, 0, (u0 + u1) / 2, 1); ctx.setLineDash([]); ctx.lineWidth = 1;
        }
        if (i === 5) {                                            // services in the cavity
          ctx.strokeStyle = 'rgba(201,118,42,.55)'; ctx.beginPath();
          for (k = 0; k <= 40; k++) { var t = k / 40, uu = u0 + (u1 - u0) * (.5 + Math.sin(t * 9) * .18);
            if (k) ctx.lineTo(X(uu, t), Y(uu, t)); else ctx.moveTo(X(uu, t), Y(uu, t)); }
          ctx.stroke();
        }
        if (i === 6) { ctx.strokeStyle = 'rgba(243,238,227,.35)'; line(u1 - .002, 0, u1 - .002, 1); }
        if (i === hover) rect(u0, u1, 0, 1, 'rgba(242,181,99,.13)');
        ctx.strokeStyle = 'rgba(243,238,227,.14)'; line(u0, 0, u0, 1);
      }
      ctx.strokeStyle = 'rgba(243,238,227,.14)'; line(edges[7], 0, edges[7], 1);
      // vapour
      ctx.strokeStyle = ctx.fillStyle = '#f3eee3'; ctx.lineCap = 'round';
      parts.forEach(function (p) {
        var fade = p.u < O ? Math.max(0, p.u / O) : 1, x = X(p.u, p.v), y = Y(p.u, p.v);
        ctx.globalAlpha = p.a * fade;
        if (p.s === -1) {                                         // rising in the gap
          ctx.lineWidth = p.r * 1.2; ctx.beginPath(); ctx.moveTo(x, y);
          ctx.lineTo(X(p.u, p.v + .035), Y(p.u, p.v + .035)); ctx.stroke();
        } else if (p.s > sp * .3) {                               // moving freely: a streak
          var du = Math.min(.02, p.s * .2);
          ctx.globalAlpha = p.a * fade * .72;
          ctx.lineWidth = p.r * 1.25; ctx.beginPath(); ctx.moveTo(x, y);
          ctx.lineTo(X(p.u + du, p.v), Y(p.u + du, p.v)); ctx.stroke();
        } else {                                                  // held by the wall: a dot
          ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill();
        }
      });
      ctx.globalAlpha = 1; ctx.lineWidth = 1;
    }
    function loop(t) {
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      step(dt); draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function settle() { for (var s = 0; s < 900; s++) step(1 / 30); draw(); }
    function populate() {
      var n = vert ? 150 : 270;
      parts = []; for (var k = 0; k < n; k++) parts.push(spawn({}, true));
    }
    layout(); populate(); settle();
    // pointer → answer
    function pick(i) {
      hover = i;
      btns.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      if (desc) desc.innerHTML = i < 0 ? base :
        '<b>' + btns[i].querySelector('span').textContent + '.</b> ' + btns[i].dataset.s;
      if (!raf) draw();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('mouseenter', function () { pick(i); });
      b.addEventListener('focus', function () { pick(i); });
      b.addEventListener('click', function () { pick(hover === i && !matchMedia('(hover:hover)').matches ? -1 : i); });
    });
    fig.addEventListener('mouseleave', function () { pick(-1); });
    function onResize() { layout(); if (!raf) draw(); }
    addEventListener('resize', onResize);
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
    var st = f.querySelector('.fstatus');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return (f.elements[n].value || '').trim(); };
      if (!v('body') && !v('kontakt')) {
        st.textContent = 'Napíšte aspoň, čo staviate, alebo kontakt — ozveme sa.';
        f.elements.body.focus();
        return;
      }
      var body = (v('body') || '—') + '\n\n' + (v('meno') ? 'Meno: ' + v('meno') + '\n' : '') +
                 (v('kontakt') ? 'Kontakt: ' + v('kontakt') + '\n' : '');
      location.href = 'mailto:' + f.dataset.mail + '?subject=' +
        encodeURIComponent('Dopyt z webu' + (v('meno') ? ' — ' + v('meno') : '')) +
        '&body=' + encodeURIComponent(body);
      st.textContent = 'Otvára sa váš e-mail s hotovým dopytom. Ak sa nič neotvorilo, napíšte na ' +
        f.dataset.mail + ' alebo zavolajte.';
    });
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

  // ── the router: a paper curtain, then the next page ──────────────────
  // The curtain wipes up, <main> is swapped underneath, the curtain wipes
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
    var link = document.querySelector('header nav a[href="' + (url.pathname.split('/').pop() || 'index.html') + '"]');
    label.textContent = link ? link.textContent : '';
    document.documentElement.classList.add('leaving');

    var pending = fetchPage(url).catch(function () { location.href = url.href; });

    if (reduce) {
      pending.then(function (doc) { if (doc) { swap(doc, url, push); done(); } });
      return;
    }
    var tl = gsap.timeline();
    tl.set(curtain, { display: 'block' })
      .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: .46, ease: 'power3.inOut' })
      .fromTo(label, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .22, ease: 'power2.out' }, '-=.12')
      .add(function () {
        tl.pause();
        pending.then(function (doc) {
          if (!doc) return;
          swap(doc, url, push);
          tl.play();
        });
      })
      .to(label, { opacity: 0, duration: .18, ease: 'power2.in' }, '+=.05')
      .to(curtain, { yPercent: -100, duration: .5, ease: 'power3.inOut' }, '-=.1')
      .set(curtain, { display: 'none', yPercent: 100 })
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
    gsap.set(curtain, { display: 'none', yPercent: 100 });
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
  if (document.readyState === 'complete') setTimeout(open, 200);
  else addEventListener('load', function () { setTimeout(open, 200); });

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
