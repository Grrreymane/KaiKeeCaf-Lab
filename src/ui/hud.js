// ==== hud: top sign board (money, alarm clock, tear-off calendar, pause / sound), receipt hint, bottom bar
const BAR_Y = 588, BTNS = [];
function button(x, y, w, h, fn, id) { BTNS.push({ x, y, w, h, fn, id }); }
const ICON = {
  decor: paint(26, 20, G => { G.rect(4, 2, 16, 7, '#e9806a'); G.rect(4, 2, 16, 2, '#f6a890'); G.rect(20, 4, 2, 3, '#8a8f93'); G.rect(21, 6, 2, 6, '#8a8f93'); G.rect(12, 11, 11, 2, '#8a8f93'); G.rect(11, 11, 3, 8, '#7a4a2e'); G.rect(5, 9, 3, 3, '#e9806a'); }),   // paint roller
  desk: paint(26, 20, G => { G.rect(3, 4, 16, 14, '#fff4dc'); G.rect(3, 4, 16, 3, '#b8483c'); for (let y = 9; y < 16; y += 3) G.rect(5, y, 11, 1, '#c9b9a0'); G.ell(19, 13, 5, 4, '#ffd21f'); G.ell(19, 12, 3.4, 2.2, '#fff6b8'); G.rect(21, 2, 2, 10, '#8a512a'); G.rect(21, 2, 2, 2, '#e5412f'); }),
  move: paint(26, 20, G => { G.rect(6, 9, 14, 3, '#f7f2ea'); G.rect(8, 12, 10, 5, '#c07a3e'); G.rect(12, 1, 2, 5, '#3f8f74'); G.tri(9, 4, 17, 4, 13, 0, '#3f8f74'); G.rect(1, 9, 4, 2, '#3f8f74'); G.tri(3, 6, 3, 14, 0, 10, '#3f8f74'); G.rect(21, 9, 4, 2, '#3f8f74'); G.tri(23, 6, 23, 14, 26, 10, '#3f8f74'); }),
  shelf: paint(26, 20, G => { G.rect(2, 9, 22, 3, '#f7f2ea'); G.rect(5, 12, 16, 5, '#c07a3e'); G.rect(5, 3, 16, 2, '#f7f2ea'); G.rect(7, 5, 1, 4, '#f2c64c'); G.rect(18, 5, 1, 4, '#f2c64c'); [[5, 7], [10, 7], [15, 7], [20, 7]].forEach(([x, y]) => G.ell(x, y, 2.4, 1.6, '#ffd21f')); [[9, 1.5], [16, 1.5]].forEach(([x, y]) => G.ell(x, y, 2.4, 1.4, '#e0901f')); }),
  basket: paint(26, 20, G => { G.rect(6, 3, 2, 6, '#8a512a'); G.rect(18, 3, 2, 6, '#8a512a'); G.rect(6, 2, 14, 2, '#8a512a'); G.rect(2, 8, 22, 4, '#e0a466'); G.rect(4, 12, 18, 6, '#c07a3e'); for (let x = 6; x < 22; x += 4) G.rect(x, 12, 1, 6, '#e0a466'); G.ell(9, 7, 2.4, 2, '#e5412f'); G.ell(15, 6, 2.6, 2.2, '#ffd21f'); }),
  staff: paint(26, 20, G => { G.ell(13, 6, 5, 5, '#f6c9a2'); G.ell(13, 4, 5.4, 3.6, (x, y) => y < 5 ? '#4a3040' : null); G.rect(6, 11, 14, 8, '#e76f8f'); G.rect(9, 12, 8, 7, '#3f8f74'); }),
  book: paint(26, 20, G => { G.rect(2, 3, 10, 14, '#d93a2f'); G.rect(14, 3, 10, 14, '#d93a2f'); G.rect(3, 4, 8, 12, '#fff4dc'); G.rect(15, 4, 8, 12, '#fff4dc'); for (let y = 6; y < 15; y += 3) { G.rect(4, y, 6, 1, '#c9b9a0'); G.rect(16, y, 6, 1, '#c9b9a0'); } G.rect(12, 3, 2, 14, '#962f2a'); }),
};
const COIN_HK = paint(14, 14, G => { G.ell(7, 7, 6.5, 6.5, '#b97e30'); G.ell(7, 7, 5.2, 5.2, '#e0aa52'); G.ell(7, 7, 3.6, 3.6, (x, y) => ((x + .5 - 7) ** 2 + (y + .5 - 7) ** 2 > 9) ? '#c98f3e' : '#e9b860'); G.set(5, 5, '#fff0b8'); G.set(6, 4, '#fff0b8'); }, false);
const ALARM = paint(19, 20, G => {   // red twin-bell alarm clock
  G.ell(4, 3.5, 3, 2.6, '#d9534a'); G.ell(15, 3.5, 3, 2.6, '#d9534a'); G.rect(8, 1, 3, 2, '#c9cdd0');
  G.ell(9.5, 11, 8, 8, '#d9534a'); G.ell(9.5, 11, 6.2, 6.2, '#fbf3e0'); G.rect(3, 18, 2, 2, '#8a2a24'); G.rect(14, 18, 2, 2, '#8a2a24');
  for (const [x, y] of [[9, 5], [9, 16], [4, 11], [14, 11]]) G.set(x, y, '#8a7a68');
}, false);
const BTN_NAMES = ['摆货', '进货', '研发', '员工', '账本', '摆放', '装修'], BTN_ICONS = ['shelf', 'basket', 'desk', 'staff', 'book', 'move', 'decor'];
const money$ = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
function T2(c, s, x, y, size, col = '#3a2a2e', align = 'left') { c.font = fp(size); c.textAlign = align; c.textBaseline = 'top'; c.fillStyle = col; c.fillText(s, x, y); }
function TS(c, s, x, y, size, col = '#3a2a2e', align = 'left') { c.font = sr(size); c.textAlign = align; c.textBaseline = 'top'; c.fillStyle = col; c.fillText(s, x, y); }

