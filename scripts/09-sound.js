/* Sound for the portfolio - everything is synthesized live with Web Audio.
   Effects use a networking vocabulary (relay clicks, sonar pings, packet blips).
   Music is a small generative sequencer: a slow sonar-and-pulse bed in dark mode,
   a bright pentatonic mallet loop in day mode. Browsers only allow audio after a
   first click, tap or key press, so sound starts on that first interaction unless
   the visitor has muted it before. */
(function(){
  var btns = [].slice.call(document.querySelectorAll('.sfx-btn'));
  var root = document.documentElement;
  var ctx = null, master, sfxBus, musBus, echo, on = true, armed = false, timer = null, nextT = 0, step = 0, lastHover = 0;
  try{ if(localStorage.getItem('kh-sound') === 'off') on = false; }catch(e){}

  function ensure(){
    if(ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = .9; master.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = .5; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(master);
    /* soft feedback echo for pings and mallets */
    echo = ctx.createDelay(1); echo.delayTime.value = .34;
    var fb = ctx.createGain(); fb.gain.value = .38;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
    echo.connect(lp); lp.connect(fb); fb.connect(echo); lp.connect(musBus);
    return ctx;
  }
  function dayMode(){ return root.getAttribute('data-theme') === 'light'; }

  /* ---------- effects ---------- */
  function env(g, t, a, d, peak){ g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(f, t, d, type, peak, f2, bus){
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    env(g, t, .006, d, peak || .2); o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + d + .05);
  }
  function noise(t, d, peak, freq){
    var n = Math.floor(ctx.sampleRate * d), b = ctx.createBuffer(1, n, ctx.sampleRate), c = b.getChannelData(0);
    for(var i = 0; i < n; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(); s.buffer = b;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 3000; f.Q.value = 1.2;
    var g = ctx.createGain(); g.gain.value = peak || .2; s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
  }
  var lib = {
    hover: function(t){ tone(1180, t, .05, 'sine', .05, 1560); },
    click: function(t){ noise(t, .03, .22, 3600); tone(1700, t, .03, 'square', .05); },
    hop:   function(t){ tone(740, t, .06, 'triangle', .07, 980); },
    ping:  function(t){ tone(1318.5, t, .9, 'sine', .11); tone(1318.5, t + .3, .9, 'sine', .04); },
    deliver: function(t){ tone(659.25, t, .22, 'triangle', .13); tone(987.77, t + .11, .4, 'triangle', .13); },
    cut:   function(t){ noise(t, .28, .3, 2200); tone(520, t, .3, 'sawtooth', .09, 90); },
    restore: function(t){ tone(440, t, .12, 'triangle', .1); tone(587.33, t + .08, .12, 'triangle', .1); tone(880, t + .16, .24, 'triangle', .11); },
    drop:  function(t){ tone(160, t, .35, 'sine', .22, 55); noise(t, .12, .12, 500); },
    night: function(t){ tone(420, t, .9, 'sine', .08, 130); },
    morning: function(t){ [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i){ tone(f, t + i * .07, .6, 'triangle', .07); }); },
    chime: function(t){ tone(880, t, .5, 'sine', .1); tone(1318.5, t + .12, .8, 'sine', .08); }
  };
  function play(name, arg){
    if(!on || !ctx || ctx.state !== 'running') return;
    try{ (lib[name] || lib.click)(ctx.currentTime + .005, arg); }catch(e){}
  }

  /* ---------- music ---------- */
  var DARK_ROOTS = [55, 43.65, 65.41, 49], DARK_CH = [[220,261.63,329.63],[174.61,220,261.63],[196,261.63,329.63],[196,246.94,293.66]];
  var PENT = [523.25, 587.33, 659.25, 783.99, 880, 1046.5], DAY_ROOTS = [65.41, 55, 87.31, 98];
  var DAY_PAT = [0,2,3,-1,4,3,2,-1, 0,2,4,5,4,3,2,1];
  var DARK_PINGS = [880, 1046.5, 1318.5, 784, 1174.7];
  function pad(f, t, dur, peak){
    [0, 1.004].forEach(function(m){
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * (m || 1);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + dur * .4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(musBus); o.start(t); o.stop(t + dur + .1);
    });
  }
  function mus(f, t, d, type, peak, send){
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; env(g, t, .01, d, peak);
    o.connect(g); g.connect(musBus); if(send){ var s = ctx.createGain(); s.gain.value = .5; g.connect(s); s.connect(echo); }
    o.start(t); o.stop(t + d + .05);
  }
  function stepDark(i, t){
    var bar = Math.floor(i / 8) % 4, k = i % 8;
    if(k === 0){ mus(DARK_ROOTS[bar], t, 3.2, 'sine', .55); DARK_CH[bar].forEach(function(f){ pad(f, t, 3.6, .035); }); }
    if(i % 16 === 6){ mus(DARK_PINGS[Math.floor(i / 16) % DARK_PINGS.length], t, 1.3, 'sine', .09, true); }
    if(k % 2 === 1 && k !== 7){ mus(1900, t, .03, 'square', .012); }
  }
  function stepDay(i, t){
    var bar = Math.floor(i / 8) % 4, k = i % 16, n = DAY_PAT[k];
    if(i % 8 === 0) mus(DAY_ROOTS[bar], t, 1.4, 'sine', .4);
    if(n >= 0) mus(PENT[n] * (bar === 2 ? .75 : 1), t, .42, 'triangle', .12, true);
    if(i % 4 === 2) mus(PENT[(n + 2 + 6) % 6] * 2, t + .02, .2, 'sine', .03);
  }
  function sched(){
    if(!ctx || ctx.state !== 'running') return;
    var day = dayMode(), sd = day ? .326 : .43;
    if(nextT < ctx.currentTime) nextT = ctx.currentTime + .05;
    while(nextT < ctx.currentTime + .5){ (day ? stepDay : stepDark)(step, nextT); nextT += sd; step++; }
  }
  function startMusic(){
    if(!ctx || timer) return;
    nextT = ctx.currentTime + .1; step = 0;
    timer = setInterval(sched, 120);
    musBus.gain.cancelScheduledValues(ctx.currentTime); musBus.gain.setTargetAtTime(.2, ctx.currentTime, .8);
  }
  function stopMusic(){
    if(!ctx) return;
    musBus.gain.cancelScheduledValues(ctx.currentTime); musBus.gain.setTargetAtTime(0, ctx.currentTime, .25);
    if(timer){ var t = timer; timer = null; setTimeout(function(){ clearInterval(t); }, 900); }
  }

  /* ---------- control ---------- */
  function paint(){
    btns.forEach(function(b){
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var l = b.querySelector('.sfx-lab'); if(l) l.textContent = on ? 'Sound on' : 'Sound off';
    });
  }
  function arm(first){
    if(!ensure()) return;
    var go = function(){ if(on){ startMusic(); if(first) play('chime'); } };
    if(ctx.state === 'suspended') ctx.resume().then(go).catch(function(){}); else go();
  }
  function firstGesture(){
    if(armed) return; armed = true;
    ['pointerdown','keydown','touchstart'].forEach(function(ev){ window.removeEventListener(ev, firstGesture, true); });
    arm(true);
  }
  ['pointerdown','keydown','touchstart'].forEach(function(ev){ window.addEventListener(ev, firstGesture, true); });
  btns.forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      on = !on; try{ localStorage.setItem('kh-sound', on ? 'on' : 'off'); }catch(_){}
      paint(); armed = true;
      if(!ensure()) return;
      if(on){ ctx.resume().then(function(){ startMusic(); play('chime'); }); } else { stopMusic(); }
    });
  });
  document.addEventListener('visibilitychange', function(){
    if(!ctx) return;
    if(document.hidden) ctx.suspend(); else if(on) ctx.resume();
  });
  /* hover blips and click ticks, never on touch-only devices for hover */
  var fine = window.matchMedia('(hover: hover)').matches;
  var TARGET = 'a,button,[role="button"],.kh-pj,.kh-tool,.ifc';
  if(fine) document.addEventListener('pointerover', function(e){
    var t = e.target.closest && e.target.closest(TARGET); if(!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
    var now = performance.now(); if(now - lastHover < 90) return; lastHover = now; play('hover');
  });
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest(TARGET); if(t && !t.classList.contains('sfx-btn') && !t.classList.contains('thm-btn')) play('click');
  });
  /* a sonar ping when a new section scrolls into view */
  var seenFirst = false;
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){ if(x.isIntersecting){ if(seenFirst) play('ping'); } });
      seenFirst = true;
    }, {threshold:.45});
    [].forEach.call(document.querySelectorAll('section.sec, #summary'), function(s){ io.observe(s); });
  }
  window.sfx = { play: play, isOn: function(){ return on; } };
  paint();
})();
