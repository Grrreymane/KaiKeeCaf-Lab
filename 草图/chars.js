'use strict';
// 店里走动的人：30×61 画布，朝右下的 3/4 正面 + 背面，左右靠镜像。
// 大人约 3.5 头身；小孩约 2.6 头身。肩膀、手臂、腿都是圆的（两头收），头发比头大一圈，鞋子大一号。
const FOOT = 58;   // 脚底下面那一行（放到地上时的锚点）
const SKIN = {
  pale: ['#f8dcc4', '#e6b89a'], light: ['#f6d2b0', '#e0ab88'], mid: ['#ecbb92', '#d09a72'],
  tan: ['#d9a07a', '#b57c58'], brown: ['#a8704a', '#8a5638'], deep: ['#7a4b30', '#5f3822'],
};
const BODY = {   // L 腿长、Tl 身长、w 胖瘦、belly 肚子、stoop 驼背（照用户手画的比例：身长 > 腿长）
  adult: { L: 14, Tl: 16, w: 0 }, slim: { L: 14, Tl: 16, w: -.5 }, stocky: { L: 13, Tl: 16, w: .8 }, round: { L: 13, Tl: 16, w: .8, belly: 1.4 },
  teen: { L: 13, Tl: 14, w: -.4 }, child: { L: 8, Tl: 11, w: -1 }, old: { L: 13, Tl: 15, w: .2, stoop: 1 },
};
let FACE = 'B';   // 五官方案：A 点点眼、B 大眼、C 写实（人物风格.html 里比较）
const SHOP_APRON = '#3f8f74';   // 店里统一的深薄荷围裙（坤伯穿自己的旧白围裙）

// 一段圆头的肢体（竖着）：中间宽 2r，两头收一像素；cx1 给了就从 cx 斜到 cx1（手臂往外微张）
function limb(G, cx, y0, y1, r, col, cx1 = cx) { for (let y = y0; y <= y1; y++) { const t = y1 > y0 ? (y - y0) / (y1 - y0) : 0, c = cx + (cx1 - cx) * t, e = (y === y0 || y === y1) ? r - .7 : r; const l = R(c - e), rr = R(c + e); G.rect(l, y, Math.max(1, rr - l), 1, col); } }

