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
function T2(c, s, x, y, size, col = '#3a2a2e', align = 'left') { c.font = fp(size); c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillStyle = col; c.fillText(s, x, y + glyphTop(c)); }
function TS(c, s, x, y, size, col = '#3a2a2e', align = 'left') { c.font = sr(size); c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillStyle = col; c.fillText(s, x, y + glyphTop(c)); }   // same glyph-top rule as T

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
    { const G_ = W.today.group; if (G_ && G_.state === 'new' && batchesOf(G_.p) * BATCH + W.stock[G_.p] < G_.n) return { text: '团体订单' + PRODUCTS[G_.p].name + '×' + G_.n + '：材料不够', btn: 1, open: true }; }
    const o = outOf(); if (o) return { text: '缺' + INGR[missingIngr(o)].name + '，' + PRODUCTS[o].name + '做不了', btn: 1, open: true };
    const h = hireable(); if (h) return { text: HIRE[h].name + '来应征 · 去员工', btn: 3, open: true };
    const up = regulars().find(k => lvOf(k) < LV_MAX && (W.pts || 0) >= LV_COST[lvOf(k) + 1]);
    if (up) return { text: '积分够了，' + ({ kun: '坤伯', lin: '莲姨' }[up] || HIRE[up].name) + '可以升级', btn: 3, open: true };
    const n = newItem(); if (n) return { text: '新品' + PRODUCTS[n].name + '，摆上去试试', btn: 0, open: true };
    if (W.day >= 2 && W.seen.planDay !== W.day) return { text: '今天主打什么？去员工安排', btn: 3, open: true };
    const e = emptyLayer(); if (e && W.tut >= 4) return { text: '还有空层可以摆', shelf: e, open: true };
    return { text: W.tut === 3 ? '坤伯会自己烤，准备好就' : '九点自动开门，也可以提前开', open: true };
  }
  { const G_ = W.today.group; if (G_ && G_.state === 'open') return { text: '团体订单 ' + PRODUCTS[G_.p].name + ' ' + Math.min(G_.n, W.stock[G_.p]) + '/' + G_.n + ' · 四点前' }; }
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
  c.save(); c.globalAlpha = .78; px(c, 0, 35, 290, 15, '#2a1d20'); c.restore();
  const parts = [[wxOf().name, '#bfe0ff'], ['客 ' + D.served, '#fff4dc'], [money$(D.revenue), C.gold], ['★' + (st ? st.toFixed(1) : '-'), '#ffd75e'], ['清洁 ' + Math.round(100 - dirtOf()) + '%', dirtOf() > 50 ? '#ff9a8a' : '#c8f0d8'], ['名气 ' + W.rep.toFixed(1), '#f6c0a0']]; if (vipMul() !== 1) parts.splice(1, 0, [vipMul() > 1 ? '贵宾 +15%' : '贵宾 -20%', vipMul() > 1 ? '#ffd75e' : '#ff9a8a']);
  c.font = fp(FS); const wOf = L_ => L_.reduce((a, [t]) => a + c.measureText(t).width, 0); while (parts.length > 4 && wOf(parts) + 4 * (parts.length - 1) > 282) parts.pop();   // it must stay left of the 研发 button: tighten the gaps, then drop the last items
  const gap = Math.min(10, (282 - wOf(parts)) / (parts.length - 1)); let x = 6; for (const [t, col] of parts) { T(c, t, R(x), 36, col, 'left', null); x += c.measureText(t).width + gap; }
}
function drawHUD(c) {
  const t = rtime;
  // top: dark wood sign board
  px(c, 0, 0, 360, 34, '#5a3a28'); for (let y = 5; y < 32; y += 6) for (let x = (y * 37) % 50; x < 360; x += 60) px(c, x, y, 34, 1, '#4e3222');
  px(c, 0, 0, 360, 1, '#7a5238'); px(c, 0, 32, 360, 2, '#3a2418');
  if (isOpenPhase()) px(c, 0, 33, R(360 * Math.min(1, clockOpen / OPEN_LEN)), 1, C.gold);   // how far the day has gone
  if (W && (PHASE === 'prep' || isOpenPhase()) && MODE === 'play') drawInfoStrip(c);
  c.drawImage(COIN_HK, 8, 10); T(c, money$(W ? W.money : 0), 26, 11, W && W.money < 0 ? '#ff9a8a' : '#fff4dc'); px(c, 82, 8, 1, 18, '#3a2418');
  { const p = W ? (W.pts || 0) : 0, can = W && W.staff && regulars().some(k => lvOf(k) < LV_MAX && p >= LV_COST[lvOf(k) + 1]);   // points chip (tap: staff / upgrades)
    px(c, 204, 7, 54, 20, '#3a2418'); px(c, 205, 8, 52, 18, can && Math.sin(t * 3) > -.3 ? '#7a5a20' : '#4e3222');
    T(c, '★', 214, 11, C.gold, 'center', null); { const ps = p >= 10000 ? (p / 1000).toFixed(p >= 100000 ? 0 : 1) + 'k' : String(p); T(c, ps, 222, 11, '#fff4dc', 'left', null); if (ps.length < 4) T(c, '分', 252, 11, '#d9c49a', 'right', null); }   // 4+ digits: no room for 分
    if (W && PHASE !== 'title') button(204, 7, 54, 20, () => clickBar(3)); }
  c.drawImage(ALARM, 88, 7);
  { const tm = clockText().split(':').map(Number), m = tm[0] * 60 + tm[1], cx = 97, cy = 18, ha = (m / 720) * 6.283 - 1.571, ma = (m % 60) / 60 * 6.283 - 1.571;
    for (let k = 1; k <= 3; k++) px(c, R(cx + Math.cos(ha) * k), R(cy + Math.sin(ha) * k), 1, 1, '#3a2a2e'); for (let k = 1; k <= 4; k++) px(c, R(cx + Math.cos(ma) * k), R(cy + Math.sin(ma) * k), 1, 1, '#b8342c'); px(c, cx, cy, 1, 1, '#3a2a2e'); }
  T(c, clockText(), 108, 11);
  // tear-off calendar hanging from the board
  px(c, 155, 1, 48, 32, OUT); px(c, 156, 2, 46, 30, '#fbf3e0'); px(c, 156, 2, 46, 12, '#b8483c'); px(c, 156, 31, 46, 1, '#e3d6bc');   // tear-off calendar, sitting inside the sign board
  const day = W ? (PHASE === 'ledger' && LEDGER ? LEDGER.day : W.day) : 1;
  T(c, monthOf(day) + '月 ' + seasonOf(day).name, 179, 1, '#fff4dc', 'center', null, FS_S);
  TS(c, String(dayInMonth(day)), 179, 14, 16, '#3a2a2e', 'center');
  // pause / sound
  for (const x of [300, 326]) { px(c, x - 1, 7, 22, 20, OUT); px(c, x, 8, 20, 18, '#f3e2bf'); px(c, x, 24, 20, 2, '#d9c49a'); }
  px(c, 306, 12, 3, 10, '#5a3a28'); px(c, 311, 12, 3, 10, '#5a3a28');
  c.fillStyle = '#5a3a28'; c.fillRect(331, 14, 3, 6); c.beginPath(); c.moveTo(334, 14); c.lineTo(339, 10); c.lineTo(339, 24); c.lineTo(334, 20); c.fill();
  if (MUTED) { px(c, 341, 12, 1, 10, '#b8342c'); for (let k = 0; k < 8; k++) px(c, 330 + k, 11 + k, 1, 1, '#b8342c'); }
  { const sp = W ? W.speed || 1 : 1; px(c, 265, 7, 30, 20, OUT); px(c, 266, 8, 28, 18, sp > 1 ? '#ffd75e' : '#f3e2bf'); px(c, 266, 24, 28, 2, sp > 1 ? '#e0a83a' : '#d9c49a'); TC(c, '×' + sp, 280, 16, '#5a3a28');
    button(262, 4, 34, 28, () => { if (!W) return; W.speed = (W.speed || 1) % 3 + 1; SFX.tap(); }); }
  button(296, 4, 28, 28, () => openPanel({ kind: 'pause' })); button(324, 4, 28, 28, () => { setMuted(!MUTED); SFX.tap(); });
  if (PHASE === 'title' || !W) return;
  if (NOTICE) { c.font = fp(FS); const w = Math.max(160, R(c.measureText(NOTICE.text).width) + 24); px(c, R(180 - w / 2) - 1, 51, w + 2, 22, C.gold); px(c, R(180 - w / 2), 52, w, 20, '#fffaf0'); T(c, NOTICE.text, 180, 56, '#3a2a2e', 'center', null); }
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
      TC(c, '开门营业', 300, 559 - pulse, '#5a2a1a', 15, true); button(250, 544, 100, 32, () => { openShop(); });
      if (W.tut === 3) c.drawImage(HAND, 318, 566 + R(Math.abs(Math.sin(t * 4)) * -3));
    } else if (H.act) T(c, H.act, 340, 554, H.warn ? '#b8342c' : '#2f6e56', 'right', null);
    if (H.btn != null) button(10, 548, H.open ? 236 : 338, 26, () => clickBar(H.btn));
  }
  if (MODE === 'play') drawDeskButton(c);
  if (MODE === 'play') drawEpisodeBar(c);
  // bottom bar: dark green strip, five cream tiles
  px(c, 0, BAR_Y, 360, 640 - BAR_Y, '#2f4a3e'); px(c, 0, BAR_Y, 360, 2, '#4f7a64'); px(c, 0, BAR_Y + 2, 360, 1, '#1e3028');
  [0, 1, 3, 6, 4, 5].forEach((i, j) => {   // 研发 (2) is not on the bar (its own button, top right); 6 = 装修 shop
    const x = 5 + j * 59, on = (i === 5 && MODE === 'edit') || (PANEL && PANEL.bar === i), glow = H && H.btn === i && MODE === 'play';
    px(c, x - 1, BAR_Y + 6, 57, 44, glow && Math.sin(t * 3) > -.2 ? C.gold : OUT); px(c, x, BAR_Y + 7, 55, 42, on ? '#ffe08a' : '#f3e2bf'); px(c, x, BAR_Y + 7, 55, 1, '#fff6dc'); px(c, x, BAR_Y + 46, 55, 3, on ? '#e0b84a' : '#d9c49a');
    c.drawImage(ICON[BTN_ICONS[i]], x + 15, BAR_Y + 9);
    TC(c, i === 5 && MODE === 'edit' ? '完成' : BTN_NAMES[i], x + 27.5, BAR_Y + 38, '#5a3f2e');
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
// ---------------------------------------------------------------- first-day tour: the screen dims, one thing at a time is lit,
// a bouncing arrow points at it with a line of text. Tap to go on; 跳过 ends it. Runs once, on a new game, after the opening talk.
// a few features each morning, the most important first (the screen dims, one thing lit, a bouncing arrow and a line of text).
// TOUR_DAYS[day] = steps; 'dirt' runs once the first morning the shop is noticeably dirty. Tap to go on, 跳过 ends that day's set.
const wrect = o => o ? [(o.sx - camX) / K + 4, o.sy / K + 4, o.cv.width / K - 8, o.cv.height / K - 10] : null;
const wbox = (x0, y0, x1, y1, z) => { const pts = [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0], [x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]].map(q => P(...q)), xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); const a = (Math.min(...xs) - camX) / K, b = Math.min(...ys) / K; return [a - 2, b - 2, (Math.max(...xs) - Math.min(...xs)) / K + 4, (Math.max(...ys) - Math.min(...ys)) / K + 4]; };   // a box in the shop -> screen rect
const barRect = j => [5 + j * 59, BAR_Y + 6, 55, 44];   // bottom bar: 0 摆货 1 进货 2 员工 3 装修 4 账本 5 摆放
const TOUR_DAYS = {   // one feature at a time, a line each, spread over the first two weeks (plus a few that wait for their moment)
  1: [{ text: '欢迎来到街记冰室！' },
      { text: '点亮着的货架，摆上点心', cam: [211, 160], rect: () => wrect(SHELF.T4 && SHELF.T4.obj) },
      { text: '摆好就「开门营业」', rect: () => [250, 544, 100, 32] }],
  2: [{ text: '原料不够：「进货」', rect: () => barRect(1) },
      { text: '请人、派岗位：「员工」', rect: () => barRect(2) }],
  3: [{ text: '每天可研发一款新品', rect: () => [296, 40, 58, 24], must: () => canResearch() && researchable().length > 0, go: () => clickBar(2) },
      { text: '收支和升级：「账本」', rect: () => barRect(4) }],
  4: [{ text: '主打、价钱、促销：员工 → 今日安排', rect: () => barRect(2) },
      { text: '派人「招待」，卡座有茶位和小费', cam: [290, 180], rect: () => { const B = BOOTHS[0], g = B.table.grp; return wbox(B.X + g.dx, B.y0 + g.dy, B.X + g.dx + 46, B.y0 + g.dy + 40, 30); } }],
  5: [{ text: '店越靓客越多：「装修」', rect: () => barRect(3) },
      { text: '拖动家具：「摆放」', rect: () => barRect(5) }],
  6: [{ text: '派人站外卖窗，路人也会买', cam: [192, 307], rect: () => wbox(162, 300, 222, 314, 46) },
      { text: '嫌慢？点这里 ×2 ×3', rect: () => [264, 6, 32, 22] }],
  7: [{ text: '账本底下有目标，做完有奖', rect: () => barRect(4) }],
  8: [{ text: '招牌柜：员工 → 今日安排 → 换招牌', cam: [148, 38], rect: () => wbox(96, 30, 200, 46, 50) }],
  9: [{ text: '积分可以给员工升级，升级有故事', rect: () => barRect(2) }],
  10: [{ text: '钱够了：装修 → 扩建，打通隔壁', rect: () => barRect(3) }],
  11: [{ text: '装修 → 整套：一键换搭配，美观加成', rect: () => barRect(3) }],
  12: [{ text: '店铺升级后，进货里找供应商更平', rect: () => barRect(1) }],
  13: [{ text: '天气和季节会改变客人想买的', rect: () => [0, 35, 290, 15] }],
  14: [{ text: '熟客好感满了会送礼、讲故事：账本 → 客人', rect: () => barRect(4) }],
  16: [{ text: '员工 Lv4 后，用积分解锁特技', rect: () => barRect(2) }],
  lab: [{ text: '扩建后开了「港式 Lab」：做一款创意新品', rect: () => [296, 68, 58, 18], must: () => labOpen() && W.labDay !== W.day, go: () => { PANEL = { kind: 'lab', bar: 2 }; W.labGuide = true; SFX.tap(); } }],
  dirt: [{ text: '店脏了客人会少：派人「打扫」', rect: () => [0, 35, 290, 15] }],
  group: [{ text: '团体订单：四点前做齐，多赚三成', rect: () => [8, 544, 240, 32] }],
  student: [{ text: '暑假有学生来打工，可签 6 天', rect: () => barRect(2) }],
};
const tourKey = () => { if (!W) return null; W.toured = W.toured || {}; if ((W.today.tours || 0) >= 2) return null;   // two sets a morning at most
  { const d = Object.keys(TOUR_DAYS).map(Number).filter(n => n && n <= W.day && !W.toured[n]).sort((a, b) => a - b)[0]; if (d) return d; }   // today's tips, or ones from days already past (a save from before they existed) if (!W.toured.lab && labUnlocked()) return 'lab'; if (!W.toured.dirt && dirtOf() > 25) return 'dirt';
  if (!W.toured.group && W.today.group && W.today.group.state === 'new') return 'group'; if (!W.toured.student && HIRE.temp && HIRE.temp.student) return 'student'; return null; };   // the last few wait for their moment
