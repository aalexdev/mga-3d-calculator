(function () {
  'use strict';

  const inputs = {
    filamentPrice: document.getElementById('filamentPrice'),
    filamentUsed: document.getElementById('filamentUsed'),
    printerPower: document.getElementById('printerPower'),
    printHours: document.getElementById('printHours'),
    printMinutes: document.getElementById('printMinutes'),
    kwhPrice: document.getElementById('kwhPrice'),
    fixedCosts: document.getElementById('fixedCosts'),
    laborCost: document.getElementById('laborCost'),
    profitMargin: document.getElementById('profitMargin'),
  };

  const outputs = {
    totalCost: document.getElementById('totalCost'),
    salePrice: document.getElementById('salePrice'),
    netProfit: document.getElementById('netProfit'),

    costFilament: document.getElementById('costFilament'),
    costEnergy: document.getElementById('costEnergy'),
    costFixed: document.getElementById('costFixed'),
    costLabor: document.getElementById('costLabor'),

    pctFilament: document.getElementById('pctFilament'),
    pctEnergy: document.getElementById('pctEnergy'),
    pctFixed: document.getElementById('pctFixed'),
    pctLabor: document.getElementById('pctLabor'),

    barFilament: document.getElementById('barFilament'),
    barEnergy: document.getElementById('barEnergy'),
    barFixed: document.getElementById('barFixed'),
    barLabor: document.getElementById('barLabor'),

    energyKwh: document.getElementById('energyKwh'),
    timeDecimal: document.getElementById('timeDecimal'),
  };

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  function formatBRL(value) {
    return currencyFormatter.format(Number.isFinite(value) ? value : 0);
  }

  function readNumber(field) {
    const value = parseFloat(field.value.replace(',', '.'));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function formatPercent(value) {
    return `${value.toFixed(1)}%`;
  }

  function calculate() {
    const filamentPricePerKg = readNumber(inputs.filamentPrice);
    const filamentUsedGrams = readNumber(inputs.filamentUsed);
    const printerPowerW = readNumber(inputs.printerPower);
    const printHours = readNumber(inputs.printHours);
    const printMinutes = readNumber(inputs.printMinutes);
    const kwhPrice = readNumber(inputs.kwhPrice);
    const fixedCosts = readNumber(inputs.fixedCosts);
    const laborCost = readNumber(inputs.laborCost);
    const profitMargin = readNumber(inputs.profitMargin);

    const totalHours = printHours + printMinutes / 60;

    const filamentCost = (filamentPricePerKg / 1000) * filamentUsedGrams;
    const energyKwh = (printerPowerW / 1000) * totalHours;
    const energyCost = energyKwh * kwhPrice;

    const totalCost = filamentCost + energyCost + fixedCosts + laborCost;
    const salePrice = totalCost * (1 + profitMargin / 100);
    const netProfit = salePrice - totalCost;

    const costs = {
      filament: filamentCost,
      energy: energyCost,
      fixed: fixedCosts,
      labor: laborCost,
    };

    const percentages = {};
    Object.keys(costs).forEach((key) => {
      percentages[key] = totalCost > 0 ? (costs[key] / totalCost) * 100 : 0;
    });

    render({ totalCost, salePrice, netProfit, costs, percentages, energyKwh, totalHours });
  }

  function render({ totalCost, salePrice, netProfit, costs, percentages, energyKwh, totalHours }) {
    outputs.totalCost.textContent = formatBRL(totalCost);
    outputs.salePrice.textContent = formatBRL(salePrice);
    outputs.netProfit.textContent = formatBRL(netProfit);

    outputs.costFilament.textContent = formatBRL(costs.filament);
    outputs.costEnergy.textContent = formatBRL(costs.energy);
    outputs.costFixed.textContent = formatBRL(costs.fixed);
    outputs.costLabor.textContent = formatBRL(costs.labor);

    outputs.pctFilament.textContent = formatPercent(percentages.filament);
    outputs.pctEnergy.textContent = formatPercent(percentages.energy);
    outputs.pctFixed.textContent = formatPercent(percentages.fixed);
    outputs.pctLabor.textContent = formatPercent(percentages.labor);

    outputs.barFilament.style.width = `${percentages.filament}%`;
    outputs.barEnergy.style.width = `${percentages.energy}%`;
    outputs.barFixed.style.width = `${percentages.fixed}%`;
    outputs.barLabor.style.width = `${percentages.labor}%`;

    outputs.energyKwh.textContent = `${energyKwh.toFixed(3)} kWh`;
    outputs.timeDecimal.textContent = `${totalHours.toFixed(2)}h`;
  }

  Object.values(inputs).forEach((field) => {
    field.addEventListener('input', calculate);
  });

  calculate();

  // Presets

  const PRESETS_STORAGE_KEY = 'calc3d-presets-v1';

  const FIELD_META = {
    filamentPrice: { label: 'Filamento', unit: '/kg', currency: true },
    filamentUsed: { label: 'Qtd. filamento', unit: 'g' },
    printerPower: { label: 'Potência', unit: 'W' },
    printHours: { label: 'Horas', unit: 'h' },
    printMinutes: { label: 'Minutos', unit: 'min' },
    kwhPrice: { label: 'kWh', unit: '', currency: true },
    fixedCosts: { label: 'Custo fixo', unit: '', currency: true },
    laborCost: { label: 'Mão de obra', unit: '', currency: true },
    profitMargin: { label: 'Margem', unit: '%' },
  };

  const DEFAULT_PRESETS = [
    {
      id: 'mga',
      name: 'MGA',
      values: {
        printerPower: 120,
        fixedCosts: 5,
        filamentPrice: 100,
        profitMargin: 150,
      },
    },
  ];

  function loadPresets() {
    try {
      const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!raw) return DEFAULT_PRESETS.map((preset) => ({ ...preset, values: { ...preset.values } }));
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('invalid');
      return parsed;
    } catch (error) {
      return DEFAULT_PRESETS.map((preset) => ({ ...preset, values: { ...preset.values } }));
    }
  }

  function savePresets(list) {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      // Storage unavailable (private mode, quota, etc.) — presets stay in-memory only.
    }
  }

  let presetsState = loadPresets();
  let editingPresetId = null;

  const presetsToggle = document.getElementById('presetsToggle');
  const presetsPanel = document.getElementById('presetsPanel');
  const presetsPanelTitle = document.getElementById('presetsPanelTitle');
  const presetsOverlay = document.getElementById('presetsOverlay');
  const presetsClose = document.getElementById('presetsClose');
  const presetsListView = document.getElementById('presetsListView');
  const presetsListEl = document.getElementById('presetsList');
  const presetAddBtn = document.getElementById('presetAddBtn');
  const presetForm = document.getElementById('presetForm');
  const presetFormBack = document.getElementById('presetFormBack');
  const presetNameInput = document.getElementById('presetName');
  const presetDeleteBtn = document.getElementById('presetDeleteBtn');
  const toast = document.getElementById('toast');

  let toastTimeout = null;

  function openPresetsPanel() {
    presetsPanel.classList.add('is-open');
    presetsOverlay.classList.add('is-visible');
    presetsPanel.setAttribute('aria-hidden', 'false');
    presetsToggle.setAttribute('aria-expanded', 'true');
  }

  function closePresetsPanel() {
    presetsPanel.classList.remove('is-open');
    presetsOverlay.classList.remove('is-visible');
    presetsPanel.setAttribute('aria-hidden', 'true');
    presetsToggle.setAttribute('aria-expanded', 'false');
    presetsPanel.addEventListener(
      'transitionend',
      function handleClosed(event) {
        if (event.propertyName !== 'transform') return;
        presetsPanel.removeEventListener('transitionend', handleClosed);
        showListView();
      }
    );
  }

  presetsToggle.addEventListener('click', () => {
    const isOpen = presetsPanel.classList.contains('is-open');
    if (isOpen) {
      closePresetsPanel();
    } else {
      openPresetsPanel();
    }
  });

  presetsClose.addEventListener('click', closePresetsPanel);
  presetsOverlay.addEventListener('click', closePresetsPanel);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePresetsPanel();
    }
  });

  function flashField(field) {
    field.classList.remove('field-flash');
    // Force reflow so the animation restarts even if it was just applied.
    void field.offsetWidth;
    field.classList.add('field-flash');
    field.addEventListener(
      'animationend',
      () => field.classList.remove('field-flash'),
      { once: true }
    );
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function describePreset(values) {
    const entries = Object.entries(values);
    if (entries.length === 0) return 'Nenhum campo definido';
    return entries
      .map(([fieldId, value]) => {
        const meta = FIELD_META[fieldId];
        if (!meta) return null;
        const formatted = meta.currency ? formatBRL(value) : `${value}${meta.unit}`;
        return `${meta.label} ${formatted}`;
      })
      .filter(Boolean)
      .join(' · ');
  }

  function applyPreset(id) {
    const preset = presetsState.find((item) => item.id === id);
    if (!preset) return;

    Object.entries(preset.values).forEach(([fieldId, value]) => {
      const field = inputs[fieldId];
      if (!field) return;
      field.value = value;
      flashField(field);
    });

    calculate();
    showToast(`Predefinição "${preset.name}" aplicada`);
    closePresetsPanel();
  }

  function createIconButton(className, label, pathHTML) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `preset-icon-btn ${className}`;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${pathHTML}</svg>`;
    return button;
  }

  function renderPresetsList() {
    presetsListEl.innerHTML = '';

    if (presetsState.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'presets-empty';
      empty.textContent = 'Nenhuma predefinição ainda. Adicione a primeira abaixo.';
      presetsListEl.appendChild(empty);
      return;
    }

    presetsState.forEach((preset) => {
      const row = document.createElement('div');
      row.className = 'preset-item-row';

      const applyButton = document.createElement('button');
      applyButton.type = 'button';
      applyButton.className = 'preset-item';
      applyButton.innerHTML = `
        <span class="preset-name"></span>
        <span class="preset-desc"></span>
      `;
      applyButton.querySelector('.preset-name').textContent = preset.name;
      applyButton.querySelector('.preset-desc').textContent = describePreset(preset.values);
      applyButton.addEventListener('click', () => applyPreset(preset.id));

      const actions = document.createElement('div');
      actions.className = 'preset-item-actions';

      const editButton = createIconButton(
        'preset-edit-btn',
        `Editar predefinição ${preset.name}`,
        '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>'
      );
      editButton.addEventListener('click', () => openEditForm(preset.id));

      const deleteButton = createIconButton(
        'preset-delete-icon-btn',
        `Excluir predefinição ${preset.name}`,
        '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>'
      );
      deleteButton.addEventListener('click', () => deletePreset(preset.id));

      actions.appendChild(editButton);
      actions.appendChild(deleteButton);

      row.appendChild(applyButton);
      row.appendChild(actions);
      presetsListEl.appendChild(row);
    });
  }

  function showListView() {
    presetForm.hidden = true;
    presetsListView.hidden = false;
    presetsPanelTitle.textContent = 'Predefinições';
    editingPresetId = null;
  }

  function showFormView() {
    presetsListView.hidden = true;
    presetForm.hidden = false;
  }

  function openAddForm() {
    editingPresetId = null;
    presetForm.reset();
    presetDeleteBtn.hidden = true;
    presetsPanelTitle.textContent = 'Nova predefinição';
    showFormView();
    presetNameInput.focus();
  }

  function openEditForm(id) {
    const preset = presetsState.find((item) => item.id === id);
    if (!preset) return;

    editingPresetId = id;
    presetForm.reset();
    presetNameInput.value = preset.name;

    Object.keys(FIELD_META).forEach((fieldId) => {
      const input = document.getElementById(`presetField-${fieldId}`);
      if (!input) return;
      input.value = Object.prototype.hasOwnProperty.call(preset.values, fieldId)
        ? preset.values[fieldId]
        : '';
    });

    presetDeleteBtn.hidden = false;
    presetsPanelTitle.textContent = 'Editar predefinição';
    showFormView();
    presetNameInput.focus();
  }

  function deletePreset(id) {
    const preset = presetsState.find((item) => item.id === id);
    if (!preset) return;
    if (!window.confirm(`Excluir a predefinição "${preset.name}"?`)) return;

    presetsState = presetsState.filter((item) => item.id !== id);
    savePresets(presetsState);
    renderPresetsList();
    if (editingPresetId === id) {
      showListView();
    }
    showToast(`Predefinição "${preset.name}" excluída`);
  }

  presetAddBtn.addEventListener('click', openAddForm);
  presetFormBack.addEventListener('click', showListView);

  presetForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = presetNameInput.value.trim();
    if (!name) {
      presetNameInput.focus();
      return;
    }

    const values = {};
    Object.keys(FIELD_META).forEach((fieldId) => {
      const input = document.getElementById(`presetField-${fieldId}`);
      if (!input) return;
      const raw = input.value.trim();
      if (raw === '') return;
      const parsed = parseFloat(raw.replace(',', '.'));
      if (Number.isFinite(parsed)) {
        values[fieldId] = parsed;
      }
    });

    if (editingPresetId) {
      presetsState = presetsState.map((item) =>
        item.id === editingPresetId ? { id: editingPresetId, name, values } : item
      );
    } else {
      const id = `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      presetsState = [...presetsState, { id, name, values }];
    }

    savePresets(presetsState);
    renderPresetsList();
    showListView();
    showToast(`Predefinição "${name}" salva`);
  });

  presetDeleteBtn.addEventListener('click', () => {
    if (editingPresetId) {
      deletePreset(editingPresetId);
    }
  });

  renderPresetsList();
})();
