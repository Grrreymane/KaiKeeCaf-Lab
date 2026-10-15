
// dialogue busts for every named character (v1.20): the shop sprite itself, redrawn as detailed pixel art at 2x —
// scale2x once (each sprite pixel -> a clean 2x2 shape), then hand-style pixel shading per region: hue-shifted shadow
// band along the right / bottom edge of each shape, a light band top-left, hair strands + a dashed shine arc, eyes with
// catchlights and a lit iris, a stepped (dithered) blush, and a soft coloured outline instead of a flat dark one
function pixSpriteBust(id) {
  const def = STAFF_DEF[id], spr = drawPersonHD(STD(def), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const rows = 62, g0 = new Grid(w, rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); }
  const s2x = g => { const o = new Grid(g.w * 2, g.h * 2); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C = g.get(x - 1, y), D = g.get(x, y + 1); o.set(x * 2, y * 2, C === A && C !== D && A !== B ? A : P); o.set(x * 2 + 1, y * 2, A === B && A !== C && B !== D ? B : P); o.set(x * 2, y * 2 + 1, D === C && D !== B && C !== A ? C : P); o.set(x * 2 + 1, y * 2 + 1, B === D && B !== A && D !== C ? D : P); } return o; };
  const g = s2x(g0), W2 = g.w, H2 = g.h, src = g.d.slice(), at = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H2 ? null : src[y * W2 + x];
  const dark = c => !c || c === HD_OUT || lum(c) < 45, isSkin = c => SKIN_SET.has(c), hairC = def.hair || '#3a2630';
  const isHair = c => c && !dark(c) && Math.abs(lum(c) - lum(hairC)) < 26 && Math.max(...rgbaOf(c).slice(0, 3).map((v, i) => Math.abs(v - rgbaOf(hairC)[i]))) < 46;
  const same = (a, b) => a && b && !dark(a) && !dark(b) && (a === b || (isSkin(a) && isSkin(b)) || (isHair(a) && isHair(b)));
  const SH = c => mixHex(shade(c, -16), '#4a2a5a', .16), SH2 = c => mixHex(shade(c, -30), '#3a2048', .22), HI = c => mixHex(shade(c, 10), '#fff2d0', .2);
  // 1) regions: flood-fill connected pixels of one material (skin / hair / one cloth colour family, its sprite shade tones included)
  const fam = (a, b) => { if (!a || !b || dark(a) || dark(b)) return false; if (isSkin(a) || isSkin(b)) return isSkin(a) && isSkin(b); if (isHair(a) || isHair(b)) return isHair(a) && isHair(b); const A = rgbaOf(a), B = rgbaOf(b); return Math.max(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]), Math.abs(A[2] - B[2])) < 70 && Math.abs(lum(a) - lum(b)) < 60; };
  const reg = new Int32Array(W2 * H2).fill(-1), regs = [];
  for (let k0 = 0; k0 < W2 * H2; k0++) { if (reg[k0] >= 0 || dark(src[k0])) continue;
    const id = regs.length, st = [k0], R_ = { x0: W2, x1: 0, y0: H2, y1: 0, n: 0, c: src[k0] }; reg[k0] = id;
    while (st.length) { const k = st.pop(), x = k % W2, y = (k - x) / W2; R_.n++; R_.x0 = Math.min(R_.x0, x); R_.x1 = Math.max(R_.x1, x); R_.y0 = Math.min(R_.y0, y); R_.y1 = Math.max(R_.y1, y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, kk = ny * W2 + nx; if (nx >= 0 && ny >= 0 && nx < W2 && ny < H2 && reg[kk] < 0 && fam(src[k], src[kk])) { reg[kk] = id; st.push(kk); } } }
    regs.push(R_); }
  // 2) light from the top-left over each region's own box, quantised into clean bands (no per-pixel noise): one light band, one deep shadow band
  //    on top of the sprite's own two tones -> a 4-step ramp per material
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const k = y * W2 + x, c = src[k]; if (dark(c)) continue; const Rg = regs[reg[k]]; if (Rg.n < 24) continue;
    const nx = (x - Rg.x0) / Math.max(1, Rg.x1 - Rg.x0), ny = (y - Rg.y0) / Math.max(1, Rg.y1 - Rg.y0), v = -(nx - .5) * 1.1 - (ny - .45) * .7;
    let o = c;
    if (isSkin(c)) { if (nx > .84 && ny > .15) o = SH(c); else if (nx < .1 && ny < .6) o = HI(c); }   // face: a narrow shadow down the right cheek, light on the left edge
    else if (isHair(c)) { if (v < -.62) o = SH2(c); else if (v > .5) o = HI(c); }
    else { if (v < -.5) o = SH(c); else if (v > .48) o = HI(c); }
    g.d[k] = o;
  }
  // 3) occlusion: a 2px shadow on skin right under hair or clothing (fringe on the forehead, collar on the neck)
  for (let y = 1; y < H2; y++) for (let x = 0; x < W2; x++) { const c = at(x, y); if (!isSkin(c)) continue; for (let k = 1; k <= 2; k++) { const a = at(x, y - k); if (a && !isSkin(a)) { if (!dark(a) || k === 1 && isHair(at(x, y - 2))) g.d[y * W2 + x] = SH(c); break; } } }
  // 4) hair: a few dark strand lines falling from the crown, and a dashed shine arc
  let hx0 = W2, hx1 = 0, hy0 = H2; for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) if (isHair(at(x, y))) { hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x); hy0 = Math.min(hy0, y); }
  if (hx1 > hx0) {
    const cx = (hx0 + hx1) / 2, hw = hx1 - hx0;
    for (let sx = hx0 + 8; sx < hx1 - 6; sx += 10) for (let i = 0; i < 8; i++) { const x = R(sx + (sx < cx ? -1 : 1) * i * .35), y = hy0 + 8 + i; if (isHair(at(x, y)) && isHair(at(x, y + 1))) g.d[y * W2 + x] = SH(at(x, y)); }
    for (let a = -1; a <= 1; a += .04) { const x = R(cx - hw * .08 + a * hw * .28), y = R(hy0 + 9 + a * a * 7); if ((R(a * 25) & 3) === 3) continue; for (let q = 0; q < 2; q++) if (isHair(at(x, y + q))) g.d[(y + q) * W2 + x] = q ? HI(at(x, y + q)) : mixHex(at(x, y + q), '#fff6e6', .55); }
  }
  // 6) soft outline: silhouette pixels take a deep tone of the colour inside them (dark brown on skin, deep hue on cloth)
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const c = at(x, y); if (!c || !dark(c)) continue;
    const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !at(x + dx, y + dy)); if (!edge) continue;
    let inn = null; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2]]) { const n = at(x + dx, y + dy); if (n && !dark(n)) { inn = n; break; } }
    if (inn) g.d[y * W2 + x] = mixHex(shade(inn, -70), '#2a1d26', .45);
  }
  const out = mk(200, 240), xx = out.getContext('2d'); xx.imageSmoothingEnabled = false; xx.drawImage(g.canvas(), R((200 - W2 * 2) / 2), 0, W2 * 2, H2 * 2);
  return out;
}
;(function () {   // sheet: current busts (top) vs detailed pixel busts (bottom)
  const ids = Object.keys(STAFF_DEF).filter(k => BUSTS[k]), cv = document.createElement('canvas'); cv.width = ids.length * 210 + 20; cv.height = 560;
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, cv.width, cv.height);
  c.font = '18px sans-serif'; c.fillStyle = '#3a2a2e'; c.fillText('现在', 10, 22); c.fillText('细致像素版（新）', 10, 292);
  ids.forEach((id, i) => { c.drawImage(bust(id), 20 + i * 210, 30); c.drawImage(pixSpriteBust(id), 20 + i * 210, 300); c.fillText(id, 20 + i * 210, 552); });
})();
