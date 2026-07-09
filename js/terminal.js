const WarpTerminal = {
    commandHistoryStack: [],
    historyPointerIndex: -1,
    commandsMapRegistry: {
        'help': 'Display execution paradigm command structural specifications guide arrays.',
        'clear': 'Flush text rendering nodes canvas view terminal viewport panels.',
        'history': 'Render all preceding commands parameters passed in single run sequence state.',
        'add': 'Inject elements models arrays directly. Structure layout formatting syntax: add [name] [qty] [price]',
        'delete': 'Purge matching items string label rows elements from active data records. Usage style format syntax: delete [name]',
        'total': 'Print current computed net commercial totals aggregated balance indicators directly to console display blocks.',
        'reset': 'Flush memory ledger tracking indexes tables data structures modules completely.',
        'print': 'Compile structural system layouts directly to global preview rendering models canvases widgets blocks.'
    },

    init() {
        this.registerTerminalInputInterceptors();
    },

    registerTerminalInputInterceptors() {
        const input = document.getElementById('terminal-command-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key === 'Enter') {
                const line = input.value.trim();
                if (line) this.processTerminalCommandExecution(line);
                input.value = '';
                document.getElementById('terminal-suggest-hint').textContent = '';
            } else if (key === 'Tab') {
                e.preventDefault();
                this.autocompleteActiveTerminalInputHint();
            } else if (key === 'ArrowUp') {
                e.preventDefault();
                this.traverseHistoryStackDirectionalStep(-1);
            } else if (key === 'ArrowDown') {
                e.preventDefault();
                this.traverseHistoryStackDirectionalStep(1);
            }
        });

        input.addEventListener('input', () => {
            this.renderAutosuggestOverlayHintString();
        });

        // Ensure clicking on the pseudo console layout view triggers auto focus directly back to input line
        const viewport = document.getElementById('terminal-scroller-area');
        if (viewport) {
            viewport.addEventListener('click', () => input.focus());
        }
    },

    processTerminalCommandExecution(lineString) {
        this.commandHistoryStack.push(lineString);
        this.historyPointerIndex = this.commandHistoryStack.length;
        AppStorage.save('terminal_cmd_history_stack', this.commandHistoryStack);

        this.appendTerminalLogLine(`core-node-user@omnisuite:~# ${lineString}`, 'cmd-entry');

        const parts = lineString.split(/\s+/);
        const primaryCommandKeyword = parts[0].toLowerCase();
        const argsArray = parts.slice(1);

        switch(primaryCommandKeyword) {
            case 'help':
                this.renderTerminalHelpGuideBlock();
                break;
            case 'clear':
                document.getElementById('terminal-history-log-output').innerHTML = '';
                break;
            case 'history':
                this.commandHistoryStack.forEach((h, i) => this.appendTerminalLogLine(`  ${i+1}  ${h}`));
                break;
            case 'add':
                this.executeTerminalAddOperation(argsArray);
                break;
            case 'delete':
                this.executeTerminalDeleteOperation(argsArray);
                break;
            case 'total':
                const runningPayableValuation = document.getElementById('stat-payable-total')?.textContent || '₹0.00';
                this.appendTerminalLogLine(`Aggregated Current Billing Statement Balance Valuation Counter: ${runningPayableValuation}`, 'msg-success');
                break;
            case 'reset':
                BillingEngine.flushEntireActiveBillState();
                this.appendTerminalLogLine("Flushed structural running item arrays stack maps successfully", "msg-warning");
                break;
            case 'print':
                const previewBtn = document.getElementById('btn-trigger-invoice-preview');
                if (previewBtn) {
                    previewBtn.click();
                    this.appendTerminalLogLine("Triggered external compilation loop for commercial digital layouts", "msg-success");
                }
                break;
            default:
                this.appendTerminalLogLine(`Terminal Command syntax error exception identifier string: '${primaryCommandKeyword}' matching index configuration matrix profile not encountered.`, 'msg-error');
                break;
        }

        this.scrollTerminalToBottomBaselineCoordinates();
        
        // Sync incremental state back to telemetry monitors analytics panels blocks counters
        const targetCounterBadge = document.getElementById('dash-stat-cli');
        if (targetCounterBadge) targetCounterBadge.textContent = `${this.commandHistoryStack.length} Cmds`;
    },

    executeTerminalAddOperation(args) {
        if (args.length < 3) {
            this.appendTerminalLogLine("Syntax parameter structural validation boundary check anomaly failure. Structure: add [name] [qty] [price]", "msg-error");
            return;
        }
        const name = args[0];
        const qty = parseInt(args[1]);
        const price = parseFloat(args[2]);

        if (!name || isNaN(qty) || isNaN(price)) {
            this.appendTerminalLogLine("Invalid parameter format cast assignments.", "msg-error");
            return;
        }

        const addedItemElement = {
            id: Utils.generateUUID(),
            name, qty, price, discount: 0, gstRate: 18
        };
        BillingEngine.itemsArray.push(addedItemElement);
        BillingEngine.commitStateChangesToMemoryStack();
        this.appendTerminalLogLine(`Entity '${name}' successfully appended into data grid indexes tracking layout matrices models.`, 'msg-success');
    },

    executeTerminalDeleteOperation(args) {
        if (args.length < 1) {
            this.appendTerminalLogLine("Missing parameter token input context configurations. Structure layout format syntax rule: delete [name]", "msg-error");
            return;
        }
        const targetStringMatchLabel = args[0].toLowerCase();
        const initialCount = BillingEngine.itemsArray.length;
        BillingEngine.itemsArray = BillingEngine.itemsArray.filter(i => !i.name.toLowerCase().includes(targetStringMatchLabel));
        
        if (BillingEngine.itemsArray.length < initialCount) {
            BillingEngine.commitStateChangesToMemoryStack();
            this.appendTerminalLogLine(`Purged tracking item records arrays instances containing identifier label pattern string context matches: '${targetStringMatchLabel}'`, 'msg-success');
        } else {
            this.appendTerminalLogLine(`No existing matching entry item records labels encountered matching pattern specification filters values constraints: '${targetStringMatchLabel}'`, 'msg-error');
        }
    },

    appendTerminalLogLine(text, classModifierString = '') {
        const logBox = document.getElementById('terminal-history-log-output');
        if (!logBox) return;

        const row = document.createElement('div');
        row.className = `terminal-log-row ${classModifierString}`;
        row.innerHTML = text;
        logBox.appendChild(row);
    },

    renderTerminalHelpGuideBlock() {
        let helpHTML = '<div class="terminal-help-container-block">';
        for (const [cmd, desc] of Object.entries(this.commandsMapRegistry)) {
            helpHTML += `
                <div class="terminal-help-grid">
                    <span class="terminal-help-cmd">${cmd}</span>
                    <span class="terminal-help-desc">- ${desc}</span>
                </div>
            `;
        }
        helpHTML += '</div>';
        this.appendTerminalLogLine(helpHTML);
    },

    renderAutosuggestOverlayHintString() {
        const input = document.getElementById('terminal-command-input');
        const hint = document.getElementById('terminal-suggest-hint');
        if (!input || !hint) return;

        const val = input.value.toLowerCase().trim();
        if (!val) { hint.textContent = ''; return; }

        const match = Object.keys(this.commandsMapRegistry).find(k => k.startsWith(val));
        if (match) {
            const staticInputLengthOffsetString = input.value;
            const dynamicCompletionSegmentsRemainderTokens = match.slice(val.length);
            hint.textContent = staticInputLengthOffsetString + dynamicCompletionSegmentsRemainderTokens;
        } else {
            hint.textContent = '';
        }
    },

    autocompleteActiveTerminalInputHint() {
        const hint = document.getElementById('terminal-suggest-hint');
        const input = document.getElementById('terminal-command-input');
        if (hint && input && hint.textContent) {
            input.value = hint.textContent;
            hint.textContent = '';
        }
    },

    traverseHistoryStackDirectionalStep(directionOffset) {
        if (this.commandHistoryStack.length === 0) return;
        this.historyPointerIndex += directionOffset;
        
        if (this.historyPointerIndex < 0) this.historyPointerIndex = 0;
        if (this.historyPointerIndex > this.commandHistoryStack.length) {
            this.historyPointerIndex = this.commandHistoryStack.length;
        }

        const input = document.getElementById('terminal-command-input');
        if (!input) return;

        if (this.historyPointerIndex === this.commandHistoryStack.length) {
            input.value = '';
        } else {
            input.value = this.commandHistoryStack[this.historyPointerIndex];
        }
        this.renderAutosuggestOverlayHintString();
    },

    scrollTerminalToBottomBaselineCoordinates() {
        const scroller = document.getElementById('terminal-scroller-area');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }
};
