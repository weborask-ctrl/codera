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
    initMarks();
    ScrollTrigger.refresh();
  }

  // ── realisation filters: hide, never reorder ──────────────────────────
  function initFilters() {
    var bar = main.querySelector('.filters');
    if (!bar) return;
    var cards = main.querySelectorAll('.card');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      bar.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var f = b.dataset.f;
      cards.forEach(function (c) {
        var tags = (c.dataset.tags || '').split('|');
        c.classList.toggle('off', !!f && tags.indexOf(f) === -1);
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

    if (reduce) {
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
    /* the words do not wait for the house */
    function typeset() { poster.classList.add('typeset'); }
    if (document.body.classList.contains('ready')) { typeset(); tl.play(); }
    else { pendingPlay = tl; pendingTypeset = typeset; }

    // the way out: layers drift apart with depth as the poster scrolls off
    var drift = { roof: -14, upper: -8, ground: -3, base: 2 };
    order.forEach(function (n) {
      tweens.push(gsap.to(L[n], { y: function () { return innerHeight * drift[n] / 100; }, ease: 'none',
        scrollTrigger: track(ScrollTrigger.create({
          trigger: poster, start: 'top top', end: 'bottom top', scrub: .4, invalidateOnRefresh: true
        })) }));
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
        onUpdate: function (self) { scrollS = self.progress; set(scrollS + dragOff); if (self.progress > .02) wrap.classList.add('touched'); }
      }));
    }
    // the invitation: the wall breathes open once, then waits
    tweens.push(gsap.to({ v: 0 }, { v: .14, duration: 1.1, delay: .9, ease: 'power2.inOut', yoyo: true, repeat: 1,
      onUpdate: function () { if (!wrap.classList.contains('touched')) set(this.targets()[0].v); } }));
    window.__wall = set;
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
      peek.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
      raf = requestAnimationFrame(loop);
    }
    main.querySelectorAll('.index a').forEach(function (a) {
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
