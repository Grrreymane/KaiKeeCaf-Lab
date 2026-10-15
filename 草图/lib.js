'use strict';
// 草图共用：像素画板（同 _workflow/template）、配色、食物小图、文字描边。
const OUT = '#3a2a2e', R = Math.round;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function shade(hex, a) { const n = parseInt(hex.slice(1), 16), c = v => clamp(v + a, 0, 255); return '#' + ((1 << 24) | (c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1); }
function mixHex(a, b, t) { const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], A = p(a), B = p(b); return '#' + A.map((v, i) => R(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const _RGBA = new Map();
function rgbaOf(col) { let q = _RGBA.get(col); if (!q) { const n = parseInt(col.slice(1), 16); q = [n >> 16, (n >> 8) & 255, n & 255, 255]; _RGBA.set(col, q); } return q; }
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  set(x, y, c) { x |= 0; y |= 0; if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? null : this.d[y * this.w + x]; }
  ell(cx, cy, rx, ry, c) { for (let y = Math.max(0, Math.floor(cy - ry - 1)); y < Math.min(this.h, cy + ry + 1); y++) for (let x = Math.max(0, Math.floor(cx - rx - 1)); x < Math.min(this.w, cx + rx + 1); x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.set(x, y, typeof c === 'function' ? c(x, y) : c); } }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, typeof c === 'function' ? c(i, j) : c); }
  tri(ax, ay, bx, by, cx, cy, c) {
    const e = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(this.h - 1, Math.ceil(Math.max(ay, by, cy)));
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(this.w - 1, Math.ceil(Math.max(ax, bx, cx)));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x + .5, py = y + .5, w0 = e(bx, by, cx, cy, px, py), w1 = e(cx, cy, ax, ay, px, py), w2 = e(ax, ay, bx, by, px, py);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) this.set(x, y, c);
    }
  }
  quad(a, b, c, d, col) { this.tri(a[0], a[1], b[0], b[1], c[0], c[1], col); this.tri(a[0], a[1], c[0], c[1], d[0], d[1], col); }
  seg(a, b, c) { const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])))); for (let i = 0; i <= n; i++) this.set(R(a[0] + (b[0] - a[0]) * i / n), R(a[1] + (b[1] - a[1]) * i / n), c); }
  autoShade() {   // 光从左上来；1 像素的小细节保持原色
    const src = this.d.slice(), at = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h) ? null : src[y * this.w + x];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = at(x, y); if (!c || c === OUT) continue;
      const u = at(x, y - 1), d = at(x, y + 1), l = at(x - 1, y), r = at(x + 1, y);
      if (u !== c && d !== c && l !== c && r !== c) continue;
      if (!u || (!l && u !== c)) this.d[y * this.w + x] = shade(c, 16); else if (!d || !r) this.d[y * this.w + x] = shade(c, -18);
    }
  }
  selOutline() { const add = []; for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { if (this.get(x, y)) continue; const below = this.get(x, y + 1), n = below || this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1); if (n) add.push([x, y, mixHex(n, OUT, below ? .55 : .7)]); } add.forEach(([x, y, c]) => this.set(x, y, c)); }
  canvas() { const c = mk(this.w, this.h), x = c.getContext('2d'), im = x.createImageData(this.w, this.h), D = im.data; for (let p = 0; p < this.w * this.h; p++) { const col = this.d[p]; if (col) D.set(rgbaOf(col), p * 4); } x.putImageData(im, 0, 0); return c; }
}
function paint(w, h, fn, shadeIt = true) { const G = new Grid(w, h); fn(G); if (shadeIt) G.autoShade(); G.selOutline(); return G.canvas(); }
function spr(rs, pal) { const G = new Grid(rs[0].length + 2, rs.length + 2); rs.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) G.set(x + 1, y + 1, pal[ch]); })); G.selOutline(); return G.canvas(); }
function flipC(c) { const o = mk(c.width, c.height), x = o.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return o; }
const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const putB = (c, img, p, dy = 0) => c.drawImage(img, R(p[0] - img.width / 2), R(p[1] - img.height + 1 + dy));
function T(d, s, x, y, col = '#fff4dc', align = 'left', stroke = '#2a1e22') {
  d.font = '12px FP'; d.textAlign = align; d.textBaseline = 'top';
  if (stroke) { d.fillStyle = stroke; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) d.fillText(s, x + dx, y + dy); }
  d.fillStyle = col; d.fillText(s, x, y);
}

