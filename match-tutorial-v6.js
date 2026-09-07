(()=>{
'use strict';
const IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const $=id=>document.getElementById(id);
const ALL=['B1','B2','BKG','G1','G2','GKG'];
let lesson=0,step=0,typing=null,hand=[],flow=[],cardPrompt=null;

const lessons=[
{title:'SETUP & FIRST POSSESSION',note:'3v3 · public roles · 8 each · 3 extras discarded · trading counts inside 10:00.',hand:['SHOOT','DEFENSE','TACKLE','DRIBBLE','YELLOW'],lines:[
'Match Mode uses Defender 1, Defender 2, and Goalkeeper on each team. All roles are public.',
'Shuffle all 51 Action Cards. Deal exactly 8 to each of 6 players = 48 cards. Discard the remaining 3 face-down.',
'Start the 10-minute clock immediately after dealing. Team trading already uses match time.',
'Use Rock-Paper-Scissors for first possession. The winner receives Soccer.'
],action:'setup'},
{title:'PASS & TACKLE',note:'PASS is free. D1 gets the first TACKLE window, then D2. No YELLOW during a normal PASS.',hand:['DRIBBLE','SHOOT','YELLOW'],lines:[
'The Soccer holder may PASS to either teammate without spending a card.',
'During a normal PASS, Defender 1 may TACKLE first. If that window clears, Defender 2 may TACKLE.',
'Goalkeeper does not TACKLE a normal PASS while acting as Goalkeeper.',
'The passer may use DRIBBLE PAST against a PASS TACKLE. YELLOW is not active because no SHOOT line has started.'
],action:'pass'},
{title:'FULL SHOOT ORDER',note:'Every SHOOT resolves D1 → D2 → GK. If a defender plays nothing, no DRIBBLE is required.',hand:['SHOOT','DRIBBLE'],lines:[
'Playing SHOOT starts one attack chain. SHOOT cannot be canceled by YELLOW.',
'Defender 1 gets the first defensive line and may use DEFENSE, TACKLE, or not defend.',
'Only after D1 is fully resolved does D2 receive its own defensive line.',
'If D2 does not play DEFENSE or TACKLE, D2 did not defend. You do not spend DRIBBLE — the SHOOT goes straight to GK.'
],action:'attack'},
{title:'FIELD DEFENSE RESULT',note:'Field DEFENSE stops only this SHOOT. Soccer stays with the attacker.',hand:['SHOOT','SHOOT','DRIBBLE'],lines:[
'Field DEFENSE cannot be canceled by YELLOW.',
'If the attacker does not beat it with DRIBBLE, the current SHOOT ends.',
'DEFENSE does not win possession. Soccer remains with the same attacking ballholder.',
'The holder may PASS or later SHOOT again. Every new SHOOT restarts at D1.'
],action:'defense'},
{title:'TACKLE WINS SOCCER',note:'TACKLE may defend a PASS or a field SHOOT line. If it succeeds, possession changes.',hand:['SHOOT','DRIBBLE','YELLOW'],lines:[
'During a SHOOT, the current field defender may choose TACKLE instead of DEFENSE.',
'A successful TACKLE ends the current action and gives Soccer to the tackler.',
'The attacker may use DRIBBLE PAST against TACKLE. During the SHOOT line, the attacker may also use YELLOW on that TACKLE.',
'After TACKLE wins Soccer, the old attack ends and the tackler’s team starts a new possession.'
],action:'tackle'},
{title:'DRIBBLE & CHASE BACK',note:'Every successful DRIBBLE creates a chase-back decision for the exact defender beaten.',hand:['DRIBBLE','DRIBBLE','SHOOT'],lines:[
'One DRIBBLE beats one field DEFENSE or TACKLE attempt.',
'If a defender never played DEFENSE/TACKLE, you do not need DRIBBLE to pass that line.',
'After every successful DRIBBLE, immediately ask that exact defender: CHASE BACK or LET NEXT LINE DEFEND?',
'To chase, discard 1 extra card, then play a separate DEFENSE or TACKLE. If beaten again, ask again and pay again.'
],action:'track'},
{title:'YELLOW — CURRENT LINE ONLY',note:'Defensive YELLOW belongs to the defender whose line is currently being attacked.',hand:['SHOOT','DRIBBLE','YELLOW','YELLOW'],lines:[
'YELLOW is tied to the current defensive line, not to Defender 1 for the whole attack.',
'At D1, only D1 may use defensive YELLOW after the opponent plays DRIBBLE or YELLOW against D1’s line.',
'Once the SHOOT moves to D2, D1’s YELLOW window is over. Now D2 owns the defensive YELLOW window.',
'Defensive YELLOW cannot cancel SHOOT, DEFENSE, a normal PASS, or an action on another line.',
'If the attacker uses YELLOW against the current defender’s TACKLE, that same defender may answer with YELLOW.'
],action:'yellow'},
{title:'GOALKEEPER FLOW',note:'At GK, field-line YELLOW ends. GK DEFENSE triggers RPS; Soccer ends with the defending GK after every GK-stage result.',hand:['SHOOT','DEFENSE'],lines:[
'The SHOOT reaches GK only after D1 and D2 are both cleared or chose not to defend.',
'If GK has no DEFENSE: automatic GOAL +1.',
'If GK plays DEFENSE: shooter and GK play Rock-Paper-Scissors. GK wins = SAVE; shooter wins = GOAL +1; tie = repeat.',
'Whether the GK saves or concedes, Soccer finishes in the defending Goalkeeper’s hand.'
],action:'gk'},
{title:'GOALKEEPER JOINS THE ATTACK',note:'GK may attack. But if the GK personally loses Soccer to TACKLE, the GK is OUT OF POSITION until recovery.',hand:['SHOOT','DEFENSE','YELLOW','DRIBBLE'],lines:[
'After a save or restart, the Goalkeeper may PASS or may attack personally if holding SHOOT.',
'When the Goalkeeper attacks, SHOOT, DRIBBLE, and attacking-side YELLOW work normally.',
'Risk: if an opponent TACKLE successfully steals Soccer from the attacking Goalkeeper, that Goalkeeper is OUT OF POSITION.',
'The counterattack still resolves D1 → D2. Only when it reaches the Goalkeeper stage must the out-of-position GK decide whether to return.',
'To RETURN TO GOAL, discard any 1 card. That discard is only the recovery cost. A separate DEFENSE is still required for the normal GK RPS save.',
'If the GK does not discard 1 card, or has no card to discard, the goal is empty and the opponent scores automatically.'
],action:'gkattack'},
{title:'WHEN THE MATCH ENDS',note:'One team having no SHOOT does not end the match. At 00:00, finish the active chain first.',hand:['DEFENSE','TACKLE','YELLOW'],lines:[
'The main match ends at 00:00, when both teams have no Action Cards, or when both teams can no longer attack.',
'A team can still attack if any teammate still has SHOOT because Soccer can be passed to that teammate.',
'If BLUE has no SHOOT but GREEN still has SHOOT, continue. BLUE may still defend.',
'If 00:00 happens during an active PASS, SHOOT, YELLOW chain, chase-back, GK return decision, or GK duel, finish that chain first.'
],action:'ending'},
{title:'PENALTY SHOOTOUT',note:'Four separate paired draws. Each field Player draws once; the opposing GK draws a fresh card against each Player.',hand:['SHOOT','DEFENSE'],lines:[
'If the final score is tied, collect all 51 cards again, including the 3 setup extras and every spent card.',
'GREEN 1 draws 1 card and BLUE GK draws 1 fresh card against GREEN 1.',
'GREEN 2 draws 1 card and BLUE GK draws a second fresh card against GREEN 2.',
'Then BLUE 1 draws against a fresh GREEN GK draw, and BLUE 2 draws against another fresh GREEN GK draw.',
'A duel scores 1 goal only when the field Player draws SHOOT and the opposing GK does NOT draw DEFENSE. Otherwise that duel scores 0. Scores never go negative.',
'After all four duels, higher shootout score wins. If tied, collect and reshuffle all 51 and repeat all four duels.'
],action:'penalty'}
];

function setBall(id){ALL.forEach(x=>$(x).classList.toggle('hasBall',x===id))}
function setBeaten(ids=[]){['B1','B2','G1','G2'].forEach(x=>$(x).classList.toggle('beaten',ids.includes(x)))}
function setActive(ids=[]){ALL.forEach(x=>$(x).classList.toggle('active',ids.includes(x)))}
function setGKOut(id,on){const p=$(id);if(p)p.classList.toggle('outOfPosition',!!on)}
function setScore(b=0,g=0){$('blueScore').textContent=b;$('greenScore').textContent=g}
function addFlow(s,type=''){flow.push({s,type});flow=flow.slice(-12);$('flow').innerHTML=flow.map(x=>`<span class="chip ${x.type}">${x.s}</span>`).join('')}
function typeText(text,showNext=false,afterDone=null){clearInterval(typing);const el=$('coachText');el.textContent='';let i=0;$('coachNext').style.display='none';const finish=()=>{clearInterval(typing);typing=null;el.textContent=text;if(showNext)$('coachNext').style.display='block';if(afterDone)afterDone()};typing=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length)finish()},12);$('coachBubble').onclick=()=>{if(typing)finish()}}
function renderHand(){const c=$('cards');c.innerHTML=hand.map((x,i)=>{const p=!!cardPrompt&&(cardPrompt.any||x===cardPrompt.card);return `<button class="card${p?' tutorialPlayable':''}" data-i="${i}" ${p?'':'disabled'}><img src="${IMG[x]}" alt="${x}"><span class="cardTag">${x}</span></button>`}).join('');[...c.querySelectorAll('.tutorialPlayable')].forEach(b=>b.onclick=()=>playCard(Number(b.dataset.i)))}
function playCard(i){if(!cardPrompt)return;const card=hand[i];if(!cardPrompt.any&&card!==cardPrompt.card)return;const next=cardPrompt.onPlay,label=cardPrompt.label||(cardPrompt.any?`BLUE GK DISCARDS ${card}`:`BLUE PLAYS ${card}`);cardPrompt=null;hand.splice(i,1);renderHand();addFlow(label,'good');next(card)}
function askCard(card,text,onPlay,label=''){cardPrompt={card,onPlay,label,any:false};typeText(text,false);clearActions();renderHand()}
function askAnyCard(text,onPlay,label=''){cardPrompt={card:null,onPlay,label,any:true};typeText(text,false);clearActions();renderHand()}
function btn(label,fn,cls=''){const b=document.createElement('button');b.className='action '+cls;b.textContent=label;b.onclick=fn;$('actions').appendChild(b)}
function clearActions(){$('actions').innerHTML=''}
function renderDots(){$('lessonBar').innerHTML=lessons.map((x,i)=>`<span class="lessonDot ${i===lesson?'on':''}">${i+1} ${x.title}</span>`).join('')}
function showLine(){const L=lessons[lesson];$('lessonTitle').textContent=`LESSON ${lesson+1}/${lessons.length} — ${L.title}`;$('note').textContent=L.note;renderDots();clearActions();cardPrompt=null;renderHand();if(step<L.lines.length){const last=step===L.lines.length-1;typeText(L.lines[step],!last,last?()=>setupAction(L.action):null);if(!last)$('coachNext').onclick=()=>{step++;showLine()}}else setupAction(L.action)}
function setupLesson(){step=0;hand=[...lessons[lesson].hand];flow=[];cardPrompt=null;setBeaten([]);setActive([]);setBall(null);setGKOut('BKG',false);setGKOut('GKG',false);setScore();renderHand();showLine()}
function complete(msg){cardPrompt=null;renderHand();clearActions();setActive([]);addFlow(msg,'good');typeText('Good. This example matches the current Match Mode rulebook. Tap next.',true);$('coachNext').onclick=()=>{lesson++;if(lesson>=lessons.length)finishTutorial();else setupLesson()}}

