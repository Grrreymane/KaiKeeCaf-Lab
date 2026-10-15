// sheet: owner — version A (left) vs A + a little realism (right), both owners
(function () { const cv = document.createElement('canvas'); cv.width = 860; cv.height = 250; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(cv);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#e9e3d3'; c.fillRect(0, 0, 860, 250);
  ['hero_f', 'hero_m'].forEach((id, i) => { c.drawImage(spriteBustA(id), 10 + i * 430, 5); c.drawImage(bust(id), 220 + i * 430, 5); }); })();
