// test (not shipped): five refined styles of the version-A owner bust, same sprite, same features
function bustBase(id, twice = true) {
  const def = STAFF_DEF[id], spr = drawPersonHD(STD(def), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const g0 = new Grid(w, 60); for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); }
  const s2x = g => { const o = new Grid(g.w * 2, g.h * 2); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C_ = g.get(x - 1, y), D = g.get(x, y + 1); o.set(x * 2, y * 2, C_ === A && C_ !== D && A !== B ? A : P); o.set(x * 2 + 1, y * 2, A === B && A !== C_ && B !== D ? B : P); o.set(x * 2, y * 2 + 1, D === C_ && D !== B && C_ !== A ? C_ : P); o.set(x * 2 + 1, y * 2 + 1, B === D && B !== A && D !== C_ ? D : P); } return o; };
  const g = twice ? s2x(s2x(g0)) : s2x(g0), W2 = g.w, H2 = g.h, src = g.d.slice(), at = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H2 ? null : src[y * W2 + x];
  const dark = c => !c || c === HD_OUT || lum(c) < 45, isSkin = c => SKIN_SET.has(c), hc = def.hair;
  const isHair = c => c && !dark(c) && Math.abs(lum(c) - lum(hc)) < 30 && Math.max(...rgbaOf(c).slice(0, 3).map((v, i) => Math.abs(v - rgbaOf(hc)[i]))) < 50;
  const fam = (a, b) => { if (!a || !b || dark(a) || dark(b)) return false; if (isSkin(a) || isSkin(b)) return isSkin(a) && isSkin(b); if (isHair(a) || isHair(b)) return isHair(a) && isHair(b); const A = rgbaOf(a), B = rgbaOf(b); return Math.max(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]), Math.abs(A[2] - B[2])) < 70; };
  const reg = new Int32Array(W2 * H2).fill(-1), regs = [];
  for (let k0 = 0; k0 < W2 * H2; k0++) {
    if (reg[k0] >= 0 || dark(src[k0])) continue; const id_ = regs.length, st = [k0], R_ = { x0: W2, x1: 0, y0: H2, y1: 0, n: 0 }; reg[k0] = id_;
    while (st.length) { const k = st.pop(), x = k % W2, y = (k - x) / W2; R_.n++; R_.x0 = Math.min(R_.x0, x); R_.x1 = Math.max(R_.x1, x); R_.y0 = Math.min(R_.y0, y); R_.y1 = Math.max(R_.y1, y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, kk = ny * W2 + nx; if (nx >= 0 && ny >= 0 && nx < W2 && ny < H2 && reg[kk] < 0 && fam(src[k], src[kk])) { reg[kk] = id_; st.push(kk); } } }
    regs.push(R_);
  }
  const rel = k => { const R_ = regs[reg[k]], x = k % W2, y = (k - x) / W2; return [(x - R_.x0) / Math.max(1, R_.x1 - R_.x0), (y - R_.y0) / Math.max(1, R_.y1 - R_.y0), R_.n]; };
  return { g, W2, H2, src, at, dark, isSkin, isHair, reg, regs, rel, def };
}
const outBust = (B, scale = 1) => { const o = mk(200, 240), x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(B.g.canvas(), R((200 - B.W2 * scale) / 2), 0, B.W2 * scale, B.H2 * scale); return o; };
const lightV = (B, k, c) => { const [nx, ny, n] = B.rel(k); if (n < 220 && !B.isSkin(c) && !B.isHair(c)) return (ny - .45) * 1.4; if (B.isHair(c)) return -(ny - .35) * 1.1 - (nx - .5) * .5; if (B.isSkin(c)) return -(nx - .45) * .55 - (ny - .4) * .45; return -(nx - .4) * .8 - (ny - .3) * .7; };
function findEyes(B) {   // dark blobs in the upper face
  const { W2, src, at, dark, isSkin } = B; let fy0 = 0; for (let k = 0; k < src.length; k++) if (isSkin(src[k])) { fy0 = Math.floor(k / W2); break; }
  const seen = new Set(), eyes = [];
  for (let y = fy0; y < fy0 + 80; y++) for (let x = 0; x < W2; x++) { const k = y * W2 + x; if (seen.has(k) || !at(x, y) || !dark(at(x, y))) continue; const st = [[x, y]], px_ = []; seen.add(k);
    while (st.length) { const [a, b] = st.pop(); px_.push([a, b]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = a + dx, ny = b + dy; if (!seen.has(ny * W2 + nx) && at(nx, ny) && dark(at(nx, ny))) { seen.add(ny * W2 + nx); st.push([nx, ny]); } } }
    const xs = px_.map(p => p[0]), ys = px_.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (px_.length > 60 && px_.length < 900 && y1 - y0 > 10 && x1 - x0 < 50) eyes.push({ x0, x1, y0, y1 }); }
  return { eyes, fy0 };
}
const OWNER_STYLES = [
  ['① 精细线稿', '线条顺滑，彩色描边，颜色唔改', B => {   // smooth curves + a coloured outline (each edge takes a deep tone of the colour inside)
    const { g, W2, H2, at, dark } = B;
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const c = at(x, y); if (!c || !dark(c)) continue; if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !at(x + a, y + b))) continue; let inn = null; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2]]) { const n = at(x + a, y + b); if (n && !dark(n)) { inn = n; break; } } if (inn) g.d[y * W2 + x] = mixHex(shade(inn, -70), '#2a1d26', .4); }
    return outBust(B); }],
  ['② 柔和渐变', '由亮到暗慢慢过渡，头发有光泽', B => {
    const { g, src, dark, isSkin } = B;
    for (let k = 0; k < src.length; k++) { const c = src[k]; if (dark(c)) continue; const v = Math.max(-1, Math.min(1, lightV(B, k, c))), amp = isSkin(c) ? 14 : 22, q = Math.round(v * amp / 3) * 3; g.d[k] = q >= 0 ? mixHex(shade(c, q), '#fff4dc', Math.min(.2, q / 120)) : mixHex(shade(c, q), '#3a2048', Math.min(.25, -q / 90)); }
    return outBust(B); }],
  ['③ 赛璐璐', '动画式一刀切阴影，头发一条高光', B => {
    const { g, W2, H2, src, dark, isSkin, isHair, rel } = B;
    for (let k = 0; k < src.length; k++) { const c = src[k]; if (dark(c)) continue; const [nx, ny] = rel(k), cut = isSkin(c) ? nx > .84 || ny > .93 : isHair(c) ? nx > .66 || ny > .8 : nx > .68; if (cut) g.d[k] = mixHex(shade(c, -22), '#5a3a7a', .18); }
    let hy = H2, hx0 = W2, hx1 = 0; for (let k = 0; k < src.length; k++) if (isHair(src[k])) { const x = k % W2, y = (k - x) / W2; hy = Math.min(hy, y); hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x); }
    for (let a = -1; a <= 1; a += .005) { const x = R((hx0 + hx1) / 2 + a * (hx1 - hx0) * .32), y = R(hy + 16 + a * a * 10); for (let q = 0; q < 3; q++) if (isHair(src[(y + q) * W2 + x])) g.d[(y + q) * W2 + x] = '#fff2e2'; }
    return outBust(B); }],
  ['④ 复古抖动', '16 位机味道，明暗用棋盘点', B => {
    const { g, W2, src, dark, isSkin } = B, BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
    for (let k = 0; k < src.length; k++) { const c = src[k]; if (dark(c)) continue; const x = k % W2, y = (k - x) / W2, v = lightV(B, k, c) * (isSkin(c) ? .6 : 1), t = (BAY[y & 3][x & 3] + .5) / 16; g.d[k] = v > .15 && t < v ? shade(c, 14) : v < -.15 && t < -v ? shade(c, -20) : c; }
    return outBust(B, 2); }, false],
  ['⑤ 闪亮少女', '大反光眼，粉色轮廓光，腮红斜线', B => {
    const { g, W2, H2, src, at, dark, isSkin } = B;
    for (let k = 0; k < src.length; k++) { const c = src[k]; if (dark(c)) continue; const v = lightV(B, k, c); g.d[k] = v > .25 ? mixHex(c, '#fff0f4', .18) : v < -.35 ? mixHex(shade(c, -12), '#a05080', .14) : c; }
    for (let y = 0; y < H2; y++) { let x = W2 - 1; while (x > 0 && !at(x, y)) x--; for (let q = 2; q < 5; q++) { const c = at(x - q, y); if (c && !dark(c)) g.d[y * W2 + x - q] = mixHex(c, '#ffb8d8', .45); } }
    const { eyes, fy0 } = findEyes(B);
    for (const e of eyes) { const cx = R(e.x0 + (e.x1 - e.x0) * .66), cy = R(e.y0 + (e.y1 - e.y0) * .3); for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (dark(at(cx + dx, cy + dy))) g.d[(cy + dy) * W2 + cx + dx] = '#ffffff';
      const bx = R(e.x0 + (e.x1 - e.x0) * .3), by = R(e.y0 + (e.y1 - e.y0) * .75); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (dark(at(bx + dx, by + dy))) g.d[(by + dy) * W2 + bx + dx] = '#c8e4ff'; }
    const by = eyes.length ? Math.max(...eyes.map(e => e.y1)) + 8 : fy0 + 64;
    for (const e of eyes) { const bx = (e.x0 + e.x1) / 2 + ((e.x0 + e.x1) / 2 < W2 / 2 ? -4 : 4); for (let i = -1; i < 3; i++) for (let t = 0; t < 7; t++) { const x = R(bx + i * 4 - t * .5), y = by + t; if (isSkin(src[y * W2 + x])) g.d[y * W2 + x] = mixHex(src[y * W2 + x], '#f06080', .45); } }
    return outBust(B); }],
];
(function () {
  const id = window.BUST_ID || 'hero_f', cv = document.createElement('canvas'); cv.width = 6 * 214 + 10; cv.height = 300;
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, cv.width, cv.height);
  c.font = '15px sans-serif'; c.fillStyle = '#3a2a2e'; c.drawImage(bust(id), 10, 8); c.fillText('现在 A 版', 14, 268);
  OWNER_STYLES.forEach(([name, desc, fn, twice], i) => { const B = bustBase(id, twice !== false); c.drawImage(fn(B), 10 + (i + 1) * 214, 8); c.font = '15px sans-serif'; c.fillText(name, 14 + (i + 1) * 214, 268); c.font = '11px sans-serif'; c.fillText(desc, 14 + (i + 1) * 214, 288); });
})();
