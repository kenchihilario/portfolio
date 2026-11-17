(function(){
  var wrap = document.getElementById('hwrap');
  var chip = document.getElementById('flip');
  var label = chip.querySelector('span');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toggle(){
    var off = document.body.classList.toggle('offline');

    document.documentElement.classList.toggle('offline', off);
    label.textContent = off ? 'Back to security' : 'See the other side';
    document.getElementById('t-sec').hidden = off;
    document.getElementById('t-alt').hidden = !off;
    document.getElementById('cols-on').hidden = off;
    document.getElementById('cols-off').hidden = !off;

    document.querySelectorAll('[data-view="pro"]').forEach(function(el){ el.hidden = off; });
    document.querySelectorAll('[data-view="off"]').forEach(function(el){ el.hidden = !off; });
    document.dispatchEvent(new CustomEvent('viewflip', {detail:{offline:off}}));
  }

  var heroCta = document.querySelector('.hero-cta a');
  if(heroCta) heroCta.addEventListener('click', function(e){ e.stopPropagation(); });

  var wipe = document.getElementById('wipe');

  var stage = document.querySelector('.stage-panel');
  var reducedMo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function nearHero(){
    return stage ? stage.getBoundingClientRect().bottom > 0 : window.scrollY < 40;
  }
  function flip(){

    if(nearHero()){ toggle(); return; }
    if(reducedMo){
      toggle();
      if(window.scrollY) window.scrollTo(0, 0);
      return;
    }
    wipe.classList.add('on');
    setTimeout(function(){
      toggle();
      window.scrollTo({top:0, left:0, behavior:'instant'});
      requestAnimationFrame(function(){ wipe.classList.remove('on'); });
    }, 230);
  }
  window.flipView = flip;
  chip.addEventListener('click', function(e){ e.stopPropagation(); flip(); });

  var ph = document.getElementById('ph');
  if(ph) ph.addEventListener('click', function(e){
    e.stopPropagation();
    if(!ph.classList.contains('revealed')){
      e.preventDefault();
      ph.classList.add('revealed');
    }
  });
})();
