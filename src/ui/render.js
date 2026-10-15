// ==== render: world layer (panned by camX) + world-anchored text, then HUD and panels on top
let camX = LM, MODE = 'play', BG = null, SHADE = null, gtime = 0, rtime = 0;   // rtime: real seconds (UI pulses and arrows ignore ×2/×3)
function redoShadows() { if (!SHADE) return; const x = SHADE.getContext('2d'); x.clearRect(0, 0, WW, 1280); contactShadows(x); }

// front-to-back: things with smaller x / y are behind
function behind(a, b) {
  if (a.x1 <= b.x0 || a.y1 <= b.y0) return true;
  if (b.x1 <= a.x0 || b.y1 <= a.y0) return false;
  return a.x0 + a.x1 + a.y0 + a.y1 < b.x0 + b.x1 + b.y0 + b.y1;
}
function depthSort(items) {
  const n = items.length, back = items.map(() => []);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = items[i], b = items[j];
    if (a.bx1 <= b.bx0 || b.bx1 <= a.bx0 || a.by1 <= b.by0 || b.by1 <= a.by0) continue;
    if (behind(a, b)) back[j].push(i); else back[i].push(j);
  }
  const out = [], st = new Uint8Array(n);
  const visit = i => { if (st[i]) return; st[i] = 1; for (const k of back[i]) visit(k); out.push(items[i]); };
  for (let i = 0; i < n; i++) visit(i);
  return out;
}
function personItem(img, x, y, z = 0, anchor = FOOT2, extra) {
  const [sx, sy] = P(x, y, z), l = R(sx - img.width / 2), t = R(sy - anchor);
  return Object.assign({ x0: x - 5, x1: x + 5, y0: y - 5, y1: y + 5, bx0: l, by0: t, bx1: l + img.width, by1: t + img.height, draw(c) { c.drawImage(img, l, t); } }, extra);
}
// gold outline that hugs an object's silhouette (cached per object + look)
const RINGS = new Map();
function ringOf(o) {
  const src = o.shelf && o.shelf.locked && o.sheet ? o.sheet.cv : o.cv, key = src;
  if (RINGS.has(key)) return RINGS.get(key);
  const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, out = mk(w, h), ox = out.getContext('2d'), im = ox.createImageData(w, h), D = im.data;
  const a = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1) || a(x - 2, y) || a(x + 2, y))) D.set([255, 215, 94, 255], (y * w + x) * 4);
  ox.putImageData(im, 0, 0); RINGS.set(key, out); return out;
}

// who stands where this frame: Kun + Lin always; hired staff by post (the waiter walks, see WAITER)
function staffList() {
  const L = [{ id: 'kun', ch: STAFF_HD.kun, x: 250, y: 22, face: 'SW', z: PLAT, job: JOB.kun }, { id: 'hero', ch: STAFF_HD['hero_' + ((W && W.hero) || 'f')], x: 50, y: 24, face: 'SW', z: PLAT, job: JOB.till },
    { id: 'lin', ch: STAFF_HD.lin, x: 84, y: 23, face: 'SW', z: PLAT, job: JOB.lin }];   // the owner rings up at the till, Lin packs beside
  for (const k in HIRE) { const s = W && W.staff[k]; if (!s || !s.hired) continue;
    if (s.post === 'bar') { const i = postsOf('bar').indexOf(k); L.push({ id: k, ch: STAFF_HD[k], x: i ? 136 : 156, y: 25, face: 'SW', z: PLAT, job: i ? JOB.bar2 : JOB.bar }); }
    if (s.post === 'bake') { const i = postsOf('bake').indexOf(k); L.push({ id: k, ch: STAFF_HD[k], x: i ? 206 : 226, y: 22, face: 'SW', z: PLAT, job: i ? JOB.kun3 : JOB.kun2 }); }
    if (s.post === 'take') { const i = postsOf('take').indexOf(k); L.push({ id: k, ch: STAFF_HD[k], x: i ? 204 : 180, y: 293, face: 'SW', z: 0 }); } }
  return L;
}
const seatImg = (ch, front) => front ? (ch._sf || (ch._sf = flipC(ch.seatSE))) : (ch._sb || (ch._sb = flipC(ch.seatNW)));
function wireAfters() {   // food on the window bar and on booth tables is drawn right after those objects
  WINBAR.after = c => { for (const o of CUST) if (o.sitting && o.eatP) putB(c, PRODUCTS[o.eatP].img, P(9, o.stool, 34)); };
  BOOTHS.forEach((B, b) => { B.table.after = c => { const g = B.table.grp;
    for (const st of SEATS) if (st.b === b && (st.items.length || st.dirty)) { const x = B.X + 12 + st.k * 22 + g.dx, y = B.y0 + (st.front ? 15 : 24) + g.dy;
      const d = st.who, left = d && d.state === 'eat' ? Math.ceil(st.items.length * clamp(1 - d.t / (d.eatT - 1), 0, 1)) : st.items.length;   // food goes as they eat
      if (st.items.length) st.items.forEach((p, i) => putB(c, i < left ? PRODUCTS[p].img : DISH, P(x + i * 6 - 3, y, 18.5))); else putB(c, DISH, P(x, y, 18.5)); } }; });
}
// ---------------------------------------------------------------- little life details
const BAG = paint(14, 18, G => { G.rect(2, 5, 10, 12, '#c9a06a'); G.rect(2, 5, 10, 2, '#e0bc84'); G.rect(4, 1, 1, 5, '#8a6440'); G.rect(9, 1, 1, 5, '#8a6440'); G.rect(4, 1, 6, 1, '#8a6440'); G.rect(3, 10, 8, 2, '#b8483c'); }, false);
const BIG_BAG = paint(22, 26, G => {   // the paper bag customers walk out with: folded top, string handles, red 街记 band
  G.rect(2, 8, 18, 17, '#c9a06a'); G.rect(2, 8, 18, 2, '#e0bc84'); G.rect(16, 10, 4, 15, '#b08850'); G.rect(2, 10, 2, 15, '#d8b47c');
  for (const x of [6, 15]) G.rect(x, 2, 1, 7, '#7a5636'); G.rect(6, 2, 10, 1, '#7a5636'); G.rect(3, 15, 16, 4, '#b8483c'); G.rect(3, 15, 16, 1, '#d0453a'); G.rect(8, 16, 6, 2, '#fff4dc'); }, false);
