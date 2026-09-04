/* Soccer homepage outer-background polish.
 * Scope: homepage only. Changes the space behind the hero and mode cards.
 * Keeps mode-card artwork, copy, links and layout intact.
 */
(() => {
  const cleanPath = location.pathname.replace(/\/+$/, '');
  const isHome = cleanPath.endsWith('/goal-scoring-moment') ||
    cleanPath.endsWith('/goal-scoring-moment/index.html') ||
    cleanPath === '' || cleanPath === '/index.html';
  if (!isHome) return;
  if (document.getElementById('gsm-home-background-polish-v4')) return;

  const style = document.createElement('style');
  style.id = 'gsm-home-background-polish-v4';
  style.textContent = `
    /* OUTER PAGE: night soccer pitch, not another card panel */
    .page{
      background:
        radial-gradient(ellipse at 50% 9%,rgba(211,255,113,.20) 0%,rgba(211,255,113,.07) 18%,transparent 36%),
        radial-gradient(ellipse at 7% 7%,rgba(218,255,232,.11) 0%,transparent 24%),
        radial-gradient(ellipse at 93% 7%,rgba(218,255,232,.11) 0%,transparent 24%),
        repeating-linear-gradient(90deg,
          rgba(61,138,82,.11) 0 110px,
          rgba(14,72,43,.04) 110px 220px),
        linear-gradient(180deg,#123f28 0%,#0a3020 31%,#072619 67%,#04180f 100%) !important;
      background-attachment:fixed;
    }

    /* Faint soccer-pitch markings across the external background. */
    .page:before{
      content:"" !important;
      display:block !important;
      position:absolute !important;
      inset:0 !important;
      pointer-events:none !important;
      opacity:1 !important;
      background:
        radial-gradient(circle at 50% 31%,rgba(242,255,245,.13) 0 3px,transparent 4px),
        radial-gradient(circle at 50% 31%,transparent 0 155px,rgba(242,255,245,.075) 156px 158px,transparent 159px),
        linear-gradient(90deg,
          transparent calc(50% - 1px),
          rgba(242,255,245,.055) calc(50% - 1px),
          rgba(242,255,245,.055) calc(50% + 1px),
          transparent calc(50% + 1px)),
        linear-gradient(180deg,
          rgba(255,255,255,.018) 0%,
          transparent 18%,
          transparent 82%,
          rgba(0,0,0,.18) 100%) !important;
    }

    /* Stadium-style light falloff / vignette. */
    .page:after{
      content:"" !important;
      display:block !important;
      position:absolute !important;
      inset:0 !important;
      pointer-events:none !important;
      background:
        radial-gradient(ellipse at 50% 24%,rgba(171,255,84,.085) 0%,transparent 33%),
        radial-gradient(ellipse at 50% 52%,transparent 46%,rgba(0,0,0,.14) 100%) !important;
    }

    /* Hero sits in a soft stadium spotlight, without a box behind it. */
    .hero{position:relative;isolation:isolate;}
    .hero:before{
      content:"";
      position:absolute;
      z-index:-1;
      left:50%;
      top:48%;
      width:min(900px,72vw);
      height:360px;
      transform:translate(-50%,-50%);
      border-radius:50%;
      pointer-events:none;
      background:radial-gradient(ellipse,rgba(177,255,75,.11) 0%,rgba(255,225,74,.045) 31%,transparent 70%);
      filter:blur(8px);
    }

    /* REMOVE the extra rounded board around the four modes. */
    .modeGrid{
      padding:0 !important;
      border:0 !important;
      border-radius:0 !important;
      background:none !important;
      box-shadow:none !important;
    }
    .modeGrid:before,.modeGrid:after{display:none !important;content:none !important;}

    /* Cards lightly tint the surrounding pitch instead of being wrapped by a panel. */
    .modeCard{
      --gsm-glow:rgba(201,255,38,.16);
      box-shadow:
        inset 0 0 0 3px #fff,
        inset 0 0 0 8px var(--accent),
        0 9px 0 #011b0b,
        0 22px 36px rgba(0,0,0,.34),
        0 0 48px var(--gsm-glow) !important;
    }
    .modeCard.strategy{--gsm-glow:rgba(171,255,55,.22);}
    .modeCard.casual{--gsm-glow:rgba(255,211,35,.19);}
    .modeCard.math{--gsm-glow:rgba(66,165,255,.18);}
    .modeCard.strategy2{--gsm-glow:rgba(255,107,93,.17);}

    @media(hover:hover) and (pointer:fine){
      .modeCard:hover{
        box-shadow:
          inset 0 0 0 3px #fff,
          inset 0 0 0 8px var(--accent),
          0 13px 0 #011b0b,
          0 30px 48px rgba(0,0,0,.42),
          0 0 68px var(--gsm-glow) !important;
      }
    }

    @media(max-width:760px){
      .page{
        background:
          radial-gradient(ellipse at 50% 6%,rgba(203,255,104,.16) 0%,transparent 26%),
          repeating-linear-gradient(90deg,
            rgba(61,138,82,.085) 0 58px,
            rgba(14,72,43,.035) 58px 116px),
          linear-gradient(180deg,#103a26 0%,#092d1f 42%,#061e15 100%) !important;
        background-attachment:scroll;
      }
      .page:before{
        background:
          radial-gradient(circle at 50% 13%,rgba(242,255,245,.11) 0 2px,transparent 3px),
          radial-gradient(circle at 50% 13%,transparent 0 68px,rgba(242,255,245,.055) 69px 70px,transparent 71px),
          linear-gradient(90deg,
            transparent calc(50% - .5px),
            rgba(242,255,245,.038) calc(50% - .5px),
            rgba(242,255,245,.038) calc(50% + .5px),
            transparent calc(50% + .5px)) !important;
      }
      .hero:before{
        width:94vw;
        height:250px;
        top:44%;
        opacity:.82;
      }
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
          0 0 26px var(--gsm-glow) !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
