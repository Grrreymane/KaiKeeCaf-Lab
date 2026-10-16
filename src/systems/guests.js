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
  '上班族': [['cust', '每天上班前来一杯，已经三个月了。'], ['lin', '那我们记住你的口味啦：少甜，走冰~'], ['cust', '……被记住的感觉真好。']],
  '白领姐姐': [['cust', '我把你们的甜品放在公司群里，大家都说要来。'], ['hero', '谢谢你帮我们宣传呀！'], ['cust', '下午茶我包了。']],
  '女学生': [['cust', '老板，我们社团活动都来这里开会！'], ['qing', '我也是海棠中学的！好巧~'], ['cust', '真的？那我们是学姐学妹！']],
  '中学男生': [['cust', '打完球一定要来一杯冻柠茶。'], ['shao', '下次比赛……我去看。'], ['cust', '好！输了也要请我喝。']],
  '小男孩': [['cust', '我考试一百分，妈妈说可以来吃蛋挞！'], ['kun', '（多放了一个）一百分，加一个嘛。'], ['cust', '哇！']],
  '小女孩': [['cust', '我画了你们的店，送给你！'], ['hero', '画得真好，我贴在收银台上~'], ['cust', '要贴高一点，大家都看得见！']],
  '街坊阿姨': [['cust', '我跟整条街都说了，这里的菠萝包最好。'], ['lin', '阿姨你是我们的金牌推销员呀！'], ['cust', '那下次给我留一个热的。']],
  '婆婆': [['cust', '以前我先生也最爱吃这种蛋挞。'], ['kun', '……老做法，没变过。'], ['cust', '……就是这个味道。谢谢你。']],
  '拐杖阿伯': [['cust', '这条街开了又关，你们要撑下去啊。'], ['hero', '一定会的！'], ['cust', '我每天都来，帮你们撑场面。']],
  '潮人（男）': [['cust', '我拍的照片上了热门，好多人问在哪里。'], ['shao', '……记得拍到招牌就好。'], ['cust', '早就写了，还标了位置。']],
  '潮人（女）': [['cust', '你们的杯子好有味道，可以出周边吗？'], ['hero', '周边？（惊）'], ['cust', '我帮你画！']],
  '外国游客': [['cust', 'My favourite place in Hong Kong!'], ['lin', '欢迎下次再来哦！'], ['cust', '多谢！我会带朋友来。']],
  '背包客': [['cust', '我去过很多城市，你们的奶茶排第一。'], ['wen', '撞七次，秘诀就是这样啦。'], ['cust', '我写进我的旅行日记。']],
  '精壮工人': [['cust', '开工前吃一个菠萝油，一天都有力。'], ['kun', '……牛油要厚。'], ['cust', '对！就是要厚！']],
  '新鲜人': [['cust', '我转正了！第一件事就是来这里庆祝。'], ['hero', '恭喜！今天这杯算我请~'], ['cust', '……你们真好。']],
  '美艳人妻': [['cust', '我老公说你们的蛋糕比酒店的还好吃。'], ['lin', '那下次一起来呀，我们不笑他~'], ['cust', '他害羞，只敢叫我买回去。']],
  '韩系女生': [['cust', '我在网上分享了你们的芒果甜品。'], ['qing', '有多少人点赞呀？'], ['cust', '一千多！']],
  '日系男生': [['cust', '这个鸡蛋仔，很有昭和的感觉。'], ['hero', '昭和是什么感觉？'], ['cust', '就是……很怀旧、很温暖的意思。']],
  '叛逆学生': [['cust', '……上次我态度不好，对不起。'], ['lin', '知道就好啦，坐下吃吧。'], ['cust', '（小声）……谢谢。']],
  '严肃老师': [['cust', '我改作业累了就来这里坐一下。'], ['wen', '老师辛苦了，给你少甜哦。'], ['cust', '……嗯，那这杯批一百分。']],
  '西装金融男': [['cust', '市场每天都在变，这里的味道没变。'], ['hero', '我们会一直这样做下去的。'], ['cust', '这种稳定，很难得。']],
};
function loyalStory(kind, ci, now) {   // the scene + keepsake, once per kind (earned during the day; it plays before or after work)
  W.keepsakes = W.keepsakes || {}; if (W.keepsakes[kind]) return;
  if (!now) { W.loyalQ = W.loyalQ || []; if (!W.loyalQ.some(q => q[0] === kind)) W.loyalQ.push([kind, ci]); return; }
  W.keepsakes[kind] = W.day; const talk = (LOYAL_TALK[kind] || [['cust', '谢谢你们一直以来的照顾。']]).filter(([w]) => !HIRE[w] || W.staff[w].hired);
  STORY_Q.push({ key: 'loyal', ci, lines: [[null, '老熟客·' + kind]].concat(talk).concat([[null, '收到「' + (KEEPSAKE[kind] || '一份心意') + '」，摆在店里了（舒适 +1）']]) });
  setTimeout(() => applyDecor(), 0);   // it goes on the wall board or the glass case
  NOTICES.push('老熟客' + kind + '送了「' + (KEEPSAKE[kind] || '一份心意') + '」'); SFX.ding();
}
// ---------------------------------------------------------------- 小剧场: short in-business moments
const EPISODES = [
  { id: 'pineapple', ok: () => true, lines: [['cust', '菠萝包……菠萝在哪里？'], ['kun', '名字负责像……包负责好吃。'], ['cust', '……有道理。']] },
  { id: 'sister', ok: () => true, ci: 0, lines: [['lin', '哎哟，带女朋友来呀？嘻嘻。'], ['cust', '...这是我姐姐。'], ['lin', '一样漂亮！一样漂亮！']] },
  { id: 'kidcoin', ok: () => W.day >= 3, ci: 4, lines: [['cust', '我只有五块……可以买吗？'], ['kun', '（递过去一个蛋挞）……下次再来吧。'], ['cust', '哇，谢谢伯伯！']] },
  { id: 'cat', ok: () => W.day >= 4, lines: [[null, '一只橘猫在门口探头探脑。'], ['lin', '又是你？只能闻，不能吃哦。'], [null, '橘猫：「喵。」（坐下不走了）']] },
  { id: 'queue', ok: () => queueLen() >= 3, lines: [['cust', '奶茶还热的时候我就排了，现在想喝冻的。'], ['hero', '马上就好！稍等一下~'], [null, '（收银太慢的话，账本里可以换收银机）']] },
  { id: 'firstday', ok: () => W.staff.temp.hired, lines: [['temp', '请问堂食还是外带？'], ['cust', '（举着外带袋）你猜？'], ['temp', '……外带，马上来！']] },
  { id: 'rush', ok: () => W.staff.wen.hired, lines: [['wen', '三杯冻奶茶、两杯鸳鸯、一杯柠檬茶——'], ['wen', '（深呼吸）……好，一杯一杯来。'], ['lin', '雯姐，你的手比电脑还快呀！']] },
  { id: 'qingpush', ok: () => W.staff.qing.hired, lines: [['qing', '今天听我的，试试新品嘛~'], ['cust', '我只是想要杯热奶茶……'], ['qing', '……好吧，热奶茶一杯。（委屈）']] },
  { id: 'shaotrouble', ok: () => W.staff.shao.hired && W.day >= 6 && W.eps && W.eps.shao1, fx: 'shao', ci: 24, cname: '阿千', lines: [[null, '阿千又冲进店里。'], ['cust', '阿少！周末的电影你到底去不去嘛！'], ['shao', '……不去。'], ['cust', '（鼓起脸）那我就坐在这里等到你去！'], ['shao', '（叹气，递上一杯热奶茶）……先喝。慢慢说。'], ['cust', '……（脸红）哼，好吧。'], ['lin', '又来了……（阿少要陪她一阵子）']] },
  { id: 'richfriend', ok: () => W.staff.wen.hired && W.day >= 5, ci: 18, cname: '雯姐的朋友', fx: 'rich', lines: [[null, '几位打扮讲究的太太走进店里。'], ['cust', '阿雯！原来你真的在这里打工！'], ['wen', '（压低声音）！你们...照样排队哦。'], ['cust', '那我们每样来两份，全部外带！'], [null, '（雯姐的朋友一口气买了好多...）']] },
  { id: 'fans', ok: () => W.staff.shao.hired && W.day >= 8, ci: 2, cname: '女学生', fx: 'fans', lines: [[null, '两个女学生在门口探头探脑。'], ['cust', '（小声）就是他……真的是他！'], ['shao', '（竖起手指）嘘……要买蛋挞吗？'], ['cust', '要！要十个！'], ['lin', '……阿少，你到底是谁啊？']] },
  { id: 'yaotaste', ok: () => W.staff.yao.hired, ci: 8, lines: [['yao', '可可浓度……是不是太高了？'], ['cust', '好吃，但可以切大块一点吗？'], ['yao', '（写在本子上）……大块一点。']] },
  { id: 'umbrella', ok: () => !!wxOf().rain, lines: [['cust', '伞放哪里？'], ['lin', '门口那个桶！别滴到地上呀！'], [null, '（下雨天地上容易脏，记得派人打扫）']] },
  { id: 'regular', ok: () => Object.values(W.fans || {}).some(v => v >= 5), lines: [['cust', '老样子！'], ['hero', '马上来~'], ['lin', '老板现在连客人的「老样子」都记得了，厉害哦。']] },
  { id: 'cousin', ok: () => W.day >= 4, ci: 18, cname: '表姐', lines: [['cust', '（推门）哇，真的开起来了！我还以为你说着玩的。'], ['hero', '表姐！你怎么来了？'], ['cust', '你妈说你最近瘦了，叫我来看看。'],
    ['cust', '（吃了一口蛋挞）……嗯，跟小时候吃的比，还差一点点。'], ['hero', '（委屈）就一点点？'], ['cust', '（拍拍你的肩）一点点，已经很厉害啦。加油！']] },
  { id: 'unimate', ok: () => W.day >= 8, ci: 0, cname: '大学同学阿文', lines: [['cust', '老同学！我在网上看到你的店了！'], ['hero', '阿文！你不是在投行上班吗？'], ['cust', '是啊，天天加班到半夜……（看着店里）你这里，真好。'],
    ['cust', '以前上课你就一直说想开冰室，没想到你真的做到了。'], ['hero', '……还在努力啦。'], ['cust', '给我来十个菠萝包，我拿回公司，跟大家说这是我朋友开的！']] },
  { id: 'emma', ok: () => W.day >= 11, ci: 13, cname: 'Emma', lines: [['cust', 'Surprise! 我来香港出差，第一站就是你的店！'], ['hero', '（惊）Emma！你怎么找到的？'], ['cust', '你天天在网上发蛋挞照片呀~'],
    ['cust', '冻……冻奶茶！我练习了很久！'], ['cust', '（喝了一口）Oh my god……比伦敦那家贵十倍的还好喝。'], ['cust', 'You should be proud. 你做的是一件很美的事。'], ['hero', '……谢谢你，Emma。']] },
];

