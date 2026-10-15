// ==== art: shop (isometric 2:1, world canvas x2; from 草图/店铺等距.html)
const ROOM = 320, DADO = 96, WALL_H = 200, OX = 180, OY = 140, PLAT = 14;   // PLAT：柜台后面平台的高度
const K = 2, FOOT2 = FOOT * 2, LM = 240, WW = 1120 + LM, CAM_MAX = WW - 720;   // LM: world margin on the left so the view can pan left too   // world canvas is 2x; WW wider than the screen so the player can pan right (bake room, next door)
// mint palette, whites pushed warm, floor warm terracotta (settled 2026-10-14)
Object.assign(C, { marble: '#efe2c8', marbleS: '#d5c09c', marbleD: '#b9a17c', vein: '#e3d0ae', tile: '#eadcc0', tileL: '#d2c09e', floorA: '#e7bd96', floorB: '#dcac86', dot: '#4f9a7c',
  steel: '#d3d8d6', steelS: '#b4bbba', steelD: '#959d9e', cream: '#f6e8c8' });
const OUT2 = '#4a3236';   // object outline: neighbour colour pushed toward this
const P1 = (x, y, z = 0) => [OX + (x - y) + LM / K, OY + (x + y) / 2 - z];
const P = (x, y, z = 0) => [K * (OX + (x - y)) + LM, K * (OY + (x + y) / 2 - z)];
let BX_SWAP = false;   // set while drawing a turned object: its local side faces swap sides on screen, so swap their light too
const rotPj = (cx, cy) => (x, y, z = 0) => P(cx + (y - cy), cy + (x - cx), z);   // 'turned 90 degrees' = local x and y swapped round the centre
function bx(g, Q, x, y, z, w, d, h, top, left, right, r) {
  if (BX_SWAP) { const t = left; left = right; right = t; }
  if (r === undefined) r = Math.min(4, w / 4, d / 4);
  if (r < 1.5) {
    g.quad(Q(x, y + d, z + h), Q(x + w, y + d, z + h), Q(x + w, y + d, z), Q(x, y + d, z), left);
    g.quad(Q(x + w, y, z + h), Q(x + w, y + d, z + h), Q(x + w, y + d, z), Q(x + w, y, z), right);
    g.quad(Q(x, y, z + h), Q(x + w, y, z + h), Q(x + w, y + d, z + h), Q(x, y + d, z + h), top);
    return;
  }
  const pts = [];
  for (const [cx, cy, a0] of [[x + w - r, y + d - r, 0], [x + r, y + d - r, 90], [x + r, y + r, 180], [x + w - r, y + r, 270]])
    for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]); }
  const mid = mixHex(left, right, .5), rim = shade(top, 14);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], nx = p[2] + q[2], ny = p[3] + q[3];
    if (nx + ny <= .05) continue;   // 背面看不到
    const t = (nx - ny) / (Math.abs(nx) + Math.abs(ny) + 1e-6), col = t < -.4 ? left : t > .4 ? right : mid;
    g.quad(Q(p[0], p[1], z + h), Q(q[0], q[1], z + h), Q(q[0], q[1], z), Q(p[0], p[1], z), col);
  }
  const c0 = Q(x + w / 2, y + d / 2, z + h);
  for (let i = 0; i < pts.length; i++) { const a = Q(pts[i][0], pts[i][1], z + h), b = Q(pts[(i + 1) % pts.length][0], pts[(i + 1) % pts.length][1], z + h); g.tri(c0[0], c0[1], a[0], a[1], b[0], b[1], top); }
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; if (p[2] + q[2] + p[3] + q[3] > .05) g.seg(Q(p[0], p[1], z + h), Q(q[0], q[1], z + h), rim); }   // 顶边一道亮线
  if (w >= 20 && d >= 10) {   // 台面反光：左上两道斜光 + 一个亮点
    const hi = mixHex(top, '#ffffff', .42), hi2 = mixHex(top, '#ffffff', .22), Z = z + h;
    for (let k = 0; k < 3; k++) g.seg(Q(x + w * .1 + k, y + d * .8, Z), Q(x + w * .26 + k, y + d * .18, Z), k === 1 ? hi : hi2);
    g.seg(Q(x + w * .3, y + d * .8, Z), Q(x + w * .4, y + d * .3, Z), hi2); { const [a, b] = Q(x + w * .16, y + d * .3, Z); g.set(R(a), R(b), '#ffffff'); g.set(R(a) + 1, R(b), hi); }
  }
}
// thick outline: 2px around, neighbour colour pushed dark (style B)
function thickOut(g) {
  const src = g.d.slice(), at = (x, y) => (x < 0 || y < 0 || x >= g.w || y >= g.h) ? null : src[y * g.w + x];
  const near = [[0, 1], [-1, 0], [1, 0], [0, -1], [0, 2], [-2, 0], [2, 0], [0, -2], [-1, 1], [1, 1], [-1, -1], [1, -1]];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (src[y * g.w + x]) continue;
    for (const [dx, dy] of near) { const n = at(x + dx, y + dy); if (n) { g.set(x, y, mixHex(n, OUT2, .58)); break; } }
  }
}
// 一个物件 = 世界里的占地框（排前后用）+ 预先画好的小画布；steps 依次是要描边的形状 g 和直接贴上去的 d
function makeObj(Pj, ab, zTop, steps) {
  const cs = [[ab.x0, ab.y0], [ab.x1, ab.y0], [ab.x1, ab.y1], [ab.x0, ab.y1]], fx = cs.map(([x, y]) => Pj(x, y)[0]);   // all four corners (turned objects too)
  const minX = Math.floor(Math.min(...fx)) - 24, maxX = Math.ceil(Math.max(...fx)) + 24;
  const minY = Math.floor(Math.min(...cs.map(([x, y]) => Pj(x, y, zTop)[1]))) - 48, maxY = Math.ceil(Math.max(...cs.map(([x, y]) => Pj(x, y)[1]))) + 12;
  const w = maxX - minX, h = maxY - minY, cv = mk(w, h), cx = cv.getContext('2d');
  const Q = (x, y, z = 0) => { const p = Pj(x, y, z); return [p[0] - minX, p[1] - minY]; };
  for (const s of steps) {
    if (s.g) { const g = new Grid(w, h); s.g(g, Q); if (!s.plain && !s.flat) matPass(g, minX, minY); if (s.plain) { cx.save(); cx.globalAlpha = s.alpha || 1; cx.drawImage(g.canvas(), 0, 0); cx.restore(); } else { thickOut(g); cx.drawImage(g.canvas(), 0, 0); } }
    if (s.d) s.d(cx, Q);
  }
  return { ...ab, cv, sx: minX, sy: minY, bx0: minX, by0: minY, bx1: maxX, by1: maxY, draw(c) { c.drawImage(this.cv, this.sx, this.sy); if (this.after) this.after(c, this); } };
}
// two-tier display table (ref image 3). Live object: base + upper slab are separate canvases, food is drawn every frame
// from the layer counts (layer 0 = upper, layer 1 = lower). Locked tables wear a dust sheet.
function displayTable(Pj, x0, y0, tier = 0, rot = 0) {
  x0 += 9; y0 += 5; const w = 54, d = 26, x1 = x0 + w, y1 = y0 + d, ZU = 27, ab = { x0, x1, y0, y1 }, cx = x0 + w / 2, cy = y0 + d / 2, T = tier;
  if (rot) { Pj = rotPj(cx, cy); BX_SWAP = true; }
  const WOOD = T ? ['#a8703e', '#86562e', '#663e20'] : [C.woodL, C.wood, C.woodD];
  const slab = (g, Q, x, y, z, ww, dd) => {
    if (T === 1) {   // teak top with a brass edge
      bx(g, Q, x, y, z, ww, dd, 4, '#b07444', '#8a5630', '#6a3e20'); for (let k = 0; k < 3; k++) g.seg(Q(x + 4 + k * 17, y + 2, z + 4), Q(x + 11 + k * 17, y + dd - 2, z + 4), '#9a6238');
      g.seg(Q(x, y + dd, z + 2), Q(x + ww, y + dd, z + 2), C.brass); g.seg(Q(x + ww, y, z + 2), Q(x + ww, y + dd, z + 2), C.brassD);
    } else { bx(g, Q, x, y, z, ww, dd, 4, C.marble, C.marbleS, C.marbleD); g.seg(Q(x + 6, y + 4, z + 4), Q(x + ww * .6, y + dd - 3, z + 4), C.vein); if (T === 2) { g.seg(Q(x, y + dd, z + 1), Q(x + ww, y + dd, z + 1), C.brass); g.seg(Q(x + ww, y, z + 1), Q(x + ww, y + dd, z + 1), C.brassD); } }
  };
  const base = makeObj(Pj, ab, 50, [{ g: (g, Q) => {
    for (const [fx, fy] of [[x0 + 2, y0 + 2], [x1 - 7, y0 + 2], [x0 + 2, y1 - 7], [x1 - 7, y1 - 7]]) bx(g, Q, fx, fy, 0, 5, 5, 3, T ? C.brass : '#e6c79a', T ? C.brassD : '#b08a58', T ? '#a8781c' : '#957242');
    if (T === 2) { bx(g, Q, x0 + 1, y0 + 1, 3, w - 2, d - 2, 7, ...WOOD); g.seg(Q(x0 + 1, y1 - 1, 4), Q(x1 - 1, y1 - 1, 4), C.brass); }
    else bx(g, Q, x0 + 4, y0 + 4, 3, w - 8, d - 8, 7, ...WOOD);
    slab(g, Q, x0, y0, 10, w, d);
    if (T < 2) for (const [px_, py_] of [[x0 + 4, y0 + 4], [x1 - 6, y0 + 4], [x0 + 4, y1 - 12], [x1 - 6, y1 - 12]]) bx(g, Q, px_, py_, 14, T ? 2 : 1.4, T ? 2 : 1.4, ZU - 14, C.brass, C.brass, C.brassD);
    else for (const [px_, py_] of [[x0, y0], [x1 - 1.6, y0], [x0, y1 - 1.6], [x1 - 1.6, y1 - 1.6]]) bx(g, Q, px_, py_, 14, 1.6, 1.6, ZU - 14, C.brass, C.brass, C.brassD);
  } }]);
  const top = makeObj(Pj, ab, 50, [{ g: (g, Q) => slab(g, Q, x0, y0, ZU, w, d) }]);
  const sheet = makeObj(Pj, ab, 50, [{ g: (g, Q) => {   // dust sheet over a locked table
    bx(g, Q, x0 - 1, y0 - 1, 0, w + 2, d + 2, ZU + 5, '#e4ddd0', '#cfc6b5', '#b9af9d', 4);
    for (let t = x0 + 8; t < x1 - 4; t += 11) g.seg(Q(t, y1 + 1, ZU + 3), Q(t - 2, y1 + 1, 2), '#cfc6b6');
    for (let t = y0 + 7; t < y1 - 3; t += 9) g.seg(Q(x1 + 1, t, ZU + 3), Q(x1 + 1, t + 2, 2), '#bdb4a3');
  } }]);
  const ZT = ZU + 20, lid = T === 2 ? makeObj(Pj, ab, 70, [   // glass case over the top layer, brass frame, warm light strip
    { g: (g, Q) => { g.quad(Q(x0, y1, ZU + 4), Q(x1, y1, ZU + 4), Q(x1, y1, ZT), Q(x0, y1, ZT), '#d8f2f2'); g.quad(Q(x1, y0, ZU + 4), Q(x1, y1, ZU + 4), Q(x1, y1, ZT), Q(x1, y0, ZT), '#b8e2e6'); g.quad(Q(x0, y0, ZT), Q(x1, y0, ZT), Q(x1, y1, ZT), Q(x0, y1, ZT), '#e8fafa'); }, plain: true, alpha: .24 },
    { g: (g, Q) => { for (const t of [x0 + 10, x0 + 34]) g.quad(Q(t, y1, ZU + 5), Q(t + 4, y1, ZU + 5), Q(t + 10, y1, ZT - 1), Q(t + 6, y1, ZT - 1), '#ffffff'); }, plain: true, alpha: .45 },
    { g: (g, Q) => { for (const [a, b] of [[Q(x0, y1, ZU + 4), Q(x0, y1, ZT)], [Q(x1, y1, ZU + 4), Q(x1, y1, ZT)], [Q(x1, y0, ZU + 4), Q(x1, y0, ZT)], [Q(x0, y1, ZT), Q(x1, y1, ZT)], [Q(x1, y0, ZT), Q(x1, y1, ZT)], [Q(x0, y0, ZT), Q(x1, y0, ZT)], [Q(x0, y0, ZT), Q(x0, y1, ZT)]]) g.seg(a, b, C.brass); g.seg(Q(x0 + 2, y0 + 2, ZT - 1), Q(x1 - 2, y0 + 2, ZT - 1), '#fff1b8'); }, plain: true },
  ]) : null;
  const Q0 = (x, y, z) => { const p = Pj(x, y, z); return [p[0] - base.sx, p[1] - base.sy]; };
  const spots = [[], []], cols = 3 + T;   // fill order: back row first, so customers seem to take from the front
  for (const ry of [y0 + 9, y0 + 20]) for (let i = 0; i < cols; i++) spots[0].push(Q0(x0 + 10 + i * 34 / (cols - 1), ry, ZU + 4));
  for (const ry of [y1 - 15, y1 - 4]) for (let i = 0; i < cols; i++) spots[1].push(Q0(x0 + 10 + i * 34 / (cols - 1), ry, 14));
  const o = liveObj(ab, base, lid ? [top, lid] : [top], spots, sheet);
  if (lid) o.drawLive = function (c, layers, locked) { if (locked) { c.drawImage(this.sheet.cv, this.sx, this.sy); return; } c.drawImage(this.base.cv, this.sx, this.sy); this.food(c, 1, layers); c.drawImage(top.cv, this.sx, this.sy); this.food(c, 0, layers); c.drawImage(lid.cv, this.sx, this.sy); };
  BX_SWAP = false;
  if (rot) Object.assign(o, { x0: cx - d / 2, x1: cx + d / 2, y0: cy - w / 2, y1: cy + w / 2 });   // turned footprint
  return o;
}
// glass display fridge (cold milk tea). Same live layout: base, lower food, glass shelf, upper food, glass box.
function glassFridge(Pj, x0, y0, tier = 0, rot = 0) {
  x0 += 5; y0 += 3; const w = 62, d = 30, x1 = x0 + w, y1 = y0 + d, ZB = 12, ZT = 40, ab = { x0, x1, y0, y1 }, cx = x0 + w / 2, cy = y0 + d / 2, T = tier;
  if (rot) { Pj = rotPj(cx, cy); BX_SWAP = true; }
  const FR = T ? [C.brass, C.brass, C.brassD] : [C.steel, C.steelS, C.steelD];   // better fridges: brass frame
  const glass = (g, Q, a, b) => { g.quad(Q(x0, y1, a), Q(x1, y1, a), Q(x1, y1, b), Q(x0, y1, b), '#c9f0f2'); g.quad(Q(x1, y0, a), Q(x1, y1, a), Q(x1, y1, b), Q(x1, y0, b), '#a9dde3'); g.quad(Q(x0, y0, b), Q(x1, y0, b), Q(x1, y1, b), Q(x0, y1, b), '#e2fafb'); };
  const base = makeObj(Pj, ab, 50, [{ g: (g, Q) => {
    bx(g, Q, x0, y0, 0, w, d, ZB, C.woodL, C.wood, C.woodD);
    woodGrain(g, Q, x0 + 4, x1 - 4, 1, ZB - 1, y1, 15);
    g.quad(Q(x0 + 6, y1, 3), Q(x0 + 20, y1, 3), Q(x0 + 20, y1, 6), Q(x0 + 6, y1, 6), '#3b3135');
    for (let t = x0 + 7; t < x0 + 20; t += 2) g.seg(Q(t, y1, 3), Q(t, y1, 6), '#6a6e72');
    bx(g, Q, x0 + 1, y0 + 1, ZB, w - 2, d - 2, 1, '#e8f2f2', '#c9d6d8', '#b0bec0');
    for (const [px_, py_] of [[x0, y0], [x1 - 1.4, y0], [x0, y1 - 1.4], [x1 - 1.4, y1 - 1.4]]) bx(g, Q, px_, py_, ZB, 1.4, 1.4, ZT - ZB, ...FR);
  } }]);
  const mid = makeObj(Pj, ab, 50, [{ g: (g, Q) => bx(g, Q, x0 + 2, y0 + 2, ZB + 14, w - 4, d - 4, 1, '#dff6f8', '#bfe6ea', '#a9dbe0', 0), plain: true, alpha: .7 }]);
  const lid = makeObj(Pj, ab, 50, [
    { g: (g, Q) => glass(g, Q, ZB, ZT), plain: true, alpha: .26 },
    { g: (g, Q) => { const t = x0 + 8; g.quad(Q(t, y1, ZB + 1), Q(t + 9, y1, ZB + 1), Q(t + 19, y1, ZT - 1), Q(t + 10, y1, ZT - 1), '#ffffff'); g.quad(Q(t + 30, y1, ZB + 1), Q(t + 34, y1, ZB + 1), Q(t + 44, y1, ZT - 1), Q(t + 40, y1, ZT - 1), '#ffffff'); }, plain: true, alpha: .22 },
    { g: (g, Q) => { bx(g, Q, x0, y0, ZT, w, d, 1.5, ...FR); if (T === 2) g.seg(Q(x0 + 3, y0 + 3, ZT - 1), Q(x1 - 3, y0 + 3, ZT - 1), '#dff8ff'); for (const [a, b] of [[Q(x0, y1, ZB), Q(x0, y1, ZT)], [Q(x1, y1, ZB), Q(x1, y1, ZT)], [Q(x1, y0, ZB), Q(x1, y0, ZT)]]) g.seg(a, b, '#ffffff'); for (let t = x0 + 10; t < x1 - 10; t += 26) { g.seg(Q(t, y1, ZB + 4), Q(t + 7, y1, ZT - 4), '#ffffff'); g.seg(Q(t + 3, y1, ZB + 4), Q(t + 10, y1, ZT - 4), '#ffffff'); } }, plain: true, alpha: .8 },
  ]);
  const Q0 = (x, y, z) => { const p = Pj(x, y, z); return [p[0] - base.sx, p[1] - base.sy]; };
  const spots = [[], []], cols = 3 + T;
  for (let i = 0; i < cols; i++) spots[0].push(Q0(x0 + 12 + i * 38 / (cols - 1), y0 + 16, ZB + 15));
  for (const ry of [y0 + 10, y0 + 22]) for (let i = 0; i < cols; i++) spots[1].push(Q0(x0 + 12 + i * 38 / (cols - 1), ry, ZB + 1));
  // draw order: base, lower food, glass shelf, upper food, glass box
  const o = liveObj(ab, base, [mid, lid], spots, null);
  o.drawLive = function (c, layers) {
    c.drawImage(this.cv, this.sx, this.sy); this.food(c, 1, layers);
    c.drawImage(mid.cv, this.sx, this.sy); this.food(c, 0, layers);
    c.drawImage(lid.cv, this.sx, this.sy);
  };
  BX_SWAP = false;
  if (rot) Object.assign(o, { x0: cx - d / 2, x1: cx + d / 2, y0: cy - w / 2, y1: cy + w / 2 });
  return o;
}
const SHELF_POS = { T1: [88, 76], T2: [184, 76], T3: [88, 144], T4: [184, 144], T5: [88, 212], T6: [184, 212], T7: [82, 250] };
const isFridge = id => W && W.shelves && W.shelves[id] ? !!W.shelves[id].fridge : id === 'T2';
function shelfObj(id) {   // the shelf as the player has it: tier + facing
  const d = (W && W.decor) || { tier: {}, rot: {} }, t = d.tier[id] || 0, r = d.rot[id] || 0, [x, y] = SHELF_POS[id];
  const fr = isFridge(id), o = fr ? glassFridge(P, x, y, t, r) : displayTable(P, x, y, t, r); o._key = t + ':' + r + ':' + (fr ? 1 : 0); return o;   // each spot is a shelf or a glass fridge, as the player chose
}
// a live object: one footprint, several stacked canvases sharing the same origin; `layers` comes from the game state
function liveObj(ab, base, parts, spots, sheet) {
  const all = mk(base.cv.width, base.cv.height), ax = all.getContext('2d');
  ax.drawImage(base.cv, 0, 0); for (const q of parts) ax.drawImage(q.cv, 0, 0);
  return { ...ab, cv: all, base, parts, spots, sheet, sx: base.sx, sy: base.sy, bx0: base.bx0, by0: base.by0, bx1: base.bx1, by1: base.by1, live: true,
    food(c, li, layers) { const L = layers && layers[li]; if (!L || !L.p || !L.n) return; const img = PRODUCTS[L.p].img; for (let i = 0; i < Math.min(L.n, this.spots[li].length); i++) putB(c, img, [this.sx + this.spots[li][i][0], this.sy + this.spots[li][i][1]]); },
    drawLive(c, layers, locked) {
      if (locked && this.sheet) { c.drawImage(this.sheet.cv, this.sx, this.sy); return; }
      c.drawImage(this.base.cv, this.sx, this.sy); this.food(c, 1, layers);
      c.drawImage(this.parts[0].cv, this.sx, this.sy); this.food(c, 0, layers);
    },
    draw(c) { const sh = this.shelf; this.drawLive(c, sh && sh.layers, sh && sh.locked); } };
}
// 左墙港式海报：荧光黄纸「是日推介 · 蛋挞 $8」，按左墙方向（往右上斜）贴
function posterLeft(c) {
  const w = 60, h = 116, tc = mk(w, h), x = tc.getContext('2d');
  x.fillStyle = '#d9372a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe14d'; x.fillRect(3, 3, w - 6, h - 6);
  x.fillStyle = '#d9372a'; x.fillRect(3, 3, w - 6, 26);
  x.textAlign = 'center'; x.textBaseline = 'top'; x.font = sr(18); x.fillStyle = '#fff4dc'; x.fillText('是日', w / 2, 6);
  x.drawImage(FOOD_L.tart, (w - FOOD_L.tart.width) / 2, 34);
  x.font = sr(16); x.fillStyle = '#d9372a'; x.fillText('推介', w / 2, 60);
  x.font = sr(22); x.fillStyle = '#2f6e56'; x.fillText('$8', w / 2, 80);
  x.fillStyle = '#2f6e56'; for (let i = 6; i < w - 6; i += 6) x.fillRect(i, h - 8, 3, 3);
  const [sx, sy] = P(0, 176, 124); for (let i = 0; i < w; i++) c.drawImage(tc, i, 0, 1, h, R(sx) + i, R(sy - i / 2), 1, h);
  px(c, R(sx) + 2, R(sy) - 2, 3, 3, '#c9cdd0'); px(c, R(sx) + w - 5, R(sy - w / 2) - 2, 3, 3, '#c9cdd0');   // 两颗图钉
}
// 墙上的字：先写在小画布上，再一列列往下错半格贴到右墙（y = 0）上
function wallText(c, xa, z1, w, h, fn) {
  const tc = mk(w, h), tx = tc.getContext('2d'); tx.textBaseline = 'top'; fn(tx);
  const [sx, sy] = P(xa, 0, z1); for (let i = 0; i < w; i++) c.drawImage(tc, i, 0, 1, h, R(sx) + i, R(sy + i / 2), 1, h);
}
function menuHead(x, t, cx) { x.font = sr(14); x.fillStyle = C.gold; x.textAlign = 'center'; x.fillText(t, cx, 3); x.fillStyle = 'rgba(255,240,200,.45)'; x.fillRect(cx - 40, 18, 80, 1); x.textAlign = 'left'; }
function menuRows(x, rows, l, r) { x.font = fp(12); rows.forEach(([n, p], i) => { const y = 22 + i * 14; x.fillStyle = '#f6ead0'; x.fillText(n, l, y); x.textAlign = 'right'; x.fillStyle = '#ffe08a'; x.fillText('$' + p, r, y); x.textAlign = 'left'; for (let d = l + x.measureText(n).width + 3; d < r - 22; d += 3) { x.fillStyle = 'rgba(255,240,200,.35)'; x.fillRect(d, y + 9, 1, 1); } }); }

