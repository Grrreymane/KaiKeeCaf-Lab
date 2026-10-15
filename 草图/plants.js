// 盆栽库：在 2 倍画布上画，(a, b) 是花盆底的屏幕点。依赖 lib.js（Grid、shade、R）
// 种类：monstera 龟背竹 / money 发财树 / bamboo 富贵竹 / pothos 绿萝 / rubber 橡皮树 / palm 散尾葵
const PLANT_KINDS = { monstera: '龟背竹', money: '发财树', bamboo: '富贵竹', pothos: '绿萝', rubber: '橡皮树', palm: '散尾葵' };
const POTS = { cream: ['#efe9dd', '#d9d2c4', '#bdb5a6'], charcoal: ['#5a5a60', '#4a4a50', '#3a3a40'], terracotta: ['#d9875a', '#c06e44', '#a05834'], celadon: ['#b9d8c6', '#9cc4ad', '#7fa992'] };
// 斜着的椭圆叶片：上半亮、下半暗，中间一条叶脉
function leaf(g, x, y, ang, len, wid, cols = ['#2f7a4a', '#3f9a5a', '#5cb86a'], rib = '#2a6a40') {
  const ca = Math.cos(ang), sa = Math.sin(ang), cx = x + ca * len, cy = y + sa * len, r = len + wid + 1;
  for (let py = R(cy - r); py <= R(cy + r); py++) for (let px_ = R(cx - r); px_ <= R(cx + r); px_++) {
    const dx = px_ + .5 - cx, dy = py + .5 - cy, u = dx * ca + dy * sa, v = -dx * sa + dy * ca, k = (u / len) ** 2 + (v / (wid * (1 - .25 * u / len))) ** 2;
    if (k > 1) continue;
    g.set(px_, py, Math.abs(v) < .55 && Math.abs(u) < len * .85 ? rib : v < -wid * .25 ? (k < .35 && u < 0 ? cols[2] : cols[1]) : cols[0]);
  }
}
function cutLine(g, a, b) {   // 在已画好的像素上挖一道缝（龟背竹叶上的裂口）
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let i = 0; i <= n; i++) { const x = R(a[0] + (b[0] - a[0]) * i / n), y = R(a[1] + (b[1] - a[1]) * i / n); if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.d[y * g.w + x] = null; }
}
function drawPot(g, a, b, pot, h = 26) {
  g.ell(a, b, 11, 5, '#8a5a3a'); g.rect(R(a) - 10, R(b) - 3, 21, 3, '#8a5a3a');
  for (let t = 2; t <= h; t++) g.ell(a, b - t, 10 - (t < 6 ? (6 - t) * .3 : 0), 5, xx => xx < a - 3 ? pot[0] : xx < a + 5 ? pot[1] : pot[2]);
  g.ell(a, b - h, 10, 5, shade(pot[0], 8)); g.ell(a, b - h, 8.2, 3.8, '#4a362c');
}
function drawPlant(g, a, b, kind, potName) {
  const s = b - 27;   // 土面
  if (kind === 'pothos') drawPot(g, a, b, POTS[potName || 'terracotta']);
  else drawPot(g, a, b, POTS[potName || 'cream']);
  if (kind === 'monstera') {   // 龟背竹：几根长柄，大片心形叶，叶上有裂口
    for (const [dx, h, ang, L] of [[-8, 30, -2.4, 13], [8, 34, -.7, 13], [-2, 46, -1.9, 12], [5, 50, -1.2, 12], [-12, 18, -2.9, 11], [12, 20, -.2, 11]]) {
      const x = a + dx, y = s - h; g.seg([a + dx * .2, s], [x, y], '#4f8a4a');
      leaf(g, x, y, ang + Math.PI / 2 * .0, L, L * .78, ['#256a40', '#2f8a4e', '#56b066'], '#7cc47a');
      for (const k of [.35, .65]) for (const sg of [1, -1]) { const ca = Math.cos(ang), sa = Math.sin(ang), ux = x + ca * L * (1 + k * .8), uy = y + sa * L * (1 + k * .8), nx = -sa * sg, ny = ca * sg; cutLine(g, [ux + nx * L * .35, uy + ny * L * .35], [ux + nx * L * .8, uy + ny * L * .8]); }
    }
  } else if (kind === 'money') {   // 发财树：编辫子的树干 + 顶上一簇簇掌状叶
    for (let t = 0; t < 40; t++) { const y = s - t, w = Math.sin(t * .35) * 2.2; g.set(R(a + w), y, '#8a6a46'); g.set(R(a + w) + 1, y, '#a8845a'); g.set(R(a - w), y, '#6e5236'); g.set(R(a - w) + 1, y, '#8a6a46'); }
    for (const [dx, dy] of [[0, -50], [-12, -44], [12, -44], [-7, -36], [8, -38], [-2, -58]]) for (let k = 0; k < 5; k++) leaf(g, a + dx, s + dy, -Math.PI / 2 + (k - 2) * .62, 7, 2.6, ['#2f7a3e', '#3f9a4e', '#6cc06a'], '#2a6a36');
  } else if (kind === 'bamboo') {   // 富贵竹：几根高低不一的绿竹节，顶上几片尖叶
    for (const [dx, h] of [[-7, 38], [-1, 54], [6, 44], [-4, 28], [3, 62]]) {
      const x = a + dx; g.rect(R(x) - 1, s - h, 3, h, '#6fb84a'); g.rect(R(x) + 1, s - h, 1, h, '#4e9a3a');
      for (let y = s - 8; y > s - h; y -= 9) g.rect(R(x) - 1, y, 3, 1, '#a8d870');
      for (const [ang, L] of [[-2.2, 9], [-1, 9], [-2.8, 7], [-.4, 7]]) leaf(g, x, s - h, ang, L, 2.2, ['#3f8a3a', '#56a84a', '#8fd66a'], '#3a7a34');
    }
  } else if (kind === 'pothos') {   // 绿萝：心形小叶，从盆边垂下来，带黄斑
    const pts = [[-10, -2], [-13, 6], [-14, 14], [-15, 22], [11, -1], [14, 7], [15, 15], [-4, -6], [4, -8], [0, -12], [-8, -10], [8, -11], [13, 24], [-16, 30]];
    for (const [dx, dy] of pts) { const x = a + dx, y = s + dy, ang = dy > 0 ? Math.PI / 2 + (dx < 0 ? .4 : -.4) : -Math.PI / 2 + dx * .06; leaf(g, x, y, ang, 5.5, 4, ['#3a8a3e', '#56a84a', '#c9d65a'], '#d8e070'); }
    for (const [dx, d2] of [[-12, 30], [13, 24]]) g.seg([a + dx, s + 2], [a + dx - Math.sign(dx), s + d2], '#4f8a3a');
  } else if (kind === 'rubber') {   // 橡皮树：一根直干，大片深绿亮面椭圆叶，左右交错
    g.rect(R(a), s - 62, 2, 62, '#6a4a32');
    for (let i = 0; i < 7; i++) { const y = s - 14 - i * 7.5, sg = i % 2 ? 1 : -1; leaf(g, a + 1, y, sg > 0 ? -.45 - i * .04 : -2.7 + i * .04, 11 - i * .6, 5, ['#1f4a32', '#2a6040', '#7aa88a'], '#9a3a3a'); }
    leaf(g, a + 1, s - 64, -1.57, 7, 2.6, ['#6a2a2a', '#8a3a3a', '#c86a5a'], '#5a2424');   // 顶芽（红褐色叶鞘）
  } else {   // 散尾葵（原来的棕榈）
    for (const [dir, len, bend] of [[-1, 60, -.9], [-.3, 68, -.3], [.4, 64, .5], [1, 56, 1.1], [-1.6, 44, -1.5], [1.7, 42, 1.6], [0, 52, .05]]) {
      const pt = t => [a + dir * len * .55 * t + bend * 10 * t * t, s - len * (t * 1.15 - t * t * .75)];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + .04)), dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        g.set(R(x), R(y), '#5a7a3a');
        if (i > 2 && i % 2 === 0) { const ll = 9 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 2; for (const sgn of [1, -1]) { const ex = x + nx * ll * sgn + dx / L * 2, ey = y + ny * ll * sgn + 5; g.seg([R(x), R(y)], [R(ex), R(ey)], sgn * dir > 0 ? '#3f9a52' : '#2e7a42'); } }
      }
    }
  }
}
