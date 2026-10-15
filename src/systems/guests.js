// ==== guests: which kinds of customer come (5 at first, more as the days go by and the shop grows), how loyal each kind is,
// and what they bring when they are very loyal; plus the little in-business stories (小剧场) — short, once each, one a day at most.
const GUEST_UNLOCK = [   // [index into GUEST_DEF, day it starts coming, shop level that also lets it come]
  [0, 1], [2, 1], [3, 1], [8, 1], [9, 1],
  [1, 3], [4, 3], [5, 4], [10, 4], [12, 5], [16, 5], [11, 6], [17, 6], [13, 8], [19, 8], [20, 10], [21, 10], [14, 12], [15, 12], [22, 12],
  [18, 16, 2], [23, 20, 3],
];
const guestOpen = ci => { const u = GUEST_UNLOCK.find(q => q[0] === ci); return !!u && W && (W.day >= u[1] || (u[2] && shopLv() >= u[2])); };
const guestPool = () => { const L = CUST_POOL.filter(guestOpen); return L.length ? L : [0, 2, 3, 8, 9]; };
const guestKind = ci => GUEST_DEF[ci] && GUEST_DEF[ci].name;
const LOYAL_STORY = 14;   // loyalty for the special scene + keepsake (the decoration gift comes at GIFT_AT = 8)
// keepsakes: what each kind brings at loyalty 14 — kept in the customer list, +1 comfort each
const KEEPSAKE = {
  '上班族': '公司送的保温杯', '白领姐姐': '手写下午茶推荐卡', '女学生': '亲手画的贴纸', '中学男生': '篮球比赛门票', '小男孩': '一颗玻璃弹珠', '小女孩': '蜡笔画的店铺',
  '街坊阿姨': '自家腌的柠檬', '婆婆': '手织的杯垫', '拐杖阿伯': '旧街坊合照', '潮人（男）': '限量版贴纸', '潮人（女）': '手绘帆布袋', '外国游客': '家乡明信片',
  '背包客': '旅行纪念徽章', '精壮工人': '一大袋自种的菜', '新鲜人': '第一张名片', '美艳人妻': '一束鲜花', '韩系女生': '韩国零食礼盒', '日系男生': '手作招财猫钥匙扣',
  '叛逆学生': '一张道歉卡', '严肃老师': '一支好钢笔', '西装金融男': '一瓶好茶叶',
};
// a special scene when a kind becomes a true regular (Mandarin; the Cantonese setting shows it in Traditional)
const LOYAL_TALK = {
  '上班族': [['cust', '每天上班前来一杯，已经三个月了。'], ['lin', '那我们记住你的口味：少甜，走冰。'], ['cust', '……被记住的感觉真好。']],
  '白领姐姐': [['cust', '我把你们的甜品放在公司群里，大家都说要来。'], ['hero', '谢谢你帮我们宣传！'], ['cust', '下午茶我包了。']],
  '女学生': [['cust', '老板，我们社团活动都来这里开会！'], ['qing', '我也是海棠中学的！'], ['cust', '真的？那我们是学姐学妹！']],
  '中学男生': [['cust', '打完球一定要来一杯冻柠茶。'], ['shao', '下次比赛我去帮你打气！'], ['cust', '好！输了也要请我喝。']],
  '小男孩': [['cust', '我考试一百分，妈妈说可以来吃蛋挞！'], ['kun', '（多放了一个）一百分，加一个。'], ['cust', '哇！']],
  '小女孩': [['cust', '我画了你们的店，送给你！'], ['hero', '画得真好，我贴在收银台。'], ['cust', '要贴高一点，大家都看得见！']],
  '街坊阿姨': [['cust', '我跟整条街都说了，这里的菠萝包最好。'], ['lin', '阿姨你是我们的金牌推销员！'], ['cust', '那下次给我留一个热的。']],
  '婆婆': [['cust', '以前我先生也最爱吃这种蛋挞。'], ['kun', '老做法，没变过。'], ['cust', '……就是这个味道。谢谢你。']],
  '拐杖阿伯': [['cust', '这条街开了又关，你们要撑下去啊。'], ['hero', '一定。'], ['cust', '我每天都来，帮你们撑场面。']],
  '潮人（男）': [['cust', '我拍的照片上了热门，好多人问在哪里。'], ['shao', '记得写街记冰室！'], ['cust', '早就写了，还标了位置。']],
  '潮人（女）': [['cust', '你们的杯子好有味道，可以出周边吗？'], ['hero', '周边？'], ['cust', '我帮你画！']],
  '外国游客': [['cust', 'My favourite place in Hong Kong!'], ['lin', '欢迎下次再来！'], ['cust', '多谢！我会带朋友来。']],
  '背包客': [['cust', '我去过很多城市，你们的奶茶排第一。'], ['wen', '撞七次，秘诀就这样。'], ['cust', '我写进我的旅行日记。']],
  '精壮工人': [['cust', '开工前吃一个菠萝油，一天都有力。'], ['kun', '牛油要厚。'], ['cust', '对！就是要厚！']],
  '新鲜人': [['cust', '我转正了！第一件事就是来这里庆祝。'], ['hero', '恭喜！今天这杯算我请。'], ['cust', '……你们真好。']],
  '美艳人妻': [['cust', '我老公说你们的蛋糕比酒店的还好吃。'], ['lin', '那下次一起来呀！'], ['cust', '他害羞，只敢叫我买回去。']],
  '韩系女生': [['cust', '我在网上分享了你们的芒果甜品。'], ['qing', '有多少人点赞？'], ['cust', '一千多！']],
  '日系男生': [['cust', '这个鸡蛋仔，很有昭和的感觉。'], ['hero', '昭和？'], ['cust', '就是……很怀旧、很温暖的意思。']],
  '叛逆学生': [['cust', '……上次我态度不好，对不起。'], ['lin', '知道就好，坐下吃吧。'], ['cust', '（小声）……谢谢。']],
  '严肃老师': [['cust', '我改作业累了就来这里坐一下。'], ['wen', '老师辛苦，给你少甜。'], ['cust', '……嗯，这杯批一百分。']],
  '西装金融男': [['cust', '市场每天都在变，这里的味道没变。'], ['hero', '我们会一直这样做。'], ['cust', '这种稳定，很难得。']],
};
function loyalStory(kind, ci) {   // the scene + keepsake, once per kind
  W.keepsakes = W.keepsakes || {}; if (W.keepsakes[kind]) return;
  W.keepsakes[kind] = W.day; const talk = (LOYAL_TALK[kind] || [['cust', '谢谢你们一直以来的照顾。']]).filter(([w]) => !HIRE[w] || W.staff[w].hired);
  STORY_Q.push({ key: 'loyal', ci, lines: [[null, '老熟客·' + kind]].concat(talk).concat([[null, '收到「' + (KEEPSAKE[kind] || '一份心意') + '」，摆在店里了（舒适 +1）']]) });
  setTimeout(() => applyDecor(), 0);   // it goes on the wall board or the glass case
  NOTICES.push('老熟客' + kind + '送了「' + (KEEPSAKE[kind] || '一份心意') + '」'); SFX.ding();
}
// ---------------------------------------------------------------- 小剧场: short in-business moments
const EPISODES = [
  { id: 'pineapple', ok: () => true, lines: [['cust', '菠萝包……菠萝在哪里？'], ['kun', '名字负责像，包负责好吃。'], ['cust', '……有道理。']] },
  { id: 'sister', ok: () => true, ci: 0, lines: [['lin', '哎哟，带女朋友来呀？'], ['cust', '这是我姐姐。'], ['lin', '一样漂亮！一样漂亮！']] },
  { id: 'kidcoin', ok: () => W.day >= 3, ci: 4, lines: [['cust', '我只有五块……可以买吗？'], ['kun', '（递过去一个蛋挞）下次再来。'], ['cust', '谢谢伯伯！']] },
  { id: 'cat', ok: () => W.day >= 4, lines: [[null, '一只橘猫在门口探头探脑。'], ['lin', '又是你？只能闻，不能吃。'], [null, '橘猫：「喵。」（坐下不走了）']] },
  { id: 'queue', ok: () => queueLen() >= 3, lines: [['cust', '奶茶还热的时候我就排了，现在想喝冻的。'], ['hero', '马上就好！'], [null, '（收银太慢的话，账本里可以换收银机）']] },
  { id: 'firstday', ok: () => W.staff.temp.hired, lines: [['temp', '请问堂食还是外带？'], ['cust', '（举着外带袋）你猜？'], ['temp', '……外带，马上来！']] },
  { id: 'rush', ok: () => W.staff.wen.hired, lines: [['wen', '三杯冻奶茶、两杯鸳鸯、一杯柠檬茶——'], ['wen', '（深呼吸）……好，一杯一杯来。'], ['lin', '雯姐，你的手比计算机还快。']] },
  { id: 'qingpush', ok: () => W.staff.qing.hired, lines: [['qing', '今天听我的，试试新品！'], ['cust', '我只是想要杯热奶茶……'], ['qing', '……好吧，热奶茶一杯。']] },
  { id: 'shaotrouble', ok: () => W.staff.shao.hired && W.day >= 6, fx: 'shao', ci: 19, cname: '咏欣', lines: [[null, '一个女生冲进店里。'], ['cust', '阿少！你说周末请我看戏的呢？'], ['shao', '我……我记得的！'], ['lin', '又来了。（阿少要分心一阵子）']] },
  { id: 'yaotaste', ok: () => W.staff.yao.hired, ci: 8, lines: [['yao', '可可浓度是不是太高了？'], ['cust', '好吃，但可以切大块一点吗？'], ['yao', '（写在本子上）……大块一点。']] },
  { id: 'umbrella', ok: () => !!wxOf().rain, lines: [['cust', '伞放哪里？'], ['lin', '门口那个桶！别滴到地上！'], [null, '（下雨天地上容易脏，记得派人打扫）']] },
  { id: 'regular', ok: () => Object.values(W.fans || {}).some(v => v >= 5), lines: [['cust', '老样子！'], ['hero', '马上来！'], ['lin', '老板现在连客人的「老样子」都记得了。']] },
];
let EP_BANNER = null;   // { ep, t } — the bar at the top inviting the player to watch
function stepEpisodes(dt) {
  if (!W || !isOpenPhase()) return; W.eps = W.eps || {};
  if (EP_BANNER) { EP_BANNER.t += dt; if (EP_BANNER.t > 14) EP_BANNER = null; return; }   // ignored: it may come back another day
  const T = W.today; if (T.epAt === undefined) T.epAt = rng() < .4 ? 40 + rng() * (OPEN_LEN * .6) : -1;   // about one day in three
  if (T.epAt < 0 || clockOpen < T.epAt || T.epDone) return;
  const ep = EPISODES.find(e => !W.eps[e.id] && e.ok()); T.epDone = true; if (!ep) return;
  EP_BANNER = { ep, t: 0 }; SFX.ding();
}
function playEpisode(ep) {
  EP_BANNER = null; W.eps[ep.id] = W.day;
  const ci = ep.ci != null ? ep.ci : pick(guestPool());   // who's in it: the episode's own customer, or one of today's kinds
  STORY_Q.push({ key: 'ep', ci, cname: ep.cname, lines: [[null, '小剧场']].concat(ep.lines) });
  if (ep.fx === 'shao') W.today.shaoSlowUntil = clockOpen + 45;   // 阿少 distracted for a while: works slower
}

