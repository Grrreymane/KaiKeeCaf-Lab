// ==== design desk (R&D, after closing). Top view of a marble worktop, everything at one real-world scale (~6.5 device px
// per cm: a 40 cm mixing bowl, 7 cm tart tins, a 1 L milk carton ...), fine pixels lit from the top-left like the food.
// Every raw ingredient in the pantry sits on the worktop; the ones this recipe needs glow. Each action has its own motion:
//   备料  tap a glowing ingredient: it lifts (bigger + longer shadow), moves to the bowl and goes in the way it really does:
//         flour/sugar stream and pile up (flour puffs), an egg cracks on the rim and drops, butter falls, milk spreads as a pool
//   拌匀  hold: the whisk circles in the bowl, the separate piles swirl and melt into one batter
//   注模  hold: the jug pours into each tin / cup / bowl and the filling spreads (老婆饼: tap to fold each one)
//   入炉  the tray slides into the oven (or fridge); through the glass the food colours as the needle moves; stop it in the
//         green; the tray comes back out steaming (or misting) and the batch goes on a plate.
const ING = {   // name, top-view kind, main colour, accent
  flour: ['面粉', 'bag', '#f6f1e6', '#b8483c'], butter: ['牛油', 'block', '#f4d56a', '#e9e3d6'], egg: ['鸡蛋', 'eggs', '#f2e2c4', '#d8cdb5'],
  sugar: ['砂糖', 'jar', '#fbfbf6', '#d93a2f'], tealeaf: ['茶叶', 'tin', '#3a2e24', '#b8483c'], evap: ['淡奶', 'can', '#f6eedc', '#d93a2f'],
  coconut: ['椰丝', 'bag', '#f4efe2', '#5a8a4a'], melon: ['冬瓜蓉', 'bowl', '#b8cc7a', '#f4f1ea'], sesame: ['芝麻', 'dish', '#2a2420', '#e9dcc0'],
  redbean: ['红豆', 'bag', '#8a2a24', '#c99428'], milk: ['牛奶', 'carton', '#f4f6fa', '#3f86d6'], mango: ['芒果', 'fruit', '#ffb52e', '#5a9a4a'],
  sago: ['西米', 'jar', '#eef4f6', '#3f86d6'], coconutmilk: ['椰浆', 'can', '#f8f4e8', '#3f8a54'], water: ['清水', 'jug', '#bfe6f4', '#e4f1f6'], ice: ['冰块', 'ice', '#dff6f8', '#a9dde3'],
  lemon: ['柠檬', 'fruit', '#ffe24a', '#5a9a4a'], coffee: ['咖啡粉', 'tin', '#4a2c1a', '#2f6a50'],
};
const ING_ORDER = ['flour', 'butter', 'egg', 'sugar', 'milk', 'evap', 'coconutmilk', 'water', 'lemon', 'coconut', 'melon', 'sesame', 'redbean', 'mango', 'sago', 'tealeaf', 'coffee', 'ice'];
const POUR = { flour: '#fbf8ee', sugar: '#ffffff', coconut: '#fbf6e6', redbean: '#9a2a24', sesame: '#2a2420', sago: '#f4f8fa', milk: '#fbfbf6', coconutmilk: '#f8f4e8', evap: '#f6eedc', water: '#bfe6f4', tealeaf: '#4a3a2a', lemon: '#ffe24a', coffee: '#4a2c1a', egg: '#ffcf3a', butter: '#f4d56a', melon: '#b8cc7a', mango: '#ffb52e', ice: '#dff6f8' };
const RECIPES = {
  coco: { verb: '倒椰丝馅', fill: '#f2d4a2', baked: '#e0b06e', heat: 'oven', vessel: 'tin', ings: ['flour', 'butter', 'coconut', 'sugar', 'egg', 'water'], need: ['flour', 'butter', 'coconut'], tip: '椰丝先炒香，挞馅更有层次' },
  wife: { verb: '包冬瓜馅', fill: '#c8d890', baked: '#e8a850', heat: 'oven', vessel: 'disc', ings: ['flour', 'butter', 'melon', 'sugar', 'sesame', 'water'], need: ['flour', 'melon', 'sesame'], tip: '老婆饼又叫冬蓉酥，皮要起酥' },
  pudding: { verb: '倒入碗', fill: '#fff0cc', baked: '#fff4d6', heat: 'fridge', vessel: 'bowl', ings: ['redbean', 'milk', 'egg', 'sugar', 'coconutmilk', 'water'], need: ['redbean', 'milk', 'egg'], tip: '红豆先浸一晚，更快起沙' },
  mango: { verb: '装杯', fill: '#ffb52e', baked: '#ffc24a', heat: 'fridge', vessel: 'cup', ings: ['mango', 'sago', 'coconutmilk', 'milk', 'ice', 'sugar'], need: ['mango', 'sago', 'coconutmilk'], tip: '杨枝甘露的「杨枝」其实系西柚' },
  cockbun: { verb: '包椰丝馅', fill: '#f4efe2', baked: '#f0b048', heat: 'oven', vessel: 'disc', need: ['flour', 'butter', 'coconut'], tip: '鸡尾包据说用卖剩的面包碎做馅' },
  lemontea: { verb: '倒茶落杯', fill: '#c86a24', baked: '#d47a30', heat: 'fridge', vessel: 'cup', top: 'lemon', need: ['tealeaf', 'lemon', 'sugar'], tip: '柠檬要用茶匙压出香味' },
  malai: { verb: '倒浆入模', fill: '#d8a060', baked: '#b07840', heat: 'steam', vessel: 'tin', need: ['flour', 'egg', 'sugar'], tip: '马拉糕系蒸出嚟，唔系焗' },
  dpn: { verb: '倒入碗', fill: '#fbf6ea', baked: '#fffdf6', heat: 'steam', vessel: 'bowl', need: ['milk', 'egg', 'sugar'], tip: '双皮奶要蒸两次先有两层皮' },
  eggwaf: { verb: '倒浆入格', fill: '#ffd06a', baked: '#f2a82e', heat: 'oven', vessel: 'tin', need: ['flour', 'egg', 'evap'], tip: '鸡蛋仔一格格，趁热最脆' },
  redice: { verb: '装杯', fill: '#8a2a24', baked: '#a03a2a', heat: 'fridge', vessel: 'cup', top: 'ice', need: ['redbean', 'evap', 'sugar'], tip: '红豆冰：红豆、冰、淡奶，三层分明' },
  smoothie: { verb: '倒入杯', fill: '#ffb52e', baked: '#ffc24a', heat: 'fridge', vessel: 'cup', top: 'mango', need: ['mango', 'milk', 'sugar'], tip: '冰沙要用冻芒果先够绵' },
  yuen: { verb: '撞奶茶', fill: '#8a5228', baked: '#7a4620', heat: 'fridge', vessel: 'cup', top: 'ice', need: ['tealeaf', 'coffee', 'evap'], tip: '鸳鸯 = 七分奶茶加三分咖啡' },
};
// ---------------------------------------------------------------- the real process, recipe by recipe; every step has its own tip
const FLOWS = {
  coco: [
    { type: 'weigh', k: 'flour', g: 250, tip: '烘焙要称准：面粉多一成，挞皮就会硬' },
    { type: 'weigh', k: 'butter', g: 120, tip: '牛油要雪冻，切粒先落，挞皮先起酥' },
    { type: 'knead', tip: '搓到冇粉粒就够，搓太耐会起筋，挞皮会缩' },
    { type: 'rest', label: '醒面', tip: '醒二十分钟，筋性放松，焗嗰阵唔会缩' },
    { type: 'roll', tip: '由中间向外碾，厚薄均匀先唔会穿底' },
    { type: 'cut', tip: '印模压落去转半圈，挞边先整齐' },
    { type: 'add', ks: ['coconut', 'sugar', 'egg'], tip: '椰丝先用白镬炒香，馅更有层次' },
    { type: 'mix', tip: '拌到糖溶就得，唔好打起泡' },
    { type: 'fill', tip: '倒八分满，焗嗰阵会胀' },
    { type: 'oven', tip: '200 度焗 15 分钟，睇住挞边转金黄' },
  ],
  wife: [
    { type: 'weigh', k: 'flour', g: 300, tip: '老婆饼有油皮同油心两份面团' },
    { type: 'weigh', k: 'butter', g: 100, tip: '油心用猪油或牛油，饼皮先一层层' },
    { type: 'knead', tip: '油皮搓到光滑有弹性' },
    { type: 'rest', label: '醒面', tip: '油皮油心分开醒，包嗰阵唔会穿' },
    { type: 'add', ks: ['melon', 'sesame'], tip: '冬蓉加炒香芝麻，馅先唔会太甜腻' },
    { type: 'mix', tip: '馅料拌匀，搓成一粒粒小球' },
    { type: 'fill', tip: '包馅收口要捏实，压扁再别两刀' },
    { type: 'oven', tip: '扫蛋液再焗，表面先金亮' },
  ],
  pudding: [
    { type: 'weigh', k: 'redbean', g: 150, tip: '红豆浸一晚，煲得快又起沙' },
    { type: 'stove', label: '煲红豆', col: '#7a2420', tip: '细火慢煲，要不停搅，唔好黐底' },
    { type: 'add', ks: ['milk', 'egg'], tip: '牛奶要放凉先落蛋，唔系会熟' },
    { type: 'mix', tip: '蛋奶拌匀就得，唔好打起泡' },
    { type: 'sift', tip: '过筛去气泡，布丁先滑' },
    { type: 'fill', tip: '先放红豆，再倒蛋奶' },
    { type: 'oven', tip: '雪四个钟先凝固' },
  ],
  mango: [
    { type: 'dice', tip: '芒果要熟透，切粒大细要一致' },
    { type: 'stove', label: '煲西米', col: '#e8f0f2', tip: '西米煲到透明剩一点白，熄火焗熟' },
    { type: 'add', ks: ['coconutmilk', 'sago'], tip: '西米过冻水，先唔会黐埋一嚿' },
    { type: 'mix', tip: '椰浆同芒果汁拌匀' },
    { type: 'fill', tip: '杯底先放西米，再倒芒果椰浆' },
    { type: 'oven', tip: '雪冻先上，冰冻先好味' },
  ],
  cockbun: [
    { type: 'weigh', k: 'flour', g: 300, tip: '面包要用高筋面粉' },
    { type: 'weigh', k: 'butter', g: 60, tip: '牛油等面团起筋先加' },
    { type: 'knead', tip: '搓到拉得出薄膜先够' },
    { type: 'rest', label: '发酵', tip: '发酵到两倍大，手指撳落唔回弹' },
    { type: 'add', ks: ['coconut', 'sugar'], tip: '椰丝馅加牛油糖，以前系用面包碎做' },
    { type: 'mix', tip: '馅料拌到成团' },
    { type: 'fill', tip: '包住馅卷成长条' },
    { type: 'oven', tip: '面上唧两条酥皮，180 度焗' },
  ],
  redice: [
    { type: 'stove', label: '煲红豆', col: '#8a2a24', tip: '红豆煲到起沙，口感先绵' },
    { type: 'add', ks: ['sugar'], tip: '糖趁热落，红豆先入味' },
    { type: 'fill', tip: '红豆落杯底，再铺满冰' },
    { type: 'add', ks: ['evap'], tip: '淡奶最后淋面，一层层好睇' },
    { type: 'oven', tip: '红豆冰即叫即整，冰先唔会溶' },
  ],
  smoothie: [
    { type: 'dice', tip: '芒果切粒，留几粒放面' },
    { type: 'add', ks: ['mango', 'milk', 'sugar'], tip: '用冻芒果，唔使加太多冰' },
    { type: 'mix', tip: '打到滑身冇粒先停' },
    { type: 'fill', tip: '倒入杯，放芒果粒' },
    { type: 'oven', tip: '冰沙要即刻饮' },
  ],
  lemontea: [
    { type: 'brew', tip: '茶叶焗五分钟，太耐会苦涩' },
    { type: 'press', tip: '柠檬片用茶匙压，香味先出' },
    { type: 'add', ks: ['sugar'], tip: '糖要趁热落先溶' },
    { type: 'fill', tip: '先落冰再倒茶' },
    { type: 'oven', tip: '冻柠茶一定要够冻' },
  ],
  malai: [
    { type: 'add', ks: ['egg', 'sugar'], tip: '鸡蛋要室温，打起先快' },
    { type: 'mix', tip: '蛋同糖打到发白起纹' },
    { type: 'weigh', k: 'flour', g: 200, tip: '马拉糕用低筋面粉' },
    { type: 'sift', tip: '面粉过筛，蒸出嚟先松软' },
    { type: 'fill', tip: '倒入垫咗纸嘅蒸笼' },
    { type: 'oven', tip: '大火蒸 25 分钟，中途唔好开盖' },
  ],
  dpn: [
    { type: 'stove', label: '煮奶', col: '#fbf8f0', tip: '牛奶煮到起一层皮' },
    { type: 'add', ks: ['egg', 'sugar'], tip: '只用蛋白，蛋黄留起' },
    { type: 'mix', tip: '蛋白同奶轻轻拌匀，唔好起泡' },
    { type: 'sift', tip: '过筛两次，口感先滑' },
    { type: 'fill', tip: '沿碗边慢慢倒返落去，奶皮先浮起' },
    { type: 'oven', tip: '细火蒸，表面先平滑' },
  ],
  eggwaf: [
    { type: 'weigh', k: 'flour', g: 200, tip: '加少少吉士粉，香味更浓' },
    { type: 'add', ks: ['egg', 'evap'], tip: '淡奶令粉浆更香滑' },
    { type: 'mix', tip: '拌到冇粉粒' },
    { type: 'rest', label: '醒浆', tip: '粉浆醒半个钟，出嚟先蓬松' },
    { type: 'fill', tip: '模要烧热先落浆，落满每一格' },
    { type: 'oven', tip: '反转再烘，外脆内软' },
  ],
  yuen: [
    { type: 'brew', tip: '茶要冲得浓，先顶得住咖啡' },
    { type: 'add', ks: ['coffee', 'evap'], tip: '七分奶茶三分咖啡' },
    { type: 'pull', tip: '撞茶拉高，空气打入先滑' },
    { type: 'fill', tip: '落冰再倒' },
    { type: 'oven', tip: '雪冻先上' },
  ],
};
const STEP_NAME = { weigh: '称量', add: '落料', mix: '拌匀', sift: '过筛', knead: '搓面团', rest: '醒面', roll: '碾皮', cut: '压模', stove: '煲煮', brew: '焗茶', pull: '撞茶', dice: '切粒', press: '压柠檬', fill: '注模', oven: '烘烤' };
const stepName = (s, R0) => s.label || (s.type === 'fill' ? (R0.vessel === 'disc' ? '包馅' : R0.vessel === 'cup' ? '装杯' : '注模') : s.type === 'oven' ? (R0.heat === 'oven' ? '烘烤' : R0.heat === 'steam' ? '蒸' : '冷藏') : STEP_NAME[s.type]);
const TAP_N = { knead: 8, cut: 6, pull: 6, dice: 6, press: 3 };
// research happens after closing (on the ledger screen): tonight you can try what becomes available tomorrow
const researchable = () => W.rdDay === W.day ? [] : Object.keys(RECIPES).filter(p => !W.known[p] && W.day >= PRODUCTS[p].day).sort((a, b) => PRODUCTS[a].day - PRODUCTS[b].day).slice(0, 1);   // one new recipe a day (the oldest waiting first); on the ledger W.day is already tomorrow
const canResearch = () => PHASE === 'ledger' || PHASE === 'prep';   // after closing, or in the morning before opening
// ---------------------------------------------------------------- fine-pixel helpers (ramp by light from the top-left, coloured outline)
const dramp = (cols, v) => cols[Math.max(0, Math.min(cols.length - 1, Math.floor((v + 1) / 2 * cols.length)))];
const dlit = (x, y, cx, cy, rx, ry) => Math.max(-1, Math.min(1, -((x + .5 - cx) / rx) * .55 - ((y + .5 - cy) / ry) * .75 + .1));
const dtone = (col, n = 4) => [shade(col, -40), shade(col, -18), col, shade(col, 22), shade(col, 40)].slice(5 - n);
function finish(g, dark = '#4a3236') { const add = []; for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { if (g.get(x, y)) continue; const n = g.get(x, y + 1) || g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1); if (n) add.push([x, y, mixHex(n, dark, .7)]); } add.forEach(([x, y, c]) => g.set(x, y, c)); return g.canvas(); }
const SPR = {};
const cache = (k, fn) => SPR[k] || (SPR[k] = fn());
const hsh = (x, y, s = 1) => { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.7) * 43758.5453; return v - Math.floor(v); };   // stable per-pixel noise
const rel = (x, y, cx, cy, rx, ry) => ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2;
const dsk = (g, cx, cy, rx, ry, cols, lx = -.35, ly = -.45) => g.ell(cx, cy, rx, ry, (x, y) => dramp(cols, dlit(x, y, cx + lx * rx, cy + ly * ry, rx * 1.4, ry * 1.4)));   // lit disc / sphere
function rrect(g, x, y, w, h, r, col) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { const dx = Math.max(x + r - i - .5, 0, i + .5 - (x + w - r)), dy = Math.max(y + r - j - .5, 0, j + .5 - (y + h - r)); if (dx * dx + dy * dy <= r * r) g.set(i, j, typeof col === 'function' ? col(i, j) : col); } }
let SH_ID = 0;
function shadowOf(cv) { return cache('sh:' + (cv._sid || (cv._sid = ++SH_ID)), () => { const o = mk(cv.width, cv.height), x = o.getContext('2d'); x.drawImage(cv, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#3a2a20'; x.fillRect(0, 0, o.width, o.height); return o; }); }
function putShadowed(c, cv, x, y, lift = 0, s = 1) {   // sprite centred on x,y with a shadow to the bottom-right; lift = how high it is held
  const w = cv.width * s, h = cv.height * s, off = 4 + lift * 22;
  c.save(); c.globalAlpha = .22 - lift * .08; c.drawImage(shadowOf(cv), R(x - w / 2 + off), R(y - h / 2 + off * .8), R(w), R(h)); c.restore();
  c.drawImage(cv, R(x - w / 2), R(y - h / 2), R(w), R(h));
}

// ---------------------------------------------------------------- ingredients, top view
function ingTop(k) {
  return cache('top:' + k, () => {
    const [, kind, a, b] = ING[k];
    if (kind === 'bag') {   // open paper sack, rim rolled down, contents seen from above, printed band on the front fold
      const W_ = k === 'flour' ? 130 : 104, H_ = k === 'flour' ? 72 : 64, g = new Grid(W_, H_);
      rrect(g, 0, 0, W_, H_, 10, (x, y) => dramp(['#b89a68', '#c9ad7d', '#dcc49a', '#ecdab6'], dlit(x, y, W_ * .3, H_ * .3, W_, H_)));
      for (let x = 4; x < W_ - 4; x += 5) g.set(x, 2 + (x % 3), '#f2e4c4');   // creases on the roll
      const ix = 9, iy = 8, iw = W_ - 18, ih = H_ - 22;
      rrect(g, ix, iy, iw, ih, 6, (x, y) => {
        const edge = Math.min(x - ix, y - iy), v = hsh(x, y);
        let col = k === 'flour' ? (v < .1 ? '#e9e0cc' : v > .93 ? '#ffffff' : '#f6f1e6') : k === 'coconut' ? (((x + y * 3) % 7 < 2 && v > .4) ? '#e3dccb' : v > .9 ? '#ffffff' : '#f4efe2') : null;
        if (k === 'redbean') { const cx_ = Math.floor(x / 6) * 6 + 3 + (Math.floor(y / 5) % 2) * 3, cy_ = Math.floor(y / 5) * 5 + 2.5, d = ((x + .5 - cx_) / 3) ** 2 + ((y + .5 - cy_) / 2.4) ** 2; col = d < 1 ? (d < .25 && x < cx_ ? '#c85a48' : hsh(cx_, cy_) > .5 ? '#8a2a24' : '#7a2420') : '#4a1614'; }
        return edge < 3 ? shade(col, -20) : edge < 5 ? shade(col, -9) : col;   // the inner wall throws a shadow on the top / left
      });
      if (k === 'flour') g.ell(ix + iw * .62, iy + ih * .5, 14, 8, (x, y) => y < iy + ih * .5 ? shade('#f6f1e6', -14) : '#ffffff');   // scoop dent
      g.rect(6, H_ - 12, W_ - 12, 9, b); g.rect(6, H_ - 12, W_ - 12, 2, shade(b, 30)); g.rect(R(W_ / 2) - 14, H_ - 10, 28, 5, '#fff4dc');
      return finish(g);
    }
    if (kind === 'block') {   // butter on its opened foil
      const g = new Grid(92, 54);
      g.rect(0, 0, 92, 54, (x, y) => { const v = hsh(x >> 2, y >> 2); return v > .8 ? '#f4f6f7' : v < .2 ? '#b0b5b8' : '#d3d8db'; });
      rrect(g, 7, 7, 78, 40, 3, (x, y) => dramp(['#e0b84a', '#f0cc5c', '#f4d56a', '#fbe48c'], dlit(x, y, 20, 14, 78, 40)));
      g.rect(8, 8, 76, 2, '#fff0b0'); g.rect(8, 8, 2, 38, '#fbe48c'); g.rect(8, 45, 76, 2, '#d0a83c'); g.rect(83, 8, 2, 38, '#d0a83c');
      g.rect(56, 8, 1, 38, '#e0b84a'); g.rect(57, 8, 1, 38, '#fff0b0');   // where a slice was cut
      return finish(g);
    }
    if (kind === 'eggs') {   // 2 x 2 pulp carton
      const g = new Grid(80, 76);
      rrect(g, 0, 0, 80, 76, 6, (x, y) => hsh(x, y) > .85 ? '#b9ad92' : '#cfc3a8');
      for (const [ex, ey] of [[20, 19], [60, 19], [20, 57], [60, 57]]) { g.ell(ex + 2, ey + 3, 17, 15, '#a89c82'); dsk(g, ex, ey, 14, 16, ['#d8c4a0', '#e8d6b4', '#f4e6cc', '#fff6e6']); g.set(ex - 6, ey - 8, '#ffffff'); g.set(ex - 5, ey - 8, '#ffffff'); }
      return finish(g);
    }
    if (kind === 'jar' || kind === 'tin' || kind === 'dish') {   // round open container: rim + what is inside
      const r = kind === 'dish' ? 26 : 33, s = r * 2 + 2, g = new Grid(s, s), c0 = r + 1;
      g.ell(c0, c0, r, r, (x, y) => kind === 'jar' ? dramp(['#a9c4cc', '#cfe2e8', '#eef8fa', '#ffffff'], dlit(x, y, c0 - 10, c0 - 10, r, r)) : kind === 'tin' ? dramp(dtone(b, 4), dlit(x, y, c0 - 10, c0 - 10, r, r)) : dramp(['#d8d2c6', '#ece8e0', '#fbf9f4'], dlit(x, y, c0 - 10, c0 - 10, r, r)));
      const ri = r - (kind === 'dish' ? 5 : 4);
      g.ell(c0, c0, ri, ri, (x, y) => {
        const d = Math.hypot(x + .5 - c0, y + .5 - c0), wall = d > ri - 3 && (x + y) < c0 * 2, v = hsh(x, y);
        let col = a;
        if (k === 'sugar') col = v > .85 ? '#ffffff' : v < .15 ? '#e8e8e0' : '#f6f6ee';
        if (k === 'sago') { const cx_ = Math.floor(x / 4) * 4 + 2, cy_ = Math.floor(y / 4) * 4 + 2; col = Math.hypot(x + .5 - cx_, y + .5 - cy_) < 1.8 ? (x < cx_ ? '#ffffff' : '#e6eef0') : '#cfdde2'; }
        if (k === 'tealeaf') col = v > .7 ? '#5a4632' : v > .35 ? '#3a2e24' : '#2a2018';
        if (k === 'sesame') col = ((x * 3 + y * 5) % 7 === 0 || v > .9) ? '#e9dcc0' : v > .5 ? '#2a2420' : '#3a322c';
        return wall ? shade(col, -24) : col;
      });
      if (kind === 'jar') for (let i = 0; i < 9; i++) g.set(R(c0 - r + 4 + i * .6), R(c0 - 8 - i * 1.6), '#ffffff');   // glint on the glass rim
      return finish(g);
    }
    if (kind === 'can') {   // opened can: silver top, two punched holes, label colour round the rim
      const g = new Grid(52, 52);
      g.ell(26, 26, 25, 25, b); g.ell(26, 26, 22, 22, (x, y) => dramp(['#9aa0a3', '#b8bdc0', '#d3d8db', '#eef1f2'], dlit(x, y, 18, 18, 22, 22)));
      for (let r = 17; r <= 18; r++) for (let t = 0; t < 6.28; t += .05) g.set(R(26 + Math.cos(t) * r), R(26 + Math.sin(t) * r), '#a8adb2');
      g.tri(16, 12, 22, 12, 19, 17, '#3a3236'); g.tri(30, 36, 36, 36, 33, 41, '#3a3236'); g.set(17, 13, a); g.set(31, 37, a);
      return finish(g);
    }
    if (kind === 'carton') {   // gable-top carton from above: two sloped panels, sealed ridge, blue screw cap
      const g = new Grid(48, 48);
      g.rect(0, 0, 24, 48, (x, y) => dramp(['#dfe4ec', '#eef2f8', '#fbfcfe'], dlit(x, y, 4, 4, 24, 48))); g.rect(24, 0, 24, 48, (x, y) => dramp(['#c4ccd8', '#d6dce6'], dlit(x, y, 26, 4, 24, 48)));
      g.rect(22, 0, 4, 48, '#ffffff'); g.rect(26, 0, 1, 48, '#b8c0cc'); g.rect(0, 30, 48, 10, b); g.rect(0, 30, 24, 2, shade(b, 30));
      dsk(g, 12, 13, 6, 6, ['#2d6cc4', '#3f86d6', '#6aa6e8']);
      return finish(g);
    }
    if (kind === 'fruit') {   // a whole mango: blush toward the stem, green shoulder, waxy highlight
      const g = new Grid(74, 52);
      g.ell(37, 26, 35, 24, (x, y) => { const base = dramp(['#e0761a', '#f29a1a', '#ffb52e', '#ffd060', '#ffe89a'], dlit(x, y, 26, 16, 40, 28)); return x > 52 && y < 24 ? mixHex(base, '#8ab84a', .45) : base; });
      g.rect(66, 18, 3, 3, '#6a4a2a'); g.rect(20, 14, 6, 2, '#fff4c8'); g.rect(18, 16, 3, 2, '#fff4c8');
      return finish(g);
    }
    if (kind === 'bowl') {   // white bowl of winter-melon paste
      const g = new Grid(80, 80);
      g.ell(40, 40, 39, 39, (x, y) => dramp(['#c3ccd8', '#e2e8ef', '#f6f9fc', '#ffffff'], dlit(x, y, 28, 28, 39, 39)));
      g.ell(40, 40, 31, 31, (x, y) => dramp(['#8aa050', '#a4b866', '#b8cc7a', '#cfe096'], dlit(x, y, 46, 46, 31, 31) * -.6 + (hsh(x, y) - .5) * .5));
      g.ell(32, 32, 9, 5, '#dce8b0');
      return finish(g);
    }
    if (kind === 'jug') {   // plastic jug of water: handle right, spout left
      const g = new Grid(96, 80);
      for (let t = -1; t <= 1; t += .02) { const x = R(78 + Math.cos(t) * 14), y = R(40 + Math.sin(t) * 22); g.rect(x, y, 4, 4, '#cfdde3'); }
      g.tri(2, 40, 18, 30, 18, 50, '#dfeef4');
      g.ell(42, 40, 36, 36, (x, y) => dramp(['#b8d0d8', '#d4e6ec', '#eaf4f8'], dlit(x, y, 30, 30, 36, 36)));
      g.ell(42, 40, 31, 31, (x, y) => dramp(['#8ec8e0', '#a8d6ea', '#bfe6f4', '#dff4fb'], dlit(x, y, 50, 48, 31, 31) * -.7));
      g.ell(32, 30, 8, 3, '#ffffff');
      return finish(g);
    }
    // ice: small steel bowl with cubes
    const g = new Grid(74, 74);
    g.ell(37, 37, 36, 36, (x, y) => dramp(['#9aa0a3', '#c9cdd0', '#e4e8eb', '#f6f8f9'], dlit(x, y, 26, 26, 36, 36)));
    g.ell(37, 37, 29, 29, '#b8bdc0');
    for (const [x, y] of [[20, 22], [38, 18], [26, 38], [44, 36], [33, 50]]) { g.rect(x, y, 14, 13, (xx, yy) => dramp(['#a9dde3', '#c9eef2', '#e8fafb', '#ffffff'], dlit(xx, yy, x + 3, y + 3, 14, 13))); g.rect(x, y, 14, 1, '#ffffff'); g.rect(x + 13, y, 1, 13, '#8ec8d0'); }
    return finish(g);
  });
}
const ingIcon = ingTop;   // the shop panel uses the same art
function drawFit(c, im, x, y, w, h) { const s = Math.min(w / im.width, h / im.height); c.drawImage(im, R(x + (w - im.width * s) / 2), R(y + (h - im.height * s) / 2), R(im.width * s), R(im.height * s)); }
// one serving of an ingredient once it is in the bowl (top view)
function landed(k) {
  return cache('land:' + k, () => {
    const col = POUR[k], g = new Grid(64, 52), cx = 32, cy = 26;
    if (k.startsWith('cooked:')) { const c0 = k.slice(7); g.ell(cx, cy, 26, 20, (x, y) => dramp([shade(c0, -24), c0, shade(c0, 18)], dlit(x, y, cx - 6, cy - 6, 26, 20))); for (let i = 0; i < 46; i++) { const x = R(cx - 20 + hsh(i, 3) * 40), y = R(cy - 15 + hsh(i, 4) * 30); if (rel(x, y, cx, cy, 24, 18) < 1) { g.set(x, y, shade(c0, -40)); g.set(x + 1, y, shade(c0, 30)); } } return finish(g); }
    if (['flour', 'sugar', 'coconut'].includes(k)) { dsk(g, cx, cy, 26, 21, dtone(col, 4)); for (let i = 0; i < 40; i++) { const x = cx - 20 + hsh(i, 1) * 40, y = cy - 15 + hsh(i, 2) * 30; if (rel(x, y, cx, cy, 24, 19) < 1) g.set(x, y, k === 'coconut' ? '#e3dccb' : k === 'sugar' ? '#ffffff' : '#e9e0cc'); } }
    else if (k === 'egg') { g.ell(cx, cy, 26, 20, (x, y) => hsh(x, y) > .9 ? '#ffffff' : '#f6f0de'); dsk(g, cx - 2, cy - 1, 11, 10, ['#e89a10', '#ffb81a', '#ffcc3a', '#ffe070']); g.set(cx - 6, cy - 6, '#fff6c8'); g.set(cx - 5, cy - 6, '#fff6c8'); }
    else if (k === 'butter') for (const [x, y] of [[cx - 16, cy - 10], [cx + 2, cy - 4], [cx - 8, cy + 6]]) { g.rect(x, y, 14, 12, (xx, yy) => dramp(['#e0b84a', '#f4d56a', '#fbe48c'], dlit(xx, yy, x + 3, y + 3, 14, 12))); g.rect(x, y, 14, 1, '#fff0b0'); }
    else if (['milk', 'evap', 'coconutmilk', 'water'].includes(k)) { g.ell(cx, cy, 30, 24, (x, y) => dramp(dtone(col, 3), dlit(x, y, cx + 6, cy + 6, 30, 24) * -.8)); for (let t = 3.4; t < 4.6; t += .03) g.set(R(cx + Math.cos(t) * 22), R(cy + Math.sin(t) * 16), '#ffffff'); }
    else if (k === 'melon') g.ell(cx, cy, 22, 17, (x, y) => dramp(['#8aa050', '#a4b866', '#b8cc7a', '#cfe096'], dlit(x, y, cx - 6, cy - 6, 22, 17) + (hsh(x, y) - .5) * .4));
    else if (k === 'ice') for (const [x, y] of [[cx - 18, cy - 10], [cx, cy - 6], [cx - 8, cy + 6]]) g.rect(x, y, 13, 12, (xx, yy) => dramp(['#a9dde3', '#c9eef2', '#ffffff'], dlit(xx, yy, x + 3, y + 3, 13, 12)));
    else {   // scattered pieces: sesame, red beans, sago pearls, mango dice, tea leaves
      const n = k === 'mango' ? 9 : 34;
      for (let i = 0; i < n; i++) {
        const a = hsh(i, 3) * 6.28, r = Math.sqrt(hsh(i, 4)) * 22, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .8;
        if (k === 'mango') g.rect(R(x) - 4, R(y) - 4, 8, 8, (xx, yy) => dramp(['#f29a1a', '#ffb52e', '#ffd060'], dlit(xx, yy, x - 2, y - 2, 8, 8)));
        else if (k === 'sago') { g.ell(x, y, 2.2, 2.2, '#e6eef0'); g.set(R(x) - 1, R(y) - 1, '#ffffff'); }
        else if (k === 'redbean') { g.ell(x, y, 3, 2.2, '#8a2a24'); g.set(R(x) - 1, R(y) - 1, '#c85a48'); }
        else if (k === 'sesame') g.ell(x, y, 1.6, 1, hsh(i, 5) > .7 ? '#e9dcc0' : '#2a2420');
        else g.ell(x, y, 2.4, 1.4, hsh(i, 6) > .5 ? '#3a2e24' : '#5a4632');
      }
    }
    return finish(g);
  });
}
const EGG1 = () => cache('egg1', () => { const g = new Grid(34, 42); dsk(g, 17, 21, 14, 18, ['#d8c4a0', '#e8d6b4', '#f4e6cc', '#fff6e6']); return finish(g); });
// 40 cm stainless mixing bowl, top view: bright rolled rim, inner wall (shadowed top-left, lit bottom-right), brushed base
const BOWL_R = 130, BX = 360, BY = 712;
const BOWL = () => cache('bowl', () => {
  const s = BOWL_R * 2 + 4, g = new Grid(s, s), c0 = s / 2;
  g.ell(c0, c0, BOWL_R, BOWL_R, (x, y) => {
    const dx = x + .5 - c0, dy = y + .5 - c0, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx), lit = -(Math.cos(a) * .55 + Math.sin(a) * .75);   // lit = 1 toward the top-left
    if (d > BOWL_R - 7) return dramp(['#9aa0a3', '#c9cdd0', '#e4e8eb', '#ffffff'], lit * .9);
    if (d > BOWL_R * .62) return dramp(['#8e959a', '#a8adb2', '#c5cacd', '#dfe3e6', '#f2f5f6'], -lit * .8 + (d - BOWL_R * .62) / BOWL_R * .6);
    return Math.round(d) % 7 === 0 ? '#c5cacd' : '#d3d8db';
  });
  for (let t = 3.5; t < 4.4; t += .01) g.set(R(c0 + Math.cos(t) * (BOWL_R - 3)), R(c0 + Math.sin(t) * (BOWL_R - 3)), '#ffffff');
  return finish(g);
});
// tray of six moulds (top view)
const moldXY = i => [BX + ((i % 3) - 1) * 112, BY - 58 + Math.floor(i / 3) * 116];
const VR = { tin: 24, cup: 24, bowl: 36, disc: 27 };   // vessel radius at the desk's scale (7 cm tin, 11 cm dessert bowl ...)
function mould(kind, fill, R0, stage) {
  const lv = Math.round(fill * 10), key = 'm:' + kind + lv + R0.fill + (stage || '');
  return cache(key, () => {
    const r = VR[kind], s = r * 2 + 8, g = new Grid(s, s), c0 = s / 2, baked = stage === 'baked';
    if (kind === 'tin') {   // fluted tin, pastry shell, filling spreads from the centre; baked = caramel spots
      g.ell(c0, c0, r + 2, r + 2, (x, y) => { const a = Math.atan2(y + .5 - c0, x + .5 - c0), d = Math.hypot(x + .5 - c0, y + .5 - c0); return d > r + 1 + Math.sin(a * 14) ? null : dramp(['#a8adb2', '#c9cdd0', '#e4e8eb', '#ffffff'], dlit(x, y, c0 - 8, c0 - 8, r, r)); });
      g.ell(c0, c0, r - 2, r - 2, (x, y) => dramp(baked ? ['#a8601a', '#c8803a', '#e6a14a', '#f7c06a'] : ['#c8a06a', '#dcba84', '#ecd2a0', '#f8e6c4'], dlit(x, y, c0 - 6, c0 - 6, r, r)));
      g.ell(c0, c0, r - 7, r - 7, (x, y) => dramp(baked ? ['#9a5a1a', '#b8722e'] : ['#d4b07a', '#e0c08c'], dlit(x, y, c0 + 4, c0 + 4, r, r) * -1));
      if (lv) { const rr = (r - 7) * Math.min(1, .35 + .65 * lv / 10); g.ell(c0, c0, rr, rr, (x, y) => { if (baked && hsh(x, y) > .9) return shade(R0.baked, -40); return dramp(dtone(baked ? R0.baked : R0.fill, 4), dlit(x, y, c0 - 5, c0 - 5, rr, rr)); }); if (!baked) g.set(R(c0 - rr * .4), R(c0 - rr * .4), '#ffffff'); }
      return finish(g);
    }
    if (kind === 'cup') {   // glass from above: rim ring, pale bottom, filling spreads; full = mango dice + pearls
      g.ell(c0, c0, r, r, (x, y) => dramp(['#b8d4dc', '#d8ecf0', '#f4fbfc'], dlit(x, y, c0 - 8, c0 - 8, r, r)));
      g.ell(c0, c0, r - 3, r - 3, '#eef6f8');
      if (lv) { const rr = (r - 3) * Math.min(1, .3 + .7 * lv / 10); g.ell(c0, c0, rr, rr, (x, y) => dramp(dtone(R0.fill, 4), dlit(x, y, c0 - 5, c0 - 5, rr, rr))); }
      if (lv >= 10 && R0.top === 'lemon') { for (const [dx, dy] of [[-6, -4], [5, 3]]) { g.ell(c0 + dx, c0 + dy, 5, 5, '#ffe24a'); g.ell(c0 + dx, c0 + dy, 3.6, 3.6, '#fff6a8'); for (let a = 0; a < 6.28; a += 1.05) g.set(R(c0 + dx + Math.cos(a) * 2.4), R(c0 + dy + Math.sin(a) * 2.4), '#ffe24a'); } }
      else if (lv >= 10 && R0.top === 'ice') { for (const [dx, dy] of [[-7, -5], [3, -6], [-2, 4], [6, 3]]) { g.rect(c0 + dx, c0 + dy, 6, 6, '#e8f8fa'); g.rect(c0 + dx, c0 + dy, 6, 1, '#ffffff'); } }
      else if (lv >= 10) { for (let i = 0; i < 6; i++) { const a = i * 1.1 + .3, x = c0 + Math.cos(a) * 9, y = c0 + Math.sin(a) * 9; g.rect(R(x) - 3, R(y) - 3, 6, 6, '#ff9a1a'); g.rect(R(x) - 3, R(y) - 3, 6, 1, '#ffd060'); } for (let i = 0; i < 10; i++) { const x = c0 - 14 + hsh(i, 7) * 28, y = c0 - 14 + hsh(i, 8) * 28; if (Math.hypot(x - c0, y - c0) < r - 5) g.ell(x, y, 1.6, 1.6, '#f4f8fa'); } }
      for (let t = 3.5; t < 4.4; t += .05) g.set(R(c0 + Math.cos(t) * (r - 1)), R(c0 + Math.sin(t) * (r - 1)), '#ffffff');
      if (baked) for (let i = 0; i < 8; i++) g.set(R(c0 - r + 4 + hsh(i, 9) * r * 1.6), R(c0 - r + 4 + hsh(i, 10) * r * 1.6), '#ffffff');   // chilled: frost sparkles
      return finish(g);
    }
    if (kind === 'bowl') {   // blue-rim dessert bowl, red beans on top when full
      g.ell(c0, c0, r, r, (x, y) => dramp(['#c3ccd8', '#e2e8ef', '#f6f9fc', '#ffffff'], dlit(x, y, c0 - 10, c0 - 10, r, r)));
      for (let t = 0; t < 6.28; t += .02) { g.set(R(c0 + Math.cos(t) * (r - 2)), R(c0 + Math.sin(t) * (r - 2)), '#3a78d0'); g.set(R(c0 + Math.cos(t) * (r - 3)), R(c0 + Math.sin(t) * (r - 3)), '#2d6cc4'); }
      g.ell(c0, c0, r - 9, r - 9, (x, y) => dramp(['#d8dde6', '#eef1f6'], dlit(x, y, c0 + 6, c0 + 6, r, r) * -1));
      if (lv) { const rr = (r - 9) * Math.min(1, .3 + .7 * lv / 10); g.ell(c0, c0, rr, rr, (x, y) => dramp(dtone(R0.fill, 4), dlit(x, y, c0 - 5, c0 - 5, rr, rr))); }
      if (lv >= 10) for (let i = 0; i < 9; i++) { const a = hsh(i, 11) * 6.28, d = hsh(i, 12) * 12, x = c0 + Math.cos(a) * d, y = c0 + Math.sin(a) * d; g.ell(x, y, 3, 2.2, '#8a2424'); g.set(R(x) - 1, R(y) - 1, '#c8443a'); }
      if (baked) g.ell(c0 - 8, c0 - 8, 6, 2, '#ffffff');
      return finish(g);
    }
    // disc: 老婆饼 — dough round with a ball of filling; folded and pressed round; egg-washed with two slits; baked golden
    if (stage === 'round' || baked) {
      dsk(g, c0, c0, r - 2, r - 2, baked ? ['#b8722e', '#d8903e', '#eeb05a', '#f8cc7e'] : ['#e3c89a', '#f0dcb4', '#f8ecd4', '#fffaf0']);
      for (const ox of [-6, 5]) for (let i = 0; i < 9; i++) g.set(R(c0 + ox + i * .3), R(c0 - 5 + i), baked ? '#7a4418' : '#c9a878');
      if (baked) for (let i = 0; i < 7; i++) g.set(R(c0 - 12 + hsh(i, 13) * 24), R(c0 - 12 + hsh(i, 14) * 24), '#fff4dc');
    } else { dsk(g, c0, c0, r, r, ['#e3c89a', '#efdcb4', '#f8ecd4', '#fffaf0']); dsk(g, c0, c0, 11, 11, dtone(R0.fill, 4)); }
    return finish(g);
  });
}
const TRAY_TOP = () => cache('tray', () => { const g = new Grid(372, 248); rrect(g, 0, 0, 372, 248, 10, (x, y) => dramp(['#5a5e62', '#6e7276', '#8a8f93'], dlit(x, y, 40, 30, 372, 248))); rrect(g, 7, 7, 358, 234, 6, (x, y) => ((x % 12 === 6 && y % 12 === 6) ? '#45494c' : '#5e6266')); g.rect(8, 7, 356, 2, '#a8adb2'); return finish(g); });
// oven (or fridge) at the bottom of the worktop: steel body, a big glass window into the chamber
const OV = { x: 120, y: 902, w: 480, h: 206, wx: 150, wy: 930, ww: 420, wh: 156 };
function ovenBody(fr) {
  return cache('oven:' + fr, () => {
    const g = new Grid(OV.w, OV.h), body = fr ? ['#c9d6dc', '#dfe9ee', '#f2f7f9', '#ffffff'] : ['#8e959a', '#b4b9bc', '#d3d8d6', '#eef1f2'];
    rrect(g, 0, 0, OV.w, OV.h, 10, (x, y) => dramp(body, dlit(x, y, 40, 20, OV.w, OV.h)));
    const wx = OV.wx - OV.x, wy = OV.wy - OV.y; g.rect(wx - 6, wy - 6, OV.ww + 12, OV.wh + 12, fr ? '#a9c4cc' : '#3b3135');
    for (let y = wy; y < wy + OV.wh; y++) for (let x = wx; x < wx + OV.ww; x++) g.d[y * OV.w + x] = null;   // the window is drawn live
    if (!fr) { for (const x of [16, 464]) for (let y = 30; y < 180; y += 10) g.rect(x - 4, y, 8, 3, '#7a8083'); }
    else for (let y = 30; y < 180; y += 8) { g.rect(10, y, 10, 2, '#a9c4cc'); g.rect(460, y, 10, 2, '#a9c4cc'); }
    return finish(g);
  });
}

// ---------------------------------------------------------------- state + actions
let DESK = null;
function openDesk() { SFX.tap(); PANEL = null; const list = researchable(); DESK = list.length === 1 ? startRecipe(list[0]) : { mode: 'pick', list }; }
function startRecipe(p) {
  const D = { mode: 'make', p, flow: FLOWS[p], si: 0, s: {}, got: [], blobs: [], mixedN: 0, anim: null, mix: 0, fills: [0, 0, 0, 0, 0, 0], stage: [0, 0, 0, 0, 0, 0], cur: 0, jugX: 0, jugY: 0, oven: null, quality: 0, miss: 0, msg: '', helped: false, t: 0 };
  D.step = D.flow[0].type; return D;
}
const curStep = D => D.flow[D.si];
function nextStep(D) {   // one step done: on to the next part of the process
  { const s0 = curStep(D); if (s0 && s0.type === 'stove') D.blobs.push({ k: 'cooked:' + s0.col, col: s0.col, spot: spotFor(D.blobs.length) }); }   // what came off the stove goes into the bowl (red beans, sago, milk)
  D.si++; D.s = {}; D.hold = false; D.msg = ''; SFX.ding();
  if (D.si >= D.flow.length) return;
  D.step = curStep(D).type;
  if (D.step === 'mix') D.mix = 0;
}
const ingCell = i => [(i % 9) * 80, 96 + Math.floor(i / 9) * 108];   // device px: a two-tier rack, 9 bins of 80 per tier (tag underneath)
const spotFor = n => { const a = n * 2.3 + .6, r = 34 + (n * 37) % 46; return [BX + Math.cos(a) * r, BY + Math.sin(a) * r * .9]; };
const litIngs = D => { const s = curStep(D); return s.type === 'add' ? s.ks.filter(k => !(D.s.got || []).includes(k)) : s.type === 'weigh' ? [s.k] : []; };
function addIngredient(k) {   // start the lift / pour / crack / drop animation for one ingredient
  const D = DESK; if (D.anim) return; (D.s.got = D.s.got || []).push(k); D.got.push(k); SFX.buy();
  const [x, y] = ingCell(ING_ORDER.indexOf(k));
  D.anim = { k, t: 0, T: k === 'egg' ? 1.6 : 1.4, from: [x + 40, y + 36], spot: spotFor(D.blobs.length) };
}
function blobFor(k, spot) { return { k, col: POUR[k] || ING[k][2], spot: spot || spotFor(DESK.blobs.length) }; }
function finishStep(D, good = true) {   // complete the current step (also what 帮我做 does)
  const s = curStep(D);
  if (s.type === 'add') { if (D.anim) { D.blobs.push(blobFor(D.anim.k, D.anim.spot)); D.anim = null; } for (const k of s.ks) if (!(D.s.got || []).includes(k)) { (D.s.got = D.s.got || []).push(k); D.blobs.push(blobFor(k)); } }
  if (s.type === 'weigh' && !D.s.poured) { D.blobs.push(blobFor(s.k)); D.got.push(s.k); }
  if (s.type === 'mix') { D.mix = 1; D.mixedN = D.blobs.length; }
  if (s.type === 'fill') { D.fills = D.fills.map(() => 1); D.stage = D.stage.map(() => 2); D.cur = 6; D.foldAnim = null; }
  if (s.type === 'oven') { D.oven = { ph: 'out', t: 0, q: 2, k: .5 }; return; }
  if (!good) D.miss++;
  nextStep(D);
}
function deskHelp() { const D = DESK; if (!D || D.mode !== 'make') return; D.helped = true; SFX.tap(); finishStep(D); }
function finishRecipe(q) { const D = DESK; D.quality = Math.max(1, q - (D.miss >= 2 ? 1 : 0)); D.mode = 'done'; SFX.ding(); }
function closeDesk() {
  const D = DESK; DESK = null;
  if (D && D.mode === 'done') { W.known[D.p] = true; W.rdDay = W.day; W.pts = (W.pts || 0) + 15; notice(PRODUCTS[D.p].name + ' 研发成功！明天可以摆上去'); playScene('rd_' + D.p); saveGame(); }
}
function deskTap() {   // tap-type steps: knead / cut / pull / dice / press / cover to rest
  const D = DESK; if (!D || D.mode !== 'make') return; const s = curStep(D);
  if (s.type === 'rest') { if (!D.s.covered) { D.s.covered = true; SFX.tap(); } return; }
  if (!TAP_N[s.type]) return;
  D.s.n = (D.s.n || 0) + 1; D.s.tapT = .25; SFX.tap();
  if (D.s.n >= TAP_N[s.type] && !(D.s.doneT > 0)) D.s.doneT = .35;
}
function stepDesk(dt) {
  const D = DESK; if (!D || D.mode !== 'make') return; D.t += dt; const R0 = RECIPES[D.p], s = curStep(D); if (!s) return; const S = D.s;
  if (S.tapT > 0) S.tapT -= dt;
  if (S.doneT > 0 && (S.doneT -= dt) <= 0) { finishStep(D); return; }
  if (D.anim) { D.anim.t += dt; if (D.anim.t >= D.anim.T) { D.blobs.push(blobFor(D.anim.k, D.anim.spot)); D.anim = null; if (s.type === 'add' && s.ks.every(k => (S.got || []).includes(k))) finishStep(D); } }
  if (s.type === 'weigh' && D.hold) { S.poured = true; S.grams = (S.grams || 0) + dt * s.g * .42; if (S.grams > s.g * 1.3) { D.blobs.push(blobFor(s.k)); D.got.push(s.k); finishStep(D, false); D.msg = '倒多咗！'; } }
  if (s.type === 'mix' && D.hold) { D.mix = Math.min(1, D.mix + dt * .45); if (D.mix >= 1) { D.mixedN = D.blobs.length; nextStep(D); } }
  if (['sift', 'roll', 'stove'].includes(s.type) && D.hold) { S.v = Math.min(1, (S.v || 0) + dt * .45); if (S.v >= 1) nextStep(D); }
  if (s.type === 'brew' && D.hold) { S.v = (S.v || 0) + dt * .3; if (S.v > 1) { finishStep(D, false); D.msg = '焗太耐，苦咗'; } }
  if (s.type === 'rest' && S.covered) { S.v = Math.min(1, (S.v || 0) + dt / 2.4); if (S.v >= 1) nextStep(D); }
  if (s.type === 'fill') {
    const [tx, ty] = moldXY(Math.min(D.cur, 5)), k = Math.min(1, dt * 8); D.jugX = D.jugX ? D.jugX + (tx - D.jugX) * k : tx; D.jugY = D.jugY ? D.jugY + (ty - D.jugY) * k : ty;
    if (R0.vessel !== 'disc' && D.hold && D.cur < 6 && Math.abs(D.jugX - tx) < 6 && Math.abs(D.jugY - ty) < 6) { D.fills[D.cur] = Math.min(1, D.fills[D.cur] + dt * .9); if (D.fills[D.cur] >= 1) { D.stage[D.cur] = 2; D.cur++; SFX.tap(); } }
    if (D.cur >= 6 && !D.foldAnim) nextStep(D);
  }
  if (D.foldAnim) { D.foldAnim.t += dt; if (D.foldAnim.t > .6) { D.stage[D.foldAnim.i] = 2; D.fills[D.foldAnim.i] = 1; D.foldAnim = null; D.cur++; if (D.cur >= 6) nextStep(D); } }
  if (D.oven) { const O = D.oven; O.t += dt; if (O.ph === 'load' && O.t > 1.2) { O.ph = 'cook'; O.t = 0; } if (O.ph === 'cook') O.k = (Math.sin(O.t * 2.6 - Math.PI / 2) + 1) / 2; if (O.ph === 'out' && O.t > 1.8) finishRecipe(O.q); }
}
const HOLD_STEPS = ['weigh', 'mix', 'sift', 'roll', 'stove', 'brew', 'fill'];
function deskDown(ux, uy) { const D = DESK; if (D && D.mode === 'make' && HOLD_STEPS.includes(D.step) && uy > 250 && uy < 450) D.hold = true; }
function deskUp() {
  const D = DESK; if (!D) return; const was = D.hold; D.hold = false;
  if (!was || D.mode !== 'make') return; const s = curStep(D); if (!s) return;
  if (s.type === 'weigh' && (D.s.grams || 0) >= s.g * .9) { const dev = Math.abs(D.s.grams - s.g) / s.g; D.blobs.push(blobFor(s.k)); D.got.push(s.k); finishStep(D, dev < .1); D.msg = (dev < .04 ? '啱啱好！' : dev < .1 ? '差唔多' : '差咗啲，会影响出品'); }
  if (s.type === 'brew' && (D.s.v || 0) >= .45) { const good = D.s.v <= .78; finishStep(D, good); D.msg = good ? '茶色啱啱好' : '有啲浓'; }
}

// ---------------------------------------------------------------- drawing (device px inside c.scale(.5); text in UI px afterwards)
const RACK = () => cache('rack', () => {   // two-tier wooden rack seen from above: boards, side rails, a bin per ingredient
  const g = new Grid(720, 222);
  g.rect(0, 0, 720, 222, (x, y) => ((y * 3 + Math.floor(x / 120) * 13) % 29 < 2) ? '#4a2e1e' : '#5e3e28');
  for (let r = 0; r < 2; r++) {
    const y0 = 8 + r * 108; g.rect(0, y0, 720, 78, (x, y) => dramp(['#9a6a40', '#b07a4a', '#c48c58'], dlit(x, y, 60, y0, 720, 78) + (hsh(x >> 3, y, 2) - .5) * .3)); g.rect(0, y0, 720, 2, '#d9a066'); g.rect(0, y0 + 76, 720, 3, '#6e4a30');
    for (let k = 0; k < 9; k++) { const x0 = k * 80 + 4; rrect(g, x0, y0 + 4, 72, 70, 4, (x, y) => (x < x0 + 4 || y < y0 + 8) ? '#7a5030' : (x > x0 + 67 || y > y0 + 69) ? '#d9a066' : '#8a5e3c'); }   // bin: shadowed inner walls top / left
  }
  return g.canvas();
});
const WORKTOP = () => cache('worktop', () => {   // honed white marble, a few thin wandering veins
  const g = new Grid(720, 1040);
  g.rect(0, 0, 720, 1040, (x, y) => { const v = hsh(x >> 1, y >> 1, 3); return v > .985 ? '#fbf4e4' : v < .02 ? '#e2d4b8' : (x * 7 + y * 13) % 61 === 0 ? '#e8dac0' : '#f1e6cf'; });
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let v = 0; v < 9; v++) { let x = rnd() * 720, y = rnd() * 1040, a = rnd() * 6.28; const col = v % 2 ? '#dccbaa' : '#e3d4b6';
    for (let k = 0; k < 340; k++) { a += (rnd() - .5) * .45; x += Math.cos(a) * 2; y += Math.sin(a) * 1.2; if (x < 0 || x > 720 || y < 0 || y > 1040) break; g.set(x, y, col); if (k % 7 < 2) g.set(x + 1, y, shade(col, 8)); } }
  return g.canvas();
});
function drawContents(c, D, t) {   // what is in the bowl: separate piles that swirl together into one batter while mixing
  const m = D.mix;
  c.save(); c.beginPath(); c.arc(BX, BY, BOWL_R * .86, 0, 7); c.clip();
  const mixed = D.blobs.slice(0, D.mixedN), fresh = D.blobs.slice(D.mixedN), mAll = mixed.length ? 1 : 0;
  if (D.blobs.length && (m > 0 || mAll)) {
    const src = m > 0 ? D.blobs : mixed; let base = src[0].col; src.forEach((b, i) => { if (i) base = mixHex(base, b.col, 1 / (i + 1)); });
    c.globalAlpha = Math.min(1, Math.max(mAll, m * 1.5)); c.fillStyle = shade(base, -10); c.beginPath(); c.arc(BX, BY, BOWL_R * .78, 0, 7); c.fill();
    c.fillStyle = base; c.beginPath(); c.arc(BX - 6, BY - 6, BOWL_R * .7, 0, 7); c.fill();
    c.fillStyle = shade(base, 18); c.beginPath(); c.ellipse(BX - 40, BY - 40, 34, 14, -.7, 0, 7); c.fill();
    c.globalAlpha = 1;
  }
  for (const b of fresh) {   // each new pile turns round the bowl and fades into the batter
    if (m >= .98) continue;
    const im = landed(b.k), dx = b.spot[0] - BX, dy = b.spot[1] - BY, a = m * 7, sc = 1 - m * .5, x = BX + (dx * Math.cos(a) - dy * Math.sin(a)) * sc, y = BY + (dx * Math.sin(a) + dy * Math.cos(a)) * sc;
    c.globalAlpha = 1 - m ** .8; c.drawImage(im, R(x - im.width / 2), R(y - im.height / 2)); c.globalAlpha = 1;
  }
  if (m > 0 && m < 1) {   // swirl streaks
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 3; const sp = t * (D.hold ? 7 : 1);
    for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(BX, BY, 24 + k * 22, sp + k, sp + k + 1.6); c.stroke(); }
  }
  c.restore();
}
function drawWhisk(c, D, t) {   // top view: wooden handle to the bottom-right, wire balloon at the tip; circles while held
  const ang = D.hold ? t * 9 : -.8, tx = BX + Math.cos(ang) * 58, ty = BY + Math.sin(ang) * 52, rot = Math.atan2(120, 150);
  c.save(); c.globalAlpha = .2; c.strokeStyle = '#3a2a20'; c.lineWidth = 12; c.beginPath(); c.moveTo(tx + 8, ty + 10); c.lineTo(tx + 158, ty + 130); c.stroke(); c.restore();
  c.strokeStyle = '#b8bdc0'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx + 30, ty + 24); c.lineTo(tx + 70, ty + 56); c.stroke();
  c.save(); c.translate(tx + 70, ty + 56); c.rotate(rot); c.fillStyle = '#b07a4a'; c.fillRect(0, -7, 110, 14); c.fillStyle = '#d9a066'; c.fillRect(0, -7, 110, 4); c.fillStyle = '#7a5030'; c.fillRect(104, -7, 6, 14); c.restore();
  c.save(); c.translate(tx, ty); c.rotate(rot); c.strokeStyle = '#d3d8db'; c.lineWidth = 2;
  for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(4, 0, 38, 8 + k * 4 + Math.sin(t * 20 + k) * (D.hold ? 2 : 0), 0, 0, 7); c.stroke(); }
  c.restore();
}
function drawPourAnim(c, D, t) {
  const A = D.anim; if (!A) return;
  const k = A.k, kind = ING[k][1], f = A.t / A.T, img = ingTop(k), col = POUR[k] || ING[k][2], [sx, sy] = A.spot;
  const ease = q => q < .5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2;
  if (kind === 'eggs') {   // one egg to the rim, a crack runs across, the halves part, yolk and white fall (shrinking as they drop away)
    const e = ease(Math.min(1, f / .35)), rx = BX + 96, ry = BY - 92, ex = A.from[0] + (rx - A.from[0]) * e, ey = A.from[1] + (ry - A.from[1]) * e;
    if (f < .6) { putShadowed(c, EGG1(), ex, ey, .8); if (f > .42) { c.strokeStyle = '#6a5a44'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex - 12, ey); c.lineTo(ex - 4, ey - 4); c.lineTo(ex + 3, ey + 2); c.lineTo(ex + 12, ey - 3); c.stroke(); } }
    else {
      const o = Math.min(1, (f - .6) / .15);
      for (const s of [-1, 1]) { c.save(); c.translate(rx + s * (6 + o * 16), ry - 4); c.rotate(s * o * .5); c.fillStyle = '#f2e2c4'; c.beginPath(); c.ellipse(0, 0, 13, 9, 0, s < 0 ? Math.PI * .5 : -Math.PI * .5, s < 0 ? Math.PI * 1.5 : Math.PI * .5); c.fill(); c.fillStyle = '#fffaf0'; c.fillRect(-2, -2, 4, 4); c.restore(); }
      const fall = Math.min(1, (f - .66) / .3);
      if (fall > 0) { const im = landed('egg'), s = 1.5 - fall * .5, x = rx + (sx - rx) * fall, y = ry + (sy - ry) * fall; c.save(); c.globalAlpha = .2 * fall; c.fillStyle = '#3a2a20'; c.beginPath(); c.ellipse(sx + 4, sy + 4, 26, 20, 0, 0, 7); c.fill(); c.restore(); c.drawImage(im, R(x - im.width * s / 2), R(y - im.height * s / 2), R(im.width * s), R(im.height * s)); }
    }
    return;
  }
  // everything else: lift and carry to just beside the bowl, tilt over it, then the contents go in
  const hold = [BX + 150, BY - 150], e = ease(Math.min(1, f / .3)), x = A.from[0] + (hold[0] - A.from[0]) * e, y = A.from[1] + (hold[1] - A.from[1]) * e, lift = Math.min(1, f / .2) * (f > .92 ? (1 - f) / .08 : 1);
  const tilt = Math.min(1, Math.max(0, (f - .3) / .12)) * (f > .9 ? (1 - f) / .1 : 1);
  if (kind === 'block' || kind === 'fruit') {   // butter / mango: cut over the bowl and dropped (pieces shrink as they fall away from us)
    const drop = Math.max(0, (f - .45) / .4);
    if (drop === 0) { putShadowed(c, img, x, y, lift, 1.05); if (f > .3) { c.fillStyle = '#d3d8db'; c.fillRect(R(x - 34), R(y - 4 + (f - .3) * 60), 68, 3); } }   // knife pass
    else if (drop < 1) { const im = landed(k), s = 1.6 - drop * .6, px_ = x + (sx - x) * drop, py_ = y + (sy - y) * drop; c.drawImage(im, R(px_ - im.width * s / 2), R(py_ - im.height * s / 2), R(im.width * s), R(im.height * s)); }
    else { const im = landed(k); c.drawImage(im, R(sx - im.width / 2), R(sy - im.height / 2)); }
    return;
  }
  const pourF = Math.max(0, Math.min(1, (f - .42) / .5)), wet = ['carton', 'can', 'jug'].includes(kind);
  if (pourF > 0) { const im = landed(k), s = .25 + .75 * pourF; c.save(); c.globalAlpha = Math.min(1, pourF * 2); c.drawImage(im, R(sx - im.width * s / 2), R(sy - im.height * s / 2), R(im.width * s), R(im.height * s)); c.restore(); }   // the pile / pool grows
  c.save(); c.translate(x, y); c.rotate(-tilt * .9); c.scale(1 - tilt * .25, 1); putShadowed(c, img, 0, 0, lift * (1 + tilt * .3), 1.05); c.restore();
  if (pourF > 0 && pourF < .96) {   // the stream from the mouth to the landing point (seen almost end-on, so it is short)
    const mx = x - 40, my = y + 26;
    if (wet) { c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.moveTo(mx, my); c.quadraticCurveTo((mx + sx) / 2 + 10, my + 10, sx, sy); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.6)'; const rr = 8 + (t * 40) % 20; c.beginPath(); c.ellipse(sx, sy, rr, rr * .8, 0, 0, 7); c.stroke(); }   // ripple
    else for (let i = 0; i < 26; i++) { const q = (t * 3 + i / 26) % 1, px_ = mx + (sx - mx) * q + Math.sin(i * 3.3 + t * 9) * 4, py_ = my + (sy - my) * q; c.fillStyle = i % 4 ? col : shade(col, -22); c.fillRect(R(px_), R(py_), 3, 3); }
    if (k === 'flour' && pourF > .2) { c.save(); for (let i = 0; i < 6; i++) { const q = (pourF * 1.6 + i / 6) % 1; c.globalAlpha = .45 * (1 - q); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(sx + Math.cos(i * 1.1) * q * 46, sy + Math.sin(i * 1.1) * q * 36, 10 + q * 20, 0, 7); c.fill(); } c.restore(); }   // flour puff
  }
}
function drawTrayAt(c, x, y, R0, D, done) {   // the tray of six moulds centred on x,y (done: 0 raw .. .5 right .. 1 overdone)
  const tr = TRAY_TOP(); c.drawImage(tr, R(x - tr.width / 2), R(y - tr.height / 2));
  for (let i = 0; i < 6; i++) {
    const [mx, my] = moldXY(i), ox = x + mx - BX, oy = y + my - BY;
    const raw = mould(R0.vessel, D.fills[i], R0, R0.vessel === 'disc' && D.stage[i] === 2 ? 'round' : '');
    if (done === undefined) { putShadowed(c, raw, ox, oy); continue; }
    const bk = mould(R0.vessel, 1, R0, 'baked'); c.drawImage(raw, R(ox - raw.width / 2), R(oy - raw.height / 2));
    c.save(); c.globalAlpha = Math.min(1, done * 2); c.drawImage(bk, R(ox - bk.width / 2), R(oy - bk.height / 2)); c.restore();
    if (done > .6 && R0.heat !== 'fridge') { c.save(); c.globalAlpha = (done - .6) * 1.4; c.fillStyle = '#3a2010'; c.beginPath(); c.arc(ox, oy, VR[R0.vessel] - 4, 0, 7); c.fill(); c.restore(); }   // burning
  }
}
function drawOvenArea(c, D, R0, t) {
  const O = D.oven, fr = R0.heat === 'fridge';
  c.fillStyle = fr ? '#b8dde6' : '#2a2226'; c.fillRect(OV.wx, OV.wy, OV.ww, OV.wh);   // the chamber through the glass
  c.fillStyle = fr ? '#ffffff' : '#4a3e42'; for (let x = OV.wx + 10; x < OV.wx + OV.ww - 10; x += 14) c.fillRect(x, OV.wy + OV.wh / 2, 6, 3);   // rack
  const inside = O && (O.ph === 'cook' || (O.ph === 'load' && O.t > .9) || (O.ph === 'out' && O.t < .15));
  if (inside) { c.save(); c.translate(OV.wx + OV.ww / 2, OV.wy + OV.wh / 2); c.scale(.38, .38); drawTrayAt(c, 0, 0, R0, D, O.ph === 'cook' ? O.k : O.ph === 'out' ? O.k : 0); c.restore(); }   // the food colours with the needle
  if (O && O.ph === 'cook') {   // glow / frost on the glass
    c.save(); if (!fr) { c.globalAlpha = .22 + .08 * Math.sin(t * 6); c.fillStyle = '#ff8a2a'; c.fillRect(OV.wx, OV.wy, OV.ww, OV.wh); }
    else { c.globalAlpha = .7; c.fillStyle = '#ffffff'; for (let i = 0; i < 30; i++) c.fillRect(R(OV.wx + (i * 53 + t * 20) % OV.ww), R(OV.wy + (i * 31) % OV.wh), 3, 3); }
    c.restore();
  }
  c.save(); c.globalAlpha = .16; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(OV.wx + 30, OV.wy); c.lineTo(OV.wx + 90, OV.wy); c.lineTo(OV.wx + 30, OV.wy + OV.wh); c.lineTo(OV.wx, OV.wy + OV.wh); c.fill(); c.restore();   // glass reflection
  c.drawImage(ovenBody(fr), OV.x, OV.y);
  c.fillStyle = O && O.ph === 'cook' && !fr ? '#ff6a3a' : fr ? '#3fa8d8' : '#7a3a2a'; c.fillRect(OV.x + OV.w - 30, OV.y + 10, 10, 10);   // pilot light
}
// ---- props for the process steps (top view, around the centre of the worktop)
function ellF(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(R(x), R(y), rx, ry, 0, 0, 7); c.fill(); }
function drawScale(c, D, s) {   // digital kitchen scale under the bowl, LCD in front
  c.save(); c.globalAlpha = .22; c.fillStyle = '#3a2a20'; c.fillRect(BX - 158, BY - 146, 330, 330); c.restore();
  c.fillStyle = '#c9cdd0'; c.fillRect(BX - 165, BY - 155, 330, 320); c.fillStyle = '#e4e8eb'; c.fillRect(BX - 165, BY - 155, 330, 8); c.fillStyle = '#a8adb2'; c.fillRect(BX + 157, BY - 155, 8, 320);
  c.fillStyle = '#2a3a30'; c.fillRect(BX - 80, BY + 128, 160, 30); c.fillStyle = '#9ad8a0'; c.fillRect(BX - 76, BY + 132, 152, 22);
}
function drawWeighPour(c, D, s, t) {   // the bag / block held over the bowl, a stream while held, the pile grows with the grams
  const g = D.s.grams || 0, f = Math.min(1.3, g / s.g), im = landed(s.k), sc = .3 + .7 * Math.min(1, f), [sx, sy] = spotFor(D.blobs.length);
  if (g > 0) { c.save(); c.drawImage(im, R(sx - im.width * sc / 2), R(sy - im.height * sc / 2), R(im.width * sc), R(im.height * sc)); c.restore(); }
  const hx = BX + 150, hy = BY - 150, tilt = D.hold ? 1 : .25, img = ingTop(s.k);
  c.save(); c.translate(hx, hy); c.rotate(-tilt * .9); putShadowed(c, img, 0, 0, .8, 1.05); c.restore();
  if (D.hold) { const col = POUR[s.k] || ING[s.k][2], mx = hx - 40, my = hy + 26; for (let i = 0; i < 26; i++) { const q = (t * 3 + i / 26) % 1; c.fillStyle = i % 4 ? col : shade(col, -22); c.fillRect(R(mx + (sx - mx) * q + Math.sin(i * 3.3 + t * 9) * 4), R(my + (sy - my) * q), 3, 3); } }
}
function drawSieve(c, D, t) {   // fine mesh sieve over the bowl: shakes while held, powder falls through
  const v = D.s.v || 0, j = D.hold ? Math.sin(t * 40) * 6 : 0, x = BX + 20 + j, y = BY - 30;
  c.save(); c.globalAlpha = .25; ellF(c, x + 14, y + 14, 112, 108, '#3a2a20'); c.restore();
  ellF(c, x, y, 112, 108, '#9aa0a3'); ellF(c, x, y, 104, 100, '#c9cdd0');
  c.fillStyle = '#b0b5b8'; for (let i = -100; i <= 100; i += 6) { c.fillRect(R(x + i), R(y - Math.sqrt(Math.max(0, 1 - (i / 104) ** 2)) * 100), 1, R(Math.sqrt(Math.max(0, 1 - (i / 104) ** 2)) * 200)); c.fillRect(R(x - Math.sqrt(Math.max(0, 1 - (i / 100) ** 2)) * 104), R(y + i), R(Math.sqrt(Math.max(0, 1 - (i / 100) ** 2)) * 208), 1); }
  ellF(c, x - 8, y - 6, 70 * (1 - v * .9) + 4, 60 * (1 - v * .9) + 4, '#fbf8ee');   // flour left in the sieve
  c.fillStyle = '#7a5030'; c.fillRect(R(x + 100), R(y - 10), 110, 18);
  if (D.hold) { c.fillStyle = '#ffffff'; for (let i = 0; i < 30; i++) c.fillRect(R(BX - 80 + (i * 37 + t * 200) % 180), R(BY - 40 + (i * 23) % 90), 2, 2); }
}
function drawDoughBoard(c, D, s, t) {   // floured wooden board with the dough: knead / rest / roll / cut
  c.save(); c.globalAlpha = .22; c.fillStyle = '#3a2a20'; c.fillRect(BX - 222, BY - 168, 460, 360); c.restore();
  c.fillStyle = '#c99868'; c.fillRect(BX - 230, BY - 180, 460, 360); c.fillStyle = '#d8aa78'; c.fillRect(BX - 230, BY - 180, 460, 10); c.fillStyle = '#a87848';
  for (let y = BY - 160; y < BY + 170; y += 22) c.fillRect(BX - 226, y, 452, 1);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 60; i++) c.fillRect(R(BX - 200 + (i * 53) % 400), R(BY - 150 + (i * 37) % 300), 3, 3);   // flour dusting
  const S = D.s;
  if (s.type === 'knead' || s.type === 'rest') {
    const n = s.type === 'knead' ? (S.n || 0) / TAP_N.knead : 1, sq = S.tapT > 0 ? 1 - S.tapT * .8 : 0;
    const rx = 100 + sq * 26, ry = 76 - sq * 18;
    c.save(); c.globalAlpha = .22; ellF(c, BX + 10, BY + 14, rx, ry, '#3a2a20'); c.restore();
    ellF(c, BX, BY, rx, ry, '#e3c89a'); ellF(c, BX - 12, BY - 10, rx * .8, ry * .78, '#efdcb4'); ellF(c, BX - 30, BY - 26, rx * .35, ry * .3, '#fbf2de');
    c.fillStyle = '#d4b07a'; for (let i = 0; i < R(40 * (1 - n)); i++) c.fillRect(R(BX - rx * .8 + (i * 37) % (rx * 1.6)), R(BY - ry * .7 + (i * 23) % (ry * 1.4)), 5, 4);   // crumbs that knead away
    if (s.type === 'knead' && S.tapT > 0) { c.fillStyle = '#f0c8a0'; ellF(c, BX + 20, BY - 40, 46, 30, '#f2c9a2'); ellF(c, BX + 40, BY - 30, 30, 20, '#e4b48e'); }   // the heel of a hand pressing
    if (s.type === 'rest') {
      if (S.covered) { c.save(); c.globalAlpha = .45; ellF(c, BX, BY, rx + 30, ry + 26, '#f4f8fa'); c.restore(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(BX - 90, BY - 40); c.lineTo(BX - 40, BY - 70); c.stroke(); }
      const cx_ = BX + 170, cy_ = BY - 120, v = S.v || 0;   // a kitchen timer
      ellF(c, cx_, cy_, 44, 44, '#d9372a'); ellF(c, cx_, cy_, 34, 34, '#fffaf0'); c.strokeStyle = '#2a2028'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx_, cy_); c.lineTo(cx_ + Math.sin(v * 6.28) * 26, cy_ - Math.cos(v * 6.28) * 26); c.stroke();
    }
  }
  if (s.type === 'roll' || s.type === 'cut') {
    const v = s.type === 'roll' ? (S.v || 0) : 1, rx = 110 + 110 * v, ry = 70 + 80 * v;
    ellF(c, BX, BY, rx, ry, '#efdcb4'); ellF(c, BX - 14, BY - 12, rx * .85, ry * .8, '#f6e8c8');
    if (s.type === 'roll') { const py = BY + Math.sin(t * (D.hold ? 9 : 0)) * ry * .6; c.fillStyle = '#c08048'; c.fillRect(BX - 200, R(py - 14), 400, 28); c.fillStyle = '#e0a868'; c.fillRect(BX - 200, R(py - 14), 400, 8); c.fillStyle = '#8a5028'; c.fillRect(BX - 236, R(py - 9), 36, 18); c.fillRect(BX + 200, R(py - 9), 36, 18); }
    else {
      for (let i = 0; i < 6; i++) { const x = BX + ((i % 3) - 1) * 120, y = BY + (Math.floor(i / 3) - .5) * 120; if (i < (S.n || 0)) { ellF(c, x, y, 46, 44, '#c99868'); ellF(c, x, y, 40, 38, '#d8aa78'); } else { c.strokeStyle = 'rgba(160,110,60,.5)'; c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); c.arc(x, y, 44, 0, 7); c.stroke(); c.setLineDash([]); } }
      const i = Math.min(5, S.n || 0), x = BX + ((i % 3) - 1) * 120, y = BY + (Math.floor(i / 3) - .5) * 120 - (S.tapT > 0 ? 0 : 14);   // the round cutter over the next spot
      c.strokeStyle = '#a8adb2'; c.lineWidth = 7; c.beginPath(); c.arc(x, y, 46, 0, 7); c.stroke(); c.strokeStyle = '#e4e8eb'; c.lineWidth = 2; c.beginPath(); c.arc(x - 2, y - 2, 46, 3.6, 4.6); c.stroke();
    }
  }
}
function drawHobPot(c, D, s, t) {   // a pot on the gas ring: stir while held, bubbles once it simmers
  const v = D.s.v || 0;
  c.fillStyle = '#2a2a2e'; c.fillRect(BX - 190, BY - 190, 380, 380); for (let a = 0; a < 6.28; a += .3) { c.fillStyle = '#5a9ae8'; c.fillRect(R(BX + Math.cos(a) * 150), R(BY + Math.sin(a) * 150), 6, 6); }
  ellF(c, BX + 8, BY + 10, 150, 150, 'rgba(0,0,0,.3)'); ellF(c, BX, BY, 150, 150, '#a8adb2'); ellF(c, BX, BY, 138, 138, '#d3d8db');
  c.fillStyle = '#7a8083'; c.fillRect(BX + 140, BY - 14, 120, 28);
  const col = s.col || '#e8e0d0'; ellF(c, BX, BY, 124, 124, shade(col, -10)); ellF(c, BX - 10, BY - 10, 104, 104, col);
  if (s.label === '煲红豆') { c.fillStyle = '#5a1a18'; for (let i = 0; i < 70; i++) { const a = i * 2.4 + v * 8, r = (i * 13) % 110; c.fillRect(R(BX + Math.cos(a) * r), R(BY + Math.sin(a) * r), 7, 5); } }
  if (s.label === '煲西米') { c.fillStyle = v > .6 ? '#f8fcfd' : '#ffffff'; for (let i = 0; i < 90; i++) { const a = i * 2.4 + v * 8, r = (i * 13) % 112; ellF(c, BX + Math.cos(a) * r, BY + Math.sin(a) * r, 4, 4, i % 3 ? '#f4f8fa' : '#dfe8ea'); } }
  if (v > .3) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const q = (t * 1.5 + i / 6) % 1; c.beginPath(); c.arc(BX - 60 + (i * 47) % 120, BY - 50 + (i * 31) % 100, 4 + q * 10, 0, 7); c.stroke(); } }
  const a = D.hold ? t * 6 : .8; c.fillStyle = '#b07a4a'; c.save(); c.translate(BX + Math.cos(a) * 60, BY + Math.sin(a) * 60); c.rotate(a + .9); c.fillRect(0, -6, 170, 12); c.fillStyle = '#d9a066'; c.fillRect(0, -6, 170, 4); c.restore();   // wooden spoon
}
function drawTeapot(c, D, s, t) {   // tea sock in a steel pot: the tea darkens while it steeps
  const v = Math.min(1.1, D.s.v || 0), tea = mixHex('#e8c890', '#5a2a10', Math.min(1, v));
  ellF(c, BX + 10, BY + 12, 150, 150, 'rgba(0,0,0,.25)'); ellF(c, BX, BY, 150, 150, '#a8adb2'); ellF(c, BX, BY, 138, 138, '#d3d8db'); ellF(c, BX, BY, 124, 124, tea);
  ellF(c, BX - 30, BY - 30, 50, 20, 'rgba(255,255,255,.25)');
  ellF(c, BX + 20, BY + 10, 70, 60, '#f4ead6'); ellF(c, BX + 20, BY + 10, 60, 50, mixHex('#f4ead6', '#6a3a18', Math.min(1, v) * .8));   // the cloth sock
  c.fillStyle = '#7a5030'; c.fillRect(BX + 80, BY - 90, 14, 110); c.fillStyle = '#7a8083'; c.fillRect(BX + 140, BY - 14, 120, 28);
  c.save(); c.globalAlpha = .5; for (let i = 0; i < 5; i++) { const q = (t * .5 + i / 5) % 1; ellF(c, BX - 60 + i * 30, BY - 60 - q * 60, 10 + q * 14, 10 + q * 14, '#ffffff'); } c.restore();
}
function drawPull(c, D, s, t) {   // 撞茶: tea poured high from one jug into the other and back
  const n = D.s.n || 0, from = n % 2 ? 1 : -1, tea = '#a86a3a';
  for (const sd of [-1, 1]) { const x = BX + sd * 150, y = BY + (sd === from ? -40 : 30), sc = sd === from ? 1.12 : 1;   // the pouring jug is held higher (bigger)
    ellF(c, x + 10, y + 12, 80 * sc, 80 * sc, 'rgba(0,0,0,.22)'); ellF(c, x, y, 80 * sc, 80 * sc, '#c9cdd0'); ellF(c, x, y, 70 * sc, 70 * sc, tea); ellF(c, x - 12, y - 12, 40 * sc, 28 * sc, mixHex(tea, '#f6e6c8', Math.min(.7, n * .12)));
    c.fillStyle = '#9aa0a3'; c.fillRect(R(x + sd * 70 * sc), R(y - 10), R(sd * 34), 20); }
  if (D.s.tapT > 0 || n === 0) { c.strokeStyle = tea; c.lineWidth = 8; c.beginPath(); c.moveTo(BX + from * 90, BY - 60); c.quadraticCurveTo(BX, BY - 200, BX - from * 120, BY + 10); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.stroke(); }
}
function drawDice(c, D, s, t) {   // mango on a chopping board: each tap is a chop, cubes pile up
  const n = D.s.n || 0;
  c.save(); c.globalAlpha = .22; c.fillStyle = '#3a2a20'; c.fillRect(BX - 182, BY - 122, 380, 260); c.restore();
  c.fillStyle = '#e8d8b8'; c.fillRect(BX - 190, BY - 130, 380, 260); c.fillStyle = '#f4e8cc'; c.fillRect(BX - 190, BY - 130, 380, 8);
  const left = 1 - n / TAP_N.dice; if (left > 0) { ellF(c, BX - 60, BY, 90 * left + 20, 60 * left + 14, '#f29a1a'); ellF(c, BX - 76, BY - 14, 60 * left + 10, 36 * left + 8, '#ffc24a'); }
  for (let i = 0; i < n * 6; i++) { const x = BX + 40 + (i % 6) * 22, y = BY - 50 + Math.floor(i / 6) * 22; c.fillStyle = '#f29a1a'; c.fillRect(x, y, 16, 16); c.fillStyle = '#ffd060'; c.fillRect(x, y, 16, 4); }
  const ky = BY - (D.s.tapT > 0 ? 10 : 70); c.fillStyle = '#d3d8db'; c.fillRect(BX - 20, R(ky - 60), 26, 140); c.fillStyle = '#ffffff'; c.fillRect(BX - 20, R(ky - 60), 4, 140); c.fillStyle = '#3a3236'; c.fillRect(BX - 22, R(ky - 120), 30, 60);
}
function drawPress(c, D, s, t) {   // a tall glass of tea from above: lemon slices pressed with a long spoon
  const n = D.s.n || 0;
  ellF(c, BX + 10, BY + 12, 120, 120, 'rgba(0,0,0,.22)'); ellF(c, BX, BY, 120, 120, '#e8f4f6'); ellF(c, BX, BY, 108, 108, mixHex('#c86a24', '#f2c060', n * .1));
  for (const [dx, dy] of [[-40, -20], [30, 30], [10, -46]]) { ellF(c, BX + dx, BY + dy, 30, 30, '#ffe24a'); ellF(c, BX + dx, BY + dy, 24 - n * 3, 24 - n * 3, '#fff6a8'); }
  const sy = D.s.tapT > 0 ? 0 : -16; c.fillStyle = '#c9cdd0'; ellF(c, BX + 10, BY + 10 + sy, 22, 16, '#c9cdd0'); c.fillRect(BX + 24, R(BY + sy), 150, 10);
  for (const [dx, dy] of [[-60, 30], [50, -30]]) { c.fillStyle = '#ffffff'; c.fillRect(BX + dx, BY + dy, 20, 18); }
}
function drawDeskDevice(c) {
  const D = DESK, R0 = RECIPES[D.p], t = D.t, O = D.oven;
  c.drawImage(WORKTOP(), 0, 80);
  c.drawImage(RACK(), 0, 84);
  ING_ORDER.forEach((k, i) => {   // the whole pantry in bins on the rack; this recipe's ingredients glow and lift a little
    const [x, y] = ingCell(i), lits = litIngs(D), need = lits.includes(k), used = D.got.includes(k) && !need, lit = need;
    if (lit) { c.save(); c.globalAlpha = .55 + .3 * Math.sin(t * 4); c.strokeStyle = '#ffe070'; c.lineWidth = 6; c.strokeRect(x + 2, y - 2, 76, 76); c.restore(); }
    if (D.anim && D.anim.k === k) return;
    const im = ingTop(k), s = Math.min(62 / im.width, 58 / im.height, 1);
    c.save(); if (used) c.globalAlpha = .35; else if (!need) c.globalAlpha = .75; putShadowed(c, im, x + 40, y + 36 - (lit ? 3 : 0), lit ? .2 : 0, s); c.restore();
  });
  const st = curStep(D) || {};
  if (['add', 'mix', 'weigh', 'sift'].includes(D.step)) {
    if (D.step === 'weigh') drawScale(c, D, st);
    putShadowed(c, BOWL(), BX, BY);
    drawContents(c, D, t);
    if (D.step === 'mix') drawWhisk(c, D, t);
    if (D.step === 'weigh') drawWeighPour(c, D, st, t);
    if (D.step === 'sift') drawSieve(c, D, t);
    drawPourAnim(c, D, t);
  } else if (['knead', 'rest', 'roll', 'cut'].includes(D.step)) drawDoughBoard(c, D, st, t);
  else if (D.step === 'stove') drawHobPot(c, D, st, t);
  else if (D.step === 'brew') drawTeapot(c, D, st, t);
  else if (D.step === 'pull') drawPull(c, D, st, t);
  else if (D.step === 'dice') drawDice(c, D, st, t);
  else if (D.step === 'press') drawPress(c, D, st, t);
  else if (!O || (O.ph === 'load' && O.t < .9) || O.ph === 'out') {   // tray of moulds on the worktop / sliding into the oven / back out
    let x = BX, y = BY, s = 1, done;
    if (O && O.ph === 'load') { const e = Math.min(1, O.t / .9); y = BY + (OV.wy + OV.wh / 2 - BY) * e; s = 1 - .62 * e; }
    if (O && O.ph === 'out') { const e = Math.min(1, Math.max(0, (O.t - .15) / .8)); y = OV.wy + OV.wh / 2 + (BY - OV.wy - OV.wh / 2) * e; s = O.t < .15 ? 0 : .38 + .62 * e; done = O.k; }
    if (s > 0) { c.save(); c.translate(x, y); c.scale(s, s); drawTrayAt(c, 0, 0, R0, D, done); c.restore(); }
    if (O && O.ph === 'out' && O.t > .2) {   // steam (oven) or cold mist (fridge) rising off the tray
      c.save(); for (let i = 0; i < 10; i++) { const q = ((O.t - .2) * .7 + i / 10) % 1; c.globalAlpha = .45 * (1 - q); c.fillStyle = R0.heat !== 'fridge' ? '#ffffff' : '#e8f8fc'; c.beginPath(); c.arc(x - 150 + (i % 5) * 75 + Math.sin(i + O.t * 3) * 8, y - 60 + Math.floor(i / 5) * 110 - q * 50, 10 + q * 26, 0, 7); c.fill(); } c.restore();
    }
    if (D.step === 'fill' && !O) {
      const [mx, my] = moldXY(Math.min(D.cur, 5));
      if (D.cur < 6 && Math.sin(t * 4) > -.4) { c.strokeStyle = C.gold; c.setLineDash([6, 6]); c.lineWidth = 3; c.beginPath(); c.arc(mx, my, VR[R0.vessel] + 10, 0, 7); c.stroke(); c.setLineDash([]); }
      if (D.foldAnim) { const [fx, fy] = moldXY(D.foldAnim.i), f = Math.min(1, D.foldAnim.t / .6); c.save(); c.translate(fx, fy); c.scale(1, Math.cos(f * Math.PI)); c.fillStyle = f < .5 ? '#efdcb4' : '#f8ecd4'; c.beginPath(); c.arc(0, 0, VR.disc, Math.PI, 0); c.fill(); c.restore(); }   // the dough flap folds over the filling
      if (R0.vessel !== 'disc' && D.cur < 6) {   // the jug, top view: round body, handle away from the mould, spout over it
        const jx = (D.jugX || mx) + 44, jy = (D.jugY || my) - 40, pouring = D.hold && Math.abs(D.jugX - mx) < 6;
        if (pouring) { c.strokeStyle = R0.fill; c.lineWidth = 5; c.beginPath(); c.moveTo(jx - 32, jy + 26); c.lineTo(mx + 2, my); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; const rr = 5 + (t * 30) % 12; c.beginPath(); c.arc(mx, my, rr, 0, 7); c.stroke(); }
        c.save(); c.globalAlpha = .22; c.fillStyle = '#3a2a20'; c.beginPath(); c.arc(jx + 10, jy + 10, 34, 0, 7); c.fill(); c.restore();
        c.fillStyle = '#c9d6dc'; c.fillRect(jx + 30, jy - 8, 22, 16); c.fillStyle = '#e8f2f6'; c.beginPath(); c.moveTo(jx - 22, jy + 10); c.lineTo(jx - 40, jy + 30); c.lineTo(jx - 14, jy + 22); c.fill();
        c.beginPath(); c.arc(jx, jy, 32, 0, 7); c.fill(); c.fillStyle = R0.fill; c.beginPath(); c.arc(jx + 2, jy + 2, 26 - (D.cur / 6) * 6, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(jx - 18, jy - 18, 10, 3);
      }
    }
  }
  drawOvenArea(c, D, R0, t);
}
function drawDesk(c) {
  const D = DESK;
  px(c, 0, 0, 360, 640, '#2f2430'); button(0, 0, 360, 640, () => {});
  px(c, 0, 40, 360, 2, '#1c141c');
  TS(c, '设计台', 12, 10, 16, '#fbe9c0');
  px(c, 300, 8, 52, 24, OUT); px(c, 301, 9, 50, 22, '#4a3a48'); T(c, '离开', 326, 14, '#fbe9c0', 'center', null); button(296, 4, 60, 32, () => { DESK = null; SFX.tap(); });
  if (D.mode === 'pick') {
    px(c, 0, 42, 360, 598, '#e9e3d3');
    T(c, '今晚想试做边款？', 180, 70, '#5a3f2e', 'center', null);
    D.list.forEach((p, i) => { const y = 100 + i * 96; card(c, 40, y, 280, 84, '#fffaf0'); full(c, PRODUCTS[p].img, 84, y + 42); TS(c, PRODUCTS[p].name, 124, y + 20, 18, '#3a2a2e'); T(c, RECIPES[p].tip, 124, y + 50, '#7a6250', 'left', null); button(40, y, 280, 84, () => { DESK = startRecipe(p); SFX.tap(); }); });
    if (!D.list.length) { T(c, '暂时冇新配方可以试。', 180, 160, '#5a3f2e', 'center', null); const nx = Object.keys(RECIPES).filter(p => !W.known[p]).sort((a, b) => PRODUCTS[a].day - PRODUCTS[b].day)[0]; if (nx) T(c, '第 ' + (PRODUCTS[nx].day - 1) + ' 天收工后可以试：' + PRODUCTS[nx].name, 180, 186, '#7a6250', 'center', null); }
    return;
  }
  const p = D.p, R0 = RECIPES[p], st = curStep(D) || D.flow[D.flow.length - 1];
  c.save(); c.scale(.5, .5); drawDeskDevice(c); c.restore();
  TS(c, PRODUCTS[p].name, 80, 10, 16, C.gold);
  { const n = D.flow.length, si = D.mode === 'done' ? n : D.si;   // the whole process: a dot per step, the current one named
    D.flow.forEach((q, i) => { const x = 150 + i * Math.min(14, 140 / n); px(c, x, 30, 9, 6, i < si ? '#6cb86c' : i === si ? C.gold : '#6a5a68'); });
    T(c, (Math.min(si + 1, n)) + '/' + n + ' ' + stepName(st, R0), 150, 12, C.gold, 'left', null); }
  ING_ORDER.forEach((k, i) => { const [x, y] = ingCell(i), need = D.mode === 'make' && litIngs(D).includes(k);
    const hot = need; px(c, x / 2 + 2, y / 2 + 39, 36, 14, hot ? '#fff0b0' : '#f4ead6'); px(c, x / 2 + 2, y / 2 + 52, 36, 1, '#b8a48a'); T(c, ING[k][0], x / 2 + 20, y / 2 + 40, hot ? '#b8342c' : '#6a5240', 'center', null);
    if (D.step === 'add' && D.mode === 'make') button(x / 2, y / 2 - 2, 40, 56, () => { if (need) addIngredient(k); else { D.msg = ING[k][0] + '今次唔使用'; SFX.deny(); } }); });
  const S = D.s, TN = TAP_N[D.step], line = D.step === 'weigh' ? '按住倒' + ING[st.k][0] + '，到 ' + st.g + 'g 就松手' : D.step === 'add' ? '点亮着的材料放入盆 ' + (S.got || []).length + '/' + st.ks.length
    : D.step === 'sift' ? '按住摇筛 ' + R((S.v || 0) * 100) + '%' : D.step === 'roll' ? '按住碾皮 ' + R((S.v || 0) * 100) + '%' : D.step === 'stove' ? '按住搅 ' + R((S.v || 0) * 100) + '%'
    : D.step === 'brew' ? '按住焗茶，茶色到绿格就松手' : D.step === 'rest' ? (S.covered ? stepName(st, R0) + '中…' : '点一下盖保鲜纸') : TN ? ({ knead: '连点搓面团', cut: '连点压出挞皮', pull: '连点来回撞茶', dice: '连点切粒', press: '连点压柠檬' })[D.step] + ' ' + (S.n || 0) + '/' + TN
    : D.step === 'mix' ? '按住 用打蛋器拌匀 ' + R(D.mix * 100) + '%' : D.step === 'fill' ? (R0.vessel === 'disc' ? '点一下 ' : '按住 ') + R0.verb + ' ' + Math.min(6, D.cur) + '/6' : !D.oven ? '点' + (R0.heat === 'oven' ? '烤箱入炉' : R0.heat === 'steam' ? '蒸柜入蒸' : '雪柜冷藏') : D.oven.ph === 'cook' ? '睇住颜色，到绿色就拎出嚟' : D.oven.ph === 'load' ? (R0.heat === 'fridge' ? '放入雪柜…' : R0.heat === 'steam' ? '入蒸柜…' : '入炉…') : R0.heat === 'oven' ? '好香！' : R0.heat === 'steam' ? '热辣辣！' : '冻冰冰！';
  px(c, 86, 250, 188, 20, 'rgba(255,250,240,.92)'); T(c, line, 180, 253, '#b8342c', 'center', null);
  if (D.msg) T(c, D.msg, 180, 274, '#7a6250', 'center', null);
  if (D.mode === 'make' && D.step === 'weigh') { const gr = R(S.grams || 0), dev = (S.grams || 0) / st.g; T(c, gr + ' g', 180, 422, dev > 1.1 ? '#b8342c' : '#1c3a24', 'center', null); T(c, '目标 ' + st.g + 'g', 180, 438, '#5a3f2e', 'center', null); }   // on the scale's display
  if (D.mode === 'make' && D.step === 'brew') { const v = S.v || 0, bx = 60, bw = 240, by = 420; px(c, bx - 2, by - 2, bw + 4, 14, OUT); for (let i = 0; i < bw; i++) px(c, bx + i, by, 1, 10, mixHex('#e8c890', '#5a2a10', i / bw)); px(c, bx + bw * .45, by - 4, bw * .33, 2, '#6cb86c'); px(c, bx + bw * .45, by + 12, bw * .33, 2, '#6cb86c'); px(c, R(bx + bw * Math.min(1, v)) - 1, by - 5, 3, 20, '#2f2430'); }
  if (D.mode === 'make' && (TN || (D.step === 'rest' && !S.covered))) { button(20, 290, 320, 170, deskTap); if (!(S.tapT > 0)) c.drawImage(HAND, 250, 380 + R(Math.abs(Math.sin(gtime * 6)) * -4)); }
  if (D.step === 'fill' && R0.vessel === 'disc' && D.cur < 6 && !D.foldAnim) { const [mx, my] = moldXY(D.cur); button(mx / 2 - 30, my / 2 - 30, 60, 60, () => { D.foldAnim = { i: D.cur, t: 0 }; SFX.tap(); }); c.drawImage(HAND, mx / 2 + 10, my / 2 + R(Math.abs(Math.sin(gtime * 4)) * -4)); }
  if (((HOLD_STEPS.includes(D.step) && D.step !== 'fill') || (D.step === 'fill' && R0.vessel !== 'disc')) && !D.hold) c.drawImage(HAND, 250, 380 + R(Math.abs(Math.sin(gtime * 4)) * -4));
  if (D.step === 'oven' && !D.oven) { button(OV.x / 2, OV.y / 2, OV.w / 2, OV.h / 2, () => { D.oven = { ph: 'load', t: 0, k: 0 }; SFX.tap(); }); c.drawImage(HAND, 260, 500 + R(Math.abs(Math.sin(gtime * 4)) * -4)); }
  if (D.oven && D.oven.ph === 'cook') {   // timing bar: the needle sweeps, the food in the window colours with it; stop it in the green
    const k = D.oven.k, bx = 30, bw = 300, by = 412;
    px(c, bx - 2, by - 2, bw + 4, 22, OUT); px(c, bx, by, bw, 18, '#e9806a'); px(c, bx + bw * .3, by, bw * .4, 18, '#f2c14e'); px(c, bx + bw * .42, by, bw * .16, 18, '#6cb86c');
    px(c, R(bx + bw * k) - 2, by - 6, 4, 30, '#2f2430');
    btn(c, 120, 368, 120, 34, R0.heat === 'fridge' ? '拎出嚟！' : '出炉！', () => { const d = Math.abs(k - .5); D.oven = { ph: 'out', t: 0, q: d < .08 ? 3 : d < .2 ? 2 : 1, k }; SFX.tap(); });
  }
  px(c, 0, 560, 360, 80, '#2f2430'); px(c, 0, 560, 360, 2, '#1c141c');
  px(c, 10, 576, 20, 20, C.gold); T(c, '?', 20, 579, '#2f2430', 'center', null); T(c, '小贴士：' + (st.tip || R0.tip), 38, 579, '#fbe9c0', 'left', null);   // this step's tip
  if (D.mode === 'make') btn(c, 250, 602, 100, 30, '帮我做', deskHelp, 'cream');
  if (D.mode === 'done') {   // result: three pieces on a plate (top view)
    c.save(); c.globalAlpha = .55; px(c, 0, 0, 360, 640, '#1c141c'); c.restore(); button(0, 0, 360, 640, () => {});
    card(c, 40, 150, 280, 300, '#fbf3e0'); px(c, 40, 150, 280, 34, '#b8483c'); TS(c, '研发成功！', 180, 156, 18, '#fff4dc', 'center');
    c.save(); c.scale(.5, .5); const s = mould(R0.vessel, 1, R0, 'baked');
    c.fillStyle = '#d8d2c6'; c.beginPath(); c.arc(366, 496, 118, 0, 7); c.fill(); c.fillStyle = '#f6f2ea'; c.beginPath(); c.arc(360, 490, 118, 0, 7); c.fill(); c.fillStyle = '#ece6da'; c.beginPath(); c.arc(360, 490, 84, 0, 7); c.fill();
    for (let i = 0; i < 3; i++) putShadowed(c, s, 360 + Math.cos(i * 2.09 - 1.57) * 44, 490 + Math.sin(i * 2.09 - 1.57) * 44);
    for (let i = 0; i < 6; i++) { const a = gtime * 2 + i; if (Math.sin(a * 3) > .3) { c.fillStyle = '#fff6b8'; c.fillRect(R(240 + i * 48), R(400 + Math.sin(a) * 20), 6, 6); } }
    c.restore();
    TS(c, PRODUCTS[p].name, 180, 318, 20, '#3a2a2e', 'center');
    T(c, '★'.repeat(D.quality) + '☆'.repeat(3 - D.quality), 180, 348, '#c99428', 'center', null);
    T(c, D.helped ? '有人帮手，下次自己试下！' : D.quality === 3 ? '手势一流！' : '几好，熟能生巧', 180, 368, '#7a6250', 'center', null);
    btn(c, 110, 400, 140, 36, '收好配方', closeDesk);
  }
}
// achievements that grow with the content: one per product, recipe, regular staff, upgrade, plus lifetime milestones
(function () {
  const add = a => { if (!ACH.some(b => b.id === a.id)) ACH.push(a); };
  for (const p of PIDS) add({ id: 'sell_' + p, name: PRODUCTS[p].name + '熟客', desc: '累计卖出 50 个' + PRODUCTS[p].name, test: () => soldTotal(p) >= 50, pts: 20 });
  for (const p of Object.keys(RECIPES)) add({ id: 'rd_' + p, name: '新品：' + PRODUCTS[p].name, desc: '研发成功' + PRODUCTS[p].name, test: () => !!W.known[p], pts: 15 });
  for (const [k, n] of [['kun', '坤伯'], ['lin', '莲姨'], ['wen', '雯姐'], ['shao', '阿少']]) add({ id: 'lv5_' + k, name: n + '满级', desc: n + '升到 5 级', test: () => lvOf(k) >= 5, pts: 40 });
  for (const k of Object.keys(UPGRADES)) add({ id: 'up_' + k, name: UPGRADES[k].lv[2][0], desc: '把' + UPGRADES[k].lv[0][0] + '升到第三级', test: () => upLv(k) >= 3, pts: 30 });
  for (const n of [200, 500, 1000]) add({ id: 'cust' + n, name: '街坊 ' + n, desc: '累计招呼 ' + n + ' 位客人', test: () => W.total.served >= n, pts: n / 10 });
  for (const n of [2000, 5000, 10000]) add({ id: 'cash' + n, name: '手头 $' + n, desc: '手上现金达到 $' + n, test: () => W.money >= n, pts: n / 50 });
  add({ id: 'rep45', name: '有口皆碑', desc: '店的名气达到 4.5', test: () => W.rep >= 4.5, pts: 60 });
  add({ id: 'season', name: '一季完成', desc: '捱完一季十二日', test: () => (W.stats.days || 0) >= SEASON_DAYS, pts: 100, money: 500 });
  add({ id: 'walls', name: '墙纸收藏家', desc: '买齐所有墙纸', test: () => Object.keys(WALLS).every(k => W.decor.walls[k]), pts: 40 });
  add({ id: 'booths', name: '卡座收藏家', desc: '买齐所有卡座款式', test: () => Object.keys(BOOTH_STYLES).every(k => W.decor.booths[k]), pts: 40 });
})();