// ============================================================ 配色：1 薄荷冰室
const C = {
  wall: '#7fcfae', wallD: '#6ebf9f', trim: '#7a3f2a', trimL: '#a35a3c', tile: '#f7f3e7', tileL: '#ddd7c8',
  floorA: '#f3e6c4', floorB: '#e6d1a3', dot: '#2f8f6e', board: '#d93a2f', stool: '#e5412f',
  wood: '#c07a3e', woodL: '#e0a466', woodD: '#8a512a', marble: '#f7f2ea', marbleS: '#ddd3c4', marbleD: '#c6bba9', vein: '#e7ddcf',
  brass: '#f2c64c', brassD: '#c99428', steel: '#e4e8eb', steelS: '#c5cacd', steelD: '#a8adb2', dark: '#3b3135', cream: '#fff4dc', gold: '#ffd75e',
};

// ============================================================ 食物（店里原大：约半个头大）
const FOOD = {
  tart: spr(['....LCLCLCL....', '..LCyyyyyyyCL..', '.CyYYYYYYYYYyC.', 'LyYhhhYYYYYYYyL', 'CyYhYYYYYYYYsyC', 'LyYYYYYYYYYssyL', '.CyyYYYYYsssyC.', '.LCLCyyyyyCLCL.', '..dCdCdCdCdCd..', '...ddddddddd...'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#ffd21f', h: '#fff6b8', s: '#f2ad0e', d: '#a9561a' }),
  coco: spr(['....LCLCLCL....', '..LCyyyyyyyCL..', '.CyYkYYkYYkYyC.', 'LyYhYkYYkYYkYyL', 'CyYkYYkYYkYYsyC', 'LyYYkYYkYYkssyL', '.CyykYYkYsssyC.', '.LCLCyyyyyCLCL.', '..dCdCdCdCdCd..', '...ddddddddd...'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#f2d4a2', k: '#c98d52', h: '#fff4dc', s: '#ddb27a', d: '#a9561a' }),
  bun: spr(['.....bbbbbb.....', '...bhhkhhhkLbb..', '..bhhhkhhkLLLkb.', '.bkkkhkkkkLkLLLb', '.bhLLkLLLkkLLLsb', 'bLLLkLLLLkLLkksb', 'bkkkLkkkLkkLLskb', 'bLLkLLLkLsskssb.', '.bsksssksskssbb.', '.pPPPPPPPPPPPPp.', '..pPPPPPPPPPPp..', '....pppppppp....'],
    { b: '#e0901f', h: '#ffe9a0', L: '#ffc23a', k: '#c56e12', s: '#e9a12a', P: '#f7d79a', p: '#d8a560' }),
  wife: spr(['....ccccccc....', '..ccLLLLLLLcc..', '.cLLhhhLLLLLLc.', 'cLLhLsLLLsLLLLc', 'cLLLLsLLLsLLLLc', '.cLLLLLLLLLLLc.', '.wcccccccccccw.', '..wwdwwdwwdww..', '....ddddddd....'],
    { c: '#e6a14a', L: '#f7cf7e', h: '#fff0c4', s: '#c8803a', w: '#fbe9c6', d: '#c28440' }),
  pudding: spr(['...BBBBBBBB...', '.BBMMMMMMMMBB.', 'BMMmmMMMMMMMMB', 'BMmMMMMMrRMMMB', 'BMMMMMrRMMMMnB', '.BMMMMMMMMnnB.', 'wwBBBBBBBBBBww', '.wbwbwbwbwbww.', '..wwwwwwwwww..', '....ffffff....'],
    { B: '#2d6cc4', M: '#fff4d6', m: '#ffffff', n: '#f1dfb4', r: '#d9372a', R: '#8c1d17', w: '#f2f6fa', b: '#4a8ae0', f: '#c9d3df' }),
  tea: spr(['..wwwwwwww....', '.wTTTTTTTTw...', 'wTTttTTTTTTw..', 'wTTTTTTTTTTwhh', 'wwTTTTTTTTww.h', 'wwwwwwwwwwww.h', 'wWwwwwwwwwwWh.', '.wWwwwwwwwWw..', '..wWWWWWWWw...', 'SSSSSSSSSSSS..', '.SssssssssS...', '...ssssss.....'],
    { w: '#ffffff', W: '#dde3ec', T: '#c47838', t: '#e9b27c', h: '#e6ebf2', S: '#f3f5f8', s: '#c2c9d4' }),
};
// 店里货架上用的小号（约 10 像素宽 ≈ 2/3 个头）；大号留给选货卡、设计台
const FOOD_S = {
  tart: spr(['..LCLCLC..', '.CyYYYYyC.', 'LyhhYYYYyL', 'CyYYYYYsyC', '.CyYYYssC.', '.LCLyyLCL.', '..dddddd..'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#ffd21f', h: '#fff6b8', s: '#f2ad0e', d: '#a9561a' }),
  coco: spr(['..LCLCLC..', '.CyYkYkyC.', 'LyhYkYYkyL', 'CykYYkYsyC', '.CyYkYssC.', '.LCLyyLCL.', '..dddddd..'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#f2d4a2', k: '#c98d52', h: '#fff4dc', s: '#ddb27a', d: '#a9561a' }),
  bun: spr(['...bbbbb...', '.bhhkhLLb..', '.bhkhLkLLb.', 'bkkLkkLkLsb', 'bLLkLLkLssb', '.bskssksb..', '.pPPPPPPPp.', '..ppppppp..'],
    { b: '#e0901f', h: '#ffe9a0', L: '#ffc23a', k: '#c56e12', s: '#e9a12a', P: '#f7d79a', p: '#d8a560' }),
  wife: spr(['..cccccc..', '.cLLLLLLc.', 'cLhhLsLLLc', 'cLLsLLsLLc', '.cLLLLLLc.', '.wccccccw.', '..wdwwdw..'],
    { c: '#e6a14a', L: '#f7cf7e', h: '#fff0c4', s: '#c8803a', w: '#fbe9c6', d: '#c28440' }),
  pudding: spr(['..BBBBBB..', '.BMMMMrMB.', 'BMmMMrRMMB', 'BMMMMMMnnB', 'wBBBBBBBBw', '.wbwbwbww.', '..wwwwww..'],
    { B: '#2d6cc4', M: '#fff4d6', m: '#ffffff', n: '#f1dfb4', r: '#d9372a', R: '#8c1d17', w: '#f2f6fa', b: '#4a8ae0' }),
  tea: spr(['.wwwwww...', 'wTTtTTTw..', 'wTTTTTTwhh', 'wwwwwwww.h', 'wWwwwwwWh.', '.wWWWWWw..', 'SSSSSSSSS.', '.sssssss..'],
    { w: '#ffffff', W: '#dde3ec', T: '#c47838', t: '#e9b27c', h: '#e6ebf2', S: '#f3f5f8', s: '#c2c9d4' }),
};
const HAND = spr(['....WW......', '...WWWW.....', '...WWWW.....', '...WWWW.....', '...WWWWWW...', '...WWWWWWWW.', '.W.WWWWWWWWW', 'WWWWWWWWWWWW', 'WWWWWWWWWWWW', '.WWWWWWWWWWW', '..WWWWWWWWW.', '...bbbbbbb..', '...bbbbbbb..'], { W: '#ffffff', b: '#7fcfae' });
const COIN = spr(['..ggggg..', '.gyygggg.', 'gygggggog', 'ggggggggo', 'ggggggggo', 'gggggggoo', '.ggggggo.', '..ooooo..'], { g: '#f2c14e', y: '#fff3a0', o: '#c9902e' });
