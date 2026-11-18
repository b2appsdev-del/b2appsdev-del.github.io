#!/usr/bin/env python3
"""Generate a FREE, no-signup DSCR rental-property tool page (finance lead-gen pivot).

Companion to scripts/gen_free_tools.py. See
data/publish/DIAGNOSIS_PIVOT_2026-11-18.md for the strategy.

This page does NOT sell a product. It answers one specific high-intent question
("does this rental property cover its debt service?"), runs fully client-side,
explains its methodology (needed to pass Google's YMYL quality bar), and routes
to honestly-disclosed lender information / affiliate programs.

Rules: no guarantee, no income/performance promise, "verify with a lender and
official sources" everywhere, affiliate disclosure before any partner link,
rel="sponsored nofollow" on partner links.
"""
from pathlib import Path
import html
import json

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://b2appsdev-del.github.io'

CSS = '''
:root{--bg:#0a0e14;--surf:#111925;--line:#223044;--txt:#e8eef5;--mut:#9fb0c4;--acc:#38bdf8;--ok:#3ddc97;--warn:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(700px 400px at 10% -10%,rgba(56,189,248,.10),transparent 60%),var(--bg);color:var(--txt);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:44px 18px 72px}h1{font-size:clamp(1.8rem,5vw,2.5rem);line-height:1.14;letter-spacing:-.03em;margin:0 0 14px}
h2{font-size:1.2rem;margin:34px 0 10px}.lead{font-size:1.08rem;color:#c8d6e6;max-width:64ch}
.kicker{color:var(--acc);text-transform:uppercase;letter-spacing:.13em;font-size:.72rem;font-weight:700}
.card{border:1px solid var(--line);background:var(--surf);border-radius:12px;padding:18px 20px;margin:16px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
label{display:block;font-weight:650;margin:6px 0 4px;font-size:.88rem}
input[type=number]{width:100%;padding:10px 11px;border-radius:9px;border:1px solid var(--line);background:#0b121c;color:var(--txt);font:inherit}
.btn{display:inline-flex;align-items:center;justify-content:center;background:var(--acc);color:#04121c;text-decoration:none;font-weight:750;border:0;border-radius:10px;padding:12px 20px;margin:14px 8px 0 0;cursor:pointer;font:inherit;font-size:1rem}
.btn.alt{background:transparent;color:var(--txt);border:1px solid var(--line)}
.result{margin-top:16px;border:1px solid var(--line);border-left:3px solid var(--ok);border-radius:10px;padding:16px 18px;background:#0b121c}
.result .ratio{font-size:2.2rem;font-weight:800;letter-spacing:-.02em;color:var(--ok)}
.metric{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:7px 0;font-size:.92rem}
.metric span:last-child{font-weight:700}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:.9rem}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{color:var(--acc);font-size:.8rem;text-transform:uppercase;letter-spacing:.06em}
.disclosure{border:1px solid rgba(251,191,36,.45);background:rgba(251,191,36,.07);border-radius:10px;padding:14px 16px;margin:16px 0;font-size:.9rem;color:#f4e2b8}
.fine,.disclaimer{color:var(--mut);font-size:.82rem}
.disclaimer{margin-top:32px;border-top:1px solid var(--line);padding-top:16px}
a{color:var(--acc)}.back{display:inline-block;margin-bottom:18px;color:var(--mut);font-size:.82rem;text-decoration:none}
.free{display:inline-block;background:rgba(61,220,151,.12);border:1px solid rgba(61,220,151,.4);color:var(--ok);border-radius:999px;padding:5px 11px;font-size:.78rem;font-weight:700}
'''

