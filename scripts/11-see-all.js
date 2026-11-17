
(function(){
  var VIEWS = [
    { btn:'.pa-open-proj', ov:'#pa', box:'#pa-grid', src:'.proj-grid .proj',
      link:'.proj', linkCloses:true },
    { btn:'.pa-open-xp',   ov:'#xa', box:'#xa-grid', src:'.xp .xp-row',
      link:null,   linkCloses:false },

    { btn:'.pa-open-gal',  ov:'#ga', box:'#ga-grid', src:'#events .gal .ph',
      link:'.ph',  linkCloses:false }
  ];
  VIEWS.forEach(function(v){
    var opens = [].slice.call(document.querySelectorAll(v.btn)),
        ov    = document.querySelector(v.ov),
        box   = document.querySelector(v.box);
    if(!opens.length || !ov || !box) return;
    var close = ov.querySelector('.pa-close');
    var originals = [];

    function build(){
      box.innerHTML = ''; originals = [];
      var seen = {};
      [].forEach.call(document.querySelectorAll(v.src), function(card){
        var h = card.querySelector('h3') || card.querySelector('figcaption');
        var key = h ? h.textContent.trim() : card.innerHTML.slice(0, 60);
        if(seen[key]) return;
        seen[key] = 1;
        originals.push(card);
        var c = card.cloneNode(true);
        c.removeAttribute('id');

        if(c.hasAttribute('aria-expanded')) c.setAttribute('aria-expanded', 'true');
        box.appendChild(c);
      });

      if(window.wireHoverSound) window.wireHoverSound(box);
    }
    function show(){
      build();
      ov.classList.add('on');
      document.body.classList.add('pa-open');
      if(close) close.focus();
    }
    function hide(){
      ov.classList.remove('on');
      document.body.classList.remove('pa-open');
      opens[0].focus();
    }
    opens.forEach(function(b){ b.addEventListener('click', show); });
    if(close) close.addEventListener('click', hide);
    ov.addEventListener('click', function(e){ if(e.target === ov) hide(); });
    addEventListener('keydown', function(e){
      if(e.key === 'Escape' && ov.classList.contains('on')) hide();
    });

    if(v.link) box.addEventListener('click', function(e){
      var c = e.target.closest(v.link);
      if(!c) return;
      var i = [].indexOf.call(box.children, c);
      if(v.linkCloses) hide();
      if(originals[i]) originals[i].click();
    });
  });
})();
