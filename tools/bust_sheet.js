// sheet of every dialogue bust as shipped (version A)
(function () { const ids = Object.keys(STAFF_DEF).filter(k => BUSTS[k]), cv = document.createElement('canvas'); cv.width = ids.length * 210 + 20; cv.height = 280;
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99;max-width:100vw'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, cv.width, cv.height); c.font = '16px sans-serif'; c.fillStyle = '#3a2a2e';
  ids.forEach((id, i) => { c.drawImage(bust(id), 20 + i * 210, 10); c.fillText(id, 20 + i * 210, 270); }); })();
