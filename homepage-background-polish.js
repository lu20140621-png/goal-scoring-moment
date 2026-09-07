/* Soccer homepage outer-background polish.
 * Scope: homepage only. Changes the space behind the hero and mode cards.
 * Also contains the visible MODE 05 Match Mode presentation so it cannot
 * silently fail behind a second optional loader.
 */
(() => {
  const cleanPath = location.pathname.replace(/\/+$/, '');
  const isHome = cleanPath.endsWith('/goal-scoring-moment') ||
    cleanPath.endsWith('/goal-scoring-moment/index.html') ||
    cleanPath === '' || cleanPath === '/index.html';
  if (!isHome) return;
  if (document.getElementById('gsm-home-background-polish-v5')) return;

  /* MODE 05: make the difficulty warning part of the page itself. */
  const matchCard=[...document.querySelectorAll('.modeCard')].find(el=>{
    const href=el.getAttribute('href')||'';
    return /^match\.html(?:\?|$)/.test(href);
  });
  if(matchCard){
    matchCard.classList.add('matchModeCard');
    const top=matchCard.querySelector('.modeTop');
    if(top&&!top.querySelector('.matchDifficultyBadge')){
      const badge=document.createElement('span');
      badge.className='matchDifficultyBadge';
      badge.textContent='⚠ HIGH DIFFICULTY';
      top.appendChild(badge);
    }
    const copy=matchCard.querySelector('.modeCopy');
    const features=copy?.querySelector('.featureRow');
    if(copy&&!copy.querySelector('.matchDifficultyWarning')){
      const warning=document.createElement('div');
      warning.className='matchDifficultyWarning';
      warning.innerHTML='<b>HIGH DIFFICULTY</b><span>First time playing? Choose carefully — this mode has deeper team tactics and tougher decisions.</span>';
      if(features)features.insertAdjacentElement('afterend',warning);
      else copy.appendChild(warning);
    }
  }

  const style = document.createElement('style');
  style.id = 'gsm-home-background-polish-v5';
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

    .modeGrid{
      padding:0 !important;
      border:0 !important;
      border-radius:0 !important;
      background:none !important;
      box-shadow:none !important;
    }
    .modeGrid:before,.modeGrid:after{display:none !important;content:none !important;}

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

    /* ===== MODE 05 / MATCH MODE ===== */
    .matchModeCard{
      min-height:470px !important;
      --gsm-glow:rgba(231,255,90,.25);
      --matchWarn:#ffb21b;
    }
    .matchModeCard .modeCopy{
      width:58% !important;
      max-width:58% !important;
      padding:30px 30px 112px !important;
    }
    .matchModeCard .modeCopy h2{
      font-size:clamp(54px,5.4vw,82px) !important;
      margin:10px 0 10px !important;
    }
    .matchModeCard .modeCopy p{
      max-width:760px !important;
      font-size:14px !important;
      line-height:1.5 !important;
    }
    .matchDifficultyBadge{
      display:inline-flex;
      align-items:center;
      padding:7px 11px;
      border-radius:999px;
      background:var(--matchWarn);
      color:#251200;
      border:2px solid #271300;
      box-shadow:0 3px 0 rgba(0,0,0,.35);
      font-size:9px;
      font-weight:1000;
      letter-spacing:.075em;
      white-space:nowrap;
    }
    .matchDifficultyWarning{
      display:flex;
      align-items:center;
      gap:10px;
      width:min(620px,100%);
      margin-top:14px;
      padding:11px 13px;
      border-radius:13px;
      background:linear-gradient(90deg,#ffb21b,#ffe05b);
      border:2px solid #311700;
      box-shadow:0 4px 0 rgba(0,0,0,.3);
      color:#251200;
      text-shadow:none;
    }
    .matchDifficultyWarning b{
      flex:0 0 auto;
      font-size:10px;
      font-weight:1000;
      letter-spacing:.075em;
    }
    .matchDifficultyWarning span{
      font-size:10px;
      line-height:1.35;
      font-weight:900;
    }

    /* Make the two physical cards unmistakably large on desktop. */
    .matchModeCard .cardFan{
      position:absolute !important;
      right:2.2% !important;
      left:auto !important;
      top:38px !important;
      bottom:auto !important;
      width:39% !important;
      height:385px !important;
      margin:0 !important;
    }
    .matchModeCard .cardFan img{
      width:245px !important;
      height:368px !important;
      filter:drop-shadow(0 22px 22px rgba(0,0,0,.55)) !important;
    }
    .matchModeCard .cardFan img:nth-child(1){
      left:auto !important;
      right:168px !important;
      top:38px !important;
      transform:rotate(-12deg) !important;
      z-index:1 !important;
    }
    .matchModeCard .cardFan img:nth-child(2){
      left:auto !important;
      right:3px !important;
      top:0 !important;
      transform:rotate(10deg) !important;
      z-index:2 !important;
    }

    @media(hover:hover) and (pointer:fine){
      .modeCard:hover{
        box-shadow:
          inset 0 0 0 3px #fff,
          inset 0 0 0 8px var(--accent),
          0 13px 0 #011b0b,
          0 30px 48px rgba(0,0,0,.42),
          0 0 68px var(--gsm-glow) !important;
      }
      .matchModeCard:hover .cardFan img:nth-child(1){transform:rotate(-16deg) translate(-15px,6px) scale(1.035) !important;}
      .matchModeCard:hover .cardFan img:nth-child(2){transform:rotate(14deg) translate(12px,-9px) scale(1.055) !important;}
    }

    @media(max-width:1080px) and (min-width:761px){
      .matchModeCard .modeCopy{width:55% !important;max-width:55% !important;}
      .matchModeCard .cardFan{right:1% !important;width:43% !important;}
      .matchModeCard .cardFan img{width:205px !important;height:308px !important;}
      .matchModeCard .cardFan img:nth-child(1){right:140px !important;top:48px !important;}
      .matchModeCard .cardFan img:nth-child(2){right:0 !important;top:16px !important;}
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

      /* Mobile Match Mode is re-composed instead of shrinking desktop. */
      .matchModeCard{
        min-height:0 !important;
      }
      .matchModeCard .modeCopy{
        width:100% !important;
        max-width:100% !important;
        padding:22px 18px 9px !important;
      }
      .matchModeCard .modeTop{
        gap:6px !important;
        margin-bottom:10px !important;
      }
      .matchModeCard .modeCopy h2{
        font-size:48px !important;
        line-height:.86 !important;
        margin:10px 0 10px !important;
      }
      .matchModeCard .modeCopy p{
        font-size:11.5px !important;
        line-height:1.48 !important;
      }
      .matchDifficultyBadge{font-size:8px;padding:6px 8px;}
      .matchDifficultyWarning{
        align-items:flex-start;
        flex-direction:column;
        gap:3px;
        margin-top:12px;
        padding:10px 11px;
      }
      .matchDifficultyWarning b{font-size:10px;}
      .matchDifficultyWarning span{font-size:9.5px;line-height:1.38;}
      .matchModeCard .cardFan{
        position:relative !important;
        right:auto !important;
        left:auto !important;
        top:auto !important;
        bottom:auto !important;
        width:100% !important;
        height:305px !important;
        margin:5px 0 78px !important;
      }
      .matchModeCard .cardFan img{
        width:175px !important;
        height:263px !important;
      }
      .matchModeCard .cardFan img:nth-child(1){
        left:calc(50% - 154px) !important;
        right:auto !important;
        top:37px !important;
        transform:rotate(-11deg) !important;
      }
      .matchModeCard .cardFan img:nth-child(2){
        left:calc(50% - 15px) !important;
        right:auto !important;
        top:4px !important;
        transform:rotate(9deg) !important;
      }
      .matchModeCard .enter{
        left:18px !important;
        right:18px !important;
        bottom:18px !important;
        width:calc(100% - 36px) !important;
        justify-content:space-between !important;
        padding:10px 12px 10px 14px !important;
      }
    }

    @media(max-width:420px){
      .matchModeCard .modeCopy{padding:20px 16px 8px !important;}
      .matchModeCard .modeCopy h2{font-size:44px !important;}
      .matchModeCard .cardFan{height:276px !important;margin-bottom:76px !important;}
      .matchModeCard .cardFan img{width:155px !important;height:233px !important;}
      .matchModeCard .cardFan img:nth-child(1){left:calc(50% - 137px) !important;top:34px !important;}
      .matchModeCard .cardFan img:nth-child(2){left:calc(50% - 12px) !important;top:4px !important;}
    }

    @media(max-width:350px){
      .matchModeCard .modeCopy h2{font-size:40px !important;}
      .matchModeCard .cardFan{height:247px !important;}
      .matchModeCard .cardFan img{width:139px !important;height:209px !important;}
      .matchModeCard .cardFan img:nth-child(1){left:calc(50% - 124px) !important;}
      .matchModeCard .cardFan img:nth-child(2){left:calc(50% - 7px) !important;}
    }
  `;
  document.head.appendChild(style);
})();
