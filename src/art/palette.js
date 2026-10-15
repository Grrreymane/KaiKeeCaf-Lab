// ============================================================ 配色：1 薄荷冰室
const C = {
  wall: '#7fcfae', wallD: '#6ebf9f', trim: '#7a3f2a', trimL: '#a35a3c', tile: '#f7f3e7', tileL: '#ddd7c8',
  floorA: '#f3e6c4', floorB: '#e6d1a3', dot: '#2f8f6e', board: '#d93a2f', stool: '#e5412f',
  wood: '#c07a3e', woodL: '#e0a466', woodD: '#8a512a', marble: '#f7f2ea', marbleS: '#ddd3c4', marbleD: '#c6bba9', vein: '#e7ddcf',
  brass: '#f2c64c', brassD: '#c99428', steel: '#e4e8eb', steelS: '#c5cacd', steelD: '#a8adb2', dark: '#3b3135', cream: '#fff4dc', gold: '#ffd75e',
};

// ============================================================ 食物（店里原大：约半个头大）
const FOOD = {
  tart: spr(['....LCLCLCL....', '..LCyyyyyyyCL..', '.CyYYYYYYYYYyC.', 'LyYhhhYYYYYYYyL', 'CyYhYYYYYYYYsyC', 'LyYYYYYYYYYssyL', '.CyyYYYYYsssyC.', '.LCLCyyyyyCLCL.', '..dCdCdCdCdCd..', '...ddddddddd...'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#ffd21f', h: '#fff6b8', s: '#f2ad0e', d: '#a9561a' }),
  coco: spr(['....LCLCLCL....', '..LCyyyyyyyCL..', '.CyYkYYkYYkYyC.', 'LyYhYkYYkYYkYyL', 'CyYkYYkYYkYYsyC', 'LyYYkYYkYYkssyL', '.CyykYYkYsssyC.', '.LCLCyyyyyCLCL.', '..dCdCdCdCdCd..', '...ddddddddd...'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#f2d4a2', k: '#c98d52', h: '#fff4dc', s: '#ddb27a', d: '#a9561a' }),
  bun: spr(['.....bbbbbb.....', '...bhhkhhhkLbb..', '..bhhhkhhkLLLkb.', '.bkkkhkkkkLkLLLb', '.bhLLkLLLkkLLLsb', 'bLLLkLLLLkLLkksb', 'bkkkLkkkLkkLLskb', 'bLLkLLLkLsskssb.', '.bsksssksskssbb.', '.pPPPPPPPPPPPPp.', '..pPPPPPPPPPPp..', '....pppppppp....'],
    { b: '#e0901f', h: '#ffe9a0', L: '#ffc23a', k: '#c56e12', s: '#e9a12a', P: '#f7d79a', p: '#d8a560' }),
  wife: spr(['....ccccccc....', '..ccLLLLLLLcc..', '.cLLhhhLLLLLLc.', 'cLLhLsLLLsLLLLc', 'cLLLLsLLLsLLLLc', '.cLLLLLLLLLLLc.', '.wcccccccccccw.', '..wwdwwdwwdww..', '....ddddddd....'],
    { c: '#e6a14a', L: '#f7cf7e', h: '#fff0c4', s: '#c8803a', w: '#fbe9c6', d: '#c28440' }),
  pudding: spr(['...BBBBBBBB...', '.BBMMMMMMMMBB.', 'BMMmmMMMMMMMMB', 'BMmMMMMMrRMMMB', 'BMMMMMrRMMMMnB', '.BMMMMMMMMnnB.', 'wwBBBBBBBBBBww', '.wbwbwbwbwbww.', '..wwwwwwwwww..', '....ffffff....'],
    { B: '#2d6cc4', M: '#fff4d6', m: '#ffffff', n: '#f1dfb4', r: '#d9372a', R: '#8c1d17', w: '#f2f6fa', b: '#4a8ae0', f: '#c9d3df' }),
  tea: spr(['..wwwwwwww....', '.wTTTTTTTTw...', 'wTTttTTTTTTw..', 'wTTTTTTTTTTwhh', 'wwTTTTTTTTww.h', 'wwwwwwwwwwww.h', 'wWwwwwwwwwwWh.', '.wWwwwwwwwWw..', '..wWWWWWWWw...', 'SSSSSSSSSSSS..', '.SssssssssS...', '...ssssss.....'],
    { w: '#ffffff', W: '#dde3ec', T: '#c47838', t: '#e9b27c', h: '#e6ebf2', S: '#f3f5f8', s: '#c2c9d4' }),
};
// 店里货架上用的小号（约 10 像素宽 ≈ 2/3 个头）；大号留给选货卡、设计台
const FOOD_S = {
  tart: spr(['..LCLCLC..', '.CyYYYYyC.', 'LyhhYYYYyL', 'CyYYYYYsyC', '.CyYYYssC.', '.LCLyyLCL.', '..dddddd..'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#ffd21f', h: '#fff6b8', s: '#f2ad0e', d: '#a9561a' }),
  coco: spr(['..LCLCLC..', '.CyYkYkyC.', 'LyhYkYYkyL', 'CykYYkYsyC', '.CyYkYssC.', '.LCLyyLCL.', '..dddddd..'],
    { L: '#ffc46a', C: '#e3832a', y: '#f5a33a', Y: '#f2d4a2', k: '#c98d52', h: '#fff4dc', s: '#ddb27a', d: '#a9561a' }),
  bun: spr(['...bbbbb...', '.bhhkhLLb..', '.bhkhLkLLb.', 'bkkLkkLkLsb', 'bLLkLLkLssb', '.bskssksb..', '.pPPPPPPPp.', '..ppppppp..'],
    { b: '#e0901f', h: '#ffe9a0', L: '#ffc23a', k: '#c56e12', s: '#e9a12a', P: '#f7d79a', p: '#d8a560' }),
  wife: spr(['..cccccc..', '.cLLLLLLc.', 'cLhhLsLLLc', 'cLLsLLsLLc', '.cLLLLLLc.', '.wccccccw.', '..wdwwdw..'],
    { c: '#e6a14a', L: '#f7cf7e', h: '#fff0c4', s: '#c8803a', w: '#fbe9c6', d: '#c28440' }),
  pudding: spr(['..BBBBBB..', '.BMMMMrMB.', 'BMmMMrRMMB', 'BMMMMMMnnB', 'wBBBBBBBBw', '.wbwbwbww.', '..wwwwww..'],
    { B: '#2d6cc4', M: '#fff4d6', m: '#ffffff', n: '#f1dfb4', r: '#d9372a', R: '#8c1d17', w: '#f2f6fa', b: '#4a8ae0' }),
  tea: spr(['.wwwwww...', 'wTTtTTTw..', 'wTTTTTTwhh', 'wwwwwwww.h', 'wWwwwwwWh.', '.wWWWWWw..', 'SSSSSSSSS.', '.sssssss..'],
    { w: '#ffffff', W: '#dde3ec', T: '#c47838', t: '#e9b27c', h: '#e6ebf2', S: '#f3f5f8', s: '#c2c9d4' }),
};
const HAND = spr(['....WW......', '...WWWW.....', '...WWWW.....', '...WWWW.....', '...WWWWWW...', '...WWWWWWWW.', '.W.WWWWWWWWW', 'WWWWWWWWWWWW', 'WWWWWWWWWWWW', '.WWWWWWWWWWW', '..WWWWWWWWW.', '...bbbbbbb..', '...bbbbbbb..'], { W: '#ffffff', b: '#7fcfae' });
const COIN = spr(['..ggggg..', '.gyygggg.', 'gygggggog', 'ggggggggo', 'ggggggggo', 'gggggggoo', '.ggggggo.', '..ooooo..'], { g: '#f2c14e', y: '#fff3a0', o: '#c9902e' });
