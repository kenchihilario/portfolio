
(function () {
  var bar = document.getElementById('bar');
  var hero = document.querySelector('.kh-hero');
  var home = document.getElementById('totop');
  if (home) home.addEventListener('click', function () { window.scrollTo(0, 0); });
  if (!bar || !hero) return;

  var watcher = new IntersectionObserver(function (entries) {
    bar.classList.toggle('on', !entries[0].isIntersecting);
  }, { rootMargin: '-70px 0px 0px 0px' });
  watcher.observe(hero);
})();
