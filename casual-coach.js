(() => {
'use strict';

const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));
const ASSETS = {
  SOCCER:'images/soccer-card.webp?v=20260904fix1',
  SHOOT:'images/shoot-card.webp',
  DEFENSE:'images/defense-card.webp',
  TACKLE:'images/tackle.webp?v=20260904tackle2',
  DRIBBLE:'images/dribble%20past-card.webp',
  YELLOW:'images/yellow-card.webp',
  COACH:'images/coach-guide.webp',
  PLAYER:'images/player-card.webp',
  GOALKEEPER:'images/goalkeeper-card.webp',
  BACK:'images/card-back.webp'
};
const FALLBACK = {
  SOCCER:'images/soccer-card.png?v=20260904fix1',
  SHOOT:'images/shoot-card.png',
  DEFENSE:'images/defense-card.png',
  TACKLE:'images/tackle-card.png',
  DRIBBLE:'images/dribble%20past-card.png',
  YELLOW:'images/yellow-card.png'
};

const lessons = [
  {title:'HOW TO WIN'},
  {title:'YOUR TURN'},
  {title:'SOCCER CARD'},
  {title:'DEFENSE'},
  {title:'DRIBBLE PAST'},
  {title:'SHOOT'},
  {title:'YELLOW'},
  {title:'TACKLE'},
  {title:'FINAL CHALLENGE'}
];

const state = {
  lesson:0, step:0, typing:false, timer:0, fullText:'', locked:false,
  strikes:[0,0,0,0], out:[false,false,false,false],
  hand:['DEFENSE','SHOOT','YELLOW','TACKLE','DRIBBLE'],
  finalStep:0
};

function preloadImage(src){
  return new Promise(resolve=>{
    const img=new Image();
    let done=false;
    const finish=()=>{if(done)return;done=true;resolve()};
    img.onload=finish;img.onerror=finish;img.src=src;
    if(img.complete)finish();
  });
}
async function preload(){
  const list=Object.values(ASSETS);
  let completed=0;
  const total=list.length;
  await Promise.all(list.map(src=>preloadImage(src).then(()=>{
    completed++;
    const pct=Math.round(completed/total*100);
    if($('loaderFill')) $('loaderFill').style.width=pct+'%';
    if($('loaderPct')) $('loaderPct').textContent=pct+'%';
  })));
  await wait(180);
  $('loader').classList.add('done');
  $('app').hidden=false;
  document.body.classList.add('ready');
  setTimeout(()=>$('loader')?.remove(),350);
  setupLesson(0);
}

function imgHtml(name, cls=''){
  const src=ASSETS[name];
  return `<img class="${cls}" src="${src}" alt="${name}" onerror="if(!this.dataset.f){this.dataset.f='1';this.src='${FALLBACK[name]||ASSETS.BACK}'}">`;
}

function playerHtml(i){
  const names=['YOU','PLAYER 2','PLAYER 3','PLAYER 4'];
  const strike=state.strikes[i];
  const handCount=i===0?state.hand.length:[4,5,3][i-1];
  return `<div class="pName"><span>${names[i]}</span><span class="pTag">${state.out[i]?'OUT':'IN GAME'}</span></div>
    <div class="pStats">SOCCER STRIKES ${strike}/2</div>
    <div class="strikes"><span class="strike ${strike>0?'on':''}">⚽</span><span class="strike ${strike>1?'danger':''}">⚽</span></div>
    <div class="handFan">${Array.from({length:Math.min(handCount,6)},()=>'<i class="handBack"></i>').join('')}</div>`;
}
function renderPlayers(){
  ['P0','P1','P2','P3'].forEach((id,i)=>{
    const el=$(id); el.innerHTML=playerHtml(i);
    el.classList.toggle('out',state.out[i]);
  });
}

function renderProgress(){
  $('progress').innerHTML=lessons.map((_,i)=>`<i class="${i<state.lesson?'done':i===state.lesson?'on':''}"></i>`).join('');
  $('lessonName').textContent=`${state.lesson===8?'FINAL CHALLENGE':`LESSON ${state.lesson+1}/9`} — ${lessons[state.lesson].title}`;
  $('lessonStatus').textContent=state.lesson===8?'No card hints. Make the calls.':'Coach guided';
}

