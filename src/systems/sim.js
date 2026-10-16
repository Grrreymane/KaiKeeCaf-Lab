// ==== sim: customers (shop / window bar / booths), staff jobs, waiter, takeaway window, trays, bubbles
// Shop route (world units): street -> door -> up the right aisle -> along y 262 -> up the middle column (every table and
// the fridge touches it: this is where they pick things up) -> pay at the till -> down the left aisle (window stools) -> out.
// The route is planned (rebuildPath) whenever the furniture changes: from the door it threads past every open shelf by
// pathfinding, then always ends the same way — the queue along the counter to the till, down the window aisle, out.
let PATH = [[-140, 338], [259, 338], [259, 262], [172, 262], [172, 58], [64, 58], [64, 286], [292, 286], [292, 338], [640, 338]];
let PAY = 5; const SPEED = 30, GAP = 24;
let DIST = [0], LEN = 0;
function setPath(pts) { PATH = pts; DIST = [0]; for (let i = 1; i < PATH.length; i++) DIST.push(DIST[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1])); LEN = DIST[DIST.length - 1]; }
setPath(PATH);
const DOOR = [259, 338], QUEUE_IN = [172, 58], TILL_AT = [64, 58], AISLE_END = [64, 286], STREET_OUT = [292, 338];
const navFree = (x, y) => { const g = navGrid(), cx = Math.floor((x - NAV_X0) / NAV_C), cy = Math.floor(y / NAV_C); return cx >= 0 && cy >= 0 && cx < NAV_W && cy < NAV_H && !g[cy * NAV_W + cx]; };
function aisleSpot(id, from) {   // the free spot beside a shelf nearest to where we are (one step off each side's middle)
  const o = SHELF[id].obj, cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2, gap = 9;
  const c = [[cx, o.y0 - gap], [cx, o.y1 + gap], [o.x0 - gap, cy], [o.x1 + gap, cy]].filter(([x, y]) => navFree(x, y));
  return c.sort((a, b) => Math.hypot(a[0] - from[0], a[1] - from[1]) - Math.hypot(b[0] - from[0], b[1] - from[1]))[0] || null;
}
function rebuildPath() {   // door → every open shelf (nearest next) → the queue lane → till → window aisle → street
  const pts = [[-140, 338], DOOR.slice()], add = r => { if (r) for (const p of r.slice(1)) { const L_ = pts[pts.length - 1]; if (Math.abs(L_[0] - p[0]) > .5 || Math.abs(L_[1] - p[1]) > .5) pts.push(p); } return !!r; };
  let cur = DOOR; const left = SHELF_IDS.filter(id => SHELF[id] && !W.shelves[id].locked);
  while (left.length) {
    let bi = 0, bd = 1e9; left.forEach((id, i) => { const o = SHELF[id].obj, d = Math.hypot((o.x0 + o.x1) / 2 - cur[0], (o.y0 + o.y1) / 2 - cur[1]); if (d < bd) { bd = d; bi = i; } });
    const id = left.splice(bi, 1)[0], sp = aisleSpot(id, cur); if (!sp) continue;
    if (add(navRoute(cur, sp))) cur = sp;
  }
  if (!add(navRoute(cur, QUEUE_IN))) pts.push(QUEUE_IN.slice());
  pts.push(TILL_AT.slice()); const pay = pts.length - 1; pts.push(AISLE_END.slice());
  if (!add(navRoute(AISLE_END, STREET_OUT))) pts.push([292, 286], STREET_OUT.slice()); pts.push([640, 338]);
  for (let i = pts.length - 2; i > 0; i--) { const a = pts[i - 1], b = pts[i], c = pts[i + 1]; if (i !== pay && i !== pay + 1 && ((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1]))) pts.splice(i, 1); }   // drop points in the middle of straight runs
  PAY = pts.findIndex(p => p[0] === TILL_AT[0] && p[1] === TILL_AT[1]); setPath(pts);
}
// can everyone still get where they need to go? (shelves from the door, the till, the way out, the booths for waiters and diners)
function routesOpen() {
  NAV = null; let ok = true; const from = DOOR;
  for (const id of SHELF_IDS) if (SHELF[id] && !W.shelves[id].locked) { const sp = aisleSpot(id, from); if (!sp || !navRoute(from, sp)) { ok = false; break; } }
  if (ok && !navRoute(from, QUEUE_IN)) ok = false;
  if (ok && !navRoute(AISLE_END, STREET_OUT)) ok = false;
  if (ok) for (const st of SEATS) { const p = seatPos(st); if (!navRoute([-140, 338], [p.X - 7, p.y]) || !navRoute(HOME, [p.X - 7, p.y])) { ok = false; break; } }
  NAV = null; return ok;
}
function posOn(pts, d) {   // point at distance d along a polyline (+ which way it faces)
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= acc + L || i === pts.length - 1) { const t = L ? clamp((d - acc) / L, 0, 1) : 1, dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1]; return { x: pts[i - 1][0] + dx * t, y: pts[i - 1][1] + dy * t, face: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'SE' : 'NW') : (dy > 0 ? 'SW' : 'NE') }; }
    acc += L;
  }
  return { x: pts[0][0], y: pts[0][1], face: 'SE' };
}
const polyLen = pts => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
function posAt(s) {
  if (s <= 0) return { x: PATH[0][0] + s, y: PATH[0][1], seg: 0 };
  for (let i = 1; i < PATH.length; i++) if (s <= DIST[i]) { const t = (s - DIST[i - 1]) / (DIST[i] - DIST[i - 1]); return { x: PATH[i - 1][0] + (PATH[i][0] - PATH[i - 1][0]) * t, y: PATH[i - 1][1] + (PATH[i][1] - PATH[i - 1][1]) * t, seg: i - 1 }; }
  return { x: PATH[PATH.length - 1][0], y: PATH[PATH.length - 1][1], seg: PATH.length - 2 };
}
// where a shop customer actually stands: on the route plus a small sideways drift (they don't walk in a single file)
function custPos(c) {
  const p = posAt(c.s), a = PATH[p.seg], b = PATH[p.seg + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const inside = c.s > DIST[1] + 40 && c.s < DIST[PAY] - 30, o = inside ? c.off + Math.sin(c.dist * .035 + c.ph) * 6 + Math.sin(c.dist * .011 + c.ph * 2) * 3 : 0;   // a lazy weave through the aisles
  const q = { x: p.x - (b[1] - a[1]) / L * o, y: p.y + (b[0] - a[0]) / L * o, seg: p.seg };
  const B = c.browse; if (B) { const K = B.keys; let i = 0; while (i < K.length - 2 && B.t > K[i + 1].t) i++;   // browsing: follow the little walk round the shelf
    const a = K[i], b = K[i + 1], u = b.t > a.t ? clamp((B.t - a.t) / (b.t - a.t), 0, 1) : 1, e = u * u * (3 - 2 * u);
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, seg: q.seg, moving: (b.x !== a.x || b.y !== a.y) && u > 0 && u < 1, mv: [b.x - a.x, b.y - a.y], side: a.side && b.side }; }
  return q;
}
// a browse walk: up to the shelf, a sidestep along its edge (facing it), and now and then round a corner to look at another side, then back
function browsePlan(c, id, p0, keen) {
  const o = SHELF[id].obj, g = 7, s0 = browseSpot(id, p0.x, p0.y), onX = Math.abs(s0[1] - (o.y0 - g)) < 1 || Math.abs(s0[1] - (o.y1 + g)) < 1;   // which side we arrive at
  const K = [{ t: 0, x: p0.x, y: p0.y }], sp = 26; let t = 0;
  const go = (x, y, side, pause) => { const L_ = K[K.length - 1]; t += Math.hypot(x - L_.x, y - L_.y) / sp; K.push({ t, x, y, side }); if (pause) { t += pause; K.push({ t, x, y, side }); } };
  go(s0[0], s0[1], false, keen ? .7 : .4);
  const slide = (rng() < .5 ? -1 : 1) * (12 + rng() * 10);   // sidestep along the edge
  if (onX) go(clamp(s0[0] + slide, o.x0 + 2, o.x1 - 2), s0[1], true, keen ? .8 : .3); else go(s0[0], clamp(s0[1] + slide, o.y0 + 2, o.y1 - 2), true, keen ? .8 : .3);
  if (keen && rng() < .4) {   // round the corner to the next side, look, come back
    const L_ = K[K.length - 1], cx = L_.x < (o.x0 + o.x1) / 2 ? o.x0 - g : o.x1 + g, cy = L_.y < (o.y0 + o.y1) / 2 ? o.y0 - g : o.y1 + g;
    go(cx, cy, false, 0); if (onX) go(cx, (o.y0 + o.y1) / 2, true, .7); else go((o.x0 + o.x1) / 2, cy, true, .7); go(cx, cy, false, 0);
  }
  go(s0[0], s0[1], false, 0); go(p0.x, p0.y, false, 0);
  return { id, t: 0, T: t, keys: K, walk: 0 };
}
// the spot a customer stands at to look over a shelf: the nearest point of its edge, a step back from it
function browseSpot(id, x, y) { const o = SHELF[id].obj, nx = clamp(x, o.x0, o.x1), ny = clamp(y, o.y0, o.y1), dx = x - nx, dy = y - ny, d = Math.hypot(dx, dy) || 1; return [nx + dx / d * 7, ny + dy / d * 7]; }
const faceTo = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'SE' : 'NW') : (dy > 0 ? 'SW' : 'NE');
// which way a customer faces: along the route, or turned to the front while picking / looking around
function custFace(c) {
  const B = c.browse; if (B) { const o = SHELF[B.id].obj, p = custPos(c);   // along the shelf (and standing at it) they face it; going round a corner, the way they walk
    if (p.moving && !p.side) return faceTo(p.mv[0], p.mv[1]); return faceTo((o.x0 + o.x1) / 2 - p.x, (o.y0 + o.y1) / 2 - p.y); }
  return c.look > 0 && c.lookFace ? c.lookFace : faceOf(posAt(c.s).seg);
}
function faceOf(seg) { const a = PATH[seg], b = PATH[seg + 1], dx = b[0] - a[0], dy = b[1] - a[1]; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'SE' : 'NW') : (dy > 0 ? 'SW' : 'NE'); }

