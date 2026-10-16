// ==== base: pixel painter, colours, text (from 草图/lib.js)
// 草图共用：像素画板（同 _workflow/template）、配色、食物小图、文字描边。
const OUT = '#3a2a2e', R = Math.round;
// fonts: body = Fusion Pixel (12px grid), titles / signs = Noto Serif SC heavy (font plan F)
const PFONT = '"Fusion Pixel","PingFang SC","Microsoft YaHei",sans-serif', SFONT = '"Noto Serif SC","Songti SC",serif';
const fp = n => n + 'px ' + PFONT, sr = n => '900 ' + n + 'px ' + SFONT, FS = 15;   // FS: UI body text size (was 12; one size up for phones)
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
// type scale: FS_T titles (sheets, pop-ups) · FS_H headings (cards, sections) · FS body · FS_S small notes; the story box uses its own 18
const FS_T = 18, FS_H = 16, FS_S = 13, BTN_H = 32, TAB_H = 30;   // UI B: buttons 32 tall, tabs 30 (fingers on phones)
function TC(d, s, cx, cy, col, size = FS, serif = false, align = 'center') {   // text centred vertically on cy (and on cx, or starting / ending there) by its real glyph box — font metrics differ between phones, so no fixed offsets
  d.font = serif ? sr(size) : fp(size); d.textAlign = 'left'; d.textBaseline = 'alphabetic'; const m = d.measureText(s);
  const L = m.actualBoundingBoxLeft || 0, Rt = m.actualBoundingBoxRight || m.width, A = m.actualBoundingBoxAscent || size * .8, D = m.actualBoundingBoxDescent || 0, w = Rt + L;
  const x = align === 'left' ? cx + L : align === 'right' ? cx - Rt : cx - (Rt - L) / 2 + L;
  d.fillStyle = col; d.fillText(s, Math.round(x), Math.round(cy + (A - D) / 2));
}
// Text is placed by the top of its glyphs: canvas 'top' baseline means different things in desktop Chrome and phone
// browsers (Safari puts it lower), so we draw from the alphabetic baseline, one glyph-height below y (measured per font).
const GLYPH_ASC = {};
function glyphTop(d) { const f = d.font; if (GLYPH_ASC[f] !== undefined) return GLYPH_ASC[f]; const b = d.textBaseline; d.textBaseline = 'alphabetic'; const a = d.measureText('国').actualBoundingBoxAscent; d.textBaseline = b;
  const v = a > 0 ? a : parseFloat(f.match(/(\d+)px/)[1]) * .82; if (!document.fonts || document.fonts.check(f)) GLYPH_ASC[f] = v; return v; }
function T(d, s, x, y, col = '#fff4dc', align = 'left', stroke = '#2a1e22', size = FS) {   // size: FS_S for the odd small label
  if (typeof scrollGrow === 'function') scrollGrow(y + size + 2);
  d.font = fp(size); d.textAlign = align; d.textBaseline = 'alphabetic'; const yy = y + glyphTop(d);
  if (stroke) { d.fillStyle = stroke; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) d.fillText(s, x + dx, yy + dy); }
  d.fillStyle = col; d.fillText(s, x, yy);
}