function setCoach(text, continueVisible=false){
  clearTimeout(state.timer);
  state.fullText=text; state.typing=true;
  const out=$('coachText'), arrow=$('coachContinue');
  out.textContent=''; arrow.hidden=true;
  let i=0;
  const tick=()=>{
    out.textContent=text.slice(0,++i);
    if(i<text.length) state.timer=setTimeout(tick,14);
    else {state.typing=false;arrow.hidden=!continueVisible;}
  };
  tick();
}
function finishTyping(){
  clearTimeout(state.timer);
  $('coachText').textContent=state.fullText;
  state.typing=false;
}

function showFx(text,kind='neutral',ms=900){
  const fx=$('fx'); fx.textContent=text; fx.className=`fx show ${kind}`;
  clearTimeout(showFx.timer); showFx.timer=setTimeout(()=>fx.className='fx',ms);
}
function clearTargets(){document.querySelectorAll('.player').forEach(p=>p.classList.remove('target','dim'))}
function highlightTargets(ids){
  document.querySelectorAll('.player').forEach((p,i)=>{
    const yes=ids.includes(i);p.classList.toggle('target',yes);p.classList.toggle('dim',!yes);
  });
}
function clearFlow(){
  $('flow').innerHTML='<div class="flowEmpty">Actions will appear here.</div>';
}
function addArrow(){
  if($('flow').children.length && !$('flow').querySelector('.flowEmpty')){
    const a=document.createElement('div');a.className='arrow';a.textContent='→';$('flow').appendChild(a);
  }
}
function addFlowCard(name,text){
  $('flow').querySelector('.flowEmpty')?.remove(); addArrow();
  const n=document.createElement('div'); n.className='flowCard';
  n.innerHTML=`${imgHtml(name)}<b>${text||name}</b>`;
  $('flow').appendChild(n); $('flow').scrollLeft=$('flow').scrollWidth;
}
function addChip(text,kind=''){
  $('flow').querySelector('.flowEmpty')?.remove(); addArrow();
  const c=document.createElement('div'); c.className=`chip ${kind}`; c.textContent=text;
  $('flow').appendChild(c); $('flow').scrollLeft=$('flow').scrollWidth;
}

function renderHand(highlight=''){
  const cards=['DEFENSE','DRIBBLE','SHOOT','YELLOW','TACKLE'];
  $('hand').innerHTML=cards.map(name=>`<button class="cardBtn ${highlight===name?'highlight':''}" data-card="${name}">${imgHtml(name)}</button>`).join('');
  $('hand').querySelectorAll('.cardBtn').forEach(btn=>btn.onclick=()=>cardClicked(btn.dataset.card,btn));
}
function setActions(buttons=[]){
  $('actions').innerHTML='';
  buttons.forEach(b=>{
    const btn=document.createElement('button');
    btn.className=`actionBtn ${b.kind||''} ${b.highlight?'highlight':''}`;
    btn.textContent=b.label; btn.onclick=b.onClick; btn.disabled=!!b.disabled;
    $('actions').appendChild(btn);
  });
}
function resetBoard(){
  clearTargets(); clearFlow(); renderPlayers(); renderHand(); setActions([]);
  $('drawPile').classList.remove('active');
}
function setupLesson(i){
  state.lesson=i; state.step=0; state.locked=false;
  if(i!==8) document.body.classList.remove('finalMode'); else document.body.classList.add('finalMode');
  renderProgress(); resetBoard();
  if(i===0){
    state.strikes[0]=0;state.out[0]=false;renderPlayers();
    setCoach('Draw Soccer twice and you’re out.',true);showFx('SOCCER ×2 = OUT','warn',1200);
  }else if(i===1){setCoach('Your turn.',true)}
  else if(i===2){setCoach('Let’s see what a Soccer card does.',true)}
  else if(i===3){state.strikes[0]=1;renderPlayers();setCoach('You already have one Soccer strike.',true)}
  else if(i===4){setCoach('Want to know what’s coming?',true)}
  else if(i===5){setCoach('Make someone else take the risk.',true)}
  else if(i===6){setCoach('Watch this. PLAYER 2 is about to play SHOOT.',true)}
  else if(i===7){setCoach('Need another card?',true)}
  else{state.finalStep=0;state.strikes[0]=1;renderPlayers();setCoach('Now play a short round on your own.',true)}
}
function nextLesson(){ if(state.lesson<8) setupLesson(state.lesson+1); }

