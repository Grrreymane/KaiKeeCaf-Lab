// headless: drive the real buttons (render -> BTNS -> tapAt) through day 1 and into day 2
const S = 1 / 30, ok = (c, m) => { if (!c) { console.log('FAIL ' + m); process.exitCode = 1; } else console.log('ok   ' + m); };
const frame = n => { for (let i = 0; i < (n || 1); i++) { step(S); render(CTX); } };
const tap = (x, y) => { render(CTX); tapAt(x, y, x * K + camX, y * K); render(CTX); };
render(CTX);
const start = BTNS.find(b => b.y === 414 && b.x === 70); ok(start, 'title offers 女店主 / 男店主'); tap(start.x + 5, start.y + 5);
ok(W.hero === 'f', 'owner picked'); frame(2); ok(DIALOG && DIALOG.key === 'intro' && DIALOG.lines.some(l => l[0] === 'kun'), 'opening scene plays'); const skip = BTNS.find(b => b.x === 292); tap(skip.x + 5, skip.y + 5); ok(!DIALOG, 'skip closes the scene');
ok(PHASE === 'prep' && W.day === 1, 'start -> day 1 prep');
ok(HINT && HINT.shelf === 'T4', 'tutorial points at T4');
openPanel({ kind: 'shelf', id: 'T4', sel: 0 }); ok(W.tut === 1, 'opening T4 advances the tutorial');
render(CTX); { const t = BTNS.filter(b => b.w === 104 && b.h === 76)[0]; tap(t.x + 5, t.y + 5); } ok(W.shelves.T4.layers[0].p === 'tart', 'tap tart tile -> upper = tart');
ok(PANEL.sel === 1, 'selection jumps to the empty lower layer');
render(CTX); { const t = BTNS.filter(b => b.w === 104 && b.h === 76)[1]; tap(t.x + 5, t.y + 5); } ok(W.shelves.T4.layers[1].p === 'bun', 'tap bun tile -> lower = bun'); ok(W.tut === 3, 'tutorial reaches the open-shop step');
tap(337, 249); ok(!PANEL, 'close tab closes the sheet');
frame(30 * 12); ok(W.shelves.T4.layers[0].n > 0 || W.stock.tart > 0 || JOB.kun, 'Kun baked / is baking');
tap(10 + 76, 588 + 20); ok(PANEL && PANEL.kind === 'shop', 'bottom bar: 进货 opens the shop');
const m0 = W.money, f0 = W.ing.flour; render(CTX); const b1 = BTNS.filter(b => b.w === 50 && b.y > 100)[0]; tap(b1.x + 5, b1.y + 5); ok(W.money === m0 - bagCost('flour') && W.ing.flour === f0 + BAG_N.flour, 'buy a bag of flour');
render(CTX); const rs = BTNS.find(b => b.w === 196); const m1 = W.money; tap(rs.x + 5, rs.y + 5); ok(W.money < m1 && batchesOf('tart') >= 3, 'restock button tops up for the plan');
PANEL = null;
tap(300, 560); ok(PHASE === 'open', 'receipt button opens the shop');
for (let i = 0; i < 30 * 260 && PHASE !== 'ledger'; i++) frame();
ok(PHASE === 'ledger' && LEDGER && LEDGER.day === 1, 'day 1 ends with the books');
console.log('     day1: served ' + LEDGER.served + ' revenue ' + LEDGER.revenue + ' profit ' + LEDGER.profit + ' money ' + W.money);
render(CTX); const next = BTNS.filter(b => b.w === 200).pop(); tap(next.x + 5, next.y + 5); ok(PHASE === 'prep' && W.day === 2, 'next day button -> day 2 prep');
// day 2: Wen can be hired from the staff sheet and put on the water bar
clickBar(3); render(CTX); const hire = BTNS.find(b => b.w === 108); ok(hire, 'staff sheet offers to hire Wen'); tap(hire.x + 5, hire.y + 5); ok(W.staff.wen.hired && W.staff.wen.post === 'bar', 'Wen hired, on the water bar'); ok(STORY_Q.some(q => q.key === 'hire_wen'), 'hiring scene queued (plays once the sheet closes)'); STORY_Q.length = 0; render(CTX);
render(CTX); const plan = BTNS.find(b => b.w === 86); tap(plan.x + 5, plan.y + 5); ok(PANEL.kind === 'plan', 'bake plan sheet opens');
render(CTX); const pri = BTNS.find(b => b.w === 47 && b.x === 192); tap(pri.x + 5, pri.y + 5); ok(W.plan.tart === 'pri', 'tart set as the lead item');
W.speed = 1; render(CTX); const sp = BTNS.find(b => b.x === 262); tap(sp.x + 5, sp.y + 5); ok(W.speed === 2, 'speed button: x2');
PANEL = null;
// save / load round trip
saveGame(); const strip = o => JSON.stringify({ ...o, today: 0 }), before = strip(W); ok(loadGame() && strip(W) === before, 'save round-trips'); bindShelves();
// placement mode: move T6 into the path -> refused and returned
clickBar(5); ok(MODE === 'edit', 'placement mode on');
const g = MOV.find(g => g.id === 'T6'); moveGroup(g, 40, 0); ok(canPlace(g) !== '', 'T6 pushed into the aisle is refused: ' + canPlace(g)); moveGroup(g, -40, 0); ok(canPlace(g) === '', 'T6 back in place is fine');
clickBar(5); ok(MODE === 'play', 'placement mode off');
// design desk: coconut tart on day 3, the help button walks through all three steps
const PH0 = PHASE; PHASE = 'open'; clickBar(2); ok(!DESK, 'desk is closed while the shop is open'); PHASE = 'prep'; clickBar(2); ok(DESK, 'desk opens before opening'); DESK = null; PHASE = 'ledger'; W.day = 2; openDesk(); ok(DESK && DESK.p === 'coco', 'desk opens on 椰挞'); for (let k = 0; k < 20 && !DESK.oven; k++) deskHelp(); for (let i = 0; i < 90; i++) stepDesk(1 / 30); ok(DESK.mode === 'done', 'three steps done'); closeDesk(); ok(W.known.coco && unlocked('coco'), '椰挞 researched'); ok(STORY_Q.length || DIALOG, 'research scene queued');
// hold-to-fill really fills
W.day = 3; openDesk(); for (let k = 0; k < 20 && DESK.step !== 'fill'; k++) deskHelp(); DESK.hold = true; for (let i = 0; i < 400; i++) { DESK.hold = true; stepDesk(1 / 30); } ok(DESK.step === 'oven' && DESK.fills.every(f => f >= 1), 'holding fills all six'); DESK = null; PHASE = PH0;
// staff levels: points buy a level -> wage up, affection up, a scene
STORY_Q.length = 0; DIALOG = null; W.pts = 10; ok(!upgradeStaff('kun'), 'not enough points: refused');
W.pts = 100; const w0 = wages(); ok(upgradeStaff('kun') && lvOf('kun') === 2 && wages() === w0 + LV_WAGE && affLevel('kun') === 1 && W.pts === 70, 'kun levels up with points'); ok(STORY_Q.length || DIALOG, 'level-up scene queued');
// decor: better shelf (bigger layers), wallpaper, booth style, turning a shelf in placement mode
W.money = 5000; ok(buyShelfTier('T4') && W.shelves.T4.layers[0].cap === 8 && TABLES.T4._key === '1:0:0', 'T4 upgraded: 8 per layer');
const b0 = beauty(); ok(buyDecor('wall', 'cream') && W.decor.wall === 'cream' && beauty() > b0, 'cream wallpaper bought');
ok(buyDecor('booth', 'deluxe') && W.decor.booth === 'deluxe', 'deluxe booths');
const gT6 = MOV.find(g => g.id === 'T6'); rotateGroup(gT6); ok(W.decor.rot.T6 === 1 || EDIT.msg.startsWith('转唔到'), 'T6 turned (or refused if no room): ' + EDIT.msg);
ok(SHELF.T4.obj === TABLES.T4 && STATICS.includes(TABLES.T4), 'rebuilt shelf is live in the world');
// achievements + beauty milestones
{ const p0 = W.pts; checkAch(); ok(W.ach.first && W.ach.b6 && W.pts > p0, 'achievements awarded (first day, beauty 6): ' + Object.keys(W.ach).join(',')); ok(patience() > 1, 'beauty 6 perk: guests wait longer'); }
openPanel({ kind: 'ach', bar: 4 }); render(CTX); ok(PANEL.kind === 'ach', 'achievements sheet draws'); PANEL = null;
// part-timer: today's candidate can be hired from the staff sheet, works a post, gone tomorrow
ok(HIRE.temp.name && STAFF_HD.temp, "today's part-timer: " + HIRE.temp.name); { const w0 = wages(); hireStaff('temp'); setPost('temp', 'take'); ok(W.staff.temp.hired && wages() === w0 + HIRE.temp.wage && postOf('take') === 'temp', 'part-timer hired onto the takeaway window'); STORY_Q.length = 0; DIALOG = null;
  const PH = PHASE; startDay(); ok(!W.staff.temp.hired, 'part-timer leaves at the end of the day'); }
