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
  var idxNum = document.getElementById('idxnum');
  var idxName = document.getElementById('idxname');
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

  // ── the hero: drawn in ink, then built layer by layer ────────────────
  // Each layer carries its spread (data-y0) and seated (data-y1) position
  // as a percentage of its own height, so the choreography survives any
  // viewport. Matter arrives through the linework; at the end the linework
  // re-plots in moss over the built house as proof, then sinks in.
  function initHouse() {
    var act = main.querySelector('[data-house]');
    if (!act) return;
    var house = act.querySelector('.house');
    var L = {};
    act.querySelectorAll('.lyr').forEach(function (el) { L[el.dataset.l] = el; });
    var order = ['base', 'ground', 'upper', 'roof'];
    var paths = [];
    order.forEach(function (n) {
      L[n].querySelectorAll('path').forEach(function (p) {
        var len = p._len || (p._len = p.getTotalLength());
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len,
                      stroke: '', opacity: '' });
        paths.push(p);
      });
    });
    var mats = order.map(function (n) { return L[n].querySelector('.mat'); });
    var inks = order.map(function (n) { return L[n].querySelector('.ink'); });
    order.forEach(function (n) {
      gsap.set(L[n], { yPercent: reduce ? +L[n].dataset.y1 : +L[n].dataset.y0 });
    });

    var steps = act.querySelectorAll('.step');
    var pins = act.querySelectorAll('.pin');
    var rail = act.querySelectorAll('.rail i');
    var cur = -1;

    function show(k) {
      if (k === cur) return;
      cur = k;
      var live = (steps[k].dataset.pins || '').split(',').filter(Boolean);
      steps.forEach(function (st, i) { st.classList.toggle('on', i === k); });
      pins.forEach(function (p) { p.classList.toggle('on', live.indexOf(p.dataset.p) !== -1); });
      rail.forEach(function (r) { r.classList.toggle('on', live.indexOf(r.dataset.p) !== -1); });
      house.classList.toggle('proof', k === steps.length - 1);
    }

    if (reduce) {
      gsap.set(mats, { opacity: 1 });
      gsap.set(paths, { opacity: 0 });
      steps.forEach(function (st) { st.classList.add('on'); });
      pins.forEach(function (p) { p.classList.add('on'); });
      house.classList.add('proof');
      return;
    }

    gsap.set(mats, { opacity: 0 });
    gsap.set(inks, { opacity: 1 });

    // the entrance: the drawing plots itself, bottom to top, once
    tweens.push(gsap.to(paths, {
      strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut',
      stagger: { amount: 1.5 }, delay: .25
    }));

    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.in' } });
    function settle(names, at) {
      names.forEach(function (n) {
        var el = L[n], seat = +el.dataset.y1, dip = 320 / (el.offsetHeight || 320) * 1.1;
        tl.to(el, { yPercent: seat + dip, duration: .08, ease: 'power1.out' }, at)
          .to(el, { yPercent: seat, duration: .16, ease: 'power2.out' }, at + .08);
      });
    }
    function ignite(i, at, dur) {
      tl.to(mats[i], { opacity: 1, duration: dur * .6, ease: 'power1.inOut' }, at)
        .to(inks[i], { opacity: 0, duration: dur * .7, ease: 'power1.in' }, at + dur * .3);
    }
    ignite(0, .3, 1.0);
    ignite(1, 1.3, 1.7); tl.to(L.ground, { yPercent: +L.ground.dataset.y1, duration: 1.7 }, 1.3);
    settle(['base'], 3.0);
    ignite(2, 3.4, 1.7); tl.to(L.upper, { yPercent: +L.upper.dataset.y1, duration: 1.7 }, 3.4);
    settle(['ground', 'base'], 5.1);
    ignite(3, 5.5, 1.7); tl.to(L.roof, { yPercent: +L.roof.dataset.y1, duration: 1.7 }, 5.5);
    settle(['upper', 'ground', 'base'], 7.2);
    // proof: the linework re-plots in moss over the built house, then sinks in
    tl.set(paths, { strokeDashoffset: function (i, p) { return p._len; },
                    stroke: '#3f5a2a', opacity: .9 }, 7.4)
      .set(inks, { opacity: 1 }, 7.4)
      .to(paths, { strokeDashoffset: 0, duration: 1.1, ease: 'none', stagger: { amount: .5 } }, 7.45)
      .to(paths, { opacity: 0, duration: .6, ease: 'power1.in' }, 9.3)
      .to({}, { duration: .7 }, 9.3);
    tweens.push(tl);

    var cuts = [.11, .33, .54, .74];
    track(ScrollTrigger.create({
      trigger: act, start: 'top top', end: 'bottom bottom', scrub: .55,
      animation: tl, invalidateOnRefresh: true,
      onUpdate: function (self) {
        if (!wide()) return;
        var k = 0, p = self.progress;
        while (k < cuts.length && p >= cuts[k] - (k < cur ? -.02 : .02)) k++;
        show(k);
      }
    }));
    if (!wide()) {
      steps.forEach(function (st, k) {
        track(ScrollTrigger.create({
          trigger: st, start: 'top 62%', end: 'bottom 38%',
          onEnter: function () { show(k); }, onEnterBack: function () { show(k); }
        }));
      });
    }
    show(0);
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

  // ── the running index: which act am I in ─────────────────────────────
  function initMarks() {
    var secs = [].slice.call(main.querySelectorAll('[data-sec]'));
    secs.forEach(function (sec, i) {
      track(ScrollTrigger.create({
        trigger: sec, start: 'top 50%', end: 'bottom 50%',
        onToggle: function (self) {
          if (!self.isActive) return;
          idxNum.textContent = String(i + 1).padStart(2, '0');
          idxName.textContent = sec.dataset.sec;
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
    if (veil) {
      veil.style.opacity = 0;
      setTimeout(function () { veil.remove(); }, 900);
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
    var housePaths = keep.querySelectorAll('.ink path');
    housePaths.forEach(function (p) { gsap.set(p, { strokeDashoffset: 0 }); });
    if (pm && tweens.length) {
      tweens.forEach(function (t) { if (t.duration() > 5) t.progress(parseFloat(pm[1])); });
    }
    if (veil) veil.remove();
    document.body.classList.add('ready');
  }
})();
