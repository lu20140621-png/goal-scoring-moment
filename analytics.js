(() => {
  const cfg = window.GSM_ANALYTICS_CONFIG || {};
  if (!cfg.enabled || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return;

  const API = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/gsm_events`;
  const headers = {
    apikey: cfg.supabaseAnonKey,
    Authorization: `Bearer ${cfg.supabaseAnonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
  };

  const uuid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);
  const clean = (v, max=160) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
  const getMode = () => {
    const p = location.pathname.toLowerCase();
    if (p.includes('strategy2')) return 'strategy2';
    if (p.includes('strategy')) return 'strategy';
    if (p.includes('casual')) return 'casual';
    if (p.includes('math')) return 'math';
    if (p.endsWith('/') || p.endsWith('/index.html')) return 'home';
    return 'other';
  };
  const deviceType = () => {
    const m = Math.min(screen.width || innerWidth || 0, screen.height || innerHeight || 0);
    if (m <= 767) return 'mobile';
    if (m <= 1100) return 'tablet';
    return 'desktop';
  };
  const refHost = () => { try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (_) { return ''; } };

  let visitorId = localStorage.getItem('gsm_visitor_id_v1');
  if (!visitorId) { visitorId = uuid(); localStorage.setItem('gsm_visitor_id_v1', visitorId); }
  let sessionId = sessionStorage.getItem('gsm_session_id_v1');
  if (!sessionId) { sessionId = uuid(); sessionStorage.setItem('gsm_session_id_v1', sessionId); }

  const mode = getMode();
  let activeSeconds = 0;
  let started = sessionStorage.getItem(`gsm_started_${mode}`) === '1';
  let completed = sessionStorage.getItem(`gsm_completed_${mode}`) === '1';

  async function send(eventName, label='', meta={}) {
    const row = {
      site: cfg.site || 'goal-scoring-moment',
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: clean(eventName, 48),
      event_label: clean(label, 140),
      page_path: location.pathname,
      page_title: clean(document.title, 180),
      mode,
      active_seconds: activeSeconds,
      device_type: deviceType(),
      referrer_host: clean(refHost(), 120),
      meta,
      occurred_at: new Date().toISOString()
    };
    try {
      await fetch(API, { method:'POST', headers, body:JSON.stringify(row), keepalive:true, mode:'cors' });
    } catch (_) {}
  }

  function labelFor(el) {
    return clean(el?.getAttribute?.('data-track') || el?.getAttribute?.('aria-label') || el?.textContent || el?.title || '', 120);
  }

  function maybeTrackTutorial(label, href='') {
    const s = `${label} ${href}`.toLowerCase();
    if (mode === 'home' && /(strategy|casual|math|mode)/.test(s)) send('mode_selected', label || href);
    if (!started && mode !== 'home' && mode !== 'other' && /(start|begin|learn|play|try|continue|next)/.test(s)) {
      started = true;
      sessionStorage.setItem(`gsm_started_${mode}`, '1');
      send('tutorial_started', label || href);
    }
    if (!completed && mode !== 'home' && mode !== 'other' && /(finish|complete|completed|done|winner|you win|restart)/.test(s)) {
      completed = true;
      sessionStorage.setItem(`gsm_completed_${mode}`, '1');
      send('tutorial_completed', label || href);
    }
  }

  function attach(doc, source='page') {
    if (!doc || doc.__gsmAnalyticsAttached) return;
    doc.__gsmAnalyticsAttached = true;
    doc.addEventListener('click', (e) => {
      const el = e.target?.closest?.('a,button,[role="button"],input[type="button"],input[type="submit"]');
      if (!el) return;
      const label = labelFor(el);
      const href = el.getAttribute?.('href') || '';
      send('interaction', label || href, { source, href: clean(href, 180) });
      maybeTrackTutorial(label, href);
    }, true);
  }

  attach(document, 'page');

  document.querySelectorAll('iframe').forEach((frame) => {
    const hook = () => {
      try { attach(frame.contentDocument, 'iframe'); } catch (_) {}
    };
    frame.addEventListener('load', hook);
    hook();
  });

  if (window.top === window.self) {
    send('page_view');
    if (!sessionStorage.getItem('gsm_session_started_v1')) {
      sessionStorage.setItem('gsm_session_started_v1', '1');
      send('session_start');
    }
    setInterval(() => { if (document.visibilityState === 'visible') activeSeconds += 1; }, 1000);
    setInterval(() => { if (activeSeconds > 0) send('heartbeat'); }, Math.max(10, Number(cfg.heartbeatSeconds || 15)) * 1000);
    addEventListener('pagehide', () => send('session_end'));
  }
})();
