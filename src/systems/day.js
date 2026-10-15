// ==== day: phases (title -> prep -> open -> closing -> ledger -> prep ...), books, news, month / season ends
let PHASE = 'title', clockOpen = 0, LEDGER = null, NOTICES = [], NOTICE = null;
function startGame(fresh, hero) {
  if (fresh || !loadGame()) { W = newState(); wipeSave(); if (hero) W.hero = hero; playScene('intro'); W.tour = 0; }   // the tour starts once the opening talk is over
  bindShelves(); initSeats(); applyDecor(); applyFurniture(); RINGS.clear(); MODE = 'play'; camX = LM; PANEL = null; startDay(); saveGame();
}
function applyFurniture() {   // saved placement offsets -> objects (relative to where they are now, so nothing stacks)
  for (const g of MOV) { const f = W.furn[g.id] || [0, 0]; if (f[0] !== g.dx || f[1] !== g.dy) moveGroup(g, f[0] - g.dx, f[1] - g.dy); }
  computeStops(); redoShadows();
}
function notice(text) { NOTICES.push(text); }
function checkAch() {   // award any achievement that has just come true (once each)
  if (!W || !W.ach) return;
  for (const a of ACH) if (!W.ach[a.id] && a.test()) {
    W.ach[a.id] = W.day; W.pts = (W.pts || 0) + a.pts; if (a.money) W.money += a.money;
    NOTICES.unshift('成就「' + a.name + '」 +' + a.pts + '分' + (a.money ? ' +$' + a.money : '')); if (!NOTICE || PHASE !== 'open') NOTICE = { text: NOTICES.shift(), t: 0 }; SFX.ding();
  }
}
function startDay() {
  setTemp();
  PHASE = 'prep'; clockOpen = 0; resetRuntime(); W.today = freshDay(); LEDGER = null; NOTICES = []; NOTICE = null;
  if (W.money < 60) { W.money += 200; W.bailout++; notice('家里寄来 $200 周转'); }   // never stuck
  if (W.day > 1 && (W.day - 1) % SEASON_DAYS === 0) notice(seasonOf(W.day).hello || ('新一年开始！第 ' + yearOf(W.day) + ' 年'));   // a new season
  for (const p of PIDS) if (PRODUCTS[p].day === W.day && W.day > 1 && !W.known[p]) notice((PRODUCTS[p].where === 'table' ? '坤伯想试做' : '水吧想试做') + PRODUCTS[p].name + ' → 研发');
  { const L_ = SEASON_WX[seasonIdx(W.day)]; W.today.wx = W.day === 1 ? 'sun' : pick(L_);   // today's weather and the opening forecast
    W.today.fc = forecast(); notice('今日' + wxOf().name + ' · 约 ' + W.today.fc.n + ' 位客 · 好卖' + PRODUCTS[W.today.fc.top[0]].name); }
  morningStory();
  for (const k in HIRE) if (!HIRE[k].temp && HIRE[k].day === W.day && !W.staff[k].hired) notice(HIRE[k].name + '来应征 → 员工里请' + (k === 'wen' || k === 'qing' ? '她' : '他'));
  if (W.day === PARENTS_DAY && !W.seen.parents) notice('今天爸妈说要来探班');
}
function forecast() {   // expected guests over the day (from the arrival rate) + the items people will want most today
  const keep = clockOpen; let n = 0; for (let t = 0; t < OPEN_LEN; t += 2) { clockOpen = t; n += spawnRate() * 2; } clockOpen = keep;
  const top = PIDS.filter(p => unlocked(p) && W.plan[p] !== 'off').sort((a, b) => wantOf(b) - wantOf(a)).slice(0, 2);
  return { n: Math.round(n / 5) * 5, top };
}
function setTier(k, v) { W[k] = v; SFX.tap(); if (W.today) W.today.fc = forecast(); if (PHASE === 'prep') saveGame(); }
function syncStaff() {   // after hiring / changing posts: waiter + takeaway window follow at once
  WAITERS = postsOf('serve').map((k, i) => WAITERS.find(w => w.k === k) || newWaiter(k, i)); WAITER = WAITERS[0] || null;
  TAKEAWAY.open = !!postOf('take');
}
function openShop() { if (PHASE !== 'prep') return; PHASE = 'open'; clockOpen = 0; spawnT = 1.5; takeT = 5; SFX.open(); if (W.tut === 3) W.tut = 4; }
function stepDay(dt) {
  if (PHASE === 'open') {
    clockOpen += dt;
    if ((spawnT -= dt) <= 0) { spawnCustomer(); spawnT = -Math.log(1 - rng() * .999) / spawnRate(); }
    if (takeOpen() && (takeT -= dt) <= 0) { spawnTaker(); takeT = (9 + rng() * 7) / Math.max(1, postsOf('take').length) / (hasPerk('shao_fans') ? 2 : 1); }   // two at the window serve twice as many
    if (W.day === PARENTS_DAY && !W.seen.parents && !W.seen.parentsCame && clockOpen > 40) {   // mum and dad drop by
      W.seen.parentsCame = true; notice('爸妈来探班啦');
      const want = PIDS.filter(unlocked).slice(0, 3);
      spawnCustomer({ ci: 6, wants: want, vip: true }); spawnCustomer({ ci: 7, wants: want.slice().reverse(), vip: false });
    }
    if (clockOpen >= OPEN_LEN) { PHASE = 'closing'; SFX.close(); }
  } else if (PHASE === 'closing') {
    clockOpen += dt;
    if ((!CUST.length && !DINERS.some(d => d.state !== 'out')) || clockOpen > OPEN_LEN + 45) endDay();
  }
  if (!NOTICE && NOTICES.length) NOTICE = { text: NOTICES.shift(), t: 0 };
  if (NOTICE && (NOTICE.t += dt) > 3.2) NOTICE = null;
}
function endDay() {
  const T = W.today;
  for (const c of CUST) { if (!c.paid && Object.keys(c.got).length) finishPay(c); leaveShop(c); }
  for (const d of DINERS) if (d.state === 'eat') { d.t = 999; }
  stepDiners(0); CUST = []; DINERS = [];
  const stars = T.stars.concat(Array(T.lost).fill(2)), avg = stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : 3;
  W.rep = clamp(W.rep * .4 + avg * .6 + (beautyLv() >= 3 ? .1 : 0) + (hasPerk('kun_master') ? .1 : 0) + (hasPerk('yao_steady') ? .05 : 0), 1, 5);
  for (const p of TABLE_ALL) if (W.stock[p] > 1) {   // baked goods left in the kitchen overnight: half of them go stale
    const n = Math.floor(W.stock[p] / 2), loss = Math.max(1, Math.round(n * unitCost(p))); W.stock[p] -= n; T.stale += loss; T.staleN += n; }
  T.dirtEnd = Math.round(dirtOf()); W.dirt = dirtOf() * .4;   // after closing everyone gives the place a quick clean
  const lv0 = shopLv(); W.lastUsed = { ...(T.used || {}) }; W.lastWork = { ...(T.work || {}) };   // yesterday's numbers for the panels
  const daily = wages(); W.money -= daily;
  const profit = T.revenue - T.packCost - daily - (T.promoCost || 0);
  W.total.revenue += T.revenue; W.total.served += T.served; W.total.profit += profit;
  if (shopLv() > lv0) { const nx = Object.values(SUPPLIERS).find(s => s.lv === shopLv()); NOTICES.push('店铺升到 Lv' + shopLv() + '！原料再平 2%' + (nx ? '，' + nx.name + '肯同你签约' : '')); }
  let top = null; for (const k in T.gripes) if (!top || T.gripes[k] > T.gripes[top]) top = k;
  let best = null; for (const p of PIDS) if (!best || T.sold[p] > T.sold[best]) best = p;
  LEDGER = { day: W.day, revenue: T.revenue, packCost: T.packCost, daily, profit, sold: { ...T.sold }, served: T.served, lost: T.lost, dine: T.dine, take: T.take, waste: T.waste || 0, wasteN: T.wasteN || 0, stale: T.stale || 0, staleN: T.staleN || 0, quick: T.quick || 0, wx: wxOf().name, dirt: T.dirtEnd, promoCost: T.promoCost || 0, promo: T.promo, addon: T.addon || 0, seat: T.seat || 0, tips: T.tips || 0, combos: T.combos, avg, rep: W.rep, tip: adviceFor(top), upCost: T.upCost, best };
  W.history.push({ day: W.day, revenue: T.revenue, profit, served: T.served, avg, sold: { ...T.sold } });
  if (W.day % MONTH_DAYS === 0) {   // month end: the month at a glance
    const H = W.history.filter(h => monthOf(h.day) === monthOf(W.day)), sold = {};
    for (const h of H) for (const p in h.sold || {}) sold[p] = (sold[p] || 0) + h.sold[p];
    let top2 = null; for (const p in sold) if (!top2 || sold[p] > sold[top2]) top2 = p;
    LEDGER.month = { m: monthOf(W.day), revenue: H.reduce((a, h) => a + h.revenue, 0), profit: H.reduce((a, h) => a + h.profit, 0), served: H.reduce((a, h) => a + h.served, 0), top: top2 };
  }
  if (W.day % SEASON_DAYS === 0) LEDGER.season = seasonOf(W.day).full;   // the last day of a season
  { const S = W.stats; S.days = (S.days || 0) + 1; S.sold = S.sold || {}; for (const p of PIDS) S.sold[p] = (S.sold[p] || 0) + (T.sold[p] || 0);   // lifetime stats for achievements
    S.bestServed = Math.max(S.bestServed || 0, T.served); S.bestProfit = Math.max(S.bestProfit || 0, profit); if (T.served >= 10) S.bestAvg = Math.max(S.bestAvg || 0, avg);
    S.tips = (S.tips || 0) + (T.tips || 0); S.bestKinds = Math.max(S.bestKinds || 0, PIDS.filter(p => T.sold[p]).length); }
  checkAch();
  W.pts = (W.pts || 0) + 10; LEDGER.pts = 10 + (T.pts || 0);   // points: +1 per sale during the day (earn) + 10 for the day's work
  PHASE = 'ledger'; PANEL = null; SFX.close();
  W.day++; W.today = freshDay(); saveGame();   // saved as "start of tomorrow": reloading lands in tomorrow's prep
}
function adviceFor(k) {
  if (!k) return '今天顺顺利利，继续保持！';
  if (k === 'long' || k === 'slow') return W.up.till ? '排队还是长：多摆货，客人拿完就走' : '收银排长队：账本里换新收银机';
  if (k === 'serve') return '卡座等太久：招待忙不过来，少点种类或加快出餐';
  if (k === 'pricey') return '有客人嫌贵买唔起：摆多啲平价货（蛋挞、鸡蛋仔），或者用「亲民」价钱';
  if (k === 'dirty') return '客人嫌店污糟：员工里派人「打扫」，或者买垃圾桶、地毯';
  const [kind, p] = k.split(':'), n = PRODUCTS[p] ? PRODUCTS[p].name : '';
  if (kind === 'none') return '有客人想要' + n + '：摆上货架就有人买';
  if (kind === 'out') return n + '常卖完：早点进货，或者设成主打';
  return '';
}
function nextDay() { startDay(); saveGame(); }
const isOpenPhase = () => PHASE === 'open' || PHASE === 'closing';
function clockText() {
  if (PHASE === 'prep' || PHASE === 'title') return '06:30';
  const m = 7 * 60 + Math.min(1, clockOpen / OPEN_LEN) * 12 * 60, h = Math.floor(m / 60), mm = Math.floor((m % 60) / 10) * 10;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

// ---------------------------------------------------------------- player actions (UI calls these; tests too)
function assignLayer(id, li, p) {
  const st = W.shelves[id]; if (st.locked) return false;
  if (p && (st.fridge ? PRODUCTS[p].where !== 'fridge' : PRODUCTS[p].where !== 'table')) return false;
  const L = st.layers[li]; if (L.p === p) return true;
  if (L.p && L.n) {   // what was on display can't go back to the kitchen: swapping throws it away (its ingredients are lost money)
    const loss = Math.max(1, Math.round(L.n * unitCost(L.p))); W.today.waste = (W.today.waste || 0) + loss; W.today.wasteN = (W.today.wasteN || 0) + L.n;
    NOTICE = { text: '换货丢掉 ' + L.n + ' 个' + PRODUCTS[L.p].name + '，亏 $' + loss, t: 0 }; SFX.deny();
  }
  L.p = p; L.n = 0; SFX.tap(); if (p) W.seen['new_' + p] = true;
  if (W.tut === 1 && p) W.tut = 2;
  if (W.tut === 2 && W.shelves.T4.layers.every(x => x.p)) W.tut = 3;
  if (PHASE === 'prep') saveGame();
  return true;
}
function buyIngr(k, n = 1) {   // n bags
  const cost = bagCost(k) * n; if (W.money < cost) { SFX.deny(); return false; }
  W.money -= cost; W.ing[k] += BAG_N[k] * n; W.today.packCost += cost; SFX.buy();
  if (PHASE === 'prep') saveGame(); return true;
}
function buyUpgrade(k) {
  const u = UPGRADES[k], n = upLv(k), L = u.lv[n]; if (!L || W.money < L[1] || (u.day && W.day < u.day)) { SFX.deny(); return false; }
  W.money -= L[1]; W.up[k] = n + 1; if (k === 'ac' || k === 'music') applyDecor(); W.today.upCost += L[1]; SFX.buy(); if (!n) playScene('up_' + k); else NOTICE = { text: L[0] + ' 装好了！' + L[2], t: 0 }; checkAch(); saveGame(); return true;
}
function buyExtraShelf(id, fridge) {
  const st = W.shelves[id], cost = EXTRA_SHELF[id]; if (!st || !st.locked || W.money < cost || PHASE === 'open' || PHASE === 'closing') { SFX.deny(); return false; }
  W.money -= cost; W.today.upCost += cost; st.locked = false; st.fridge = !!fridge; applyDecor(); computeStops(); redoShadows(); RINGS.clear(); SFX.ding(); saveGame(); return true;
}
function setShelfKind(id, fridge) {   // a display spot is a shelf (baked goods) or a glass fridge (drinks / desserts); switching clears what's on it
  const st = W.shelves[id]; if (!!st.fridge === fridge) return true;
  if (!st.locked && PHASE !== 'prep' && PHASE !== 'ledger') { SFX.deny(); NOTICE = { text: '开门前先可以改', t: 0 }; return false; }
  for (const L of st.layers) { if (L.p && L.n) { const loss = Math.max(1, Math.round(L.n * unitCost(L.p))); W.today.waste = (W.today.waste || 0) + loss; W.today.wasteN = (W.today.wasteN || 0) + L.n; } L.p = null; L.n = 0; }
  st.fridge = fridge; applyDecor(); computeStops(); redoShadows(); RINGS.clear();
  const g = MOV.find(q => q.id === id); if (g) g.name = fridge ? '冷柜' : '货架';
  SFX.tap(); saveGame(); return true;
}
function unlockShelf(id, fridge) {
  const st = W.shelves[id]; if (!st.locked || W.money < SHELF_COST) { SFX.deny(); return false; }
  if (fridge !== undefined) setShelfKind(id, fridge);
  W.money -= SHELF_COST; st.locked = false; W.today.upCost += SHELF_COST; computeStops(); redoShadows(); RINGS.clear(); SFX.buy(); playScene('shelf'); saveGame(); return true;
}
// one tap: top the pantry up so every item on today's plan can be made `n` more batches (cheapest way to not run out)
function restock(n = 3) {
  let spent = 0;
  for (const p of PIDS) if (unlocked(p) && W.plan[p] !== 'off' && (offered(p) || p === 'tea')) for (const k of RECIPE[p]) while ((W.ing[k] || 0) < n && W.money >= bagCost(k)) { const b = bagCost(k); W.money -= b; W.ing[k] += BAG_N[k]; W.today.packCost += b; spent += b; }   // a whole bag at a time
  if (spent) { SFX.buy(); if (PHASE === 'prep') saveGame(); } else SFX.deny();
  return spent;
}
function buyShelfTier(id) {
  const t = (W.decor.tier[id] || 0) + 1, T = SHELF_TIERS[t]; if (!T || W.money < T.cost || W.shelves[id].locked) { SFX.deny(); return false; }
  W.money -= T.cost; W.today.upCost += T.cost; W.decor.tier[id] = t; applyDecor(); SFX.ding(); saveGame(); return true;
}
function buyDecor(kind, k) {   // wallpaper / booth style: buy once, then switch freely
  const S = (kind === 'wall' ? WALLS : BOOTH_STYLES)[k], own = kind === 'wall' ? W.decor.walls : W.decor.booths;
  if (!own[k]) { if (W.money < S.cost) { SFX.deny(); return false; } W.money -= S.cost; W.today.upCost += S.cost; own[k] = true; }
  W.decor[kind] = k; applyDecor(); SFX.buy(); saveGame(); return true;
}
function rotateGroup(g) {   // placement mode: turn a shelf / plant 90 degrees (booths keep their seats, so they don't turn)
  if (!g) return; if (g.id[0] === 'B') { EDIT.msg = '卡座唔转得'; SFX.deny(); return; }
  const flip = () => { W.decor.rot[g.id] = W.decor.rot[g.id] ? 0 : 1; applyDecor(); };
  flip(); const why = canPlace(g); if (why) { flip(); EDIT.msg = '转唔到：' + why; SFX.deny(); return; }
  EDIT.msg = g.name + '转好了'; SFX.buy(); saveFurniture();
}
function upgradeStaff(k) {   // spend points: faster at the job, wage up, affection up, and a little scene
  const n = lvOf(k) + 1; if (n > LV_MAX || (W.pts || 0) < LV_COST[n]) { SFX.deny(); return false; }
  W.pts -= LV_COST[n]; W.lv[k] = n; SFX.ding(); playScene('aff_' + k + '_' + (n - 1)); if (PERKS[k] && PERKS[k][n]) PANEL = { kind: 'perk', k, lv: n, bar: 3 }; saveGame(); return true;   // Lv3 / Lv5: pick a new ability
}
function setTemp() {   // this morning's part-timer: a student on contract keeps coming; in summer, students looking for holiday work
  const C = W.contract, stu = (i, wage, extra) => { const P = PART_DEF[i]; Object.assign(HIRE.temp, { name: '学生' + P.name, wage, speed: 1, note: P.note + extra, student: true, si: i, day: 1, temp: true }); STAFF_HD.temp = PART_HD[i]; };
  if (C) { if (C.day !== W.day) { C.left--; C.day = W.day; } if (C.left >= 0) { stu(C.i, 40, ''); W.staff.temp.hired = true; return; } W.contract = null; notice('学生合约完咗，多谢帮手！'); }
  if (seasonIdx(W.day) === 1) { stu((W.day * 5 + 1) % PART_DEF.length, 45, ' · 暑期工'); W.staff.temp.hired = false; return; }
  const T = TEMPS[(W.day * 7 + 3) % TEMPS.length]; Object.assign(HIRE.temp, T, { day: 1, temp: true, student: false, si: null }); STAFF_HD.temp = GUEST_HD[T.ci]; W.staff.temp.hired = false;
}
const tempTalk = () => tonedLines(TEMP_TALK[HIRE.temp.name.replace(/^学生/, '')] || TEMP_TALK[HIRE.temp.name] || [['temp', '今日就交俾我啦！']]);
function signContract() {   // a summer student for six days in a row, a little cheaper
  if (W.staff.temp.hired || !HIRE.temp.student) { SFX.deny(); return false; }
  W.contract = { i: HIRE.temp.si, left: 5, day: W.day }; HIRE.temp.wage = 40; W.staff.temp.hired = true; SFX.buy(); syncStaff();
  STORY_Q.push({ key: 'temp', lines: tempTalk().concat([['temp', '六日！我一定唔迟到！'], [null, '（签咗 6 日）']]) }); saveGame(); return true;
}
function buyItem(id) {
  const it = DECOR_ITEMS[id]; if (!it || hasItem(id) || W.money < it.cost) { SFX.deny(); return false; }
  let pos = null; if (it.cat !== 'wall') { pos = findItemSpot(); if (!pos) { SFX.deny(); NOTICE = { text: '店里冇位摆喇', t: 0 }; return false; } }
  W.money -= it.cost; W.today.upCost += it.cost; (W.items = W.items || {})[id] = true; if (pos) (W.itemPos = W.itemPos || {})[id] = pos;
  applyDecor(); SFX.buy(); NOTICE = { text: it.name + (pos ? ' 买咗 · 拖去想放嘅位置' : ' 挂好喇') + ' · 舒适 ' + comfort(), t: 0 }; checkAch(); saveGame();
  if (pos) PANEL = { kind: 'placeask', id, back: PANEL, bar: 6 };   // a floor piece sits at its default spot; the player chooses to place it now or leave it there
  return true;
}
function placeNow(id) {   // placement mode with this piece picked out and the view on it
  const g = MOV.find(m => m.id === 'I_' + id), pos = (W.itemPos || {})[id]; PANEL = null; MODE = 'edit'; EDIT.sel = g || null; EDIT.msg = DECOR_ITEMS[id].name + '：拖去想放嘅位置，放好撳「摆放」完成';
  if (pos) camX = clamp(R(P(pos[0], pos[1])[0]) - 360, 0, CAM_MAX);
}
function buyExpand() {
  const n = expandLv(), E = EXPAND[n]; if (!E || W.money < E.cost || (E.day && W.day < E.day) || PHASE === 'open' || PHASE === 'closing') { SFX.deny(); if (PHASE === 'open' || PHASE === 'closing') NOTICE = { text: '打烊先扩建', t: 0 }; return false; }
  W.money -= E.cost; W.today.upCost += E.cost; W.expand = n + 1; applyDecor(); applyFurniture(); SFX.ding(); playScene(n ? 'expand_more' : 'expand'); checkAch(); saveGame(); return true;
}
function signSupplier(k) {
  const S = SUPPLIERS[k]; if (!S || (W.sup || {})[k] || shopLv() < S.lv || W.money < S.cost) { SFX.deny(); return false; }
  W.money -= S.cost; W.today.upCost += S.cost; (W.sup = W.sup || {})[k] = true; SFX.buy(); playScene('sup_' + k); saveGame(); return true;
}
function setPromo(id) {   // one promotion a day, paid now; changing it in the morning refunds the old one
  if (PHASE !== 'prep') { SFX.deny(); NOTICE = { text: '促销要开门前定', t: 0 }; return; }
  const T = W.today, q = PROMOS.find(p => p.id === id); if (T.promo === id) return;
  if (W.money + (T.promoCost || 0) < q.cost) { SFX.deny(); return; }
  W.money += T.promoCost || 0; W.money -= q.cost; T.promo = id; T.promoCost = q.cost; T.fc = forecast(); SFX.buy(); saveGame();
}
function pickPerk(k, id) { W.perks = W.perks || {}; (W.perks[k] = W.perks[k] || []).push(id); SFX.ding(); const q = perkInfo(id); NOTICE = { text: '学识咗「' + q[1] + '」：' + q[2], t: 0 }; PANEL = { kind: 'staff', bar: 3 }; saveGame(); }
function hireStaff(k) { if (W.staff[k].hired || W.day < HIRE[k].day) { SFX.deny(); return false; } W.staff[k].hired = true; SFX.buy(); syncStaff(); if (HIRE[k].temp) STORY_Q.push({ key: 'temp', lines: tempTalk().concat([[null, '（' + HIRE.temp.name + '只做今日）']]) }); else playScene('hire_' + k); saveGame(); return true; }
function setPost(k, post) {   // several people can share a post (up to POST_MAX): two at the bar make two batches at once, more waiters serve more booths
  if (W.staff[k].post !== post && postsOf(post).length >= POST_MAX[post]) { SFX.deny(); NOTICE = { text: POSTS[post].name + '最多 ' + POST_MAX[post] + ' 个人', t: 0 }; return; }
  W.staff[k].post = post; SFX.tap(); syncStaff(); saveGame();
}
function setPlan(p, v) { W.plan[p] = v; SFX.tap(); if (PHASE === 'prep') saveGame(); }
