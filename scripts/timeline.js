/* Experience list: one role is open at a time, and tapping the open one closes it. */
(function () {
  var roles = document.querySelector('.kh-xp');
  if (!roles) return;

  function setOpen(row, open) {
    row.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  roles.addEventListener('click', function (event) {
    var row = event.target.closest('.kh-xp-row');
    if (!row) return;

    /* the visitor is selecting text in this row, so leave it as it is */
    var sel = window.getSelection();
    if (sel && String(sel).trim() && row.contains(sel.anchorNode)) return;

    var wasOpen = row.getAttribute('aria-expanded') === 'true';
    roles.querySelectorAll('.kh-xp-row').forEach(function (r) { setOpen(r, false); });
    setOpen(row, !wasOpen);
  });
})();