let rng = Math.random;   // tests can swap in a seeded one
const pick = a => a[Math.floor(rng() * a.length)];
const weighted = ps => { let r = rng() * ps.reduce((a, p) => a + wantOf(p), 0); for (const p of ps) { r -= wantOf(p); if (r <= 0) return p; } return ps[ps.length - 1]; };

// ---------------------------------------------------------------- shelves, furniture groups, seats
const SHELF = {}, MOV = [];
function bindShelves() { for (const id of SHELF_IDS) { const obj = TABLES[id]; SHELF[id] = { id, obj, st: W.shelves[id] }; obj.shelf = W.shelves[id]; obj.shelfId = id; } }
// decor: rebuild a shelf with its tier / facing, keep where the player put it
function rebuildShelf(id) {
  const old = TABLES[id], g = old.grp, o = shelfObj(id), dx = g.dx, dy = g.dy;
  STATICS[STATICS.indexOf(old)] = o; TABLES[id] = o; g.objs[g.objs.indexOf(old)] = o; o.grp = g; g.dx = 0; g.dy = 0; moveGroup(g, dx, dy);
  if (SHELF[id]) { SHELF[id].obj = o; o.shelf = W.shelves[id]; o.shelfId = id; }
}
function shelfCaps(id) { const t = (W.decor.tier || {})[id] || 0, base = isFridge(id) ? [3, 6] : [6, 6]; W.shelves[id].layers.forEach((L, li) => { L.cap = Math.round(base[li] * SHELF_TIERS[t].cap / 6); L.n = Math.min(L.n, L.cap); }); }
let BG_WALL = 'mint', BOOTH_DONE = 'green';
function applyDecor() {   // after loading / buying: wallpaper, booth style, shelf tiers + facing, plant facing
  const d = W.decor;
  const bgKey = d.wall + ':' + expandLv() + ':' + upLv('ac') + ':' + Object.keys(DECOR_ITEMS).filter(id => DECOR_ITEMS[id].cat === 'wall' && hasItem(id)).join() + ':' + keepList('w').join() + ':' + JSON.stringify(W.wallSlot || {}) + ':' + PIDS.filter(p => unlocked(p)).map(p => p + priceOf(p)).join();
  if (BG && BG_WALL !== bgKey) { drawBackground(BG.getContext('2d')); BG_WALL = bgKey; }
  applyExpand(); applyRooms(); applyExtraShelves(); applyItems(); applyCounterGifts(); applyKeepsakes();
  W.sets = W.sets || {}; for (const S of DECOR_SETS) if (setDone(S) && !W.sets[S[0]]) { W.sets[S[0]] = W.day; if (PHASE !== 'title') notice('搭配完成「' + S[0] + '」舒适 +' + S[2]); }
  if (BOOTH_DONE !== d.booth) { restyleBooths(); BOOTH_DONE = d.booth; }
  for (const id of SHELF_IDS) { if (TABLES[id]._key !== ((d.tier[id] || 0) + ':' + (d.rot[id] || 0) + ':' + (isFridge(id) ? 1 : 0))) rebuildShelf(id); shelfCaps(id); }
  for (const id of ['P1', 'P2']) { const g = MOV.find(m => m.id === id), want = !!d.rot[id]; if (g && !!g.objs[0]._flip !== want) { const o = g.objs[0]; o.cv = flipC(o.cv); o._flip = want; o._a = null; } }
  computeStops(); redoShadows(); RINGS.clear();
}
function group(id, name, objs) { const g = { id, name, objs, dx: 0, dy: 0 }; objs.forEach(o => { o.grp = g; }); MOV.push(g); return g; }
function moveGroup(g, dx, dy) {
  for (const o of g.objs) {
    const dsx = K * (dx - dy), dsy = (dx + dy) * K / 2;
    o.x0 += dx; o.x1 += dx; o.y0 += dy; o.y1 += dy; o.sx += dsx; o.sy += dsy; o.bx0 += dsx; o.bx1 += dsx; o.by0 += dsy; o.by1 += dsy;
    if (o.base) for (const q of [o.base, ...o.parts, o.sheet]) if (q) { q.sx += dsx; q.sy += dsy; }
  }
  g.dx += dx; g.dy += dy;
}
let STOPS = [];
function computeStops() {   // where along the route a customer can reach each shelf (nearest point before the till, within reach)
  STOPS = []; NAV = null;   // furniture changed: the walking grid is rebuilt on the next route
  if (W) rebuildPath();   // and the customers' route through the shop is planned again
  for (const id of SHELF_IDS) {
    const sh = SHELF[id], o = sh.obj; if (sh.st.locked) continue;
    let best = null;
    for (let i = 1; i <= PAY - 1; i++) {
      const [ax, ay] = PATH[i], [bx_, by_] = PATH[i + 1], L = DIST[i + 1] - DIST[i];
      for (let k = 0; k <= L; k += 2) {
        const x = ax + (bx_ - ax) * k / L, y = ay + (by_ - ay) * k / L;
        const d = Math.hypot(Math.max(o.x0 - x, 0, x - o.x1), Math.max(o.y0 - y, 0, y - o.y1));
        if (d <= 40 && (!best || d < best.d - .01)) best = { d, s: DIST[i] + k };   // a shelf one floor tile away from the aisle is still within reach
      }
    }
    if (best) STOPS.push({ id, s: best.s });
  }
  STOPS.sort((a, b) => a.s - b.s);
}
const reachable = id => STOPS.some(t => t.id === id);
// booth seats: 2 on the front bench (face the table, we see their faces), 2 on the back bench (we see their backs)
const SEATS = [];   // { b: booth index, k, front, who, dirty, items }
function initSeats() { SEATS.length = 0; BOOTHS.forEach((B, b) => { for (const k of [0, 1]) for (const front of [true, false]) SEATS.push({ b, k, front, who: null, dirty: false, items: [] }); }); }
function seatPos(st) { const B = BOOTHS[st.b], g = B.table.grp; return { x: B.X + 12 + st.k * 22 + g.dx, y: B.y0 + (st.front ? 5 : 35) + g.dy, X: B.X + g.dx, y0: B.y0 + g.dy }; }
function standPos(st) { const p = seatPos(st); return [p.X - 7, p.y0 + 20]; }   // where the waiter stands: aisle side of the table
const DISH = paint(16, 10, G => { G.ell(8, 6, 7, 3, '#f4f1ea'); G.ell(8, 6, 4.5, 1.8, '#e3ddd0'); G.set(6, 5, '#c98f3e'); G.set(10, 6, '#c98f3e'); G.rect(11, 1, 3, 4, '#f4f1ea'); G.set(12, 2, '#b07a4a'); }, false);

