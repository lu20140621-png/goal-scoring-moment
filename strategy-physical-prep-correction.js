/* Speech-only correction for the Strategy physical-card prep step.
   Visual tray stays exactly as designed: BLUE GK, BLUE Player, Soccer, one example Action card. */
(()=>{
  'use strict';
  if(window.__gsmStrategyPrepSpeechFixInstalled)return;
  window.__gsmStrategyPrepSpeechFixInstalled=true;

  const CORRECT_TEXT='Before we start, take out the BLUE Team GOALKEEPER and PLAYER, the GREEN Team GOALKEEPER and PLAYER, and the SOCCER card. Then take out one of EACH Action Card: SHOOT, DEFENSE, TACKLE, DRIBBLE PAST, and YELLOW. Put the GREEN Goalkeeper and Player on the opposite side. Keep the BLUE Goalkeeper, BLUE Player, SOCCER, and all five Action Cards nearby and follow along with me.';
  let fixedForThisStep=false;

  function apply(){
    const guide=window.StrategyIntroGuide;
    const state=guide&&guide.state;
    const tray=document.querySelector('.physicalPrepTray');
    const text=document.querySelector('.guideText');
    if(!state||!tray||!text||state.lesson!==0||state.step!==1){
      fixedForThisStep=false;
      return;
    }
    if(fixedForThisStep)return;

    // Stop only the prep sentence's old typewriter timer; do not touch clicks or gameplay.
    if(state.timer) clearTimeout(state.timer);
    state.fullText=CORRECT_TEXT;
    state.typing=false;
    text.textContent=CORRECT_TEXT;
    const arrow=document.querySelector('.guideContinue');
    if(arrow){arrow.hidden=false;arrow.textContent='READY →';}
    fixedForThisStep=true;
  }

  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  apply();

  // Load the original low-volume Strategy Mode background music system.
  if(!document.getElementById('gsm-strategy-bgm-v1')){
    const music=document.createElement('script');
    music.id='gsm-strategy-bgm-v1';
    music.src='strategy-bgm-v1.js?v=20260909bgm1';
    document.body.appendChild(music);
  }
})();