
(function () {
  var thumbs = document.querySelectorAll('.pf-thumb');
  var box, big, cap, closer, lastFocus;

  function build() {
    box = document.createElement('div');
    box.className = 'pf-zoom';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Project screenshot');
    box.innerHTML = '<figure class="pf-zoom-fig"><button type="button" class="pf-zoom-x" aria-label="Close">&times;</button><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    big = box.querySelector('img');
    cap = box.querySelector('figcaption');
    closer = box.querySelector('.pf-zoom-x');
    closer.addEventListener('click', hide);
    box.addEventListener('click', function (e) { if (e.target === box) hide(); });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('on')) hide();
    });
  }

  function show(thumb) {
    var img = thumb.querySelector('img');
    if (!img) return;
    if (!box) build();
    lastFocus = document.activeElement;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    var row = thumb.closest('.pf-row');
    var h = row && row.querySelector('h3');
    cap.textContent = h ? h.textContent.trim() : '';
    box.classList.add('on');
    document.body.style.overflow = 'hidden';
    closer.focus();
  }

  function hide() {
    box.classList.remove('on');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  thumbs.forEach(function (t) {
    if (!t.querySelector('img')) return;
    t.classList.add('pf-zoomable');
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-label', 'Enlarge screenshot');
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(t); }
    });
  });
})();
