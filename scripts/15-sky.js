
(function(){
  var sky = document.getElementById('skyfx'); if(!sky) return;
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
    var max = Math.max(1, document.documentElement.scrollHeight - H);
    var p = Math.min(1, Math.max(0, (window.pageYOffset || 0) / max));
    tsx = W * (.12 + .76 * p);
    tsy = Math.max(120, H * (.56 - .42 * Math.sin(Math.PI * p)));
  }
  function dark(){ return root.getAttribute('data-theme') !== 'light'; }
  function draw(t, dt){
    ctx.clearRect(0, 0, W, H);
    if(!dark()) return;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    var ox = (mx - .5) * 70, oy = (my - .5) * 70;
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      if(!reduced){ s.y -= s.z * dt * 6; if(s.y < -4) s.y = H + 4; }
      var x = ((s.x - ox * s.z) % W + W) % W, y = ((s.y - oy * s.z) % H + H) % H;
      var a = .35 + .65 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
      ctx.fillStyle = 'rgba(' + s.c + ',' + (a * (.4 + s.z * .6)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
    }
    if(!reduced){
      if(!shoot && Math.random() < dt * .12) shoot = {x: Math.random() * W, y: Math.random() * H * .5, l: 0};
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
  window.addEventListener('scroll', aim, {passive: true});
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', function(){ run = !document.hidden; if(run) requestAnimationFrame(frame); });
  size();
  if(reduced){ aim(); sx = tsx; sy = tsy; draw(0, 0); sun.style.transform = 'translate(' + sx + 'px,' + sy + 'px)';
    new MutationObserver(function(){ draw(0, 0); }).observe(root, {attributes: true, attributeFilter: ['data-theme']}); }
  else requestAnimationFrame(frame);
})();
