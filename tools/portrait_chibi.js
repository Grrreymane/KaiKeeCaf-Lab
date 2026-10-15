// draft (not shipped): Q-version owner bust, painted with thick, layered shading. Evaluated in the test page:
//   fetch('tools/portrait_chibi.js').then(r => r.text()).then(eval)
(function () {
  const W_ = 400, H_ = 480;
  const pal = { skin: '#fbd8bc', skinS: '#eab090', skinS2: '#d89474', skinL: '#fff0e2', hair: '#5a3424', hairS: '#3e2216', hairS2: '#2a160e', hairL: '#8a5434', hairL2: '#b07a50',
    shirt: '#f2c85a', shirtS: '#d8a43a', shirtL: '#ffe49a', apron: '#3f8f74', apronS: '#2a6e58', apronL: '#62b094', iris: '#7a4628', irisD: '#3a1e12', irisL: '#c88a4a', blush: '#f49a8c', lip: '#c8604e' };
  function paint(c) {
    const P = pal, E = (x, y, rx, ry, col, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
    const path = (pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 6) c.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]); c.closePath(); c.fill(); };
    const clipTo = (fn, draw) => { c.save(); c.beginPath(); fn(); c.clip(); draw(); c.restore(); };
    // back hair: a big round bob, pointed lock ends curling in
    E(200, 190, 166, 164, P.hairS);   // back of the head
    path([40, 200, 40, 290, 60, 350, 96, 372, 120, 372, 132, 352, 132, 330, 268, 330, 268, 352, 280, 372, 304, 372, 340, 350, 360, 290, 360, 200, 200, 200, 40, 200], P.hairS);   // bob sides, ends curling in
    for (const [x, y] of [[70, 362], [104, 374], [296, 374], [330, 362]]) E(x, y, 10, 8, P.hairS2);   // darker tips
    clipTo(() => { c.ellipse(200, 190, 166, 164, 0, 0, 7); }, () => { c.globalAlpha = .7; E(150, 140, 110, 110, P.hair); c.globalAlpha = 1; });
    // little body: shoulders, shirt folds, apron bib, arms holding a tray of egg tarts
    path([200, 330, 140, 330, 104, 350, 92, 392, 86, 430, 84, 480, 200, 480, 316, 480, 314, 430, 308, 392, 296, 350, 260, 330, 200, 330], P.shirt);
    E(120, 380, 30, 50, P.shirtL); E(300, 400, 26, 56, P.shirtS);   // light left, shade right
    path([150, 380, 250, 380, 258, 480, 142, 480], P.apron); c.fillStyle = P.apron; c.fillRect(146, 372, 108, 108);
    E(170, 420, 20, 40, P.apronL); E(240, 440, 18, 44, P.apronS);
    c.fillStyle = P.apronS; c.fillRect(150, 338, 12, 40); c.fillRect(238, 338, 12, 40);
    // tray + tarts held in front
    E(200, 432, 96, 22, '#b07a4a'); E(200, 428, 90, 18, '#d9a066');
    for (const [x, y] of [[160, 422], [200, 418], [240, 422]]) { E(x, y, 22, 10, '#c87428'); E(x, y - 2, 17, 7, '#ffd23f'); E(x - 5, y - 4, 6, 2.5, '#fff6b8'); }
    for (const x of [108, 292]) { E(x, 432, 20, 16, P.skin); E(x + (x < 200 ? 4 : -4), 436, 12, 9, P.skinS); }   // hands
    // neck + shadow under the big head
    c.fillStyle = P.skinS; c.fillRect(180, 300, 40, 40); E(200, 312, 40, 14, P.skinS2);
    // face: wide, soft chin; painted shading: shadow under the fringe, right cheek, jaw; warm light on the left
    const face = () => { c.moveTo(200, 120); c.bezierCurveTo(118, 120, 76, 170, 78, 230); c.bezierCurveTo(80, 290, 140, 322, 200, 324); c.bezierCurveTo(260, 322, 320, 290, 322, 230); c.bezierCurveTo(324, 170, 282, 120, 200, 120); };
    c.fillStyle = P.skin; c.beginPath(); face(); c.fill();
    clipTo(face, () => {
      c.globalAlpha = .55; E(300, 250, 50, 90, P.skinS); c.globalAlpha = .4; E(310, 260, 28, 70, P.skinS2);
      c.globalAlpha = .5; E(200, 330, 120, 40, P.skinS); c.globalAlpha = .7; E(130, 210, 46, 60, P.skinL);
      c.globalAlpha = .55; E(200, 150, 140, 36, P.skinS); c.globalAlpha = 1;
      // blush: soft paint, with three short strokes
      for (const [x, sz] of [[124, 1], [276, .9]]) { const g = c.createRadialGradient(x, 262, 0, x, 262, 34 * sz); g.addColorStop(0, 'rgba(244,140,128,.75)'); g.addColorStop(1, 'rgba(244,140,128,0)'); c.fillStyle = g; c.fillRect(x - 40, 222, 80, 80);
        c.strokeStyle = 'rgba(232,110,100,.8)'; c.lineWidth = 2.5; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 10 + 4, 254); c.lineTo(x + k * 10 - 4, 266); c.stroke(); } }
    });
    // big chibi eyes: white, layered iris, pupil, two catchlights, thick upper lash with a flick, small lower lash
    for (const [ex, dir] of [[148, -1], [252, 1]]) {
      const ey = 232, rx = 30, ry = 36;
      E(ex, ey, rx, ry, '#fffaf4');
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, 7); c.clip();
      const ig = c.createLinearGradient(0, ey - ry, 0, ey + ry); ig.addColorStop(0, P.irisD); ig.addColorStop(.45, P.iris); ig.addColorStop(1, P.irisL);
      c.fillStyle = ig; c.beginPath(); c.ellipse(ex + 2, ey + 4, rx - 4, ry - 2, 0, 0, 7); c.fill();
      E(ex + 2, ey + 2, 11, 15, '#2a120a'); c.globalAlpha = .45; E(ex, ey - 26, rx, 14, '#3a1e12'); c.globalAlpha = 1;   // lid shadow
      E(ex + 3, ey + 22, 14, 6, '#e8b070');
      c.restore();
      E(ex - 10, ey - 12, 9, 11, '#ffffff', -.3); E(ex + 12, ey + 14, 4, 4, '#ffffff'); E(ex + 6, ey - 18, 2.5, 2.5, '#ffffff');
      c.strokeStyle = '#2a160e'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.ellipse(ex, ey + 2, rx + 3, ry + 1, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(ex + dir * (rx + 1), ey - 14); c.lineTo(ex + dir * (rx + 12), ey - 24); c.stroke();
      c.lineWidth = 2.5; c.beginPath(); c.ellipse(ex, ey, rx - 2, ry + 1, 0, Math.PI * .2, Math.PI * .5); c.stroke();
    }
    // brows, nose, mouth
    c.strokeStyle = '#5a3424'; c.lineWidth = 5; c.lineCap = 'round'; for (const ex of [148, 252]) { c.beginPath(); c.moveTo(ex - 18, 184); c.quadraticCurveTo(ex, 178, ex + 18, 184); c.stroke(); }
    c.fillStyle = P.skinS2; c.fillRect(204, 268, 4, 4);
    c.fillStyle = '#7a2e26'; c.beginPath(); c.moveTo(186, 290); c.quadraticCurveTo(200, 306, 214, 290); c.closePath(); c.fill(); E(200, 298, 7, 3, '#e87a70');
    // fringe: chunky locks, each with a shadow side and a paint stroke of light
    // fringe: one painted shape with soft rounded lock tips, a shadow under each tip
    c.fillStyle = P.hair; c.beginPath(); c.moveTo(70, 250); c.bezierCurveTo(56, 120, 130, 40, 200, 38); c.bezierCurveTo(270, 40, 344, 120, 330, 250);
    const tips = [[318, 200], [292, 186], [262, 196], [236, 176], [206, 192], [178, 172], [150, 190], [122, 180], [96, 204]];
    let px0 = 330, py0 = 250; for (const [x, y] of tips) { c.quadraticCurveTo((px0 + x) / 2 + 6, Math.max(py0, y) - 30, x, y); px0 = x; py0 = y; } c.quadraticCurveTo(80, 220, 70, 250); c.fill();
    c.globalAlpha = .55; for (const [x, y] of tips) E(x - 4, y - 14, 12, 18, P.hairS); c.globalAlpha = 1;
    c.globalAlpha = .45; E(140, 100, 60, 34, P.hairL); c.globalAlpha = 1;   // light from the top-left
    c.strokeStyle = P.hairL2; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.arc(200, 190, 132, 3.75, 4.55); c.stroke();   // painted shine band
    c.strokeStyle = '#d8a478'; c.lineWidth = 4; c.beginPath(); c.arc(200, 190, 132, 3.95, 4.25); c.stroke();
    c.strokeStyle = P.hairS; c.lineWidth = 3; for (const [a, b, d] of [[150, 70, 136], [200, 60, 196], [250, 70, 262]]) { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo((a + d) / 2 + 6, b + 30, d, b + 60); c.stroke(); }   // a few strands, only in the crown
    // rim light along the left of the head and shoulder
    c.strokeStyle = 'rgba(255,240,210,.7)'; c.lineWidth = 4; c.beginPath(); c.arc(200, 190, 162, 2.6, 3.6); c.stroke(); c.beginPath(); c.moveTo(96, 380); c.quadraticCurveTo(90, 420, 88, 470); c.stroke();
  }
  function pixelate(src, w, h) {   // shrink, posterize into a limited set of tones, dark coloured outline
    const t = mk(w, h), x = t.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h);
    const im = x.getImageData(0, 0, w, h), d = im.data, g = new Grid(w, h);
    for (let i = 0; i < w * h; i++) { if (d[i * 4 + 3] < 120) continue; const q = v => Math.min(255, Math.round(v / 20) * 20); g.d[i] = '#' + [q(d[i * 4]), q(d[i * 4 + 1]), q(d[i * 4 + 2])].map(v => v.toString(16).padStart(2, '0')).join(''); }
    colorOutline(g, 1); return g.canvas();
  }
  const big = mk(W_, H_); paint(big.getContext('2d'));
  const px_ = pixelate(big, 200, 240);
  const cv = document.createElement('canvas'); cv.width = 1300; cv.height = 540; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, 1300, 540); c.font = '20px sans-serif'; c.fillStyle = '#3a2a2e';
  c.fillText('Q 版厚涂（原画）', 20, 26); c.drawImage(big, 10, 40);
  c.fillText('Q 版厚涂（像素化，用在游戏里）', 440, 26); c.imageSmoothingEnabled = false; c.drawImage(px_, 430, 40, 400, 480);
  c.fillText('对话框实际大小', 870, 26); c.drawImage(px_, 870, 160, 100, 120); c.drawImage(bust('hero_f'), 1000, 160, 100, 120); c.fillText('← Q版   现版 →', 880, 310);
})();
