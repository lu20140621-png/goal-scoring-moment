(() => {
  const cfg = window.GSM_ANALYTICS_CONFIG || {};
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return;

  const root = cfg.supabaseUrl.replace(/\/$/, '');
  const sessionsApi = `${root}/rest/v1/web_sessions`;
  const eventsApi = `${root}/rest/v1/web_events`;
  const headers = {
    apikey: cfg.supabaseAnonKey,
    Authorization: `Bearer ${cfg.supabaseAnonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
  };

  const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  const clean = (v, max=180) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
  const path = location.pathname;
  const lower = path.toLowerCase();
  const mode = lower.includes('strategy2') ? 'strategy2' : lower.includes('strategy') ? 'strategy' : lower.includes('casual') ? 'casual' : lower.includes('math') ? 'math' : (lower.endsWith('/') || lower.endsWith('/index.html')) ? 'home' : 'other';
  const isTutorial = !['home','other'].includes(mode);
  const deviceType = () => {
    const w = Math.min(screen.width || innerWidth || 0, screen.height || innerHeight || 0);
    return w <= 767 ? 'mobile' : w <= 1100 ? 'tablet' : 'desktop';
  };

  let visitorId = localStorage.getItem('gsm_visitor_id_v2');
  if (!visitorId) { visitorId = uuid(); localStorage.setItem('gsm_visitor_id_v2', visitorId); }
  let sessionId = sessionStorage.getItem('gsm_session_id_v2');
  if (!sessionId) { sessionId = uuid(); sessionStorage.setItem('gsm_session_id_v2', sessionId); }

  let activeSeconds = Number(sessionStorage.getItem('gsm_active_seconds_v2') || 0);
  let pageViews = Number(sessionStorage.getItem('gsm_page_views_v2') || 0) + 1;
  sessionStorage.setItem('gsm_page_views_v2', String(pageViews));
  let maxStep = Number(sessionStorage.getItem('gsm_max_step_v2') || 0);
  let tutorialStarted = sessionStorage.getItem('gsm_tutorial_started_v2') === '1';
  let tutorialCompleted = sessionStorage.getItem('gsm_tutorial_completed_v2') === '1';
  let tutorialMode = sessionStorage.getItem('gsm_tutorial_mode_v2') || null;

  async function postEvent(eventName, extra={}) {
    const row = {
      session_id: sessionId,
      visitor_id: visitorId,
      event_name: clean(eventName, 48),
      path,
      mode,
      step: extra.step ?? null,
      active_seconds: activeSeconds,
      metadata: extra.metadata || {}
    };
    try { await fetch(eventsApi, { method:'POST', headers, body:JSON.stringify(row), keepalive:true }); } catch (_) {}
  }

  async function createSession() {
    const row = {
      session_id: sessionId,
      visitor_id: visitorId,
      entry_path: path,
      last_path: path,
      referrer: clean(document.referrer, 500),
      device_type: deviceType(),
      user_agent: clean(navigator.userAgent, 500),
      screen_width: screen.width || null,
      screen_height: screen.height || null,
      page_views: pageViews,
      active_seconds: activeSeconds,
      tutorial_started: tutorialStarted,
      tutorial_completed: tutorialCompleted,
      tutorial_mode: tutorialMode,
      max_step: maxStep
    };
    try {
      const r = await fetch(sessionsApi, { method:'POST', headers, body:JSON.stringify(row), keepalive:true });
      if (r.ok || r.status === 409) sessionStorage.setItem('gsm_session_created_v2','1');
    } catch (_) {}
  }

  async function updateSession(ended=false) {
    const q = `${sessionsApi}?session_id=eq.${encodeURIComponent(sessionId)}`;
    const body = {
      last_seen_at: new Date().toISOString(),
      last_path: path,
      page_views: pageViews,
      active_seconds: activeSeconds,
      tutorial_started: tutorialStarted,
      tutorial_completed: tutorialCompleted,
      tutorial_mode: tutorialMode,
      max_step: maxStep
    };
    if (ended) body.ended_at = new Date().toISOString();
    try { await fetch(q, { method:'PATCH', headers, body:JSON.stringify(body), keepalive:true }); } catch (_) {}
  }

  function markStarted() {
    if (!tutorialStarted && isTutorial) {
      tutorialStarted = true;
      tutorialMode = mode;
      sessionStorage.setItem('gsm_tutorial_started_v2','1');
      sessionStorage.setItem('gsm_tutorial_mode_v2', mode);
      postEvent('tutorial_started');
    }
  }

  function markCompleted(label='') {
    if (!tutorialCompleted && isTutorial) {
      tutorialCompleted = true;
      sessionStorage.setItem('gsm_tutorial_completed_v2','1');
      postEvent('tutorial_completed', { metadata:{ label: clean(label,120) } });
      updateSession(false);
    }
  }

  if (!sessionStorage.getItem('gsm_session_created_v2')) createSession();
  else updateSession(false);
  postEvent('page_view');
  markStarted();

  document.addEventListener('click', (e) => {
    const el = e.target?.closest?.('a,button,[role="button"],input[type="button"],input[type="submit"]');
    if (!el) return;
    const label = clean(el.getAttribute?.('data-track') || el.getAttribute?.('aria-label') || el.textContent || el.title || '', 140);
    const href = clean(el.getAttribute?.('href') || '', 220);
    const s = `${label} ${href}`.toLowerCase();
    const stepMatch = s.match(/(?:step|round|stage)\s*(\d{1,2})/i);
    if (stepMatch) {
      maxStep = Math.max(maxStep, Number(stepMatch[1]));
      sessionStorage.setItem('gsm_max_step_v2', String(maxStep));
      postEvent('tutorial_step', { step:maxStep, metadata:{ label, href } });
    } else {
      postEvent('interaction', { metadata:{ label, href } });
    }
    if (/(finish|complete|completed|done|winner|you win|restart|play again)/i.test(s)) markCompleted(label);
  }, true);

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      activeSeconds += 1;
      sessionStorage.setItem('gsm_active_seconds_v2', String(activeSeconds));
    }
  }, 1000);

  setInterval(() => {
    if (activeSeconds > 0) {
      postEvent('heartbeat');
      updateSession(false);
    }
  }, Math.max(10, Number(cfg.heartbeatSeconds || 15)) * 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') updateSession(false);
  });
  addEventListener('pagehide', () => { postEvent('session_end'); updateSession(true); });
})();
