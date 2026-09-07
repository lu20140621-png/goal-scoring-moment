(()=>{
'use strict';
const IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const $=id=>document.getElementById(id);
const ALL=['B1','B2','BKG','G1','G2','GKG'];
let lesson=0,step=0,typing=null,hand=[],flow=[],cardPrompt=null;

const lessons=[
{title:'SETUP & FIRST POSSESSION',note:'3v3 · public roles · 8 each · 3 extras discarded · trading counts inside 10:00.',hand:['SHOOT','DEFENSE','TACKLE','DRIBBLE','YELLOW'],lines:[
'Match Mode uses Defender 1, Defender 2, and Goalkeeper on each team. All roles are public.',
'Shuffle 51 Action Cards. Deal exactly 8 to each of 6 players = 48 cards. Discard the remaining 3 face-down.',
'Start the 10-minute clock immediately after dealing. Trading already uses match time.',
'Use Rock-Paper-Scissors for first possession. The winner receives Soccer.'
],action:'setup'},
{title:'PASS & TACKLE',note:'PASS is free. D1 gets the first TACKLE window, then D2. No YELLOW during a normal PASS.',hand:['DRIBBLE','SHOOT','YELLOW'],lines:[
'The Soccer holder may PASS to either teammate without spending a card.',
'During a normal PASS, Defender 1 may TACKLE first. If that window clears, Defender 2 may TACKLE.',
'Goalkeeper does not TACKLE a normal PASS.',
'The passer may use DRIBBLE PAST against a PASS TACKLE. YELLOW is not active because no SHOOT line has started.'
],action:'pass'},
{title:'FULL SHOOT ORDER',note:'Every SHOOT resolves D1 → D2 → GK. If a defender plays nothing, no DRIBBLE is required.',hand:['SHOOT','DRIBBLE'],lines:[
'Playing SHOOT starts one attack chain. SHOOT cannot be canceled by YELLOW.',
'Defender 1 gets the first defensive line and may use DEFENSE, TACKLE, or not defend.',
'Only after D1 is fully resolved does D2 receive its own defensive line.',
'If D2 does not play DEFENSE or TACKLE, D2 has not defended. You do not spend DRIBBLE — the SHOOT goes straight to GK.'
],action:'attack'},
{title:'FIELD DEFENSE RESULT',note:'Field DEFENSE stops only this SHOOT. Soccer stays with the attacker.',hand:['SHOOT','SHOOT','DRIBBLE'],lines:[
'Field DEFENSE is the safe stop. It cannot be canceled by YELLOW.',
'If the attacker does not beat it with DRIBBLE, this SHOOT ends.',
'DEFENSE does not win possession. Soccer remains with the same attacking ballholder.',
'The holder may PASS or later SHOOT again. Every new SHOOT starts again at D1.'
],action:'defense'},
{title:'TACKLE WINS SOCCER',note:'TACKLE may defend a PASS or a field SHOOT line. If it succeeds, possession changes.',hand:['SHOOT','DRIBBLE','YELLOW'],lines:[
'During a SHOOT, the current field defender may choose TACKLE instead of DEFENSE.',
'A successful TACKLE ends the current action and gives Soccer to the tackler.',
'The attacker may use DRIBBLE PAST against TACKLE. During the SHOOT line, the attacker may also use YELLOW on that TACKLE.',
'After TACKLE wins Soccer, all old attack status clears and the tackler’s team starts a new possession.'
],action:'tackle'},
{title:'DRIBBLE & CHASE BACK',note:'Every successful DRIBBLE creates a chase-back decision for the exact defender beaten.',hand:['DRIBBLE','DRIBBLE','SHOOT'],lines:[
'One DRIBBLE beats one field DEFENSE or TACKLE attempt.',
'If a defender never played DEFENSE/TACKLE, you do not need DRIBBLE to pass that line.',
'After every successful DRIBBLE, immediately ask that exact defender: CHASE BACK or LET NEXT LINE DEFEND?',
'To chase, discard 1 extra card, then play a separate DEFENSE or TACKLE. If beaten again, ask again and pay again.'
],action:'track'},
{title:'YELLOW — CURRENT LINE ONLY',note:'Defensive YELLOW belongs to the defender whose line is currently being attacked.',hand:['SHOOT','DRIBBLE','YELLOW','YELLOW'],lines:[
'YELLOW is not controlled by Defender 1 for the whole attack. It is tied to the current defensive line.',
'At D1, D1 may use defensive YELLOW only after the opponent plays DRIBBLE or YELLOW against D1’s line.',
'Once the SHOOT moves to D2, D1’s YELLOW window is over. Now D2 owns the defensive YELLOW window.',
'Defensive YELLOW cannot cancel SHOOT, DEFENSE, a normal PASS, or an action on another line.',
'If the attacker uses YELLOW against the current defender’s TACKLE, that same defender may answer with YELLOW.'
],action:'yellow'},
{title:'GOALKEEPER FLOW',note:'At GK, field-line YELLOW ends. GK DEFENSE triggers RPS; Soccer ends with the defending GK in every GK-stage result.',hand:['SHOOT','DEFENSE'],lines:[
'The SHOOT reaches GK only after D1 and D2 are both cleared or chose not to defend.',
'If GK has no DEFENSE: automatic GOAL +1.',
'If GK plays DEFENSE: shooter and GK play Rock-Paper-Scissors. GK wins = SAVE; shooter wins = GOAL +1; tie = repeat.',
'Whether the GK saves or concedes, Soccer finishes in the defending Goalkeeper’s hand.'
],action:'gk'},
{title:'WHEN THE MATCH ENDS',note:'One team having no SHOOT does not end the match. At 00:00, finish the active chain first.',hand:['DEFENSE','TACKLE','YELLOW'],lines:[
'The main match ends at 00:00, when both teams have no Action Cards, or when both teams can no longer attack.',
'A team can still attack if any teammate still has SHOOT because Soccer can be passed to that teammate.',
'If BLUE has no SHOOT but GREEN still has SHOOT, continue. BLUE may still defend.',
'If 00:00 happens during an active PASS, SHOOT, YELLOW chain, chase-back, or GK duel, finish that chain first.'
],action:'ending'},
{title:'PENALTY SHOOTOUT',note:'Tie-break reshuffles all 51. Field SHOOT = +1. GK DEFENSE = -1 against opponent.',hand:['SHOOT','DEFENSE'],lines:[
'If the final score is tied, collect all 51 cards again, including the 3 setup extras and every spent card.',
'Each field Player draws 1: SHOOT = +1, everything else = 0.',
'Each Goalkeeper draws 1: DEFENSE = -1 against the opponent total, everything else = 0.',
'Higher total wins. If tied again, reshuffle all 51 and repeat.'
],action:'penalty'}
];

function setBall(id){ALL.forEach(x=>$(x).classList.toggle('hasBall',x===id))}
function setBeaten(ids=[]){['B1','B2','G1','G2'].forEach(x=>$(x).classList.toggle('beaten',ids.includes(x)))}
function setActive(ids=[]){ALL.forEach(x=>$(x).classList.toggle('active',ids.includes(x)))}
function setScore(b=0,g=0){$('blueScore').textContent=b;$('greenScore').textContent=g}
function addFlow(s,type=''){flow.push({s,type});flow=flow.slice(-12);$('flow').innerHTML=flow.map(x=>`<span class="chip ${x.type}">${x.s}</span>`).join('')}
function typeText(text,showNext=false,afterDone=null){clearInterval(typing);const el=$('coachText');el.textContent='';let i=0;$('coachNext').style.display='none';const finish=()=>{clearInterval(typing);typing=null;el.textContent=text;if(showNext)$('coachNext').style.display='block';if(afterDone)afterDone()};typing=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length)finish()},12);$('coachBubble').onclick=()=>{if(typing)finish()}}
function renderHand(){const c=$('cards');c.innerHTML=hand.map((x,i)=>{const p=!!cardPrompt&&x===cardPrompt.card;return `<button class="card${p?' tutorialPlayable':''}" data-i="${i}" ${p?'':'disabled'}><img src="${IMG[x]}" alt="${x}"><span class="cardTag">${x}</span></button>`}).join('');[...c.querySelectorAll('.tutorialPlayable')].forEach(b=>b.onclick=()=>playCard(Number(b.dataset.i)))}
function playCard(i){if(!cardPrompt)return;const card=hand[i];if(card!==cardPrompt.card)return;const next=cardPrompt.onPlay,label=cardPrompt.label||`BLUE PLAYS ${card}`;cardPrompt=null;hand.splice(i,1);renderHand();addFlow(label,'good');next(card)}
function askCard(card,text,onPlay,label=''){cardPrompt={card,onPlay,label};typeText(text,false);clearActions();renderHand()}
function btn(label,fn,cls=''){const b=document.createElement('button');b.className='action '+cls;b.textContent=label;b.onclick=fn;$('actions').appendChild(b)}
function clearActions(){$('actions').innerHTML=''}
function renderDots(){$('lessonBar').innerHTML=lessons.map((x,i)=>`<span class="lessonDot ${i===lesson?'on':''}">${i+1} ${x.title}</span>`).join('')}
function showLine(){const L=lessons[lesson];$('lessonTitle').textContent=`LESSON ${lesson+1}/${lessons.length} — ${L.title}`;$('note').textContent=L.note;renderDots();clearActions();cardPrompt=null;renderHand();if(step<L.lines.length){const last=step===L.lines.length-1;typeText(L.lines[step],!last,last?()=>setupAction(L.action):null);if(!last)$('coachNext').onclick=()=>{step++;showLine()}}else setupAction(L.action)}
function setupLesson(){step=0;hand=[...lessons[lesson].hand];flow=[];cardPrompt=null;setBeaten([]);setActive([]);setBall(null);setScore();renderHand();showLine()}
function complete(msg){cardPrompt=null;renderHand();clearActions();setActive([]);addFlow(msg,'good');typeText('Good. This example matches the current Match Mode rulebook. Tap next.',true);$('coachNext').onclick=()=>{lesson++;if(lesson>=lessons.length)finishTutorial();else setupLesson()}}

