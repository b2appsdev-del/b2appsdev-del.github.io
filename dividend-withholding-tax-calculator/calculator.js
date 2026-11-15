/**
 * Pure EU/US Dividend & Withholding Tax (WHT) Drag Calculator logic.
 * Zero external dependencies — works in Node.js (tests) and Browser.
 */

export const DISCLAIMER_TEXT =
  'Educational & financial modeling tool only; not financial, tax, or investment advice. Tax treaties, W-8BEN eligibility, foreign tax credit rules, and local deemed-distribution laws (e.g. Vorabpauschale) vary by jurisdiction.';

export const STRATEGIES = [
  {
    id: 'us_no_treaty',
    name: 'US ETF — No Treaty (30% WHT)',
    shortName: 'US 30% WHT',
    whtRate: 0.30,
    defaultTerPct: 0.03,
    isAccumulating: false,
    color: '#ef4444',
    description: '30% statutory US withholding tax + local dividend tax (no W-8BEN).',
  },
  {
    id: 'us_w8ben',
    name: 'US ETF — W-8BEN Treaty (15% WHT)',
    shortName: 'US 15% W-8BEN',
    whtRate: 0.15,
    defaultTerPct: 0.03,
    isAccumulating: false,
    color: '#f59e0b',
    description: '15% US treaty WHT via W-8BEN + local dividend tax (optional FTC offset).',
  },
  {
    id: 'ucits_dist',
    name: 'Irish UCITS — Distributing (15% Internal WHT)',
    shortName: 'UCITS Dist 15%',
    whtRate: 0.15,
    defaultTerPct: 0.07,
    isAccumulating: false,
    color: '#3b82f6',
    description: '15% internal US-Ireland WHT inside fund, 0% Irish WHT + local dividend tax.',
  },
  {
    id: 'ucits_acc',
    name: 'Irish UCITS — Accumulating (15% Internal, 0% Dist. Tax)',
    shortName: 'UCITS Acc 0% Dist',
    whtRate: 0.15,
    defaultTerPct: 0.07,
    isAccumulating: true,
    color: '#10b981',
    description: '15% internal US-Ireland WHT, 0% annual EU distribution tax drag while compounding.',
  },
  {
    id: 'zero_wht',
    name: 'Benchmark — 0% WHT / Tax-Free',
    shortName: '0% WHT Benchmark',
    whtRate: 0.00,
    defaultTerPct: 0.00,
    isAccumulating: true,
    color: '#94a3b8',
    description: 'Zero-tax baseline to measure exact cumulative WHT & tax drag.',
  },
];

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function normalizeInputs(input = {}) {
  return {
    initialInvestment: clampNumber(input.initialInvestment, 0, 1e9, 25000),
    annualContribution: clampNumber(input.annualContribution, 0, 1e8, 3000),
    grossYieldPct: clampNumber(input.grossYieldPct, 0, 30, 2.5),
    priceGrowthPct: clampNumber(input.priceGrowthPct, -50, 50, 6.0),
    localDivTaxPct: clampNumber(input.localDivTaxPct, 0, 60, 15.0),
    usTerPct: clampNumber(input.usTerPct, 0, 5, 0.03),
    ucitsTerPct: clampNumber(input.ucitsTerPct, 0, 5, 0.07),
    years: Math.round(clampNumber(input.years, 0, 50, 20)),
    creditW8ben: input.creditW8ben !== undefined ? Boolean(input.creditW8ben) : true,
    currency: ['€', '$', '£'].includes(input.currency) ? input.currency : '€',
  };
}

/**
 * Computes Level-1 (WHT), Level-2 (local tax), combined effective dividend tax rate,
 * and net dividend yield (%) for a given strategy.
 */