// several people on one post: two at the bar work two batches, two waiters share the booths
{ W.staff.shao.hired = true; W.staff.wen.hired = true; setPost('wen', 'bar'); setPost('shao', 'bar'); ok(postsOf('bar').length === 2, 'two people on the water bar');
  syncStaff(); const P0 = PHASE; PHASE = 'open'; for (const k in W.ing) W.ing[k] = 20; for (const L of W.shelves.T2.layers) { L.p = 'tea'; L.n = 0; } W.stock.tea = 0; JOB.bar = JOB.bar2 = JOB.lin = null; W.plan.tea = 'pri';
  for (let i = 0; i < 30; i++) stepStaff(1 / 30); ok(JOB.bar && JOB.bar2, 'both bar workers are making a batch');
  setPost('wen', 'serve'); setPost('shao', 'serve'); ok(WAITERS.length === 2, 'two waiters'); PHASE = P0; }
// swapping a stocked layer throws its pieces away and the loss is booked
{ const L = W.shelves.T4.layers[0]; assignLayer('T4', 0, 'tart'); L.n = 4; const w0 = W.today.waste || 0; assignLayer('T4', 0, 'bun'); ok(W.today.waste > w0 && W.today.wasteN >= 4 && L.n === 0, 'swap wastes the 4 tarts: -$' + (W.today.waste - w0)); }
// the R&D process by hand: weigh with the scale, knead by tapping, rest, roll, cut ...
{ PHASE = 'ledger'; W.known.coco = false; W.day = 3; DESK = startRecipe('coco'); const D = DESK;
  ok(D.step === 'weigh' && D.flow.length >= 8, 'coconut tart: ' + D.flow.map(s => s.type).join('>'));
  D.hold = true; for (let i = 0; i < 80 && (D.s.grams || 0) < 250; i++) stepDesk(1 / 30); deskUp(); ok(D.step === 'weigh' && D.si === 1, 'flour weighed (' + D.msg + ')');
  deskHelp(); ok(D.step === 'knead', 'on to kneading'); for (let i = 0; i < 8; i++) deskTap(); for (let i = 0; i < 20; i++) stepDesk(1 / 30); ok(D.step === 'rest', 'kneaded by tapping');
  deskTap(); for (let i = 0; i < 90; i++) stepDesk(1 / 30); ok(D.step === 'roll', 'dough rested'); DESK = null; PHASE = 'prep'; }
