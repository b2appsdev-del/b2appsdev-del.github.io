import {
  DISCLAIMER_TEXT,
  compareAllStrategies,
  generateComparisonCsv,
} from './calculator.js';

const inputIds = [
  'currency',
  'years',
  'initialInvestment',
  'annualContribution',
  'grossYieldPct',
  'priceGrowthPct',
  'usTerPct',
  'ucitsTerPct',
  'localDivTaxPct',
  'creditW8ben',
];

function readInputs() {
  return {
    currency: document.getElementById('currency').value,
    years: document.getElementById('years').value,
    initialInvestment: document.getElementById('initialInvestment').value,
    annualContribution: document.getElementById('annualContribution').value,
    grossYieldPct: document.getElementById('grossYieldPct').value,
    priceGrowthPct: document.getElementById('priceGrowthPct').value,
    usTerPct: document.getElementById('usTerPct').value,
    ucitsTerPct: document.getElementById('ucitsTerPct').value,
    localDivTaxPct: document.getElementById('localDivTaxPct').value,
    creditW8ben: document.getElementById('creditW8ben').checked,
  };
}

function fmtMoney(val, currency) {
  return `${currency}${Math.round(val).toLocaleString('en-US')}`;
}

function renderSummaryCards(cmp) {
  const container = document.getElementById('summary-cards');
  const { currency } = cmp.inputs;
  container.innerHTML = cmp.results
    .map(
      (r) => `
    <div class="stat-card" style="border-top-color:${r.strategy.color}">
      <div class="stat-title">${r.strategy.shortName}</div>
      <div class="stat-value">${fmtMoney(r.summary.finalBalance, currency)}</div>
      <div class="stat-sub">Net Yield: <strong>${r.rates.netYieldPct.toFixed(2)}%</strong> (Tax: ${(r.rates.effectiveTotalDivTaxRate * 100).toFixed(1)}%)</div>
      <div class="stat-sub">Total Tax Lost: ${fmtMoney(r.summary.totalTaxLost, currency)}</div>
      <div class="stat-sub">Drag vs 0% WHT: ${fmtMoney(r.dragVsBenchmark, currency)}</div>
    </div>`
    )
    .join('');
}

function renderChart(cmp) {
  const wrap = document.getElementById('chart-container');
  const legend = document.getElementById('chart-legend');
  const { inputs, results } = cmp;

  if (inputs.years === 0) {
    wrap.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;">Set Horizon &ge; 1 year to view chart.</p>';
    legend.innerHTML = '';
    return;
  }

  const width = 760;
  const height = 280;
  const pad = { top: 18, right: 20, bottom: 32, left: 68 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const allVals = results.flatMap((r) => r.timeline.map((t) => t.endBalance));
  const maxVal = Math.max(1, ...allVals);

  const xFor = (yearIdx) =>
    pad.left + (inputs.years === 1 ? plotW : (yearIdx / (inputs.years - 1)) * plotW);
  const yFor = (val) => pad.top + plotH - (val / maxVal) * plotH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const y = pad.top + plotH * (1 - frac);
      const val = maxVal * frac;
      return `
        <line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${width - pad.right}" y2="${y.toFixed(1)}" stroke="#273549" stroke-dasharray="3,3" />
        <text x="${pad.left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#94a3b8" font-size="11">${fmtMoney(val, inputs.currency)}</text>
      `;
    })
    .join('');

  const paths = results
    .map((r) => {
      const pts = r.timeline
        .map((pt, idx) => `${xFor(idx).toFixed(1)},${yFor(pt.endBalance).toFixed(1)}`)
        .join(' ');
      return `<polyline fill="none" stroke="${r.strategy.color}" stroke-width="2.4" points="${pts}" />`;
    })
    .join('');

  const xLabels = [1, Math.ceil(inputs.years / 2), inputs.years]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((yr) => {
      const x = xFor(yr - 1);
      return `<text x="${x.toFixed(1)}" y="${height - 8}" text-anchor="middle" fill="#94a3b8" font-size="11">Yr ${yr}</text>`;
    })
    .join('');

  wrap.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" style="height:auto;display:block" role="img" aria-label="DRIP Compounding Chart">
      ${gridLines}
      ${paths}
      ${xLabels}
    </svg>
  `;

  legend.innerHTML = results
    .map(
      (r) => `
    <span class="legend-item">
      <span class="legend-dot" style="background:${r.strategy.color}"></span>
      ${r.strategy.shortName}
    </span>`
    )
    .join('');
}

function renderTable(cmp) {
  const container = document.getElementById('table-container');
  const { inputs, results } = cmp;
  if (inputs.years === 0) {
    container.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;">No yearly rows for 0-year horizon.</p>';
    return;
  }

  const headers = results.map((r) => `<th>${r.strategy.shortName}</th>`).join('');
  const rows = [];
  for (let i = 0; i < inputs.years; i++) {
    const cells = results
      .map((r) => `<td>${fmtMoney(r.timeline[i].endBalance, inputs.currency)}</td>`)
      .join('');
    rows.push(`<tr><td>Year ${i + 1}</td>${cells}</tr>`);
  }

  container.innerHTML = `
    <table>
      <thead><tr><th>Year</th>${headers}</tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;
}

let latestComparison = null;

function updateAll() {
  latestComparison = compareAllStrategies(readInputs());
  renderSummaryCards(latestComparison);
  renderChart(latestComparison);
  renderTable(latestComparison);
}

document.getElementById('disclaimer-box').innerHTML =
  `<strong>Educational &amp; Modeling Tool Only:</strong> ${DISCLAIMER_TEXT}`;

inputIds.forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener('input', updateAll);
  el.addEventListener('change', updateAll);
});

document.getElementById('export-csv-btn').addEventListener('click', () => {
  if (!latestComparison) return;
  const csv = generateComparisonCsv(latestComparison);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dividend-wht-drag-comparison.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

updateAll();
