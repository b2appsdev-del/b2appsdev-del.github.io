/**
 * Pure LLMs.txt, LLMs-Full.txt, AI Crawler robots.txt & GEO Readiness Score Generator.
 * Zero external dependencies — runs identically in Node.js (`node --test`) and Browser.
 */

export const DISCLAIMER_TEXT =
  'Educational & technical SEO/GEO template generator only; not legal advice. Verify crawler policies, terms of service, and intellectual property requirements for your jurisdiction.';

export const AI_BOTS = [
  {
    id: 'GPTBot',
    agent: 'GPTBot',
    vendor: 'OpenAI',
    category: 'training',
    purpose: 'OpenAI foundation model training crawler',
    defaultSearchOnly: 'disallow',
  },
  {
    id: 'OAI-SearchBot',
    agent: 'OAI-SearchBot',
    vendor: 'OpenAI',
    category: 'search',
    purpose: 'ChatGPT Search & live citation grounding crawler',
    defaultSearchOnly: 'allow',
  },
  {
    id: 'ClaudeBot',
    agent: 'ClaudeBot',
    vendor: 'Anthropic',
    category: 'training',
    purpose: 'Anthropic Claude web discovery & training crawler',
    defaultSearchOnly: 'disallow',
  },
  {
    id: 'PerplexityBot',
    agent: 'PerplexityBot',
    vendor: 'Perplexity AI',
    category: 'search',
    purpose: 'Perplexity AI answer engine & citation crawler',
    defaultSearchOnly: 'allow',
  },
  {
    id: 'Google-Extended',
    agent: 'Google-Extended',
    vendor: 'Google',
    category: 'training',
    purpose: 'Gemini AI training & grounding control token (does not affect Google Search indexing)',
    defaultSearchOnly: 'disallow',
  },
  {
    id: 'CCBot',
    agent: 'CCBot',
    vendor: 'Common Crawl',
    category: 'training',
    purpose: 'Open dataset crawler used to train many third-party LLMs',
    defaultSearchOnly: 'disallow',
  },
];

