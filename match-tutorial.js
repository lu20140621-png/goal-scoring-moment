(()=>{
'use strict';
const IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const $=id=>document.getElementById(id);let lesson=0,step=0,typing=null,hand=[],ball=null,scoreB=0,scoreG=0,flow=[];
const lessons=[
{title:'THE 10-MINUTE MATCH',note:'The clock starts after the cards are dealt, so team trading and formation setup use real match time.',hand:['DEFENSE','SHOOT','DRIBBLE','YELLOW'],lines:[
'Welcome to Match Mode. This one feels more like a real soccer match.',
'All Action Cards are dealt first. The moment the deal is done, start the 10-minute clock.',
'That clock includes team trading and choosing your formation. Set up fast.',
'Before you lock the team, you can trade cards with teammates. Move this DEFENSE to your Goalkeeper.'
],action:'trade'},
{title:'FORMATION & FIRST POSSESSION',note:'In 3v3, the attack must beat Defender 1, then Defender 2, then the Goalkeeper.',hand:['SHOOT','DRIBBLE','TACKLE','YELLOW'],lines:[
'Your formation is public: Defender 1, Defender 2, then the Goalkeeper.',
'The first defender is always the first line the attack has to beat.',
'Rock-Paper-Scissors decides the opening possession. Win it, and you attack first.'
],action:'rps'},
{title:'PASS & TACKLE',note:'Soccer can be passed freely, but TACKLE can steal it whether a pass is happening or not.',hand:['SHOOT','DRIBBLE','YELLOW','TACKLE'],lines:[
'Whoever holds Soccer has the active possession.',
'You can PASS it to any teammate for free.',
'But TACKLE can steal Soccer even when you are not passing. It can also intercept a pass.',
'Pass to BLUE 2. GREEN 1 is going to jump the pass with TACKLE.'
],action:'pass'},
{title:'SHOOT, DEFENSE & DRIBBLE',note:'A Player DEFENSE stops the attack unless DRIBBLE PAST beats that defender.',hand:['SHOOT','DRIBBLE','DRIBBLE','YELLOW'],lines:[
'Now attack. Play SHOOT.',
'GREEN 1 answers with DEFENSE. A normal Player DEFENSE stops the attack.',
'Use DRIBBLE PAST. One DRIBBLE gets past one defender.',
'Once you beat GREEN 1, the attack moves to the next defensive line.'
],action:'shootDefense'},
{title:'TRACK BACK',note:'A defender who was beaten can defend again, but must discard 1 extra card first—like spending stamina to recover.',hand:['SHOOT','DRIBBLE','DRIBBLE','TACKLE'],lines:[
'GREEN 1 was beaten, but he can still chase you.',
'To defend again after being dribbled, he must discard 1 extra card before playing another defensive card.',
'That extra discard is the stamina cost for tracking back.',
'Dribble him again and force the attack into GREEN 2.'
],action:'track'},
{title:'TACKLE COUNTERATTACK',note:'If TACKLE wins Soccer after a SHOOT, the shooter is caught out of position. Discard 1 card to recover that missing line.',hand:['SHOOT','DRIBBLE','DEFENSE','YELLOW'],lines:[
'TACKLE can also stop a SHOOT and steal Soccer.',
'If your SHOOT is tackled, the tackler starts a counterattack immediately.',
'Your shooter is caught forward, so your team starts that counterattack one defensive line short.',
'You can discard 1 card to track back and restore that missing line.'
],action:'counter'},
{title:'GOALKEEPER DUEL',note:'Goalkeeper DEFENSE is different: it triggers Rock-Paper-Scissors instead of automatically stopping the shot.',hand:['SHOOT','DRIBBLE','DRIBBLE','YELLOW'],lines:[
'Beat both outfield defenders and the shot reaches the Goalkeeper.',
'If the Goalkeeper has no DEFENSE, it is a goal.',
'If the Goalkeeper plays DEFENSE, the shooter and Goalkeeper use Rock-Paper-Scissors.',
'Win the duel as the shooter to score.'
],action:'gk'},
{title:'YELLOW COUNTERPLAY',note:'YELLOW cancels the immediately previous cancellable Action. DEFENSE is immune. YELLOW can cancel YELLOW.',hand:['SHOOT','YELLOW','YELLOW','DRIBBLE'],lines:[
'YELLOW cancels the Action played immediately before it.',
'It can cancel SHOOT, TACKLE, DRIBBLE, or another YELLOW.',
'It cannot cancel DEFENSE. DEFENSE is protected.',
'Watch the chain: SHOOT → YELLOW → YELLOW. The second YELLOW cancels the first one.'
],action:'yellow'},
{title:'ENDING & PENALTY SHOOTOUT',note:'A tied match uses a fresh shuffled deck. Players score +1 on SHOOT; Goalkeeper DEFENSE subtracts 1 from the opponent.',hand:['SHOOT','DEFENSE','TACKLE','YELLOW'],lines:[
'The match ends at 10:00, when both teams have no cards, or when neither team can make a legal play.',
'If the score is tied, collect every Action Card and shuffle the full deck again.',
'Every Player draws 1. SHOOT is +1. Each Goalkeeper draws 1. DEFENSE is -1 against the other team.',
'The team with the higher shootout score wins. If it is still tied, reshuffle and draw again.'
],action:'penalty'}
];
function name(id){return id==='BKG'?'BLUE GK':id==='GKG'?'GREEN GK':id.replace('B','BLUE ').replace('G','GREEN ')}
function setBall(id){ball=id;['B1','B2','BKG','G1','G2','GKG'].forEach(x=>$(x).classList.toggle('hasBall',x===id))}
function setBeaten(ids=[]){['B1','B2','G1','G2'].forEach(x=>$(x).classList.toggle('beaten',ids.includes(x)))}
function setMissing(ids=[]){['B1','B2','G1','G2'].forEach(x=>$(x).classList.toggle('missing',ids.includes(x)))}
function addFlow(s,type=''){flow.push({s,type});flow=flow.slice(-8);$('flow').innerHTML=flow.map(x=>`<span class="chip ${x.type}">${x.s}</span>`).join('')}
function typeText(text,done){clearInterval(typing);const el=$('coachText');el.textContent='';let i=0;$('coachNext').style.display='none';typing=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length){clearInterval(typing);typing=null;if(done)$('coachNext').style.display='block'}},16);$('coachBubble').onclick=()=>{if(typing){clearInterval(typing);typing=null;el.textContent=text;if(done)$('coachNext').style.display='block'}}}
function renderHand(){const c=$('cards');c.innerHTML=hand.map((x,i)=>`<button class="card" data-i="${i}" disabled><img src="${IMG[x]}" alt="${x}"><span class="cardTag">${x}</span></button>`).join('');$('B1').querySelector('.handCount').textContent=`${hand.length} CARDS`; $('B2').querySelector('.handCount').textContent='4 CARDS';$('BKG').querySelector('.handCount').textContent='4 CARDS'}
function use(card){const i=hand.indexOf(card);if(i>=0){hand.splice(i,1);renderHand();return true}return false}
function btn(label,fn,cls=''){const b=document.createElement('button');b.className='action '+cls;b.textContent=label;b.onclick=fn;$('actions').appendChild(b)}
function clearActions(){$('actions').innerHTML=''}
function showLine(){const L=lessons[lesson];$('lessonTitle').textContent=`LESSON ${lesson+1}/${lessons.length} — ${L.title}`;$('note').textContent=L.note;renderDots();clearActions();if(step<L.lines.length){const last=step===L.lines.length-1;typeText(L.lines[step],!last);$('coachNext').onclick=()=>{step++;showLine()};if(last)setTimeout(()=>setupAction(L.action),60)}else setupAction(L.action)}
function renderDots(){$('lessonBar').innerHTML=lessons.map((x,i)=>`<span class="lessonDot ${i===lesson?'on':''}">${i+1} ${x.title}</span>`).join('')}
function setupLesson(){step=0;hand=[...lessons[lesson].hand];flow=[];setBeaten([]);setMissing([]);scoreB=0;scoreG=0;$('blueScore').textContent=scoreB;$('greenScore').textContent=scoreG;setBall(null);renderHand();showLine()}
function complete(msg){clearActions();addFlow(msg,'good');typeText('Good. That is the rule. Tap next for the next lesson.',true);$('coachNext').onclick=()=>{lesson++;if(lesson>=lessons.length){finishTutorial()}else setupLesson()}}
function setupAction(kind){clearActions();$('coachNext').style.display='none';if(kind==='trade'){btn('TRADE DEFENSE → BLUE GK',()=>{use('DEFENSE');addFlow('TEAM TRADE: DEFENSE → GK','good');$('BKG').querySelector('.handCount').textContent='5 CARDS';complete('TEAM READY')})}
if(kind==='rps'){btn('✊ ROCK',()=>rps('rock'));btn('✋ PAPER',()=>rps('paper'));btn('✌️ SCISSORS',()=>rps('scissors'))}
if(kind==='pass'){setBall('B1');btn('PASS → BLUE 2',()=>{addFlow('BLUE 1 PASS → BLUE 2','good');addFlow('GREEN 1 TACKLE','bad');typeText('GREEN 1 attacks the pass with TACKLE. Use YELLOW to cancel it.',false);clearActions();btn('PLAY YELLOW',()=>{use('YELLOW');addFlow('YELLOW → TACKLE CANCELED','good');setBall('B2');complete('PASS SURVIVES')},'yellow')})}
if(kind==='shootDefense'){setBall('B1');btn('PLAY SHOOT',()=>{use('SHOOT');addFlow('SHOOT','good');addFlow('GREEN 1 DEFENSE','bad');typeText('DEFENSE is protected from YELLOW. Use DRIBBLE PAST to beat GREEN 1.',false);clearActions();btn('DRIBBLE PAST',()=>{use('DRIBBLE');setBeaten(['G1']);addFlow('DRIBBLE → GREEN 1 BEATEN','good');complete('NEXT LINE: GREEN 2')})})}
if(kind==='track'){setBall('B1');setBeaten(['G1']);addFlow('GREEN 1 ALREADY BEATEN','bad');btn('GREEN 1 DISCARD 1 + DEFENSE',()=>{addFlow('GREEN 1 DISCARD 1','bad');addFlow('GREEN 1 TRACK-BACK DEFENSE','bad');typeText('He paid one extra card to recover. Beat him again with DRIBBLE.',false);clearActions();btn('DRIBBLE AGAIN',()=>{use('DRIBBLE');addFlow('DRIBBLE PAST','good');setBeaten(['G1']);complete('GREEN 1 LEFT BEHIND')})})}
if(kind==='counter'){setBall('B1');btn('PLAY SHOOT',()=>{use('SHOOT');addFlow('BLUE 1 SHOOT','good');addFlow('GREEN 1 TACKLE','bad');setBall('G1');setMissing(['B1']);typeText('TACKLE won Soccer after your SHOOT. BLUE 1 is caught forward. Spend one card to track back.',false);clearActions();btn('DISCARD 1 TO TRACK BACK',()=>{const c=hand[0];hand.shift();renderHand();addFlow(`BLUE 1 DISCARD ${c}`,'good');setMissing([]);complete('DEFENSIVE LINE RESTORED')})})}
if(kind==='gk'){setBall('B1');setBeaten(['G1','G2']);addFlow('G1 BEATEN','good');addFlow('G2 BEATEN','good');btn('PLAY SHOOT AT GK',()=>{use('SHOOT');addFlow('SHOOT → GOALKEEPER','good');addFlow('GREEN GK DEFENSE','bad');typeText('Goalkeeper DEFENSE starts the duel. Choose Rock, Paper, or Scissors.',false);clearActions();btn('✊ ROCK',()=>gkDuel('rock'));btn('✋ PAPER',()=>gkDuel('paper'));btn('✌️ SCISSORS',()=>gkDuel('scissors'))})}
if(kind==='yellow'){addFlow('SHOOT','good');addFlow('GREEN YELLOW','bad');typeText('GREEN canceled the SHOOT. Counter that YELLOW with your own YELLOW.',false);btn('PLAY YELLOW',()=>{use('YELLOW');addFlow('BLUE YELLOW → GREEN YELLOW CANCELED','good');complete('SHOOT RESTORED')},'yellow')}
if(kind==='penalty'){btn('RUN PENALTY DRAW',penaltyDemo,'yellow')}
}
function rps(choice){const ai='scissors';addFlow(`YOU ${choice.toUpperCase()} · AI ${ai.toUpperCase()}`,'good');if(choice==='rock'){setBall('B1');complete('BLUE WINS FIRST POSSESSION')}else{typeText('Not this time. Try again—the opening RPS repeats until someone wins.',false);clearActions();btn('✊ ROCK',()=>rps('rock'))}}
function gkDuel(choice){const ai='scissors';if(choice==='rock'){scoreB++;$('blueScore').textContent=scoreB;addFlow('RPS WIN → GOAL +1','good');complete('GOAL')}else{typeText('The Goalkeeper wins that duel. Try Rock and beat Scissors.',false);clearActions();btn('✊ ROCK',()=>gkDuel('rock'))}}
function penaltyDemo(){clearActions();const draws={B1:'SHOOT',B2:'TACKLE',BKG:'DEFENSE',G1:'SHOOT',G2:'YELLOW',GKG:'TACKLE'};const blue=1-0,green=1-1;showModal('PENALTY SHOOTOUT',`BLUE 1 draws SHOOT: +1<br>BLUE 2 draws TACKLE: 0<br>BLUE GK draws DEFENSE: -1 against GREEN<br><br>GREEN 1 draws SHOOT: +1<br>GREEN 2 draws YELLOW: 0<br>GREEN GK draws TACKLE: 0<br><br><b>BLUE ${blue} — ${green} GREEN</b>`,()=>complete('SHOOTOUT RESOLVED'))}
function showModal(title,text,cb){$('modalTitle').textContent=title;$('modalText').innerHTML=text;$('modalActions').innerHTML='';const b=document.createElement('button');b.className='action';b.textContent='CONTINUE';b.onclick=()=>{$('modal').classList.remove('on');cb()};$('modalActions').appendChild(b);$('modal').classList.add('on')}
function finishTutorial(){clearActions();typeText('You have the full Match Mode flow now. Open VS AI and test the balance in a real 3v3 playtest.',false);btn('PLAY VS AI',()=>location.href='match-ai.html','blue');btn('MATCH MENU',()=>location.href='match.html','dark')}
setupLesson();
})();
