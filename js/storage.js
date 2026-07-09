const AppStorage = {
    save(key, payload) {
        try {
            localStorage.setItem(`omnisuite_${key}`, JSON.stringify(payload));
        } catch (e) {
            console.error("Storage write operational array failure error:", e);
        }
    },

    load(key, fallback = null) {
        try {
            const item = localStorage.getItem(`omnisuite_${key}`);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            console.error("Storage fetch read failure operational layer error:", e);
            return fallback;
        }
    },

    purge() {
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.startsWith('omnisuite_')) {
                localStorage.removeItem(k);
            }
        });
    }
};
