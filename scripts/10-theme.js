/* Dark / light toggle. The choice only lasts for the visit. When the browser
   supports View Transitions the new theme spreads out as a circle from the
   button that was pressed; otherwise it switches instantly. */
(function () {
  var root = document.documentElement;
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.thm-btn'));
  var chromeTint = document.getElementById('theme-color-meta');
  var CIRCLE_MS = 600;
  var TINT = { light: '#E8ECFA', dark: '#0E1330' };
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncButtons() {
    var theme = current();
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      btn.querySelector('.thm-lab').textContent = theme === 'light' ? 'Light' : 'Dark';
    });
    if (chromeTint) chromeTint.setAttribute('content', TINT[theme]);
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.classList.toggle('sun-rise', theme === 'light');
    syncButtons();
  }

  function circleReveal(origin, theme) {
    var far = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y)
    );
    var change = document.startViewTransition(function () { apply(theme); });
    change.ready.then(function () {
      root.animate(
        { clipPath: [
          'circle(0px at ' + origin.x + 'px ' + origin.y + 'px)',
          'circle(' + far + 'px at ' + origin.x + 'px ' + origin.y + 'px)'
        ] },
        { duration: CIRCLE_MS, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var before = current();
      var after = before === 'light' ? 'dark' : 'light';
      var box = btn.getBoundingClientRect();
      var origin = { x: box.left + box.width / 2, y: box.top + box.height / 2 };

      if (window.sfx) {
        window.sfx.play('click');
        window.sfx.play(after === 'light' ? 'morning' : 'night');
      }
      if (!document.startViewTransition || noMotion) apply(after);
      else circleReveal(origin, after);
    });
  });

  syncButtons();
})();