function contactShadows(c) {
  const outer = new Grid(WW, 1280), inner = new Grid(WW, 1280), col = '#3a2418';
  const box = (g, x0, y0, x1, y1, z) => g.quad(P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z), col);
  for (const o of STATICS) {
    if (o.x1 - o.x0 < 3 && o.y1 - o.y0 < 3) continue;
    const z = (o.y1 <= 30 && o.x1 <= 320) ? PLAT : 0;
    box(outer, o.x0 - 2, o.y0 - 2, o.x1 + 5, o.y1 + 5, z); box(inner, o.x0 - .5, o.y0 - .5, o.x1 + 2.5, o.y1 + 2.5, z);
  }
  box(outer, 0, 30, ROOM, 40, 0); box(inner, 0, 30, ROOM, 34, 0);       // 平台前沿
  box(outer, 0, 30, 8, ROOM, 0); box(inner, 0, 30, 3, ROOM, 0);         // 左墙根
  box(outer, 0, 0, ROOM, 6, PLAT); box(inner, 0, 0, ROOM, 2, PLAT);     // 后墙根（平台上）
  c.save(); c.globalAlpha = .13; c.drawImage(outer.canvas(), 0, 0); c.globalAlpha = .16; c.drawImage(inner.canvas(), 0, 0); c.restore();
}

