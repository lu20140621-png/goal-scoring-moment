(()=>{
'use strict';
const IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const $=id=>document.getElementById(id);
const ALL=['B1','B2','BKG','G1','G2','GKG'];
let lesson=0,step=0,typing=null,hand=[],ball=null,flow=[],cardPrompt=null;

const lessons=[
{title:'SETUP & FIRST POSSESSION',note:'3v3 · public roles · 8 cards each · 3 extras discarded · the 10-minute clock includes trading.',hand:['SHOOT','DEFENSE','TACKLE','DRIBBLE','YELLOW'],lines:[
'Match Mode uses two 3-player teams: Defender 1, Defender 2, and Goalkeeper. Roles are public.',
'Shuffle all 51 Action Cards. Deal exactly 8 to each of the 6 players: 48 total. Discard the remaining 3 face-down.',
'Start the 10-minute timer immediately after dealing. Team trading and final setup already use match time.',
'Before locking the teams, trade only in a way that keeps hand sizes equal. The web version uses 1-for-1 swaps.',
'Use Rock-Paper-Scissors for first possession. The winner receives Soccer and becomes the first attacking team.'
],action:'setup'},

{title:'POSSESSION, PASS & TACKLE',note:'PASS is free. On a normal PASS, D1 gets the first TACKLE window, then D2. Goalkeeper does not TACKLE a normal PASS. YELLOW is not active.',hand:['SHOOT','DRIBBLE','DRIBBLE','YELLOW'],lines:[
'The Soccer Card shows possession. Whoever holds Soccer may PASS to either teammate for free, or play SHOOT if that player has one.',
'A normal PASS creates TACKLE windows in formation order: Defender 1 first, then Defender 2.',
'The Goalkeeper does not use TACKLE to intercept a normal PASS.',
'If a PASS TACKLE succeeds, the tackler takes Soccer and the pass ends. The passer may use DRIBBLE PAST to beat that TACKLE.',
'YELLOW cannot be used on a normal PASS because no SHOOT chain has started.'
],action:'pass'},

{title:'FULL SHOOT FLOW',note:'Every SHOOT resolves in order: Defender 1 → Defender 2 → Goalkeeper. Resolve only one defensive window at a time.',hand:['SHOOT','DRIBBLE','DRIBBLE','YELLOW'],lines:[
'Playing SHOOT starts one attack chain. SHOOT itself cannot be canceled by YELLOW.',
'Defender 1 gets the first window and may use DEFENSE, TACKLE, or let the attack through.',
'Only after Defender 1 is fully resolved does Defender 2 get the next defensive window.',
'If a field defender uses DEFENSE or TACKLE, the attacker may answer with DRIBBLE PAST.',
'If both field lines are cleared, the attack reaches the Goalkeeper.'
],action:'attack'},

{title:'FIELD DEFENSE RESULT',note:'A field DEFENSE ends only the current SHOOT. It does not steal Soccer. A new SHOOT resets to Defender 1.',hand:['SHOOT','SHOOT','DRIBBLE','YELLOW'],lines:[
'Field DEFENSE is the safe way to stop a SHOOT. DEFENSE cannot be canceled by YELLOW.',
'If the attacker does not beat DEFENSE with DRIBBLE PAST, that SHOOT ends immediately.',
'The SHOOT and DEFENSE stay spent, but Soccer remains with the same attacking ballholder.',
'All temporary beaten and chase states from that attack reset.',
'The ballholder may PASS or later play another SHOOT. Every new SHOOT starts again at Defender 1.'
],action:'defense'},

{title:'TACKLE WINS POSSESSION',note:'TACKLE is the possession-winning defense. It is legal on PASS or inside a field defensive window after SHOOT.',hand:['SHOOT','DRIBBLE','YELLOW'],lines:[
'TACKLE is different from DEFENSE: a successful TACKLE changes possession.',
'During a SHOOT, Defender 1 or Defender 2 may choose TACKLE in that defender’s own defensive window.',
'TACKLE can be beaten by DRIBBLE PAST. Inside a SHOOT chain, it can also be canceled by a legal YELLOW.',
'If TACKLE succeeds, the old PASS or SHOOT ends immediately and the tackler physically takes Soccer.',
'All old attack status clears. The tackler’s team is now attacking and may PASS or later SHOOT. The next SHOOT starts fresh at the opponent’s Defender 1.'
],action:'tackle'},

{title:'DRIBBLE & CHASE-BACK',note:'One DRIBBLE beats one field DEFENSE/TACKLE. Every time a defender is beaten during SHOOT, ask that exact defender whether to chase.',hand:['DRIBBLE','DRIBBLE','SHOOT','YELLOW'],lines:[
'DRIBBLE PAST beats exactly one field DEFENSE or one field TACKLE attempt.',
'There is no fixed DRIBBLE limit per attack; another DRIBBLE may be used against another legal defensive attempt if cards remain.',
'Every time a field defender is beaten during SHOOT, pause immediately and ask that exact defender: CHASE BACK or LET THE NEXT LINE DEFEND?',
'To chase, that defender discards 1 extra card, then must still play a separate DEFENSE or TACKLE.',
'If the same defender is beaten again, ask again. Every additional chase costs another extra discard.',
'DRIBBLE cannot bypass Goalkeeper DEFENSE.'
],action:'track'},

{title:'YELLOW — EXACT TIMING',note:'Only Defender 1 controls YELLOW for that team during a SHOOT chain. YELLOW cancels TACKLE, DRIBBLE, or YELLOW — never SHOOT or DEFENSE.',hand:['DRIBBLE','YELLOW','YELLOW','SHOOT'],lines:[
'YELLOW is not an anytime card. It becomes active only after a SHOOT chain has started.',
'Each team’s Defender 1 is that team’s YELLOW controller for the whole current SHOOT chain. Defender 2 and Goalkeeper do not play YELLOW in that chain.',
'Defender 1 keeps YELLOW control even after being dribbled past.',
'YELLOW may cancel TACKLE, DRIBBLE PAST, or another YELLOW. It cannot cancel SHOOT or DEFENSE.',
'YELLOW must be played before its target Action fully resolves. Once play moves to the next line or a new possession, it is too late.',
'YELLOW may cancel YELLOW, so counter-chains can restore the previous Action.'
],action:'yellow'},

{title:'GOALKEEPER FLOW',note:'Once the SHOOT reaches GK, DRIBBLE no longer bypasses defense. GK DEFENSE triggers RPS. Soccer ends with the defending GK after every GK-stage result.',hand:['SHOOT','DRIBBLE','YELLOW','DEFENSE'],lines:[
'The Goalkeeper stage starts only after both field defensive lines have been cleared.',
'If the Goalkeeper has no DEFENSE, the result is an automatic GOAL +1.',
'If the Goalkeeper plays DEFENSE, that DEFENSE cannot be canceled by YELLOW and the shooter and Goalkeeper play Rock-Paper-Scissors.',
'Goalkeeper wins RPS: SAVE. Shooter wins RPS: GOAL +1. A tie repeats until there is a winner.',
'After the Goalkeeper stage, Soccer always goes to the defending Goalkeeper — after a save, after losing RPS, or after conceding with no DEFENSE.',
'The Goalkeeper then becomes the new Soccer holder and may PASS or SHOOT if holding SHOOT.'
],action:'gk'},

{title:'WHEN THE MATCH ENDS',note:'Do not end because only one team has no SHOOT. At 00:00, finish any active chain first.',hand:['DEFENSE','TACKLE','YELLOW'],lines:[
'The main match ends when the clock reaches 00:00, when both teams have no Action Cards, or when both teams can no longer attack.',
'For this playtest, a team can still attack if any player on that team has a SHOOT card, because Soccer can be passed to that teammate.',
'If BLUE has no SHOOT anywhere but GREEN still has SHOOT, the match continues. BLUE can still defend with DEFENSE and TACKLE.',
'If time reaches 00:00 while a PASS, SHOOT, YELLOW chain, chase-back, or Goalkeeper duel is already resolving, finish that current chain first, then end the match.',
'Higher score wins. A tie goes to the Penalty Shootout.'
],action:'ending'},

{title:'PENALTY SHOOTOUT',note:'Tie-break uses all 51 Action Cards again. Field Player SHOOT = +1. Goalkeeper DEFENSE = -1 against the opponent total.',hand:['SHOOT','DEFENSE','TACKLE','YELLOW'],lines:[
'For a tied match, collect all 51 Action Cards: cards in hands, played cards, chase-cost discards, and the 3 setup discards.',
'Shuffle the full deck again.',
'Each field Player draws 1 card. SHOOT = +1 for that team; every other card = 0.',
'Each Goalkeeper draws 1 card. DEFENSE = -1 against the opponent’s shootout total; every other card = 0.',
'Compare the two team totals. Higher total wins. If tied, collect all 51 again, reshuffle, and repeat the shootout.'
],action:'penalty'}
];

function name(id){return id==='BKG'?'BLUE GK':id==='GKG'?'GREEN GK':id.replace('B','BLUE ').replace('G','GREEN ')}
function setBall(id){ball=id;ALL.forEach(x=>$(x).classList.toggle('hasBall',x===id))}
function setBeaten(ids=[]){['B1','B2','G1','G2'].forEach(x=>$(x).classList.toggle('beaten',ids.includes(x)))}
function setActive(ids=[]){ALL.forEach(x=>$(x).classList.toggle('active',ids.includes(x)))}
function setCount(){ALL.forEach(id=>{const el=$(id)?.querySelector('.handCount');if(el)el.textContent='8 START'})}
function setScore(blue=0,green=0){$('blueScore').textContent=blue;$('greenScore').textContent=green}
function addFlow(s,type=''){flow.push({s,type});flow=flow.slice(-12);$('flow').innerHTML=flow.map(x=>`<span class="chip ${x.type}">${x.s}</span>`).join('')}
function typeText(text,showNext=false,afterDone=null){
  clearInterval(typing);const el=$('coachText');el.textContent='';let i=0;$('coachNext').style.display='none';
  const finish=()=>{clearInterval(typing);typing=null;el.textContent=text;if(showNext)$('coachNext').style.display='block';if(afterDone)afterDone()};
  typing=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length)finish()},12);
  $('coachBubble').onclick=()=>{if(typing)finish()};
}
function renderHand(){
  const c=$('cards');
  c.innerHTML=hand.map((x,i)=>{
    const playable=!!cardPrompt&&x===cardPrompt.card;
    return `<button class="card${playable?' tutorialPlayable':''}" data-i="${i}" ${playable?'':'disabled'}><img src="${IMG[x]}" alt="${x}"><span class="cardTag">${x}</span></button>`;
  }).join('');
  [...c.querySelectorAll('.tutorialPlayable')].forEach(b=>b.onclick=()=>playTutorialCard(Number(b.dataset.i)));
  setCount();
}
function playTutorialCard(i){
  if(!cardPrompt)return;const card=hand[i];if(card!==cardPrompt.card)return;
  const next=cardPrompt.onPlay;const label=cardPrompt.label||`BLUE PLAYS ${card}`;cardPrompt=null;hand.splice(i,1);renderHand();addFlow(label,'good');next(card);
}
function askCard(card,text,onPlay,label=''){cardPrompt={card,onPlay,label};typeText(text,false);clearActions();renderHand()}
function btn(label,fn,cls=''){const b=document.createElement('button');b.className='action '+cls;b.textContent=label;b.onclick=fn;$('actions').appendChild(b)}
function clearActions(){$('actions').innerHTML=''}
function renderDots(){$('lessonBar').innerHTML=lessons.map((x,i)=>`<span class="lessonDot ${i===lesson?'on':''}">${i+1} ${x.title}</span>`).join('')}
function showLine(){
  const L=lessons[lesson];$('lessonTitle').textContent=`LESSON ${lesson+1}/${lessons.length} — ${L.title}`;$('note').textContent=L.note;renderDots();clearActions();cardPrompt=null;renderHand();
  if(step<L.lines.length){
    const last=step===L.lines.length-1;
    typeText(L.lines[step],!last,last?()=>setupAction(L.action):null);
    if(!last)$('coachNext').onclick=()=>{step++;showLine()};
  }else setupAction(L.action);
}
function setupLesson(){step=0;hand=[...lessons[lesson].hand];flow=[];cardPrompt=null;setBeaten([]);setActive([]);setBall(null);setScore(0,0);setCount();renderHand();showLine()}
function complete(msg){cardPrompt=null;renderHand();clearActions();setActive([]);addFlow(msg,'good');typeText('Good. This example now matches the current Match Mode rulebook. Tap next.',true);$('coachNext').onclick=()=>{lesson++;if(lesson>=lessons.length)finishTutorial();else setupLesson()}}