// ---------------------------------------------------------------- 荣叔 drops by: ingredients 20% off today; small talk with 坤伯 (they go way back) and the owner
const RONG_TALK = [
  [['rong', '老坤！今天牛油到货多，全场八折。'], ['kun', '你每次都说多。'], ['rong', '这次是真的多！'], ['hero', '那我多订一点。']],
  [['rong', '还记得七几年我们在庙街抢鸡蛋吗？'], ['kun', '是你抢，我付钱。'], ['rong', '哈哈，所以今天算你便宜。']],
  [['rong', '老板，坤伯年轻时烤焦过一整盘蛋挞。'], ['kun', '……那是炉坏了。'], ['rong', '炉坏了四十年？'], ['hero', '（偷笑）']],
  [['rong', '面粉、糖、鸡蛋，今天都八折。'], ['hero', '荣叔怎么这么好？'], ['rong', '看在老坤的面子上。'], ['kun', '哼，他是想来喝奶茶。']],
  [['rong', '以前这条街有七间冰室，现在剩你们一间。'], ['kun', '剩下的，才是好的。'], ['rong', '……你还是这么嘴硬。'], ['rong', '今天进货打八折，撑住！']],
  [['rong', '老坤，你那个旧烤炉还在用？'], ['kun', '用了三十年，比你可靠。'], ['rong', '哈哈哈！老板，今天材料八折，别客气。']],
  [['rong', '我刚入行时，老坤教我分辨好牛油。'], ['hero', '真的吗？'], ['kun', '他学了三年才学会。'], ['rong', '……所以今天打折谢师。']],
  [['rong', '下雨天生意淡，我的货也卖不完。'], ['rong', '老板，帮帮忙，今天全部八折。'], ['kun', '他就是想早点收工。']],
  [['rong', '老坤，阿珍问你好。'], ['kun', '……嗯。'], ['rong', '就一个「嗯」？我帮你带话带了二十年。'], ['hero', '阿珍是谁？'], ['kun', '做事做事。']],
  [['rong', '老板，你跟你外公一样，开门前先擦柜台。'], ['hero', '你认识我外公？'], ['rong', '当然，我和老坤都是看着这间店长大的。'], ['rong', '今天进货八折，算是请你外公喝茶。']],
];
function rongVisit() {   // once a morning at most; walks through the talks in order so they don't repeat
  WALKERS.push({ ch: STAFF_HD.rong, y: 338, dir: -1, v: 20, x: 720, dist: 0, temp: true });   // pushing his cart past the door
  W.rongN = W.rongN || 0; const talk = RONG_TALK[W.rongN % RONG_TALK.length]; W.rongN++; W.today.rongSale = true;
  STORY_Q.push({ key: 'rong', lines: [[null, '荣叔推着货车经过门口。']].concat(talk).concat([[null, '今天荣叔材料店进货八折']]) });
}

