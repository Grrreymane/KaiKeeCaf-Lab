// headless: play N days with a simple strategy and print the books.
// usage: node headless.js . tests/days.js --seed 3 -- <good|serve|take|ok|idle> <days>
const strat = ARGS[0] || 'good', days = +(ARGS[1] || 12);
startGame(true);
const S = 1 / 30;
function run(sec) { for (let i = 0; i < sec * 30; i++) { gtime += S; stepDay(S); simStep(S); STORY_Q.length = 0; DIALOG = null; } }   // the player taps through every scene
const log = [];
for (let d = 0; d < days; d++) {
  if (strat !== 'idle') {
    W.tut = 4; for (const p of researchable()) W.known[p] = true;   // the player does the desk each time
    assignLayer('T4', 0, 'tart'); assignLayer('T4', 1, 'bun');
    if (strat !== 'ok') {
      assignLayer('T3', 0, unlocked('coco') ? 'coco' : 'tart'); assignLayer('T3', 1, unlocked('wife') ? 'wife' : 'bun');
      if (unlocked('pudding')) assignLayer('T2', 0, 'pudding');
      if (unlocked('mango')) assignLayer('T2', 0, 'mango');
      if (W.day >= 2 && !W.staff.wen.hired) { hireStaff('wen'); setPost('wen', 'bar'); }
      if (W.day >= 4 && !W.staff.shao.hired && strat !== 'good') { hireStaff('shao'); setPost('shao', strat === 'take' ? 'take' : 'serve'); }
      if (W.day >= 4 && !W.staff.shao.hired && strat === 'good' && W.money > 500) { hireStaff('shao'); setPost('shao', 'serve'); }
      if (W.money > 150) restock(3);
      if (!W.up.till && W.money > 600) buyUpgrade('till');
      for (const id of ['T1', 'T5']) if (W.shelves[id].locked && W.money > 700) { unlockShelf(id); assignLayer(id, 0, 'tart'); assignLayer(id, 1, 'bun'); }
      if (W.day >= 5 && !W.up.sign && W.money > 900) buyUpgrade('sign');
      W.plan.tart = 'pri';
    } else for (const p of ['tart', 'bun', 'tea']) if (batchesOf(p) < 2 && W.money > 100) for (const k of RECIPE[p]) if (W.ing[k] < 2) buyIngr(k, 1);
  }
  run(25); openShop();
  let maxQ = 0;
  for (let t = 0; t < 240 && PHASE !== 'ledger'; t += 1) {
    run(1); maxQ = Math.max(maxQ, queueLen());
    if (strat !== 'ok' && strat !== 'idle' && t % 20 === 0 && W.money > 80) restock(2);
  }
  const L = LEDGER;
  log.push(`day ${String(L.day).padStart(2)}: cust ${L.served} (dine ${L.dine} take ${L.take}) lost ${L.lost} rev ${L.revenue} packs ${L.packCost} wages ${L.daily} profit ${L.profit} avg ${L.avg.toFixed(2)} money ${W.money} maxQ ${maxQ}${L.month ? ' | month ' + L.month.revenue : ''} | ${L.tip}`);
  nextDay();
}
console.log(strat + '\n' + log.join('\n'));
