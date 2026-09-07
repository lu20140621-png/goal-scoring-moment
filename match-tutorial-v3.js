(()=>{
'use strict';
const IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const $=id=>document.getElementById(id);
const ALL=['B1','B2','BKG','G1','G2','GKG'];
let lesson=0,step=0,typing=null,hand=[],ball=null,flow=[];

const lessons=[
{title:'SETUP & EQUAL HANDS',note:'3v3 uses 6 players × 8 cards = 48. The 3 extras are discarded face-down. Trading time counts inside the 10-minute match.',hand:['SHOOT','DEFENSE','TACKLE','DRIBBLE','YELLOW'],lines:[
'Match Mode starts with every player receiving exactly 8 Action Cards.',
'The 3 extra Action Cards are discarded face-down. Nobody receives more cards than anyone else.',
'The 10-minute clock starts immediately after the deal, so team trading uses real match time.',
'Trades keep hand sizes equal. In the web test, swap one card for one card.'
],action:'setup'},
{title:'PASS & TACKLE',note:'PASS is free. TACKLE may intercept a PASS and take Soccer. YELLOW cannot be used on a normal PASS.',hand:['SHOOT','DRIBBLE','TACKLE','YELLOW'],lines:[
'The Soccer Card shows who has possession.',
'The holder may PASS Soccer to any teammate without spending an Action Card.',
'During the PASS, an opposing field Player may use TACKLE to intercept it.',
'If TACKLE succeeds, the tackler takes Soccer. The passer may use DRIBBLE PAST to beat that tackle.'
],action:'pass'},
{title:'FIELD DEFENSE',note:'A field Player DEFENSE stops only the current SHOOT. Soccer stays with the attacking player.',hand:['SHOOT','DRIBBLE','SHOOT','YELLOW'],lines:[
'Now play SHOOT to start an attack.',
'GREEN 1 answers with DEFENSE.',
'If you do not beat that DEFENSE with DRIBBLE PAST, this SHOOT ends.',
'But DEFENSE does not steal Soccer. The attacker still has the ball afterward.'
],action:'defense'},
{title:'TACKLE WINS POSSESSION',note:'During a SHOOT, TACKLE is the aggressive defensive choice: if it succeeds, the tackler takes Soccer.',hand:['SHOOT','DRIBBLE','YELLOW'],lines:[
'During a SHOOT, a field defender may choose TACKLE instead of DEFENSE.',
'Unlike DEFENSE, a successful TACKLE changes possession.',
'TACKLE can be beaten by DRIBBLE PAST, and during a SHOOT chain it can also be canceled by YELLOW.',
'If neither response stops it, the tackler receives Soccer.'
],action:'tackle'},
{title:'DRIBBLE & TRACK BACK',note:'Every successful DRIBBLE creates a chase-back decision for the defender who was beaten.',hand:['SHOOT','DRIBBLE','DRIBBLE','DEFENSE'],lines:[
'One DRIBBLE PAST beats one field defensive attempt.',
'Every time a defender is dribbled past, ask that same defender whether they want to chase back.',
'To chase, that defender discards 1 card, then may use DEFENSE or TACKLE again.',
'If the defender is beaten again, ask again. Every extra chase costs another card.'
],action:'track'},
{title:'YELLOW',note:'YELLOW only exists inside a SHOOT chain. Defender 1 controls YELLOW. It cannot cancel SHOOT or DEFENSE.',hand:['SHOOT','DRIBBLE','YELLOW','YELLOW'],lines:[
'SHOOT itself cannot be canceled by YELLOW.',
'DEFENSE also cannot be canceled by YELLOW.',
'After SHOOT begins, Defender 1 may use YELLOW to cancel TACKLE, DRIBBLE PAST, or another YELLOW.',
'YELLOW may cancel YELLOW, so a counter-chain can restore the previous Action.'
],action:'yellow'},
{title:'GOALKEEPER',note:'GK DEFENSE triggers Rock-Paper-Scissors. After the Goalkeeper stage, Soccer is in the Goalkeeper hand whether the save succeeds or fails.',hand:['SHOOT','DRIBBLE','DEFENSE','YELLOW'],lines:[
'After both field defensive lines are beaten or bypassed, the SHOOT reaches the Goalkeeper.',
'If the Goalkeeper uses DEFENSE, shooter and Goalkeeper play Rock-Paper-Scissors.',
'Goalkeeper wins: SAVE. Shooter wins: GOAL +1.',
'In both results, Soccer ends in the Goalkeeper hand. If a goal was scored, the Goalkeeper restarts for the team that conceded.'
],action:'gk'},
{title:'WHEN THE MATCH ENDS',note:'One team running out of SHOOT does not end the match. The other side may still attack, and the no-SHOOT team may still defend.',hand:['DEFENSE','TACKLE','YELLOW'],lines:[
'The match does not end just because one team has no SHOOT left.',
'If GREEN can still attack, BLUE DEFENSE and TACKLE cards still matter even when BLUE has no SHOOT.',
'The main match ends at 00:00, when both teams have no Action Cards, or when both teams can no longer attack.',
'If the final score is tied, collect all 51 Action Cards and use the Penalty Shootout draw.'
],action:'ending'}
];

function name(id){return id==='BKG'?'BLUE GK':id==='GKG'?'GREEN GK':id.replace('B','BLUE ').replace('G','GREEN ')}
function setBall(id){ball=id;ALL.forEach(x=>$(x).classList.toggle('hasBall',x===id))}
function setBeaten(ids=[]){['B1','B2','G1','G2'].forEach(x=>$(x).classList.toggle('beaten',ids.includes(x)))}
function setCount(){ALL.forEach(id=>{const el=$(id)?.querySelector('.handCount');if(el)el.textContent='8 START'})}
function addFlow(s,type=''){flow.push({s,type});flow=flow.slice(-8);$('flow').innerHTML=flow.map(x=>`<span class="chip ${x.type}">${x.s}</span>`).join('')}
function typeText(text,done){clearInterval(typing);const el=$('coachText');el.textContent='';let i=0;$('coachNext').style.display='none';typing=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length){clearInterval(typing);typing=null;if(done)$('coachNext').style.display='block'}},14);$('coachBubble').onclick=()=>{if(typing){clearInterval(typing);typing=null;el.textContent=text;if(done)$('coachNext').style.display='block'}}}
function renderHand(){const c=$('cards');c.innerHTML=hand.map((x,i)=>`<button class="card" data-i="${i}" disabled><img src="${IMG[x]}" alt="${x}"><span class="cardTag">${x}</span></button>`).join('');setCount()}
function use(card){const i=hand.indexOf(card);if(i>=0){hand.splice(i,1);renderHand();return true}return false}
function btn(label,fn,cls=''){const b=document.createElement('button');b.className='action '+cls;b.textContent=label;b.onclick=fn;$('actions').appendChild(b)}
function clearActions(){$('actions').innerHTML=''}
function renderDots(){$('lessonBar').innerHTML=lessons.map((x,i)=>`<span class="lessonDot ${i===lesson?'on':''}">${i+1} ${x.title}</span>`).join('')}
function showLine(){const L=lessons[lesson];$('lessonTitle').textContent=`LESSON ${lesson+1}/${lessons.length} — ${L.title}`;$('note').textContent=L.note;renderDots();clearActions();if(step<L.lines.length){const last=step===L.lines.length-1;typeText(L.lines[step],!last);$('coachNext').onclick=()=>{step++;showLine()};if(last)setTimeout(()=>setupAction(L.action),60)}else setupAction(L.action)}
function setupLesson(){step=0;hand=[...lessons[lesson].hand];flow=[];setBeaten([]);setBall(null);setCount();renderHand();showLine()}
function complete(msg){clearActions();addFlow(msg,'good');typeText('Good. That is the current Match Mode rule. Tap next.',true);$('coachNext').onclick=()=>{lesson++;if(lesson>=lessons.length)finishTutorial();else setupLesson()}}

