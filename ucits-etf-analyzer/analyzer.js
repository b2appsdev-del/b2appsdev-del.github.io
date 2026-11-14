/**
 * UCITS ETF Overlap, TER & Geographic Exposure Analyzer — Core Calculation Engine
 * Educational & data visualization tool only; not financial, tax, or investment advice.
 */

export const DISCLAIMER =
  'Educational & data visualization tool only; not financial, tax, or investment advice.';

export const SAMPLE_DATA_AS_OF = '2026-11-14 (Illustrative Educational Sample)';

/**
 * Illustrative educational sample holdings for popular UCITS ETFs.
 * Weights represent percentage of each ETF (summing to 100% with an ETF-specific residual bucket).
 */
export const SAMPLE_ETFS = {
  VWCE: {
    ticker: 'VWCE',
    name: 'Vanguard FTSE All-World UCITS ETF (Acc)',
    terPct: 0.22,
    domicile: 'Ireland',
    index: 'FTSE All-World',
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weightPct: 4.1, sector: 'Information Technology', region: 'North America' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weightPct: 3.9, sector: 'Information Technology', region: 'North America' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weightPct: 3.8, sector: 'Information Technology', region: 'North America' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weightPct: 2.3, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'META', name: 'Meta Platforms Inc.', weightPct: 1.5, sector: 'Communication Services', region: 'North America' },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weightPct: 1.3, sector: 'Communication Services', region: 'North America' },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', weightPct: 0.9, sector: 'Financials', region: 'North America' },
      { symbol: 'TSM', name: 'Taiwan Semiconductor (TSMC)', weightPct: 0.9, sector: 'Information Technology', region: 'Emerging Asia' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weightPct: 0.9, sector: 'Information Technology', region: 'North America' },
      { symbol: 'TSLA', name: 'Tesla Inc.', weightPct: 0.8, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'ASML', name: 'ASML Holding NV', weightPct: 0.5, sector: 'Information Technology', region: 'Europe' },
      { symbol: 'NOVO', name: 'Novo Nordisk A/S', weightPct: 0.5, sector: 'Health Care', region: 'Europe' },
      { symbol: 'SAP', name: 'SAP SE', weightPct: 0.4, sector: 'Information Technology', region: 'Europe' },
      { symbol: '7203.T', name: 'Toyota Motor Corp.', weightPct: 0.3, sector: 'Consumer Discretionary', region: 'Japan' },
      { symbol: '__RESIDUAL_VWCE__', name: 'Other Global Equities (VWCE Basket)', weightPct: 77.9, sector: 'Diversified / Other', region: 'Global Mix', isResidual: true },
    ],
  },
  IWDA: {
    ticker: 'IWDA',
    name: 'iShares Core MSCI World UCITS ETF (Acc)',
    terPct: 0.20,
    domicile: 'Ireland',
    index: 'MSCI World',
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weightPct: 4.8, sector: 'Information Technology', region: 'North America' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weightPct: 4.5, sector: 'Information Technology', region: 'North America' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weightPct: 4.4, sector: 'Information Technology', region: 'North America' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weightPct: 2.7, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'META', name: 'Meta Platforms Inc.', weightPct: 1.8, sector: 'Communication Services', region: 'North America' },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weightPct: 1.5, sector: 'Communication Services', region: 'North America' },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', weightPct: 1.0, sector: 'Financials', region: 'North America' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weightPct: 1.0, sector: 'Information Technology', region: 'North America' },
      { symbol: 'TSLA', name: 'Tesla Inc.', weightPct: 0.9, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'ASML', name: 'ASML Holding NV', weightPct: 0.6, sector: 'Information Technology', region: 'Europe' },
      { symbol: 'NOVO', name: 'Novo Nordisk A/S', weightPct: 0.6, sector: 'Health Care', region: 'Europe' },
      { symbol: 'SAP', name: 'SAP SE', weightPct: 0.4, sector: 'Information Technology', region: 'Europe' },
      { symbol: '7203.T', name: 'Toyota Motor Corp.', weightPct: 0.4, sector: 'Consumer Discretionary', region: 'Japan' },
      { symbol: '__RESIDUAL_IWDA__', name: 'Other Developed Markets Equities (IWDA Basket)', weightPct: 75.4, sector: 'Diversified / Other', region: 'Developed Mix', isResidual: true },
    ],
  },
  CSPX: {
    ticker: 'CSPX',
    name: 'iShares Core S&P 500 UCITS ETF (Acc)',
    terPct: 0.07,
    domicile: 'Ireland',
    index: 'S&P 500',
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weightPct: 7.0, sector: 'Information Technology', region: 'North America' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weightPct: 6.5, sector: 'Information Technology', region: 'North America' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weightPct: 6.2, sector: 'Information Technology', region: 'North America' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weightPct: 3.8, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'META', name: 'Meta Platforms Inc.', weightPct: 2.5, sector: 'Communication Services', region: 'North America' },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weightPct: 2.1, sector: 'Communication Services', region: 'North America' },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', weightPct: 1.7, sector: 'Financials', region: 'North America' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weightPct: 1.6, sector: 'Information Technology', region: 'North America' },
      { symbol: 'TSLA', name: 'Tesla Inc.', weightPct: 1.4, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: '__RESIDUAL_CSPX__', name: 'Other S&P 500 Equities (CSPX Basket)', weightPct: 67.2, sector: 'Diversified / Other', region: 'North America', isResidual: true },
    ],
  },
  EIMI: {
    ticker: 'EIMI',
    name: 'iShares Core MSCI EM IMI UCITS ETF (Acc)',
    terPct: 0.18,
    domicile: 'Ireland',
    index: 'MSCI Emerging Markets IMI',
    holdings: [
      { symbol: 'TSM', name: 'Taiwan Semiconductor (TSMC)', weightPct: 8.6, sector: 'Information Technology', region: 'Emerging Asia' },
      { symbol: '0700.HK', name: 'Tencent Holdings Ltd.', weightPct: 3.9, sector: 'Communication Services', region: 'Emerging Asia' },
      { symbol: '9988.HK', name: 'Alibaba Group Holding', weightPct: 2.3, sector: 'Consumer Discretionary', region: 'Emerging Asia' },
      { symbol: '005930.KS', name: 'Samsung Electronics Co.', weightPct: 3.1, sector: 'Information Technology', region: 'Emerging Asia' },
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', weightPct: 1.3, sector: 'Energy', region: 'Emerging Asia' },
      { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', weightPct: 1.2, sector: 'Financials', region: 'Emerging Asia' },
      { symbol: 'VALE3.SA', name: 'Vale SA', weightPct: 0.7, sector: 'Materials', region: 'Latin America' },
      { symbol: '__RESIDUAL_EIMI__', name: 'Other Emerging Markets Equities (EIMI Basket)', weightPct: 78.9, sector: 'Diversified / Other', region: 'Emerging Markets', isResidual: true },
    ],
  },
  EQQQ: {
    ticker: 'EQQQ',
    name: 'Invesco EQQQ Nasdaq-100 UCITS ETF',
    terPct: 0.30,
    domicile: 'Ireland',
    index: 'Nasdaq-100',
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weightPct: 8.9, sector: 'Information Technology', region: 'North America' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weightPct: 8.1, sector: 'Information Technology', region: 'North America' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weightPct: 7.9, sector: 'Information Technology', region: 'North America' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weightPct: 5.1, sector: 'Information Technology', region: 'North America' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weightPct: 5.0, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'META', name: 'Meta Platforms Inc.', weightPct: 4.8, sector: 'Communication Services', region: 'North America' },
      { symbol: 'TSLA', name: 'Tesla Inc.', weightPct: 3.1, sector: 'Consumer Discretionary', region: 'North America' },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weightPct: 2.6, sector: 'Communication Services', region: 'North America' },
      { symbol: '__RESIDUAL_EQQQ__', name: 'Other Nasdaq-100 Equities (EQQQ Basket)', weightPct: 54.5, sector: 'Diversified / Other', region: 'North America', isResidual: true },
    ],
  },
};