// ---------------------------------------------------------------- who they are (tap a card in the customer list)
const GUEST_BIO = {
  '上班族': '在附近保险公司做了八年，每天 8:45 准时出现。口头禅是「快点快点，要打卡」。',
  '白领姐姐': '广告公司的客户经理，嘴上说减肥，下午三点一定来买甜点「提神」。',
  '女学生': '海棠中学中四生，美术学会成员，最爱和同学挤一张卡座做功课。',
  '中学男生': '校篮球队后卫，放学打完球满身大汗冲进来，一口气喝完一杯冻柠茶。',
  '小男孩': '住在楼上的小学生，零用钱不多，每次都先数清楚硬币才敢点餐。',
  '小女孩': '小男孩的妹妹，喜欢画画，常常把店里每个人都画进她的图画本。',
  '街坊阿姨': '街市卖菜档的老板娘，消息最灵通，整条街的八卦都从她这里传开。',
  '婆婆': '在这条街住了五十年，先生走后每天下午来坐坐，只点一杯热奶茶。',
  '拐杖阿伯': '退休的老报贩，见证过这条街的兴衰，最爱跟坤伯聊当年。',
  '潮人（男）': '街头摄影师，到处找「有味道」的老店拍照，粉丝不少。',
  '潮人（女）': '插画师兼小店店主，看到好看的杯子和招牌就走不动。',
  '外国游客': '第一次来香港背包旅行，旅游书上说「一定要试港式奶茶」。',
  '背包客': '辞职环游世界的旅人，每到一个城市都要找当地人去的冰室。',
  '精壮工人': '附近地盘的扎铁师傅，开工前一定要吃个热辣辣的菠萝油。',
  '新鲜人': '刚毕业的社会新鲜人，还在试用期，每天都很紧张，很需要一杯奶茶。',
  '美艳人妻': '住在半山的太太，嘴刁，但对这里的蛋糕赞不绝口。',
  '韩系女生': '来香港交换的大学生，在网上分享港式甜品，很会拍照。',
  '日系男生': '喜欢昭和风和老东西的设计学生，觉得冰室是「活着的博物馆」。',
  '叛逆学生': '表面很凶的染发学生，其实家里没人煮饭，常常一个人来吃。',
  '严肃老师': '隔壁中学的中文老师，改作业时一定要有一杯少甜奶茶。',
  '西装金融男': '中环投资银行的分析师，周末才有空来，说这里「比较踏实」。',
};
// how each keepsake looks in the shop: 'w' = pinned on the regulars' board (left wall), 'c' = on top of the front glass case
const KEEP_ART = {
  '上班族': ['c', 'flask', '#3f86d6'], '白领姐姐': ['w', 'card', '#e88aa0'], '女学生': ['w', 'sticker', '#ffd23f'], '中学男生': ['w', 'ticket', '#e5604f'],
  '小男孩': ['c', 'marble', '#5ab0e0'], '小女孩': ['w', 'drawing', '#f590b0'], '街坊阿姨': ['c', 'jar', '#f2d23a'], '婆婆': ['c', 'coaster', '#c8344a'],
  '拐杖阿伯': ['w', 'photo', '#8a6a4a'], '潮人（男）': ['w', 'sticker', '#b9a8e0'], '潮人（女）': ['w', 'bag', '#efe6d0'], '外国游客': ['w', 'postcard', '#7fc4e8'],
  '背包客': ['w', 'badge', '#5aa05a'], '精壮工人': ['c', 'veg', '#4f9a3a'], '新鲜人': ['w', 'card', '#dfe8f4'], '美艳人妻': ['c', 'flowers', '#e8402a'],
  '韩系女生': ['c', 'box', '#f5a0c0'], '日系男生': ['c', 'keychain', '#fbf6ea'], '叛逆学生': ['c', 'standcard', '#fff4dc'], '严肃老师': ['c', 'pen', '#2a2a32'], '西装金融男': ['c', 'tin', '#2f6e56'],
};
const keepList = t => Object.keys(W && W.keepsakes || {}).filter(k => KEEP_ART[k] && KEEP_ART[k][0] === t);

