// ==== art: semi-real dialogue busts (style A). Drawn once with smooth shapes at 400 x 480 (anime-leaning face: big almond
// eyes with a heavy upper lash line and a flick, layered iris + two catchlights, tiny nose, small mouth, V chin, pointed
// fringe locks), then shrunk to 200 x 240 and snapped to a fixed palette of 3-5 tone ramps (cel shading, no dither) with a
// coloured outline — so it sits with the pixel sprites and food. Light from the top-left.
const REAL_PAL = {
  skin: ['#b87a5c', '#d89a78', '#eeb894', '#f8d2b4', '#fde6d4'], hair: ['#24140e', '#3a2218', '#54301f', '#70442c', '#8e5c3a', '#b07a50'],
  shirt: ['#b88a2a', '#d9a83c', '#f0c860', '#f8dc8c', '#fff0c0'], apron: ['#20523f', '#2f7560', '#3f8f74', '#58a88a', '#7cc4a6'],
  lip: ['#a04a46', '#c4645c', '#de8a80'], eye: ['#1c100c', '#3a2014', '#6a3a22', '#9a5c30', '#c8884a'], white: ['#e6dcd4', '#f8f2ec', '#ffffff'],
  blush: ['#f0a094', '#e88a80'], misc: ['#e8c060', '#fff4dc'],
};
function realHeroF(c, bodyOnly) {
  const L = (stops, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const bez = (pts, fill) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 6) c.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]); c.closePath(); c.fillStyle = fill; c.fill(); };
  const poly = (pts, fill) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fillStyle = fill; c.fill(); };
  const P = REAL_PAL, hairG = L([P.hair[4], P.hair[3], P.hair[2], P.hair[1]], 120, 70, 300, 320);
  // back hair: a full bob that curls in at the jaw
  if (!bodyOnly)   bez([200, 58, 116, 56, 86, 118, 90, 200, 92, 252, 98, 296, 122, 314, 150, 322, 172, 304, 178, 284, 228, 304, 250, 322, 278, 314, 302, 296, 308, 252, 310, 200, 314, 118, 284, 56, 200, 58], hairG);
  // shoulders, shirt, darker right side
  bez([200, 318, 152, 322, 104, 338, 82, 372, 64, 400, 58, 440, 54, 480, 152, 480, 248, 480, 346, 480, 342, 440, 336, 400, 318, 372, 296, 338, 248, 322, 200, 318], L([P.shirt[3], P.shirt[2], P.shirt[1]], 40, 330, 360, 480));
  c.fillStyle = P.shirt[1]; c.beginPath(); c.moveTo(283, 342); c.bezierCurveTo(314, 362, 336, 404, 344, 480); c.lineTo(304, 480); c.bezierCurveTo(302, 420, 294, 380, 283, 342); c.fill();
  // neck + chin shadow
  bez([180, 246, 180, 274, 178, 302, 172, 326, 190, 336, 212, 336, 228, 326, 222, 302, 220, 274, 220, 246, 200, 246, 180, 246], P.skin[2]);
  c.fillStyle = P.skin[1]; c.beginPath(); c.moveTo(180, 270); c.bezierCurveTo(192, 300, 210, 300, 220, 270); c.lineTo(220, 288); c.bezierCurveTo(210, 306, 190, 306, 180, 290); c.fill();
  // collar
  poly([168, 318, 136, 372, 162, 372, 188, 358, 200, 344, 178, 326], P.shirt[4]); poly([232, 318, 264, 372, 238, 372, 212, 358, 200, 344, 222, 326], P.shirt[3]);
  // apron bib + straps + pocket stitching
  poly([126, 400, 274, 400, 284, 490, 116, 490], L([P.apron[3], P.apron[2], P.apron[1]], 120, 400, 280, 480));   // bib runs straight down past the bottom edge
  poly([126, 402, 120, 330, 134, 326, 142, 400], P.apron[2]); poly([274, 402, 280, 330, 266, 326, 258, 400], P.apron[1]);
  c.fillStyle = P.apron[4]; for (let x = 172; x < 230; x += 6) { c.fillRect(x, 432, 3, 2); c.fillRect(x, 464, 3, 2); } for (let y = 432; y < 466; y += 6) { c.fillRect(170, y, 2, 3); c.fillRect(228, y, 2, 3); }
  if (bodyOnly) return;   // the head comes from the hand-pixelled bust
  // face: soft cheeks into a narrow V chin
  bez([200, 100, 158, 100, 130, 128, 128, 172, 126, 206, 132, 232, 146, 252, 160, 270, 182, 286, 200, 292, 218, 286, 240, 270, 254, 252, 268, 232, 274, 206, 272, 172, 270, 128, 242, 100, 200, 100], P.skin[3]);
  c.fillStyle = P.skin[2]; c.beginPath(); c.moveTo(270, 160); c.bezierCurveTo(278, 210, 262, 256, 214, 288); c.bezierCurveTo(244, 258, 262, 214, 256, 160); c.fill();   // shade on the right cheek
  c.fillStyle = P.skin[2]; c.beginPath(); c.ellipse(200, 170, 76, 14, 0, 0, 7); c.fill();   // shadow under the fringe
  for (const bx of [154, 246]) { c.fillStyle = P.blush[0]; c.beginPath(); c.ellipse(bx, 244, 15, 7, 0, 0, 7); c.fill(); c.fillStyle = P.skin[4]; for (let i = 0; i < 3; i++) c.fillRect(bx - 8 + i * 6, 240, 2, 6); }   // blush with a few hatch lines
  // brows: thin, high, slightly angled
  c.lineCap = 'round'; c.strokeStyle = P.hair[1]; c.lineWidth = 4;
  c.beginPath(); c.moveTo(132, 176); c.quadraticCurveTo(150, 163, 180, 168); c.stroke(); c.beginPath(); c.moveTo(268, 176); c.quadraticCurveTo(250, 163, 220, 168); c.stroke();
  // eyes
  const eye = (cx, s) => {   // s = -1 left eye, 1 right eye (outer corner side)
    const y = 214, w = 30, top = 25, bot = 14;
    c.save(); c.beginPath(); c.moveTo(cx - s * w * .95, y + 2); c.quadraticCurveTo(cx - s * 6, y - top - 4, cx + s * w, y - 4); c.quadraticCurveTo(cx + s * 4, y + bot + 2, cx - s * w * .95, y + 2); c.closePath();
    c.fillStyle = P.white[1]; c.fill(); c.clip();
    const ix = cx + s * 2, iy = y - 3, r = 19;
    c.fillStyle = P.eye[1]; c.beginPath(); c.ellipse(ix, iy, r * .82, r, 0, 0, 7); c.fill();
    c.fillStyle = P.eye[2]; c.beginPath(); c.ellipse(ix, iy + 3, r * .7, r * .78, 0, 0, 7); c.fill();
    c.fillStyle = P.eye[3]; c.beginPath(); c.ellipse(ix, iy + 7, r * .55, r * .5, 0, 0, 7); c.fill();
    c.fillStyle = P.eye[4]; c.beginPath(); c.ellipse(ix, iy + 10, r * .38, r * .26, 0, 0, 7); c.fill();
    c.fillStyle = P.eye[0]; c.beginPath(); c.ellipse(ix, iy - 1, 6, 8, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(28,16,12,.5)'; c.fillRect(cx - w - 2, y - top - 4, w * 2 + 4, 9);   // shadow of the upper lid
    c.restore();
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ix - 6, iy - 8, 5.5, 6.5, -.3, 0, 7); c.fill(); c.beginPath(); c.arc(ix + 6, iy + 8, 2.8, 0, 7); c.fill();   // catchlights
    c.strokeStyle = P.eye[0]; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - s * w * .95, y + 1); c.quadraticCurveTo(cx - s * 6, y - top - 4, cx + s * w, y - 4); c.stroke();   // heavy upper lash line
    c.lineWidth = 3.5; c.beginPath(); c.moveTo(cx + s * w, y - 4); c.lineTo(cx + s * (w + 9), y - 11); c.stroke();   // flick
    c.lineWidth = 2; c.beginPath(); c.moveTo(cx + s * (w - 2), y - 2); c.quadraticCurveTo(cx + s * (w + 4), y + 1, cx + s * (w + 2), y + 5); c.stroke();
    c.strokeStyle = P.eye[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + s * w * .9, y); c.quadraticCurveTo(cx + s * 10, y + bot + 2, cx - s * 6, y + bot); c.stroke();   // lower lash, outer half
    c.strokeStyle = P.skin[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - s * w * .7, y - top - 7); c.quadraticCurveTo(cx, y - top - 13, cx + s * w * .9, y - top + 2); c.stroke();   // lid crease
  };
  eye(160, -1); eye(240, 1);
  // nose: a short shadow and a tip highlight only
  c.strokeStyle = P.skin[1]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(206, 236); c.lineTo(202, 248); c.stroke();
  c.fillStyle = P.skin[4]; c.fillRect(196, 244, 4, 3);
  // mouth: small, slight smile, a touch of lower lip
  c.strokeStyle = P.lip[0]; c.lineWidth = 3; c.beginPath(); c.moveTo(190, 266); c.quadraticCurveTo(200, 271, 212, 265); c.stroke();
  c.fillStyle = P.lip[2]; c.beginPath(); c.ellipse(201, 271, 6, 2.5, 0, 0, 7); c.fill();
  // fringe: pointed locks over the forehead, side locks framing the cheeks
  c.beginPath(); c.moveTo(126, 182); c.bezierCurveTo(112, 112, 150, 72, 204, 74); c.bezierCurveTo(258, 74, 296, 112, 282, 190);
  for (const [x, y] of [[270, 168], [262, 192], [248, 160], [234, 184], [222, 150], [208, 178], [196, 148], [180, 172], [170, 150], [156, 180], [148, 158], [134, 186]]) c.lineTo(x, y);
  c.closePath(); c.fillStyle = hairG; c.fill();
  poly([126, 160, 112, 210, 114, 262, 126, 300, 136, 262, 140, 210, 138, 176], P.hair[2]); poly([274, 160, 288, 210, 286, 262, 274, 300, 264, 262, 260, 210, 262, 176], P.hair[1]);
  // hair shading: darker toward the right and under the fringe, strand lines flowing down, an anime shine band on the crown
  c.save(); c.beginPath(); c.moveTo(126, 182); c.bezierCurveTo(112, 112, 150, 72, 204, 74); c.bezierCurveTo(258, 74, 296, 112, 282, 190); c.lineTo(126, 182); c.clip();
  c.fillStyle = P.hair[1]; c.beginPath(); c.ellipse(302, 170, 30, 96, -.15, 0, 7); c.fill();
  c.restore();
  c.strokeStyle = P.hair[1]; c.lineWidth = 2.5; c.lineCap = 'round';
  for (const [x0, y0, x1, y1, x2, y2] of [[180, 82, 166, 120, 156, 176], [204, 78, 200, 120, 196, 146], [226, 82, 228, 120, 222, 148], [252, 92, 262, 130, 262, 190], [160, 90, 134, 130, 132, 180], [270, 110, 284, 150, 280, 200]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke(); }
  for (const [x0, x1, y] of [[100, 112, 220], [104, 116, 270], [296, 300, 230], [290, 298, 280]]) { c.beginPath(); c.moveTo(x0, y - 50); c.quadraticCurveTo(x1, y - 20, x1 + 2, y); c.stroke(); }
  c.fillStyle = P.hair[5];
  for (let a = 3.55; a < 5.2; a += .17) {   // zigzag shine: thin streaks pointing down toward the face along the crown
    const cx = 204, cy = 186, r0 = 98, r1 = 80 + Math.sin(a * 9) * 4, w = .05;
    c.beginPath(); c.moveTo(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0); c.lineTo(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.closePath(); c.fill();
  }
  c.fillStyle = P.hair[4]; c.beginPath(); c.arc(204, 186, 99, 3.55, 5.2); c.arc(204, 186, 95, 5.2, 3.55, true); c.fill();
  c.fillStyle = P.misc[0]; c.beginPath(); c.arc(278, 258, 3, 0, 7); c.fill();   // gold stud
}
const REAL_ALL = Object.values(REAL_PAL).flat().map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), h]);
function realPixelise(src, w, h, palHex) {   // shrink + snap every pixel to the nearest palette colour, then a coloured outline
  const t = mk(w, h), x = t.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data, g = new Grid(w, h), PAL = palHex ? palHex.map(h_ => [parseInt(h_.slice(1, 3), 16), parseInt(h_.slice(3, 5), 16), parseInt(h_.slice(5, 7), 16), h_]) : REAL_ALL;
  for (let i = 0; i < w * h; i++) {
    if (d[i * 4 + 3] < 140) continue;
    const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2]; let best = null, bd = 1e9;
    for (const p of PAL) { const dd = (p[0] - r) ** 2 * .3 + (p[1] - gg) ** 2 * .59 + (p[2] - b) ** 2 * .11; if (dd < bd) { bd = dd; best = p[3]; } }
    g.d[i] = best;
  }
  colorOutline(g, 1);
  return g.canvas();
}
// every bust: the hand-pixelled head (portraits.js) on a semi-real body made for that person
const BODY_SPEC = {
  hero_f: { top: '#f0c860', collar: '#fff4dc', apron: '#3f8f74', pocket: true },
  hero_m: { top: '#8cc0e0', collar: '#e9f4fb', apron: '#3f8f74', pocket: true, broad: true },
  kun: { top: '#c9ad7f', collar: '#dcc49a', apron: '#efe8d8', stain: '#d6c9a8', arms: 'crossed', broad: true },
  lin: { top: '#e47b97', floral: '#ffd3dd', apron: '#3f8f74' },
  wen: { top: '#f2f2ee', collar: '#ffffff', apron: '#3f8f74', roll: true },
  shao: { top: '#4a4046', inner: '#e9e3d6', zip: '#c9cdd0', jacket: true, broad: true, apron: '#c23a30' },
};
const rampOf = col => [shade(col, -38), shade(col, -18), col, shade(col, 18), shade(col, 36)];
function realBody(c, sp, skin) {   // 400 x 480, same shapes as the owner's body; returns the colours used (palette for pixelising)
  const L = (stops, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((q, i) => g.addColorStop(i / (stops.length - 1), q)); return g; };
  const bez = (pts, fill) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 6) c.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]); c.closePath(); c.fillStyle = fill; c.fill(); };
  const poly = (pts, fill) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fillStyle = fill; c.fill(); };
  const T = rampOf(sp.top), S = rampOf(skin), A = sp.apron ? rampOf(sp.apron) : null, wx = x => R(200 + (x - 200) * (sp.broad ? .92 : .8));
  bez([200, 318, 140, 322, 80, 338, 52, 372, 30, 400, 22, 440, 18, 480, 140, 480, 260, 480, 382, 480, 378, 440, 370, 400, 348, 372, 320, 338, 260, 322, 200, 318].map((v, i) => i % 2 ? v : wx(v)), L([T[3], T[2], T[1]], 40, 330, 360, 480));
  c.fillStyle = T[1]; c.beginPath(); c.moveTo(wx(304), 342); c.bezierCurveTo(wx(342), 362, wx(370), 404, wx(380), 480); c.lineTo(wx(330), 480); c.bezierCurveTo(wx(328), 420, wx(318), 380, wx(304), 342); c.fill();
  if (sp.floral) { c.save(); c.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 46; i++) { const x = 60 + (i * 83) % 280, y = 350 + (i * 47) % 125; c.fillStyle = sp.floral; c.fillRect(x, y, 4, 4); c.fillStyle = '#ffffff'; c.fillRect(x + 1, y + 1, 2, 2); } c.restore(); }   // only on the shirt
  { const nc = sp.turn ? 214 : 200, h = (sp.neck || 20); bez([nc - h, 246, nc - h, 274, nc - h - 2, 302, nc - h - 8, 326, nc - h + 10, 336, nc + h - 8, 336, nc + h + 8, 326, nc + h + 2, 302, nc + h, 274, nc + h, 246, nc, 246, nc - h, 246], S[2]); }   // neck: shifted with the 3/4 head, width per person
  c.fillStyle = S[1]; c.beginPath(); c.moveTo(180, 270); c.bezierCurveTo(192, 300, 210, 300, 220, 270); c.lineTo(220, 288); c.bezierCurveTo(210, 306, 190, 306, 180, 290); c.fill();
  if (sp.jacket) {   // leather jacket open over a tee: lapels, zip, shine on the shoulder
    poly([176, 326, 224, 326, 232, 480, 168, 480], sp.inner); poly([176, 326, 200, 352, 224, 326], S[1]);
    poly([168, 322, 124, 360, 150, 380, 186, 340], T[3]); poly([232, 322, 276, 360, 250, 380, 214, 340], T[2]);
    c.fillStyle = sp.zip; c.fillRect(162, 380, 3, 100); c.fillRect(235, 380, 3, 100);
    c.fillStyle = T[4]; c.beginPath(); c.ellipse(110, 372, 26, 7, -.5, 0, 7); c.fill();
  }
  if (sp.collar) { poly([168, 318, 136, 372, 162, 372, 188, 358, 200, 344, 178, 326], sp.collar); poly([232, 318, 264, 372, 238, 372, 212, 358, 200, 344, 222, 326], shade(sp.collar, -10)); }
  if (A) {   // apron bib straight down past the bottom edge, straps over the shoulders, pocket stitching
    poly([126, 400, 274, 400, 284, 490, 116, 490], L([A[3], A[2], A[1]], 120, 400, 280, 480));
    poly([126, 402, 120, 330, 134, 326, 142, 400], A[2]); poly([274, 402, 280, 330, 266, 326, 258, 400], A[1]);
    if (sp.pocket) { c.fillStyle = A[4]; for (let x = 172; x < 230; x += 6) { c.fillRect(x, 432, 3, 2); c.fillRect(x, 464, 3, 2); } for (let y = 432; y < 466; y += 6) { c.fillRect(170, y, 2, 3); c.fillRect(228, y, 2, 3); } }
    if (sp.stain) for (const [x, y, r] of [[160, 440, 9], [236, 418, 7], [190, 470, 6]]) { c.fillStyle = sp.stain; c.beginPath(); c.ellipse(x, y, r, r * .7, 0, 0, 7); c.fill(); }
  }
  if (sp.roll) for (const x of [wx(60), wx(340)]) { c.fillStyle = T[1]; c.fillRect(x - 24, 440, 48, 12); c.fillStyle = T[3]; c.fillRect(x - 24, 440, 48, 3); }   // rolled sleeves
  if (sp.arms === 'crossed') {   // Kun: forearms folded across the chest, fists resting on the upper arms
    c.fillStyle = S[1]; c.beginPath(); c.ellipse(200, 432, 112, 22, .12, 0, 7); c.fill();
    c.fillStyle = S[2]; c.beginPath(); c.ellipse(196, 414, 108, 20, -.12, 0, 7); c.fill();
    c.fillStyle = S[3]; c.beginPath(); c.ellipse(108, 404, 20, 17, 0, 0, 7); c.fill(); c.fillStyle = S[1]; c.beginPath(); c.ellipse(292, 440, 18, 16, 0, 0, 7); c.fill();
    c.fillStyle = S[0]; for (const x of [98, 106, 114]) c.fillRect(x, 400, 2, 12);
  }
  return [...T, ...S, ...(A || []), ...(sp.collar ? [sp.collar, shade(sp.collar, -10)] : []), ...(sp.floral ? [sp.floral, '#ffffff'] : []), ...(sp.inner ? [sp.inner, sp.zip] : []), ...(sp.stain ? [sp.stain] : [])];
}
const REAL_BUST = Object.fromEntries(Object.keys(BODY_SPEC).map(id => [id, id => {
  const big = mk(400, 480), pal = realBody(big.getContext('2d'), { ...BODY_SPEC[id], neck: (BUSTS[id].face || {}).neck, turn: BUSTS[id].turn }, BUSTS[id].skin);
  const body = realPixelise(big, 200, 240, pal), head = pixelBust(id), out = mk(200, 240), x = out.getContext('2d');
  const B = BUSTS[id], ch = B.hs === 'bob' || !B.face ? 144 : B.face.chin + 6;   // cut just under the chin, so the body's own neck shows (no seam)
  x.drawImage(body, 0, 0); x.drawImage(head, 0, 0, 200, ch, 0, 12, 200, ch);   // head + hair set 12 rows lower: a short neck down to the collar
  if (BUSTS[id].hs === 'pony') {   // a ponytail hangs lower than the cut: copy just its hair-coloured pixels below row 144
    const hd = head.getContext('2d').getImageData(0, ch, 200, 96).data, hc = BUSTS[id].hair, H = [parseInt(hc.slice(1, 3), 16), parseInt(hc.slice(3, 5), 16), parseInt(hc.slice(5, 7), 16)], o2 = x.getImageData(0, ch + 12, 200, 84);
    for (let yy = 0; yy < 84; yy++) for (let xx = 0; xx < 200; xx++) { const i = (yy * 200 + xx) * 4; if (hd[i + 3] < 128) continue; const dc = Math.abs(hd[i] - H[0]) + Math.abs(hd[i + 1] - H[1]) + Math.abs(hd[i + 2] - H[2]); if (dc < 70 && Math.abs(xx - 100) > 22) { o2.data[i] = hd[i]; o2.data[i + 1] = hd[i + 1]; o2.data[i + 2] = hd[i + 2]; o2.data[i + 3] = 255; } }
    x.putImageData(o2, 0, ch + 12);
  }
  return id.startsWith('hero') && BUSTS[id].turn ? flipC(out) : out;   // a turned owner stands on the right of the dialogue window, so faces left
}]));
// owner: a Q-version bust made from the in-game pixel sprite (same design), smoothed up 4x and repainted with thick, layered shading
function qPaintBust(id) {
  const spr = drawPersonHD(STD(STAFF_DEF[id]), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const rows = 64, g0 = new Grid(w, rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); }
  const s2x = g => { const o = new Grid(g.w * 2, g.h * 2); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C = g.get(x - 1, y), D = g.get(x, y + 1); o.set(x * 2, y * 2, C === A && C !== D && A !== B ? A : P); o.set(x * 2 + 1, y * 2, A === B && A !== C && B !== D ? B : P); o.set(x * 2, y * 2 + 1, D === C && D !== B && C !== A ? C : P); o.set(x * 2 + 1, y * 2 + 1, B === D && B !== A && D !== C ? D : P); } return o; };
  const g = s2x(s2x(g0));   // 240 x 256, curves smoothed (scale2x twice)
  const H = STAFF_DEF[id].hair, isHair = c => c && c !== HD_OUT && Math.abs(lum(c) - lum(H)) < 26;
  for (let a = -1; a <= 1; a += .02) {   // a painted shine band across the crown
    const x = R(120 + a * 64), y0 = R(40 + a * a * 22); for (let q = 0; q < 6; q++) { const c = g.get(x, y0 + q); if (isHair(c)) g.set(x, y0 + q, shade(c, q < 2 ? 34 : 18)); }
  }
  const base = g.canvas(), cv = mk(base.width, base.height), x = cv.getContext('2d'); x.drawImage(base, 0, 0);
  x.globalCompositeOperation = 'source-atop';   // thick paint: broad soft light from the top-left, shadow pooling bottom-right and under the chin / hair
  let gr = x.createRadialGradient(60, 40, 10, 60, 40, 260); gr.addColorStop(0, 'rgba(255,244,220,.16)'); gr.addColorStop(1, 'rgba(255,244,220,0)'); x.fillStyle = gr; x.fillRect(0, 0, 240, 256);
  gr = x.createLinearGradient(80, 60, 230, 250); gr.addColorStop(0, 'rgba(60,30,40,0)'); gr.addColorStop(1, 'rgba(60,30,40,.3)'); x.fillStyle = gr; x.fillRect(0, 0, 240, 256);
  for (let y = 0; y < 256; y++) for (let q = 0; q < 240; q++) { const c = g.get(q, y), up = g.get(q, y - 1), up2 = g.get(q, y - 3); if (c && SKIN_SET.has(c) && ((up && isHair(up)) || (up2 && isHair(up2)))) { x.fillStyle = 'rgba(120,60,50,.28)'; x.fillRect(q, y, 1, 1); } }   // shadow the fringe throws on the forehead (only on skin right under hair)
  for (let q = 0; q < 240; q++) { let yy = -1; for (let y = 120; y < 200; y++) { const c = g.get(q, y); if (c && SKIN_SET.has(c)) yy = y; } if (yy > 0) { x.fillStyle = 'rgba(110,50,50,.25)'; x.fillRect(q, yy - 3, 1, 4); } }   // a soft shadow under the chin / along the jaw
  x.globalCompositeOperation = 'source-over';
  const im = x.getImageData(0, 0, 240, 256), dd = im.data;   // posterize lightly so it stays pixel art
  for (let i = 0; i < dd.length; i += 4) for (let k = 0; k < 3; k++) dd[i + k] = Math.min(255, Math.round(dd[i + k] / 10) * 10);
  x.putImageData(im, 0, 0);
  for (let y = 0; y < 256; y++) { let q = 0; while (q < 240 && dd[(y * 240 + q) * 4 + 3] < 128) q++; x.fillStyle = 'rgba(255,240,210,.35)'; x.fillRect(q + 4, y, 3, 1); }   // rim light down the left edge
  const out = mk(200, 240), xx = out.getContext('2d'); xx.drawImage(cv, -20, 0);
  return out;
}
// owner: a hand-built Q-version pixel bust in the shop sprite's design (big round head, sprite eyes, blunt bob, yellow shirt,
// green apron), painted with more tones: every material is a 5-step ramp lit from the top-left, shadows pooled under the
// fringe / chin / apron edge, a rim light down the left side, and a coloured outline.
const Q_LOOK = {
  hero_f: { skin: '#f8d6b8', hair: '#5a3424', top: '#f0c860', apron: '#3f8f74', female: true },
  hero_m: { skin: '#f4cca8', hair: '#2e2420', top: '#8cc0e0', apron: '#3f8f74', female: false },
};
function qPixelBust(id) {
  const L = Q_LOOK[id], G = new Grid(200, 240), cx = 100;
  const ramp5 = c => [shade(c, -44), shade(c, -24), c, shade(c, 18), shade(c, 34)];
  const litv = (x, y, lx, ly, rx, ry) => Math.max(-1, Math.min(1, -((x + .5 - lx) / rx) * .6 - ((y + .5 - ly) / ry) * .8 + .15));
  const pick5 = (R5, v) => R5[Math.max(0, Math.min(4, Math.floor((v + 1) / 2 * 5)))];
  const SK = ramp5(L.skin), HR = ramp5(L.hair), TP = ramp5(L.top), AP = ramp5(L.apron);
  // ---- back hair: big rounded bob (for the man: short, close to the head)
  if (L.female) {
    G.ell(cx, 100, 80, 78, (x, y) => pick5(HR, litv(x, y, cx - 40, 50, 90, 90) - .35));
    for (let y = 100; y < 176; y++) for (const sg of [-1, 1]) { const w = 80 - (y - 100) * .18; for (let x = cx + sg * (w - 26); sg < 0 ? x >= cx - w : x <= cx + w; x += sg) G.set(R(x), y, pick5(HR, (sg < 0 ? .1 : -.6) - (y - 100) / 160)); }
    for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) G.tri(cx + sg * (52 + i * 7), 172, cx + sg * (59 + i * 7), 172, cx + sg * (54 + i * 7), 180 - (i & 1) * 3, HR[1]);   // pointed lock ends
  } else G.ell(cx, 92, 72, 66, (x, y) => pick5(HR, litv(x, y, cx - 40, 50, 90, 90) - .3));
  // ---- body: small chibi shoulders, shirt, collar, apron bib with straps + pocket
  G.ell(cx, 236, 74, 56, (x, y) => pick5(TP, litv(x, y, cx - 50, 190, 90, 70)));
  G.rect(cx - 74, 236, 148, 4, TP[1]);
  G.rect(cx - 14, 166, 28, 22, SK[1]); G.rect(cx - 14, 166, 28, 6, SK[0]);   // neck, shadow under the chin
  G.tri(cx - 18, 182, cx, 200, cx - 34, 196, '#fff4dc'); G.tri(cx + 18, 182, cx, 200, cx + 34, 196, shade('#fff4dc', -12));   // collar
  G.rect(cx - 34, 202, 68, 38, (x, y) => pick5(AP, litv(x, y, cx - 26, 200, 60, 50)));
  for (const sx of [-1, 1]) for (let y = 182; y < 204; y++) G.rect(R(cx + sx * (30 + (204 - y) * .35)) - 3, y, 7, 1, sx < 0 ? AP[2] : AP[1]);   // straps
  G.rect(cx - 16, 216, 32, 18, AP[3]); for (let x = cx - 14; x < cx + 16; x += 3) { G.set(x, 218, '#ffffff'); G.set(x, 232, AP[4]); }   // pocket stitching
  for (const x of [cx - 20, cx + 18]) for (let y = 206; y < 240; y++) if (y % 9 < 6) G.set(x, y, AP[1]);   // apron folds
  // ---- face: wide round chibi face, soft chin; shade by hand (fringe shadow, right cheek, jaw)
  G.ell(cx, 118, 60, 54, SK[2]); G.ell(cx - 26, 104, 24, 18, (x, y) => SK.includes(G.get(x, y)) ? SK[3] : null); G.ell(cx - 30, 100, 10, 7, (x, y) => SK.includes(G.get(x, y)) ? SK[4] : null);   // soft light patch top-left
  G.ell(cx, 150, 40, 22, (x, y) => G.get(x, y) ? null : SK[2]);
  G.ell(cx, 96, 52, 8, (x, y) => SK.includes(G.get(x, y)) ? SK[1] : null);   // shadow the fringe throws
  for (let y = 80; y < 176; y++) { let r = -1; for (let x = cx; x < cx + 62; x++) if (SK.includes(G.get(x, y))) r = x; if (r > 0) for (let x = r - 6; x <= r; x++) if (SK.includes(G.get(x, y))) G.set(x, y, x > r - 2 ? SK[0] : SK[1]); }   // right cheek band
  for (let x = cx - 40; x < cx + 40; x++) { let b = -1; for (let y = 120; y < 176; y++) if (SK.includes(G.get(x, y))) b = y; if (b > 0) { G.set(x, b, SK[1]); G.set(x, b - 1, SK[1]); } }   // under the chin
  // ---- eyes in the sprite's design: tall rounded dark shape, iris in the lower half (3 tones), big catchlight top-right, small one bottom-left
  for (const ex of [cx - 26, cx + 26]) {
    const w = 18, h = 24, x0 = ex - w / 2, y0 = 104;
    G.rect(x0, y0, w, h, '#2a2028'); for (const [px_, py_] of [[x0, y0], [x0 + w - 1, y0], [x0, y0 + h - 1], [x0 + w - 1, y0 + h - 1]]) G.set(px_, py_, SK[2]);
    G.rect(x0 + 1, y0 + 10, w - 2, 5, '#5a3020'); G.rect(x0 + 1, y0 + 15, w - 2, 5, '#7a4628'); G.rect(x0 + 2, y0 + 20, w - 4, 3, '#b07848');
    G.rect(x0 + w - 9, y0 + 3, 6, 6, '#ffffff'); G.set(x0 + w - 4, y0 + 9, '#ffffff'); G.rect(x0 + 3, y0 + h - 7, 3, 3, '#e6def8');
    G.rect(x0 - 2, y0 - 2, w + 4, 3, '#2a2028');   // heavy upper lid
    if (L.female) { const out = ex < cx ? -1 : 1; G.rect(out < 0 ? x0 - 5 : x0 + w + 2, y0 - 3, 4, 2, '#2a2028'); G.set(out < 0 ? x0 - 6 : x0 + w + 5, y0 - 5, '#2a2028'); }
    for (let i = 0; i < w - 6; i++) G.set(x0 + 3 + i, y0 + h + 2, SK[1]);   // lower lid crease
  }
  for (const ex of [cx - 26, cx + 26]) G.rect(ex - 9, 94, 18, L.female ? 2 : 3, shade(L.hair, -10));   // short brows
  G.rect(cx + 2, 136, 2, 3, SK[0]);   // nose
  for (let dx = -6; dx <= 6; dx++) G.set(cx + dx, R(147 + (1 - (dx / 6) ** 2) * 1.6), Math.abs(dx) < 4 ? '#a85048' : '#c47a6c');   // small smile
  G.rect(cx - 3, 150, 6, 1, '#e8a090');
  for (const bx_ of [cx - 36, cx + 36]) G.ell(bx_, 138, 12, 5.5, (x, y) => { const c0 = G.get(x, y); if (!SK.includes(c0)) return null; const d = Math.sqrt(((x + .5 - bx_) / 12) ** 2 + ((y + .5 - 138) / 5.5) ** 2), a = Math.ceil((1 - d) * 4) / 4; return a > 0 ? mixHex(c0, '#f08c8c', a * .55) : null; });
  // ---- fringe: blunt bangs with small pointed tips (as on the sprite), crown, painted highlight band, strand lines
  if (L.female) {
    G.ell(cx, 70, 70, 46, (x, y) => y < 92 ? pick5(HR, litv(x, y, cx - 40, 40, 80, 50)) : null);
    for (let x = cx - 62; x < cx + 62; x += 9) G.tri(x, 88, x + 10, 88, x + 4, 98 + ((x / 9) & 1) * 3, pick5(HR, x < cx ? .2 : -.3));
    for (const sg of [-1, 1]) G.rect(cx + sg * 62 - (sg < 0 ? 0 : 12), 84, 12, 60, pick5(HR, sg < 0 ? 0 : -.6));   // side locks framing the face
  } else {
    G.ell(cx, 66, 66, 40, (x, y) => y < 86 ? pick5(HR, litv(x, y, cx - 40, 40, 80, 50)) : null);
    for (let x = cx - 58; x < cx + 56; x += 10) G.tri(x, 82, x + 11, 82, x + 4, 92, pick5(HR, x < cx ? .1 : -.3));
  }
  for (let a = -1; a <= 1; a += .025) { const x = R(cx - 6 + a * 46), y = R(52 + a * a * 14); for (let q = 0; q < 4; q++) if (HR.includes(G.get(x, y + q))) G.set(x, y + q, q < 2 ? HR[4] : HR[3]); }   // shine band
  for (const dx of [-34, -14, 10, 30]) for (let i = 0; i < 18; i++) { const x = R(cx + dx - i * .3), y = 62 + i; if (HR.includes(G.get(x, y))) G.set(x, y, HR[1]); }   // strands
  // ---- rim light down the left, then the coloured outline
  for (let y = 0; y < 240; y++) { let x = 0; while (x < 200 && !G.get(x, y)) x++; for (let k = 1; k < 3; k++) { const c = G.get(x + k, y); if (c && c !== '#2a2028') G.set(x + k, y, shade(c, 16)); } }
  colorOutline(G);
  return G.canvas();
}

