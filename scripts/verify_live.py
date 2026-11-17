#!/usr/bin/env python3
"""Verify the deployed GitHub Pages URLs return 200 and contain expected markers."""
import re
import urllib.request
import urllib.error

BASE = "https://b2appsdev-del.github.io"
PAGES = [
    "eu261-claim-documents", "metals-dealer-comparison", "wcag-22-audit",
    "whop-listing-checklist", "checkout-qa", "agent-toolcall-security-eval",
]

def check(url, need=()):
    code, body = "ERR", ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PersonalOps-Verify/1.0"})
        with urllib.request.urlopen(req, timeout=12) as r:
            code = r.status
            body = r.read(200000).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        code = e.code
    except Exception as e:
        code = "ERR " + type(e).__name__
    ok = code == 200 and all(x in body for x in need)
    return code, ok, len(body)

print("== root + control files ==")
for path in ["/", "/sitemap.xml", "/llms.txt"]:
    code, ok, n = check(BASE + path)
    print(f"{code} {'OK ' if ok else 'FAIL'} {BASE+path} ({n}b)")

print("== mobile start hub ==")
sc, sok, sn = check(BASE + "/start/", need=("Free samples", "Self-service kits", "LAUNCH20"))
print(f"{sc} {'OK ' if sok else 'FAIL'} {BASE}/start/ ({sn}b)")

print("== landing pages ==")
allok = True
allok = allok and sok
for slug in PAGES:
    code, ok, n = check(BASE + "/" + slug + "/", need=("LAUNCH20", "Disclaimer", "application/ld+json"))
    allok = allok and ok
    # sample
    sample = {
        "eu261-claim-documents": "eu261-sample.md",
        "metals-dealer-comparison": "dealer-sample.md",
        "wcag-22-audit": "wcag-sample.md",
        "whop-listing-checklist": "launch-sample.md",
        "checkout-qa": "checkout-sample.md",
        "agent-toolcall-security-eval": "agent-eval-sample.md",
    }[slug]
    sc, sok, sn = check(BASE + "/" + slug + "/" + sample)
    allok = allok and sok
    print(f"page {code} {'OK ' if ok else 'FAIL'} /{slug}/ | sample {sc} {'OK' if sok else 'FAIL'}")
    print(f"  sitemap listed: {slug in urllib.request.urlopen(BASE+'/sitemap.xml').read().decode('utf-8','replace')}")

print("ALL_OK" if allok else "SOME_FAILED")
