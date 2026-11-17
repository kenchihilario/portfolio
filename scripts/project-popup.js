/* Project detail: clicking a card opens a panel with a large image on the
   left and the write-up on the right. */
(function () {
  var modal = document.getElementById('proj-panel');
  if (!modal) return;

  var ui = {
    img: document.getElementById('pp-img'),
    title: document.getElementById('pp-title'),
    copy: document.getElementById('pp-copy'),
    fact: document.getElementById('pp-fact'),
    linkRow: document.getElementById('pp-links'),
    repo: document.getElementById('pp-repo'),
    demo: document.getElementById('pp-demo')
  };

  /* A button with no URL yet stays visible but inert. A project that will
     never have links (data-extra="none") hides the whole row instead. */
  function aim(anchor, url) {
    var live = Boolean(url);
    if (live) anchor.href = url; else anchor.removeAttribute('href');
    anchor.classList.toggle('kh-pop-btn-off', !live);
    if (live) {
      anchor.removeAttribute('aria-disabled');
      anchor.removeAttribute('tabindex');
    } else {
      anchor.setAttribute('aria-disabled', 'true');
      anchor.tabIndex = -1;
    }
  }

  function fill(card) {
    var shot = card.querySelector('.kh-pj-pic img');
    ui.img.src = shot ? shot.src : '';
    ui.img.alt = shot ? shot.alt : '';
    ui.img.className = shot && shot.classList.contains('kh-crop-top') ? 'kh-crop-top' : '';
    ui.title.innerHTML = card.querySelector('h3').innerHTML;
    ui.copy.textContent = card.querySelector('p').textContent;
    ui.fact.textContent = card.querySelector('.kh-pj-fact').textContent;
    ui.linkRow.hidden = card.dataset.extra === 'none';
    if (!ui.linkRow.hidden) {
      aim(ui.repo, card.dataset.source);
      aim(ui.demo, card.dataset.live);
    }
  }

  function open(card) {
    fill(card);
    document.body.classList.add('kh-pop-open');
    modal.classList.add('on');
  }

  function close() {
    modal.classList.remove('on');
    document.body.classList.remove('kh-pop-open');
    ui.img.src = '';
  }

  document.querySelectorAll('.kh-pj').forEach(function (card) {
    card.addEventListener('click', function (e) {
      var rail = card.closest('.kh-pj-rail');
      if (rail && rail.classList.contains('is-dragging')) return;
      e.stopPropagation();
      open(card);
    });
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.kh-pop-x')) close();
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
