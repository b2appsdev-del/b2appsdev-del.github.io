#!/usr/bin/env python3
"""Build the next queued FREE tool page for the B2 Apps revenue engine.

Used by .github/workflows/auto-pages.yml (scheduled, uses GITHUB_TOKEN).
Reads data/page-queue.json (curated, human-vetted specs), builds ONE new page
per run, updates sitemap.xml and data/built.json. The workflow commits and
submits the new URL to IndexNow.

Safety rules enforced here:
- Every page is FREE (price 0), no signup, no product sale.
- Disclosure + rel="sponsored nofollow" on partner links.
- Full disclaimer with "verify with official sources", no guarantee,
  no income/performance claim.
- Only arithmetic on numbers entered by the visitor; no network calls in the page.
"""
from pathlib import Path
import html
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://b2appsdev-del.github.io'
QUEUE = ROOT / 'data' / 'page-queue.json'
BUILT = ROOT / 'data' / 'built.json'
SITEMAP = ROOT / 'sitemap.xml'
HUB = ROOT / 'start' / 'index.html'

CSS = '''
:root{--bg:#0a0e14;--surf:#111925;--line:#223044;--txt:#e8eef5;--mut:#9fb0c4;--acc:#38bdf8;--ok:#3ddc97;--warn:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(700px 400px at 10% -10%,rgba(56,189,248,.10),transparent 60%),var(--bg);color:var(--txt);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.wrap{max-width:840px;margin:0 auto;padding:44px 18px 72px}h1{font-size:clamp(1.8rem,5vw,2.5rem);line-height:1.14;letter-spacing:-.03em;margin:0 0 14px}
h2{font-size:1.2rem;margin:34px 0 10px}.lead{font-size:1.08rem;color:#c8d6e6;max-width:64ch}
.kicker{color:var(--acc);text-transform:uppercase;letter-spacing:.13em;font-size:.72rem;font-weight:700}
.card{border:1px solid var(--line);background:var(--surf);border-radius:12px;padding:18px 20px;margin:16px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
label{display:block;font-weight:650;margin:6px 0 4px;font-size:.88rem}
input[type=number]{width:100%;padding:10px 11px;border-radius:9px;border:1px solid var(--line);background:#0b121c;color:var(--txt);font:inherit}
.btn{display:inline-flex;align-items:center;justify-content:center;background:var(--acc);color:#04121c;text-decoration:none;font-weight:750;border:0;border-radius:10px;padding:12px 20px;margin:14px 8px 0 0;cursor:pointer;font:inherit;font-size:1rem}
.result{margin-top:16px;border:1px solid var(--line);border-left:3px solid var(--ok);border-radius:10px;padding:16px 18px;background:#0b121c}
.result .big{font-size:2.1rem;font-weight:800;color:var(--ok);letter-spacing:-.02em}
.metric{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:7px 0;font-size:.92rem}
.metric span:last-child{font-weight:700}
.disclosure{border:1px solid rgba(251,191,36,.45);background:rgba(251,191,36,.07);border-radius:10px;padding:14px 16px;margin:16px 0;font-size:.9rem;color:#f4e2b8}
.fine,.disclaimer{color:var(--mut);font-size:.82rem}.disclaimer{margin-top:32px;border-top:1px solid var(--line);padding-top:16px}
a{color:var(--acc)}.back{display:inline-block;margin-bottom:18px;color:var(--mut);font-size:.82rem;text-decoration:none}
.free{display:inline-block;background:rgba(61,220,151,.12);border:1px solid rgba(61,220,151,.4);color:var(--ok);border-radius:999px;padding:5px 11px;font-size:.78rem;font-weight:700}
'''