// ---------------------------------------------------------------- runtime
let CUST = [], TRAYS = [], POPS = [], BUBBLES = [], WALKERS = [], DINERS = [], FLY = [], LEAVERS = [];   // LEAVERS: found nothing they want, walk straight back out   // FLY: single pieces flying shelf -> tray -> bag
const JOB = { kun: null, lin: null, bar: null, till: null };   // kun: baking; lin: { kind: 'pack' | 'brew' }; bar: brewing; till: the owner ringing up { c, t, T }
let WAITER = null, WAITERS = [];   // WAITERS: everyone on the serve post { k, x, y, task, route, d, carry }; WAITER = the one being stepped / the first
const newWaiter = (k, i) => ({ k, x: 244 - i * 10, y: 56, task: null, route: null, d: 0, carry: [], face: 'SW' });
const ORDERS = [];   // dine-in items ordered but not yet picked up: { p }
let TIDY_T = 6, AUTOBUY_T = 4, spawnT = 2, refillT = 0, bubbleT = 0, takeT = 6, LAST_GRIPE = null;
const inflight = {};
function resetRuntime() {
  CUST = []; TRAYS = []; POPS = []; BUBBLES = []; DINERS = []; FLY = []; LEAVERS = []; ORDERS.length = 0; JOB.kun = JOB.lin = JOB.bar = JOB.bar2 = JOB.till = null; spawnT = 2; takeT = 6;
  for (const k in inflight) delete inflight[k];
  WALKERS = WALKERS.filter(w => !w.temp); for (const w of WALKERS) { w.stop = 0; w.buy = null; }
  for (const s of SEATS) { s.who = null; s.dirty = false; s.items = []; }
  WAITERS = postsOf('serve').map(newWaiter); WAITER = WAITERS[0] || null;
  if (TAKEAWAY) TAKEAWAY.open = !!postOf('take');
}
function shelfCap(p) { let n = 0; for (const id of SHELF_IDS) { const st = W.shelves[id]; if (!st.locked) for (const L of st.layers) if (L.p === p) n += L.cap; } return n; }
function shelfHave(p) { let n = 0; for (const id of SHELF_IDS) { const st = W.shelves[id]; if (!st.locked) st.layers.forEach((L, i) => { if (L.p === p) n += L.n + (inflight[id + ':' + i] || 0); }); } return n; }
const offered = p => shelfCap(p) > 0;
const queueLen = () => CUST.filter(c => c.s > DIST[PAY - 1] - 40 && c.s <= DIST[PAY] && !c.paid).length;
const ordered = p => ORDERS.filter(o => o.p === p).length;
const takeOpen = () => !!(TAKEAWAY && TAKEAWAY.open);
// how many pieces of p the kitchen should keep on hand beyond the shelves: dine-in orders + a takeaway reserve
const reserve = p => ordered(p) + (W.showcase === p ? 6 : 0) + (takeOpen() && PRODUCTS[p].where === 'table' && W.plan[p] !== 'off' ? (W.plan[p] === 'pri' ? 8 : 4) : 0) + (WAITER && W.plan[p] !== 'off' && PRODUCTS[p].where === 'fridge' ? 3 : 0);

// ---------------------------------------------------------------- spawning
function spawnRate() {
  const tod = clamp(clockOpen / OPEN_LEN, 0, 1), g = (m, w) => Math.exp(-((tod - m) ** 2) / (2 * w * w));
  const curve = .55 + .9 * g(.12, .06) + 1.0 * g(.45, .07) + .7 * g(.7, .06);   // breakfast, lunch, afternoon tea
  return .3 * curve * (.6 + W.rep * .12) * (W.day === 1 ? .85 : 1) * [1, 1.2, 1.3, 1.4][upLv('sign')] * (1 + .05 * upLv('ads')) * (hasPerk('shao_lure') ? 1.08 : 1) * (1 + beauty() * .015) * (beautyLv() >= 2 ? 1.05 : 1) * (beautyLv() >= 3 ? 1.1 : 1) * wxOf().rate * priceTier().rate * (hasPerk('qing_student') ? 1.06 : 1) * (1 + comfort() * .01) * (1 + .03 * festive()) * dirtSlow() * vipMul() * (W.today && W.today.crowdUntil > clockOpen ? 1.4 : 1) * (W.rival && W.day <= W.rival.until ? .85 : 1);   // comfort brings people in; festive pieces in season too   // a nicer shop draws more people; weather, prices
}
function freshLook() { const pool = guestPool(), used = new Set([...CUST, ...DINERS].map(c => c.ci)), free = pool.filter(i => !used.has(i)); return pick(free.length ? free : pool); }   // only the kinds of customer that have started coming
function spawnCustomer(force) {
  // sit-down guests need a waiter and a clean free seat
  const seats = SEATS.filter(s => !s.who && !s.dirty);
  const cap = Math.max(6, Math.min(SEATS.length * .6, 6 * WAITERS.length)), near = seats.filter(s => seatPos(s).X < 318);   // as many diners as the waiters can look after; the booths near the door fill first
  if (!force && WAITER && seats.length && DINERS.length < cap && rng() < .3 * (1 + .12 * Math.min(expandLv(), WAITERS.length)) * (wxOf().dine || 1)) return spawnDiner(pick(near.length ? near : seats));
  if (CUST.length >= 12) return;
  if (!force && queueLen() >= 5) {   // they look at the queue from the street and walk on
    const w = { ch: GUEST_HD[pick(guestPool())], y: 338, dir: 1, v: 30, x: 150, dist: 0, temp: true };
    WALKERS.push(w); say(w, '排好长…下次再来', true); W.today.lost++; gripe('long'); return;
  }
  const ci = force ? force.ci : freshLook(), avail = PIDS.filter(unlocked), n = rng() < .55 ? 1 : rng() < .73 ? 2 : 3, wants = [];
  const per = personaOf(ci), likeW = ps => { let r = rng() * ps.reduce((a, p) => a + wantOf(p) * (per.likes[p] || 1) * labLike(ci, p), 0); for (const p of ps) { r -= wantOf(p) * (per.likes[p] || 1) * labLike(ci, p); if (r <= 0) return p; } return ps[ps.length - 1]; };
  const [itemMax, budget] = wealthOf(ci), afford = avail.filter(p => priceOf(p) <= itemMax);   // what this kind of guest can pay for
  let spend = 0; for (let i = 0; i < n + (per.extra || 0) && afford.length; i++) { const p = likeW(afford); if (spend + priceOf(p) > budget) break; spend += priceOf(p); wants.push(p); }   // taste of this kind of guest, within their budget
  const c = { ci, ch: GUEST_HD[ci], s: -20, wants: force ? force.wants : wants, got: {}, done: new Set(), hold: 0, wait: 0, moved: 0, dist: 0, missed: new Set(), paid: false, spent: 0, vip: force && force.vip, tag: !force && W.day >= 3 && rng() < .18 ? 'hurry' : null, pace: .82 + rng() * .36, off: (rng() - .5) * 8, ph: rng() * 6, look: 0, lookFace: null };
  if (c.tag === 'hurry') c.pace *= 1.3;
  if (!force && !wants.length && avail.length) { c.broke = true; }   // everything is too dear for them: they look, then leave
  dirtAdd(mudOf());   // muddy shoes on a wet day
  CUST.push(c); SFX.bell(); return c;
}
function spawnDiner(st) {
  const ci = freshLook(), p = seatPos(st), avail = PIDS.filter(q => unlocked(q) && W.plan[q] !== 'off');
  const drinks = avail.filter(q => PRODUCTS[q].where === 'fridge'), food = avail.filter(q => PRODUCTS[q].where === 'table');
  const [im, bud] = wealthOf(ci), ok = q => priceOf(q) <= im, dr = drinks.filter(ok), fd = food.filter(ok), wants = []; let spend = SEAT_FEE;   // a sit-down meal within their budget (the seat fee counts)
  for (const L of [dr, fd, rng() < .4 ? fd : []]) if (L.length) { const q = weighted(L); if (spend + priceOf(q) <= bud) { wants.push(q); spend += priceOf(q); } }
  if (!wants.length) return;
  const tag = W.day >= 3 ? (rng() < .2 ? 'chill' : rng() < .18 ? 'hurry' : null) : null;
  if (tag === 'chill' && drinks.length) wants.push(weighted(drinks));
  const nav = navRoute([-140, 338], [p.X - 7, p.y]), route = nav ? nav.concat([[p.x, p.y]]) : p.X > 318 ? [[-140, 338], [259, 338], [259, AISLE_Y], [p.X - 7, AISLE_Y], [p.X - 7, p.y], [p.x, p.y]] : [[-140, 338], [259, 338], [259, p.y], [p.x, p.y]];   // found on the grid; fixed corridors as a fallback
  const d = { ci, ch: GUEST_HD[ci], st, route, d: 0, L: polyLen(route), state: 'in', t: 0, wants, tag, svc: 0, x: route[0][0], y: route[0][1], face: 'SE', walk: 0 };
  st.who = d; DINERS.push(d); SFX.bell();
}

