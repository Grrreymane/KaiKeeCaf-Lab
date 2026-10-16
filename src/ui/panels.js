// ==== panels: bottom sheets (shelf, stock overview, ingredient shop, staff, books), pause, end-of-day books, title
let PANEL = null, CONFIRM = 0;
function openPanel(p) { PANEL = p; SFX.tap(); if (p.kind === 'shelf' && W.tut === 0 && p.id === 'T4') W.tut = 1; }
const INK = '#3a2a2e', SUB = '#5f4a3c', PAPER = '#f6e8c8', GOLDB = '#ffd75e';
function card(c, x, y, w, h, fill = PAPER) { px(c, x - 1, y - 1, w + 2, h + 2, OUT); px(c, x, y, w, h, fill); px(c, x, y + h - 2, w, 2, shade(fill, -22)); }
function btn(c, x, y, w, h, label, fn, kind = 'gold') {
  const off = kind === 'off', fill = off ? '#d9cfbd' : kind === 'gold' ? GOLDB : kind === 'red' ? '#e9806a' : '#fffaf0';
  px(c, x - 1, y - 1, w + 2, h + 2, OUT); px(c, x, y, w, h, fill); px(c, x, y + h - 3, w, 3, shade(fill, -30));
  T(c, label, x + w / 2, y + (h - 14) / 2, off ? '#9a8a78' : INK, 'center', null);
  button(x, y, w, h, off ? () => SFX.deny() : fn);
}
// a list opened from 账本 gets a way back to it (in the header, where the info line would be)
const goalTabs = (c, y, cur) => { [['goals', '目标 ' + (W.goal || 0) + '/' + GOALS.length], ['ach', '成就 ' + ACH.filter(a => W.ach[a.id]).length + '/' + ACH.length]].forEach(([k, n], i) => btn(c, 14 + i * 168, y, 164, 24, n, () => { PANEL = { kind: k, bar: 4, from: PANEL.from }; SFX.tap(); }, cur === k ? 'gold' : 'cream')); return y + 30; };   // 目标 and 成就 share one sheet
const bookBack = y0 => { if (!PANEL || PANEL.from !== 'book') return null; button(220, y0, 100, 26, () => { PANEL = { kind: 'book', bar: 4 }; SFX.tap(); }); return '← 账本'; };
function sheet(c, title, right, y0 = 292) {   // bottom sheet with a wood header and a close tab
  c.save(); c.globalAlpha = .35; px(c, 0, 34, 360, y0 - 34, '#1c141c'); c.restore();
  button(0, 34, 360, y0 - 34, () => { PANEL = null; });   // tapping the dimmed shop closes the sheet
  px(c, 4, y0 - 1, 352, BAR_Y - y0 + 1, OUT); px(c, 5, y0, 350, BAR_Y - y0 - 1, PAPER);
  px(c, 5, y0, 350, 26, '#5a3a28'); px(c, 5, y0 + 26, 350, 2, '#3a2418');
  TS(c, title, 15, y0 + 4, 16, '#fbe9c0');
  if (right) T(c, right, 314, y0 + 7, '#fbe9c0', 'right', null);
  px(c, 324, y0 + 3, 26, 20, '#7a5238'); T(c, '×', 337, y0 + 6, '#fbe9c0', 'center', null); button(318, y0, 36, 26, () => { PANEL = null; SFX.tap(); });
  return y0 + 34;
}
const half = (c, img, x, y) => c.drawImage(img, R(x - img.width / 4), R(y - img.height / 2), img.width / 2, img.height / 2);   // a 2x sprite at native pixels in the 1x UI
const full = (c, img, x, y) => c.drawImage(img, R(x - img.width / 2), R(y - img.height / 2));   // 2x sprite drawn chunky (big tiles)
const shelfTitle = id => W.shelves[id].fridge ? '冷柜' : '货架 ' + SHELF_NO[id];
function layerIcons(c, L, x, y) { if (!L.p) { T(c, '空着', x, y - 6, '#b0a08c', 'left', null); return; } for (let i = 0; i < L.cap; i++) { if (i < L.n) half(c, PRODUCTS[L.p].img, x + 9 + i * 15, y + 4); else px(c, x + 4 + i * 15, y + 1, 10, 3, '#e3d6bc'); } }

