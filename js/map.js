
(function () {
  'use strict';
  var cv = document.getElementById('map');
  if (!cv || !cv.getContext) return;
  var k = window.kenchi || { play: function () {}, reduce: false };
  var ctx = cv.getContext('2d'), log = document.getElementById('maplog');
  var N = [
    { l: 'kenchi', x: .1, y: .5 }, { l: 'exp', x: .3, y: .2, to: 'experience' }, { l: 'proj', x: .3, y: .8, to: 'projects' },
    { l: 'certs', x: .55, y: .5, to: 'certs' }, { l: 'skills', x: .77, y: .2, to: 'skills' }, { l: 'edu', x: .77, y: .8, to: 'education' },
    { l: 'contact', x: .9, y: .5, to: 'contact' }
  ];
  var E = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5], [4, 6], [5, 6]];
  var cut = {}, packets = [], W = 0, H = 0, hover = null, last = 0, spawnT = 0, running = false, flash = [];
  var key = function (a, b) { return a < b ? a + '-' + b : b + '-' + a; };
  var isCut = function (a, b) { return !!cut[key(a, b)]; };
  var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };

  function route() {
    var prev = {}, q = [0], seen = { 0: 1 };
    while (q.length) {
      var u = q.shift(); if (u === 6) break;
      var nb = [];
      E.forEach(function (e) { if (isCut(e[0], e[1])) return; if (e[0] === u) nb.push(e[1]); else if (e[1] === u) nb.push(e[0]); });
      nb.sort(function () { return Math.random() - .5; });
      nb.forEach(function (v) { if (!seen[v]) { seen[v] = 1; prev[v] = u; q.push(v); } });
    }
    if (!seen[6]) return null;
    var p = [6]; while (p[0] !== 0) p.unshift(prev[p[0]]); return p;
  }
  var pos = function (i) { return { x: N[i].x * W, y: N[i].y * H }; };

  function size() {
    var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = Math.max(240, r.width); H = Math.round(W * .52);
    cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px'; ctx.setTransform(d, 0, 0, d, 0, 0); draw();
  }

  function say(t) { log.textContent = t; }
  function names(p) { return p.map(function (i) { return N[i].l; }).join(' > '); }
  function setCut(i, on) {
    var e = E[i], ka = key(e[0], e[1]);
    if (on) cut[ka] = 1; else delete cut[ka];
    var p = route();
    if (on) { k.play('cut'); say('Cable ' + N[e[0]].l + '-' + N[e[1]].l + ' cut. ' + (p ? 'Traffic reroutes: ' + names(p) + '.' : 'No route to contact. Restore a link.')); }
    else { k.play('fix'); say('Cable ' + N[e[0]].l + '-' + N[e[1]].l + ' restored.'); }
    if (!running) draw();
  }
  function cutRandom() {
    var live = []; E.forEach(function (e, i) { if (!isCut(e[0], e[1])) live.push(i); });
    if (!live.length) { say('Every cable is already cut. Use Restore links.'); return; }
    setCut(live[Math.floor(Math.random() * live.length)], true);
  }
  function restore() {
    if (!Object.keys(cut).length) { say('All links are already up.'); return; }
    cut = {}; k.play('fix'); say('All links up. Shortest route: ' + names(route()) + '.'); if (!running) draw();
  }

  function segDist(px, py, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
  }
  function hit(ev) {
    var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, i, best = { t: null, d: 1e9 };
    for (i = 0; i < N.length; i++) { var p = pos(i); if (Math.hypot(x - p.x, y - p.y) < 16) return { type: 'n', i: i }; }
    E.forEach(function (e, j) { var d = segDist(x, y, pos(e[0]), pos(e[1])); if (d < 10 && d < best.d) best = { t: 'e', i: j, d: d }; });
    return best.t ? { type: 'e', i: best.i } : null;
  }
  cv.addEventListener('pointermove', function (ev) { var h = hit(ev); var s = h ? h.type + h.i : null; if (s !== hover) { hover = s; cv.style.cursor = h ? 'pointer' : 'crosshair'; if (!running) draw(); } });
  cv.addEventListener('pointerleave', function () { hover = null; if (!running) draw(); });
  cv.addEventListener('click', function (ev) {
    var h = hit(ev); if (!h) return;
    if (h.type === 'e') setCut(h.i, !isCut(E[h.i][0], E[h.i][1]));
    else if (N[h.i].to) { var s = document.getElementById(N[h.i].to); if (s) s.scrollIntoView({ behavior: k.reduce ? 'auto' : 'smooth' }); }
  });
  document.getElementById('cut').addEventListener('click', cutRandom);
  document.getElementById('fix').addEventListener('click', restore);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var line = '#8F86B8', red = '#FF6B9E', yel = '#F4C531', grn = '#6EDBA0', white = '#F1EEF8';
    var live = route(); ctx.lineWidth = 2; ctx.font = '600 11px ' + (css('--mono') || 'monospace'); ctx.textAlign = 'center';
    E.forEach(function (e, j) {
      var a = pos(e[0]), b = pos(e[1]), c = isCut(e[0], e[1]), on = hover === 'e' + j;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.setLineDash(c ? [5, 6] : []); ctx.strokeStyle = c ? red : on ? white : line; ctx.lineWidth = on ? 3 : 2; ctx.stroke(); ctx.setLineDash([]);
      if (c) { var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; ctx.strokeStyle = red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx - 6, my - 6); ctx.lineTo(mx + 6, my + 6); ctx.moveTo(mx + 6, my - 6); ctx.lineTo(mx - 6, my + 6); ctx.stroke(); }
    });
    if (k.reduce && live) { ctx.strokeStyle = yel; ctx.lineWidth = 4; ctx.beginPath(); live.forEach(function (n, i) { var p = pos(n); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.stroke(); }
    N.forEach(function (n, i) {
      var p = pos(i), on = hover === 'n' + i;
      ctx.beginPath(); ctx.arc(p.x, p.y, on ? 9 : 7, 0, 7); ctx.fillStyle = i === 0 ? yel : i === 6 ? grn : white; ctx.fill();
      ctx.fillStyle = white; ctx.fillText(n.l, p.x, p.y + (p.y < H / 2 ? -14 : 22));
    });
    packets.forEach(function (p) {
      var a = pos(p.path[p.s]), b = pos(p.path[p.s + 1]), x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = yel; ctx.fillRect(-4, -4, 8, 8); ctx.restore();
    });
    flash.forEach(function (f) { ctx.globalAlpha = f.a; ctx.strokeStyle = red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, 6 + (1 - f.a) * 16, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; });
  }

  function frame(ts) {
    if (!running) return;
    var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; spawnT -= dt;
    if (spawnT <= 0 && packets.length < 4) { var p = route(); if (p) packets.push({ path: p, s: 0, t: 0 }); spawnT = 1.1; }
    packets = packets.filter(function (p) {
      var a = p.path[p.s], b = p.path[p.s + 1];
      if (isCut(a, b)) { var q = pos(a); flash.push({ x: q.x + (pos(b).x - q.x) * p.t, y: q.y + (pos(b).y - q.y) * p.t, a: 1 }); k.play('drop'); return false; }
      var A = pos(a), B = pos(b); p.t += (150 * dt) / Math.hypot(B.x - A.x, B.y - A.y);
      if (p.t >= 1) { p.s++; p.t = 0; if (p.s >= p.path.length - 1) { k.play('deliver'); return false; } }
      return true;
    });
    flash.forEach(function (f) { f.a -= dt * 2.2; }); flash = flash.filter(function (f) { return f.a > 0; });
    draw(); requestAnimationFrame(frame);
  }
  function start() { if (running || k.reduce || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
  size();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(cv); else start();
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
