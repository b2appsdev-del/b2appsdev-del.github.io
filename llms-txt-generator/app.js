import {
  AI_BOTS,
  DISCLAIMER_TEXT,
  SITE_PRESETS,
  calculateGeoScore,
  escapeHtml,
  generateLlmsFullTxt,
  generateLlmsTxt,
  generateRobotsTxt,
  normalizeConfig,
  resolveBotPolicies,
} from './generator.js';

let activeTab = 'llms-txt';
let customBotPolicies = resolveBotPolicies('search-only');

const fieldIds = [
  'siteName',
  'siteType',
  'baseUrl',
  'contactEmail',
  'tagline',
  'coreOverview',
  'docsLinks',
  'apiLinks',
  'optionalLinks',
  'disallowPaths',
  'sitemapUrl',
  'botMode',
  'crawlDelay',
  'includeCitationRule',
];

function formatLinksToTextarea(items = []) {
  return items.map((i) => `${i.title} | ${i.path} | ${i.desc}`).join('\n');
}

function renderBotControls() {
  const container = document.getElementById('bot-grid');
  const mode = document.getElementById('botMode').value;
  const effective = resolveBotPolicies(mode, customBotPolicies);

  container.innerHTML = AI_BOTS.map((bot) => {
    const val = effective[bot.id];
    return `
      <div class="bot-item">
        <div class="bot-item-top">
          <span class="bot-name">${escapeHtml(bot.agent)}</span>
          <span class="bot-tag ${bot.category}">${escapeHtml(bot.category)}</span>
        </div>
        <span class="bot-desc">${escapeHtml(bot.vendor)} — ${escapeHtml(bot.purpose)}</span>
        <select class="bot-select" data-bot-id="${escapeHtml(bot.id)}" aria-label="${escapeHtml(bot.agent)} policy">
          <option value="allow" ${val === 'allow' ? 'selected' : ''}>Allow (/llms.txt &amp; public docs)</option>
          <option value="disallow" ${val === 'disallow' ? 'selected' : ''}>Disallow (Block crawler)</option>
        </select>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.bot-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const botId = e.target.dataset.botId;
      customBotPolicies[botId] = e.target.value;
      document.getElementById('botMode').value = 'custom';
      updateAll();
    });
  });
}

function readConfig() {
  const mode = document.getElementById('botMode').value;
  return {
    siteName: document.getElementById('siteName').value,
    siteType: document.getElementById('siteType').value,
    baseUrl: document.getElementById('baseUrl').value,
    contactEmail: document.getElementById('contactEmail').value,
    tagline: document.getElementById('tagline').value,
    coreOverview: document.getElementById('coreOverview').value,
    docsLinks: document.getElementById('docsLinks').value,
    apiLinks: document.getElementById('apiLinks').value,
    optionalLinks: document.getElementById('optionalLinks').value,
    disallowPaths: document.getElementById('disallowPaths').value,
    sitemapUrl: document.getElementById('sitemapUrl').value,
    botMode: mode,
    botPolicies: customBotPolicies,
    crawlDelay: document.getElementById('crawlDelay').value,
    includeCitationRule: document.getElementById('includeCitationRule').checked,
  };
}

function renderGeoCard(rawCfg) {
  const cfg = normalizeConfig(rawCfg);
  const geo = calculateGeoScore(cfg);

  document.getElementById('geo-score-value').textContent = String(geo.score);
  document.getElementById('geo-progress-fill').style.width = `${geo.score}%`;
  document.getElementById('geo-grade-label').textContent = geo.grade;

  const allowedCount = Object.values(cfg.botPolicies).filter((v) => v === 'allow').length;
  const blockedCount = AI_BOTS.length - allowedCount;
  document.getElementById('bot-summary-label').textContent = `${allowedCount} AI Bots Allowed • ${blockedCount} Blocked`;

  const listEl = document.getElementById('geo-checklist');
  listEl.innerHTML = geo.checks
    .map(
      (c) => `
      <li class="geo-check-item ${c.passed ? 'passed' : 'warn'}">
        <span>${c.passed ? '✅' : '⚠️'}</span>
        <div>
          <strong>${c.points}/${c.max} pts:</strong> ${escapeHtml(c.label)}
        </div>
      </li>
    `
    )
    .join('');
}

function getActiveText(rawCfg) {
  if (activeTab === 'llms-full') return generateLlmsFullTxt(rawCfg);
  if (activeTab === 'robots-txt') return generateRobotsTxt(rawCfg);
  return generateLlmsTxt(rawCfg);
}

function renderOutput(rawCfg) {
  const panel = document.getElementById('output-panel');
  const cfg = normalizeConfig(rawCfg);

  if (activeTab === 'rendered-preview') {
    const docItems = cfg.docsLinks
      .map(
        (d) =>
          `<li><a href="${escapeHtml(cfg.baseUrl + d.path)}" target="_blank" rel="noopener noreferrer">${escapeHtml(d.title)}</a>: ${escapeHtml(d.desc)}</li>`
      )
      .join('');
    const apiItems = cfg.apiLinks
      .map(
        (a) =>
          `<li><a href="${escapeHtml(cfg.baseUrl + a.path)}" target="_blank" rel="noopener noreferrer">${escapeHtml(a.title)}</a>: ${escapeHtml(a.desc)}</li>`
      )
      .join('');
    panel.innerHTML = `
      <div class="rendered-preview">
        <h3># ${escapeHtml(cfg.siteName)}</h3>
        <blockquote>&gt; ${escapeHtml(cfg.tagline)}</blockquote>
        <p>${escapeHtml(cfg.coreOverview)}</p>
        <h4>## Documentation &amp; Core Guides</h4>
        <ul>${docItems}</ul>
        <h4>## API &amp; Structured Feeds</h4>
        <ul>${apiItems}</ul>
      </div>
    `;
    return;
  }

  const pre = document.createElement('pre');
  pre.className = 'code-output';
  pre.textContent = getActiveText(cfg);
  panel.innerHTML = '';
  panel.appendChild(pre);
}

function applyPreset(presetKey) {
  const preset = SITE_PRESETS[presetKey] || SITE_PRESETS.saas;
  document.getElementById('siteName').value = preset.siteName;
  document.getElementById('siteType').value = preset.siteType;
  document.getElementById('baseUrl').value = preset.baseUrl;
  document.getElementById('contactEmail').value = preset.contactEmail;
  document.getElementById('tagline').value = preset.tagline;
  document.getElementById('coreOverview').value = preset.coreOverview;
  document.getElementById('docsLinks').value = formatLinksToTextarea(preset.docsLinks);
  document.getElementById('apiLinks').value = formatLinksToTextarea(preset.apiLinks);
  document.getElementById('optionalLinks').value = formatLinksToTextarea(preset.optionalLinks);
  document.getElementById('disallowPaths').value = preset.disallowPaths.join(', ');
  document.getElementById('sitemapUrl').value = `${preset.baseUrl}/sitemap.xml`;

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === presetKey);
  });

  updateAll();
}

function setActiveTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  renderOutput(readConfig());
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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
  const mode = document.getElementById('botMode').value;
  if (mode !== 'custom') {
    customBotPolicies = resolveBotPolicies(mode);
  }
  renderBotControls();
  const cfg = readConfig();
  renderGeoCard(cfg);
  renderOutput(cfg);
}

document.getElementById('disclaimer-box').innerHTML =
  `<strong>Disclaimer:</strong> ${escapeHtml(DISCLAIMER_TEXT)}`;

fieldIds.forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener('input', updateAll);
  el.addEventListener('change', updateAll);
});

document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
});

document.getElementById('copy-btn').addEventListener('click', async () => {
  const btn = document.getElementById('copy-btn');
  const text = getActiveText(readConfig());
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = 'Copy Active File';
    }, 1500);
  } catch {
    btn.textContent = 'Copy failed (select manually)';
  }
});

document.getElementById('download-llms-btn').addEventListener('click', () => {
  downloadFile('llms.txt', generateLlmsTxt(readConfig()));
});

document.getElementById('download-full-btn').addEventListener('click', () => {
  downloadFile('llms-full.txt', generateLlmsFullTxt(readConfig()));
});

document.getElementById('download-robots-btn').addEventListener('click', () => {
  downloadFile('robots.txt', generateRobotsTxt(readConfig()));
});

updateAll();
