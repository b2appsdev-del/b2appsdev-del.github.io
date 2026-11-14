/**
 * EU VAT & Reverse-Charge Invoice Logic (100% client-side, zero dependencies)
 * Educational & planning tool only; not financial, tax, or legal advice.
 */

export const EU_COUNTRIES = {
  AT: { name: 'Austria', vatPrefix: 'AT', standardRate: 20, regex: /^ATU\d{8}$/, example: 'ATU12345678' },
  BE: { name: 'Belgium', vatPrefix: 'BE', standardRate: 21, regex: /^BE[01]\d{9}$/, example: 'BE0123456789' },
  BG: { name: 'Bulgaria', vatPrefix: 'BG', standardRate: 20, regex: /^BG\d{9,10}$/, example: 'BG123456789' },
  CY: { name: 'Cyprus', vatPrefix: 'CY', standardRate: 19, regex: /^CY\d{8}[A-Z]$/, example: 'CY12345678L' },
  CZ: { name: 'Czechia', vatPrefix: 'CZ', standardRate: 21, regex: /^CZ\d{8,10}$/, example: 'CZ12345678' },
  DE: { name: 'Germany', vatPrefix: 'DE', standardRate: 19, regex: /^DE\d{9}$/, example: 'DE123456789' },
  DK: { name: 'Denmark', vatPrefix: 'DK', standardRate: 25, regex: /^DK\d{8}$/, example: 'DK12345678' },
  EE: { name: 'Estonia', vatPrefix: 'EE', standardRate: 22, regex: /^EE\d{9}$/, example: 'EE123456789' },
  EL: { name: 'Greece', vatPrefix: 'EL', standardRate: 24, regex: /^EL\d{9}$/, example: 'EL123456789' },
  ES: { name: 'Spain', vatPrefix: 'ES', standardRate: 21, regex: /^ES([A-Z]\d{8}|\d{8}[A-Z]|[A-Z]\d{7}[A-Z])$/, example: 'ESA12345678' },
  FI: { name: 'Finland', vatPrefix: 'FI', standardRate: 25.5, regex: /^FI\d{8}$/, example: 'FI12345678' },
  FR: { name: 'France', vatPrefix: 'FR', standardRate: 20, regex: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/, example: 'FRXX123456789' },
  HR: { name: 'Croatia', vatPrefix: 'HR', standardRate: 25, regex: /^HR\d{11}$/, example: 'HR12345678901' },
  HU: { name: 'Hungary', vatPrefix: 'HU', standardRate: 27, regex: /^HU\d{8}$/, example: 'HU12345678' },
  IE: { name: 'Ireland', vatPrefix: 'IE', standardRate: 23, regex: /^IE(\d{7}[A-W]|\d[A-Z+*]\d{5}[A-W]|\d{7}[A-W][AH])$/, example: 'IE1234567T' },
  IT: { name: 'Italy', vatPrefix: 'IT', standardRate: 22, regex: /^IT\d{11}$/, example: 'IT12345678901' },
  LT: { name: 'Lithuania', vatPrefix: 'LT', standardRate: 21, regex: /^LT(\d{9}|\d{12})$/, example: 'LT123456789' },
  LU: { name: 'Luxembourg', vatPrefix: 'LU', standardRate: 17, regex: /^LU\d{8}$/, example: 'LU12345678' },
  LV: { name: 'Latvia', vatPrefix: 'LV', standardRate: 21, regex: /^LV\d{11}$/, example: 'LV12345678901' },
  MT: { name: 'Malta', vatPrefix: 'MT', standardRate: 18, regex: /^MT\d{8}$/, example: 'MT12345678' },
  NL: { name: 'Netherlands', vatPrefix: 'NL', standardRate: 21, regex: /^NL\d{9}B\d{2}$/, example: 'NL123456789B01' },
  PL: { name: 'Poland', vatPrefix: 'PL', standardRate: 23, regex: /^PL\d{10}$/, example: 'PL1234567890' },
  PT: { name: 'Portugal', vatPrefix: 'PT', standardRate: 23, regex: /^PT\d{9}$/, example: 'PT123456789' },
  RO: { name: 'Romania', vatPrefix: 'RO', standardRate: 19, regex: /^RO\d{2,10}$/, example: 'RO1234567890' },
  SE: { name: 'Sweden', vatPrefix: 'SE', standardRate: 25, regex: /^SE\d{12}$/, example: 'SE123456789001' },
  SI: { name: 'Slovenia', vatPrefix: 'SI', standardRate: 22, regex: /^SI\d{8}$/, example: 'SI12345678' },
  SK: { name: 'Slovakia', vatPrefix: 'SK', standardRate: 23, regex: /^SK\d{10}$/, example: 'SK1234567890' }
};

