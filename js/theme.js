const ThemeEngine = {
    currentTheme: 'light',
    currentAccent: '#4F46E5',

    init() {
        this.currentTheme = AppStorage.load('theme', 'light');
        this.currentAccent = AppStorage.load('accent_color', '#4F46E5');
        const customFont = AppStorage.load('font_size_scale', '16px');
        
        this.applyTheme(this.currentTheme);
        this.applyAccent(this.currentAccent);
        this.applyFontSize(customFont);
    },

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        AppStorage.save('theme', theme);
        
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        }
    },

    applyAccent(color) {
        this.currentAccent = color;
        document.documentElement.style.setProperty('--primary', color);
        AppStorage.save('accent_color', color);
    },

    applyFontSize(size) {
        document.documentElement.style.setProperty('font-size', size);
        AppStorage.save('font_size_scale', size);
        const selector = document.getElementById('setting-system-font-size-scale');
        if (selector) selector.value = size;
    },

    toggle() {
        this.applyTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    }
};
