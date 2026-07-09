const BillingEngine = {
    itemsArray: [],
    couponConfigurations: {
        'ENTERPRISE20': { type: 'percent', value: 20 },
        'MAXSAVINGS': { type: 'flat', value: 500 }
    },

    init() {
        this.loadBillStateFromStorage();
        this.registerFormInterceptors();
        this.registerLiveModifiers();
    },

    registerFormInterceptors() {
        const form = document.getElementById('billing-item-form');
        if (!form) return;

        // Dynamic handler monitoring GST selectors matrix options configs layout switches
        const gstSelector = document.getElementById('bill-item-gst-slab');
        const customWrapper = document.getElementById('custom-gst-wrapper');
        if (gstSelector && customWrapper) {
            gstSelector.addEventListener('change', () => {
                if (gstSelector.value === 'custom') {
                    customWrapper.classList.remove('hidden');
                } else {
                    customWrapper.classList.add('hidden');
                }
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processFormSubmission();
        });

        const btnClear = document.getElementById('btn-clear-item-form');
        if (btnClear) {
            btnClear.addEventListener('click', () => this.resetFormInputs());
        }

        const btnResetBill = document.getElementById('btn-reset-entire-bill');
        if (btnResetBill) {
            btnResetBill.addEventListener('click', () => this.flushEntireActiveBillState());
        }
    },

    registerLiveModifiers() {
        // Intercept Live search queries arrays modifications triggers parameters
        const searchInput = document.getElementById('table-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderItemsGridTable());
        }

        const sortTrigger = document.getElementById('table-sort-trigger');
        if (sortTrigger) {
            sortTrigger.addEventListener('change', () => this.renderItemsGridTable());
        }

        // Global adjustment structural inputs dynamic real time re-evaluation loops mapping metrics elements
        const globalAdjustmentElements = [
            'global-discount-type', 'global-discount-value', 'global-coupon-code',
            'global-shipping', 'global-service', 'margin-cost-price'
        ];
        globalAdjustmentElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.recalculateTotalsPipeline());
                el.addEventListener('change', () => {
                    if (id === 'global-discount-type') {
                        const type = el.value;
                        const valWrap = document.getElementById('global-discount-value-wrapper');
                        const coupWrap = document.getElementById('global-coupon-wrapper');
                        if (type === 'coupon') {
                            valWrap.classList.add('hidden');
                            coupWrap.classList.remove('hidden');
                        } else {
                            valWrap.classList.remove('hidden');
                            coupWrap.classList.add('hidden');
                        }
                    }
                    this.recalculateTotalsPipeline();
                });
            }
        });
    },

    processFormSubmission() {
        const nameInput = document.getElementById('bill-item-name');
        const qtyInput = document.getElementById('bill-item-qty');
        const priceInput = document.getElementById('bill-item-price');
        const discInput = document.getElementById('bill-item-discount');
        const gstSelector = document.getElementById('bill-item-gst-slab');
        const customGstInput = document.getElementById('bill-item-custom-gst');
        const editIdInput = document.getElementById('edit-item-id');

        const name = nameInput.value.trim();
        const qty = parseInt(qtyInput.value) || 1;
        const price = parseFloat(priceInput.value) || 0;
        const discount = parseFloat(discInput.value) || 0;
        
        if (!name || qty <= 0 || price < 0) {
            Notifications.show("Validation failure. Ensure accurate parameters fields maps arrays constraints", "error");
            return;
        }

        let gstRate = 0;
        if (gstSelector.value === 'custom') {
            gstRate = parseFloat(customGstInput.value) || 0;
        } else {
            gstRate = parseFloat(gstSelector.value) || 0;
        }

        const existingId = editIdInput.value;
        if (existingId) {
            // Edit runtime matching indices loop update phase structure model logic mapping array configuration
            const item = this.itemsArray.find(i => i.id === existingId);
            if (item) {
                item.name = name;
                item.qty = qty;
                item.price = price;
                item.discount = discount;
                item.gstRate = gstRate;
                Notifications.show("Item entry data attributes committed and synced successfully", "success");
            }
        } else {
            // New Entry addition cycle pipeline context layout mapping elements matrix allocation configurations
            const newItem = {
                id: Utils.generateUUID(),
                name, qty, price, discount, gstRate
            };
            this.itemsArray.push(newItem);
            Notifications.show("New item structured entity matrix committed to grid layer tracking metrics", "success");
        }

        this.resetFormInputs();
        this.recalculateTotalsPipeline();
        AppStorage.save('billing_items_stack', this.itemsArray);
    },

    resetFormInputs() {
        document.getElementById('billing-item-form').reset();
        document.getElementById('edit-item-id').value = '';
        document.getElementById('custom-gst-wrapper').classList.add('hidden');
        document.getElementById('btn-submit-item-form').textContent = "Commit Entry Array";
    },

    recalculateTotalsPipeline() {
        let grossRunningSum = 0;
        let cumulativeTaxSum = 0;
        let cumulativeDiscountSum = 0;

        this.itemsArray.forEach(item => {
            const baseSub = item.qty * item.price;
            const itemDiscReduction = baseSub * (item.discount / 100);
            const taxableValueBase = baseSub - itemDiscReduction;
            const taxYieldAmount = taxableValueBase * (item.gstRate / 100);
            
            grossRunningSum += baseSub;
            cumulativeDiscountSum += itemDiscReduction;
            cumulativeTaxSum += taxYieldAmount;
        });

        // Global modifiers calculation mapping functions variables arrays blocks layouts parameters configurations elements
        let grandReductionTotalNetValue = cumulativeDiscountSum;
        const globalDiscountType = document.getElementById('global-discount-type').value;
        const globalDiscountVal = parseFloat(document.getElementById('global-discount-value').value) || 0;
        
        if (globalDiscountType === 'flat') {
            grandReductionTotalNetValue += globalDiscountVal;
        } else if (globalDiscountType === 'percent') {
            const baseForGlobal = grossRunningSum - cumulativeDiscountSum;
            grandReductionTotalNetValue += (baseForGlobal * (globalDiscountVal / 100));
        } else if (globalDiscountType === 'coupon') {
            const couponCode = document.getElementById('global-coupon-code').value.trim().toUpperCase();
            if (this.couponConfigurations[couponCode]) {
                const conf = this.couponConfigurations[couponCode];
                if (conf.type === 'flat') {
                    grandReductionTotalNetValue += conf.value;
                } else {
                    const baseForGlobal = grossRunningSum - cumulativeDiscountSum;
                    grandReductionTotalNetValue += (baseForGlobal * (conf.value / 100));
                }
            }
        }

        const shippingCosts = parseFloat(document.getElementById('global-shipping').value) || 0;
        const serviceChargesFees = parseFloat(document.getElementById('global-service').value) || 0;
        
        const subtotalStepOne = grossRunningSum - grandReductionTotalNetValue;
        const netPayableFinalValuation = Math.max(0, subtotalStepOne + cumulativeTaxSum + shippingCosts + serviceChargesFees);

        // Update statistical visualization widgets dynamic texts segments metrics numbers counter panels
        document.getElementById('stat-gross-total').textContent = Utils.formatCurrency(grossRunningSum);
        document.getElementById('stat-tax-total').textContent = Utils.formatCurrency(cumulativeTaxSum);
        document.getElementById('stat-discount-total').textContent = Utils.formatCurrency(grandReductionTotalNetValue);
        document.getElementById('stat-payable-total').textContent = Utils.formatCurrency(netPayableFinalValuation);
        
        const revenueField = document.getElementById('margin-selling-price');
        if (revenueField) revenueField.value = netPayableFinalValuation.toFixed(2);

        this.computeProfitMarginsMetrics(netPayableFinalValuation);
        this.renderItemsGridTable();
        
        // Sync active state counters metrics values widgets directly to dashboard main layout displays components channels
        const activeBillStatBox = document.getElementById('dash-stat-bill');
        if (activeBillStatBox) activeBillStatBox.textContent = Utils.formatCurrency(netPayableFinalValuation);
    },

    computeProfitMarginsMetrics(revenueValuation) {
        const costInput = parseFloat(document.getElementById('margin-cost-price').value) || 0;
        const yieldBox = document.getElementById('margin-yield-value');
        const ratioBox = document.getElementById('margin-ratio-value');
        const outputStrip = document.getElementById('margin-results-output');

        if (!yieldBox || !ratioBox) return;

        const dynamicYieldDiff = revenueValuation - costInput;
        yieldBox.textContent = Utils.formatCurrency(dynamicYieldDiff);

        if (costInput > 0) {
            const ratioPercentageFactor = (dynamicYieldDiff / costInput) * 100;
            ratioBox.textContent = ratioPercentageFactor.toFixed(2) + '%';
        } else {
            ratioBox.textContent = '0.00%';
        }

        if (dynamicYieldDiff >= 0) {
            if (outputStrip) { outputStrip.style.borderLeft = "4px solid var(--success)"; }
            yieldBox.style.color = "var(--success)";
        } else {
            if (outputStrip) { outputStrip.style.borderLeft = "4px solid var(--danger)"; }
            yieldBox.style.color = "var(--danger)";
        }
    },

    renderItemsGridTable() {
        const tbody = document.getElementById('billing-table-body');
        const emptyState = document.getElementById('billing-table-empty');
        if (!tbody) return;

        let trackingList = [...this.itemsArray];

        // Process active validation layers sorting constraints data stack arrays items
        const searchQuery = document.getElementById('table-search-input')?.value.toLowerCase().trim() || '';
        if (searchQuery) {
            trackingList = trackingList.filter(i => i.name.toLowerCase().includes(searchQuery));
        }

        const sortMode = document.getElementById('table-sort-trigger')?.value || 'index-asc';
        if (sortMode === 'name-asc') {
            trackingList.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMode === 'name-desc') {
            trackingList.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortMode === 'total-desc') {
            trackingList.sort((a, b) => (b.qty * b.price) - (a.qty * a.price));
        } else if (sortMode === 'total-asc') {
            trackingList.sort((a, b) => (a.qty * a.price) - (b.qty * b.price));
        }

        if (trackingList.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        tbody.innerHTML = trackingList.map(item => {
            const baseSub = item.qty * item.price;
            const discValue = baseSub * (item.discount / 100);
            const netSub = baseSub - discValue + (baseSub - discValue) * (item.gstRate / 100);

            return `
                <tr data-item-id="${item.id}">
                    <td class="font-weight-600">${Utils.sanitizeHTML(item.name)}</td>
                    <td class="text-center">
                        <div class="qty-control-cluster">
                            <button type="button" class="qty-btn btn-decrease-qty-modifier" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
                            <span class="qty-display-span">${item.qty}</span>
                            <button type="button" class="qty-btn btn-increase-qty-modifier" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </td>
                    <td class="text-right">${Utils.formatCurrency(item.price)}</td>
                    <td class="text-right text-muted">${item.discount}%</td>
                    <td class="text-right text-muted">${item.gstRate}%</td>
                    <td class="text-right font-weight-700">${Utils.formatCurrency(netSub)}</td>
                    <td class="text-center">
                        <div class="actions-cell-flex">
                            <button type="button" class="table-icon-op-btn btn-edit-item" data-id="${item.id}" title="Modify Structural Index Data"><i class="fa-solid fa-pen"></i></button>
                            <button type="button" class="table-icon-op-btn btn-duplicate-item" data-id="${item.id}" title="Duplicate Item Records Entity"><i class="fa-solid fa-clone"></i></button>
                            <button type="button" class="table-icon-op-btn btn-delete-item" data-id="${item.id}" title="Purge Record Array index mapping"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.bindInlineTableOperationsEvents();
    },

    bindInlineTableOperationsEvents() {
        const tbody = document.getElementById('billing-table-body');
        if (!tbody) return;

        tbody.querySelectorAll('.btn-increase-qty-modifier').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = this.itemsArray.find(i => i.id === btn.getAttribute('data-id'));
                if (item) { item.qty++; this.commitStateChangesToMemoryStack(); }
            });
        });

        tbody.querySelectorAll('.btn-decrease-qty-modifier').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = this.itemsArray.find(i => i.id === btn.getAttribute('data-id'));
                if (item && item.qty > 1) { item.qty--; this.commitStateChangesToMemoryStack(); }
            });
        });

        tbody.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-id');
                this.itemsArray = this.itemsArray.filter(i => i.id !== targetId);
                Notifications.show("Item purged from operational layout ledger context arrays", "warning");
                this.commitStateChangesToMemoryStack();
            });
        });

        tbody.querySelectorAll('.btn-duplicate-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const srcItem = this.itemsArray.find(i => i.id === btn.getAttribute('data-id'));
                if (srcItem) {
                    const copy = { ...srcItem, id: Utils.generateUUID(), name: srcItem.name + ' (Copy)' };
                    this.itemsArray.push(copy);
                    Notifications.show("Duplicated selected entity record model parameters array element", "info");
                    this.commitStateChangesToMemoryStack();
                }
            });
        });

        tbody.querySelectorAll('.btn-edit-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = this.itemsArray.find(i => i.id === btn.getAttribute('data-id'));
                if (item) {
                    document.getElementById('edit-item-id').value = item.id;
                    document.getElementById('bill-item-name').value = item.name;
                    document.getElementById('bill-item-qty').value = item.qty;
                    document.getElementById('bill-item-price').value = item.price;
                    document.getElementById('bill-item-discount').value = item.discount;
                    
                    const gstSelector = document.getElementById('bill-item-gst-slab');
                    if ([0, 5, 12, 18, 28].includes(item.gstRate)) {
                        gstSelector.value = String(item.gstRate);
                        document.getElementById('custom-gst-wrapper').classList.add('hidden');
                    } else {
                        gstSelector.value = 'custom';
                        const customGstInput = document.getElementById('bill-item-custom-gst');
                        customGstInput.value = item.gstRate;
                        document.getElementById('custom-gst-wrapper').classList.remove('hidden');
                    }
                    
                    document.getElementById('btn-submit-item-form').textContent = "Update Committed Attributes";
                    Notifications.show("Item configurations variables populated into editing panels input arrays elements", "info");
                    document.getElementById('bill-item-name').focus();
                }
            });
        });
    },

    commitStateChangesToMemoryStack() {
        AppStorage.save('billing_items_stack', this.itemsArray);
        this.recalculateTotalsPipeline();
    },

    loadBillStateFromStorage() {
        this.itemsArray = AppStorage.load('billing_items_stack', []);
        this.recalculateTotalsPipeline();
    },

    flushEntireActiveBillState() {
        this.itemsArray = [];
        this.resetFormInputs();
        this.commitStateChangesToMemoryStack();
        Notifications.show("Flushed and clean initialized billing system records tables models arrays", "info");
    }
};