/**
 * Parse custom CSV text into ETF definitions or holdings rows.
 * Expected header: etf,ter_pct,symbol,name,weight_pct,sector,region
 * (ter_pct is optional; defaults to 0.20 if omitted or blank).
 */
export function parseHoldingsCsv(csvText) {
  if (typeof csvText !== 'string' || !csvText.trim()) {
    throw new Error('CSV input is empty.');
  }
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one holding row.');
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const idx = {
    etf: headers.indexOf('etf'),
    terPct: headers.indexOf('ter_pct'),
    symbol: headers.indexOf('symbol'),
    name: headers.indexOf('name'),
    weightPct: headers.indexOf('weight_pct'),
    sector: headers.indexOf('sector'),
    region: headers.indexOf('region'),
  };

  if (idx.etf === -1 || idx.symbol === -1 || idx.weightPct === -1) {
    throw new Error('CSV header must include at least: etf, symbol, weight_pct');
  }

  const customEtfs = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const etfTicker = (cols[idx.etf] || '').trim().toUpperCase();
    const symbol = (cols[idx.symbol] || '').trim().toUpperCase();
    const weightPct = Number(cols[idx.weightPct]);

    if (!etfTicker || !symbol || !Number.isFinite(weightPct) || weightPct < 0) {
      throw new Error(`Invalid row at line ${i + 1}: check etf, symbol, and non-negative weight_pct.`);
    }

    const terVal = idx.terPct !== -1 && cols[idx.terPct] !== undefined && cols[idx.terPct].trim() !== ''
      ? Number(cols[idx.terPct])
      : 0.20;

    if (!Number.isFinite(terVal) || terVal < 0 || terVal > 10) {
      throw new Error(`Invalid ter_pct at line ${i + 1}.`);
    }

    if (!customEtfs[etfTicker]) {
      customEtfs[etfTicker] = {
        ticker: etfTicker,
        name: `${etfTicker} (Custom CSV)`,
        terPct: terVal,
        domicile: 'Custom',
        index: 'User Supplied',
        holdings: [],
      };
    }

    customEtfs[etfTicker].holdings.push({
      symbol,
      name: (idx.name !== -1 && cols[idx.name]) ? cols[idx.name].trim() : symbol,
      weightPct,
      sector: (idx.sector !== -1 && cols[idx.sector]) ? cols[idx.sector].trim() : 'Unspecified',
      region: (idx.region !== -1 && cols[idx.region]) ? cols[idx.region].trim() : 'Unspecified',
      isResidual: symbol.startsWith('__RESIDUAL_'),
    });
  }

  return customEtfs;
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Calculate weighted TER (%) and annual fee in currency units.
 * @param {Array<{ticker: string, amount: number}>} allocations
 * @param {Record<string, {terPct: number}>} etfCatalog
 */