function hairFront(G, o, H, hy) {
  const HL = shade(H, 30), HD = shade(H, -26), back = (x, y) => x <= 10.5 && y <= hy + 3;
  // 头发比头大一圈：顶上鼓一点、后脑勺多出一块
  const cap = (lim) => { G.ell(15, hy - 2, 8.6, 7.6, (x, y) => (y <= lim || back(x, y)) ? H : null); G.ell(15, hy - 4.2, 8.8, 5.4, (x, y) => y <= lim ? H : null); };
  switch (o.hs) {
    case 'crop': G.ell(15, hy - 2.5, 8, 6.8, (x, y) => (y <= hy - 5 || (x <= 10 && y <= hy + 2)) ? H : null); break;
    case 'bald': G.rect(7, hy - 2, 4, 7, H); G.set(11, hy - 1, H); break;
    case 'buzz': G.ell(15, hy - 2.5, 7.6, 6.8, (x, y) => (y <= hy - 4 || (x <= 10 && y <= hy + 1)) ? H : null); break;
    case 'perm': case 'curly': {
      const big = o.hs === 'perm' ? 9.6 : 8.8;
      G.ell(15, hy - 2.8, big, 7.8, (x, y) => (y <= hy - 3 || (x <= 10 && y <= hy + (o.hs === 'perm' ? 4 : 2))) ? H : null);
      for (const [x, y] of [[8, 4], [11, 2], [14, 1], [17, 2], [20, 3], [22, 6], [7, 8], [10, 5], [16, 4], [19, 6], [13, 3]]) G.set(x, y + hy - 11, HD);
      break;
    }
    default: cap(hy - 3);
  }
  const fringe = ['short', 'bun', 'pony', 'messy', 'twin', 'curly', 'spiky', 'braid', 'spaceBuns'];
  if (fringe.includes(o.hs)) for (let x = 11; x < 21; x++) if (x % 3) G.set(x, hy - 2, H);
  if (o.hs === 'long' || o.hs === 'bob') { G.rect(11, hy - 2, 11, 1, H); G.set(11, hy - 1, H); G.set(14, hy - 1, H); G.set(17, hy - 1, H); }
  if (o.hs === 'bun') { G.ell(9, hy - 9, 3.8, 3.4, H); G.rect(10, hy - 6, 3, 1, o.tieCol || '#d9372a'); }
  if (o.hs === 'pony') { limb(G, 7, hy - 2, hy + 8, 1.8, H); limb(G, 6, hy + 4, hy + 12, 1.6, H); G.rect(7, hy - 3, 2, 1, o.tieCol || '#d9372a'); }
  if (o.hs === 'twin') { for (const x of [5.5, 24.5]) { G.ell(x, hy + 3, 2.4, 4.6, H); G.set(R(x), hy - 1, o.tieCol || '#ff6a8a'); } }
  if (o.hs === 'long') { G.rect(6, hy - 2, 5, 16, H); limb(G, 8, hy + 12, hy + 15, 2.2, H); G.rect(21, hy - 2, 3, 6, H); G.rect(22, hy + 4, 2, 10, H); limb(G, 23, hy + 12, hy + 15, 1.6, H); if (o.clip) G.rect(18, hy - 5, 3, 1, o.clip); }
  if (o.hs === 'bob') { G.rect(6, hy - 2, 5, 10, H); G.rect(20, hy - 2, 4, 8, H); G.rect(6, hy + 7, 5, 1, HD); }
  if (o.hs === 'messy') { for (const [x, t] of [[10, -11], [14, -12], [18, -12], [22, -10]]) G.tri(x - 2, hy - 7, x + 2, hy - 7, x + (x > 15 ? 1 : -1), hy + t, H); G.set(12, hy - 3, H); G.set(18, hy - 3, H); }
  if (o.hs === 'side') { G.ell(15, hy - 4.5, 9, 5.6, (x, y) => y <= hy - 3 ? H : null); G.rect(13, hy - 3, 10, 2, H); G.set(22, hy - 1, H); G.set(21, hy - 1, H); }
  // 新发型：寸头、刺猬头、锅盖头、侧辫、双丸子、头顶小髻、大波浪、中分长发、男生中分、两边铲短
  if (o.hs === 'buzz') { const HD = shade(H, -26); for (const [x, y] of [[10, -6], [13, -8], [16, -7], [19, -6], [12, -4], [18, -5]]) G.set(x, hy + y, HD); }
  if (o.hs === 'spiky') for (const [x, t] of [[8, -10], [11.5, -13], [15, -14], [18.5, -13], [22, -10]]) G.tri(x - 2.2, hy - 6, x + 2.2, hy - 6, x + (x - 15) * .15, hy + t, H);
  if (o.hs === 'bowl') { G.rect(9, hy - 3, 14, 1, H); G.rect(9, hy - 2, 2, 3, H); G.rect(21, hy - 2, 2, 3, H); }
  if (o.hs === 'braid') { const HD = shade(H, -26); for (let i = 0; i < 7; i++) G.ell(22.4 - i * .1, hy + 1 + i * 2, 1.9, 1.3, i % 2 ? HD : H); G.rect(21, hy + 15, 3, 1, o.tieCol || '#d9372a'); limb(G, 22.4, hy + 16, hy + 18, 1, H); }
  if (o.hs === 'spaceBuns') { G.ell(8.5, hy - 8, 3.6, 3.2, H); G.ell(21.5, hy - 8, 3.6, 3.2, H); G.set(9, hy - 9, HL); G.set(22, hy - 9, HL); }
  if (o.hs === 'topknot') { G.ell(15, hy - 10, 3.4, 2.8, H); G.rect(13, hy - 8, 5, 1, o.tieCol || HD); }
  if (o.hs === 'wavy') { for (let y = -2; y < 15; y++) { const w = R(Math.sin(y * .7) * 1.2); G.rect(6 + w, hy + y, 5, 1, H); if (y < 12) G.rect(21 + w, hy + y, 3, 1, H); } }
  if (o.hs === 'midpart' || o.hs === 'curtain') var HDp = shade(H, -30);
  if (o.hs === 'midpart') { G.rect(6, hy - 2, 5, 16, H); limb(G, 8, hy + 12, hy + 15, 2.2, H); G.rect(21, hy - 2, 3, 6, H); G.rect(22, hy + 4, 2, 10, H); G.seg([16, hy - 9], [16, hy - 4], HDp); G.rect(11, hy - 3, 3, 2, H); G.rect(18, hy - 3, 3, 2, H); }
  if (o.hs === 'curtain') { G.seg([16, hy - 9], [16, hy - 4], HDp); G.rect(10, hy - 3, 4, 3, H); G.rect(18, hy - 3, 4, 3, H); G.set(13, hy - 1, H); G.set(18, hy - 1, H); }
  if (o.hs === 'undercut') { G.ell(15, hy - 5, 8.6, 5.4, (x, y) => y <= hy - 3 ? H : null); G.rect(8, hy - 3, 3, 5, shade(H, 40)); G.rect(13, hy - 3, 10, 1, H); G.set(22, hy - 2, H); }
  if (o.hs !== 'bald') for (const [x, y] of [[11, -7], [12, -7], [13, -8], [12, -6], [14, -8]]) G.set(x, hy + y, HL);
}
function hairBack(G, o, H, hy, sk, skD) {
  const HL = shade(H, 30), shortCut = ['short', 'crop', 'messy', 'side', 'curly', 'buzz', 'spiky', 'curtain', 'undercut', 'bowl'].includes(o.hs);
  if (o.hs === 'bald') { G.rect(8, hy - 1, 14, 6, H); G.rect(9, hy + 5, 12, 1, H); }
  else if (o.hs === 'perm') G.ell(15, hy - 1.5, 9.6, 9.4, H);
  else if (shortCut) G.ell(15, hy - 1.8, 8.6, 8.4, (x, y) => y <= hy + (o.hs === 'crop' ? 2 : 4) ? H : null);
  else G.ell(15, hy - 1.2, 8.6, 9, H);
  if (o.hs === 'bun') { G.ell(15, hy - 9, 3.8, 3.4, H); G.rect(14, hy - 6, 3, 1, o.tieCol || '#d9372a'); }
  if (o.hs === 'pony') { G.rect(14, hy + 4, 3, 1, o.tieCol || '#d9372a'); limb(G, 15, hy + 5, hy + 15, 1.8, H); }
  if (o.hs === 'twin') for (const x of [6, 24]) G.ell(x, hy + 3, 2.4, 4.6, H);
  if (o.hs === 'long' || o.hs === 'midpart' || o.hs === 'wavy') { G.rect(7, hy + 3, 16, 12, H); limb(G, 15, hy + 13, hy + 16, 7, H); }
  if (o.hs === 'wavy') for (let y = 3; y < 15; y += 3) { G.set(7, hy + y, null); G.set(22, hy + y + 1, shade(H, -20)); }
  if (o.hs === 'braid') { for (let i = 0; i < 7; i++) G.ell(15, hy + 6 + i * 2, 1.9, 1.3, i % 2 ? shade(H, -26) : H); G.rect(14, hy + 20, 3, 1, o.tieCol || '#d9372a'); }
  if (o.hs === 'spaceBuns') { G.ell(8.5, hy - 8, 3.6, 3.2, H); G.ell(21.5, hy - 8, 3.6, 3.2, H); }
  if (o.hs === 'topknot') G.ell(15, hy - 10, 3.4, 2.8, H);
  if (o.hs === 'spiky') for (const [x, t] of [[8, -10], [11.5, -13], [15, -14], [18.5, -13], [22, -10]]) G.tri(x - 2.2, hy - 6, x + 2.2, hy - 6, x, hy + t, H);
  if (o.hs === 'undercut') G.rect(8, hy + 1, 14, 3, shade(H, 40));
  if (o.hs === 'bob') G.rect(7, hy + 3, 16, 5, H);
  if (shortCut) { G.rect(13, hy + 4, 4, 1, shade(H, -20)); G.rect(13, hy + 5, 4, 2, skD); }
  if (o.hs === 'messy') for (const [x, t] of [[10, -11], [14, -12], [18, -12], [22, -10]]) G.tri(x - 2, hy - 7, x + 2, hy - 7, x, hy + t, H);
  G.rect(6, hy, 1, 3, sk); G.rect(23, hy, 1, 3, sk);
  if (o.hs !== 'bald') for (const [x, y] of [[11, -7], [12, -8], [13, -8], [14, -8]]) G.set(x, hy + y, HL);
}
function faceFront(G, o, hy, sk, skD) {
  const st = o.face || FACE, eye = '#2a2028', iris = o.iris || '#6a4030', brow = o.brow || shade(o.hair, -36), dark = o.skin === 'deep' || o.skin === 'brown';
  const lip = o.lip || (dark ? '#4e2418' : '#b8574e'), eb = st === 'A' ? 1 : 2;   // eb：眼睛往下占几行
  if (st === 'A') {   // A 点点眼：2×2 黑眼 + 一点高光
    G.rect(12, hy, 2, 2, eye); G.rect(17, hy, 2, 2, eye); G.set(13, hy, '#ffffff'); G.set(18, hy, '#ffffff');
    G.rect(12, hy - 2, 2, 1, brow); G.rect(17, hy - 2, 3, 1, brow);
    G.set(20, hy + 2, skD); G.set(19, hy + 3, skD); G.rect(16, hy + 4, 2, 1, lip);
  } else if (st === 'B') {   // B 大眼：上眼线 + 黑眼珠带高光 + 下面一行眼珠色；眉毛、鼻尖、三格嘴、腮红
    for (const x of [12, 17]) { G.rect(x, hy, 2, 3, eye); G.set(x + 1, hy, '#ffffff'); G.set(x, hy + 2, iris); }   // 竖长的黑眼珠，右上一点高光
    G.rect(12, hy - 2, 2, 1, shade(brow, 20)); G.rect(17, hy - 2, 2, 1, shade(brow, 20));
    G.set(20, hy + 3, skD);
    // 嘴：line 一字（三格一样色）、smile 微笑弧、cat 猫嘴 ω、open 张嘴笑
    const m = o.mouth || (o.mouthEven ? 'line' : 'tilt'), dl = shade(lip, -18), inside = '#6a2228';
    if (m === 'line') { G.rect(15, hy + 5, 3, 1, lip); G.set(16, hy + 6, shade(sk, -14)); }
    else if (m === 'short') G.rect(15, hy + 5, 2, 1, lip);   // 短一字：两格
    else if (m === 'smile') { G.set(14, hy + 4, dl); G.rect(15, hy + 5, 2, 1, dl); G.set(17, hy + 4, dl); }
    else if (m === 'cat') { G.set(14, hy + 4, dl); G.set(15, hy + 5, dl); G.set(16, hy + 4, dl); G.set(17, hy + 5, dl); G.set(18, hy + 4, dl); }
    else if (m === 'open') { G.rect(15, hy + 4, 3, 1, inside); G.set(15, hy + 5, inside); G.set(16, hy + 5, '#ef8f8f'); G.set(17, hy + 5, inside); }
    else { G.rect(15, hy + 5, 3, 1, lip); G.set(17, hy + 5, shade(lip, 30)); }
    if (!o.old) { G.rect(10, hy + 3, 2, 1, '#f2a59a'); G.rect(19, hy + 4, 2, 1, '#f2a59a'); }
  } else {   // C 写实一点：上眼皮线 + 眼白 + 眼珠往右看 + 下眼皮影；鼻梁影、鼻孔；上下唇；脸侧阴影
    for (const [x, ir] of [[11, 13], [16, 18]]) { G.rect(x, hy, 3, 1, eye); G.rect(x, hy + 1, 3, 1, '#fbf6f0'); G.set(ir, hy + 1, eye); G.set(ir, hy + 2, iris); }
    G.rect(11, hy - 2, 3, 1, brow); G.rect(16, hy - 2, 3, 1, brow);
    G.set(19, hy + 2, skD); G.set(19, hy + 3, skD); G.set(18, hy + 4, shade(skD, -24));
    G.rect(15, hy + 5, 3, 1, shade(lip, -20)); G.rect(15, hy + 6, 2, 1, shade(sk, -12));
    G.set(21, hy + 2, skD); G.set(21, hy + 3, skD); G.set(20, hy + 5, skD);
  }
  if (o.old) { G.rect(11, hy - 3, 3, 1, brow); G.rect(17, hy - 3, 3, 1, brow); G.set(15, hy - 1, skD); G.set(11, hy + eb + 1, skD); G.set(19, hy + eb + 1, skD); G.set(14, hy + 5 + (st === 'C' ? 1 : 0), skD); }
  if (o.blush && st === 'A') { G.set(11, hy + 2, '#f2a08f'); G.set(20, hy + 3, '#f2a08f'); }
  if (o.freckles) for (const [x, y] of [[11, 3], [12, 4], [19, 4], [20, 3]]) G.set(x, hy + y, shade(sk, -40));
  if (o.glasses) { const g = o.glasses; G.rect(11, hy - 1, 4, 1, g); G.rect(11, hy + eb + 1, 4, 1, g); G.rect(16, hy - 1, 4, 1, g); G.rect(16, hy + eb + 1, 4, 1, g); for (let y = hy; y <= hy + eb; y++) { G.set(11, y, g); G.set(19, y, g); } G.set(15, hy, g); }
  if (o.shades) { G.rect(11, hy - 1, 10, eb + 2, '#2a2028'); G.set(12, hy - 1, '#6a6a7a'); G.set(17, hy - 1, '#6a6a7a'); }
  G.rect(9, hy, 2, 3, sk); G.set(10, hy + 1, skD);   // 耳朵
}
// 头发细节（盘发）：发丝暗线顺着往发髻收、一圈亮光、发髻卷一圈、鬓角掉下来一缕
function hairDetail(G, o, hy, back) {
  // 浅浅几道发丝（只深一档）+ 头顶一圈亮光 + 发髻里卷一下；发绳最后补回去，不被盖住
  const H = o.hair, HS = shade(H, -14), HL = shade(H, 42), HL2 = shade(H, 24), tie = o.tieCol || '#d9372a';
  if (!back) {
    G.seg([13, hy - 8], [12, hy - 5], HS); G.seg([17, hy - 8], [18, hy - 5], HS); G.seg([20, hy - 6], [21, hy - 4], HS);
    for (const [x, y, c] of [[11, -7, HL2], [12, -8, HL], [13, -9, HL], [14, -9, HL], [15, -9, HL2], [17, -9, HL2]]) G.set(x, hy + y, c);
    for (const [x, y] of [[8, -9], [9, -10], [10, -9]]) G.set(x, hy + y, HS); G.set(8, hy - 11, HL2);
    G.rect(10, hy - 6, 3, 1, tie);
    G.rect(21, hy - 2, 1, 3, H); G.set(22, hy + 1, H);
  } else {
    G.seg([11, hy + 2], [14, hy - 5], HS); G.seg([19, hy + 2], [16, hy - 5], HS);
    for (const [x, y, c] of [[11, -7, HL2], [12, -8, HL], [13, -8, HL], [17, -8, HL2]]) G.set(x, hy + y, c);
    for (const [x, y] of [[14, -9], [15, -10], [16, -9]]) G.set(x, hy + y, HS); G.set(14, hy - 11, HL2);
    G.rect(14, hy - 6, 3, 1, tie);
  }
}
function hat(G, o, hy, back) {
  if (!o.hat) return; const c = o.hat, cD = shade(c, -26);
  if (o.hatType === 'sun') { G.ell(15, hy - 4, 11.5, 2.8, c); G.ell(15, hy - 6.5, 6.4, 4.2, (x, y) => y <= hy - 4 ? c : null); G.rect(9, hy - 6, 12, 1, o.hatBand || '#d9372a'); return; }
  if (o.hatType === 'beret') { G.ell(14, hy - 6, 9, 4, (x, y) => y <= hy - 4 ? c : null); G.set(14, hy - 10, cD); return; }
  if (o.hatType === 'flat') { G.ell(15, hy - 4.5, 8.6, 4.4, (x, y) => y <= hy - 3 ? c : null); if (!back) G.rect(18, hy - 4, 6, 2, cD); return; }
  G.ell(15, hy - 5, 8.4, 5, (x, y) => y <= hy - 3 ? c : null); G.rect(9, hy - 4, 13, 1, cD);
  if (!back) { G.rect(19, hy - 4, 7, 2, cD); G.rect(19, hy - 4, 7, 1, c); } else G.rect(13, hy - 3, 4, 1, cD);
}

