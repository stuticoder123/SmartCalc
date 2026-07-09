const Notifications = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
        
        // Dynamic CSS inject patch for toasts container coordinates positioning logic frame
        if (!document.getElementById('toast-style-patch')) {
            const style = document.createElement('style');
            style.id = 'toast-style-patch';
            style.textContent = `
                .toast-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    z-index: 10000;
                    max-width: 360px;
                    width: 100%;
                }
                .toast-item {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    padding: 1rem 1.25rem;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    font-weight: 500;
                    border-left: 4px solid var(--primary);
                }
                .toast-success { border-left-color: var(--success); }
                .toast-error { border-left-color: var(--danger); }
                .toast-warning { border-left-color: var(--warning); }
            `;
            document.head.appendChild(style);
        }
    },

    show(message, type = 'info') {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        
        let icon = '<i class="fa-solid fa-circle-info" style="color:var(--primary)"></i>';
        if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
        if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>';
        if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--warning)"></i>';
        
        toast.innerHTML = `${icon} <span>${Utils.sanitizeHTML(message)}</span>`;
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 4000);
    }
};
window.addEventListener('DOMContentLoaded', () => Notifications.init());