// owner's dialogue bust = the shop sprite itself, refined: scale2x twice (crisp curves, no blur), then crisp painted shading
// in a few discrete steps by a global light from the top-left, painted hair shine, finer eyes, stepped blush, rim light
function qSpriteBust(id) {
  const spr = drawPersonHD(STD(STAFF_DEF[id]), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const rows = 62, g0 = new Grid(w, rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); }
  const s2x = g => { const o = new Grid(g.w * 2, g.h * 2); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C = g.get(x - 1, y), D = g.get(x, y + 1); o.set(x * 2, y * 2, C === A && C !== D && A !== B ? A : P); o.set(x * 2 + 1, y * 2, A === B && A !== C && B !== D ? B : P); o.set(x * 2, y * 2 + 1, D === C && D !== B && C !== A ? C : P); o.set(x * 2 + 1, y * 2 + 1, B === D && B !== A && D !== C ? D : P); } return o; };
  const g = s2x(s2x(g0)), W2 = g.w, H2 = g.h, src = g.d.slice();
  const def = STAFF_DEF[id], H = def.hair, dark = c => !c || c === HD_OUT || lum(c) < 45, isSkin = c => SKIN_SET.has(c), near = (c, ref) => c && Math.abs(lum(c) - lum(ref)) < 22 && rgbaOf(c)[0] - rgbaOf(ref)[0] < 40 && rgbaOf(ref)[0] - rgbaOf(c)[0] < 40;
  // 1) painted light: every non-outline pixel gets one of four steps from a global light (top-left), skin only two gentle steps
  let x0 = W2, x1 = 0; for (let i = 0; i < src.length; i++) if (src[i]) { const x = i % W2; x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const c = src[y * W2 + x]; if (dark(c)) continue;
    const v = -((x - x0) / (x1 - x0) - .45) * 1.2 - (y / H2 - .4) * .8 + ((x * 7 + y * 13) % 5 === 0 ? .06 : 0);   // a little texture so it reads as painted
    const k = isSkin(c) ? (v > .45 ? 6 : v < -.5 ? -8 : 0) : (v > .5 ? 16 : v > .1 ? 6 : v < -.55 ? -20 : v < -.2 ? -9 : 0);
    if (k) g.d[y * W2 + x] = shade(c, k);
  }
  // 2) occlusion: one darker row right under an overlap (fringe on the forehead, chin on the neck, apron edge)
  for (let y = 1; y < H2; y++) for (let x = 0; x < W2; x++) { const a = src[(y - 1) * W2 + x], b = src[y * W2 + x]; if (a && b && a !== b && !dark(a) && !dark(b) && isSkin(b) && !isSkin(a)) { g.d[y * W2 + x] = shade(g.d[y * W2 + x], -14); if (src[(y + 1) * W2 + x] === b) g.d[(y + 1) * W2 + x] = shade(g.d[(y + 1) * W2 + x], -7); } }
  // 3) painted hair shine: a crisp band of short vertical strokes along the crown
  let hTop = 0; for (; hTop < H2; hTop++) if (src.slice(hTop * W2, hTop * W2 + W2).some(c => near(c, H))) break;
  for (let a = -1; a <= 1; a += .03) { const x = R((x0 + x1) / 2 - 8 + a * (x1 - x0) * .3), y = R(hTop + 22 + a * a * 14); for (let q = 0; q < (R(a * 33) & 1 ? 6 : 4); q++) { const c = src[(y + q) * W2 + x]; if (near(c, H)) g.d[(y + q) * W2 + x] = shade(c, q < 2 ? 40 : 22); } }
  // 4) rim light down the left edge (skips the outline)
  for (let y = 0; y < H2; y++) { let x = 0; while (x < W2 && !g.get(x, y)) x++; for (let k = 2; k < 5; k++) { const c = g.get(x + k, y); if (c && !dark(c)) g.set(x + k, y, shade(c, 14)); } }
  const out = mk(200, 240), xx = out.getContext('2d'); xx.drawImage(g.canvas(), R((200 - W2) / 2), 0);
  return out;
}