function drawBody(G, o, back, frame, seat) {
  const [sk, skD] = SKIN[o.skin || 'light'], B0 = BODY[o.body || 'adult'], B = { ...B0, ...(o.L ? { L: o.L } : {}), ...(o.Tl ? { Tl: o.Tl } : {}) };   // o.L / o.Tl：单独改腿长、身长
  const b = seat ? 0 : (frame % 2 ? -1 : 0), st = seat ? 0 : frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const top = o.top, topD = shade(o.top, -28), low = o.low || '#3f4256', lowD = shade(low, -22), shoe = o.shoe || '#2e2a30';
  const shoeTop = 53, legTop = shoeTop - B.L, TY = legTop - B.Tl + b + (B.stoop || 0), HY = TY - (o.neck === 'shorter' ? 8 : o.neck === 'short' ? 9 : 10) + (B.stoop || 0);
  const hx = B.stoop ? 1 : 0, wide = B.w + (o.oversize ? 1 : 0) + (o.muscle ? .6 : 0);
  let hands = [];
  {
    // ---- 腿：上粗下细、膝盖一点鼓、两腿中间留缝；走路时前腿长一点
    if (!seat) {
      // walkSmall：步子小，前腿只长一格、后腿不缩
      const lL = B.L + (o.walkSmall ? (st === 1 ? 1 : 0) : (st === 1 ? 2 : st === -1 ? -1 : 0)), rL = B.L + (o.walkSmall ? (st === -1 ? 1 : 0) : (st === -1 ? 2 : st === 1 ? -1 : 0));
      if (o.skirt) {
        const sl = o.longSkirt ? B.L - 2 : Math.min(10, B.L - 4);
        limb(G, 12.5, legTop + sl - 2, legTop + lL, 1.6, back ? sk : skD); limb(G, 17.5, legTop + sl - 2, legTop + rL, 1.6, sk);
        if (o.socks) { G.rect(11, legTop + lL - 3, 3, 3, o.socks); G.rect(16, legTop + rL - 3, 3, 3, o.socks); }
        for (let i = 0; i < sl; i++) { const w = 12 + wide * 2 + R(i * .6); const y = legTop - 1 + i + b; G.rect(15 - (w >> 1), y, w, 1, o.skirt); if (i > 1) for (let x = 15 - (w >> 1) + 2; x < 15 + (w >> 1); x += 3) G.set(x, y, shade(o.skirt, -24)); }
      } else {
        const wl = o.wide ? 3.2 : 2.6;
        for (const [cx, L, col] of [[12.4, lL, lowD], [17.4, rL, low]]) for (let i = 0; i <= L; i++) {
          const t = i / L, hw = wl - (o.wide ? 0 : .7) * t + (Math.abs(t - .5) < .08 ? .3 : 0) + (i < 3 ? .5 : 0);
          G.rect(R(cx - hw), legTop + i, R(cx + hw) - R(cx - hw), 1, col);
        }
        G.rect(14, legTop, 2, 3, lowD);
        if (o.shorts) { G.rect(10, legTop + 7, 10, 1, shade(low, -28)); limb(G, 12.4, legTop + 8, legTop + lL, 1.6, skD); limb(G, 17.4, legTop + 8, legTop + rL, 1.6, sk); }
      }
      // ---- 鞋：又厚又大（4 行高、8 宽），鞋尖朝右下，最下一道鞋底
      const chunky = o.chunky ? 1 : 0;
      const fw = o.footW || 8;   // 鞋宽（莲姨窄一格：7）
      for (const [cx, L, dx] of [[12.4, lL, -1], [17.4, rL, 0]]) {
        const y = legTop + L + 1, x0 = R(cx) - 3 + dx + (fw < 8 ? 1 : 0) * (dx ? 1 : 0);
        G.rect(x0 + 1, y - chunky, fw - 3, 1 + chunky, shoe); G.rect(x0, y + 1, fw - 1, 1, shoe); G.rect(x0, y + 2, fw, 1, shoe); G.rect(x0, y + 3, fw, 1, o.sole || shade(shoe, -30));
        G.rect(x0 + 2, y - chunky, 2, 1, shade(shoe, 34)); G.set(x0 + 1, y + 1, shade(shoe, 20)); if (o.stripeShoe) G.rect(x0 + 2, y + 2, 4, 1, o.stripeShoe);
      }
    } else {
      // ---- 坐着：屁股和大腿压住凳面，小腿垂下来（背面也看得到），脚踩凳脚
      const sh = Math.max(4, R(B.L * .6)), thigh = o.skirt || lowD, shin = (o.skirt || o.shorts) ? sk : low;
      G.rect(R(15 - 6.6 - wide), legTop - 1, R(13.2 + wide * 2), 3, thigh);
      for (const cx of [12.6, 17.4]) {   // 两腿并拢垂在凳脚后面
        limb(G, cx, legTop + 1, legTop + sh, 1.8, shin);
        G.rect(R(cx) - 2, legTop + sh + 1, 5, 2, shoe); G.rect(R(cx) - 2, legTop + sh + 3, 5, 1, o.sole || shade(shoe, -30));
      }
    }
    // ---- 身体：肩膀圆、胸、腰收、臀放；肚子可以鼓；右边背光
    const rows = [];
    for (let i = 0; i < B.Tl; i++) {
      const t = i / (B.Tl - 1);
      // 窄肩：从脖子顺着斜下来（前三行 3.2 → 4.6 → 5.4），胸、腰、臀一条弧线，下摆收圆
      let hw = i === 0 ? 3.2 : i === 1 ? 4.6 : i === 2 ? 5.4 : o.straight ? 5.7 : (t < .6 ? 5.9 - (t - .15) * 1.4 : 5.3 + (t - .6) * 1.6);   // straight：肩下面直上直下，不收腰
      hw += wide * (i < 2 ? .5 : 1);
      if (B.belly && t > .3 && t < .95) hw += B.belly * Math.sin(Math.PI * (t - .3) / .65);
      if (o.waist && t > .3 && t < .9) hw -= o.waist * Math.sin(Math.PI * (t - .3) / .6);   // 收腰
      if (i === B.Tl - 1) hw -= .5;
      rows.push(hw);
      const y = TY + i, l = R(15 - hw), r = R(15 + hw);
      G.rect(l, y, r - l, 1, top); G.rect(r - 3, y, 2, 1, topD); G.set(r - 1, y, shade(topD, -8)); G.set(l, y, shade(top, 14));
    }
    if (!o.apron && !o.skirt && !o.dress) G.rect(R(15 - rows[B.Tl - 1]) + 1, TY + B.Tl - 1, R(rows[B.Tl - 1] * 2) - 2, 1, shade(low, -30));
    if (o.dress) { const w = R(rows[B.Tl - 1] * 2); G.rect(R(15 - rows[B.Tl - 1]), TY + B.Tl - 2, w, 2, o.top); }
    // ---- 手臂：贴着身体顺下来（每一行跟着身体轮廓走），手垂在两侧、往里收一点；远的那只暗一档
    const sl = o.sleeve === 'short' ? 5 : o.sleeve === 'roll' ? 9 : o.sleeve === 'none' ? 0 : 13;
    // armW：手臂加粗；armTop：手臂从肩膀那一行就开始，和肩膀齐平（不往下溜）
    const armLen = B.Tl - 2, ow = o.oversize ? .5 : 0, ar = 1.5 + ow + (o.armW || 0), a0 = o.armTop ? 1 : 2;
    // armMerge：手臂压进身体一格多、上下竖直，最上两行接着肩线收圆 —— 肩膀和手臂成一整块，不会在肩头鼓出一块
    const hwMax = Math.max(...rows.slice(2, Math.min(B.Tl - 1, 9))), outerFull = hwMax + 2 * ar - 1.3;
    const armX = o.armMerge ? (i, side) => 15 + side * (outerFull - ar) : (i, side) => 15 + side * (rows[Math.min(i + a0, B.Tl - 1)] + ar);
    const arm = (side, dy, sleeve, skin) => {
      for (let i = 0; i < armLen; i++) {
        const y = TY + a0 + i + dy, col = i < sl ? sleeve : skin;
        if (o.armMerge) {
          const ti = Math.min(i + a0, B.Tl - 1);
          const out = i === 0 ? rows[ti] + 1.4 : i === 1 ? (rows[ti] + 1.4 + outerFull) / 2 + .3 : outerFull;
          const inn = i < 2 ? rows[ti] - 1.2 : out - 2 * ar;
          const a = 15 + side * inn, b = 15 + side * out, l = R(Math.min(a, b)), r = R(Math.max(a, b));
          G.rect(l, y, r - l, 1, col);
          if (o.stripe && i < sl) G.set(R(15 + side * (out - ar + .3)), y, o.stripe);
        } else {
          const cx = armX(i, side), r = ar, e = i === 0 ? r - .7 : r;
          G.rect(R(cx - e), y, R(cx + e) - R(cx - e), 1, col);
          if (o.stripe && i < sl) G.set(R(cx + side * .3), y, o.stripe);
        }
      }
      if (sl && o.sleeve === 'roll') { const cx = armX(sl, side); G.rect(R(cx - ar), TY + a0 + sl + dy, R(cx + ar) - R(cx - ar), 1, shade(sleeve, 24)); }
      const hx_ = armX(armLen - 1, side) - (o.armMerge ? 0 : side * .5), hy_ = TY + a0 + armLen + dy;
      if (o.bigHands) { G.ell(hx_, hy_ + .3, 2.6, 2.4, skin); G.set(R(hx_ - side * .8), hy_ + 1, shade(skin, -18)); G.set(R(hx_ + side * .6), hy_ + 1, shade(skin, -18)); }   // 宽手，两道指缝
      else { G.ell(hx_, hy_, 1.9, 2, skin); G.set(R(hx_), hy_ + 1, shade(skin, -18)); }
      return [hx_, hy_];
    };
    const sw = o.walkSmall ? 0 : st;   // 步子小时手不甩
    const farHand = arm(-1, sw, topD, skD), [nx, handY] = arm(1, -sw, top, sk); hands = [farHand, [nx, handY]];
    if (o.bag) { G.rect(R(nx) - 1, R(handY) + 1, 6, 6, o.bag); G.rect(R(nx), R(handY) - 1, 4, 1, shade(o.bag, -30)); G.rect(R(nx) - 1, R(handY) + 1, 6, 1, shade(o.bag, -20)); }
    if (o.tote) { G.rect(R(nx), TY + 6, 6, 9, o.tote); G.seg([R(nx) + 1, TY + 6], [R(nx) - 2, TY + 1], shade(o.tote, -30)); }
    if (o.cane && !seat) { const x = R(nx) + 2; G.rect(x, R(handY), 1, 57 - R(handY), '#7a4a2a'); G.rect(x - 2, R(handY) - 1, 3, 1, '#7a4a2a'); G.set(x - 2, R(handY), '#7a4a2a'); }
    const nw = o.neck === 'shorter' ? 4 : 5; G.rect(13, HY + 6, nw, TY - HY - 5, skD); G.rect(13, HY + 6, nw, 1, shade(skD, -12));   // 脖子（shorter：再短再细）
    // ---- 衣服细节
    if (!back) {
      if (o.collar) { G.set(14, TY + 1, sk); G.set(15, TY + 1, sk); G.set(15, TY + 2, sk); G.rect(12, TY + 1, 2, 1, o.collar); G.set(13, TY + 2, o.collar); G.rect(16, TY + 1, 2, 1, o.collar); G.set(16, TY + 2, o.collar); }
      if (o.sailor) { G.rect(9, TY + 1, 12, 3, o.sailor); G.rect(9, TY + 3, 12, 1, '#ffffff'); G.rect(14, TY + 4, 3, 2, '#d9372a'); }
      if (o.tie) { G.set(15, TY + 1, shade(o.tie, -20)); G.rect(15, TY + 2, 2, 9, o.tie); }
      if (o.zip) G.rect(15, TY + 1, 1, B.Tl - 1, o.zip);
      if (o.leather) { G.rect(14, TY + 1, 3, 4, '#f4f4f0'); G.seg([13, TY + 1], [14, TY + 6], shade(top, 34)); G.seg([18, TY + 1], [17, TY + 6], shade(top, 34)); G.rect(10, TY + 9, 3, 1, shade(top, 24)); G.rect(18, TY + 9, 3, 1, shade(top, 24)); G.set(11, TY + 4, shade(top, 40)); }   // 皮衣：白 T、翻领、口袋、高光
      if (o.mandarin) { G.rect(13, TY - 1, 5, 2, top); G.rect(13, TY, 5, 1, shade(top, -26)); G.set(17, TY + 2, '#ffffff'); G.set(18, TY + 3, '#ffffff'); }   // 长衫立领 + 襟扣
      if (o.blazer) { G.rect(R(15 - rows[3]), TY + 1, 4, B.Tl - 1, o.blazer); G.rect(R(15 + rows[3]) - 4, TY + 1, 4, B.Tl - 1, shade(o.blazer, -20)); G.set(15, TY + 6, '#ffffff'); }
      if (o.hood) { G.rect(10, TY - 1, 11, 2, topD); G.rect(13, TY + 2, 1, 5, '#ffffff'); G.rect(17, TY + 2, 1, 5, '#ffffff'); G.rect(12, TY + 8, 7, 3, topD); }
      if (o.cardigan) { G.rect(14, TY + 1, 2, B.Tl - 1, shade(top, -40)); for (let y = TY + 4; y < TY + B.Tl; y += 4) G.set(15, y, '#fff4dc'); }
      if (o.floral) for (const [x, y] of [[10, 4], [13, 7], [17, 5], [11, 11], [15, 10], [19, 8], [12, 13], [18, 12], [9, 8]]) if (y < B.Tl) G.set(x, TY + y, o.floral);
      if (o.print) { G.rect(13, TY + 5, 5, 4, o.print); G.set(14, TY + 6, top); }
      if (o.straps) { G.rect(10, TY + 1, 1, 8, o.straps); G.rect(20, TY + 1, 1, 8, o.straps); }
      if (o.camera) { G.seg([11, TY + 1], [14, TY + 6], '#3a3036'); G.seg([19, TY + 1], [17, TY + 6], '#3a3036'); G.rect(13, TY + 6, 5, 3, '#3a3036'); G.set(16, TY + 7, '#9ad0f0'); }
      if (o.phones) { G.rect(11, TY - 1, 9, 1, '#3a3036'); G.rect(10, TY, 2, 2, '#3a3036'); G.rect(19, TY, 2, 2, '#3a3036'); }
      if (o.baby) { G.rect(10, TY + 3, 11, 9, o.baby); G.rect(10, TY + 1, 1, 3, o.baby); G.rect(20, TY + 1, 1, 3, o.baby); G.ell(15.5, TY + 3, 3.6, 3.4, '#f8dcc4'); G.rect(13, TY, 5, 1, '#5a3a2a'); G.set(14, TY + 3, '#2a2028'); G.set(17, TY + 3, '#2a2028'); }
      if (o.apron) {
        G.rect(10, TY + 3, 10, B.Tl + 5, o.apron); G.rect(10, TY, 1, 3, o.apron); G.rect(19, TY, 1, 3, o.apron);
        G.rect(12, TY + 11, 5, 4, shade(o.apron, -16)); if (o.pocket) G.rect(13, TY + 10, 2, 2, o.pocket);
        if (o.stain) { G.set(13, TY + 7, o.stain); G.set(17, TY + 17, o.stain); G.set(12, TY + 19, o.stain); }
      }
    } else {
      if (o.sailor) { G.rect(9, TY + 1, 12, 7, o.sailor); G.rect(9, TY + 7, 12, 1, '#ffffff'); }
      if (o.hood) G.ell(15, TY + 3, 6, 3.6, topD);
      if (o.apron) { G.seg([10, TY + 1], [19, TY + 11], o.apron); G.seg([19, TY + 1], [10, TY + 11], o.apron); G.rect(11, TY + 12, 9, 1, o.apron); G.rect(14, TY + 11, 3, 3, o.apron); }   // 腰带只在身体上，不压到两边的手
      if (o.baby) { G.seg([10, TY + 1], [19, TY + 10], o.baby); G.seg([19, TY + 1], [10, TY + 10], o.baby); }
      if (o.pack) { G.rect(9, TY + 2, 12, Math.min(12, B.Tl - 1), o.pack); G.rect(9, TY + 2, 12, 3, shade(o.pack, 20)); G.rect(11, TY + 8, 8, 1, shade(o.pack, -30)); }
    }
    if (o.pack && !back) { G.rect(10, TY + 1, 1, 7, shade(o.pack, -20)); G.rect(20, TY + 1, 1, 7, shade(o.pack, -20)); G.rect(6, TY + 2, 2, 8, o.pack); }
    // ---- 头：上面圆、下巴收窄（3/4 侧，下巴偏右一点）；老人驼背头往前
    const H0 = HY;
    if (o.slimFace) { G.ell(15 + hx, H0 - 1, 6.7, 7, sk); G.ell(15.9 + hx, H0 + 3.3, 4.7, 4.3, sk); }   // 瘦脸：脸窄一点、下巴尖一点
    else { G.ell(15 + hx, H0 - 1, 7.2, 7.2, sk); G.ell(15.8 + hx, H0 + 3, 5.8, 4.6, sk); }
    const Gs = hx ? { set: (x, y, c) => G.set(x + hx, y, c), rect: (x, y, w, h, c) => G.rect(x + hx, y, w, h, c), ell: (cx, cy, rx, ry, c) => G.ell(cx + hx, cy, rx, ry, typeof c === 'function' ? (x, y) => c(x - hx, y) : c), seg: (a, b, c) => G.seg([a[0] + hx, a[1]], [b[0] + hx, b[1]], c) } : G;
    if (back) hairBack(Gs, o, o.hair, H0, sk, skD);
    else { hairFront(Gs, o, o.hair, H0); if (!o.hd) faceFront(Gs, o, H0, sk, skD); }
    if (o.hairDetail && !o.hd) hairDetail(Gs, o, H0, back);
    hat(Gs, o, H0, back);
  }
  return { HY, TY, legTop, hx, hands, Tl: B.Tl };
}
function drawPerson(o, back, frame, seat) { return paint(30, 61, G => drawBody(G, o, back, frame, seat)); }
function makeChar(o) {
  const f = [0, 1, 2, 3].map(k => drawPerson(o, false, k)), b = [0, 1, 2, 3].map(k => drawPerson(o, true, k));
  const seatAnchor = 53 - (o.L || BODY[o.body || 'adult'].L) + 1;   // 坐着时屁股那一行
  return { o, SE: f, SW: f.map(flipC), NE: b, NW: b.map(flipC), seatNW: flipC(drawPerson(o, true, 0, true)), seatSE: drawPerson(o, false, 0, true), seatAnchor };
}

