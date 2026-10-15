// ==== lang: 普通话 (default) / 粵語 (Traditional characters). The game's lines are written in Cantonese with simplified characters;
// 普通话 turns the Cantonese words into Mandarin, 粵語 keeps the words and shows them in Traditional characters. Every canvas text call
// goes through L(), so panels, dialogue, bubbles and the shop signs all follow the setting (stored in this browser).
let LANG = 'cmn'; try { LANG = localStorage.getItem('jj_lang') || 'cmn'; } catch (e) {}
const S2T_PAIRS = '__S2T__', S2T = new Map(); for (let i = 0; i < S2T_PAIRS.length; i += 2) S2T.set(S2T_PAIRS[i], S2T_PAIRS[i + 1]);
const KEEP = ['冻饮', '饮品', '饮料', '冷饮', '热饮', '电话', '说话', '对话', '同事', '同学', '一同', '机械系', '中文系', '翻译系', '设计系', '电脑系', '系列', '关系', '系统', '食品', '食物', '零食', '甜食', '美食', '食材', '食谱', '试食', '点心', '一点', '点单', '点餐', '点亮', '重点', '点击'];
const T_FIX = [['头发', '頭髮'], ['发夹', '髮夾'], ['发型', '髮型'], ['发丝', '髮絲'], ['面包', '麵包'], ['面粉', '麵粉'], ['面团', '麵團'], ['面皮', '麵皮'], ['一只', '一隻'], ['只猫', '隻貓'], ['干净', '乾淨'], ['饼干', '餅乾'], ['干活', '幹活'], ['蛋挞', '蛋撻'], ['椰挞', '椰撻']];
const YUE_CMN = [   // longest first: Cantonese words -> Mandarin
  ['咁你', '那你'], ['咁我', '那我'], ['嗰边', '那边'], ['同佢', '跟他'], ['焗多盘先', '多烤一盘'], ['啲姊妹', '的姐妹'], ['我啲', '我的'],
  ['成个下昼', '整个下午'], ['下昼', '下午'], ['老陈个仔女', '老陈的孩子'], ['我间铺', '我那间铺子'], ['间铺', '那间铺子'], ['咁冻饮', '那冻饮'], ['有冇', '有没有'], ['隔离', '隔壁'], ['几得意', '挺有意思'], ['得意', '可爱'],
  ['倾下', '聊聊'], ['倾偈', '聊天'], ['试下', '试试'], ['试吓', '试试'], ['看下', '看看'], ['睇下', '看看'], ['谂下', '想想'], ['改下', '改改'], ['问下', '问问'], ['等阵', '等一下'], ['一阵', '一会儿'], ['一齐', '一起'],
  ['点答', '怎么答'], ['点知', '怎么知道'], ['点叫', '怎么叫'], ['改成点', '改成怎样'], ['成个', '整个'], ['搞掂', '搞定'], ['整掂', '弄好'], ['掂', '好'], ['嘥', '浪费'], ['谂', '想'], ['抹枱', '擦桌子'], ['枱', '桌子'],
  ['放工', '下班'], ['写住', '写着'], ['夹住', '夹着'], ['画埋', '也画上'], ['落菜单', '到菜单上'], ['同他', '跟他'], ['同她', '跟她'], ['同小沅', '跟小沅'], ['同我', '跟我'], ['同你', '跟你'], ['讲', '说'],
  ['日日', '每天'], ['第一日', '第一天'], ['平两成', '便宜两成'], ['平啲', '便宜些'], ['礼拜', '星期'], ['个心', '这颗心'], ['阿妈', '妈妈'], ['咋', '而已'], ['话', '说'],
  ['唔该晒', '谢谢'], ['多谢晒', '谢谢'], ['辛苦晒', '辛苦了'], ['卖晒', '卖完'], ['饮晒', '喝完'], ['做晒', '做完'], ['唔该', '谢谢'], ['点解', '为什么'], ['点算', '怎么办'], ['点样', '怎样'], ['点够', '怎么够'], ['点会', '怎么会'],
  ['乜嘢', '什么'], ['咩嘢', '什么'], ['边个', '谁'], ['边度', '哪里'], ['呢度', '这里'], ['嗰度', '那里'], ['依家', '现在'], ['而家', '现在'], ['今日', '今天'], ['听日', '明天'], ['琴日', '昨天'], ['寻日', '昨天'], ['头先', '刚才'],
  ['唔使', '不用'], ['唔好', '不要'], ['唔系', '不是'], ['唔识', '不会'], ['唔够', '不够'], ['唔得', '不行'], ['冇得', '没得'], ['冇人', '没人'], ['冇嘢', '没东西'], ['佢哋', '他们'], ['我哋', '我们'], ['你哋', '你们'], ['佢', '他'], ['哋', '们'],
  ['返工', '上班'], ['收工', '下班'], ['返嚟', '回来'], ['返去', '回去'], ['返屋企', '回家'], ['屋企', '家里'], ['做嘢', '干活'], ['嘢', '东西'], ['啱啱', '刚刚'], ['啱', '对'], ['咁样', '这样'], ['咁', '这么'], ['噉', '这样'],
  ['呢个', '这个'], ['呢样', '这样'], ['呢次', '这次'], ['呢杯', '这杯'], ['呢只', '这只'], ['呢盘', '这盘'], ['呢炉', '这炉'], ['呢间', '这间'], ['呢条', '这条'], ['呢位', '这位'], ['嗰个', '那个'], ['嗰阵', '那时'], ['嗰', '那'],
  ['好味', '好吃'], ['抵食', '划算'], ['帮衬', '光顾'], ['老细', '老板'], ['揸', '拿'], ['攞', '拿'], ['拎', '拿'], ['揾', '找'], ['搵', '找'], ['睇', '看'], ['饮', '喝'], ['食', '吃'], ['俾', '给'], ['畀', '给'], ['喺', '在'], ['嚟', '来'],
  ['咗', '了'], ['嘅', '的'], ['啲', '些'], ['冇', '没'], ['唔', '不'], ['系', '是'], ['仲', '还'], ['咩', '什么'], ['乜', '什么'], ['靓', '漂亮'], ['执', '收拾'], ['晒', '完'], ['嘞', '了'], ['喇', '了'], ['喎', '哦'], ['㗎', '的'], ['啩', '吧'], ['咪', '不就'], ['返', '回'],
];
const CMN_DICT = new Map(Object.entries(__CMN__));   // hand-written Mandarin for every Cantonese line in the game
const TONE_PRE = ['嗯。', '……嗯，', '哼，', '哎呀，', '哈哈，', '咦，', '哦～', '嗯，', '好啦，', '哦，', '哈！', '喂，', '哇，', '嘿嘿，', '哼！', '诶——', '吓？', '嘻嘻，', '呃，', '哦……', '诶，', '嗯……', '唔，', '哈，'];
const TONE_END = ['啦。', '喎。', '嘛。', '嘅。', '啦！', '㗎！', '嘛！', '……'];
function dictCmn(s) {   // an exact line, or one with a little sound of speech added in front / at the end (story.js toned())
  if (CMN_DICT.has(s)) return CMN_DICT.get(s);
  for (const p of TONE_PRE) if (s.startsWith(p)) { const r = dictCmn(s.slice(p.length)); if (r !== null) return toCmn(p) + r; }
  for (const e of TONE_END) if (s.endsWith(e)) { const b = s.slice(0, -e.length); for (const tail of ['。', '！', '']) { if (CMN_DICT.has(b + tail)) { const v = CMN_DICT.get(b + tail); return /[啦呀哦吧嘛啊了~～…][。！？]?$/.test(v) ? v : v.replace(/[。！]?$/, toCmn(e)); } /* the line already ends softly: no second particle */ } }
  return null;
}
const L_CACHE = new Map();
const CMN_MAP = new Map(YUE_CMN.concat(KEEP.map(w => [w, w]))), CMN_RE = new RegExp([...CMN_MAP.keys()].sort((a, b) => b.length - a.length).join('|'), 'g');   // one pass, longest word first (protected words map to themselves)
function toCmn(s) { return s.replace(CMN_RE, m => CMN_MAP.get(m)); }
function toYue(s) { let t = s.replace(/(机械|中文|翻译|设计|电脑|关)系|系(列|统)|系/g, (m, a, b) => a || b ? m : '係'); for (const [a, b] of T_FIX) if (t.includes(a)) t = t.split(a).join(b); let o = ''; for (const ch of t) o += S2T.get(ch) || ch; return o; }
function L(s) { if (typeof s !== 'string' || !/[一-鿿]/.test(s)) return s; const k = LANG + s; let v = L_CACHE.get(k); if (v === undefined) { v = LANG === 'yue' ? toYue(s) : (dictCmn(s) ?? toCmn(s)); L_CACHE.set(k, v); } return v; }
if (typeof CanvasRenderingContext2D !== 'undefined') { const P_ = CanvasRenderingContext2D.prototype, f = P_.fillText, st = P_.strokeText, m = P_.measureText;   // every text drawn on a canvas follows the language
  P_.fillText = function (s, ...a) { return f.call(this, L(s), ...a); }; P_.strokeText = function (s, ...a) { return st.call(this, L(s), ...a); }; P_.measureText = function (s) { return m.call(this, L(s)); }; }
function setLang(l) { if (l === LANG) return; try { localStorage.setItem('jj_lang', l); } catch (e) {} if (W && PHASE !== 'title') saveGame(); location.reload(); }   // signs and menus are baked into the shop picture: reload to redraw them
