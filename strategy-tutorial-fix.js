(function(){
  const frame=document.getElementById('game');
  if(!frame)return;

  function installLesson8Fix(){
    const d=frame.contentDocument;
    if(!d||!d.body)return;
    if(d.getElementById('gsm-lesson8-core-fix'))return;

    const s=d.createElement('script');
    s.id='gsm-lesson8-core-fix';
    s.textContent=`
      (function(){
        if(window.__gsmLesson8Fixed)return;
        window.__gsmLesson8Fixed=true;

        lessons[7].hint='First SHOOT triggers the Goalkeeper passive and sends the Soccer Card to GREEN 2. Use TACKLE to take the Soccer Card back, then SHOOT again.';
        lessons[7].flow=['GK 2 TOKENS','SHOOT','PASSIVE AUTO-SAVE','BALL TO GK','TACKLE','YOU TAKE BALL','SHOOT AGAIN','3RD TOKEN → OUT'];

        const originalActiveName=activeName;
        activeName=function(){
          if(idx===0)return null;
          if(idx===7){
            if(gkStep===1)return 'TACKLE';
            return 'SHOOT';
          }
          return originalActiveName();
        };

        renderSeats=function(){
          const h0Ball=idx===1||(idx===7&&(gkStep===0||gkStep===1.5));
          const h1Ball=idx===0&&passDone;
          const a1Ball=idx===5||(idx===7&&gkStep===1);
          const gkTokens=idx===7?(gkStep>=2?3:2):0;
          $('H0').innerHTML=seat('YOU','blue','PLAYER',h0Ball,0);
          $('H1').innerHTML=seat('BLUE 2','blue','GOALKEEPER',h1Ball,0);
          $('A0').innerHTML=seat('GREEN 1','green','HIDDEN',false,0);
          $('A1').innerHTML=seat('GREEN 2','green',idx===7?'GOALKEEPER':'HIDDEN',a1Ball,gkTokens);
        };

        const originalOnCard=onCard;
        onCard=function(name){
          if(idx===7&&gkStep===1&&name==='TACKLE'&&started&&!awaitingNext){
            appendNode({card:'TACKLE',owner:'YOU',text:'TACKLE → GREEN 2'});
            setTimeout(()=>appendNode({result:'YOU STEAL THE SOCCER CARD',kind:'good'}),350);
            setTimeout(()=>{
              appendNode({result:'YOUR TURN CONTINUES',kind:'good'});
              gkStep=1.5;
              setLog('TACKLE takes the Soccer Card back from GREEN 2. You now have the ball, so you may SHOOT again.');
              render();
            },700);
            return;
          }
          return originalOnCard(name);
        };

        const originalRender=render;
        render=function(){
          originalRender();
          if(idx!==7)return;
          const status=$('statusText');
          const action=$('mainAction');
          if(gkStep===0){
            status.textContent='You have the Soccer Card • SHOOT GREEN 2';
            action.textContent='PLAY SHOOT — TEST PASSIVE';
            if(started&&!awaitingNext)showGuide('TAP SHOOT');
          }else if(gkStep===1){
            status.textContent='Goalkeeper saved • GREEN 2 now has the Soccer Card';
            action.textContent='PLAY TACKLE — TAKE BALL BACK';
            if(started&&!awaitingNext)showGuide('TAP TACKLE — TAKE THE SOCCER CARD');
          }else if(gkStep===1.5){
            status.textContent='You stole the Soccer Card • SHOOT again';
            action.textContent='PLAY SHOOT AGAIN';
            if(started&&!awaitingNext)showGuide('TAP SHOOT AGAIN');
          }else if(gkStep>=2){
            status.textContent='Tutorial complete';
          }
        };

        const originalResolveShoot=resolveShoot;
        resolveShoot=function(target){
          if(idx===7&&gkStep===1){
            closeTarget();
            setLog('GREEN 2 has the Soccer Card. You must TACKLE it back before you can SHOOT again.');
            render();
            return;
          }
          return originalResolveShoot(target);
        };

        render();
      })();
    `;
    d.body.appendChild(s);
  }

  frame.addEventListener('load',()=>{
    installLesson8Fix();
    setTimeout(installLesson8Fix,150);
    setTimeout(installLesson8Fix,500);
  });
  if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')installLesson8Fix();
})();