import {
  SAMPLE_ETFS,
  SAMPLE_DATA_AS_OF,
  analyzePortfolio,
  parseHoldingsCsv,
} from './analyzer.js';

const DEFAULT_ALLOCATIONS = {
  VWCE: 10000,
  IWDA: 6000,
  CSPX: 4000,
  EIMI: 2000,
  EQQQ: 3000,
};

let etfCatalog = structuredClone(SAMPLE_ETFS);
let allocations = { ...DEFAULT_ALLOCATIONS };

const el = (id) => document.getElementById(id);

function formatEur(n) {
  return '€' + Number(n || 0).toLocaleString('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatEurInt(n) {
  return '€' + Math.round(Number(n || 0)).toLocaleString('en-IE');
}

function renderAllocations() {
  const container = el('allocations-list');
  container.innerHTML = '';

  const total = Object.values(allocations).reduce((s, v) => s + Math.max(0, Number(v) || 0), 0);

  for (const [ticker, etf] of Object.entries(etfCatalog)) {
    const amount = allocations[ticker] ?? 0;
    const weightPct = total > 0 ? ((Math.max(0, amount) / total) * 100).toFixed(1) : '0.0';

    const row = document.createElement('div');
    row.className = 'allocation-row';

    const meta = document.createElement('div');
    meta.className = 'etf-meta';
    const tickerSpan = document.createElement('span');
    tickerSpan.className = 'etf-ticker';
    tickerSpan.textContent = `${ticker} · TER ${etf.terPct.toFixed(2)}%`;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'etf-name';
    nameSpan.textContent = etf.name;
    meta.append(tickerSpan, nameSpan);

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '500';
    input.value = String(amount);
    input.setAttribute('aria-label', `${ticker} amount in EUR`);
    input.addEventListener('input', () => {
      allocations[ticker] = Math.max(0, Number(input.value) || 0);
      updateAnalysis();
    });

    const pct = document.createElement('div');
    pct.style.textAlign = 'right';
    pct.style.fontWeight = '600';
    pct.style.color = 'var(--muted)';
    pct.dataset.weightFor = ticker;
    pct.textContent = `${weightPct}%`;

    row.append(meta, input, pct);
    container.appendChild(row);
  }
}

function updateWeightLabels(normalizedWeights) {
  const map = new Map(normalizedWeights.map((w) => [w.ticker, w.weightPct]));
  document.querySelectorAll('[data-weight-for]').forEach((node) => {
    const t = node.dataset.weightFor;
    const w = map.get(t) ?? 0;
    node.textContent = `${w.toFixed(1)}%`;
  });
}

function renderBars(containerId, items, barClass = '') {
  const container = el(containerId);
  container.innerHTML = '';
  if (!items.length) {
    container.textContent = 'No active allocations.';
    return;
  }
  const maxPct = Math.max(...items.map((i) => i.pct), 1);
  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'bar-row';

    const header = document.createElement('div');
    header.className = 'bar-header';
    const label = document.createElement('span');
    label.textContent = item.name;
    const val = document.createElement('span');
    val.textContent = `${item.pct.toFixed(2)}%`;
    header.append(label, val);

    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = `bar-fill ${barClass}`.trim();
    fill.style.width = `${Math.min(100, (item.pct / maxPct) * 100)}%`;
    track.appendChild(fill);

    row.append(header, track);
    container.appendChild(row);
  }
}

function updateAnalysis() {
  const grossReturnPct = Number(el('gross-return').value) || 0;
  const monthlyContribution = Math.max(0, Number(el('monthly-contrib').value) || 0);

  const allocArray = Object.entries(allocations).map(([ticker, amount]) => ({
    ticker,
    amount: Math.max(0, Number(amount) || 0),
  }));

  const report = analyzePortfolio({
    allocations: allocArray,
    etfCatalog,
    grossReturnPct,
    monthlyContribution,
  });

  updateWeightLabels(report.terSummary.normalizedWeights);

  // KPIs
  el('kpi-total').textContent = formatEurInt(report.terSummary.totalAmount);
  el('kpi-etf-count').textContent = `${report.terSummary.normalizedWeights.length} active ETF(s)`;
  el('kpi-ter').textContent = `${report.terSummary.weightedTerPct.toFixed(2)}%`;
  el('kpi-annual-fee').textContent = `${formatEur(report.terSummary.annualFeeAmount)} / year`;
  el('kpi-overlap').textContent = `${report.overlappingExposurePct.toFixed(1)}%`;
  el('kpi-overlap-count').textContent = `${report.overlappingHoldings.length} shared top holdings`;

  const d10 = report.feeDrag.projections[10];
  const d20 = report.feeDrag.projections[20];
  el('kpi-drag-20').textContent = formatEurInt(d20.feeDragAmount);
  el('kpi-drag-10').textContent = `10-Year Drag: ${formatEurInt(d10.feeDragAmount)}`;

  // Overlap table
  const overlapBody = el('overlap-table').querySelector('tbody');
  overlapBody.innerHTML = '';
  if (!report.overlappingHoldings.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'No overlapping top holdings across selected ETFs.';
    tr.appendChild(td);
    overlapBody.appendChild(tr);
  } else {
    for (const h of report.overlappingHoldings.slice(0, 12)) {
      const tr = document.createElement('tr');
      const etfsStr = h.breakdown.map((b) => `${b.etf} (${b.portfolioContributionPct.toFixed(2)}%)`).join(', ');
      tr.innerHTML = `
        <td><strong>${escapeHtml(h.symbol)}</strong></td>
        <td>${escapeHtml(h.name)}</td>
        <td style="font-size:0.8rem;color:var(--muted)">${escapeHtml(etfsStr)}</td>
        <td class="num">${h.totalPortfolioPct.toFixed(2)}%</td>
      `;
      overlapBody.appendChild(tr);
    }
  }

  // Pairwise table
  const pairBody = el('pairwise-table').querySelector('tbody');
  pairBody.innerHTML = '';
  if (!report.pairwiseOverlap.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 2;
    td.textContent = 'Select at least 2 ETFs to compare pairwise overlap.';
    tr.appendChild(td);
    pairBody.appendChild(tr);
  } else {
    for (const p of report.pairwiseOverlap) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(p.etfA)} vs ${escapeHtml(p.etfB)}</td>
        <td class="num">${p.overlapPct.toFixed(2)}%</td>
      `;
      pairBody.appendChild(tr);
    }
  }

  // Fee drag table
  const dragBody = el('drag-table').querySelector('tbody');
  dragBody.innerHTML = '';
  for (const years of [10, 20]) {
    const row = report.feeDrag.projections[years];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${years} Years</td>
      <td class="num">${formatEurInt(row.grossValue)}</td>
      <td class="num">${formatEurInt(row.netValue)}</td>
      <td class="num" style="color:var(--warn)">${formatEurInt(row.feeDragAmount)} (${row.feeDragPctOfGross.toFixed(2)}%)</td>
    `;
    dragBody.appendChild(tr);
  }

  renderBars('sector-bars', report.sectors);
  renderBars('region-bars', report.regions, 'region');

  return report;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setCsvStatus(msg, isError = false) {
  const node = el('csv-status');
  node.textContent = msg;
  node.className = `status-msg ${isError ? 'error' : 'ok'}`;
}