function setupAction(kind){
  clearActions();cardPrompt=null;renderHand();$('coachNext').style.display='none';

  if(kind==='setup'){
    addFlow('6 × 8 = 48 DEALT','good');addFlow('3 EXTRAS DISCARDED','good');
    typeText('Choose any RPS option. This demo will give BLUE first possession so you can continue the tutorial.',false);
    btn('ROCK',()=>openingRps('ROCK'));btn('PAPER',()=>openingRps('PAPER'));btn('SCISSORS',()=>openingRps('SCISSORS'));
  }

  if(kind==='pass'){
    setBall('B1');setActive(['B1']);
    btn('PASS → BLUE 2',()=>{
      setActive(['G1']);addFlow('BLUE 1 PASS → BLUE 2','good');addFlow('GREEN 1 TACKLE WINDOW','bad');
      addFlow('GREEN 1 TACKLE','bad');
      askCard('DRIBBLE','GREEN 1 uses TACKLE on the PASS. Tap DRIBBLE PAST in your hand to beat this first interception attempt.',()=>{
        addFlow('GREEN 1 TACKLE BEATEN','good');setBeaten(['G1']);setActive(['G2']);addFlow('GREEN 2 TACKLE WINDOW','bad');
        typeText('The pass is not complete yet. Defender 2 now gets the second TACKLE window. GREEN 2 chooses not to TACKLE, so the pass completes.',false);
        clearActions();btn('GREEN 2 LETS PASS GO',()=>{setBall('B2');setBeaten([]);setActive(['B2']);complete('PASS COMPLETE · BLUE 2 HAS SOCCER')});
      });
    });
  }

  if(kind==='attack'){
    setBall('B1');setActive(['B1']);
    askCard('SHOOT','Tap SHOOT in your hand. This starts one attack chain and opens Defender 1 first.',()=>{
      setActive(['G1']);addFlow('GREEN 1 LETS ATTACK THROUGH','bad');
      typeText('GREEN 1 spends no card and lets the attack through. No DRIBBLE is required when a defender does not defend.',false);
      clearActions();btn('MOVE TO DEFENDER 2',()=>{
        setActive(['G2']);addFlow('GREEN 2 DEFENSE','bad');
        askCard('DRIBBLE','GREEN 2 now uses DEFENSE. Tap DRIBBLE PAST to beat this one defensive attempt.',()=>{
          setBeaten(['G2']);addFlow('GREEN 2 BEATEN','good');
          typeText('GREEN 2 is beaten and chooses not to chase back. The SHOOT now reaches the Goalkeeper.',false);
          clearActions();btn('LET GREEN 2 STAY BEATEN',()=>{setActive(['GKG']);complete('NEXT STAGE: GOALKEEPER')});
        });
      });
    });
  }

  if(kind==='defense'){
    setBall('B1');setActive(['B1']);
    askCard('SHOOT','Tap SHOOT to begin the attack.',()=>{
      setActive(['G1']);addFlow('GREEN 1 DEFENSE','bad');
      typeText('Do not play DRIBBLE this time. Let GREEN 1 DEFENSE succeed.',false);clearActions();
      btn('LET DEFENSE SUCCEED',()=>{
        addFlow('CURRENT SHOOT ENDS','bad');setBeaten([]);setActive(['B1']);setBall('B1');
        typeText('The SHOOT is over, but DEFENSE did not steal Soccer. BLUE 1 still has possession. A later new SHOOT would begin again at GREEN 1.',false);
        clearActions();btn('RETURN TO POSSESSION',()=>complete('BLUE 1 STILL HAS SOCCER'));
      });
    });
  }

  if(kind==='tackle'){
    setBall('B1');setActive(['B1']);
    askCard('SHOOT','Tap SHOOT to start a new attack.',()=>{
      setActive(['G1']);addFlow('GREEN 1 TACKLE','bad');
      typeText('Let this TACKLE succeed. Because it is TACKLE, not DEFENSE, possession changes immediately.',false);clearActions();
      btn('LET TACKLE SUCCEED',()=>{
        setBall('G1');setBeaten([]);setActive(['G1']);addFlow('OLD SHOOT ENDS','bad');addFlow('GREEN 1 TAKES SOCCER','good');
        typeText('All old attack status is cleared. GREEN is now attacking. GREEN 1 may PASS or later SHOOT; the next GREEN SHOOT starts fresh at BLUE 1.',false);
        clearActions();btn('START NEW POSSESSION',()=>complete('NEW POSSESSION: GREEN'));
      });
    });
  }

  if(kind==='track'){
    setBall('B1');setActive(['G1']);addFlow('GREEN 1 DEFENSE','bad');
    askCard('DRIBBLE','Tap DRIBBLE PAST to beat GREEN 1’s DEFENSE.',()=>{
      setBeaten(['G1']);addFlow('GREEN 1 BEATEN','good');
      typeText('Pause immediately. GREEN 1 must decide: chase back by discarding 1 extra card, or let the next line defend.',false);clearActions();
      btn('GREEN 1 CHASES · DISCARD 1',()=>{
        addFlow('GREEN 1 DISCARD 1','bad');addFlow('GREEN 1 TACKLE','bad');setActive(['G1']);
        askCard('DRIBBLE','The discard only pays the chase cost. GREEN 1 still had to play a separate TACKLE. Tap your second DRIBBLE to beat that TACKLE.',()=>{
          setBeaten(['G1']);addFlow('GREEN 1 BEATEN AGAIN','good');
          typeText('GREEN 1 was beaten again, so the chase-back question happens again. Every extra chase costs another extra discard.',false);clearActions();
          btn('LET NEXT LINE DEFEND',()=>{setActive(['G2']);complete('NEXT DEFENSIVE LINE: GREEN 2')});
        });
      });
    });
  }

  if(kind==='yellow'){
    setBall('B1');setActive(['B1']);addFlow('SHOOT ACTIVE','good');addFlow('GREEN 1 DEFENSE','bad');
    askCard('DRIBBLE','The SHOOT has started and GREEN 1 used DEFENSE. Tap DRIBBLE PAST to try to beat it.',()=>{
      addFlow('GREEN D1 YELLOW → DRIBBLE CANCELED','bad');
      askCard('YELLOW','GREEN Defender 1 uses YELLOW before your DRIBBLE resolves. Only Defender 1 controls GREEN YELLOW for this SHOOT. Tap BLUE Defender 1’s YELLOW to cancel GREEN’s YELLOW.',()=>{
        addFlow('BLUE D1 YELLOW → GREEN YELLOW CANCELED','good');
        typeText('Your YELLOW restores the DRIBBLE. GREEN Defender 1 may answer with another YELLOW before the chain resolves.',false);clearActions();
        btn('GREEN D1 PLAYS ANOTHER YELLOW',()=>{
          addFlow('GREEN D1 YELLOW → BLUE YELLOW CANCELED','bad');
          typeText('Final result: GREEN’s first YELLOW is active again, so the DRIBBLE is canceled. The earlier DEFENSE succeeds, this SHOOT ends, and Soccer stays with BLUE 1.',false);clearActions();
          btn('RESOLVE CHAIN',()=>{setBall('B1');complete('DEFENSE SUCCEEDS · BLUE KEEPS SOCCER')});
        });
      },'BLUE D1 PLAYS YELLOW');
    });
  }

  if(kind==='gk'){
    setBall('B1');setBeaten(['G1','G2']);setActive(['B1']);
    askCard('SHOOT','Both field lines are cleared in this example. Tap SHOOT to reach the Goalkeeper stage.',()=>{
      setActive(['GKG']);
      typeText('First case: GREEN GK has no DEFENSE. That is an automatic GOAL +1, and Soccer still goes to GREEN GK for the restart.',false);clearActions();
      btn('SEE NO-DEFENSE RESULT',()=>{
        setScore(1,0);addFlow('AUTO GOAL +1 BLUE','good');setBall('GKG');addFlow('SOCCER → GREEN GK','good');
        typeText('Second case: now imagine GREEN GK has DEFENSE. GK DEFENSE starts Rock-Paper-Scissors and cannot be canceled by YELLOW.',false);clearActions();
        btn('TRY GK DEFENSE',()=>{
          addFlow('GREEN GK DEFENSE','bad');typeText('Choose any RPS option. This demo will show a shooter win. Even after the goal, Soccer still ends with GREEN GK.',false);clearActions();
          btn('ROCK',()=>gkRps());btn('PAPER',()=>gkRps());btn('SCISSORS',()=>gkRps());
        });
      });
    });
  }

  if(kind==='ending'){
    addFlow('BLUE: NO SHOOT','bad');addFlow('GREEN: HAS SHOOT','good');
    typeText('Does the match end because BLUE has no SHOOT?',false);clearActions();
    btn('NO · CONTINUE MATCH',()=>{
      addFlow('MATCH CONTINUES','good');
      typeText('Correct. BLUE can still defend while GREEN can attack. Now test the clock rule: 00:00 arrives while a SHOOT chain is already active.',false);clearActions();
      btn('CLOCK HITS 00:00 MID-ATTACK',()=>{
        addFlow('00:00','bad');addFlow('FINISH ACTIVE CHAIN FIRST','good');
        typeText('Finish that current PASS/SHOOT/YELLOW/chase/GK chain, apply its result, then end the main match and compare the score.',false);clearActions();
        btn('END AFTER CHAIN',()=>complete('END RULE CORRECT'));
      });
    });
  }

  if(kind==='penalty'){
    typeText('A tied match collects every one of the 51 Action Cards again — including the 3 setup discards and all chase-cost discards.',false);clearActions();
    btn('SHUFFLE ALL 51',()=>{
      addFlow('ALL 51 SHUFFLED','good');addFlow('BLUE FIELD: SHOOT +1','good');addFlow('BLUE GK: DEFENSE','bad');addFlow('GREEN FIELD: OTHER 0','');addFlow('GREEN GK: OTHER 0','');
      typeText('Example scoring: BLUE field Player draws SHOOT = +1. BLUE Goalkeeper draws DEFENSE = -1 against GREEN’s total. Other cards are 0. Higher final team total wins; a tie reshuffles all 51 and repeats.',false);clearActions();
      btn('CALCULATE & FINISH',()=>complete('PENALTY RULE COMPLETE'));
    });
  }
}

function openingRps(choice){clearActions();addFlow(`YOU CHOOSE ${choice}`,'good');addFlow('BLUE WINS RPS','good');setBall('B1');setActive(['B1']);complete('BLUE RECEIVES FIRST SOCCER')}
function gkRps(){clearActions();addFlow('SHOOTER WINS RPS','good');setScore(1,0);setBall('GKG');addFlow('GOAL +1 BLUE','good');addFlow('SOCCER → GREEN GK','good');complete('GREEN GK HAS SOCCER AFTER GK STAGE')}
function finishTutorial(){cardPrompt=null;renderHand();clearActions();setActive([]);typeText('You have now completed the current Match Mode rulebook flow: setup, PASS, full SHOOT order, DEFENSE, TACKLE, DRIBBLE chase-back, YELLOW timing, Goalkeeper outcomes, match ending, and Penalty Shootout.',false);btn('PLAY VS AI',()=>location.href='match-ai.html?v=20260907m9','blue');btn('FULL RULEBOOK',()=>location.href='match-rules.html?v=20260907m9','dark')}
setupLesson();
})();
