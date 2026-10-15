// ==== art: dialogue portraits (busts, 200 x 240 device px), drawn in the same language as the in-game sprites and food:
// fine 1px detail, light from top-left (cel: each colour run lighter on the left / top, 30% darker on the right),
// skin shaded by hand (right cheek, under the chin), eyes built like the sprites' (dark rounded eye, brown iris below,
// big highlight top-right + small lavender one), dithered blush, coloured outline (neighbour colour pushed dark).
const BUSTS = {
  yao: {},
  qing: {},   // dialogue bust = the shop sprite (spriteBustA)
  rong: {}, hui: {}, cheng: {},   // 荣叔 (材料店), 惠姐, 阿澄 (suppliers): same
  kun: { skin: '#e9b48a', hair: '#e9e7e2', hairD: '#c9c6bf', hs: 'crop', brow: '#8f8a83', eyeStyle: 'soft', eyeR: .7, browFine: true, browT: 4, browTilt: 3, mouthDy: -3, eye: 'small', mouth: 'stern', top: '#c9ad7f', collar: '#dcc49a', apron: '#efe8d8', stain: '#d6c9a8', arms: 'crossed', old: true, jaw: 'square' },
  lin: { skin: '#f6d0ae', hair: '#3a2630', hs: 'bun', clip: '#d9372a', brow: '#4a3038', eyeStyle: 'soft', eyeX: 21, browFine: true, browArch: 2.5, blushStyle: 'grad', mouthDy: -5, eye: 'big', lash: true, mouth: 'smile', blush: true, top: '#e47b97', floral: '#ffd3dd', apron: '#3f8f74', arms: 'clasp' },
  wen: { skin: '#f6d0ae', hair: '#2a2024', hs: 'pony', tie: '#3f86d6', brow: '#3a2a2e', eyeStyle: 'soft', eyeR: .88, eyeX: 21, browFine: true, browArch: 0, blushStyle: 'grad', mouthDy: -4, eye: 'big', lash: true, mouth: 'lips', lips: '#c8546a', blush: true, top: '#f2f2ee', collar: '#ffffff', apron: '#3f8f74', arms: 'down', roll: true },
  shao: { skin: '#f9dcc6', hair: '#6b3f26', hs: 'side', brow: '#4a2a18', eyeStyle: 'soft', eyeR: .92, eyeX: 21, browFine: true, browT: 4, browArch: 2, mouthDy: -4, eye: 'mid', mouth: 'grin', top: '#4a4046', inner: '#e9e3d6', zip: '#c9cdd0', arms: 'down', leather: true },
  hero_f: { skin: '#f6d0ae', hair: '#5a3424', hs: 'bob', hairDetail: true, eyeStyle: 'soft', browFine: true, eyeX: 21, blushStyle: 'grad', mouthDy: -5, brow: '#4a2a1e', eye: 'big', lash: true, mouth: 'smile', blush: true, top: '#f0c860', collar: '#fff4dc', apron: '#3f8f74', arms: 'down', pocket: true },
  hero_m: { skin: '#f4cca8', hair: '#2e2420', hs: 'short', brow: '#2e2420', eyeStyle: 'soft', eyeR: .92, eyeX: 21, browFine: true, browT: 4, mouthDy: -5, eye: 'mid', mouth: 'smile', top: '#8cc0e0', collar: '#e9f4fb', apron: '#3f8f74', arms: 'down', pocket: true },
};
const BUST_CACHE = {};
let BUST_STYLE = 'A';   // 'B': softer warm outline, anime shine band on the hair, two-step cheek shading, rosy lower lids, slightly bigger eyes
function celPass(G, skip) {   // same idea as the sprites' shadePass, at portrait scale
  const W = G.w, H = G.h, src = G.d.slice(), ok = c => c && !skip.has(c);
  for (let y = 0; y < H; y++) for (let x = 0; x < W;) {
    const c = src[y * W + x]; if (!ok(c)) { x++; continue; }
    let e = x; while (e + 1 < W && src[y * W + e + 1] === c) e++;
    const n = e - x + 1;
    if (n >= 8) { const d = Math.max(2, R(n * .3)); for (let i = e - d + 1; i <= e; i++) G.d[y * W + i] = shade(c, (i + y) % 2 && i < e - d + 2 ? -11 : -22); for (let i = x; i < x + 2; i++) G.d[y * W + i] = shade(c, 14); }
    x = e + 1;
  }
  for (let x = 0; x < W; x++) for (let y = 0; y < H;) {
    const c = src[y * W + x]; if (!ok(c)) { y++; continue; }
    let e = y; while (e + 1 < H && src[(e + 1) * W + x] === c) e++;
    if (e - y + 1 >= 8) { for (let k = 0; k < 2; k++) G.d[(y + k) * W + x] = shade(G.d[(y + k) * W + x], 10); if (e < H - 1) for (let k = 0; k < 2; k++) G.d[(e - k) * W + x] = shade(G.d[(e - k) * W + x], -12); }
    y = e + 1;
  }
}
function colorOutline(G, rings = 2) {   // coloured outline outside the silhouette (bottom edge is cut by the window, left open)
  for (let r = 0; r < rings; r++) {
    const src = G.d.slice(), at = (x, y) => (x < 0 || y < 0 || x >= G.w || y >= G.h) ? null : src[y * G.w + x], add = [];
    for (let y = 0; y < G.h - 1; y++) for (let x = 0; x < G.w; x++) { if (src[y * G.w + x]) continue; const n = at(x, y + 1) || at(x - 1, y) || at(x + 1, y) || at(x, y - 1); if (n) add.push([x, y, r ? n : mixHex(n, BUST_STYLE === 'B' ? '#6a3a3a' : '#4a3236', BUST_STYLE === 'B' ? .45 : .62)]); }
    add.forEach(([x, y, c]) => G.set(x, y, c));
  }
}
function bust(id) {
  const key = id + BUST_STYLE; if (BUST_CACHE[key]) return BUST_CACHE[key];
  if (STAFF_DEF[id] && typeof spriteBustA !== 'undefined') return (BUST_CACHE[key] = spriteBustA(id));   // every named character, owners included: version A (the in-game sprite, 4x) — the player's final choice   // owner: version A with finer pixels, same features (the smoothed outline was too soft — not pixel enough)   // owner: version A with finer pixels, same features; everyone else: version A   // named characters: the in-game sprite, enlarged (version A)
  return (BUST_CACHE[key] = typeof REAL_BUST !== 'undefined' && REAL_BUST[id] ? realBust(id) : pixelBust(id));   // hero_f: pixel face on the semi-real body (portrait-real.js)
}
function pixelBust(id) {
  const o = BUSTS[id], G = new Grid(200, 240), TT = o0 => o0.turn ? 1 : 0, cx = 100 + 3 * TT(BUSTS[id]), sk = o.skin, skD = shade(sk, -16), skDD = shade(sk, -30), H = o.hair, HD = o.hairD || shade(H, -26), HL = shade(H, 40);
  const E = '#2a2028', iris = '#6a4030', irisL = shade(iris, 46), line = (x0, y0, x1, y1, c, w = 2) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) G.rect(R(x0 + (x1 - x0) * i / n - w / 2), R(y0 + (y1 - y0) * i / n - w / 2), w, w, c); };
  // ---- back hair (behind head and shoulders)
  if (o.hs === 'pony') { G.ell(cx + 46, 112, 15, 44, H); G.ell(cx + 52, 150, 11, 30, H); G.rect(cx + 34, 64, 12, 9, o.tie); }
  if (o.hs === 'bun' || o.hs === 'bob') { G.ell(cx, 92, 50, 58, H); }
  // ---- body
  G.ell(cx, 256, 98, 92, o.top); G.rect(4, 214, 192, 26, o.top);   // rounded shoulders from y 164
  if (o.leather) { G.rect(cx - 18, 168, 36, 72, o.inner); G.rect(cx - 2, 176, 4, 64, o.zip); G.tri(cx - 18, 168, cx, 206, cx - 46, 186, shade(o.top, 22)); G.tri(cx + 18, 168, cx, 206, cx + 46, 186, shade(o.top, 22)); }
  if (o.floral) for (let i = 0; i < 40; i++) { const x = 14 + (i * 53) % 172, y = 172 + (i * 31) % 66; if (G.get(x, y) !== o.top || G.get(x - 2, y) !== o.top || G.get(x + 2, y) !== o.top) continue; G.set(x, y, '#ffffff'); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) G.set(x + dx, y + dy, o.floral); }
  G.rect(cx - 13, 126, 26, 44, skD); G.rect(cx - 13, 126, 26, 6, skDD);   // neck, shadow under the chin
  if (o.collar) { G.tri(cx - 15, 158, cx, 184, cx - 32, 176, o.collar); G.tri(cx + 15, 158, cx, 184, cx + 32, 176, o.collar); }
  if (o.apron) {
    G.rect(cx - 38, 180, 76, 60, o.apron); G.rect(cx - 36, 164, 8, 18, shade(o.apron, -8)); G.rect(cx + 28, 164, 8, 18, shade(o.apron, -8));
    if (o.pocket) { G.rect(cx - 20, 212, 40, 22, shade(o.apron, 6)); for (let x = cx - 18; x < cx + 18; x += 3) G.set(x, 214, '#ffffff'); }
    if (o.stain) for (const [x, y] of [[cx - 14, 222], [cx + 18, 204], [cx - 6, 196]]) G.ell(x, y, 3, 2, o.stain);
  }
  if (o.roll) { G.rect(10, 204, 24, 8, shade(o.top, -14)); G.rect(166, 204, 24, 8, shade(o.top, -14)); }
  // ---- arms
  if (o.arms === 'crossed') {   // Kun: forearms folded on the chest, fists on the upper arms
    G.rect(6, 190, 30, 34, o.top); G.rect(164, 190, 30, 34, o.top);
    line(18, 226, 152, 214, skD, 16); line(182, 222, 46, 208, sk, 16); G.ell(44, 212, 11, 10, sk); G.ell(158, 216, 10, 9, skD);
    for (const x of [38, 44, 50]) G.rect(x, 206, 1, 10, skDD);
  } else if (o.arms === 'clasp') { G.rect(8, 192, 26, 48, shade(o.top, -6)); G.rect(166, 192, 26, 48, shade(o.top, -6)); G.ell(cx - 10, 232, 13, 9, sk); G.ell(cx + 12, 234, 13, 9, skD); }
  else { G.rect(8, 192, 26, 48, shade(o.top, -6)); G.rect(166, 192, 26, 48, shade(o.top, -6)); }
  // ---- head
  if (o.face) {   // own face shape per person; front view (turn 0) or 3/4 (turn 1: near cheek wide, far side narrow, features shifted to the far side)
    const tn = TT(o), F = { ...o.face, rxF: o.face.rxN - (o.face.rxN - o.face.rxF) * tn }, cxF = cx + 4 * tn, top = 44, chin = F.chin, prof = t => {   // half-width 0..1 down the face (t: 0 forehead .. 1 chin)
      if (t <= .45) return .9 + .1 * t / .45;
      const u = (t - .45) / .55;
      return F.jaw === 'square' ? Math.max(.42, 1 - .58 * u ** 2.4) : F.jaw === 'v' ? Math.max(.16, 1 - .84 * u ** 1.3) : Math.max(.3, Math.sqrt(Math.max(0, 1 - u * u)) * .98);
    };
    const nw = F.neck || 24, nx0 = R(cxF + 1 - nw / 2); G.rect(nx0, 118, nw, 40, sk); G.rect(nx0 + nw - 4, 118, 4, 40, skD); G.rect(nx0, 118, nw, 10, skD);   // neck (same tone as the body's neck below), shadow under the chin
    if (tn && o.hs !== 'crop') G.ell(cx - 7, 66, 48, 36, (x, y) => y < 86 ? H : null);   // 3/4: more of the back of the head shows on the near side
    G.ell(cxF - F.rxN - 2, 94, 7, 11, skD); G.ell(cxF - F.rxN - 2, 94, 3, 6, skDD); if (!tn) { G.ell(cxF + F.rxN + 2, 94, 7, 11, skD); G.ell(cxF + F.rxN + 2, 94, 3, 6, skDD); }   // ears
    for (let y = top; y <= chin; y++) {
      const t = (y - top) / (chin - top), w = prof(t), c0 = cxF + 3 * t * tn, bump = tn && t > .3 && t < .55 ? 2 : 0;
      const xl = R(c0 - F.rxN * w), xr = R(c0 + F.rxF * w + bump);
      for (let x = xl; x <= xr; x++) G.set(x, y, x > xr - 3 ? (x === xr ? skDD : skD) : sk);   // the far side turns away from the light
    }
    for (let x = cxF - 24; x < cxF + 26; x++) for (let y = chin - 16; y <= chin; y++) if (G.get(x, y) === sk && !G.get(x, y + 1)) { G.set(x, y, skD); break; }   // under the jaw
  } else {
  G.ell(cx - 42, 92, 7, 11, skD); G.ell(cx + 42, 92, 7, 11, skD); G.ell(cx - 42, 92, 3, 6, skDD); G.ell(cx + 42, 92, 3, 6, skDD);
  if (o.jaw === 'square') { G.ell(cx, 86, 42, 48, sk); G.rect(cx - 34, 96, 68, 26, sk); G.ell(cx, 120, 34, 10, sk); }
  else { G.ell(cx, 88, 40, 46, sk); G.ell(cx, 118, 26, 16, sk); }
  // skin by hand: right cheek band darker, line under the jaw
  for (let y = 50; y < 136; y++) { let r = -1; for (let x = cx; x < cx + 50; x++) if (G.get(x, y) === sk) r = x; if (r > 0) for (let x = r - 5; x <= r; x++) if (G.get(x, y) === sk) G.set(x, y, x > r - 2 ? skDD : skD); }
  }
  // ---- front hair
  if (o.hs === 'crop') { G.ell(cx, 56, 46, 30, (x, y) => y < 64 ? H : null); G.rect(cx - 46, 56, 8, 30, H); G.rect(cx + 38, 56, 8, 30, H); for (let x = cx - 40; x < cx + 40; x += 6) G.rect(x, 60 + ((x / 6) & 1), 3, 4, HD); }
  if (o.hs === 'bun') {
    G.ell(cx, 58, 46, 32, (x, y) => y < 70 ? H : null); G.rect(cx - 48, 60, 10, 46, H); G.rect(cx + 38, 60, 10, 40, H);
    G.ell(cx + 2, 20, 22, 17, H); for (let a = 0; a < 5.5; a += .25) G.set(R(cx + 2 + Math.cos(a) * (14 - a * 2)), R(20 + Math.sin(a) * (10 - a * 1.4)), HD);   // bun curl
    G.rect(cx + 18, 16, 12, 4, o.clip); G.rect(cx + 18, 16, 12, 1, shade(o.clip, 40));
    G.tri(cx - 40, 62, cx + 6, 52, cx - 38, 86, H); G.tri(cx + 6, 52, cx + 40, 60, cx + 30, 74, H);   // fringe parted to the side
    for (let x = cx - 36; x < cx + 30; x += 8) G.tri(x, 66, x + 7, 66, x + 2, 72 + ((x / 8) & 1) * 3, H);
  }
  if (o.hs === 'pony') { G.ell(cx, 58, 46, 32, (x, y) => y < 70 ? H : null); G.tri(cx - 44, 62, cx + 10, 50, cx - 40, 92, H); G.tri(cx + 4, 52, cx + 44, 60, cx + 42, 84, H); for (let x = cx - 36; x < cx + 32; x += 7) G.tri(x, 66, x + 6, 66, x + 2, 73, H); }
  if (o.hs === 'side') { G.ell(cx, 54, 48, 34, (x, y) => y < 70 ? H : null); G.tri(cx - 46, 56, cx + 46, 52, cx - 42, 92, H); G.tri(cx + 30, 52, cx + 48, 56, cx + 44, 84, H); line(cx - 36, 70, cx + 20, 58, HD, 2); }
  if (o.hs === 'bob') { G.ell(cx, 58, 48, 34, (x, y) => y < 72 ? H : null); G.rect(cx - 50, 60, 14, 58, H); G.rect(cx + 36, 60, 14, 58, H); G.rect(cx - 50, 112, 14, 6, HD); G.rect(cx + 36, 112, 14, 6, HD); for (let x = cx - 38; x < cx + 36; x += 7) G.tri(x, 66, x + 7, 66, x + 3, 76, H); }
  if (o.hs === 'short') { G.ell(cx, 54, 46, 32, (x, y) => y < 70 ? H : null); for (let x = cx - 40; x < cx + 38; x += 9) G.tri(x, 64, x + 10, 64, x + 4, 76, H); G.rect(cx - 46, 56, 6, 22, H); G.rect(cx + 40, 56, 6, 22, H); }
  if (o.hairDetail && o.hs === 'bob') {   // hair silhouette detail on the real outer edge
    const clear = (x, y) => { if (x >= 0 && y >= 0 && x < G.w && y < G.h) G.d[y * G.w + x] = null; };
    for (let x = cx - 50; x <= cx + 50; x++) {   // pointed lock ends along the bottom of the bob: V notches between the locks
      const dx = x - cx; if (Math.abs(dx) < 13) continue;
      const yb = Math.floor(92 + 58 * Math.sqrt(Math.max(0, 1 - (dx / 50.5) ** 2))), notch = [0, 1, 2, 4, 6, 4, 2, 1, 0][(Math.abs(dx) - 13) % 9];
      for (let y = yb - notch; y <= yb + 1; y++) clear(x, y);
    }
    for (let y = 72; y < 140; y += 13) for (const sg of [-1, 1]) { const xo = cx + sg * Math.floor(50 * Math.sqrt(Math.max(0, 1 - ((y - 92) / 58) ** 2))); clear(xo, y); clear(xo, y + 1); clear(xo - sg, y + 1); }   // layered steps down the sides
    for (const [x, y] of [[cx + 6, 25], [cx + 7, 23], [cx + 9, 22], [cx + 11, 22], [cx + 12, 23]]) { G.set(x, y, H); G.set(x, y - 1, H); }   // one stray strand on the crown
  }
  // ---- shading pass on everything but skin and the eyes / mouth drawn next
  celPass(G, new Set([sk, skD, skDD]));
  if (BUST_STYLE === 'B') {   // B: anime shine band across the crown (short vertical dashes), and two-step shading down both cheeks
    for (let a = -1; a <= 1; a += .11) { const x = R(cx - 4 + a * 32), y = R(44 + a * a * 9); for (let q = 0; q < 4 + (R(a * 9) & 1) * 2; q++) if (G.get(x, y + q) && G.get(x, y + q) !== sk) G.set(x, y + q, HL); }
    for (let y = 70; y < 130; y++) for (const dir of [-1, 1]) { let e = -1; for (let x = cx; x >= 0 && x < 200; x += dir) { if (G.get(x, y) === sk) e = x; else if (e >= 0 && G.get(x, y) !== skD) break; } if (e < 0) continue; for (let q = 1; q <= 6; q++) { const x = e - dir * q; if (G.get(x, y) === sk) G.set(x, y, q <= 2 ? skD : (x + y) % 2 ? shade(sk, -7) : sk); } }
  }
  // hair detail after shading: strands + two highlight arcs (as on the sprites' hair)
  if (o.hs !== 'crop') for (const dx of [-24, -8, 10, 26]) line(cx + dx, 44, cx + dx - 6, 64, HD, 1);
  if (o.hairDetail && o.hs === 'bob') for (const x0 of [cx - 50, cx + 36]) for (const dx of [4, 9]) { line(x0 + dx, 70, x0 + dx + (x0 < cx ? 1 : -1), 112, HD, 1); line(x0 + dx + 2, 76, x0 + dx + 2, 100, HL, 1); }   // strand lines down the side locks
  for (let a = 0; a < 1; a += .04) { G.set(R(cx - 30 + a * 26), R(46 - Math.sin(a * Math.PI) * 6), HL); G.set(R(cx - 30 + a * 26), R(47 - Math.sin(a * Math.PI) * 6), HL); G.set(R(cx + 2 + a * 16), R(42 - Math.sin(a * Math.PI) * 4), HL); }
  // ---- face
  if (o.face) {
    const tn = TT(o), cxF = cx + 4 * tn, k = (o.eyeR || 1) * (BUST_STYLE === 'B' ? 1.08 : 1), eyY = 90, md = o.mouthDy || 0, iris0 = iris;
    const eye = (ex, sx, out) => {   // soft oval eye, squashed sideways on the far side; both look a little to the right
      const rx = 7.5 * k * sx, ry = 8.5 * k, lid = dx => eyY - (ry + .5) * Math.sqrt(Math.max(0, 1 - (dx / (rx + 1)) ** 2)), ix = ex + 1.5 * k * tn;
      G.ell(ex, eyY, rx, ry, '#f6efe8');
      G.ell(ix, eyY + .5, Math.max(2.5, rx - 1.6), ry - .5, (x, y) => G.get(x, y) !== '#f6efe8' && !String(G.get(x, y)).startsWith('#f6') ? null : y < eyY - 4 * k ? E : y < eyY ? shade(iris0, -24) : y < eyY + 4 * k ? iris0 : irisL);
      G.ell(ix, eyY, 2.6 * k * Math.max(.8, sx), 3.6 * k, '#1c1418');
      const hl = Math.max(2, R(4 * k * sx)); G.rect(R(ix - 3.5 * k * sx), R(eyY - 6 * k), hl, Math.max(2, R(4 * k)), '#ffffff'); G.rect(R(ix + 2 * k * sx), R(eyY + 4 * k), 2, 2, '#ffffff');
      for (let dx = -rx - .5; dx <= rx + .5; dx += .5) { const y = R(lid(dx)); G.set(R(ex + dx), y, E); G.set(R(ex + dx), y - 1, E); }
      if (o.lash) { G.set(R(ex + out * (rx + 1.5)), eyY - 4, E); G.set(R(ex + out * (rx + 2.5)), eyY - 5, E); G.set(R(ex + out * (rx + 1.5)), eyY - 3, E); }
      for (let dx = 1; dx <= R(6 * k * sx); dx++) G.set(ex + out * dx, R(eyY + ry + .5), BUST_STYLE === 'B' ? '#e8a8a0' : skDD);   // B: a rosy lower lid
      if (o.old) for (let i = 0; i < 3; i++) G.set(R(ex + out * (rx + 2 + i)), eyY + 2 + i, skDD);
    };
    const gap = o.eyeX || 20, exN = cxF - (tn ? 18 : gap), exF = cxF + (tn ? 17 : gap);
    eye(exN, 1, -1); eye(exF, 1 - .26 * tn, 1);
    const brow = (inner, tail, sz) => {   // fine brow from the inner end (by the nose) to the tail; per-person arch, tilt, thickness
      const B0 = shade(o.brow, 30), B1 = o.brow, B2 = shade(o.brow, -18), arch = o.browArch === undefined ? 1 : o.browArch, tilt = o.browTilt || 0, TT = o.browT || 3, n = R(Math.abs(tail - inner));
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = R(inner + (tail - inner) * t), y = R(75 - Math.sin(Math.min(1, t / .66) * Math.PI / 2) * arch * sz + Math.max(0, t - .66) * 2 + tilt * (1 - t));
        const th = t < .15 ? TT - 1 : t < .7 ? TT : t < .9 ? TT - 1 : 1, col = t < .12 ? B0 : t > .55 ? B2 : B1;
        for (let q = 0; q < th; q++) G.set(x, y + q - (th > 2 ? 1 : 0), col);
      }
    };
    brow(exN + 8, exN - 10, 1); if (tn) brow(exF - 6, exF + 8, .8); else brow(exF - 8, exF + 10, 1);
    // nose, on the far side of the centre line
    const nx = cxF + (tn ? 5 : 1), nl = o.nose34 === 'big' ? 14 : o.nose34 === 'fine' ? 9 : 11;
    for (let y = 106 - nl; y < 106; y++) G.set(nx + (y > 100 ? 1 : 0), y, skD);
    if (o.nose34 === 'button') { G.ell(nx, 106, 3, 2, skD); G.set(nx - 2, 104, shade(sk, 12)); }
    else if (o.nose34 === 'big') { G.rect(nx - 3, 105, 8, 3, skD); G.set(nx + 4, 103, skD); G.rect(nx - 2, 107, 2, 1, skDD); G.set(nx - 4, 103, shade(sk, 12)); }
    else { G.rect(nx - 2, 106, 5, 2, skD); G.set(nx - 1, 103, shade(sk, 12)); }
    G.set(nx, 108, skDD);
    // mouth: centred a little toward the far side; the far half is shorter
    const mx = cxF + 2 * tn, my = 116 + R(md * .3), half = (n, f) => [n, R(f * (1 - .25 * tn))];
    const LIP = '#a85048', LIP2 = '#c47a6c';
    if (o.mouth34 === 'smile') { const [a, b] = half(8, 8); for (let dx = -a; dx <= b; dx++) G.set(mx + dx, R(my + (1 - (dx / (dx < 0 ? a : b)) ** 2) * 1.6), Math.abs(dx) < 4 ? LIP : LIP2); G.rect(mx - 3, my + 4, 6, 1, '#e8a090'); G.rect(mx - 2, my + 6, 5, 1, skD); }
    if (o.mouth34 === 'open') { G.ell(mx, my + 2, 8, 4, '#7a3e33'); G.rect(mx - 6, my, 12, 2, '#ffffff'); G.ell(mx + 1, my + 4, 4, 1.4, '#d9706a'); G.rect(mx - 3, my + 7, 6, 1, skD); }
    if (o.mouth34 === 'stern') { G.rect(mx - 9, my + 1, 16, 2, '#8a4a3a'); G.set(mx - 10, my + 2, '#8a4a3a'); G.set(mx + 7, my + 2, '#8a4a3a'); line(mx - 16, 106, mx - 21, my + 2, skDD, 1); line(mx + 12, 108, mx + 14, my + 1, skDD, 1); G.rect(mx - 4, my + 5, 8, 1, skD); }
    if (o.mouth34 === 'wide') { for (let dx = -11; dx <= 8; dx++) G.set(mx + dx, R(my + (1 - (dx / (dx < 0 ? 11 : 8)) ** 2) * 3), LIP); G.ell(mx, my + 1, 7, 2, '#ffffff'); G.rect(mx - 5, my + 4, 9, 1, '#e8a090'); G.set(mx - 13, my - 2, skD); G.set(mx + 10, my - 2, skD); }
    if (o.mouth34 === 'lips') { G.ell(mx, my + 1, 6, 3, o.lips); G.rect(mx - 5, my + 1, 10, 1, shade(o.lips, -34)); G.rect(mx - 3, my - 1, 3, 1, shade(o.lips, 40)); G.set(mx - 6, my + 1, shade(o.lips, -34)); }
    if (o.mouth34 === 'smirk') { G.rect(mx - 7, my + 1, 11, 1, LIP); G.set(mx + 4, my, LIP); G.set(mx + 5, my - 1, LIP); G.rect(mx - 3, my + 2, 6, 1, '#ffffff'); G.rect(mx - 2, my + 4, 5, 1, skD); }
    // cheeks: big gradient blush on the near side, small on the far side
    if (o.blush) for (const [bx_, rx_, ry_] of tn ? [[cxF - 23, 12, 5.5], [cxF + 20, 7, 4.5]] : [[cxF - 24, 11, 5], [cxF + 24, 11, 5]]) G.ell(bx_, 107, rx_, ry_, (x, y) => { const c0 = G.get(x, y); if (c0 !== sk && c0 !== skD) return null; const d = Math.sqrt(((x + .5 - bx_) / rx_) ** 2 + ((y + .5 - 107) / ry_) ** 2), a = Math.ceil((1 - d) * 4) / 4; return a > 0 ? mixHex(c0, '#f08c8c', a * .55) : null; });
    if (o.old) { line(cxF - 30, 62, cxF - 6, 61, skD, 1); line(cxF - 24, 66, cxF - 2, 66, skD, 1); }   // forehead lines
  } else {
  if (o.browW) { G.rect(cx - 30, 72, 18, o.browW, o.brow); G.rect(cx + 12, 72, 18, o.browW, o.brow); }
  else if (o.browFine) for (const sg of [-1, 1]) {   // fine brow: soft light head by the nose, full body, arch at two thirds, tail tapering to 1 px
    const B0 = shade(o.brow, 30), B1 = o.brow, B2 = shade(o.brow, -18);
    for (let i = 0; i <= 18; i++) {
      const arch = o.browArch === undefined ? 1 : o.browArch, tilt = o.browTilt || 0, TT = o.browT || 3;   // arch height, stern tilt (inner end low), thickness
      const t = i / 18, x = cx + sg * ((o.eyeX || 22) - 10 + i), y = R(75 - Math.sin(Math.min(1, t / .66) * Math.PI / 2) * arch + Math.max(0, t - .66) * 2 + tilt * (1 - t));
      const th = t < .15 ? TT - 1 : t < .7 ? TT : t < .9 ? TT - 1 : 1, col = t < .12 ? B0 : t > .55 ? B2 : B1;
      for (let k = 0; k < th; k++) G.set(x, y + k - (th > 2 ? 1 : 0), col);
    }
  }
  else { line(cx - 30, 76, cx - 14, 73, o.brow, 2); line(cx + 14, 73, cx + 30, 76, o.brow, 2); }
  for (const ex of [cx - (o.eyeX || 22), cx + (o.eyeX || 22)]) {   // eyeX: how far each eye sits from the centre
    if (o.eyeStyle) {   // the owner's eyes: drawn as shapes, not a box (three styles to choose from)
      const out = ex < cx ? -1 : 1, cy_ = 90, st = o.eyeStyle;
      const lidY = (dx, rx, ry) => cy_ - ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2));
      if (st === 'soft') {   // soft oval: banded iris, pupil, big catchlight + small sparkle, thin lid line, lash flick
        const k = o.eyeR || 1, rx = 7.5 * k, ry = 8.5 * k;   // eyeR: smaller / larger eyes per person
        G.ell(ex, cy_, rx, ry, '#f6efe8');
        G.ell(ex, cy_ + .5, rx - 1.1, ry - .5, (x, y) => y < cy_ - 4 * k ? E : y < cy_ ? shade(iris, -24) : y < cy_ + 4 * k ? iris : irisL);
        G.ell(ex, cy_, 2.6 * k, 3.6 * k, '#1c1418');
        const hl = Math.max(2, R(4 * k)); G.rect(R(ex - 4 * k), R(cy_ - 6 * k), hl, hl, '#ffffff'); G.rect(R(ex + 2 * k), R(cy_ + 4 * k), 2, 2, '#ffffff');
        for (let dx = -rx - .5; dx <= rx + .5; dx += .5) { const y = R(lidY(dx, rx + 1, ry + .5)); G.set(R(ex + dx), y, E); G.set(R(ex + dx), y - 1, E); }
        if (o.lash) { G.set(R(ex + out * (rx + 1.5)), cy_ - 4, E); G.set(R(ex + out * (rx + 2.5)), cy_ - 5, E); G.set(R(ex + out * (rx + 1.5)), cy_ - 3, E); }
        for (let dx = 1; dx <= R(6 * k); dx++) G.set(ex + out * dx, R(cy_ + ry + .5), skDD);
        if (o.old) for (let i = 0; i < 3; i++) G.set(R(ex + out * (rx + 2 + i)), cy_ + 2 + i, skDD);   // crow's feet
      } else if (st === 'sharp') {   // almond, outer corner up, heavy lid hides the top of the iris: cool, grown-up look
        for (let dx = -8; dx <= 8; dx++) { const t = (dx * out + 8) / 16, top = R(cy_ - 4 - t * 3), bot = R(cy_ + 5 - t * 2 - Math.abs(dx) * .15); for (let y = top; y <= bot; y++) G.set(ex + dx, y, '#f6efe8'); }
        G.ell(ex + out, cy_ + 1, 5.5, 6.5, (x, y) => G.get(x, y) === '#f6efe8' ? (y < cy_ ? shade(iris, -30) : y < cy_ + 4 ? iris : irisL) : null);
        G.ell(ex + out, cy_ + 1, 2.2, 3, (x, y) => G.get(x, y) ? '#1c1418' : null);
        G.rect(ex + out - 3, cy_ - 2, 3, 2, '#ffffff');
        for (let dx = -9; dx <= 9; dx++) { const t = (dx * out + 8) / 16, top = R(cy_ - 4 - t * 3); G.rect(ex + dx, top - 2, 1, 3, E); }
        G.rect(ex + out * 10, cy_ - 9, 1, 3, E); G.set(ex + out * 11, cy_ - 10, E);
        for (let dx = -3; dx <= 7; dx++) G.set(ex + out * dx, cy_ + 6 - R((dx + 3) * .2), skDD);
      } else {   // sparkle: big round eye, star-shaped catchlight, pink glint at the bottom
        G.ell(ex, cy_, 8, 9, E);
        G.ell(ex, cy_ + 1, 7, 7.5, (x, y) => y < cy_ - 2 ? shade(iris, -30) : y < cy_ + 3 ? iris : irisL);
        G.ell(ex, cy_, 2.4, 3, '#1c1418');
        for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0], [0, -2], [0, 2]]) G.set(ex - 3 + dx, cy_ - 4 + dy, '#ffffff');
        G.rect(ex + 2, cy_ + 3, 2, 2, '#ffffff'); G.rect(ex - 3, cy_ + 6, 5, 1, '#f2a8c0');
        for (let dx = -9; dx <= 9; dx += .5) G.set(R(ex + dx), R(lidY(dx, 9.5, 10)) - 1, E);
        G.set(ex + out * 10, cy_ - 3, E); G.set(ex + out * 11, cy_ - 4, E);
      }
      continue;
    }
    if (o.eye === 'small') { G.rect(ex - 7, 86, 14, 6, E); G.rect(ex - 4, 89, 8, 3, iris); G.rect(ex + 1, 87, 3, 2, '#ffffff'); G.rect(ex - 7, 96, 14, 1, skDD); continue; }
    const w = o.eye === 'big' ? 14 : 12, h = o.eye === 'big' ? 18 : 14, x = ex - w / 2, y = 82;
    G.rect(x, y, w, h, E); G.rect(x, y + h * .5, w, R(h * .5), iris); G.rect(x + 2, y + h - 4, w - 4, 2, irisL);
    for (const [px_, py_] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) G.set(px_, py_, sk);   // rounded corners
    G.rect(x + w - 7, y + 2, 5, 5, '#ffffff'); G.rect(x + 2, y + h - 6, 3, 3, '#e6def8');
    G.rect(x - 1, y - 2, w + 2, 2, E);   // upper lid line
    if (o.lash) { const out = ex < cx ? -1 : 1; G.rect(out < 0 ? x - 4 : x + w, y - 3, 4, 2, E); G.set(out < 0 ? x - 5 : x + w + 3, y - 4, E); }
  }
  G.rect(cx + 1, 100, 2, 8, skD); G.rect(cx - 2, 107, 4, 2, skD);   // nose: shadow on the right
  const md = o.mouthDy || 0;
  if (o.mouth === 'stern') { G.rect(cx - 12, 120 + md, 24, 2, '#8a4a3a'); G.rect(cx - 15, 121 + md, 3, 2, '#8a4a3a'); G.rect(cx + 12, 121 + md, 3, 2, '#8a4a3a'); line(cx - 20, 106, cx - 26, 118, skDD, 1); line(cx + 20, 106, cx + 26, 118, skDD, 1); }
  if (o.mouth === 'smile') {   // natural: a soft shallow curve, darker in the middle, a hint of lower lip and shade under it
    const my = 119 + (o.mouthDy || 0);   // mouthDy: move the mouth up toward the nose
    for (let dx = -8; dx <= 8; dx++) { const y = R(my + (1 - (dx / 8) ** 2) * 1.6); G.set(cx + dx, y, Math.abs(dx) < 5 ? '#a85048' : '#c47a6c'); }
    G.rect(cx - 4, my + 4, 8, 1, '#e8a090'); G.rect(cx - 3, my + 5, 6, 1, '#efb49e'); G.rect(cx - 3, my + 7, 6, 1, skD);
  }
  if (o.mouth === 'lips') { G.ell(cx, 120 + md, 7, 3.4, o.lips); G.rect(cx - 6, 120 + md, 12, 1, shade(o.lips, -34)); G.rect(cx - 4, 118 + md, 3, 1, shade(o.lips, 40)); }
  if (o.mouth === 'grin') { G.ell(cx, 120 + md, 9, 5, '#7a3e33'); G.rect(cx - 7, 116 + md, 14, 3, '#ffffff'); G.ell(cx, 123 + md, 4, 1.6, '#d9706a'); }
  if (o.blush && o.blushStyle === 'grad') for (const bx_ of [cx - 25, cx + 25]) {   // gradient blush: deepest in the middle, fading out in 4 steps
    G.ell(bx_, 108, 12, 5.5, (x, y) => { const c0 = G.get(x, y); if (c0 !== sk && c0 !== skD) return null; const d = Math.sqrt(((x + .5 - bx_) / 12) ** 2 + ((y + .5 - 108) / 5.5) ** 2), a = Math.ceil((1 - d) * 4) / 4; return a > 0 ? mixHex(c0, '#f08c8c', a * .55) : null; });
  }
  else if (o.blush && o.blushStyle === 'hatch') for (const bx_ of [cx - 25, cx + 25]) {   // soft pink patch + three short slanted strokes (anime-style blush)
    G.ell(bx_, 108, 9, 3.6, (x, y) => G.get(x, y) === sk || G.get(x, y) === skD ? mixHex(sk, '#f29a9a', .35 + .25 * (1 - Math.abs(x - bx_) / 9)) : null);
    for (let k = -1; k <= 1; k++) for (let j = 0; j < 3; j++) G.set(bx_ + k * 4 + 1 - j, 106 + j, '#e88a82');
  }
  else if (o.blush) for (const bx_ of [cx - 26, cx + 26]) for (let y = 104; y < 112; y++) for (let x = bx_ - 8; x < bx_ + 8; x++) if ((x + y) % 2 === 0 && ((x - bx_) / 8) ** 2 + ((y - 108) / 4) ** 2 < 1) G.set(x, y, '#f29a9a');   // dithered blush
  if (o.old) { line(cx - 30, 100, cx - 18, 100, skDD, 1); line(cx + 18, 100, cx + 30, 100, skDD, 1); }
  }
  colorOutline(G);
  return G.canvas();
}
