// ==== Lab (港式 Lab): invent your own item — base + flavour + filling + decoration. Every creation keeps something Hong Kong in it;
// the panel shows price, speed, a star score and the reasons before you try it. 试做 runs the real design desk with steps built from the
// recipe; once made it is saved to one of five slots (lab1..lab5) and sells like any other item. One creation a day, from day 3.
const LAB_BASES = {
  puff: { name: '泡芙', where: 'table', price: 10, bake: 12, ingr: ['flour', 'butter', 'egg'], vessel: 'tin', heat: 'oven', fit: ['tea', 'yuen', 'sesame', 'mango'] },
  tart: { name: '挞', where: 'table', price: 9, bake: 10, ingr: ['flour', 'butter'], vessel: 'tin', heat: 'oven', fit: ['lemon', 'redbean', 'sesame', 'coconut'], hk: true },
  cheese: { name: '乳酪蛋糕', where: 'fridge', price: 16, bake: 14, ingr: ['milk', 'egg', 'sugar'], vessel: 'tin', heat: 'fridge', fit: ['sesame', 'mango', 'lemon', 'tea'] },
  waffle: { name: '鸡蛋仔', where: 'table', price: 12, bake: 8, ingr: ['flour', 'egg', 'evap'], vessel: 'tin', heat: 'oven', fit: ['redbean', 'coconut', 'sesame', 'tea'], hk: true },
  mousse: { name: '慕斯杯', where: 'fridge', price: 15, bake: 10, ingr: ['milk', 'sugar'], vessel: 'cup', heat: 'fridge', fit: ['mango', 'yuen', 'tea', 'lemon', 'coconut'] },
};
const LAB_FLAVORS = {
  tea: { name: '奶茶', ingr: ['tealeaf', 'evap'], col: '#c8945a', hk: true, tag: '茶香', step: 'brew' },
  yuen: { name: '鸳鸯', ingr: ['tealeaf', 'coffee'], col: '#8a5a38', hk: true, tag: '咖啡茶香', step: 'brew' },
  sesame: { name: '黑芝麻', ingr: ['sesame'], col: '#4a4046', hk: true, tag: '芝麻香' },
  redbean: { name: '红豆', ingr: ['redbean'], col: '#8a3a34', hk: true, tag: '红豆绵' },
  mango: { name: '芒果', ingr: ['mango'], col: '#ffb52e', tag: '果香', step: 'dice' },
  lemon: { name: '柠檬', ingr: ['lemon'], col: '#f4e04a', tag: '清新', step: 'press' },
  coconut: { name: '椰子', ingr: ['coconutmilk'], col: '#f4efe2', tag: '椰香' },
};
const LAB_FILLS = {
  none: { name: '无', price: 0 },
  cream: { name: '忌廉', ingr: ['milk'], col: '#fffaf0', price: 2, good: ['tea', 'sesame', 'mango', 'yuen'] },
  sago: { name: '西米', ingr: ['sago'], col: '#e8f0f2', price: 2, good: ['mango', 'coconut', 'redbean'], bad: ['puff', 'waffle'] },
  coco: { name: '椰丝', ingr: ['coconut'], col: '#fff4dc', price: 1, good: ['mango', 'redbean', 'coconut'] },
  bean: { name: '红豆粒', ingr: ['redbean'], col: '#7a2a24', price: 2, good: ['tea', 'coconut', 'sesame'] },
  mangod: { name: '芒果粒', ingr: ['mango'], col: '#ffb020', price: 3, good: ['coconut', 'lemon', 'mango'] },
};
const LAB_DECOR = {
  none: { name: '无', price: 0, time: 0 },
  icing: { name: '糖霜', price: 1, time: 1, good: ['lemon', 'tea'], tag: '精致' },
  gold: { name: '金箔', price: 4, time: 3, tag: '好睇' },
  fruit: { name: '鲜果', price: 3, time: 2, good: ['mango', 'lemon', 'coconut'], tag: '鲜' },
  crumb: { name: '饼干碎', price: 1, time: 1, good: ['yuen', 'tea', 'sesame'], tag: '脆口' },
};
// what has to be researched (研发) before the Lab can riff on it: the classic first, then the creation
const LAB_NEED = { base: { tart: 'tart', puff: 'papercake', cheese: 'swissroll', waffle: 'eggwaf', mousse: 'dpn' },
  flavor: { tea: 'tea', yuen: 'yuen', redbean: 'pudding', mango: 'mango', lemon: 'lemontea', coconut: 'coco', sesame: 'tart' },
  fill: { sago: 'mango', bean: 'pudding', mangod: 'mango', coco: 'coco' } };
