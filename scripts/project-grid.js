/* "See all" for projects. The rail repeats its cards, so this opens a full
   overlay with one copy of each, cloned from the rail at open time (the rail
   stays the only place the cards are written). Clicking a clone closes the
   overlay and clicks the real card, which opens the detail panel. */
(function () {
  var opener = document.querySelector('.kh-all-btn');
  var overlay = document.getElementById('proj-all');
  var grid = document.getElementById('proj-all-grid');
  if (!opener || !overlay || !grid) return;
  var closer = overlay.querySelector('.kh-all-x');
  var originals = [];

  function titleOf(card) {
    var h = card.querySelector('h3');
    return h ? h.textContent.trim() : card.innerHTML.slice(0, 60);
  }

  function fillGrid() {
    var seen = {};
    originals = [];
    grid.textContent = '';
    document.querySelectorAll('.kh-pj-strip .kh-pj').forEach(function (card) {
      var name = titleOf(card);
      if (seen[name]) return;
      seen[name] = true;
      originals.push(card);
      var copy = card.cloneNode(true);
      copy.removeAttribute('id');
      grid.appendChild(copy);
    });
    /* clones lose their listeners, so give the hover tick back */
    if (window.wireHoverSound) window.wireHoverSound(grid);
  }

  function show() {
    fillGrid();
    overlay.classList.add('on');
    document.body.classList.add('kh-all-lock');
    if (closer) closer.focus();
  }

  function hide() {
    overlay.classList.remove('on');
    document.body.classList.remove('kh-all-lock');
    opener.focus();
  }

  opener.addEventListener('click', show);
  if (closer) closer.addEventListener('click', hide);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('on')) hide();
  });

  grid.addEventListener('click', function (e) {
    var clicked = e.target.closest('.kh-pj');
    if (!clicked) return;
    var which = Array.prototype.indexOf.call(grid.children, clicked);
    hide();
    if (originals[which]) originals[which].click();
  });
})();