// ============================================================ 背景：地板、墙、窗、招牌、街、隔壁
function drawBackground(c) {
  px(c, 0, 0, WW, 1280, '#2b2230');
  const g = new Grid(WW, 1280);
  const tiles = (x0, y0, x1, y1, s, A, B, z = 0) => { for (let x = x0; x < x1; x += s) for (let y = y0; y < y1; y += s) g.quad(P(x, y, z), P(x + s, y, z), P(x + s, y + s, z), P(x, y + s, z), ((x + y) / s) & 1 ? B : A); };
  // 街：人行道、马路、对面人行道
  tiles(-400, 320, 800, 360, 16, '#d3ccc0', '#c7c0b4');
  g.quad(P(-400, 344), P(800, 344), P(800, 345), P(-400, 345), '#bdb5a8');   // kerb-side strip for the bin, newspaper stand and lamp
  g.quad(P(-400, 360), P(800, 360), P(800, 364), P(-400, 364), '#8f887d');
  g.quad(P(-400, 364), P(800, 364), P(800, 420), P(-400, 420), '#5d5856');   // two lanes, one-way (dashed line between, yellow lines at the kerbs)
  for (let x = -400; x < 800; x += 7) for (let y = 365; y < 419; y += 5) if ((x * 3 + y * 7) % 11 === 0) g.quad(P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1), '#676260');
  for (let x = -380; x < 800; x += 48) g.quad(P(x, 391), P(x + 24, 391), P(x + 24, 393), P(x, 393), '#e8e2d4');
  g.quad(P(-400, 366), P(800, 366), P(800, 367), P(-400, 367), '#d9b23a'); g.quad(P(-400, 417), P(800, 417), P(800, 418), P(-400, 418), '#d9b23a');
  g.quad(P(-400, 420), P(800, 420), P(800, 424), P(-400, 424), '#8f887d');
  tiles(-400, 424, 800, 660, 16, '#cbc4b8', '#bfb8ac');
  // 隔壁铺（空铺招租）：旧地砖，压暗
  tiles(320, 0, 640, 320, 32, '#e4e0da', '#dedad3');   // 隔壁：未解锁，浅灰让人略过
  g.quad(P(320, 0, 0), P(640, 0, 0), P(640, 0, WALL_H), P(320, 0, WALL_H), '#d9d5ce');
  // 本铺地板：大格子 + 角上一点绿；柜台后面是高一级的平台（小砖）
  tiles(0, 32, ROOM, ROOM, 16, C.floorA, C.floorB);
  // 门口马赛克花砖：白底，红花绿叶，深绿镶边
  for (let x = 248; x < 316; x += 4) for (let y = 264; y < 316; y += 4) {
    const i = ((x - 248) / 4) | 0, j = ((y - 264) / 4) | 0, edge = i === 0 || j === 0 || i === 16 || j === 12;
    const u = (i - 1) % 6, v = (j - 1) % 6, flower = (u === 2 || u === 3) && (v === 2 || v === 3), leaf = !flower && ((u === 2 || u === 3) && (v === 1 || v === 4) || (v === 2 || v === 3) && (u === 1 || u === 4));
    g.quad(P(x, y), P(x + 4, y), P(x + 4, y + 4), P(x, y + 4), edge ? '#3f6b5a' : flower ? '#b8483c' : leaf ? '#5f9a80' : ((i + j) & 1 ? '#f1e8d6' : '#e8dcc6'));
  }
  if (C.dot) for (let x = 0; x <= ROOM; x += 32) for (let y = 32; y <= ROOM; y += 32) { const [sx, sy] = P(x, y); g.quad([sx, sy - 4], [sx + 8, sy], [sx, sy + 4], [sx - 8, sy], C.dot); }
  // 两面后墙：右墙（y=0）亮一档，左墙（x=0）暗一档
  const wR = (xa, xb, z0, z1, col) => g.quad(P(xa, 0, z0), P(xb, 0, z0), P(xb, 0, z1), P(xa, 0, z1), col);
  let XF = null;   // while a wall piece is drawn: its art moved into the slot the player chose
  const wL = (ya, yb, z0, z1, col) => { if (XF) { [ya, z0] = XF(ya, z0); [yb, z1] = XF(yb, z1); } g.quad(P(0, ya, z0), P(0, yb, z0), P(0, yb, z1), P(0, ya, z1), col); };
  const WS = WALLS[(W && W.decor && W.decor.wall) || 'mint'] || WALLS.mint; C.wall = WS.wall; C.wallD = WS.wallD;   // wallpaper from the decor shop
  const LOW = WS.low || shade(WS.wall, -40), dado = (ya, yb, left) => {   // two-tone wall: a dark panel from the tiles up to the rail, boards every 16, then a trim rail
    wR(ya, yb, 40, DADO, LOW); for (let t = ya + 16; t < yb; t += 16) g.seg(P(t, 0, 40), P(t, 0, DADO), shade(LOW, -16)); wR(ya, yb, DADO, DADO + 3, C.trim); wR(ya, yb, DADO + 2, DADO + 3, C.trimL);
    if (left) { wL(ya, yb, 40, DADO, shade(LOW, -18)); for (let t = ya + 16; t < yb; t += 16) g.seg(P(0, t, 40), P(0, t, DADO), shade(LOW, -32)); wL(ya, yb, DADO, DADO + 3, shade(C.trim, -10)); } };
  wR(0, ROOM, 0, WALL_H, C.wall); wL(0, ROOM, 0, WALL_H, shade(C.wall, -18));
  for (let t = 4; t < ROOM; t += 8) { g.seg(P(t, 0, DADO + 3), P(t, 0, WALL_H - 6), C.wallD); g.seg(P(0, t, DADO + 3), P(0, t, WALL_H - 6), shade(C.wallD, -18)); }
  if (WS.stripe) for (let t = 0; t < ROOM; t += 16) for (let k = 0; k < 6; k++) { g.seg(P(t + k, 0, DADO + 3), P(t + k, 0, WALL_H - 6), C.wallD); g.seg(P(0, t + k, DADO + 3), P(0, t + k, WALL_H - 6), shade(C.wallD, -18)); }
  dado(0, ROOM, true);   // the dark lower panel + rail
  if (WS.floral) for (let t = 8; t < ROOM; t += 16) for (let z = DADO + 10; z < WALL_H - 10; z += 18) { const zz = z + ((t / 16) & 1) * 9; for (const [pt, col] of [[P(t, 0, zz), '#ffffff'], [P(0, t, zz), '#f6e6e6']]) { const [a, b] = pt; g.set(R(a), R(b) - 1, col); g.set(R(a) - 1, R(b), col); g.set(R(a) + 1, R(b), col); g.set(R(a), R(b) + 1, col); g.set(R(a), R(b), '#e07a8a'); g.set(R(a) + 2, R(b) + 2, '#7ab07a'); } }
  if (WS.rail) for (const z of [DADO + 4, DADO + 6, WALL_H - 10]) { g.seg(P(0, 0, z), P(ROOM, 0, z), C.brass); g.seg(P(0, 0, z), P(0, ROOM, z), C.brassD); }
  wR(0, ROOM, 0, 36, C.tile); wL(0, ROOM, 0, 36, shade(C.tile, -12));
  for (let z = 6; z < 36; z += 6) { g.seg(P(0, 0, z), P(ROOM, 0, z), C.tileL); g.seg(P(0, 0, z), P(0, ROOM, z), shade(C.tileL, -12)); }
  for (let t = 6; t < ROOM; t += 6) { g.seg(P(t, 0, 0), P(t, 0, 36), C.tileL); g.seg(P(0, t, 0), P(0, t, 36), shade(C.tileL, -12)); }
  wR(0, ROOM, 36, 40, C.trim); wL(0, ROOM, 36, 40, shade(C.trim, -10)); wR(0, ROOM, 36, 37, C.trimL);
  wR(0, ROOM, WALL_H - 6, WALL_H, C.trim); wL(0, ROOM, WALL_H - 6, WALL_H, shade(C.trim, -10));
  // 柜台后面的平台：顶面小砖 + 正面木边
  tiles(0, 0, ROOM, 30, 8, '#e3d6bc', '#d7c8aa', PLAT);
  g.quad(P(0, 30, 0), P(ROOM, 30, 0), P(ROOM, 30, PLAT), P(0, 30, PLAT), C.wood); g.seg(P(0, 30, PLAT), P(ROOM, 30, PLAT), C.woodL);
  // 右墙：红底菜单牌 ×2 + 店名木牌
  let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (const [xa, xb, z0, z1] of [[8, 62, 66, 102], [70, 176, 64, 96]]) {
    wR(xa - 1, xb + 1, z0 - 1, z1 + 1, OUT); wR(xa, xb, z0, z1, C.board); wR(xa, xb, z1 - 1, z1, shade(C.board, 30));
    for (const t of [xa + 3, xb - 4]) wR(t, t + 1, z1 + 1, z1 + 6, '#5a4a40');   // 挂绳
  }
  wR(69, 177, 103, 129, OUT); wR(70, 176, 104, 128, '#5a3524'); wR(70, 176, 127, 128, '#7a4a32');
  // 左墙：大窗。窗外对街的唐楼按远处的比例画：一层约 9 高，窗只有 3–4 宽，有冷气机、晾衫竹、招牌
  wL(38, 142, 40, 116, C.trimL);
  wL(42, 138, 44, 112, '#a6dcf4'); wL(42, 138, 96, 112, '#c4e9f9');
  const bld = (ya, yb, top, col, win, k) => {
    wL(ya, yb, 44, top, col); wL(ya, yb, top - 2, top, shade(col, -26));
    for (let z = 58; z < top - 4; z += 9) for (let y = ya + 2; y < yb - 3; y += 5) {
      const lit = ((y * 7 + z * 3 + k) % 5) === 0;
      wL(y, y + 3, z, z + 4, lit ? '#fff1b8' : win); wL(y, y + 3, z, z + 1, shade(col, -30));
      if (((y + z + k) % 3) === 0) wL(y, y + 2, z - 2, z, '#c9cdd0');   // 冷气机
    }
    for (let z = 62; z < top - 6; z += 18) { g.seg(P(0, ya + 1, z), P(0, yb - 1, z), '#7a5a3a'); for (let y = ya + 3; y < yb - 2; y += 4) wL(y, y + 2, z - 3, z, ['#e5604f', '#3f86d6', '#ffffff', '#f0b43a'][(y + k) % 4]); }
  };
  bld(42, 68, 112, '#e9d6b4', '#6f8aa6', 1); bld(70, 104, 112, '#e2a796', '#5f7a96', 2); bld(106, 138, 100, '#cdbfd8', '#6a7f9a', 3);
  wL(122, 130, 100, 106, '#9aa0a3');   // 天台水箱
  // 街铺：底层铺面、招牌
  wL(42, 138, 44, 54, '#5a4a48'); wL(44, 66, 52, 56, '#2f9e6e'); wL(72, 102, 52, 56, '#e5b23a'); wL(108, 136, 52, 56, '#d9372a');
  for (let y = 44; y < 138; y += 3) wL(y, y + 1, 45, 51, '#8c8078');
  wL(96, 100, 60, 96, '#ff4f6a'); for (let z = 64; z < 94; z += 6) wL(96, 100, z, z + 3, '#fff4dc');   // 竖招牌
  wL(88, 92, 44, 112, C.trimL); wL(42, 138, 78, 81, C.trimL);
  wL(36, 144, 38, 42, C.trim);
  wL(146, 176, 66, 124, '#d9372a');   // 海报底（红边），字和图在 posterLeft 里贴
  // 壁扇（窗上面）：墙上铁板 + 伸出的支架 + 圆马达壳 + 前后两层铁丝网，看得出厚度
  if (!upLv('ac')) { const fy = 92, fz = 134, F = (k, y, z) => P(k, fy + y, fz + z), C28 = [...Array(28).keys()].map(i => i / 28 * 6.283);
    const disc = (k, r, col) => C28.forEach((a, i) => { const b = C28[(i + 1) % 28]; g.tri(...F(k, 0, 0), ...F(k, Math.cos(a) * r, Math.sin(a) * r), ...F(k, Math.cos(b) * r, Math.sin(b) * r), col); });
    const ring = (k, r, col) => C28.forEach((a, i) => { const b = C28[(i + 1) % 28]; g.seg(F(k, Math.cos(a) * r, Math.sin(a) * r), F(k, Math.cos(b) * r, Math.sin(b) * r), col); });
    g.quad(F(0, -3, -22), F(0, 3, -22), F(0, 3, -12), F(0, -3, -12), '#5a5e62');
    for (let k = 0; k <= 5; k += .5) { g.seg(F(k, -1, -17), F(k, -1, -6), '#7a7f82'); g.seg(F(k, 0, -17), F(k, 0, -6), '#5a5e62'); }
    for (let k = 1; k <= 6; k += .5) disc(k, 5.5, k < 6 ? '#8a9093' : '#c9cdd0');
    ring(6.5, 13, '#6a7073'); for (let i = 0; i < 28; i += 4) g.seg(F(6.5, 0, 0), F(6.5, Math.cos(C28[i]) * 13, Math.sin(C28[i]) * 13), '#7a7f82');
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + .4; g.tri(...F(8, 0, 0), ...F(8, Math.cos(a) * 11, Math.sin(a) * 11), ...F(8, Math.cos(a + .75) * 11, Math.sin(a + .75) * 11), k === 0 ? '#9cd0bc' : '#7fb3a0'); }
    for (const a of [0, 1.571, 3.142, 4.712, .785, 2.356, 3.927, 5.498]) g.seg(F(6.5, Math.cos(a) * 13, Math.sin(a) * 13), F(10, Math.cos(a) * 12, Math.sin(a) * 12), '#9aa0a3');   // 网罩侧面（厚度）
    ring(10, 12, '#c9cdd0'); ring(10, 11.5, '#a4a9ac'); ring(10, 6, '#b4b9bc');
    for (let i = 0; i < 28; i += 2) g.seg(F(10, Math.cos(C28[i]) * 3, Math.sin(C28[i]) * 3), F(10, Math.cos(C28[i]) * 12, Math.sin(C28[i]) * 12), '#d9dcd8');
    disc(10.5, 3, '#e9c46a'); { const [a, b] = F(10.5, -1, 1); g.set(R(a), R(b), '#fff0b8'); } }
  else {   // air conditioner where the fan was: white box, vent slats, a little green light, a drip pipe
    wL(68, 118, 130, 154, '#9aa0a3'); wL(69, 117, 131, 153, '#eef1f3'); wL(69, 117, 150, 153, '#ffffff'); wL(69, 117, 131, 134, '#c9cdd0');
    for (let y = 72; y < 115; y += 3) wL(y, y + 1, 135, 139, '#b6bcc0');
    wL(108, 111, 145, 147, upLv('ac') >= 3 ? '#3fbf7a' : '#7fdca0'); wL(80, 106, 142, 143, '#d9dde0');
    wL(115, 116, 100, 131, '#c9cdd0');
  }
  // wall pieces bought in 装修 → 摆设 (left wall below the fan, right wall by the bake room)
  if (hasItem('clock')) { XF = wallXF('clock', 192, 212, 126, 146); const cy = 202, cz = 136; for (let y = -10; y <= 10; y++) for (let z = -10; z <= 10; z++) { const d = Math.hypot(y, z); if (d > 10) continue; wL(cy + y, cy + y + 1, cz + z, cz + z + 1, d > 8.5 ? '#6b4a35' : d > 7.5 ? '#c99428' : '#fbf3e0'); }
    for (let t = 0; t < 7; t++) { wL(cy, cy + 1, cz + t, cz + t + 1, '#2a2024'); if (t < 6) wL(cy + t, cy + t + 1, cz, cz + 1, '#2a2024'); } }
  if (hasItem('calendar')) { XF = wallXF('calendar', 188, 216, 62, 118); wL(188, 216, 62, 118, '#6b4a35'); wL(190, 214, 64, 116, '#f4ead6'); wL(194, 210, 70, 104, '#e88aa0'); wL(198, 206, 96, 110, '#f6d0ae'); wL(196, 208, 106, 114, '#2a2024'); wL(190, 214, 64, 70, '#c8342c'); }
  if (hasItem('photo')) { XF = wallXF('photo', 262, 298, 64, 96); wL(262, 298, 64, 96, '#5a3c2a'); wL(264, 296, 66, 94, '#d8c4a0'); for (const y of [270, 279, 288]) { wL(y, y + 5, 76, 84, '#8a6a4a'); wL(y + 1, y + 4, 84, 88, '#6a4a30'); } }
  if (hasItem('banner')) { XF = wallXF('banner', 222, 256, 100, 157); wL(224, 254, 100, 156, '#b8342c'); wL(226, 252, 102, 150, '#d8402e'); for (let z = 108; z < 146; z += 8) wL(232, 246, z, z + 4, '#ffd23f'); wL(222, 256, 154, 157, '#6b4a35'); }   // 锦旗 from a regular
  if (hasItem('card')) { XF = wallXF('card', 300, 312, 100, 116); wL(300, 312, 100, 116, '#f4ead6'); wL(301, 311, 112, 115, '#e88aa0'); for (const z of [104, 107]) wL(302, 310, z, z + 1, '#8a7a6a'); }
  { const ws = W ? keepList('w') : []; if (ws.length) { XF = wallXF('board', 260, 300, 102, 152);   // the regulars' board: a cork board on the left wall, their flat keepsakes pinned on it
    wL(260, 300, 102, 152, '#6b4a35'); wL(262, 298, 104, 150, '#c49a6a'); for (let y = 264; y < 298; y += 5) wL(y, y + 1, 106 + (y % 3), 107 + (y % 3), '#b08658');
    ws.slice(0, 12).forEach((k, i) => { const y0 = 264 + (i % 3) * 11, z0 = 140 - Math.floor(i / 3) * 12, [, t, col] = KEEP_ART[k];
      if (t === 'card' || t === 'postcard') { wL(y0, y0 + 9, z0, z0 + 7, t === 'postcard' ? '#ffffff' : '#f4ead6'); wL(y0 + 1, y0 + 8, z0 + 1, z0 + (t === 'postcard' ? 6 : 3), col); }
      else if (t === 'sticker' || t === 'badge') { wL(y0 + 2, y0 + 7, z0 + 1, z0 + 7, col); wL(y0 + 1, y0 + 8, z0 + 2, z0 + 6, col); wL(y0 + 4, y0 + 5, z0 + 3, z0 + 5, '#ffffff'); if (t === 'badge') wL(y0 + 3, y0 + 6, z0 - 2, z0 + 1, '#c8342c'); }
      else if (t === 'ticket') { wL(y0, y0 + 10, z0 + 2, z0 + 6, col); wL(y0 + 7, y0 + 8, z0 + 2, z0 + 6, '#fff4dc'); }
      else if (t === 'drawing') { wL(y0, y0 + 9, z0, z0 + 8, '#ffffff'); wL(y0 + 2, y0 + 7, z0 + 1, z0 + 4, col); wL(y0 + 3, y0 + 6, z0 + 4, z0 + 6, '#b8483c'); }
      else if (t === 'photo') { wL(y0, y0 + 10, z0, z0 + 8, col); wL(y0 + 1, y0 + 9, z0 + 1, z0 + 7, '#d8c4a0'); wL(y0 + 3, y0 + 4, z0 + 2, z0 + 5, '#6a4a30'); wL(y0 + 6, y0 + 7, z0 + 2, z0 + 5, '#6a4a30'); }
      else if (t === 'bag') { wL(y0 + 1, y0 + 9, z0, z0 + 7, col); wL(y0 + 3, y0 + 7, z0 + 7, z0 + 9, '#8a7a6a'); wL(y0 + 3, y0 + 7, z0 + 2, z0 + 5, '#e07ab0'); }
      wL(y0 + 4, y0 + 5, z0 + 8, z0 + 9, '#d0453a');   // the pin
    }); } }
  XF = null;
  if (hasItem('neon')) { wR(186, 232, 146, 172, '#1f1a24'); for (const z of [148, 170]) wR(188, 230, z, z + 1, '#ff5a9a'); for (const x of [188, 229]) wR(x, x + 1, 148, 171, '#ff5a9a'); wR(196, 222, 158, 160, '#7ff0ff'); wR(205, 207, 151, 167, '#7ff0ff'); }
  if (expandLv()) {   // next door opened up: same floor and wallpaper as the shop, a brass rail and two hanging lamps' worth of trim
    tiles(320, 0, 640, 320, 16, C.floorA, C.floorB);
    wR(320, 640, 0, WALL_H, C.wall); for (let t = 324; t < 640; t += 8) g.seg(P(t, 0, DADO + 3), P(t, 0, WALL_H - 6), C.wallD);
    if (WS.stripe) for (let t = 320; t < 640; t += 16) for (let k = 0; k < 6; k++) g.seg(P(t + k, 0, DADO + 3), P(t + k, 0, WALL_H - 6), C.wallD);
    dado(320, 640, false);
    wR(320, 640, 0, 36, C.tile); for (let z = 6; z < 36; z += 6) g.seg(P(320, 0, z), P(640, 0, z), C.tileL); for (let t = 326; t < 640; t += 6) g.seg(P(t, 0, 0), P(t, 0, 36), C.tileL);
    wR(320, 640, 36, 40, C.trim); wR(320, 640, 36, 37, C.trimL); wR(320, 640, WALL_H - 6, WALL_H, C.trim);
    for (const xa of [360, 470, 580]) { wR(xa - 1, xa + 41, 69, 111, OUT); wR(xa, xa + 40, 70, 110, '#f4ead6'); wR(xa + 3, xa + 37, 73, 107, ['#e5b23a', '#7fb3a0', '#e5604f'][((xa - 360) / 110) | 0]); }   // framed prints
  }
  bgMatPass(g);
  c.drawImage(g.canvas(), 0, 0);
  posterLeft(c);
  if (hasItem('neon')) wallText(c, 190, 168, 76, 22, x => { x.font = sr(16); x.fillStyle = '#ffd0e6'; x.shadowColor = '#ff5a9a'; x.shadowBlur = 6; x.textAlign = 'center'; x.fillText('好 味', 38, 2); });
  if (!expandLv()) { const [a, b] = P(470, 150); c.save(); c.font = fp(24); c.textAlign = 'center'; c.fillStyle = '#b9b3aa'; c.fillText('隔壁 · 可扩建', a, b); c.restore(); }
  wallText(c, 238, 132, 100, 28, (x) => { x.fillStyle = '#5a3524'; x.fillRect(0, 0, 100, 28); x.fillStyle = '#7a4a32'; x.fillRect(0, 0, 100, 2); x.font = sr(16); x.fillStyle = C.gold; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('烘 焙 间', 50, 5); });
  // 价目牌上的字
  { const on = p => W && unlocked(p), drinks = PIDS.filter(p => on(p) && PRODUCTS[p].where === 'fridge' && !PRODUCTS[p].cake && !PRODUCTS[p].lab), food = PIDS.filter(p => on(p) && !drinks.includes(p)).sort((a, b) => (PRODUCTS[b].cake ? 1 : 0) - (PRODUCTS[a].cake ? 1 : 0));   // the menu boards show what is really on sale, cakes first
    const row = p => [PRODUCTS[p].name, String(priceOf(p))], d3 = (drinks.length ? drinks : ['tea']).slice(-3).map(row), f6 = (food.length ? food : ['tart', 'bun']).slice(0, 6).map(row);
    wallText(c, 8, 102, 108, 72, (x) => { menuHead(x, '饮 品', 54); menuRows(x, d3, 6, 102); });
    wallText(c, 70, 96, 212, 64, (x) => { menuHead(x, PIDS.some(p => on(p) && PRODUCTS[p].cake) ? '饼 食 · 蛋 糕' : '饼 食 · 糖 水', 106); menuRows(x, f6.slice(0, 3), 8, 98); menuRows(x, f6.slice(3, 6), 114, 204); }); }
  // 隔壁压暗（空铺）
  // 店名：「街记冰室」按右墙方向斜着贴（逐列往下错半格）
  const tc = mk(212, 32), tx = tc.getContext('2d'); tx.font = sr(26); tx.textBaseline = 'top'; tx.fillStyle = C.gold;
  [...'街记冰室'].forEach((ch, i) => tx.fillText(ch, 20 + i * 48, 4));
  const [sx, sy] = P(70, 0, 124); for (let i = 0; i < 212; i++) c.drawImage(tc, i, 0, 1, 32, R(sx) + i, R(sy + i / 2), 1, 32);
  // 窗光洒在地上
  const lg = new Grid(WW, 1280); lg.quad(P(0, 44), P(0, 140), P(70, 150), P(70, 54), '#ffffff'); c.save(); c.globalAlpha = .13; c.drawImage(lg.canvas(), 0, 0); c.restore();
}

