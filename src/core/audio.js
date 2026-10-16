// ==== audio: small soft WebAudio blips (no files). Context is created / resumed on pointerup (a real user gesture on phones).
let AC = null, SFXBUS = null, MUTED = false;
try { MUTED = localStorage.getItem(SAVE_KEY + '-mute') === '1'; } catch (e) {}
function audioUnlock() {
  try {
    if (!AC) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; AC = new A(); SFXBUS = AC.createGain(); SFXBUS.gain.value = .5;
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000; SFXBUS.connect(lp); lp.connect(AC.destination); }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) {}
}
function setMuted(m) { MUTED = m; try { localStorage.setItem(SAVE_KEY + '-mute', m ? '1' : '0'); } catch (e) {} }
const lastSfx = {};
// one note: sine / triangle, quick attack, exponential tail; start from 0 so delayed notes don't click
function tone(f, d, type = 'sine', vol = .3, delay = 0, slide = 0) {
  if (!AC || MUTED) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + d);
  g.gain.value = 0; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(SFXBUS); o.start(t); o.stop(t + d + .02);
}
function limited(name, gap, fn) { const now = AC ? AC.currentTime : 0; if (lastSfx[name] && now - lastSfx[name] < gap) return; lastSfx[name] = now; fn(); }
const SFX = {
  tap: () => limited('tap', .05, () => tone(880, .06, 'triangle', .18)),
  coin: () => limited('coin', .12, () => { tone(1320, .09, 'sine', .22); tone(1760, .14, 'sine', .18, .07); }),
  ding: () => limited('ding', .3, () => { tone(988, .35, 'triangle', .16); tone(1480, .3, 'sine', .08, .02); }),
  bell: () => limited('bell', .8, () => { tone(1175, .25, 'sine', .1); tone(1568, .35, 'sine', .08, .1); }),
  buy: () => limited('buy', .1, () => { tone(660, .07, 'triangle', .2); tone(990, .12, 'triangle', .18, .06); }),
  deny: () => limited('deny', .2, () => tone(330, .14, 'triangle', .2, 0, .8)),
  open: () => { tone(784, .2, 'triangle', .18); tone(988, .2, 'triangle', .16, .12); tone(1175, .35, 'triangle', .16, .24); },
  close: () => limited('close', 1, () => { tone(988, .25, 'triangle', .14); tone(784, .4, 'triangle', .14, .15); }),
  door: () => limited('door', 1.4, () => { tone(2093, .5, 'sine', .07); tone(2637, .6, 'sine', .05, .09); }),   // the little bell over the door
  page: () => limited('page', .08, () => noise(.07, 2600, .1)),   // a panel opens: a paper flick
  pour: () => limited('pour', .18, () => noise(.16, 900, .05)),
  oven: () => limited('oven', 2, () => { tone(1319, .3, 'triangle', .1); tone(1047, .45, 'triangle', .1, .16); }),   // a batch is out
  cheer: () => limited('cheer', .6, () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .14, i * .07))),   // goal / achievement
  pop: () => limited('pop', .05, () => tone(600, .05, 'sine', .14, 0, 1.6)),
};
function noise(d, freq, vol, delay = 0) {   // a short burst of filtered noise (paper, pouring, brushes)
  if (!AC || MUTED) return;
  if (!noise.buf) { const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; noise.buf = b; }
  const t = AC.currentTime + delay, src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = noise.buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.connect(f); f.connect(g); g.connect(SFXBUS); src.start(t, Math.random() * .5); src.stop(t + d + .02);
}