const STAFF_DEF = {
  kun: { name: '坤伯', sex: 'm', age: 'old', note: '花白平头 · 浓眉 · 旧白围裙', skin: 'mid', hair: '#e9e7e2', hs: 'crop', brow: '#8f8a83', top: '#c9ad7f', sleeve: 'short', collar: '#dcc49a', low: '#4a4038', apron: '#efe8d8', stain: '#d6c9a8', old: true, body: 'stocky' , muscle: true , note: '花白平头 · 壮 · 旧白围裙' },
  lin: { name: '莲姨', sex: 'f', age: 'adult', note: '盘发 · 碎花上衣', skin: 'light', hair: '#3a2630', hs: 'bun', top: '#e47b97', floral: '#ffd3dd', sleeve: 'roll', low: '#5a4a5a', apron: SHOP_APRON, blush: true, lash: true, body: 'adult',
    face: 'B', neck: 'shorter', slimFace: true, thick: true, bigEyes: true, bigHands: true, hairDetail: true, L: 11, armW: .2, armTop: true, armMerge: true, mouth: 'short', straight: true, footW: 7, walkSmall: true },   // 先定风格的样板：只有莲姨用这些新参数
  wen: { name: '雯姐', sex: 'f', age: 'adult', note: '马尾 · 白衬衫卷袖', skin: 'light', hair: '#2a2024', hs: 'pony', tieCol: '#3f86d6', top: '#f2f2ee', collar: '#ffffff', sleeve: 'roll', low: '#4f5868', apron: SHOP_APRON, body: 'slim' , lipstick: '#c8546a' , note: '马尾 · 淡口红 · 白衬衫' },
  qing: { name: '阿晴', sex: 'f', age: 'teen', note: '长发 · 黄发夹 · 港式浅蓝长衫校服', skin: 'light', hair: '#2b2228', hs: 'long', clip: '#ffd23f', top: '#a8cfee', mandarin: true, dress: true, skirt: '#a8cfee', longSkirt: true, sleeve: 'short', socks: '#ffffff', apron: SHOP_APRON, blush: true, body: 'teen' , hs: 'braid', tieCol: '#2f6ab0' , note: '麻花辫 · 港式浅蓝长衫校服' },
  yao: { name: '耀仔', sex: 'm', age: 'adult', note: '整齐短发 · 细框眼镜 · 口袋插本子', skin: 'light', hair: '#1f1a1e', hs: 'short', top: '#6f8fb0', sleeve: 'short', low: '#3a4a6a', apron: SHOP_APRON, glasses: '#3a3036', pocket: '#ffffff', body: 'slim' , hs: 'curtain' , note: '中分短发 · 细框眼镜' },
  shao: { name: '阿少', sex: 'm', age: 'adult', note: '白皮肤 · 侧分棕发 · 黑皮衣', skin: 'pale', hair: '#6b3f26', hs: 'side', top: '#4a4046', leather: true, zip: '#c9cdd0', sleeve: 'long', low: '#3a4a6a', shoe: '#f2f2f2', sole: '#9aa0a8' },
};
const GUEST_DEF = [
  { name: '上班族', sex: 'm', age: 'adult', note: '短发 · 衬衫领带', hair: '#2a2024', hs: 'short', top: '#eef2f8', tie: '#2d6cc4', sleeve: 'long', low: '#3a3f50' },
  { name: '白领姐姐', sex: 'f', age: 'adult', note: '波波头 · 西装外套 · 手袋', hair: '#5a3424', hs: 'bob', top: '#ffffff', blazer: '#2f3f6a', sleeve: 'long', skirt: '#4a4a56', bag: '#c8342c', body: 'slim', lip: '#c8463c' , lipstick: '#c8344a', lashLong: true , note: '波波头 · 口红 · 长睫毛 · 西装' },
  { name: '女学生', sex: 'f', age: 'teen', note: '长发 · 绿校服 · 书包', hair: '#3a2420', hs: 'long', top: '#ffffff', sailor: '#3f7a5a', sleeve: 'short', skirt: '#3f5a4a', socks: '#ffffff', pack: '#e5b23a', body: 'teen' , hs: 'midpart' , note: '中分长发 · 绿校服 · 书包' },
  { name: '中学男生', sex: 'm', age: 'teen', note: '乱发 · 白 T · 书包', hair: '#3a2a22', hs: 'messy', top: '#ffffff', sleeve: 'short', low: '#4a5a7a', pack: '#3f86d6', body: 'teen' , hs: 'spiky' , note: '刺猬头 · 白 T · 书包' },
  { name: '小男孩', sex: 'm', age: 'kid', note: '短发 · 红 T 短裤 · 小书包', hair: '#2a2024', hs: 'short', top: '#e5604f', print: '#ffd23f', sleeve: 'short', low: '#3f6ab0', shorts: true, shoe: '#f2f2f2', sole: '#9aa0a8', stripeShoe: '#3f86d6', pack: '#2fa39c', body: 'child', blush: true , hs: 'bowl' , note: '锅盖头 · 红 T 短裤' },
  { name: '小女孩', sex: 'f', age: 'kid', note: '双马尾 · 粉裙', hair: '#3a2420', hs: 'twin', tieCol: '#ffd23f', top: '#f590b0', dress: true, skirt: '#f590b0', sleeve: 'short', socks: '#ffffff', shoe: '#c8342c', body: 'child', blush: true },
  { name: '妈妈', sex: 'f', age: 'adult', note: '马尾 · 背着 BB', hair: '#5a3a2a', hs: 'pony', tieCol: '#f0b43a', top: '#3fa0a0', sleeve: 'roll', low: '#55505a', baby: '#f0b43a' , hs: 'wavy' , note: '大波浪 · 背着 BB' },
  { name: '爸爸', sex: 'm', age: 'adult', note: '短发 · Polo 衫 · 卡其裤', skin: 'tan', hair: '#2a2024', hs: 'short', top: '#3f6ab0', collar: '#6f93d0', sleeve: 'short', low: '#b59a6a', body: 'stocky' , hs: 'buzz', muscle: true , note: '寸头 · 壮 · Polo 衫' },
  { name: '街坊阿姨', sex: 'f', age: 'adult', note: '烫发 · 菜篮', skin: 'mid', hair: '#4a3a3a', hs: 'perm', top: '#9a6cd0', floral: '#e0cdf6', sleeve: 'short', low: '#4a3a4a', bag: '#e5604f', body: 'round' , lipstick: '#b8344a' , note: '烫发 · 口红 · 菜篮' },
  { name: '婆婆', sex: 'f', age: 'old', note: '花白发髻 · 开衫', skin: 'mid', hair: '#cfcac2', hs: 'bun', tieCol: '#8a6a9a', top: '#c9b38a', cardigan: true, sleeve: 'long', low: '#4a4250', bag: '#7a4a6a', old: true, body: 'old' },
  { name: '拐杖阿伯', sex: 'm', age: 'old', note: '鸭舌帽 · 夹克 · 拐杖', skin: 'mid', hair: '#e2ded6', hs: 'crop', hat: '#6a6260', hatType: 'flat', top: '#8a6a4a', zip: '#b8a07a', sleeve: 'long', low: '#5a5048', cane: true, old: true, body: 'old' },
  { name: '潮人（男）', sex: 'm', age: 'adult', note: '棒球帽 · 宽卫衣 · 厚底鞋 · 耳机', hair: '#b8b4c8', hs: 'short', hat: '#2a2a32', top: '#b9a8e0', hood: true, oversize: true, sleeve: 'long', low: '#3a3a44', wide: true, shoe: '#f4f4f4', sole: '#d0d0d8', chunky: true, stripeShoe: '#e5604f', phones: true, body: 'slim' },
  { name: '潮人（女）', sex: 'f', age: 'adult', note: '粉色高马尾 · 墨镜 · 黑短外套 · 阔腿裤', hair: '#e07ab0', hs: 'pony', tieCol: '#2a2a32', top: '#3a3438', zip: '#ffd23f', sleeve: 'long', low: '#6a8a5a', wide: true, shoe: '#2a2a32', sole: '#f4f4f4', chunky: true, shades: true, body: 'slim', lip: '#d9372a' , hs: 'spaceBuns', lipstick: '#d93a6a', lashLong: true , note: '粉色双丸子 · 口红 · 墨镜' },
  { name: '外国游客', sex: 'f', age: 'adult', note: '金色长发 · 草帽 · 帆布袋', skin: 'pale', hair: '#ecc86a', hs: 'long', hat: '#e8c878', hatType: 'sun', top: '#7fc4e8', sleeve: 'short', low: '#f2ead8', shorts: true, tote: '#efe6d2', shoe: '#c9a36a', body: 'slim', freckles: true , hs: 'wavy', lashLong: true , note: '金色大波浪 · 草帽 · 长睫毛' },
  { name: '外国游客', sex: 'm', age: 'adult', note: '卷短发 · 相机', skin: 'deep', hair: '#1a1416', hs: 'curly', top: '#f08a24', collar: '#ffb060', sleeve: 'short', low: '#4a5a6a', camera: true, body: 'stocky' , muscle: true , note: '卷短发 · 壮 · 相机' },
  { name: '背包客', sex: 'm', age: 'adult', note: '红发 · 大背包', skin: 'light', hair: '#c8642e', hs: 'messy', top: '#5aa05a', sleeve: 'short', low: '#b59a6a', shorts: true, pack: '#e5604f', freckles: true, shoe: '#6a5040' , muscle: true , note: '红发 · 壮 · 大背包' },
];
const STAFF_CH = Object.fromEntries(Object.entries(STAFF_DEF).map(([k, o]) => [k, makeChar(o)]));
const GUEST_CH = GUEST_DEF.map(makeChar);
const G_ = Object.fromEntries(GUEST_DEF.map((o, i) => [o.name + (GUEST_DEF.slice(0, i).some(p => p.name === o.name) ? '2' : ''), GUEST_CH[i]]));   // 按名字取：G_['拐杖阿伯']