function setupAction(kind){clearActions();cardPrompt=null;renderHand();$('coachNext').style.display='none';
if(kind==='setup'){addFlow('6 × 8 = 48 DEALT','good');addFlow('3 EXTRAS DISCARDED','good');typeText('Choose any RPS option. This demo gives BLUE first Soccer.',false);btn('ROCK',opening);btn('PAPER',opening);btn('SCISSORS',opening)}
if(kind==='pass'){setBall('B1');setActive(['B1']);btn('PASS → BLUE 2',()=>{addFlow('BLUE 1 PASS → BLUE 2','good');setActive(['G1']);addFlow('GREEN D1 TACKLE','bad');askCard('DRIBBLE','GREEN D1 uses TACKLE on the pass. Tap DRIBBLE PAST to beat it.',()=>{addFlow('D1 TACKLE BEATEN','good');setActive(['G2']);typeText('Now D2 gets the second TACKLE window. D2 chooses not to TACKLE, so the pass completes.',false);clearActions();btn('D2 LETS PASS GO',()=>{setBall('B2');complete('PASS COMPLETE · BLUE 2 HAS SOCCER')})})})}
if(kind==='attack'){setBall('B1');setActive(['B1']);askCard('SHOOT','Tap SHOOT to start the attack.',()=>{setActive(['G1']);addFlow('D1 LETS ATTACK THROUGH','bad');typeText('D1 played no DEFENSE/TACKLE, so no DRIBBLE is needed. Move to D2.',false);clearActions();btn('MOVE TO D2',()=>{setActive(['G2']);addFlow('D2 LETS ATTACK THROUGH','bad');typeText('D2 also plays no DEFENSE/TACKLE. This means D2 did not defend. No DRIBBLE is required — go straight to GK.',false);clearActions();btn('GO STRAIGHT TO GK',()=>{setActive(['GKG']);complete('D1 → D2 → GK COMPLETE')})})})}
if(kind==='defense'){setBall('B1');askCard('SHOOT','Tap SHOOT to attack D1.',()=>{setActive(['G1']);addFlow('GREEN D1 DEFENSE','bad');typeText('Let DEFENSE work. This SHOOT ends, but Soccer stays with BLUE 1.',false);clearActions();btn('LET DEFENSE SUCCEED',()=>{setBall('B1');addFlow('SHOOT ENDS · BLUE KEEPS SOCCER','good');complete('FIELD DEFENSE RESULT')})})}
if(kind==='tackle'){setBall('B1');askCard('SHOOT','Tap SHOOT. GREEN D1 will answer with TACKLE.',()=>{setActive(['G1']);addFlow('GREEN D1 TACKLE','bad');typeText('Let TACKLE succeed this time. TACKLE, unlike DEFENSE, wins possession.',false);clearActions();btn('LET TACKLE WIN',()=>{setBall('G1');addFlow('GREEN D1 TAKES SOCCER','good');complete('NEW POSSESSION: GREEN')})})}
if(kind==='track'){setBall('B1');setActive(['G1']);addFlow('GREEN D1 DEFENSE','bad');askCard('DRIBBLE','Tap DRIBBLE PAST to beat D1 DEFENSE.',()=>{setBeaten(['G1']);addFlow('D1 BEATEN','good');typeText('Every successful DRIBBLE asks this exact defender whether to chase back.',false);clearActions();btn('D1 CHASES · DISCARD 1',()=>{addFlow('D1 DISCARD 1','bad');addFlow('D1 TACKLE','bad');askCard('DRIBBLE','D1 paid the chase cost and played a separate TACKLE. Tap your second DRIBBLE.',()=>{addFlow('D1 BEATEN AGAIN','good');typeText('D1 was beaten again, so the chase question happens again.',false);clearActions();btn('LET NEXT LINE DEFEND',()=>{setActive(['G2']);complete('NEXT LINE: D2')})})})})}
if(kind==='yellow'){setBall('B1');setActive(['G1']);addFlow('SHOOT ACTIVE','good');addFlow('D1 LETS ATTACK THROUGH','bad');typeText('D1 is finished. The attack now moves to D2, so D1 no longer owns the defensive YELLOW window.',false);clearActions();btn('MOVE TO D2',()=>{setActive(['G2']);addFlow('GREEN D2 DEFENSE','bad');askCard('DRIBBLE','GREEN D2 uses DEFENSE. Tap DRIBBLE PAST to try to beat D2.',()=>{addFlow('BLUE DRIBBLE vs D2','good');addFlow('GREEN D2 YELLOW → DRIBBLE CANCELED','bad');askCard('YELLOW','Because the DRIBBLE targets D2’s line, GREEN D2 — not D1 — may use YELLOW. D2 cancels your DRIBBLE. Tap your YELLOW to cancel D2’s YELLOW.',()=>{addFlow('BLUE YELLOW → D2 YELLOW CANCELED','good');typeText('Your YELLOW restores the DRIBBLE. Because you just played YELLOW against D2’s line, D2 may answer with another YELLOW.',false);clearActions();btn('GREEN D2 PLAYS YELLOW',()=>{addFlow('D2 YELLOW → BLUE YELLOW CANCELED','bad');typeText('Final result: D2’s first YELLOW becomes active again, your DRIBBLE is canceled, and D2 DEFENSE succeeds. D1 cannot interfere because this is D2’s line.',false);clearActions();btn('RESOLVE D2 LINE',()=>{setBall('B1');complete('D2 DEFENSE SUCCEEDS · BLUE KEEPS SOCCER')})})},'BLUE PLAYS YELLOW')})})}
if(kind==='gk'){setBall('B1');setBeaten(['G1','G2']);askCard('SHOOT','Tap SHOOT. Both field lines are already cleared in this example.',()=>{setActive(['GKG']);typeText('At GK, the field-line YELLOW window is over. First case: no GK DEFENSE = automatic GOAL +1 and Soccer goes to GREEN GK.',false);clearActions();btn('SEE RESULT',()=>{setScore(1,0);setBall('GKG');addFlow('GOAL +1 · SOCCER → GREEN GK','good');typeText('With GK DEFENSE, use RPS instead. Either SAVE or GOAL still ends with Soccer in GREEN GK’s hand.',false);clearActions();btn('GK DEFENSE + RPS',()=>complete('GK RULE COMPLETE'))})})}
if(kind==='ending'){addFlow('BLUE: NO SHOOT','bad');addFlow('GREEN: HAS SHOOT','good');typeText('BLUE has no SHOOT. Does the match end?',false);btn('NO · CONTINUE',()=>{addFlow('MATCH CONTINUES','good');typeText('Correct. If 00:00 arrives during an active chain, finish that chain first, then end.',false);clearActions();btn('FINISH ACTIVE CHAIN',()=>complete('END RULE COMPLETE'))})}
if(kind==='penalty'){typeText('A tied match collects and reshuffles all 51 Action Cards.',false);btn('SHUFFLE ALL 51',()=>{addFlow('FIELD SHOOT = +1','good');addFlow('GK DEFENSE = -1','bad');typeText('Higher team total wins. A tie reshuffles all 51 and repeats.',false);clearActions();btn('FINISH',()=>complete('PENALTY RULE COMPLETE'))})}
}
function opening(){clearActions();addFlow('BLUE WINS RPS','good');setBall('B1');complete('BLUE RECEIVES FIRST SOCCER')}
function finishTutorial(){clearActions();cardPrompt=null;renderHand();typeText('Tutorial complete. The current rules now include line-specific YELLOW: D1 controls D1 reactions; after the attack moves to D2, D2 controls D2 reactions.',false);btn('PLAY VS AI',()=>location.href='match-ai.html?v=20260907m12','blue');btn('FULL RULEBOOK',()=>location.href='match-rules.html?v=20260907m12','dark')}
setupLesson();
})();