export function calculateWeightedTer(allocations, etfCatalog) {
  const valid = (allocations || []).filter((a) => a && Number(a.amount) > 0 && etfCatalog[a.ticker]);
  const totalAmount = valid.reduce((sum, a) => sum + Number(a.amount), 0);
  if (totalAmount <= 0) {
    return { totalAmount: 0, weightedTerPct: 0, annualFeeAmount: 0, normalizedWeights: [] };
  }

  let weightedTerPct = 0;
  const normalizedWeights = valid.map((a) => {
    const weight = Number(a.amount) / totalAmount;
    const terPct = Number(etfCatalog[a.ticker].terPct) || 0;
    weightedTerPct += weight * terPct;
    return {
      ticker: a.ticker,
      amount: Number(a.amount),
      weightPct: round2(weight * 100),
      terPct,
    };
  });

  const annualFeeAmount = totalAmount * (weightedTerPct / 100);
  return {
    totalAmount: round2(totalAmount),
    weightedTerPct: round4(weightedTerPct),
    annualFeeAmount: round2(annualFeeAmount),
    normalizedWeights,
  };
}

/**
 * Calculate pairwise overlap (%) between two ETFs based on shared non-residual holdings:
 * sum_c min(weight_A,c, weight_B,c).
 */
export function calculatePairwiseOverlap(etfA, etfB) {
  if (!etfA || !etfB) return 0;
  const mapA = new Map();
  for (const h of etfA.holdings || []) {
    if (h.isResidual) continue;
    mapA.set(h.symbol, (mapA.get(h.symbol) || 0) + h.weightPct);
  }
  let overlap = 0;
  for (const h of etfB.holdings || []) {
    if (h.isResidual) continue;
    if (mapA.has(h.symbol)) {
      overlap += Math.min(mapA.get(h.symbol), h.weightPct);
    }
  }
  return round2(overlap);
}

/**
 * Calculate 10-year and 20-year fee drag for a portfolio.
 * Uses annual compounding: netRate = grossReturnPct/100 - weightedTerPct/100.
 * Supports initial lump sum + optional annual/monthly contributions.
 */
