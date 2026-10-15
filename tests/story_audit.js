// story audit (run in the page via G): every special scene — staff scenes, chats, loyal regulars, first visits, 小剧场, 荣叔, gifts —
// is drawn line by line: the speaker needs a name and a bust, and the Mandarin text must not keep Cantonese words.
(() => {
  const bad = [], YUE = /[嘅咗喺唔冇佢哋嚟乜咁嘢啲俾睇搵㗎喎嗰噉咩吓啱嬲攰嘢]/, seen = new Set();
  const lines = [];   // [where, who, text, ci]
  for (const k in SCENES) for (const v of (SCENES[k] || [])) (Array.isArray(v[0]) ? v : [v]).forEach(ln => Array.isArray(ln) && lines.push(['scene:' + k, ln[0], ln[1]]));
  for (const k in TEMP_TALK) TEMP_TALK[k].forEach(([w, t]) => lines.push(['temp:' + k, w, t]));
  for (const k in MURMUR) MURMUR[k].forEach(t => lines.push(['murmur:' + k, k, t]));
  for (const k in LOYAL_TALK) LOYAL_TALK[k].forEach(([w, t]) => lines.push(['loyal:' + k, w, t, GUEST_DEF.findIndex(g => g.name === k)]));
  for (const k in FIRST_TALK) FIRST_TALK[k].forEach(([w, t]) => lines.push(['first:' + k, w, t, GUEST_DEF.findIndex(g => g.name === k)]));
  for (const k in GIFT_THANKS) GIFT_THANKS[k].forEach(([w, t]) => lines.push(['gift:' + k, w, t, GUEST_DEF.findIndex(g => g.name === k)]));
  EPISODES.forEach(e => e.lines.forEach(([w, t]) => lines.push(['ep:' + e.id, w, t, e.ci != null ? e.ci : 0])));
  RONG_TALK.forEach((T_, i) => T_.forEach(([w, t]) => lines.push(['rong:' + i, w, t])));
  const ph = PHASE; PHASE = 'prep'; HIRE.temp.name = HIRE.temp.name || '学生阿明';
  for (const [where, who, text, ci] of lines) {
    if (typeof text !== 'string') { bad.push([where, 'no text', String(who)]); continue; }
    const m = L(who && TONE[who] ? toned(who, text) : text);
    if (YUE.test(m)) { const k = m; if (!seen.has(k)) { seen.add(k); bad.push([where, 'cantonese', m]); } }
    if (who && who !== 'cust' && who !== 'temp' && who !== 'hero' && !NAMES[who]) bad.push([where, 'no name', who]);
    try { DIALOG = { lines: [[who, text]], i: 0, t: 9, ci: ci >= 0 ? ci : undefined }; const b = speakerBust(who, DIALOG); if (who && !b) bad.push([where, 'no bust', who]); drawDialog(CTX); }
    catch (e) { bad.push([where, 'error', e.message]); }
  }
  DIALOG = null; PHASE = ph;
  return JSON.stringify({ n: lines.length, bad });
})()