function advanceDialogue(){
  $('coachContinue').hidden=true;
  const L=state.lesson, s=state.step++;
  if(L===0){
    if(s===0){state.strikes[0]=1;renderPlayers();showFx('FIRST SOCCER • DANGER','warn');setCoach('One Soccer means danger.',true)}
    else if(s===1){state.strikes[0]=2;state.out[0]=true;renderPlayers();showFx('SOCCER 2 / 2 • OUT','bad');setCoach('The second Soccer knocks you out.',true)}
    else if(s===2){state.strikes[0]=0;state.out[0]=false;renderPlayers();setCoach('Last player standing wins.',true)}
    else nextLesson();
  }else if(L===1){
    if(s===0){setCoach('Your own required draw ends the turn.',true)}
    else if(s===1){$('drawPile').classList.add('active');setActions([{label:'DRAW 1 CARD',kind:'blue',highlight:true,onClick:()=>doDraw('normal')}]);setCoach('Draw a card.')}
  }else if(L===2){
    if(s===0){$('drawPile').classList.add('active');setActions([{label:'DRAW',kind:'blue',highlight:true,onClick:()=>doDraw('soccer1')}]);setCoach('Tap DRAW.')}
  }else if(L===3){
    if(s===0){$('drawPile').classList.add('active');setActions([{label:'DRAW',kind:'blue',highlight:true,onClick:()=>doDraw('soccer2')}]);setCoach('Draw again.')}
  }else if(L===4){if(s===0){renderHand('DRIBBLE');setCoach('Play DRIBBLE PAST.')}}
  else if(L===5){if(s===0){renderHand('SHOOT');setCoach('Play SHOOT.')}}
  else if(L===6){if(s===0){opponentShoot()}}
  else if(L===7){if(s===0){renderHand('TACKLE');setCoach('Use TACKLE.')}}
  else if(L===8){if(s===0){beginFinal()}}
}

async function fly(srcEl, destEl, src){
  const a=srcEl.getBoundingClientRect(), b=destEl.getBoundingClientRect();
  const im=document.createElement('img');im.className='flying';im.src=src;im.style.left=a.left+'px';im.style.top=a.top+'px';im.style.width=Math.max(42,a.width)+'px';im.style.height=Math.max(58,a.height)+'px';
  document.body.appendChild(im); await wait(30);
  im.style.transform=`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.8)`; im.style.opacity='.35';
  await wait(520); im.remove();
}
async function doDraw(mode){
  if(state.locked)return; state.locked=true; setActions([]); $('drawPile').classList.remove('active');
  const temp=document.createElement('div'); temp.style.cssText='position:absolute;left:50%;bottom:6%;width:60px;height:84px;transform:translateX(-50%)'; $('table').appendChild(temp);
  const name=mode.startsWith('soccer')?'SOCCER':'TACKLE';
  await fly($('drawPile'),temp,ASSETS[name]); temp.remove(); addFlowCard(name,'YOU DRAW');
  if(mode==='normal'){
    addChip('DRAW COMPLETE','good');showFx('1 CARD DRAWN','good');setCoach('That draw ends your turn.',true);state.step=99;
  }else if(mode==='soccer1'){
    state.strikes[0]=1;renderPlayers();addChip('SOCCER 1 / 2','warn');showFx('FIRST SOCCER • DANGER','warn',1300);setCoach('Uh-oh. That’s a Soccer card.',true);state.step=10;
  }else if(mode==='soccer2'){
    addChip('WOULD BE SOCCER 2 / 2','bad');showFx('DANGER','bad');renderHand('DEFENSE');setCoach('Play DEFENSE before this becomes your second Soccer.');state.step=20;
  }
  state.locked=false;
}

