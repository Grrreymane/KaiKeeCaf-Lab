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
};
