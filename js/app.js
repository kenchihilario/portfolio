
(function(){
  var root = document.documentElement;

  var boot = document.getElementById('kh-boot');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MIN = reduced ? 300 : 1500, t0 = Date.now(), lifted = false;
  function lift(){
    if(lifted) return; lifted = true;
    root.classList.add('kh-ready');
    setTimeout(function(){ if(boot && boot.parentNode) boot.parentNode.removeChild(boot); }, 700);
  }
  function whenReady(){ setTimeout(lift, Math.max(0, MIN - (Date.now() - t0))); }
  if(document.readyState === 'complete') whenReady(); else addEventListener('load', whenReady);
  setTimeout(lift, 4000);
  if(boot){
    var lines = boot.querySelectorAll('li'), i = 0;
    (function tick(){ if(i < lines.length && !lifted){ lines[i++].classList.add('is-on'); setTimeout(tick, reduced ? 0 : 280); } })();
  }

  var links = [].slice.call(document.querySelectorAll('.kh-nav a'));
  var map = {};
  links.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        links.forEach(function(a){ a.removeAttribute('aria-current'); });
        var a = map[en.target.id]; if(a) a.setAttribute('aria-current', 'true');
      });
    }, {rootMargin: '-40% 0px -55% 0px'});
    Object.keys(map).forEach(function(id){ var s = document.getElementById(id); if(s) io.observe(s); });
  }

  var rail = document.getElementById('kh-bar'), btn = document.getElementById('kh-menu');
  function setMenu(open){
    rail.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? 'Close' : 'Menu';
  }
  btn.addEventListener('click', function(){ setMenu(!rail.classList.contains('is-open')); });
  links.forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
  document.getElementById('kh-top').addEventListener('click', function(){ scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'}); });

  var form = document.getElementById('kh-form');
  if(form){
    var fields = ['name','from','msg'];
    var EMAIL = 'kenchihilario@gmail.com';
    function err(id, text){ document.getElementById('err-' + id).textContent = text || ''; }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = {}, ok = true;
      fields.forEach(function(f){ v[f] = form.elements[f].value.trim(); err(f, ''); });
      if(!v.name){ err('name', 'Add your name so I know who to reply to.'); ok = false; }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.from)){ err('from', 'Enter an email address I can reply to.'); ok = false; }
      if(!v.msg){ err('msg', 'Write a short message.'); ok = false; }
      if(!ok) return;
      var body = v.msg + '\n\n' + v.name + '\n' + v.from;
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('OJT inquiry from ' + v.name) + '&body=' + encodeURIComponent(body);
    });
    var copy = document.getElementById('kh-copy');
    copy.addEventListener('click', function(){
      var done = function(){ copy.textContent = 'Copied'; setTimeout(function(){ copy.textContent = 'Copy address'; }, 1800); };
      if(navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, function(){});
    });
  }
})();
