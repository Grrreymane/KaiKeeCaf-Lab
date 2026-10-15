// ==== boot: canvas, fit to screen, build the shop, main loop
const CV = document.getElementById('c'), CTX = CV.getContext('2d');
function fit() {   // keep 9:16, as big as the window allows
  const s = Math.min(window.innerWidth / 720, window.innerHeight / 1280);
  CV.style.width = R(720 * s) + 'px'; CV.style.height = R(1280 * s) + 'px';
}
function buildWorld() {
  BG = mk(WW, 1280); drawBackground(BG.getContext('2d'));
  buildStatics(); bindShelves(); wireAfters(); initSeats();
  for (const f of FURN) group(...f);
  SHADE = mk(WW, 1280);
}
const SPEED_X = () => DIALOG || DESK ? 1 : (W && isOpenPhase() || (W && PHASE === 'prep')) ? (W.speed || 1) : 1;
let achT = 1;
function step(dt) {
  gtime += dt;
  stepStory(); stepDesk(dt); stepCars(dt);
  if ((achT -= dt) <= 0) { achT = 1; if (W && PHASE !== 'title') checkAch(); }   // achievements, about once a second
  if (simPaused()) { stepWalkers(dt); for (const p of POPS) p.t += dt; return; }
  stepDay(dt); simStep(dt);
}
const FONTS_READY = Promise.all([document.fonts.load(fp(12)), document.fonts.load(sr(26), '街记冰室')]).catch(() => {});
FONTS_READY.then(() => {
  fit(); window.addEventListener('resize', fit);
  W = newState();   // a placeholder shop behind the title screen
  buildWorld(); bindShelves(); computeStops(); redoShadows();
  setupInput(CV);
  window.__gameBooted = true;
  render(CTX);   // first frame now (headless screenshots may never get a rAF)
  /*TEST_HOOK*/
  let last = performance.now();
  const loop = now => { const dt = clamp((now - last) / 1000, 0, .05); last = now; for (let k = 0; k < SPEED_X(); k++) step(dt); render(CTX); requestAnimationFrame(loop); };   // fast-forward = several sim steps per frame
  requestAnimationFrame(loop);
});
