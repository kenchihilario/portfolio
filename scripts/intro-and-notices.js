

(function () {
  var stack = document.getElementById('notices');
  var SHOW_MS = 5200;
  var MAX_VISIBLE = 3;

  function dismiss(el) {
    if (!el || el.dataset.leaving) return;
    el.dataset.leaving = '1';
    el.classList.add('is-out');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
  }

  window.toast = function (kind, title, detail, opts) {
    if (!stack) return null;
    opts = opts || {};
    while (stack.children.length >= MAX_VISIBLE) dismiss(stack.firstElementChild);

    var card = document.createElement('div');
    card.className = 'kh-toast is-' + (kind || 'info') + (opts.center ? ' is-center' : '');

    var dot = document.createElement('i');
    dot.className = 'kh-toast-dot';
    var text = document.createElement('div');
    var heading = document.createElement('b');
    heading.textContent = title;
    text.appendChild(heading);
    if (detail) {
      var line = document.createElement('span');
      line.textContent = detail;
      text.appendChild(line);
    }
    card.appendChild(dot);
    card.appendChild(text);

    card.addEventListener('click', function () { dismiss(card); });
    stack.appendChild(card);
    setTimeout(function () { dismiss(card); }, opts.life || SHOW_MS);
    return card;
  };

  function copyOldWay(text) {
    var box = document.createElement('textarea');
    box.value = text;
    box.setAttribute('readonly', '');
    box.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(box);
    box.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(box);
    return ok;
  }

  window.copyText = function (text, done) {
    var report = typeof done === 'function' ? done : function () {};
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { report(true); },
        function () { report(copyOldWay(text)); }
      );
    } else {
      report(copyOldWay(text));
    }
  };
})();

(function () {
  var bar = document.getElementById('curtain-fill');
  var label = document.getElementById('curtain-meta');
  if (!bar) return;

  var hold = window.__intro || { t0: Date.now(), min: 0 };
  var steps = Array.prototype.slice.call(document.querySelectorAll('#curtain-log li'));
  var images = Array.prototype.slice.call(document.querySelectorAll('img:not([loading="lazy"])'));
  var needed = images.length + 1;
  var arrived = 0;
  var shown = 0;
  var running = true;

  function arrive() { arrived += 1; }
  images.forEach(function (img) {
    if (img.complete) { arrive(); return; }
    img.addEventListener('load', arrive, { once: true });
    img.addEventListener('error', arrive, { once: true });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrive, arrive);
  else arrive();

  function showSteps(fraction, everything) {
    steps.forEach(function (li, i) {
      var reached = everything || fraction >= i / steps.length;
      var isLast = i === steps.length - 1;
      var current = !everything && reached && (isLast || fraction < (i + 1) / steps.length);
      li.classList.toggle('on', reached);
      li.classList.toggle('cur', current);
    });
  }

  function finish() {
    running = false;
    showSteps(1, true);
    bar.style.setProperty('--v-lp', '1');
    if (label) label.textContent = 'Ready';
  }

  function step() {
    if (!running) return;
    var byLoad = Math.min(1, arrived / needed);
    var byTime = hold.min > 0 ? (Date.now() - hold.t0) / hold.min : 1;
    shown = Math.max(shown, Math.min(byLoad, byTime, 0.985));
    bar.style.setProperty('--v-lp', shown.toFixed(3));
    showSteps(shown, false);
    if (label) label.textContent = Math.round(shown * 100) + '%';
    requestAnimationFrame(step);
  }

  document.addEventListener('introdone', finish);
  if (window.__introDone) finish();
  else requestAnimationFrame(step);
})();

(function () {
  var FRAMES = '.kh-pj-pic, .kh-pop-pic';

  function markBroken(img) {
    var frame = img.closest(FRAMES);
    if (frame) {
      img.style.display = 'none';
      frame.classList.add('is-broken');
    } else {
      img.classList.add('is-gone');
    }
  }

  function markFine(img) {
    var frame = img.closest(FRAMES);
    if (frame) frame.classList.remove('is-broken');
    img.style.display = '';
    img.classList.remove('is-gone');
  }

  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markBroken(img);
    img.addEventListener('error', function () { markBroken(img); });

    img.addEventListener('load', function () { markFine(img); });
  });
})();

(function () {
  var wasOnline = navigator.onLine !== false;

  window.addEventListener('offline', function () {
    wasOnline = false;
    window.toast('err', 'You are offline', 'Downloads and links will not work until you reconnect.');
  });
  window.addEventListener('online', function () {
    if (!wasOnline) window.toast('ok', 'Back online', 'Everything works again.');
    wasOnline = true;
  });
})();
