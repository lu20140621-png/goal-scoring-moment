/* Homepage visual integration polish.
 * Purpose: keep the page background quiet and let each game mode blend into it
 * through a subtle mode-colored ambient glow.
 * Scope: homepage only. Does not change layout, links, card art, or game logic.
 */
(() => {
  const cleanPath = location.pathname.replace(/\/+$/, '');
  const isHome = cleanPath.endsWith('/goal-scoring-moment') ||
    cleanPath.endsWith('/goal-scoring-moment/index.html') ||
    cleanPath === '' || cleanPath === '/index.html';
  if (!isHome) return;
  if (document.getElementById('gsm-home-background-polish-v3')) return;

  const style = document.createElement('style');
  style.id = 'gsm-home-background-polish-v3';
  style.textContent = `
    .page{
      background:
        radial-gradient(ellipse at 50% 16%,rgba(198,255,67,.11) 0%,rgba(198,255,67,0) 24%),
        radial-gradient(ellipse at 50% 48%,rgba(20,112,59,.10) 0%,rgba(20,112,59,0) 34%),
        linear-gradient(180deg,#103a25 0%,#0b2c1d 42%,#071d14 72%,#04130d 100%) !important;
    }
    .page:before{
      content:"" !important;
      position:absolute !important;
      inset:0 !important;
      pointer-events:none !important;
      background:
        radial-gradient(ellipse at 50% 10%,rgba(255,255,255,.035) 0%,transparent 20%),
        linear-gradient(90deg,rgba(255,255,255,.018),transparent 16%,transparent 84%,rgba(255,255,255,.018)) !important;
      opacity:1 !important;
    }
    .page:after{display:none !important;content:none !important;}

    .modeGrid{
      padding:0 !important;
      border:0 !important;
      border-radius:0 !important;
      background:none !important;
      box-shadow:none !important;
    }
    .modeGrid:before,.modeGrid:after{display:none !important;content:none !important;}

    .modeCard{
      --gsm-glow:rgba(201,255,38,.18);
      box-shadow:
        inset 0 0 0 3px #fff,
        inset 0 0 0 8px var(--accent),
        0 9px 0 #011b0b,
        0 22px 36px rgba(0,0,0,.34),
        0 0 42px var(--gsm-glow) !important;
    }
    .modeCard.strategy{--gsm-glow:rgba(170,255,50,.24);}
    .modeCard.casual{--gsm-glow:rgba(255,211,35,.24);}
    .modeCard.math{--gsm-glow:rgba(66,165,255,.23);}
    .modeCard.strategy2{--gsm-glow:rgba(255,107,93,.22);}

    @media(hover:hover) and (pointer:fine){
      .modeCard:hover{
        box-shadow:
          inset 0 0 0 3px #fff,
          inset 0 0 0 8px var(--accent),
          0 13px 0 #011b0b,
          0 30px 48px rgba(0,0,0,.42),
          0 0 62px var(--gsm-glow) !important;
      }
    }

    @media(max-width:760px){
      .modeGrid{
        padding:0 !important;
        border:0 !important;
        background:none !important;
        box-shadow:none !important;
      }
      .modeCard,.modeCard.strategy,.modeCard.strategy2{
        box-shadow:
          inset 0 0 0 2px #fff,
          inset 0 0 0 6px var(--accent),
          0 7px 0 #011b0b,
          0 18px 30px rgba(0,0,0,.34),
          0 0 28px var(--gsm-glow) !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
