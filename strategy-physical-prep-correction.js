(()=>{
  'use strict';
  if(window.__gsmStrategyPhysicalPrepCorrectionInstalled)return;
  window.__gsmStrategyPhysicalPrepCorrectionInstalled=true;

  const PREP_TEXT='Before we start, take out the BLUE Team GOALKEEPER and PLAYER, the GREEN Team GOALKEEPER and PLAYER, 1 SOCCER card, and any 1 ACTION card. Put the GREEN Goalkeeper and Player on the opposite side. Keep the BLUE Goalkeeper, BLUE Player, SOCCER, and ACTION card closest to you — these are the four cards you’ll follow with me.';
  let prepShown=false;

  function state(){return window.StrategyIntroGuide&&window.StrategyIntroGuide.state;}

  function ensureStyle(){
    if(document.getElementById('gsm-physical-prep-correction-style'))return;
    const style=document.createElement('style');
    style.id='gsm-physical-prep-correction-style';
    style.textContent=`
      .physicalPrepTray{max-width:100%;margin:10px 0 2px;padding:10px;border:2px solid #d7b33a;border-radius:14px;background:linear-gradient(180deg,#fff8d8,#f4f8fc);box-shadow:0 7px 18px #17324f24;overflow:hidden}
      .physicalPrepTitle{display:block;margin-bottom:8px;color:#6d5100;font-size:9px;line-height:1.25;font-weight:950;letter-spacing:.06em;text-align:center}
      .physicalPrepCards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;min-width:0}
      .physicalPrepCard{position:relative;min-width:0;padding:18px 4px 6px;border:1px solid #bfd0df;border-radius:10px;background:#fff;text-align:center;box-shadow:0 3px 8px #17324f1f;overflow:hidden}
      .physicalPrepCard.blueRole{border-color:#4c91d4;background:#f3f8ff}
      .physicalPrepTeam{position:absolute;left:4px;right:4px;top:4px;border-radius:999px;padding:2px 3px;color:#fff;font-size:6px;line-height:1;font-weight:950;letter-spacing:.08em;white-space:nowrap}
      .physicalPrepTeam.blue{background:#2876d2}.physicalPrepTeam.neutral{background:#526d82}
      .physicalPrepCard img{display:block;width:58px;height:80px;max-width:100%;margin:0 auto 4px;object-fit:contain;filter:drop-shadow(0 4px 5px #0003)}
      .physicalPrepCard b{display:block;color:#183c60;font-size:7px;line-height:1.15;font-weight:950}
      .physicalPrepHint{margin-top:7px;color:#496174;font-size:7.5px;line-height:1.35;font-weight:800;text-align:center}
      .guideDialogue.physicalPrepActive{padding-right:18px!important;padding-bottom:62px!important}
      .guideDialogue.physicalPrepActive .guideContinue{right:12px!important;bottom:10px!important;width:auto!important;min-width:94px!important;height:40px!important;padding:0 14px!important;border-radius:999px!important;font-size:10px!important;line-height:1!important;white-space:nowrap!important}
      @media(max-width:760px){
        .guideScene.physicalPrepScene .guidePortrait{flex:0 0 76px!important;width:76px!important;height:96px!important}
        .guideDialogue.physicalPrepActive{padding:10px 8px 54px!important}
        .guideDialogue.physicalPrepActive .guideContinue{right:7px!important;bottom:7px!important;min-width:84px!important;height:36px!important;padding:0 12px!important;font-size:9px!important}
        .physicalPrepTray{margin:7px 0 1px;padding:7px 6px;border-radius:11px}
        .physicalPrepTitle{font-size:7px;margin-bottom:5px;letter-spacing:.04em}
        .physicalPrepCards{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}
        .physicalPrepCard{padding:16px 2px 4px}
        .physicalPrepCard img{width:44px;height:61px;margin-bottom:2px}
        .physicalPrepCard b{font-size:5.8px}
        .physicalPrepTeam{left:3px;right:3px;top:3px;font-size:5.5px;padding:2px}
        .physicalPrepHint{font-size:6.4px;margin-top:5px}
      }
    `;
    document.head.appendChild(style);
  }

  function show(dialogue){
    ensureStyle();
    hide(false);
    const text=dialogue.querySelector('.guideText');
    const arrow=dialogue.querySelector('.guideContinue');
    if(!text||!arrow)return;

    const s=state();
    if(s){s.fullText=PREP_TEXT;s.typing=false;}
    text.textContent=PREP_TEXT;
    arrow.hidden=false;
    arrow.textContent='READY →';
    arrow.classList.add('wide');
    dialogue.classList.add('physicalPrepActive');
    dialogue.closest('.guideScene')?.classList.add('physicalPrepScene');

    const tray=document.createElement('div');
    tray.className='physicalPrepTray';
    tray.innerHTML=`
      <div class="physicalPrepTitle">🃏 FOLLOW ALONG WITH THESE 4 CARDS</div>
      <div class="physicalPrepCards">
        <div class="physicalPrepCard blueRole"><span class="physicalPrepTeam blue">BLUE TEAM</span><img src="images/goalkeeper-card.webp" alt="Blue Team Goalkeeper"><b>GOALKEEPER</b></div>
        <div class="physicalPrepCard blueRole"><span class="physicalPrepTeam blue">BLUE TEAM</span><img src="images/player-card.webp" alt="Blue Team Player"><b>PLAYER</b></div>
        <div class="physicalPrepCard"><span class="physicalPrepTeam neutral">TAKE 1</span><img src="images/soccer-card.webp" alt="Soccer card"><b>SOCCER</b></div>
        <div class="physicalPrepCard"><span class="physicalPrepTeam neutral">ANY 1</span><img src="images/shoot-card.webp" alt="Example Action card"><b>ACTION CARD</b></div>
      </div>
      <div class="physicalPrepHint">The GREEN Goalkeeper and Player stay on the opposite side. Only these four cards are shown here because these are the cards you’ll move with the coach.</div>`;
    text.insertAdjacentElement('afterend',tray);
  }

  function hide(resetButton=true){
    document.querySelector('.physicalPrepTray')?.remove();
    document.querySelectorAll('.guideDialogue.physicalPrepActive').forEach(dialogue=>{
      dialogue.classList.remove('physicalPrepActive');
      if(resetButton){
        const arrow=dialogue.querySelector('.guideContinue');
        if(arrow&&arrow.textContent==='READY →')arrow.textContent='›';
      }
    });
    document.querySelectorAll('.guideScene.physicalPrepScene').forEach(el=>el.classList.remove('physicalPrepScene'));
  }

  function intercept(event){
    const dialogue=event.target?.closest?.('.guideDialogue');
    if(!dialogue)return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    const s=state();
    if(!s||s.lesson!==0||s.step!==0||s.locked)return;

    // While the welcome is typing, keep the coach's normal tap-to-finish behavior.
    if(s.typing)return;

    if(!prepShown){
      event.preventDefault();
      event.stopImmediatePropagation();
      prepShown=true;
      show(dialogue);
      return;
    }

    // READY: clean up, then allow the coach's original click handler to advance Lesson 1.
    hide();
    prepShown=false;
  }

  document.addEventListener('click',intercept,true);
  document.addEventListener('keydown',intercept,true);

  // Only cleanup; never rewrite dialogue text from a MutationObserver.
  const observer=new MutationObserver(()=>{
    const s=state();
    if(prepShown&&(!s||s.lesson!==0||s.step!==0)){
      hide();
      prepShown=false;
    }
  });
  observer.observe(document.body,{subtree:true,childList:true});
})();