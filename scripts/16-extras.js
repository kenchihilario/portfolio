
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
  function snd(n){ if(window.sfx) window.sfx.play(n); }
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