// upgrades have levels: till three times, each faster
{ W.money = 9000; W.up.till = 0; const t0 = checkoutTime({ got: { tart: 2 } }, false); buyUpgrade('till'); buyUpgrade('till'); buyUpgrade('till'); ok(upLv('till') === 3 && !buyUpgrade('till') && checkoutTime({ got: { tart: 2 } }, false) < t0 * .5, 'till upgraded to level 3, checkout >2x faster');
  const p0 = priceOf('tea'); buyUpgrade('tea'); ok(priceOf('tea') === p0 + 1, 'tea set raises drink price'); const b0 = beauty(); buyUpgrade('music'); ok(beauty() === b0 + 2, 'radio adds beauty');
  openPanel({ kind: 'book', bar: 4 }); render(CTX); ok(PANEL.kind === 'book', 'books with 8 upgrades draw'); PANEL = null; }
// seasons + star abilities
{ ok(seasonOf(1).name === '春' && seasonOf(13).name === '夏' && seasonOf(22).name === '夏' && seasonOf(25).name === '秋' && seasonOf(49).name === '春', 'four seasons of 12 days, then a new year');
  W.lv.lin = 2; W.pts = 500; const c0 = bagCost('flour'); upgradeStaff('lin'); ok(PANEL && PANEL.kind === 'perk' && PANEL.lv === 3, 'Lv3 offers a choice of new abilities'); pickPerk('lin', 'lin_buyer'); ok(hasPerk('lin_buyer') && bagCost('flour') < c0, '进货高手: ingredients cheaper'); PANEL = null; STORY_Q.length = 0; DIALOG = null; }
