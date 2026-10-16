// ==== data: products, packs, staff + posts, combos, upgrades, calendar (v1.0 spring: 12 days)
// where: 'table' = baked by Kun, sits on the display tables; 'fridge' = made at the water bar, sits in the glass fridge
const PRODUCTS = {
  tart: { name: '蛋挞', price: 8, img: FOOD_L.tart, bake: 9, where: 'table', want: .5, day: 1 },
  bun: { name: '菠萝包', price: 9, img: FOOD_L.bun, bake: 14, where: 'table', want: .42, day: 1 },
  coco: { name: '椰挞', price: 9, img: FOOD_L.coco, bake: 11, where: 'table', want: .32, day: 2 },
  wife: { name: '老婆饼', price: 10, img: FOOD_L.wife, bake: 18, where: 'table', want: .3, day: 4 },
  tea: { name: '冻奶茶', price: 18, img: FOOD_L.tea, bake: 5, where: 'fridge', want: .32, day: 1 },
  pudding: { name: '红豆布丁', price: 14, img: FOOD_L.pudding, bake: 10, where: 'fridge', want: .24, day: 3 },
  mango: { name: '杨枝甘露', price: 22, img: FOOD_L.mango, bake: 12, where: 'fridge', want: .22, day: 5 },
  // from the menu plan, one new recipe a day after the first five
  cockbun: { name: '鸡尾包', price: 9, img: FOOD_L.cockbun, bake: 15, where: 'table', want: .3, day: 6 },
  lemontea: { name: '柠檬茶', price: 16, img: FOOD_L.lemontea, bake: 4, where: 'fridge', want: .3, day: 7 },
  malai: { name: '马拉糕', price: 10, img: FOOD_L.malai, bake: 20, where: 'table', want: .26, day: 8 },
  dpn: { name: '双皮奶', price: 16, img: FOOD_L.dpn, bake: 15, where: 'fridge', want: .24, day: 9 },
  eggwaf: { name: '鸡蛋仔', price: 14, img: FOOD_L.eggwaf, bake: 6, where: 'table', want: .3, day: 10 },
  yuen: { name: '鸳鸯', price: 18, img: FOOD_L.yuen, bake: 5, where: 'fridge', want: .26, day: 11 },
  // summer cold drinks (v1.21)
  redice: { name: '红豆冰', price: 16, img: FOOD_L.redice, bake: 5, where: 'fridge', want: .3, day: 13 },
  // Hong Kong bakery cakes (v1.34): baked by Kun / made at the bar, the showcase's best sellers
  papercake: { name: '纸包蛋糕', price: 12, img: FOOD_L.papercake, bake: 13, where: 'table', want: .28, day: 17, cake: true },
  swissroll: { name: '瑞士卷', price: 15, img: FOOD_L.swissroll, bake: 16, where: 'table', want: .24, day: 19, cake: true },
  mangopancake: { name: '芒果班戟', price: 18, img: FOOD_L.mangopancake, bake: 10, where: 'fridge', want: .26, day: 21, cake: true },
  lab1: { name: 'Lab 1', price: 12, img: FOOD_L.tart, bake: 10, where: 'table', want: .2, day: 999, lab: true },
  lab2: { name: 'Lab 2', price: 12, img: FOOD_L.tart, bake: 10, where: 'table', want: .2, day: 999, lab: true },
  lab3: { name: 'Lab 3', price: 12, img: FOOD_L.tart, bake: 10, where: 'table', want: .2, day: 999, lab: true },
  lab4: { name: 'Lab 4', price: 12, img: FOOD_L.tart, bake: 10, where: 'table', want: .2, day: 999, lab: true },
  lab5: { name: 'Lab 5', price: 12, img: FOOD_L.tart, bake: 10, where: 'table', want: .2, day: 999, lab: true },
  smoothie: { name: '芒果冰沙', price: 20, img: FOOD_L.smoothie, bake: 6, where: 'fridge', want: .26, day: 15 },
};
const PIDS = Object.keys(PRODUCTS);
const speedTag = p => { const b = PRODUCTS[p].bake; return b <= 6 ? ['快', '#2f6e56'] : b <= 12 ? ['中', '#c98a2a'] : ['慢', '#b8342c']; };   // prep speed shown in the panels
const TABLE_ALL = PIDS.filter(p => PRODUCTS[p].where === 'table'), FRIDGE_ALL = PIDS.filter(p => PRODUCTS[p].where === 'fridge');
const unlocked = p => W && (PRODUCTS[p].day === 1 || !!(W.known && W.known[p]));   // day-1 items, or researched at the design desk
const BATCH = 6;   // one pack of ingredients = one batch = 6 pieces
// raw ingredients sold at 荣叔's shop; one unit of each ingredient in the recipe = one batch (6 pieces)
const INGR = {
  flour: { name: '面粉', cost: 6 }, butter: { name: '牛油', cost: 7 }, egg: { name: '鸡蛋', cost: 5 }, sugar: { name: '砂糖', cost: 4 },
  tealeaf: { name: '茶叶', cost: 16 }, evap: { name: '淡奶', cost: 14 }, coconut: { name: '椰丝', cost: 8 }, melon: { name: '冬瓜蓉', cost: 10 },
  sesame: { name: '芝麻', cost: 6 }, redbean: { name: '红豆', cost: 10 }, milk: { name: '牛奶', cost: 8 }, mango: { name: '芒果', cost: 20 },
  sago: { name: '西米', cost: 8 }, coconutmilk: { name: '椰浆', cost: 10 }, lemon: { name: '柠檬', cost: 6 }, coffee: { name: '咖啡粉', cost: 14 },
};
// sold by the bag (one bag = several batches, 10% cheaper than buying them one by one), so you restock less often
const BAG_N = { flour: 10, butter: 6, egg: 6, sugar: 10, tealeaf: 8, evap: 6, coconut: 6, melon: 5, sesame: 10, redbean: 6, milk: 6, mango: 4, sago: 8, coconutmilk: 6, lemon: 8, coffee: 8 };
const bagCost = k => Math.round(INGR[k].cost * BAG_N[k] * 1.05 * (hasPerk('lin_buyer') ? .9 : 1) * (1 - .02 * (shopLv() - 1)) * supOff(k) * (W && W.today && W.today.rongSale ? .8 : 1));   // 荣叔's sale day: 20% off
const unitCost = p => RECIPE[p].reduce((a, k) => a + bagCost(k) / BAG_N[k], 0) / BATCH;   // ingredient cost of one piece
const RECIPE = { tart: ['flour', 'butter', 'egg'], bun: ['flour', 'butter', 'sugar'], coco: ['flour', 'butter', 'coconut'], wife: ['flour', 'melon', 'sesame'],
  tea: ['tealeaf', 'evap'], pudding: ['redbean', 'milk', 'egg'], mango: ['mango', 'sago', 'coconutmilk'],
  cockbun: ['flour', 'butter', 'coconut'], lemontea: ['tealeaf', 'lemon', 'sugar'], malai: ['flour', 'egg', 'sugar'], dpn: ['milk', 'egg', 'sugar'], eggwaf: ['flour', 'egg', 'evap'], yuen: ['tealeaf', 'coffee', 'evap'], redice: ['redbean', 'evap', 'sugar'], smoothie: ['mango', 'milk', 'sugar'], lab1: ['flour'], lab2: ['flour'], lab3: ['flour'], lab4: ['flour'], lab5: ['flour'], papercake: ['flour', 'egg', 'sugar'], swissroll: ['flour', 'egg', 'milk'], mangopancake: ['flour', 'mango', 'milk'] };
