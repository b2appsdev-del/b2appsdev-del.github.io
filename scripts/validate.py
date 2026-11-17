#!/usr/bin/env python3
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parents[1]
slugs = ['eu261-claim-documents', 'metals-dealer-comparison', 'wcag-22-audit',
         'whop-listing-checklist', 'checkout-qa']
for s in slugs:
    d = root / s
    html_text = (d / 'index.html').read_text(encoding='utf-8')
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html_text, re.S)
    json.loads(m.group(1))
    links = re.findall(r'href="([^"]+)"', html_text)
    samples = [x for x in links if x.endswith('.md')]
    assert samples and (d / samples[0]).exists(), s
    assert 'LAUNCH20' in html_text and 'Disclaimer' in html_text, s
    print('OK', s, len(html_text), 'bytes,', len(samples), 'sample link(s)')

sm = ET.parse(root / 'sitemap.xml').getroot()
locs = [e.text for e in sm.iter() if e.tag.endswith('loc')]
print('sitemap URLs:', len(locs))
for s in slugs:
    assert any('/' + s + '/' in u for u in locs), s
print('ALL VALID')