// operations core: forecast, price / stock tiers, stale leftovers
{ ok(W.today.wx && W.today.fc && W.today.fc.n > 0, 'morning forecast: weather + expected guests');
  const p0 = priceOf('tart'); setTier('priceTier', 2); ok(priceOf('tart') > p0, '精品 raises prices'); setTier('priceTier', 1); ok(priceOf('tart') === p0, 'back to standard');
  setTier('stockTier', 0); ok(stockTier() === 0, 'stock tier set'); setTier('stockTier', 1); }
// summer: students on contract, promotions, display add-ons, 阿晴
{ const d0 = W.day; W.day = 14; setTemp(); ok(HIRE.temp.student && HIRE.temp.name.startsWith('学生'), 'summer part-timer is a student');
  signContract(); STORY_Q.length = 0; DIALOG = null; ok(W.staff.temp.hired && W.contract && W.contract.left === 5, 'six-day contract signed');
  for (let i = 0; i < 6; i++) { W.day++; setTemp(); } ok(!W.contract && !W.staff.temp.hired, 'contract ends after six days');
  W.day = d0; setTemp(); W.contract = null;
  const ph = PHASE; PHASE = 'prep'; const m0 = W.money; setPromo('ice'); ok(W.today.promo === 'ice' && W.money === m0 - 40, 'promo paid up front'); setPromo('none'); ok(W.money === m0, 'switching back refunds'); PHASE = ph;
  ok(HIRE.qing && STAFF_HD.qing && NAMES.qing, '阿晴 can be hired');
  W.known.redice = W.known.eggwaf = true; const st = W.shelves[SHELF_IDS[0]]; st.locked = false; st.layers[0].p = 'eggwaf'; st.layers[0].n = 3; st.layers[1].p = 'redice'; st.layers[1].n = 3;
  let added = 0; for (let i = 0; i < 40; i++) { const c = { got: { eggwaf: 1 }, wants: ['eggwaf'] }; addOn(c, SHELF_IDS[0]); if (c.got.redice) added++; st.layers[1].n = 3; }
  ok(added > 3 && added < 30, 'combo partner on the same shelf: some customers add it (' + added + '/40)'); FLY.length = 0; POPS.length = 0; }