const batchCost = p => RECIPE[p].reduce((a, k) => a + INGR[k].cost, 0);
const batchesOf = p => Math.min(...RECIPE[p].map(k => W.ing[k] || 0));   // how many batches the pantry allows
const useIngr = p => { for (const k of RECIPE[p]) { W.ing[k]--; if (W.today && W.today.used) W.today.used[k] = (W.today.used[k] || 0) + 1; } };
const workDone = k => { if (k && W.today && W.today.work) W.today.work[k] = (W.today.work[k] || 0) + 1; };   // per person: batches made / tables served / customers rung up
const missingIngr = p => RECIPE[p].find(k => !(W.ing[k] > 0));
const ingrInUse = () => [...new Set(PIDS.filter(unlocked).flatMap(p => RECIPE[p]))];
const usedIn = k => PIDS.filter(p => unlocked(p) && RECIPE[p].includes(k));
// staff: Kun bakes, Lin runs the till (and the water bar while nobody else does). Wen / Shao are hired and given a post.
const HIRE = {
  wen: { name: '雯姐', day: 2, wage: 70, note: '冲饮手稳 · 唔等钱使 · 六点准时放工' },
  shao: { name: '阿少', day: 4, wage: 70, note: '安静体贴 · 好识招呼人 · 好似喺边度见过' },
  yao: { name: '耀仔', day: 25, wage: 75, note: '惠姐外甥 · 读过烘焙课 · 帮坤伯焗多一盘' },
  qing: { name: '阿青', day: 13, wage: 55, note: '莲姨外甥女 · 中六 · 放学后上岗 · 冰饮快' },
  temp: { name: '', day: 1, wage: 50, note: '', temp: true },   // today's part-timer (filled in each morning from TEMPS)
};
// part-timers (打工人): a different one turns up each day; hired for today only, cheaper, no levels or affection
const TEMPS = [
  { name: '学生阿明', ci: 3, wage: 45, speed: .9, note: '中五学生放学兼职 · 手脚快' },
  { name: '新鲜人阿乐', ci: 17, wage: 50, speed: .95, note: '刚毕业搵紧工 · 先嚟帮手' },
  { name: '退休浩叔', ci: 10, wage: 50, speed: 1.1, note: '退休司机 · 做嘢稳阵唔赶' },
  { name: '背包客Tom', ci: 15, wage: 55, speed: 1, note: '打工换宿 · 识讲英文' },
  { name: '师奶兼职', ci: 8, wage: 50, speed: 1, note: '街坊阿姨 · 识好多熟客' },
  { name: '叛逆仔阿威', ci: 21, wage: 40, speed: 1.15, note: '暑期工 · 慢慢嚟' },
];
const POSTS = { bake: { name: '烘焙', desc: '帮坤伯焗多一盘' }, bar: { name: '水吧', desc: '冲奶茶、做糖水' }, serve: { name: '招待', desc: '卡座点餐、上菜、收台' }, take: { name: '外卖窗', desc: '对着街卖' }, clean: { name: '打扫', desc: '扫地、执垃圾、抹地' } };
const COMBOS = [   // bought together -> a little extra (the customer is happier too)
  { a: 'tart', b: 'tea', name: '蛋挞奶茶', bonus: 3 },
  { a: 'bun', b: 'tea', name: '菠萝包奶茶', bonus: 3 },
  { a: 'coco', b: 'pudding', name: '椰挞布丁', bonus: 4 },
  { a: 'eggwaf', b: 'redice', name: '鸡蛋仔红豆冰', bonus: 4 },
  { a: 'mango', b: 'redice', name: '甘露红豆冰', bonus: 4 },
];
// shop upgrades in the books: each has 3 levels (W.up[k] = level 0..3), every level costs more and does more
const UPGRADES = {
  till: { lv: [['新收银机', 300, '收银快四成'], ['双屏收银机', 600, '收银快五成'], ['拍卡机', 1000, '收银快六成']] },
  oven: { lv: [['双层烤盘', 400, '坤伯出炉快近一倍'], ['三层层炉', 800, '出炉再快一成'], ['旋转烤炉', 1400, '出炉快近三倍']] },
  sign: { day: 5, lv: [['霓虹招牌', 500, '路过的人多两成进店'], ['大霓虹灯', 900, '多三成进店'], ['灯箱门面', 1500, '多四成进店']] },
  fridge: { lv: [['双门雪柜', 400, '水吧饮品甜品快两成'], ['商用冷柜', 800, '快三成'], ['急冻柜', 1300, '快四成']] },
  tea: { lv: [['新撞茶壶', 300, '每杯饮品贵 $1'], ['铜茶壶', 600, '每杯贵 $2'], ['手冲茶具', 1000, '每杯贵 $3']] },
  ac: { lv: [['冷气机', 500, '客人肯多等一成半'], ['大冷气', 900, '多等三成'], ['变频冷气', 1400, '多等四成半']] },
  music: { lv: [['收音机', 250, '美观 +2'], ['点唱机', 600, '美观 +4'], ['黑胶唱机', 1000, '美观 +6']] },
  ads: { lv: [['街坊传单', 200, '客流 +5%'], ['报纸广告', 500, '客流 +10%'], ['网上推介', 900, '客流 +15%']] },
};
const upLv = k => +(W.up[k] || 0);   // old saves stored true = level 1
const priceOf0 = p => PRODUCTS[p].price + (PRODUCTS[p].where === 'fridge' ? upLv('tea') + (hasPerk('wen_pull') ? 1 : 0) : 0) + (p === 'tart' && hasPerk('kun_tart') ? 2 : 0) + (PRODUCTS[p].where === 'table' && hasPerk('yao_choc') ? 1 : 0);
const priceOf = p => Math.max(1, Math.round(priceOf0(p) * priceTier().mult * (promoOn('ice') && PRODUCTS[p].where === 'fridge' ? .8 : 1)));   // the day's price tier
const SHELF_COST = 250;
const DAILY = { rent: 100, kun: 70, lin: 60 };
const rentToday = () => !W ? DAILY.rent : R(DAILY.rent * (1 + Math.min(1, .12 * Math.floor((W.day - 1) / MONTH_DAYS))) + 80 * expandLv() + (W.xk ? 40 : 0) + (W.xf ? 30 : 0));   // the landlord raises it every month (up to double); a bigger shop costs more
const SEAT_FEE = 3;   // 茶位: every booth guest pays it; quick service also earns a tip (more with a higher-level waiter)
// staff ability: level 1..5, bought with points (earned every day: 10 + 1 per guest served, +15 per new recipe).
// each level: the job goes 8% faster, wage +15/day, affection +1 (a short scene plays)
const LV_MAX = 5, LV_COST = [0, 0, 30, 70, 120, 190], LV_WAGE = 15;
// star abilities: at Lv3 and Lv5 each person learns one of two new skills (the player picks)
const PERKS = {
  kun: { 3: [['kun_batch', '批量出炉', '每盘多做 2 件'], ['kun_tart', '招牌蛋挞', '蛋挞贵 $2']], 5: [['kun_master', '老师傅', '名气每晚 +0.1'], ['kun_thrift', '慳料', '两成机会唔使原料']] },
  lin: { 3: [['lin_buyer', '进货高手', '原料九折'], ['lin_calm', '安抚客人', '客人肯等多一成半']], 5: [['lin_org', '排班达人', '全店做嘢快 5%'], ['lin_pack', '包装快手', '收银快两成']] },
  wen: { 3: [['wen_pull', '撞茶高手', '饮品甜品贵 $1'], ['wen_fast', '快手出杯', '水吧快一成半']], 5: [['wen_sign', '招牌冻饮', '饮品甜品多三成人买'], ['wen_care', '细心', '卡座小费 +$1']] },
  yao: { 3: [['yao_fast', '手快', '烘焙快一成半'], ['yao_steady', '稳定出品', '名气每晚 +0.05']], 5: [['yao_choc', '融合点心', '包点饼食贵 $1'], ['yao_save', '慳料', '一成半机会唔使原料']] },
  qing: { 3: [['qing_menu', '手绘菜单', '美观 +3'], ['qing_ice', '冰饮专长', '冻饮多两成人买']], 5: [['qing_promo', '宣传鬼才', '促销效果多五成'], ['qing_student', '学生套餐', '客流 +6%']] },
  shao: { 3: [['shao_lure', '招客', '客流 +8%'], ['shao_memo', '记性好', '卡座小费 +$2']], 5: [['shao_fans', '街坊人缘', '外卖客多一倍'], ['shao_run', '飞毛腿', '招待走快三成']] },
};
const SPECIALS = {   // [id, name, what it does, ★ cost] — needs Lv4
  lin: ['lin_auto', '自动进货', '原料快用完时随时自动补齐', 600],
  kun: ['kun_plan', '自动排产', '每天早上按昨天卖得好的自动定主打', 250],
  wen: ['wen_tidy', '收台快手', '卡座吃完自动收拾干净', 250],
  shao: ['shao_clean', '顺手打扫', '空闲时顺手打扫，店里脏得慢', 300],
  qing: ['qing_shelf', '自动摆货', '空着的货架层自动摆上要卖的', 300],
  yao: ['yao_rd', '自动研发', '每天早上自动研发当天的新品', 400],
};
const SK_LV = 4, hasSk = id => { const k = id.split('_')[0]; return !!(W && W.sk && W.sk[id] === true) && (!HIRE[k] || W.staff[k].hired); };   // owned and switched on
const hasPerk = id => { if (!W || !W.perks) return false; const k = id.split('_')[0]; return (W.perks[k] || []).includes(id) && (!HIRE[k] || W.staff[k].hired); };
const perkInfo = id => { for (const k in PERKS) for (const lv in PERKS[k]) for (const q of PERKS[k][lv]) if (q[0] === id) return q; return null; };
const LV_SKILL = { kun: '烘焙', lin: '包装、冲饮', wen: '水吧', shao: '招待、外卖', qing: '冰饮', yao: '烘焙' };
const lvOf = k => (W.lv && W.lv[k]) || 1;
const lvSpeed = k => (k === 'temp' ? (HIRE.temp.speed || 1) : k ? 1 - .08 * (lvOf(k) - 1) : 1) * (hasPerk('lin_org') ? .95 : 1) * (k === 'wen' && hasPerk('wen_fast') ? .85 : 1) * (k === 'qing' ? .9 : 1) * (k === 'yao' && hasPerk('yao_fast') ? .85 : 1) * (k === 'shao' && W.today && W.today.shaoSlowUntil > clockOpen ? 1.4 : 1) * (W && W.xk && (k === 'kun' || k === 'yao' || (W.staff[k] && W.staff[k].post === 'bake')) ? .85 : 1);   // 阿少 distracted (小剧场)   // time multiplier for that person's jobs
// four seasons of 12 days, then a new year; each season shifts what people want
const SEASONS = [
  { name: '春', full: '春天', want: {} },
  { name: '夏', full: '夏天', hello: '夏天到！冻饮同糖水多人买', want: { redice: 1.8, smoothie: 1.8, mango: 1.7, lemontea: 1.7, pudding: 1.3, yuen: 1.3, tea: 1.2, malai: .8, wife: .8 } },
  { name: '秋', full: '秋天', hello: '秋天到！饼食同包点好卖', want: { wife: 1.5, cockbun: 1.4, malai: 1.4, eggwaf: 1.2, mango: .8 } },
  { name: '冬', full: '冬天', hello: '冬天到！热嘢同炖奶多人要', want: { dpn: 1.7, yuen: 1.3, tea: 1.3, malai: 1.2, mango: .5, lemontea: .6, redice: .5, smoothie: .4 } },
];
const seasonIdx = day => Math.floor((day - 1) / SEASON_DAYS) % 4, seasonOf = day => SEASONS[seasonIdx(day)], yearOf = day => Math.floor((day - 1) / (SEASON_DAYS * 4)) + 1;
// ---- operations core (v1.20): weather, price tier, stock tier
const WEATHER = {
  sun: { name: '晴天', rate: 1 },
  cool: { name: '秋高气爽', rate: 1.1 },
  hot: { name: '好热', rate: .95, fridge: 1.5, table: .9 },
  drizzle: { name: '微雨', rate: .96, dine: 1.12, rain: 1 },
  rain: { name: '落雨', rate: .9, dine: 1.3, rain: 2 },
  storm: { name: '暴雨', rate: .8, dine: 1.5, rain: 3 },
  snow: { name: '落雪', rate: .86, fridge: .75, table: 1.2, dine: 1.3, snow: true },
  cold: { name: '好冻', rate: .88, fridge: .7, table: 1.25, dine: 1.3 },
};
const SEASON_WX = [['sun', 'sun', 'sun', 'cool', 'cool', 'sun', 'drizzle', 'rain'], ['hot', 'hot', 'sun', 'sun', 'hot', 'sun', 'storm', 'drizzle'], ['cool', 'cool', 'sun', 'sun', 'cool', 'sun', 'drizzle'], ['cold', 'cold', 'sun', 'cold', 'sun', 'snow']];   // about one wet day in four or five
const wxOf = () => WEATHER[(W && W.today && W.today.wx) || 'sun'] || WEATHER.sun;
const PRICE_TIERS = [{ name: '亲民', mult: .85, rate: 1.15, desc: '平啲，多人嚟' }, { name: '标准', mult: 1, rate: 1, desc: '街坊价' }, { name: '精品', mult: 1.25, rate: .85, desc: '贵啲，人少啲' }];
const STOCK_TIERS = [{ name: '少量', desc: '卖到差唔多先补，剩货少' }, { name: '标准', desc: '照平时' }, { name: '多备', desc: '厨房多备一盘，唔怕卖晒，但隔夜剩货多' }];
const priceTier = () => PRICE_TIERS[W && W.priceTier !== undefined ? W.priceTier : 1];
const stockTier = () => (W && W.stockTier !== undefined ? W.stockTier : 1);
// promotions (one a day, chosen in the morning plan; paid up front)
const PROMOS = [
  { id: 'none', name: '无', cost: 0, desc: '今日唔搞促销' },
  { id: 'pri', name: '主打推介', cost: 30, desc: '主打的货多五成人买' },
  { id: 'combo', name: '套餐加码', cost: 30, desc: '套餐优惠加倍，顺手加购多一倍' },
  { id: 'ice', name: '冻饮八折', cost: 40, desc: '冻饮多六成人买，平两成' },
];
const promoOn = id => !!(W && W.today && W.today.promo === id);
const promoWant = p => { let m = promoOn('pri') && W.plan[p] === 'pri' ? 1.5 : promoOn('ice') && PRODUCTS[p].where === 'fridge' ? 1.6 : 1;
  if (m > 1 && hasPerk('qing_promo')) m = 1 + (m - 1) * 1.5; return m * (hasPerk('qing_ice') && PRODUCTS[p].where === 'fridge' ? 1.2 : 1); };