// ---------------------------------------------------------------- 中插连续剧: longer episodes in parts, about the people and how they get on;
// a part comes a couple of days after the one before, so the story threads through the weeks between the one-off moments
const epSeen = (id, gap = 2) => () => W.eps && W.eps[id] && W.day - W.eps[id] >= gap;
const hired = k => W.staff[k] && W.staff[k].hired;
const EP_ARCS = [
  // 阿少的心事 — the florist who comes every Wednesday, and the past he doesn't talk about
  { id: 'shao1', arc: '阿少的心事', part: 1, ok: () => hired('shao') && W.day >= 6, ci: 24, cname: '阿千', lines: [
    [null, '花店的咏欣照例送来一束白色桔梗。阿少微笑着道谢，替她拉开门。'], [null, '门还没关上，一个短发女生就冲了进来。'], ['cust', '阿少！我又来啦！今天有什么新品？'],
    ['shao', '……没有。'], ['cust', '那我要上次那个！你推荐的那个！'], ['shao', '……冻柠茶，少冰。（已经在做了）'],
    ['lin', '（小声）对咏欣那么有礼貌，对阿千这么冷淡……'], ['wen', '（小声）可是你看他的眼睛。'], ['cust', '（喝一口）好喝！明天见！'],
    ['shao', '……（看着她跑出门，直到看不见）']] },
  { id: 'shao2', arc: '阿少的心事', part: 2, ok: () => hired('shao') && epSeen('shao1')(), lines: [
    [null, '收银台旁边放着一本旧杂志，封面是一个拿着麦克风的年轻歌手。'], ['lin', '（举起杂志）阿少！这个人……这个人跟你一模一样啊！'],
    ['shao', '……是吗。'], ['lin', '「林少恒，一年前退出乐坛，至今下落不明」……少恒？阿少？'], ['shao', '（把杂志轻轻合上）莲姨，那个人已经不唱了。'],
    ['lin', '……（惊）那、那就是说——'], ['shao', '今天的蛋挞出炉了。我去摆。'], ['lin', '（小声）我什么都没看见，什么都没看见……']] },
  { id: 'shao3', arc: '阿少的心事', part: 3, ok: () => hired('shao') && epSeen('shao2')() && epSeen('ex2', 1)() && !!wxOf().rain, ci: 24, cname: '阿千', bg: 'rain', lines: [
    [null, '下雨了。阿千站在门口，没有带伞。'], ['shao', '（把伞塞到她手里）……拿去。'], ['cust', '那你呢？'], ['shao', '我等雨停。'],
    ['cust', '……阿少，莲姨说你以前是歌手。'], ['shao', '……她说得太快了。'], ['cust', '为什么不唱了？'],
    ['shao', '每天都被很多人看着，看到最后……忘了自己长什么样。'], ['shao', '这里不一样。这里的人只问我，蛋挞还有没有。'],
    ['cust', '……那我也不问了。'], ['cust', '（撑开伞）明天见！'], ['shao', '（很小声）……嗯，明天见。']] },
  { id: 'shao4', arc: '阿少的心事', part: 4, ok: () => hired('shao') && epSeen('shao3', 3)(), ci: 24, cname: '阿千', lines: [
    [null, '阿千像往常一样冲进店里。'], ['cust', '阿少！今天的冻柠茶——'], ['shao', '（已经放在柜台上）少冰。'], ['cust', '……诶？你记得？'],
    ['shao', '我不太会说话，以前的歌词都是别人写的。'], ['shao', '所以……这次我想自己说。'], ['shao', '阿千，周末一起去看海吧。'],
    ['cust', '（惊）……（用力点头）嗯！'], ['wen', '（压低声音）莲姨，你别哭啊。'], ['lin', '（擦眼泪）我没有……是洋葱……'], ['kun', '……今天没切洋葱。']] },
  // 坤伯与阿珍 — what 荣叔 has been carrying for twenty years
  { id: 'jan1', arc: '坤伯与阿珍', part: 1, ok: () => W.day >= 7 && (W.rongN || 0) >= 1, lines: [
    [null, '午后，荣叔又路过，探头进来。'], ['rong', '老坤，阿珍下个月从加拿大回来。'], ['kun', '……嗯。'],
    ['lin', '（眼睛一亮）阿珍是谁呀？坤伯的什么人？'], ['rong', '嘿嘿，这个嘛——'], ['kun', '荣仔，你的货车挡住门口了。'],
    ['rong', '好好好，我走我走！'], ['lin', '（小声）坤伯，你耳朵红了哦~'], ['kun', '……炉子热。']] },
  { id: 'jan2', arc: '坤伯与阿珍', part: 2, ok: () => epSeen('jan1', 3)(), ci: 9, cname: '阿珍', lines: [
    [null, '一位戴着珍珠耳环的老太太走进店里，看了很久的价目牌。'], ['cust', '……一个蛋挞，谢谢。'], [null, '坤伯从厨房走出来，停住了。'],
    ['kun', '……（把蛋挞放进纸袋，又放了一个）'], ['cust', '我只要一个。'], ['kun', '……另一个，是以前欠你的。'],
    ['cust', '（愣住）……你还是这样。四十年了，话还是这么少。'], ['cust', '（咬了一口）味道……一点都没变。'], ['kun', '……嗯。没变。'],
    ['lin', '（躲在柜台后面，捂住嘴）']] },
  { id: 'jan3', arc: '坤伯与阿珍', part: 3, ok: () => epSeen('jan2', 3)(), bg: 'pier', lines: [
    [null, '周日清晨，西贡码头。荣叔和坤伯并排坐着，鱼竿一动不动。'], ['rong', '老坤，四十年前，你攒了三个月的钱买戒指，结果呢？'], ['kun', '……结果那天，饼房接了一张大单。'],
    ['rong', '你做了一整晚的蛋挞，她就上了去加拿大的飞机。'], ['kun', '（看着海）……没关系。'],
    ['kun', '现在她回来了，每天能做她爱吃的，就够了。'], ['rong', '……你这个人啊。（拍了拍他的肩）'], ['kun', '明天，帮我留两个最好的。']] },
  // 莲姨的追问 — why the owner opened a cha chaan teng
  { id: 'why1', arc: '为什么开冰室', part: 1, ok: () => W.day >= 5 && hired('wen'), lines: [
    ['lin', '雯姐，你帮我问！老板为什么开冰室？我问了十次都被打哈哈。'], ['wen', '（看了看手表）还有二十分钟下班……好吧，我问。'],
    ['wen', '老板，冒昧问一句——'], ['hero', '啊！奶茶要撞七次对吧？我去看看！'], ['wen', '……（看向莲姨）跑了。'], ['lin', '哼，我一定会查出来的！']] },
  { id: 'why2', arc: '为什么开冰室', part: 2, ok: () => epSeen('why1', 3)() && W.day >= 9, lines: [
    [null, '莲姨在储物间找东西时，翻出一张发黄的旧照片。'], ['lin', '（举着照片）这间店……是这间店！门口站着一个老先生，还有一个年轻的……坤伯？！'],
    ['kun', '……那是我。旁边那个，是何伯。'], ['lin', '何伯？……老板的外公，好像就姓何……'], ['kun', '……你自己问老板吧。'], ['lin', '（盯着照片，好久没说话）']] },
  { id: 'why3', arc: '为什么开冰室', part: 3, ok: () => epSeen('why2', 2)(), bg: 'night', lines: [
    [null, '打烊后，店里只剩一盏灯。'],
    ['hero', '……莲姨，你找到那张照片了吧。'], ['lin', '嗯。'], ['hero', '那是我外公。这里以前就是他的冰室。'],
    ['hero', '我小时候每天放学都来，外公给我做菠萝油，坤伯偷偷多放牛油。'], ['hero', '后来外公病了，店关了……我一直想，总有一天要把灯重新打开。'],
    ['kun', '……所以我才来的。'], ['lin', '（眼眶红了）傻孩子……这种事怎么不早说呀！'], ['hero', '说出来……好像就很难过嘛。'],
    ['lin', '（用力抱住老板）明天开始，早餐我包了！一天都不准不吃！']] },
  // 雯姐的两个世界
  { id: 'wen1', arc: '雯姐的两个世界', part: 1, ok: () => hired('wen') && epSeen('ws2', 2)(), ci: 18, cname: '雯姐的朋友', lines: [
    [null, '五点半，一位太太走进来。'], ['cust', '阿雯，今晚的慈善晚宴，七点开始。车在外面等你哦。'], ['wen', '我六点下班。'],
    ['cust', '……你真的要在这里做到六点？'], ['wen', '（继续冲奶茶）答应了的事，就要做完。'], ['cust', '你以前不是这样的。'],
    ['wen', '以前我什么都有，就是没有自己的时间表。'], ['wen', '现在有了。你先去吧，我晚一点到。'], ['lin', '（小声）雯姐好帅……']] },
  { id: 'wen2', arc: '雯姐的两个世界', part: 2, ok: () => hired('wen') && epSeen('wen1', 3)(), ci: 2, cname: '小沅', lines: [
    [null, '一个背着画板的女生在门口张望。'], ['cust', '妈！'], ['wen', '小沅？你怎么来了？'], ['cust', '来看看你工作的地方嘛。（四处看）原来是这样的~'],
    ['cust', '老板，我妈在这里……还好吗？'], ['hero', '雯姐冲的奶茶，是整条街最好喝的。'], ['cust', '……（小声）她以前在家里，很少笑的。'],
    ['cust', '现在每天回家，都会跟我说今天谁点了什么。'], ['wen', '（背对着大家）……奶茶要凉了，快喝。']] },
  // 阿青和耀仔
  { id: 'qy1', arc: '阿青和耀仔', part: 1, ok: () => hired('qing') && hired('yao'), lines: [
    ['qing', '耀仔！你的笔记本封面好丑哦，我帮你画！'], ['yao', '诶？不、不用……'], ['qing', '（已经在画了）画一只戴眼镜的小熊，像你~'],
    ['yao', '……我不像熊。'], ['kun', '……挺像的。'], ['yao', '坤伯！'], ['qing', '好啦！（把本子还给他）喜欢吗？'],
    ['yao', '……（看了很久）……嘿嘿，喜欢。']] },
  { id: 'qy2', arc: '阿青和耀仔', part: 2, ok: () => hired('qing') && hired('yao') && epSeen('qy1', 3)(), lines: [
    ['qing', '（趴在柜台上）哎，数学考砸了……'], ['yao', '……哪一题？'], ['qing', '全部。'], ['yao', '（翻开笔记本，背面全是工整的公式）……我教你。'],
    ['qing', '你这本子怎么什么都写？'], ['yao', '……坤伯说要记在手上，可是我手笨，只好先记在本子上。'],
    ['qing', '耀仔你一点都不笨！'], ['yao', '……（耳朵红了）'], ['lin', '（偷看）哎呀呀~']] },
  // 雯姐的秘密 — the owner finds out by accident
  { id: 'ws1', arc: '雯姐的秘密', part: 1, ok: () => hired('wen') && W.day >= 5, bg: 'night', lines: [
    [null, '打烊后，老板锁好门，看见一辆黑色的长车停在街口。'], [null, '司机下车开门，恭恭敬敬地说：「太太，请上车。」'], [null, '上车的……是刚换下围裙的雯姐。'],
    ['hero', '（惊）……雯、雯姐？！'], ['wen', '（愣住）……老板。'], ['wen', '……今天的事，明天再说，好吗？'], [null, '车门关上了。']] },
  { id: 'ws2', arc: '雯姐的秘密', part: 2, ok: () => hired('wen') && epSeen('ws1', 1)(), lines: [
    ['wen', '（一早就到了，把一杯奶茶放在老板面前）昨晚……吓到你了吧。'], ['hero', '雯姐，你其实……'], ['wen', '嗯。家里的生意，我不太管。'],
    ['wen', '以前大家看我，都先看我戴什么、住哪里。'], ['wen', '在这里，客人只看我奶茶冲得好不好。'], ['wen', '所以……可以帮我保密吗？'],
    ['hero', '当然。在这里，你就是冲奶茶最厉害的雯姐。'], ['wen', '（笑）……谢谢老板。今天，我也会准时下班哦。']] },
  // 雯姐的干妹妹 — a university student who looks at her with stars in her eyes
  { id: 'gm1', arc: '雯姐的干妹妹', part: 1, ok: () => hired('wen') && W.day >= 7, ci: 1, cname: '小敏', lines: [
    [null, '一个背着书包的女大学生冲进店里。'], ['cust', '雯姐！（眼睛闪闪发亮）我下课就赶过来了！'], ['wen', '小敏，慢点跑。'],
    ['cust', '雯姐冲奶茶的样子好帅……我可以在旁边看吗？'], ['lin', '（小声）这是谁呀？'], ['wen', '我的干妹妹，在读大学。'], ['cust', '雯姐是我最崇拜的人！（笑）']] },
  { id: 'gm2', arc: '雯姐的干妹妹', part: 2, ok: () => hired('wen') && epSeen('gm1', 2)(), ci: 1, cname: '小敏', lines: [
    ['cust', '雯姐，我一直想问……'], ['cust', '你明明可以去任何地方，为什么要在这里冲奶茶呀？'], ['wen', '……小敏，你觉得我以前过得开心吗？'],
    ['cust', '你以前……什么都有啊。'], ['wen', '什么都有，就是不知道每天起床要做什么。'], ['wen', '在这里，每天六点前，都有人在等我的奶茶。'],
    ['cust', '……（想了想）我好像懂了一点点。']] },
  { id: 'gm3', arc: '雯姐的干妹妹', part: 3, ok: () => hired('wen') && epSeen('gm2', 3)(), ci: 1, cname: '小敏', lines: [
    ['cust', '（拿着一张申请表）雯姐！我决定暑假来这里打工！'], ['wen', '（惊）你？'], ['cust', '我想知道，让你每天这么开心的地方，是什么样子的！'],
    ['hero', '欢迎欢迎~ 不过要先学会撞茶哦。'], ['wen', '……撞七次，手要稳。'], ['cust', '（眼里都是光）是！师父！'], ['lin', '（偷笑）雯姐多了个徒弟~']] },
  // 阿少的前女友 — 阿珊, his stylist from the singing days; still friends, and he is all manners with her
  { id: 'ex1', arc: '阿少的前女友', part: 1, ok: () => hired('shao') && epSeen('shao1', 2)(), ci: 12, cname: '阿珊', lines: [
    [null, '理发店的阿珊推门进来，一身利落的黑色外套。'], ['cust', '少恒——啊不，阿少。好久不见。'], ['shao', '（微微欠身）阿珊，欢迎。今天想喝什么？我请。'],
    ['cust', '还是那么有礼貌，真不习惯。'], ['lin', '（小声问雯姐）这两个人……什么关系？'], ['wen', '（小声）不知道，但气氛很好。'],
    ['cust', '冻柠茶，少冰。你还记得吗？'], ['shao', '少冰，柠檬多压两下。'], ['cust', '（笑）……记得就好。']] },
  { id: 'ex2', arc: '阿少的前女友', part: 2, ok: () => hired('shao') && epSeen('ex1', 2)(), ci: 12, cname: '阿珊', lines: [
    ['lin', '阿少，阿珊是不是……你以前的女朋友？'], ['shao', '……嗯。以前我还在唱歌的时候，她是我的造型师。'], ['lin', '（惊）那、那你们怎么分开的？'],
    ['shao', '她想要一个会准时下班的人。我那时候做不到。'], ['shao', '现在我们是朋友。她开了理发店，我在这里招待客人。'], [null, '这时，阿珊又探头进来。'],
    ['cust', '阿少，我说一句就走。'], ['cust', '卖花的咏欣喜欢你，你对她客客气气，那是礼貌。'], ['cust', '那个天天来找你的阿千，你对她冷冰冰的——'], ['cust', '可是你的眼睛，一直跟着她转。'], ['shao', '……阿珊。'],
    ['cust', '（摆摆手）这次，记得准时下班啊。'], ['lin', '（捂嘴）哇……']] },
  // 阿青的人气 — all business, never notices she is the one people come to see
  { id: 'qp1', arc: '阿青的人气', part: 1, ok: () => hired('qing'), ci: 3, cname: '中学男生', lines: [
    [null, '一个中学男生在柜台前站了很久，手里攥着一封信。'], ['cust', '那个……阿青姐姐，这个给你！'], ['qing', '哦！是订单吗？班级聚会要几杯？'], ['cust', '不、不是……'],
    ['qing', '（拆开看）「你笑起来很好看」……哈哈，谢谢！那你要试试新出的芒果冰沙吗？'], ['cust', '……（脸红）要、要一杯。'],
    ['lin', '（小声）这孩子，完全没听懂啊……'], ['qing', '姨妈！今天芒果冰沙卖了十二杯！破纪录了！']] },
  { id: 'qp2', arc: '阿青的人气', part: 2, ok: () => hired('qing') && epSeen('qp1', 2)(), lines: [
    ['wen', '阿青，这个月第几封信了？'], ['qing', '什么信？哦，那些啊——都是建议啦，有人说菜单字太小，有人说想要新口味。'], ['lin', '（叹气）……那是情书。'],
    ['qing', '（惊）情、情书？！'], ['qing', '……（想了想）那我回信，请他们多来光顾就好了！'], ['shao', '……很有经营头脑。'],
    ['yao', '……（默默把本子合上）'], ['kun', '……耀仔，你的笔掉了。']] },
  // 师徒 — 坤伯 finally teaches 耀仔
  { id: 'mt1', arc: '师徒', part: 1, ok: () => hired('yao') && W.day >= 26, bg: 'night', lines: [
    [null, '打烊后，厨房的灯还亮着。'], ['yao', '（对着笔记本）牛油冻……摺三次……为什么挞皮还是缩？'], ['kun', '（站在门口）……第三次摺之前，你没等够十分钟。'],
    ['yao', '（惊）坤、坤伯！我只是——'], ['kun', '……明早六点，来厨房。'], ['yao', '诶？'], ['kun', '迟到就别学了。']] },
  { id: 'mt2', arc: '师徒', part: 2, ok: () => hired('yao') && epSeen('mt1', 2)(), lines: [
    ['kun', '（把一本发黄的配方本推过去）这个，你看。'], ['yao', '这是……坤伯的配方本？'], ['kun', '看完要还。……不准抄。'],
    ['yao', '（翻开第一页）「给阿坤：做饼要有耐性。——师父」'], ['kun', '……我也是这样学的。'], ['lin', '（小声）坤伯居然肯教人了……'], ['yao', '（紧紧抱着本子）嗯！我一定好好学！']] },
  { id: 'mt3', arc: '师徒', part: 3, ok: () => hired('yao') && epSeen('mt2', 3)(), lines: [
    [null, '早上，坤伯的手腕缠着绷带。'], ['lin', '（惊）坤伯！你的手怎么了？'], ['kun', '……昨晚搬面粉，扭了。'], ['hero', '那今天的蛋挞……'],
    ['kun', '（看向耀仔）……你来。'], ['yao', '我、我一个人？'], ['kun', '我在旁边看着。'], [null, '那天的第一炉蛋挞出炉了。'],
    ['kun', '（咬了一口，沉默很久）……合格。'], ['yao', '（眼眶红了）……谢谢师父。'], ['kun', '……还没出师。别叫那么早。']] },
  // 莲姨与荣叔 — they argue every time, and once almost went to see the sea
  { id: 'lr1', arc: '莲姨与荣叔', part: 1, ok: () => (W.rongN || 0) >= 2, lines: [
    [null, '荣叔推着货车进来，莲姨立刻叉起腰。'], ['lin', '荣仔！上次的鸡蛋，有三只是裂的！'], ['rong', '哎呀，阿莲，裂了的你不是拿去做蛋饼了吗？'],
    ['lin', '那不一样！'], ['rong', '哈哈，你还是跟以前一样凶。'], ['lin', '（脸红）谁、谁跟你以前！'], ['kun', '……又来了。']] },
  { id: 'lr2', arc: '莲姨与荣叔', part: 2, ok: () => hired('qing') && epSeen('lr1', 2)(), lines: [
    [null, '阿青翻出一张旧照片：年轻的莲姨和荣叔，并排站在庙街的灯笼下。'], ['qing', '（惊）姨妈！这个男的……是荣叔？！'], ['lin', '（一把抢过）小孩子别乱翻！'],
    ['qing', '你们以前是不是——'], ['lin', '（叹气）……那时候他说要带我去看海，结果跑去台湾做生意了。'], ['qing', '后来呢？'],
    ['lin', '后来……就是现在这样啦。每天吵吵架，挺好的。'], ['qing', '（偷偷拍下照片）……我要拿去问荣叔。'], ['lin', '阿青！！']] },
  { id: 'lr3', arc: '莲姨与荣叔', part: 3, ok: () => epSeen('lr2', 3)() || (epSeen('lr1', 6)() && !hired('qing')), lines: [
    ['rong', '（递过一个小纸包）阿莲，给你的。'], ['lin', '什么东西？'], ['rong', '台湾的凤梨酥。……四十年前就想带给你了。'], ['lin', '……（愣住）'],
    ['lin', '（小声）……你这个人，晚了四十年。'], ['rong', '（挠头）迟到总比不到好嘛。'], ['kun', '（转身回厨房）……我什么都没看见。']] },
  // 雯姐与莲姨 — the gossip finds out, and they become friends
  { id: 'wl1', arc: '雯姐与莲姨', part: 1, ok: () => hired('wen') && epSeen('ws2', 3)(), lines: [
    ['lin', '雯姐，我一直觉得你……（小声）是不是很有钱？'], ['wen', '（擦杯子）你猜了多久了？'], ['lin', '从你第一天戴那个手表开始！'],
    ['wen', '（笑）……嗯，被你猜中了。'], ['lin', '（惊）真、真的？！那你为什么——'], ['wen', '因为在这里，有人会因为我冲的奶茶好喝，跟我说谢谢。'],
    ['lin', '……（想了想）那今天收工，我请你去饮茶！'], ['wen', '你请？'], ['lin', '对！我请！不准抢着付钱！']] },
  { id: 'wl2', arc: '雯姐与莲姨', part: 2, ok: () => hired('wen') && epSeen('wl1', 1)(), bg: 'night', lines: [
    [null, '收工后，两人坐在街角的茶楼。'], ['lin', '这家虾饺，我吃了二十年。'], ['wen', '……比我去过的酒店都好吃。'], ['lin', '哈！我就说！'],
    ['wen', '莲姨，谢谢你。'], ['lin', '谢什么？'], ['wen', '谢谢你知道了以后，还是这样对我。'], ['lin', '（拍桌子）当然！在我眼里，你就是那个六点准时下班的雯姐！']] },
  // 阿青与小敏 — the go-getter and the dreamer
  { id: 'qm1', arc: '阿青与小敏', part: 1, ok: () => hired('qing') && epSeen('gm3', 2)(), ci: 1, cname: '小敏', lines: [
    [null, '小敏第一天来打工，阿青站在旁边看。'], ['qing', '你就是雯姐的干妹妹？撞茶要撞七次，你撞了五次。'], ['cust', '（不服气）我、我刚刚在数呢！'],
    ['qing', '客人在等哦。效率！效率！'], ['cust', '……（小声）好凶。'], ['wen', '（笑）你们两个，好好相处。']] },
  { id: 'qm2', arc: '阿青与小敏', part: 2, ok: () => hired('qing') && epSeen('qm1', 2)(), ci: 1, cname: '小敏', lines: [
    ['qing', '（趴在柜台上）新品海报画不出来……'], ['cust', '（凑过来）这里加一个奶茶色的渐层呢？'], ['qing', '……诶？好看！你怎么会？'], ['cust', '我读设计的嘛。'],
    ['qing', '（拉住她的手）小敏！以后你负责画，我负责卖！'], ['cust', '（眼睛一亮）……好！'], ['lin', '（小声）这两个，什么时候变这么好了……']] },
  // 老板的家人 — dad said it was a mistake; mum kept something
  { id: 'fam1', arc: '老板的家人', part: 1, ok: () => W.day >= 9 && hired('shao'), ci: 7, cname: '爸爸', lines: [
    [null, '一个戴着鸭舌帽、压低帽檐的男人在排队。'], ['shao', '（小声）老板……那位客人，好像是你爸爸？'], ['hero', '（惊）……爸？！'],
    ['cust', '（压低帽子）我、我只是路过买个蛋挞！'], ['hero', '你不是说开冰室是「乱来」吗？'], ['cust', '……是你妈逼我来的。'],
    ['cust', '（小声）……蛋挞，买十个。'], ['lin', '（偷笑）十个？路过买十个？']] },
  { id: 'fam2', arc: '老板的家人', part: 2, ok: () => epSeen('fam1', 3)(), ci: 6, cname: '妈妈', lines: [
    ['cust', '（偷偷塞给老板一个信封）别让你爸知道。'], ['hero', '妈，这是……'], ['cust', '你外公以前冰室的招牌照片，我一直收着。'],
    ['cust', '你爸嘴硬，其实每天晚上都在看你店的照片。'], ['hero', '……（眼眶红了）'], ['cust', '加油哦。你外公一定很开心。']] },
  // 咏欣与阿千 — the polite one and the one he likes
  { id: 'trio1', arc: '咏欣与阿千', part: 1, ok: () => hired('shao') && epSeen('shao4', 2)(), ci: 19, cname: '咏欣', lines: [
    [null, '咏欣照例送花来，却没有马上走。'], ['cust', '阿少，我听说了……你和阿千的事。'], ['shao', '……咏欣。'],
    ['cust', '（笑了笑）没关系。我一直知道，你看她的眼神不一样。'], ['cust', '以后，我还是每周三来送花。不过是送给你们两个的。'],
    ['shao', '（微微欠身）……谢谢你。'], ['lin', '（小声）好女孩……']] },
  { id: 'trio2', arc: '咏欣与阿千', part: 2, ok: () => hired('shao') && epSeen('trio1', 2)(), ci: 24, cname: '阿千', lines: [
    [null, '阿千和咏欣同时推门进来。'], ['cust', '（惊）你、你就是那个每周三送花的？'], [null, '咏欣微笑着点头。'], ['cust', '……我一直以为你是我的情敌！'],
    [null, '咏欣笑出了声。'], ['cust', '（脸红）那……我们交个朋友？'], ['shao', '（看着两个人，嘴角微微上扬）'], ['wen', '（小声）阿少笑了。'], ['lin', '（小声）真的笑了！']] },
  // 婆婆与阿伯 — thirty years, the same booth, the same time
  { id: 'old1', arc: '婆婆与阿伯', part: 1, ok: () => W.day >= 8 && guestOpen(9) && guestOpen(10) && hired('shao'), ci: 10, cname: '拐杖阿伯', lines: [
    [null, '下午三点，拐杖阿伯照常坐在靠窗的卡座。对面的位子空着。'], ['cust', '……奇怪，阿娟今天怎么没来。'], ['lin', '婆婆？她每天三点都来的呀。'],
    ['cust', '三十年了，她从来没迟到过。'], ['shao', '我去她家附近看看。'], ['cust', '……（握紧拐杖）麻烦你了。']] },
  { id: 'old2', arc: '婆婆与阿伯', part: 2, ok: () => epSeen('old1', 1)(), ci: 9, cname: '婆婆', lines: [
    [null, '第二天，婆婆坐在了老位置。'], ['cust', '昨天发烧，睡了一天……让你们担心了。'], ['kun', '（放下一碗红豆沙）……热的。'],
    [null, '拐杖阿伯推门进来，看见婆婆，停住了。'], ['cust', '（笑）阿伯，你的位子，我帮你占着呢。'],
    [null, '阿伯慢慢坐下，什么都没说，把自己的蛋挞推到婆婆面前。'], ['lin', '（小声）……这两位，三十年了啊。']] },
  // 粉丝风波 — 莲姨 lets slip who 阿少 was; everyone stands in front of him
  { id: 'fan1', arc: '粉丝风波', part: 1, ok: () => hired('shao') && epSeen('shao2', 2)(), ci: 8, cname: '街坊阿姨', lines: [
    [null, '早上，街坊阿姨来买菠萝包，和莲姨聊得正起劲。'], ['cust', '莲姨，你们店那个帅哥招待，是不是很面熟啊？'], ['lin', '哎呀，你也觉得？我跟你说哦，他以前是——'],
    ['lin', '（惊，捂住嘴）……是、是在别的茶餐厅做过啦！'], ['cust', '哦~（眼睛发亮）我懂，我懂~'], ['lin', '（小声）完了完了……'],
    ['shao', '（从后面走过）莲姨，脸色不太好哦。'], ['lin', '没、没事！今天天气真好啊哈哈！']] },
  { id: 'fan2', arc: '粉丝风波', part: 2, ok: () => hired('shao') && epSeen('fan1', 1)(), ci: 17, cname: '记者', bg: 'crowd', fx: 'crowd', lines: [
    [null, '开门不到十分钟，店门口就挤满了人，还有人扛着相机。'], ['cust', '请问林少恒先生是不是在这里工作？！'], ['shao', '……（站在柜台后，没有动）'],
    ['kun', '（走到门口，双手抱胸）要买蛋挞的排队。不买的，让一让。'], ['wen', '（压低声音打电话）喂，陈律师吗？对，有人在店门口拍照……嗯，麻烦你了。'],
    ['qing', '（举起一块纸牌）「本店只卖蛋挞，不卖八卦！」'], ['lin', '（挡在阿少前面）都是我不好……今天谁都别想拍他！'],
    ['shao', '……莲姨。'], ['shao', '（轻声）谢谢大家。不过，让我自己来吧。']] },
  { id: 'fan3', arc: '粉丝风波', part: 3, ok: () => hired('shao') && epSeen('fan2', 1)(), fx: 'fanend', lines: [
    ['shao', '（走到门口，对着镜头）林少恒一年前就不唱了。'], ['shao', '现在在这里的，是街记冰室的招待阿少。'], ['shao', '想听歌的话，抱歉。想喝奶茶的话，欢迎。'],
    [null, '记者们面面相觑，有几个人真的坐下来点了奶茶。'], ['lin', '（眼眶红了）阿少，对不起，都是我多嘴……'], ['shao', '莲姨，你挡在我前面的时候……我很开心。'],
    ['lin', '（哭）呜……我以后一定管好这张嘴！'], ['kun', '……难。']] },
  // 对面的金庭 — the restaurant that closed 坤伯's old bakery wants him, then starts a price war
  { id: 'rival1', arc: '对面的金庭', part: 1, ok: () => W.day >= 10, ci: 23, cname: '金庭经理', lines: [
    [null, '一位穿西装的男人走进店里，递上一张烫金名片。'], ['cust', '我是对面「金庭」餐厅的经理。坤师傅，久仰。'], ['kun', '……金庭。'],
    ['cust', '我们想请您来做甜品总监，月薪是这里的三倍。'], ['lin', '（惊）三、三倍？！'], ['kun', '（把名片放回他手里）四十年前，你们开张那年，我的饼房就关了。'],
    ['cust', '……那是市场。'], ['kun', '这里也是市场。我在这里，挺好的。'], ['cust', '（笑了笑）那我们，市场上见。']] },
  { id: 'rival2', arc: '对面的金庭', part: 2, ok: () => epSeen('rival1', 2)(), fx: 'pricewar', lines: [
    [null, '对面金庭挂出了大横幅：「蛋挞买一送一」。'], ['lin', '老板！门口的客人都被吸走了！'], ['hero', '……我们也减价吗？'], ['kun', '不减。'],
    ['kun', '他们的挞皮是冷冻的，送两个也是冷冻的。'], ['wen', '街坊吃得出来的。我们把茶做好就行。'],
    ['shao', '……而且，他们店里，没有人会记得你要少甜。'], ['hero', '好！这两天，大家撑住！']] },
  { id: 'rival3', arc: '对面的金庭', part: 3, ok: () => epSeen('rival2', 2)(), ci: 17, cname: '阿杰', bg: 'night', fx: 'rivalend', lines: [
    [null, '打烊后，有人敲门。是金庭的年轻甜品师。'], ['cust', '（低着头）坤师傅……我是阿杰，以前在您饼房做学徒的。'], ['kun', '（惊）……阿杰？你长这么高了。'],
    ['cust', '经理让我做「跟街记一样的蛋挞」，我做了一个月……还是做不出来。'], ['kun', '（沉默了一会儿，拿出一个刚烤好的蛋挞）尝尝。'],
    ['cust', '（咬了一口）……是这个味道。是小时候的味道。'], ['kun', '牛油要冻，摺三次，每次等十分钟。'], ['kun', '……配方不难。难的是每天都愿意这样做。'],
    ['cust', '（眼眶红了）谢谢师傅。'], [null, '几天后，金庭的横幅拆了。']] },
];
let EP_BANNER = null;   // { ep, t } — the bar at the top inviting the player to watch
function stepEpisodes(dt) {   // only the old "come back later" banner still runs during the day
  if (EP_BANNER) { EP_BANNER.t += dt; if (EP_BANNER.t > 14) EP_BANNER = null; }
}
// Special stories (小剧场, a regular's own scene, a staff heart-to-heart, 坤伯's gift shelf): one a day, before opening.
// When two are due the same day, the second plays after closing. 小剧场 come every other day, taking turns between the
// story lines (the line not seen for longest goes next), with a one-off every third time.
const epDue = () => W.day >= 3 && W.day - (W.epLast || -9) >= 2;
function pickEpisode(eve) {
  W.eps = W.eps || {}; W.arcLast = W.arcLast || {}; const fits = e => !eve || !['shao', 'crowd'].includes(e.fx);   // day-time effects only work in the morning
  const arcs = EP_ARCS.filter(e => !W.eps[e.id] && e.ok() && fits(e)).sort((a, b) => (W.arcLast[a.arc] || 0) - (W.arcLast[b.arc] || 0));
  const one = EPISODES.find(e => !W.eps[e.id] && e.ok() && fits(e));
  if (!arcs.length) return one || null; if (!one) return arcs[0];
  return (W.epN || 0) % 3 === 2 ? one : arcs[0];
}
function specialSlot(eve) {
  const T = W.today; if (T[eve ? 'spEve' : 'spAm']) return false; T[eve ? 'spEve' : 'spAm'] = true;
  W.storyNext = W.storyNext || []; W.loyalQ = W.loyalQ || [];
  if (!eve && W.giftShelfDue && !W.giftShelf) { W.giftShelf = true; W.giftShelfDue = false; STORY_Q.push({ key: 'giftshelf', lines: tonedLines(GIFT_SHELF_TALK) }); applyDecor(); return true; }
  if (!eve && W.storyNext.length) { playScene(W.storyNext.shift()); return true; }
  if (W.loyalQ.length) { const [kind, ci] = W.loyalQ.shift(); loyalStory(kind, ci, true); return true; }
  if (epDue()) { const ep = pickEpisode(eve); if (ep) { playEpisode(ep, eve); return true; } }
  return false;
}
const GIFT_SHELF_TALK = [[null, '早上，坤伯拎住一块木板同一盒钉入嚟。'], ['lin', '坤伯，你做咩？'], ['kun', '……熟客送嘅嘢，前台摆唔落喇。'], ['kun', '钉个木架上墙，摆得多啲。'],
  ['hero', '坤伯你仲识做木工？'], ['kun', '……以前间铺啲架都系我钉嘅。'], [null, '墙上多咗两层木架。以后熟客送嘅小礼物，都摆喺上面。']];