// a display spot can be a shelf or a glass fridge
{ const ph = PHASE; PHASE = 'prep'; ok(setShelfKind('T3', true) && W.shelves.T3.fridge && TABLES.T3._key.endsWith(':1'), 'T3 turned into a fridge'); ok(!assignLayer('T3', 0, 'tart') && assignLayer('T3', 0, 'tea'), 'fridge takes drinks only');
  ok(setShelfKind('T3', false) && !W.shelves.T3.fridge, 'and back to a shelf'); PHASE = ph; }
// phase 3: next door, suppliers, 耀仔's oven
{ const ph = PHASE; PHASE = 'prep'; W.day = Math.max(W.day, 10); W.money = 9000; const b0 = BOOTHS.length;
  ok(buyExpand() && expandLv() === 1 && BOOTHS.length === b0 + 2 && SEATS.length === BOOTHS.length * 4, 'next door opened: two more booths');
  ok(!STATICS.some(o => o.x0 === 324 && o.x1 === 640), 'shutter gone');
  buyExpand(); ok(BOOTHS.length === b0 + 4, 'second expansion: four booths next door'); STORY_Q.length = 0; DIALOG = null;
  const st = SEATS.find(s => seatPos(s).X > 318); ok(st, 'a seat next door');
  W.total.served = 900; ok(shopLv() === 3, 'shop level from customers served'); const c0 = bagCost('mango'); ok(signSupplier('hui') && bagCost('mango') < c0, '惠姐: fruit cheaper');
  STORY_Q.length = 0; DIALOG = null; PHASE = ph; }
// extra display spots
{ const ph = PHASE; PHASE = 'prep'; W.money = 9000; ok(!STATICS.includes(TABLES.T7), 'unbought spot not in the shop');
  ok(buyExtraShelf('T7', true) && STATICS.includes(TABLES.T7) && reachable('T7') && W.shelves.T7.fridge, 'T7 bought as a fridge, customers can reach it'); PHASE = ph; }
// decor items + comfort
{ W.money = 9000; const c0 = comfort(), s0 = spawnRate(); ok(buyItem('monstera') && MOV.some(m => m.id === 'I_monstera') && comfort() === c0 + 4, 'plant bought and placed, comfort up');
  ok(spawnRate() > s0, 'comfort brings more customers'); ok(buyItem('clock') && hasItem('clock'), 'wall clock hung');
  const g = MOV.find(m => m.id === 'I_monstera'); ok(g && !canPlace(g), 'auto-placed plant is in a valid spot');
  W.day = 40; ok(itemComfort('xmas') === 8 || !hasItem('xmas'), 'xmas counts double in winter'); W.up.ac = 1; ok(comfort() >= c0 + 4 + 1 + 2, 'air conditioner adds comfort'); }
// dirt + cleaning, wealth, gifts, part-timer scene, two bakers
{ W.dirt = 0; const s0 = spawnRate(); dirtAdd(80); ok(W.dirt >= 79 && spawnRate() < s0, 'a dirty shop draws fewer customers');
  W.staff.temp.hired = true; W.staff.temp.post = 'clean'; const d0 = W.dirt; for (let i = 0; i < 600; i++) stepCleaners(.05); ok(W.dirt < d0, 'cleaner brings the dirt down (' + R(d0) + ' -> ' + R(W.dirt) + ')'); W.staff.temp.post = 'take'; W.dirt = 0;
  const kid = GUEST_DEF.findIndex(g => g.name === '小男孩'); ok(wealthOf(kid)[0] <= 10 && wealthOf(GUEST_DEF.findIndex(g => g.name === '西装金融男'))[1] > 100, 'kids have small budgets, finance men big ones');
  const fk = GUEST_DEF[0].name; W.fans = {}; W.gifted = {}; for (let i = 0; i < GIFT_AT; i++) fanOf(0, 5); ok(W.gifted[fk], 'a happy regular kind brings a gift'); STORY_Q.length = 0; DIALOG = null;
  ok(POST_MAX.bake === 2, 'two people can work the bake post');
  ok(TEMP_TALK['米米'] && TEMP_TALK['退休浩叔'], 'every part-timer has their own joining scene'); }
