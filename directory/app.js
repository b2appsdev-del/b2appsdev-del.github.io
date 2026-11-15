export function normalizeQuery(query) {
  return String(query || '').trim().toLowerCase();
}

export function getCategories(tools) {
  const seen = new Set();
  for (const tool of tools || []) {
    if (tool && tool.category) {
      seen.add(tool.category);
    }
  }
  return Array.from(seen);
}

export function sortTools(tools) {
  return [...(tools || [])].sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) {
      return a.featured ? -1 : 1;
    }
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

export function filterTools(tools, { category = 'all', tier = 'all', query = '' } = {}) {
  const normalized = normalizeQuery(query);
  const tokens = normalized ? normalized.split(/\s+/).filter(Boolean) : [];

  const filtered = (tools || []).filter((tool) => {
    if (!tool) return false;
    if (category !== 'all' && tool.category !== category) {
      return false;
    }
    if (tier !== 'all' && tool.tier !== tier) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }
    const haystack = [
      tool.name,
      tool.category,
      tool.badge,
      tool.pricing,
      tool.description,
      ...(Array.isArray(tool.tags) ? tool.tags : [])
    ]
      .join(' ')
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });

  return sortTools(filtered);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCard(tool) {
  const tierClass =
    tool.tier === 'pro' ? 'badge-pro' : tool.tier === 'free' ? 'badge-free' : 'badge-reference';
  const tagsHtml = (tool.tags || [])
    .slice(0, 4)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join('');

  return `
    <article class="tool-card ${tool.featured ? 'featured' : ''}" data-category="${escapeHtml(tool.category)}" data-tier="${escapeHtml(tool.tier)}">
      <div>
        <div class="card-top">
          <span class="badge ${tierClass}">${escapeHtml(tool.badge || tool.tier)}</span>
          <span class="price-tag">${escapeHtml(tool.pricing || 'Free')}</span>
        </div>
        <div class="tool-category">${escapeHtml(tool.category)}</div>
        <h2 class="tool-title">${escapeHtml(tool.name)}</h2>
        <p class="tool-desc">${escapeHtml(tool.description)}</p>
        <div class="tool-tags">${tagsHtml}</div>
      </div>
      <div class="card-footer">
        <span class="privacy-flag">${tool.privacyFirst ? 'Privacy-First' : 'External Service'}</span>
        <a class="visit-btn" href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer">Open Tool &rarr;</a>
      </div>
    </article>
  `;
}

async function initDirectory() {
  const gridEl = document.getElementById('tools-grid');
  const pillsEl = document.getElementById('category-pills');
  const searchEl = document.getElementById('search-input');
  const tierEl = document.getElementById('tier-select');
  const countEl = document.getElementById('results-count');
  const emptyEl = document.getElementById('empty-state');
  const resetEl = document.getElementById('reset-filters');
  const totalStatEl = document.getElementById('stat-total');

  if (!gridEl || !pillsEl || !searchEl || !tierEl) {
    return;
  }

  let allTools = [];
  let categories = [];
  const state = {
    category: 'all',
    tier: 'all',
    query: ''
  };

  try {
    const res = await fetch('./data/tools.json');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = await res.json();
    allTools = Array.isArray(payload.tools) ? payload.tools : [];
    categories = Array.isArray(payload.categories) && payload.categories.length
      ? payload.categories
      : getCategories(allTools);
  } catch (err) {
    gridEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = `Unable to load directory dataset (${err.message}).`;
    }
    return;
  }

  if (totalStatEl) {
    totalStatEl.textContent = String(allTools.length);
  }

  function renderPills() {
    const buttons = [
      `<button type="button" class="pill-btn ${state.category === 'all' ? 'active' : ''}" data-category="all">All (${allTools.length})</button>`,
      ...categories.map((cat) => {
        const count = allTools.filter((t) => t.category === cat).length;
        const active = state.category === cat ? 'active' : '';
        return `<button type="button" class="pill-btn ${active}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)} (${count})</button>`;
      })
    ];
    pillsEl.innerHTML = buttons.join('');
  }

  function render() {
    const matches = filterTools(allTools, state);
    if (countEl) {
      countEl.textContent = `Showing ${matches.length} of ${allTools.length} curated tools`;
    }
    if (matches.length === 0) {
      gridEl.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
    } else {
      if (emptyEl) emptyEl.hidden = true;
      gridEl.innerHTML = matches.map(renderCard).join('');
    }
  }

  pillsEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-category]');
    if (!btn) return;
    state.category = btn.getAttribute('data-category') || 'all';
    renderPills();
    render();
  });

  searchEl.addEventListener('input', (event) => {
    state.query = event.target.value || '';
    render();
  });

  tierEl.addEventListener('change', (event) => {
    state.tier = event.target.value || 'all';
    render();
  });

  if (resetEl) {
    resetEl.addEventListener('click', () => {
      state.category = 'all';
      state.tier = 'all';
      state.query = '';
      searchEl.value = '';
      tierEl.value = 'all';
      renderPills();
      render();
    });
  }

  renderPills();
  render();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDirectory);
  } else {
    initDirectory();
  }
}