// ============================================================ 细像素版（2 倍密度：60×122，同样大小的人，像素点小一半）
// 做法：同一套身体代码画到放大 2 倍的画板上 → 用细像素重画五官、头发、衣服细节 → 上阴影 → 深色描边。
const HD_OUT = '#2a1d26';
function scaled(G, k) {   // 把原大坐标放大 k 倍画到 G 上（形状一样，曲线更圆）
  const f = c => typeof c === 'function' ? (x, y) => c(Math.floor(x / k), Math.floor(y / k)) : c;
  return {
    w: G.w / k, h: G.h / k, get: (x, y) => G.get(x * k, y * k),
    set: (x, y, c) => G.rect((x | 0) * k, (y | 0) * k, k, k, c),
    rect: (x, y, w, h, c) => G.rect(x * k, y * k, w * k, h * k, f(c)),
    ell: (cx, cy, rx, ry, c) => G.ell(cx * k, cy * k, rx * k, ry * k, f(c)),
    tri: (ax, ay, bx, by, cx, cy, c) => G.tri(ax * k, ay * k, bx * k, by * k, cx * k, cy * k, c),
    seg: (a, b, c) => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) G.seg([a[0] * k + dx, a[1] * k + dy], [b[0] * k + dx, b[1] * k + dy], c); },
  };
}
function lum(c) { const [r, g, b] = rgbaOf(c); return .3 * r + .59 * g + .11 * b; }
// 阴影：每一段同色的横条，右边三成压暗、最左一格提亮；每一段竖条，顶上一格亮、底下一格暗（光从左上来）
const SKIN_SET = new Set(Object.values(SKIN).flat());
function shadePass(G, mode = 'cel') {   // 皮肤不走这一步（脸会被切成一块块），脸的阴影在 hdFace 里手画
  const W = G.w, H = G.h, src = G.d.slice(), ok = c => c && c !== HD_OUT && !SKIN_SET.has(c) && lum(c) > 60 && lum(c) < 245;
  for (let y = 0; y < H; y++) for (let x = 0; x < W;) {
    const c = src[y * W + x]; if (!ok(c)) { x++; continue; }
    let e = x; while (e + 1 < W && src[y * W + e + 1] === c) e++;
    const n = e - x + 1;
    if (n >= 5) { const d = Math.max(1, Math.round(n * .3)), k = mode === 'soft' ? -12 : -22;
      for (let i = e - d + 1; i <= e; i++) if (mode !== 'dither' || (i + y) % 2 === 0 || i > e - d / 2) G.d[y * W + i] = shade(c, k);
      if (n >= 7 && mode !== 'soft') G.d[y * W + x] = shade(c, 14); }
    x = e + 1;
  }
  for (let x = 0; x < W; x++) for (let y = 0; y < H;) {
    const c = src[y * W + x]; if (!ok(c)) { y++; continue; }
    let e = y; while (e + 1 < H && src[(e + 1) * W + x] === c) e++;
    if (e - y + 1 >= 5) { G.d[y * W + x] = shade(G.d[y * W + x], 12); G.d[e * W + x] = shade(G.d[e * W + x], -14); }
    y = e + 1;
  }
}
function outlinePass(G, col) { const add = []; for (let y = 0; y < G.h; y++) for (let x = 0; x < G.w; x++) { if (G.get(x, y)) continue; const n = G.get(x, y + 1) || G.get(x - 1, y) || G.get(x + 1, y) || G.get(x, y - 1); if (n) add.push([x, y, col === 'color' ? mixHex(n, HD_OUT, .6) : col]); } add.forEach(([x, y, c]) => G.set(x, y, c)); }