// ---- v1.22 expansion: the empty shop next door becomes a dining room; each level adds two booths there
const EXPAND = [
  { name: '打通隔壁', cost: 2500, day: 10, desc: '隔壁变堂食区，多两组卡座' },
  { name: '加卡座', cost: 1200, desc: '隔壁再多两组卡座' },
  { name: '再加卡座', cost: 1600, desc: '再多两组卡座' },
  { name: '坐满隔壁', cost: 2200, desc: '隔壁坐满八组卡座' },
];
const ROOMS = [   // [flag, name, cost, what it does]
  ['xk', '扩建厨房', 2000, '加烤炉和备料台：烘焙快一成半'],
  ['xf', '扩建前台', 1800, '多一个收银口：结账快两成半'],
];
const NEXT_BOOTHS = [[344, 196], [344, 144], [420, 196], [420, 144], [496, 196], [496, 144], [572, 196], [572, 144]];   // booth X, y0 next door, in the order they open
const expandLv = () => (W && W.expand) || 0;
// shop level: grows with everyone you've served; each level makes ingredients 2% cheaper and opens a supplier
const SHOP_LV = [0, 300, 800, 1600, 3000];
const shopLv = () => { const n = (W && W.total && W.total.served) || 0; let l = 0; for (const t of SHOP_LV) if (n >= t) l++; return l; };
const SUPPLIERS = {
  hui: { name: '惠姐', lv: 2, cost: 300, ks: ['mango', 'lemon', 'redbean', 'coconut', 'coconutmilk', 'sesame', 'melon'], off: .85, desc: '生果、豆类、椰制品、芝麻 八五折' },
  cheng: { name: '阿澄', lv: 3, cost: 300, ks: ['tealeaf', 'coffee'], off: .85, desc: '茶叶、咖啡粉 八五折' },
};
const supOff = k => { if (!W || !W.sup) return 1; for (const s in SUPPLIERS) if (W.sup[s] && SUPPLIERS[s].ks.includes(k)) return SUPPLIERS[s].off; return 1; };
// ---- v1.31 dirt: customers and diners leave crumbs, wrappers and (in the rain / snow) muddy footprints; staff on 打扫 clean it up
const dirtOf = () => (W && W.dirt) || 0;
function dirtAdd(v) { if (!W) return; W.dirt = Math.min(100, dirtOf() + v * (hasItem('bin') ? .75 : 1)); }
const mudOf = () => { const wx = wxOf(); return ([0, .35, .7, 1.1][wx.rain || 0] + (wx.snow ? .9 : 0)) * (hasItem('doormat') ? .4 : 1); };   // tracked in per customer
const dirtSlow = () => 1 - Math.max(0, dirtOf() - 30) / 140;   // a dirty shop puts people off (×0.5 when filthy)
// ---- v1.32 wealth: how dear an item each kind of customer will pay for, and how much they spend in one visit
const WEALTH = { '小男孩': [10, 20], '小女孩': [10, 20], '女学生': [16, 34], '中学男生': [16, 34], '叛逆学生': [14, 30], '婆婆': [18, 36], '拐杖阿伯': [18, 36], '背包客': [18, 40], '新鲜人': [18, 40],
  '街坊阿姨': [22, 60], '妈妈': [22, 60], '爸爸': [22, 60], '精壮工人': [22, 64], '日系男生': [22, 56], '韩系女生': [22, 56], '潮人（男）': [24, 60], '潮人（女）': [24, 60],
  '上班族': [28, 80], '白领姐姐': [28, 80], '外国游客': [30, 90], '严肃老师': [28, 70], '美艳人妻': [99, 150], '西装金融男': [99, 160] };
