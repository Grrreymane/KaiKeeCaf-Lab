// 店里货架用的大号细像素点心（2 倍画布上约 30 像素宽，一个人头那么大）：光从左上来，四档颜色 + 深色描边
// 依赖 lib.js（Grid、OUT、mixHex、shade）
(function () {
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
  window.FOOD_L = { mango: mango(), tart: tart(egg), coco: tart(coconut), bun: bun(), wife: wife(), pudding: pudding(), tea: tea() };
})();
