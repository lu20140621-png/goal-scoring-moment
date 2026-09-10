(()=>{
  'use strict';
  if(window.__gsmStrategyPhysicalPrepCorrectionInstalled)return;
  window.__gsmStrategyPhysicalPrepCorrectionInstalled=true;

  const correctedText='Before we start, take out 2 GOALKEEPER cards and 2 PLAYER cards. Put one Goalkeeper + one Player on the BLUE side, and the other Goalkeeper + one Player on the GREEN side. Then take out the SOCCER card and any 1 ACTION card. Keep all six in front of you and follow along with me.';

  function apply(){
    const tray=document.querySelector('.physicalPrepTray');
    if(!tray)return;

    const dialogue=tray.closest('.guideDialogue');
    const text=dialogue?.querySelector('.guideText');
    if(text && text.textContent.startsWith('Before we start')) text.textContent=correctedText;

    const title=tray.querySelector('.physicalPrepTitle');
    if(title) title.textContent='🃏 PREPARE 2 GOALKEEPERS + 2 PLAYERS + SOCCER + 1 ACTION CARD';

    const cards=[...tray.querySelectorAll('.physicalPrepCard')];
    if(cards.length>=6){
      const teams=[
        ['BLUE SIDE','Goalkeeper card','GOALKEEPER'],
        ['BLUE SIDE','Player card','PLAYER'],
        ['GREEN SIDE','Goalkeeper card','GOALKEEPER'],
        ['GREEN SIDE','Player card','PLAYER']
      ];
      for(let i=0;i<4;i++){
        const badge=cards[i].querySelector('.physicalPrepTeam');
        const img=cards[i].querySelector('img');
        const label=cards[i].querySelector('b');
        if(badge)badge.textContent=teams[i][0];
        if(img)img.alt=teams[i][1];
        if(label)label.textContent=teams[i][2];
      }
    }

    let hint=tray.querySelector('.physicalPrepHint');
    if(hint) hint.textContent='The Goalkeeper and Player cards use the same artwork for both teams. Just place one pair on the BLUE side and one pair on the GREEN side for this practice.';
  }

  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  apply();
})();