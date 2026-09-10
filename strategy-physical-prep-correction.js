/* Strategy physical-card prep: split the opening into two clean steps.
   Step 1 = coach text only. Step 2 = the existing 4-card visual tray.
   The tray design itself stays unchanged. */
(()=>{
  'use strict';
  if(window.__gsmStrategyPrepSpeechFixInstalled)return;
  window.__gsmStrategyPrepSpeechFixInstalled=true;

  const CORRECT_TEXT='Before we start, take out the BLUE Team GOALKEEPER and PLAYER, the GREEN Team GOALKEEPER and PLAYER, and the SOCCER card. Then take out one of EACH Action Card: SHOOT, DEFENSE, TACKLE, DRIBBLE PAST, and YELLOW. Put the GREEN Goalkeeper and Player on the opposite side. Keep the BLUE Goalkeeper, BLUE Player, SOCCER, and all five Action Cards nearby.';
  const VISUAL_TEXT='Great. Follow the coach with these cards.';

  let textStageReady=false;
  let visualStageShown=false;
  let detachedTray=null;

  function guideBits(){
    const guide=window.StrategyIntroGuide;
    return {
      guide,
      state:guide&&guide.state,
      scene:document.querySelector('.guideScene'),
      dialogue:document.querySelector('.guideDialogue'),
      text:document.querySelector('.guideText'),
      arrow:document.querySelector('.guideContinue'),
      tray:document.querySelector('.physicalPrepTray')
    };
  }

  function resetIfOutsidePrep(state){
    if(!state||state.lesson!==0||state.step!==1){
      textStageReady=false;
      visualStageShown=false;
      detachedTray=null;
      return true;
    }
    return false;
  }

  function installCapture(){
    const {dialogue}=guideBits();
    if(!dialogue||dialogue.dataset.prepSplitCapture==='1')return;
    dialogue.dataset.prepSplitCapture='1';

    dialogue.addEventListener('click',e=>{
      const {state,scene,text,arrow}=guideBits();
      if(!state||state.lesson!==0||state.step!==1||!textStageReady||visualStageShown)return;

      e.preventDefault();
      e.stopImmediatePropagation();
      visualStageShown=true;

      if(state.timer)clearTimeout(state.timer);
      state.fullText=VISUAL_TEXT;
      state.typing=false;
      state.waitForAction=false;

      if(text)text.textContent=VISUAL_TEXT;

      if(scene){
        scene.classList.add('physicalPrepScene');
        scene.querySelector('.guideDialogue')?.classList.add('physicalPrepActive');
      }
      if(detachedTray&&text&&!document.querySelector('.physicalPrepTray')){
        text.insertAdjacentElement('afterend',detachedTray);
      }
      if(arrow){
        arrow.hidden=false;
        arrow.textContent='READY →';
        arrow.classList.add('wide');
      }
    },true);
  }

  function apply(){
    const {state,scene,dialogue,text,arrow,tray}=guideBits();
    installCapture();
    if(resetIfOutsidePrep(state))return;

    if(!textStageReady&&tray&&text){
      detachedTray=tray;
      tray.remove();
      scene?.classList.remove('physicalPrepScene');
      dialogue?.classList.remove('physicalPrepActive');

      if(state.timer)clearTimeout(state.timer);
      state.fullText=CORRECT_TEXT;
      state.typing=false;
      state.waitForAction=false;
      text.textContent=CORRECT_TEXT;

      if(arrow){
        arrow.hidden=false;
        arrow.textContent='CONTINUE →';
        arrow.classList.add('wide');
      }
      textStageReady=true;
    }
  }

  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  apply();

  // Keep Strategy Mode background music enabled; only the top-right MUSIC control is visible.
  if(!document.getElementById('gsm-strategy-bgm-v1')){
    const music=document.createElement('script');
    music.id='gsm-strategy-bgm-v1';
    music.src='strategy-bgm-v1.js?v=20260909bgm4';
    document.body.appendChild(music);
  }
})();