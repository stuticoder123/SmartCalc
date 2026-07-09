/* js/app.js */
const OmniSuiteAppHubCore = {
  init () {
    ThemeEngine.init ();
    this.registerWorkspaceNavigationInterceptors ();
    this.registerGlobalSettingsPanelMechanisms ();
    this.initLiveSystemTelemetryClock ();

    // Secondary sub systems bootstrapping execution phase structures
    StudentCalculator.init ();
    BillingEngine.init ();
    WarpTerminal.init ();
    InvoiceSystem.init ();

    Notifications.show (
      'OmniSuite Core environments execution pipelines hot reloaded clean state',
      'success'
    );
  },

  registerWorkspaceNavigationInterceptors () {
    const portalScreen = document.getElementById ('portal-screen');
    const dashboardLayout = document.getElementById ('dashboard-layout');

    const btnLaunchCalc = document.getElementById ('btn-select-calc');
    const btnLaunchBill = document.getElementById ('btn-select-billing');

    const switchViewAndShowDashboard = (
      targetViewId,
      viewHeaderTitleString
    ) => {
      portalScreen.classList.add ('hidden');
      dashboardLayout.classList.remove ('hidden');
      this.switchActiveViewportTab (targetViewId, viewHeaderTitleString);
    };

    if (btnLaunchCalc) {
      btnLaunchCalc.addEventListener ('click', () =>
        switchViewAndShowDashboard (
          'view-calculator',
          'Student Computational Layout Module'
        )
      );
    }
    if (btnLaunchBill) {
      btnLaunchBill.addEventListener ('click', () =>
        switchViewAndShowDashboard (
          'view-billing',
          'Shopkeeper Enterprise Modular Billing Workspace'
        )
      );
    }

    // Sidebar Navigation Links Maps mappings tracking loops
    const navMap = [
      {
        btnId: 'nav-dash',
        viewId: 'view-dashboard',
        title: 'Workspace Performance Telemetry Monitor',
      },
      {
        btnId: 'nav-calc',
        viewId: 'view-calculator',
        title: 'Student Computational Layout Module',
      },
      {
        btnId: 'nav-billing',
        viewId: 'view-billing',
        title: 'Shopkeeper Enterprise Modular Billing Workspace',
      },
      {
        btnId: 'nav-terminal',
        viewId: 'view-terminal',
        title: 'Warp Parallel Sandbox Command Shell Line',
      },
      {
        btnId: 'launch-card-calc',
        viewId: 'view-calculator',
        title: 'Student Computational Layout Module',
      },
      {
        btnId: 'launch-card-bill',
        viewId: 'view-billing',
        title: 'Shopkeeper Enterprise Modular Billing Workspace',
      },
    ];

    navMap.forEach (route => {
      const el = document.getElementById (route.btnId);
      if (el) {
        el.addEventListener ('click', () =>
          this.switchActiveViewportTab (route.viewId, route.title)
        );
      }
    });

    const btnExit = document.getElementById ('btn-exit-workspace');
    if (btnExit) {
      btnExit.addEventListener ('click', () => {
        dashboardLayout.classList.add ('hidden');
        portalScreen.classList.remove ('hidden');
        Notifications.show (
          'Returned to master node application selection environment layer',
          'info'
        );
      });
    }

    const themeToggle = document.getElementById ('theme-toggle-btn');
    if (themeToggle) {
      themeToggle.addEventListener ('click', () => ThemeEngine.toggle ());
    }
  },

  switchActiveViewportTab (targetViewId, topBarTitleMicrocopyText) {
    // Remove active layout styling definitions parameter fields modifiers from all tab elements registers
    document
      .querySelectorAll ('.workspace-view')
      .forEach (view => view.classList.remove ('view-active'));
    document
      .querySelectorAll ('.nav-item')
      .forEach (btn => btn.classList.remove ('active'));

    const matchView = document.getElementById (targetViewId);
    if (matchView) matchView.classList.add ('view-active');

    // Toggle Sidebar button highlight markers indicators
    const navMapBtnIdLookup = {
      'view-dashboard': 'nav-dash',
      'view-calculator': 'nav-calc',
      'view-billing': 'nav-billing',
      'view-terminal': 'nav-terminal',
    };
    const activeBtn = document.getElementById (navMapBtnIdLookup[targetViewId]);
    if (activeBtn) activeBtn.classList.add ('active');

    const headerTitleObj = document.getElementById ('top-bar-title');
    if (headerTitleObj) headerTitleObj.textContent = topBarTitleMicrocopyText;
  },

  registerGlobalSettingsPanelMechanisms () {
    const overlay = document.getElementById ('settings-modal-overlay');
    const openBtn = document.getElementById ('btn-open-settings');
    const closeBtn = document.getElementById ('btn-close-settings-modal');
    const saveBtn = document.getElementById ('btn-save-close-settings-modal');
    const fontSelector = document.getElementById (
      'setting-system-font-size-scale'
    );
    const purgeBtn = document.getElementById ('btn-purge-localstorage-cache');

    const toggleSettings = openState => {
      if (openState) {
        overlay.classList.remove ('hidden');
      } else {
        overlay.classList.add ('hidden');
      }
    };

    if (openBtn)
      openBtn.addEventListener ('click', () => toggleSettings (true));
    if (closeBtn)
      closeBtn.addEventListener ('click', () => toggleSettings (false));
    if (saveBtn)
      Axel = saveBtn.addEventListener ('click', () => {
        toggleSettings (false);
        Notifications.show (
          'Global visualization environment parameters successfully compiled and finalized',
          'success'
        );
      });

    // Accent swatches binding events iterations loop cycles setup logic arrays
    document.querySelectorAll ('.accent-swatch-btn').forEach (swatch => {
      swatch.addEventListener ('click', () => {
        document
          .querySelectorAll ('.accent-swatch-btn')
          .forEach (b => b.classList.remove ('active'));
        swatch.classList.add ('active');
        const targetColorHexValueString = swatch.getAttribute (
          'data-accent-color'
        );
        ThemeEngine.applyAccent (targetColorHexValueString);
      });
    });

    // Interface mode configuration button array blocks layout mappings
    document.querySelectorAll ('.pattern-theme-selector').forEach (btn => {
      btn.addEventListener ('click', () => {
        const targetThemeKey = btn.getAttribute ('data-theme-target');
        ThemeEngine.applyTheme (targetThemeKey);
      });
    });

    if (fontSelector) {
      fontSelector.addEventListener ('change', () => {
        ThemeEngine.applyFontSize (fontSelector.value);
      });
    }

    if (purgeBtn) {
      purgeBtn.addEventListener ('click', () => {
        if (
          confirm (
            'Are you absolutely sure you want to completely clear the local memory register files stack? Application states parameters tracking configurations will be lost and reverted back to fresh instantiation arrays baselines parameters rules metrics models.'
          )
        ) {
          AppStorage.purge ();
          Notifications.show (
            'Memory tracking layers erased clean. Reloading active instance layout structures context frames...',
            'error'
          );
          setTimeout (() => window.location.reload (), 1500);
        }
      });
    }
  },


  initLiveSystemTelemetryClock () {
    const clockEl = document.getElementById ('live-clock');
    if (!clockEl) return;
    setInterval (() => {
      const stamp = new Date ();
      clockEl.textContent = stamp.toLocaleTimeString ('en-IN', {hour12: true});
    }, 1000);
  },
};

// Initialize Application Pipeline Orchestrator loop entry hook on structural window load state completes execution trace bounds
window.addEventListener ('DOMContentLoaded', () => OmniSuiteAppHubCore.init ());
