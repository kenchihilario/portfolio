
window.KenchiMusic = (function(){
  var DUR = 32, TAU = Math.PI * 2;
  function snap(f){ return Math.round(f * DUR) / DUR; }
  function hz(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  function make(ctx, kind){
    var sr = ctx.sampleRate, n = Math.floor(DUR * sr);
    var L = new Float32Array(n), R = new Float32Array(n);
    var pro = kind === 'pro';
    var bpm = pro ? 60 : 84, beat = 60 / bpm, bars = pro ? 8 : 12;
    var chords = pro
      ? [[57,60,64],[53,57,60],[48,52,55],[55,59,62]]
      : [[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]];
    var barLen = DUR / (pro ? 8 : 8);
    var i, c, k, t, v;

    for(c = 0; c < 8; c++){
      var ch = chords[c % 4], t0 = c * barLen;
      for(k = 0; k < ch.length; k++){
        var f = snap(hz(ch[k] - (pro ? 12 : 0))), det = snap(f * 1.004), pan = (k / (ch.length - 1 || 1)) - .5;
        var s0 = Math.floor(t0 * sr), s1 = Math.floor((t0 + barLen + 1.2) * sr);
        for(i = s0; i < s1; i++){
          var tt = (i - s0) / sr, ii = i % n;
          var env = Math.sin(Math.PI * Math.min(1, tt / (barLen + 1.2)));
          env *= env;
          v = (Math.sin(TAU * f * i / sr) + .6 * Math.sin(TAU * det * i / sr)) * env * (pro ? .05 : .035);
          L[ii] += v * (.6 - pan * .5); R[ii] += v * (.6 + pan * .5);
        }
      }
    }
    if(pro){

      for(t = 0; t < DUR - 1; t += beat * 2){
        var root = snap(hz(chords[Math.floor(t / barLen) % 4][0] - 24)), s = Math.floor(t * sr);
        for(i = 0; i < sr * 1.4; i++){
          var e = Math.exp(-i / (sr * .28)) * (1 - Math.exp(-i / (sr * .01)));
          v = Math.sin(TAU * root * (s + i) / sr) * e * .16;
          L[(s + i) % n] += v; R[(s + i) % n] += v;
        }
      }
    } else {

      var step = beat / 2, idx = 0;
      for(t = 0; t < DUR - 1.6; t += step, idx++){
        var cc = chords[Math.floor(t / barLen) % 4];
        var note = cc[[0,1,2,3,2,1,3,2][idx % 8]] + 12, fn = snap(hz(note)), s2 = Math.floor(t * sr);
        var pn = ((idx % 5) / 4 - .5) * .6;
        for(i = 0; i < sr * 1.5; i++){
          var e2 = Math.exp(-i / (sr * .22)) * (1 - Math.exp(-i / (sr * .004)));
          v = (Math.sin(TAU * fn * (s2 + i) / sr) + .35 * Math.sin(TAU * fn * 2 * (s2 + i) / sr)) * e2 * .09;
          L[(s2 + i) % n] += v * (.7 - pn); R[(s2 + i) % n] += v * (.7 + pn);
        }
      }
    }

    var peak = 0;
    for(i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    var g = peak ? .8 / peak : 1;
    for(i = 0; i < n; i++){ L[i] *= g; R[i] *= g; }
    var buf = ctx.createBuffer(2, n, sr);
    buf.getChannelData(0).set(L); buf.getChannelData(1).set(R);
    return buf;
  }
  return { make: make };
})();
