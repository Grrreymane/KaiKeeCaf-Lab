// 店里货架用的大号细像素点心（2 倍画布上约 30 像素宽，一个人头那么大）：光从左上来，四档颜色 + 深色描边
// 依赖 lib.js（Grid、OUT、mixHex、shade）
const FOOD_L = (function () {
  const ramp = (cols, v) => cols[Math.max(0, Math.min(cols.length - 1, Math.floor((v + 1) / 2 * cols.length)))];
  // 椭圆里的受光：左上亮、右下暗，-1..1
  const lit = (x, y, cx, cy, rx, ry) => Math.max(-1, Math.min(1, -((x + .5 - cx) / rx) * .55 - ((y + .5 - cy) / ry) * .75 + .1));
  const hash = (x, y, k = 0) => { let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function finish(g) {   // 描边：外圈一层深色（下面更深）
    const add = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { if (g.get(x, y)) continue; const n = g.get(x, y + 1) || g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1); if (n) add.push([x, y, mixHex(n, OUT, .78)]); }
    add.forEach(([x, y, c]) => g.set(x, y, c)); return g.canvas();
  }
  // 挞：花边酥皮杯 + 中间一面馅
  function tart(texture) {
    const g = new Grid(34, 22), cx = 17, cy = 10;
    for (let t = 4; t >= 1; t--) g.ell(cx, cy + t, 14.2 - t * .3, 6.4, (x, y) => ((x + t) % 3 === 0) ? '#9a4c16' : (x < cx - 4 ? '#e08a34' : x < cx + 6 ? '#cc7426' : '#b5621e'));
    g.ell(cx, cy, 14.6, 6.8, (x, y) => { const a = Math.atan2((y + .5 - cy) / 6.8, (x + .5 - cx) / 14.6), w = Math.sin(a * 11) > 0; return ramp(w ? ['#d07a2c', '#f0a24a', '#ffc46a', '#ffdc96'] : ['#b8641f', '#dc8a36', '#f0a24a', '#ffc46a'], lit(x, y, cx, cy, 14.6, 6.8)); });
    g.ell(cx, cy - .4, 12.2, 5.3, (x, y) => texture(x, y, lit(x, y, cx - 1, cy - 1, 12.2, 5.3)));
    // 馅的边缘一圈压暗（陷进酥皮）
    for (let y = 0; y < 24; y++) for (let x = 0; x < 34; x++) { const dx = (x + .5 - cx) / 12.2, dy = (y + .5 - cy + .4) / 5.3, d = dx * dx + dy * dy; if (d <= 1 && d > .78 && dy < -.2) g.set(x, y, shade(g.get(x, y), -22)); }
    return finish(g);
  }
  const egg = (x, y, v) => {
    if (v > .78 && hash(x, y) > .25) return '#fffbe0';                       // 反光
    if (hash(x, y, 3) > .93 && v < .5) return '#e08a1a';                     // 烤焦小点
    return ramp(['#e89a0e', '#f7b81a', '#ffd21f', '#ffe266', '#fff1a0'], v);
  };
  const coconut = (x, y, v) => {
    const r = hash(x, y, 7);
    if (r > .86) return v > 0 ? '#fff8e8' : '#f0e2c4';                       // 椰丝
    if (r < .1) return '#b9783e';                                            // 烤香的椰丝
    return ramp(['#c98d52', '#dcaa6e', '#ecc58e', '#f5d9a8'], v);
  };
  // 菠萝包：圆顶，表面一格格裂纹酥皮
  function bun() {
    const g = new Grid(34, 26), cx = 17, cy = 13;
    g.ell(cx, cy + 5, 14.2, 5.6, (x, y) => ramp(['#b5621e', '#d0802e', '#e09838'], lit(x, y, cx, cy + 5, 14.2, 5.6)));   // 底部烤色
    g.ell(cx, cy, 14.4, 9.6, (x, y) => {
      const v = lit(x, y, cx - 2, cy - 3, 14.4, 9.6), u = (x + y * 1.5 + 2) / 12, w = (x - y * 1.5 + 40) / 12;
      const fu = u - Math.floor(u), fw = w - Math.floor(w), crack = fu < .09 || fw < .09;
      if (crack) return v > .3 ? '#d98a2a' : '#c06e1a';
                         // 每块酥皮的亮角
      return ramp(['#e0941f', '#f2a92e', '#ffc23a', '#ffd768'], v);
    });
    return finish(g);
  }
  // 老婆饼：扁圆饼 + 两道刀口 + 油光，下面垫一张油纸
  function wife() {
    const g = new Grid(36, 24), cx = 18, cy = 11;
    g.quad([2, cy + 6], [cx, cy - 1], [34, cy + 6], [cx, cy + 13], '#fbf0d8'); g.seg([cx, cy + 13], [34, cy + 6], '#e3d3b2'); g.seg([2, cy + 6], [cx, cy + 13], '#efe2c4');
    for (let t = 4; t >= 1; t--) g.ell(cx, cy + t, 13.4, 6.2, (x) => x < cx + 5 ? '#cf8a3c' : '#b8722e');
    g.ell(cx, cy, 13.6, 6.4, (x, y) => {
      const v = lit(x, y, cx - 2, cy - 1, 13.6, 6.4), dx = (x + .5 - cx) / 13.6, dy = (y + .5 - cy) / 6.4, d = Math.sqrt(dx * dx + dy * dy);
      if (d > .86) return ramp(['#d08a3a', '#e6a14a', '#f2b862'], v);         // 边上一圈烤得深一点
      if (Math.abs(d - .58) < .06 && hash(x, y) > .4) return '#ecb866';       // 酥皮一层层
      return ramp(['#e6a854', '#f2c06c', '#f7cf7e', '#ffe2a4', '#fff2cc'], v);
    });
    for (const ox of [-4, 3]) { g.seg([cx + ox, cy - 3], [cx + ox + 3, cy + 1], '#a86424'); g.seg([cx + ox + 1, cy - 3], [cx + ox + 4, cy + 1], '#ffe6a8'); }
    for (const [x, y] of [[cx - 7, cy - 1], [cx + 8, cy], [cx - 1, cy + 3], [cx + 5, cy - 3]]) g.set(x, y, '#fff8e6');   // 芝麻
    return finish(g);
  }
  // 红豆布丁：蓝边白瓷碗
  function pudding() {
    const g = new Grid(32, 24), cx = 16, cy = 9;
    g.ell(cx, cy + 9, 7, 2.6, '#c9d3df');                                    // 碗脚
    for (let t = 8; t >= 0; t--) g.ell(cx, cy + t, 12.6 - t * .55, 5, (x, y) => t === 5 || t === 6 ? '#3f7fd8' : ramp(['#c3ccd8', '#e2e8ef', '#f6f9fc', '#ffffff'], lit(x, y, cx - 3, cy + 3, 12, 6)));
    g.ell(cx, cy, 13, 5.4, (x, y) => ((x + y) % 2 ? '#2d6cc4' : '#3a78d0'));    // 碗口蓝边
    g.ell(cx, cy - .2, 11.2, 4.3, (x, y) => ramp(['#ead6a6', '#f6e6be', '#fff4d6', '#fffbea'], lit(x, y, cx - 2, cy - 1, 11, 4.3)));
    for (const [x, y] of [[cx - 4, cy], [cx - 1, cy - 1], [cx + 2, cy + 1], [cx + 4, cy - 1], [cx, cy + 2], [cx - 3, cy + 2], [cx + 5, cy + 1]]) { g.rect(x, y, 2, 2, '#9c2a22'); g.set(x, y, '#c8443a'); }   // 红豆
    g.ell(cx + 1, cy - 2, 2.2, 1.6, '#d9372a'); g.set(cx, cy - 3, '#ff9a8a');
    return finish(g);
  }
  // 港式奶茶：白瓷杯 + 碟
  function tea() {
    const g = new Grid(32, 26), cx = 14, cy = 8;
    g.ell(cx + 1, cy + 14, 13, 4.6, (x, y) => ramp(['#c2c9d4', '#e3e8ef', '#f7f9fb'], lit(x, y, cx, cy + 13, 13, 4.6)));
    for (let t = 9; t >= 0; t--) g.ell(cx, cy + t + 2, 9.6 - t * .2, 4, (x, y) => ramp(['#c8cfda', '#e6ebf1', '#f8fafc', '#ffffff'], lit(x, y, cx - 3, cy + 5, 9, 6)));
    for (let k = 0; k < 2; k++) g.ell(cx + 10, cy + 7 + k, 3.6, 3.6, (x, y) => ((x + .5 - cx - 10) ** 2 + (y + .5 - cy - 7 - k) ** 2 > 3.6) ? '#e3e8ef' : null);   // 杯耳
    g.ell(cx, cy + 2, 9.8, 4.2, '#ffffff');
    g.ell(cx, cy + 2.2, 8.4, 3.3, (x, y) => ramp(['#9a5a28', '#b56a30', '#c47838', '#d68e4e'], lit(x, y, cx - 2, cy, 8.4, 3.3)));
    g.ell(cx - 2, cy + 1.6, 3.4, 1.2, '#e9b27c'); g.set(cx - 4, cy + 1, '#f6d6b0');
    return finish(g);
  }
  // 杨枝甘露：透明杯，芒果粒 + 西米 + 一片薄荷
  function mango() {
    const g = new Grid(26, 28), cx = 13, cy = 7;
    for (let t = 16; t >= 0; t--) g.ell(cx, cy + t, 9 - t * .18, 3.6, (x, y) => {
      if (t < 2) return '#fff4dc';
      const v = lit(x, y, cx - 2, cy + 8, 9, 10), r = hash(x, y, 5);
      if (t > 13) return ramp(['#e9a21a', '#f7b82a', '#ffd04a'], v);
      return r > .8 ? '#ffffff' : r > .6 ? '#ffe7a0' : ramp(['#f29a1a', '#ffb52e', '#ffcb4a', '#ffe08a'], v);
    });
    g.ell(cx, cy, 9, 3.6, (x, y) => hash(x, y, 2) > .55 ? '#ffd04a' : '#fff4dc');
    for (const [x, y] of [[cx - 4, cy - 1], [cx + 1, cy - 2], [cx + 4, cy]]) { g.rect(x, y, 3, 2, '#ff9a1a'); g.set(x, y, '#ffc24a'); }
    g.ell(cx + 2, cy - 3, 2.6, 1.4, '#4fae5a'); g.set(cx + 1, cy - 4, '#8ad67a');
    for (let y = cy + 2; y < cy + 15; y++) g.set(cx - 7, y, '#ffffff');      // 杯子反光
    return finish(g);
  }
  // 鸡尾包：橄榄形面包，面上两道白色酥皮条 + 芝麻，边上露出一点椰丝馅
  function cockbun() {
    const g = new Grid(36, 24), cx = 18, cy = 12;
    g.ell(cx, cy + 3, 15, 6, (x, y) => ramp(['#b5621e', '#d0802e', '#e09838'], lit(x, y, cx, cy + 3, 15, 6)));
    g.ell(cx, cy, 15.2, 8.6, (x, y) => ramp(['#c8741e', '#e2952e', '#f5b445', '#ffd06a', '#ffe4a0'], lit(x, y, cx - 3, cy - 3, 15.2, 8.6)));
    for (const dy of [-3, 1]) for (let x = cx - 10; x <= cx + 10; x++) { const y = R(cy + dy - Math.sin((x - cx + 10) / 20 * Math.PI) * 1.5); g.set(x, y, '#fff6e6'); g.set(x, y + 1, '#f2e2c4'); }
    for (const [x, y] of [[cx - 6, cy - 6], [cx - 1, cy - 7], [cx + 4, cy - 6], [cx + 8, cy - 4], [cx - 9, cy - 3]]) g.set(x, y, '#fff8e6');
    g.ell(cx + 13, cy + 1, 2.2, 2.6, '#f4efe2'); g.set(cx + 13, cy, '#e3d4b0');
    return finish(g);
  }
  // 马拉糕：一块方形蒸糕，啡色松软带气孔，底下一张竹纸
  function malai() {
    const g = new Grid(34, 28), x0 = 6, y0 = 6, w = 20, h = 14;
    g.quad([2, 22], [17, 15], [32, 22], [17, 27], '#efe0b8'); g.seg([17, 27], [32, 22], '#d8c494');
    g.quad([x0, y0 + 4], [x0 + w / 2 + 2, y0], [x0 + w + 2, y0 + 4], [x0 + w / 2, y0 + 8], '#e8b878');   // top
    for (let y = y0 + 4; y < y0 + 4 + h; y++) for (let x = x0; x <= x0 + w + 2; x++) { const top = x < x0 + w / 2 ? y0 + 4 + (x - x0) * .4 : y0 + 8 - (x - x0 - w / 2) * .4; if (y < top) continue; if (y > top + h - 4) continue; const left = x < x0 + w / 2; g.set(x, y, hash(x, y, 9) > .86 ? '#8a5a2a' : left ? '#c88a4a' : '#a86e36'); }
    for (const [x, y] of [[x0 + 6, y0 + 3], [x0 + 11, y0 + 2], [x0 + 14, y0 + 4], [x0 + 8, y0 + 5]]) g.set(x, y, '#c88a4a');
    g.seg([x0 + 3, y0 + 4], [x0 + w / 2 + 2, y0 + 1], '#f6d6a0');
    return finish(g);
  }
  // 鸡蛋仔：一片卷起的蛋格，一粒粒金黄小球
  function eggwaf() {
    const g = new Grid(36, 26), base = [[6, 14], [12, 11], [18, 9], [24, 10], [30, 13]];
    for (let r = 0; r < 3; r++) base.forEach(([x, y], i) => { const cx = x + r * 1.5 - 2, cy = y + r * 5; g.ell(cx, cy, 3.6, 3.2, (xx, yy) => ramp(['#d0861e', '#eba32e', '#ffc44a', '#ffe08a'], lit(xx, yy, cx - 1.2, cy - 1.2, 3.6, 3.2))); g.set(R(cx) - 1, R(cy) - 2, '#fff2c4'); });
    return finish(g);
  }
  // 双皮奶：白瓷碗，奶白面上一层皱奶皮，几粒红豆
  function dpn() {
    const g = new Grid(32, 24), cx = 16, cy = 9;
    for (let t = 8; t >= 0; t--) g.ell(cx, cy + t, 12.6 - t * .55, 5, (x, y) => ramp(['#c9cdd4', '#e6e9ee', '#f8f9fb', '#ffffff'], lit(x, y, cx - 3, cy + 3, 12, 6)));
    g.ell(cx, cy, 13, 5.4, '#eef0f4');
    g.ell(cx, cy - .2, 11.2, 4.3, (x, y) => (Math.sin(x * 1.3 + y * 2.1) > .7 ? '#f2e8cf' : ramp(['#f6efdc', '#fbf6ea', '#fffdf6'], lit(x, y, cx - 2, cy - 1, 11, 4.3))));
    for (const [x, y] of [[cx + 2, cy - 1], [cx + 4, cy], [cx + 3, cy + 1]]) { g.rect(x, y, 2, 2, '#8a2424'); g.set(x, y, '#c8443a'); }
    return finish(g);
  }
  // 柠檬茶：高身玻璃杯，琥珀色茶，柠檬片、冰块、吸管
  function lemontea() {
    const g = new Grid(26, 30), cx = 13, cy = 7;
    for (let t = 18; t >= 0; t--) g.ell(cx, cy + t, 8.6 - t * .14, 3.4, (x, y) => { if (t < 2) return '#e8f4f6'; const v = lit(x, y, cx - 2, cy + 8, 9, 10); return hash(x, y, 4) > .9 ? '#ffe6a0' : ramp(['#a8501a', '#c86a24', '#e08a34', '#f2a84a'], v); });
    g.ell(cx, cy, 8.6, 3.4, '#f2c060');
    for (const [x, y] of [[cx - 4, cy - 1], [cx + 2, cy]]) { g.rect(x, y, 4, 3, '#e8f8fa'); g.set(x, y, '#ffffff'); }
    g.ell(cx + 5, cy + 4, 3.2, 3.2, '#ffe24a'); g.ell(cx + 5, cy + 4, 2.2, 2.2, '#fff6a8'); g.set(cx + 5, cy + 4, '#ffe24a');
    g.ell(cx - 3, cy + 9, 3.2, 3.2, '#ffe24a'); g.ell(cx - 3, cy + 9, 2.2, 2.2, '#fff6a8');
    for (let y = cy - 8; y < cy + 6; y++) g.set(cx + 3 + R((cy - y) * .25), y, '#e04a4a');   // straw
    for (let y = cy + 2; y < cy + 16; y++) g.set(cx - 7, y, '#ffffff');
    return finish(g);
  }
  // 鸳鸯：同奶茶杯，颜色深一点（咖啡 + 奶茶）
  function yuen() {
    const g = new Grid(32, 26), cx = 14, cy = 8;
    g.ell(cx + 1, cy + 14, 13, 4.6, (x, y) => ramp(['#c2c9d4', '#e3e8ef', '#f7f9fb'], lit(x, y, cx, cy + 13, 13, 4.6)));
    for (let t = 9; t >= 0; t--) g.ell(cx, cy + t + 2, 9.6 - t * .2, 4, (x, y) => ramp(['#c8cfda', '#e6ebf1', '#f8fafc', '#ffffff'], lit(x, y, cx - 3, cy + 5, 9, 6)));
    for (let k = 0; k < 2; k++) g.ell(cx + 10, cy + 7 + k, 3.6, 3.6, (x, y) => ((x + .5 - cx - 10) ** 2 + (y + .5 - cy - 7 - k) ** 2 > 3.6) ? '#e3e8ef' : null);
    g.ell(cx, cy + 2, 9.8, 4.2, '#ffffff');
    g.ell(cx, cy + 2.2, 8.4, 3.3, (x, y) => ramp(['#5a3218', '#74421e', '#8a5228', '#a0663a'], lit(x, y, cx - 2, cy, 8.4, 3.3)));
    g.ell(cx - 2, cy + 1.6, 3.4, 1.2, '#c8946a'); g.set(cx - 4, cy + 1, '#e6c09a');
    return finish(g);
  }
  // 红豆冰：高身玻璃杯，杯底红豆沙，中间碎冰，面一层淡奶，吸管
  function redice() {
    const g = new Grid(26, 30), cx = 13, cy = 7;
    for (let t = 18; t >= 0; t--) g.ell(cx, cy + t, 8.6 - t * .14, 3.4, (x, y) => { if (t < 2) return '#e8f4f6';
      if (t > 11) return hash(x, y, 6) > .7 ? '#5a1414' : ramp(['#6a1c18', '#8a2a24', '#a8403a'], lit(x, y, cx - 2, cy + 14, 9, 6));   // red bean
      if (t > 4) return hash(x, y, 2) > .75 ? '#ffffff' : ramp(['#c8dce4', '#e2eef2', '#f4fafc'], lit(x, y, cx - 2, cy + 7, 9, 6));   // crushed ice
      return ramp(['#ead8b4', '#f6ead0', '#fff8e8'], lit(x, y, cx - 2, cy + 2, 9, 4)); });   // evaporated milk
    g.ell(cx, cy, 8.6, 3.4, '#fff4e0'); g.ell(cx - 2, cy - .4, 3, 1, '#ffffff');
    for (let y = cy - 8; y < cy + 6; y++) g.set(cx + 3 + R((cy - y) * .25), y, '#3f86d6');   // straw
    for (let y = cy + 2; y < cy + 16; y++) g.set(cx - 7, y, '#ffffff');
    return finish(g);
  }
  // 芒果冰沙：高身杯，橙黄冰沙，面几粒芒果，薄荷叶
  function smoothie() {
    const g = new Grid(26, 30), cx = 13, cy = 7;
    for (let t = 18; t >= 0; t--) g.ell(cx, cy + t, 8.6 - t * .14, 3.4, (x, y) => t < 2 ? '#e8f4f6' : hash(x, y, 8) > .88 ? '#ffe08a' : ramp(['#e0861a', '#f4a226', '#ffbe3a', '#ffd46a'], lit(x, y, cx - 2, cy + 8, 9, 10)));
    g.ell(cx, cy - 1, 8, 3.6, (x, y) => ramp(['#f4a226', '#ffc44a', '#ffe08a'], lit(x, y, cx - 2, cy - 2, 8, 3.6)));
    for (const [x, y] of [[cx - 4, cy - 3], [cx + 1, cy - 4], [cx + 4, cy - 2]]) { g.rect(x, y, 3, 3, '#ffb020'); g.set(x, y, '#ffe6a0'); g.set(x + 2, y + 2, '#d07a10'); }
    g.rect(cx - 1, cy - 6, 2, 2, '#5ab85a'); g.set(cx + 1, cy - 7, '#7ad87a');
    for (let y = cy + 2; y < cy + 16; y++) g.set(cx - 7, y, '#ffffff');
    return finish(g);
  }
  // 纸包蛋糕：高身金黄蛋糕，包住一圈有摺纹嘅啡色烘焙纸
  function papercake() {
    const g = new Grid(28, 30), cx = 14;
    for (let t = 0; t < 12; t++) g.ell(cx, 25 - t, 9.6 - t * .05, 3.6, (x, y) => ((x + t) % 3 === 0 ? '#b07a3e' : '#d8a868'));   // the pleated paper
    for (let t = 0; t < 10; t++) g.ell(cx, 13 - t, 9.2 - t * t * .05, 3.6, (x, y) => ramp(['#e0a440', '#f2c060', '#ffd880', '#fff0b0'], lit(x, y, cx - 3, 6, 9, 9)));   // the domed sponge
    g.ell(cx, 4, 6, 2.4, (x, y) => ramp(['#c8803a', '#e0a050', '#f0b860'], lit(x, y, cx - 2, 3, 6, 2.4))); g.set(cx - 3, 3, '#fff0c8');
    return finish(g);
  }
  // 瑞士卷：一片卷蛋糕，见到奶油螺旋
  function swissroll() {
    const g = new Grid(30, 26), cx = 15, cy = 12;
    g.ell(cx + 2, cy + 3, 11, 9, '#c8803a');   // the side of the slice
    g.ell(cx, cy, 11, 9, (x, y) => { const d = Math.hypot(x + .5 - cx, (y + .5 - cy) * 1.2), a = Math.atan2(y + .5 - cy, x + .5 - cx); const s = (d + a * 1.6) % 4.2; return d > 10 ? '#c8803a' : s < 1.4 ? '#fff8ec' : ramp(['#f0c060', '#ffd880', '#fff0b0'], lit(x, y, cx - 3, cy - 3, 11, 9)); });
    g.ell(cx - 4, cy - 4, 2, 1.2, '#ffffff');
    return finish(g);
  }
  // 芒果班戟：白色薄皮包住芒果同忌廉，切口见到黄色
  function mangopancake() {
    const g = new Grid(30, 24), cx = 15, cy = 12;
    g.ell(cx, cy + 3, 13, 7, (x, y) => ramp(['#e6dccb', '#f6efe2', '#ffffff'], lit(x, y, cx - 4, cy, 13, 7)));
    g.ell(cx, cy - 1, 11, 6.4, (x, y) => ramp(['#efe6d4', '#fbf6ec', '#ffffff'], lit(x, y, cx - 4, cy - 4, 11, 6.4)));
    g.ell(cx + 6, cy + 4, 4, 3, '#fff8ec'); g.ell(cx + 6, cy + 4, 2.4, 2, '#ffb020'); g.set(cx + 5, cy + 3, '#ffd870');
    g.ell(cx - 3, cy - 3, 3, 1.4, '#ffffff');
    return finish(g);
  }
  const LAB_IMG = new Map();
  function labImg(base, fc, ic, decor) {   // Lab creations: the base's shape in the flavour colour, the filling showing, the decoration on top
    const key = [base, fc, ic, decor].join(); if (LAB_IMG.has(key)) return LAB_IMG.get(key);
    const g = new Grid(32, 28), cx = 16, F = [shade(fc, -30), shade(fc, -12), fc, shade(fc, 20)];
    if (base === 'puff') { g.ell(cx, 18, 13, 7, (x, y) => ramp(['#c8803a', '#e0a050', '#f2c070', '#ffe0a0'], lit(x, y, cx - 4, 14, 13, 7))); g.ell(cx, 13, 12, 3, (x, y) => ramp(F, lit(x, y, cx - 3, 12, 12, 3))); if (ic) for (const dx of [-7, -2, 4, 8]) g.ell(cx + dx, 13, 1.6, 1.4, ic); g.ell(cx, 8, 11, 5.5, (x, y) => ramp(['#c8803a', '#e0a050', '#f2c070', '#ffe0a0'], lit(x, y, cx - 4, 5, 11, 5.5))); }
    else if (base === 'tart') { for (let t = 4; t >= 1; t--) g.ell(cx, 15 + t, 14 - t * .3, 6.4, (x, y) => ((x + t) % 3 === 0) ? '#9a4c16' : '#d08030'); g.ell(cx, 15, 14.4, 6.8, (x, y) => ramp(['#c87a2c', '#e8a050', '#ffc870'], lit(x, y, cx - 3, 13, 14, 6.8))); g.ell(cx, 14.6, 12, 5.2, (x, y) => ramp(F, lit(x, y, cx - 3, 13, 12, 5.2))); if (ic) for (const [dx, dy] of [[-5, -1], [2, 1], [6, -2], [-1, 2]]) g.ell(cx + dx, 14.6 + dy, 1.3, 1, ic); }
    else if (base === 'cheese') { g.tri(4, 22, 28, 22, 28, 8, '#b07040'); for (let y = 8; y < 21; y++) for (let x = 4; x < 28; x++) if ((x - 4) / 24 >= (21 - y) / 13 - .02) g.set(x, y, y < 11 ? F[3] : y > 18 ? '#c88a4a' : ramp(F, -((x - 16) / 14) * .5 - ((y - 14) / 7) * .6)); for (let x = 4; x < 28; x++) g.set(x, 21, '#8a5a30'); if (ic) for (const [x, y] of [[14, 16], [20, 14], [24, 17], [18, 18]]) g.set(x, y, ic); }
    else if (base === 'waffle') { [[6, 15], [12, 12], [18, 10], [24, 12], [28, 16]].forEach(([x, y]) => { for (let r = 0; r < 2; r++) g.ell(x - 1 + r, y + r * 5, 3.6, 3.2, (xx, yy) => ramp([shade(fc, -10), mixHex(fc, '#ffc44a', .5), mixHex(fc, '#ffe08a', .6)], lit(xx, yy, x - 2, y - 1, 3.6, 3.2))); }); if (ic) for (const [x, y] of [[9, 20], [16, 17], [22, 19]]) g.ell(x, y, 1.4, 1.2, ic); }
    else { for (let t = 0; t < 16; t++) g.ell(cx, 24 - t, 8.5 - t * .06, 3.2, t < 1 ? '#c9d2d8' : t < 6 ? (ic || shade(fc, -16)) : t < 13 ? F[2] : F[3]); g.ell(cx, 8, 8.4, 3.2, '#e8f4f6'); for (let y = 9; y < 23; y++) { g.set(cx - 8, y, '#ffffff'); } }
    if (decor === 'icing') for (let x = 6; x < 27; x += 2) g.set(x, (base === 'cheese' ? 9 : base === 'mousse' ? 7 : base === 'puff' ? 5 : 11) + (x % 4 === 0 ? 1 : 0), '#ffffff');
    if (decor === 'gold') for (const [x, y] of [[12, 5], [17, 4], [21, 7], [9, 8]]) { g.set(x, y, '#ffe06a'); g.set(x + 1, y, '#f0b030'); }
    if (decor === 'fruit') for (const [x, y, col] of [[11, 4, '#e8402a'], [16, 3, '#ffb020'], [21, 5, '#5ab85a']]) { g.rect(x, y, 3, 3, col); g.set(x, y, '#ffffff'); }
    if (decor === 'crumb') for (const [x, y] of [[10, 6], [13, 4], [17, 6], [20, 4], [23, 7], [15, 8]]) g.set(x, y, '#a8703e');
    const cv = finish(g); LAB_IMG.set(key, cv); return cv;
  }
  return { labImg, papercake: papercake(), swissroll: swissroll(), mangopancake: mangopancake(), redice: redice(), smoothie: smoothie(), mango: mango(), tart: tart(egg), coco: tart(coconut), bun: bun(), wife: wife(), pudding: pudding(), tea: tea(), cockbun: cockbun(), malai: malai(), eggwaf: eggwaf(), dpn: dpn(), lemontea: lemontea(), yuen: yuen() };
})();