// ---------------------------------------------------------------- hint: one thing at a time, says "what + where"
let HINT = null;
function emptyLayer() { for (const id of SHELF_IDS) { const st = W.shelves[id]; if (!st.locked && !st.fridge && reachable(id) && st.layers.some(L => !L.p)) return id; } return null; }
function outOf() {   // an offered product that has nothing left anywhere and no ingredients
  const making = p => [JOB.kun, JOB.lin, JOB.bar, JOB.bar2].some(j => j && j.p === p);
  for (const p of PIDS) if (shelfCap(p) && W.plan[p] !== 'off' && batchesOf(p) <= 0 && W.stock[p] <= 0 && shelfHave(p) <= 0 && !making(p)) return p;
  return null;
}
function lowOn() { for (const p of PIDS) if (shelfCap(p) && W.plan[p] !== 'off' && batchesOf(p) <= 1) return p; return null; }
const hireable = () => Object.keys(HIRE).find(k => !HIRE[k].temp && !W.staff[k].hired && W.day >= HIRE[k].day);
const regulars = () => ['kun', 'lin', ...Object.keys(HIRE).filter(k => !HIRE[k].temp && W.staff[k].hired)];
const newItem = () => PIDS.find(p => PRODUCTS[p].day > 1 && unlocked(p) && !offered(p) && !(W.seen['new_' + p]));
function computeHint() {
  if (PHASE === 'title' || PHASE === 'ledger' || MODE === 'edit') return null;
  if (W.tut === 0) return { text: '点亮着的货架，摆上点心', shelf: 'T4', hand: true, tag: 'tut' };
  if (W.tut <= 2) return { text: W.tut === 1 ? '选一样点心摆上去' : '下层也摆上', shelf: 'T4', tag: 'tut' };
  if (PHASE === 'prep') {   // the open button is always there in the morning; the text says what is still worth doing
    const o = outOf(); if (o) return { text: '缺' + INGR[missingIngr(o)].name + '，' + PRODUCTS[o].name + '做不了', btn: 1, open: true };
    const h = hireable(); if (h) return { text: HIRE[h].name + '来应征 · 去员工', btn: 3, open: true };
    const up = regulars().find(k => lvOf(k) < LV_MAX && (W.pts || 0) >= LV_COST[lvOf(k) + 1]);
    if (up) return { text: '积分够了，' + ({ kun: '坤伯', lin: '莲姨' }[up] || HIRE[up].name) + '可以升级', btn: 3, open: true };
    const n = newItem(); if (n) return { text: '新品' + PRODUCTS[n].name + '，摆上去试试', btn: 0, open: true };
    if (W.day >= 2 && W.seen.planDay !== W.day) return { text: '今天主打什么？去员工安排', btn: 3, open: true };
    const e = emptyLayer(); if (e && W.tut >= 4) return { text: '还有空层可以摆', shelf: e, open: true };
    return { text: W.tut === 3 ? '坤伯会自己烤，准备好就' : '准备好就开门营业', open: true };
  }
  if (dirtOf() > 50) return { text: '店里好污糟 · 客人少咗', act: postsOf('clean').length ? '加多个人打扫 →' : '派人打扫 →', btn: 3, warn: true };
  if (queueLen() >= 4) return { text: '排队好长 · 收银忙不过来', act: !W.up.till && W.money >= UPGRADES.till.lv[0][1] ? '账本换收银机 →' : '', btn: !W.up.till && W.money >= UPGRADES.till.lv[0][1] ? 4 : null, warn: true };
  if (DINERS.some(d => (d.state === 'wait' && d.t > 10) || (d.state === 'order' && d.t > 20))) return { text: '卡座客人等好耐', act: '主打出餐快的 →', btn: 3, warn: true };
  const o = outOf(); if (o) return { text: PRODUCTS[o].name + '卖完了 · 缺' + INGR[missingIngr(o)].name, act: '去进货 →', btn: 1, warn: true };
  const l = lowOn(); if (l) return { text: (INGR[missingIngr(l)] || INGR[RECIPE[l].reduce((a, k) => W.ing[k] < W.ing[a] ? k : a)]).name + '快用完', act: '去进货 →', btn: 1 };
  if (LAST_GRIPE && LAST_GRIPE.t < 8 && LAST_GRIPE.k.startsWith('none:')) { const p = LAST_GRIPE.k.slice(5); return { text: '客人想要' + PRODUCTS[p].name, act: '摆上货架 ↑', btn: 0 }; }
  const e = emptyLayer(); if (e) return { text: '还有空层 · 点货架摆货', shelf: e };
  if (W.day >= 4 && !takeOpen() && Object.keys(HIRE).some(k => W.staff[k].hired)) return { text: '外卖窗没人管，关着', act: '员工里派人 →', btn: 3 };
  if (PHASE === 'closing') return { text: '打烊啦，送走最后的客人', ok: true };
  return { text: W.rep >= 4 ? '生意好好！街坊都在讲' : '生意不错！', ok: true };
}