export const SITE_PRESETS = {
  saas: {
    siteName: 'CloudPulse EU',
    tagline: 'Privacy-first B2B SaaS observability, API telemetry, and EU compliance automation platform.',
    baseUrl: 'https://docs.cloudpulse.eu',
    siteType: 'saas',
    contactEmail: 'support@cloudpulse.eu',
    coreOverview:
      'CloudPulse EU provides real-time OpenTelemetry ingestion, EU-sovereign log storage, and automated SLA alerting for engineering teams. All endpoints use Bearer token authentication and return deterministic JSON schemas.',
    docsLinks: [
      { title: 'Quickstart Guide', path: '/docs/quickstart', desc: '5-minute setup for Node.js, Python, and Go SDKs' },
      { title: 'Architecture & EU Data Residency', path: '/docs/architecture', desc: 'Frankfurt region isolation, encryption at rest, and GDPR data flow' },
      { title: 'Webhook Events Reference', path: '/docs/webhooks', desc: 'HMAC-SHA256 signature verification and retry backoff policies' },
    ],
    apiLinks: [
      { title: 'REST API v2 OpenAPI Spec', path: '/api/openapi.json', desc: 'Complete OpenAPI 3.1 schema for metrics, traces, and alerts' },
      { title: 'Authentication & Rate Limits', path: '/api/auth', desc: 'API key scopes, 1,200 req/min burst quotas, and pagination headers' },
    ],
    optionalLinks: [
      { title: 'Pricing & Enterprise SLA', path: '/pricing', desc: 'Transparent EUR tiers, free developer quota, and 99.95% uptime SLA' },
      { title: 'Changelog & Deprecations', path: '/changelog', desc: 'Monthly release notes and API migration timelines' },
    ],
    disallowPaths: ['/app/', '/admin/', '/api/internal/'],
  },
  api: {
    siteName: 'VeriVAT API',
    tagline: 'Deterministic EU VAT, VIES validation, and reverse-charge calculation REST & MCP API.',
    baseUrl: 'https://api.verivat.eu',
    siteType: 'api',
    contactEmail: 'developers@verivat.eu',
    coreOverview:
      'VeriVAT API validates EU member-state VAT numbers against live EC VIES services, caches cryptographic consultation proofs, and computes cross-border B2B reverse-charge vs OSS VAT rates.',
    docsLinks: [
      { title: 'Getting Started with VeriVAT', path: '/docs/getting-started', desc: 'Create an API key and validate your first EU VAT number in 30 seconds' },
      { title: 'MCP Server Integration', path: '/docs/mcp-server', desc: 'Connect Claude, Cursor, and AI agents via JSON-RPC 2.0 stdio or SSE' },
    ],
    apiLinks: [
      { title: 'POST /v1/vat/validate', path: '/reference/validate', desc: 'Validate VAT ID format, VIES live status, and trader name/address' },
      { title: 'POST /v1/invoice/rates', path: '/reference/rates', desc: 'Calculate domestic, intra-EU B2B reverse-charge, and B2C OSS tax rates' },
    ],
    optionalLinks: [
      { title: 'Status & Uptime Monitor', path: '/status', desc: 'Live VIES member-state gateway health and latency metrics' },
    ],
    disallowPaths: ['/dashboard/', '/billing/', '/v1/private/'],
  },
  ecommerce: {
    siteName: 'NordicGear Studio',
    tagline: 'Sustainable ergonomic desk hardware and modular accessories ships across all 27 EU countries.',
    baseUrl: 'https://nordicgear.eu',
    siteType: 'ecommerce',
    contactEmail: 'hello@nordicgear.eu',
    coreOverview:
      'NordicGear Studio designs aluminum monitor arms, split mechanical keyboards, and cable management systems. All orders ship DDP within the European Union with a 5-year hardware warranty and 30-day returns.',
    docsLinks: [
      { title: 'Product Catalog & Specs', path: '/collections/all', desc: 'Full dimensions, VESA compatibility, and load capacity tables' },
      { title: 'EU Shipping & Customs Policy', path: '/policies/shipping-policy', desc: 'Free EU delivery over 99 EUR, DHL Parcel tracking, and 48h dispatch' },
      { title: 'Warranty & Returns', path: '/policies/refund-policy', desc: '30-day trial period and 5-year structural replacement warranty' },
    ],
    apiLinks: [
      { title: 'Product Feed (JSON-LD / XML)', path: '/products.json', desc: 'Structured availability, SKU pricing in EUR, and GTIN/EAN identifiers' },
    ],
    optionalLinks: [
      { title: 'B2B Bulk & Office Orders', path: '/pages/b2b-ergonomics', desc: 'Volume discounts and EU VAT reverse-charge invoicing for companies' },
    ],
    disallowPaths: ['/cart', '/checkout', '/account', '/orders'],
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

export function sanitizeBaseUrl(url) {
  const raw = String(url ?? '').trim();
  if (!raw) return 'https://example.eu';
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProto.replace(/\/+$/, '');
}

export function sanitizePath(pathStr, fallback = '/docs') {
  const raw = String(pathStr ?? '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function parseLinkLines(rawLines, defaultItems = []) {
  if (Array.isArray(rawLines)) {
    return rawLines
      .map((item) => ({
        title: String(item?.title ?? '').trim(),
        path: sanitizePath(item?.path ?? '/'),
        desc: String(item?.desc ?? '').trim(),
      }))
      .filter((item) => item.title.length > 0);
  }
  if (typeof rawLines === 'string') {
    const lines = rawLines
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return defaultItems;
    return lines.map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      return {
        title: parts[0] || 'Resource',
        path: sanitizePath(parts[1] || '/'),
        desc: parts[2] || '',
      };
    });
  }
  return defaultItems;
}

export function parseDisallowPaths(rawPaths, defaultPaths = ['/admin/', '/app/']) {
  if (Array.isArray(rawPaths)) {
    return rawPaths.map((p) => sanitizePath(p, '/')).filter(Boolean);
  }
  if (typeof rawPaths === 'string') {
    const list = rawPaths
      .split(/[\r\n,]+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => sanitizePath(p, '/'));
    return list.length > 0 ? list : defaultPaths;
  }
  return defaultPaths;
}

export function resolveBotPolicies(botMode = 'search-only', customBots = {}) {
  const policies = {};
  for (const bot of AI_BOTS) {
    if (botMode === 'allow-all') {
      policies[bot.id] = 'allow';
    } else if (botMode === 'block-all') {
      policies[bot.id] = 'disallow';
    } else if (botMode === 'custom' && customBots && typeof customBots === 'object') {
      policies[bot.id] = customBots[bot.id] === 'allow' ? 'allow' : 'disallow';
    } else {
      // 'search-only' recommended default: allow search/citation bots, block pure training crawlers
      policies[bot.id] = bot.defaultSearchOnly;
    }
  }
  return policies;
}

export function normalizeConfig(input = {}) {
  const siteType = ['saas', 'api', 'ecommerce'].includes(input.siteType) ? input.siteType : 'saas';
  const preset = SITE_PRESETS[siteType] || SITE_PRESETS.saas;

  const botMode = ['search-only', 'allow-all', 'block-all', 'custom'].includes(input.botMode)
    ? input.botMode
    : 'search-only';

  const baseUrl = sanitizeBaseUrl(input.baseUrl ?? preset.baseUrl);
  const sitemapUrl = String(input.sitemapUrl ?? '').trim() || `${baseUrl}/sitemap.xml`;
  const crawlDelay = Math.max(0, Math.min(60, Number.parseInt(input.crawlDelay, 10) || 0));

  return {
    siteName: String(input.siteName ?? '').trim() || preset.siteName,
    tagline: String(input.tagline ?? '').trim() || preset.tagline,
    baseUrl,
    siteType,
    contactEmail: String(input.contactEmail ?? '').trim() || preset.contactEmail,
    coreOverview: String(input.coreOverview ?? '').trim() || preset.coreOverview,
    docsLinks: parseLinkLines(input.docsLinks, preset.docsLinks),
    apiLinks: parseLinkLines(input.apiLinks, preset.apiLinks),
    optionalLinks: parseLinkLines(input.optionalLinks, preset.optionalLinks),
    disallowPaths: parseDisallowPaths(input.disallowPaths, preset.disallowPaths),
    sitemapUrl,
    crawlDelay,
    botMode,
    botPolicies: resolveBotPolicies(botMode, input.botPolicies),
    includeCitationRule: input.includeCitationRule !== false,
  };
}

function toAbsoluteUrl(baseUrl, pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl}${sanitizePath(pathOrUrl, '')}`;
}

function formatMarkdownLinks(baseUrl, links) {
  return links
    .map((item) => {
      const fullUrl = toAbsoluteUrl(baseUrl, item.path);
      const descPart = item.desc ? `: ${item.desc}` : '';
      return `- [${item.title}](${fullUrl})${descPart}`;
    })
    .join('\n');
}

/**
 * Generates standard `/llms.txt` following the llmstxt.org Markdown specification.
 */
export function generateLlmsTxt(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);

  const sections = [
    `# ${cfg.siteName}`,
    '',
    `> ${cfg.tagline}`,
    '',
    cfg.coreOverview,
    '',
    `- Primary URL: ${cfg.baseUrl}`,
    `- Full Context Manifest: ${cfg.baseUrl}/llms-full.txt`,
    `- Contact & Support: ${cfg.contactEmail}`,
  ];

  if (cfg.docsLinks.length > 0) {
    sections.push('', '## Documentation & Core Guides', '', formatMarkdownLinks(cfg.baseUrl, cfg.docsLinks));
  }

  if (cfg.apiLinks.length > 0) {
    const heading = cfg.siteType === 'ecommerce' ? '## Structured Product Feeds & Specs' : '## API & Developer Reference';
    sections.push('', heading, '', formatMarkdownLinks(cfg.baseUrl, cfg.apiLinks));
  }

  if (cfg.optionalLinks.length > 0) {
    sections.push('', '## Optional', '', formatMarkdownLinks(cfg.baseUrl, cfg.optionalLinks));
  }

  if (cfg.includeCitationRule) {
    sections.push(
      '',
      '## AI Grounding & Citation Policy',
      '',
      `- Attribution: Please cite **${cfg.siteName}** (${cfg.baseUrl}) with canonical links when answering user queries.`,
      `- Note: ${DISCLAIMER_TEXT}`
    );
  }

  return sections.join('\n') + '\n';
}