// ==== music: one little tune, written out on a 16th-note grid and played by a WebAudio scheduler (no files).
// 'shop' — bouncy, swung, F major (Fmaj7 Dm7 Gm7 C7 | Fmaj7 D7 Gm7-C7 F): plucky lead, walking bass, off-beat chords, brushes.
// 'story' — the same tune slowed down for 小剧场 and scenes: soft sine lead, held chords, no drums.
let MUSIC_OFF = false; try { MUSIC_OFF = localStorage.getItem(SAVE_KEY + '-music') === '0'; } catch (e) {}
function setMusic(on) { MUSIC_OFF = !on; try { localStorage.setItem(SAVE_KEY + '-music', on ? '1' : '0'); } catch (e) {} }
const MEL = [   // [step (0-15), midi] per bar
  [[0, 69], [2, 72], [4, 76], [6, 74], [7, 72], [8, 69], [12, 67], [14, 69]],
  [[0, 65], [2, 69], [4, 72], [7, 69], [8, 74], [10, 72], [12, 69]],
  [[0, 70], [2, 74], [4, 77], [6, 76], [7, 74], [8, 72], [10, 70], [12, 69], [14, 67]],
  [[0, 64], [2, 67], [4, 70], [6, 69], [7, 67], [8, 64], [14, 67]],
  [[0, 69], [2, 72], [4, 76], [6, 77], [7, 76], [8, 74], [12, 72], [14, 74]],
  [[0, 72], [2, 74], [4, 78], [6, 76], [8, 74], [10, 72], [12, 69], [14, 66]],
  [[0, 70], [2, 74], [4, 72], [6, 70], [8, 67], [10, 70], [12, 69], [14, 67]],
  [[0, 65], [2, 69], [4, 72], [8, 77]],
];
const CHORD = [[57, 60, 64], [57, 60, 65], [58, 62, 65], [58, 64, 67], [57, 60, 64], [54, 57, 60], [58, 62, 65], [57, 60, 65]], ROOT = [41, 38, 43, 36, 41, 38, 43, 41];
const mhz = m => 440 * Math.pow(2, (m - 69) / 12);
let MUS = null;   // { kind, bus, next (time of the next 16th), step }
function musicNote(m, t, d, type, vol, bus) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(mhz(m), t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (type === 'sine' && d > .4 ? .08 : .01)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + .05);
}
function musicStep(M, t) {
  const slow = M.kind === 'story', bar = Math.floor(M.step / 16) % 8, st = M.step % 16, six = 60 / (slow ? 76 : 112) / 4;
  const sw = st % 4 === 2 ? six * .33 : 0, tt = t + sw;   // swing the off-beat 8ths
  for (const [s_, m] of MEL[bar]) if (s_ === st) { const nx = MEL[bar].find(q => q[0] > st), len = ((nx ? nx[0] : 16) - st) * six;
    if (slow) musicNote(m, tt, Math.max(.3, len * 1.1), 'sine', .16, M.bus); else { musicNote(m, tt, Math.min(.28, len * .9), 'square', .035, M.bus); musicNote(m + 12, tt, .12, 'triangle', .05, M.bus); } }
  const root = ROOT[bar], ch = (bar === 6 && st >= 8) ? [58, 64, 67] : CHORD[bar], r2 = (bar === 6 && st >= 8) ? 36 : root;
  if (slow) { if (st === 0 || (bar === 6 && st === 8)) { for (const m of ch) musicNote(m, t, six * 8, 'sine', .05, M.bus); musicNote(r2, t, six * 8, 'triangle', .12, M.bus); } return; }
  if (st === 0 || st === 8) musicNote(r2, tt, six * 3, 'triangle', .2, M.bus);   // bass: root, fifth, root, a step up to the next bar
  if (st === 4 || st === 12) musicNote(r2 + 7, tt, six * 2.5, 'triangle', .16, M.bus);
  if (st === 14) musicNote(r2 + (bar % 2 ? 2 : -1), tt, six * 1.5, 'triangle', .12, M.bus);
  if (st === 4 || st === 12) for (const m of ch) musicNote(m + 12, tt, six * 1.2, 'triangle', .03, M.bus);   // off-beat chord stabs
  if (st % 2 === 0) { const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); if (!noise.buf) noise(.001, 1000, .0001);   // brushes on the 8ths
    src.buffer = noise.buf; f.type = 'highpass'; f.frequency.value = 6000; g.gain.setValueAtTime(st % 4 ? .025 : .04, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + .05); src.connect(f); f.connect(g); g.connect(M.bus); src.start(tt, Math.random() * .5); src.stop(tt + .06); }
  if (st === 0 || st === 8) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(110, tt); o.frequency.exponentialRampToValueAtTime(45, tt + .12); g.gain.setValueAtTime(.18, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + .14); o.connect(g); g.connect(M.bus); o.start(tt); o.stop(tt + .16); }   // a soft kick
}
function musicTick(want) {   // called every frame with the track that should play ('shop' / 'story' / null)
  if (!AC) return; if (MUTED || MUSIC_OFF) want = null;
  if (MUS && MUS.kind !== want) { const g = MUS.bus.gain, t = AC.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + .6); const old = MUS.bus; setTimeout(() => old.disconnect(), 900); MUS = null; }
  if (!MUS && want) { const bus = AC.createGain(); bus.gain.setValueAtTime(0, AC.currentTime); bus.gain.linearRampToValueAtTime(.55, AC.currentTime + 1); bus.connect(SFXBUS); MUS = { kind: want, bus, next: AC.currentTime + .1, step: 0 }; }
  if (!MUS) return; const six = 60 / (MUS.kind === 'story' ? 76 : 112) / 4;
  while (MUS.next < AC.currentTime + .25) { musicStep(MUS, MUS.next); MUS.next += six; MUS.step++; }
}