const tourOn = () => W && !W.tourOff && PHASE === 'prep' && MODE === 'play' && !DIALOG && !STORY_Q.length && !PANEL && !DESK && tourKey() !== null;
function drawTour(c) {
  const key = tourKey(), steps = TOUR_DAYS[key], i = Math.min(W.tourStep || 0, steps.length - 1), st = steps[i], t = rtime;
  if (st.cam) { const want = clamp(R(P(st.cam[0], st.cam[1])[0]) - 360, 0, CAM_MAX); camX += (want - camX) * .2; }   // bring a target in the shop into view
  const r = st.rect ? st.rect() : null;
  const done = () => { W.toured[key] = true; W.tourStep = 0; W.today.tours = (W.today.tours || 0) + 1; saveGame(); }, next = () => { SFX.tap(); if (i + 1 >= steps.length) done(); else W.tourStep = i + 1; };
  c.save(); c.globalAlpha = .55; c.fillStyle = '#1c141c';
  if (r) { const [x, y, w, h] = r; c.fillRect(0, 0, 360, y); c.fillRect(0, y + h, 360, 640 - y - h); c.fillRect(0, y, x, h); c.fillRect(x + w, y, 360 - x - w, h); } else c.fillRect(0, 0, 360, 640);
  c.restore();
  const txt = L(st.text), cut = txt.length > 22 ? Math.max(txt.lastIndexOf('：', 22), txt.lastIndexOf('，', 22)) + 1 || 22 : 0, lines = cut ? [txt.slice(0, cut), txt.slice(cut)] : [txt];   // up to two lines
  const act = st.go && r && (!st.must || st.must()), cardH = 44 + lines.length * 16 + (act ? 0 : 30);   // the skip buttons sit inside the card
  button(0, 0, 360, 640, act ? () => SFX.deny() : next); if (act) button(r[0] - 2, r[1] - 2, r[2] + 4, r[3] + 4, () => { if (i + 1 >= steps.length) done(); else W.tourStep = i + 1; st.go(); });
  let cy = 280;
  if (r) {
    const [x, y, w, h] = r, glow = Math.sin(t * 4) > -.3 ? C.gold : '#fff4dc';
    px(c, x - 2, y - 2, w + 4, 2, glow); px(c, x - 2, y + h, w + 4, 2, glow); px(c, x - 2, y, 2, h, glow); px(c, x + w, y, 2, h, glow);
    const ax = R(x + w / 2), down = y > 320, bounce = R(Math.abs(Math.sin(t * 4)) * 6);   // the arrow: above the target pointing down, or below pointing up
    if (down) { const ty = y - 8 - bounce; px(c, ax - 4, ty - 26, 8, 16, OUT); px(c, ax - 3, ty - 25, 6, 15, C.gold); for (let k = 0; k < 9; k++) { px(c, ax - 9 + k, ty - 11 + k, 18 - 2 * k, 1, k ? C.gold : OUT); px(c, ax - 10 + k, ty - 11 + k, 1, 1, OUT); px(c, ax + 9 - k, ty - 11 + k, 1, 1, OUT); } cy = ty - 30 - cardH; }
    else { const ty = y + h + 8 + bounce; for (let k = 0; k < 9; k++) { px(c, ax - k, ty + k, 2 * k, 1, C.gold); px(c, ax - k - 1, ty + k, 1, 1, OUT); px(c, ax + k, ty + k, 1, 1, OUT); } px(c, ax - 4, ty + 9, 8, 16, OUT); px(c, ax - 3, ty + 9, 6, 15, C.gold); cy = ty + 34; }
  }
  cy = clamp(cy, 40, 538 - cardH);   // never over the hint bar or the menu
  card(c, 20, cy, 320, cardH, PAPER); lines.forEach((l, k) => T(c, l, 180, cy + 10 + k * 16, INK, 'center', null));
  T(c, (isNaN(key) ? '提示' : '第 ' + key + ' 天') + ' · ' + (i + 1) + '/' + steps.length + (act ? ' · 点亮着的按钮' : ' · 点任意地方继续'), 180, cy + 18 + lines.length * 16, SUB, 'center', null, FS_S);
  if (act) return;   // must-do: no skipping
  const by = cy + cardH - 30;
  btn(c, 192, by, 64, 24, '跳过', () => { SFX.tap(); done(); }, 'cream');
  btn(c, 262, by, 72, 24, '不再提示', () => { SFX.tap(); W.tourOff = true; saveGame(); }, 'cream');
}
function drawEpisodeBar(c) {   // 小剧场 invitation at the top: 看 to watch (the shop pauses while reading), or let it pass
  const B = EP_BANNER; if (!B || PANEL || DIALOG || DESK) return;
  const y = 54, pulse = Math.sin(rtime * 4) > -.2;
  px(c, 8, y - 1, 280, 30, pulse ? C.gold : OUT); px(c, 9, y, 278, 28, '#fff3d6');
  T(c, B.ep.arc ? '小剧场 · ' + B.ep.arc : '小剧场 · 店里好像有事发生', 18, y + 8, '#b8483c', 'left', null);
  btn(c, 200, y + 4, 44, 20, '看', () => { SFX.tap(); playEpisode(B.ep); }, 'gold'); btn(c, 248, y + 4, 34, 20, '×', () => { EP_BANNER = null; SFX.tap(); }, 'cream');
}
function drawDeskButton(c) {
  if (!W || PHASE === 'title' || DIALOG) return;   // hidden under a scene (the 跳过 button sits there)
  const on = canResearch(), n = on ? researchable().length : 0, x = 296, y = 40, t = gtime;
  px(c, x - 1, y - 1, 60, 26, on && n && Math.sin(t * 3) > -.3 ? C.gold : OUT); px(c, x, y, 58, 24, on ? '#ffe08a' : '#8a8078'); px(c, x, y + 21, 58, 3, on ? '#e0b84a' : '#6e665e');
  c.drawImage(ICON.desk, 0, 0, ICON.desk.width, ICON.desk.height, x + 3, y + 3, 18, 14); if (!on) { c.save(); c.globalAlpha = .55; px(c, x + 3, y + 3, 18, 14, '#8a8078'); c.restore(); }
  TC(c, '研发', x + 39, y + 10.5, on ? '#5a3f2e' : '#d8d0c4');
  if (on && n) { px(c, x + 51, y - 3, 8, 8, '#e5412f'); px(c, x + 52, y - 2, 2, 2, '#ff9a8a'); }
  button(x - 2, y - 2, 62, 28, () => clickBar(2));
  if (labUnlocked()) { const ly = y + 28, on2 = labOpen(), fresh = on2 && W.labDay !== W.day;   // 港式 Lab, under 研发
    px(c, x - 1, ly - 1, 60, 20, fresh && Math.sin(t * 3) > -.3 ? C.gold : OUT); px(c, x, ly, 58, 18, on2 ? '#d8f0e0' : '#8a8078'); TC(c, '港式 Lab', x + 29, ly + 9, on2 ? '#2f6e56' : '#d8d0c4');
    button(x - 2, ly - 2, 62, 22, () => { if (labOpen()) { PANEL = { kind: 'lab', bar: 2 }; SFX.tap(); } else { SFX.deny(); NOTICE = { text: '收工后或开门前才能进 Lab', t: 0 }; } }); }
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
