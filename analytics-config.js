window.GSM_ANALYTICS_CONFIG = {
  enabled: true,
  site: "goal-scoring-moment",
  supabaseUrl: "https://kenkpmxmridexfuguray.supabase.co",
  supabaseAnonKey: "sb_publishable_I57pYNuCLSwbyB_8GbbR3g_t_FP1Zok",
  heartbeatSeconds: 15
};

/* Homepage-only visual polish loader. */
(() => {
  const cleanPath = location.pathname.replace(/\/+$/, '');
  const isHome = cleanPath.endsWith('/goal-scoring-moment') ||
    cleanPath.endsWith('/goal-scoring-moment/index.html') ||
    cleanPath === '' || cleanPath === '/index.html';
  if (!isHome || document.querySelector('script[data-gsm-home-polish]')) return;

  const script = document.createElement('script');
  script.src = 'homepage-background-polish.js?v=20260904v4';
  script.defer = true;
  script.dataset.gsmHomePolish = '1';
  document.head.appendChild(script);
})();