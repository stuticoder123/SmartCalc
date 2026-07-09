const StudentCalculator = {
    screenValue: '0',
    expressionValue: '',
    memoryRegister: 0,
    resetOnNextInput: false,

    init() {
        this.registerKeypadListeners();
        this.loadHistoryFromStorage();
    },

    registerKeypadListeners() {
        const keypad = document.querySelector('.calculator-keypad');
        if (!keypad) return;

        keypad.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-calc');
            if (!target) return;
            const command = target.getAttribute('data-calc');
            this.executeAction(command);
        });

        // Native hardware key interception loops mapping bindings modules
        document.addEventListener('keydown', (e) => {
            const activeView = document.querySelector('.workspace-view.view-active');
            if (!activeView || activeView.id !== 'view-calculator') return;

            const key = e.key;
            if (/[0-9.]/.test(key)) {
                this.executeAction(key);
            } else if (['+', '-', '*', '/'].includes(key)) {
                this.executeAction(key);
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                this.executeAction('=');
            } else if (key === 'Backspace') {
                this.executeAction('DEL');
            } else if (key === 'Escape') {
                this.executeAction('C');
            }
        });

        const historyClearBtn = document.getElementById('btn-clear-calc-history');
        if (historyClearBtn) {
            historyClearBtn.addEventListener('click', () => this.clearHistoryStack());
        }
    },

    executeAction(command) {
        const screen = document.getElementById('calc-screen');
        const exprView = document.getElementById('calc-expression');
        if (!screen) return;

        if (this.resetOnNextInput && /[0-9.]/.test(command)) {
            this.screenValue = '0';
            this.resetOnNextInput = false;
        }

        switch(command) {
            case 'C':
                this.screenValue = '0';
                this.expressionValue = '';
                document.getElementById('calc-op-indicator').textContent = '';
                break;
            case 'DEL':
                this.screenValue = this.screenValue.slice(0, -1);
                if (this.screenValue === '' || this.screenValue === '-') this.screenValue = '0';
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                this.expressionValue = parseFloat(this.screenValue) + ' ' + command + ' ';
                document.getElementById('calc-op-indicator').textContent = command;
                this.resetOnNextInput = true;
                break;
            case 'mod':
                this.expressionValue = parseFloat(this.screenValue) + ' % ';
                this.resetOnNextInput = true;
                break;
            case 'pow':
                this.expressionValue = parseFloat(this.screenValue) + ' ^ ';
                this.resetOnNextInput = true;
                break;
            case 'sqr':
                const valSqr = parseFloat(this.screenValue);
                this.expressionValue = `sqr(${valSqr})`;
                this.screenValue = String(valSqr * valSqr);
                this.commitHistoryRecord(this.expressionValue, this.screenValue);
                this.resetOnNextInput = true;
                break;
            case 'cube':
                const valCube = parseFloat(this.screenValue);
                this.expressionValue = `cube(${valCube})`;
                this.screenValue = String(valCube * valCube * valCube);
                this.commitHistoryRecord(this.expressionValue, this.screenValue);
                this.resetOnNextInput = true;
                break;
            case 'sqrt':
                const valSqrt = parseFloat(this.screenValue);
                if (valSqrt < 0) {
                    this.screenValue = 'Error';
                    Notifications.show("Invalid mathematical domain operation input payload", "error");
                } else {
                    this.expressionValue = `sqrt(${valSqrt})`;
                    this.screenValue = String(Math.sqrt(valSqrt));
                    this.commitHistoryRecord(this.expressionValue, this.screenValue);
                }
                this.resetOnNextInput = true;
                break;
            case 'pct':
                const valPct = parseFloat(this.screenValue);
                this.screenValue = String(valPct / 100);
                this.resetOnNextInput = true;
                break;
            case 'MC':
                this.memoryRegister = 0;
                Notifications.show("Memory tracking register flushed clean", "info");
                break;
            case 'MR':
                this.screenValue = String(this.memoryRegister);
                this.resetOnNextInput = true;
                break;
            case 'M+':
                this.memoryRegister += parseFloat(this.screenValue) || 0;
                Notifications.show("Value added to internal memory cache context", "success");
                this.resetOnNextInput = true;
                break;
            case 'M-':
                this.memoryRegister -= parseFloat(this.screenValue) || 0;
                Notifications.show("Value deducted from memory register arrays", "info");
                this.resetOnNextInput = true;
                break;
            case '=':
                this.evaluateComplexExpression();
                break;
            default:
                if (this.screenValue === '0' && command !== '.') {
                    this.screenValue = command;
                } else {
                    if (command === '.' && this.screenValue.includes('.')) return;
                    this.screenValue += command;
                }
                break;
        }

        screen.value = this.screenValue;
        if (exprView) exprView.textContent = this.expressionValue;
        
        // Dynamic dashboard analytics sync engine mapping metrics increment configurations
        const currentCount = AppStorage.load('calc_history_stack', []).length;
        const targetCountContainer = document.getElementById('dash-stat-calc');
        if (targetCountContainer) targetCountContainer.textContent = currentCount;
    },

    evaluateComplexExpression() {
        if (!this.expressionValue) return;
        
        let result = 0;
        const baseOperand = parseFloat(this.expressionValue);
        const currentOperand = parseFloat(this.screenValue);
        const tokens = this.expressionValue.trim().split(' ');
        const operator = tokens[1];

        this.expressionValue += this.screenValue + ' =';

        try {
            switch(operator) {
                case '+': result = baseOperand + currentOperand; break;
                case '-': result = baseOperand - currentOperand; break;
                case '*': result = baseOperand * currentOperand; break;
                case '/': 
                    if (currentOperand === 0) throw new Error("DivZero");
                    result = baseOperand / currentOperand; 
                    break;
                case '%': result = baseOperand % currentOperand; break;
                case '^': result = Math.pow(baseOperand, currentOperand); break;
                default: return;
            }
            this.screenValue = String(result);
            this.commitHistoryRecord(this.expressionValue, this.screenValue);
        } catch (err) {
            this.screenValue = 'Error';
            Notifications.show("Arithmetic runtime computational anomaly matrix error", "error");
        }
        document.getElementById('calc-op-indicator').textContent = '';
        this.resetOnNextInput = true;
    },

    commitHistoryRecord(expr, res) {
        const stack = AppStorage.load('calc_history_stack', []);
        stack.unshift({ id: Date.now(), expression: expr, result: res });
        if (stack.length > 20) stack.pop();
        AppStorage.save('calc_history_stack', stack);
        this.renderHistoryUIElements();
    },

    loadHistoryFromStorage() {
        this.renderHistoryUIElements();
    },

    renderHistoryUIElements() {
        const container = document.getElementById('calc-history-list');
        if (!container) return;

        const stack = AppStorage.load('calc_history_stack', []);
        if (stack.length === 0) {
            container.innerHTML = '<div class="empty-state-text">No previous calculations recorded in current sequence.</div>';
            return;
        }

        container.innerHTML = stack.map(item => `
            <div class="calc-history-item" data-history-res="${Utils.sanitizeHTML(item.result)}">
                <span class="history-item-exp">${Utils.sanitizeHTML(item.expression)}</span>
                <span class="history-item-res">${Utils.sanitizeHTML(item.result)}</span>
            </div>
        `).join('');

        // Intercept click sequences to recall previous history results payload blocks directly to current buffers
        container.querySelectorAll('.calc-history-item').forEach(el => {
            el.addEventListener('click', () => {
                this.screenValue = el.getAttribute('data-history-res');
                const screen = document.getElementById('calc-screen');
                if (screen) screen.value = this.screenValue;
                Notifications.show("Recalled historic valuation index context to memory buffers", "success");
            });
        });
    },

    clearHistoryStack() {
        AppStorage.save('calc_history_stack', []);
        this.renderHistoryUIElements();
        Notifications.show("Cleared historic calculation structures records", "info");
    }
};
