/* Navigation: scroll progress, the active-link highlight in the top bar,
   the phone menu sheet, and the footer entrance. */

/* 1. Scroll progress and active section.
   Progress (0 to 1) goes onto <html> as --v-p and into the % readout.
   The active link is the last section whose top has crossed 45% of the
   screen height. */
(function () {
  var html = document.documentElement;
  var readout = document.getElementById('scroll-meter');
  var nav = document.querySelector('.kh-dock-links');
  var glow = nav ? nav.querySelector('.kh-dock-glow') : null;
  var items = [];   // { link, section }
  var queued = false;

  if (nav) {
    nav.querySelectorAll('a').forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) items.push({ link: link, section: section });
    });
  }

  function currentIndex() {
    var line = window.innerHeight * 0.45;
    var found = -1;
    items.forEach(function (it, i) {
      if (it.section.getBoundingClientRect().top <= line) found = i;
    });
    return found;
  }

  function showActive(idx) {
    items.forEach(function (it, i) {
      it.link.setAttribute('aria-current', String(i === idx));
    });
    if (!glow) return;
    if (idx < 0) { glow.classList.remove('on'); return; }
    var l = items[idx].link;
    glow.classList.add('on');
    glow.style.transform = 'translateX(' + l.offsetLeft + 'px)';
    glow.style.width = l.offsetWidth + 'px';
  }

  function refresh() {
    queued = false;
    var room = html.scrollHeight - window.innerHeight;
    var done = room > 0 ? Math.max(0, Math.min(1, window.scrollY / room)) : 0;
    html.style.setProperty('--v-p', done.toFixed(4));
    if (readout) readout.textContent = Math.round(done * 100) + '%';
    showActive(currentIndex());
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  refresh();
})();

/* 2. Phone menu. The sheet's section list is copied from the top bar's
   nav so the links are only written once in the HTML. */
(function () {
  var opener = document.getElementById('menu-toggle');
  var sheet = document.getElementById('drawer');
  var list = document.getElementById('drawer-nav');
  var closer = document.getElementById('drawer-close');
  var source = document.querySelector('.kh-dock-links');
  if (!opener || !sheet || !list || !closer) return;
  var returnTo = null;

  function fillList() {
    list.textContent = '';
    if (!source) return;
    source.querySelectorAll('a').forEach(function (a) {
      var copy = document.createElement('a');
      copy.href = a.getAttribute('href');
      copy.textContent = a.textContent.trim();
      copy.addEventListener('click', close);
      list.appendChild(copy);
    });
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var stops = sheet.querySelectorAll('a[href], button:not([disabled])');
    if (!stops.length) return;
    var first = stops[0], last = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    returnTo = document.activeElement;
    fillList();
    sheet.hidden = false;
    document.body.classList.add('kh-sheet-open');
    opener.setAttribute('aria-expanded', 'true');
    opener.setAttribute('aria-label', 'Close menu');
    document.addEventListener('keydown', onKey);
    closer.focus();
  }

  function close() {
    if (sheet.hidden) return;
    sheet.hidden = true;
    document.body.classList.remove('kh-sheet-open');
    opener.setAttribute('aria-expanded', 'false');
    opener.setAttribute('aria-label', 'Open menu');
    document.removeEventListener('keydown', onKey);
    if (returnTo && returnTo.focus) returnTo.focus();
  }

  opener.addEventListener('click', function () { sheet.hidden ? open() : close(); });
  closer.addEventListener('click', close);
  window.addEventListener('resize', function () { if (window.innerWidth > 860) close(); });
})();

/* 3. Footer: the contact block replays its entrance each time it
   comes into view. */
(function () {
  var footer = document.getElementById('contact');
  if (!footer) return;
  new IntersectionObserver(function (entries) {
    footer.classList.toggle('on', entries[0].isIntersecting);
  }, { rootMargin: '0px 0px -10% 0px' }).observe(footer);
})();
