

(function () {
  var rail = document.querySelector('.kh-pj-rail');
  if (!rail) return;
  rail.tabIndex = 0;
  rail.setAttribute('role', 'region');
  rail.setAttribute('aria-label', 'Projects, scrollable row');
})();

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
