(function(){
  var sky = document.getElementById('sky-layer'); if(!sky) return;
  var root = document.documentElement, cv = sky.querySelector('canvas'), ctx = cv.getContext('2d');
  var sun = sky.querySelector('.sun');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, dpr, stars = [], mx = .5, my = .5, tx = .5, ty = .5, sx, sy, tsx, tsy, shoot = null, last = 0, run = true;
  function size(){
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(520, Math.round(W * H / 5200)); stars = [];
    for(var i = 0; i < n; i++){ var z = Math.random();
      stars.push({x: Math.random() * W, y: Math.random() * H, z: z, r: .4 + z * 1.4, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5, c: Math.random() < .2 ? '130,200,255' : '255,255,255'}); }
    if(sx == null){ sx = W * .5; sy = H * .5; }
    aim();
  }

  function aim(){
    var small = W < 700;
    tsx = W - (small ? 56 : 120);
    tsy = small ? 74 : 112;
  }
  function dark(){ return root.getAttribute('data-mode') !== 'light'; }
  function draw(t, dt){
    ctx.clearRect(0, 0, W, H);
    if(!dark()) return;
    mx += (tx - mx) * .09; my += (ty - my) * .09;
    var ox = (mx - .5) * 70, oy = (my - .5) * 70;
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      if(!reduced){ s.y -= s.z * dt * 24; if(s.y < -4) s.y = H + 4; }
      var x = ((s.x - ox * s.z) % W + W) % W, y = ((s.y - oy * s.z) % H + H) % H;
      var a = .35 + .65 * (.5 + .5 * Math.sin(t / 1000 * s.s * 2 + s.p));
      ctx.fillStyle = 'rgba(' + s.c + ',' + (a * (.4 + s.z * .6)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
    }
    if(!reduced){
      if(!shoot && Math.random() < dt * .25) shoot = {x: Math.random() * W, y: Math.random() * H * .5, l: 0};
      if(shoot){ shoot.l += dt * 900; var gx = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.l * .8, shoot.y - shoot.l * .45);
        gx.addColorStop(0, 'rgba(255,255,255,.9)'); gx.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gx; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y);
        ctx.lineTo(shoot.x - Math.min(shoot.l, 140) * .8, shoot.y - Math.min(shoot.l, 140) * .45); ctx.stroke();
        shoot.x += dt * 900 * .8 * -1 * -1; shoot.y += dt * 900 * .45;
        if(shoot.l > 900) shoot = null; }
    }
  }
  function frame(t){
    if(!run) return;
    var dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
    draw(t, dt);
    if(!reduced){ sx += (tsx - sx) * .1; sy += (tsy - sy) * .1; } else { sx = tsx; sy = tsy; }
    sun.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
    requestAnimationFrame(frame);
  }
  function point(x, y){ tx = x / W; ty = y / H; }
  window.addEventListener('pointermove', function(e){ point(e.clientX, e.clientY); }, {passive: true});
  window.addEventListener('touchmove', function(e){ var q = e.touches[0]; if(q) point(q.clientX, q.clientY); }, {passive: true});
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', function(){ run = !document.hidden; if(run) requestAnimationFrame(frame); });
  size();
  if(reduced){ aim(); sx = tsx; sy = tsy; draw(0, 0); sun.style.transform = 'translate(' + sx + 'px,' + sy + 'px)';
    new MutationObserver(function(){ draw(0, 0); }).observe(root, {attributes: true, attributeFilter: ['data-mode']}); }
  else requestAnimationFrame(frame);
})();

