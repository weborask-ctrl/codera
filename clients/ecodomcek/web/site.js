(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  // ── reveals: every band plays once when it arrives ──────────────────
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: function () { el.classList.add('on'); }
    });
  });

  // ── the house: four cut-out layers land on each other as you scroll ──
  // Each layer carries its own start (spread) and end (seated) position as
  // a percentage of its own height, so the choreography survives any
  // viewport. Text steps stay discrete (enter → hold → exit); only the
  // house is scrubbed.
  var act = document.querySelector('[data-house]'), houseTl = null;
  if (act) {
    var L = {};
    act.querySelectorAll('.lyr').forEach(function (el) { L[el.dataset.l] = el; });
    var order = ['ground', 'upper', 'roof'];
    Object.keys(L).forEach(function (k) { gsap.set(L[k], { yPercent: reduce ? +L[k].dataset.y1 : +L[k].dataset.y0 }); });

    if (!reduce) {
      var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.in' } });
      // a landing nudges everything already seated: the thud
      function settle(names, at) {
        names.forEach(function (n) {
          var el = L[n], seat = +el.dataset.y1, dip = 320 / el.offsetHeight * 1.1 || 1;
          tl.to(el, { yPercent: seat + dip, duration: .08, ease: 'power1.out' }, at)
            .to(el, { yPercent: seat, duration: .16, ease: 'power2.out' }, at + .08);
        });
      }
      tl.to(L.ground, { yPercent: +L.ground.dataset.y1, duration: 1.7 }, 1.3);
      settle(['base'], 3.0);
      tl.to(L.upper, { yPercent: +L.upper.dataset.y1, duration: 1.7 }, 3.4);
      settle(['ground', 'base'], 5.1);
      tl.to(L.roof, { yPercent: +L.roof.dataset.y1, duration: 1.7 }, 5.5);
      settle(['upper', 'ground', 'base'], 7.2);
      tl.to({}, { duration: 2.8 }, 7.2);                       // the hold on the finished house
      houseTl = tl;
      ScrollTrigger.create({
        trigger: act, start: 'top top', end: 'bottom bottom', scrub: .55,
        animation: tl, invalidateOnRefresh: true
      });
    }

    // pins + legend + rail follow the text step, discretely
    var pins = act.querySelectorAll('.pin'), rail = act.querySelectorAll('.rail i');
    var steps = act.querySelectorAll('.step'), cur = -1;
    function show(k) {
      if (k === cur) return;
      cur = k;
      var live = (steps[k].dataset.pins || '').split(',').filter(Boolean);
      pins.forEach(function (p) { p.classList.toggle('on', live.indexOf(p.dataset.p) !== -1); });
      rail.forEach(function (r) { r.classList.toggle('on', live.indexOf(r.dataset.p) !== -1); });
      steps.forEach(function (st) {
        st.querySelectorAll('.idxlist div').forEach(function (r) { r.classList.toggle('on', live.indexOf(r.dataset.p) !== -1); });
      });
    }
    steps.forEach(function (st, k) {
      ScrollTrigger.create({
        trigger: st, start: 'top 58%', end: 'bottom 42%',
        onEnter: function () { show(k); }, onEnterBack: function () { show(k); }
      });
    });
    show(0);
  }

  // ── parallax inside the frame: the image breathes, the frame holds ──
  if (!reduce) {
    document.querySelectorAll('[data-par] img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -3.5, scale: 1.07 }, {
        yPercent: 3.5, scale: 1.07, ease: 'none',
        scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: .5 }
      });
    });
  }

  // ── running index + band theme for the chrome ───────────────────────
  var sections = [].slice.call(document.querySelectorAll('[data-sec]'));
  var idxNum = document.getElementById('idxnum'), idxName = document.getElementById('idxname');
  sections.forEach(function (sec, i) {
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: function (self) {
        if (!self.isActive) return;
        idxNum.textContent = String(i + 1).padStart(2, '0');
        idxName.textContent = sec.dataset.sec;
        document.body.dataset.band = sec.dataset.band || 'paper';
      }
    });
  });

  // ── project index: the thumbnail follows the pointer ────────────────
  var peek = document.getElementById('peek'), peekImg = peek && peek.querySelector('img');
  if (peek && matchMedia('(hover:hover)').matches) {
    var px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    function loop() {
      px += (tx - px) * .16; py += (ty - py) * .16;
      peek.style.left = px + 'px'; peek.style.top = py + 'px';
      raf = requestAnimationFrame(loop);
    }
    document.querySelectorAll('.index a').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
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

  // ── the entrance: the house is already there when the veil lifts ────
  var veil = document.getElementById('veil');
  function open() {
    document.getElementById('hero').classList.add('on');
    if (veil) { veil.style.opacity = 0; setTimeout(function () { veil.remove(); }, 900); }
  }
  if (document.readyState === 'complete') setTimeout(open, 260);
  else addEventListener('load', function () { setTimeout(open, 260); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });

  // review hook: ?sec=N renders one section alone at the top of the page;
  // &step=M picks the text step, &p=0.7 sets the house timeline progress
  var m = location.search.match(/[?&]sec=([0-9]+)/);
  if (m) {
    var k = Math.min(sections.length - 1, parseInt(m[1], 10));
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    // headless capture does not advance CSS transitions reliably — land on
    // the finished state instead of catching the animation mid-flight
    var st = document.createElement('style');
    st.textContent = '*{transition:none!important;animation:none!important}' +
      '.fade{opacity:1!important;transform:none!important}' +
      '.rl>span{transform:none!important}' +
      '.clipimg{clip-path:none!important}' +
      '#veil{display:none!important}';
    document.head.appendChild(st);
    sections.forEach(function (s, i) { if (i !== k) s.style.display = 'none'; });
    var keep = sections[k];
    document.body.dataset.band = keep.dataset.band || 'paper';
    keep.querySelectorAll('[data-reveal]').forEach(function (e) { e.classList.add('on'); });
    keep.classList.add('on');
    var sticky = keep.querySelector('.sticky');
    if (sticky) { sticky.style.position = 'static'; sticky.style.height = 'auto'; }
    var ksteps = keep.querySelectorAll('.step');
    var pick = Math.min(ksteps.length - 1, parseInt((location.search.match(/[?&]step=([0-9]+)/) || [0, 0])[1], 10));
    ksteps.forEach(function (s, i) { if (i !== pick) s.style.display = 'none'; });
    if (ksteps[pick]) {
      var lp = (ksteps[pick].dataset.pins || '').split(',').filter(Boolean);
      keep.querySelectorAll('.pin').forEach(function (p) { p.classList.toggle('on', lp.indexOf(p.dataset.p) !== -1); });
      keep.querySelectorAll('.rail i').forEach(function (r) { r.classList.toggle('on', lp.indexOf(r.dataset.p) !== -1); });
      keep.querySelectorAll('.idxlist div').forEach(function (r) { r.classList.toggle('on', lp.indexOf(r.dataset.p) !== -1); });
    }
    var pm = location.search.match(/[?&]p=([0-9.]+)/);
    if (pm && houseTl) houseTl.progress(parseFloat(pm[1]));
    if (veil) veil.remove();
    document.getElementById('hero') && document.getElementById('hero').classList.add('on');
  }
})();