// ---------------------------------------------------------------- shop customers (and the window-bar eaters among them)
function tryTake(c, id) {
  const st = W.shelves[id]; let took = 0; const need = {};
  for (const p of c.wants) need[p] = (need[p] || 0) + 1;
  for (const p in need) {
    let k = need[p] - (c.got[p] || 0); if (k <= 0) continue;
    let had = false;
    st.layers.forEach((L, li) => { if (L.p !== p) return; had = true; const t = Math.min(k, L.n); for (let q = 0; q < t; q++) { L.n--; const o = SHELF[id].obj, sp = o.spots[li][Math.min(L.n, o.spots[li].length - 1)]; FLY.push({ p, c, from: [o.sx + sp[0], o.sy + sp[1] - 10], t: -q * .12, T: .45 }); } k -= t; took += t; c.got[p] = (c.got[p] || 0) + t; });
    if (had && k > 0) c.missed.add(p);
  }
  if (took) addOn(c, id);
  return took;
}
// display combos: a combo partner on the same or the next shelf -> some customers pick it up as well (顺手加购)
const shelfNear = (a, b) => { const A = SHELF[a].obj, B = SHELF[b].obj; return a === b || (Math.max(A.x0, B.x0) - Math.min(A.x1, B.x1) < 30 && Math.max(A.y0, B.y0) - Math.min(A.y1, B.y1) < 30); };
function addOn(c, id) {
  if (c.addon) return;   // once per visit
  for (const k of COMBOS) for (const [p, q] of [[k.a, k.b], [k.b, k.a]]) {
    if (!c.got[p] || c.wants.includes(q) || rng() > (promoOn('combo') ? .5 : .28)) continue;
    for (const sid of SHELF_IDS) { const st = W.shelves[sid]; if (st.locked || !shelfNear(id, sid)) continue;
      const li = st.layers.findIndex(L => L.p === q && L.n > 0); if (li < 0) continue;
      const L = st.layers[li]; L.n--; c.wants.push(q); c.got[q] = (c.got[q] || 0) + 1; c.addon = true; W.today.addon = (W.today.addon || 0) + 1;
      const o = SHELF[sid].obj, sp = o.spots[li][Math.min(L.n, o.spots[li].length - 1)]; FLY.push({ p: q, c, from: [o.sx + sp[0], o.sy + sp[1] - 10], t: .2, T: .45 });
      const [a, b] = whereIs(c); POPS.push({ x: a, y: b - 64, t: 0, text: '顺手加购', small: true }); return; }
  }
}
function checkoutTime(c, packer) { const n = Object.values(c.got).reduce((a, b) => a + b, 0); return (1.6 + .4 * n) * [1, .6, .5, .4][upLv('till')] * (hasPerk('lin_pack') ? .8 : 1) * (packer ? .7 : 1) * (W.xf ? .75 : 1); }   // Lin packing alongside = 30% quicker
function comboBonus(got) { let b = 0; for (const k of COMBOS) if (got[k.a] && got[k.b]) { b += k.bonus * Math.min(got[k.a], got[k.b]) * (promoOn('combo') ? 2 : 1); W.today.combos++; } return b; }
function earn(amt, x, y, text) { W.money += amt; W.today.revenue += amt; W.pts = (W.pts || 0) + 1; W.today.pts = (W.today.pts || 0) + 1; /* every sale is also a point */ POPS.push({ x, y, t: 0, text: text || '+$' + amt }); SFX.coin(); }
function finishPay(c) {
  { const sp = W.showcase, [im, bud] = wealthOf(c.ci); if (sp && unlocked(sp) && W.stock[sp] - ordered(sp) > 0 && priceOf(sp) <= im && rng() < .2 && Object.keys(c.got).reduce((a, q) => a + c.got[q] * priceOf(q), 0) + priceOf(sp) <= bud) {   // eyes the signature case at the till and takes one
    W.stock[sp]--; c.got[sp] = (c.got[sp] || 0) + 1; W.today.showcase = (W.today.showcase || 0) + 1; if (rng() < .5) say(c, '再要件' + PRODUCTS[sp].name + '！', false); } }
  let amt = 0; for (const p in c.got) { amt += c.got[p] * priceOf(p); W.today.sold[p] += c.got[p]; }
  const bonus = comboBonus(c.got); amt += bonus;
  c.paid = true; c.spent = amt; W.today.served++; dirtAdd(.45);   // crumbs, a dropped napkin
  const [x, y] = P1(48, 36, 62); earn(amt, x, y, '+$' + amt + (bonus ? ' 套餐' : ''));
  { const tip = c.tag === 'hurry' ? (c.wait < 4 ? 2 : 0) : c.wait < 2 && rng() < .2 ? 1 : 0;   // tips follow how long they waited
    if (tip) { earn(tip, x, y - 14, '小费 +$' + tip); W.today.tips = (W.today.tips || 0) + tip; W.today.quick++; if (c.tag === 'hurry') say(c, '快手！唔该晒', false); } }
  if (c.vip) { earn(200, x, y - 14, '红包 +$200'); say(c, '好叻呀！我哋好开心', false); W.seen.parents = true; playScene('parents'); }
  // a free window stool: some sit down and eat (self service, they leave on their own)
  const free = STOOLS.filter(y => !CUST.some(o => o.stool === y));
  if (free.length && rng() < .4) { c.stool = pick(free); c.eatT = 9 + rng() * 5; c.eatP = Object.keys(c.got)[0]; }
}
function leaveShop(c) {
  const wanted = new Set(c.wants), gotAll = [...wanted].every(p => c.got[p]);
  let st = 5; for (const p of wanted) if (!c.got[p]) st -= 1;
  if (c.wait > 9) st -= 1; if (c.wait > 18) st -= 1; if (dirtOf() > 60 && c.paid) { st -= 1; if (rng() < .3) { gripe('dirty'); say(c, pick(['地下好污糟…', '枱面黐笠笠', '执下啦老板']), true); } } if (c.tag === 'hurry' && c.wait > 6) st -= 1; if (!c.paid) st = 1;
  W.today.stars.push(clamp(st, 1, 5)); fanOf(c.ci, st);
  // now and then a parting remark that matches how it went
  const got = Object.keys(c.got), r = rng();
  if (!c.paid) { if (!c.quiet && r < .5) say(c, pick(['冇嘢买…', '下次早啲嚟']), true); }
  else if (!gotAll && r < .4) { const miss = [...wanted].find(p => !c.got[p]); say(c, sayP(personaOf(c.ci).miss, miss), true); }
  else if (c.wait > 9 && r < .3) say(c, pick(['等得有啲耐…', '收银快啲就好喇']), true);
  else if (gotAll && r < .35) say(c, rng() < .6 ? sayP(personaOf(c.ci).happy) : pick([PRODUCTS[pick(got)].name + '好味！', '下次再来！', COMBOS.some(k => c.got[k.a] && c.got[k.b]) ? '套餐抵食！' : '街坊价，抵！']), false);
}
function fanOf(ci, st) {   // happy visits by this kind of customer add up; at GIFT_AT one of them brings a present (once per kind)
  const kind = GUEST_DEF[ci] && GUEST_DEF[ci].name; if (!kind || !W) return; W.fans = W.fans || {}; W.gifted = W.gifted || {};
  W.fans[kind] = Math.max(0, (W.fans[kind] || 0) + (st >= 5 ? 1 : st <= 2 ? -1 : 0));
  if (W.fans[kind] >= LOYAL_STORY) loyalStory(kind, ci);   // a true regular: their own scene + a keepsake (guests.js)
  if (W.fans[kind] < GIFT_AT || W.gifted[kind]) return;
  W.gifted[kind] = true;
  const id = GIFT_ITEM[kind], it = id && !hasItem(id) && DECOR_ITEMS[id]; if (!it) return;   // their own piece, once
  if (it) { let pos = null; if (it.cat !== 'wall') pos = findItemSpot(); if (it.cat === 'wall' || pos) { (W.items = W.items || {})[id] = true; if (pos) { (W.itemPos = W.itemPos || {})[id] = pos; GIFT_PLACE = id; } applyDecor(); } }
  else { (W.items = W.items || {})[id] = true; }   // no room on the floor right now: it waits for 摆放
  STORY_Q.push({ key: 'gift', ci, lines: [[null, '一位' + kind + '熟客走到收银台。'], ...(GIFT_THANKS[kind] || [['cust', '常来光顾，你们招呼得很好。这个送给你！']]).filter(([w]) => !HIRE[w] || W.staff[w].hired), [null, '收到「' + it.name + '」' + (it.cat === 'wall' ? '，已经挂好了。' : '。')]] });
  NOTICES.push('熟客送礼：' + it.name); SFX.ding();
}
function gripe(k) { W.today.gripes[k] = (W.today.gripes[k] || 0) + 1; LAST_GRIPE = { k, t: 0 }; }
function stepCustomers(dt) {
  const order = CUST.filter(c => !c.sitting).sort((a, b) => b.s - a.s);
  const hurry = PHASE === 'closing' ? 1.6 : 1;
  for (const c of CUST) if (c.sitting) { c.sitting.t -= dt; c.moved = 0; if (c.sitting.t <= 0) { c.sitting = null; c.ate = true; } }
  order.forEach((c, i) => {
    const prev = c.s;
    if (c.look > 0) c.look -= dt;
    if (c.browse) { c.browse.t += dt; if (custPos(c).moving) c.browse.walk += dt * 26; if (c.browse.t >= c.browse.T) c.browse = null; }
    if (c.hold > 0) { c.hold -= dt; c.moved = c.browse ? .001 : 0; return; }
    const browsing = c.s > DIST[1] + 60 && c.s < DIST[PAY] - 60 && !c.done.has('pay');
    if (browsing && c.look <= 0 && rng() < dt * .08) {   // stop for a moment, turn round and look at the shop
      const f = faceOf(posAt(c.s).seg); c.lookFace = f === 'NE' || f === 'SE' ? 'SE' : 'SW'; c.look = 1.2 + rng() * 1.6; c.hold = c.look; c.moved = 0; return;
    }
    if (c.atTill) {   // at the till: the owner rings up one at a time; Lin bags it if she is free
      if (!JOB.till) { const [bx_, by_] = P(84, 40, 42), [tx, ty] = trayAt(c); (c.onTray || []).forEach((q, i) => FLY.push({ p: q, from: [tx + (i - 1) * 7, ty], to: [bx_, by_], t: -i * .1, T: .4 })); c.onTray = []; const packer = !JOB.lin; JOB.till = { c, t: 0, T: checkoutTime(c, packer) }; if (packer) JOB.lin = { kind: 'pack', t: 0, T: JOB.till.T, items: Object.keys(c.got) }; }
      if (JOB.till.c === c) { c.moved = 0; return; }
      c.wait += dt; return;
    }
    let want = c.s + SPEED * hurry * (c.pace || 1) * dt;
    for (const t of STOPS) if (!c.done.has(t.id) && c.s <= t.s && want >= t.s) {   // <=: two shelves can share one spot
      want = t.s; c.done.add(t.id); { const p0 = custPos(c), got = tryTake(c, t.id) > 0, wants = c.wants.some(q => W.shelves[t.id].layers.some(L => L.p === q));   // walks up to the shelf, turns to it, picks, steps back
        if (got || wants || rng() < .35) { c.browse = browsePlan(c, t.id, p0, got || wants); c.hold = c.browse.T; } } break;
    }
    if (!c.done.has('pay') && c.done.size && !Object.keys(c.got).length) {
      const ahead = STOPS.filter(t => !c.done.has(t.id) && t.s >= c.s);
      if (!c.wants.some(p => ahead.some(t => W.shelves[t.id].layers.some(L => L.p === p && L.n > 0)))) { if (c.broke) { gripe('pricey'); say(c, pick(['太贵喇…买唔起', '好贵呀…', '零用钱唔够…']), true); } walkOut(c); return; }
    }
    if (!c.done.has('pay') && c.s < DIST[PAY] && want >= DIST[PAY]) {
      want = DIST[PAY]; c.done.add('pay');
      for (const p of new Set(c.wants)) if (!c.got[p]) { if (!offered(p)) { gripe('none:' + p); if (rng() < .5) say(c, '有' + PRODUCTS[p].name + '就好了', true); } else { gripe('out:' + p); if (rng() < .6) say(c, PRODUCTS[p].name + '卖完了…', true); } }
      c.tray = false;   // the tray stays at the till (its items go into the bag)
      if (Object.keys(c.got).length) c.atTill = true; else say(c, '冇嘢买…', true);
    }
    if (!c.tray && !c.trayTaken && c.s >= DIST[1] + 64) { c.tray = c.trayTaken = true; c.hold = .35; if (rng() < .55) say(c, sayP(personaOf(c.ci).want, c.wants[0])); }   // only once, at the door; says what they came for   // picks up a tray from the stand by the door
    if (c.stool && !c.ate) {   // walking down the left aisle: sit at the stool level with us
      const sS = DIST[PAY] + (c.stool - 58);
      if (c.s <= sS && want >= sS) { want = sS; c.sitting = { t: c.eatT }; }
    }
    const lead = order[i - 1];
    if (lead && lead.s < LEN && lead.s > c.s && lead.s > DIST[PAY] - 70) want = Math.min(want, lead.s - GAP);   // only the till queue keeps a gap; in the aisles people pass each other
    c.s = Math.max(c.s, want); c.moved = c.s - prev; c.dist += c.moved;
    if (c.moved < SPEED * dt * .3 && c.s > DIST[2] && c.s < DIST[PAY] + 1) { c.wait += dt; if (c.wait > (c.tag === 'hurry' ? 5 : 9) * patience() && !c.grumbled) { c.grumbled = true; gripe('slow'); say(c, '收银好慢呀…', true); } }
    if (c.s >= LEN) c.gone = true;
  });
  for (const c of CUST) if (c.gone) leaveShop(c);
  CUST = CUST.filter(c => !c.gone);
}

