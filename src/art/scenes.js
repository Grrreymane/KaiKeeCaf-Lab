// ==== scenes: pixel backdrops for the big story moments (drawn at game pixels, shown 2x with hard edges), and
// expressions on the dialogue busts read from the stage directions in a line — （惊）（脸红）（哭）（笑）（叹气）（小声）.
const BACKDROP = {};
function bdBase(kind) {   // the still part of a backdrop, 180 x 320 game pixels → 360 x 640
  if (BACKDROP[kind]) return BACKDROP[kind];
  const cv = mk(180, 320), c = cv.getContext('2d'), r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const sky = (bands) => { const h = 320 / bands.length; bands.forEach((col, i) => { r(0, R(i * h), 180, R(h) + 1, col); if (i) for (let x = 0; x < 180; x += 2) for (let y = 0; y < 3; y++) if ((x + y) % 4 === 0) r(x + (y & 1), R(i * h) - 1 - y * 2, 1, 1, bands[i - 1]); }); };   // dithered seams between bands
  const shop = (lit, wet) => {   // the shop front at street level: brick, the red sign, two warm windows, the door
    r(0, 150, 180, 120, wet ? '#5a4448' : '#7a5248'); for (let y = 154; y < 270; y += 6) for (let x = (y / 6 & 1) * 6; x < 180; x += 12) r(x, y, 11, 1, wet ? '#4a383c' : '#6a4440');
    r(20, 158, 140, 22, '#9a2a24'); r(22, 160, 136, 18, lit ? '#c8342c' : '#a83028'); c.font = '12px ' + PFONT; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = lit ? '#ffe9a0' : '#e8c890'; c.fillText(L('街记冰室'), 90, 163);
    for (const x of [24, 108]) { r(x, 190, 48, 44, '#3a2a2e'); r(x + 2, 192, 44, 40, lit ? '#f2c870' : '#9ab8c8'); r(x + 2, 210, 44, 2, '#3a2a2e'); r(x + 23, 192, 2, 40, '#3a2a2e'); if (lit) { r(x + 4, 194, 18, 14, '#ffe2a0'); r(x + 26, 214, 18, 16, '#ffd780'); } }
    r(76, 196, 28, 74, '#3a2a2e'); r(78, 198, 24, 72, lit ? '#e8b060' : '#6a4a3a'); r(98, 232, 2, 4, '#ffd23f');
    r(0, 270, 180, 130, wet ? '#3a3a44' : '#5a5a60'); for (let x = 0; x < 180; x += 20) r(x, 270, 1, 130, wet ? '#2e2e38' : '#4a4a52');   // pavement
  };
  if (kind === 'night' || kind === 'rain') {
    sky(kind === 'rain' ? ['#2a2e3a', '#323848', '#3a4254', '#444c5e'] : ['#141428', '#1c1c3a', '#2a2448', '#3a2c52']);
    if (kind === 'night') for (let i = 0; i < 40; i++) r(R(hsh(i, 1, 9) * 180), R(hsh(i, 2, 9) * 70), 1, 1, i % 5 ? '#c8c8e8' : '#ffffff');
    c.save(); c.translate(0, -76);   // the scene sits high: the dialogue box covers the bottom third
    for (const [x, w, h] of [[0, 30, 90], [150, 30, 110]]) { r(x, 150 - h, w, h, '#1e1e2e'); for (let y = 160 - h; y < 146; y += 8) for (let xx = x + 3; xx < x + w - 3; xx += 6) if (hsh(xx, y, 4) > .5) r(xx, y, 3, 4, '#e8c060'); }   // neighbours with a few lit windows
    shop(true, kind === 'rain');
    r(164, 150, 3, 120, '#2a2a30'); r(158, 146, 15, 5, '#3a3a40'); r(160, 150, 11, 3, '#ffe9a0');   // street lamp
    if (kind === 'rain') for (let x = 0; x < 180; x += 7) r(x + (x % 3), 284 + (x % 11), 6, 1, '#6a7a90');   // puddle glints
    c.restore();
  } else if (kind === 'pier') {
    sky(['#4a6a9a', '#7a8ab0', '#c89ab0', '#f0b090', '#f8d080']); c.save(); c.translate(0, -80);
    c.fillStyle = '#5a5a7a'; c.beginPath(); c.moveTo(0, 168); c.lineTo(40, 150); c.lineTo(80, 162); c.lineTo(130, 146); c.lineTo(180, 160); c.lineTo(180, 172); c.lineTo(0, 172); c.fill();   // hills over the water
    r(70, 156, 40, 16, '#ffe0a0'); r(76, 152, 28, 4, '#ffe8b0');   // the sun coming up
    for (let y = 172; y < 250; y += 3) r(0, y, 180, 3, y < 200 ? '#5a7aa8' : y < 228 ? '#4a6a98' : '#3a5a88');   // sea
    for (let y = 176; y < 248; y += 5) for (let x = (y * 7) % 23; x < 180; x += 23) r(x, y, 6 + (y % 4), 1, '#a8c0e0');
    r(0, 250, 180, 150, '#6a4a30'); for (let x = 0; x < 180; x += 12) { r(x, 250, 1, 150, '#4a3020'); r(x + 4, 262 + (x % 30), 3, 1, '#8a6a48'); } r(0, 250, 180, 2, '#9a7a50');   // planks
    for (const [x, col] of [[60, '#3a3a5a'], [110, '#4a2e2a']]) { r(x, 226, 14, 24, col); r(x + 2, 214, 10, 12, col); r(x + 3, 210, 8, 4, x === 60 ? '#5a5a6a' : '#2f4a6a'); r(x - 2, 244, 18, 6, col); }   // two old men from behind
    c.strokeStyle = '#2a2020'; c.lineWidth = 1; for (const [x, tx] of [[72, 40], [114, 150]]) { c.beginPath(); c.moveTo(x, 232); c.lineTo(tx, 186); c.stroke(); c.beginPath(); c.moveTo(tx, 186); c.lineTo(tx + (tx < 90 ? -2 : 2), 214); c.stroke(); }   // rods + lines
    r(88, 240, 12, 10, '#9aa0a8'); r(88, 240, 12, 2, '#c8ccd0');   // the bucket between them
    c.restore();
  } else if (kind === 'crowd') {
    sky(['#8ac0e8', '#a0d0f0', '#c0e0f4']); c.save(); c.translate(0, -80);
    shop(false, false);
    for (let i = 0; i < 26; i++) { const x = R(hsh(i, 3, 2) * 176), y = 238 + R(hsh(i, 4, 2) * 50), col = ['#2a2024', '#5a3424', '#3a2a22', '#e07ab0', '#e8c860', '#7a6a62'][i % 6], body = ['#3f86d6', '#e5604f', '#f0b43a', '#4a4046', '#9a6cd0', '#3fa0a0'][i % 6];
      r(x - 5, y + 6, 10, 18, body); r(x - 4, y - 2, 8, 8, '#f0c8a0'); r(x - 4, y - 3, 8, 4, col); if (i % 4 === 0) { r(x + 3, y + 4, 7, 5, '#2a2a30'); r(x + 8, y + 5, 2, 2, '#9ac0e0'); } }   // the crowd, some with cameras
    c.restore();
  }
  return (BACKDROP[kind] = up2(cv));
}
function drawBackdrop(c, kind) {   // still picture + the moving bits (rain, camera flashes, twinkling stars, the sea)
  c.save(); c.imageSmoothingEnabled = false; c.drawImage(bdBase(kind), 0, 0, 360, 640); c.restore();
  const t = rtime;
  if (kind === 'rain') { c.fillStyle = 'rgba(200,215,235,.55)'; for (let i = 0; i < 70; i++) { const x = (hsh(i, 1, 7) * 400 + t * 40) % 380 - 10, y = (hsh(i, 2, 7) * 640 + t * 300) % 640; c.fillRect(R(x), R(y), 1, 7); } }
  if (kind === 'crowd') for (let i = 0; i < 4; i++) { const k = Math.floor(t * 3 + i * 1.7); if (hsh(k, i, 5) > .6) { const x = R(hsh(k, i, 6) * 340 + 10), y = R(300 + hsh(k, i, 8) * 110); c.fillStyle = '#ffffff'; c.fillRect(x - 6, y, 13, 1); c.fillRect(x, y - 6, 1, 13); c.fillRect(x - 2, y - 2, 5, 5); } }
  if (kind === 'night') for (let i = 0; i < 6; i++) if (Math.sin(t * 2 + i * 2.1) > .7) { c.fillStyle = '#ffffff'; c.fillRect(R(hsh(i, 1, 9) * 180) * 2 - 1, R(hsh(i, 2, 9) * 70) * 2 - 1, 3, 3); }
  if (kind === 'pier') { c.fillStyle = 'rgba(255,240,200,.6)'; for (let i = 0; i < 8; i++) { const x = R((hsh(i, 5, 3) * 360 + t * 8) % 360), y = R(200 + hsh(i, 6, 3) * 130); if (Math.sin(t * 3 + i) > 0) c.fillRect(x, y, 10, 2); } }
}
// ---- expressions: what a line's stage direction says about the speaker's face
function exprOf(text) {
  const s = String(text || '');
  if (/哭|眼泪|眼眶红|呜/.test(s)) return 'cry';
  if (/惊|愣住|！？|\?!|吓/.test(s)) return 'surprise';
  if (/脸红|耳朵红|害羞|红了脸/.test(s)) return 'blush';
  if (/叹气|唉/.test(s)) return 'sigh';
  if (/小声|压低声音|委屈|冷汗/.test(s)) return 'sweat';
  if (/（笑|偷笑|微笑|嘿嘿|嘻嘻|哈哈/.test(s)) return 'happy';
  return null;
}
function drawExpr(c, kind, x, y, w, h) {   // marks around the bust (x, y, w, h: where it was drawn); the face sits in the upper middle
  const t = rtime, P2 = (xx, yy, ww, hh, col) => { c.fillStyle = col; c.fillRect(R(xx), R(yy), ww, hh); }, fx = x + w * .5, fy = y + h * .38;
  if (kind === 'surprise') { const bx = x + w - 18, by = y + 4 - R(Math.abs(Math.sin(t * 8)) * 2); P2(bx - 1, by - 1, 12, 24, OUT); P2(bx, by, 10, 22, '#ffffff'); P2(bx + 3, by + 3, 4, 11, '#d0453a'); P2(bx + 3, by + 16, 4, 4, '#d0453a'); }
  else if (kind === 'blush') { for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) P2(fx + sx * 16 - 4 + k * 3, fy + 12 - k, 2, 4, '#f07a9a'); const bx = x + w - 16, by = y + 6; P2(bx, by + 2, 4, 4, '#e8406a'); P2(bx + 6, by + 2, 4, 4, '#e8406a'); P2(bx - 1, by + 4, 12, 4, '#e8406a'); P2(bx + 1, by + 8, 8, 2, '#e8406a'); P2(bx + 3, by + 10, 4, 2, '#e8406a'); }
  else if (kind === 'cry') for (const sx of [-1, 1]) { const k = (t * 1.6 + (sx > 0 ? .5 : 0)) % 1; P2(fx + sx * 12 - 1, fy + 6 + k * 26, 3, 5, '#6ab0e8'); P2(fx + sx * 12, fy + 4 + k * 26, 1, 2, '#c8e8ff'); }
  else if (kind === 'sweat') { const bx = x + w - 14, by = y + 10 + R((t * 6) % 6); P2(bx + 2, by, 3, 3, '#6ab0e8'); P2(bx + 1, by + 3, 5, 5, '#6ab0e8'); P2(bx + 2, by + 4, 1, 2, '#ffffff'); }
  else if (kind === 'sigh') { const k = (t * .8) % 1, bx = x + w - 20 + k * 10, by = y + 20 - k * 10; c.save(); c.globalAlpha = 1 - k; P2(bx, by, 10, 6, '#e8e4dc'); P2(bx + 2, by - 2, 6, 10, '#e8e4dc'); P2(bx + 8, by - 3, 6, 6, '#f4f0e8'); c.restore(); }
  else if (kind === 'happy') for (let i = 0; i < 3; i++) { const k = (t * 1.2 + i / 3) % 1, bx = x + w - 22 + i * 7, by = y + 14 - k * 16; c.save(); c.globalAlpha = 1 - k; P2(bx, by, 2, 6, '#c99428'); P2(bx + 2, by, 3, 2, '#c99428'); P2(bx - 2, by + 5, 3, 3, '#c99428'); c.restore(); }   // little notes floating up
}