function handleCsvImport() {
  const raw = el('csv-paste-input').value;
  try {
    const imported = parseHoldingsCsv(raw);
    const names = Object.keys(imported);
    for (const ticker of names) {
      etfCatalog[ticker] = imported[ticker];
      if (allocations[ticker] === undefined) {
        allocations[ticker] = 5000;
      }
    }
    renderAllocations();
    updateAnalysis();
    setCsvStatus(`Imported ${names.length} ETF(s): ${names.join(', ')}`);
  } catch (err) {
    setCsvStatus(err.message || 'Failed to parse CSV.', true);
  }
}

function exportAnalysisCsv() {
  const report = updateAnalysis();
  const lines = [
    '# Educational & data visualization tool only; not financial, tax, or investment advice.',
    `# Data as of: ${report.dataAsOf}`,
    'Section,Item,Detail,Value',
    `Summary,Total Portfolio EUR,,${report.terSummary.totalAmount}`,
    `Summary,Weighted TER %,,${report.terSummary.weightedTerPct}`,
    `Summary,Annual Fee EUR,,${report.terSummary.annualFeeAmount}`,
    `Summary,Overlapping Top Holdings %,,${report.overlappingExposurePct}`,
    `FeeDrag,10-Year Fee Drag EUR,Gross ${report.feeDrag.projections[10].grossValue} vs Net ${report.feeDrag.projections[10].netValue},${report.feeDrag.projections[10].feeDragAmount}`,
    `FeeDrag,20-Year Fee Drag EUR,Gross ${report.feeDrag.projections[20].grossValue} vs Net ${report.feeDrag.projections[20].netValue},${report.feeDrag.projections[20].feeDragAmount}`,
  ];
  for (const h of report.overlappingHoldings) {
    lines.push(`Overlap,"${h.symbol}","${h.name}",${h.totalPortfolioPct}`);
  }
  for (const s of report.sectors) {
    lines.push(`Sector,"${s.name}",,${s.pct}`);
  }
  for (const r of report.regions) {
    lines.push(`Region,"${r.name}",,${r.pct}`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ucits-etf-overlap-analysis.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Wire events
el('data-as-of').textContent = `Data as of ${SAMPLE_DATA_AS_OF}`;
el('gross-return').addEventListener('input', updateAnalysis);
el('monthly-contrib').addEventListener('input', updateAnalysis);
el('btn-import-csv').addEventListener('click', handleCsvImport);
el('btn-export-csv').addEventListener('click', exportAnalysisCsv);

el('btn-load-csv-example').addEventListener('click', () => {
  el('csv-paste-input').value = [
    'etf,ter_pct,symbol,name,weight_pct,sector,region',
    'VUAA,0.07,AAPL,Apple Inc.,7.0,Information Technology,North America',
    'VUAA,0.07,MSFT,Microsoft Corp.,6.5,Information Technology,North America',
    'VUAA,0.07,NVDA,NVIDIA Corp.,6.2,Information Technology,North America',
    'VUAA,0.07,__RESIDUAL_VUAA__,Other S&P 500 Equities,80.3,Diversified / Other,North America',
  ].join('\n');
  setCsvStatus('Loaded example CSV. Click "Import Custom CSV" to apply.');
});

el('csv-file-input').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  el('csv-paste-input').value = await file.text();
  handleCsvImport();
});

el('btn-reset').addEventListener('click', () => {
  etfCatalog = structuredClone(SAMPLE_ETFS);
  allocations = { ...DEFAULT_ALLOCATIONS };
  el('gross-return').value = '7.0';
  el('monthly-contrib').value = '500';
  el('csv-status').textContent = '';
  renderAllocations();
  updateAnalysis();
});

renderAllocations();
updateAnalysis();