JS = r'''
(function(){
  function pmt(P, annualRate, years){
    var r = annualRate/100/12, n = years*12;
    if (r === 0) return P/n;
    return P * r / (1 - Math.pow(1+r, -n));
  }
  function principalFromPmt(M, annualRate, years){
    var r = annualRate/100/12, n = years*12;
    if (r === 0) return M*n;
    return M * (1 - Math.pow(1+r, -n)) / r;
  }
  function money(v){ return '$' + Math.round(v).toLocaleString('en-US'); }
  var form = document.getElementById('dscr-form');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var rent = parseFloat(document.getElementById('rent').value)||0;
    var other = parseFloat(document.getElementById('other').value)||0;
    var vacancy = parseFloat(document.getElementById('vacancy').value)||0;
    var tax = parseFloat(document.getElementById('tax').value)||0;
    var ins = parseFloat(document.getElementById('ins').value)||0;
    var hoa = parseFloat(document.getElementById('hoa').value)||0;
    var loan = parseFloat(document.getElementById('loan').value)||0;
    var rate = parseFloat(document.getElementById('rate').value)||0;
    var years = parseFloat(document.getElementById('years').value)||30;
    var target = parseFloat(document.getElementById('target').value)||1.25;

    var effIncome = rent*(1-vacancy/100) + other;
    var pi = pmt(loan, rate, years);
    var pitia = pi + tax + ins + hoa;
    var dscr = pitia > 0 ? effIncome/pitia : 0;
    var cashflow = effIncome - pitia;
    var maxPmt = Math.max(0, effIncome/target - (tax+ins+hoa));
    var maxLoan = principalFromPmt(maxPmt, rate, years);

    var verdict = dscr >= 1.25 ? 'At or above the 1.25 threshold many lenders use.'
      : dscr >= 1.0 ? 'Above 1.0 but below 1.25 — some lenders may accept it, terms vary.'
      : 'Below 1.0 — rent alone does not cover the payment.';

    var html = '<div class="ratio">DSCR ' + dscr.toFixed(2) + '</div>' +
      '<p class="fine">' + verdict + '</p>' +
      '<div class="metric"><span>Effective monthly rental income</span><span>' + money(effIncome) + '</span></div>' +
      '<div class="metric"><span>Monthly principal &amp; interest</span><span>' + money(pi) + '</span></div>' +
      '<div class="metric"><span>Total PITIA (payment + tax + insurance + HOA)</span><span>' + money(pitia) + '</span></div>' +
      '<div class="metric"><span>Estimated monthly cash flow</span><span>' + money(cashflow) + '</span></div>' +
      '<div class="metric"><span>Est. max loan at target DSCR ' + target.toFixed(2) + '</span><span>' + money(maxLoan) + '</span></div>' +
      '<p class="fine" style="margin-top:12px">Estimate only. Vacancy, taxes, insurance and lender overlays vary. ' +
      'Verify every number with the actual lender and current official sources before relying on it.</p>';
    document.getElementById('dscr-result').innerHTML = html;
  });
})();
'''

P = dict(
    slug='dscr-calculator-rental-property',
    title='DSCR Calculator for Rental Property - Free Debt Service Coverage Check',
    desc='Free DSCR calculator for rental property. Estimate debt service coverage ratio, cash flow and max loan from rent, PITIA and rate. No signup. Estimate only — verify with a lender.',
    kicker='Real estate investing / free calculator',
    headline='Does the rent actually cover the payment? Check the DSCR free.',
    lead='A private, client-side DSCR (debt service coverage ratio) calculator for a single rental property. Enter your own rent, costs and loan figures. Nothing is uploaded, no signup, and no lender is contacted. Estimate only — verify with a lender.',
    faq=[
        ('What is DSCR?', 'Debt service coverage ratio is rental income divided by total debt service (the property payment, plus tax, insurance and HOA where included). Lenders use it to judge whether a rental covers its own costs.'),
        ('What DSCR do lenders require?', 'Many DSCR loan programs look for around 1.0 to 1.25 or more, but every lender has its own rules and overlays. This tool does not tell you whether you will be approved.'),
        ('Is this a loan offer or advice?', 'No. It is a free calculator and general information. It is not a loan offer, not financial advice, and it does not check your credit or eligibility.'),
        ('Do you get paid by lenders?', 'Some links on this page may become affiliate or lead-referral links. If you use them and a lender pays a commission, we may earn money at no extra cost to you. This is disclosed before any such link.'),
        ('How accurate is it?', 'It is a simplified estimate. Real underwriting uses actual rent rolls, tax assessments, insurance quotes and lender-specific rules. Verify everything with a qualified lender and official sources.'),
    ],
)


