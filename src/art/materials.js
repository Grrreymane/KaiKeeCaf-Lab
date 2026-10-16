// ==== materials: after an object (or the background) is drawn in flat colours, each surface gets the texture of what it is made of —
// wood grain + plank seams, marble veins, velvet sheen, linen weave, brushed steel, brick + mortar, porcelain glaze, terrazzo floor.
// The texture is picked by colour (every palette colour belongs to one material) and laid in screen space, so it runs on
// across neighbouring objects. Grain follows the face: fronts / tops along world x, the darker side faces along world y.
C.cabL = '#e2a668'; C.cab = '#c27c40'; C.cabD = '#8c532c';   // front counter cabinets (vertical boards)
C.brickL = '#c8644a'; C.brick = '#b5523a'; C.brickD = '#8f3e2c'; C.mortar = '#e2d6c4';
const MAT = new Map();
const matSet = (kind, cols, extra) => { for (const c of cols) MAT.set(c, { kind, ...extra }); };
let MAT_KEY = '';
function matInit() {   // palette colours can change (wallpaper / themes): rebuild the colour → material table when they do
  const key = [C.wood, C.woodL, C.woodD, C.marble, C.marbleS, C.marbleD, C.vein, C.trim, C.steel].join() + Object.keys(BOOTH_STYLES).length; if (key === MAT_KEY) return; MAT_KEY = key; MAT.clear();
  // wood species, each with its own grain (front/top colours, then the darker side colours that take the grain the other way)
  const wood = (sp, faces, sides) => { matSet('wood', faces, { sp }); matSet('wood', sides, { sp, side: true }); };
  wood('oak', [C.wood, C.woodL], [C.woodD]);
  wood('vert', [C.cab], [C.cabD]); wood('oak', [C.cabL], []);   // 柜身竖纹：cabinet fronts and sides run vertical boards   // 橡木: counters, platform, benches — arches + ray flecks
  wood('walnut', [C.trim, C.trimL, '#6b4a35', '#5a3c2a'], ['#4a3020']);   // 胡桃木: window and door frames — dark, wavy
  wood('teak', ['#a8703e', '#86562e', '#b07444', '#8a5630'], ['#663e20', '#6a3e20']);   // 柚木: tier-2 shelves — tight straight grain, dark streaks
  wood('pine', ['#d6aa72', '#b58a5a', '#d99a5c', '#b8743c', '#b07a4a', '#d9a066', '#7a4a2e'], ['#9e7748', '#93582c']);   // 松木: boards, crates — wide bands and knots
  wood('poplar', ['#e6c79a', '#b08a58'], ['#957242']);   // 杨木: pale shelf feet — fine, smooth, a grey-green streak now and then
  matSet('marble', [C.marble, C.marbleS, C.marbleD, C.vein, '#f4f1ea', '#efe9dd']);
  matSet('linen', ['#e4ddd0', '#cfc6b5', '#b9af9d', '#cfc6b6', '#bdb4a3']);
  matSet('steel', [C.steel, C.steelS, C.steelD, '#c0c6c9', '#a3aaae', '#8e959a', '#eef1f3', '#d3d8db', '#b6bcc0']);
  matSet('brick', [C.brickL, C.brick, C.brickD]);
  for (const k in BOOTH_STYLES) matSet('velvet', BOOTH_STYLES[k].leather);
  for (const k in COUNTER_STYLES) if (k !== 'terrazzo' && k !== 'oak') { wood('vert', COUNTER_STYLES[k].cab.slice(0, 2), [COUNTER_STYLES[k].cab[2]]); if (k !== 'red') wood('oak', COUNTER_STYLES[k].top.slice(0, 2), []); }
}
const mhash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vnoise(x, y) {   // smooth value noise, 0..1
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = mhash(xi, yi), b = mhash(xi + 1, yi), c = mhash(xi, yi + 1), d = mhash(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const SHADE_C = new Map(), shadeC = (c, k) => { if (!k) return c; const key = c + k; let v = SHADE_C.get(key); if (!v) SHADE_C.set(key, v = shade(c, k)); return v; };
function matTex(m, c, X, Y) {   // shade offset (or a colour) for one pixel at screen point X, Y
  if (m.kind === 'wood') {
    const v = m.side ? Y + X * .5 : Y - X * .5, P = m.sp === 'pine' ? 18 : m.sp === 'teak' ? 9 : 13, plank = Math.floor(v / P), pv = ((v % P) + P) % P;
    if (pv < 1 && m.sp !== 'poplar') return -22;   // seam between boards
    const tint = Math.round((mhash(plank, 7) - .5) * 10);
    if (m.sp === 'vert') {   // vertical boards: seams every 10 px across, grain running up and down with a slow wave
      const u = m.side ? X * 2 : X, pl = Math.floor(u / 10), pu = ((u % 10) + 10) % 10; if (pu < 1) return -24; if (pu > 8) return 6;
      const r = Math.sin(u * .9 + vnoise(Y * .035, pl * 2.3) * 4.5); return (r > .78 ? -12 : r < -.86 ? 8 : 0) + Math.round((mhash(pl, 11) - .5) * 12); }
    if (m.sp === 'walnut') { const r = Math.sin(v * .42 + vnoise(X * .05, v * .05) * 8); return (r > .6 ? -16 : r < -.7 ? 8 : 0) + tint; }
    if (m.sp === 'teak') { const r = Math.sin(v * 1.3 + vnoise(X * .01, plank) * 2); return (r > .85 ? -10 : 0) + (vnoise(X * .02, v * .2) > .72 ? -9 : 0) + tint; }
    if (m.sp === 'pine') {
      const kx = Math.floor(mhash(plank, 3) * 400), d = Math.hypot((((X - kx) % 90) + 90) % 90 - 45, (pv - P / 2) * 2);   // one knot every so often along each board
      if (d < 2.5) return -34; if (d < 5) return -14; const r = Math.sin(v * .3 + vnoise(X * .02, plank * 2) * 3 + 2 / (d * .3 + 1)); return (r > .5 ? -14 : 0) + tint; }
    if (m.sp === 'poplar') { if (vnoise(X * .012, v * .1) > .78) return mixHex(c, '#9aa58a', .25); const r = Math.sin(v * .8 + vnoise(X * .02, plank) * 3); return r > .9 ? -7 : 0; }
    const ring = Math.sin(v * .62 + vnoise(X * .035, plank * 3.1) * 5.5);   // oak: grain arches, with little ray flecks
    return (ring > .82 ? -13 : ring < -.9 ? 9 : 0) + (mhash(X >> 1, Y) < .012 ? 12 : 0) + tint;
  }
  if (m.kind === 'marble') {
    const n = vnoise(X * .028, Y * .028) * 2.6 + X * .022 + Y * .04, vein = Math.abs(Math.sin(n * 2.4));
    const v2 = Math.abs(Math.sin((vnoise(X * .08 + 9, Y * .08) * 2 + X * .05 - Y * .02) * 3));
    return vein < .09 ? -30 : vein < .2 ? -14 : v2 < .05 ? -9 : mhash(X, Y) < .04 ? -6 : 0;   // a main vein with a soft halo, thin crossing veins, speckle
  }
  if (m.kind === 'velvet') {
    const sheen = Math.sin((X * .5 + Y) * .16 + vnoise(X * .05, Y * .05) * 3);
    return (sheen > .7 ? 18 : sheen > .45 ? 8 : sheen < -.75 ? -12 : 0) + (mhash(X, Y) < .1 ? -8 : 0);   // soft light bands + the pile
  }
  if (m.kind === 'linen') return (X % 2 === 0 && Y % 2 === 0) ? -7 : (X + Y) % 4 === 1 && mhash(X, Y) < .4 ? 5 : 0;
  if (m.kind === 'steel') return (Y % 3 === 0 ? 5 : 0) + (mhash(X >> 2, Y) < .12 ? -6 : 0);   // brushed, horizontal
  if (m.kind === 'brick') {
    const row = Math.floor((Y - X * .5) / 6), by = (((Y - X * .5) % 6) + 6) % 6, bxp = ((X + (row & 1) * 7) % 14 + 14) % 14;
    if (by < 1 || bxp < 1) return C.mortar;
    return Math.round((mhash(Math.floor((X + (row & 1) * 7) / 14), row) - .5) * 18);
  }
  return 0;
}
function matPass(g, ox, oy) {   // texture every pixel whose colour is a known material (the outline and small details stay)
  matInit();
  const d = g.d, w = g.w;
  for (let i = 0; i < d.length; i++) {
    const c = d[i]; if (!c) continue; const m = MAT.get(c); if (!m) continue;
    const t = matTex(m, c, (i % w) + ox, Math.floor(i / w) + oy);
    d[i] = typeof t === 'string' ? t : shadeC(c, t);
  }
}
function bgMatPass(g) {   // the room: terrazzo floor, glazed wall tiles, and the walls themselves — paper (fibres, faint seams) or wood boards
  const d = g.d, w = g.w, F = new Set([C.floorA, C.floorB]), FLP = (FLOORS[(W && W.decor && W.decor.floor) || 'peach'] || {}).plank, TL = new Set([C.tile, shade(C.tile, -12)]);
  const WS = WALLS[(W && W.decor && W.decor.wall) || 'mint'] || WALLS.mint, WL = new Map([[C.wall, 0], [C.wallD, 0], [shade(C.wall, -18), 1], [shade(C.wallD, -18), 1]]);
  matInit(); const VB = { kind: 'wood', sp: 'vert' }, VBs = { kind: 'wood', sp: 'vert', side: true }, LO = WS.low || shade(WS.wall, -40), LOW = new Map([[LO, 0], [shade(LO, -18), 1]]);
  for (let i = 0; i < d.length; i++) {
    const c = d[i]; if (!c) continue; const X = i % w, Y = (i / w) | 0;
    if (LOW.has(c)) { if (WS.lowWood) { const t = matTex(LOW.get(c) ? VBs : VB, c, X, Y); d[i] = typeof t === 'string' ? t : shadeC(c, t); } else { const r = mhash(X, Y); d[i] = r < .05 ? shadeC(c, -6) : r > .96 ? shadeC(c, 6) : c; } continue; }   // the dado panel
    if (WL.has(c)) {   // wall
      if (WS.wood) { const t = matTex(WL.get(c) ? VBs : VB, c, X, Y); d[i] = typeof t === 'string' ? t : shadeC(c, t); continue; }
      const r = mhash(X, Y), seam = ((X % 64) + 64) % 64 === 0;
      d[i] = seam ? shadeC(c, -7) : r < .06 ? shadeC(c, -5) : r > .95 ? shadeC(c, 5) : vnoise(X * .25, Y * .015) > .82 ? shadeC(c, -3) : c; continue; }
    if (F.has(c) && FLP) { const t = matTex({ kind: 'wood', sp: 'oak' }, c, X, Y); d[i] = typeof t === 'string' ? t : shadeC(c, t); continue; }
    if (F.has(c)) { const r = mhash(X, Y); d[i] = r < .035 ? shadeC(c, -12) : r > .985 ? shadeC(c, 14) : vnoise(X * .02, Y * .04) > .72 ? shadeC(c, 4) : c; }
    else if (TL.has(c)) { const u = ((X % 12) + 12) % 12, v = ((Y - X * .5) % 12 + 12) % 12; d[i] = u + v < 5 && u + v > 2 ? shadeC(c, 10) : c; }
  }
}
