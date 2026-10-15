// test (not shipped): version A bust with finer pixels + gradients — the shop sprite smoothed twice with scale2x (curves at
// 1-px steps instead of 4-px blocks), then each material region gets a soft light-to-shade gradient in many small steps
// (no texture), hair a top-to-bottom sheen, irises dark at the top and lit at the bottom, blush as a dithered gradient
function gradBust(id) {
  const def = STAFF_DEF[id], spr = drawPersonHD(STD(def), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const rows = 60, g0 = new Grid(w, rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); }
  const s2x = g => { const o = new Grid(g.w * 2, g.h * 2); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C = g.get(x - 1, y), D = g.get(x, y + 1); o.set(x * 2, y * 2, C === A && C !== D && A !== B ? A : P); o.set(x * 2 + 1, y * 2, A === B && A !== C && B !== D ? B : P); o.set(x * 2, y * 2 + 1, D === C && D !== B && C !== A ? C : P); o.set(x * 2 + 1, y * 2 + 1, B === D && B !== A && D !== C ? D : P); } return o; };
  const g = s2x(s2x(g0)), W2 = g.w, H2 = g.h, src = g.d.slice(), at = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H2 ? null : src[y * W2 + x];
  const dark = c => !c || c === HD_OUT || lum(c) < 45, isSkin = c => SKIN_SET.has(c), hairC = def.hair || '#3a2630';
  const isHair = c => c && !dark(c) && Math.abs(lum(c) - lum(hairC)) < 30 && Math.max(...rgbaOf(c).slice(0, 3).map((v, i) => Math.abs(v - rgbaOf(hairC)[i]))) < 50;
  const fam = (a, b) => { if (!a || !b || dark(a) || dark(b)) return false; if (isSkin(a) || isSkin(b)) return isSkin(a) && isSkin(b); if (isHair(a) || isHair(b)) return isHair(a) && isHair(b); const A = rgbaOf(a), B = rgbaOf(b); return Math.max(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]), Math.abs(A[2] - B[2])) < 70 && Math.abs(lum(a) - lum(b)) < 60; };
  const reg = new Int32Array(W2 * H2).fill(-1), regs = [];
  for (let k0 = 0; k0 < W2 * H2; k0++) { if (reg[k0] >= 0 || dark(src[k0])) continue;
    const id_ = regs.length, st = [k0], R_ = { x0: W2, x1: 0, y0: H2, y1: 0, n: 0 }; reg[k0] = id_;
    while (st.length) { const k = st.pop(), x = k % W2, y = (k - x) / W2; R_.n++; R_.x0 = Math.min(R_.x0, x); R_.x1 = Math.max(R_.x1, x); R_.y0 = Math.min(R_.y0, y); R_.y1 = Math.max(R_.y1, y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, kk = ny * W2 + nx; if (nx >= 0 && ny >= 0 && nx < W2 && ny < H2 && reg[kk] < 0 && fam(src[k], src[kk])) { reg[kk] = id_; st.push(kk); } } }
    regs.push(R_); }
  const step = (c, v, amp) => { const k = Math.round(v * amp / 3) * 3; return k >= 0 ? mixHex(shade(c, k), '#fff4dc', Math.min(.2, k / 120)) : mixHex(shade(c, k), '#3a2048', Math.min(.25, -k / 90)); };   // warm light, cool purple shade
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const k = y * W2 + x, c = src[k]; if (dark(c)) continue; const Rg = regs[reg[k]];
    const nx = (x - Rg.x0) / Math.max(1, Rg.x1 - Rg.x0), ny = (y - Rg.y0) / Math.max(1, Rg.y1 - Rg.y0);
    let v;
    if (Rg.n < 220 && !isSkin(c) && !isHair(c)) v = (ny - .45) * 1.4;   // small bits (irises, buttons): dark at the top, lit at the bottom
    else if (isHair(c)) v = -(ny - .35) * 1.1 - (nx - .5) * .5;   // hair: sheen at the crown, darker towards the ends
    else if (isSkin(c)) v = -(nx - .45) * .55 - (ny - .4) * .45;   // skin: gentle, light from the top-left
    else v = -(nx - .4) * .8 - (ny - .3) * .7;
    g.d[k] = step(c, Math.max(-1, Math.min(1, v)), isSkin(c) ? 14 : 22);
  }
  // hair shine: a soft band of lighter pixels following the crown
  let hx0 = W2, hx1 = 0, hy0 = H2; for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) if (isHair(at(x, y))) { hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x); hy0 = Math.min(hy0, y); }
  if (hx1 > hx0) { const cx = (hx0 + hx1) / 2, hw = hx1 - hx0; for (let a = -1; a <= 1; a += .01) { const x = R(cx - hw * .06 + a * hw * .3), y = R(hy0 + 14 + a * a * 10); for (let q = -2; q <= 2; q++) if (isHair(at(x, y + q))) g.d[(y + q) * W2 + x] = mixHex(g.d[(y + q) * W2 + x], '#fff6e6', [.12, .28, .45, .28, .12][q + 2] * (1 - Math.abs(a) * .6)); } }
  // blush: a round gradient, dithered at its edge
  if ((BUSTS[id] || {}).blush || def.blush) { let fy0 = H2, fy1 = 0, fx0 = W2, fx1 = 0; for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) if (isSkin(at(x, y))) { fy0 = Math.min(fy0, y); fy1 = Math.max(fy1, y); fx0 = Math.min(fx0, x); fx1 = Math.max(fx1, x); }
    const fh = Math.min(fy1, fy0 + 100) - fy0, by = R(fy0 + fh * .62); for (const bx of [fx0 + (fx1 - fx0) * .22, fx0 + (fx1 - fx0) * .78]) for (let y = -6; y <= 6; y++) for (let x = -12; x <= 12; x++) { const X = R(bx + x), Y = by + y, dd = Math.sqrt((x / 12) ** 2 + (y / 6) ** 2); if (dd > 1 || !isSkin(at(X, Y))) continue; const a = (1 - dd) * .5; if (a > .12 || (X + Y) % 2 === 0) g.d[Y * W2 + X] = mixHex(g.d[Y * W2 + X], '#f08080', Math.max(a, .08)); } }
  const out = mk(200, 240), xx = out.getContext('2d'); xx.drawImage(g.canvas(), R((200 - W2) / 2), 0);
  return out;
}
(function () {   // sheet: current version A (top) vs finer pixels + gradients (bottom)
  const ids = window.BUST_IDS || ['hero_f', 'lin', 'qing'], cv = document.createElement('canvas'); cv.width = ids.length * 210 + 20; cv.height = 540;
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99;max-width:100vw'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, cv.width, cv.height); c.font = '18px sans-serif'; c.fillStyle = '#3a2a2e';
  c.fillText('现在 A 版', 10, 20); c.fillText('细像素 + 渐变（test）', 10, 288);
  ids.forEach((id, i) => { c.drawImage(bust(id), 20 + i * 210, 28); c.drawImage(gradBust(id), 20 + i * 210, 296); });
})();
