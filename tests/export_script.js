// export every line of dialogue as a readable script (Mandarin, as the game shows it)
// usage: node headless.js . tests/export_script.js > 剧本.md
const nm = (w, ci, cname) => w === 'hero' ? '店主' : w === 'cust' ? (cname || GUEST_DEF[ci] && GUEST_DEF[ci].name || '客人') : w === 'temp' ? '兼职' : w === 'bar' ? '水吧（雯姐 / 莲姨）' : NAMES[w] || w;
const out = [];
const META = (typeof process !== 'undefined' && process.env.EXPORT_JSON) || (typeof ARGS !== 'undefined' && [].concat(ARGS).join(' ').includes('json')), meta = []; let SEC = '';   // json: one record per line with its source text, for writing edits back
const say = (lines, ci, cname) => { for (const [w, t] of lines) { const shown = L(w && TONE[w] ? t : t); meta.push([SEC, w, t, shown]); out.push(w ? '**' + nm(w, ci, cname) + '**：' + shown : '*' + shown + '*'); } out.push(''); };
const H = (t, n = 2) => { if (n === 3) SEC = t; out.push('#'.repeat(n) + ' ' + t); out.push(''); };
const scenes = k => (SCENES[k] || []).map(v => Array.isArray(v[0]) && Array.isArray(v[0][0]) ? v : [v]).flat();
out.push('# 街记冰室 · 对白剧本', '', '> 游戏里普通话版的全部对白，按类别排。直接在这里改字或批注，告诉我要改的风格。', '');
H('人设');
out.push('- **坤伯**：老饼师。话少、细腻、重感情；其实很爱教人，被问起会一口气讲很多。和荣叔是老朋友，常一起去钓鱼。',
  '- **莲姨**：前零售主管。八卦、存在感强，常追问老板为什么开冰室（总被打哈哈）。常带早餐给大家，任劳任怨。',
  '- **雯姐**：水吧。很有钱、只是来找事做；六点准时下班，上班下班两个样。偶尔有富婆朋友来探班，一买就很多。',
  '- **阿少**：招待。成熟的花花公子，安静体贴，说话像诗，疑似名人。',
  '- **阿青**：莲姨外甥女，中六，爱画画、爱改名。 **耀仔**：惠姐外甥，读过烘焙课，爱记笔记。',
  '- **荣叔**：材料店老板，坤伯几十年的老朋友，偶尔来说今天进货八折。', '');
H('员工入职');
for (const k of Object.keys(SCENES).filter(k => k.startsWith('hire_'))) { H(NAMES[k.slice(5)] || k, 3); scenes(k).forEach(l => say(l)); }
H('好感剧情（一起工作越久越多）');
for (const k of Object.keys(SCENES).filter(k => k.startsWith('aff_'))) { H((NAMES[k.split('_')[1]] || k) + ' ' + k.split('_')[2], 3); scenes(k).forEach(l => say(l)); }
H('早上闲聊（随机一段）');
SCENES.chat.forEach((l, i) => { H('闲聊 ' + (i + 1), 3); say(l); });
H('研发 · 升级 · 扩建');
for (const k of Object.keys(SCENES).filter(k => !/^(hire_|aff_|chat$)/.test(k))) { H(k, 3); scenes(k).forEach(l => say(l)); }
H('兼职第一天');
for (const k in TEMP_TALK) { H(k, 3); say(TEMP_TALK[k]); }
H('工作时自言自语（头上气泡）');
for (const k in MURMUR) { out.push('**' + nm(k) + '**：' + MURMUR[k].map(t => L(t)).join(' / ')); MURMUR[k].forEach(t => meta.push(['murmur', k, t, L(t)])); } out.push('');
H('客人：第一次来光顾');
for (const k in FIRST_TALK) { H(k, 3); say(FIRST_TALK[k], GUEST_DEF.findIndex(g => g.name === k)); }
H('客人：好感 8 送礼时');
for (const k in GIFT_THANKS) { H(k, 3); say(GIFT_THANKS[k], GUEST_DEF.findIndex(g => g.name === k)); }
H('客人：好感 14 老熟客故事 + 纪念品');
for (const k in LOYAL_TALK) { H(k + ' — 纪念品「' + KEEPSAKE[k] + '」', 3); say(LOYAL_TALK[k], GUEST_DEF.findIndex(g => g.name === k)); }
H('小剧场（营业中）');
EPISODES.forEach(e => { H(e.id, 3); say(e.lines, e.ci != null ? e.ci : 0, e.cname || (e.ci == null ? '客人' : null)); });
H('中插连续剧（营业中，分几集）');
EP_ARCS.forEach(e => { H(e.arc + ' ' + e.part + '：' + e.id, 3); say(e.lines, e.ci != null ? e.ci : 0, e.cname || '客人'); });
H('荣叔来访（当天进货八折）');
RONG_TALK.forEach((l, i) => { H('第 ' + (i + 1) + ' 段', 3); say(l); });
console.log(META ? JSON.stringify(meta) : out.join('\n'));