export function computeEffectiveRates(strategy, inputs) {
  const localTax = inputs.localDivTaxPct / 100;
  const wht = strategy.whtRate;

  let effectiveTotalDivTaxRate = 0;

  if (strategy.id === 'zero_wht') {
    effectiveTotalDivTaxRate = 0;
  } else if (strategy.isAccumulating) {
    // Internal WHT only; 0% annual local distribution tax during accumulation
    effectiveTotalDivTaxRate = wht;
  } else if (strategy.id === 'us_w8ben' && inputs.creditW8ben) {
    // Local tax authority credits the 15% US WHT against local dividend tax
    effectiveTotalDivTaxRate = Math.max(wht, localTax);
  } else {
    // Sequential taxation: local tax applies to net dividend after WHT
    effectiveTotalDivTaxRate = 1 - (1 - wht) * (1 - localTax);
  }

  const effectiveLocalTaxRate = Math.max(0, effectiveTotalDivTaxRate - wht);
  const netYieldPct = inputs.grossYieldPct * (1 - effectiveTotalDivTaxRate);
  const annualYieldDragPct = inputs.grossYieldPct - netYieldPct;

  let terPct = 0;
  if (strategy.id === 'us_no_treaty' || strategy.id === 'us_w8ben') {
    terPct = inputs.usTerPct;
  } else if (strategy.id === 'ucits_dist' || strategy.id === 'ucits_acc') {
    terPct = inputs.ucitsTerPct;
  }

  return {
    whtRate: wht,
    effectiveLocalTaxRate,
    effectiveTotalDivTaxRate,
    netYieldPct,
    annualYieldDragPct,
    terPct,
  };
}

/**
 * Simulates multi-year DRIP compounding for a single strategy.
 */
export function simulateStrategy(strategy, rawInputs = {}) {
  const inputs = normalizeInputs(rawInputs);
  const rates = computeEffectiveRates(strategy, inputs);

  const grossYield = inputs.grossYieldPct / 100;
  const priceGrowth = inputs.priceGrowthPct / 100;
  const ter = rates.terPct / 100;

  let balance = inputs.initialInvestment;
  let totalContributed = inputs.initialInvestment;
  let totalGrossDividends = 0;
  let totalWhtLost = 0;
  let totalLocalTaxLost = 0;
  let totalNetDividends = 0;

  const timeline = [];

  for (let year = 1; year <= inputs.years; year++) {
    const startBalance = balance;
    const grossDividend = startBalance * grossYield;
    const whtLost = grossDividend * rates.whtRate;
    const localTaxLost = grossDividend * rates.effectiveLocalTaxRate;
    const netDividend = grossDividend - whtLost - localTaxLost;
    const priceGain = startBalance * priceGrowth;
    const terDrag = startBalance * ter;

    balance = Math.max(0, startBalance + priceGain - terDrag + netDividend + inputs.annualContribution);

    totalContributed += inputs.annualContribution;
    totalGrossDividends += grossDividend;
    totalWhtLost += whtLost;
    totalLocalTaxLost += localTaxLost;
    totalNetDividends += netDividend;

    timeline.push({
      year,
      startBalance,
      grossDividend,
      whtLost,
      localTaxLost,
      netDividend,
      endBalance: balance,
    });
  }

  return {
    strategy,
    rates,
    timeline,
    summary: {
      finalBalance: balance,
      totalContributed,
      totalGrossDividends,
      totalWhtLost,
      totalLocalTaxLost,
      totalTaxLost: totalWhtLost + totalLocalTaxLost,
      totalNetDividends,
      totalReturn: balance - totalContributed,
    },
  };
}

export function compareAllStrategies(rawInputs = {}) {
  const inputs = normalizeInputs(rawInputs);
  const results = STRATEGIES.map((s) => simulateStrategy(s, inputs));
  const benchmark = results.find((r) => r.strategy.id === 'zero_wht');
  const worst = results.reduce((min, r) =>
    r.summary.finalBalance < min.summary.finalBalance ? r : min
  );

  return {
    inputs,
    results: results.map((r) => ({
      ...r,
      dragVsBenchmark: benchmark.summary.finalBalance - r.summary.finalBalance,
      gainVsWorst: r.summary.finalBalance - worst.summary.finalBalance,
    })),
  };
}

export function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateComparisonCsv(comparison) {
  const { inputs, results } = comparison;
  const header = [
    'Year',
    ...results.map((r) => `${r.strategy.shortName} Balance (${inputs.currency})`),
    ...results.map((r) => `${r.strategy.shortName} Tax Lost (${inputs.currency})`),
  ];

  const rows = [header.map(escapeCsvCell).join(',')];

  for (let i = 0; i < inputs.years; i++) {
    const year = i + 1;
    const balances = results.map((r) => r.timeline[i].endBalance.toFixed(2));
    const taxes = results.map((r) =>
      (r.timeline[i].whtLost + r.timeline[i].localTaxLost).toFixed(2)
    );
    rows.push([year, ...balances, ...taxes].map(escapeCsvCell).join(','));
  }

  return rows.join('\n');
}
