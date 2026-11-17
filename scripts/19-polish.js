
(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var heads = [].slice.call(document.querySelectorAll('.kh-head'));
  if(!heads.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('rv-in'); io.unobserve(e.target); }
    });
  }, {rootMargin:'0px 0px -10% 0px'});
  heads.forEach(function(h){
    if(h.getBoundingClientRect().top < innerHeight) h.classList.add('rv-in'); else io.observe(h);
  });
  document.documentElement.classList.add('rv-on');
})();
