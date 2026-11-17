/* Experience: one role open at a time. Clicking an open role closes it. */
(function () {
  var list = document.querySelector('.kh-xp');
  if (!list) return;

  list.addEventListener('click', function (e) {
    var row = e.target.closest('.kh-xp-row');
    if (!row || !list.contains(row)) return;

    /* finishing a text selection inside the row should not fold it */
    var picked = window.getSelection();
    if (picked && picked.toString().trim() && row.contains(picked.anchorNode)) return;

    var wasOpen = row.getAttribute('aria-expanded') === 'true';
    list.querySelectorAll('.kh-xp-row').forEach(function (r) {
      r.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) row.setAttribute('aria-expanded', 'true');
  });
})();
