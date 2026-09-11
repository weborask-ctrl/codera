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

  // ── the sticky stage: one act, several held shots ───────────────────
  document.querySelectorAll('[data-stage]').forEach(function (act) {
    var shots = act.querySelectorAll('[data-shot]');
    var pins = act.querySelectorAll('.pin');
    var rows = act.querySelectorAll('.idxlist div');
    var steps = act.querySelectorAll('.step');
    var cur = -1;

    function show(k) {
      if (k === cur) return;
      cur = k;
      var st = steps[k], want = st.dataset.shot;
      var live = (st.dataset.pins || '').split(',').filter(Boolean);
      shots.forEach(function (s) {
        var on = s.dataset.shot === want;
        gsap.to(s, { opacity: on ? 1 : 0, duration: reduce ? 0 : .75, ease: 'power2.inOut' });
        s.style.zIndex = on ? 2 : 1;
      });
      pins.forEach(function (p) { p.classList.toggle('on', live.indexOf(p.dataset.p) !== -1); });
      rows.forEach(function (r) { r.classList.toggle('on', live.indexOf(r.dataset.p) !== -1); });
    }

    steps.forEach(function (st, k) {
      ScrollTrigger.create({
        trigger: st, start: 'top 58%', end: 'bottom 42%',
        onEnter: function () { show(k); }, onEnterBack: function () { show(k); }
      });
    });
    show(0);
  });

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

  // review hook: ?sec=N renders one section alone at the top of the page
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
    var steps = keep.querySelectorAll('.step');
    var pick = Math.min(steps.length - 1, parseInt((location.search.match(/[?&]step=([0-9]+)/) || [0, 0])[1], 10));
    steps.forEach(function (s, i) { if (i !== pick) s.style.display = 'none'; });
    if (steps[pick]) {
      var live = (steps[pick].dataset.shot);
      keep.querySelectorAll('[data-shot]').forEach(function (s) {
        s.style.opacity = s.dataset.shot === live ? 1 : 0;
      });
      var lp = (steps[pick].dataset.pins || '').split(',').filter(Boolean);
      keep.querySelectorAll('.pin').forEach(function (p) { p.classList.toggle('on', lp.indexOf(p.dataset.p) !== -1); });
      keep.querySelectorAll('.idxlist div').forEach(function (r) { r.classList.toggle('on', lp.indexOf(r.dataset.p) !== -1); });
    }
    if (veil) veil.remove();
    document.getElementById('hero') && document.getElementById('hero').classList.add('on');
  }
})();