function setupAction(kind){
  clearActions();$('coachNext').style.display='none';
  if(kind==='setup')btn('READY · 8 EACH',()=>{addFlow('6 × 8 = 48 DEALT','good');addFlow('3 EXTRAS DISCARDED','good');complete('SETUP READY')});
  if(kind==='pass'){setBall('B1');btn('PASS → BLUE 2',()=>{addFlow('BLUE 1 PASS → BLUE 2','good');addFlow('GREEN 1 TACKLE','bad');typeText('GREEN 1 uses TACKLE on the PASS. Beat it with DRIBBLE PAST. No YELLOW here because no SHOOT chain has started.',false);clearActions();btn('DRIBBLE PAST',()=>{use('DRIBBLE');addFlow('DRIBBLE → TACKLE BEATEN','good');setBall('B2');complete('PASS COMPLETED')})});}
  if(kind==='defense'){setBall('B1');btn('PLAY SHOOT',()=>{use('SHOOT');addFlow('BLUE 1 SHOOT','good');addFlow('GREEN 1 DEFENSE','bad');typeText('Let DEFENSE succeed. The SHOOT ends, but BLUE 1 keeps Soccer.',false);clearActions();btn('LET DEFENSE STOP SHOOT',()=>{addFlow('SHOOT ENDS','bad');setBall('B1');complete('BLUE 1 STILL HAS SOCCER')})});}
  if(kind==='tackle'){setBall('B1');btn('PLAY SHOOT',()=>{use('SHOOT');addFlow('BLUE 1 SHOOT','good');addFlow('GREEN 1 TACKLE','bad');typeText('This time, let TACKLE succeed. Unlike DEFENSE, TACKLE takes possession.',false);clearActions();btn('LET TACKLE WIN',()=>{setBall('G1');complete('GREEN 1 TAKES SOCCER')})});}
  if(kind==='track'){setBall('B1');addFlow('GREEN 1 DEFENSE','bad');btn('DRIBBLE PAST',()=>{use('DRIBBLE');setBeaten(['G1']);addFlow('GREEN 1 BEATEN','good');typeText('Every successful DRIBBLE asks the beaten defender: chase back by discarding 1 card, or let the next line defend.',false);clearActions();btn('GREEN 1 CHASES · DISCARD 1',()=>{addFlow('GREEN 1 DISCARD 1','bad');addFlow('GREEN 1 DEFENDS AGAIN','bad');typeText('GREEN 1 chased back. Beat the same defender again.',false);clearActions();btn('DRIBBLE AGAIN',()=>{use('DRIBBLE');addFlow('GREEN 1 BEATEN AGAIN','good');typeText('Because GREEN 1 was beaten again, the chase-back question happens again.',false);clearActions();btn('LET GREEN 2 DEFEND',()=>complete('NEXT LINE: GREEN 2'))})})});}
  if(kind==='yellow'){setBall('B1');addFlow('SHOOT','good');addFlow('GREEN 1 DEFENSE','bad');btn('PLAY DRIBBLE',()=>{use('DRIBBLE');addFlow('BLUE DRIBBLE','good');addFlow('GREEN 1 YELLOW','bad');typeText('GREEN 1 YELLOW cancels the DRIBBLE. It could not cancel the SHOOT or the DEFENSE.',false);clearActions();btn('PLAY BLUE 1 YELLOW',()=>{use('YELLOW');addFlow('BLUE 1 YELLOW → GREEN YELLOW CANCELED','good');complete('DRIBBLE RESTORED')},'yellow')});}
  if(kind==='gk'){setBall('B1');setBeaten(['G1','G2']);btn('PLAY SHOOT AT GK',()=>{use('SHOOT');addFlow('SHOOT → GOALKEEPER','good');addFlow('GREEN GK DEFENSE','bad');typeText('Goalkeeper DEFENSE starts Rock-Paper-Scissors. For this demo, score the goal; Soccer will still go to GREEN GK afterward.',false);clearActions();btn('SHOOTER WINS RPS',()=>{addFlow('GOAL +1','good');setBall('GKG');complete('GREEN GK HAS SOCCER')})});}
  if(kind==='ending'){btn('CHECK END RULE',()=>{addFlow('BLUE: NO SHOOT','bad');addFlow('GREEN: STILL HAS SHOOT','good');typeText('The match continues. BLUE may still use DEFENSE and TACKLE. Only when both teams cannot attack does this early-end condition trigger.',false);clearActions();btn('CONTINUE MATCH',()=>complete('MATCH CONTINUES'))});}
}
function finishTutorial(){clearActions();typeText('You now have the current Match Mode V3 rules. Open VS AI and test the balance.',false);btn('PLAY VS AI',()=>location.href='match-ai.html?v=20260907m7','blue');btn('RULEBOOK',()=>location.href='match-rules.html?v=20260907m7','dark')}
setupLesson();
})();