const wealthOf = ci => WEALTH[GUEST_DEF[ci] && GUEST_DEF[ci].name] || [24, 60];
const wealthStars = ci => { const m = wealthOf(ci)[1]; return m < 25 ? 1 : m < 45 ? 2 : m < 70 ? 3 : m < 100 ? 4 : 5; };
// gifts: when one kind of customer has been happy here often enough, one of them brings the owner something for the shop
const GIFT_AT = 14;   // gifts only from regulars at the top level (= LOYAL_STORY)
// signature showcase (the glass case on the front counter): one item a day, shown from kitchen stock
const showcaseOk = p => unlocked(p) && (PRODUCTS[p].where === 'table' || PRODUCTS[p].cake || PRODUCTS[p].lab);
const TAGS = { hurry: { name: '赶时间' }, chill: { name: '坐耐' } };
const wantOf = p => PRODUCTS[p].want * (seasonOf(W.day).want[p] || 1) * (PRODUCTS[p].where === 'fridge' && hasPerk('wen_sign') ? 1.3 : 1) * (wxOf()[PRODUCTS[p].where] || 1) * promoWant(p) * (W && W.showcase === p && W.stock && W.stock[p] > 0 ? 1.4 : 1);   // the signature showcase item
const OPEN_LEN = 180, SEASON_DAYS = 12, MONTH_DAYS = 4, PARENTS_DAY = 6;   // business 09:00-19:00 in 3 minutes; spring = 3 months of 4 days
const SHELF_IDS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
const EXTRA_SHELF = { T7: 800, T8: 1200, T9: 1500, T10: 1800 }, EXTRA_NEED = { T8: 1, T9: 1, T10: 1 };   // T8-T10 stand next door: open it up first   // extra display spot bought in 装修: in front of the door (the only free place on the way to the till)
// decor shop: better shelves (more per layer + nicer), wallpapers, booth styles. Beauty brings more customers.
const SHELF_TIERS = [{ name: '云石双层架', cap: 6, beauty: 0 }, { name: '柚木铜边架', cost: 350, cap: 8, beauty: 2 }, { name: '玻璃展示柜', cost: 800, cap: 10, beauty: 4 }];
const WALLS = {
  mint: { name: '薄荷绿', cost: 0, wall: '#8fd6b8', wallD: '#7fc8a9', low: '#3f8a6e', beauty: 0 },
  cream: { name: '奶油条纹', cost: 300, wall: '#f2e2bc', wallD: '#e4cf9f', low: '#8a5a3a', lowWood: true, beauty: 2, stripe: true },
  rose: { name: '粉红碎花', cost: 450, wall: '#f4cdc8', wallD: '#e8b4ae', low: '#a84e5a', beauty: 3, floral: true },
  jade: { name: '墨绿金线', cost: 600, wall: '#e9dcba', wallD: '#ddcfa8', low: '#36604f', beauty: 4, rail: true },
  tile: { name: '白瓷砖墙', cost: 500, wall: '#f6f3ec', wallD: '#ddd8cc', low: '#2f5a4a', beauty: 3, tiles: true },
  teak: { name: '柚木墙板', cost: 700, wall: '#f0dfb8', wallD: '#e3cfa2', low: '#a26a3c', lowWood: true, beauty: 5 },
};
const FLOORS = {   // 装修 → 地板: a different pattern / material each, not only a colour
  peach: { name: '暖色格仔', cost: 0, A: '#e7bd96', B: '#dcac86', dots: true, beauty: 0 },
  bw: { name: '黑白格', cost: 400, A: '#f2ede2', B: '#3a363c', beauty: 3 },
  plank: { name: '柚木地板', cost: 550, A: '#b8824c', B: '#a87444', plank: true, beauty: 4 },
  mosaic: { name: '小砖马赛克', cost: 500, A: '#f1ece0', B: '#5fa58a', mosaic: true, beauty: 4 },
  terrazzo: { name: '水磨石地', cost: 800, A: '#e3dccf', B: '#e3dccf', chips: true, beauty: 5 },
};
// 整套搭配: wall + floor + counter + booth that go together; the whole set in the shop = beauty bonus
const THEMES = [
  { name: '黑白格茶餐厅', wall: 'tile', floor: 'bw', counter: 'terrazzo', booth: 'red', bonus: 4, note: '白瓷砖 · 黑白格 · 水磨石柜 · 红卡座' },
  { name: '柚木老铺', wall: 'teak', floor: 'plank', counter: 'teak', booth: 'brown', bonus: 4, note: '柚木墙板 · 柚木地板 · 深色柜 · 啡卡座' },
  { name: '粉红碎花', wall: 'rose', floor: 'mosaic', counter: 'mint', booth: 'deluxe', bonus: 5, note: '碎花墙 · 小砖马赛克 · 薄荷柜 · 高级卡座' },
  { name: '墨绿金线', wall: 'jade', floor: 'terrazzo', counter: 'red', booth: 'green', bonus: 5, note: '墨绿金线 · 水磨石地 · 红漆金边 · 绿卡座' },
];
const DECOR_SRC = () => ({ wall: [WALLS, 'walls', 'mint'], booth: [BOOTH_STYLES, 'booths', 'green'], counter: [COUNTER_STYLES, 'counters', 'oak'], floor: [FLOORS, 'floors', 'peach'] });
const themeOn = () => THEMES.find(T => ['wall', 'floor', 'counter', 'booth'].every(k => ((W && W.decor && W.decor[k]) || DECOR_SRC()[k][2]) === T[k])) || null;
const themeCost = T => ['wall', 'floor', 'counter', 'booth'].reduce((a, k) => { const [L, o] = DECOR_SRC()[k]; return a + (((W.decor[o] || {})[T[k]]) ? 0 : L[T[k]].cost); }, 0);
const BOOTH_STYLES = {
  green: { name: '绿皮卡座', cost: 0, leather: ['#4f9a7c', '#3f8a6e', '#2f6e56'], beauty: 0 },
  red: { name: '红皮卡座', cost: 300, leather: ['#d0574a', '#b8473c', '#963830'], beauty: 2 },
  brown: { name: '啡皮卡座', cost: 300, leather: ['#b07a4e', '#94643e', '#764c2e'], beauty: 2 },
  deluxe: { name: '高级卡座', cost: 900, leather: ['#8a3e62', '#743252', '#5a2440'], beauty: 5, deluxe: true, tip: 2 },
};
const COUNTER_STYLES = {   // 装修 → 前台: the counter cabinets (and the top)
  oak: { name: '原木柜台', cost: 0, cab: ['#e2a668', '#c27c40', '#8c532c'], top: ['#d99a5c', '#b8743c', '#93582c'], beauty: 0 },
  teak: { name: '柚木深色', cost: 350, cab: ['#b07444', '#8a5630', '#6a3e20'], top: ['#7a4a2e', '#5a3820', '#40281a'], beauty: 2 },
  mint: { name: '薄荷漆柜', cost: 450, cab: ['#a6dcc6', '#7fc0a6', '#5a9a80'], top: ['#f2ead2', '#dccfab', '#c2b48c'], beauty: 3 },
  red: { name: '红漆金边', cost: 600, cab: ['#d0574a', '#b0443a', '#86322c'], top: ['#e8c060', '#c99a38', '#a07a28'], beauty: 4 },
  terrazzo: { name: '水磨石柜', cost: 900, cab: ['#e6dccb', '#cdbfa8', '#a89a82'], top: ['#3f6b5a', '#2f5a4a', '#24463a'], beauty: 6 },
};
// beauty milestones: each one is a real perk (and an achievement)
const BEAUTY_STEPS = [
  { at: 6, name: '有啲样', perk: '客人肯等多两成' },
  { at: 12, name: '打卡热点', perk: '卡座小费 +$1，客流 +5%' },
  { at: 20, name: '街知巷闻', perk: '客流再 +10%，名气每晚 +0.1' },
];
const beautyLv = () => BEAUTY_STEPS.filter(s => beauty() >= s.at).length;
const patience = () => (beautyLv() >= 1 ? 1.2 : 1) * (1 + .15 * upLv('ac')) * (hasPerk('lin_calm') ? 1.15 : 1) * (1 + comfort() * .005) * (1 - Math.max(0, dirtOf() - 40) / 200);   // how much longer guests are willing to wait
const soldTotal = p => ((W.stats || {}).sold || {})[p] || 0;
// achievements: checked about once a second; reward points (and sometimes money) once
// ---- v1.23 decor items (装修 → 摆设): plants and festive pieces stand on the floor (movable), wall pieces hang on the walls.
// Comfort is its own number: every point = +1% customers and +0.5% patience. Festive pieces count double in their season.
const DECOR_ITEMS = {
  pothos: { name: '绿萝', cat: 'plant', plant: 'pothos', pot: 'terracotta', cost: 60, comfort: 2, beauty: 1 },
  bamboo: { name: '富贵竹', cat: 'plant', plant: 'bamboo', pot: 'cream', cost: 90, comfort: 2, beauty: 1 },
  money: { name: '发财树', cat: 'plant', plant: 'money', pot: 'celadon', cost: 140, comfort: 3, beauty: 2 },
  rubber: { name: '橡皮树', cat: 'plant', plant: 'rubber', pot: 'charcoal', cost: 160, comfort: 4, beauty: 1 },
  monstera: { name: '龟背竹', cat: 'plant', plant: 'monstera', pot: 'cream', cost: 200, comfort: 4, beauty: 2 },
  clock: { name: '旧挂钟', cat: 'wall', cost: 150, comfort: 1, beauty: 2 },
  calendar: { name: '月份牌', cat: 'wall', cost: 180, comfort: 1, beauty: 3 },
  photo: { name: '街坊合照', cat: 'wall', cost: 120, comfort: 2, beauty: 1 },
  neon: { name: '霓虹灯牌', cat: 'wall', cost: 400, comfort: 1, beauty: 4 },
  kumquat: { name: '年桔', cat: 'season', season: 0, cost: 180, comfort: 3, beauty: 2 },
  icebucket: { name: '汽水冰桶', cat: 'season', season: 1, cost: 180, comfort: 3, beauty: 2 },
  lantern: { name: '中秋灯笼', cat: 'season', season: 2, cost: 200, comfort: 3, beauty: 3 },
  xmas: { name: '圣诞树', cat: 'season', season: 3, cost: 300, comfort: 4, beauty: 4 },
  bin: { name: '垃圾桶', cat: 'clean', cost: 120, comfort: 1, beauty: 0, note: '污糟慢两成半' },
  doormat: { name: '门口地毯', cat: 'clean', cost: 150, comfort: 1, beauty: 1, note: '雨天少六成泥' },
  vacuum: { name: '吸尘机', cat: 'clean', cost: 600, comfort: 0, beauty: 0, note: '营业时自己慢慢吸' },
  luckycat: { name: '招财猫', cat: 'gift', cost: 0, comfort: 2, beauty: 3, note: '熟客送嘅' },
  fishtank: { name: '小鱼缸', cat: 'gift', cost: 0, comfort: 3, beauty: 2 }, aroma: { name: '香薰烛台', cat: 'gift', cost: 0, comfort: 3, beauty: 2 },
  easel: { name: '手绘海报架', cat: 'gift', cost: 0, comfort: 2, beauty: 3 }, basketball: { name: '签名篮球', cat: 'gift', cost: 0, comfort: 2, beauty: 2 },
  plane: { name: '纸飞机模型', cat: 'gift', cost: 0, comfort: 2, beauty: 2 }, pinwheel: { name: '彩色风车', cat: 'gift', cost: 0, comfort: 2, beauty: 3 },
  record: { name: '黑胶唱片机', cat: 'gift', cost: 0, comfort: 3, beauty: 3 }, mirror: { name: '复古立镜', cat: 'gift', cost: 0, comfort: 2, beauty: 3 },
  globe: { name: '地球仪', cat: 'gift', cost: 0, comfort: 2, beauty: 3 }, suitcase: { name: '旧行李箱', cat: 'gift', cost: 0, comfort: 2, beauty: 2 },
  chili: { name: '一盆辣椒', cat: 'gift', cost: 0, comfort: 3, beauty: 2 }, vase: { name: '插花花瓶', cat: 'gift', cost: 0, comfort: 3, beauty: 3 },
  bunny: { name: '兔子公仔', cat: 'gift', cost: 0, comfort: 3, beauty: 2 }, chime: { name: '风铃架', cat: 'gift', cost: 0, comfort: 3, beauty: 2 },
  skate: { name: '涂鸦滑板', cat: 'gift', cost: 0, comfort: 2, beauty: 2 }, screen: { name: '书法屏风', cat: 'gift', cost: 0, comfort: 2, beauty: 4 },
  radio: { name: '古董收音机', cat: 'gift', cost: 0, comfort: 3, beauty: 3 },
  bonsai: { name: '小盆景', cat: 'gift', cost: 0, comfort: 3, beauty: 2, note: '熟客送嘅' },
  banner: { name: '锦旗「街坊至爱」', cat: 'wall', gift: true, cost: 0, comfort: 1, beauty: 4, note: '熟客送嘅' },
  card: { name: '手写感谢卡', cat: 'wall', gift: true, cost: 0, comfort: 2, beauty: 1, note: '熟客送嘅' },
};
const ITEM_CATS = [['plant', '植物'], ['wall', '墙饰'], ['season', '节日'], ['clean', '清洁'], ['air', '电器'], ['gift', '礼物'], ['combo', '搭配']];
const DECOR_SETS = [   // [name, items, comfort]: the whole set in the shop = the bonus (gifts from regulars make the best sets)
  ['绿意盎然', ['pothos', 'bamboo', 'monstera'], 3], ['老香港', ['clock', 'calendar', 'photo'], 4], ['企理干净', ['bin', 'doormat', 'vacuum'], 3],
  ['霓虹夜冰室', ['neon', 'icebucket'], 3], ['招财进宝', ['money', 'luckycat'], 6], ['盆景雅座', ['rubber', 'bonsai'], 5], ['街坊至爱', ['banner', 'card', 'photo'], 8]];