(function(){
  var svg = document.getElementById('routeSvg'); if(!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var N = {K:{x:90,y:150,l:'kenchi',end:1}, A:{x:320,y:62,l:'switch A'}, B:{x:320,y:238,l:'switch B'}, R:{x:565,y:150,l:'router'}, C:{x:810,y:150,l:'contact',end:1}};
  var E = [['K','A'],['K','B'],['A','R'],['B','R'],['A','B'],['R','C']];
  var cut = {}, busy = false, visible = false, logEl = document.getElementById('routeLog');
  var edgeEls = {};
  function el(n, a, p){ var e = document.createElementNS(NS, n); for(var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
  function nm(i){ return N[i].l; }
  function key(e){ return e[0] + e[1]; }
  E.forEach(function(e){
    var g = el('g', {'class':'r-edge-g', tabindex:'0', role:'button'});
    var a = N[e[0]], b = N[e[1]];
    el('line', {'class':'r-hit', x1:a.x, y1:a.y, x2:b.x, y2:b.y}, g);
    var ln = el('line', {'class':'r-edge', x1:a.x, y1:a.y, x2:b.x, y2:b.y}, g);
    edgeEls[key(e)] = {g:g, ln:ln};
    g.addEventListener('click', function(){ toggle(e, true); });
    g.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); toggle(e, true); } });
    label(e);
  });
  function label(e){
    var c = cut[key(e)];
    edgeEls[key(e)].g.setAttribute('aria-label', 'Cable ' + nm(e[0]) + ' to ' + nm(e[1]) + ', ' + (c ? 'cut' : 'working') + '. Press to ' + (c ? 'restore' : 'cut') + '.');
    edgeEls[key(e)].ln.classList.toggle('cut', !!c);
  }
  Object.keys(N).forEach(function(id){
    var n = N[id], g = el('g', {'class':'r-node' + (n.end ? ' end' : '')});
    el('circle', {cx:n.x, cy:n.y, r:30}, g);
    var t = el('text', {x:n.x, y:n.y + 56}, g); t.textContent = n.l;
    if(id === 'C'){ g.style.cursor = 'pointer'; g.addEventListener('click', function(){ var c = document.getElementById('contact'); if(c) c.scrollIntoView({behavior:'smooth'}); }); }
  });
  function say(txt){
    var li = document.createElement('li'); li.textContent = txt; logEl.insertBefore(li, logEl.firstChild);
    while(logEl.children.length > 5) logEl.removeChild(logEl.lastChild);
  }
  function bfs(useCuts){
    var q = [['K']], seen = {K:1};
    while(q.length){
      var p = q.shift(), last = p[p.length - 1]; if(last === 'C') return p;
      E.forEach(function(e){
        if(useCuts && cut[key(e)]) return;
        var nx = e[0] === last ? e[1] : e[1] === last ? e[0] : null;
        if(nx && !seen[nx]){ seen[nx] = 1; q.push(p.concat(nx)); }
      });
    }
    return null;
  }
  function cutBetween(a, b){ return E.some(function(e){ return cut[key(e)] && ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)); }); }
  function snd(n){ if(window.khAudio) window.khAudio.play(n); }
  function toggle(e, send){
    var k = key(e); cut[k] = !cut[k]; label(e);
    say((cut[k] ? 'Cut cable ' : 'Restored cable ') + nm(e[0]) + ' - ' + nm(e[1]) + '.');
    snd(cut[k] ? 'cut' : 'restore');
    if(send) setTimeout(sendPacket, 350);
  }
  function animate(path, dropAt, done){
    var pts = path.map(function(id){ return N[id]; });
    var pk = el('circle', {'class':'r-pk', r:9, cx:pts[0].x, cy:pts[0].y});
    var seg = 0, t0 = performance.now(), speed = 520;
    function len(a, b){ return Math.hypot(b.x - a.x, b.y - a.y); }
    function frame(now){
      var a = pts[seg], b = pts[seg + 1];
      if(!b){ done(pk); return; }
      var d = len(a, b), f = Math.min(1, (now - t0) / 1000 * speed / d);
      pk.setAttribute('cx', a.x + (b.x - a.x) * f); pk.setAttribute('cy', a.y + (b.y - a.y) * f);
      if(f >= 1){ seg++; t0 = now; snd('hop'); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function sendPacket(){
    if(busy) return; busy = true;
    var want = bfs(false), real = bfs(true);
    if(real){
      var rerouted = want.join('') !== real.join('') && want.some(function(id, i){ return i < want.length - 1 && cutBetween(id, want[i + 1]); });
      animate(real, false, function(pk){
        pk.parentNode.removeChild(pk);
        say((rerouted ? 'Rerouted and delivered: ' : 'Delivered: ') + real.map(nm).join(' > '));
        snd('deliver'); busy = false;
      });
    } else {
      var part = ['K'];
      for(var i = 0; i < want.length - 1; i++){ if(cutBetween(want[i], want[i + 1])) break; part.push(want[i + 1]); }
      var stop = part[part.length - 1];
      animate(part, true, function(pk){
        pk.classList.add('drop'); snd('drop');
        say('Dropped at ' + nm(stop) + ': no working path to contact.');
        setTimeout(function(){ pk.parentNode && pk.parentNode.removeChild(pk); busy = false; }, 700);
      });
    }
  }
  document.getElementById('rSend').addEventListener('click', function(){ snd('click'); sendPacket(); });
  document.getElementById('rCut').addEventListener('click', function(){
    var open = E.filter(function(e){ return !cut[key(e)]; });
    if(!open.length){ say('Every cable is already cut.'); return; }
    toggle(open[Math.floor(Math.random() * open.length)], true);
  });
  document.getElementById('rRestore').addEventListener('click', function(){
    var any = false; E.forEach(function(e){ if(cut[key(e)]){ cut[key(e)] = false; label(e); any = true; } });
    say(any ? 'All cables restored.' : 'All cables already working.'); if(any) snd('restore');
  });
  var io = new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }, {threshold:.35});
  io.observe(svg);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced) setInterval(function(){ if(visible && !document.hidden) sendPacket(); }, 4200);
})();

(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var heads = [].slice.call(document.querySelectorAll('.kh-head'));
  if(!heads.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('rv-in'); io.unobserve(e.target); }
    });
  }, {rootMargin:'0px 0px -10% 0px'});
  heads.forEach(function(h){
    if(h.getBoundingClientRect().top < innerHeight) h.classList.add('rv-in'); else io.observe(h);
  });
  document.documentElement.classList.add('rv-on');
})();
