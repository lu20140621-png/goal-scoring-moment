(()=>{
  'use strict';
  if(window.__gsmStrategyPhysicalPrepCorrectionInstalled)return;
  window.__gsmStrategyPhysicalPrepCorrectionInstalled=true;

  const correctedText='Before we start, take out the BLUE Team GOALKEEPER and PLAYER, the GREEN Team GOALKEEPER and PLAYER, 1 SOCCER card, and any 1 ACTION card. Put the GREEN Goalkeeper and Player on the opposite side. Keep the BLUE Goalkeeper, BLUE Player, SOCCER, and ACTION card closest to you — these are the four cards you’ll follow with me.';

  function apply(){
    const tray=document.querySelector('.physicalPrepTray');
    if(!tray)return;

    const dialogue=tray.closest('.guideDialogue');
    const text=dialogue?.querySelector('.guideText');
    if(text && text.textContent.startsWith('Before we start')) text.textContent=correctedText;

    const title=tray.querySelector('.physicalPrepTitle');
    if(title) title.textContent='🃏 FOLLOW ALONG WITH THESE 4 CARDS';

    const cards=[...tray.querySelectorAll('.physicalPrepCard')];
    if(cards.length>4){
      cards.slice(4).forEach(card=>card.remove());
    }

    const remaining=[...tray.querySelectorAll('.physicalPrepCard')];
    const desired=[
      ['BLUE TEAM','images/goalkeeper-card.webp','Blue Team Goalkeeper card','GOALKEEPER','blueRole'],
      ['BLUE TEAM','images/player-card.webp','Blue Team Player card','PLAYER','blueRole'],
      ['TAKE 1','images/soccer-card.webp','Soccer card','SOCCER',''],
      ['ANY 1','images/shoot-card.webp','Example Action card','ACTION CARD','']
    ];
    remaining.forEach((card,i)=>{
      const d=desired[i]; if(!d)return;
      card.className='physicalPrepCard'+(d[4]?' '+d[4]:'');
      const badge=card.querySelector('.physicalPrepTeam');
      const img=card.querySelector('img');
      const label=card.querySelector('b');
      if(badge){badge.textContent=d[0];badge.className='physicalPrepTeam '+(i<2?'blue':'neutral');}
      if(img){img.src=d[1];img.alt=d[2];}
      if(label)label.textContent=d[3];
    });

    const grid=tray.querySelector('.physicalPrepCards');
    if(grid) grid.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';

    const hint=tray.querySelector('.physicalPrepHint');
    if(hint) hint.textContent='The GREEN Goalkeeper and Player stay on the opposite side. Only these four cards are shown here because these are the cards you’ll move with the coach.';
  }

  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  apply();
})();