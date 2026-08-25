(function(){
  const frame=document.getElementById('game');
  if(!frame)return;

  function installTutorialFix(){
    const d=frame.contentDocument;
    if(!d||!d.body||!d.head)return;
    if(d.getElementById('gsm-tutorial-possession-fix-v4'))return;

    const style=d.createElement('style');
    style.id='gsm-tutorial-soccer-card-style-v4';
    style.textContent=`
      .seat .gsmPossessionCard{position:absolute;width:56px;height:56px;object-fit:contain;z-index:18;filter:drop-shadow(0 5px 8px #0008);pointer-events:none}
      .seat.blue .gsmPossessionCard{right:-62px;top:50%;transform:translateY(-50%)}
      .seat.green .gsmPossessionCard{left:-62px;top:50%;transform:translateY(-50%)}
      @media(max-width:760px){.seat .gsmPossessionCard{width:42px;height:42px}.seat.blue .gsmPossessionCard{right:-45px}.seat.green .gsmPossessionCard{left:-45px}}
    `;
    d.head.appendChild(style);

    const s=d.createElement('script');
    s.id='gsm-tutorial-possession-fix-v4';
    s.textContent=`
      (function(){
        if(window.__gsmTutorialPossessionFixedV4)return;
        window.__gsmTutorialPossessionFixedV4=true;

        /* Keep every lesson's Soccer Card position consistent with the actual game logic. */
        let gsmPossessor='H0';
        function defaultPossessorForLesson(i){
          if(i===0)return 'H0';        // PASS: YOU start with the ball
          if(i===1)return 'H0';        // SHOOT: YOU attack with the ball
          if(i===2)return 'A0';        // DEFENSE: GREEN 1 attacks YOU
          if(i===3)return 'H0';        // DRIBBLE PAST: YOUR attack is still alive
          if(i===4)return 'A0';        // SECOND DEFENSE: GREEN 1 is attacking
          if(i===5)return 'A1';        // TACKLE: GREEN 2 starts with the ball
          if(i===6)return 'H0';        // YELLOW: no possession change
          if(i===7)return 'H0';        // GOALKEEPER PASSIVE: YOU start with the ball
          return null;
        }
        function currentPossessor(){
          if(idx===7){
            if(gkStep===1)return 'A1';     // passive save: ball goes to Goalkeeper
            if(gkStep===1.5)return 'H0';   // TACKLE: YOU steal it back
            if(gkStep>=2)return 'A1';      // final successful SHOOT: ball reaches target
            return 'H0';
          }
          return gsmPossessor;
        }

        function showRealSoccerCard(){
          ['H0','H1','A0','A1'].forEach(id=>{
            const seatEl=$(id);
            if(!seatEl)return;
            seatEl.querySelectorAll('.gsmPossessionCard').forEach(x=>x.remove());
            const badge=seatEl.querySelector('.ball');
            if(!badge)return;
            badge.remove();
            const img=document.createElement('img');
            img.className='gsmPossessionCard';
            img.src='images/soccer-card.png';
            img.alt='Soccer Card';
            seatEl.appendChild(img);
          });
        }

        /* Lesson 5 had a contradictory setup: YOU were shown attacking and then asked to DEFENSE your own attack.
           Make it a legal chain: GREEN 1 SHOOT → BLUE 2 DEFENSE → GREEN 1 DRIBBLE PAST → YOU second DEFENSE. */
        lessons[4].hint='GREEN 1 attacks. BLUE 2 plays the first DEFENSE, GREEN 1 uses DRIBBLE PAST, then you play the second DEFENSE.';
        lessons[4].flow=['GREEN 1 SHOOT','BLUE 2 DEFENSE','GREEN 1 DRIBBLE PAST','YOU DEFENSE','STOPPED'];

        lessons[7].hint='First SHOOT triggers the Goalkeeper passive and sends the Soccer Card to GREEN 2. Use TACKLE to take the Soccer Card back, then SHOOT again.';
        lessons[7].flow=['GK 2 TOKENS','SHOOT','PASSIVE AUTO-SAVE','SOCCER CARD TO GK','TACKLE','YOU TAKE SOCCER CARD','SHOOT AGAIN','3RD TOKEN → OUT'];

        const originalSeedFlow=seedFlow;
        seedFlow=function(){
          gsmPossessor=defaultPossessorForLesson(idx);
          if(idx===4){
            clearPlayed();
            appendNode({card:'SHOOT',owner:'GREEN 1',text:'SHOOT → YOU'});
            appendNode({card:'DEFENSE',owner:'BLUE 2',text:'FIRST DEFENSE'});
            appendNode({card:'DRIBBLE PAST',owner:'GREEN 1',text:'BYPASS DEFENSE'});
            appendNode({result:'ATTACK CONTINUES',kind:'neutral'});
            return;
          }
          return originalSeedFlow();
        };

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
          const poss=currentPossessor();
          $('H0').innerHTML=seat('YOU','blue','PLAYER',poss==='H0',0);
          $('H1').innerHTML=seat('BLUE 2','blue','GOALKEEPER',poss==='H1',0);
          $('A0').innerHTML=seat('GREEN 1','green','HIDDEN',poss==='A0',0);
          const gkTokens=idx===7?(gkStep>=2?3:2):0;
          $('A1').innerHTML=seat('GREEN 2','green',idx===7?'GOALKEEPER':'HIDDEN',poss==='A1',gkTokens);
          showRealSoccerCard();
        };

        const originalDoPass=doPass;
        doPass=function(){
          if(idx===0&&started&&!awaitingNext)gsmPossessor='H1';
          return originalDoPass();
        };

        const originalOnCard=onCard;
        onCard=function(name){
          if(started&&!awaitingNext){
            if(idx===2&&name==='DEFENSE')gsmPossessor='H0';
            if(idx===4&&name==='DEFENSE')gsmPossessor='H0';
            if(idx===5&&name==='TACKLE')gsmPossessor='H0';
          }

          if(idx===7&&gkStep===1&&name==='TACKLE'&&started&&!awaitingNext){
            appendNode({card:'TACKLE',owner:'YOU',text:'TACKLE → GREEN 2'});
            setTimeout(()=>appendNode({result:'YOU STEAL THE SOCCER CARD',kind:'good'}),350);
            setTimeout(()=>{
              appendNode({result:'YOUR TURN CONTINUES',kind:'good'});
              gkStep=1.5;
              setLog('TACKLE takes the Soccer Card back from GREEN 2. You now have the Soccer Card, so you may SHOOT again.');
              render();
            },700);
            return;
          }
          return originalOnCard(name);
        };

        const originalResolveShoot=resolveShoot;
        resolveShoot=function(target){
          if(idx===7&&gkStep===1){
            closeTarget();
            setLog('GREEN 2 has the Soccer Card. You must TACKLE it back before you can SHOOT again.');
            render();
            return;
          }
          if(idx===1){
            gsmPossessor=target==='A0'?'A0':'A1';
          }
          return originalResolveShoot(target);
        };

        const originalRender=render;
        render=function(){
          originalRender();
          showRealSoccerCard();
          if(idx!==7)return;
          const status=$('statusText');
          const action=$('mainAction');
          if(gkStep===0){
            status.textContent='You have the Soccer Card • SHOOT GREEN 2';
            action.textContent='PLAY SHOOT — TEST PASSIVE';
            if(started&&!awaitingNext)showGuide('TAP SHOOT');
          }else if(gkStep===1){
            status.textContent='Goalkeeper saved • GREEN 2 now has the Soccer Card';
            action.textContent='PLAY TACKLE — TAKE SOCCER CARD BACK';
            if(started&&!awaitingNext)showGuide('TAP TACKLE — TAKE THE SOCCER CARD');
          }else if(gkStep===1.5){
            status.textContent='You stole the Soccer Card • SHOOT again';
            action.textContent='PLAY SHOOT AGAIN';
            if(started&&!awaitingNext)showGuide('TAP SHOOT AGAIN');
          }else if(gkStep>=2){
            status.textContent='Tutorial complete';
          }
        };

        gsmPossessor=defaultPossessorForLesson(idx);
        render();
      })();
    `;
    d.body.appendChild(s);
  }

  frame.addEventListener('load',()=>{
    installTutorialFix();
    setTimeout(installTutorialFix,150);
    setTimeout(installTutorialFix,500);
  });
  if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')installTutorialFix();
})();