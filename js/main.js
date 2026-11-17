(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* ---- Toast ---- */
  var toastEl = $('toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ---- Sound: off by default, synthesized with Web Audio, no files ---- */
  var soundOn = true, ctx = null, sBtn = $('sound');
  try { if (localStorage.getItem('sound') === 'off') soundOn = false; } catch (e) {}
  function tone(f, at, dur, vol, type, f2) {
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  var fx = {
    hop: function () { tone(440, 0, .07, .04, 'triangle'); tone(660, .05, .09, .03, 'triangle'); },
    on: function () { tone(330, 0, .1, .04); tone(495, .09, .1, .04); tone(660, .18, .16, .04); },
    ok: function () { tone(587, 0, .1, .05); tone(880, .1, .2, .04); },
    cut: function () { tone(900, 0, .18, .05, 'sawtooth', 120); },
    fix: function () { tone(300, 0, .12, .04, 'square', 600); tone(600, .1, .14, .03, 'triangle'); },
    drop: function () { tone(220, 0, .12, .03, 'square', 110); },
    tick: function () { tone(1500, 0, .025, .012); },
    click: function () { tone(520, 0, .06, .03, 'triangle', 380); },
    deliver: function () { tone(784, 0, .06, .02, 'sine'); }
  };
  function play(n) { if (soundOn && ctx) { try { fx[n](); } catch (e) {} } }
  window.kenchi = { play: play, toast: toast, reduce: reduce };

  function label() { sBtn.setAttribute('aria-pressed', String(soundOn)); sBtn.textContent = 'Sound: ' + (soundOn ? 'on' : 'off'); }
  function wake() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { soundOn = false; sBtn.textContent = 'Sound: n/a'; return false; }
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  label();
  /* Browsers only allow audio after a user gesture, so sound starts on the first tap, click or key press. */
  function firstGesture(e) {
    if (e.target && e.target.closest && e.target.closest('#sound')) return;
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) { removeEventListener(n, firstGesture, true); });
    if (soundOn && wake()) { fx.on(); toast('Sound is on. Mute it any time in the header.'); }
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (n) { addEventListener(n, firstGesture, true); });
  sBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    try { localStorage.setItem('sound', soundOn ? 'on' : 'off'); } catch (e) {}
    if (soundOn && wake()) fx.on();
    label();
  });
  var lastH = 0;
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    var t = e.target.closest && e.target.closest('.btn,.hops a,.snd,.map-ctl button,.bb,.trace-list a');
    if (!t || t.contains(e.relatedTarget)) return;
    var n = performance.now(); if (n - lastH < 70) return; lastH = n; play('tick');
  }, true);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn,.bb,.hops a,.trace-list a')) play('click');
  }, true);

  /* ---- Theme ---- */
  var tBtn = $('theme');
  function setTheme(t, save) {
    if (t === 'dark') root.dataset.theme = 'dark'; else root.removeAttribute('data-theme');
    tBtn.textContent = 'Theme: ' + t; tBtn.setAttribute('aria-pressed', String(t === 'dark'));
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#17132B' : '#E8E4F1';
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
    window.dispatchEvent(new Event('themechange'));
  }
  function toggleTheme() { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true); play('on'); }
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
  tBtn.addEventListener('click', toggleTheme);

  /* ---- Scroll cable: progress + one tick per hop ---- */
  var rail = document.querySelector('.rail'), ticksEl = $('ticks'), sections = [].slice.call(document.querySelectorAll('main > section'));
  var ticks = [], ticking = false;
  function layoutTicks() {
    var max = root.scrollHeight - innerHeight; ticksEl.textContent = ''; ticks = [];
    sections.forEach(function (s, i) {
      if (i === 0 || max <= 0) return;
      var f = Math.min(1, Math.max(0, (s.getBoundingClientRect().top + scrollY - 80) / max));
      var t = document.createElement('i'); t.style.top = (f * 100) + '%'; t._f = f;
      ticksEl.appendChild(t); ticks.push(t);
    });
    update();
  }
  function update() {
    var max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    root.style.setProperty('--p', p.toFixed(4));
    ticks.forEach(function (t) { t.classList.toggle('on', p + .001 >= t._f); });
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', function () { clearTimeout(layoutTicks._t); layoutTicks._t = setTimeout(layoutTicks, 150); });
  addEventListener('load', layoutTicks); layoutTicks();

  /* ---- Active hop + arrival sound ---- */
  var links = {}, current = null;
  [].forEach.call(document.querySelectorAll('.hops a'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || e.target.id === current) return;
        current = e.target.id;
        Object.keys(links).forEach(function (k) {
          links[k].classList.toggle('on', k === current);
          if (k === current) links[k].setAttribute('aria-current', 'location'); else links[k].removeAttribute('aria-current');
        });
        if (current !== 'hero') play('hop');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---- Keyboard: 1-6 jump to a hop, T toggles theme ---- */
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    var k = e.key;
    if (k >= '1' && k <= '6') {
      var s = sections[+k]; if (s) { s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); s.setAttribute('tabindex', '-1'); s.focus({ preventScroll: true }); }
    } else if (k === 't' || k === 'T') toggleTheme();
  });

  /* ---- Copy email ---- */
  var email = 'kenchihilario@gmail.com', copy = $('copy');
  copy.addEventListener('click', function () {
    function done(ok) { toast(ok ? 'Email copied' : 'Copy failed. Use the email button.'); if (ok) play('ok'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });
  [].forEach.call(document.querySelectorAll('a[download]'), function (a) { a.addEventListener('click', function () { toast('Downloading CV'); }); });

  /* ---- Boot curtain (first visit this session; any key or click skips) ---- */
  var cur = $('curtain');
  if (root.classList.contains('boot') && cur) {
    var gone = false;
    var end = function () {
      if (gone) return; gone = true; cur.classList.add('out');
      root.classList.remove('boot'); try { sessionStorage.setItem('booted', '1'); } catch (e) {}
      removeEventListener('keydown', end); removeEventListener('pointerdown', end); dispatchEvent(new Event('bootend'));
    };
    addEventListener('keydown', end); addEventListener('pointerdown', end);
    setTimeout(end, 2100);
  }
})();
