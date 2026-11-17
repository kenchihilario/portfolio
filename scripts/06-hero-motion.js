
(function(){
  var host = document.querySelector('.stage-photo');
  var lens = document.getElementById('plens');
  if(!host || !lens) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tx=0, ty=0, tr=0, cx=0, cy=0, cr=0, running=false;

  function shown(){ return host.querySelector('img:not([hidden])'); }

  function fit(){
    var img = shown();
    if(!img || !img.naturalWidth) return;
    var b = host.getBoundingClientRect();
    var z = host.offsetWidth ? b.width / host.offsetWidth : 1;
    var bw = host.offsetWidth, bh = b.height / z;
    var scale = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
    var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    lens.style.height = h + 'px';
    lens.style.left   = ((bw - w) / 2) + 'px';
    lens.style.right  = ((bw - w) / 2) + 'px';
  }
  addEventListener('resize', fit);
  host.querySelectorAll('img').forEach(function(i){
    if(i.complete) fit(); else i.addEventListener('load', fit);
  });
  new MutationObserver(fit).observe(host, {attributes:true, subtree:true, attributeFilter:['hidden']});

  function frame(){
    var k = reduced ? 1 : .14;
    cx += (tx-cx)*k; cy += (ty-cy)*k; cr += (tr-cr)*(reduced ? 1 : .11);
    lens.style.clipPath = 'circle(' + cr.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
    lens.style.setProperty('--mx', cx.toFixed(1) + 'px');
    lens.style.setProperty('--my', cy.toFixed(1) + 'px');
    if(Math.abs(tr-cr) > .4 || Math.abs(tx-cx) > .4 || Math.abs(ty-cy) > .4) requestAnimationFrame(frame);
    else running = false;
  }
  function kick(){ if(!running){ running = true; requestAnimationFrame(frame); } }

  function aim(e){
    var b = lens.getBoundingClientRect();
    var z = lens.offsetWidth ? b.width / lens.offsetWidth : 1;
    tx = (e.clientX - b.left) / z;
    ty = (e.clientY - b.top) / z;
    return b;
  }
  host.addEventListener('mouseenter', function(e){
    fit(); aim(e); cx = tx; cy = ty; cr = 0;
    tr = Math.min(lens.offsetWidth * .13, 54);
    kick();
  });
  host.addEventListener('mousemove', function(e){
    var b = aim(e);
    tr = Math.min(b.width * .13, 54);
    kick();
  });
  host.addEventListener('mouseleave', function(){ tr = 0; kick(); });

  var touchCloseT = null;
  function scheduleTouchClose(){
    clearTimeout(touchCloseT);
    touchCloseT = setTimeout(function(){ tr = 0; kick(); }, 650);
  }
  function aimTouch(t){
    var b = lens.getBoundingClientRect();
    var z = lens.offsetWidth ? b.width / lens.offsetWidth : 1;
    tx = (t.clientX - b.left) / z;
    ty = (t.clientY - b.top) / z;
    return b;
  }
  host.addEventListener('touchstart', function(e){
    if(!e.touches.length) return;
    clearTimeout(touchCloseT);
    fit();
    aimTouch(e.touches[0]);
    cx = tx; cy = ty; cr = 0;
    tr = Math.min(lens.offsetWidth * .13, 54);
    kick();
  }, {passive:true});
  host.addEventListener('touchmove', function(e){
    if(!e.touches.length) return;
    var b = aimTouch(e.touches[0]);
    tr = Math.min(b.width * .13, 54);
    kick();
  }, {passive:true});
  host.addEventListener('touchend', scheduleTouchClose, {passive:true});
  host.addEventListener('touchcancel', scheduleTouchClose, {passive:true});
})();

(function(){
  var chip=document.getElementById('flip');
  if(!chip) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  chip.classList.add('landed');
  function tap(){
    chip.classList.add('tap');
    setTimeout(function(){ chip.classList.remove('tap'); }, 520);
    setTimeout(tap, 2000 + Math.random() * 4000);
  }
  setTimeout(tap, 2600);
})();
