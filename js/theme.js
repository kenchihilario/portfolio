/* Theme control. The toggle is a temporary override for the view you are in;
   flipping the view resets it to that view's own palette, and nothing is
   remembered between visits. */
(function(){
  var root = document.documentElement;
  var btns = [].slice.call(document.querySelectorAll('.kh-theme'));
  /* the browser-chrome tint (Android's status/address bar, mainly) used to
     follow the OS's own prefers-color-scheme via a pair of media-scoped
     meta tags - a leftover from before the theme became a property of the
     view rather than the visitor's system setting. That left it free to
     mismatch whatever the page actually rendered (a light off-the-clock
     page with the OS in dark mode still tinted the chrome dark, and vice
     versa - what read as "the page changed color" on its own). Painted
     from the site's own data-theme now, same as everything else here. */
  var metaTheme = document.getElementById('theme-color-meta');

  function now(){ return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function paint(){
    var t = now();
    btns.forEach(function(b){
      b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      b.querySelector('.kh-theme-lab').textContent = t === 'light' ? 'Light' : 'Dark';
    });
    if(metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#E8ECFA' : '#0E1330');
  }
  function set(t){ root.setAttribute('data-theme', t); paint(); }

  /* the entrance ambiance - only when the polarity actually changed, so
     flipping views while already on the matching theme (a toggle override
     that happened to already match the other view's default) stays
     silent instead of playing the wash twice in a row */
  function ambiance(prev){
    if(now() === prev || !window.sfx) return;
    window.sfx.play(now() === 'light' ? 'morning' : 'night');
  }

  var reducedT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  btns.forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var prev = now(), next = prev === 'light' ? 'dark' : 'light';
      var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var apply = function(){ set(next); root.classList.toggle('kh-sun-rise', next === 'light'); };
      if(window.sfx) window.sfx.play('click');
      ambiance(prev);
      if(!document.startViewTransition || reducedT){ apply(); return; }
      var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var vt = document.startViewTransition(apply);
      vt.ready.then(function(){
        root.animate({clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)']},
          {duration: 800, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)'});
      }).catch(function(){});
    });
  });

  paint();
})();
