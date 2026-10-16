// text audit (run in the page via G / eval): draws every panel and screen, reports text that leaves the 360px screen
// or a button label wider than its button. Usage on _test.html: fetch('tests/text_audit.js').then(r=>r.text()).then(t=>eval(t))
(() => {
  const bad = [], seen = new Set(), P = CanvasRenderingContext2D.prototype, f0 = P.fillText;
  let where = '', cards = [], boxes = [];
  P.fillText = function (s, x, y, ...r) {
    const w = this.measureText(s).width, a = this.textAlign, l = a === 'center' ? x - w / 2 : a === 'right' || a === 'end' ? x - w : x;
    if (this.canvas === CV && (l < 2 || l + w > 358) && String(s).trim()) { const k = where + '|' + s; if (!seen.has(k)) { seen.add(k); bad.push([where, 'screen', String(s), Math.round(l), Math.round(l + w)]); } }
    if (this.canvas === CV && String(s).trim() && this.fillStyle !== '#2a1e22' && !boxes.some(q => q[4] === s && Math.abs(q[0] - l) < 2 && Math.abs(q[1] - y) < 2)) { const fs = +((this.font.match(/(\d+)px/) || [])[1] || 12);
      for (const q of boxes) if (q[4] !== s && l < q[2] - 1 && l + w > q[0] + 1 && y < q[3] - 2 && y + fs > q[1] + 2) { const k = where + '|o|' + s + '|' + q[4]; if (!seen.has(k)) { seen.add(k); bad.push([where, 'overlap', String(s), q[4]]); } }
      boxes.push([l, y, l + w, y + fs, s]); }
    if (this.canvas === CV && String(s).trim()) { const inC = cards.filter(q => l >= q[0] - 1 && l < q[0] + q[2] && y >= q[1] - 2 && y < q[1] + q[3]).sort((a, b) => a[2] * a[3] - b[2] * b[3])[0];
      if (inC && l + w > inC[0] + inC[2] + 1) { const k = where + '|c|' + s; if (!seen.has(k)) { seen.add(k); bad.push([where, 'card', String(s), Math.round(l + w), inC[0] + inC[2]]); } } }
    return f0.call(this, s, x, y, ...r);
  };
  const card0 = card; card = function (c, x, y, w, h, ...r) { cards.push([x, y, w, h]); if (w >= 250 && h >= 100) boxes = []; return card0(c, x, y, w, h, ...r); };   // a big card covers what was drawn before it
  const sheet0 = sheet; sheet = function (...a) { boxes = []; return sheet0(...a); };
  const btn0 = btn;
  btn = function (c, x, y, w, h, label, ...r) { c.font = fp(FS); const lw = c.measureText(label).width; if (lw > w - 4) { const k = where + '|b|' + label; if (!seen.has(k)) { seen.add(k); bad.push([where, 'button', label, Math.round(lw), w]); } } return btn0(c, x, y, w, h, label, ...r); };
  const draw = () => render(CTX);
  const shot = (name, setup) => { where = name; cards = []; boxes = []; try { PANEL = null; DIALOG = null; DESK = null; LEDGER = null; PHASE = 'prep'; setup(); draw(); } catch (e) { bad.push([name, 'error', e.message]); } };
  STORY_Q.length = 0; W.tourOff = true;
  shot('hud', () => {});
  shot('hud-open', () => { PHASE = 'open'; });
  for (const k of ['stock', 'shop', 'staff', 'ach', 'goals', 'specials', 'sup', 'guests', 'menu', 'book', 'plan', 'pause', 'showcase']) shot(k, () => { PANEL = { kind: k, bar: 1 }; });
  for (const tab of ['theme', 'shelf', 'wall', 'floor', 'counter', 'booth', 'expand', 'items']) shot('decor' + tab, () => { PANEL = { kind: 'decor', tab, bar: 6 }; });
  for (const ci of CUST_POOL) shot('guest' + ci, () => { PANEL = { kind: 'guest', ci, bar: 4 }; });
  shot('shelf', () => { PANEL = { kind: 'shelf', id: SHELF_IDS[0], bar: 0 }; });
  shot('lab', () => { W.expand = Math.max(W.expand || 0, 1); PANEL = { kind: 'lab', bar: 2 }; });
  shot('placeask', () => { PANEL = { kind: 'placeask', id: 'luckycat', gift: true }; });
  for (const k in PERKS) for (const lv in PERKS[k]) shot('perk-' + k + lv, () => { PANEL = { kind: 'perk', k, lv: +lv, bar: 3 }; });
  shot('ledger', () => { PHASE = 'ledger'; W.today.sold = Object.fromEntries(PIDS.slice(0, 12).map(p => [p, 9])); endDay(); STORY_Q.length = 0; });
  shot('title', () => { PHASE = 'title'; });
  for (const cat of (typeof ITEM_CATS !== 'undefined' ? ITEM_CATS : []).map(q => q[0])) shot('items-' + cat, () => { PANEL = { kind: 'decor', tab: 'items', cat, bar: 6 }; });
  shot('group-open', () => { PHASE = 'open'; W.today.group = { p: PIDS[0], n: 18, who: '诊所姑娘们', state: 'open' }; });
  shot('dialog', () => { DIALOG = { key: 'x', lines: [['lin', '（举着照片）这间店……是这间店！门口站着一个老先生，还有一个年轻的……坤伯？！']], i: 0, t: 99 }; });
  P.fillText = f0; btn = btn0; card = card0; sheet = sheet0; PHASE = 'prep'; LEDGER = null; PANEL = null;
  return JSON.stringify(bad);
})()
