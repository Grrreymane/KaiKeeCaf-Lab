// sheet: version A (top) vs 精细线稿 shipped (bottom), every named character
(function () {
  const ids = Object.keys(STAFF_DEF).filter(k => BUSTS[k]), cv = document.createElement('canvas'); cv.width = ids.length * 210 + 20; cv.height = 520;
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, cv.width, cv.height);
  ids.forEach((id, i) => { c.drawImage(spriteBustA(id), 20 + i * 210, 10); c.drawImage(fineBust(id), 20 + i * 210, 270); });
})();
