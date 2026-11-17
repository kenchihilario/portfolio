/* Keyboard and screen-reader support for the rail and the project panel. */

/* The rail scrolls sideways, so it needs a tab stop and a name to be
   reachable without a pointer. (Focus inside it also pauses the drift.) */
(function () {
  var rail = document.querySelector('.kh-pj-rail');
  if (!rail) return;
  rail.tabIndex = 0;
  rail.setAttribute('role', 'region');
  rail.setAttribute('aria-label', 'Projects, scrollable row');
})();

/* When the project panel opens, move focus to its close button; when it
   closes, return focus to whatever opened it. */
(function () {
  var panel = document.getElementById('proj-panel');
  if (!panel) return;
  var opener = null;
  var wasOpen = false;

  new MutationObserver(function () {
    var isOpen = panel.classList.contains('on');
    if (isOpen === wasOpen) return;
    wasOpen = isOpen;
    if (isOpen) {
      opener = document.activeElement;
      var x = panel.querySelector('.kh-pop-x');
      if (x) x.focus();
    } else if (opener && opener.focus) {
      opener.focus();
      opener = null;
    }
  }).observe(panel, { attributes: true, attributeFilter: ['class'] });
})();
