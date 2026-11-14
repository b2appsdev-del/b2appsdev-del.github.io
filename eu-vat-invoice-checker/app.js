import {
  EU_COUNTRIES,
  NON_EU_COUNTRIES,
  isEuCountry,
  validateEuVatFormat,
  determineVatTreatment,
  calculateInvoiceTotals,
  generateInvoiceCsv
} from './vatLogic.js';

const STORAGE_KEY = 'eu_vat_invoice_state_v1';

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£'
};

function todayIso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function getDefaultState() {
  return {
    invoiceNumber: 'INV-2026-001',
    issueDate: todayIso(0),
    dueDate: todayIso(30),
    currency: 'EUR',
    customRate: '',
    supplierName: 'Studio Alpha OÜ',
    supplierCountry: 'EE',
    supplierVat: 'EE102345678',
    supplierAddress: 'Narva mnt 5, 10117 Tallinn, Estonia\nbilling@studioalpha.eu',
    clientName: 'Berlin Tech GmbH',
    clientCountry: 'DE',
    clientVat: 'DE123456789',
    clientAddress: 'Torstraße 1, 10119 Berlin, Germany',
    paymentNotes: 'IBAN: EE123456789012345678 · BIC: HABAEE2X\nPlease reference invoice number on transfer.',
    items: [
      { description: 'B2B Product Design & Frontend Sprint', quantity: 1, unitPrice: 2400 },
      { description: 'Technical Architecture Consulting (Hours)', quantity: 6, unitPrice: 120 }
    ]
  };
}

