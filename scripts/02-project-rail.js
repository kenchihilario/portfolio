
(function () {
  var rail = document.querySelector('.kh-pj-rail');
  var strip = rail && rail.querySelector('.kh-pj-strip');
  if (!strip) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PAUSE_MS = 1600;
  var st = { loop: 0, speed: 0, prev: 0, resumeAt: 0, dragging: false };

  function measure() {
    var gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
    st.loop = (strip.getBoundingClientRect().width + gap) / 2;
    var seconds = parseFloat(getComputedStyle(rail).getPropertyValue('--kh-drift')) || 68;
    st.speed = st.loop / seconds;
  }

  function keepInside() {
    if (rail.scrollLeft >= st.loop) rail.scrollLeft -= st.loop;
    else if (rail.scrollLeft <= 0) rail.scrollLeft += st.loop;
  }

  function isPaused(now) {
    return st.dragging || calm.matches || now < st.resumeAt ||
      document.body.classList.contains('kh-pop-open') ||
      rail.matches(':hover') || rail.contains(document.activeElement);
  }

  function tick(ts) {
    var elapsed = st.prev ? Math.min((ts - st.prev) / 1000, 0.05) : 0;
    st.prev = ts;
    if (!isPaused(performance.now())) rail.scrollLeft += st.speed * elapsed;
    keepInside();
    requestAnimationFrame(tick);
  }

  function holdOff() { st.resumeAt = performance.now() + PAUSE_MS; }

  measure();
  window.addEventListener('resize', measure);
  requestAnimationFrame(tick);

  rail.addEventListener('wheel', function (e) {
    var vertical = !e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX);
    if (vertical) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: 'instant' });
    } else {
      holdOff();
    }
  }, { passive: false });

  rail.addEventListener('touchstart', holdOff, { passive: true });
  rail.addEventListener('touchmove', holdOff, { passive: true });

  var drag = { armed: false, startX: 0, startLeft: 0 };

  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') { holdOff(); return; }
    if (e.button !== 0) return;
    drag.armed = true;
    drag.startX = e.clientX;
    drag.startLeft = rail.scrollLeft;
    st.dragging = false;
  });

  rail.addEventListener('pointermove', function (e) {
    if (!drag.armed) return;
    var moved = e.clientX - drag.startX;
    if (!st.dragging && Math.abs(moved) > 3) {
      st.dragging = true;
      rail.classList.add('is-dragging');
      rail.setPointerCapture(e.pointerId);
    }
    if (st.dragging) rail.scrollLeft = drag.startLeft - moved;
  });

  function letGo() {
    if (!drag.armed) return;
    drag.armed = false;
    st.dragging = false;
    rail.classList.remove('is-dragging');
    holdOff();
  }
  rail.addEventListener('pointerup', letGo);
  rail.addEventListener('pointercancel', letGo);
})();