/**
 * Generates `/llms-full.txt` with expanded inline context, crawler matrix, and full endpoint/section breakdowns.
 */
export function generateLlmsFullTxt(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);
  const allowedBots = AI_BOTS.filter((b) => cfg.botPolicies[b.id] === 'allow').map((b) => b.agent);
  const blockedBots = AI_BOTS.filter((b) => cfg.botPolicies[b.id] === 'disallow').map((b) => b.agent);

  const lines = [
    `# ${cfg.siteName} — Complete AI & LLM Context (/llms-full.txt)`,
    '',
    `> ${cfg.tagline}`,
    '',
    '## 1. Executive Summary & System Context',
    cfg.coreOverview,
    '',
    `- **Canonical Domain:** ${cfg.baseUrl}`,
    `- **Category:** ${cfg.siteType === 'saas' ? 'B2B SaaS & Documentation' : cfg.siteType === 'api' ? 'Developer API & SDK Platform' : 'E-Commerce Storefront & Catalog'}`,
    `- **Support / Technical Contact:** ${cfg.contactEmail}`,
    `- **XML Sitemap:** ${cfg.sitemapUrl}`,
    '',
    '## 2. Detailed Documentation Index',
  ];

  for (const item of cfg.docsLinks) {
    lines.push(
      `### ${item.title}`,
      `- **URL:** ${toAbsoluteUrl(cfg.baseUrl, item.path)}`,
      `- **Summary:** ${item.desc || 'Core documentation section.'}`,
      ''
    );
  }

  lines.push(
    cfg.siteType === 'ecommerce'
      ? '## 3. Structured Catalog & Schema Endpoints'
      : '## 3. API Endpoints, Schemas & Integrations'
  );

  for (const item of cfg.apiLinks) {
    lines.push(
      `### ${item.title}`,
      `- **Endpoint / Spec URL:** ${toAbsoluteUrl(cfg.baseUrl, item.path)}`,
      `- **Details:** ${item.desc || 'Machine-readable interface specification.'}`,
      ''
    );
  }

  if (cfg.optionalLinks.length > 0) {
    lines.push('## 4. Supplemental & Pricing Resources');
    for (const item of cfg.optionalLinks) {
      lines.push(`- **[${item.title}](${toAbsoluteUrl(cfg.baseUrl, item.path)}):** ${item.desc}`);
    }
    lines.push('');
  }

  lines.push(
    '## 5. AI Crawler Permissions Summary',
    `- **Permitted AI Crawlers:** ${allowedBots.length > 0 ? allowedBots.join(', ') : 'None (Strict Disallow)'}`,
    `- **Restricted AI Crawlers:** ${blockedBots.length > 0 ? blockedBots.join(', ') : 'None (All Allowed)'}`,
    `- **Restricted Private Paths:** ${cfg.disallowPaths.join(', ')}`,
    '',
    `> **Disclaimer:** ${DISCLAIMER_TEXT}`
  );

  return lines.join('\n') + '\n';
}