function drawInfoStrip(c) {   // one line under the sign: weather, today so far, comfort, reputation
  const D = W.today; if (!D) return; const st = D.stars.length ? D.stars.reduce((a, b) => a + b, 0) / D.stars.length : 0;
  c.save(); c.globalAlpha = .78; px(c, 0, 48, 290, 15, '#2a1d20'); c.restore();
  const parts = [[wxOf().name, '#bfe0ff'], ['客 ' + D.served, '#fff4dc'], [money$(D.revenue), C.gold], ['★' + (st ? st.toFixed(1) : '-'), '#ffd75e'], ['舒适 ' + comfort(), '#9fe0b8'], ['清洁 ' + Math.round(100 - dirtOf()) + '%', dirtOf() > 50 ? '#ff9a8a' : '#c8f0d8'], ['名气 ' + W.rep.toFixed(1), '#f6c0a0']];
  let x = 6; c.font = fp(12); for (const [t, col] of parts) { T(c, t, x, 49, col, 'left', null); x += R(c.measureText(t).width) + 10; }
}
function drawHUD(c) {
  const t = gtime;
  // top: dark wood sign board
  px(c, 0, 0, 360, 34, '#5a3a28'); for (let y = 5; y < 32; y += 6) for (let x = (y * 37) % 50; x < 360; x += 60) px(c, x, y, 34, 1, '#4e3222');
  px(c, 0, 0, 360, 1, '#7a5238'); px(c, 0, 32, 360, 2, '#3a2418');
  if (isOpenPhase()) px(c, 0, 33, R(360 * Math.min(1, clockOpen / OPEN_LEN)), 1, C.gold);   // how far the day has gone
  if (W && (PHASE === 'prep' || isOpenPhase()) && MODE === 'play') drawInfoStrip(c);
  c.drawImage(COIN_HK, 8, 10); T(c, money$(W ? W.money : 0), 26, 11, W && W.money < 0 ? '#ff9a8a' : '#fff4dc'); px(c, 82, 8, 1, 18, '#3a2418');
  { const p = W ? (W.pts || 0) : 0, can = W && W.staff && regulars().some(k => lvOf(k) < LV_MAX && p >= LV_COST[lvOf(k) + 1]);   // points chip (tap: staff / upgrades)
    px(c, 204, 7, 54, 20, '#3a2418'); px(c, 205, 8, 52, 18, can && Math.sin(t * 3) > -.3 ? '#7a5a20' : '#4e3222');
    T(c, '★', 214, 11, C.gold, 'center', null); T(c, String(p), 222, 11, '#fff4dc', 'left', null); T(c, '分', 252, 11, '#d9c49a', 'right', null);
    if (W && PHASE !== 'title') button(204, 7, 54, 20, () => clickBar(3)); }
  c.drawImage(ALARM, 88, 7);
  { const tm = clockText().split(':').map(Number), m = tm[0] * 60 + tm[1], cx = 97, cy = 18, ha = (m / 720) * 6.283 - 1.571, ma = (m % 60) / 60 * 6.283 - 1.571;
    for (let k = 1; k <= 3; k++) px(c, R(cx + Math.cos(ha) * k), R(cy + Math.sin(ha) * k), 1, 1, '#3a2a2e'); for (let k = 1; k <= 4; k++) px(c, R(cx + Math.cos(ma) * k), R(cy + Math.sin(ma) * k), 1, 1, '#b8342c'); px(c, cx, cy, 1, 1, '#3a2a2e'); }
  T(c, clockText(), 108, 11);
  // tear-off calendar hanging from the board
  px(c, 159, 3, 42, 41, OUT); px(c, 160, 4, 40, 39, '#fbf3e0'); px(c, 160, 4, 40, 11, '#b8483c'); px(c, 160, 42, 40, 1, '#e3d6bc'); px(c, 161, 44, 38, 2, '#e9dcc0');
  for (const x of [163, 195]) { px(c, x, 0, 2, 6, '#c9c4b8'); px(c, x, 0, 2, 1, '#ffffff'); }
  const day = W ? (PHASE === 'ledger' && LEDGER ? LEDGER.day : W.day) : 1;
  T(c, monthOf(day) + '月', 180, 5, '#fff4dc', 'center', null); T(c, seasonOf(day).name, 150, 11, C.cream, 'center');
  TS(c, String(dayInMonth(day)), 180, 16, 20, '#3a2a2e', 'center');
  // pause / sound
  for (const x of [300, 326]) { px(c, x - 1, 7, 22, 20, OUT); px(c, x, 8, 20, 18, '#f3e2bf'); px(c, x, 24, 20, 2, '#d9c49a'); }
  px(c, 306, 12, 3, 10, '#5a3a28'); px(c, 311, 12, 3, 10, '#5a3a28');
  c.fillStyle = '#5a3a28'; c.fillRect(331, 14, 3, 6); c.beginPath(); c.moveTo(334, 14); c.lineTo(339, 10); c.lineTo(339, 24); c.lineTo(334, 20); c.fill();
  if (MUTED) { px(c, 341, 12, 1, 10, '#b8342c'); for (let k = 0; k < 8; k++) px(c, 330 + k, 11 + k, 1, 1, '#b8342c'); }
  { const sp = W ? W.speed || 1 : 1; px(c, 265, 7, 30, 20, OUT); px(c, 266, 8, 28, 18, sp > 1 ? '#ffd75e' : '#f3e2bf'); px(c, 266, 24, 28, 2, sp > 1 ? '#e0a83a' : '#d9c49a'); T(c, '×' + sp, 280, 11, '#5a3a28', 'center', null);
    button(262, 4, 34, 28, () => { if (!W) return; W.speed = (W.speed || 1) % 3 + 1; SFX.tap(); }); }
  button(296, 4, 28, 28, () => openPanel({ kind: 'pause' })); button(324, 4, 28, 28, () => { setMuted(!MUTED); SFX.tap(); });
  if (PHASE === 'title' || !W) return;
  if (NOTICE) { c.font = fp(12); const w = Math.max(160, R(c.measureText(NOTICE.text).width) + 24); px(c, R(180 - w / 2) - 1, 51, w + 2, 22, C.gold); px(c, R(180 - w / 2), 52, w, 20, '#fffaf0'); T(c, NOTICE.text, 180, 56, '#3a2a2e', 'center', null); }
  // receipt: the one hint
  HINT = computeHint(); const H = HINT;
  px(c, 12, 552, 338, 26, 'rgba(40,24,20,.25)');
  px(c, 10, 548, 338, 26, '#fbf3e0'); for (let x = 10; x < 348; x += 4) px(c, x, 574, 2, 2, '#fbf3e0');
  for (let x = 14; x < 344; x += 3) px(c, x, 571, 1, 1, '#e3d6bc');
  px(c, 10, 548, 3, 26, H && H.warn ? '#e0603a' : '#e7d9bd'); c.drawImage(ICON.shelf, 16, 550);
  if (MODE === 'edit') { T(c, EDIT.msg || '按住拖动 · 点一下选中可转向', 46, 554, '#5a3f2e', 'left', null); if (EDIT.sel && EDIT.sel.id[0] !== 'B') btn(c, 262, 547, 82, 26, '转 90°', () => rotateGroup(EDIT.sel)); else T(c, '绿=能放 红=挡路', 340, 554, '#2f6e56', 'right', null); }
  else if (H) {
    T(c, H.text, 46, 554, '#5a3f2e', 'left', null);
    if (H.open) {   // big gold "open" button on the receipt
      const pulse = Math.sin(t * 4) > 0 ? 1 : 0;
      px(c, 255, 549 - pulse, 90, 24, OUT); px(c, 256, 550 - pulse, 88, 22, '#ffd75e'); px(c, 256, 568 - pulse, 88, 4, '#e0a83a');
      TS(c, '开门营业', 300, 552 - pulse, 15, '#5a2a1a', 'center'); button(250, 544, 100, 32, () => { openShop(); });
      if (W.tut === 3) c.drawImage(HAND, 318, 566 + R(Math.abs(Math.sin(t * 4)) * -3));
    } else if (H.act) T(c, H.act, 340, 554, H.warn ? '#b8342c' : '#2f6e56', 'right', null);
    if (H.btn != null) button(10, 548, H.open ? 236 : 338, 26, () => clickBar(H.btn));
  }
  if (MODE === 'play') drawDeskButton(c);
  // bottom bar: dark green strip, five cream tiles
  px(c, 0, BAR_Y, 360, 640 - BAR_Y, '#2f4a3e'); px(c, 0, BAR_Y, 360, 2, '#4f7a64'); px(c, 0, BAR_Y + 2, 360, 1, '#1e3028');
  [0, 1, 3, 6, 4, 5].forEach((i, j) => {   // 研发 (2) is not on the bar (its own button, top right); 6 = 装修 shop
    const x = 5 + j * 59, on = (i === 5 && MODE === 'edit') || (PANEL && PANEL.bar === i), glow = H && H.btn === i && MODE === 'play';
    px(c, x - 1, BAR_Y + 6, 57, 44, glow && Math.sin(t * 3) > -.2 ? C.gold : OUT); px(c, x, BAR_Y + 7, 55, 42, on ? '#ffe08a' : '#f3e2bf'); px(c, x, BAR_Y + 7, 55, 1, '#fff6dc'); px(c, x, BAR_Y + 46, 55, 3, on ? '#e0b84a' : '#d9c49a');
    c.drawImage(ICON[BTN_ICONS[i]], x + 15, BAR_Y + 9);
    T(c, i === 5 && MODE === 'edit' ? '完成' : BTN_NAMES[i], x + 27, BAR_Y + 31, '#5a3f2e', 'center', null);
    button(x, BAR_Y + 6, 55, 44, () => clickBar(i));
  });
  // something to the right: the bake room (drag over)
  if (camX > 20 && MODE === 'play' && !PANEL) { const a = .6 + .4 * Math.sin(t * 4); c.save(); c.globalAlpha = a; px(c, 4, 300, 20, 40, '#3a2418'); c.restore(); T(c, '<', 14, 312, C.gold, 'center'); }
  if (camX < CAM_MAX - 20 && MODE === 'play' && !PANEL) {   // the bake room is off to the right: show what Kun is doing at the edge
    const a = .6 + .4 * Math.sin(t * 4), j = JOB.kun;
    c.save(); c.globalAlpha = a; px(c, 336, 300, 20, 40, '#3a2418'); c.restore(); T(c, '>', 346, 312, C.gold, 'center');
    if (j && camX < LM + 200) { px(c, 317, 258, 40, 38, OUT); px(c, 318, 259, 38, 36, '#fffaf0'); half(c, PRODUCTS[j.p].img, 337, 272); px(c, 321, 289, 32, 3, '#e3d6bc'); px(c, 321, 289, R(32 * j.t / j.T), 3, '#3fbf7a'); T(c, '坤伯', 337, 244, '#fff4dc', 'center'); }
    button(316, 240, 44, 104, () => { camX = CAM_MAX; SFX.tap(); });
  }
}
// 研发 button, top right under the board: grey with a lock during the day, gold after closing (on the books screen)
function drawDeskButton(c) {
  if (!W || PHASE === 'title') return;
  const on = canResearch(), n = on ? researchable().length : 0, x = 296, y = 40, t = gtime;
  px(c, x - 1, y - 1, 60, 26, on && n && Math.sin(t * 3) > -.3 ? C.gold : OUT); px(c, x, y, 58, 24, on ? '#ffe08a' : '#8a8078'); px(c, x, y + 21, 58, 3, on ? '#e0b84a' : '#6e665e');
  c.drawImage(ICON.desk, 0, 0, ICON.desk.width, ICON.desk.height, x + 3, y + 3, 18, 14); if (!on) { c.save(); c.globalAlpha = .55; px(c, x + 3, y + 3, 18, 14, '#8a8078'); c.restore(); }
  T(c, '研发', x + 39, y + 5, on ? '#5a3f2e' : '#d8d0c4', 'center', null);
  if (on && n) { px(c, x + 51, y - 3, 8, 8, '#e5412f'); px(c, x + 52, y - 2, 2, 2, '#ff9a8a'); }
  button(x - 2, y - 2, 62, 28, () => clickBar(2));
}
function clickBar(i) {
  SFX.tap();
  if (i === 5) { MODE = MODE === 'edit' ? 'play' : 'edit'; EDIT.msg = ''; EDIT.sel = null; PANEL = null; if (MODE === 'play') { saveFurniture(); } return; }
  if (MODE === 'edit') { MODE = 'play'; saveFurniture(); }
  if (i === 2) { if (!canResearch()) { SFX.deny(); NOTICE = { text: '收工后先可以研发新品', t: 0 }; } else if (W.rdDay === W.day) { SFX.deny(); NOTICE = { text: '今日研发过喇，听日再嚟', t: 0 }; } else openDesk(); return; }
  const kinds = ['stock', 'shop', null, 'staff', 'book', null, 'decor'];
  if (PANEL && PANEL.bar === i) { PANEL = null; return; }
  openPanel({ kind: kinds[i], bar: i });
}
