/**
 * Pure GDPR Cookie Banner & Privacy Policy Generator logic.
 * Zero external dependencies — works in both Node.js (tests) and Browser.
 */

export const DISCLAIMER_TEXT =
  'Educational & template generation tool only; not legal advice. Laws and enforcement vary by EU/EEA member state—have a qualified privacy professional review your final policy and consent setup before publishing.';

export const THEMES = {
  dark: {
    id: 'dark',
    label: 'Dark',
    bg: '#0f172a',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#334155',
    btnSecondaryBg: '#1e293b',
    btnSecondaryText: '#e2e8f0',
    shadow: '0 16px 40px rgba(2, 6, 23, 0.45)',
  },
  light: {
    id: 'light',
    label: 'Light',
    bg: '#ffffff',
    text: '#0f172a',
    muted: '#475569',
    border: '#cbd5e1',
    btnSecondaryBg: '#f1f5f9',
    btnSecondaryText: '#0f172a',
    shadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    bg: '#fafafa',
    text: '#18181b',
    muted: '#52525b',
    border: '#e4e4e7',
    btnSecondaryBg: 'transparent',
    btnSecondaryText: '#18181b',
    shadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
  },
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHexColor(color, fallback = '#2563eb') {
  const raw = String(color ?? '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

export function sanitizeDomain(domain) {
  const raw = String(domain ?? '').trim();
  if (!raw) return 'example.eu';
  return raw
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function normalizeConfig(input = {}) {
  const themeKey = THEMES[input.theme] ? input.theme : 'dark';
  const siteType = ['website', 'saas', 'shopify'].includes(input.siteType)
    ? input.siteType
    : 'website';
  const position = ['bottom', 'top', 'floating-right'].includes(input.position)
    ? input.position
    : 'bottom';
  const analyticsProvider = ['none', 'ga4', 'plausible', 'matomo'].includes(
    input.analyticsProvider
  )
    ? input.analyticsProvider
    : input.analytics
    ? 'ga4'
    : 'none';

  const analyticsEnabled =
    typeof input.analytics === 'boolean'
      ? input.analytics
      : analyticsProvider !== 'none';

  const marketingEnabled = Boolean(input.marketing);
  const retentionMonths = Math.max(
    1,
    Math.min(120, Number.parseInt(input.retentionMonths, 10) || 24)
  );

  return {
    companyName: String(input.companyName ?? '').trim() || 'Acme Digital GmbH',
    domain: sanitizeDomain(input.domain),
    contactEmail: String(input.contactEmail ?? '').trim() || 'privacy@example.eu',
    country: String(input.country ?? '').trim() || 'Germany (EU)',
    siteType,
    theme: themeKey,
    position,
    accentColor: sanitizeHexColor(input.accentColor, '#2563eb'),
    analytics: analyticsEnabled,
    analyticsProvider: analyticsEnabled ? (analyticsProvider === 'none' ? 'ga4' : analyticsProvider) : 'none',
    marketing: marketingEnabled,
    marketingProvider: marketingEnabled
      ? String(input.marketingProvider ?? '').trim() || 'Meta Pixel & Google Ads'
      : 'None',
    privacyPolicyUrl: String(input.privacyPolicyUrl ?? '').trim() || '/privacy-policy.html',
    retentionMonths,
    effectiveDate: String(input.effectiveDate ?? '').trim() || '2026-11-15',
  };
}

/**
 * Safely serialize JS string for embedding inside <script> tags.
 * Escapes '<' as '\\u003c' so '</script>' cannot break out of script tags.
 */
export function safeJsonForScript(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function generateCookieBannerSnippet(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);
  const t = THEMES[cfg.theme];
  const accent = cfg.accentColor;

  const posCss =
    cfg.position === 'top'
      ? 'top:16px;left:16px;right:16px;max-width:960px;margin:0 auto;'
      : cfg.position === 'floating-right'
      ? 'bottom:20px;right:20px;left:auto;max-width:420px;'
      : 'bottom:16px;left:16px;right:16px;max-width:960px;margin:0 auto;';

  const scriptPayload = safeJsonForScript({
    company: cfg.companyName,
    analytics: cfg.analytics,
    marketing: cfg.marketing,
    storageKey: 'b2_gdpr_consent_v1',
  });

  const analyticsCheckbox = cfg.analytics
    ? `<label class="b2cb-toggle"><input type="checkbox" id="b2cb-opt-analytics" checked /> <span><strong>Analytics</strong> (${escapeHtml(cfg.analyticsProvider.toUpperCase())}) — helps us understand traffic &amp; improve performance.</span></label>`
    : '';

  const marketingCheckbox = cfg.marketing
    ? `<label class="b2cb-toggle"><input type="checkbox" id="b2cb-opt-marketing" /> <span><strong>Marketing</strong> (${escapeHtml(cfg.marketingProvider)}) — used for campaign attribution &amp; relevant offers.</span></label>`
    : '';

  const safePolicyHref = escapeHtml(
    /^(\/|https?:\/\/)/i.test(cfg.privacyPolicyUrl) ? cfg.privacyPolicyUrl : '/privacy-policy.html'
  );

  return `<!-- GDPR Cookie Banner by B2 Apps (Zero Dependencies) -->
<style>
  #b2-cookie-banner{position:fixed;${posCss}z-index:99999;background:${t.bg};color:${t.text};border:1px solid ${t.border};border-radius:12px;padding:18px 20px;box-shadow:${t.shadow};font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.5;display:none}
  #b2-cookie-banner.b2cb-open{display:block}
  .b2cb-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px}
  .b2cb-title{font-weight:700;font-size:15px;margin:0}
  .b2cb-desc{margin:0 0 12px;color:${t.muted};font-size:13px}
  .b2cb-desc a{color:${accent};text-decoration:underline}
  .b2cb-prefs{display:none;border-top:1px solid ${t.border};padding-top:10px;margin:10px 0 12px;gap:8px;flex-direction:column}
  .b2cb-prefs.b2cb-show{display:flex}
  .b2cb-toggle{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:${t.text};cursor:pointer}
  .b2cb-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .b2cb-btn{border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${t.border};background:${t.btnSecondaryBg};color:${t.btnSecondaryText}}
  .b2cb-btn-primary{background:${accent};border-color:${accent};color:#ffffff}
  .b2cb-btn-link{background:transparent;border-color:transparent;color:${t.muted};padding:8px 6px;text-decoration:underline}
</style>
<div id="b2-cookie-banner" role="dialog" aria-modal="true" aria-label="Cookie consent">
  <div class="b2cb-head">
    <p class="b2cb-title">${escapeHtml(cfg.companyName)} uses cookies</p>
  </div>
  <p class="b2cb-desc">
    We use essential cookies to keep ${escapeHtml(cfg.domain)} working${cfg.analytics || cfg.marketing ? ' and optional cookies (with your consent) for analytics and marketing' : ''}.
    Read our <a href="${safePolicyHref}">Privacy Policy</a>.
  </p>
  <div id="b2cb-prefs" class="b2cb-prefs">
    <label class="b2cb-toggle"><input type="checkbox" checked disabled /> <span><strong>Essential</strong> — always active for security, session &amp; cart functionality.</span></label>
    ${analyticsCheckbox}
    ${marketingCheckbox}
  </div>
  <div class="b2cb-actions">
    <button type="button" id="b2cb-accept" class="b2cb-btn b2cb-btn-primary">Accept All</button>
    <button type="button" id="b2cb-reject" class="b2cb-btn">Reject Non-Essential</button>
    ${cfg.analytics || cfg.marketing ? '<button type="button" id="b2cb-manage" class="b2cb-btn b2cb-btn-link">Preferences</button>' : ''}
    <button type="button" id="b2cb-save" class="b2cb-btn" style="display:none">Save Preferences</button>
  </div>
</div>
<script>
(function(){
  var cfg = ${scriptPayload};
  var banner = document.getElementById('b2-cookie-banner');
  if (!banner) return;
  function getConsent(){
    try { return JSON.parse(localStorage.getItem(cfg.storageKey) || 'null'); } catch(e){ return null; }
  }
  function saveConsent(consent){
    var payload = { essential: true, analytics: !!consent.analytics, marketing: !!consent.marketing, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(cfg.storageKey, JSON.stringify(payload)); } catch(e){}
    banner.classList.remove('b2cb-open');
    window.dispatchEvent(new CustomEvent('gdprConsentUpdated', { detail: payload }));
  }
  if (!getConsent()) banner.classList.add('b2cb-open');
  document.getElementById('b2cb-accept').onclick = function(){ saveConsent({ analytics: cfg.analytics, marketing: cfg.marketing }); };
  document.getElementById('b2cb-reject').onclick = function(){ saveConsent({ analytics: false, marketing: false }); };
  var manageBtn = document.getElementById('b2cb-manage');
  var saveBtn = document.getElementById('b2cb-save');
  var prefs = document.getElementById('b2cb-prefs');
  if (manageBtn && prefs && saveBtn) {
    manageBtn.onclick = function(){ prefs.classList.toggle('b2cb-show'); saveBtn.style.display = prefs.classList.contains('b2cb-show') ? 'inline-block' : 'none'; };
    saveBtn.onclick = function(){
      var a = document.getElementById('b2cb-opt-analytics');
      var m = document.getElementById('b2cb-opt-marketing');
      saveConsent({ analytics: a ? a.checked : false, marketing: m ? m.checked : false });
    };
  }
})();
<\/script>`;
}

export function generatePrivacyPolicyMarkdown(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);

  const siteTypeLabel =
    cfg.siteType === 'shopify'
      ? 'Shopify e-commerce store'
      : cfg.siteType === 'saas'
      ? 'SaaS web application'
      : 'website';

  const processors = [];
  if (cfg.siteType === 'shopify') {
    processors.push('- **Shopify Inc.** — E-commerce storefront hosting, checkout, and order processing.');
  }
  if (cfg.analytics) {
    const label =
      cfg.analyticsProvider === 'ga4'
        ? 'Google Analytics 4 (Google Ireland Ltd.) — aggregated traffic and usage measurement (activated only after consent).'
        : cfg.analyticsProvider === 'plausible'
        ? 'Plausible Analytics — privacy-friendly EU-hosted traffic measurement.'
        : 'Matomo Analytics — first-party / EU-hosted web analytics.';
    processors.push(`- **${label}**`);
  }
  if (cfg.marketing) {
    processors.push(`- **${cfg.marketingProvider}** — Advertising attribution and remarketing (activated only after explicit cookie consent).`);
  }
  if (processors.length === 0) {
    processors.push('- **Hosting Infrastructure Only** — Essential server and CDN logs required to deliver the service securely.');
  }

  const dataCategories = [
    '- **Technical & Log Data:** IP address (truncated/minimized where supported), browser type, device OS, and request timestamps for security and uptime.',
    '- **Contact & Support Data:** Email address and message contents when you contact us.',
  ];
  if (cfg.siteType === 'saas') {
    dataCategories.push('- **Account & Billing Data:** Name, email, subscription tier, and billing metadata processed to deliver your SaaS account.');
  }
  if (cfg.siteType === 'shopify') {
    dataCategories.push('- **Order & Fulfillment Data:** Shipping address, billing details, purchased items, and order history required to fulfill purchases.');
  }
  if (cfg.analytics) {
    dataCategories.push('- **Analytics Data (Consent-Based):** Page views, session duration, and referral source.');
  }
  if (cfg.marketing) {
    dataCategories.push('- **Marketing & Attribution Data (Consent-Based):** Ad click identifiers and conversion events.');
  }

  const cookieLines = [
    '- **Essential Cookies:** Strictly necessary for security, CSRF protection, consent preferences, and core navigation (GDPR Art. 6(1)(f) / Art. 6(1)(b)).',
  ];
  if (cfg.analytics) {
    cookieLines.push(`- **Analytics Cookies (${cfg.analyticsProvider.toUpperCase()}):** Loaded only after you click "Accept All" or enable Analytics in Preferences (GDPR Art. 6(1)(a)).`);
  }
  if (cfg.marketing) {
    cookieLines.push(`- **Marketing Cookies (${cfg.marketingProvider}):** Loaded only after explicit opt-in consent (GDPR Art. 6(1)(a)).`);
  }

  return `# Privacy Policy — ${cfg.companyName}

**Effective Date:** ${cfg.effectiveDate}  
**Domain:** ${cfg.domain}  
**Jurisdiction:** ${cfg.country}

> **Disclaimer:** ${DISCLAIMER_TEXT}

## 1. Data Controller
This Privacy Policy explains how **${cfg.companyName}** ("we", "us", "our") processes personal data when you use our ${siteTypeLabel} at **${cfg.domain}**.

- **Controller:** ${cfg.companyName}
- **Privacy Contact:** ${cfg.contactEmail}
- **Location:** ${cfg.country}

## 2. Personal Data We Collect
${dataCategories.join('\n')}

## 3. Legal Bases for Processing (GDPR Art. 6)
- **Contract Performance (Art. 6(1)(b)):** Providing our ${siteTypeLabel}, processing orders/subscriptions, and responding to support requests.
- **Consent (Art. 6(1)(a)):** Optional analytics or marketing cookies and promotional communications. You may withdraw consent at any time.
- **Legitimate Interests (Art. 6(1)(f)):** Fraud prevention, network security, and essential service reliability.
- **Legal Obligation (Art. 6(1)(c)):** Tax, accounting, and statutory recordkeeping requirements.

## 4. Cookies & Consent Management
${cookieLines.join('\n')}

You can update or withdraw your cookie preferences at any time by clearing your browser's local storage or reopening the cookie preferences banner.

## 5. Third-Party Processors & International Transfers
We share data only with vetted processors necessary to operate **${cfg.domain}**:
${processors.join('\n')}

Where data is transferred outside the EEA, we rely on EU Standard Contractual Clauses (SCCs) or an applicable adequacy decision (such as the EU-U.S. Data Privacy Framework).

## 6. Data Retention
We retain personal data only as long as necessary for the purposes described above—generally up to **${cfg.retentionMonths} months** for operational/analytics records, unless a longer statutory retention period (e.g., tax/invoice laws) applies.

## 7. Your Rights Under the GDPR
If you are located in the EEA/UK, you have the right to:
- **Access** your personal data (Art. 15)
- **Rectify** inaccurate data (Art. 16)
- **Erase** your data ("right to be forgotten", Art. 17)
- **Restrict** or **Object** to processing (Art. 18 & Art. 21)
- **Data Portability** in a machine-readable format (Art. 20)
- **Lodge a Complaint** with your local EU Data Protection Supervisory Authority

To exercise any right, email **${cfg.contactEmail}**.

## 8. Policy Updates
We may update this Privacy Policy from time to time. Material changes will be reflected by updating the Effective Date above.
`;
}

export function generatePrivacyPolicyHtml(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);
  const md = generatePrivacyPolicyMarkdown(cfg);

  // Convert structured markdown sections into clean standalone semantic HTML
  const lines = md.split('\n');
  const bodyParts = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      bodyParts.push('</ul>');
      inList = false;
    }
  };

  const formatInline = (str) =>
    escapeHtml(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      bodyParts.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      closeList();
      bodyParts.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('> ')) {
      closeList();
      bodyParts.push(`<blockquote class="disclaimer">${formatInline(line.slice(2))}</blockquote>`);
    } else if (line.startsWith('- ')) {
      if (!inList) {
        bodyParts.push('<ul>');
        inList = true;
      }
      bodyParts.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else {
      closeList();
      bodyParts.push(`<p>${formatInline(line)}</p>`);
    }
  }
  closeList();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy — ${escapeHtml(cfg.companyName)}</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.65;color:#0f172a;background:#f8fafc;margin:0;padding:32px 16px}
    main{max-width:780px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px 36px;box-shadow:0 4px 20px rgba(15,23,42,0.05)}
    h1{font-size:1.75rem;margin-top:0;color:#0f172a}
    h2{font-size:1.15rem;margin-top:1.75rem;border-bottom:1px solid #e2e8f0;padding-bottom:6px;color:#1e293b}
    ul{padding-left:20px}
    li{margin-bottom:6px}
    .disclaimer{margin:16px 0;padding:12px 16px;background:#fef3c7;border-left:4px solid #d97706;border-radius:6px;color:#78350f;font-size:0.92rem}
  </style>
</head>
<body>
  <main>
    ${bodyParts.join('\n    ')}
  </main>
</body>
</html>`;
}