def render(spec):
    """Render one vetted spec to a full static HTML page."""
    inputs = spec['inputs']
    fields = '\n'.join(
        '<div><label for="f{i}">{lab}</label><input id="f{i}" type="number" value="{val}" {attrs}></div>'.format(
            i=i, lab=html.escape(inp['label']), val=html.escape(str(inp.get('default', 0))),
            attrs=' '.join('{k}="{v}"'.format(k=k, v=html.escape(str(v))) for k, v in inp.get('attrs', {}).items()),
        )
        for i, inp in enumerate(inputs))
    # JS reads fields f0..fN and evaluates the vetted expression (numbers only).
    expr = spec['expr']
    metrics = ' +\n'.join(
        "'<div class=\"metric\"><span>{lab}</span><span>' + {code} + '</span></div>'".format(
            lab=html.escape(m['label']), code=m['code'])
        for m in spec.get('metrics', []))
    fmt = spec.get('format', 'money')
    faq = '\n'.join('<p><strong>{}</strong> {}</p>'.format(html.escape(q), html.escape(a))
                    for q, a in spec['faq'])
    partners = '\n'.join('<p><a class="btn{alt}" href="{url}" target="_blank" rel="sponsored nofollow">{label} (informational link)</a></p>'.format(
        alt=' alt' if i else '', url=html.escape(p['url']), label=html.escape(p['label']))
        for i, p in enumerate(spec['partners']))
    schema = {
        '@context': 'https://schema.org', '@graph': [
            {'@type': 'WebApplication', 'name': spec['title'],
             'description': spec['desc'], 'applicationCategory': 'FinanceApplication',
             'operatingSystem': 'Any modern web browser',
             'url': BASE + '/' + spec['slug'] + '/',
             'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}},
            {'@type': 'FAQPage', 'mainEntity': [
                {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                for q, a in spec['faq']]},
        ]}
    js = """
(function(){
  var f=function(i){return parseFloat(document.getElementById('f'+i).value)||0;};
  function money(v){return '$'+Math.round(v).toLocaleString('en-US');}
  function pct(v){return (Math.round(v*100)/100)+'%%';}
  function num(v){return (Math.round(v*100)/100).toLocaleString('en-US');}
  function months(v){return v<0?'Not paying down at this payment':(Math.round(v)+' months');}
  var fmt=%s;
  var form=document.getElementById('calc-form');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=%s;
    var out=fmt(v);
    var extra=%s;
    document.getElementById('calc-result').innerHTML='<div class="big">'+out+'</div>'+extra+
      '<p class="fine" style="margin-top:12px">Estimate only. Verify every figure with a qualified professional and current official sources before relying on it.</p>';
  });
})();
""" % (fmt, expr, metrics.replace('\n', ''))
    return '''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}"><meta name="robots" content="index,follow">
<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<link rel="canonical" href="{base}/{slug}/"><script type="application/ld+json">{schema}</script><style>{css}</style></head><body><div class="wrap">
<a class="back" href="{base}/start/">&larr; All free B2 Apps tools</a><div class="kicker">{kicker}</div>
<h1>{headline}</h1><p class="lead">{lead}</p><p><span class="free">FREE - NO SIGNUP - NOTHING UPLOADED</span></p>
<h2>1. Calculate</h2><div class="card"><form id="calc-form"><div class="grid">{fields}</div>
<button class="btn" type="submit">Calculate</button></form>
<div id="calc-result" class="result">Enter your own figures and press the button. Nothing leaves your device.</div></div>
<h2>2. How this is calculated</h2><div class="card"><p>{method}</p></div>
<h2>3. If you want a second opinion</h2>
<div class="disclosure"><strong>Affiliate disclosure.</strong> The links below may become affiliate or lead-referral links. If you use them and a provider pays us a commission, we may earn money <strong>at no extra cost to you</strong>. We are not a lender, adviser or service provider. This is information, not a recommendation — compare terms yourself.</div>
<div class="card">{partners}</div>
<h2>Questions</h2><div class="card">{faq}</div>
<div class="disclaimer"><strong>Disclaimer.</strong> Educational and informational purposes only. Not financial, investment, tax or legal advice. This tool is a simplified estimate and does not establish eligibility, affordability or any outcome. Rules and third-party policies change; you are solely responsible for verifying all figures with a qualified professional and official sources. Affiliate relationships are disclosed above. No income or performance claim is made.</div>
</div><script>{js}</script></body></html>
'''.format(title=html.escape(spec['title']), desc=html.escape(spec['desc']), base=BASE,
           slug=spec['slug'], schema=json.dumps(schema), css=CSS,
           kicker=html.escape(spec['kicker']), headline=html.escape(spec['headline']),
           lead=html.escape(spec['lead']), fields=fields, method=html.escape(spec['method']),
           partners=partners, faq=faq, js=js)


def add_to_hub(spec):
    """Insert a hub card before the 'Free samples' heading (idempotent)."""
    if not HUB.exists():
        return
    hub = HUB.read_text(encoding='utf-8')
    url = '/' + spec['slug'] + '/'
    if 'href="' + url + '"' in hub:
        return
    card = ('<a class="card" href="{u}"><b>{t}</b><small>Free, no signup - {d}</small>'
            '<span class=tag>NEW TOOL</span></a>\n').format(
        u=url, t=html.escape(spec['headline']),
        d=html.escape(spec['desc'][:150]))
    marker = '<h2>Free samples</h2>'
    if marker in hub:
        hub = hub.replace(marker, card + marker, 1)
        HUB.write_text(hub, encoding='utf-8')


def main():
    build_all = '--all' in sys.argv
    queue = json.loads(QUEUE.read_text(encoding='utf-8'))
    built = set(json.loads(BUILT.read_text(encoding='utf-8')) if BUILT.exists() else [])
    pending = [s for s in queue if s['slug'] not in built]
    if not pending:
        print('NO_PENDING')
        return 0
    if not build_all:
        pending = pending[:1]
    urls = []
    sm = SITEMAP.read_text(encoding='utf-8')
    for spec in pending:
        d = ROOT / spec['slug']
        d.mkdir(exist_ok=True)
        (d / 'index.html').write_text(render(spec), encoding='utf-8')
        built.add(spec['slug'])
        url = BASE + '/' + spec['slug'] + '/'
        urls.append(url)
        if url not in sm:
            sm = sm.replace('</urlset>', '  <url><loc>%s</loc></url>\n</urlset>' % url)
        add_to_hub(spec)
    SITEMAP.write_text(sm, encoding='utf-8')
    BUILT.parent.mkdir(exist_ok=True)
    BUILT.write_text(json.dumps(sorted(built), indent=2) + '\n', encoding='utf-8')
    for url in urls:
        print('BUILT_URL=' + url)
    return 0


if __name__ == '__main__':
    sys.exit(main())