// ============================================================ 店里和街上的东西
const STATICS = [], STAFF = [], TABLES = {}, FURN = [], BOOTHS = [], STOOLS = [76, 100, 124, 148], NEXT_FRONT = [], NEXT_HIDE = [];
let WINBAR = null, TAKEAWAY = null, SHOWCASE = null;
function drawShowcase(c) {   // lower shelf + upper shelf, up to 10 pieces of the day's signature item; a small 招牌 card when it's set
  if (!W || !W.showcase || !PRODUCTS[W.showcase] || !unlocked(W.showcase)) return;
  const p = W.showcase, n = Math.min(10, Math.max(0, (W.stock[p] || 0) - ordered(p))), img = PRODUCTS[p].img;
  for (let i = 0; i < n; i++) putB(c, img, P(i < 5 ? 108 + i * 19.5 : 110 + (i - 5) * 19.5, i < 5 ? 41 : 39, i < 5 ? 21 : 35));
}
// 木纹：正面（y = yF）上弯弯的深色纹 + 每 step 一道板缝
function woodGrain(g, Q, xa, xb, z0, z1, yF, step) {
  for (let x = xa; x < xb; x += .5) for (let z = z0; z < z1; z += .5) {
    const v = Math.sin(z * 1.7 + Math.sin(x * .21 + Math.floor(x / step) * 2) * 2.4);
    if (v > .9) { const [a, b] = Q(x, yF, z); g.set(R(a), R(b), shade(C.wood, -24)); }
    else if (v < -.97) { const [a, b] = Q(x, yF, z); g.set(R(a), R(b), shade(C.wood, 14)); }
  }
  for (let x = xa + step; x < xb - 2; x += step) g.seg(Q(x, yF, z0), Q(x, yF, z1), shade(C.wood, -34));
}
function woodTop(g, Q, xa, xb, ya, yb, z) {   // 台面顺着 x 方向的长木纹
  for (let y = ya + 2; y < yb - 1; y += 3) for (let x = xa + 2; x < xb - 2; x += .5) if (Math.sin(x * .35 + y * 1.3) > .55) { const [a, b] = Q(x, y + Math.sin(x * .2) * .6, z); g.set(R(a), R(b), '#c4844a'); }
}
function buildStatics() {
  const add = o => (STATICS.push(o), o), Z = PLAT;
  // 后厨（都放在平台上）：烤炉、蒸笼、晾架、水吧
  add(makeObj(P, { x0: 16, x1: 48, y0: 2, y1: 18 }, 44 + Z, [{ g: (g, Q) => {
    bx(g, Q, 16, 2, Z, 32, 16, 44, C.steel, C.steelS, C.steelD);
    g.quad(Q(20, 18, Z + 8), Q(44, 18, Z + 8), Q(44, 18, Z + 30), Q(20, 18, Z + 30), C.dark); g.quad(Q(22, 18, Z + 11), Q(42, 18, Z + 11), Q(42, 18, Z + 17), Q(22, 18, Z + 17), '#ff9a3c'); g.quad(Q(22, 18, Z + 17), Q(42, 18, Z + 17), Q(42, 18, Z + 18), Q(22, 18, Z + 18), '#ffd27a');
    g.quad(Q(20, 18, Z + 33), Q(44, 18, Z + 33), Q(44, 18, Z + 35), Q(20, 18, Z + 35), C.steelD); for (const t of [24, 32, 40]) g.quad(Q(t, 18, Z + 38), Q(t + 3, 18, Z + 38), Q(t + 3, 18, Z + 41), Q(t, 18, Z + 41), C.dark);
  } }]));
  add(makeObj(P, { x0: 56, x1: 78, y0: 3, y1: 17 }, 44 + Z, [{ g: (g, Q) => {
    bx(g, Q, 56, 3, Z, 22, 14, 16, '#6a6e72', '#55595d', '#45494d');
    for (let k = 0; k < 3; k++) { bx(g, Q, 57, 4, Z + 16 + k * 8, 20, 12, 8, '#efcf98', '#ddb27a', '#c99a5e'); g.seg(Q(57, 16, Z + 20 + k * 8), Q(77, 16, Z + 20 + k * 8), '#b98a52'); }
    bx(g, Q, 59, 6, Z + 40, 16, 8, 2, '#f6dcae', '#e2bf88', '#cfa772');
  } }, { d: (c, Q) => { const [a, b] = Q(67, 10, Z + 50); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(R(a) - 4, R(b) - 8, 4, 4); c.fillRect(R(a) + 4, R(b) - 18, 4, 4); c.fillRect(R(a), R(b) - 28, 2, 2); } }]));
  add(makeObj(P, { x0: 84, x1: 120, y0: 2, y1: 16 }, 60 + Z, [
    { g: (g, Q) => { for (const [x, y] of [[84, 2], [119, 2]]) bx(g, Q, x, y, Z, .6, .6, 60, C.steelS, C.steelS, C.steelD); for (const z of [4, 24, 44]) bx(g, Q, 84, 2, Z + z, 36, 14, 2, C.steel, C.steelS, C.steelD); } },
    { d: (c, Q) => { [[FOOD_L.bun, 6], [FOOD_L.tart, 26], [FOOD_L.wife, 46]].forEach(([f, z]) => { for (let i = 0; i < 2; i++) putB(c, f, Q(94 + i * 15, 9, Z + z)); }); } },
    { g: (g, Q) => { for (const [x, y] of [[84, 15], [119, 15]]) bx(g, Q, x, y, Z, .6, .6, 60, C.steelS, C.steelS, C.steelD); } },
  ]));
  add(makeObj(P, { x0: 128, x1: 180, y0: 2, y1: 18 }, 62 + Z, [{ g: (g, Q) => {
    bx(g, Q, 128, 2, Z, 52, 16, 30, C.steel, C.steelS, C.steelD);
    for (const x of [132, 150]) { bx(g, Q, x, 4, Z + 30, 14, 12, 28, '#eef1f3', '#d3d8db', '#b6bcc0'); bx(g, Q, x + 2, 6, Z + 58, 10, 8, 3, C.steelS, C.steelD, C.steelD); bx(g, Q, x + 5, 16, Z + 36, 3, 3, 3, C.dark, C.dark, C.dark); g.quad(Q(x, 16, Z + 44), Q(x + 14, 16, Z + 44), Q(x + 14, 16, Z + 47), Q(x, 16, Z + 47), '#5d4a52'); }
    bx(g, Q, 170, 8, Z + 30, 2, 2, 26, C.dark, C.dark, C.dark); bx(g, Q, 166, 8, Z + 54, 10, 2, 2, C.dark, C.dark, C.dark);
    g.quad(Q(170, 10, Z + 52), Q(176, 10, Z + 52), Q(175, 10, Z + 38), Q(171, 10, Z + 38), '#7a4a2a');
  } }]));
  // ---- 烘焙台：接在玻璃柜右边，和前台一排（客人从店里看得到做点心）；后面平台上是层炉、墙上搁板
  add(makeObj(P, { x0: 206, x1: 300, y0: 30, y1: 46 }, 56, [
    { g: (g, Q) => {
      bx(g, Q, 206, 30, 0, 94, 16, 30, C.cabL, C.cab, C.cabD);   // front counter cabinets: vertical boards (materials.js)
      bx(g, Q, 205, 29, 30, 96, 18, 4, '#e2ad74', '#c08a54', '#9c6a3c');   // 木面
      for (const [x, y] of [[214, 36], [219, 40], [211, 42], [224, 37]]) { const [a, b] = Q(x, y, 34); g.rect(R(a) - 3, R(b) - 1, 7, 3, '#fbf6ea'); }
      { const [a, b] = Q(218, 38, 34); g.ell(a, b - 3, 9, 5.5, (xx, yy) => (xx - a) + (yy - b + 3) * 1.4 < -5 ? '#fff6e0' : (xx - a) + (yy - b + 3) < 5 ? '#f2dfb8' : '#ddc394'); }
      bx(g, Q, 210, 43, 34, 18, 2.4, 2.4, '#e9b07a', '#c98e58', '#a87040', 0);
      bx(g, Q, 234, 32, 34, 22, 12, 1, '#c9cdd0', '#aab0b3', '#90969a', 1);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const [a, b] = Q(238 + i * 5, 35 + j * 6, 35); g.ell(a, b, 3.8, 2.1, '#e9c48a'); g.ell(a, b - .4, 2.3, 1.1, j ? '#ffe27a' : '#f6e2b4'); }
      bx(g, Q, 262, 33, 34, 14, 10, 1, '#c9cdd0', '#aab0b3', '#90969a', 1);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const [a, b] = Q(266 + i * 6, 36 + j * 5, 35); g.ell(a, b - 2, 4.5, 3.4, '#f2c96a'); g.ell(a - 1, b - 3, 2, 1.2, '#ffe9a0'); }   // 刚出炉的菠萝包
      bx(g, Q, 284, 34, 34, 9, 8, 3, '#c94a3e', '#b23e33', '#93322a', 1.5); bx(g, Q, 290, 35, 37, 2.5, 4, 12, '#c94a3e', '#b23e33', '#93322a', 0); bx(g, Q, 282, 35, 47, 11, 6, 4, '#d9564a', '#b23e33', '#93322a', 1.5);
      { const [a, b] = Q(287, 38, 37); g.ell(a, b - 2, 6, 3.4, '#d3d8d6'); g.ell(a, b - 4, 4.6, 2, '#f2dfb8'); }
    } },
  ]));
  add(makeObj(P, { x0: 236, x1: 288, y0: 0, y1: 4 }, 110, [{ g: (g, Q) => {   // 墙上搁板：面粉罐、挞模
    for (const z of [70, 92]) { bx(g, Q, 236, 0, z, 52, 6, 2, C.woodL, C.wood, C.woodD, 0); for (const x of [238, 284]) g.seg(Q(x, 4, z), Q(x, 0, z - 6), '#5a3c2a'); }
    for (const [x, col] of [[240, '#f1e8d6'], [250, '#e9dcc0'], [260, '#f1e8d6']]) { bx(g, Q, x, 1, 72, 7, 4, 10, col, shade(col, -18), shade(col, -34), 2); bx(g, Q, x, 1, 82, 7, 4, 1.5, '#b8483c', '#a03c32', '#8a3028', 1.5); }
    for (let i = 0; i < 4; i++) bx(g, Q, 240 + i * 11, 1, 94, 9, 4, 2, '#c9cdd0', '#aab0b3', '#90969a', 1.5);
  } }]));
  add(makeObj(P, { x0: 290, x1: 316, y0: 2, y1: 28 }, 66 + Z, [{ g: (g, Q) => {   // 两层烤炉（层炉）
    bx(g, Q, 290, 2, Z, 26, 26, 8, '#5a5e62', '#4a4e52', '#3a3e42', 2);
    for (const z of [8, 30]) { bx(g, Q, 290, 2, Z + z, 26, 26, 22, C.steel, C.steelS, C.steelD, 2); g.quad(Q(292, 28, Z + z + 4), Q(312, 28, Z + z + 4), Q(312, 28, Z + z + 16), Q(292, 28, Z + z + 16), C.dark); g.quad(Q(294, 28, Z + z + 6), Q(310, 28, Z + z + 6), Q(310, 28, Z + z + 10), Q(294, 28, Z + z + 10), '#ff9a3c'); g.seg(Q(292, 28, Z + z + 18), Q(312, 28, Z + z + 18), C.steelD); }
    bx(g, Q, 289, 1, Z + 52, 28, 28, 3, '#c9cdd0', '#aab0b3', '#90969a', 2); bx(g, Q, 300, 10, Z + 55, 4, 4, 14, '#8a9093', '#7a8083', '#6a7073', 0);
  } }]));
  add(makeObj(P, { x0: 206, x1: 228, y0: 4, y1: 20 }, 48 + Z, [{ g: (g, Q) => {
    bx(g, Q, 206, 4, Z, 22, 16, 18, C.steel, C.steelS, C.steelD, 2); g.quad(Q(210, 20, Z + 6), Q(224, 20, Z + 6), Q(224, 20, Z + 12), Q(210, 20, Z + 12), C.dark); g.quad(Q(212, 20, Z + 7), Q(222, 20, Z + 7), Q(222, 20, Z + 9), Q(212, 20, Z + 9), '#ff8a3c');
    const [a, b] = Q(217, 12, Z + 18); for (let t = 0; t < 26; t++) g.ell(a, b - t, 15 - (t > 22 ? (t - 22) * .6 : 0), 7, xx => xx < a - 5 ? '#e0aa62' : xx < a + 6 ? '#c98f3e' : '#a8742e');
    g.ell(a, b - 26, 13, 6, '#e9b870'); g.ell(a, b - 27, 4, 2, '#7a5226'); g.rect(R(a) - 18, R(b) - 20, 4, 3, '#7a5226'); g.rect(R(a) + 15, R(b) - 20, 4, 3, '#7a5226');
  } }, { d: (c, Q) => { const [a, b] = Q(217, 12, Z + 52); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(R(a) - 6, R(b) + 4, 4, 4); c.fillRect(R(a) + 2, R(b) - 6, 4, 4); c.fillRect(R(a) - 2, R(b) - 16, 2, 2); } }]));
  // 平台上的员工：肩膀以上高过柜台
  // v0.1 staff: Kun bakes behind the bake counter, Lin runs the till (and brews milk tea when nobody is paying)
  STAFF.push({ id: 'kun', ch: STAFF_HD.kun, x: 250, y: 22, face: 'SW' }, { id: 'lin', ch: STAFF_HD.lin, x: 52, y: 24, face: 'SW' });
  // 收银台 + 玻璃冷柜（一整条柜台；冷柜没有背板，看得见后面的人）
  add(makeObj(P, { x0: 40, x1: 200, y0: 30, y1: 46 }, 52, [
    { g: (g, Q) => {
      bx(g, Q, 40, 30, 0, 56, 16, 30, C.cabL, C.cab, C.cabD);
      bx(g, Q, 38, 29, 30, 60, 18, 4, '#d99a5c', '#b8743c', '#93582c');
      woodTop(g, Q, 40, 96, 30, 46, 34);
      bx(g, Q, 42, 34, 34, 16, 10, 9, '#f2ead2', '#dccfab', '#c2b48c'); bx(g, Q, 43, 34, 43, 8, 3, 5, '#2f6a50', '#2f6a50', '#24533e');
      bx(g, Q, 70, 35, 34, 14, 7, 8, '#a8754a', '#8a5a3a', '#6e4630', 1.5); g.quad(Q(72, 42, 36), Q(78, 42, 36), Q(78, 42, 40), Q(72, 42, 40), '#e9dcc0'); for (let x = 72.5; x < 78; x += 1.2) for (let z = 36.5; z < 40; z += 1.2) { const [a, b] = Q(x, 42, z); g.set(R(a), R(b), '#8a7a60'); }
      { const [a, b] = Q(81, 42, 38); g.ell(a, b, 2.4, 2.4, '#e9c46a'); } g.seg(Q(82, 37, 42), Q(88, 37, 56), '#c9cdd0');   // 收音机
      for (let t = 0; t < 3; t++) g.quad(Q(44 + t * 4, 44, 38), Q(46 + t * 4, 44, 38), Q(46 + t * 4, 44, 40), Q(44 + t * 4, 44, 40), '#a49671');
      bx(g, Q, 96, 30, 0, 104, 16, 18, C.cabL, C.cab, C.cabD);
      bx(g, Q, 96, 30, 18, 104, 16, 3, '#d99a5c', '#b8743c', '#93582c');
    } },
    { g: (g, Q) => bx(g, Q, 96, 30, 34, 104, 16, 1, '#dff6f8', '#bfe6ea', '#a9dbe0'), plain: true, alpha: .75 },
  ]));
  SHOWCASE = STATICS[STATICS.length - 1]; SHOWCASE.after = drawShowcase;   // the case's two glass shelves: the day's signature item, from the kitchen
  add(makeObj(P, { x0: 96, x1: 200, y0: 30, y1: 46.5 }, 52, [
    { g: (g, Q) => { g.quad(Q(96, 46, 21), Q(200, 46, 21), Q(200, 46, 50), Q(96, 46, 50), '#c9f0f2'); g.quad(Q(200, 30, 21), Q(200, 46, 21), Q(200, 46, 50), Q(200, 30, 50), '#a9dde3'); g.quad(Q(96, 30, 50), Q(200, 30, 50), Q(200, 46, 50), Q(96, 46, 50), '#e2fafb'); }, plain: true, alpha: .28 },
    { g: (g, Q) => { for (const t of [112, 160]) { g.quad(Q(t, 46, 22), Q(t + 9, 46, 22), Q(t + 19, 46, 49), Q(t + 10, 46, 49), '#ffffff'); g.quad(Q(t + 13, 46, 22), Q(t + 15, 46, 22), Q(t + 25, 46, 49), Q(t + 23, 46, 49), '#ffffff'); } }, plain: true, alpha: .22 },
    { g: (g, Q) => { g.seg(Q(96, 46, 50), Q(200, 46, 50), '#ffffff'); g.seg(Q(200, 46, 21), Q(200, 46, 50), '#ffffff'); g.seg(Q(200, 30, 50), Q(200, 46, 50), '#ffffff'); g.seg(Q(96, 30, 50), Q(200, 30, 50), '#ffffff'); g.seg(Q(96, 46, 21), Q(96, 46, 50), '#ffffff'); for (let t = 110; t < 196; t += 34) { g.seg(Q(t, 46, 26), Q(t + 8, 46, 44), '#ffffff'); g.seg(Q(t + 3, 46, 26), Q(t + 11, 46, 44), '#ffffff'); } }, plain: true, alpha: .7 },
  ]));
  // 窗边长台 + 红凳
  add(makeObj(P, { x0: 0, x1: 16, y0: 56, y1: 160 }, 36, [
    { g: (g, Q) => { bx(g, Q, 2, 58, 0, 10, 100, 30, C.woodL, C.wood, C.woodD); bx(g, Q, 0, 56, 30, 16, 104, 4, C.marble, C.marbleS, C.marbleD); } },
  ]));
  WINBAR = STATICS[STATICS.length - 1];   // window bar: what the people on the stools are eating is drawn on it (sim)
  for (const y of [76, 100, 124, 148]) add(makeObj(P, { x0: 22, x1: 32, y0: y - 5, y1: y + 5 }, 26, [{ g: (g, Q) => {
    const [a, b] = Q(27, y); g.ell(a, b, 12, 5.2, C.steelS); g.rect(R(a) - 1, R(b) - 42, 3, 40, '#d9dde0'); g.ell(a, b - 42, 11, 5.5, shade(C.stool, -30)); g.ell(a, b - 44, 11, 5.5, C.stool); g.ell(a - 3, b - 45, 5, 2, '#ff7a62'); g.ell(a, b - 20, 9, 4, (xx, yy) => ((xx - a) ** 2 / 81 + (yy - b + 20) ** 2 / 16 > .55) ? '#b4bbba' : null);
  } }]));
  for (const y of STOOLS) add(makeObj(P, { x0: 24, x1: 34, y0: y - 5, y1: y + 5 }, 26, [{ g: (g, Q) => {   // 凳前：排在坐着的人前面
    const [a, b] = Q(27, y);
    g.ell(a, b - 42, 11, 5.5, (xx, yy) => ((xx + .5 - a) ** 2 / 121 + (yy + .5 - b + 44) ** 2 / 30.25 > 1) ? shade(C.stool, -30) : null);
    g.rect(R(a) - 1, R(b) - 38, 3, 36, '#d9dde0'); g.set(R(a) - 1, R(b) - 30, '#ffffff');
    g.ell(a, b - 20, 9, 4, (xx, yy) => ((xx - a) ** 2 / 81 + (yy - b + 20) ** 2 / 16 > .55) ? '#b4bbba' : null);
  } }]));
  // 六张双层货架
  for (const id of ['T1', 'T2', 'T3', 'T4']) TABLES[id] = add(shelfObj(id));   // T2 = glass fridge (cold drinks)
  // 冰室卡座：靠左墙两组，绿皮高背长凳 + 云石台（台上留着奶茶、布丁）
  const booth = (X, y0) => { const objs = boothParts(X, y0).map(add); BOOTHS.push({ X, y0, objs, table: objs[1] }); return objs; };
  const BO1 = booth(268, 136), BO2 = booth(268, 192);
  for (const id of ['T5', 'T6', 'T7']) TABLES[id] = add(shelfObj(id));
  // 门口外卖窗：对着街的玻璃柜，一盘盘蛋挞，立一块「外卖」牌
  const twBase = makeObj(P, { x0: 162, x1: 222, y0: 300, y1: 314 }, 46, [
    { g: (g, Q) => { bx(g, Q, 162, 300, 0, 60, 14, 16, C.woodL, C.wood, C.woodD, 2); woodGrain(g, Q, 165, 219, 1, 15, 314, 19); bx(g, Q, 162, 300, 16, 60, 14, 2, '#d99a5c', '#b8743c', '#93582c', 2); } },
  ]);
  const twOpen = makeObj(P, { x0: 162, x1: 222, y0: 300, y1: 314 }, 46, [
    { g: (g, Q) => { g.quad(Q(163, 314, 18), Q(221, 314, 18), Q(221, 314, 30), Q(163, 314, 30), '#c9f0f2'); g.quad(Q(163, 301, 30), Q(221, 301, 30), Q(221, 314, 30), Q(163, 314, 30), '#e2fafb'); g.quad(Q(221, 301, 18), Q(221, 314, 18), Q(221, 314, 30), Q(221, 301, 30), '#a9dde3'); }, plain: true, alpha: .3 },
    { g: (g, Q) => { g.seg(Q(163, 314, 30), Q(221, 314, 30), '#ffffff'); g.seg(Q(221, 301, 30), Q(221, 314, 30), '#ffffff'); g.seg(Q(221, 314, 18), Q(221, 314, 30), '#ffffff'); }, plain: true, alpha: .8 },
    { g: (g, Q) => { for (const x of [178, 204]) bx(g, Q, x, 306, 30, 1, 1, 6, C.brass, C.brass, C.brassD, 0); g.quad(Q(174, 307, 34), Q(208, 307, 34), Q(208, 307, 46), Q(174, 307, 46), '#b8483c'); } },
    { d: (c, Q) => { const tc = mk(68, 24), x = tc.getContext('2d'); x.font = sr(16); x.fillStyle = '#ffe9a8'; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('外  卖', 34, 3); const [sx, sy] = Q(174, 307, 46); for (let i = 0; i < 68; i++) c.drawImage(tc, i, 0, 1, 24, R(sx) + i, R(sy + i / 2), 1, 24); } },
  ]);
  const twShut = makeObj(P, { x0: 162, x1: 222, y0: 300, y1: 314 }, 46, [
    { g: (g, Q) => { bx(g, Q, 162, 300, 0, 60, 14, 16, C.woodL, C.wood, C.woodD, 2); woodGrain(g, Q, 165, 219, 1, 15, 314, 19); bx(g, Q, 162, 300, 16, 60, 14, 2, '#d99a5c', '#b8743c', '#93582c', 2); } },
    { g: (g, Q) => { g.quad(Q(163, 314, 18), Q(221, 314, 18), Q(221, 314, 30), Q(163, 314, 30), '#c9f0f2'); g.quad(Q(163, 301, 30), Q(221, 301, 30), Q(221, 314, 30), Q(163, 314, 30), '#e2fafb'); g.quad(Q(221, 301, 18), Q(221, 314, 18), Q(221, 314, 30), Q(221, 301, 30), '#a9dde3'); }, plain: true, alpha: .3 },
    { g: (g, Q) => { g.seg(Q(163, 314, 30), Q(221, 314, 30), '#ffffff'); g.seg(Q(221, 301, 30), Q(221, 314, 30), '#ffffff'); g.seg(Q(221, 314, 18), Q(221, 314, 30), '#ffffff'); }, plain: true, alpha: .8 },
    { g: (g, Q) => { for (const x of [178, 204]) bx(g, Q, x, 306, 30, 1, 1, 6, C.brass, C.brass, C.brassD, 0); g.quad(Q(174, 307, 34), Q(208, 307, 34), Q(208, 307, 46), Q(174, 307, 46), '#7a6a5a'); } },
    { d: (c, Q) => { const tc = mk(68, 24), x = tc.getContext('2d'); x.font = sr(16); x.fillStyle = '#ffe9a8'; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText('暂  停', 34, 3); const [sx, sy] = Q(174, 307, 46); for (let i = 0; i < 68; i++) c.drawImage(tc, i, 0, 1, 24, R(sx) + i, R(sy + i / 2), 1, 24); } },
  ]);
  TAKEAWAY = add({ ...twOpen, open: false, draw(c) {   // only open when someone mans it; the pastries in the glass are the real takeaway stock
    if (!this.open) { c.drawImage(twShut.cv, this.sx, this.sy); return; }
    c.drawImage(twBase.cv, this.sx, this.sy);
    if (W && W.stock) { const have = PIDS.filter(p => PRODUCTS[p].where === 'table' && W.stock[p] - ordered(p) > 0 && W.plan[p] !== 'off'); let slot = 0;
      for (let round = 0; round < 8 && slot < 6 && have.length; round++) for (const p of have) { if (slot >= 6) break; if (W.stock[p] - ordered(p) > round) { putB(c, PRODUCTS[p].img, P(170 + (slot % 3) * 18, slot < 3 ? 304 : 310, 18)); slot++; } } }
    c.drawImage(twOpen.cv, this.sx, this.sy);
  } });
  // tray stand by the entrance: customers pick up a bakery tray here
  add(makeObj(P, { x0: 247, x1: 255, y0: 268, y1: 280 }, 30, [{ g: (g, Q) => {
    bx(g, Q, 248, 269, 0, 6, 10, 14, C.woodL, C.wood, C.woodD, 1.5);
    for (let k = 0; k < 5; k++) bx(g, Q, 247, 268, 14 + k * 2, 8, 12, 1.4, k % 2 ? '#c98f5a' : '#b07a4a', '#8a5a3a', '#7a4a2e', 0);
  } }]));
  // 盆栽、主打小黑板
  const plant = (x, y, kind, pot) => makeObj(P, { x0: x - 7, x1: x + 7, y0: y - 7, y1: y + 7 }, 50, [{ g: (g, Q) => { const [a, b] = Q(x, y); drawPlant(g, a, b, kind, pot); } }]);
  const PL1 = add(plant(10, 38, 'monstera', 'cream')), PL2 = add(plant(304, 262, 'monstera', 'charcoal'));
  // movable furniture groups (placement mode): id, name, objects, seated people that move along
  FURN.push(['T1', '货架', [TABLES.T1]], ['T2', '冷柜', [TABLES.T2]], ['T3', '货架', [TABLES.T3]], ['T4', '货架', [TABLES.T4]], ['T5', '货架', [TABLES.T5]], ['T6', '货架', [TABLES.T6]], ['T7', '货架', [TABLES.T7]],
    ['B1', '卡座', BO1], ['B2', '卡座', BO2], ['P1', '盆栽', [PL1]], ['P2', '盆栽', [PL2]]);
  // 前面的矮墙（窗台）、门口；右边和隔壁之间的矮墙，中间封木板贴「招租」
  add(makeObj(P, { x0: 0, x1: 252, y0: 316, y1: 320 }, 12, [{ g: (g, Q) => { bx(g, Q, 0, 316, 0, 252, 4, 8, C.brickL, C.brick, C.brickD); bx(g, Q, 0, 316, 8, 252, 4, 3, '#c8eefc', '#9fdcf4', '#9fdcf4'); } }]));
  add(makeObj(P, { x0: 304, x1: 320, y0: 316, y1: 320 }, 12, [{ g: (g, Q) => { bx(g, Q, 304, 316, 0, 16, 4, 8, C.brickL, C.brick, C.brickD); bx(g, Q, 304, 316, 8, 16, 4, 3, '#c8eefc', '#9fdcf4', '#9fdcf4'); } }]));
  add(makeObj(P, { x0: 316, x1: 320, y0: 0, y1: 246 }, 12, [{ g: (g, Q) => bx(g, Q, 316, 0, 0, 4, 246, 8, C.trimL, C.trim, C.trim) }]));
  add(makeObj(P, { x0: 316, x1: 320, y0: 306, y1: 316 }, 12, [{ g: (g, Q) => bx(g, Q, 316, 306, 0, 4, 10, 8, C.trimL, C.trim, C.trim) }]));
  add(makeObj(P, { x0: 314, x1: 321, y0: 246, y1: 306 }, 34, [{ g: (g, Q) => {
    for (let k = 0; k < 5; k++) bx(g, Q, 315, 246, k * 6, 5, 60, 5, '#d6aa72', '#b58a5a', '#9e7748');
    g.quad(Q(320, 270, 10), Q(320, 282, 10), Q(320, 282, 28), Q(320, 270, 28), '#d0453a');
    for (const z of [14, 19, 24]) g.quad(Q(320, 272, z), Q(320, 280, z), Q(320, 280, z + 1), Q(320, 272, z + 1), C.cream);
  } }]));
  const FR = ['#6b4a35', '#5a3c2a', '#4a3020'];   // 窗框：深木
  const pane = (xa, xb, posts, keep) => (keep ? (o => o) : add)(makeObj(P, { x0: xa, x1: xb, y0: 316, y1: 320 }, 66, [
    { g: (g, Q) => { g.quad(Q(xa, 318, 11), Q(xb, 318, 11), Q(xb, 318, 62), Q(xa, 318, 62), '#cdeff0'); }, plain: true, alpha: .16 },
    { g: (g, Q) => { for (let t = xa + 6; t < xb - 10; t += 34) { g.quad(Q(t, 318, 13), Q(t + 7, 318, 13), Q(t + 17, 318, 60), Q(t + 10, 318, 60), '#ffffff'); g.quad(Q(t + 10, 318, 13), Q(t + 12, 318, 13), Q(t + 22, 318, 60), Q(t + 20, 318, 60), '#ffffff'); } }, plain: true, alpha: .2 },
    { g: (g, Q) => { for (const x of posts) bx(g, Q, x, 316.5, 11, 1.6, 3, 51, ...FR, 0); bx(g, Q, xa, 316.5, 60, xb - xa, 3, 3, ...FR, 0); } },
  ]));
  pane(0, 162, [0, 36, 72, 108, 144, 160.4]); pane(222, 252, [222, 250.4]);   // the takeaway window between them is 60 wide pane(304, 320, [304, 318.4]);
  add(makeObj(P, { x0: 162, x1: 222, y0: 316, y1: 320 }, 66, [{ g: (g, Q) => bx(g, Q, 162, 316.5, 60, 60, 3, 3, ...FR, 0) }]));   // 外卖窗上沿（窗开着）
  add(makeObj(P, { x0: 252, x1: 253.6, y0: 316, y1: 320 }, 70, [{ g: (g, Q) => bx(g, Q, 252, 316.5, 0, 1.6, 3, 66, ...FR, 0) }]));   // 门框：左右门柱、门楣分开排序
  add(makeObj(P, { x0: 302.4, x1: 304, y0: 316, y1: 320 }, 70, [{ g: (g, Q) => bx(g, Q, 302.4, 316.5, 0, 1.6, 3, 66, ...FR, 0) }]));
  Object.assign(add(makeObj(P, { x0: 252, x1: 304, y0: 316, y1: 320 }, 70, [{ g: (g, Q) => bx(g, Q, 252, 316.5, 64, 52, 3, 4, ...FR, 0) }])), { x0: -9999, x1: 9999, y0: 318, y1: 318 });   // 门楣：人在门外（y>313）就画在门楣前面
  for (const xd of [254, 300]) Object.assign(add(makeObj(P, { x0: xd, x1: xd + 2, y0: 292, y1: 316 }, 66, [   // 两扇玻璃门往里折开
    { g: (g, Q) => g.quad(Q(xd + 1, 293, 2), Q(xd + 1, 315, 2), Q(xd + 1, 315, 62), Q(xd + 1, 293, 62), '#cdeff0'), plain: true, alpha: .2 },
    { g: (g, Q) => { g.quad(Q(xd + 1, 296, 10), Q(xd + 1, 300, 10), Q(xd + 1, 306, 58), Q(xd + 1, 302, 58), '#ffffff'); }, plain: true, alpha: .3 },
    { g: (g, Q) => { for (const y of [292.5, 314]) bx(g, Q, xd, y, 0, 2, 1.5, 64, ...FR, 0); bx(g, Q, xd, 292.5, 0, 2, 23, 3, ...FR, 0); bx(g, Q, xd, 292.5, 61, 2, 23, 3, ...FR, 0); bx(g, Q, xd + 2, 296, 30, 1, 1, 10, C.brass, C.brass, C.brassD, 0); } },
  ])), xd < 280 ? { x0: 252, x1: 253.9 } : {});   // the left leaf folds flat against the post, so people walking in pass in front of it
  // next door, once opened: a low wall with windows instead of the shutter (swapped in by applyExpand)
  NEXT_FRONT.push(makeObj(P, { x0: 320, x1: 640, y0: 316, y1: 320 }, 12, [{ g: (g, Q) => { bx(g, Q, 320, 316, 0, 320, 4, 8, C.brickL, C.brick, C.brickD); bx(g, Q, 320, 316, 8, 320, 4, 3, '#c8eefc', '#9fdcf4', '#9fdcf4'); } }]), pane(320, 640, [320, 400, 480, 560, 638.4], true));
  // 隔壁空铺：未解锁，只留门口卷闸「旺铺招租」
  add(makeObj(P, { x0: 324, x1: 640, y0: 316, y1: 320 }, 20, [{ g: (g, Q) => {
    bx(g, Q, 324, 316, 0, 316, 4, 16, '#c0c6c9', '#a3aaae', '#8e959a');
    for (let z = 2; z < 16; z += 3) g.seg(Q(324, 320, z), Q(640, 320, z), '#8e959a');
    g.quad(Q(344, 320, 2), Q(374, 320, 2), Q(374, 320, 15), Q(344, 320, 15), '#d0453a'); g.quad(Q(346, 320, 9), Q(372, 320, 9), Q(372, 320, 12), Q(346, 320, 12), C.cream); g.quad(Q(350, 320, 4), Q(368, 320, 4), Q(368, 320, 6), Q(350, 320, 6), C.cream);
  } }]));
  // ---- 街边：报纸档、绿色邮筒、路灯、红的士；对面咏欣花店
  add(makeObj(P, { x0: 206, x1: 222, y0: 347, y1: 357 }, 24, [{ g: (g, Q) => {
    bx(g, Q, 206, 347, 0, 16, 10, 16, '#2f6a50', '#2a5e46', '#21503b'); bx(g, Q, 206, 347, 16, 16, 10, 2, '#e9e3d6', '#cfc8ba', '#b9b2a4');
    for (const [x, col] of [[208, '#f4efe2'], [213, '#e5604f'], [218, '#f0b43a']]) bx(g, Q, x, 356, 6, 3, 1, 8, col, col, shade(col, -20));
  } }]));
  add(makeObj(P, { x0: 346, x1: 356, y0: 348, y1: 356 }, 30, [{ g: (g, Q) => { bx(g, Q, 346, 348, 0, 10, 8, 26, '#2f8a4f', '#277843', '#1f6637'); bx(g, Q, 345, 347, 26, 12, 10, 3, '#3aa05e', '#2f8a4f', '#277843'); g.quad(Q(348, 356, 18), Q(354, 356, 18), Q(354, 356, 20), Q(348, 356, 20), '#1a3a28'); } }]));
  add(makeObj(P, { x0: 398, x1: 404, y0: 348, y1: 354 }, 120, [{ g: (g, Q) => { bx(g, Q, 400, 350, 0, 2, 2, 104, '#3f5a4a', '#344c3e', '#2a3e32'); bx(g, Q, 400, 351, 104, 2, 14, 1.5, '#3f5a4a', '#344c3e', '#2a3e32'); bx(g, Q, 398, 362, 98, 6, 6, 6, '#fff1b8', '#ffd76a', '#e8b84a'); } }]));
  // 咏欣花店：门口三层木花架，一桶桶花
  add(makeObj(P, { x0: 300, x1: 340, y0: 428, y1: 442 }, 30, [
    { g: (g, Q) => { for (let k = 0; k < 3; k++) bx(g, Q, 300, 428 + k * 4, 0, 40, 14 - k * 4, 6 + k * 6, '#b88a5a', '#9a7048', '#7e5a38', 1.5); } },
    { d: (c, Q) => {
      const cols = ['#e05a6a', '#f2c14e', '#f6f0e6', '#b07ad0', '#ff8a5a', '#e05a6a', '#7ab0e0'];
      let n = 0; for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) {
        const [a, b] = Q(304 + i * 8, 436 - k * 4 + 2, 6 + (2 - k) * 6), col = cols[n++ % cols.length];
        c.fillStyle = '#5d7a8a'; c.fillRect(R(a) - 4, R(b) - 8, 9, 8); c.fillStyle = '#7b98a8'; c.fillRect(R(a) - 4, R(b) - 8, 9, 2);   // 铁桶
        c.fillStyle = '#4f8a4a'; c.fillRect(R(a) - 3, R(b) - 13, 7, 5);
        for (const [dx, dy] of [[-3, -16], [1, -18], [3, -14], [-1, -13], [-4, -12]]) { c.fillStyle = col; c.fillRect(R(a) + dx, R(b) + dy, 3, 3); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(R(a) + dx, R(b) + dy, 1, 1); }
      }
    } },
  ]));
  add(makeObj(P, { x0: 344, x1: 350, y0: 428, y1: 436 }, 30, [{ g: (g, Q) => {   // 花店小黑板
    g.quad(Q(344, 428, 0), Q(344, 436, 0), Q(344, 434, 24), Q(344, 430, 24), '#6b4a35'); g.quad(Q(344, 429, 3), Q(344, 435, 3), Q(344, 433.5, 22), Q(344, 430.5, 22), '#2f4a3e');
  } }, { d: (c, Q) => { const [a, b] = Q(344, 434, 18); c.font = fp(12); c.fillStyle = '#ffd0d8'; c.fillText('花', R(a) - 1, R(b) + 1); } }]));
}
// a taxi (red = urban, green = New Territories, blue = Lantau), built at x 290..350 in its lane; the sim slides it along x
function makeCar(y0, red) {
  return makeObj(P, { x0: 290, x1: 350, y0: y0 - 1, y1: y0 + 21 }, 34, [{ g: (g, Q) => {
    const y1 = y0 + 20, glass = '#3f5566', glassL = '#7c97a8';
    bx(g, Q, 290, y0, 3, 60, y1 - y0, 9, red[0], red[1], red[2], 3);                         // 车身下半
    bx(g, Q, 289, y0 + 1, 3, 2, y1 - y0 - 2, 3, '#c9cdd0', '#b0b5b8', '#9aa0a3', 0);         // 后保险杠
    bx(g, Q, 349, y0 + 1, 3, 2, y1 - y0 - 2, 3, '#c9cdd0', '#b0b5b8', '#9aa0a3', 0);         // 前保险杠
    g.quad(Q(304, y0 + 1, 12), Q(304, y1 - 1, 12), Q(310, y1 - 1, 21), Q(310, y0 + 1, 21), '#b9c3c9');   // 后挡风（斜）
    bx(g, Q, 310, y0 + 1, 12, 20, y1 - y0 - 2, 9, '#e6e8ea', red[1], red[2], 2);              // 车厢
    g.quad(Q(330, y0 + 1, 21), Q(330, y1 - 1, 21), Q(338, y1 - 1, 12), Q(338, y0 + 1, 12), glass);       // 前挡风（斜）
    g.seg(Q(331, y0 + 3, 20), Q(336, y0 + 6, 14), glassL); g.seg(Q(332, y0 + 3, 20), Q(337, y0 + 6, 14), glassL);
    g.tri(...Q(330, y1 - 1, 21), ...Q(338, y1 - 1, 12), ...Q(330, y1 - 1, 12), glass);                   // 侧面三角窗
    g.tri(...Q(310, y1 - 1, 21), ...Q(304, y1 - 1, 12), ...Q(310, y1 - 1, 12), glass);
    for (const [a, b] of [[311, 319], [321, 329]]) { g.quad(Q(a, y1 - 1, 20), Q(b, y1 - 1, 20), Q(b, y1 - 1, 13), Q(a, y1 - 1, 13), glass); g.seg(Q(a + 1, y1 - 1, 19), Q(a + 3, y1 - 1, 14), glassL); }
    g.seg(Q(320, y1, 4), Q(320, y1, 12), red[2]); g.seg(Q(304, y1, 4), Q(304, y1, 12), red[2]);
    g.seg(Q(290, y1, 9), Q(350, y1, 9), '#e8e2d8');                                            // 车身腰线
    for (const x of [314, 330]) g.rect(...Q(x, y1, 10).map(R), 3, 1, '#e8e2d8');               // 门把手
    bx(g, Q, 316, y0 + 7, 21, 8, 6, 4, '#fff1b8', '#f0d27a', '#d9b85a', 1.5);                   // 顶灯
    g.quad(Q(350, y1 - 3, 6), Q(350, y1 - 1, 6), Q(350, y1 - 1, 9), Q(350, y1 - 3, 9), '#fff6c8');   // 车头灯
    g.quad(Q(350, y0 + 1, 6), Q(350, y0 + 3, 6), Q(350, y0 + 3, 9), Q(350, y0 + 1, 9), '#fff6c8');
    for (const x of [300, 338]) { const [a, b] = Q(x, y1, 4); g.ell(a, b - 1, 11, 9, (xx, yy) => yy < b - 2 ? red[2] : null); g.ell(a, b + 1, 8.5, 8.5, '#2e2a30'); g.ell(a, b + 1, 4, 4, '#b0b5b8'); g.set(R(a) - 1, R(b), '#e6e8ea'); }
  } }]);
}
// booth = front bench, table, back bench; leather colour (and deluxe trims) from the chosen style
const W_B = 46;
function boothParts(X, y0) {
  const S = BOOTH_STYLES[(W && W.decor && W.decor.booth) || 'green'] || BOOTH_STYLES.green, LEATHER = S.leather;
  const bench = (X, y0, backAtFar) => makeObj(P, { x0: X, x1: X + W_B, y0, y1: y0 + 8 }, 30, [{ g: (g, Q) => {
    const yb = backAtFar ? y0 + 5 : y0, top = backAtFar ? 22 : 28;
    bx(g, Q, X, y0, 0, W_B, 8, 10, C.woodL, C.wood, C.woodD, 1.5); bx(g, Q, X + 1, y0, 10, W_B - 2, 8, 3, ...LEATHER, 2);
    bx(g, Q, X, yb, 10, W_B, 3, backAtFar ? 12 : 18, ...LEATHER, 1.5); bx(g, Q, X, yb, top, W_B, 3, 2, S.deluxe ? C.brass : C.woodL, S.deluxe ? C.brass : C.wood, S.deluxe ? C.brassD : C.woodD, 0);
    if (S.deluxe) { for (let x = X + 5; x < X + W_B - 2; x += 6) for (let z = 13; z < top - 1; z += 5) { const [a, b] = Q(x + ((z / 5) & 1) * 3, yb + 3, z); g.set(R(a), R(b), shade(LEATHER[1], -30)); g.set(R(a) + 1, R(b), shade(LEATHER[0], 20)); } }   // tufted buttons
    else for (let x = X + 6; x < X + W_B - 2; x += 8) g.seg(Q(x, yb + 3, 12), Q(x, yb + 3, backAtFar ? 20 : 26), shade(LEATHER[1], -16));   // stitched seams
  } }]);
  const table = makeObj(P, { x0: X + 4, x1: X + W_B - 4, y0: y0 + 11, y1: y0 + 29 }, 26, [
    { g: (g, Q) => { bx(g, Q, X + W_B / 2 - 1.5, y0 + 18, 0, 3, 3, 16, C.steelS, C.steelS, C.steelD, 0); bx(g, Q, X + W_B / 2 - 9, y0 + 15, 0, 18, 10, 1.5, C.steelS, C.steelS, C.steelD, 3); bx(g, Q, X + 4, y0 + 11, 16, W_B - 8, 18, 2.5, C.marble, C.marbleS, C.marbleD, 4);
      if (S.deluxe) { g.seg(Q(X + 4, y0 + 29, 17), Q(X + W_B - 4, y0 + 29, 17), C.brass); g.seg(Q(X + W_B - 4, y0 + 11, 17), Q(X + W_B - 4, y0 + 29, 17), C.brassD); } } },
  ]);
  return [bench(X, y0, false), table, bench(X, y0 + 32, true)];
}
function addBooth(X, y0, id) {   // a booth bought for the room next door: drawn, placed, movable like the others
  const objs = boothParts(X, y0); objs.forEach(o => STATICS.push(o));
  const B = { X, y0, objs, table: objs[1], id }; BOOTHS.push(B); group(id, '卡座', objs); return B;
}
// floor decor (plants, festive pieces): one object each, placed where the player left it (W.itemPos + placement offsets)
function decorObj(id, x, y) {
  const it = DECOR_ITEMS[id], big = id === 'xmas' || id === 'lantern';
  return makeObj(P, { x0: x - 7, x1: x + 7, y0: y - 7, y1: y + 7 }, big ? 84 : 56, [{ g: (g, Q) => { const [a, b] = Q(x, y);
    if (it.plant) return drawPlant(g, a, b, it.plant, it.pot);
    if (id === 'luckycat') { g.rect(R(a) - 7, R(b) - 4, 14, 4, '#c8342c'); for (let t = 0; t < 14; t++) g.ell(a, b - 4 - t, 6 - Math.abs(t - 6) * .15, 3.4, t < 13 ? '#fbf6ea' : '#ffffff'); g.ell(a, b - 22, 6, 5, '#fbf6ea'); g.tri(a - 6, b - 25, a - 3, b - 26, a - 5, b - 30, '#fbf6ea'); g.tri(a + 6, b - 25, a + 3, b - 26, a + 5, b - 30, '#fbf6ea'); g.rect(R(a) + 5, R(b) - 34, 2, 10, '#fbf6ea'); g.set(R(a) - 2, R(b) - 23, '#2f2a30'); g.set(R(a) + 2, R(b) - 23, '#2f2a30'); g.rect(R(a) - 3, R(b) - 16, 6, 3, '#f0b43a'); g.set(R(a), R(b) - 20, '#e05050'); return; }
    if (id === 'bin') { for (let t = 0; t < 16; t++) g.ell(a, b - t, 6 - t * .05, 3, t < 15 ? (t % 5 === 0 ? '#2a6e50' : '#3f8f6e') : '#2f2a30'); g.ell(a, b - 16, 6.4, 3, '#4fa07e'); g.rect(R(a) - 1, R(b) - 20, 3, 3, '#2a6e50'); return; }
    if (id === 'doormat') { g.quad(Q(x - 9, y - 6), Q(x + 9, y - 6), Q(x + 9, y + 6), Q(x - 9, y + 6), '#8a5a3a'); g.quad(Q(x - 8, y - 5), Q(x + 8, y - 5), Q(x + 8, y + 5), Q(x - 8, y + 5), '#b0703a'); for (let t = -7; t <= 7; t += 2) g.seg(Q(x + t, y - 5), Q(x + t, y + 5), '#9a6030'); return; }
    if (id === 'vacuum') { for (let t = 0; t < 12; t++) g.ell(a, b - t, 6, 4, t < 11 ? '#c8342c' : '#e85a4a'); g.ell(a - 2, b - 12, 2, 1.4, '#ffd0c8'); g.rect(R(a) + 4, R(b) - 34, 2, 24, '#5a5e62'); g.rect(R(a) + 2, R(b) - 36, 6, 3, '#2f2a30'); g.ell(a - 4, b + 1, 1.6, 1.6, '#2f2a30'); g.ell(a + 4, b + 1, 1.6, 1.6, '#2f2a30'); return; }
    if (id === 'kumquat') { drawPot(g, a, b, POTS.terracotta, 18); g.ell(a, b - 34, 13, 14, (xx, yy) => ((xx * 7 + yy * 3) % 11 === 0 ? '#ff9a1a' : ((xx + yy) & 3) === 0 ? '#2f7a3a' : '#3f9a4a')); for (const [dx, dy] of [[-6, -38], [5, -30], [-2, -26], [7, -40], [-9, -30]]) { g.ell(a + dx, b + dy, 2, 2, '#ff8a10'); g.set(R(a + dx) - 1, R(b + dy) - 1, '#ffd070'); } for (const [dx, dy] of [[-4, -44], [6, -24]]) g.rect(R(a + dx), R(b + dy), 3, 5, '#d82a2a'); return; }
    if (id === 'icebucket') { for (let t = 0; t < 14; t++) g.ell(a, b - t, 9 - t * .05, 4, t < 13 ? (t % 4 === 0 ? '#9aa4aa' : '#c9d2d8') : '#e8f6fa'); for (const [dx, col] of [[-5, '#2f9e6e'], [-1, '#d82a2a'], [3, '#f0b43a'], [6, '#3f86d6']]) { g.rect(R(a + dx), R(b) - 22, 2, 9, col); g.set(R(a + dx), R(b) - 23, '#ffffff'); } for (const [dx, dy] of [[-6, -14], [2, -15], [5, -13]]) g.rect(R(a + dx), R(b + dy), 3, 2, '#ffffff'); return; }
    if (id === 'lantern') { g.rect(R(a) - 1, R(b) - 70, 2, 70, '#7a4a2e'); g.rect(R(a) - 14, R(b) - 70, 28, 2, '#7a4a2e'); g.ell(a, b, 7, 3, '#5a3a24');
      for (const [dx, h] of [[-11, 0], [0, 4], [11, 0]]) { g.rect(R(a + dx), R(b) - 68, 1, 6 + h, '#3a2a20'); g.ell(a + dx, b - 56 + h, 5, 6, (xx, yy) => xx < a + dx - 1 ? '#e8402a' : '#c8281e'); g.rect(R(a + dx) - 2, R(b) - 63 + h, 5, 1, '#f0b43a'); g.rect(R(a + dx) - 2, R(b) - 50 + h, 5, 1, '#f0b43a'); g.rect(R(a + dx), R(b) - 49 + h, 1, 4, '#f0b43a'); } return; }
    if (id === 'xmas') { drawPot(g, a, b, POTS.terracotta, 10); for (let k = 0; k < 4; k++) { const by = b - 12 - k * 15, w = 18 - k * 4; g.tri(a - w, by, a + w, by, a, by - 20, k & 1 ? '#2f7a3a' : '#256a30'); g.tri(a - w + 2, by - 1, a, by - 1, a, by - 18, '#3f9a4a'); }
      for (const [dx, dy, col] of [[-8, -16, '#d82a2a'], [6, -22, '#f0b43a'], [-4, -34, '#3f86d6'], [5, -40, '#d82a2a'], [-2, -50, '#f0b43a'], [9, -12, '#3f86d6']]) g.ell(a + dx, b + dy, 1.6, 1.6, col);
      g.tri(a - 3, b - 74, a + 3, b - 74, a, b - 80, '#ffd23f'); g.tri(a - 3, b - 77, a + 3, b - 77, a, b - 71, '#ffd23f'); }
  } }]);
}
// wall pieces on the left wall sit in six cells (3 along × 2 high); the player can move a piece to the next cell (swapping with what is there)
const WALL_CELLS = [[184, 58], [184, 110], [224, 58], [224, 110], [264, 58], [264, 110]], WALL_IDS = ['calendar', 'clock', 'card', 'banner', 'photo', 'board'];
const wallSlotOf = id => { const S = (W && W.wallSlot) || {}; return S[id] !== undefined ? S[id] : WALL_IDS.indexOf(id); };
function wallXF(id, ya, yb, za, zb) {   // map a piece's own art box into its cell (centred, shrunk only if it would not fit)
  const [y0, z0] = WALL_CELLS[wallSlotOf(id)], w = yb - ya, h = zb - za, k = Math.min(1, 36 / w, 48 / h), oy = y0 + (38 - w * k) / 2, oz = z0 + (50 - h * k) / 2;
  return (y, z) => [oy + (y - ya) * k, oz + (z - za) * k];
}
function moveWall(id) {   // to the next cell; whatever hangs there takes this one's place
  W.wallSlot = W.wallSlot || {}; for (const k of WALL_IDS) if (W.wallSlot[k] === undefined) W.wallSlot[k] = WALL_IDS.indexOf(k);
  const cur = W.wallSlot[id], nxt = (cur + 1) % WALL_CELLS.length, o = WALL_IDS.find(k => k !== id && W.wallSlot[k] === nxt);
  if (o) W.wallSlot[o] = cur; W.wallSlot[id] = nxt; camX = 0; applyDecor(); SFX.tap(); saveGame();
}
const ITEM_THUMB = {};
function itemThumb(id) {   // a small picture of a decor piece for the 摆设 cards
  if (ITEM_THUMB[id]) return ITEM_THUMB[id]; const it = DECOR_ITEMS[id];
  if (it.cat !== 'wall') {   // the piece's own art, trimmed to its pixels
    const src = decorObj(id, 60, 60).cv, w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const cv = mk(Math.max(1, x1 - x0 + 1), Math.max(1, y1 - y0 + 1)); cv.getContext('2d').drawImage(src, -x0, -y0); return (ITEM_THUMB[id] = cv); }
  const cv = mk(40, 48), c = cv.getContext('2d'), r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  if (id === 'banner') { r(6, 2, 28, 3, '#6b4a35'); r(8, 5, 24, 38, '#b8342c'); r(10, 5, 20, 34, '#d8402e'); for (let y = 10; y < 36; y += 7) r(16, y, 8, 4, '#ffd23f'); }
  else if (id === 'card') { r(8, 10, 24, 30, '#8a7a6a'); r(9, 11, 22, 28, '#f4ead6'); r(9, 11, 22, 6, '#e88aa0'); for (const y of [22, 27, 32]) r(12, y, 16, 1, '#8a7a6a'); }
  else if (id === 'clock') { c.fillStyle = '#6b4a35'; c.beginPath(); c.arc(20, 24, 16, 0, 7); c.fill(); c.fillStyle = '#fbf6ea'; c.beginPath(); c.arc(20, 24, 13, 0, 7); c.fill(); r(19, 13, 2, 12, '#2a2024'); r(20, 23, 8, 2, '#2a2024'); }
  else if (id === 'calendar') { r(8, 4, 24, 40, '#6b4a35'); r(10, 6, 20, 36, '#f4ead6'); r(10, 6, 20, 7, '#c8342c'); r(13, 16, 14, 14, '#e88aa0'); r(15, 32, 10, 6, '#2a2024'); }
  else if (id === 'photo') { r(4, 8, 32, 28, '#5a3c2a'); r(6, 10, 28, 24, '#d8c4a0'); for (const x of [10, 18, 26]) { r(x, 18, 4, 10, '#8a6a4a'); r(x, 15, 4, 4, '#6a4a30'); } }
  else if (id === 'neon') { r(2, 12, 36, 22, '#1f1a24'); r(4, 14, 32, 1, '#ff5a9a'); r(4, 31, 32, 1, '#ff5a9a'); r(4, 14, 1, 18, '#ff5a9a'); r(35, 14, 1, 18, '#ff5a9a'); r(10, 22, 20, 2, '#7ff0ff'); r(19, 17, 2, 12, '#7ff0ff'); }
  else { r(8, 8, 24, 32, '#6b4a35'); r(10, 10, 20, 28, '#f4ead6'); }
  return (ITEM_THUMB[id] = cv);
}
let KEEP_OBJ = null, KEEP_KEY = '';
function applyKeepsakes() {   // the regulars' small keepsakes stand in a row on top of the front glass case
  const L = keepList('c'), key = L.join(); if (key === KEEP_KEY) return; KEEP_KEY = key;
  if (KEEP_OBJ) { const k = STATICS.indexOf(KEEP_OBJ); if (k >= 0) STATICS.splice(k, 1); KEEP_OBJ = null; } if (!L.length) return;
  KEEP_OBJ = makeObj(P, { x0: 96, x1: 200, y0: 30, y1: 46.6 }, 66, [{ g: (g, Q) => { L.slice(0, 11).forEach((k, i) => { const [, t, col] = KEEP_ART[k], [a0, b0] = Q(102 + i * 9, 39, 50), a = R(a0), b = R(b0);
    if (t === 'flask') { g.rect(a - 2, b - 10, 4, 10, col); g.rect(a - 2, b - 12, 4, 2, '#c9cdd0'); g.rect(a - 1, b - 8, 1, 6, shade(col, 30)); }
    else if (t === 'coaster') { g.ell(a, b - 1, 4.5, 2, col); g.ell(a, b - 1.5, 3, 1.2, '#f4d0a0'); }
    else if (t === 'jar') { g.rect(a - 3, b - 8, 6, 8, '#e8f4f0'); g.rect(a - 2, b - 6, 4, 5, col); g.rect(a - 3, b - 10, 6, 2, '#c8342c'); }
    else if (t === 'flowers') { g.tri(a - 3, b - 6, a + 3, b - 6, a, b, '#f4ead6'); for (const [dx, dy, cc] of [[-2, -9, col], [1, -11, '#ffd23f'], [2, -8, col], [-1, -12, '#f590b0']]) g.ell(a + dx, b + dy, 1.6, 1.6, cc); g.rect(a, b - 7, 1, 3, '#3f8a3a'); }
    else if (t === 'tin') { g.rect(a - 2, b - 9, 5, 9, col); g.rect(a - 2, b - 6, 5, 2, '#e0b84a'); g.rect(a - 2, b - 10, 5, 1, '#1f4a3a'); }
    else if (t === 'marble') { g.ell(a, b - 2, 2, 2, col); g.set(a - 1, b - 3, '#ffffff'); }
    else if (t === 'box') { g.rect(a - 4, b - 5, 8, 5, col); g.rect(a - 1, b - 5, 2, 5, '#c8342c'); g.rect(a - 4, b - 3, 8, 1, '#c8342c'); }
    else if (t === 'keychain') { g.ell(a, b - 3, 2.5, 2.5, col); g.ell(a, b - 6, 2.2, 2, col); g.set(a - 2, b - 8, col); g.set(a + 2, b - 8, col); g.set(a, b - 3, '#c8342c'); g.rect(a, b - 10, 1, 2, '#c9cdd0'); }
    else if (t === 'standcard') { g.tri(a - 3, b, a + 3, b, a, b - 7, col); g.rect(a - 1, b - 4, 2, 1, '#e88aa0'); }
    else if (t === 'pen') { g.rect(a - 3, b - 2, 6, 2, '#6b4a35'); g.seg([a - 1, b - 2], [a + 2, b - 10], col); g.set(a + 2, b - 10, '#e0b84a'); }
    else if (t === 'veg') { g.ell(a, b - 3, 4, 3, '#c9b38a'); g.ell(a - 1, b - 6, 2, 2.5, col); g.ell(a + 2, b - 7, 1.6, 2.5, '#6ab04a'); }
  }); } }]);
  STATICS.push(KEEP_OBJ);
}
function applyItems() {   // create the floor pieces the player owns (once), at their saved spot
  for (const id in DECOR_ITEMS) { const it = DECOR_ITEMS[id], gid = 'I_' + id; if (it.cat === 'wall' || !hasItem(id) || MOV.some(m => m.id === gid)) continue;
    const pos = (W.itemPos || {})[id]; if (!pos) continue; const o = decorObj(id, pos[0], pos[1]); STATICS.push(o); group(gid, it.name, [o]);
    const f = W.furn[gid]; if (f) moveGroup(o.grp, f[0], f[1]); }
  for (let i = MOV.length - 1; i >= 0; i--) { const m = MOV[i]; if (m.id.startsWith('I_') && !hasItem(m.id.slice(2))) { for (const o of m.objs) { const k = STATICS.indexOf(o); if (k >= 0) STATICS.splice(k, 1); } MOV.splice(i, 1); } }
}
function findItemSpot() {   // a free floor spot for a new piece: along the walls first, then anywhere it doesn't block anyone
  const cand = [];
  for (let y = 60; y <= 304; y += 4) for (let x = 10; x <= 306; x += 4) cand.push([x, y, Math.min(x - 10, 306 - x, 304 - y)]);
  if (expandLv()) for (let y = 14; y <= 304; y += 4) for (let x = 330; x <= 630; x += 4) cand.push([x, y, 999 + Math.min(y - 14, 630 - x)]);
  cand.sort((a, b) => a[2] - b[2]);
  for (const [x, y] of cand) { const g = { objs: [{ x0: x - 7, x1: x + 7, y0: y - 7, y1: y + 7 }] }; if (!canPlace(g)) return [x, y]; }
  return null;
}
function applyExtraShelves() {   // extra spots not bought yet: no object in the shop, nothing to pick up in placement mode
  for (const id in EXTRA_SHELF) { const st = W.shelves[id], o = TABLES[id]; if (!st || !o) continue; const hide = st.locked, i = STATICS.indexOf(o), g = o.grp, gi = MOV.indexOf(g);
    if (hide && i >= 0) STATICS.splice(i, 1); else if (!hide && i < 0) STATICS.push(o);
    if (g) { if (hide && gi >= 0) MOV.splice(gi, 1); else if (!hide && gi < 0) MOV.push(g); } }
}
function applyExpand() {   // match the room to W.expand: partition + shutter out, windows in, booths next door
  const lv = expandLv();
  if (!NEXT_HIDE.length) NEXT_HIDE.push(...STATICS.filter(o => (o.x0 === 316 && o.x1 === 320 && o.y1 <= 316) || (o.x0 === 314 && o.x1 === 321) || (o.x0 === 324 && o.x1 === 640)));
  for (const o of NEXT_HIDE) { const i = STATICS.indexOf(o); if (lv && i >= 0) STATICS.splice(i, 1); else if (!lv && i < 0) STATICS.push(o); }
  for (const o of NEXT_FRONT) { const i = STATICS.indexOf(o); if (lv && i < 0) STATICS.push(o); else if (!lv && i >= 0) STATICS.splice(i, 1); }
  const want = lv * 2; let added = false;
  for (let i = 0; i < NEXT_BOOTHS.length; i++) { const id = 'N' + (i + 1), has = BOOTHS.find(B => B.id === id);
    if (i < want && !has) { addBooth(NEXT_BOOTHS[i][0], NEXT_BOOTHS[i][1], id); added = true; }
    else if (i >= want && has) { has.objs.forEach(o => { const k = STATICS.indexOf(o); if (k >= 0) STATICS.splice(k, 1); }); BOOTHS.splice(BOOTHS.indexOf(has), 1); const g = MOV.findIndex(m => m.id === id); if (g >= 0) MOV.splice(g, 1); added = true; } }
  if (added || SEATS.length !== BOOTHS.length * 4) initSeats();
}
function restyleBooths() {   // same geometry, new canvases (keeps seats, waiter spots and the player's placement)
  for (const B of BOOTHS) {
    const fresh = boothParts(B.X, B.y0), g = B.table.grp, dsx = K * (g.dx - g.dy), dsy = (g.dx + g.dy) * K / 2;
    B.objs.forEach((o, i) => { const f = fresh[i]; Object.assign(o, { cv: f.cv, sx: f.sx + dsx, sy: f.sy + dsy, bx0: f.bx0 + dsx, bx1: f.bx1 + dsx, by0: f.by0 + dsy, by1: f.by1 + dsy, _a: null }); });
  }
}
