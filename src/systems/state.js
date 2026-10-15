// ==== state: W is everything that is saved; runtime-only things (customers, trays, jobs) live in the sim
const SAVE_KEY = 'jieji-lab-v1';
let W = null;
const freshDay = () => ({ revenue: 0, packCost: 0, upCost: 0, sold: Object.fromEntries(PIDS.map(p => [p, 0])), served: 0, lost: 0, dine: 0, take: 0, combos: 0, seat: 0, tips: 0, waste: 0, wasteN: 0, stale: 0, staleN: 0, quick: 0, wx: 'sun', promo: 'none', promoCost: 0, addon: 0, work: {}, used: {}, stars: [], gripes: {} });
const tableLayers = () => [{ p: null, n: 0, cap: 6 }, { p: null, n: 0, cap: 6 }];
function newState() {
  return {
    v: 2, day: 1, money: 600, rep: 3, tut: 0, bailout: 0, speed: 1,
    ing: Object.fromEntries(Object.keys(INGR).map(k => [k, { flour: 6, butter: 6, egg: 4, sugar: 3, tealeaf: 2, evap: 2 }[k] || 0])), stock: Object.fromEntries(PIDS.map(p => [p, 0])),
    shelves: {
      T1: { layers: tableLayers(), locked: true },
      T2: { layers: [{ p: 'tea', n: 0, cap: 3 }, { p: 'tea', n: 0, cap: 6 }], locked: false, fridge: true },
      T3: { layers: tableLayers(), locked: false },
      T4: { layers: tableLayers(), locked: false },
      T5: { layers: tableLayers(), locked: true },
      T6: { layers: tableLayers(), locked: true },
      T7: { layers: tableLayers(), locked: true, extra: true },
      T8: { layers: tableLayers(), locked: true, extra: true }, T9: { layers: tableLayers(), locked: true, extra: true }, T10: { layers: tableLayers(), locked: true, extra: true },
    },
    plan: Object.fromEntries(PIDS.map(p => [p, 'on'])),   // daily bake plan: 'pri' first, 'on' normal, 'off' don't make
    staff: { wen: { hired: false, post: 'bar' }, shao: { hired: false, post: 'serve' }, qing: { hired: false, post: 'bar' }, yao: { hired: false, post: 'bake' }, temp: { hired: false, post: 'take' } },
    up: { oven: 0, till: 0, sign: 0, fridge: 0, tea: 0, ac: 0, music: 0, ads: 0 }, furn: {}, seen: {}, known: {}, hero: 'f', aff: {}, storyNext: [], pts: 0, lv: { kun: 1, lin: 1, wen: 1, shao: 1 }, decor: { tier: {}, rot: {}, wall: 'mint', walls: { mint: true }, booth: 'green', booths: { green: true } }, stats: { sold: {}, days: 0 }, ach: {}, perks: {}, priceTier: 1, stockTier: 1, expand: 0, sup: {}, items: {}, itemPos: {}, dirt: 0, fans: {}, gifted: {}, showcase: 'tart', lab: {}, keepsakes: {}, eps: {},
    total: { revenue: 0, served: 0, profit: 0 }, today: freshDay(), history: [],
  };
}
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(W)); } catch (e) {} }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
  if (!s || !s.v) return false;
  const d = newState();   // fill fields a newer version added; never wipe the player's save
  for (const k in d) if (s[k] === undefined) s[k] = d[k];
  for (const id in d.shelves) if (!s.shelves[id]) s.shelves[id] = d.shelves[id];   // display spots added later
  if (!s.ing) { s.ing = Object.fromEntries(Object.keys(INGR).map(k => [k, 0])); for (const p in s.packs || {}) for (const k of RECIPE[p] || []) s.ing[k] += s.packs[p]; }   // old saves: packs -> raw ingredients
  for (const k in s.up || {}) if (s.up[k] === true) s.up[k] = 1; else if (s.up[k] === false) s.up[k] = 0;   // old saves: true/false -> levels
  for (const id in d.shelves) if (!s.shelves[id]) s.shelves[id] = d.shelves[id];   // shelf spots added in later versions
  for (const k of ['ing', 'stock', 'plan', 'up', 'staff', 'lv']) for (const q in d[k]) if (s[k][q] === undefined) s[k][q] = d[k][q];
  for (const id of SHELF_IDS) if (!s.shelves[id]) s.shelves[id] = d.shelves[id];
  if (!s.toured) s.toured = { 1: true, 2: true, 3: true, 4: true, 5: true };   // saves from before the daily tour: skip the basics
  s.today = freshDay(); s.v = 2;
  W = s; return true;
}
function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
const wageOf = k => (DAILY[k] || HIRE[k].wage) + (lvOf(k) - 1) * LV_WAGE;
const wages = () => rentToday() + wageOf('kun') + wageOf('lin') + Object.keys(HIRE).reduce((a, k) => a + (W.staff[k].hired ? wageOf(k) : 0), 0);
const postsOf = post => Object.keys(HIRE).filter(k => W.staff[k].hired && W.staff[k].post === post);   // everyone on that post
const POST_MAX = { bake: 2, bar: 2, serve: 3, take: 2, clean: 2 };   // more hands on a post = more done
const postOf = post => Object.keys(HIRE).find(k => W.staff[k].hired && W.staff[k].post === post) || null;   // who is on this post