export function calculateFeeDrag({
  initialAmount,
  monthlyContribution = 0,
  grossReturnPct = 7.0,
  weightedTerPct = 0.20,
  yearsList = [10, 20],
}) {
  const principal = Math.max(0, Number(initialAmount) || 0);
  const annualContrib = Math.max(0, Number(monthlyContribution) || 0) * 12;
  const grossRate = Number(grossReturnPct) / 100;
  const terRate = Math.max(0, Number(weightedTerPct)) / 100;
  const netRate = grossRate - terRate;

  const project = (rate, years) => {
    let balance = principal;
    for (let y = 0; y < years; y++) {
      balance = (balance + annualContrib) * (1 + rate);
    }
    return balance;
  };

  const results = {};
  for (const years of yearsList) {
    const grossValue = project(grossRate, years);
    const netValue = project(netRate, years);
    const feeDragAmount = Math.max(0, grossValue - netValue);
    const feeDragPctOfGross = grossValue > 0 ? (feeDragAmount / grossValue) * 100 : 0;
    results[years] = {
      years,
      grossValue: round2(grossValue),
      netValue: round2(netValue),
      feeDragAmount: round2(feeDragAmount),
      feeDragPctOfGross: round2(feeDragPctOfGross),
    };
  }

  return {
    grossReturnPct: Number(grossReturnPct),
    weightedTerPct: round4(weightedTerPct),
    netReturnPct: round4(Number(grossReturnPct) - weightedTerPct),
    projections: results,
  };
}

/**
 * Full portfolio analysis: weighted TER, overlapping holdings, pairwise matrix,
 * sector exposure, region exposure, and 10/20-year fee drag.
 */
export function analyzePortfolio({
  allocations,
  etfCatalog = SAMPLE_ETFS,
  grossReturnPct = 7.0,
  monthlyContribution = 0,
}) {
  const terSummary = calculateWeightedTer(allocations, etfCatalog);
  const active = terSummary.normalizedWeights;

  const holdingMap = new Map();
  const sectorMap = new Map();
  const regionMap = new Map();

  for (const item of active) {
    const etf = etfCatalog[item.ticker];
    const portfolioWeight = item.weightPct / 100;

    for (const h of etf.holdings || []) {
      const effectivePct = portfolioWeight * h.weightPct;

      // Aggregate sector & region
      const sectorKey = h.sector || 'Unspecified';
      const regionKey = h.region || 'Unspecified';
      sectorMap.set(sectorKey, (sectorMap.get(sectorKey) || 0) + effectivePct);
      regionMap.set(regionKey, (regionMap.get(regionKey) || 0) + effectivePct);

      if (h.isResidual) continue;

      if (!holdingMap.has(h.symbol)) {
        holdingMap.set(h.symbol, {
          symbol: h.symbol,
          name: h.name,
          sector: sectorKey,
          region: regionKey,
          totalPortfolioPct: 0,
          etfCount: 0,
          breakdown: [],
        });
      }
      const entry = holdingMap.get(h.symbol);
      entry.totalPortfolioPct += effectivePct;
      entry.etfCount += 1;
      entry.breakdown.push({
        etf: item.ticker,
        etfWeightPct: h.weightPct,
        portfolioContributionPct: round2(effectivePct),
      });
    }
  }

  const allHoldings = Array.from(holdingMap.values())
    .map((h) => ({ ...h, totalPortfolioPct: round2(h.totalPortfolioPct) }))
    .sort((a, b) => b.totalPortfolioPct - a.totalPortfolioPct);

  const overlappingHoldings = allHoldings.filter((h) => h.etfCount >= 2);
  const overlappingExposurePct = round2(
    overlappingHoldings.reduce((sum, h) => sum + h.totalPortfolioPct, 0)
  );

  // Pairwise overlap matrix
  const pairwiseOverlap = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i].ticker;
      const b = active[j].ticker;
      pairwiseOverlap.push({
        etfA: a,
        etfB: b,
        overlapPct: calculatePairwiseOverlap(etfCatalog[a], etfCatalog[b]),
      });
    }
  }

  const toSortedArray = (map) =>
    Array.from(map.entries())
      .map(([name, pct]) => ({ name, pct: round2(pct) }))
      .sort((a, b) => b.pct - a.pct);

  const feeDrag = calculateFeeDrag({
    initialAmount: terSummary.totalAmount,
    monthlyContribution,
    grossReturnPct,
    weightedTerPct: terSummary.weightedTerPct,
    yearsList: [10, 20],
  });

  return {
    disclaimer: DISCLAIMER,
    dataAsOf: SAMPLE_DATA_AS_OF,
    terSummary,
    overlappingExposurePct,
    overlappingHoldings,
    topHoldings: allHoldings.slice(0, 15),
    pairwiseOverlap,
    sectors: toSortedArray(sectorMap),
    regions: toSortedArray(regionMap),
    feeDrag,
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round4(n) {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}