// ---------------------------------------------------------------- booth diners + the waiter
function stepDiners(dt) {
  for (const d of DINERS) {
    d.t += dt;
    if (d.state === 'in' || d.state === 'out') {
      d.d += SPEED * dt; d.walk += SPEED * dt; const p = posOn(d.route, d.d); d.x = p.x; d.y = p.y; d.face = p.face;
      if (d.d >= d.L) { if (d.state === 'in') { d.state = 'wait'; d.t = 0; } else d.gone = true; }
    } else if (d.state === 'wait') {   // seated, nobody has taken the order yet
      if (d.t > 6 && !d.asked) { d.asked = true; say(d, '唔该，落单！', true); }
      if (d.t > 26 * patience() * (d.tag === 'hurry' ? .6 : 1)) leaveDiner(d, d.tag === 'hurry' ? '赶时间，唔等喇' : '等好耐都冇人招呼', 1);
    } else if (d.state === 'order') {
      if (d.t > 40 * patience() * (d.tag === 'hurry' ? .6 : 1)) { for (const p of d.wants) { const i = ORDERS.findIndex(o => o.d === d && o.p === p); if (i >= 0) ORDERS.splice(i, 1); } leaveDiner(d, '等唔到嘢食…', 1); }
    } else if (d.state === 'eat') {
      if (d.t > d.eatT) {
        let amt = 0; for (const p of d.wants) { amt += priceOf(p); W.today.sold[p]++; }
        const got = {}; for (const p of d.wants) got[p] = (got[p] || 0) + 1; amt += comboBonus(got);
        dirtAdd(1.1); const [x, y] = P1(d.x, d.y, 50); earn(amt + SEAT_FEE, x, y); W.today.served++; W.today.dine++; W.today.seat = (W.today.seat || 0) + SEAT_FEE;
        const sv = d.svc / patience() / (d.tag === 'hurry' ? .6 : 1), tier = d.slow || sv > 30 ? 0 : sv < 16 ? 2 : 1;   // service time (seated -> food) sets the tip: slow / ok / quick
        if (tier === 2) W.today.quick++;
        const tip = !tier ? (rng() < .3 ? 1 : 0) : (tier === 2 ? 2 : 0) + (d.tag ? 2 : 0) + 3 + Math.floor(rng() * 3) + (d.server ? lvOf(d.server) - 1 : 0) + ((BOOTH_STYLES[W.decor.booth] || {}).tip || 0) + (beautyLv() >= 2 ? 1 : 0) + (hasPerk('wen_care') ? 1 : 0) + (hasPerk('shao_memo') ? 2 : 0);   // tip: only when the service was quick
        if (tip) { earn(tip, x, y - 16, (tier === 2 ? '快！' : '') + '小费 +$' + tip); W.today.tips = (W.today.tips || 0) + tip; }
        W.today.stars.push(d.slow ? 4 : 5); fanOf(d.ci, d.slow ? 4 : 5); if (rng() < .4) say(d, d.slow ? pick(['等得耐咗少少', '好味，不过慢咗啲']) : pick(['坐得好舒服', '招呼周到！', '好味！', '下次带朋友嚟']), !!d.slow);
        if (d.vip) vipDone(d, vipOk(d.st) && !d.slow);
        d.st.items = []; d.st.dirty = true; leaveDiner(d);
      }
    }
  }
  DINERS = DINERS.filter(d => !d.gone);
}
function leaveDiner(d, line, stars) {
  if (line) { say(d, line, true); gripe('serve'); W.today.stars.push(stars); if (d.vip) vipDone(d, false); }
  if (d.st.who === d) d.st.who = null;
  const p = seatPos(d.st), nav = navRoute([p.X - 7, p.y], [700, 338]); d.state = 'out'; d.route = nav ? [[p.x, p.y]].concat(nav) : p.X > 318 ? [[p.x, p.y], [p.X - 7, p.y], [p.X - 7, AISLE_Y], [259, AISLE_Y], [259, 338], [700, 338]] : [[p.x, p.y], [259, p.y], [259, 338], [700, 338]]; d.d = 0; d.L = polyLen(d.route);
}
const HOME = [244, 56];   // the waiter's spot: in front of the bake counter, next to the kitchen
// ---------------------------------------------------------------- grid pathfinding (diners + waiters): a 4-unit floor grid with
// every piece of furniture blocked, A* with a small cost for turning, so people walk tidy L-shaped routes around whatever the
// player has moved. Rebuilt whenever furniture changes (NAV = null).
const NAV_X0 = -160, NAV_X1 = 720, NAV_Y1 = 348, NAV_C = 4, NAV_W = (NAV_X1 - NAV_X0) / NAV_C, NAV_H = NAV_Y1 / NAV_C;
let NAV = null;
function navGrid() {
  if (NAV) return NAV;
  const g = new Uint8Array(NAV_W * NAV_H), mark = (x0, x1, y0, y1) => { for (let cy = Math.max(0, Math.floor(y0 / NAV_C)); cy <= Math.min(NAV_H - 1, Math.floor(y1 / NAV_C)); cy++) for (let cx = Math.max(0, Math.floor((x0 - NAV_X0) / NAV_C)); cx <= Math.min(NAV_W - 1, Math.floor((x1 - NAV_X0) / NAV_C)); cx++) g[cy * NAV_W + cx] = 1; };
  mark(NAV_X0, NAV_X1, 0, 50);   // kitchen platform + counters along the back
  mark(NAV_X0, -2, 0, 318); mark(expandLv() ? 638 : 318, NAV_X1, 0, 318);   // outside the walls (left; right of the shop or of next door)
  for (const o of STATICS) { if (o.x1 - o.x0 > 400) continue; if (o.y1 <= 50) continue; mark(o.x0 - 2, o.x1 + 1, o.y0 - 2, o.y1 + 1); }
  return (NAV = g);
}
function navRoute(from, to) {   // list of points from -> to, or null
  const g = navGrid(), cell = (x, y) => [Math.max(0, Math.min(NAV_W - 1, Math.floor((x - NAV_X0) / NAV_C))), Math.max(0, Math.min(NAV_H - 1, Math.floor(y / NAV_C)))];
  const [sx, sy] = cell(...from); let [tx, ty] = cell(...to);
  if (g[ty * NAV_W + tx]) { let best = null; for (let r = 1; r < 6 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = tx + dx, y = ty + dy; if (x >= 0 && y >= 0 && x < NAV_W && y < NAV_H && !g[y * NAV_W + x] && (!best || Math.abs(dx) + Math.abs(dy) < best[2])) best = [x, y, Math.abs(dx) + Math.abs(dy)]; } if (!best) return null; [tx, ty] = best; }
  const N = NAV_W * NAV_H, cost = new Float32Array(N * 4).fill(1e9), prev = new Int32Array(N * 4).fill(-1), D = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const heap = [], push = (f, s) => { heap.push([f, s]); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const t = heap[0], l = heap.pop(); if (heap.length) { heap[0] = l; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return t; };
  for (let d = 0; d < 4; d++) { const s = (sy * NAV_W + sx) * 4 + d; cost[s] = 0; push(Math.abs(tx - sx) + Math.abs(ty - sy), s); }
  let end = -1, guard = 0;
  while (heap.length && guard++ < 200000) {
    const [, s] = pop(), c = s >> 2, d = s & 3, x = c % NAV_W, y = (c - x) / NAV_W;
    if (x === tx && y === ty) { end = s; break; }
    for (let nd = 0; nd < 4; nd++) { const nx = x + D[nd][0], ny = y + D[nd][1]; if (nx < 0 || ny < 0 || nx >= NAV_W || ny >= NAV_H || g[ny * NAV_W + nx]) continue;
      const ns = (ny * NAV_W + nx) * 4 + nd, nc = cost[s] + 1 + (nd !== d ? .6 : 0); if (nc < cost[ns]) { cost[ns] = nc; prev[ns] = s; push(nc + Math.abs(tx - nx) + Math.abs(ty - ny), ns); } }
  }
  if (end < 0) return null;
  const cells = []; for (let s = end; s >= 0; s = prev[s]) cells.push(s); cells.reverse();
  const pts = [from.slice()], cen = c => [NAV_X0 + (c % NAV_W) * NAV_C + NAV_C / 2, Math.floor(c / NAV_W) * NAV_C + NAV_C / 2];
  for (let i = 1; i < cells.length - 1; i++) if ((cells[i] & 3) !== (cells[i + 1] & 3)) pts.push(cen(cells[i] >> 2));   // corners only
  pts.push(to.slice());
  // first and last legs: keep them axis-aligned so people never slide diagonally
  if (pts.length > 2) { const a = pts[0], b = pts[1]; if (a[0] !== b[0] && a[1] !== b[1]) pts.splice(1, 0, (cells[1] & 3) % 2 ? [a[0], b[1]] : [b[0], a[1]]); }
  const n = pts.length; if (n > 2) { const a = pts[n - 2], b = pts[n - 1]; if (a[0] !== b[0] && a[1] !== b[1]) pts.splice(n - 1, 0, [a[0], b[1]]); }
  return pts;
}
const AISLE_Y = 248;   // corridor from the shop's aisle into the room next door (below the booths on both sides)
function waiterRoute(to) {
  const w = WAITER, a = w.x > 318, b = to[0] > 318, nav = navRoute([w.x, w.y], to); if (nav) return nav;
  if (!a && !b) return [[w.x, w.y], [261, w.y], [261, to[1]], to];
  if (!a) return [[w.x, w.y], [261, w.y], [261, AISLE_Y], [to[0], AISLE_Y], to];
  if (!b) return [[w.x, w.y], [w.x, AISLE_Y], [261, AISLE_Y], [261, to[1]], to];
  return [[w.x, w.y], [w.x, AISLE_Y], [to[0], AISLE_Y], to];
}
const claimLive = q => q && WAITERS.includes(q) && q.task;   // the waiter who claimed a table is still on the way
function stepWaiter(dt) { for (const w of WAITERS) { WAITER = w; stepOneWaiter(dt); } WAITER = WAITERS[0] || null; }
function stepOneWaiter(dt) {
  const w = WAITER; if (!w) return;
  if (w.route) {   // walking
    const v = 46 / lvSpeed(w.k) * (hasPerk('shao_run') ? 1.3 : 1); w.d += v * dt; w.walk = (w.walk || 0) + v * dt; const p = posOn(w.route, w.d); w.x = p.x; w.y = p.y; w.face = p.face;
    if (w.d >= polyLen(w.route)) { w.route = null; w.face = 'SW'; }
    return;
  }
  const T = w.task;
  if (T && T.act > 0) { T.act -= dt; if (T.act > 0) return; finishTask(T); w.task = null; return; }
  if (T) return;
  const atHome = Math.hypot(w.x - HOME[0], w.y - HOME[1]) < 2;
  // 0) someone has waited a while to order: go to them before anything else
  const urgent = DINERS.find(d => d.state === 'wait' && d.t > 8 && !claimLive(d.claimed));
  if (urgent) { urgent.claimed = w; w.task = { kind: 'order', d: urgent, act: 1.2 * lvSpeed(w.k) }; goTo(standPos(urgent.st)); return; }
  // 1) deliver: an order whose items are all in the kitchen (pick them up at home first)
  const ready = DINERS.find(d => d.state === 'order' && !d.served && d.wants.every(p => W.stock[p] >= d.wants.filter(q => q === p).length));
  if (ready) {
    if (!atHome) { w.route = waiterRoute(HOME); w.d = 0; return; }
    for (const p of ready.wants) { W.stock[p]--; const i = ORDERS.findIndex(o => o.d === ready && o.p === p); if (i >= 0) ORDERS.splice(i, 1); }
    ready.served = true; w.carry = ready.wants.slice(); w.task = { kind: 'deliver', d: ready, act: .8 * lvSpeed(w.k) }; goTo(standPos(ready.st)); return;
  }
  // 2) take an order
  const waiting = DINERS.find(d => d.state === 'wait' && !claimLive(d.claimed));   // claimed: another waiter is already on the way
  if (waiting) { waiting.claimed = w; w.task = { kind: 'order', d: waiting, act: 1.2 * lvSpeed(w.k) }; goTo(standPos(waiting.st)); return; }
  // 3) clear a table
  const dirty = SEATS.find(s => s.dirty && !s.who && !claimLive(s.claimed));
  if (dirty) { dirty.claimed = w; w.task = { kind: 'clear', s: dirty, act: 1.4 * lvSpeed(w.k) }; goTo(standPos(dirty)); return; }
  if (!atHome) { w.route = waiterRoute(HOME); w.d = 0; }
}
function goTo(to) { WAITER.route = waiterRoute(to); WAITER.d = 0; }
function finishTask(T) {
  const w = WAITER; workDone(w.k);
  if (T.kind === 'order') { if (T.d.state === 'wait') { T.d.slow = T.d.t > 12 * patience() * (T.d.tag === 'hurry' ? .6 : 1); T.d.svc = T.d.t; T.d.state = 'order'; T.d.t = 0; for (const p of T.d.wants) ORDERS.push({ d: T.d, p }); SFX.tap(); } }
  else if (T.kind === 'deliver') { T.d.server = w.k; if (T.d.state === 'order') { T.d.svc += T.d.t; T.d.state = 'eat'; T.d.t = 0; T.d.eatT = (11 + rng() * 5) * (T.d.tag === 'chill' ? 1.8 : 1); T.d.st.items = w.carry.slice(); } w.carry = []; }
  else if (T.kind === 'clear') { T.s.dirty = false; T.s.items = []; T.s.claimed = false; }
}

// ---------------------------------------------------------------- staff: Kun bakes, the water bar makes drinks / desserts, Lin pays
const planRank = p => W.plan[p] === 'pri' ? 3 : W.plan[p] === 'off' ? 0 : 1;
function bakeTime(p) { return PRODUCTS[p].bake * (PRODUCTS[p].where === 'table' ? [1, .55, .45, .38][upLv('oven')] : [1, .8, .7, .6][upLv('fridge')]) * (PRODUCTS[p].where === 'fridge' && postOf('bar') ? .8 : 1); }
function chooseBatch(list) {   // biggest shortfall first, the day's "主打" items count triple, "不做" never
  let best = null;
  for (const p of list) {
    if (!unlocked(p) || batchesOf(p) <= 0 || W.plan[p] === 'off') continue;
    const tier = stockTier(), cap = shelfCap(p) + (tier ? reserve(p) : ordered(p)) + (tier === 2 ? BATCH : 0); if (!cap) continue;
    const cooking = [JOB.kun, JOB.kun2, JOB.kun3, JOB.bar, JOB.bar2, JOB.lin].filter(j => j && j.p === p).length * BATCH, owed = ordered(p) - W.stock[p] - cooking;
    if (owed > 0) { const score = 100 + owed; if (!best || score > best.score) best = { p, score }; continue; }   // booth orders waiting: make those first
    const gap = cap - shelfHave(p) - W.stock[p] - (JOB.kun2 && JOB.kun2.p === p ? BATCH : 0) - (JOB.kun3 && JOB.kun3.p === p ? BATCH : 0) - (JOB.bar && JOB.bar.p === p ? BATCH : 0) - (JOB.bar2 && JOB.bar2.p === p ? BATCH : 0) - (JOB.lin && JOB.lin.p === p ? BATCH : 0);
    if (gap < [5, 3, 2][tier]) continue;
    const score = gap / cap * planRank(p) + (ordered(p) ? 2 : 0);
    if (!best || score > best.score) best = { p, score };
  }
  return best && best.p;
}
function popAt(x, y, z, p, text) { const [a, b] = P1(x, y, z); POPS.push({ x: a, y: b, t: 0, img: PRODUCTS[p].img, text }); }
function stepStaff(dt) {
  if (!JOB.kun) { const p = chooseBatch(TABLE_ALL); if (p) { if (!(hasPerk('kun_thrift') && rng() < .2)) useIngr(p); JOB.kun = { p, t: 0, T: bakeTime(p) * lvSpeed('kun') }; } }
  else if ((JOB.kun.t += dt) >= JOB.kun.T) { W.stock[JOB.kun.p] += BATCH + (hasPerk('kun_batch') ? 2 : 0); popAt(250, 36, 70, JOB.kun.p, '出炉'); workDone('kun'); JOB.kun = null; SFX.ding(); }
  ['kun2', 'kun3'].forEach((key, i) => {   // up to two helpers on 烘焙 (耀仔 or whoever is posted there), each running another oven batch
    const bk = postsOf('bake')[i];
    if (!bk) JOB[key] = null;
    else if (!JOB[key]) { const p = chooseBatch(TABLE_ALL); if (p) { if (!(hasPerk('yao_save') && bk === 'yao' && rng() < .15)) useIngr(p); JOB[key] = { p, t: 0, T: bakeTime(p) * lvSpeed(bk) }; } }
    else if ((JOB[key].t += dt) >= JOB[key].T) { W.stock[JOB[key].p] += BATCH; popAt(i ? 206 : 226, 36, 70, JOB[key].p, '出炉'); workDone(bk); JOB[key] = null; SFX.ding(); }
  });
  // water bar: Wen (or whoever is posted there) — otherwise Lin, between customers
  const bars = postsOf('bar'), barK = bars[0];
  bars.slice(0, 2).forEach((k, i) => {   // each person at the bar works their own batch
    const key = i ? 'bar2' : 'bar';
    if (!JOB[key]) { const p = chooseBatch(FRIDGE_ALL); if (p) { useIngr(p); JOB[key] = { p, t: 0, T: bakeTime(p) * lvSpeed(k) }; } }
    else if ((JOB[key].t += dt) >= JOB[key].T) { W.stock[JOB[key].p] += BATCH; popAt(i ? 136 : 156, 36, 66, JOB[key].p, '做好'); workDone(k); JOB[key] = null; SFX.ding(); }
  });
  if (bars.length < 2) JOB.bar2 = null;
  const TL = JOB.till;
  if (TL && (TL.t += dt) >= TL.T) { finishPay(TL.c); workDone('hero'); if (JOB.lin && JOB.lin.kind === 'pack') workDone('lin'); TL.c.atTill = false; TL.c.hold = .2; TL.c.tray = false; TL.c.bag = !TL.c.stool; JOB.till = null; if (JOB.lin && JOB.lin.kind === 'pack') JOB.lin = null; }
  const L = JOB.lin;
  if (L && L.kind === 'pack') { L.t += dt; }
  else if (L && L.kind === 'brew') {
    if ((L.t += dt) >= L.T) { W.stock[L.p] += BATCH; popAt(60, 36, 66, L.p, '做好'); workDone('lin'); JOB.lin = null; SFX.ding(); }
  } else if (!barK && queueLen() < 2) { const p = chooseBatch(FRIDGE_ALL); if (p) { useIngr(p); JOB.lin = { kind: 'brew', p, t: 0, T: bakeTime(p) * lvSpeed('lin') }; } }   // packing comes first
}
// stock flies to the shelf layers that are short (a tray every half second)
function stepTrays(dt) {
  for (const t of TRAYS) t.t += dt;
  for (const t of TRAYS.filter(t => t.t >= t.T)) { const L = W.shelves[t.id].layers[t.li]; if (L.p === t.p) L.n = Math.min(L.cap, L.n + t.k); else W.stock[t.p] += t.k; inflight[t.id + ':' + t.li] -= t.k; POPS.push({ x: t.to[0] / K, y: t.to[1] / K - 18, t: .3, text: '+' + t.k, small: true }); }
  TRAYS = TRAYS.filter(t => t.t < t.T);
  if ((refillT -= dt) > 0) return; refillT = .5;
  for (const id of SHELF_IDS) {
    const st = W.shelves[id]; if (st.locked) continue;
    st.layers.forEach((L, li) => {
      const key = id + ':' + li, need = L.p ? L.cap - L.n - (inflight[key] || 0) : 0;
      const spare = L.p ? W.stock[L.p] - ordered(L.p) - takeKeep(L.p) : 0;   // dine-in orders keep their pieces in the kitchen
      if (need > 0 && spare > 0) {
        const k = Math.min(need, spare); W.stock[L.p] -= k; inflight[key] = (inflight[key] || 0) + k;
        const from = PRODUCTS[L.p].where === 'fridge' ? P(150, 36, 50) : P(244, 36, 40), o = SHELF[id].obj, sp = o.spots[li][0];
        TRAYS.push({ id, li, k, p: L.p, t: 0, T: 1.15, from, to: [o.sx + sp[0], o.sy + sp[1]] });
      }
    });
  }
}

// ---------------------------------------------------------------- street: walkers, and buyers at the takeaway window
WALKERS = [
  { ch: GUEST_HD[12], y: 348, dir: 1, v: 26, x: -60 }, { ch: GUEST_HD[10], y: 326, dir: -1, v: 14, x: 520 }, { ch: PART_HD[7], y: 326, dir: -1, v: 30, x: 300 },
  { ch: GUEST_HD[15], y: 348, dir: 1, v: 32, x: 120 }, { ch: GUEST_HD[1], y: 326, dir: -1, v: 26, x: 800 }, { ch: GUEST_HD[14], y: 348, dir: 1, v: 28, x: 360 },
].map(w => ({ ...w, dist: 0 }));
const TW_X = 192;   // takeaway window, seen from the pavement
const takeKeep = p => takeOpen() && PRODUCTS[p].where === 'table' && W.plan[p] !== 'off' ? (W.plan[p] === 'pri' ? 4 : 2) : 0;   // pieces the kitchen keeps for the takeaway window's glass case
function takeStock() { return PIDS.filter(p => W.stock[p] - ordered(p) > 0 && W.plan[p] !== 'off'); }
function stepWalkers(dt) {
  for (const w of WALKERS) {
    if (w.stop > 0) {   // buying at the takeaway window
      w.stop -= dt;
      if (w.stop <= 0 && w.buy) { const have = takeStock(); let amt = 0; const got = {}; for (const p of w.buy) if (have.includes(p) && W.stock[p] > 0) { W.stock[p]--; amt += priceOf(p); W.today.sold[p]++; got[p] = 1; }
        if (amt) { amt += comboBonus(got); const [x, y] = P1(TW_X, 316, 40); earn(amt, x, y); workDone(postsOf('take')[0]); W.today.take++; W.today.served++; W.today.stars.push(5); if (rng() < .2) say(w, pick(['趁热食！', '外卖好方便', '买俾屋企人']), false); w.bag = true; } w.buy = null; }
      continue;
    }
    const was = w.x; w.x += w.dir * w.v * dt; w.dist += w.v * dt;
    if (w.dir < 0 && w.y === 326 && was > TW_X && w.x <= TW_X && isOpenPhase() && takeOpen() && !w.passed) {
      w.passed = true; const have = takeStock();
      if (have.length && (w.taker || rng() < .35)) { w.x = TW_X; w.stop = 2.2; const n = rng() < .6 ? 1 : 2; w.buy = []; for (let i = 0; i < n; i++) w.buy.push(pick(have.filter(p => W.plan[p] === 'pri').length ? (rng() < .6 ? have.filter(p => W.plan[p] === 'pri') : have) : have)); }
    }
    if (!w.temp) { if (w.dir > 0 && w.x > 700) w.x = -160 - rng() * 80; if (w.dir < 0 && w.x < -160) { w.x = 700 + rng() * 120; w.passed = false; } }
  }
  WALKERS = WALKERS.filter(w => !w.temp || (w.x < 760 && w.x > -200));
}
function spawnTaker() { WALKERS.push({ ch: GUEST_HD[pick(guestPool())], y: 326, dir: -1, v: 26, x: 720, dist: 0, temp: true, taker: true }); }
function say(who, text, hint) { if (BUBBLES.some(b => b.who === who) || BUBBLES.length >= 2) return; BUBBLES.push({ who, text, hint, t: 0 }); }
function stepBubbles(dt) {
  for (let i = BUBBLES.length - 1; i >= 0; i--) if ((BUBBLES[i].t += dt) > 2.8 || BUBBLES[i].who.gone) BUBBLES.splice(i, 1);
  if (LAST_GRIPE) LAST_GRIPE.t += dt;
  if (PHASE !== 'open' || (bubbleT -= dt) > 0) return; bubbleT = 5;
  const near = WALKERS.find(w => !w.temp && w.x > 180 && w.x < 330 && !w.stop);
  if (near && queueLen() < 3 && rng() < .5) say(near, pick(['好香！一阵入去睇下', '街记开咗喎', '蛋挞出炉喇']), false);
}
function walkOut(c) {   // back the way they came, out of the door, along the street
  const p = custPos(c), seg = posAt(c.s).seg, pts = [[p.x, p.y]];
  for (let i = seg; i >= 2; i--) pts.push(PATH[i]);
  pts.push(PATH[1], [700, PATH[1][1]]);
  const w = { ch: c.ch, ci: c.ci, route: pts, d: 0, L: polyLen(pts), walk: 0, x: p.x, y: p.y, face: 'SW' };
  LEAVERS.push(w); c.gone = true; c.quiet = true;
  if (rng() < .6) say(w, sayP(personaOf(c.ci).miss, c.wants[0]), true);
}
function stepLeavers(dt) {
  for (const w of LEAVERS) { w.d += SPEED * 1.15 * dt; w.walk += SPEED * 1.15 * dt; const q = posOn(w.route, w.d); w.x = q.x; w.y = q.y; w.face = q.face; if (w.d >= w.L) w.gone = true; }
  LEAVERS = LEAVERS.filter(w => !w.gone);
}
function whereIs(who) {
  if (who.s !== undefined) { if (who.sitting) return P1(27, who.stool, 22); const p = custPos(who); return P1(p.x, p.y); }
  if (who.st) { const z = who.state === 'in' || who.state === 'out' ? 0 : 12; return P1(who.x, who.y, z); }
  return P1(who.x, who.y);
}
function trayAt(c) { const p = custPos(c), f = custFace(c), [sx, sy] = P(p.x, p.y); return [sx + ((f === 'SE' || f === 'NE') ? 3 : -3), sy - 54]; }
function stepFly(dt) {
  for (const f of FLY) { f.t += dt; if (f.t >= f.T && f.c) { (f.c.onTray = f.c.onTray || []).push(f.p); f.done = true; } else if (f.t >= f.T) f.done = true; }
  FLY = FLY.filter(f => !f.done);
}
let CARS = [], carT = 3;
const CAR_COLS = [['#d64a3a', '#c23a2e', '#9c2c24'], ['#d64a3a', '#c23a2e', '#9c2c24'], ['#4fa860', '#3f9a5a', '#2f7a46'], ['#5aa8d8', '#4a96c8', '#3a7aa8']];
function stepCars(dt) {
  carT -= dt;
  if (carT <= 0) { carT = 5 + rng() * 9; const lane = rng() < .5 ? 0 : 1; if (!CARS.some(c => c.lane === lane && c.dx < -300)) CARS.push({ lane, col: rng() < .7 ? 0 : 1 + Math.floor(rng() * 3), dx: -820, v: 110 + rng() * 50 }); }
  for (const c of CARS) c.dx += c.v * dt;
  CARS = CARS.filter(c => c.dx < 700);
}
// dirt spots: free floor cells in a fixed shuffled order; the first round(dirt / 100 * n) of them show, the cleaner works from the last one back
let DIRT_SPOTS = null, DIRT_NAV = null, GRIME = null;
function grimeLayer() {   // the floor going grubby: dithered scuff marks and shoe smudges over every walkable cell, faded in with the dirt level
  if (GRIME) return GRIME; const g = navGrid(), x1 = expandLv() ? 630 : 310, cv = mk(WW, 1280), c = cv.getContext('2d');
  for (let y = 56; y < 316; y += 9) for (let x = 8; x < x1; x += 9) { const cx = Math.floor((x - NAV_X0) / NAV_C), cy = Math.floor(y / NAV_C); if (g[cy * NAV_W + cx] || mhash(x * 5, y * 3) < .45) continue;
    const [a, b] = P(x + (mhash(x, y * 2) - .5) * 8, y + (mhash(y, x * 2) - .5) * 8), r = 4 + mhash(x * 7, y) * 9, col = mhash(x, y * 9) < .3 ? '#3a2a1a' : '#5a4430';
    c.fillStyle = col; for (let dy = -r / 2; dy <= r / 2; dy++) for (let dx = -r; dx <= r; dx++) { const d = Math.hypot(dx / r, dy / (r / 2)); if (d < 1 && ((dx + dy) & 1) === 0 && mhash(a + dx, b + dy) < .75 - d * .6) c.fillRect(R(a) + dx, R(b) + dy, 1, 1); }
    if (mhash(x * 2, y * 5) < .3) { c.fillStyle = '#4a3828'; for (let k = 0; k < 10; k++) c.fillRect(R(a) - 6 + k, R(b) + 3 + (k >> 2), 1, 1); } }   // a shoe scuff
  return (GRIME = cv);
}
function dirtSpots() {
  const g = navGrid(); if (DIRT_SPOTS && DIRT_NAV === g) return DIRT_SPOTS;
  const L = [], x1 = expandLv() ? 630 : 310;
  for (let y = 60; y < 312; y += 12) for (let x = 12; x < x1; x += 12) { const cx = Math.floor((x - NAV_X0) / NAV_C), cy = Math.floor(y / NAV_C); if (!g[cy * NAV_W + cx]) L.push([x + (mhash(x, y) - .5) * 6, y + (mhash(y, x) - .5) * 6, Math.floor(mhash(x, y + 7) * 6), mhash(x * 3, y)]); }
  L.sort((a, b) => a[3] - b[3]); DIRT_NAV = g; GRIME = null; return (DIRT_SPOTS = L.slice(0, 64));
}
const dirtShown = () => Math.round(dirtOf() / 100 * dirtSpots().length);
let CLEANERS = [];
function stepCleaners(dt) {
  CLEANERS = postsOf('clean').map(k => CLEANERS.find(q => q.k === k) || { k, x: 230, y: 280, route: null, d: 0, mop: 0, face: 'SW', walk: 0 });
  if (hasItem('vacuum') && isOpenPhase()) W.dirt = Math.max(0, dirtOf() - dt * .05);
  if (hasSk('shao_clean') && isOpenPhase() && !WAITERS.some(w => w.k === 'shao' && w.task)) W.dirt = Math.max(0, dirtOf() - dt * .06);   // 特技: 阿少 tidies up when idle
  if (hasSk('lin_auto') && PHASE !== 'title' && PHASE !== 'ledger' && (AUTOBUY_T -= dt) <= 0) { AUTOBUY_T = 4; autoRestock(); }   // 特技: 莲姨 tops up whenever something runs low
  if (hasSk('wen_tidy') && isOpenPhase() && (TIDY_T -= dt) <= 0) { TIDY_T = 6; const st = SEATS.find(q => q.dirty && !q.who); if (st) { st.dirty = false; st.items = []; } }   // 特技: 雯姐 clears a booth
  for (const q of CLEANERS) {
    if (q.route) { const v = 40 / lvSpeed(q.k); q.d += v * dt; q.walk += v * dt; const p = posOn(q.route, q.d); q.x = p.x; q.y = p.y; q.face = p.face; if (q.d >= polyLen(q.route)) { q.route = null; q.mop = 2.2; } continue; }
    if (q.mop > 0) { q.mop -= dt; W.dirt = Math.max(0, dirtOf() - dt * 2.6 / lvSpeed(q.k)); if (q.mop <= 0) workDone(q.k); continue; }
    const n = dirtShown(); if (n <= 0) continue;
    const sp = dirtSpots()[n - 1], r = navRoute([q.x, q.y], [sp[0], sp[1]]); if (r) { q.route = r; q.d = 0; } else q.mop = 1;
  }
}
function simStep(dt) {
  stepFly(dt); stepLeavers(dt); stepMurmur(dt);
  stepWalkers(dt); stepBubbles(dt);
  for (const p of POPS) p.t += dt; POPS = POPS.filter(p => p.t < 1.4);
  stepEpisodes(dt); stepVip(dt); if (PHASE === 'prep') stepPrep(dt);
  if (PHASE === 'prep' || PHASE === 'open' || PHASE === 'closing') { stepStaff(dt); stepTrays(dt); stepCustomers(dt); stepDiners(dt); stepWaiter(dt); stepCleaners(dt); }
}
