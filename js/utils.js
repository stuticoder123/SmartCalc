const Utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    },

    generateUUID() {
        return 'inv_idx_' + Math.random().toString(36).substring(2, 11);
    },

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    animateCounter(elementId, start, end, duration) {
        const obj = document.getElementById(elementId);
        if (!obj) return;
        if (start === end) {
            obj.textContent = end;
            return;
        }
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        const timer = setInterval(() => {
            current += increment;
            obj.textContent = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime || 1);
    }
};