function playEpisode(ep, eve) {
  EP_BANNER = null; W.eps = W.eps || {}; W.eps[ep.id] = W.day; W.epLast = W.day; W.epN = (W.epN || 0) + 1; if (ep.arc) (W.arcLast = W.arcLast || {})[ep.arc] = W.day + (eve ? .5 : 0);
  const ci = ep.ci != null ? ep.ci : pick(guestPool());   // who's in it: the episode's own customer, or one of today's kinds
  STORY_Q.push({ key: 'ep', ci, cname: ep.cname, bg: ep.bg || (eve ? 'night' : undefined), lines: [[null, ep.arc ? '小剧场 · ' + ep.arc + '（' + ep.part + '/' + EP_ARCS.filter(e => e.arc === ep.arc).length + '）' : '小剧场']].concat(ep.lines.filter(([w]) => !HIRE[w] || hired(w))) });
  if (ep.fx === 'shao') W.today.shaoSlowUntil = clockOpen + 45;
  if (ep.fx === 'crowd') { W.today.crowdUntil = clockOpen + 60; dirtAdd(12); notice('门口挤满了人：一阵子客多，店也脏得快'); }   // 粉丝风波
  if (ep.fx === 'fanend') { W.rep = Math.min(5, W.rep + .2); notice('阿少的事传开了：名气 +0.2'); }
  if (ep.fx === 'pricewar') { W.rival = { until: W.day + 1 }; notice('对面减价：今明两天客流 -15%'); }   // 金庭
  if (ep.fx === 'rivalend') { W.rival = null; W.rep = Math.min(5, W.rep + .2); notice('金庭不减价了：名气 +0.2'); }
  if (ep.fx === 'rich' || ep.fx === 'fans') { const amt = ep.fx === 'rich' ? 180 : 80; W.money += amt; W.today.revenue += amt; notice((ep.fx === 'rich' ? '雯姐的朋友' : '阿少的「粉丝」') + '买了 $' + amt); }   // 阿少 distracted for a while: works slower
}