export const NON_EU_COUNTRIES = {
  US: { name: 'United States' },
  GB: { name: 'United Kingdom' },
  CH: { name: 'Switzerland' },
  CA: { name: 'Canada' },
  AU: { name: 'Australia' },
  NO: { name: 'Norway' },
  OTHER_NON_EU: { name: 'Other Non-EU Country' }
};

/**
 * Normalize country code (maps ISO 'GR' to EU VAT prefix 'EL').
 * @param {string} code
 * @returns {string}
 */
export function normalizeCountryCode(code) {
  if (!code || typeof code !== 'string') return '';
  const upper = code.trim().toUpperCase();
  return upper === 'GR' ? 'EL' : upper;
}

/**
 * Check if a country code belongs to the 27 EU member states.
 * @param {string} countryCode
 * @returns {boolean}
 */
export function isEuCountry(countryCode) {
  const code = normalizeCountryCode(countryCode);
  return Object.prototype.hasOwnProperty.call(EU_COUNTRIES, code);
}

/**
 * Normalize a VAT number string (remove spaces, hyphens, dots, uppercase).
 * @param {string} vatNumber
 * @returns {string}
 */
export function normalizeVatNumber(vatNumber) {
  if (!vatNumber || typeof vatNumber !== 'string') return '';
  return vatNumber.replace(/[\s.\-]/g, '').toUpperCase();
}

/**
 * Validate an EU VAT number format against the 27 EU member state patterns.
 * Optionally checks that the VAT prefix matches the expected countryCode.
 * @param {string} rawVat
 * @param {string} [expectedCountryCode]
 * @returns {{ valid: boolean, normalized: string, countryCode: string|null, countryName: string|null, reason: string }}
 */
export function validateEuVatFormat(rawVat, expectedCountryCode = '') {
  const normalized = normalizeVatNumber(rawVat);
  const expected = normalizeCountryCode(expectedCountryCode);

  if (!normalized) {
    return {
      valid: false,
      normalized: '',
      countryCode: null,
      countryName: null,
      reason: 'VAT number is empty.'
    };
  }

  if (normalized.length < 4) {
    return {
      valid: false,
      normalized,
      countryCode: null,
      countryName: null,
      reason: 'VAT number is too short.'
    };
  }

  const prefix = normalized.slice(0, 2);
  const country = EU_COUNTRIES[prefix];

  if (!country) {
    const hint = prefix === 'GR' ? ' Use "EL" prefix for Greek EU VAT IDs.' : '';
    return {
      valid: false,
      normalized,
      countryCode: null,
      countryName: null,
      reason: `Unrecognized EU VAT prefix "${prefix}".${hint}`
    };
  }

  if (expected && isEuCountry(expected) && prefix !== expected) {
    return {
      valid: false,
      normalized,
      countryCode: prefix,
      countryName: country.name,
      reason: `VAT prefix "${prefix}" does not match selected country "${expected}".`
    };
  }

  const matches = country.regex.test(normalized);
  return {
    valid: matches,
    normalized,
    countryCode: prefix,
    countryName: country.name,
    reason: matches
      ? `Valid ${country.name} (${prefix}) VAT format.`
      : `Invalid ${country.name} VAT format. Expected pattern like ${country.example}.`
  };
}

/**
 * Round a currency amount to 2 decimal places using standard half-up rounding.
 * @param {number} value
 * @returns {number}
 */
export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Determine VAT regime, rate, and legal invoice note for a B2B transaction.
 * @param {object} params
 * @param {string} params.supplierCountry
 * @param {string} params.clientCountry
 * @param {string} [params.clientVatNumber]
 * @param {number|null} [params.customDomesticRate]
 * @returns {{
 *   mode: 'DOMESTIC_VAT'|'REVERSE_CHARGE'|'EU_NO_VAT_ID'|'NON_EU_EXPORT'|'OUTSIDE_EU_SUPPLIER',
 *   vatRate: number,
 *   vatLabel: string,
 *   legalNote: string,
 *   warning: string|null,
 *   clientVatCheck: ReturnType<typeof validateEuVatFormat>|null
 * }}
 */