function cardClicked(name,btn){
  if(state.locked)return;
  if(state.lesson===8){finalCard(name,btn);return}
  const expected={3:'DEFENSE',4:'DRIBBLE',5:'SHOOT',6:'YELLOW',7:'TACKLE'}[state.lesson];
  if(name!==expected){wrong(name,btn);return}
  if(name==='DEFENSE') defensePlay();
  else if(name==='DRIBBLE') dribblePlay();
  else if(name==='SHOOT') shootPlay();
  else if(name==='YELLOW') yellowPlay();
  else if(name==='TACKLE') tacklePlay();
}
async function wrong(name,btn,msg='That card doesn’t solve this situation.'){
  btn?.classList.add('wrong');setTimeout(()=>btn?.classList.remove('wrong'),650);showFx('TRY AGAIN','bad',700);setCoach(msg,false);await wait(850);
  const prompts={3:'Use DEFENSE to stay in the game.',4:'Play DRIBBLE PAST.',5:'Play SHOOT.',6:'Use YELLOW to cancel that action.',7:'Use TACKLE.'};
  setCoach(prompts[state.lesson]||'Try a different move.');
}
async function defensePlay(){
  state.locked=true;addFlowCard('DEFENSE','YOU PLAY DEFENSE');await wait(300);addChip('SOCCER BLOCKED','good');showFx('SAFE','good',1300);await wait(350);addChip('SOCCER → DECK POSITION 3','good');state.strikes[0]=1;renderPlayers();setCoach('Nice. DEFENSE keeps you in the game.',true);state.step=99;state.locked=false;
}
async function dribblePlay(){
  state.locked=true;addFlowCard('DRIBBLE','YOU PLAY');showFx('NEXT 3 CARDS','neutral',1200);await wait(450);
  $('top3').innerHTML=[['YELLOW',1],['SOCCER',2],['TACKLE',3]].map(([n,num])=>`<div class="preview"><span class="num">${num}</span>${imgHtml(n)}</div>`).join('');
  $('top3Modal').classList.add('show');setCoach('Now you know the next three cards.');state.locked=false;
}
$('closeTop3').onclick=()=>{$('top3Modal').classList.remove('show');setCoach('You only look. You don’t change the order.',true);state.step=99};

function shootPlay(){addFlowCard('SHOOT','YOU PLAY SHOOT');highlightTargets([1,2,3]);$('targetModal').classList.add('show');setCoach('Choose another player.')}
document.querySelectorAll('.targetBtn').forEach(b=>b.onclick=()=>resolveTarget(Number(b.dataset.player)));
async function resolveTarget(i){
  $('targetModal').classList.remove('show');clearTargets();
  if(state.lesson===5){addChip(`TARGET → PLAYER ${i+1}`,'warn');showFx('SHOOT → TARGET','neutral');await wait(300);addChip('DRAW 1 FROM TARGET HAND','good');await stealAnimation(i,'SHOOT');setCoach('SHOOT lets you draw one card from another player.',true);state.step=99}
  else if(state.lesson===7){addChip(`TARGET → PLAYER ${i+1}`,'warn');showFx('CARD STOLEN','good');await stealAnimation(i,'TACKLE');setCoach('TACKLE steals one card from another player.',true);state.step=99}
  else if(state.lesson===8 && state.finalStep===3){addChip(`SHOOT TARGET → PLAYER ${i+1}`,'good');await stealAnimation(i,'SHOOT');state.finalStep=4;await wait(300);opponentFinalShoot()}
  else if(state.lesson===8 && state.finalStep===5){addChip(`TACKLE TARGET → PLAYER ${i+1}`,'good');await stealAnimation(i,'TACKLE');state.finalStep=6;finishFinal()}
}
async function stealAnimation(i,source){const from=$('P'+i),to=$('hand');await fly(from,to,ASSETS.BACK);addChip(source==='SHOOT'?'YOU DRAW THEIR CARD':'CARD ADDED TO YOUR HAND','good')}
function tacklePlay(){addFlowCard('TACKLE','YOU PLAY TACKLE');highlightTargets([1,2,3]);$('targetModal').classList.add('show');setCoach('Choose someone to steal from.')}

async function opponentShoot(){state.locked=true;addFlowCard('SHOOT','PLAYER 2 PLAYS SHOOT');showFx('THEY’RE COMING AFTER YOU','bad',1100);await wait(500);renderHand('YELLOW');setCoach('They’re coming after you.',true);state.step=5;state.locked=false}
async function yellowPlay(){state.locked=true;addFlowCard('YELLOW','YOU PLAY YELLOW');await wait(300);addChip('🚫 CANCELED','good');showFx('NOPE! • CANCELED','good',1400);setCoach('YELLOW cancels the action.',true);state.step=99;state.locked=false}

