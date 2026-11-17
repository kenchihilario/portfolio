(function(){
  var wrap = document.getElementById('hwrap');
  var chip = document.getElementById('flip');
  var label = chip.querySelector('span');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toggle(){
    var off = document.body.classList.toggle('offline');
    /* mirror it onto <html>: the palette tokens and the scrollbar live there */
    document.documentElement.classList.toggle('offline', off);
    label.textContent = off ? 'Back to security' : 'See the other side';
    document.getElementById('t-sec').hidden = off;
    document.getElementById('t-alt').hidden = !off;
    document.getElementById('cols-on').hidden = off;
    document.getElementById('cols-off').hidden = !off;
    /* swap the whole page body: work sections <-> galleries */
    document.querySelectorAll('[data-view="pro"]').forEach(function(el){ el.hidden = off; });
    document.querySelectorAll('[data-view="off"]').forEach(function(el){ el.hidden = !off; });
    document.dispatchEvent(new CustomEvent('viewflip', {detail:{offline:off}}));
  }
  /* the hero CTA lives inside the toggle area - don't flip the page on its click */
  var heroCta = document.querySelector('.hero-cta a');
  if(heroCta) heroCta.addEventListener('click', function(e){ e.stopPropagation(); });
  /* flipping mid-page is disorienting - wipe, swap, and return to the top.
     Near the hero there is no wipe at all - the toggle's own lens/image swap
     is the transition, and it is a good one, so a small smooth scroll to (0,0)
     riding along with it goes unnoticed. That covers the whole hero, not
     just its very top: as long as any part of the logo tile is still on
     screen, this still counts as "near the hero" - it is only once its
     bottom edge has scrolled past the top of the viewport that the page
     reads as properly mid-scroll. From there the wipe curtain is already
     the transition and already fully covers the screen - an animated
     scroll-to-top running underneath it used to keep going after the
     curtain lifted, so the page was visibly still scrolling once it could
     be seen again. Jumping instantly there instead means the curtain stays
     the only thing anyone sees move. */
  var wipe = document.getElementById('wipe');
  /* .stage-panel is the cream panel holding the photo and the sticker set -
     certifications in the security view, social links in the other - and it
     stays on screen (and the same element) across both breakpoints and both
     views, unlike the logo marks above it, which swap out or disappear
     depending on which. Its bottom edge is the actual end of the hero as
     someone reading down the page would judge it - past the stickers, not
     just past the headline. */
  var stage = document.querySelector('.stage-panel');
  var reducedMo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function nearHero(){
    return stage ? stage.getBoundingClientRect().bottom > 0 : window.scrollY < 40;
  }
  function flip(){
    /* both views' heroes occupy the same rough shape - headline, stage,
       stickers - just with different content in it, so there is nothing to
       reset here: staying exactly where the swipe left off IS the "same
       position" in the other view. Only once you are genuinely past the
       hero, into a page whose structure no longer matches, is a reset owed. */
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
