# rebuild src/core/lang.js from the template + the Mandarin table + the S2T map:  python tools/lang/mklang.py
import json, os
D = os.path.dirname(os.path.abspath(__file__)); G0 = os.path.dirname(os.path.dirname(D)) + '/'
s2t = open(D + '/s2t.txt', encoding='utf-8').read()
js = open(D + '/lang_tpl.js', encoding='utf-8').read().replace('__S2T__', s2t).replace('__CMN__', json.dumps(json.load(open(D + '/cmn_lines.json', encoding='utf-8')), ensure_ascii=False))
open(G0 + 'src/core/lang.js', 'w', encoding='utf-8', newline='
').write(js)
print('lang.js rebuilt')