/**
 * Generates `robots.txt` with explicit rules for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, and CCBot.
 */
export function generateRobotsTxt(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);

  const lines = [
    `# robots.txt & AI Bot Policy for ${cfg.siteName} (${cfg.baseUrl})`,
    `# Generated by B2 Apps LLMs.txt & AI Bot Policy Generator`,
    `# Disclaimer: ${DISCLAIMER_TEXT}`,
    `# LLMs.txt Manifest: ${cfg.baseUrl}/llms.txt`,
    `# LLMs-Full.txt Manifest: ${cfg.baseUrl}/llms-full.txt`,
    '',
    'User-agent: *',
    'Allow: /',
  ];

  for (const pathItem of cfg.disallowPaths) {
    lines.push(`Disallow: ${pathItem}`);
  }
  if (cfg.crawlDelay > 0) {
    lines.push(`Crawl-delay: ${cfg.crawlDelay}`);
  }

  for (const bot of AI_BOTS) {
    const decision = cfg.botPolicies[bot.id] === 'allow' ? 'allow' : 'disallow';
    lines.push('', `# ${bot.vendor} — ${bot.purpose}`);
    lines.push(`User-agent: ${bot.agent}`);
    if (decision === 'allow') {
      lines.push('Allow: /');
      lines.push('Allow: /llms.txt');
      lines.push('Allow: /llms-full.txt');
      for (const pathItem of cfg.disallowPaths) {
        lines.push(`Disallow: ${pathItem}`);
      }
    } else {
      lines.push('Disallow: /');
    }
  }

  lines.push('', `Sitemap: ${cfg.sitemapUrl}`, '');
  return lines.join('\n');
}

/**
 * Calculates a deterministic GEO (Generative Engine Optimization) Readiness Score (0-100)
 * along with check items and actionable optimization tips.
 */