def build_html():
    faq_schema = [{'@type': 'Question', 'name': q,
                   'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                  for q, a in P['faq']]
    schema = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebApplication', 'name': P['title'], 'description': P['desc'],
         'applicationCategory': 'FinanceApplication',
         'operatingSystem': 'Any modern web browser',
         'url': BASE + '/' + P['slug'] + '/',
         'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}},
        {'@type': 'FAQPage', 'mainEntity': faq_schema},
    ]}
    faq_html = '\n'.join(
        '<p><strong>{}</strong> {}</p>'.format(html.escape(q), html.escape(a))
        for q, a in P['faq'])
    return '''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<link rel="canonical" href="{base}/{slug}/">
<script type="application/ld+json">{schema}</script>
<style>{css}</style></head><body><div class="wrap">
<a class="back" href="{base}/start/">&larr; All free B2 Apps tools</a>
<div class="kicker">{kicker}</div>
<h1>{headline}</h1>
<p class="lead">{lead}</p>
<p><span class="free">FREE - NO SIGNUP - NOTHING UPLOADED</span></p>

<h2>1. Check a rental property</h2>
<div class="card">
<form id="dscr-form">
  <div class="grid">
    <div><label for="rent">Gross monthly rent ($)</label><input id="rent" type="number" value="2400" min="0" step="50"></div>
    <div><label for="other">Other monthly income ($)</label><input id="other" type="number" value="0" min="0" step="25"></div>
    <div><label for="vacancy">Vacancy / expense allowance (%)</label><input id="vacancy" type="number" value="5" min="0" max="50" step="1"></div>
    <div><label for="tax">Monthly property tax ($)</label><input id="tax" type="number" value="300" min="0" step="25"></div>
    <div><label for="ins">Monthly insurance ($)</label><input id="ins" type="number" value="120" min="0" step="10"></div>
    <div><label for="hoa">Monthly HOA ($)</label><input id="hoa" type="number" value="0" min="0" step="25"></div>
    <div><label for="loan">Loan amount ($)</label><input id="loan" type="number" value="300000" min="0" step="1000"></div>
    <div><label for="rate">Interest rate (% / year)</label><input id="rate" type="number" value="7" min="0" max="25" step="0.1"></div>
    <div><label for="years">Loan term (years)</label><input id="years" type="number" value="30" min="1" max="40" step="1"></div>
    <div><label for="target">Target DSCR</label><input id="target" type="number" value="1.25" min="0.5" max="3" step="0.05"></div>
  </div>
  <button class="btn" type="submit">Calculate DSCR</button>
</form>
<div id="dscr-result" class="result">Enter your own figures and press the button. Nothing leaves your device.</div>
</div>

<h2>2. How this estimate is calculated</h2>
<div class="card">
<p><strong>Effective income</strong> = gross rent &times; (1 &minus; vacancy %) + other income.</p>
<p><strong>PITIA</strong> = monthly principal &amp; interest + property tax + insurance + HOA.</p>
<p><strong>DSCR</strong> = effective income &divide; PITIA. A DSCR of 1.25 means the rent covers the full payment plus about 25%.</p>
<p><strong>Max loan at target</strong> solves for the loan where income &divide; PITIA equals your target DSCR.</p>
<p class="fine">This is a simplified model. Lenders may use different vacancy factors, exclude or include certain costs, and apply their own overlays. It is not a loan decision. Verify with a qualified lender and current official sources.</p>
</div>

<h2>3. If you want to talk to a lender</h2>
<div class="disclosure"><strong>Affiliate disclosure.</strong> Some links in this section may become affiliate or lead-referral links. If you enquire through them and a lender pays us a commission, we may earn money <strong>at no extra cost to you</strong>. We are not a lender and do not offer loans. This is information, not a recommendation — compare rates, fees and terms yourself.</div>
<div class="card">
<p><a class="btn" href="https://www.nerdwallet.com/mortgages/" target="_blank" rel="sponsored nofollow">Compare mortgage options (informational link)</a></p>
<p><a class="btn alt" href="https://www.moneyhelper.org.uk/en/homes/buying-a-home/mortgage-calculator" target="_blank" rel="sponsored nofollow">MoneyHelper mortgage guidance (informational link)</a></p>
<p class="fine">These are informational links until an affiliate/lead program is approved. No commission is claimed unless a program is active and you enquire through a tracked link.</p>
</div>

<h2>Questions</h2><div class="card">{faq}</div>

<div class="disclaimer"><strong>Disclaimer.</strong> Educational and informational purposes only. Not financial, investment, tax or legal advice. This tool does not offer loans, check eligibility, or predict approval. The DSCR figure is an estimate and does not establish cash flow or affordability. Rules, rates and lender policies change; you are solely responsible for verifying all figures with a qualified lender and official sources. Affiliate relationships are disclosed above. No income or performance claim is made.</div>
</div>
<script>{js}</script>
</body></html>
'''.format(title=html.escape(P['title']), desc=html.escape(P['desc']),
           base=BASE, slug=P['slug'], schema=json.dumps(schema), css=CSS,
           kicker=html.escape(P['kicker']), headline=html.escape(P['headline']),
           lead=html.escape(P['lead']), faq=faq_html, js=JS)


def main():
    d = ROOT / P['slug']
    d.mkdir(exist_ok=True)
    (d / 'index.html').write_text(build_html(), encoding='utf-8')
    print('wrote', d / 'index.html')


if __name__ == '__main__':
    main()