function beginFinal(){clearFlow();state.finalStep=0;renderHand();$('drawPile').classList.add('active');setActions([{label:'DRAW',kind:'blue',onClick:finalDraw}]);setCoach('Your move.')}
async function finalDraw(){
  if(state.finalStep!==0)return;state.finalStep=1;setActions([]);$('drawPile').classList.remove('active');
  const temp=document.createElement('div');temp.style.cssText='position:absolute;left:50%;bottom:6%;width:60px;height:84px;transform:translateX(-50%)';$('table').appendChild(temp);await fly($('drawPile'),temp,ASSETS.SOCCER);temp.remove();addFlowCard('SOCCER','YOU DRAW');addChip('WOULD BE 2 / 2','bad');showFx('DANGER','bad');renderHand();setCoach('Your move.')
}
function finalCard(name,btn){
  if(state.finalStep===1){if(name!=='DEFENSE') return wrongFinal(btn,'That won’t stop a Soccer card.');addFlowCard('DEFENSE','YOU PLAY');addChip('SAFE','good');showFx('SAFE','good');state.finalStep=2;setCoach('Good. Keep playing.')}
  else if(state.finalStep===2){if(name!=='DRIBBLE') return wrongFinal(btn,'That card doesn’t help you look ahead.');addFlowCard('DRIBBLE','YOU PLAY');addChip('NEXT 3 CHECKED','good');state.finalStep=3;setCoach('Your move.')}
  else if(state.finalStep===3){if(name!=='SHOOT') return wrongFinal(btn,'That doesn’t make another player give up a card.');addFlowCard('SHOOT','YOU PLAY');highlightTargets([1,2,3]);$('targetModal').classList.add('show');setCoach('Choose a target.')}
  else if(state.finalStep===4){if(name!=='YELLOW') return wrongFinal(btn,'That SHOOT is still coming at you.');addFlowCard('YELLOW','YOU PLAY');addChip('🚫 CANCELED','good');showFx('CANCELED','good');state.finalStep=5;setCoach('Your move.')}
  else if(state.finalStep===5){if(name!=='TACKLE') return wrongFinal(btn,'That doesn’t steal a card.');addFlowCard('TACKLE','YOU PLAY');highlightTargets([1,2,3]);$('targetModal').classList.add('show');setCoach('Choose a player.')}
}
async function wrongFinal(btn,msg){btn.classList.add('wrong');setTimeout(()=>btn.classList.remove('wrong'),600);showFx('NOT QUITE','bad',700);setCoach(msg);await wait(850);setCoach('Try again.')}
async function opponentFinalShoot(){addFlowCard('SHOOT','PLAYER 3 SHOOTS YOU');showFx('OPPONENT SHOOT','bad');await wait(350);setCoach('They’re coming after you. Stop the action.')}
function finishFinal(){showFx('CHALLENGE COMPLETE','good',1600);addChip('YOU SURVIVED THE ROUND','good');setCoach('You’ve got it.',true);state.step=200}

function handleCoachTap(){
  if(state.locked)return;
  if(state.typing){finishTyping();return}
  if(state.lesson===8 && state.step===200){state.step=201;setCoach('You’re ready to play.',false);setActions([{label:'BACK TO MODES',kind:'green',onClick:()=>location.href='index.html'}]);return}
  if($('coachContinue').hidden)return;
  if(state.step===99){nextLesson();return}
  if(state.lesson===2 && state.step===10){setCoach('This is your first one, so you’re still in the game.',true);state.step=99;return}
  if(state.lesson===3 && state.step===20)return;
  advanceDialogue();
}
$('coachBubble').onclick=handleCoachTap;
$('coachBubble').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleCoachTap()}};

$('ruleBtn').onclick=()=>$('rulebookModal').classList.add('show');
$('closeRulebook').onclick=()=>$('rulebookModal').classList.remove('show');
$('coursesBtn').onclick=()=>$('coursesModal').classList.add('show');
$('closeCourses').onclick=()=>$('coursesModal').classList.remove('show');
$('courses').innerHTML=lessons.map((l,i)=>`<button class="targetBtn" data-lesson="${i}">${i===8?'FINAL':i+1}. ${l.title}</button>`).join('');
$('courses').querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{$('coursesModal').classList.remove('show');setupLesson(Number(b.dataset.lesson))});

renderPlayers();renderProgress();preload();
})();