export function determineVatTreatment({
  supplierCountry,
  clientCountry,
  clientVatNumber = '',
  customDomesticRate = null
}) {
  const sup = normalizeCountryCode(supplierCountry);
  const cli = normalizeCountryCode(clientCountry);

  if (!isEuCountry(sup)) {
    return {
      mode: 'OUTSIDE_EU_SUPPLIER',
      vatRate: 0,
      vatLabel: '0% (Non-EU Supplier)',
      legalNote: 'Supplier is outside the EU; EU VAT rules are not applied by this generator.',
      warning: 'Supplier country is outside the EU. Verify local tax obligations.',
      clientVatCheck: null
    };
  }

  const supInfo = EU_COUNTRIES[sup];
  const effectiveDomesticRate =
    customDomesticRate !== null && customDomesticRate !== undefined && !Number.isNaN(Number(customDomesticRate))
      ? Math.max(0, Number(customDomesticRate))
      : supInfo.standardRate;

  // Non-EU client -> Export of B2B services
  if (!isEuCountry(cli)) {
    return {
      mode: 'NON_EU_EXPORT',
      vatRate: 0,
      vatLabel: '0% (Non-EU Export)',
      legalNote:
        'Zero-rated export of B2B services outside the EU (outside scope of EU VAT under Article 44 of Council Directive 2006/112/EC).',
      warning: null,
      clientVatCheck: null
    };
  }

  // Domestic B2B (same EU country)
  if (sup === cli) {
    return {
      mode: 'DOMESTIC_VAT',
      vatRate: effectiveDomesticRate,
      vatLabel: `${effectiveDomesticRate}% (${supInfo.name} Domestic VAT)`,
      legalNote: `Domestic B2B supply — ${supInfo.name} VAT applied at ${effectiveDomesticRate}%.`,
      warning: null,
      clientVatCheck: clientVatNumber ? validateEuVatFormat(clientVatNumber, cli) : null
    };
  }

  // Cross-border EU B2B
  const vatCheck = validateEuVatFormat(clientVatNumber, cli);
  if (vatCheck.valid) {
    return {
      mode: 'REVERSE_CHARGE',
      vatRate: 0,
      vatLabel: '0% (Reverse Charge — Art. 196)',
      legalNote:
        'VAT Reverse Charge applies — Article 196 of EU Council Directive 2006/112/EC. Customer is liable to account for VAT.',
      warning: null,
      clientVatCheck: vatCheck
    };
  }

  // Cross-border EU without a valid client VAT ID
  return {
    mode: 'EU_NO_VAT_ID',
    vatRate: effectiveDomesticRate,
    vatLabel: `${effectiveDomesticRate}% (${supInfo.name} VAT — No Valid Client VAT ID)`,
    legalNote: `Cross-border EU supply without a valid customer VAT ID — ${supInfo.name} VAT applied at ${effectiveDomesticRate}%.`,
    warning:
      'A valid EU VAT ID for the client is required to apply 0% Reverse Charge. Verify the ID on EU VIES before zero-rating.',
    clientVatCheck: vatCheck
  };
}

/**
 * Calculate invoice subtotal, VAT amount, and total from line items.
 * @param {Array<{ description: string, quantity: number, unitPrice: number }>} items
 * @param {number} vatRatePercent
 * @returns {{
 *   items: Array<{ description: string, quantity: number, unitPrice: number, lineTotal: number }>,
 *   subtotal: number,
 *   vatAmount: number,
 *   total: number
 * }}
 */
export function calculateInvoiceTotals(items = [], vatRatePercent = 0) {
  const safeRate = Math.max(0, Number(vatRatePercent) || 0);
  const normalizedItems = (Array.isArray(items) ? items : []).map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const lineTotal = round2(qty * price);
    return {
      description: String(item.description || '').trim() || 'Service',
      quantity: qty,
      unitPrice: price,
      lineTotal
    };
  });

  const subtotal = round2(normalizedItems.reduce((sum, it) => sum + it.lineTotal, 0));
  const vatAmount = round2((subtotal * safeRate) / 100);
  const total = round2(subtotal + vatAmount);

  return {
    items: normalizedItems,
    subtotal,
    vatAmount,
    total
  };
}

/**
 * Escape a single CSV cell per RFC 4180.
 * @param {string|number} value
 * @returns {string}
 */
export function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate a bookkeeping-ready CSV string for an invoice.
 * @param {object} invoice
 * @returns {string}
 */
export function generateInvoiceCsv(invoice) {
  const headers = [
    'Invoice Number',
    'Issue Date',
    'Due Date',
    'Currency',
    'Supplier Name',
    'Supplier Country',
    'Supplier VAT ID',
    'Client Name',
    'Client Country',
    'Client VAT ID',
    'VAT Treatment',
    'VAT Rate (%)',
    'Item Description',
    'Quantity',
    'Unit Price',
    'Line Total',
    'Invoice Subtotal',
    'Invoice VAT Amount',
    'Invoice Total',
    'Legal Note'
  ];

  const rows = (invoice.items || []).map((item) => [
    invoice.invoiceNumber,
    invoice.issueDate,
    invoice.dueDate,
    invoice.currency,
    invoice.supplierName,
    invoice.supplierCountry,
    invoice.supplierVat,
    invoice.clientName,
    invoice.clientCountry,
    invoice.clientVat,
    invoice.vatMode,
    invoice.vatRate,
    item.description,
    item.quantity,
    item.unitPrice.toFixed(2),
    item.lineTotal.toFixed(2),
    invoice.subtotal.toFixed(2),
    invoice.vatAmount.toFixed(2),
    invoice.total.toFixed(2),
    invoice.legalNote
  ]);

  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(','))
  ];
  return lines.join('\r\n');
}
