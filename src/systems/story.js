// ==== story: short scenes in a horizontal dialogue window with portraits. Triggered by the opening, hiring,
// upgrades, new recipes, the parents' visit and staff affection (days worked together). Each scene 1-4 lines.
const TEMP_TALK = {   // part-timers (and summer students) joining: a few lines that show who they are
  '学生阿明': [['temp', '老板！我五点前要返屋企食饭，之前一定做晒！'], ['hero', '咁快手？'], ['temp', '学校一百米跑第二㗎！']],
  '新鲜人阿乐': [['temp', '我寄咗三十封求职信……今日先嚟帮手。'], ['hero', '慢慢嚟，总会有。'], ['temp', '嗯！今日当系实习！']],
  '退休浩叔': [['temp', '揸咗三十年巴士，最紧要系稳。'], ['lin', '浩叔慢慢嚟，唔使赶。'], ['temp', '放心，一滴奶茶都唔会倒泻。']],
  '背包客Tom': [['temp', 'Hello boss！我想学整蛋挞！'], ['hero', '你识唔识讲广东话？'], ['temp', '识少少……唔该、多谢、好味！']],
  '师奶兼职': [['temp', '哎呀老板，成条街我都熟㗎！'], ['temp', '等阵我叫我啲姊妹嚟帮衬。'], ['hero', '咁就多谢晒！']],
  '叛逆仔阿威': [['temp', '……做咩呀，我阿妈叫我嚟㗎咋。'], ['kun', '嚟到就做嘢。'], ['temp', '……知喇知喇。']],
  '阿桥': [['temp', '我唔系为咗钱先嚟㗎！'], ['hero', '咁系为咩？'], ['temp', '……我阿妈话一定要嚟。']],
  '诗敏': [['temp', '老板，可唔可以俾我放歌听？'], ['hero', '咩歌？'], ['temp', '我偶像新歌！收工前一定要抢到门票！']],
  '小健': [['temp', '我计过，一盘蛋挞成本大概……'], ['hero', '你仲识计成本？'], ['temp', '数学学会㗎嘛。……诗敏今日有冇嚟？']],
  '阿朗': [['temp', '你把吊扇有啲震，我帮你睇睇。'], ['hero', '你识整？'], ['temp', '机械系三年级，唔整掂唔收工。']],
  '阿悠': [['temp', '「街记冰室」……个名好有诗意。'], ['hero', '系咩？'], ['temp', '我帮你写句宣传语，免费㗎！']],
  '嘉宁': [['temp', '我列咗张清单：报到、学嘢、开工。'], ['hero', '咁有条理？'], ['temp', '翻译系，一个字都唔可以错。']],
  '天佑': [['temp', '老板，你啲客其实可以用手机落单。'], ['hero', '要几多钱？'], ['temp', '……我谂下先，今日先抹枱。']],
  '米米': [['temp', '你个价目牌啲字可以改下！'], ['hero', '改成点？'], ['temp', '等我画，包你靓！']],
};
const NAMES = { kun: '坤伯', lin: '莲姨', wen: '雯姐', shao: '阿少', qing: '阿晴', yao: '耀仔', hui: '惠姐', cheng: '阿澄', mum: '妈妈', dad: '爸爸' };
const SCENES = {
  // opening: the hero's situation, Dad's introduction of Kun, Lin answering the ad (from the character notes)
  intro: [[[null, '工作还未找到，铺位倒先看好了。'], [null, '家里给了一笔钱，接下来要靠自己把账算明白。'],
    ['hero', '（爸爸传来短讯：「坤伯做饼做咗几十年，你有地方，佢有手艺，见面倾下。」）'],
    ['kun', '……你就系老陈个仔女？我先睇下个烤箱。'], ['kun', '炉温稳，未算差。人工照计，唔使同我客气。'],
    ['lin', '早晨！我系莲姨，睇到你哋嘅招聘就嚟咗。'], ['lin', '以前做零售主管，排班、包装、收拾交俾我。'],
    ['kun', '排班？你识唔识先搓个包先？'], ['lin', '兴趣班学过㗎！'], ['hero', '收银同研发我嚟，大家多多指教！']]],
  // main staff joining: where they come from, what they want (hinted, not all at once)
  hire_wen: [[['wen', '我系雯姐，惠姐系我表姐，佢叫我嚟试下工。'], ['wen', '之前喺屋企煮咗十几年饭，奶茶就日日冲。'], ['hero', '试工嗰杯好滑，水吧交俾你得唔得？'],
    ['wen', '得。我想要份……有人工、有放工时间嘅工。'], ['wen', '（翻开一本新簿仔）呢本，以后专登写我自己嘅更表。'], ['lin', '好嘢！以后有人陪我倾偈喇。']]],
  hire_shao: [[['shao', '老板！上次帮你搬陈列架嗰个阿少呀，记唔记得？'], ['shao', '成条街我都识，边个阿婆钟意咩包我都记得。'], ['shao', '我舅父成哥成日话：把口甜，饿唔死。'],
    ['hero', '招呼客人同外卖窗交俾你。'], ['lin', '你把口甜，唔好乱应承人就得。'], ['shao', '……（摸后脑）知道喇莲姨。']]],
  up_till: [[['hero', '新收银机！按两下就找钱。'], ['lin', '以前我做主管都冇咁先进。'], ['lin', '……不过我以前份报表做得靓过佢。']]],
  up_oven: [[['kun', '双层烤盘……几好。'], ['kun', '以前间饼房都系咁嘅炉。'], ['lin', '坤伯偷偷笑咗喎！'], ['kun', '……冇。']]],
  up_sign: [[['shao', '霓虹招牌一着，成条街都望过嚟！'], ['shao', '咏欣同阿珊都……我意思系，啲街坊都会见到！'], ['lin', '你讲多咗喎。']]],
  shelf: [[['lin', '多一张货架，可以摆多啲款。'], ['kun', '货架多咗，我要焗快啲喇。'], ['hero', '账我计好咗，摆满就回本。']]],
  rd_coco: [[['kun', '椰丝要炒香先落，咁先有层次。'], ['kun', '以前间铺……算啦，你试下。'], ['hero', '椰挞，成功！']]],
  rd_wife: [[['kun', '老婆饼皮要薄，馅要煮够火。'], ['lin', '以前我阿妈最钟意食。'], ['lin', '我兴趣班第一样学嘅都系佢。']]],
  rd_pudding: [[['bar', '红豆要煲到起沙，布丁先够香。'], ['hero', '冻冻地，啱晒夏天。']]],
  rd_mango: [[['bar', '芒果要熟、西米要煮透。'], ['hero', '杨枝甘露，呢个一定好卖！']]],
  rd_cockbun: [[['kun', '鸡尾包，以前用卖剩嘅面包碎做馅，唔嘥嘢。'], ['kun', '高档餐厅唔会整呢啲。'], ['hero', '咁我哋就整到最好食。']]],
  rd_lemontea: [[['bar', '柠檬要压，唔好搅烂，先唔苦。'], ['shao', '呢杯我饮得！']]],
  rd_malai: [[['lin', '马拉糕系蒸嘅，唔系焗嘅！我兴趣班考过。'], ['kun', '……佢啱。']]],
  rd_dpn: [[['bar', '双皮奶要蒸两次，先有两层皮。'], ['lin', '婆婆实钟意。']]],
  rd_eggwaf: [[['shao', '鸡蛋仔！细路仔一定排队。'], ['kun', '格仔要热透先倒浆，唔好心急。']]],
  rd_yuen: [[['wen', '鸳鸯，七分奶茶三分咖啡。'], ['wen', '小沅读大学之后，饮咖啡多过饮奶茶。'], ['hero', '咁呢杯系为佢整嘅？'], ['wen', '……为我自己。']]],
  // level-up scenes: Lv2 -> _1, Lv3 -> _2, Lv4 -> _3, Lv5 -> _4 (each person's 2-3 part story, a bit at a time)
  aff_kun_1: [[['kun', '我喺旧饼房做咗几十年。'], ['kun', '对面开咗间高档餐厅，连甜品都做埋，订单一张张冇咗。'], ['kun', '执笠嗰日，我熨好条围裙先返去收拾。'], ['hero', '坤伯……']]],
  aff_kun_2: [[['kun', '你问我识唔识新式嘢？唔识。'], ['kun', '（手上已经帮你称好料）……试下啦。'], ['lin', '口硬心软。']]],
  aff_kun_3: [[['kun', '（配方簿掉出一张旧合照，旁边夹住一张你哋第一日出炉嘅相）'], ['kun', '……放埋一齐，唔使问。']]],
  aff_kun_4: [[['kun', '呢本簿，后面我留咗几页白纸。'], ['kun', '老味道唔一定要用旧办法卖。你写落去。'], ['hero', '我会写好佢。']]],
  aff_lin_1: [[['lin', '我以前做连锁零售区域主管，管预算、排班、业绩。'], ['lin', '储够钱就唔做咯，去上兴趣班。'], ['lin', '第一次为一炉包等成个下昼，我就知道系呢样。']]],
  aff_lin_2: [[['lin', '（端出一小盘）呢个……系试营业份量。'], ['kun', '我哋要一百个。'], ['lin', '……一齐补啦！']]],
  aff_lin_3: [[['lin', '你睇我以前啲会议便条，背面全部抄晒配方。'], ['lin', '日历写到满一满，就系唔记得留时间俾自己。']]],
  aff_lin_4: [[['lin', '以前开会开到出结果，依家开炉就有结果。'], ['lin', '我唔做主管，做呢度最开心。']]],
  hire_yao: [[['yao', '……你好，我系耀仔。惠姐係我姨妈。'], ['hero', '听讲你读过烘焙课？'], ['yao', '读过基础班，喺大饼房做过备料同称重。'], ['yao', '配方我识跟足，不过……未试过俾客人食自己做嘅嘢。'],
    ['kun', '称重准唔准？'], ['yao', '准到一克。'], ['kun', '……嚟帮我焗多一盘。'], ['yao', '（拎出小本子写低）多谢坤伯。']]],
  aff_yao_1: [[['yao', '（低头写本子）'], ['lin', '耀仔，你写咩呀？'], ['yao', '坤伯今日开炉嘅温度。'], ['kun', '写低冇用，要记喺手度。'], ['yao', '……我两样都记。']]],
  aff_yao_2: [[['hero', '耀仔，今日啲挞皮好靓。'], ['yao', '……一般啦。'], ['lin', '（细声）佢转头又去练多一盘。']]],
  aff_yao_3: [[['yao', '阿澄话佢档口有可可试料，叫我拎啲返嚟试。'], ['hero', '你想做咩？'], ['yao', '奶茶味嘅泡芙……如果可以嘅话。'], ['kun', '做得出就摆出去，做唔出就再做。']]],
  aff_yao_4: [[['yao', '老板，今日有客人问边个做嘅包。'], ['hero', '你点答？'], ['yao', '我话……我。'], ['yao', '第一次有人问。我会记住。']]],
  sup_hui: [[['hui', '老板！我系惠姐，雯姐同耀仔都系我屋企人。'], ['hui', '生果、豆类、椰浆，我档口最齐。'], ['hui', '你上次主推杨枝甘露，我记得㗎！以后芒果平啲俾你。'], ['hero', '多谢惠姐！'], ['hui', '记得食饭呀，忙都要食。']]],
  sup_cheng: [[['cheng', '……我系阿澄，茶同咖啡嘅供货。'], ['cheng', '呢只茶叶焗五分钟，第三分钟最香。'], ['hero', '你好熟喎。'], ['cheng', '以前想读甜品课程，后来接咗屋企档口。'], ['cheng', '耀仔成日讲你哋。有咩想试，我拎试料过嚟。']]],
  expand: [[['lin', '隔篱终于打通喇！'], ['kun', '地方大咗，炉都要快啲。'], ['shao', '老板，多咗卡座，我要跑多几步喇！'], ['hero', '大家辛苦，以后坐得落多啲街坊。']]],
  expand_more: [[['lin', '又多两组卡座！'], ['hero', '记得招待要够人手。']], [['kun', '……地方大，饼要够。'], ['hero', '知道，坤伯。']]],
  hire_qing: [[['qing', '姨妈！我放暑假喇，我嚟帮手！'], ['lin', '呢个系我外甥女阿晴，海棠中学中六。'], ['qing', '我上年喺社团摆甜品摊，招牌我画㗎，好靓。'], ['lin', '靓就靓，收摊剩咗成枱。'],
    ['qing', '……今次我会计好数先画招牌！'], ['hero', '水吧啱啱好要人，冰饮交俾你。'], ['qing', '得！今日开始，听我讲——呃，我意思系，我会做好佢。']]],
  aff_qing_1: [[['qing', '老板，蛋挞改名叫「日落能量圈」好唔好？'], ['kun', '写「蛋挞」两个字，客人已经识买。'], ['qing', '……咁冻饮嗰边我可唔可以改？']]],
  aff_qing_2: [[['qing', '（练习册最后几页全部系包装草图）'], ['hero', '画得几好喎，后面啲数字系咩？'], ['qing', '成本……擦咗又计，计咗又擦。'], ['qing', '我唔想人哋觉得我只系细路。']]],
  aff_qing_3: [[['qing', '姨妈，荣叔今日又「算错份量」多带咗试料喎。'], ['lin', '佢一向粗心。'], ['qing', '你连糖都计得准，佢点会次次算错？'], ['lin', '……做嘢啦你。']]],
  aff_qing_4: [[['qing', '社团又摆摊，今次我先列份数，再画招牌。'], ['qing', '靓之外，都要卖得晒。'], ['hero', '有冇剩？'], ['qing', '一个都冇！多谢你俾我试，老板。']]],
  aff_wen_1: [[['wen', '（收银单睇咗两次）'], ['lin', '雯姐，你好认真喎。'], ['wen', '以前喺屋企管三餐冇人工收，今次有。']]],
  aff_wen_2: [[['wen', '我个女小沅读紧大学，今日放学话嚟探我。'], ['wen', '我叫佢照样排队，唔准打尖。'], ['hero', '原来雯姐上班真系唔得闲。']]],
  aff_wen_3: [[['wen', '离咗婚之后，我第一次写自己嘅更表。'], ['wen', '「听日我返早班，晚饭你搞掂。」我咁同小沅讲。'], ['hero', '佢点答？'], ['wen', '佢话：收到，老细。']]],
  aff_wen_4: [[['wen', '新冻饮整好喇：鸳鸯冰，加少少椰奶。'], ['wen', '小沅试过，话好饮！'], ['hero', '好，下个月出！']]],
  aff_shao_1: [[['shao', '街尾花店咏欣成日帮衬我哋。'], ['shao', '……唔系因为我啦。'], ['lin', '咁佢点解次次都问你返唔返工？']]],
  aff_shao_2: [[['shao', '理发店阿珊拎住张旧戏飞嚟搵我……'], ['shao', '咏欣又啱啱入嚟送花。'], ['lin', '你自己谂清楚！'], ['shao', '大家冷静，我先招呼客人……']]],
  aff_shao_3: [[['shao', '（口袋跌出一叠便条：「星期六 睇戏」「星期日 饮茶」……）'], ['shao', '我谂清楚喇，做人唔好乱应承。']]],
  aff_shao_4: [[['shao', '我同阿珊、咏欣都讲清楚咗，日期时间写埋。'], ['lin', '原来你识讲完整日期。'], ['shao', '老板，多谢你俾我机会！']]],
  parents: [[[null, '爸妈来探班。'], ['dad', '咦，仲未执笠？'], ['mum', '你爸咁讲笑，佢成晚话想嚟睇。'], ['dad', '我计过，呢箱蛋挞三日卖得晒。'], ['mum', '（临走偷偷塞咗个利是）'], ['hero', '爸，你又计数……多谢你哋嚟。']]],
  chat: [   // morning small talk: bits of who they are slip out (only people who work here)
    [['lin', '老板，你知唔知点解铺头叫「街记」？'], ['hero', '因为……开喺街口？'], ['lin', '因为街坊记得你，先会返嚟。'], ['kun', '同做饼一样，味道要记得住。'], ['hero', '咁我哋要做到俾人记得。']],
    [['kun', '今朝荣叔啲牛油靓过上个礼拜。'], ['lin', '咁你同佢讲声多谢啦。'], ['kun', '……佢自己知。'], ['lin', '你哋两个讲嘢都系咁，靠估。']],
    [['wen', '我啱啱试咗新茶叶，焗耐咗少少。'], ['hero', '会唔会苦？'], ['wen', '有少少涩，加多一匙淡奶就啱。'], ['wen', '以前喺屋企冲，冇人话好饮，今次终于有人饮晒。']],
    [['shao', '老板，对面茶记今日减价喎。'], ['hero', '咁我哋点算？'], ['shao', '唔使惊，佢啲蛋挞冷嘅。'], ['shao', '我同街口三个阿婆讲咗，佢哋今日实嚟。'], ['lin', '你把口真系……'], ['shao', '甜！']],
    [['qing', '姨妈，我帮你个价钱牌画咗只猫仔。'], ['lin', '价钱睇唔睇得清先？'], ['qing', '……睇得清㗎，只猫揸住个数字。'], ['hero', '几得意，挂出去试吓。']],
    [['qing', '老板，点解杨枝甘露有西米？'], ['wen', '西米煲熟咗，咬落有口感，又吸到椰汁香。'], ['qing', '咁我下次画埋粒西米落菜单！'], ['wen', '记得画细粒啲，唔系似珍珠。']],
    [['kun', '阿晴，搓面唔好咁大力。'], ['qing', '我好大力咩？'], ['kun', '面团冇得罪你。'], ['qing', '……哦。'], ['lin', '（偷笑）']],
    [['hero', '最近生意好咗，大家辛苦晒。'], ['kun', '辛苦就唔辛苦，炉够热就得。'], ['lin', '老板，记得自己都要食早餐。'], ['hero', '我食咗半个菠萝包。'], ['lin', '半个点够！']],
    [['shao', '雯姐，你冲奶茶有咩秘诀？'], ['wen', '撞够七次，手要稳。'], ['shao', '我撞三次就满地都系。'], ['wen', '所以你去招呼客人啦。']],
    [['lin', '老板，荣叔话下个礼拜芒果平啲。'], ['hero', '咁可以多做杨枝甘露。'], ['lin', '佢仲话……我讲得太多喇，做嘢做嘢。'], ['kun', '佢仲话咩？'], ['lin', '冇呀！']],
    [['qing', '今日社团同学话嚟帮衬。'], ['hero', '几多个？'], ['qing', '……十几个，我叫佢哋分开嚟，唔好塞住门口。'], ['lin', '识谂喎，有进步。']],
    [['kun', '以前我间铺，日日四点开炉。'], ['hero', '咁早？'], ['kun', '街坊返工前要拎到个热包。'], ['kun', '依家唔使咁早，不过个心照样四点醒。']],
    [['wen', '老板，今日落雨，卡座会多人坐。'], ['hero', '咁就要多啲热饮。'], ['wen', '我会先焗定一壶茶胆。']],
    [['shao', '老板，我今日见到隔篱街新开咗间饼店。'], ['kun', '佢哋啲挞皮系买返嚟㗎。'], ['shao', '你点知？'], ['kun', '闻到。']],
    [['lin', '今日天气好，人客应该多。'], ['hero', '咁就多备啲料。']],
    [['kun', '……面粉今日好靓。'], ['lin', '你系咪同面粉讲紧嘢？']],
    [['lin', '坤伯，你个围裙又沾满面粉。'], ['kun', '做饼唔沾面粉，点叫做饼。']],
    [['lin', '隔离街周末有活动，我帮你问过啦！'], ['hero', '莲姨你又识人？'], ['lin', '做过主管，周围都识啲人。']],
    [['kun', '对面嗰间高档餐厅……佢哋啲蛋挞皮唔够脆。'], ['hero', '你去试过？'], ['kun', '……路过。']],
    [['lin', '坤伯以前间饼房，我细个都去帮衬过。'], ['kun', '……嗰时你都未识搓包。']],
    [['hero', '成本计埋，今日应该打和。'], ['lin', '你同我以前一样，日日计数。']],
    [['hero', '爸妈话迟啲嚟探班……'], ['hero', '希望佢哋唔好一入门就问「仲未执笠？」']],
    [['wen', '我新试咗个拉茶手势，睇下！'], ['lin', '哗，拉得好高！']],
    [['wen', '小沅今晚唔返嚟食饭，我可以留晏少少。'], ['lin', '你本簿唔系写住六点放工咩？'], ['wen', '……我自己改嘅。']],
    [['wen', '惠姐话我今日好有精神。'], ['hero', '系咪因为放咗假？'], ['wen', '因为今日有返工。']],
    [['shao', '我今朝喺街口派咗传单！'], ['lin', '派得几多张？'], ['shao', '……三张。都系派俾靓女。']],
    [['shao', '成哥话我细个日日嚟呢条街，冇人唔识我。'], ['kun', '所以成条街都知你答应过人嘢。']],
    [['shao', '阿珊今朝经过，望咗我一眼……'], ['lin', '你又应承咗人咩？'], ['shao', '冇！……应该冇。']],
  ],
};
// remarks dropped while working (a bubble over their head now and then): small, unprompted hints of their stories
const MURMUR = {
  kun: ['酥皮要有精神，唔好心急。', '以前间铺……算啦，焗多盘先。', '高档餐厅啲挞，皮唔够脆。', '（望住烤箱）呢个火候啱。', '人工照计，手艺照做。'],
  lin: ['隔离街周末有活动，我帮你问过！', '以前开会到夜，依家开炉就有结果。', '兴趣班老师话我搓包有天分㗎。', '陈太个仔考到大学喇！我听返嚟嘅。', '排好班，大家都唔使赶。'],
  yao: ['（写低）……温度啱。', '再练多一盘。', '称准咗。'],
  qing: ['呢杯冰饮靓唔靓？', '我想改个菜单牌…', '姨妈又望住门口喇。', '红豆冰要即叫即整！', '今日放学好快就嚟到。'],
  wen: ['茶胆焗好喇。', '慢慢嚟，撞够七次。', '冻奶茶要冰底先。'],
  shao: ['欢迎光临！今日有新货！', '阿婆，你个菠萝包我留咗喇！', '入嚟坐，卡座有位！'],
  hero: ['成本计埋…今日应该打和。', '今日要卖晒呢炉先得。', '爸妈千祈唔好今日嚟…'],
  wen: ['小沅今晚返唔返嚟食饭呢…', '我本簿写住：六点放工。', '茶袋拉高，奶茶先滑。', '今次有人工收，好好做。'],
  shao: ['阿珊…今晚？我记得我记得。', '咏欣啲花今日好靓喎。', '成哥话我把口甜饿唔死，哈。', '阿婆！照旧菠萝包系咪？', '张便条写咗乜…星期几嚟？'],
};
const AFF_STEPS = [2, 5, 9];   // days worked together -> affection level 1 / 2 / 3 (a scene each)
let DIALOG = null; const STORY_Q = [];
function cast() { return ['kun', 'lin', ...Object.keys(HIRE).filter(k => W.staff[k].hired)]; }
// little sounds of speech (嗯 / 哦 / 啦 …), each person their own: added to some lines, the same way every time a line is shown
const TONE = {
  kun: { pre: ['嗯。', '……嗯，', '哼，'], end: [] },
  lin: { pre: ['哎呀，', '哈哈，', '咦，', '哦～'], end: ['啦。', '喎。', '嘛。'] },
  wen: { pre: ['嗯，', '好啦，', '哦，'], end: ['啦。', '嘅。'] },
  shao: { pre: ['哈！', '喂，', '哇，', '嘿嘿，'], end: ['啦！', '㗎！'] },
  qing: { pre: ['哼！', '诶——', '吓？', '嘻嘻，'], end: ['啦！', '嘛！'] },
  yao: { pre: ['……嗯，', '呃，', '哦……'], end: ['……'] },
  hero: { pre: ['嗯，', '哦～', '哈哈，', '诶，'], end: ['啦。', '喎。'] },
  hui: { pre: ['哎呀！', '哈哈，'], end: ['啦！'] }, cheng: { pre: ['嗯……', '唔，'], end: [] },
  mum: { pre: ['哎呀，', '嗯，'], end: ['啦。'] }, dad: { pre: ['嗯，', '哈，'], end: ['啦。'] },
};
function toned(who, text) {
  const T = TONE[who]; if (!T || !text || /^[（(…嗯哦啦诶哎吓哈呃唔喂哼咦嘿哇嘻]/.test(text)) return text;
  let h = 7; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  let t = text;
  if (T.end.length && h % 10 < 3) { const e = T.end[h % T.end.length]; if (/[。！]$/.test(t) && !/[啦喎嘛嘅㗎]./.test(t.slice(-2))) t = t.slice(0, -1) + e; }
  if (h % 100 < 38) t = T.pre[(h >> 3) % T.pre.length] + t;
  return t;
}
const tonedLines = lines => lines.map(([w, x]) => [w, toned(w, x)]);
function playScene(key) {
  const pool = SCENES[key]; if (!pool) return;
  const lines = pick(pool).map(([who, text]) => [who === 'bar' ? (W.staff.wen.hired ? 'wen' : 'lin') : who, text]);
  STORY_Q.push({ key, lines: tonedLines(lines) });
}
function stepStory() { if (!DIALOG && STORY_Q.length && !PANEL && PHASE !== 'title' && PHASE !== 'ledger' && !DESK) DIALOG = { ...STORY_Q.shift(), i: 0, t: 0 }; if (DIALOG) DIALOG.t += 1 / 60; }
function advanceDialog() { if (!DIALOG) return; SFX.tap(); DIALOG.i++; DIALOG.t = 0; if (DIALOG.i >= DIALOG.lines.length) DIALOG = null; }
// a day worked together: affection +1 for everyone on the payroll; crossing a step queues that person's scene for the morning
function gainAffection() {
  W.aff = W.aff || {}; W.storyNext = W.storyNext || [];
  for (const k of cast()) { const before = W.aff[k] || 0, now = before + 1; W.aff[k] = now; const lv = AFF_STEPS.indexOf(now); if (lv >= 0) W.storyNext.push('aff_' + k + '_' + (lv + 1)); }
}
const affLevel = k => lvOf(k) - 1;   // affection grows only when the person levels up (0..4)
function morningStory() {   // one scene per morning at most: affection first, otherwise sometimes a bit of small talk
  W.storyNext = W.storyNext || [];
  if (W.storyNext.length) playScene(W.storyNext.shift());
  else if (W.day > 1 && rng() < .8) { const ok = SCENES.chat.filter(sc => sc.every(([w]) => !w || w === 'hero' || cast().includes(w))); if (ok.length) STORY_Q.push({ key: 'chat', lines: tonedLines(pick(ok)) }); }
}

// ---------------------------------------------------------------- the horizontal dialogue window
function wrapText(c, s, w) { c.font = fp(12); const out = []; let line = ''; for (const ch of s) { if (c.measureText(line + ch).width > w) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
function drawDialog(c) {
  const D = DIALOG, [who, text] = D.lines[D.i], hero = who === 'hero', id = hero ? 'hero_' + (W.hero || 'f') : who;
  c.save(); c.globalAlpha = .5; px(c, 0, 0, 360, 640, '#1c141c'); c.restore();
  button(0, 0, 360, 640, advanceDialog);
  if (id && BUSTS[id]) { const b = bust(id), x = hero ? 236 : 14; c.drawImage(b, x, 474 - b.height / 2, b.width / 2, b.height / 2); }   // bust stands on the window
  px(c, 5, 465, 350, 118, OUT); px(c, 6, 466, 348, 116, '#fffaf0'); px(c, 6, 466, 348, 2, '#ffffff'); px(c, 6, 578, 348, 4, '#ead9b8');
  const name = who ? (hero ? '店主' : who === 'temp' ? HIRE.temp.name : NAMES[who]) : '';
  if (name) { c.font = sr(14); const w = R(c.measureText(name).width) + 22, x = hero ? 340 - w : 14; px(c, x - 1, 445, w + 2, 22, OUT); px(c, x, 446, w, 20, '#5a3524'); px(c, x, 446, w, 1, '#7a4a32'); TS(c, name, x + w / 2, 448, 14, '#fbe9c0', 'center'); }
  const shown = text.slice(0, Math.floor(D.t * 40) + 1);   // typewriter
  wrapText(c, shown, 316).slice(0, 4).forEach((l, i) => T(c, l, 22, 480 + i * 22, who ? '#3a2a2e' : '#7a6250', 'left', null));
  if (Math.sin(gtime * 6) > 0) T(c, '▼', 338, 560, '#b8342c', 'center', null);
  px(c, 296, 42, 56, 24, OUT); px(c, 297, 43, 54, 22, '#4a3a48'); T(c, '跳过', 324, 48, '#fbe9c0', 'center', null);
  button(292, 38, 64, 32, () => { DIALOG = null; STORY_Q.length = 0; SFX.tap(); });
}
// while the shop is open, someone not busy now and then says one of their lines (a bubble over their head)
const MURMUR_AT = { kun: [250, 22], lin: [84, 23], hero: [50, 24], wen: [156, 25], shao: [191, 293], qing: [136, 25], yao: [226, 22] }, MURMUR_WHO = {};
let murmurT = 18;
function stepMurmur(dt) {
  if (!isOpenPhase() || (murmurT -= dt) > 0) return; murmurT = 22 + rng() * 22;
  const who = cast().concat('hero').filter(k => MURMUR[k] && MURMUR_AT[k]);
  const k = pick(who); if (!k) return;
  const [x, y] = HIRE[k] ? (W.staff[k].post === 'bar' ? (postsOf('bar').indexOf(k) ? [136, 25] : MURMUR_AT.wen) : W.staff[k].post === 'take' ? MURMUR_AT.shao : W.staff[k].post === 'bake' ? [226, 22] : [244, 56]) : MURMUR_AT[k];
  const o = MURMUR_WHO[k] || (MURMUR_WHO[k] = {}); o.x = x; o.y = y; o.gone = false;
  say(o, toned(k, pick(MURMUR[k])));
}