function getEmptyState() {
  return {
    invoiceNumber: 'INV-2026-001',
    issueDate: todayIso(0),
    dueDate: todayIso(30),
    currency: 'EUR',
    customRate: '',
    supplierName: '',
    supplierCountry: 'DE',
    supplierVat: '',
    supplierAddress: '',
    clientName: '',
    clientCountry: 'FR',
    clientVat: '',
    clientAddress: '',
    paymentNotes: '',
    items: [{ description: 'Consulting Services', quantity: 1, unitPrice: 1000 }]
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return getDefaultState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

const el = (id) => document.getElementById(id);

function populateCountrySelect(selectEl) {
  selectEl.innerHTML = '';

  const euGroup = document.createElement('optgroup');
  euGroup.label = 'European Union (27 Member States)';
  Object.entries(EU_COUNTRIES)
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .forEach(([code, info]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${info.name} (${code} · ${info.standardRate}% std)`;
      euGroup.appendChild(opt);
    });
  selectEl.appendChild(euGroup);

  const nonEuGroup = document.createElement('optgroup');
  nonEuGroup.label = 'Non-EU Countries';
  Object.entries(NON_EU_COUNTRIES).forEach(([code, info]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${info.name} (Non-EU)`;
    nonEuGroup.appendChild(opt);
  });
  selectEl.appendChild(nonEuGroup);
}

function formatMoney(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  return `${sym}${Number(amount || 0).toFixed(2)}`;
}

function renderItemsEditor() {
  const container = el('itemsContainer');
  container.innerHTML = '';

  state.items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.placeholder = 'Service description';
    descInput.value = item.description;
    descInput.addEventListener('input', (e) => {
      state.items[index].description = e.target.value;
      saveState();
      renderPreview();
    });

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.step = '0.5';
    qtyInput.value = item.quantity;
    qtyInput.addEventListener('input', (e) => {
      state.items[index].quantity = parseFloat(e.target.value) || 0;
      saveState();
      renderPreview();
    });

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.value = item.unitPrice;
    priceInput.addEventListener('input', (e) => {
      state.items[index].unitPrice = parseFloat(e.target.value) || 0;
      saveState();
      renderPreview();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.title = 'Remove item';
    removeBtn.textContent = '×';
    removeBtn.disabled = state.items.length <= 1;
    removeBtn.addEventListener('click', () => {
      if (state.items.length > 1) {
        state.items.splice(index, 1);
        saveState();
        renderItemsEditor();
        renderPreview();
      }
    });

    row.append(descInput, qtyInput, priceInput, removeBtn);
    container.appendChild(row);
  });
}

function updateVatBadge(badgeEl, hintEl, vatStr, countryCode, isOptional = false) {
  if (!isEuCountry(countryCode)) {
    badgeEl.className = 'badge badge-info';
    badgeEl.textContent = 'Non-EU';
    hintEl.textContent = 'EU VAT format check not required for non-EU countries.';
    return;
  }

  const info = EU_COUNTRIES[countryCode];
  if (!vatStr.trim()) {
    badgeEl.className = isOptional ? 'badge badge-neutral' : 'badge badge-invalid';
    badgeEl.textContent = isOptional ? 'Empty' : 'Missing';
    hintEl.textContent = `Format example for ${info.name}: ${info.example}`;
    return;
  }

  const res = validateEuVatFormat(vatStr, countryCode);
  if (res.valid) {
    badgeEl.className = 'badge badge-valid';
    badgeEl.textContent = 'Valid Format';
    hintEl.textContent = res.reason;
  } else {
    badgeEl.className = 'badge badge-invalid';
    badgeEl.textContent = 'Invalid';
    hintEl.textContent = res.reason;
  }
}

function syncInputsFromState() {
  el('invoiceNumber').value = state.invoiceNumber;
  el('issueDate').value = state.issueDate;
  el('dueDate').value = state.dueDate;
  el('currency').value = state.currency;
  el('customRate').value = state.customRate;
  el('supplierName').value = state.supplierName;
  el('supplierCountry').value = state.supplierCountry;
  el('supplierVat').value = state.supplierVat;
  el('supplierAddress').value = state.supplierAddress;
  el('clientName').value = state.clientName;
  el('clientCountry').value = state.clientCountry;
  el('clientVat').value = state.clientVat;
  el('clientAddress').value = state.clientAddress;
  el('paymentNotes').value = state.paymentNotes;
}

function renderPreview() {
  updateVatBadge(el('supplierVatBadge'), el('supplierVatHint'), state.supplierVat, state.supplierCountry, true);
  updateVatBadge(el('clientVatBadge'), el('clientVatHint'), state.clientVat, state.clientCountry, false);

  const customRateNum = state.customRate === '' ? null : Number(state.customRate);
  const treatment = determineVatTreatment({
    supplierCountry: state.supplierCountry,
    clientCountry: state.clientCountry,
    clientVatNumber: state.clientVat,
    customDomesticRate: customRateNum
  });

  const totals = calculateInvoiceTotals(state.items, treatment.vatRate);

  // Banner
  const banner = el('vatStatusBanner');
  banner.className = `vat-banner no-print mode-${treatment.mode}`;
  banner.textContent = treatment.warning
    ? `⚠️ ${treatment.warning}`
    : `✓ ${treatment.vatLabel} — ${treatment.legalNote}`;

  // Invoice header & parties
  el('prevNumber').textContent = state.invoiceNumber || '—';
  el('prevIssueDate').textContent = state.issueDate || '—';
  el('prevDueDate').textContent = state.dueDate || '—';
  el('prevTaxPill').textContent = treatment.vatLabel;

  el('prevSupplierName').textContent = state.supplierName || 'Your Business Name';
  el('prevSupplierAddress').textContent = state.supplierAddress || '';
  el('prevSupplierVat').textContent = state.supplierVat.trim() || 'Not provided';

  el('prevClientName').textContent = state.clientName || 'Client Name';
  el('prevClientAddress').textContent = state.clientAddress || '';
  el('prevClientVat').textContent = state.clientVat.trim() || 'Not provided';

  // Items table
  const tbody = el('prevItemsBody');
  tbody.innerHTML = '';
  totals.items.forEach((item) => {
    const tr = document.createElement('tr');
    const tdDesc = document.createElement('td');
    tdDesc.textContent = item.description;

    const tdQty = document.createElement('td');
    tdQty.className = 'num';
    tdQty.textContent = String(item.quantity);

    const tdPrice = document.createElement('td');
    tdPrice.className = 'num';
    tdPrice.textContent = formatMoney(item.unitPrice, state.currency);

    const tdTotal = document.createElement('td');
    tdTotal.className = 'num';
    tdTotal.textContent = formatMoney(item.lineTotal, state.currency);

    tr.append(tdDesc, tdQty, tdPrice, tdTotal);
    tbody.appendChild(tr);
  });

  // Totals & Notes
  el('prevSubtotal').textContent = formatMoney(totals.subtotal, state.currency);
  el('prevVatLabel').textContent = `VAT (${treatment.vatRate}%)`;
  el('prevVatAmount').textContent = formatMoney(totals.vatAmount, state.currency);
  el('prevTotal').textContent = formatMoney(totals.total, state.currency);
  el('prevLegalNote').textContent = treatment.legalNote;

  const paySec = el('prevPaymentSection');
  if (state.paymentNotes.trim()) {
    paySec.style.display = 'block';
    el('prevPaymentNotes').textContent = state.paymentNotes;
  } else {
    paySec.style.display = 'none';
  }

  return { treatment, totals };
}

function bindField(id, key) {
  el(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    saveState();
    renderPreview();
  });
}

function init() {
  populateCountrySelect(el('supplierCountry'));
  populateCountrySelect(el('clientCountry'));
  syncInputsFromState();
  renderItemsEditor();
  renderPreview();

  bindField('invoiceNumber', 'invoiceNumber');
  bindField('issueDate', 'issueDate');
  bindField('dueDate', 'dueDate');
  bindField('currency', 'currency');
  bindField('customRate', 'customRate');
  bindField('supplierName', 'supplierName');
  bindField('supplierCountry', 'supplierCountry');
  bindField('supplierVat', 'supplierVat');
  bindField('supplierAddress', 'supplierAddress');
  bindField('clientName', 'clientName');
  bindField('clientCountry', 'clientCountry');
  bindField('clientVat', 'clientVat');
  bindField('clientAddress', 'clientAddress');
  bindField('paymentNotes', 'paymentNotes');

  el('btnAddItem').addEventListener('click', () => {
    state.items.push({ description: '', quantity: 1, unitPrice: 0 });
    saveState();
    renderItemsEditor();
    renderPreview();
  });

  el('btnPrint').addEventListener('click', () => window.print());

  el('btnCsv').addEventListener('click', () => {
    const { treatment, totals } = renderPreview();
    const csv = generateInvoiceCsv({
      invoiceNumber: state.invoiceNumber,
      issueDate: state.issueDate,
      dueDate: state.dueDate,
      currency: state.currency,
      supplierName: state.supplierName,
      supplierCountry: state.supplierCountry,
      supplierVat: state.supplierVat,
      clientName: state.clientName,
      clientCountry: state.clientCountry,
      clientVat: state.clientVat,
      vatMode: treatment.mode,
      vatRate: treatment.vatRate,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      legalNote: treatment.legalNote,
      items: totals.items
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  el('btnSample').addEventListener('click', () => {
    state = getDefaultState();
    saveState();
    syncInputsFromState();
    renderItemsEditor();
    renderPreview();
  });

  el('btnReset').addEventListener('click', () => {
    state = getEmptyState();
    saveState();
    syncInputsFromState();
    renderItemsEditor();
    renderPreview();
  });
}

init();