function hdFace(G, o, g) {
  const [sk, skD] = SKIN[o.skin || 'light'], X = g.hx * 2, Y = g.HY * 2;
  const eye = '#2a2028', iris = o.iris || '#6a4030', irisL = shade(iris, 46), lip = o.lip || '#b8574e', brow = shade(o.brow || shade(o.hair, -36), 12);
  // 脸右边两格、下巴底一行压暗一点（光从左上来）
  const skinAt = (x, y) => G.get(x, y) === sk;
  for (let y = Y - 3; y < Y + 16; y++) { let r = -1; for (let x = 20 + X; x < 50 + X; x++) if (skinAt(x, y)) r = x; if (r > 0) for (let x = r - 1; x <= r; x++) if (skinAt(x, y)) G.set(x, y, shade(sk, -14)); }
  for (let x = 22 + X; x < 44 + X; x++) for (let y = Y + 8; y < Y + 18; y++) if (skinAt(x, y) && !G.get(x, y + 1)) { G.set(x, y, shade(sk, -10)); break; }
  const ex_ = o.slimFace ? 1 : 0; G.rect(18 + X + ex_, Y, 4, 6, sk); G.rect(19 + X + ex_, Y + 1, 2, 4, skD);                          // 耳朵 + 耳窝
  if (o.hdLook === 'C') {   // 日系：眼睛 4×7、上眼线往外挑、眼珠三层色、小嘴、腮红斜线
    for (const ex of [24, 34]) { const x = ex + X; G.rect(x - 1, Y - 1, 6, 1, eye); G.rect(x, Y, 4, 7, eye); G.rect(x, Y + 3, 4, 2, shade(iris, -10)); G.rect(x, Y + 5, 4, 2, iris); G.rect(x + 1, Y + 6, 2, 1, irisL); G.set(x, Y + 6, sk); G.set(x + 3, Y + 6, sk); G.rect(x + 2, Y + 1, 2, 2, '#ffffff'); G.set(x + 1, Y + 5, '#ffffff'); }
    G.set(22 + X, Y - 2, eye); G.set(39 + X, Y - 2, eye);
    G.rect(25 + X, Y - 4, 3, 1, brow); G.rect(34 + X, Y - 4, 3, 1, brow);
    G.set(40 + X, Y + 7, skD); G.rect(32 + X, Y + 11, 2, 1, lip);
    for (const [bx, by] of [[20, 8], [38, 9]]) for (let i = 0; i < 3; i++) G.set(bx + X + i, Y + by + (i % 2), '#f08a80');
    return;
  }
  for (const ex of [24, 34]) {                                                               // 眼睛 4×6：圆角黑眼珠、下半棕色、右上大高光 + 左下小高光
    const x = ex + X;
    const et = o.eyeType || (o.bigEyes ? 'big' : 'mid');
    if (et === 'narrow') { G.rect(x, Y, 4, 5, eye); G.rect(x, Y + 3, 4, 2, iris); G.set(x, Y + 4, sk); G.set(x + 3, Y + 4, sk); G.rect(x + 2, Y + 1, 2, 1, '#ffffff'); continue; }   // 男：窄一点
    if (et === 'small') { G.rect(x, Y + 1, 4, 3, eye); G.rect(x + 1, Y + 3, 2, 1, iris); G.set(x + 2, Y + 1, '#ffffff'); G.rect(x, Y + 5, 4, 1, skD); continue; }   // 老人：小眼 + 眼袋纹
    if (et === 'big') {   // 大一号：5×7
      const xx = x - (ex === 24 ? 1 : 0);
      G.rect(xx, Y - 1, 5, 7, eye); G.rect(xx, Y + 3, 5, 3, iris); G.rect(xx + 1, Y + 5, 3, 1, irisL);
      G.set(xx, Y + 5, sk); G.set(xx + 4, Y + 5, sk); G.set(xx, Y - 1, sk); G.set(xx + 4, Y - 1, sk);
      G.rect(xx + 2, Y, 2, 2, '#ffffff'); G.set(xx + 1, Y + 4, '#e6def8');
      continue;
    }
    G.rect(x, Y, 4, 6, eye); G.rect(x, Y + 4, 4, 2, iris); G.rect(x + 1, Y + 5, 2, 1, irisL);
    G.set(x, Y + 5, sk); G.set(x + 3, Y + 5, sk);
    G.rect(x + 2, Y + 1, 2, 2, '#ffffff'); G.set(x + 1, Y + 4, '#e6def8');
  }
  if (o.lash) { G.set(23 + X, Y, eye); G.set(38 + X, Y, eye); }
  if (o.lashLong) { G.set(22 + X, Y - 1, eye); G.set(21 + X, Y - 2, eye); G.set(39 + X, Y - 1, eye); G.set(40 + X, Y - 2, eye); G.rect(23 + X, Y - 2, 2, 1, eye); G.rect(37 + X, Y - 2, 2, 1, eye); }   // 长睫毛往外翘
  if (o.sex === 'm') { G.rect(24 + X, Y - 4, 4, 2, brow); G.rect(34 + X, Y - 4, 4, 2, brow); }   // 男：粗眉
  else { G.set(24 + X, Y - 3, brow); G.rect(25 + X, Y - 4, 3, 1, brow); G.rect(34 + X, Y - 4, 3, 1, brow); G.set(37 + X, Y - 3, brow); }   // 细眉
  if (o.glasses) { const gc = o.glasses; for (const ex of [23, 33]) { G.rect(ex + X, Y - 2, 6, 1, gc); G.rect(ex + X, Y + 6, 6, 1, gc); G.rect(ex + X, Y - 2, 1, 9, gc); G.rect(ex + 5 + X, Y - 2, 1, 9, gc); } G.rect(29 + X, Y, 4, 1, gc); }   // 细框眼镜，框在眼睛外面
  if (o.shades) { G.rect(22 + X, Y - 2, 18, 7, '#2a2028'); G.rect(24 + X, Y - 1, 3, 1, '#6a6a7a'); G.rect(34 + X, Y - 1, 3, 1, '#6a6a7a'); G.rect(28 + X, Y + 4, 6, 3, sk); }   // 墨镜
  G.set(40 + X, Y + 6, skD); G.set(40 + X, Y + 7, shade(sk, -10));                        // 鼻尖
  if (o.lipstick) { G.rect(30 + X, Y + 10, 4, 1, o.lipstick); G.rect(31 + X, Y + 11, 2, 1, shade(o.lipstick, -24)); G.set(31 + X, Y + 10, shade(o.lipstick, 40)); }   // 口红
  else { G.rect(31 + X, Y + 10, 3, 1, lip); G.set(32 + X, Y + 11, shade(sk, -14)); }               // 短一字嘴
  if (o.sex !== 'm' || o.age === 'kid') for (const [bx, by] of [[20, 7], [38, 8]]) for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) G.set(bx + X + i, Y + by + j, '#f2a59a');   // 腮红（隔点）
}
function hdHair(G, o, g, back) {
  const H = o.hair, HS = shade(H, -18), HL = shade(H, 30), HL2 = shade(H, 16), tie = o.tieCol || '#d9372a', X = g.hx * 2, Y = g.HY * 2;
  const isHair = (x, y) => { const c = G.get(x, y); return c === H || c === HS || c === HL || c === HL2; };
  const put = (x, y, c) => { if (isHair(x, y)) G.set(x, y, c); };   // 只画在头发上，不落到脸上
  const line = (a, b, c) => { const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])))); for (let i = 0; i <= n; i++) put(R(a[0] + (b[0] - a[0]) * i / n) + X, R(a[1] + (b[1] - a[1]) * i / n), c); };
  const arc = (cx, cy, rx, ry, a0, a1, c) => { for (let a = a0; a <= a1; a += 2) { const t = a * Math.PI / 180; put(R(cx + Math.cos(t) * rx) + X, R(cy + Math.sin(t) * ry), c); } };
  if (o.hs !== 'bun') {
    const fringe = ['short', 'pony', 'messy', 'twin', 'curly', 'long', 'bob', 'spiky', 'braid', 'spaceBuns', 'bowl'].includes(o.hs);
    if (!back && fringe) { for (let x = 22; x <= 42; x++) { G.set(x + X, Y - 4, H); G.set(x + X, Y - 3, H); } for (const x of [23, 28, 34, 40]) G.set(x + X, Y - 2, H); for (const x of [27, 33, 39]) line([x, Y - 7], [x, Y - 3], HS); }
    arc(30, Y - (back ? 5 : 7), 12.5, back ? 10.5 : 9.5, 214, 246, HL); arc(30, Y - (back ? 5 : 7), 12.5, back ? 10.5 : 9.5, 256, 290, HL2);
    line([27, Y - 17], [22, Y - 6], HS); line([36, Y - 17], [41, Y - 6], HS);
    return;
  }
  if (!back) {
    // 刘海重画：额头上整齐一排，几处尖尖的发梢往下一格，中间几道发缝
    for (let x = 22; x <= 42; x++) { G.set(x + X, Y - 4, H); G.set(x + X, Y - 3, H); }
    for (const x of [23, 24, 28, 29, 34, 35, 40]) G.set(x + X, Y - 2, H);
    for (const x of [26, 32, 38]) line([x, Y - 7], [x, Y - 3], HS);
    line([28, Y - 18], [23, Y - 8], HS); line([37, Y - 18], [41, Y - 8], HS); line([24, Y - 15], [20, Y - 5], HS);
    arc(30, Y - 7, 12.5, 9.5, 214, 246, HL); arc(30, Y - 7, 12.5, 9.5, 256, 290, HL2);         // 头顶两段亮光
    arc(18, Y - 18, 4.2, 3.2, 200, 340, HS); put(15 + X, Y - 21, HL);                          // 发髻：半圈卷
    G.rect(20 + X, Y - 12, 6, 2, tie); G.rect(20 + X, Y - 12, 2, 1, shade(tie, 50));          // 发绳
    G.seg([42 + X, Y - 4], [43 + X, Y + 1], H); G.seg([43 + X, Y + 1], [42 + X, Y + 4], H);   // 鬓角一缕
  } else {
    for (const [a, b] of [[[23, Y + 3], [28, Y - 9]], [[37, Y + 3], [32, Y - 9]], [[30, Y + 5], [30, Y - 9]]]) line(a, b, HS);   // 三道发丝往发髻收
    arc(30, Y - 5, 12.5, 10.5, 214, 246, HL); arc(30, Y - 5, 12.5, 10.5, 256, 290, HL2);
    arc(30, Y - 18, 4.2, 3.2, 200, 340, HS); put(27 + X, Y - 21, HL);
    G.rect(27 + X, Y - 12, 6, 2, tie); G.rect(27 + X, Y - 12, 2, 1, shade(tie, 50));
  }
}
function hdClothes(G, o, g, back) {
  const TY = g.TY * 2, top = o.top, topD = shade(o.top, -28);
  if (!back && o.floral) for (const [x, y] of [[10, 4], [13, 7], [17, 5], [11, 11], [15, 10], [19, 8], [12, 13], [18, 12], [9, 8], [21, 5], [8, 3], [22, 10], [7, 9]]) {   // 小碎花：一点深心 + 四瓣
    const cx = x * 2, cy = TY + y * 2, onShirt = (a, b) => { const c = G.get(a, b); return c === top || c === topD || c === o.floral; };
    if (!onShirt(cx, cy)) continue;
    G.set(cx, cy, shade(top, -46)); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (onShirt(cx + dx, cy + dy)) G.set(cx + dx, cy + dy, o.floral);
  }
  if (!back && o.apron) {   // 口袋缝线（虚线）、围裙下摆一道暗边
    const pc = shade(o.apron, 34), x0 = 24, x1 = 33, y0 = TY + 22, y1 = TY + 29;
    for (let x = x0; x <= x1; x += 2) { G.set(x, y0, pc); G.set(x, y1, pc); } for (let y = y0; y <= y1; y += 2) { G.set(x0, y, pc); G.set(x1, y, pc); }
    let yb = TY; while (G.get(30, yb + 1) === o.apron || G.get(30, yb + 1) === shade(o.apron, -16)) yb++;
    for (let x = 20; x < 40; x++) if (G.get(x, yb) === o.apron) G.set(x, yb, shade(o.apron, -26));
  }
  const [sk] = SKIN[o.skin || 'light'];
  if (o.muscle && !back) { const onTop = (x, y) => { const c = G.get(x, y); return c === top || c === topD; }; for (const [a, b] of [[[21, TY + 8], [28, TY + 10]], [[32, TY + 10], [39, TY + 8]]]) { const n = 8; for (let i = 0; i <= n; i++) { const x = R(a[0] + (b[0] - a[0]) * i / n), y = R(a[1] + (b[1] - a[1]) * i / n); if (onTop(x, y)) G.set(x, y, shade(top, -32)); } } }   // 胸肌两道线
  for (const [hx, hy] of g.hands) { const x = R(hx * 2), y = R(hy * 2); for (const dx of [-2, 0, 2]) if (G.get(x + dx, y + 3)) G.set(x + dx, y + 3, shade(sk, -26)); }   // 手指缝
}
function drawPersonHD(o, back, frame, seat) {
  const G = new Grid(60, 122), g = drawBody(scaled(G, 2), { ...o, hd: true }, back, frame, seat);
  if (!back) hdFace(G, o, g);
  if (o.hairDetail) hdHair(G, o, g, back);
  hdClothes(G, o, g, back);
  const look = o.hdLook || 'A';
  shadePass(G, look === 'B' ? 'soft' : look === 'D' ? 'dither' : 'cel'); outlinePass(G, window.CHAR_OUTLINE || (look === 'B' ? 'color' : HD_OUT)); if (o.thick) outlinePass(G, window.CHAR_OUTLINE || HD_OUT);   // CHAR_OUTLINE='color'：描边取旁边颜色压深（画法方案 B）   // thick：描边两格
  return G.canvas();
}
function makeCharHD(o) {
  const f = [0, 1, 2, 3].map(k => drawPersonHD(o, false, k)), b = [0, 1, 2, 3].map(k => drawPersonHD(o, true, k));
  const seatAnchor = (53 - (o.L || BODY[o.body || 'adult'].L) + 1) * 2;
  return { o, hd: true, SE: f, SW: f.map(flipC), NE: b, NW: b.map(flipC), seatNW: flipC(drawPersonHD(o, true, 0, true)), seatSE: drawPersonHD(o, false, 0, true), seatAnchor };
}

