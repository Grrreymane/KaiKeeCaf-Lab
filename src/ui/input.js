// ==== input: tap buttons, tap shelves, drag to pan, placement mode (drag furniture, snapped, red when it blocks)
const WALK_GAP = 12, EDIT = { pick: null, msg: '', bad: false, sel: null };
// fixed floor furniture the movable pieces must keep clear of (window bar, stools, counter + bake counter, takeaway)
const HARD = [{ x0: 246, x1: 256, y0: 267, y1: 281 }, { x0: 205, x1: 301, y0: 29, y1: 47 }, { x0: 0, x1: 16, y0: 56, y1: 160 }, { x0: 22, x1: 32, y0: 71, y1: 153 }, { x0: 38, x1: 200, y0: 29, y1: 47 }, { x0: 162, x1: 222, y0: 300, y1: 314 }];
const near = (a, b, gap) => a.x0 < b.x1 + gap && b.x0 < a.x1 + gap && a.y0 < b.y1 + gap && b.y0 < a.y1 + gap;
function segHit(a, p, q, m) { const x0 = Math.min(p[0], q[0]) - m, x1 = Math.max(p[0], q[0]) + m, y0 = Math.min(p[1], q[1]) - m, y1 = Math.max(p[1], q[1]) + m; return a.x0 < x1 && x0 < a.x1 && a.y0 < y1 && y0 < a.y1; }
function canPlace(g) {
  for (const o of g.objs) {
    const nd = expandLv() && o.x0 > 322;   // the room next door, once opened
    if (o.x0 < 2 || o.x1 > (expandLv() ? 636 : 314) || o.y0 < (nd ? 8 : 50) || o.y1 > 312 || (expandLv() && o.x0 < 324 && o.x1 > 314)) return '靠墙太近';
    for (const [p, q] of WAITER_WAYS()) if (segHit(o, p, q, 6)) return '挡住招待的路';
    for (const h of HARD) if (near(o, h, 4)) return '碰到柜台了';
    for (const og of MOV) if (og !== g) for (const b of og.objs) if (near(o, b, WALK_GAP)) return '太挤，人过不去';
    for (let i = 1; i < PATH.length; i++) if (segHit(o, PATH[i - 1], PATH[i], 5)) return '挡住客人的路';
  }
  return '';
}
const WAITER_WAYS = () => [[[261, 56], [261, 252]]].concat(expandLv() ? [[[259, AISLE_Y], [640, AISLE_Y]]].concat(BOOTHS.filter(B => B.id).map(B => [[B.X - 7 + B.table.grp.dx, AISLE_Y], [B.X - 7 + B.table.grp.dx, B.y0 + B.table.grp.dy]])) : []);
function saveFurniture() { for (const g of MOV) if (g.dx || g.dy) W.furn[g.id] = [g.dx, g.dy]; computeStops(); saveGame(); }
const floorAt = (sx, sy) => { const u = (sx - LM) / K - OX, v = sy / K - OY; return [v + u / 2, v - u / 2]; };   // screen point -> floor world point
function hitObj(wx, sy, list) {   // topmost object (front first) whose pixel is under the point
  const cands = list.filter(o => wx >= o.sx && wx < o.sx + o.cv.width && sy >= o.sy && sy < o.sy + o.cv.height);
  cands.sort((a, b) => (b.x0 + b.x1 + b.y0 + b.y1) - (a.x0 + a.x1 + a.y0 + a.y1));
  for (const o of cands) {
    const src = o.shelf && o.shelf.locked && o.sheet ? o.sheet.cv : o.cv;
    o._a = o._a || {}; const a = o._a[src.width + 'x' + src.height + (src === o.cv ? 'c' : 's')] || (o._a[src.width + 'x' + src.height + (src === o.cv ? 'c' : 's')] = src.getContext('2d').getImageData(0, 0, src.width, src.height).data);
    if (a[((R(sy - o.sy)) * src.width + R(wx - o.sx)) * 4 + 3] > 0) return o;
  }
  return null;
}
function footQuad(c, o, col, alpha) { const pts = [P(o.x0, o.y0), P(o.x1, o.y0), P(o.x1, o.y1), P(o.x0, o.y1)]; c.save(); c.globalAlpha = alpha; c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.globalAlpha = 1; c.strokeStyle = col; c.lineWidth = 2; c.stroke(); c.restore(); }
function drawEditFloor(c) {
  c.save(); c.globalAlpha = .28; c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath();
  for (let x = 0; x <= ROOM; x += 16) { const a = P(x, 48), b = P(x, ROOM); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  for (let y = 48; y <= ROOM; y += 16) { const a = P(0, y), b = P(ROOM, y); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  c.stroke(); c.restore();
  for (const g of MOV) for (const o of g.objs) footQuad(c, o, g === (EDIT.pick && EDIT.pick.g) ? (EDIT.bad ? '#e0503a' : '#3fbf7a') : g === EDIT.sel ? C.gold : '#ffffff', g === (EDIT.pick && EDIT.pick.g) || g === EDIT.sel ? .55 : .12);
}
function drawEditMarks(c) { if (!EDIT.pick) return; c.save(); c.globalAlpha = .55; for (const o of EDIT.pick.g.objs) c.drawImage(o.cv, o.sx, o.sy - 8); c.restore(); }

function setupInput(cv) {
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 720 / r.width, (e.clientY - r.top) * 1280 / r.height]; };
  let down = null;
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerdown', e => {
    const [sx, sy] = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    down = { x: sx, y: sy, cam: camX, moved: false };
    if (DESK) deskDown(sx / K, sy / K);
    if (MODE === 'edit' && !PANEL && sy < BAR_Y * K && sy > 34 * K) {
      const o = hitObj(sx + camX, sy, MOV.flatMap(g => g.objs));
      if (o) { EDIT.pick = { g: o.grp, f0: floorAt(sx + camX, sy), dx: 0, dy: 0 }; EDIT.sel = o.grp; EDIT.bad = false; EDIT.msg = '拿起：' + o.grp.name; down.drag = true; }
    }
  });
  cv.addEventListener('pointermove', e => {
    if (!down) return; const [sx, sy] = pos(e);
    if (Math.abs(sx - down.x) + Math.abs(sy - down.y) > 14) down.moved = true;
    if (EDIT.pick) {
      const f = floorAt(sx + camX, sy), dx = Math.round((f[0] - EDIT.pick.f0[0]) / 8) * 8, dy = Math.round((f[1] - EDIT.pick.f0[1]) / 8) * 8, pk = EDIT.pick;
      if (dx !== pk.dx || dy !== pk.dy) { moveGroup(pk.g, dx - pk.dx, dy - pk.dy); pk.dx = dx; pk.dy = dy; const why = canPlace(pk.g); EDIT.bad = !!why; EDIT.msg = why || '可以放这里'; }
      return;
    }
    if (down.moved && !PANEL && !DESK && !DIALOG && PHASE !== 'title' && PHASE !== 'ledger') camX = clamp(down.cam - (sx - down.x), 0, CAM_MAX);
  });
  const up = e => {
    audioUnlock(); deskUp();
    if (!down) return; const [sx, sy] = pos(e), d = down; down = null;
    if (EDIT.pick) {
      const pk = EDIT.pick; EDIT.pick = null;
      if (EDIT.bad) { moveGroup(pk.g, -pk.dx, -pk.dy); EDIT.msg = '放不下，退回原位'; SFX.deny(); }
      else if (pk.dx || pk.dy) { EDIT.msg = pk.g.name + '放好了'; redoShadows(); RINGS.clear(); saveFurniture(); SFX.buy(); }
      EDIT.bad = false; return;
    }
    if (d.moved) return;
    tapAt(sx / K, sy / K, sx + camX, sy);
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { down = null; });
  cv.addEventListener('wheel', e => { if (!PANEL) camX = clamp(camX + (e.deltaX || e.deltaY), 0, CAM_MAX); e.preventDefault(); }, { passive: false });
}
// a tap at UI point (ux, uy) / world-canvas point (wx, wy)
function tapAt(ux, uy, wx, wy) {
  for (let i = BTNS.length - 1; i >= 0; i--) { const b = BTNS[i]; if (ux >= b.x && ux < b.x + b.w && uy >= b.y && uy < b.y + b.h) { b.fn(); return true; } }
  if (PANEL || DESK || DIALOG || PHASE === 'title' || PHASE === 'ledger' || MODE === 'edit') return false;
  if (uy > 34 && uy < 546) {
    const o = hitObj(wx, wy, SHELF_IDS.map(id => SHELF[id].obj));
    if (o) { if (W.shelves[o.shelfId].layers.some(L => L.p)) for (const L of W.shelves[o.shelfId].layers) if (L.p) W.seen['new_' + L.p] = true;
      openPanel({ kind: 'shelf', id: o.shelfId, sel: W.shelves[o.shelfId].layers.findIndex(L => !L.p) >= 0 ? W.shelves[o.shelfId].layers.findIndex(L => !L.p) : 0 }); return true; }
    const s = staffList().find(s => { const [a, b] = P(s.x, s.y, s.z); return Math.abs(wx - a) < 26 && wy < b && wy > b - 110; });
    if (s) { openPanel({ kind: 'staff', bar: 3 }); return true; }
  }
  return false;
}