const TRAY = paint(30, 7, G => { G.rect(1, 2, 28, 4, '#b07a4a'); G.rect(1, 2, 28, 1, '#d9a066'); G.rect(0, 1, 2, 4, '#8a5a3a'); G.rect(28, 1, 2, 4, '#8a5a3a'); }, false);
const FOOD_S2 = {};
const smallFood = p => FOOD_S[p] || FOOD_S2[p] || (FOOD_S2[p] = (() => { const im = PRODUCTS[p].img, s = 12 / im.width, o = mk(R(im.width * s), R(im.height * s)), x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, o.width, o.height); return o; })());   // new items: shrink the big sprite
// a shop customer holds a tray (what they picked shows on it); after paying they walk out with a paper bag
function carry(it, o, p, face) {
  const [sx, sy] = P(p.x, p.y), back = face === 'NE' || face === 'NW', side = face === 'SE' || face === 'NE' ? 1 : -1, base = it.draw;
  const tray = c => { const tx = R(sx + side * 3 - 15), ty = R(sy - 52); c.drawImage(TRAY, tx, ty); (o.onTray || []).slice(0, 4).forEach((q, i) => { const f = smallFood(q); c.drawImage(f, tx + 2 + i * 7, ty - f.height + 4); }); };
  it.draw = c => { if (o.tray && back) tray(c); base(c); if (o.tray && !back) tray(c); if (o.bag) c.drawImage(BIG_BAG, R(sx + side * 15 - 11), R(sy - 50)); };
}
// cars: one sprite per lane + colour, slid along x (x shift of dx moves the screen point by K*dx right and K*dx/2 down)
const CAR_SPR = {};
function carItem(car) {
  const k = car.lane + ':' + car.col, o = CAR_SPR[k] || (CAR_SPR[k] = makeCar(car.lane ? 397 : 370, CAR_COLS[car.col])), dx = car.dx, ox = R(dx * K), oy = R(dx * K / 2);
  return { x0: o.x0 + dx, x1: o.x1 + dx, y0: o.y0, y1: o.y1, bx0: o.bx0 + ox, bx1: o.bx1 + ox, by0: o.by0 + oy, by1: o.by1 + oy, draw(c) { c.drawImage(o.cv, o.sx + ox, o.sy + oy); } };
}
function workKind(s) {   // which work animation a staff member is in right now
  const j = s.job; if (!j) return null;
  if (s.id === 'kun') return 'bake'; if (s.id === 'hero') return 'till';
  if (j.kind === 'pack') return 'pack'; return 'pour';
}
// work animations drawn on the counters (sorted with everything else so customers in front still cover them)
function prop(x0, x1, y0, y1, zTop, draw) { const a = P(x0, y1), b = P(x1, y0), t = P(x0, y0, zTop); return { x0, x1, y0, y1, bx0: a[0] - 20, bx1: b[0] + 20, by0: t[1] - 60, by1: P(x1, y1)[1] + 10, draw }; }
function thick(c, a, b, w, col) { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]))); c.fillStyle = col; for (let i = 0; i <= n; i++) c.fillRect(R(a[0] + (b[0] - a[0]) * i / n - w / 2), R(a[1] + (b[1] - a[1]) * i / n - w / 2), w, w); }
function workProps() {
  const out = [];
  if (JOB.kun) {   // Kun rolls dough on the bake counter; when the batch is nearly done he lifts the tray
    const j = JOB.kun, k = j.t / j.T;
    out.push(prop(212, 244, 32, 46, 40, c => {
      const ph = gtime * 6, dx = Math.sin(ph) * 5;
      const [a, b] = P(226, 39, 34.5); c.fillStyle = '#f6e6c4'; c.beginPath(); c.ellipse(a, b, 20, 7, 0, 0, 7); c.fill(); c.fillStyle = '#fff6e0'; c.beginPath(); c.ellipse(a - 4, b - 2, 9, 3, 0, 0, 7); c.fill();
      if (Math.sin(ph * 1.5) > .8) { const [fx, fy] = P(230, 38, 40); c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 4; i++) c.fillRect(R(fx + Math.sin(i * 7 + ph) * 10), R(fy - i * 4 - (ph % 1) * 6), 3, 3); }
    }));
    if (k > .82) out.push(prop(240, 260, 16, 28, PLAT + 90, c => { const [a, b] = P(250, 26, PLAT + 54 + (k - .82) * 80), img = PRODUCTS[j.p].img; c.drawImage(TRAY, R(a - 15), R(b)); for (let i = 0; i < 3; i++) putB(c, img, [R(a - 11 + i * 11), R(b) + 2]); }));
  }
  if (JOB.till) {   // the till drawer pops out and a coin glints
    const k = JOB.till.t / JOB.till.T;
    out.push(prop(42, 58, 34, 48, 50, c => { const out_ = Math.min(4, k * 10) * (k < .9 ? 1 : (1 - k) * 10); const [a, b] = P(44, 44 + out_, 36); c.fillStyle = '#3f6b5a'; c.fillRect(R(a), R(b) - 6, 26, 7); c.fillStyle = '#e9c46a'; if (Math.sin(gtime * 10) > 0) c.fillRect(R(a) + 10, R(b) - 5, 4, 3); }));
  }
  return out;
}
function drawWorld(c) {
  c.drawImage(BG, 0, 0); c.drawImage(SHADE, 0, 0);
  if (MODE === 'edit') drawEditFloor(c);
  const staff = staffList();
  c.save(); c.globalAlpha = .22; c.fillStyle = '#2a1a24';   // feet shadows
  const feet = [...CUST.filter(o => !o.sitting).map(custPos), ...WALKERS, ...DINERS.filter(d => d.state === 'in' || d.state === 'out'), ...LEAVERS, ...WAITERS, ...staff.filter(s => !s.z)];
  for (const f of feet) { const [a, b] = P(f.x, f.y); c.beginPath(); c.ellipse(R(a), R(b), 18, 7, 0, 0, 7); c.fill(); }
  c.restore();
  { const dl = dirtOf(); if (dl > 25) { c.save(); c.globalAlpha = Math.min(.85, (dl - 25) / 55); c.drawImage(grimeLayer(), 0, 0); c.restore(); } }   // grime layer: from about 25% dirt the floor visibly greys over
  { const n = dirtShown(), S = dirtSpots(), wet = wxNow().rain || wxNow().snow;   // dirt on the floor: crumbs, a paper cup, a napkin, a (muddy) footprint
    for (let i = 0; i < n; i++) { const [x, y, kind] = S[i], [a, b] = P(x, y), X = R(a), Y = R(b);
      if (kind === 0) { c.fillStyle = '#b58a5a'; for (const [dx, dy] of [[0, 0], [3, 1], [-2, 2], [5, -1]]) c.fillRect(X + dx, Y + dy, 2, 1); }
      else if (kind === 1) { c.fillStyle = '#f4efe6'; c.fillRect(X - 3, Y - 2, 6, 3); c.fillStyle = '#d0453a'; c.fillRect(X - 3, Y - 2, 6, 1); }
      else if (kind === 2) { c.fillStyle = '#ffffff'; c.fillRect(X - 3, Y - 1, 5, 3); c.fillStyle = '#d8d0c4'; c.fillRect(X, Y, 2, 2); }
      else if (kind === 3) { c.fillStyle = wet ? 'rgba(90,70,50,.55)' : 'rgba(120,100,80,.35)'; c.fillRect(X - 2, Y, 3, 2); c.fillRect(X + 3, Y - 2, 3, 2); }
      else if (kind === 4) { c.fillStyle = 'rgba(150,100,50,.55)'; c.fillRect(X - 5, Y - 1, 10, 3); c.fillRect(X - 3, Y - 2, 6, 5); c.fillStyle = 'rgba(255,240,210,.5)'; c.fillRect(X - 2, Y - 1, 2, 1); }   // spilt milk tea
      else { c.fillStyle = '#efe8dc'; c.fillRect(X - 3, Y - 3, 6, 4); c.fillRect(X - 2, Y - 4, 4, 6); c.fillStyle = '#c9c0b2'; c.fillRect(X - 1, Y - 2, 2, 1); c.fillRect(X + 1, Y, 1, 2); } } }   // crumpled tissue
  const items = [...STATICS];
  staff.forEach((s, i) => { const kind = workKind(s), bob = kind ? 0 : (Math.sin(gtime * 2 + i * 2) > .7 ? .5 : 0); items.push(personItem(kind ? workFrame(s.ch, kind, gtime + i * .37) : s.ch[s.face][0], s.x, s.y, s.z + bob)); });
  for (const w of WAITERS) {   // walks with the order on a tray; at the table: writes the order / holds the tray out / wipes
    const ch = STAFF_HD[w.k], T = w.task, kind = T && !w.route && T.act > 0 ? { order: 'note', deliver: 'serve', clear: 'wipe' }[T.kind] : null;
    const fr = w.route ? Math.floor((w.walk || 0) / 7) % 4 : 0, face = kind ? 'SE' : w.face;
    const it = personItem(kind ? workFrame(ch, kind, gtime, 'SE') : ch[w.face][fr], w.x, w.y);
    if (w.carry.length) carry(it, { tray: true, onTray: w.carry }, w, face);
    items.push(it);
  }
  for (const q of CLEANERS) { const ch = STAFF_HD[q.k]; if (!ch) continue; items.push(personItem(q.mop > 0 ? workFrame(ch, 'wipe', gtime, 'SE') : ch[q.face][q.route ? Math.floor(q.walk / 7) % 4 : 0], q.x, q.y)); }   // cleaners: walk to a spot, mop it
  for (const car of CARS) items.push(carItem(car));
  for (const w of WALKERS) { const fr = Math.floor(w.dist / 7) % 4, face = w.stop > 0 ? 'NE' : w.dir > 0 ? 'SE' : 'NW', it = personItem(walkImg(w, w.ch, face, fr, w.x, w.y), w.x, w.y); if (w.bag) carry(it, { bag: true }, w, face); items.push(it); }
  items.push(...workProps());
  for (const o of CUST) {
    if (o.sitting) { items.push(personItem(o.ch.seatNW, 27, o.stool, 22 + (o.eatP && Math.sin(gtime * 5 + o.stool) > .5 ? -.5 : 0), o.ch.seatAnchor, { x0: 23, x1: 33 })); continue; }   // on a window stool, facing the window
    const p = custPos(o), fr = o.browse ? (p.moving ? Math.floor(o.browse.walk / 7) % 4 : 0) : o.moved > 0 ? (Math.floor(o.dist / 7) % 4) : 0;
    const face = custFace(o), it = personItem(walkImg(o, o.ch, face, fr, p.x, p.y), p.x, p.y); it.cust = o; it.p = p; carry(it, o, p, face); items.push(it);
  }
  for (const w of LEAVERS) items.push(personItem(walkImg(w, w.ch, w.face, Math.floor(w.walk / 7) % 4, w.x, w.y), w.x, w.y));
  for (const d of DINERS) {
    if (d.state === 'in' || d.state === 'out') { items.push(personItem(walkImg(d, d.ch, d.face, Math.floor(d.walk / 7) % 4, d.x, d.y), d.x, d.y)); continue; }
    const sp = seatPos(d.st), ex = d.st.front ? { x0: sp.X, x1: sp.X + 46, y0: sp.y0 + 3, y1: sp.y0 + 9 } : { x0: sp.X, x1: sp.X + 46, y0: sp.y0 + 30, y1: sp.y0 + 36 };
    const eating = d.state === 'eat' && d.t < d.eatT - 1.5, seed = d.st.b * 3 + d.st.k;
    if (eating && d.st.front) { items.push(personItem(eatFrame(d.ch, d.t, seed), sp.x, sp.y, 12, d.ch.seatAnchor, ex)); continue; }
    items.push(personItem(seatImg(d.ch, d.st.front), sp.x, sp.y, 12 + (eating && Math.sin(d.t * 5 + seed) > .5 ? -.5 : 0), d.ch.seatAnchor, ex));   // back seats: head dips to eat
  }
  for (const it of depthSort(items)) {
    it.draw(c);
    if (it.cust && it.cust.wait > 6 && !it.cust.paid) {   // patience bar only once it turns yellow
      const [a, b] = P(it.p.x, it.p.y), f = clamp(1 - (it.cust.wait - 6) / 14, 0, 1);
      px(c, R(a) + 22, R(b) - 92, 24, 10, OUT); px(c, R(a) + 24, R(b) - 90, 20, 6, '#4a3a48'); px(c, R(a) + 24, R(b) - 90, R(20 * f), 6, f > .4 ? '#e7c34a' : '#e0603a');
    }
  }
  for (const f of FLY) {   // a piece hops from the shelf onto the customer's tray (or from the tray into the bag at the till)
    if (f.t < 0) continue; const k = clamp(f.t / f.T, 0, 1), to = f.to || trayAt(f.c), x = f.from[0] + (to[0] - f.from[0]) * k, y = f.from[1] + (to[1] - f.from[1]) * k - Math.sin(Math.PI * k) * 28, im = smallFood(f.p);
    c.drawImage(im, R(x - im.width / 2), R(y - im.height));
  }
  for (const t of TRAYS) {   // trays glide from the kitchen to a shelf: eased, arc scaled to the distance, shadow underneath
    const k = clamp(t.t / t.T, 0, 1), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, dx = t.to[0] - t.from[0], dy = t.to[1] - t.from[1];
    const gx = t.from[0] + dx * e, gy = t.from[1] + dy * e, y = gy - Math.sin(Math.PI * e) * (36 + Math.hypot(dx, dy) * .14);
    c.save(); c.globalAlpha = .16 * (1 - Math.sin(Math.PI * e) * .5); c.fillStyle = '#2a1a24'; c.beginPath(); c.ellipse(gx, gy + 6, 18, 6, 0, 0, 7); c.fill(); c.restore();
    const img = PRODUCTS[t.p].img, n = Math.min(3, t.k);
    px(c, R(gx - 22), R(y) - 2, 44, 6, '#7a4a2e'); px(c, R(gx - 22), R(y) - 2, 44, 2, '#b07a4a');   // little wooden tray
    for (let i = 0; i < n; i++) putB(c, img, [R(gx + (i - (n - 1) / 2) * 12), R(y) - 1 - (i === 1 ? 3 : 0)]);
  }
  const H = HINT;   // guidance: gold ring on the shelf the hint points at (slow breathing, no blinking)
  if (MODE === 'play' && H && H.shelf && SHELF[H.shelf]) {
    const o = SHELF[H.shelf].obj, r = ringOf(o);
    c.save(); c.globalAlpha = .55 + .45 * Math.sin(gtime * 3); c.drawImage(r, o.sx, o.sy); c.restore();
    if (H.hand) c.drawImage(HAND, R(o.sx + o.cv.width / 2), R(o.sy + 30 + Math.abs(Math.sin(gtime * 4)) * -6), HAND.width * K, HAND.height * K);
  }
  if (MODE === 'edit') drawEditMarks(c);
}
// world-anchored text in 1x units (bubbles, pops, staff work icons)
function drawWorldText(c) {
  for (const s of staffList()) {   // what each worker is doing: a small card with the item and a progress bar
    const j = s.job; if (!j) continue;
    const [a, b] = P1(s.x, s.y, s.z + 72), img = j.p ? PRODUCTS[j.p].img : null;
    const x = R(a) + 10, y = R(b) - 6, cw = 24;   // the shop view stays clean: icon only (names live in the panels)
    px(c, x - 1, y - 1, cw + 2, 22, OUT); px(c, x, y, cw, 20, '#fffaf0');
    if (img) c.drawImage(img, x + 12 - img.width / 4, y + 1, img.width / 2, img.height / 2); else if (j.kind === 'pack') c.drawImage(BAG, x + 5, y + 1, 14, 16); else { c.drawImage(COIN_HK, x + 5, y + 2); }
    px(c, x + 2, y + 17, cw - 4, 2, '#e3d6bc'); px(c, x + 2, y + 17, R((cw - 4) * Math.min(1, j.t / j.T)), 2, '#3fbf7a');
    if (j.p && ordered(j.p)) { px(c, x + 17, y - 6, 14, 12, OUT); px(c, x + 18, y - 5, 12, 10, '#d0453a'); T(c, '单', x + 24, y - 6, '#fff4dc', 'center', null); }   // making a booth order
  }
  for (const p of POPS) {
    const y = R(p.y - p.t * 16); c.save(); c.globalAlpha = Math.min(1, (1.4 - p.t) * 2);
    if (p.img) { c.drawImage(p.img, R(p.x) - p.img.width / 4, y - 14, p.img.width / 2, p.img.height / 2); T(c, p.text, R(p.x) + p.img.width / 4 + 2, y - 10, '#fff4dc'); }
    else if (p.small) T(c, p.text, R(p.x), y, '#fff4dc', 'center');
    else { c.drawImage(COIN, R(p.x) - 18, y); T(c, p.text, R(p.x) + 2, y - 1, C.gold); }
    c.restore();
  }
  for (const d of DINERS) if (d.state === 'order' && d.t > 3) {   // waiting for food: what they ordered, small, over the head
    const [a, b] = P1(d.x, d.y, 70); px(c, R(a) - 15, R(b) - 9, d.wants.length * 10 + 6, 14, OUT); px(c, R(a) - 14, R(b) - 8, d.wants.length * 10 + 4, 12, '#fffaf0');
    d.wants.forEach((p, i) => c.drawImage(PRODUCTS[p].img, R(a) - 13 + i * 10, R(b) - 7, PRODUCTS[p].img.width / 3.4, PRODUCTS[p].img.height / 3.4));
  }
  for (const o of [...CUST, ...DINERS]) if (o.tag && !o.paid && o.state !== 'out' && !(o.done && o.done.has('pay')) && !o.out) {
    const [a, y0] = whereIs(o), x = R(a) + 8, y = R(y0 - FOOT) - 4;
    px(c, x - 1, y - 1, 11, 11, OUT); px(c, x, y, 9, 9, o.tag === 'hurry' ? '#fff1c8' : '#e6f2ea');
    if (o.tag === 'hurry') { px(c, x + 2, y + 1, 5, 7, '#d0453a'); px(c, x + 1, y + 2, 7, 5, '#d0453a'); px(c, x + 3, y + 2, 3, 5, '#fffaf0'); px(c, x + 2, y + 3, 5, 3, '#fffaf0'); px(c, x + 4, y + 2, 1, 3, '#2f2430'); px(c, x + 4, y + 4, 2, 1, '#2f2430'); }
    else { px(c, x + 1, y + 3, 5, 4, '#7a4a2e'); px(c, x + 2, y + 7, 3, 1, '#7a4a2e'); px(c, x + 6, y + 4, 2, 2, '#7a4a2e'); px(c, x + 2, y + 3, 3, 1, '#c88a4a'); px(c, x + 2, y + 1, 1, 1, '#c8c0b8'); px(c, x + 4, y, 1, 2, '#c8c0b8'); }
  }
  drawBubbles(c);
}
function drawBubbles(c) {
  c.font = fp(12);
  for (const b of BUBBLES) {
    const [a, y0] = whereIs(b.who), w = R(c.measureText(b.text).width) + 12, h = 18, x = clamp(R(a - w / 2), 2 + camX / K, 358 + camX / K - w), y = R(y0 - FOOT - h - 6);
    c.save(); c.globalAlpha = Math.min(1, b.t * 5, (2.8 - b.t) * 3);
    px(c, x - 1, y - 1, w + 2, h + 2, b.hint ? '#c99428' : OUT); px(c, x, y, w, h, '#fffaf0');
    c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(R(a) - 3, y + h); c.lineTo(R(a) + 3, y + h); c.lineTo(R(a), y + h + 5); c.fill();
    if (b.hint) px(c, x, y, 3, h, C.gold);
    T(c, b.text, x + (b.hint ? 8 : 6), y + 3, '#3a2a2e', 'left', null);
    c.restore();
  }
}
// ---------------------------------------------------------------- outdoor weather: rain (three strengths) with umbrellas, snow, autumn leaves.
// Particles live in world space over the street (y 322..432), so they fall in front of the shop and never inside it.
const UMB = ['#d0453a', '#3f86d6', '#2f9e6e', '#f0b43a', '#8a3e62', '#2f2a30', '#e88aa0'];
const wxNow = () => (PHASE === 'title' || !W || !W.today) ? WEATHER.sun : wxOf();
function drawWeather(c) {
  const wx = wxNow(), rain = wx.rain || 0, autumn = W && seasonIdx(W.day || 1) === 2, t = gtime, h = (i, k) => mhash(i, k);
  if (rain) {   // drops: thin slanted streaks, more and faster the harder it rains; a small splash where they land
    const n = [0, 50, 110, 200][rain], sp = [0, 70, 95, 130][rain], sl = rain === 3 ? .35 : .12;
    c.save(); c.globalAlpha = [0, .55, .7, .8][rain]; c.fillStyle = '#eef6ff';
    for (let i = 0; i < n; i++) {
      const x = -160 + h(i, 1) * 860, y = 322 + h(i, 2) * 110, z = 150 - ((t * sp + h(i, 3) * 150) % 150), [a, b] = P(x - z * sl, y, z);
      if (z < 5) { c.fillRect(R(a) - 1, R(b), 1, 1); c.fillRect(R(a) + 1, R(b), 1, 1); continue; }
      const L = rain === 3 ? 10 : rain === 2 ? 7 : 5; for (let k = 0; k < L; k++) c.fillRect(R(a + k * sl * .6), R(b - k), 1, 1);   // a one-pixel streak
    }
    c.restore();
  }
  if (wx.snow) {   // flakes drifting down, a few bigger ones
    c.save();
    for (let i = 0; i < 150; i++) { const [a, b] = P(-150 + h(i, 41) * 840, 324 + h(i, 42) * 104, 0), L = 14 + R(h(i, 43) * 22); c.globalAlpha = .6; c.fillStyle = '#f4f8ff'; c.fillRect(R(a) - 8, R(b) - 1, L, 3); c.fillRect(R(a) - 4, R(b) - 2, L - 8, 1); }   // snow lying on the pavement and road
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 160; i++) { const x = -160 + h(i, 4) * 860 + Math.sin(t * 1.1 + i) * 8, y = 322 + h(i, 5) * 110, z = 160 - ((t * (14 + h(i, 6) * 10) + h(i, 7) * 160) % 160), [a, b] = P(x, y, z), s = h(i, 8) > .8 ? 3 : 2;
      c.globalAlpha = .85; c.fillStyle = '#b8c8dc'; c.fillRect(R(a) - 1, R(b) - 1, s + 2, s + 2); c.globalAlpha = 1; c.fillStyle = '#ffffff'; c.fillRect(R(a), R(b), s, s); }
    c.restore();
  }
  if (autumn) {   // leaves: tumbling down, a few lying on the pavement
    const LC = ['#d9822b', '#c8502a', '#e8b030', '#a8642a'];
    for (let i = 0; i < 26; i++) { const x = -160 + h(i, 11) * 860 + Math.sin(t * .9 + i * 2) * 18, y = 322 + h(i, 12) * 100, z = 180 - ((t * (12 + h(i, 13) * 8) + h(i, 14) * 180) % 180), [a, b] = P(x, y, z), flip = Math.sin(t * 5 + i) > 0;
      c.fillStyle = LC[i % 4]; if (flip) { c.fillRect(R(a) - 2, R(b), 5, 2); c.fillRect(R(a), R(b) - 1, 1, 1); } else { c.fillRect(R(a) - 1, R(b) - 2, 2, 5); } }
    for (let i = 0; i < 18; i++) { const [a, b] = P(-120 + h(i, 21) * 780, 326 + h(i, 22) * 96, 0); c.fillStyle = LC[(i + 1) % 4]; c.fillRect(R(a) - 2, R(b), 4, 2); c.fillRect(R(a) - 1, R(b) - 1, 2, 1); }
  }
}
// people outside carry an umbrella in the rain (in a drizzle only some of them); drawn over their heads
function umbrellaFor(who, x, y, seed) {
  const wx = wxNow(); if (!(wx.rain || wx.snow) || y < 318) return null;
  if (wx.rain === 1 && mhash(seed, 31) < .5) return null; if (wx.snow && mhash(seed, 32) < .4) return null;
  return UMB[Math.floor(mhash(seed, 33) * UMB.length)];
}
const UMB_POSE = [[-3, 9], [3, 0]];   // the near hand comes up in front of the chest and holds the pole
function umbFrame(ch, face, fr) {
  const key = 'umb' + face + fr; if (ch.work[key]) return ch.work[key];
  const back = face === 'NE' || face === 'NW', im = drawPersonHD({ ...ch.o, pose: UMB_POSE }, back, fr);
  return (ch.work[key] = face === 'SW' || face === 'NW' ? flipC(im) : im);
}
const walkImg = (who, ch, face, fr, x, y) => { if (!ch.work || !ch.o || face === 'NE' || face === 'NW') return ch[face][fr]; const seed = who._us || (who._us = Math.floor(Math.random() * 1e6)); return umbrellaFor(who, x, y, seed) ? umbFrame(ch, face, fr) : ch[face][fr]; };
const headTop = img => { if (img._top !== undefined) return img._top; const d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data; let t = 0; outer: for (; t < img.height; t++) for (let x = 0; x < img.width; x++) if (d[(t * img.width + x) * 4 + 3]) break outer; return (img._top = t); };
function drawUmbrella(c, x, y, col, face, img) {
  const side = face === 'SW' || face === 'NW' ? -1 : 1, back = face === 'NE' || face === 'NW', [a, b] = P(x, y), head = R(b) - FOOT * K + 2 + (img ? headTop(img) : 6);   // the canopy sits just over this person's own head
  const top = head - 11, hand = head + 22, cx = R(a) + side * (back ? 2 : 5);
  c.fillStyle = '#4a3a3a'; if (!back) { c.fillRect(cx, top, 2, hand - top + 2); c.fillRect(cx - 1, hand + 1, 3, 2); } else c.fillRect(cx, top, 2, 12);   // short pole into the raised hand; from behind the hand is hidden, only the top of the pole shows
  for (let r = 0; r < 12; r++) { const w = R(Math.sqrt(1 - ((11 - r) / 12) ** 2) * 28); c.fillStyle = r < 3 ? shade(col, 22) : r > 9 ? shade(col, -26) : col; c.fillRect(cx - w, top - 12 + r, w * 2, 1); }
  c.fillStyle = shade(col, -40); for (let k = 0; k <= 4; k++) { c.fillRect(cx - 28 + k * 14, top - 1, 1, 2); c.fillRect(cx - 14 + k * 7, top - 11, 1, 10); }
  c.fillStyle = '#2a2024'; c.fillRect(cx, top - 15, 2, 3);
}
function drawOutdoor(c) {   // umbrellas over everyone outside, then the weather on top
  const L = [];
  for (const w of WALKERS) L.push([w.x, w.y, w, w.stop > 0 ? 'NE' : w.dir > 0 ? 'SE' : 'NW']);
  for (const o of CUST) if (!o.sitting) { const p = custPos(o); L.push([p.x, p.y, o, custFace(o)]); }
  for (const d of DINERS) if (d.state === 'in' || d.state === 'out') L.push([d.x, d.y, d, d.face]);
  for (const w of LEAVERS) L.push([w.x, w.y, w, w.face]);
  for (const [x, y, who, face] of L) { const seed = who._us || (who._us = Math.floor(Math.random() * 1e6)), col = umbrellaFor(who, x, y, seed); if (col) drawUmbrella(c, x, y, col, face, (who.ch && who.ch[face] || [])[0]); }
  drawWeather(c);
}
function render(c) {
  BTNS.length = 0;
  c.save(); c.translate(-camX, 0); drawWorld(c); if (PHASE !== 'title') drawOutdoor(c); c.restore();
  { const wx = wxNow(); if (wx.rain) { c.save(); c.globalAlpha = [0, .025, .05, .09][wx.rain]; c.fillStyle = '#3a4a64'; c.fillRect(0, 0, 720, 1280); c.restore(); } else if (wx.snow) { c.save(); c.globalAlpha = .07; c.fillStyle = '#dce8ff'; c.fillRect(0, 0, 720, 1280); c.restore(); } }
  c.save(); c.scale(K, K); c.imageSmoothingEnabled = false;
  if (PHASE !== 'title') { c.save(); c.translate(-camX / K, 0); drawWorldText(c); c.restore(); }
  drawHUD(c);
  drawPanels(c);
  if (tourOn()) drawTour(c);   // first-day tour on top of everything
  c.restore();
}