function setupAction(kind){clearActions();cardPrompt=null;renderHand();$('coachNext').style.display='none';
if(kind==='setup'){addFlow('6 × 8 = 48 DEALT','good');addFlow('3 EXTRAS DISCARDED','good');typeText('Choose any RPS option. This demo gives BLUE first Soccer.',false);btn('ROCK',opening);btn('PAPER',opening);btn('SCISSORS',opening)}
if(kind==='pass'){setBall('B1');setActive(['B1']);btn('PASS → BLUE 2',()=>{addFlow('BLUE 1 PASS → BLUE 2','good');setActive(['G1']);addFlow('GREEN D1 TACKLE','bad');askCard('DRIBBLE','GREEN D1 uses TACKLE on the pass. Tap DRIBBLE PAST to beat it.',()=>{addFlow('D1 TACKLE BEATEN','good');setActive(['G2']);typeText('Now D2 gets the second TACKLE window. D2 chooses not to TACKLE, so the pass completes.',false);clearActions();btn('D2 LETS PASS GO',()=>{setBall('B2');complete('PASS COMPLETE · BLUE 2 HAS SOCCER')})})})}
if(kind==='attack'){setBall('B1');setActive(['B1']);askCard('SHOOT','Tap SHOOT to start the attack.',()=>{setActive(['G1']);addFlow('D1 LETS ATTACK THROUGH','bad');typeText('D1 played no DEFENSE/TACKLE, so no DRIBBLE is needed. Move to D2.',false);clearActions();btn('MOVE TO D2',()=>{setActive(['G2']);addFlow('D2 LETS ATTACK THROUGH','bad');typeText('D2 also plays no DEFENSE/TACKLE. D2 did not defend. No DRIBBLE is required — go straight to GK.',false);clearActions();btn('GO STRAIGHT TO GK',()=>{setActive(['GKG']);complete('D1 → D2 → GK COMPLETE')})})})}
if(kind==='defense'){setBall('B1');askCard('SHOOT','Tap SHOOT to attack D1.',()=>{setActive(['G1']);addFlow('GREEN D1 DEFENSE','bad');typeText('Let DEFENSE work. This SHOOT ends, but Soccer stays with BLUE 1.',false);clearActions();btn('LET DEFENSE SUCCEED',()=>{setBall('B1');addFlow('SHOOT ENDS · BLUE KEEPS SOCCER','good');complete('FIELD DEFENSE RESULT')})})}
if(kind==='tackle'){setBall('B1');askCard('SHOOT','Tap SHOOT. GREEN D1 will answer with TACKLE.',()=>{setActive(['G1']);addFlow('GREEN D1 TACKLE','bad');typeText('Let TACKLE succeed this time. TACKLE, unlike DEFENSE, wins possession.',false);clearActions();btn('LET TACKLE WIN',()=>{setBall('G1');addFlow('GREEN D1 TAKES SOCCER','good');complete('NEW POSSESSION: GREEN')})})}
if(kind==='track'){setBall('B1');setActive(['G1']);addFlow('GREEN D1 DEFENSE','bad');askCard('DRIBBLE','Tap DRIBBLE PAST to beat D1 DEFENSE.',()=>{setBeaten(['G1']);addFlow('D1 BEATEN','good');typeText('Every successful DRIBBLE asks this exact defender whether to chase back.',false);clearActions();btn('D1 CHASES · DISCARD 1',()=>{addFlow('D1 DISCARD 1','bad');addFlow('D1 TACKLE','bad');askCard('DRIBBLE','D1 paid the chase cost and played a separate TACKLE. Tap your second DRIBBLE.',()=>{addFlow('D1 BEATEN AGAIN','good');typeText('D1 was beaten again, so the chase question happens again.',false);clearActions();btn('LET NEXT LINE DEFEND',()=>{setActive(['G2']);complete('NEXT LINE: D2')})})})})}
if(kind==='yellow'){setBall('B1');setActive(['G1']);addFlow('SHOOT ACTIVE','good');addFlow('D1 LETS ATTACK THROUGH','bad');typeText('D1 is finished. The attack moves to D2, so D1 no longer owns the defensive YELLOW window.',false);clearActions();btn('MOVE TO D2',()=>{setActive(['G2']);addFlow('GREEN D2 DEFENSE','bad');askCard('DRIBBLE','GREEN D2 uses DEFENSE. Tap DRIBBLE PAST to try to beat D2.',()=>{addFlow('BLUE DRIBBLE vs D2','good');addFlow('GREEN D2 YELLOW → DRIBBLE CANCELED','bad');askCard('YELLOW','Because DRIBBLE targets D2’s line, GREEN D2 — not D1 — may use YELLOW. Tap your YELLOW to cancel D2’s YELLOW.',()=>{addFlow('BLUE YELLOW → D2 YELLOW CANCELED','good');typeText('Your YELLOW restores DRIBBLE. Because you just played YELLOW against D2’s line, D2 may answer with another YELLOW.',false);clearActions();btn('GREEN D2 PLAYS YELLOW',()=>{addFlow('D2 YELLOW → BLUE YELLOW CANCELED','bad');typeText('Final result: D2’s first YELLOW becomes active again, DRIBBLE is canceled, and D2 DEFENSE succeeds.',false);clearActions();btn('RESOLVE D2 LINE',()=>{setBall('B1');complete('D2 DEFENSE SUCCEEDS · BLUE KEEPS SOCCER')})})},'BLUE PLAYS YELLOW')})})}
if(kind==='gk'){setBall('B1');setBeaten(['G1','G2']);askCard('SHOOT','Tap SHOOT. Both field lines are already cleared.',()=>{setActive(['GKG']);typeText('At GK, field-line YELLOW is over. No GK DEFENSE means automatic GOAL +1 and Soccer goes to GREEN GK.',false);clearActions();btn('SEE NO-DEFENSE RESULT',()=>{setScore(1,0);setBall('GKG');addFlow('GOAL +1 · SOCCER → GREEN GK','good');typeText('With GK DEFENSE, use RPS instead. Either SAVE or GOAL still ends with Soccer in GREEN GK’s hand.',false);clearActions();btn('GK DEFENSE + RPS',()=>complete('GK RULE COMPLETE'))})})}
if(kind==='gkattack'){setBall('BKG');setActive(['BKG']);askCard('SHOOT','BLUE GK has Soccer and joins the attack. Tap SHOOT from the Goalkeeper hand.',()=>{addFlow('GREEN D1 TACKLE','bad');typeText('GREEN D1 TACKLE steals Soccer from the attacking BLUE GK. BLUE GK is now OUT OF POSITION.',false);clearActions();btn('LET TACKLE WIN',()=>{setBall('G1');setGKOut('BKG',true);setActive(['G1']);addFlow('BLUE GK OUT OF POSITION','bad');typeText('GREEN counterattacks. D1 and D2 are cleared in this example. The attack has now reached the empty BLUE goal.',false);clearActions();btn('COUNTERATTACK REACHES BLUE GK',()=>{setActive(['BKG']);typeText('To return to goal, BLUE GK must discard ANY 1 card. The discarded card only pays the return cost. Tap RETURN, then choose the card to discard.',false);clearActions();btn('RETURN TO GOAL · DISCARD 1',()=>{askAnyCard('Tap any one card in the BLUE GK hand to discard as the return-to-goal cost.',()=>{setGKOut('BKG',false);addFlow('BLUE GK RETURNS TO GOAL','good');typeText('BLUE GK is back, but recovery did not count as DEFENSE. You still need a separate DEFENSE card to start the save duel. Tap DEFENSE now.',false);askCard('DEFENSE','Tap the remaining DEFENSE card to defend the goal.',()=>{addFlow('GK DEFENSE → RPS','good');complete('GK ATTACK RISK COMPLETE')},'BLUE GK PLAYS DEFENSE')},'BLUE GK DISCARDS 1 TO RETURN')})})})})}
if(kind==='ending'){addFlow('BLUE: NO SHOOT','bad');addFlow('GREEN: HAS SHOOT','good');typeText('BLUE has no SHOOT. Does the match end?',false);btn('NO · CONTINUE',()=>{addFlow('MATCH CONTINUES','good');typeText('Correct. If 00:00 arrives during an active chain, finish that chain first, including any GK return decision.',false);clearActions();btn('FINISH ACTIVE CHAIN',()=>complete('END RULE COMPLETE'))})}
if(kind==='penalty'){typeText('A tied match collects and reshuffles all 51 Action Cards. Now resolve four independent field-player-vs-GK draws.',false);btn('SHUFFLE ALL 51',()=>{addFlow('GREEN 1 ↔ BLUE GK DRAW','good');addFlow('GREEN 2 ↔ BLUE GK DRAW AGAIN','good');addFlow('BLUE 1 ↔ GREEN GK DRAW','bad');addFlow('BLUE 2 ↔ GREEN GK DRAW AGAIN','bad');typeText('Each GK draws a fresh card for each opposing field Player. A duel is GOAL only when the Player draws SHOOT and that GK draw is not DEFENSE. Otherwise it is 0. No negative scores.',false);clearActions();btn('FINISH 4 DUELS',()=>complete('PENALTY RULE COMPLETE'))})}
}
function opening(){clearActions();addFlow('BLUE WINS RPS','good');setBall('B1');complete('BLUE RECEIVES FIRST SOCCER')}
function finishTutorial(){clearActions();cardPrompt=null;renderHand();typeText('Tutorial complete. You now know the full current Match Mode flow, including line-specific YELLOW, Goalkeeper attacks, the OUT OF POSITION recovery cost, and four paired penalty duels.',false);btn('PLAY VS AI',()=>location.href='match-ai.html?v=20260907m15','blue');btn('FULL RULEBOOK',()=>location.href='match-rules-v7.html?v=20260907m15','dark')}
const style=document.createElement('style');style.textContent='.player.outOfPosition{outline:3px solid #ffb21b!important;box-shadow:0 0 0 5px rgba(255,178,27,.16),0 0 22px rgba(255,88,42,.5)!important}.player.outOfPosition::after{content:"GK OUT";position:absolute;right:4px;top:4px;background:#ff8b22;color:#1d0c00;border:1px solid #4b1d00;border-radius:7px;padding:2px 5px;font-size:7px;font-weight:1000;z-index:5}';document.head.appendChild(style);
setupLesson();
})();
