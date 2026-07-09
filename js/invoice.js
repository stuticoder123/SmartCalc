const InvoiceSystem = {
    init() {
        const triggerBtn = document.getElementById('btn-trigger-invoice-preview');
        const closeModalBtn = document.getElementById('btn-close-invoice-modal');
        const dismissModalBtn = document.getElementById('btn-dismiss-invoice-modal-footer');
        
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => this.compileAndRenderPreviewModalSheet());
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.toggleInvoiceModalStateVisibility(false));
        }
        if (dismissModalBtn) {
            dismissModalBtn.addEventListener('click', () => this.toggleInvoiceModalStateVisibility(false));
        }

        this.bindExportPipelinesTriggers();
    },

    toggleInvoiceModalStateVisibility(forceStateOpen = true) {
        const modal = document.getElementById('invoice-preview-modal-overlay');
        if (!modal) return;
        if (forceStateOpen) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    },

    compileAndRenderPreviewModalSheet() {
        if (BillingEngine.itemsArray.length === 0) {
            Notifications.show("Cannot build invoice layouts parameters configurations from unassigned data tables indices", "error");
            return;
        }

        const targetSheet = document.getElementById('invoice-capture-print-target');
        if (!targetSheet) return;

        const storeLabel = document.getElementById('meta-store-name').value || 'Apex Trading Corp';
        const clientLabel = document.getElementById('meta-customer-name').value || 'Valued Client Enterprise Platform';
        const systemGeneratedInvoiceNumberString = 'INV-' + Date.now().toString().slice(-6);
        const processingDateFormattedString = new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Compute rows transformations map lists sub components layers elements
        let itemsRowsHTML = '';
        let grossRunningSum = 0;
        let cumulativeTaxSum = 0;
        let cumulativeDiscountSum = 0;

        BillingEngine.itemsArray.forEach(item => {
            const baseSub = item.qty * item.price;
            const discReduction = baseSub * (item.discount / 100);
            const taxableValueBase = baseSub - discReduction;
            const taxYieldAmount = taxableValueBase * (item.gstRate / 100);
            const absoluteRowNetFinalSum = taxableValueBase + taxYieldAmount;

            grossRunningSum += baseSub;
            cumulativeDiscountSum += discReduction;
            cumulativeTaxSum += taxYieldAmount;

            itemsRowsHTML += `
                <tr>
                    <td>${Utils.sanitizeHTML(item.name)}</td>
                    <td class="text-center">${item.qty}</td>
                    <td class="text-right">${Utils.formatCurrency(item.price)}</td>
                    <td class="text-right">${item.discount}%</td>
                    <td class="text-right">${item.gstRate}%</td>
                    <td class="text-right font-weight-600">${Utils.formatCurrency(absoluteRowNetFinalSum)}</td>
                </tr>
            `;
        });

        // Pull final global values fields directly matching parameters calculated bounds pipelines values options elements indicators
        const finalDiscountFormattedTextVal = document.getElementById('stat-discount-total').textContent;
        const finalTaxFormattedTextVal = document.getElementById('stat-tax-total').textContent;
        const finalPayableFormattedTextVal = document.getElementById('stat-payable-total').textContent;

        targetSheet.innerHTML = `
            <div class="invoice-branding-block">
                <div class="inv-brand-meta">
                    <h2>${Utils.sanitizeHTML(storeLabel)}</h2>
                    <p>Enterprise Infrastructure Operations & Logistics Solutions</p>
                </div>
                <div class="invoice-title-badge">
                    <h1>Commercial Statement</h1>
                </div>
            </div>
            <div class="invoice-parameters-segment">
                <div class="inv-param-box">
                    <h4>Billed Legal Target Entity Client</h4>
                    <p>${Utils.sanitizeHTML(clientLabel)}</p>
                </div>
                <div class="inv-param-box text-right">
                    <h4>Statement Audit Parameters</h4>
                    <p>Doc Reference: <strong>${systemGeneratedInvoiceNumberString}</strong></p>
                    <p>Processing Timestamp: ${processingDateFormattedString}</p>
                </div>
            </div>
            <table class="invoice-items-table-render">
                <thead>
                    <tr>
                        <th>Inventory Item Designation</th>
                        <th class="text-center">Count</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Reduction</th>
                        <th class="text-right">Tax Matrix</th>
                        <th class="text-right">Net Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRowsHTML}
                </tbody>
            </table>
            <div class="invoice-summaries-pull-right">
                <table class="inv-summary-table">
                    <tr>
                        <td>Aggregated Base Valuation Cost:</td>
                        <td class="text-right">${Utils.formatCurrency(grossRunningSum)}</td>
                    </tr>
                    <tr>
                        <td>Deductions/Vouchers Offsets Reductions:</td>
                        <td class="text-right" style="color:var(--danger)">-${finalDiscountFormattedTextVal}</td>
                    </tr>
                    <tr>
                        <td>Applied Consolidated GST Slabs Yields:</td>
                        <td class="text-right">${finalTaxFormattedTextVal}</td>
                    </tr>
                    <tr class="grand-total-row">
                        <td>Net Legal Payable Balance:</td>
                        <td class="text-right">${finalPayableFormattedTextVal}</td>
                    </tr>
                </table>
            </div>
            <div class="invoice-legal-disclaimer-footer">
                <p>This document is an un-signed automated computational register entry statement generated directly by OmniSuite core pipeline processing architectures. Subject to terms constraints layout agreements.</p>
            </div>
        `;

        this.toggleInvoiceModalStateVisibility(true);
    },

    bindExportPipelinesTriggers() {
        const printBtn = document.getElementById('btn-trigger-native-print');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        const downloadBtn = document.getElementById('btn-trigger-html-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const markupPayloadString = document.getElementById('invoice-capture-print-target').innerHTML;
                const stylizedStandaloneWrapperTemplateHTML = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Exported Invoice Payload Structure</title>
                        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #ECEFF1; padding: 2rem; }
                            .invoice-printable-sheet { background: white; max-width: 800px; margin: 0 auto; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                            .invoice-branding-block { display: flex; justify-content: space-between; border-bottom: 2px solid #F1F5F9; padding-bottom: 1.5rem; margin-bottom: 2rem; }
                            .inv-brand-meta h2 { color: #4F46E5; margin: 0; }
                            .invoice-title-badge h1 { margin: 0; font-size: 2rem; text-transform: uppercase; }
                            .invoice-parameters-segment { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                            .invoice-items-table-render { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                            .invoice-items-table-render th { background: #F8FAFC; padding: 0.75rem; text-align: left; border-bottom: 1px solid #E2E8F0; }
                            .invoice-items-table-render td { padding: 0.75rem; border-bottom: 1px solid #F1F5F9; }
                            .invoice-summaries-pull-right { display: flex; justify-content: flex-end; }
                            .inv-summary-table { width: 300px; }
                            .grand-total-row { font-weight: bold; font-size: 1.2rem; color: #4F46E5; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .invoice-legal-disclaimer-footer { margin-top: 3rem; text-align: center; color: #94A3B8; font-size: 0.8rem; }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-printable-sheet">${markupPayloadString}</div>
                    </body>
                    </html>
                `;

                const blob = new Blob([stylizedStandaloneWrapperTemplateHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const dlAnchorLink = document.createElement('a');
                dlAnchorLink.href = url;
                dlAnchorLink.download = `OmniSuite_Invoice_${Date.now()}.html`;
                document.body.appendChild(dlAnchorLink);
                dlAnchorLink.click();
                document.body.removeChild(dlAnchorLink);
                URL.revokeObjectURL(url);
                Notifications.show("Standalone document asset file download initiated successfully", "success");
            });
        }
    }
};
