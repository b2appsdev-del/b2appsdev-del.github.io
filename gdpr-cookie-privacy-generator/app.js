import {
  DISCLAIMER_TEXT,
  generateCookieBannerSnippet,
  generatePrivacyPolicyHtml,
  generatePrivacyPolicyMarkdown,
  THEMES,
  escapeHtml,
  normalizeConfig,
} from './generator.js';

const fieldIds = [
  'companyName',
  'domain',
  'contactEmail',
  'siteType',
  'country',
  'theme',
  'position',
  'accentColor',
  'retentionMonths',
  'privacyPolicyUrl',
  'effectiveDate',
  'analytics',
  'analyticsProvider',
  'marketing',
  'marketingProvider',
];

let activeTab = 'snippet';

function readConfig() {
  return {
    companyName: document.getElementById('companyName').value,
    domain: document.getElementById('domain').value,
    contactEmail: document.getElementById('contactEmail').value,
    siteType: document.getElementById('siteType').value,
    country: document.getElementById('country').value,
    theme: document.getElementById('theme').value,
    position: document.getElementById('position').value,
    accentColor: document.getElementById('accentColor').value,
    retentionMonths: document.getElementById('retentionMonths').value,
    privacyPolicyUrl: document.getElementById('privacyPolicyUrl').value,
    effectiveDate: document.getElementById('effectiveDate').value,
    analytics: document.getElementById('analytics').checked,
    analyticsProvider: document.getElementById('analyticsProvider').value,
    marketing: document.getElementById('marketing').checked,
    marketingProvider: document.getElementById('marketingProvider').value,
  };
}

function renderLivePreview(rawCfg) {
  const cfg = normalizeConfig(rawCfg);
  const t = THEMES[cfg.theme];
  const accent = cfg.accentColor;
  const container = document.getElementById('preview-container');
  const statusEl = document.getElementById('preview-status');

  const analyticsToggle = cfg.analytics
    ? `<label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;"><input type="checkbox" id="pv-analytics" checked /> <span><strong>Analytics</strong> (${escapeHtml(cfg.analyticsProvider.toUpperCase())})</span></label>`
    : '';
  const marketingToggle = cfg.marketing
    ? `<label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;"><input type="checkbox" id="pv-marketing" /> <span><strong>Marketing</strong> (${escapeHtml(cfg.marketingProvider)})</span></label>`
    : '';

  container.innerHTML = `
    <div id="pv-banner" style="background:${t.bg};color:${t.text};border:1px solid ${t.border};border-radius:12px;padding:18px 20px;box-shadow:${t.shadow};max-width:${cfg.position === 'floating-right' ? '420px' : '100%'};margin:${cfg.position === 'floating-right' ? '0 0 0 auto' : '0'};">
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;">${escapeHtml(cfg.companyName)} uses cookies</div>
      <p style="margin:0 0 12px;color:${t.muted};font-size:13px;">
        We use essential cookies to keep ${escapeHtml(cfg.domain)} working${cfg.analytics || cfg.marketing ? ' and optional cookies (with your consent) for analytics and marketing' : ''}.
        Read our <a href="#policy" id="pv-policy-link" style="color:${accent};text-decoration:underline;">Privacy Policy</a>.
      </p>
      <div id="pv-prefs" style="display:none;flex-direction:column;gap:8px;border-top:1px solid ${t.border};padding-top:10px;margin:10px 0 12px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;"><input type="checkbox" checked disabled /> <span><strong>Essential</strong> (Always active)</span></label>
        ${analyticsToggle}
        ${marketingToggle}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <button type="button" id="pv-accept" style="border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${accent};background:${accent};color:#fff;">Accept All</button>
        <button type="button" id="pv-reject" style="border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${t.border};background:${t.btnSecondaryBg};color:${t.btnSecondaryText};">Reject Non-Essential</button>
        ${cfg.analytics || cfg.marketing ? `<button type="button" id="pv-manage" style="border-radius:8px;padding:8px 6px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:${t.muted};text-decoration:underline;">Preferences</button>` : ''}
        <button type="button" id="pv-save" style="display:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${t.border};background:${t.btnSecondaryBg};color:${t.btnSecondaryText};">Save Preferences</button>
      </div>
    </div>
  `;

  statusEl.textContent = 'Awaiting choice';

  const setStatus = (a, m) => {
    statusEl.textContent = `Saved: Essential=ON, Analytics=${a ? 'ON' : 'OFF'}, Marketing=${m ? 'ON' : 'OFF'}`;
  };

  document.getElementById('pv-accept').onclick = () => setStatus(cfg.analytics, cfg.marketing);
  document.getElementById('pv-reject').onclick = () => setStatus(false, false);

  const manageBtn = document.getElementById('pv-manage');
  const saveBtn = document.getElementById('pv-save');
  const prefsEl = document.getElementById('pv-prefs');
  if (manageBtn && saveBtn && prefsEl) {
    manageBtn.onclick = () => {
      const open = prefsEl.style.display === 'flex';
      prefsEl.style.display = open ? 'none' : 'flex';
      saveBtn.style.display = open ? 'none' : 'inline-block';
    };
    saveBtn.onclick = () => {
      const aEl = document.getElementById('pv-analytics');
      const mEl = document.getElementById('pv-marketing');
      setStatus(aEl ? aEl.checked : false, mEl ? mEl.checked : false);
    };
  }

  document.getElementById('pv-policy-link').onclick = (e) => {
    e.preventDefault();
    setActiveTab('policy-preview');
  };
}