const setDone = S => S[1].every(hasItem), setBonus = () => DECOR_SETS.filter(setDone).reduce((a, S) => a + S[2], 0);
const hasItem = id => !!(W && W.items && W.items[id]);
const inSeason = it => it.season === undefined || seasonIdx((W && W.day) || 1) === it.season;
const itemComfort = id => { const it = DECOR_ITEMS[id]; return it.cat === 'season' ? (inSeason(it) ? it.comfort * 2 : Math.floor(it.comfort / 2)) : it.comfort; };
function comfort() {   // fan 2 → air conditioner 4 / 6 / 8, plus every item
  if (!W) return 0; let c = (upLv('ac') ? 2 + 2 * upLv('ac') : 2) + Object.keys(W.keepsakes || {}).length;   // each keepsake from a regular: +1
  for (const id in DECOR_ITEMS) if (hasItem(id)) c += itemComfort(id);
  return c + setBonus();
}
const festive = () => Object.keys(DECOR_ITEMS).filter(id => hasItem(id) && DECOR_ITEMS[id].cat === 'season' && inSeason(DECOR_ITEMS[id])).length;
const ACH = [
  { id: 'b6', name: '有啲样', desc: '美观度达到 6', test: () => beauty() >= 6, pts: 30 },
  { id: 'b12', name: '打卡热点', desc: '美观度达到 12', test: () => beauty() >= 12, pts: 60 },
  { id: 'b20', name: '街知巷闻', desc: '美观度达到 20', test: () => beauty() >= 20, pts: 100, money: 500 },
  { id: 'first', name: '开张大吉', desc: '第一天顺利收工', test: () => (W.stats.days || 0) >= 1, pts: 10 },
  { id: 'tart100', name: '蛋挞达人', desc: '累计卖出 100 个蛋挞', test: () => soldTotal('tart') >= 100, pts: 40 },
  { id: 'menu8', name: '款式多多', desc: '同一天卖出 8 款不同商品', test: () => (W.stats.bestKinds || 0) >= 8, pts: 50 },
  { id: 'serve50', name: '旺铺', desc: '一天招呼 50 位客人', test: () => (W.stats.bestServed || 0) >= 50, pts: 50 },
  { id: 'profit1k', name: '日进斗金', desc: '一天净赚 $1000', test: () => (W.stats.bestProfit || 0) >= 1000, pts: 60 },
  { id: 'rev10k', name: '万元户', desc: '累计收入 $10000', test: () => W.total.revenue >= 10000, pts: 80, money: 300 },
  { id: 'star', name: '五星冰室', desc: '一天平均口碑 4.8 星以上', test: () => (W.stats.bestAvg || 0) >= 4.8, pts: 50 },
  { id: 'tips', name: '小费王', desc: '累计收到小费 $300', test: () => (W.stats.tips || 0) >= 300, pts: 40 },
  { id: 'rd4', name: '研发起步', desc: '研发 4 款新品', test: () => Object.keys(RECIPES).filter(p => W.known[p]).length >= 4, pts: 40 },
  { id: 'rdall', name: '研发大师', desc: '研发全部新品', test: () => Object.keys(RECIPES).every(p => W.known[p]), pts: 120, money: 500 },
  { id: 'shelves', name: '满铺', desc: '开张全部货架', test: () => SHELF_IDS.every(id => !W.shelves[id].locked), pts: 40 },
  { id: 'team', name: '齐人', desc: '请齐雯姐同阿少', test: () => Object.keys(HIRE).filter(k => !HIRE[k].temp).every(k => W.staff[k].hired), pts: 30 },
  { id: 'lv3', name: '用心栽培', desc: '有员工升到 3 级', test: () => ['kun', 'lin', 'wen', 'shao'].some(k => lvOf(k) >= 3), pts: 40 },
  { id: 'lv5', name: '师徒情深', desc: '有员工升到 5 级', test: () => ['kun', 'lin', 'wen', 'shao'].some(k => lvOf(k) >= 5), pts: 80 },
  { id: 'glass', name: '玻璃展示柜', desc: '有一座玻璃展示柜', test: () => Object.values(W.decor.tier).some(t => t >= 2), pts: 30 },
  { id: 'deluxe', name: '贵宾卡座', desc: '换上高级卡座', test: () => W.decor.booth === 'deluxe', pts: 30 },
  { id: 'comfy1', name: '舒舒服服', desc: '舒适度到 10', test: () => comfort() >= 10, pts: 20 },
  { id: 'comfy2', name: '坐得耐', desc: '舒适度到 25', test: () => comfort() >= 25, pts: 40 },
  { id: 'comfy3', name: '比屋企仲舒服', desc: '舒适度到 40', test: () => comfort() >= 40, pts: 80, money: 300 },
  { id: 'jungle', name: '小森林', desc: '五种植物都摆齐', test: () => ['pothos', 'bamboo', 'money', 'rubber', 'monstera'].every(hasItem), pts: 40 },
  { id: 'festive', name: '过时过节', desc: '四季节日摆设都买齐', test: () => ['kumquat', 'icebucket', 'lantern', 'xmas'].every(hasItem), pts: 50 },
  { id: 'aircon', name: '叹冷气', desc: '风扇换成冷气机', test: () => upLv('ac') >= 1, pts: 15 },
];
function beauty() {
  const d = (W && W.decor) || {}; let b = ((WALLS[d.wall] || WALLS.mint).beauty) + ((BOOTH_STYLES[d.booth] || BOOTH_STYLES.green).beauty) + ((COUNTER_STYLES[d.counter] || COUNTER_STYLES.oak).beauty) + ((FLOORS[d.floor] || FLOORS.peach).beauty) + ((themeOn() || {}).bonus || 0) + 2 * upLv('music') + (hasPerk('qing_menu') ? 3 : 0);
  for (const id of SHELF_IDS) if (W.shelves[id] && !W.shelves[id].locked) b += SHELF_TIERS[(d.tier || {})[id] || 0].beauty;
  for (const id in DECOR_ITEMS) if (hasItem(id)) b += DECOR_ITEMS[id].beauty;
  if (W && W.showcase && W.stock && W.stock[W.showcase] > 0) b += 2;   // a full showcase looks good
  return b;
}
const SHELF_NO = { T1: 1, T3: 2, T4: 3, T5: 4, T6: 5, T2: 6, T7: 7, T8: 8, T9: 9, T10: 10 };
const LAYER_NAME = ['上层', '下层'];
// customers drawn from these looks (6 / 7 are mum and dad: kept for the parents' visit)
const CUST_POOL = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
// each kind of guest: likes (weight x the item's base popularity), extra = buys more, and lines in their own voice
const PERSONA = {
  '上班族': { likes: { tea: 3, bun: 2 }, want: ['赶时间，{p}一个唔该', '早餐就{p}啦', '{p}，打包，快啲'], happy: ['够快，好！', '返工有力喇'], miss: ['冇{p}？算啦…'] },
  '白领姐姐': { likes: { pudding: 3, mango: 3, tart: 2 }, want: ['今日想食啲甜嘅…{p}', '{p}拍照应该好靓'], happy: ['下次同同事嚟'], miss: ['冇{p}…有啲失望'] },
  '女学生': { likes: { mango: 3, pudding: 2, coco: 2, eggwaf: 3, lemontea: 2 }, want: ['我要{p}！', '同学话{p}好好味'], happy: ['好好味呀～'], miss: ['冇{p}啊…'] },
  '中学男生': { likes: { bun: 3, tea: 2, eggwaf: 3, lemontea: 2 }, want: ['{p}可唔可以平啲？', '饿到扁，{p}！'], happy: ['正！'], miss: ['咁都冇…'] },
  '小男孩': { likes: { tart: 3, bun: 2, coco: 2, eggwaf: 3 }, want: ['我要{p}！我要{p}！'], happy: ['好味！'], miss: ['哇——冇{p}…'] },
  '小女孩': { likes: { pudding: 3, tart: 2, mango: 2 }, want: ['妈咪我要{p}', '{p}系唔系甜甜㗎？'], happy: ['甜甜嘅～'], miss: ['冇{p}…'] },
  '妈妈': { likes: { tart: 2, pudding: 2, wife: 1.5 }, want: ['囡囡想食{p}', '买个{p}俾BB'], happy: ['仔女都钟意'], miss: ['冇{p}，小朋友会喊㗎'] },
  '爸爸': { likes: { tea: 3, bun: 2, wife: 2 }, want: ['一份{p}，再嚟杯奶茶'], happy: ['抵食！'], miss: ['冇{p}？咁就其他啦'] },
  '街坊阿姨': { likes: { wife: 3, bun: 2, tart: 2, malai: 3, cockbun: 2 }, want: ['后生女，{p}今日新唔新鲜呀？', '{p}几钱呀？'], happy: ['我话俾成条街知！'], miss: ['冇{p}？以前成日有㗎！'] },
  '婆婆': { likes: { wife: 3, tea: 2, pudding: 2, malai: 3, dpn: 3 }, want: ['乖，俾个{p}婆婆', '{p}软唔软呀？'], happy: ['有以前嘅味道'], miss: ['冇{p}咩…'] },
  '拐杖阿伯': { likes: { tea: 3, bun: 2, wife: 2, yuen: 2, malai: 2 }, want: ['照旧，{p}', '{p}，奶茶走甜'], happy: ['几好几好'], miss: ['而家啲铺头…冇{p}'] },
  '潮人（男）': { likes: { coco: 3, mango: 2, tea: 2 }, want: ['Yo，{p}一个', '{p}好有feel'], happy: ['Chill！'], miss: ['冇{p}？唔够潮'] },
  '潮人（女）': { likes: { mango: 3, pudding: 2, coco: 2 }, want: ['今日cheat day，{p}！', '{p}影相一流'], happy: ['好正！打卡！'], miss: ['冇{p}点打卡…'] },
  '外国游客': { likes: { tart: 3, tea: 3, bun: 2, eggwaf: 3, yuen: 2 }, want: ['{p}, please！唔该！', 'Is this {p}? 一个！'], happy: ['So good！好味！'], miss: ['No {p}? Oh…'] },
  '背包客': { likes: { bun: 3, tart: 2, tea: 2 }, want: ['Cheap and good！{p}！', '{p}，one please'], happy: ['Best in HK！'], miss: ['Sold out? 冇{p}…'] },
  '精壮工人': { likes: { bun: 3, tea: 3, wife: 2, yuen: 3, cockbun: 2 }, extra: 1, want: ['老板，三个{p}！', '开工前要{p}顶肚'], happy: ['饱！开工！'], miss: ['冇{p}点开工呀'] },
  '新鲜人': { likes: { tart: 2, tea: 2, coco: 2 }, want: ['第一份人工，请自己食{p}', '{p}…应该唔会迟到挂'], happy: ['加油！听日继续！'], miss: ['冇{p}…今日真系唔顺'] },
  '美艳人妻': { likes: { mango: 3, pudding: 3, coco: 2 }, want: ['{p}唔好太甜呀，要keep fit', '老公话{p}好食'], happy: ['环境几好喎～'], miss: ['冇{p}？咁可惜'] },
  '韩系女生': { likes: { mango: 3, pudding: 2, tea: 2, lemontea: 3, dpn: 2 }, want: ['{p}～好可爱！', '欧尼推介{p}！'], happy: ['好好味～'], miss: ['冇{p}…呜'] },
  '日系男生': { likes: { tea: 3, tart: 2, wife: 2 }, want: ['すみません…{p}，唔该', '{p}，一个，唔该晒'], happy: ['おいしい！好味！'], miss: ['{p}…冇喇？'] },
  '叛逆学生': { likes: { bun: 2, mango: 2, coco: 2 }, want: ['喂，{p}，快啲啦', '{p}，唔好问咁多'], happy: ['…都几得'], miss: ['吓？冇{p}？嘥时间'] },
  '严肃老师': { likes: { tea: 3, wife: 2, tart: 1, lemontea: 2, dpn: 2 }, want: ['一个{p}，谢谢。', '请问{p}有冇少甜？'], happy: ['整洁卫生，不错。'], miss: ['冇{p}？要改善。'] },
  '西装金融男': { likes: { tea: 3, tart: 2, mango: 2, yuen: 3, lemontea: 2 }, extra: 1, want: ['{p}，fast，我有个call', 'Bro，{p}俾我两个'], happy: ['Deal！'], miss: ['冇{p}？Market都冇咁差'] },
};
const personaOf = ci => PERSONA[GUEST_DEF[ci] && GUEST_DEF[ci].name] || { likes: {}, want: ['{p}唔该'], happy: ['好味！'], miss: ['冇{p}…'] };
const sayP = (lines, p) => L(pick(lines)).split('{p}').join(p ? PRODUCTS[p].name : '');   // translate the template before the item name goes in
const monthOf = d => Math.floor((d - 1) / MONTH_DAYS) % 12 + 1, dayInMonth = d => (d - 1) % MONTH_DAYS + 1;
