window.GSM_ANALYTICS_CONFIG = {
  enabled: true,
  site: "goal-scoring-moment",
  supabaseUrl: "https://kenkpmxmridexfuguray.supabase.co",
  supabaseAnonKey: "sb_publishable_I57pYNuCLSwbyB_8GbbR3g_t_FP1Zok",
  heartbeatSeconds: 15
};

/* Homepage-only visual polish loader. MODE 05 polish is integrated here too. */
(() => {
  const cleanPath = location.pathname.replace(/\/+$/, '');
  const isHome = cleanPath.endsWith('/goal-scoring-moment') ||
    cleanPath.endsWith('/goal-scoring-moment/index.html') ||
    cleanPath === '' || cleanPath === '/index.html';
  if (!isHome) return;
  if (document.querySelector('script[data-gsm-home-polish]')) return;

  const script = document.createElement('script');
  script.src = 'homepage-background-polish.js?v=20260907v5-' + Date.now();
  script.defer = true;
  script.dataset.gsmHomePolish = '1';
  document.head.appendChild(script);
})();