// ---------------------------------------------------------------- first visit: a kind of customer starts coming — a short scene (one a morning; the rest just a notice)
const FIRST_TALK = {
  '白领姐姐': [['cust', '同事说这里的下午茶很正，我来验收一下。'], ['lin', '验收合格的话，记得帮我们宣传呀。'], ['cust', '先看看蛋挞够不够滑。']],
  '小男孩': [['cust', '（踮起脚）老板，蛋挞多少钱？'], ['hero', '八块。你够高看到柜台吗？'], ['cust', '够！我每天都长高的！']],
  '小女孩': [['cust', '哥哥说这里的布丁会抖抖抖。'], ['kun', '……（轻轻摇了一下）'], ['cust', '真的抖了！']],
  '拐杖阿伯': [['cust', '这间店……以前是我年轻时常来的。'], ['kun', '阿伯，你记性好。'], ['cust', '换了老板，招牌还在就好。']],
  '潮人（女）': [['cust', '这个招牌字体好正！可以拍照吗？'], ['hero', '随便拍，记得买杯奶茶。'], ['cust', '当然，杯子也要入镜。']],
  '精壮工人': [['cust', '老板，有没有大件一点的菠萝包？'], ['kun', '大件没有，可以吃两个。'], ['cust', '哈哈，好，两个！']],
  '潮人（男）': [['cust', '（咔嚓）这个灯光，这个旧瓷砖……'], ['lin', '先生，你是来吃东西还是来拍戏？'], ['cust', '都是！']],
  '新鲜人': [['cust', '请问……这里可以坐着做简历吗？'], ['hero', '可以，奶茶续杯也可以。'], ['cust', '谢谢！我一定会找到工作的！']],
  '外国游客': [['cust', 'Hello! 港式奶茶，one please!'], ['wen', '冻定热？Hot or cold？'], ['cust', 'Cold! 冻……冻奶茶！']],
  '韩系女生': [['cust', '哇，这个蛋挞好可爱，我要拍一下。'], ['qing', '我教你，要这个角度拍。'], ['cust', '真的好看很多！']],
  '日系男生': [['cust', '这些瓷砖……是六十年代的吧？'], ['kun', '比你年纪大。'], ['cust', '太好了，就是要这种感觉。']],
  '叛逆学生': [['cust', '……随便来一份，快点。'], ['lin', '「随便」没有卖，要不要试蛋挞？'], ['cust', '……好啦，蛋挞。']],
  '背包客': [['cust', '我在地图上找「本地人去的店」，就找到这里。'], ['hero', '那你找对了。'], ['cust', '先来一杯最有名的！']],
  '严肃老师': [['cust', '你们的价目表，「挞」字写错了一笔。'], ['lin', '……老师眼力真好。'], ['cust', '不过奶茶冲得不错，及格。']],
  '美艳人妻': [['cust', '听说这里的蛋糕不输酒店？'], ['hero', '请您试一下。'], ['cust', '……嗯，确实可以。']],
  '西装金融男': [['cust', '我只有十五分钟，有什么最快？'], ['wen', '冻柠茶，十秒。'], ['cust', '……真的十秒。有效率。']],
};
function newGuests() {
  const pool = guestPool().map(guestKind); if (!W.met) { W.met = {}; for (const k of pool) W.met[k] = 1; return; }   // a new or old save: everyone already here counts as met
  const fresh = [...new Set(pool.filter(k => !W.met[k]))]; if (!fresh.length) return;
  for (const k of fresh) W.met[k] = W.day;
  const k0 = fresh.find(k => FIRST_TALK[k]), ci = k0 && GUEST_DEF.findIndex(g => g.name === k0);
  if (k0) STORY_Q.push({ key: 'newguest', ci, lines: [[null, '新客人：' + k0 + '第一次来光顾。']].concat(FIRST_TALK[k0].filter(([w]) => !HIRE[w] || W.staff[w].hired)) });
  for (const k of fresh) if (k !== k0) notice('新客人：' + k + '开始来光顾');
}