// ============================================================ 全员标准（照莲姨样板定下的规则），按男女老少分眼睛和手臂
function STD(o) {
  const sex = o.sex || 'f', age = o.age || 'adult', B0 = BODY[o.body || 'adult'];
  return {
    face: 'B', neck: 'shorter', slimFace: true, thick: true, hairDetail: true, armTop: true, armMerge: true, mouth: 'short', straight: true, footW: 7, walkSmall: true,
    L: Math.max(7, B0.L - 3),
    eyeType: age === 'kid' ? 'big' : age === 'old' ? 'small' : sex === 'f' ? 'big' : 'narrow',
    armW: age === 'kid' ? 0 : sex === 'm' ? .4 : .2,
    bigHands: age !== 'kid',
    lash: sex === 'f' && age !== 'kid' && age !== 'old',
    ...o,
  };
}
const STAFF_HD = Object.fromEntries(Object.entries(STAFF_DEF).map(([k, o]) => [k, makeCharHD(STD(o))]));
const GUEST_HD = GUEST_DEF.map(o => makeCharHD(STD(o)));

const PART_APRON = '#8fd8b8';   // 短工围裙浅一档，和常驻员工分开
const PART_DEF = [
  { name: '阿桥', sex: 'm', age: 'teen', note: '中五 · 工具挂件 · 嘴硬', hair: '#2a2024', hs: 'short', top: '#8a8f99', sleeve: 'short', low: '#3a4a6a', apron: PART_APRON, body: 'teen' , hs: 'buzz' , note: '寸头 · 中五 · 嘴硬' },
  { name: '诗敏', sex: 'f', age: 'teen', note: '中五 · 校刊 · 追星', hair: '#3a2420', hs: 'bob', clip: '#ff6a8a', top: '#ffffff', collar: '#ffffff', sleeve: 'short', skirt: '#2f3f6a', socks: '#ffffff', apron: PART_APRON, body: 'teen' },
  { name: '小健', sex: 'm', age: 'teen', note: '中五 · 数学学会 · 眼镜', hair: '#1f1a1e', hs: 'short', top: '#eef2f8', collar: '#ffffff', sleeve: 'short', low: '#3a3f50', glasses: '#3a3036', apron: PART_APRON, body: 'teen' },
  { name: '阿朗', sex: 'm', age: 'adult', note: '机械系 · 量尺 · 格子衫', hair: '#3a2a22', hs: 'side', top: '#5a7aa8', stripe: '#8faad0', sleeve: 'roll', low: '#4a5040', apron: PART_APRON, body: 'slim' },
  { name: '阿悠', sex: 'f', age: 'adult', note: '中文系 · 演出贴纸 · 长发', hair: '#5a3424', hs: 'long', clip: '#ffd23f', top: '#f0a0b8', sleeve: 'short', low: '#4a4a5a', apron: PART_APRON, body: 'slim' , hs: 'midpart', lashLong: true , note: '中分长发 · 长睫毛 · 中文系' },
  { name: '嘉宁', sex: 'f', age: 'adult', note: '翻译系 · 马尾 · 很有条理', hair: '#2a2024', hs: 'pony', tieCol: '#3f86d6', top: '#f4efe2', collar: '#ffffff', sleeve: 'long', skirt: '#6a5a4a', apron: PART_APRON, body: 'slim' , hs: 'topknot', lipstick: '#d96a7a' , note: '头顶小髻 · 口红 · 翻译系' },
  { name: '天佑', sex: 'm', age: 'adult', note: '电脑系 · 连帽衫 · 乱发', hair: '#2a2024', hs: 'messy', top: '#7a8090', hood: true, sleeve: 'long', low: '#3a3a44', apron: PART_APRON, body: 'adult' , hs: 'undercut' , note: '两边铲短 · 连帽衫 · 电脑系' },
  { name: '米米', sex: 'f', age: 'adult', note: '设计系 · 贝雷帽 · 贴纸', hair: '#c88a5a', hs: 'bob', hat: '#c8342c', hatType: 'beret', top: '#fff4dc', sleeve: 'short', low: '#2f6a6a', apron: PART_APRON, body: 'slim' },
];
const PART_HD = PART_DEF.map(o => makeCharHD(STD(o)));