// ---------------------------------------------------------------- 荣叔 drops by: ingredients 20% off today; small talk with 坤伯 (they go way back) and the owner
const RONG_TALK = [
  [['rong', '老坤，星期日西贡，五点码头等。'], ['kun', '……多带件外套。'], ['rong', '知道啦，你比我老婆还啰嗦。'], ['rong', '老板，今天进货八折！']],
  [['rong', '上次那条鱼，老坤说是他钓的。'], ['kun', '……是我的饵。'], ['rong', '哈哈！老板，今天材料八折，算鱼的份。']],
  [['rong', '老坤！今天牛油到货多，全场八折。'], ['kun', '你每次都说多。'], ['rong', '这次是真的多！'], ['hero', '谢谢荣叔，那我多订一点吧~']],
  [['rong', '还记得七几年我们在庙街抢鸡蛋吗？'], ['kun', '……是你抢，我付钱。'], ['rong', '哈哈，所以今天算你便宜嘛']],
  [['rong', '老板，坤伯年轻时烤焦过一整盘蛋挞。'], ['kun', '……那是炉子坏了。'], ['rong', '炉坏了四十年？'], ['hero', '（偷笑）']],
  [['rong', '面粉、糖、鸡蛋，今天都八折。'], ['hero', '荣叔怎么这么好呀？'], ['rong', '看在老坤的面子上。'], ['kun', '哼，他是想来喝奶茶吧。']],
  [['rong', '以前这条街有七间冰室，现在剩你们一间。'], ['kun', '……剩下的，才是好的嘛。'], ['rong', '……你还是这么嘴硬。'], ['rong', '今天进货打八折，撑住！']],
  [['rong', '老坤，你那个旧烤炉还在用？'], ['kun', '用了三十年……比你可靠。'], ['rong', '哈哈哈！老板，今天材料八折，别客气。']],
  [['rong', '我刚入行时，老坤教我分辨好牛油。'], ['hero', '真的吗？（惊）'], ['kun', '他学了三年才学会嘛。'], ['rong', '……所以今天打折谢师。']],
  [['rong', '下雨天生意淡，我的货也卖不完。'], ['rong', '老板，帮帮忙，今天全部八折。'], ['kun', '他就是想早点下班。']],
  [['rong', '老坤，阿珍问你好。'], ['kun', '……嗯。'], ['rong', '就一个「嗯」？我帮你带话带了二十年。'], ['hero', '阿珍是谁？'], ['kun', '……做事做事。']],
  [['rong', '老板，你跟你外公一样，开门前先擦柜台。'], ['hero', '啊！你认识我外公？！'], ['rong', '当然，我和老坤都是看着这间店长大的。'], ['rong', '今天进货八折，算是请你外公喝茶。']],
];
function rongVisit() {   // once a morning at most; walks through the talks in order so they don't repeat
  WALKERS.push({ ch: STAFF_HD.rong, y: 338, dir: -1, v: 20, x: 720, dist: 0, temp: true });   // pushing his cart past the door
  W.rongN = W.rongN || 0; let talk = RONG_TALK[W.rongN % RONG_TALK.length]; W.rongN++;
  if (!(W.eps || {}).why3 && talk.some(([, t]) => t.includes('外公'))) { talk = RONG_TALK[W.rongN % RONG_TALK.length]; W.rongN++; }   // grandpa stays a secret until the owner tells 莲姨 (为什么开冰室 3) W.today.rongSale = true;
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
  '白领姐姐': [['cust', '同事说这里的下午茶很正，我来验收一下哦。'], ['lin', '验收合格的话，记得帮我们宣传呀~'], ['cust', '先看看蛋挞够不够滑吧。']],
  '小男孩': [['cust', '（踮起脚）老板，蛋挞多少钱？'], ['hero', '八块哦。你够得着柜台吗？'], ['cust', '够！我每天都在长高的！']],
  '小女孩': [['cust', '哥哥说这里的布丁会抖抖抖~'], ['kun', '……（轻轻摇了一下）'], ['cust', '真的抖了！']],
  '拐杖阿伯': [['cust', '这间店啊……我年轻时常来的。'], ['kun', '阿伯，你记性真好。'], ['cust', '换了老板，招牌还在就好啦。']],
  '潮人（女）': [['cust', '这个招牌字体好正！可以拍照吗？'], ['hero', '随便拍，记得买杯奶茶哦~'], ['cust', '当然！杯子也要入镜。']],
  '精壮工人': [['cust', '老板，有没有大个一点的菠萝包？'], ['kun', '大个的没有……可以吃两个嘛。'], ['cust', '哈哈，好，两个！']],
  '潮人（男）': [['cust', '（咔嚓）这个灯光，这个旧瓷砖……'], ['lin', '先生，你是来吃东西还是来拍戏呀？'], ['cust', '都是！']],
  '新鲜人': [['cust', '请问……这里可以坐着改简历吗？'], ['hero', '可以呀，奶茶续杯也可以~'], ['cust', '谢谢！我一定会找到工作的！']],
  '外国游客': [['cust', 'Hello! 港式奶茶，one please!'], ['wen', '冷的还是热的？Hot or cold？'], ['cust', 'Cold! 冻……冻奶茶！']],
  '韩系女生': [['cust', '哇，这个蛋挞好可爱，我要拍一下~'], ['qing', '我教你！要这个角度拍才好看~'], ['cust', '真的好看很多！']],
  '日系男生': [['cust', '这些瓷砖……是六十年代的吧？'], ['kun', '……比你年纪还大。'], ['cust', '太好了，就是要这种感觉。']],
  '叛逆学生': [['cust', '……随便来一份，快点。'], ['lin', '「随便」没有卖哦，要不要试试蛋挞？'], ['cust', '……好啦，蛋挞。']],
  '背包客': [['cust', '我在地图上找「本地人去的店」，就找到这里。'], ['hero', '那你找对地方啦。'], ['cust', '先来一杯最有名的！']],
  '严肃老师': [['cust', '你们的价目表，「挞」字写错了一笔。'], ['lin', '……（惊）老师眼力真好。'], ['cust', '不过奶茶冲得不错，及格。']],
  '美艳人妻': [['cust', '听说这里的蛋糕不输酒店？'], ['hero', '请您试试看~'], ['cust', '……嗯，确实可以。']],
  '西装金融男': [['cust', '我只有十五分钟，有什么最快？'], ['wen', '冻柠茶，十秒钟。'], ['cust', '……真的十秒。有效率。']],
};
function newGuests() {
  const pool = guestPool().map(guestKind); if (!W.met) { W.met = {}; for (const k of pool) W.met[k] = 1; return; }   // a new or old save: everyone already here counts as met
  const fresh = [...new Set(pool.filter(k => !W.met[k]))]; if (!fresh.length) return;
  for (const k of fresh) W.met[k] = W.day;
  const k0 = fresh.find(k => FIRST_TALK[k]), ci = k0 && GUEST_DEF.findIndex(g => g.name === k0);
  if (k0) STORY_Q.push({ key: 'newguest', ci, lines: [[null, '新客人：' + k0 + '第一次来光顾。']].concat(FIRST_TALK[k0].filter(([w]) => !HIRE[w] || W.staff[w].hired)) });
  for (const k of fresh) if (k !== k0) notice('新客人：' + k + '开始来光顾');
}