// v1.20 (version A, chosen by the player): every named character's dialogue bust is the shop sprite itself, cropped to head
// and chest and enlarged 4x with nearest-neighbour — exactly the in-game pixels, just bigger
// v1.24 (version A, 精细线稿): the shop sprite, head + chest, but finer: the two-pixel outline becomes one dark pixel plus a soft
// coloured inner line, the shape is smoothed twice with scale2x (curves at 1-px steps instead of 4-px blocks), the outer line is
// thinned again at full size, and the face gets structure — eyes with lid, crease, iris gradient, pupil and catchlights, a nose
// with a shadow side, a two-tone mouth
function fineBust(id, plainFace, smooth) {   // smooth: round off the silhouette and the colour edges too (female owner)   // plainFace: keep the sprite's own eyes / nose / mouth exactly, only the pixels get finer
  const spr = drawPersonHD(STD(STAFF_DEF[id]), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const g0 = new Grid(w, 60), hx = (r, g_, b) => '#' + [r, g_, b].map(v => v.toString(16).padStart(2, '0')).join('');
  for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = hx(d[i], d[i + 1], d[i + 2]); }
  const at0 = (x, y) => g0.get(x, y), N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], isSk = c => SKIN_SET.has(c);
  // 1) eyes and mouth, found on the small sprite: eye = the darkest block inside the face, mouth = reddish pixels below the eyes
  const EYE = '#2a2028', eyes = [], seen = new Set();
  for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) {
    if (seen.has(y * w + x) || at0(x, y) !== EYE) continue;
    const st = [[x, y]], px_ = []; seen.add(y * w + x);
    while (st.length) { const [a, b] = st.pop(); px_.push([a, b]); for (const [dx, dy] of N4) { const k = (b + dy) * w + a + dx; if (!seen.has(k) && at0(a + dx, b + dy) === EYE) { seen.add(k); st.push([a + dx, b + dy]); } } }
    if (px_.length < 3 || px_.length >= 60 || !px_.some(([a, b]) => N4.some(([dx, dy]) => isSk(at0(a + dx, b + dy)) || at0(a + dx, b + dy) === '#ffffff'))) continue;
    const xs = px_.map(q => q[0]), ys = px_.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs); let y1 = Math.max(...ys), iris = null;
    const rowHasEye = yy => { for (let i = x0; i <= x1; i++) { const c = at0(i, yy); if (c && !isSk(c) && c !== '#ffffff') return true; } return false; };
    while (y1 + 1 < 60 && rowHasEye(y1 + 1) && y1 - Math.min(...ys) < 8) { y1++; for (let i = x0; i <= x1; i++) { const c = at0(i, y1); if (!iris && c && !isSk(c) && lum(c) > 40 && lum(c) < 150) iris = c; } }
    eyes.push({ x0, x1, y0: Math.min(...ys), y1, iris: iris || '#6a4030' });
  }
  eyes.sort((a, b) => a.x0 - b.x0); if (eyes.length > 2) eyes.splice(2);
  let mouth = null; const eyeB = eyes.length ? Math.max(...eyes.map(e => e.y1)) : 0;
  if (eyes.length) for (let y = eyeB + 1; y < eyeB + 9; y++) for (let x = eyes[0].x0; x <= eyes[eyes.length - 1].x1; x++) {
    const c = at0(x, y); if (!c) continue; const [r, g_, b] = rgbaOf(c);
    if (r > g_ + 45 && r > b + 30 && lum(c) < 170 && lum(c) > 60) mouth = mouth ? { x0: Math.min(mouth.x0, x), x1: Math.max(mouth.x1, x), y0: Math.min(mouth.y0, y), y1: Math.max(mouth.y1, y), c: mouth.c } : { x0: x, x1: x, y0: y, y1: y, c };
  }
  // 2) thin the outline on the small sprite: the inner of its two dark pixels becomes a soft tone of what it borders
  const dk = c => c && lum(c) < 62, outerPx = (x, y) => dk(at0(x, y)) && N4.some(([dx, dy]) => !at0(x + dx, y + dy)), fix = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) {
    const c = at0(x, y); if (!dk(c) || outerPx(x, y) || !N4.some(([dx, dy]) => outerPx(x + dx, y + dy))) continue;
    if (eyes.some(e => x >= e.x0 - 1 && x <= e.x1 + 1 && y >= e.y0 - 1 && y <= e.y1 + 1)) continue;
    let inn = null; for (const [dx, dy] of N4) { const n = at0(x + dx, y + dy); if (n && !dk(n)) { inn = n; break; } }
    if (inn) fix.push([x, y, mixHex(shade(inn, -26), c, .25)]);
  }
  for (const [x, y, c] of fix) g0.set(x, y, c);
  // 3) smooth: scale2x twice
  const s2x = g => { const o = new Grid(g.w * 2, g.h * 2); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const P = g.get(x, y), A = g.get(x, y - 1), B = g.get(x + 1, y), C_ = g.get(x - 1, y), D = g.get(x, y + 1); o.set(x * 2, y * 2, C_ === A && C_ !== D && A !== B ? A : P); o.set(x * 2 + 1, y * 2, A === B && A !== C_ && B !== D ? B : P); o.set(x * 2, y * 2 + 1, D === C_ && D !== B && C_ !== A ? C_ : P); o.set(x * 2 + 1, y * 2 + 1, B === D && B !== A && D !== C_ ? D : P); } return o; };
  const g = s2x(s2x(g0)), W2 = g.w, H2 = g.h;
  if (smooth) {   // 1) silhouette: blur the shape mask a little and threshold it, so steps become curves; new edge pixels take the nearest colour
    const M = new Uint8Array(W2 * H2); for (let k = 0; k < M.length; k++) M[k] = g.d[k] ? 1 : 0;
    const SA = new Float64Array((W2 + 1) * (H2 + 1)); for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) SA[(y + 1) * (W2 + 1) + x + 1] = M[y * W2 + x] + SA[y * (W2 + 1) + x + 1] + SA[(y + 1) * (W2 + 1) + x] - SA[y * (W2 + 1) + x];   // summed-area table
    const sum = (x, y, r) => { const x0 = Math.max(0, x - r), y0 = Math.max(0, y - r), x1 = Math.min(W2, x + r + 1), y1 = Math.min(H2, y + r + 1); return (SA[y1 * (W2 + 1) + x1] - SA[y0 * (W2 + 1) + x1] - SA[y1 * (W2 + 1) + x0] + SA[y0 * (W2 + 1) + x0]) / ((2 * r + 1) ** 2); };
    const old = g.d.slice();
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const k = y * W2 + x, f = sum(x, y, 7), in_ = f >= .5;
      if (in_ && !old[k]) { let c = null; for (let r = 1; r < 10 && !c; r++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const n = old[(y + dy * r) * W2 + x + dx * r]; if (n && x + dx * r >= 0 && x + dx * r < W2) { c = n; break; } } g.d[k] = c; }
      else if (!in_ && old[k] && y < H2 - 10) g.d[k] = null; }
    // 2) colour edges: a 3x3 majority pass (twice) clears lone stair-step pixels; the eyes and mouth are left alone
    const keep = (x, y) => eyes.some(e => x >= e.x0 * 4 - 3 && x <= (e.x1 + 1) * 4 + 3 && y >= e.y0 * 4 - 4 && y <= (e.y1 + 1) * 4 + 3) || (mouth && x >= mouth.x0 * 4 - 3 && x <= (mouth.x1 + 1) * 4 + 3 && y >= mouth.y0 * 4 - 3 && y <= (mouth.y1 + 1) * 4 + 3);
    for (let pass = 0; pass < 3; pass++) { const cur = g.d.slice();   // 5x5 majority: a pixel that is a small minority around it takes the main colour there
      for (let y = 2; y < H2 - 2; y++) for (let x = 2; x < W2 - 2; x++) { const k = y * W2 + x, c = cur[k]; if (!c || keep(x, y)) continue; const cnt = new Map(); for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const n = cur[k + j * W2 + i]; if (n) cnt.set(n, (cnt.get(n) || 0) + 1); }
        if ((cnt.get(c) || 0) <= 8) { let best = c, bn = 0; for (const [col, n] of cnt) if (n > bn) { best = col; bn = n; } if (bn >= 13) g.d[k] = best; } } }
  }
  const src = g.d.slice(), at = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H2 ? null : src[y * W2 + x];
  // 4) outer line: keep 2 px of it (tinted with the colour inside, not black); the rest takes a soft tone of the inside
  const dT = new Int16Array(W2 * H2).fill(99), q = [];
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) if (dk(at(x, y)) && N4.some(([dx, dy]) => !at(x + dx, y + dy))) { dT[y * W2 + x] = 1; q.push(y * W2 + x); }
  for (let i = 0; i < q.length; i++) { const k = q[i], x = k % W2, y = (k - x) / W2; if (dT[k] >= 4) continue; for (const [dx, dy] of N4) { const X = x + dx, Y = y + dy; if (X < 0 || X >= W2 || Y < 0 || Y >= H2) continue; const nk = Y * W2 + X; if (dT[nk] === 99 && dk(src[nk])) { dT[nk] = dT[k] + 1; q.push(nk); } } }
  const innerOf = (x, y) => { for (let r = 1; r < 5; r++) for (const [dx, dy] of N4) { const n = at(x + dx * r, y + dy * r); if (n && !dk(n)) return n; } return null; };
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const k = y * W2 + x, t = dT[k]; if (t === 99) continue; const inn = innerOf(x, y); if (!inn) continue;
    g.d[k] = t <= 2 ? mixHex(shade(inn, -78), '#2a1d26', .45) : mixHex(shade(inn, -26), src[k], .2); }
  if (plainFace) { const o = mk(200, 240), xx = o.getContext('2d'); xx.drawImage(g.canvas(), R((200 - W2) / 2), 0); return o; }
  // 5) face structure, drawn at full size inside each eye box (4x the sprite box)
  const S = 4, setp = (x, y, c) => { if (x >= 0 && y >= 0 && x < W2 && y < H2 && g.d[y * W2 + x]) g.d[y * W2 + x] = c; };
  const cxFace = eyes.length === 2 ? (eyes[0].x1 + eyes[1].x0 + 1) / 2 * S : W2 / 2;
  for (const e of eyes) {
    const X0 = e.x0 * S, X1 = (e.x1 + 1) * S - 1, Y0 = e.y0 * S, Y1 = (e.y1 + 1) * S - 1, ew = X1 - X0 + 1, eh = Y1 - Y0 + 1, outward = (X0 + X1) / 2 < cxFace ? -1 : 1;
    const I = e.iris, ramp = [shade(I, -20), shade(I, -10), I, shade(I, 10), shade(I, 22), shade(I, 36)];
    for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
      const u = (x - X0) / (ew - 1), v = (y - Y0) / (eh - 1); if ((u < .12 || u > .88) && (v < .1 || v > .9)) continue;
      let c = ramp[Math.min(5, Math.floor(v * 6))]; if (u < .08 || u > .92) c = shade(c, -18);   // iris: dark at the top, lit at the bottom, darker rim
      const pu = (x - (X0 + ew * .5)) / (ew * .2), pv = (y - (Y0 + eh * .46)) / (eh * .22); if (pu * pu + pv * pv < 1) c = mixHex('#1a1014', c, .15);   // pupil
      setp(x, y, c);
    }
    const hw = Math.max(3, R(ew * .32)), hh = Math.max(3, R(eh * .26)), hiX = outward < 0 ? X0 + R(ew * .55) : X0 + R(ew * .2);   // big catchlight, small one low on the other side
    for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) if (!((x === 0 || x === hw - 1) && (y === 0 || y === hh - 1))) setp(hiX + x, Y0 + R(eh * .14) + y, '#ffffff');
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) setp((outward < 0 ? X0 + R(ew * .2) : X0 + R(ew * .66)) + x, Y0 + R(eh * .7) + y, '#e6def8');
    setp(outward < 0 ? X0 + R(ew * .74) : X0 + R(ew * .4), Y0 + R(eh * .5), '#ffffff');
    for (let y = Y0 - 2; y < Y0 + 1; y++) for (let x = X0 - (outward < 0 ? 2 : 1); x <= X1 + (outward > 0 ? 2 : 1); x++) setp(x, y, '#24161c');   // upper lid, sitting on top of the eye (not over it)
    for (let i = 0; i < 3; i++) setp(outward < 0 ? X0 - 3 - i : X1 + 3 + i, Y0 - 2 - i, '#24161c');   // flick at the outer corner
    const sk = at(X0 + R(ew / 2), Y0 - 7) || '#f6d2b0'; if (isSk(sk)) for (let x = X0 + 2; x <= X1 - 1; x++) setp(x + outward, Y0 - 6 + (Math.abs(x - (X0 + X1) / 2) > ew * .35 ? 1 : 0), shade(sk, -22));   // eyelid crease
    for (let x = X0 + 4; x <= X1 - 4; x++) setp(x, Y1 + 1, '#a8706a');   // lower lash line, short
  }
  if (eyes.length === 2) {   // nose: a shadow on its far side, a light on the tip
    const nx = R(cxFace), ny = (eyeB + 1) * S + 5, sk = at(nx, ny) || '#f6d2b0';
    if (isSk(sk)) { for (let y = 0; y < 5; y++) setp(nx + 2, ny + y, shade(sk, -26)); setp(nx + 1, ny + 5, shade(sk, -32)); setp(nx, ny + 5, shade(sk, -20)); setp(nx - 1, ny + 1, shade(sk, 10)); }
  }
  if (mouth) {   // mouth: a darker parting line, the upper lip, a lighter lower lip, soft corners
    const X0 = mouth.x0 * S, X1 = (mouth.x1 + 1) * S - 1, Y0 = mouth.y0 * S + 1, L = mouth.c;
    for (let x = X0; x <= X1; x++) { const edge = x - X0 < 2 || X1 - x < 2; setp(x, Y0, edge ? shade(L, 8) : shade(L, -18)); setp(x, Y0 + 1, edge ? shade(L, 14) : shade(L, -34)); if (!edge) { setp(x, Y0 + 2, L); setp(x, Y0 + 3, x - X0 > 3 && X1 - x > 3 ? mixHex(L, '#ffd8d0', .45) : shade(L, 16)); } }
  }
  const o = mk(200, 240), xx = o.getContext('2d'); xx.drawImage(g.canvas(), R((200 - W2) / 2), 0); return o;
}
// v1.26 owner's dialogue bust: the old version A (the shop sprite, 4x pixel blocks) with a little realism on top — soft shading on the
// face (under the fringe, the far cheek, the jaw, the neck), eyes with whites at the corners, lid, crease, iris and pupil, a nose
// with a shadow side and nostril, lips in two tones, a few lighter strands in the hair. Other characters keep version A.
function ownerBust(id) {
  const spr = drawPersonHD(STD(STAFF_DEF[id]), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const g0 = new Grid(w, 60), hx = (r, g_, b) => '#' + [r, g_, b].map(v => v.toString(16).padStart(2, '0')).join('');
  for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) { const i = ((top + y) * w + x) * 4; if (y + top < h && d[i + 3] > 128) g0.d[y * w + x] = hx(d[i], d[i + 1], d[i + 2]); }
  const at0 = (x, y) => g0.get(x, y), N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], isSk = c => SKIN_SET.has(c), def = STAFF_DEF[id];
  // find the eyes, the mouth and the face box on the small sprite
  const EYE = '#2a2028', eyes = [], seen = new Set();
  for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) {
    if (seen.has(y * w + x) || at0(x, y) !== EYE) continue;
    const st = [[x, y]], px_ = []; seen.add(y * w + x);
    while (st.length) { const [a, b] = st.pop(); px_.push([a, b]); for (const [dx, dy] of N4) { const k = (b + dy) * w + a + dx; if (!seen.has(k) && at0(a + dx, b + dy) === EYE) { seen.add(k); st.push([a + dx, b + dy]); } } }
    if (px_.length < 3 || px_.length >= 60 || !px_.some(([a, b]) => N4.some(([dx, dy]) => isSk(at0(a + dx, b + dy)) || at0(a + dx, b + dy) === '#ffffff'))) continue;
    const xs = px_.map(q => q[0]), ys = px_.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs); let y1 = Math.max(...ys), iris = null;
    const rowHas = yy => { for (let i = x0; i <= x1; i++) { const c = at0(i, yy); if (c && !isSk(c) && c !== '#ffffff') return true; } return false; };
    while (y1 + 1 < 60 && rowHas(y1 + 1) && y1 - Math.min(...ys) < 8) { y1++; for (let i = x0; i <= x1; i++) { const c = at0(i, y1); if (!iris && c && !isSk(c) && lum(c) > 40 && lum(c) < 150) iris = c; } }
    eyes.push({ x0, x1, y0: Math.min(...ys), y1, iris: iris || '#6a4030' });
  }
  eyes.sort((a, b) => a.x0 - b.x0); if (eyes.length > 2) eyes.splice(2);
  if (eyes.length === 2) { const hgt = Math.min(eyes[0].y1 - eyes[0].y0, eyes[1].y1 - eyes[1].y0); for (const e of eyes) e.y1 = e.y0 + hgt; }   // both eyes the same height
  const eyeB = eyes.length ? Math.max(...eyes.map(e => e.y1)) : 0; let mouth = null;
  if (eyes.length) for (let y = eyeB + 1; y < eyeB + 9; y++) for (let x = eyes[0].x0; x <= eyes[eyes.length - 1].x1; x++) {
    const c = at0(x, y); if (!c) continue; const [r, g_, b] = rgbaOf(c);
    if (r > g_ + 45 && r > b + 30 && lum(c) < 170 && lum(c) > 60) mouth = mouth ? { x0: Math.min(mouth.x0, x), x1: Math.max(mouth.x1, x), y0: Math.min(mouth.y0, y), y1: Math.max(mouth.y1, y), c: mouth.c } : { x0: x, x1: x, y0: y, y1: y, c };
  }
  // version A: 4x blocks
  const S = 4, W2 = w * S, H2 = 60 * S, g = new Grid(W2, H2);
  for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) { const c = at0(x, y); if (c) for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) g.d[(y * S + j) * W2 + x * S + i] = c; }
  const src = g.d.slice(), at = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H2 ? null : src[y * W2 + x], setp = (x, y, c) => { if (x >= 0 && y >= 0 && x < W2 && y < H2 && g.d[y * W2 + x]) g.d[y * W2 + x] = c; };
  // face box: skin from the eyes down to the chin (per column)
  const fx0 = eyes.length ? (eyes[0].x0 - 3) * S : 0, fx1 = eyes.length ? (eyes[eyes.length - 1].x1 + 4) * S : W2, cx = eyes.length === 2 ? (eyes[0].x1 + eyes[1].x0 + 1) / 2 * S : W2 / 2;
  // 1) soft shading on the skin: under the fringe, far cheek, jaw; the neck under the chin
  for (let x = fx0; x < fx1; x++) {
    let yTop = -1, yBot = -1; for (let y = 0; y < H2; y++) { if (isSk(at(x, y))) { if (yTop < 0 && y > (eyes.length ? eyes[0].y0 * S - 24 : 0)) yTop = y; if (yTop >= 0) yBot = y; } else if (yTop >= 0 && y > yBot + 6) break; }
    if (yTop < 0) continue;
    for (let y = yTop; y <= yBot; y++) { const c = at(x, y); if (!isSk(c)) continue; let k = 0;
      if (y - yTop < 6) k -= [14, 11, 8, 6, 4, 2][y - yTop];   // shadow of the fringe
      const u = (x - fx0) / (fx1 - fx0); if (u > .78) k -= u > .9 ? 12 : u > .84 ? 8 : 4; else if (u < .14) k += 4;   // far cheek in shade, near cheek lit
      if (yBot - y < 4 && y > (eyeB + 4) * S) k -= 8;   // under the jaw
      if (k) setp(x, y, shade(c, k)); }
  }
  // 2) eyes: whites at the corners, iris with a gradient, pupil, catchlights, lid + crease, lower lid
  for (const e of eyes) {
    const X0 = e.x0 * S, X1 = (e.x1 + 1) * S - 1, Y0 = e.y0 * S, Y1 = (e.y1 + 1) * S - 1, ew = X1 - X0 + 1, eh = Y1 - Y0 + 1, out = (X0 + X1) / 2 < cx ? -1 : 1;
    const I = e.iris, ramp = [shade(I, -34), shade(I, -22), shade(I, -10), I, shade(I, 14), shade(I, 28)], ix0 = X0 + 2, ix1 = X1 - 2;
    for (let y = Y0 + 2; y <= Y1 - 1; y++) for (let x = X0; x <= X1; x++) {
      const v = (y - Y0) / eh;
      if (x < ix0 || x > ix1) { if (!isSk(at(x, y)) && v > .2 && v < .9) setp(x, y, v > .75 ? '#e6d8d2' : '#f6f0ec'); continue; }   // a sliver of white at each corner
      let c = ramp[Math.min(5, Math.floor(v * 6))]; const pr = Math.min(ix1 - ix0, eh) * .2, pu = (x + .5 - (ix0 + ix1 + 1) / 2) / pr, pv = (y + .5 - (Y0 + eh * .52)) / pr; if (pu * pu + pv * pv < 1) c = '#1c1216'; else if (pu * pu + pv * pv < 1.8) c = shade(c, -14); setp(x, y, c);   // round pupil with a darker ring round it
    }
    for (let x = ix0; x <= ix1; x++) { setp(x, Y1, shade(I, 30)); }   // lit lower rim of the iris
    const hxp = out < 0 ? ix0 + R((ix1 - ix0) * .55) : ix0 + R((ix1 - ix0) * .15); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) if (!((x === 0 || x === 2) && (y === 0 || y === 2))) setp(hxp + x, Y0 + R(eh * .3) + y, '#ffffff');
    setp(out < 0 ? ix0 + 2 : ix1 - 2, Y1 - 3, '#ffffff');
    for (let y = Y0; y < Y0 + 2; y++) for (let x = X0 - 3; x <= X1 + 3; x++) setp(x, y, '#20141a');   // upper lid line
    for (let i = 1; i <= 2; i++) setp(out < 0 ? X0 - 3 - i : X1 + 3 + i, Y0 - i + 1, '#20141a');
    const sk = at(R((X0 + X1) / 2), Y0 - 6); if (isSk(sk)) for (let x = X0 - 1; x <= X1 + 1; x++) setp(x, Y0 - 4 + (Math.abs(x - (X0 + X1) / 2) > ew * .45 ? 1 : 0), shade(sk, -18));   // crease
    for (let x = X0; x <= X1; x++) { const c = at(x, Y1 + 2); if (isSk(c)) setp(x, Y1 + 2, shade(c, x > X0 + 2 && x < X1 - 2 ? -14 : -7)); }   // soft lower lid
  }
  // 3) nose: shadow down the far side, a nostril, light on the bridge and tip
  if (eyes.length === 2) {
    const nx = R(cx), ny0 = eyeB * S + 4, ny1 = (eyeB + 3) * S + 1, sk = at(nx, ny1) || '#f6d2b0';
    if (isSk(sk)) { for (let y = ny0; y <= ny1; y++) setp(nx + 3, y, shade(sk, -12 - (y - ny0))); for (let x = nx - 2; x <= nx + 3; x++) setp(x, ny1 + 1, shade(sk, -16)); setp(nx + 2, ny1, shade(sk, -34)); setp(nx - 2, ny1, shade(sk, -26)); setp(nx, ny1 - 2, shade(sk, 12)); setp(nx, ny1 - 3, shade(sk, 8)); }
  }
  // 4) mouth: parting line, upper lip, lower lip with a light, soft corners; a little shadow under the lower lip
  if (mouth) {
    const X0 = mouth.x0 * S - 2, X1 = (mouth.x1 + 1) * S + 1, Y0 = mouth.y0 * S, L = mouth.c;
    for (let x = X0; x <= X1; x++) { const e = Math.min(x - X0, X1 - x), sk = at(x, Y0 - 1) || '#f6d2b0';
      if (e < 2) { setp(x, Y0 + 1, shade(L, -10)); continue; }
      setp(x, Y0, mixHex(L, sk, .35)); setp(x, Y0 + 1, shade(L, -30)); setp(x, Y0 + 2, L); setp(x, Y0 + 3, e > 4 ? mixHex(L, '#ffd8d0', .4) : shade(L, 10)); const u = at(x, Y0 + 5); if (isSk(u)) setp(x, Y0 + 5, shade(u, -10)); }
  }
  // 5) hair: a few lighter strands running down, so it reads as hair rather than blocks
  const HC = def.hair, isH = c => c && Math.abs(lum(c) - lum(HC)) < 34 && !isSk(c);
  let hx0 = W2, hx1 = 0, hy0 = H2; for (let k = 0; k < src.length; k++) if (isH(src[k])) { const x = k % W2, y = (k - x) / W2; hx0 = Math.min(hx0, x); hx1 = Math.max(hx1, x); hy0 = Math.min(hy0, y); }
  for (let s = 0; s < 14; s++) { let x = hx0 + 6 + R(mhash(s, 5) * (hx1 - hx0 - 12)), y = hy0 + 6 + R(mhash(s, 6) * 20); const len = 14 + R(mhash(s, 7) * 18), dir = x < (hx0 + hx1) / 2 ? -.25 : .25;
    for (let i = 0; i < len; i++) { const X = R(x + i * dir), Y = y + i, c = at(X, Y); if (!isH(c)) break; setp(X, Y, shade(c, i < len / 3 ? 22 : 12)); } }
  const o = mk(200, 240), xx = o.getContext('2d'); xx.drawImage(g.canvas(), R((200 - W2) / 2), 0); return o;
}
function spriteBustA(id) {
  const spr = drawPersonHD(STD(STAFF_DEF[id]), false, 0), w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const out = mk(200, 240), c = out.getContext('2d'); c.imageSmoothingEnabled = false;
  c.drawImage(spr, 0, top, w, 60, R((200 - w * 4) / 2), 0, w * 4, 240);
  return out;
}
const guestBust = ci => spriteBust(GUEST_HD[ci].SE[0], 'g' + ci);
function spriteBust(spr, k) {   // anyone's dialogue bust from their shop sprite: upper body at 4x (same as spriteBustA)
  if (BUST_CACHE[k]) return BUST_CACHE[k];
  const w = spr.width, h = spr.height, d = spr.getContext('2d').getImageData(0, 0, w, h).data;
  let top = 0; outer: for (; top < h; top++) for (let x = 0; x < w; x++) if (d[(top * w + x) * 4 + 3] > 0) break outer;
  const out = mk(200, 240), c = out.getContext('2d'); c.imageSmoothingEnabled = false;
  c.drawImage(spr, 0, top, w, 60, R((200 - w * 4) / 2), 0, w * 4, 240);
  return (BUST_CACHE[k] = out);
}
const Q_BUST = { hero_f: true, hero_m: true };   // the owner's dialogue bust: the shop sprite, refined
function realBust(id) { return Q_BUST[id] ? qSpriteBust(id) : REAL_BUST[id](id); }
