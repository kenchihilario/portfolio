/* Dark / light toggle. The choice only lasts for the visit. When the browser
   supports View Transitions, going to light the new theme spreads out from the
   sun like dawn, and going to dark it spreads from the button; otherwise it
   switches instantly. */
(function () {
  var docEl = document.documentElement;
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.mode-btn'));
  var chromeTint = document.getElementById('chrome-tint');
  var TINT = { light: '#E8ECFA', dark: '#0E1330' };
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FEATHER = 0.55; /* the mask is fully opaque out to this share of its radius */

  function current() {
    return docEl.getAttribute('data-mode') === 'light' ? 'light' : 'dark';
  }

  function syncButtons() {
    var theme = current();
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      btn.querySelector('.mode-lab').textContent = theme === 'light' ? 'Light' : 'Dark';
    });
    if (chromeTint) chromeTint.setAttribute('content', TINT[theme]);
  }

  function apply(theme) {
    docEl.setAttribute('data-mode', theme);
    docEl.classList.toggle('sun-rise', theme === 'light');
    syncButtons();
  }

  function farthest(o) {
    return Math.hypot(Math.max(o.x, window.innerWidth - o.x), Math.max(o.y, window.innerHeight - o.y));
  }

  /* Feathered reveal: the new theme spreads from a point through a soft-edged
     radial mask, so it reads as light seeping in rather than a hard circle. */
  function reveal(origin, theme, ms) {
    var R = (farthest(origin) / FEATHER) * 1.04;
    var grad = 'radial-gradient(circle closest-side, #000 ' + (FEATHER * 100) + '%, transparent 100%)';
    function frame(size, x, y) {
      var sz = size + 'px ' + size + 'px', pos = x + 'px ' + y + 'px';
      return { maskImage: grad, webkitMaskImage: grad, maskRepeat: 'no-repeat', webkitMaskRepeat: 'no-repeat',
        maskSize: sz, webkitMaskSize: sz, maskPosition: pos, webkitMaskPosition: pos };
    }
    var change = document.startViewTransition(function () { apply(theme); });
    change.ready.then(function () {
      docEl.animate(
        [frame(0, origin.x, origin.y), frame(R * 2, origin.x - R, origin.y - R)],
        { duration: ms, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
  }

  /* warm bloom that expands from the sun while the dark gives way */
  function dawnBloom(origin, ms) {
    var el = document.createElement('div');
    el.className = 'dawn-bloom';
    el.style.left = origin.x + 'px';
    el.style.top = origin.y + 'px';
    el.style.width = el.style.height = (farthest(origin) * 2.2) + 'px';
    document.body.appendChild(el);
    var anim = el.animate([
      { transform: 'translate(-50%,-50%) scale(0)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(.35)', opacity: .9, offset: .25 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
    ], { duration: ms * 1.15, easing: 'cubic-bezier(.3,.1,.3,1)' });
    anim.onfinish = function () { el.remove(); };
  }

  function sunPoint() {
    var core = document.querySelector('.sun-core');
    if (!core) return null;
    var r = core.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var after = current() === 'light' ? 'dark' : 'light';
      var box = btn.getBoundingClientRect();
      var origin = { x: box.left + box.width / 2, y: box.top + box.height / 2 };

      if (window.khAudio) {
        window.khAudio.play('click');
        window.khAudio.play(after === 'light' ? 'morning' : 'night');
      }
      if (!document.startViewTransition || noMotion) { apply(after); return; }
      if (after === 'light') {
        /* dark to light: dawn breaks from the sun in the corner */
        var sp = sunPoint() || origin;
        reveal(sp, 'light', 1500);
        dawnBloom(sp, 1500);
      } else {
        reveal(origin, 'dark', 900);
      }
    });
  });

  syncButtons();
})();
