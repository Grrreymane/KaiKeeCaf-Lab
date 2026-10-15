# 街记冰室 Lab

港式冰室经营小游戏（竖屏手机网页）：摆点心、看街坊进店挑选排队付钱、进货升级，慢慢把街角小店做大。

**v1.0 春季**：12 天（每天约 4 分钟），7 款点心饮品按天解锁；坤伯烘焙、莲姨收银，第 2、4 天可以请雯姐、阿少，派去水吧 / 卡座招待 / 外卖窗；顶栏可以 ×2 ×3 倍速。

## 怎么玩

- 点货架选上层 / 下层摆什么；坤伯有料就烤，烤好自动补上货架。
- 底栏：摆货（所有货架一览）、进货（荣叔材料店）、员工、账本（升级）、摆放（拖家具换位置）。
- 早上点小票上的「开门营业」；打烊看账本，第二天接着做。
- 画面可以左右拖，右边是烘焙间。

## 开发

- 源码在 `src/`（顺序见 `src/modules.json`），`index.html` 里两行标记之间是生成区：**改 `src/`，然后 `node tools/sync-inline.cjs`**，别手改生成区。
- 改了文字后：`python D:/Minigame/_workflow/tools/subset_font.py .`（正文 Fusion Pixel、标题思源宋体，都裁成子集放 `fonts/`）。
- 测试（不开浏览器）：
  - `node D:/Minigame/_workflow/tools/headless.js . tests/ui_flow.js --seed 5`：真按钮走完第一天 + 存档往返 + 摆放判定。
  - `node D:/Minigame/_workflow/tools/headless.js . tests/days.js --seed 3 -- good 3`：按策略（good / ok / idle）连玩几天看账。
- 美术草图和方案对比在 `草图/`（不进游戏）。