const labHas = (key, k) => { const p = (LAB_NEED[key] || {})[k]; return !p || unlocked(p); };
const labReady = r => labHas('base', r.base) && labHas('flavor', r.flavor) && labHas('fill', r.fill);
const LAB_SLOTS = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];
const LAB_DAY = 3;   // kept for old saves; the Lab is gated by expansion (labUnlocked)
// rate a combination: stars, price, prep time, and the reasons in a line each
function labRate(r) {
  const B = LAB_BASES[r.base], F = LAB_FLAVORS[r.flavor], I = LAB_FILLS[r.fill], D = LAB_DECOR[r.decor], why = [];
  let s = 2;
  if (B.fit.includes(r.flavor)) { s += 1; why.push(F.tag + '和' + B.name + '很搭'); } else why.push(B.name + '配' + F.name + '，普普通通');
  if (I.bad && I.bad.includes(r.base)) { s -= 1; why.push(I.name + '放进' + B.name + '不太搭'); }
  else if (I.good && I.good.includes(r.flavor)) { s += 1; why.push(I.name + '加得好'); }
  if (B.hk || F.hk) { s += .5; why.push('有港式味道，街坊爱吃'); } else { s -= 1; why.push('港味不够，老街坊未必喜欢'); }
  if (D.good && D.good.includes(r.flavor)) { s += .5; why.push(D.name + '和' + F.name + '很配'); }
  if (r.decor === 'gold') { s += .5; why.push('装饰精致，但做得慢一点'); }
  const stars = clamp(Math.round(s), 1, 5);
  return { stars, why, price: B.price + I.price + D.price + (F.hk ? 1 : 2), bake: B.bake + D.time, warn: (I.bad && I.bad.includes(r.base)) || !(B.hk || F.hk) };
}
const labName = (r, creative) => { const B = LAB_BASES[r.base], F = LAB_FLAVORS[r.flavor], I = LAB_FILLS[r.fill]; return creative ? ['午后', '街角', '晚风', '金色', '夏日', '老街'][(r.base.length + r.flavor.length + r.fill.length) % 6] + F.tag.slice(-2) + B.name : F.name + (r.fill !== 'none' && r.fill !== 'cream' ? I.name.slice(0, 2) : '') + B.name; };
const labIngr = r => [...new Set([...LAB_BASES[r.base].ingr, ...LAB_FLAVORS[r.flavor].ingr, ...(LAB_FILLS[r.fill].ingr || [])])].slice(0, 4);
// a creation becomes a real product: name, picture, price, where it is made, its recipe and the design-desk steps
function applyLab() {
  if (!W) return; W.lab = W.lab || {};
  for (const id of LAB_SLOTS) {
    const r = W.lab[id]; if (!r) continue;
    const B = LAB_BASES[r.base], F = LAB_FLAVORS[r.flavor], I = LAB_FILLS[r.fill], rate = labRate(r), P_ = PRODUCTS[id];
    Object.assign(P_, { name: r.name, price: rate.price, bake: rate.bake, where: B.where, want: .16 + rate.stars * .035, img: FOOD_L.labImg(r.base, F.col, I.col || null, r.decor) });
    RECIPE[id] = labIngr(r);
    for (const L_ of [TABLE_ALL, FRIDGE_ALL]) { const k = L_.indexOf(id); if (k >= 0) L_.splice(k, 1); } (B.where === 'table' ? TABLE_ALL : FRIDGE_ALL).push(id);
    labDesk(id, r);
  }
}
function labDesk(id, r) {   // the design desk's recipe card + the steps, built from the parts
  const B = LAB_BASES[r.base], F = LAB_FLAVORS[r.flavor], I = LAB_FILLS[r.fill];
  RECIPES[id] = { verb: '装', fill: F.col, baked: mixHex(F.col, '#e0a050', .4), heat: B.heat, vessel: B.vessel, need: labIngr(r), tip: 'Lab 自创：' + r.name };
  const flavourStep = F.step === 'brew' ? { type: 'brew', tip: F.name + '先焗出茶味，' + F.tag + '先够' } : F.step === 'dice' ? { type: 'dice', tip: '芒果切细粒，拌入去先均匀' } : F.step === 'press' ? { type: 'press', tip: '柠檬压出汁，唔好压到苦' } : { type: 'add', ks: F.ingr, tip: '加入' + F.name + '：' + F.tag };
  const steps = {
    puff: [{ type: 'weigh', k: 'flour', g: 150, tip: '泡芙皮：面粉要一次过落' }, { type: 'add', ks: ['butter', 'egg'], tip: '蛋分几次加，拌到挂旗' }, { type: 'mix', tip: '拌到顺滑有光泽' }],
    tart: [{ type: 'weigh', k: 'flour', g: 200, tip: '挞皮：面粉称准' }, { type: 'add', ks: ['butter'], tip: '牛油要冻' }, { type: 'knead', tip: '搓到冇粉粒就够' }, { type: 'cut', tip: '压出挞皮' }],
    cheese: [{ type: 'add', ks: ['milk', 'egg', 'sugar'], tip: '乳酪要室温先拌得滑' }, { type: 'mix', tip: '慢慢拌，唔好打入空气' }],
    waffle: [{ type: 'add', ks: ['flour', 'egg', 'evap'], tip: '鸡蛋仔浆：淡奶令佢更香' }, { type: 'mix', tip: '拌到冇粒' }],
    mousse: [{ type: 'add', ks: ['milk', 'sugar'], tip: '慕斯底：奶同糖拌匀' }, { type: 'mix', tip: '打到轻盈' }],
  }[r.base].slice();
  steps.push(flavourStep);
  if (I.ingr) steps.push({ type: 'add', ks: I.ingr.filter(k => !(F.ingr.includes(k))), tip: '配料：' + I.name });
  steps.push({ type: 'fill', tip: B.vessel === 'cup' ? '倒入杯，一层层' : '倒入模，八成满' }, { type: 'oven', tip: B.heat === 'oven' ? '入炉焗，睇住颜色' : '雪定型' });
  FLOWS[id] = steps.filter(s => s.type !== 'add' || (s.ks && s.ks.length));
}
let LAB_DRAFT = null;   // the creation being tried at the desk
const labUnlocked = () => W && expandLv() >= 1;   // the Lab opens once the shop has been expanded
const labOpen = () => labUnlocked() && canResearch();
// who goes for Lab food: the young and trendy love it, the old neighbourhood less so
const LAB_FANS = { '女学生': 2.2, '中学男生': 2, '叛逆学生': 2.2, '潮人（男）': 2.5, '潮人（女）': 2.5, '韩系女生': 2.4, '日系男生': 2.2, '新鲜人': 1.8, '白领姐姐': 1.6, '上班族': 1.3, '外国游客': 1.6, '背包客': 1.5, '婆婆': .4, '拐杖阿伯': .4, '街坊阿姨': .7 };
const labLike = (ci, p) => PRODUCTS[p].lab ? (LAB_FANS[GUEST_DEF[ci] && GUEST_DEF[ci].name] || 1) : 1;
function labTry(P_) {   // into the design desk with the draft in a slot
  const r = P_.r, slot = P_.slot || LAB_SLOTS.find(id => !(W.lab || {})[id]) || LAB_SLOTS[0];
  if (W.labDay === W.day) { SFX.deny(); NOTICE = { text: '今天试做过了，明天再来', t: 0 }; return; }
  if (!labReady(r)) { SFX.deny(); NOTICE = { text: '有材料还没研发过，先去研发', t: 0 }; return; }
  if (labRate(r).warn && !P_.sure) { P_.sure = true; SFX.deny(); NOTICE = { text: '这个搭配有点问题，再按一次照做', t: 0 }; return; }
  LAB_DRAFT = { id: slot, r: { ...r } }; const keep = W.lab && W.lab[slot];
  (W.lab = W.lab || {})[slot] = { ...r }; labDesk(slot, r); applyLab(); if (keep) LAB_DRAFT.old = keep; else delete W.lab[slot];   // the desk needs the recipe card; the slot is only kept once the try succeeds
  PANEL = null; SFX.tap(); DESK = startRecipe(slot); DESK.lab = true;
}
function labDone(D) {   // a successful try: keep it in the slot, a tasting with reasons
  const d = LAB_DRAFT; if (!d) return; LAB_DRAFT = null;
  W.lab = W.lab || {}; W.lab[d.id] = d.r; W.known[d.id] = true; W.labDay = W.day; W.labGuide = false; W.pts = (W.pts || 0) + 20; applyLab(); applyDecor();
  const rate = labRate(d.r), taster = W.staff.yao && W.staff.yao.hired ? 'yao' : 'kun';
  STORY_Q.push({ key: 'labtaste', lines: tonedLines([[taster, '先试试……「' + d.r.name + '」。'], [taster, rate.why[0] + '。'], ['lin', rate.why.slice(1).join('，') || '挺好的！'], [null, '「' + d.r.name + '」' + '★'.repeat(rate.stars) + ' · $' + rate.price + ' · 明天可以摆上去']]) });
  notice('Lab 新品「' + d.r.name + '」做好了！'); saveGame();
}
function labCancel() { const d = LAB_DRAFT; if (!d) return; LAB_DRAFT = null; if (d.old) { W.lab[d.id] = d.old; applyLab(); } }
// ---------------------------------------------------------------- the Lab panel
function drawLabPanel(c, P_) {
  P_.r = P_.r || { base: 'tart', flavor: 'tea', fill: 'cream', decor: 'none' };
  const r = P_.r; let y = sheet(c, '港式 Lab · 年轻人至爱', '每日试做一款', 104) - 2;
  const row = (label, set, key) => {   // each line of choices is stretched to the full width (no ragged gaps), a thin rule between groups
    const ks = Object.keys(set), lines = Math.ceil(ks.length / 5), per = Math.ceil(ks.length / lines);
    T(c, label, 14, y + 6, SUB, 'left', null);
    for (let L = 0; L < lines; L++) { const part = ks.slice(L * per, L * per + per), w = (292 - 3 * (part.length - 1)) / part.length;
      part.forEach((k, i) => { const x = R(54 + i * (w + 3)), on = r[key] === k, bad = key === 'fill' && set[k].bad && set[k].bad.includes(r.base), has = labHas(key, k);
        btn(c, x, y, R(54 + (i + 1) * (w + 3) - 3) - x, 24, set[k].name, () => { if (!has) { SFX.deny(); NOTICE = { text: '先研发「' + PRODUCTS[LAB_NEED[key][k]].name + '」才能用' + set[k].name, t: 0 }; return; } r[key] = k; P_.sure = false; if (key === 'base' || key === 'flavor') P_.name = null; SFX.tap(); }, on ? 'gold' : bad || !has ? 'off' : 'cream'); });
      y += 27; }
    y += 3; px(c, 14, y - 3, 332, 1, '#e3d6bc');
  };
  row('基底', LAB_BASES, 'base'); row('风味', LAB_FLAVORS, 'flavor'); row('配料', LAB_FILLS, 'fill'); row('装饰', LAB_DECOR, 'decor'); y += 4;
  const rate = labRate(r); P_.name = P_.name || labName(r, false); r.name = P_.name;
  card(c, 14, y, 332, 112, '#fffaf0');
  { const im = FOOD_L.labImg(r.base, LAB_FLAVORS[r.flavor].col, LAB_FILLS[r.fill].col || null, r.decor); c.drawImage(im, 18, y + 18, im.width * 2, im.height * 2); }
  TS(c, r.name, 92, y + 6, 16, INK); T(c, '★'.repeat(rate.stars) + '☆'.repeat(5 - rate.stars), 338, y + 8, '#c99428', 'right', null);
  T(c, '$' + rate.price + ' · ' + (rate.bake <= 10 ? '快' : rate.bake <= 14 ? '中' : '慢') + ' · ' + (LAB_BASES[r.base].where === 'table' ? '坤伯烤' : '水吧做'), 92, y + 28, '#2f6e56', 'left', null);
  rate.why.slice(0, 4).forEach((w, i) => T(c, '· ' + w, 92, y + 46 + i * 15, /不|普普通通|慢/.test(w) ? '#b8342c' : SUB, 'left', null));
  y += 120;
  btn(c, 14, y, 96, 24, '传统名', () => { P_.name = labName(r, false); SFX.tap(); }, 'cream');
  btn(c, 114, y, 96, 24, '创意名', () => { P_.name = labName(r, true); SFX.tap(); }, 'cream');
  btn(c, 214, y, 132, 24, '自己改名', () => { let n = null; try { n = window.prompt('改个名字（最多 8 个字）', P_.name); } catch (e) {} if (n && n.trim()) P_.name = n.trim().slice(0, 8); }, 'cream');
  y += 30;
  T(c, '保存到', 14, y + 6, SUB, 'left', null);
  LAB_SLOTS.forEach((id, i) => { const x = 58 + i * 58, has = (W.lab || {})[id], on = (P_.slot || LAB_SLOTS.find(q => !(W.lab || {})[q]) || LAB_SLOTS[0]) === id;
    card(c, x, y, 54, 40, on ? '#ffe9b0' : '#fffaf0'); if (has) { half(c, PRODUCTS[id].img, x + 27, y + 12); T(c, PRODUCTS[id].name.slice(0, 4), x + 27, y + 23, INK, 'center', null); } else T(c, '空位', x + 27, y + 13, '#b0a08c', 'center', null);
    button(x, y, 54, 40, () => { P_.slot = id; SFX.tap(); }); });
  y += 50;
  const done = W.labDay === W.day;
  btn(c, 70, y, 220, 36, done ? '今天试做过了' : '试做 →', () => labTry(P_), done ? 'off' : 'gold');
  if (W.labGuide && !done) { const ay = y + 18, tx = 64 - R(Math.abs(Math.sin(rtime * 4)) * 5); px(c, tx - 24, ay - 4, 14, 8, OUT); px(c, tx - 23, ay - 3, 13, 6, C.gold); for (let k = 0; k < 8; k++) { px(c, tx - 10 + k, ay - 8 + k, 1, 16 - 2 * k, C.gold); px(c, tx - 10 + k, ay - 9 + k, 1, 1, OUT); px(c, tx - 10 + k, ay + 8 - k, 1, 1, OUT); }   // an arrow from the left, pointing at 试做
    T(c, '选好搭配，按「试做」', 180, y + 40, '#b8483c', 'center', null); }   // first visit from the tour: point at 试做
}