function drawShelfPanel(c, P_) {
  const id = P_.id, st = W.shelves[id];
  let y = sheet(c, shelfTitle(id), money$(W.money), 236);
  if (st.locked) {
    T(c, '呢个位盖着布，还没开张。', 20, y + 10, INK, 'left', null);
    T(c, '开张做货架摆点心，或者做冷柜摆饮品糖水。', 20, y + 30, SUB, 'left', null);
    btn(c, 30, y + 70, 140, 34, '开张做货架 ' + money$(SHELF_COST), () => { if (unlockShelf(id, false)) PANEL = { kind: 'shelf', id, sel: 0 }; }, W.money >= SHELF_COST ? 'gold' : 'off');
    btn(c, 190, y + 70, 140, 34, '开张做冷柜 ' + money$(SHELF_COST), () => { if (unlockShelf(id, true)) PANEL = { kind: 'shelf', id, sel: 0 }; }, W.money >= SHELF_COST ? 'gold' : 'off');
    if (W.money < SHELF_COST) T(c, '还差 ' + money$(SHELF_COST - W.money), 180, y + 112, '#b8342c', 'center', null);
    return;
  }
  if (PHASE === 'prep' || PHASE === 'ledger') btn(c, 150, y - 31, 80, 20, st.fridge ? '改做货架' : '改做冷柜', () => setShelfKind(id, !st.fridge), 'cream');   // swap the spot between shelf and fridge before opening
  const sel = P_.sel || 0;
  st.layers.forEach((L, li) => {   // each layer: what it is set to (icon + name, even while empty), six slots, and its state
    const yy = y + li * 58, on = li === sel;
    if (on) px(c, 12, yy - 3, 336, 56, C.gold);
    card(c, 14, yy, 332, 50, on ? '#fff3d6' : '#fffaf0');
    px(c, 18, yy + 4, 34, 42, on ? '#5a3a28' : '#b8a48a'); T(c, LAYER_NAME[li], 35, yy + 18, '#fff4dc', 'center', null);
    if (!L.p) { for (let x = 60; x < 338; x += 7) { px(c, x, yy + 8, 4, 1, '#c9b48c'); px(c, x, yy + 41, 4, 1, '#c9b48c'); } for (let q = yy + 8; q < yy + 42; q += 7) { px(c, 60, q, 1, 4, '#c9b48c'); px(c, 338, q, 1, 4, '#c9b48c'); } T(c, '空着 · 点下面选一样点心摆上来', 199, yy + 18, '#a08a70', 'center', null); }
    else {
      const img = PRODUCTS[L.p].img; full(c, img, 76, yy + 25); TS(c, PRODUCTS[L.p].name, 96, yy + 6, 15, INK);
      for (let i = 0; i < L.cap; i++) {   // six slots: pieces on the shelf, faded outlines where one is missing
        const sx = 102 + i * Math.min(26, 190 / Math.max(1, L.cap - 1)), sy = yy + 34; px(c, sx - 11, sy + 6, 22, 3, '#e3d6bc');
        c.save(); if (i >= L.n) c.globalAlpha = .22; half(c, img, sx, sy); c.restore();
      }
      const full_ = L.n >= L.cap, state = full_ ? ['摆满', '#2f6e56'] : L.n ? ['补货中', '#c98a2a'] : W.stock[L.p] || [JOB.kun, JOB.lin, JOB.bar].some(j => j && j.p === L.p) || batchesOf(L.p) ? ['等出炉', '#c98a2a'] : ['缺料', '#b8342c'];
      T(c, L.n + '/' + L.cap, 338, yy + 6, INK, 'right', null); T(c, state[0], 338, yy + 26, state[1], 'right', null);
    }
    button(12, yy - 3, 336, 56, () => { P_.sel = li; SFX.tap(); });
  });
  y += 124;
  { const L0 = st.layers[sel]; if (L0.p && L0.n) T(c, '换走会丢掉 ' + L0.n + ' 个' + PRODUCTS[L0.p].name + '，亏 $' + Math.max(1, Math.round(L0.n * unitCost(L0.p))), 344, y - 8, '#b8342c', 'right', null); }
  { const L0 = st.layers[sel], warn = L0.p && L0.n; T(c, '摆什么到' + LAYER_NAME[sel] + '？' + (st.fridge && !warn ? '（冷柜放饮品糖水）' : ''), 16, y - 8, SUB, 'left', null); }   // the loss warning takes the right side
  const opts = [...(st.fridge ? FRIDGE_ALL : TABLE_ALL).filter(unlocked), null], per = Math.min(4, opts.length), tw = Math.min(104, Math.floor(332 / per) - 6), th = opts.length > 4 ? 66 : 76;   // wraps in rows of 4
  opts.forEach((p, i) => {
    const x = 14 + (i % per) * (tw + 6), cur = st.layers[sel].p === p, yy = y + 8 + Math.floor(i / per) * (th + 6);
    card(c, x, yy, tw, th, cur ? '#ffe9b0' : '#fffaf0');
    if (p) { full(c, PRODUCTS[p].img, x + tw / 2, yy + 16); { const nm = PRODUCTS[p].name; T(c, nm.length > 4 ? nm.slice(0, 4) : nm, x + tw / 2 - 6, yy + th - 40, INK, 'center', null, nm.length > 3 ? 12 : FS); } T(c, speedTag(p)[0], x + tw - 4, yy + 3, speedTag(p)[1], 'right', null, 12); T(c, '$' + PRODUCTS[p].price + ' 可做' + batchesOf(p), x + tw / 2, yy + th - 22, batchesOf(p) ? SUB : '#b8342c', 'center', null, 12); }
    else T(c, '空着', x + tw / 2, yy + th / 2 - 6, SUB, 'center', null);
    button(x, yy, tw, th, () => { assignLayer(id, sel, p); const other = 1 - sel; if (p && !st.layers[other].p) P_.sel = other; });
  });
  if (!reachable(id)) T(c, '客人走不到这张货架！挪近过道', 180, BAR_Y - 18, '#b8342c', 'center', null);
  if (W.tut === 1) c.drawImage(HAND, 14 + 60, y + 50 + R(Math.abs(Math.sin(gtime * 4)) * -4));   // tutorial: tart tile, then the lower row
  if (W.tut === 2) { if (sel !== 1) c.drawImage(HAND, 300, y - 42 + R(Math.abs(Math.sin(gtime * 4)) * -4)); else c.drawImage(HAND, 14 + (tw + 6) + 60, y + 50 + R(Math.abs(Math.sin(gtime * 4)) * -4)); }
}
function drawStockPanel(c) {
  const ids = ['T1', 'T3', 'T4', 'T5', 'T6', 'T2', 'T7', 'T8', 'T9', 'T10'].filter(id => !(W.shelves[id].extra && W.shelves[id].locked));
  let y = sheet(c, '摆货', money$(W.money), Math.min(292, BAR_Y - 44 - ids.length * 40));
  ids.forEach((id, i) => {
    const st = W.shelves[id], yy = y + i * 40;
    card(c, 14, yy, 332, 34, st.locked ? '#ece2cf' : '#fffaf0');
    T(c, shelfTitle(id), 22, yy + 10, INK, 'left', null);
    if (st.locked) T(c, '盖着 · 开张 ' + money$(SHELF_COST), 336, yy + 10, SUB, 'right', null);
    else st.layers.forEach((L, li) => { const x = 86 + li * 128; if (L.p) { half(c, PRODUCTS[L.p].img, x + 8, yy + 17); T(c, PRODUCTS[L.p].name + ' ' + L.n + '/' + L.cap, x + 20, yy + 10, L.n ? INK : '#b8342c', 'left', null); } else T(c, LAYER_NAME[li] + '空着', x, yy + 10, '#b0a08c', 'left', null); });
    button(14, yy, 332, 34, () => openPanel({ kind: 'shelf', id, sel: 0, bar: 0 }));
  });
}
function drawShopPanel(c) {   // 荣叔's: raw ingredients in a 2-column grid; one tap tops up for today's plan
  let y = sheet(c, W.today && W.today.rongSale ? '荣叔材料店 · 今天八折' : '荣叔材料店', money$(W.money), 96);
  btn(c, 14, y - 2, 196, 30, '按今日安排补齐', () => restock(3));
  btn(c, 218, y - 2, 128, 30, '供应商 · 店 Lv' + shopLv(), () => { PANEL = { kind: 'sup', bar: 1 }; SFX.tap(); }, Object.keys(SUPPLIERS).some(k => !(W.sup || {})[k] && shopLv() >= SUPPLIERS[k].lv) ? 'gold' : 'cream'); y += 36;
  const list = ingrInUse();
  const rh = Math.max(50, Math.min(66, Math.floor((BAR_Y - 6 - y) / Math.ceil(list.length / 2))));   // rows grow into the free height
  list.forEach((k, i) => {   // sold by the portion
    const x = 14 + (i % 2) * 168, yy = y + Math.floor(i / 2) * rh, have = W.ing[k] || 0, cost = bagCost(k);
    card(c, x, yy, 162, rh - 4, '#fffaf0'); drawFit(c, ingIcon(k), x + 4, yy + 4, 44, rh - 14);
    T(c, INGR[k].name, x + 52, yy + 4, INK, 'left', null); T(c, money$(cost) + '/份', x + 158, yy + 6, SUB, 'right', null, 12);
    { const u = (W.lastUsed || {})[k] || 0, days = u ? have / u : 0; T(c, '有' + have + '份', x + 52, yy + 22, have ? '#2f6e56' : '#b8342c', 'left', null, 12); T(c, u ? '够' + (days >= 9.5 ? '9+' : days.toFixed(1)) + '天' : '每份' + BAG_N[k], x + 52, yy + 35, u && days < 1 ? '#b8342c' : '#a89480', 'left', null, 12); }
    btn(c, x + 106, yy + 21, 52, 20, '进货', () => buyIngr(k, 1), W.money >= cost ? 'gold' : 'off');
  });
}
const POST_SHORT = { bake: '烘焙', bar: '水吧', serve: '招待', take: '外卖', clean: '打扫' };
const WORK_UNIT = { kun: '盘', lin: '件', hero: '单' }, workLine = id => { const n = ((W.today && W.today.work) || {})[id] || 0, y = (W.lastWork || {})[id] || 0, post = W.staff[id] && W.staff[id].post, u = WORK_UNIT[id] || ({ bake: '盘', bar: '杯', serve: '台', take: '份', clean: '处' })[post] || '次'; return '今' + n + u + (y ? ' 昨' + y : ''); };
function staffStatus(id) {
  if (id === 'kun') { const j = JOB.kun; if (j) return '在烤' + PRODUCTS[j.p].name + ' ' + R(100 * j.t / j.T) + '%'; if (TABLE_ALL.every(p => !shelfCap(p))) return '等你摆货'; if (TABLE_ALL.every(p => !shelfCap(p) || batchesOf(p) <= 0)) return '没料了，等进货'; return '货架满着，歇一歇'; }
  if (id === 'lin') { const j = JOB.lin; if (j && j.kind === 'pack') return '包装中'; if (j) return '在做' + PRODUCTS[j.p].name + ' ' + R(100 * j.t / j.T) + '%'; return postOf('bar') ? '帮店主包装' : '包装 · 有空做饮品'; }
  const s = W.staff[id];
  if (s.post === 'clean') { const q = CLEANERS.find(z => z.k === id); return !q ? '打扫' : q.mop > 0 ? '抹地中' : q.route ? '去执嘢' : '清洁 ' + Math.round(100 - dirtOf()) + '%'; }
  if (s.post === 'bake') { const j = postsOf('bake').indexOf(id) ? JOB.kun3 : JOB.kun2; return j ? '在焗' + PRODUCTS[j.p].name + ' ' + R(100 * j.t / j.T) + '%' : '烘焙待命'; }
  if (s.post === 'bar') { const j = postsOf('bar').indexOf(id) ? JOB.bar2 : JOB.bar; return j ? '在做' + PRODUCTS[j.p].name + ' ' + R(100 * j.t / j.T) + '%' : '水吧待命'; }
  if (s.post === 'serve') { const w = WAITERS.find(q => q.k === id); return !w ? '招待' : w.task ? ({ order: '去落单', deliver: '上菜中', clear: '收台中' })[w.task.kind] : '等卡座客人'; }
  return takeOpen() ? '外卖窗开着' : '外卖窗';
}
function drawStaffPanel(c) {   // each row: who, what they do now, level + affection, upgrade with points
  let y = sheet(c, '员工', '积分 ' + (W.pts || 0) + ' · 工钱 ' + money$(wages() - rentToday()) + '/天', 166) - 4;
  btn(c, 62, 169, 72, 20, '特技 ★', () => { PANEL = { kind: 'special', bar: 3 }; SFX.tap(); }, Object.keys(SPECIALS).some(k => lvOf(k) >= SK_LV && !(W.sk || {})[SPECIALS[k][0]] && (W.pts || 0) >= SPECIALS[k][3] && (!HIRE[k] || W.staff[k].hired)) ? 'gold' : 'cream');   // the specials sheet
  const rows = [['kun', '坤伯', '烘焙'], ['lin', '莲姨', '包装']].concat(Object.keys(HIRE).filter(k => W.staff[k].hired || W.day >= HIRE[k].day - 2).map(k => [k, HIRE[k].name, null]));   // people not due for days yet stay hidden
  const rh = Math.max(52, Math.min(66, Math.floor((BAR_Y - 6 - y) / rows.length)));   // rows grow to use the sheet's height (bigger text needs the room)
  rows.forEach(([id, name, role], i) => {
    const yy = y + i * rh, img = STAFF_HD[id].SE[0], hired = !HIRE[id] || W.staff[id].hired, lv = lvOf(id), b3 = yy + rh - 21;   // b3: the bottom line
    card(c, 14, yy, 332, rh - 3, hired ? '#fffaf0' : '#ece2cf');
    c.drawImage(img, 0, 0, img.width, 56, 20, yy + 3, img.width / 2, 28);
    TS(c, name, 56, yy + 3, 15, INK);
    if (!hired) {
      T(c, HIRE[id].note, 56, yy + 22, SUB, 'left', null, 12);
      if (HIRE[id].temp && HIRE[id].student) { T(c, '暑期学生 · 签 6 天每天平 $5', 20, b3 + 2, '#2f6e56', 'left', null, 12); btn(c, 236, yy + 4, 104, 22, '请今天 ' + money$(HIRE[id].wage), () => hireStaff(id), 'cream'); btn(c, 236, b3 - 2, 104, 20, '签 6 天 $40', () => signContract()); }
      else if (HIRE[id].temp) { T(c, '只做今天 · 每天换一个人', 20, b3 + 2, '#2f6e56', 'left', null, 12); btn(c, 236, yy + (rh - 34) / 2, 104, 28, '请今天 ' + money$(HIRE[id].wage), () => hireStaff(id), 'cream'); }
      else if (W.day >= HIRE[id].day) btn(c, 236, yy + (rh - 34) / 2, 104, 28, '请 ' + money$(HIRE[id].wage) + '/天', () => hireStaff(id)); else T(c, '第 ' + HIRE[id].day + ' 天来应征', 338, yy + 5, SUB, 'right', null, 12);
      return;
    }
    const posts = () => Object.keys(POSTS).forEach((post, k) => { const on = W.staff[id].post === post; btn(c, 150 + k * 38, yy + 20, 36, 20, POST_SHORT[post], () => setPost(id, post), on ? 'gold' : 'cream'); });
    if (HIRE[id] && HIRE[id].temp) {   // part-timer: today only, no levels
      T(c, '打工', 106, yy + 5, '#2f6e56', 'left', null, 12); T(c, staffStatus(id), 56, yy + 22, '#2f6e56', 'left', null, 12); posts();
      T(c, HIRE[id].note + ' · 工钱 ' + money$(wageOf(id)) + (W.contract ? ' · 合约剩 ' + W.contract.left + ' 天' : ' · 只做今天'), 20, b3 + 2, SUB, 'left', null, 12);
      return;
    }
    T(c, 'Lv' + lv, 98, yy + 5, '#b8483c', 'left', null, 12); T(c, '●'.repeat(lv - 1) + '○'.repeat(LV_MAX - lv), 122, yy + 5, '#c99428', 'left', null, 12);
    if (!HIRE[id]) {
      T(c, role + ' · ' + staffStatus(id), 56, yy + 22, '#2f6e56', 'left', null, 12); T(c, workLine(id), 340, yy + 22, '#8a6a4a', 'right', null, 12);
      if (id === 'kun') btn(c, 250, yy + 4, 90, 22, '烘焙安排', () => { W.seen.planDay = W.day; openPanel({ kind: 'plan', bar: 3 }); }, W.seen.planDay !== W.day && W.day >= 2 ? 'gold' : 'cream');
    } else { T(c, staffStatus(id), 56, yy + 22, '#2f6e56', 'left', null, 12); T(c, workLine(id), 340, yy + 4, '#8a6a4a', 'right', null, 12); posts(); }
    const pk = ((W.perks || {})[id] || []).map(q => '★' + perkInfo(q)[1]).join(' ');
    T(c, pk || (LV_SKILL[id] + '快 ' + (lv - 1) * 8 + '%' + ' · 工钱 ' + money$(wageOf(id))), 20, b3 + 2, pk ? '#b8483c' : SUB, 'left', null, 12);
    if (lv < LV_MAX) { const cost = LV_COST[lv + 1], ok = (W.pts || 0) >= cost; if ((W.today.upg || {})[id]) T(c, '今天升过了', 338, b3 + 2, '#b0a08c', 'right', null); else btn(c, 240, b3 - 2, 100, 20, '升级 ' + cost + '分', () => upgradeStaff(id), ok ? 'gold' : 'off'); }
    else T(c, '满级', 338, b3 + 2, '#c99428', 'right', null);
  });
}
function decorSwatch(c, tab, S, x, y) {   // a small sample of a wallpaper / booth style
  px(c, x - 1, y - 1, 58, 74, OUT);
  if (tab === 'wall') {
    px(c, x, y, 56, 56, S.wall); if (S.tiles) for (let t = 0; t < 32; t += 6) { px(c, x, y + t, 56, 1, S.wallD); for (let u = (t / 6) % 2 ? 6 : 0; u < 56; u += 12) px(c, x + u, y + t, 1, 6, S.wallD); } else if (S.stripe) for (let t = 0; t < 56; t += 8) px(c, x + t, y, 3, 56, S.wallD); else if (!S.floral) for (let t = 2; t < 56; t += 4) px(c, x + t, y, 1, 56, S.wallD);
    if (S.floral) for (let i = 0; i < 9; i++) { const fx = x + 6 + (i % 3) * 18 + (Math.floor(i / 3) % 2) * 9, fy = y + 8 + Math.floor(i / 3) * 18; px(c, fx - 1, fy, 3, 1, '#ffffff'); px(c, fx, fy - 1, 1, 3, '#ffffff'); px(c, fx, fy, 1, 1, '#e07a8a'); }
    if (S.rail) px(c, x, y + 4, 56, 1, C.brass);
    px(c, x, y + 32, 56, 24, S.low || shade(S.wall, -40)); for (let t = 8; t < 56; t += 8) px(c, x + t, y + 32, 1, 24, shade(S.low || S.wall, -16)); px(c, x, y + 30, 56, 3, S.rail ? C.brass : C.trim);   // the dark lower panel and its rail
    px(c, x, y + 56, 56, 16, '#f7f3e7'); for (let t = 0; t < 56; t += 6) px(c, x + t, y + 56, 1, 16, '#ddd7c8');
  } else if (tab === 'floor') {   // a patch of floor, seen from above
    for (let i = 0; i < 7; i++) for (let j = 0; j < 9; j++) px(c, x + i * 8, y + j * 8, 8, 8, S.plank ? (((j + (i >> 1)) % 2) ? S.A : S.B) : S.mosaic ? (((i + j) % 6 === 0 || ((i - j) % 6 + 6) % 6 === 0) ? S.B : S.A) : S.chips ? S.A : (i + j) % 2 ? S.B : S.A);
    if (S.plank) for (let j = 0; j < 9; j++) { px(c, x, y + j * 8 + 7, 56, 1, '#7a4e2c'); px(c, x + ((j * 24) % 48) + 4, y + j * 8, 1, 8, '#7a4e2c'); }
    if (S.mosaic) for (let t = 0; t < 56; t += 8) { px(c, x + t, y, 1, 72, '#d8d0c0'); px(c, x, y + t, 56, 1, '#d8d0c0'); }
    if (S.chips) { for (let k = 0; k < 90; k++) px(c, x + (k * 37) % 55, y + (k * 23 + (k >> 3) * 7) % 71, 1, 1, ['#b9a88c', '#8a9a8a', '#c88a6a', '#6a7a8a'][k % 4]); px(c, x + 28, y, 1, 72, '#c99428'); px(c, x, y + 36, 56, 1, '#c99428'); }
    if (S.dots) for (const [dx, dy] of [[16, 16], [40, 48]]) px(c, x + dx - 2, y + dy - 2, 4, 4, '#4f9a7c');
  } else if (tab === 'counter') {   // a bit of counter: the top, the cabinet boards, a little till
    px(c, x, y, 56, 72, '#f1e8d6'); px(c, x, y + 52, 56, 20, '#e8dcc6');
    px(c, x + 2, y + 24, 52, 5, S.top[0]); px(c, x + 2, y + 29, 52, 2, S.top[2]); px(c, x + 4, y + 31, 48, 30, S.cab[1]); px(c, x + 4, y + 31, 48, 2, S.cab[0]);
    if (S.name === '水磨石柜') for (let i = 0; i < 26; i++) px(c, x + 6 + (i * 37) % 44, y + 34 + (i * 23 + (i >> 2) * 5) % 24, 2, 2, ['#8a9a8a', '#c8a888', '#7a8a9a'][i % 3]); else for (let t = 10; t < 52; t += 7) px(c, x + t, y + 33, 1, 28, S.cab[2]);
    if (S.name === '红漆金边') { px(c, x + 4, y + 33, 48, 1, '#e8c060'); px(c, x + 4, y + 58, 48, 1, '#e8c060'); }
    px(c, x + 8, y + 12, 16, 12, '#f2ead2'); px(c, x + 10, y + 10, 8, 4, '#2f6a50'); px(c, x + 32, y + 14, 14, 10, '#a8754a');
  } else {
    const L = S.leather; px(c, x, y, 56, 72, '#e9e3d3');
    px(c, x + 6, y + 10, 44, 30, L[1]); px(c, x + 6, y + 10, 44, 3, L[0]); px(c, x + 47, y + 10, 3, 30, L[2]); px(c, x + 6, y + 7, 44, 3, S.deluxe ? C.brass : C.wood);
    if (S.deluxe) for (let i = 0; i < 12; i++) px(c, x + 10 + (i % 6) * 7 + (Math.floor(i / 6) % 2) * 3, y + 18 + Math.floor(i / 6) * 10, 2, 2, shade(L[1], -30));
    else for (let t = 12; t < 48; t += 8) px(c, x + t, y + 14, 1, 24, shade(L[1], -16));
    px(c, x + 4, y + 40, 48, 10, L[0]); px(c, x + 4, y + 48, 48, 2, L[2]); px(c, x + 6, y + 50, 44, 14, C.wood); px(c, x + 6, y + 62, 44, 2, C.woodD);
  }
}
function drawDecorPanel(c, P_) {   // 装修: better shelves, wallpaper, booth styles
  let y = sheet(c, '装修', money$(W.money) + ' · 美观 ' + beauty() + ' · 舒适 ' + comfort(), 150);
  const tab = P_.tab || 'shelf';
  const LOOK = ['wall', 'floor', 'counter', 'booth'], look = LOOK.includes(tab);   // 店面 groups the four looks of the room
  [['theme', '整套'], ['wall', '店面'], ['shelf', '货架'], ['expand', '扩建'], ['items', '摆设']].forEach(([k, n], i) => btn(c, 14 + i * 66.5, y - 4, 63, 24, n, () => { P_.tab = k === 'wall' && look ? tab : k; SFX.tap(); }, (k === 'wall' ? look : tab === k) ? 'gold' : 'cream'));
  { const lv = beautyLv(), nx = BEAUTY_STEPS[lv], b = beauty();   // milestone: what the next level of beauty gives
    T(c, nx ? '美观 ' + b + '/' + nx.at + ' → 下一级「' + nx.name + '」' : '已达「街知巷闻」，满级！', 14, y + 26, nx ? '#b8483c' : '#2f6e56', 'left', null);
    T(c, lv ? '美观奖励 ' + lv + ' 级：' + BEAUTY_STEPS.slice(0, lv).map(s => s.name).join('、') : '美观越高，客人越多', 14, y + 44, lv ? '#2f6e56' : SUB, 'left', null, 12); }
  y += 66;
  if (look) { [['wall', '墙纸'], ['floor', '地板'], ['counter', '前台'], ['booth', '卡座']].forEach(([k, n], i) => btn(c, 14 + i * 84, y - 6, 80, 22, n, () => { P_.tab = k; SFX.tap(); }, tab === k ? 'gold' : 'cream')); y += 22; }
  if (tab === 'items') {   // 摆设: plants, wall pieces, festive pieces, the fan → air conditioner
    const cat = P_.cat || 'plant', cf = comfort();
    ITEM_CATS.forEach(([k, n], i) => btn(c, 14 + i * 47, y, 45, 20, n, () => { P_.cat = k; SFX.tap(); }, cat === k ? 'gold' : 'cream'));
    T(c, '舒适 ' + cf + ' → 客流 +' + cf + '% · 客人耐心 +' + (cf / 2).toFixed(1) + '%', 14, y + 26, '#2f6e56', 'left', null);
    y += 46;
    if (cat === 'air') {
      const n = upLv('ac'), L = UPGRADES.ac.lv[n];
      card(c, 14, y, 332, 70, '#fffaf0'); TS(c, n ? UPGRADES.ac.lv[n - 1][0] : '壁扇', 22, y + 6, 15, INK);
      T(c, '现在：舒适 +' + (n ? 2 + 2 * n : 2) + (n ? ' · 客人肯多等 ' + (15 * n) + '%' : ' · 吹吓风'), 22, y + 28, SUB, 'left', null);
      if (L) { T(c, '下一级：' + L[0] + '（舒适 +' + (4 + 2 * n) + '，' + L[2] + '）', 22, y + 46, '#b8483c', 'left', null); btn(c, 246, y + 8, 92, 28, money$(L[1]), () => buyUpgrade('ac'), W.money >= L[1] ? 'gold' : 'off'); }
      else T(c, '满级', 336, y + 18, '#2f6e56', 'right', null);
      return;
    }
    if (cat === 'combo') {   // decor sets: which pieces, what's missing, the bonus
      DECOR_SETS.forEach((S, i) => { const yy = y + i * 38, done = setDone(S), gift = S[1].some(id => DECOR_ITEMS[id].cat === 'gift' || ['banner', 'card'].includes(id));
        card(c, 14, yy, 332, 35, done ? '#fff1c8' : '#fffaf0'); TS(c, S[0], 22, yy + 2, 15, done ? '#b8483c' : INK); T(c, '舒适 +' + S[2] + (gift ? ' · 含礼物' : ''), 22, yy + 20, done ? '#2f6e56' : SUB, 'left', null, 12);
        S[1].forEach((id, k) => { const x = 150 + k * 64, im = itemThumb(id), kk = Math.min(1, 40 / im.width, 27 / im.height); px(c, x, yy + 3, 58, 29, hasItem(id) ? '#e6f2ea' : '#ece2cf');
          c.save(); if (!hasItem(id)) c.globalAlpha = .35; c.drawImage(im, R(x + 29 - im.width * kk / 2), R(yy + 31 - im.height * kk), R(im.width * kk), R(im.height * kk)); c.restore(); }); });
      return;
    }
    if (cat === 'gift') {   // one piece from each kind of regular (at loyalty 8): who brings what, which ones have arrived
      { const lv = W.counterLv || 0, U = COUNTER_UP[lv], used = counterSpots().length - counterFree().length;   // the front counter's gift spots, and making room for more
        T(c, '前台礼物位 ' + used + '/' + counterSpots().length, 14, y + 3, INK, 'left', null); if (U) { T(c, U[2], 120, y + 4, SUB, 'left', null, 12); btn(c, 270, y, 76, 20, money$(U[1]), () => buyCounterUp(), W.money >= U[1] ? 'gold' : 'off'); } else T(c, '前台已经最大', 336, y + 3, '#2f6e56', 'right', null); y += 24; }
      Object.keys(GIFT_ITEM).forEach((kind, i) => { const id = GIFT_ITEM[kind], own = hasItem(id), x = 14 + (i % 3) * 112, yy = y + Math.floor(i / 3) * 36, f = (W.fans || {})[kind] || 0;
        card(c, x, yy, 108, 33, own ? '#e6f2ea' : '#ece2cf');
        if (own) { const im = itemThumb(id), k = Math.min(1, 26 / im.width, 26 / im.height); c.drawImage(im, R(x + 15 - im.width * k / 2), R(yy + 30 - im.height * k), R(im.width * k), R(im.height * k)); }
        else T(c, '？', x + 15, yy + 10, '#b0a08c', 'center', null);
        T(c, own ? DECOR_ITEMS[id].name.slice(0, 5) : kind.slice(0, 5), x + 30, yy + 3, own ? INK : '#8a7a6a', 'left', null, 12);
        if (!own) { px(c, x + 30, yy + 22, 72, 5, '#e3d6bc'); px(c, x + 30, yy + 22, R(72 * Math.min(1, f / GIFT_AT)), 5, '#3fbf7a'); } else if (WALL_IDS.includes(id)) btn(c, x + 64, yy + 17, 40, 16, '换位', () => moveWall(id), 'cream'); else if (COUNTER_OK.includes(id)) btn(c, x + 56, yy + 17, 48, 16, onCounter(id) ? '放地上' : '上前台', () => toggleCounter(id), onCounter(id) ? 'gold' : 'cream'); else T(c, '舒适+' + DECOR_ITEMS[id].comfort, x + 30, yy + 19, '#2f6e56', 'left', null, 12); });
      return;
    }
    Object.keys(DECOR_ITEMS).filter(id => DECOR_ITEMS[id].cat === cat && !DECOR_ITEMS[id].gift).forEach((id, i) => {
      const it = DECOR_ITEMS[id], x = 14 + (i % 2) * 168, yy = y + Math.floor(i / 2) * 76, own = hasItem(id);
      card(c, x, yy, 162, 70, own ? '#e6f2ea' : '#fffaf0'); px(c, x + 4, yy + 4, 48, 60, own ? '#d6eadc' : '#f3ead8'); { const im = itemThumb(id), k = Math.min(1, 44 / im.width, 56 / im.height); c.drawImage(im, R(x + 28 - im.width * k / 2), R(yy + 62 - im.height * k), R(im.width * k), R(im.height * k)); }
      TS(c, it.name, x + 58, yy + 5, 15, INK);
      T(c, it.note || ('舒适+' + it.comfort + ' 美观+' + it.beauty), x + 58, yy + 25, SUB, 'left', null, 12);
      if (it.season !== undefined) T(c, SEASONS[it.season].full + '摆 舒适×2' + (inSeason(it) ? ' ✓' : ''), x + 58, yy + 38, inSeason(it) ? '#2f6e56' : '#b0a08c', 'left', null, 12);
      if (own && it.cat === 'wall' && WALL_IDS.includes(id)) btn(c, x + 90, yy + 44, 66, 22, '换位置', () => moveWall(id), 'cream');
      else if (own) T(c, it.cat === 'wall' ? '挂咗' : '摆咗', x + 154, yy + 52, '#2f6e56', 'right', null);
      else btn(c, x + 90, yy + 44, 66, 22, money$(it.cost), () => buyItem(id), W.money >= it.cost ? 'gold' : 'off');
    });
    return;
  }
  if (tab === 'expand') {   // 扩建: open up next door, then more booths there
    const n = expandLv();
    TS(c, '隔壁堂食区', 22, y, 16, INK); T(c, '卡座 ' + BOOTHS.length + ' 组 · 座位 ' + SEATS.length + ' 个', 336, y + 2, '#2f6e56', 'right', null);
    EXPAND.forEach((E, i) => {
      const yy = y + 26 + i * 44, done = i < n, next = i === n, early = E.day && W.day < E.day;
      card(c, 14, yy, 332, 40, done ? '#e6f2ea' : next ? '#fff3d6' : '#ece2cf');
      TS(c, E.name, 22, yy + 4, 15, done ? '#2f6e56' : INK); T(c, E.desc, 22, yy + 22, SUB, 'left', null, 12);
      if (done) T(c, '已完成', 336, yy + 12, '#2f6e56', 'right', null);
      else if (!next) T(c, '先做上一步', 336, yy + 12, '#b0a08c', 'right', null);
      else if (early) T(c, '第 ' + E.day + ' 天开放', 336, yy + 12, SUB, 'right', null);
      else btn(c, 226, yy + 7, 112, 26, money$(E.cost), () => buyExpand(), W.money >= E.cost ? 'gold' : 'off');
    });
    { const nd = W.doors || 0, U = DOOR_UP[nd], yy = y + 26 + 6 * 44;   // 门口: open up one or two more doors
      card(c, 14, yy, 332, 40, U ? '#fff3d6' : '#e6f2ea'); TS(c, U ? U[0] : '门口已开到最多', 22, yy + 4, 15, U ? INK : '#2f6e56'); T(c, U ? U[2] : '两道新门都开了', 22, yy + 22, SUB, 'left', null, 12);
      if (U) { if (nd === 1 && !n) T(c, '先打通隔壁', 336, yy + 12, '#b0a08c', 'right', null); else btn(c, 226, yy + 7, 112, 26, money$(U[1]), () => buyDoor(), W.money >= U[1] ? 'gold' : 'off'); } }
    ROOMS.forEach(([f, name, cost, desc], i) => { const yy = y + 26 + 4 * 44 + i * 44, done = !!W[f];   // the kitchen and the front counter grow too
      card(c, 14, yy, 332, 40, done ? '#e6f2ea' : n ? '#fff3d6' : '#ece2cf'); TS(c, name, 22, yy + 4, 15, done ? '#2f6e56' : INK); T(c, desc, 22, yy + 22, SUB, 'left', null, 12);
      if (done) T(c, '已完成', 336, yy + 12, '#2f6e56', 'right', null); else if (!n) T(c, '先打通隔壁', 336, yy + 12, '#b0a08c', 'right', null); else btn(c, 226, yy + 7, 112, 26, money$(cost), () => buyRoom(i), W.money >= cost ? 'gold' : 'off'); });
    return;
  }
  if (tab === 'shelf') {
    SHELF_IDS.forEach((id, i) => {   // one compact row per spot; extra spots can be bought here (as a shelf or a fridge)
      const rh = Math.min(35, Math.floor((BAR_Y - 6 - y) / SHELF_IDS.length)), yy = y + i * rh, t = W.decor.tier[id] || 0, nx = SHELF_TIERS[t + 1], st = W.shelves[id], locked = st.locked;
      card(c, 14, yy, 332, rh - 3, st.extra && locked ? '#ece2cf' : '#fffaf0');
      if (st.extra && locked) { TS(c, '加买位 ' + SHELF_NO[id], 22, yy + 6, 15, SUB); const cost = EXTRA_SHELF[id], ok = W.money >= cost ? 'gold' : 'off'; if (expandLv() < (EXTRA_NEED[id] || 0)) { T(c, '打通隔壁后可买（放隔壁）', 336, yy + 8, '#b0a08c', 'right', null, 12); return; }
        btn(c, 150, yy + 4, 92, 24, '货架 ' + money$(cost), () => buyExtraShelf(id, false), ok); btn(c, 246, yy + 4, 92, 24, '冷柜 ' + money$(cost), () => buyExtraShelf(id, true), ok); return; }
      TS(c, shelfTitle(id), 22, yy + 7, 15, INK); if (!locked) T(c, SHELF_TIERS[t].name + ' ' + st.layers.map(L => L.cap).join('/'), 96, yy + 9, SUB, 'left', null); else T(c, '盖着布', 96, yy + 9, '#b0a08c', 'left', null, 12);
      if (locked) { btn(c, 150, yy + 4, 92, 24, '货架 ' + money$(SHELF_COST), () => unlockShelf(id, false), W.money >= SHELF_COST ? 'gold' : 'off'); btn(c, 246, yy + 4, 92, 24, '冷柜 ' + money$(SHELF_COST), () => unlockShelf(id, true), W.money >= SHELF_COST ? 'gold' : 'off'); }   // the covered spots can be opened here too
      else if (nx) btn(c, 214, yy + 4, 124, 24, '换' + nx.name + ' ' + money$(nx.cost), () => buyShelfTier(id), W.money >= nx.cost ? 'gold' : 'off');
      else T(c, '已是最好', 336, yy + 9, '#c99428', 'right', null);
    });

    return;
  }
  if (tab === 'theme') {   // 整套搭配: one tap puts a whole look on; the full set gives extra beauty
    const on = themeOn(); T(c, on ? '现在是「' + on.name + '」：美观 +' + on.bonus : '墙纸、地板、前台、卡座凑齐一套，美观有加成', 14, y - 2, on ? '#2f6e56' : SUB, 'left', null, 12); y += 16;
    THEMES.forEach((Th, i) => { const yy = y + i * 80, cur = on === Th, cost = themeCost(Th), S = DECOR_SRC();
      card(c, 14, yy, 332, 74, cur ? '#ffe9b0' : '#fffaf0');
      { const x = 22, y0 = yy + 6, Wl = WALLS[Th.wall], F = FLOORS[Th.floor], Cs = COUNTER_STYLES[Th.counter], Bs = BOOTH_STYLES[Th.booth];   // a little corner of the shop in these colours
        px(c, x - 1, y0 - 1, 64, 64, OUT); px(c, x, y0, 62, 26, Wl.wall); if (Wl.tiles) for (let t = 0; t < 26; t += 6) px(c, x, y0 + t, 62, 1, Wl.wallD); px(c, x, y0 + 20, 62, 8, Wl.low || shade(Wl.wall, -40));
        for (let i2 = 0; i2 < 8; i2++) for (let j = 0; j < 4; j++) px(c, x + i2 * 8 - (i2 === 7 ? 2 : 0), y0 + 28 + j * 8 + (j === 3 ? -2 : 0), 8, 8, F.plank ? (j % 2 ? F.A : F.B) : F.mosaic ? ((i2 + j) % 3 ? F.A : F.B) : F.chips ? F.A : (i2 + j) % 2 ? F.B : F.A);
        if (F.chips) for (let k = 0; k < 30; k++) px(c, x + (k * 37) % 60, y0 + 30 + (k * 23) % 30, 1, 1, ['#8a9a8a', '#c88a6a', '#6a7a8a'][k % 3]);
        px(c, x + 4, y0 + 22, 30, 4, Cs.top[0]); px(c, x + 6, y0 + 26, 26, 16, Cs.cab[1]); px(c, x + 40, y0 + 30, 18, 12, Bs.leather[1]); px(c, x + 40, y0 + 30, 18, 3, Bs.leather[0]); px(c, x + 42, y0 + 42, 14, 4, C.wood); }
      TS(c, Th.name, 94, yy + 6, 15, INK); T(c, Th.note, 94, yy + 27, SUB, 'left', null, 12); T(c, '整套 美观 +' + Th.bonus, 94, yy + 48, '#2f6e56', 'left', null, 12);
      if (cur) T(c, '使用中', 290, yy + 48, '#2f6e56', 'center', null);
      else btn(c, 236, yy + 42, 104, 26, cost ? '一键换 ' + money$(cost) : '一键换上', () => buyTheme(i), W.money >= cost ? 'gold' : 'off'); });
    return;
  }
  const [list, ownKey, def] = DECOR_SRC()[tab]; W.decor[ownKey] = W.decor[ownKey] || { [def]: true };
  const own = W.decor[ownKey], cur = W.decor[tab] || def;
  if (tab === 'booth' && SEATS.length) { const best = Math.max(...SEATS.map(boothEnv)); T(c, '贵宾要：高级卡座 + 环境 ≥ ' + VIP_NEED + '（最好一张 ' + best + '）', 14, y - 2, best >= VIP_NEED && W.decor.booth === 'deluxe' ? '#2f6e56' : '#b8483c', 'left', null, 12); y += 16; }
  Object.keys(list).forEach((k, i) => {
    const S = list[k], x = 14 + (i % 2) * 168, yy = y + Math.floor(i / 2) * 84;
    card(c, x, yy, 162, 80, cur === k ? '#ffe9b0' : '#fffaf0'); c.save(); c.translate(x + 8, yy + 4); c.scale(.97, .97); decorSwatch(c, tab, S, 0, 0); c.restore();
    TS(c, S.name, x + 72, yy + 6, 15, INK); T(c, '美观 +' + S.beauty, x + 72, yy + 26, SUB, 'left', null, 12); if (S.tip) T(c, '小费 +$' + S.tip, x + 72, yy + 39, '#2f6e56', 'left', null, 12);
    if (cur === k) T(c, '使用中', x + 116, yy + 58, '#2f6e56', 'center', null);
    else btn(c, x + 74, yy + 52, 80, 24, own[k] ? '换上' : money$(S.cost), () => buyDecor(tab, k), own[k] || W.money >= S.cost ? 'gold' : 'off');
  });
  { const d = W.decor, rows = Math.ceil(Object.keys(list).length / 2), yb = y + rows * 84 + 4;   // where today's beauty comes from
    const parts = [['墙纸', (WALLS[d.wall] || WALLS.mint).beauty], ['卡座', (BOOTH_STYLES[d.booth] || BOOTH_STYLES.green).beauty], ['前台', (COUNTER_STYLES[d.counter] || COUNTER_STYLES.oak).beauty], ['地板', (FLOORS[d.floor] || FLOORS.peach).beauty], ['搭配', (themeOn() || {}).bonus || 0], ['货架', SHELF_IDS.reduce((a, id) => a + (W.shelves[id].locked ? 0 : SHELF_TIERS[(d.tier || {})[id] || 0].beauty), 0)], ['摆设', Object.keys(DECOR_ITEMS).reduce((a, id) => a + (hasItem(id) ? DECOR_ITEMS[id].beauty : 0), 0)], ['音乐', 2 * upLv('music')], ['阿青', hasPerk('qing_menu') ? 3 : 0]].filter(q => q[1]);
    card(c, 14, yb, 332, 22, '#fff3d6'); T(c, '美观 ' + beauty() + (parts.length ? '：' + parts.map(q => q[0] + q[1]).join(' ') : '：买墙纸、卡座、摆设都会加'), 22, yb + 6, INK, 'left', null); }
}
function drawPlanPanel(c) {
  let y = sheet(c, '今日安排', '', 110);
  const fc = W.today.fc;   // forecast + two daily dials: prices, how much to keep ready
  if (fc) { card(c, 14, y - 8, 332, 22, '#fff1c8'); T(c, wxOf().name + ' · 预计约 ' + fc.n + ' 位客 · 好卖 ' + fc.top.map(p => PRODUCTS[p].name).join(' '), 22, y - 4, INK, 'left', null); }
  y += 20;
  T(c, '价钱', 16, y + 5, SUB, 'left', null); PRICE_TIERS.forEach((q, k) => btn(c, 60 + k * 62, y, 58, 22, q.name, () => setTier('priceTier', k), priceTier() === q ? 'gold' : 'cream')); T(c, priceTier().desc, 252, y + 5, SUB, 'left', null);
  y += 26;
  T(c, '备货', 16, y + 5, SUB, 'left', null); STOCK_TIERS.forEach((q, k) => btn(c, 60 + k * 62, y, 58, 22, q.name, () => setTier('stockTier', k), stockTier() === k ? 'gold' : 'cream')); T(c, ['剩货少', '照平时', '唔怕卖晒'][stockTier()], 252, y + 5, SUB, 'left', null);
  y += 26;
  T(c, '促销', 16, y + 5, SUB, 'left', null); PROMOS.forEach((q, k) => btn(c, 52 + k * 74, y, 70, 22, q.name, () => setPromo(q.id), W.today.promo === q.id ? 'gold' : 'cream'));
  y += 30;
  { const sp = W.showcase && unlocked(W.showcase) ? W.showcase : null;   // the signature showcase on the counter
    T(c, '招牌柜', 16, y + 5, SUB, 'left', null); if (sp) { half(c, PRODUCTS[sp].img, 70, y + 11); T(c, PRODUCTS[sp].name + ' · 多四成人买', 84, y + 5, '#b8483c', 'left', null); }
    btn(c, 270, y, 76, 22, '换招牌', () => { PANEL = { kind: 'showcase', back: PANEL, bar: 3 }; SFX.tap(); }, 'cream'); y += 28; }
  { const q = PROMOS.find(q => q.id === W.today.promo) || PROMOS[0], tip = q.cost ? q.name + '：' + q.desc + ' · ' + money$(q.cost) : '主打的先做、多做；不做的就不做。'; T(c, tip, 16, y, q.cost ? '#b8483c' : SUB, 'left', null); } y += 16;
  const list = PIDS.filter(unlocked), h = Math.min(44, Math.floor((BAR_Y - 8 - y) / list.length));
  list.forEach((p, i) => {
    const yy = y + i * h, rh = h - 5;
    card(c, 14, yy, 332, rh, '#fffaf0'); half(c, PRODUCTS[p].img, 30, yy + rh / 2);
    { const ty = yy + rh / 2 - 7, last = W.history.length ? (W.history[W.history.length - 1].sold || {})[p] || 0 : 0;   // name, price, sold today (yesterday), on hand, speed
      { const nm = PRODUCTS[p].name; T(c, nm.length > 4 ? nm.slice(0, 3) + '…' : nm, 46, ty, INK, 'left', null, nm.length > 3 ? 12 : FS); } T(c, '$' + priceOf(p), 100, ty, '#2f6e56', 'left', null, 12);
      T(c, (W.today.sold[p] || 0) + '/' + last, 122, ty, SUB, 'left', null, 12); T(c, '存' + (shelfHave(p) + (W.stock[p] || 0)), 154, ty, '#8a6a4a', 'left', null, 12); T(c, speedTag(p)[0], 190, ty, speedTag(p)[1], 'right', null, 12); }
    [['pri', '主打'], ['on', '照常'], ['off', '不做']].forEach(([v, lab], k) => btn(c, 192 + k * 51, yy + (rh - Math.min(24, rh)) / 2, 47, Math.min(24, rh), lab, () => setPlan(p, v), W.plan[p] === v ? (v === 'off' ? 'red' : 'gold') : 'cream'));
  });
}
function drawShowcasePick(c, P_) {   // which item goes in the counter glass case today
  let y = sheet(c, '招牌展示柜', '多四成人买 · 美观 +2', 200);
  const L = PIDS.filter(showcaseOk), per = 4, tw = 78;
  L.forEach((p, i) => { const x = 14 + (i % per) * (tw + 5), yy = y + Math.floor(i / per) * 64, on = W.showcase === p;
    card(c, x, yy, tw, 58, on ? '#ffe9b0' : '#fffaf0'); full(c, PRODUCTS[p].img, x + tw / 2, yy + 20); T(c, PRODUCTS[p].name, x + tw / 2, yy + 38, INK, 'center', null);
    if (PRODUCTS[p].cake) T(c, '蛋糕', x + tw - 4, yy + 3, '#b8483c', 'right', null);
    button(x, yy, tw, 58, () => { W.showcase = p; SFX.tap(); PANEL = P_.back || null; saveGame(); }); });
  { const yb = y + Math.ceil(L.length / per) * 64 + 4; T(c, '招牌货放喺前台玻璃柜（由厨房拎）', 180, yb, SUB, 'center', null); T(c, '客人埋单时有机会顺手买一件', 180, yb + 16, SUB, 'center', null); }
}
function drawSpecialPanel(c) {   // 特技: unlocked with ★ once someone is Lv4; then a switch
  let y = sheet(c, '员工特技', '积分 ' + (W.pts || 0) + ' ★', 140) - 2;
  T(c, '升到 Lv' + SK_LV + ' 后用积分解锁，解锁后可随时开关', 14, y, SUB, 'left', null, 12); y += 18;
  const rh = Math.min(64, Math.floor((BAR_Y - 6 - y) / Object.keys(SPECIALS).length));
  Object.keys(SPECIALS).forEach((k, i) => { const [id, name, desc, cost] = SPECIALS[k], yy = y + i * rh, has = (W.sk || {})[id], on = has === true, here = !HIRE[k] || W.staff[k].hired, lv = lvOf(k);
    card(c, 14, yy, 332, rh - 4, on ? '#fff1c8' : here ? '#fffaf0' : '#ece2cf'); const img = STAFF_HD[k].SE[0]; c.drawImage(img, 0, 0, img.width, 56, 20, yy + 4, img.width / 2, 28);
    TS(c, name, 56, yy + 4, 15, here ? INK : '#b0a08c'); T(c, (NAMES[k] || k) + ' · Lv' + lv, 140, yy + 7, '#b8483c', 'left', null, 12);
    T(c, desc, 56, yy + 26, SUB, 'left', null, 12);
    if (has !== undefined) btn(c, 270, yy + 8, 70, 24, on ? '开着' : '关着', () => buySpecial(k), on ? 'gold' : 'cream');
    else btn(c, 262, yy + 8, 78, 24, cost + '★', () => buySpecial(k), here && lv >= SK_LV && (W.pts || 0) >= cost ? 'gold' : 'off');
    if (has === undefined && lv < SK_LV) T(c, '需 Lv' + SK_LV, 300, yy + 36, '#b0a08c', 'center', null, 12); });
}
function drawGuestPanel(c, P_) {   // one kind of customer: portrait, who they are, what they like, how close they are
  const ci = P_.ci, kind = guestKind(ci), f = (W.fans || {})[kind] || 0, per = personaOf(ci);
  let y = sheet(c, kind, '← 名册', 276); button(240, 276, 80, 26, () => { PANEL = { kind: 'guests', bar: 4, from: P_.from }; SFX.tap(); });
  card(c, 14, y, 112, 132, '#fff3d6'); { const b = guestBust(ci); c.drawImage(b, 0, 0, 200, 230, 16, y + 2, 108, 124); }
  T(c, '财富 ' + '$'.repeat(wealthStars(ci)), 136, y + 2, '#2f6e56', 'left', null);
  T(c, '好感 ' + f + ' / ' + LOYAL_STORY, 136, y + 20, INK, 'left', null);
  px(c, 136, y + 38, 206, 8, '#e3d6bc'); px(c, 136, y + 38, R(206 * Math.min(1, f / LOYAL_STORY)), 8, f >= LOYAL_STORY ? '#c99428' : f >= GIFT_AT ? '#3fbf7a' : '#e88aa0'); px(c, 136 + R(206 * GIFT_AT / LOYAL_STORY), y + 35, 1, 14, '#8a6a4a');
  T(c, (W.gifted || {})[kind] ? '已送过摆设' : '好感 ' + GIFT_AT + '：送摆设', 136, y + 52, SUB, 'left', null);
  T(c, (W.keepsakes || {})[kind] ? '纪念品：' + KEEPSAKE[kind] : '好感 ' + LOYAL_STORY + '：专属故事 + 纪念品', 136, y + 68, (W.keepsakes || {})[kind] ? '#b8483c' : SUB, 'left', null);
  T(c, '爱吃', 136, y + 92, SUB, 'left', null);
  Object.entries(per.likes || {}).sort((a, b) => b[1] - a[1]).map(q => q[0]).filter(p => PRODUCTS[p]).slice(0, 4).forEach((p, i) => { card(c, 168 + i * 44, y + 86, 40, 40, '#fffaf0'); half(c, PRODUCTS[p].img, 188 + i * 44, y + 104); if (!unlocked(p)) T(c, '?', 204 + i * 44, y + 112, '#b0a08c', 'right', null); });
  y += 142; card(c, 14, y, 332, 74, '#fffaf0'); T(c, '背景', 22, y + 6, '#b8483c', 'left', null);
  wrapText(c, L(GUEST_BIO[kind] || ''), 312).slice(0, 4).forEach((ln, i) => T(c, ln, 22, y + 26 + i * 16, INK, 'left', null));
  y += 84; if (LAB_FANS[kind]) T(c, LAB_FANS[kind] >= 1.5 ? '很喜欢港式 Lab 的新奇点心' : LAB_FANS[kind] < 1 ? '对新奇点心兴趣不大，偏爱老味道' : '新旧口味都可以', 180, y, SUB, 'center', null);
}
function drawGoalsPanel(c) {   // every milestone: done, the one now (with progress and reward), the ones ahead
  let y = sheet(c, '目标 ' + (W.goal || 0) + '/' + GOALS.length, bookBack(70) || '', 70) - 4; y = goalTabs(c, y, 'goals'); const rh = Math.min(28, Math.floor((BAR_Y - 6 - y) / GOALS.length));
  GOALS.forEach((G_, i) => { const yy = y + i * rh, done = i < (W.goal || 0), now = i === (W.goal || 0);
    card(c, 14, yy, 332, rh - 3, done ? '#e6f2ea' : now ? '#fff1c8' : '#f4ecdc');
    T(c, (done ? '✓ ' : '') + G_[0], 22, yy + 3, done ? '#2f6e56' : now ? INK : '#9a8a78', 'left', null, now ? FS : 12);
    T(c, G_[1], 120, yy + 5, now ? SUB : '#b0a08c', 'left', null, 12);
    if (now) { const [a, b] = G_[2](); T(c, (b <= 5 ? (Math.round(a * 10) / 10) : R(a)) + '/' + b, 340, yy + 5, '#b8483c', 'right', null, 12); }
    else T(c, '+' + money$(G_[3]), 340, yy + 5, done ? '#2f6e56' : '#b0a08c', 'right', null, 12); });
}
function drawMenuPanel(c) {   // the shop's full menu: what is on sale (with price) and what is still to come
  let y = sheet(c, '餐单 ' + PIDS.filter(p => !PRODUCTS[p].lab && unlocked(p)).length + '/' + PIDS.filter(p => !PRODUCTS[p].lab).length, bookBack(70) || '', 70) - 2;
  const grp = [['饮品', p => PRODUCTS[p].where === 'fridge' && !PRODUCTS[p].cake && !PRODUCTS[p].lab && !['pudding', 'mango', 'dpn'].includes(p)], ['饼食', p => !PRODUCTS[p].cake && !PRODUCTS[p].lab && (PRODUCTS[p].where === 'table' || ['pudding', 'mango', 'dpn'].includes(p))], ['蛋糕', p => PRODUCTS[p].cake], ['港式 Lab', p => PRODUCTS[p].lab && unlocked(p)]];
  for (const [title, f] of grp) { const L_ = PIDS.filter(p => f(p) && !(PRODUCTS[p].lab && !unlocked(p)) && (PRODUCTS[p].lab || PRODUCTS[p].day < 999)); if (!L_.length) continue;
    TS(c, title, 15, y, 13, '#b8483c'); px(c, 14, y + 18, 332, 1, '#e3d6bc'); y += 22;
    L_.forEach((p, i) => { const x = 14 + (i % 3) * 112, yy = y + Math.floor(i / 3) * 42, on = unlocked(p); card(c, x, yy, 108, 38, on ? '#fffaf0' : '#ece2cf');
      const nm = PRODUCTS[p].name, short = nm.length > 4 ? nm.slice(0, 4) : nm;   // one line: picture, name, price — locked ones just greyed
      if (on) { half(c, PRODUCTS[p].img, x + 15, yy + 19); T(c, short, x + 30, yy + 11, INK, 'left', null, nm.length > 3 ? 12 : FS); T(c, '$' + priceOf(p), x + 104, yy + 12, '#2f6e56', 'right', null, 12); }
      else { T(c, '？', x + 15, yy + 12, '#b0a08c', 'center', null); T(c, short, x + 30, yy + 11, '#b0a08c', 'left', null, nm.length > 3 ? 12 : FS); if (W.day >= PRODUCTS[p].day) T(c, '研发', x + 104, yy + 12, '#c99428', 'right', null, 12); } });
    y += Math.ceil(L_.length / 3) * 42 + 6; }
}
function drawGuestsPanel(c) {   // every kind of customer: who comes, how loyal they are (gift at 8, their story + keepsake at 14), wealth, favourite
  let y = sheet(c, '客人', bookBack(70) || '好感 8 送礼 · 14 故事', 70) - 4;
  const dayOf = ci => (GUEST_UNLOCK.find(q => q[0] === ci) || [0, 99])[1], list = CUST_POOL.filter(guestOpen).concat(CUST_POOL.filter(ci => !guestOpen(ci)).sort((a, b) => dayOf(a) - dayOf(b)));   // regulars first, then who comes next
  list.forEach((ci, i) => {
    const x = 14 + (i % 3) * 112, yy = y + Math.floor(i / 3) * 59, kind = guestKind(ci), open = guestOpen(ci), f = (W.fans || {})[kind] || 0;
    card(c, x, yy, 108, 56, open ? '#fffaf0' : '#ece2cf');
    if (!open) { const u = GUEST_UNLOCK.find(q => q[0] === ci); T(c, '？？？', x + 54, yy + 10, '#b0a08c', 'center', null); T(c, '第' + u[1] + '天' + (u[2] ? '/店Lv' + u[2] : '') + '来', x + 54, yy + 30, '#b0a08c', 'center', null); return; }
    { const b = guestBust(ci); c.drawImage(b, 0, 0, 200, 210, x + 2, yy + 3, 30, 32); } button(x, yy, 108, 56, () => { PANEL = { kind: 'guest', ci, bar: 4, from: PANEL.from }; SFX.tap(); });   // head and shoulders; tap: their story
    T(c, kind.length > 5 ? kind.slice(0, 5) : kind, x + 34, yy + 3, INK, 'left', null);
    T(c, '$'.repeat(wealthStars(ci)), x + 34, yy + 19, '#2f6e56', 'left', null);
    const fav = Object.entries(personaOf(ci).likes || {}).sort((a, b) => b[1] - a[1]).map(q => q[0]).find(p => PRODUCTS[p]); if (fav) half(c, PRODUCTS[fav].img, x + 96, yy + 24);
    px(c, x + 4, yy + 44, 100, 6, '#e3d6bc'); px(c, x + 4, yy + 44, R(100 * Math.min(1, f / LOYAL_STORY)), 6, f >= LOYAL_STORY ? '#c99428' : f >= GIFT_AT ? '#3fbf7a' : '#e88aa0'); px(c, x + 4 + R(100 * GIFT_AT / LOYAL_STORY), yy + 42, 1, 10, '#8a6a4a');   // loyalty, a tick at the gift
    if ((W.keepsakes || {})[kind]) T(c, '♥', x + 78, yy + 19, '#d0453a', 'left', null);
  });
  const ks = Object.keys(W.keepsakes || {}); T(c, ks.length ? '纪念品 ' + ks.length + ' 件：' + KEEPSAKE[ks[ks.length - 1]] + (ks.length > 1 ? ' 等' : '') : '熟客满 14 好感会送纪念品（舒适 +1）', 180, y + Math.ceil(CUST_POOL.length / 3) * 59 + 2, SUB, 'center', null);
}
function drawPlaceAsk(c, P_) {   // just bought a floor piece: place it now, or leave it at its default spot
  const it = DECOR_ITEMS[P_.id]; c.save(); c.globalAlpha = .5; px(c, 0, 0, 360, 640, '#1c141c'); c.restore(); button(0, 0, 360, 640, () => {});
  card(c, 50, 230, 260, 150, PAPER); TS(c, it.name + (P_.gift ? ' 收到' : ' 买咗'), 180, 244, 18, INK, 'center');
  T(c, '已经摆喺默认位置（靠墙、唔挡路）', 180, 276, SUB, 'center', null); T(c, '舒适 ' + comfort() + ' · 美观 ' + beauty(), 180, 294, '#2f6e56', 'center', null);
  const small = P_.gift && COUNTER_OK.includes(P_.id) && !(W.giftShelf && isSmallGift(P_.id));   // a small gift can go on the front counter
  btn(c, 58, 322, small ? 80 : 110, 36, '现在摆放', () => { SFX.tap(); placeNow(P_.id); }, 'gold');
  if (small) btn(c, 142, 322, 76, 36, '摆前台', () => { if (toggleCounter(P_.id)) PANEL = P_.back || null; }, 'gold');
  btn(c, small ? 222 : 176, 322, small ? 80 : 126, 36, small ? '放默认' : '就放默认位置', () => { SFX.tap(); PANEL = P_.back || null; }, 'cream');
}
function drawSupPanel(c) {   // shop level + suppliers you can sign with
  let y = sheet(c, '供应商', money$(W.money), 200);
  const lv = shopLv(), nx = SHOP_LV[lv], served = (W.total && W.total.served) || 0;
  card(c, 14, y, 332, 52, '#fff3d6'); TS(c, '店铺 Lv' + lv, 22, y + 6, 16, '#b8483c'); T(c, '原料平 ' + (lv - 1) * 2 + '%', 336, y + 8, '#2f6e56', 'right', null);
  T(c, nx !== undefined ? '累计招呼 ' + served + '/' + nx + ' 位客人升下一级' : '已经满级', 22, y + 30, SUB, 'left', null);
  y += 62;
  card(c, 14, y, 332, 52, '#fffaf0'); TS(c, '荣叔', 22, y + 6, 15, INK); T(c, '样样都有，照价', 22, y + 28, SUB, 'left', null); T(c, '一直合作', 336, y + 18, '#2f6e56', 'right', null);
  y += 58;
  for (const k in SUPPLIERS) {
    const S = SUPPLIERS[k], has = (W.sup || {})[k], ok = lv >= S.lv;
    card(c, 14, y, 332, 52, has ? '#e6f2ea' : ok ? '#fffaf0' : '#ece2cf'); TS(c, S.name, 22, y + 6, 15, INK); T(c, S.desc, 22, y + 28, SUB, 'left', null);
    if (has) T(c, '已签约', 336, y + 18, '#2f6e56', 'right', null);
    else if (!ok) T(c, '店铺 Lv' + S.lv + ' 开放', 336, y + 18, '#b0a08c', 'right', null);
    else btn(c, 246, y + 12, 92, 28, '签约 ' + money$(S.cost), () => signSupplier(k), W.money >= S.cost ? 'gold' : 'off');
    y += 58;
  }
  btn(c, 14, BAR_Y - 40, 100, 30, '返去买料', () => { PANEL = { kind: 'shop', bar: 1 }; SFX.tap(); }, 'cream');
}
function drawPerkPanel(c, P_) {   // Lv3 / Lv5: choose one of two new abilities
  const nm = { kun: '坤伯', lin: '莲姨', wen: '雯姐', shao: '阿少', qing: '阿青', yao: '耀仔' }[P_.k];
  let y = sheet(c, nm + ' 升到 ' + P_.lv + ' 级', '揀一样新本事', 300);
  PERKS[P_.k][P_.lv].forEach(([id, name, desc], i) => {
    const yy = y + 6 + i * 92; card(c, 24, yy, 312, 82, '#fffaf0'); TS(c, '★ ' + name, 40, yy + 10, 18, '#b8483c'); T(c, desc, 40, yy + 42, INK, 'left', null);
    btn(c, 236, yy + 26, 88, 30, '学呢样', () => pickPerk(P_.k, id));
  });
}
function drawAchPanel(c) {   // achievements: done ones in gold with their day, the rest grey with what to do
  const n = ACH.filter(a => W.ach[a.id]).length;
  let y = sheet(c, '成就 ' + n + '/' + ACH.length, bookBack(60) || '积分 ' + (W.pts || 0), 60) - 6; y = goalTabs(c, y, 'ach');
  const per = 17, pages = Math.ceil(ACH.length / per), pg = Math.min(pages - 1, PANEL.page || 0);   // paged: the list grows with the content
  ACH.slice(pg * per, pg * per + per).forEach((a, i) => {
    const yy = y + i * 25, done = !!W.ach[a.id];
    px(c, 14, yy, 332, 23, done ? '#fff3d0' : '#f4ecdc'); px(c, 14, yy + 22, 332, 1, '#e3d6bc');
    px(c, 18, yy + 4, 15, 15, done ? C.gold : '#d8cdb5'); if (done) T(c, '★', 25, yy + 4, '#8a5a10', 'center', null);
    T(c, a.name, 40, yy + 5, done ? INK : '#8a7a68', 'left', null); T(c, a.desc, 116, yy + 5, done ? SUB : '#a89480', 'left', null);
    T(c, done ? '第' + W.ach[a.id] + '天' : '+' + a.pts + '分' + (a.money ? '+$' + a.money : ''), 342, yy + 5, done ? '#2f6e56' : '#c99428', 'right', null);
  });
  if (pages > 1) { const yb = y + per * 25 + 4; T(c, (pg + 1) + ' / ' + pages, 180, yb + 6, SUB, 'center', null);
    btn(c, 40, yb, 80, 26, '上一页', () => { PANEL.page = Math.max(0, pg - 1); SFX.tap(); }, pg ? 'cream' : 'off'); btn(c, 240, yb, 80, 26, '下一页', () => { PANEL.page = Math.min(pages - 1, pg + 1); SFX.tap(); }, pg < pages - 1 ? 'cream' : 'off'); }
}
function drawBookPanel(c) {   // the books: today's numbers in a two-column table, upgrades two to a row, the last seven days as bars
  let y = sheet(c, '账本 · 第 ' + W.day + ' 天', money$(W.money), 70);
  const D = W.today, st = D.stars.length ? D.stars.reduce((a, b) => a + b, 0) / D.stars.length : 0, inShop = D.served - D.dine - D.take;
  card(c, 14, y - 4, 332, 72, '#fffaf0');
  const cell = (i, a, b, col = INK) => { const x = 22 + (i % 2) * 166, yy = y + Math.floor(i / 2) * 16; T(c, a, x, yy, SUB, 'left', null); T(c, b, x + 150, yy, col, 'right', null); };
  cell(0, '收入', money$(D.revenue), '#2f6e56'); cell(1, '客人', D.served + '（店' + inShop + ' 座' + D.dine + ' 外' + D.take + '）');
  cell(2, '原料', '-' + money$(D.packCost), '#b8342c'); cell(3, '走掉', String(D.lost || 0), D.lost ? '#b8342c' : INK);
  cell(4, '茶位 + 小费', money$((D.seat || 0) + (D.tips || 0)), '#2f6e56'); cell(5, '套餐 / 加购', (D.combos || 0) + ' / ' + (D.addon || 0));
  cell(6, '清洁', Math.round(100 - dirtOf()) + '%', dirtOf() > 50 ? '#b8342c' : '#2f6e56'); cell(7, '★ / 名气', (st ? st.toFixed(1) : '-') + ' / ' + W.rep.toFixed(1), '#c99428');
  y += 74; T(c, '升级（每样三级）', 16, y, SUB, 'left', null); y += 15;
  Object.keys(UPGRADES).forEach((k, i) => {   // two to a row: next level's name, ●●○, what it does, price
    const u = UPGRADES[k], n = upLv(k), L = u.lv[n], early = u.day && W.day < u.day, x = 14 + (i % 2) * 168, yy = y + Math.floor(i / 2) * 46;
    card(c, x, yy, 164, 43, n === 3 ? '#e6f2ea' : '#fffaf0');
    T(c, L ? L[0] : u.lv[2][0], x + 6, yy + 3, INK, 'left', null); T(c, '●'.repeat(n) + '○'.repeat(3 - n), x + 158, yy + 3, '#c99428', 'right', null);
    T(c, (L ? L[2] : '满级').slice(0, 8), x + 6, yy + 25, SUB, 'left', null, 12);
    if (L && early) T(c, '第' + u.day + '天', x + 158, yy + 24, SUB, 'right', null);
    else if (L) btn(c, x + 104, yy + 20, 56, 20, money$(L[1]), () => buyUpgrade(k), W.money >= L[1] ? 'gold' : 'off');
  });
  y += Math.ceil(Object.keys(UPGRADES).length / 2) * 46 + 4;
  const H = W.history.slice(-7);   // last seven days: revenue (gold) and profit (green, red for a loss), with a scale, values and totals
  { const ch = Math.max(96, Math.min(150, BAR_Y - 76 - y - 20)), k$ = v => (v < 0 ? '-' : '') + (Math.abs(v) >= 1000 ? (Math.abs(v) / 1000).toFixed(1) + 'k' : '' + Math.abs(R(v)));
    card(c, 14, y, 332, ch, '#fffaf0'); TS(c, '近 7 日', 22, y + 5, 15, INK);
    const lg = (x, col, t) => { px(c, x - 1, y + 8, 10, 10, OUT); px(c, x, y + 9, 8, 8, col); T(c, t, x + 11, y + 6, SUB, 'left', null, 12); };
    lg(206, '#e7c34a', '收入'); lg(250, '#3fbf7a', '净赚'); lg(294, '#e0603a', '亏本');
    if (!H.length) T(c, '收工后会有记录', 180, y + ch / 2, SUB, 'center', null);
    else {
      const sum = H.reduce((a, h) => a + h.revenue, 0), net = H.reduce((a, h) => a + h.profit, 0);
      T(c, '合计 ' + money$(sum) + ' · 日均 ' + money$(R(sum / H.length)) + ' · 净赚 ' + money$(net), 22, y + 24, net >= 0 ? '#2f6e56' : '#b8342c', 'left', null, 12);
      const top = y + 50, bot = y + ch - 22, mx = Math.max(10, ...H.map(h => h.revenue), ...H.map(h => h.profit)), mn = Math.max(0, ...H.map(h => -h.profit)), span = mx + mn, zero = R(top + (bot - top) * mx / span), sc = v => v / span * (bot - top);
      for (const f of [1, .5]) { const gy = R(zero - sc(mx * f)); for (let x = 50; x < 338; x += 4) px(c, x, gy, 2, 1, '#e3d6bc'); T(c, k$(mx * f), 46, gy - 6, '#b0a08c', 'right', null, 12); }
      px(c, 48, zero, 290, 1, '#b8a48a'); T(c, '0', 46, zero - 6, '#b0a08c', 'right', null, 12);
      const cw = 288 / 7;
      H.forEach((h, i) => { const cx = R(50 + cw * (i + .5) + cw * (7 - H.length)), last = i === H.length - 1;
        const rh = Math.max(1, R(sc(h.revenue))), bx = cx - 12;   // revenue bar: outlined, lit top, shaded side
        px(c, bx - 1, zero - rh - 1, 16, rh + 1, OUT); px(c, bx, zero - rh, 14, rh, '#e7c34a'); px(c, bx, zero - rh, 14, 2, '#f8e08a'); px(c, bx + 11, zero - rh + 2, 3, rh - 2, '#c99a2a');
        const ph = Math.max(1, R(sc(Math.abs(h.profit)))), py = h.profit >= 0 ? zero - ph : zero + 1, pc = h.profit >= 0 ? '#3fbf7a' : '#e0603a';   // profit (or loss below the line)
        px(c, cx + 3, py - 1, 11, ph + 2, OUT); px(c, cx + 4, py, 9, ph, pc); px(c, cx + 4, py, 9, 1, shade(pc, 30));
        T(c, k$(h.revenue), cx, zero - rh - 15, last ? '#b8483c' : '#8a6a4a', 'center', null, 12);
        if (last) { px(c, cx - 16, bot + 4, 32, 15, C.gold); }
        T(c, '第' + h.day + '天', cx, bot + 5, last ? INK : SUB, 'center', null, 12); });
    }
    y += ch + 6; }
  const locked = SHELF_IDS.filter(id => W.shelves[id].locked && !W.shelves[id].extra).length;
  T(c, locked ? '开货架 ' + money$(SHELF_COST) + '：点盖布的货架（还有 ' + locked + ' 张）' : '货架全开了', 16, y, SUB, 'left', null);
  { const G_ = goalNow(), y0 = BAR_Y - 66;   // the milestone now: name, progress, tap for the whole list
    card(c, 14, y0, 332, 28, '#fff3d6'); px(c, 22, y0 + 6, 2, 14, '#6b4a35'); px(c, 24, y0 + 6, 8, 6, '#d0453a');
    if (G_) { const [a, b] = G_[2](), f = Math.max(0, Math.min(1, a / b)); T(c, '目标：' + G_[0], 38, y0 + 6, INK, 'left', null); px(c, 196, y0 + 11, 90, 6, '#e3d6bc'); px(c, 196, y0 + 11, R(90 * f), 6, C.gold); }
    else T(c, '目标全部达成！', 38, y0 + 6, '#2f6e56', 'left', null);
    T(c, (W.goal || 0) + '/' + GOALS.length + ' ›', 338, y0 + 6, '#b8483c', 'right', null); button(14, y0, 332, 28, () => { PANEL = { kind: 'goals', bar: 4, from: 'book' }; SFX.tap(); }); }
  btn(c, 14, BAR_Y - 34, 116, 28, '餐单 ' + PIDS.filter(p => !PRODUCTS[p].lab && unlocked(p)).length + '/' + PIDS.filter(p => !PRODUCTS[p].lab).length, () => { PANEL = { kind: 'menu', bar: 4, from: 'book' }; SFX.tap(); }, 'cream');   // the full menu
  btn(c, 136, BAR_Y - 34, 104, 28, '客人 ' + CUST_POOL.filter(guestOpen).length + '/' + CUST_POOL.length, () => { PANEL = { kind: 'guests', bar: 4, from: 'book' }; SFX.tap(); }, 'cream');   // the customer list
  btn(c, 246, BAR_Y - 34, 100, 28, '成就 ' + ACH.filter(a => W.ach[a.id]).length + '/' + ACH.length, () => { PANEL = { kind: 'ach', bar: 4, from: 'book' }; SFX.tap(); }, 'cream');
}
function drawPause(c) {
  c.save(); c.globalAlpha = .55; px(c, 0, 0, 360, 640, '#1c141c'); c.restore(); button(0, 0, 360, 640, () => {});
  card(c, 70, 200, 220, 250, PAPER); TS(c, '暂停', 180, 214, 20, INK, 'center');
  btn(c, 100, 400, 160, 34, LANG === 'yue' ? '語言：粵語（繁）' : '语言：普通话', () => setLang(LANG === 'yue' ? 'cmn' : 'yue'), 'cream');
  btn(c, 100, 254, 160, 34, '继续', () => { PANEL = null; });
  btn(c, 100, 298, 160, 34, MUTED ? '声音：关' : '声音：开', () => setMuted(!MUTED), 'cream');
  btn(c, 100, 352, 160, 34, CONFIRM ? '真的从头开始？' : '从头开始', () => { if (CONFIRM) { CONFIRM = 0; PANEL = null; startGame(true); } else CONFIRM = 1; }, CONFIRM ? 'red' : 'cream');
}
function drawLedger(c) {   // end of the day: money in two columns (with ▲▼ against yesterday), people, what sold, tomorrow's tip
  const L = LEDGER; if (!L) return;
  c.save(); c.globalAlpha = .55; px(c, 0, 0, 360, 640, '#1c141c'); c.restore(); button(0, 0, 360, 640, () => {});
  const end = L.season, prev = W.history.length > 1 ? W.history[W.history.length - 2] : null, sold = PIDS.filter(p => L.sold[p]).sort((a, b) => L.sold[b] - L.sold[a]);
  const soldRows = Math.ceil(sold.length / 3), H = 34 + 8 + 50 + 32 + 36 + 16 + soldRows * 20 + 50 + 22 + (L.month ? 50 : 0) + (end ? 44 : 0) + 46;
  const y0 = Math.max(44, Math.min(94, 588 - H)); card(c, 20, y0, 320, H, '#fbf3e0');
  px(c, 20, y0, 320, 34, '#b8483c'); TS(c, '第 ' + L.day + ' 天 · 打烊', 32, y0 + 7, 18, '#fff4dc', 'left'); T(c, (L.wx || '') + (L.dirt !== undefined ? ' · 清洁' + (100 - L.dirt) + '%' : ''), 330, y0 + 11, '#ffe0c0', 'right', null);
  let y = y0 + 42;
  const vs = (now, was) => was === undefined || was === null ? '' : now > was ? ' ▲' : now < was ? ' ▼' : '';
  const cell = (i, a, b, col = INK) => { const x = 32 + (i % 2) * 152, yy = y + Math.floor(i / 2) * 16; T(c, a, x, yy, SUB, 'left', null); T(c, b, x + 142, yy, col, 'right', null); };
  cell(0, '收入', money$(L.revenue) + vs(L.revenue, prev && prev.revenue), '#2f6e56'); cell(1, '茶位 + 小费', money$((L.seat || 0) + (L.tips || 0)), '#2f6e56');
  cell(2, '原料', '-' + money$(L.packCost), '#b8342c'); cell(3, '促销', L.promoCost ? '-' + money$(L.promoCost) : '$0', L.promoCost ? '#b8342c' : SUB);
  cell(4, '租金 + 工钱', '-' + money$(L.daily), '#b8342c'); cell(5, '损耗 ' + ((L.wasteN || 0) + (L.staleN || 0)) + ' 个', (L.waste || L.stale) ? '-' + money$((L.waste || 0) + (L.stale || 0)) : '$0', (L.waste || L.stale) ? '#b8342c' : SUB);
  y += 50; px(c, 32, y - 2, 296, 1, '#d9c49a');
  T(c, '今天净赚', 32, y + 6, INK, 'left', null); TS(c, money$(L.profit) + vs(L.profit, prev && prev.profit), 328, y + 2, 18, L.profit >= 0 ? '#2f6e56' : '#b8342c', 'right'); y += 32;
  cell(0, '客人', L.served + vs(L.served, prev && prev.served) + '（座' + L.dine + ' 外' + L.take + '）'); cell(1, '走掉', String(L.lost || 0), L.lost ? '#b8342c' : INK);
  cell(2, '★ / 名气', L.avg.toFixed(1) + ' / ' + L.rep.toFixed(1), '#c99428'); cell(3, '套餐 / 加购', (L.combos || 0) + ' / ' + (L.addon || 0));
  y += 36; T(c, '卖出' + (L.best && L.sold[L.best] ? ' · 最好卖：' + PRODUCTS[L.best].name : ''), 32, y, SUB, 'left', null); y += 16;
  sold.forEach((p, i) => { const x = 30 + (i % 3) * 100, yy = y + Math.floor(i / 3) * 20; half(c, PRODUCTS[p].img, x + 8, yy + 9); T(c, PRODUCTS[p].name + '×' + L.sold[p], x + 18, yy + 2, INK, 'left', null); });
  y += soldRows * 20 + 4;
  card(c, 32, y, 296, 42, '#fffaf0'); T(c, '明天：', 40, y + 5, '#b8483c', 'left', null); T(c, L.tip, 40, y + 23, INK, 'left', null); y += 50;
  T(c, (L.upCost ? '买升级 -' + money$(L.upCost) + ' · ' : '') + (L.pts ? '积分 +' + L.pts + ' · ' : '') + '现金 ' + money$(W.money), 180, y, W.money >= 0 ? INK : '#b8342c', 'center', null); y += 22;
  if (L.month) { card(c, 32, y, 296, 44, '#fff3d6'); TS(c, L.month.m + '月盘点', 40, y + 4, 15, '#b8483c'); T(c, '收入 ' + money$(L.month.revenue) + ' · 净赚 ' + money$(L.month.profit) + ' · 客 ' + L.month.served, 40, y + 25, INK, 'left', null); y += 50; }
  if (end) { TS(c, end + '过完啦，辛苦！', 180, y, 16, '#b8483c', 'center'); y += 22; T(c, '开张以来共收 ' + money$(W.total.revenue) + ' · 招呼 ' + W.total.served + ' 位', 180, y, INK, 'center', null); y += 20; btn(c, 80, y + 2, 200, 34, '继续经营', () => nextDay()); }
  else btn(c, 80, y + 4, 200, 34, '明天继续', () => nextDay());
}
let TITLE_NEW = false;
function drawTitle(c) {
  c.save(); c.globalAlpha = .62; px(c, 0, 0, 360, 640, '#1c141c'); c.restore();
  card(c, 40, 150, 280, 120, '#5a3524');
  px(c, 40, 150, 280, 4, '#7a4a32');
  TS(c, '街记冰室', 180, 168, 44, C.gold, 'center'); T(c, 'L a b', 180, 228, '#fbe9c0', 'center', null);
  T(c, '摆点心 · 看街坊 · 慢慢做大', 180, 290, '#fbe9c0', 'center');
  const saved = hasSave() && !TITLE_NEW;
  if (saved && !TITLE_NEW) { btn(c, 90, 330, 180, 40, '继续开店', () => { audioUnlock(); startGame(false); }); btn(c, 90, 382, 180, 34, '从头开张', () => { TITLE_NEW = true; SFX.tap(); }, 'cream'); }
  else { T(c, '谁来开店？', 180, 324, '#fbe9c0', 'center'); c.drawImage(STAFF_HD.hero_f.SE[0], 96, 346, 30, 61); c.drawImage(STAFF_HD.hero_m.SE[0], 234, 346, 30, 61);
    btn(c, 70, 414, 100, 36, '女店主', () => { audioUnlock(); startGame(true, 'f'); }); btn(c, 190, 414, 100, 36, '男店主', () => { audioUnlock(); startGame(true, 'm'); }); }
  T(c, 'v1.0 春 · 十二天', 180, 600, '#bba890', 'center', null);
  btn(c, 228, 560, 118, 26, LANG === 'yue' ? '粵語 → 普通话' : '普通话 → 粵語', () => setLang(LANG === 'yue' ? 'cmn' : 'yue'), 'cream');   // language
}
function drawPanels(c) {
  if (DESK) { drawDesk(c); if (DIALOG) drawDialog(c); return; }
  if (DIALOG && PHASE !== 'title') { drawDialog(c); return; }
  if (PHASE === 'title') { drawTitle(c); return; }
  if (PHASE === 'ledger') { drawLedger(c); drawDeskButton(c); return; }
  if (!PANEL) { CONFIRM = 0; return; }
  if (PANEL.kind === 'pause') return drawPause(c);
  if (PANEL.kind === 'shelf') drawShelfPanel(c, PANEL);
  else if (PANEL.kind === 'stock') drawStockPanel(c);
  else if (PANEL.kind === 'shop') drawShopPanel(c);
  else if (PANEL.kind === 'staff') drawStaffPanel(c);
  else if (PANEL.kind === 'decor') drawDecorPanel(c, PANEL);
  else if (PANEL.kind === 'ach') drawAchPanel(c);
  else if (PANEL.kind === 'perk') drawPerkPanel(c, PANEL);
  else if (PANEL.kind === 'sup') drawSupPanel(c);
  else if (PANEL.kind === 'placeask') drawPlaceAsk(c, PANEL);
  else if (PANEL.kind === 'showcase') drawShowcasePick(c, PANEL);
  else if (PANEL.kind === 'lab') drawLabPanel(c, PANEL);
  else if (PANEL.kind === 'guests') drawGuestsPanel(c);
  else if (PANEL.kind === 'guest') drawGuestPanel(c, PANEL);
  else if (PANEL.kind === 'special') drawSpecialPanel(c);
  else if (PANEL.kind === 'menu') drawMenuPanel(c);
  else if (PANEL.kind === 'goals') drawGoalsPanel(c);
  else if (PANEL.kind === 'book') drawBookPanel(c);
  else if (PANEL.kind === 'plan') drawPlanPanel(c);
}
const simPaused = () => PHASE === 'title' || PHASE === 'ledger' || MODE === 'edit' || !!PANEL || !!DIALOG || !!DESK;
