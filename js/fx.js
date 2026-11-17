/* Extra interaction: decrypting headline, card glow, certificate lightbox. */
(function () {
  'use strict';
  var k = window.kenchi || { play: function () {}, reduce: false };

  /* Headline "decrypts" once after load (and again on hover). Screen readers get the plain name. */
  var h = document.querySelector('h1');
  if (h && !k.reduce) {
    var text = h.textContent.trim(), chars = [], busy = false, G = '01<>/#$%&=+*';
    h.setAttribute('aria-label', text); h.textContent = '';
    var wrap = document.createElement('span'); wrap.setAttribute('aria-hidden', 'true'); h.appendChild(wrap);
    text.split(' ').forEach(function (w, wi, all) {
      var ws = document.createElement('span'); ws.style.cssText = 'white-space:nowrap;display:inline-block';
      w.split('').forEach(function (c) { var s = document.createElement('span'); s.textContent = c; s._c = c; ws.appendChild(s); chars.push(s); });
      wrap.appendChild(ws); if (wi < all.length - 1) wrap.appendChild(document.createTextNode(' '));
    });
    var run = function () {
      if (busy) return; busy = true;
      var w = chars.map(function (s) { return s.getBoundingClientRect().width; });
      chars.forEach(function (s, i) { s.style.cssText = 'display:inline-block;text-align:center;width:' + w[i] + 'px'; });
      var f = 0, id = setInterval(function () {
        f++;
        chars.forEach(function (s, i) { s.textContent = i < f - 8 ? s._c : G.charAt(Math.floor(Math.random() * G.length)); });
        if (f >= chars.length + 9) { clearInterval(id); chars.forEach(function (s) { s.textContent = s._c; s.style.cssText = ''; }); busy = false; }
      }, 38);
    };
    h.addEventListener('pointerenter', run);
    if (document.documentElement.classList.contains('boot')) addEventListener('bootend', function () { setTimeout(run, 250); }); else setTimeout(run, 300);
  }

  /* Pointer glow on cards (mouse only) */
  if (matchMedia('(hover: hover)').matches) {
    [].forEach.call(document.querySelectorAll('.grid .panel, .job'), function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Certificate lightbox */
  var dlg = document.getElementById('lb');
  if (dlg && dlg.showModal) {
    var img = dlg.querySelector('img'), t = dlg.querySelector('h3'), p = dlg.querySelector('p');
    [].forEach.call(document.querySelectorAll('.bb'), function (b) {
      b.addEventListener('click', function () {
        img.src = b.dataset.src; img.alt = b.dataset.name; t.textContent = b.dataset.name; p.textContent = b.dataset.by;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    document.getElementById('lb-x').addEventListener('click', function () { dlg.close(); });
  }
})();
