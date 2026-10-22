#!/usr/bin/env python3
"""Inline engine.js into index.html -> dist/landed.html (single file for artifact hosts)."""
import os
d=os.path.dirname(os.path.abspath(__file__))
s=open(f'{d}/index.html').read(); e=open(f'{d}/engine.js').read(); lk=open(f'{d}/lookup.js').read()
import base64
logo='data:image/svg+xml;base64,'+base64.b64encode(open(f'{d}/assets/logo.svg','rb').read()).decode()
out=s.replace('assets/logo.svg',logo).replace('<script src="engine.js"></script>','<script>\n'+e+'\n</script>').replace('<script src="lookup.js"></script>','<script>\n'+lk+'\n</script>')
os.makedirs(f'{d}/dist',exist_ok=True); open(f'{d}/dist/landed.html','w').write(out); print(len(out),'bytes')