// ---------------------------------------------------------------- 贵宾: a deluxe booth with good surroundings, or the word gets round (two days of fewer customers)
const VIP_NEED = 28, VIP_WHO = [23, 18, 1];   // 西装金融男, 美艳人妻, 白领姐姐
const boothEnv = st => {   // how nice a booth is: the shop's looks + decor pieces near it (gifts count double) + finished sets
  const p = seatPos(st); let e = beauty() + setBonus();
  for (const id in (W.itemPos || {})) if (hasItem(id)) { const [x, y] = W.itemPos[id]; if (Math.hypot(x - p.x, y - p.y) < 90) e += DECOR_ITEMS[id].cat === 'gift' ? 6 : 3; }
  return e;
};
const vipOk = st => W.decor.booth === 'deluxe' && boothEnv(st) >= VIP_NEED;
const vipMul = () => W && W.vipBuff && W.day <= W.vipBuff.until ? W.vipBuff.k : 1;
function stepVip(dt) {
  if (!W || PHASE !== 'open' || W.day < 7 || !WAITER) return; const T = W.today;
  if (T.vipAt === undefined) T.vipAt = (W.lastVip || 0) <= W.day - 3 && rng() < .35 ? 30 + rng() * OPEN_LEN * .5 : -1;
  if (T.vipAt < 0 || clockOpen < T.vipAt || T.vipDone) return;
  const seats = SEATS.filter(q => !q.who && !q.dirty); if (!seats.length) { T.vipAt = clockOpen + 15; return; }   // wait for a free booth
  const st = seats.sort((a, b) => boothEnv(b) - boothEnv(a))[0], n0 = DINERS.length; spawnDiner(st); const d = DINERS[DINERS.length - 1]; if (DINERS.length === n0 || !d) { T.vipDone = true; return; }
  const ci = pick(VIP_WHO); d.ci = ci; d.ch = GUEST_HD[ci]; d.vip = true; d.tag = null; d.wants.push(...d.wants.slice(0, 2)); T.vipDone = true; W.lastVip = W.day;
  notice('贵宾到！要高级卡座 + 环境 ≥ ' + VIP_NEED + '（这张 ' + boothEnv(st) + '）'); SFX.ding();
}
function vipDone(d, happy) {   // after the meal (or walking out)
  if (happy) { W.vipBuff = { until: W.day + 2, k: 1.15 }; W.rep = Math.min(5, W.rep + .2); const [x, y] = P1(d.x, d.y, 50); earn(120, x, y - 30, '贵宾打赏 +$120'); say(d, '环境一流，我会介绍朋友来。', false); notice('贵宾很满意：两天客流 +15%'); }
  else { W.vipBuff = { until: W.day + 2, k: .8 }; say(d, d.st && W.decor.booth !== 'deluxe' ? '连高级卡座都没有？' : '环境一般般……', true); notice('贵宾不满意：两天客流 -20%'); }
}
// ---------------------------------------------------------------- how each kind says thank you when they bring a gift (loyalty 8)
const GIFT_THANKS = {
  '上班族': [['cust', '（看了看表）……赶时间，这个给你们，每天早上辛苦了！']],
  '白领姐姐': [['cust', '公司开会用剩的，不对，是特地挑的！你们的下午茶救了我好几次。']],
  '女学生': [['cust', '我和同学一起准备的！（把东西塞过来就跑）'], ['lin', '哎，还没说谢谢呢！']],
  '中学男生': [['cust', '喏，送你们的。……比赛赢了，请客的一部分。']],
  '小男孩': [['cust', '妈妈说要送礼物给好人！（踮起脚放在柜台）']],
  '小女孩': [['cust', '这个送给你，你要每天看着它哦！']],
  '街坊阿姨': [['cust', '哎呀，别客气！街坊嘛，你们生意好我也高兴！']],
  '婆婆': [['cust', '（慢慢从布袋里拿出来）年纪大了，没什么好送的，一点心意。'], ['kun', '……婆婆，坐一会再走。']],
  '拐杖阿伯': [['cust', '我年轻时这条街的店都会挂这个。给你，算是传下去。']],
  '潮人（男）': [['cust', '（先拍了张照）OK，这个放你们店里，绝对上镜。']],
  '潮人（女）': [['cust', '我觉得你们店缺了这个！放这里，完美。']],
  '外国游客': [['cust', 'For you! 多谢晒！……我说得对吗？'], ['hero', '说得很好！']],
  '背包客': [['cust', '我下一站要走了，这个留给你们，当我来过。']],
  '精壮工人': [['cust', '（一手放下）收下！不收我不走。']],
  '新鲜人': [['cust', '我第一份人工买的……谢谢你们陪我熬过试用期！']],
  '美艳人妻': [['cust', '我先生挑的，说一定要送你们。他自己不好意思来。']],
  '韩系女生': [['cust', '谢谢你们！我的分享收到好多赞，这是回礼～']],
  '日系男生': [['cust', '（鞠了一个躬）承蒙关照了。这个，请收下。']],
  '叛逆学生': [['cust', '……拿去。不要问那么多。'], ['lin', '（偷笑）好好好，不问。']],
  '严肃老师': [['cust', '服务周到，值得表扬。这个，作为奖励。']],
  '西装金融男': [['cust', '好的投资要长期持有。你们这间店，值得。']],
};

// each kind of regular brings one piece of their own at loyalty 8 (no repeats: no two kinds share one)
const GIFT_ITEM = { '上班族': 'fishtank', '白领姐姐': 'aroma', '女学生': 'easel', '中学男生': 'basketball', '小男孩': 'plane', '小女孩': 'pinwheel', '街坊阿姨': 'luckycat',
  '婆婆': 'bonsai', '拐杖阿伯': 'banner', '潮人（男）': 'record', '潮人（女）': 'mirror', '外国游客': 'globe', '背包客': 'suitcase', '精壮工人': 'chili', '新鲜人': 'card',
  '美艳人妻': 'vase', '韩系女生': 'bunny', '日系男生': 'chime', '叛逆学生': 'skate', '严肃老师': 'screen', '西装金融男': 'radio' };