function getActiveText(rawCfg) {
  if (activeTab === 'snippet') return generateCookieBannerSnippet(rawCfg);
  if (activeTab === 'policy-html') return generatePrivacyPolicyHtml(rawCfg);
  if (activeTab === 'policy-md') return generatePrivacyPolicyMarkdown(rawCfg);
  return generatePrivacyPolicyHtml(rawCfg);
}

function renderOutput(rawCfg) {
  const panel = document.getElementById('output-panel');
  if (activeTab === 'policy-preview') {
    const html = generatePrivacyPolicyHtml(rawCfg);
    const match = html.match(/<main>([\s\S]*?)<\/main>/i);
    panel.innerHTML = `<div class="policy-rendered">${match ? match[1] : ''}</div>`;
  } else {
    const pre = document.createElement('pre');
    pre.className = 'code-output';
    pre.textContent = getActiveText(rawCfg);
    panel.innerHTML = '';
    panel.appendChild(pre);
  }
}

function setActiveTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  renderOutput(readConfig());
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function updateAll() {
  const cfg = readConfig();
  document.getElementById('analyticsProvider').disabled = !cfg.analytics;
  document.getElementById('marketingProvider').disabled = !cfg.marketing;
  renderLivePreview(cfg);
  renderOutput(cfg);
}

document.getElementById('disclaimer-box').innerHTML =
  `<strong>Educational &amp; Template Tool Only:</strong> ${escapeHtml(DISCLAIMER_TEXT)}`;

fieldIds.forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener('input', updateAll);
  el.addEventListener('change', updateAll);
});

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
});

document.getElementById('reset-preview-btn').addEventListener('click', () => {
  renderLivePreview(readConfig());
});

document.getElementById('copy-btn').addEventListener('click', async () => {
  const btn = document.getElementById('copy-btn');
  const text = getActiveText(readConfig());
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = 'Copy Active Output';
    }, 1500);
  } catch {
    btn.textContent = 'Copy failed (select manually)';
  }
});

document.getElementById('download-html-btn').addEventListener('click', () => {
  downloadFile('privacy-policy.html', generatePrivacyPolicyHtml(readConfig()), 'text/html;charset=utf-8');
});

document.getElementById('download-md-btn').addEventListener('click', () => {
  downloadFile('privacy-policy.md', generatePrivacyPolicyMarkdown(readConfig()), 'text/markdown;charset=utf-8');
});

updateAll();