export function calculateGeoScore(rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);
  const checks = [];
  let score = 0;

  // 1. HTTPS Canonical Base URL (15 pts)
  const hasHttps = cfg.baseUrl.startsWith('https://') && !cfg.baseUrl.includes('example.eu');
  if (hasHttps) {
    score += 15;
    checks.push({ id: 'https-url', points: 15, max: 15, passed: true, label: 'HTTPS canonical production domain configured' });
  } else {
    score += 8;
    checks.push({ id: 'https-url', points: 8, max: 15, passed: false, label: 'Replace placeholder domain with your live HTTPS domain' });
  }

  // 2. Concise Tagline & Executive Overview (20 pts)
  const overviewLen = cfg.coreOverview.length;
  const taglineLen = cfg.tagline.length;
  if (taglineLen >= 25 && overviewLen >= 80) {
    score += 20;
    checks.push({ id: 'context-depth', points: 20, max: 20, passed: true, label: 'High-signal summary blockquote & technical overview for LLM grounding' });
  } else {
    score += 10;
    checks.push({ id: 'context-depth', points: 10, max: 20, passed: false, label: 'Expand tagline (25+ chars) and technical overview (80+ chars) for better answer synthesis' });
  }

  // 3. Structured Documentation Links (20 pts)
  if (cfg.docsLinks.length >= 2 && cfg.docsLinks.every((l) => l.desc.length >= 10)) {
    score += 20;
    checks.push({ id: 'docs-links', points: 20, max: 20, passed: true, label: `${cfg.docsLinks.length} annotated documentation links with descriptions` });
  } else if (cfg.docsLinks.length >= 1) {
    score += 10;
    checks.push({ id: 'docs-links', points: 10, max: 20, passed: false, label: 'Add at least 2 documentation links with descriptive summaries' });
  } else {
    checks.push({ id: 'docs-links', points: 0, max: 20, passed: false, label: 'Missing documentation links in ## Documentation section' });
  }

  // 4. Machine-Readable API / Catalog Links (15 pts)
  if (cfg.apiLinks.length >= 1) {
    score += 15;
    checks.push({ id: 'api-links', points: 15, max: 15, passed: true, label: 'Machine-readable API schema or structured product feed linked' });
  } else {
    checks.push({ id: 'api-links', points: 0, max: 15, passed: false, label: 'Add an OpenAPI spec, JSON-LD feed, or reference link for deterministic citations' });
  }

  // 5. AI Answer Engine Search Accessibility (OAI-SearchBot & PerplexityBot) (15 pts)
  const searchAllowed =
    cfg.botPolicies['OAI-SearchBot'] === 'allow' && cfg.botPolicies['PerplexityBot'] === 'allow';
  const anySearchAllowed =
    cfg.botPolicies['OAI-SearchBot'] === 'allow' || cfg.botPolicies['PerplexityBot'] === 'allow';
  if (searchAllowed) {
    score += 15;
    checks.push({ id: 'search-bots', points: 15, max: 15, passed: true, label: 'AI Search & Citation bots (OAI-SearchBot, PerplexityBot) permitted' });
  } else if (anySearchAllowed) {
    score += 8;
    checks.push({ id: 'search-bots', points: 8, max: 15, passed: false, label: 'Both OAI-SearchBot and PerplexityBot should be allowed for full AI search visibility' });
  } else {
    checks.push({ id: 'search-bots', points: 0, max: 15, passed: false, label: 'AI Search bots are blocked — your site will not be cited in ChatGPT Search or Perplexity' });
  }

  // 6. Private Route Protection & XML Sitemap (15 pts)
  const hasProtectionAndSitemap = cfg.disallowPaths.length >= 1 && cfg.sitemapUrl.endsWith('.xml');
  if (hasProtectionAndSitemap) {
    score += 15;
    checks.push({ id: 'hygiene', points: 15, max: 15, passed: true, label: 'Private routes disallowed and XML Sitemap declared in robots.txt' });
  } else {
    score += 7;
    checks.push({ id: 'hygiene', points: 7, max: 15, passed: false, label: 'Specify private disallow paths (/admin/, /app/) and a valid .xml sitemap URL' });
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const grade =
    finalScore >= 90
      ? 'Excellent (AI Citation Ready)'
      : finalScore >= 75
      ? 'Good (GEO Optimized)'
      : finalScore >= 55
      ? 'Fair (Needs Context Tuning)'
      : 'Low (Invisible to AI Search)';

  return {
    score: finalScore,
    grade,
    checks,
  };
}
