// temp: owner (hero_f) semi-realistic bust, three renderings (not shipped)
(function () {
  const S = 400, H = 480;
  const P = {
    skin: ['#c98a68', '#e3ad88', '#f0c4a0', '#f8d8bc', '#fde8d6'], hair: ['#2e1a12', '#422618', '#5a3424', '#74462e', '#94603e'],
    shirt: ['#b88a2a', '#d9a83c', '#f0c860', '#f8dc8c', '#fff0c0'], apron: ['#245a48', '#2f7560', '#3f8f74', '#58a88a', '#7cc4a6'],
    lip: ['#a8504a', '#c86a60', '#dc8a7c'], eye: ['#2a1810', '#4a2c1c', '#6a4030', '#8a5a3c'], white: ['#e8ddd2', '#f6efe8', '#ffffff'], misc: ['#4a2a20', '#fff4dc', '#e8c060'],
  };
  function draw(c, line) {   // one drawing at 400 x 480, light from the top-left
    const L = (a, b, stops, x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
    const pathFill = (pts, fill, close = true) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 6) c.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]); if (close) c.closePath(); c.fillStyle = fill; c.fill(); if (line) { c.strokeStyle = 'rgba(74,42,32,.75)'; c.lineWidth = line; c.stroke(); } };
    // back hair (bob, curls in at the jaw)
    pathFill([200, 64, 120, 60, 92, 120, 96, 200, 98, 250, 104, 290, 124, 306, 150, 314, 170, 300, 176, 280, 230, 300, 250, 300, 262, 314, 300, 306, 300, 290, 300, 250, 306, 190, 306, 110, 262, 76, 245, 64, 222, 62, 200, 64], L(0, 0, [P.hair[3], P.hair[2], P.hair[1]], 100, 80, 300, 300));
    // shoulders + shirt
    pathFill([200, 318, 140, 322, 80, 338, 52, 372, 30, 400, 22, 440, 18, 480, 140, 480, 260, 480, 382, 480, 378, 440, 370, 400, 348, 372, 320, 338, 260, 322, 200, 318], L(0, 0, [P.shirt[3], P.shirt[2], P.shirt[1]], 40, 330, 360, 480));
    c.fillStyle = 'rgba(120,80,20,.18)'; c.beginPath(); c.moveTo(300, 340); c.bezierCurveTo(340, 360, 370, 400, 380, 480); c.lineTo(320, 480); c.bezierCurveTo(320, 420, 310, 380, 300, 340); c.fill();   // shade on the right shoulder
    // neck
    pathFill([172, 240, 172, 270, 170, 300, 166, 326, 190, 336, 214, 336, 236, 326, 230, 300, 228, 270, 228, 240, 200, 240, 172, 240], L(0, 0, [P.skin[2], P.skin[1]], 170, 260, 230, 300));
    c.fillStyle = 'rgba(160,90,60,.35)'; c.beginPath(); c.ellipse(200, 268, 32, 18, 0, 0, Math.PI); c.fill();   // shadow under the chin
    // collar (pointed, lighter)
    pathFill([166, 318, 160, 334, 150, 352, 136, 372, 160, 372, 186, 360, 200, 344, 190, 336, 176, 326, 166, 318], P.shirt[4]);
    pathFill([234, 318, 240, 334, 250, 352, 264, 372, 240, 372, 214, 360, 200, 344, 210, 336, 224, 326, 234, 318], P.shirt[3]);
    // apron bib + straps
    pathFill([126, 400, 150, 396, 250, 396, 274, 400, 278, 440, 282, 480, 200, 480, 118, 480, 122, 440, 126, 400], L(0, 0, [P.apron[3], P.apron[2], P.apron[1]], 120, 400, 280, 480));
    c.fillStyle = P.apron[1]; c.beginPath(); c.moveTo(126, 402); c.lineTo(110, 330); c.lineTo(126, 326); c.lineTo(142, 400); c.fill(); c.beginPath(); c.moveTo(274, 402); c.lineTo(290, 330); c.lineTo(274, 326); c.lineTo(258, 400); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeRect(170, 430, 60, 36); c.setLineDash([]);   // pocket stitching
    // face
    pathFill([200, 96, 160, 96, 128, 124, 126, 168, 124, 200, 128, 228, 138, 248, 152, 268, 174, 284, 200, 286, 226, 284, 248, 268, 262, 248, 272, 228, 276, 200, 274, 168, 272, 124, 240, 96, 200, 96], L(0, 0, [P.skin[3], P.skin[2], P.skin[1]], 140, 140, 290, 270));
    const blush = (x, y) => { const g = c.createRadialGradient(x, y, 0, x, y, 22); g.addColorStop(0, 'rgba(240,120,110,.32)'); g.addColorStop(1, 'rgba(240,120,110,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); };
    blush(156, 236); blush(246, 236);
    c.fillStyle = 'rgba(170,100,70,.22)'; c.beginPath(); c.moveTo(262, 170); c.bezierCurveTo(276, 210, 268, 250, 236, 278); c.bezierCurveTo(254, 240, 262, 210, 252, 170); c.fill();   // cheek shade on the right
    // brows
    const brow = (x0, y0, x1, y1, x2, y2, w) => { c.strokeStyle = P.hair[1]; c.lineCap = 'round'; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke(); };
    brow(144, 182, 162, 170, 184, 176, 5); brow(256, 182, 238, 170, 216, 176, 5);
    // eyes: almond, upper lid line, iris with ring + pupil + catchlight, crease, lashes at the outer corner
    const eye = (cx, flip) => {
      const y = 204, w = 21;
      c.save(); c.beginPath(); c.moveTo(cx - w, y); c.quadraticCurveTo(cx, y - 15, cx + w, y); c.quadraticCurveTo(cx, y + 11, cx - w, y); c.closePath(); c.fillStyle = P.white[1]; c.fill(); c.clip();
      c.fillStyle = P.eye[2]; c.beginPath(); c.arc(cx + 1 * flip, y - 1, 9.5, 0, 7); c.fill(); c.fillStyle = P.eye[3]; c.beginPath(); c.arc(cx + 1 * flip, y + 2, 6, 0, Math.PI); c.fill();
      c.fillStyle = P.eye[0]; c.beginPath(); c.arc(cx + 1 * flip, y - 1, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(60,30,20,.35)'; c.fillRect(cx - w, y - 12, w * 2, 6);   // lid shadow
      c.restore();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx - 3, y - 5, 2.6, 0, 7); c.fill();
      c.strokeStyle = P.eye[0]; c.lineWidth = 3.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - w - 1, y + 1); c.quadraticCurveTo(cx, y - 16, cx + w + 2, y - 1); c.stroke();
      c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx + flip * (w + 1), y - 1); c.lineTo(cx + flip * (w + 6), y - 5); c.stroke();
      c.strokeStyle = 'rgba(150,90,70,.55)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx - w + 4, y - 9); c.quadraticCurveTo(cx, y - 20, cx + w - 2, y - 9); c.stroke();   // crease
      c.strokeStyle = 'rgba(150,90,70,.4)'; c.beginPath(); c.moveTo(cx - w + 6, y + 6); c.quadraticCurveTo(cx, y + 11, cx + w - 4, y + 5); c.stroke();   // lower lid
    };
    eye(163, -1); eye(237, 1);
    // nose: soft shadow on the right of the bridge, tip highlight, small nostrils
    c.fillStyle = 'rgba(170,100,70,.3)'; c.beginPath(); c.moveTo(206, 206); c.bezierCurveTo(214, 222, 216, 236, 212, 244); c.lineTo(206, 244); c.bezierCurveTo(210, 232, 208, 220, 204, 206); c.fill();
    c.fillStyle = 'rgba(255,240,225,.35)'; c.beginPath(); c.ellipse(200, 236, 4, 2.5, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(130,70,50,.6)'; c.beginPath(); c.ellipse(192, 246, 3.5, 2, .3, 0, 7); c.fill(); c.beginPath(); c.ellipse(209, 246, 3.5, 2, -.3, 0, 7); c.fill();
    // mouth: soft smile, upper lip darker, lower lip with a highlight
    c.fillStyle = P.lip[1]; c.beginPath(); c.moveTo(182, 264); c.quadraticCurveTo(192, 258, 200, 261); c.quadraticCurveTo(208, 258, 218, 264); c.quadraticCurveTo(200, 268, 182, 264); c.fill();
    c.fillStyle = P.lip[2]; c.beginPath(); c.moveTo(184, 265); c.quadraticCurveTo(200, 268, 216, 265); c.quadraticCurveTo(200, 278, 184, 265); c.fill();
    c.strokeStyle = P.lip[0]; c.lineWidth = 1.6; c.beginPath(); c.moveTo(180, 263); c.quadraticCurveTo(200, 269, 220, 263); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(196, 270, 8, 2);
    // fringe: side-swept from a part on the left, uneven ends, a shine band and strands
    pathFill([128, 175, 118, 118, 152, 82, 205, 80, 258, 78, 292, 112, 284, 184, 266, 174, 244, 152, 214, 146, 192, 143, 174, 140, 162, 150, 150, 158, 138, 168, 128, 175], L(0, 0, [P.hair[3], P.hair[2], P.hair[1]], 140, 80, 280, 180));
    pathFill([128, 170, 116, 210, 118, 250, 128, 290, 116, 270, 106, 230, 108, 190, 112, 150, 124, 130, 128, 170], P.hair[2]);
    pathFill([272, 150, 286, 200, 284, 250, 276, 292, 292, 270, 300, 230, 296, 190, 292, 150, 280, 120, 272, 150], P.hair[1]);
    c.strokeStyle = 'rgba(200,140,100,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(196, 150, 70, 3.6, 4.5); c.stroke();
    c.strokeStyle = 'rgba(30,16,10,.35)'; c.lineWidth = 1.5; for (const [a, b, d] of [[150, 100, 170], [180, 92, 200], [220, 94, 214], [250, 104, 236], [268, 124, 262]]) { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo((a + d) / 2 + 8, b + 22, d + 14, b + 44); c.stroke(); }
    c.fillStyle = P.misc[2]; c.beginPath(); c.arc(276, 252, 3, 0, 7); c.fill();   // small gold earring peeking out
  }
  // palette-quantise a canvas (with optional ordered dither) -> pixel art
  const ALL = Object.values(P).flat().map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), h]);
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function pixelise(src, w, h, dither) {
    const t = mk(w, h), x = t.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h);
    const im = x.getImageData(0, 0, w, h), d = im.data, g = new Grid(w, h);
    for (let i = 0; i < w * h; i++) {
      if (d[i * 4 + 3] < 140) continue;
      let r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2];
      if (dither) { const k = (BAYER[(i % w) % 4 + ((Math.floor(i / w)) % 4) * 4] / 16 - .5) * 26; r += k; gg += k; b += k; }
      let best = null, bd = 1e9; for (const p of ALL) { const dd = (p[0] - r) ** 2 * .3 + (p[1] - gg) ** 2 * .59 + (p[2] - b) ** 2 * .11; if (dd < bd) { bd = dd; best = p[3]; } }
      g.d[i] = best;
    }
    colorOutline(g, 1);
    return g.canvas();
  }
  const big = mk(S, H); draw(big.getContext('2d'), 0);
  const inked = mk(S, H); draw(inked.getContext('2d'), 2.4);
  const A = pixelise(big, 200, 240, false), B = pixelise(big, 200, 240, true);
  const cv = document.createElement('canvas'); cv.width = 1260; cv.height = 545; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99;width:1260px;height:545px'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.fillStyle = '#2f2430'; c.fillRect(0, 0, 1260, 545); c.font = '22px sans-serif';
  [['A 写实像素·赛璐珞', A, 2, true], ['B 写实像素·柔和抖动', B, 2, true], ['C 半写实插画', inked, 1, false]].forEach(([name, im, s, pix], i) => {
    const x0 = 20 + i * 415; c.fillStyle = '#fbe9c0'; c.fillText(name, x0, 34);
    c.fillStyle = '#e9e3d3'; c.fillRect(x0, 50, 400, 480); c.fillStyle = '#d8cdb5'; c.fillRect(x0, 400, 400, 130);
    c.imageSmoothingEnabled = !pix; c.drawImage(im, 0, 0, im.width, im.height, x0, 50, 400, 480);
  });
})();
