// ==== boot: canvas, fit to screen, build the shop, main loop
const CV = document.getElementById('c'), CTX = CV.getContext('2d');
function fit() {   // keep 9:16, as big as the *visible* area allows (phone toolbars / keyboards shrink it), centred in it
  const V = window.visualViewport, vw = V ? V.width : window.innerWidth, vh = V ? V.height : window.innerHeight, ox = V ? V.offsetLeft : 0, oy = V ? V.offsetTop : 0;
  const s = Math.min(vw / 720, vh / 1280), w = Math.floor(720 * s), h = Math.floor(1280 * s);
  Object.assign(CV.style, { width: w + 'px', height: h + 'px', left: Math.round(ox + (vw - w) / 2) + 'px', top: Math.round(oy + (vh - h) / 2) + 'px' });
}
function buildWorld() {
  BG = mk(WW, 1280); drawBackground(BG.getContext('2d'));
  buildStatics(); bindShelves(); wireAfters(); initSeats();
  for (const f of FURN) group(...f);
  SHADE = mk(WW, 1280);
}
const SPEED_X = () => DIALOG || DESK ? 1 : (W && isOpenPhase() || (W && PHASE === 'prep')) ? (W.speed || 1) : 1;
let achT = 1;
const STORY_KEYS = ['ep', 'loyal', 'giftshelf'], wantMusic = () => DIALOG && (STORY_KEYS.includes(DIALOG.key) || String(DIALOG.key).startsWith('aff_') || DIALOG.bg) ? 'story' : 'shop';   // 小剧场 and heart-to-hearts get the slow version
function step(dt) {
  gtime += dt;
  stepStory(); stepDesk(dt); stepCars(dt);
  if ((achT -= dt) <= 0) { achT = 1; if (W && PHASE !== 'title') checkAch(); }   // achievements, about once a second
  if (simPaused()) { stepWalkers(dt); for (const p of POPS) p.t += dt; return; }
  stepDay(dt); simStep(dt);
}
const FONTS_READY = Promise.all([document.fonts.load(fp(FS)), document.fonts.load(sr(26), '街记冰室')]).catch(() => {});
FONTS_READY.then(() => {
  fit(); window.addEventListener('resize', fit); window.addEventListener('orientationchange', () => setTimeout(fit, 200));
  if (window.visualViewport) { visualViewport.addEventListener('resize', fit); visualViewport.addEventListener('scroll', fit); }
  W = newState();   // a placeholder shop behind the title screen
  buildWorld(); bindShelves(); computeStops(); redoShadows();
  setupInput(CV);
  window.__gameBooted = true;
  render(CTX);   // first frame now (headless screenshots may never get a rAF)
  /*TEST_HOOK*/
  let last = performance.now();
  const loop = now => { const dt = clamp((now - last) / 1000, 0, .05); last = now; rtime += dt; for (let k = 0; k < SPEED_X(); k++) step(dt); render(CTX); musicTick(wantMusic()); requestAnimationFrame(loop); };   // fast-forward = several sim steps per frame
  requestAnimationFrame(loop);
});
