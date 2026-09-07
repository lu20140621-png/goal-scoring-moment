(()=>{
'use strict';

const CARD_IMG={
  SHOOT:'images/shoot-card.webp',
  DEFENSE:'images/defense-card.webp',
  TACKLE:'images/tackle.webp?v=20260904tackle2',
  DRIBBLE:'images/dribble%20past-card.webp',
  YELLOW:'images/yellow-card.webp'
};
const FULL_DECK=[
  ...Array(10).fill('SHOOT'),
  ...Array(12).fill('DEFENSE'),
  ...Array(10).fill('TACKLE'),
  ...Array(10).fill('DRIBBLE'),
  ...Array(9).fill('YELLOW')
];
const BLUE=['B1','B2','BKG'];
const GREEN=['G1','G2','GKG'];
const FIELD={blue:['B1','B2'],green:['G1','G2']};
const GK={blue:'BKG',green:'GKG'};
const TEAM_SEATS={blue:BLUE,green:GREEN};
const DEAL_ORDER=['B1','G1','B2','G2','BKG','GKG'];
const HAND_SIZE=Math.floor(FULL_DECK.length/DEAL_ORDER.length);
const DEAL_COUNT=HAND_SIZE*DEAL_ORDER.length;
const EXTRA_COUNT=FULL_DECK.length-DEAL_COUNT;

const state={
  hands:{},
  score:{blue:0,green:0},
  ball:null,
  phase:'trade',
  selectedHand:'B1',
  tradePick:null,
  time:600,
  timer:null,
  ended:false,
  timeExpired:false,
  busy:false,
  attack:null,
  openBeaten:[],
  counterMissing:{blue:null,green:null},
  trackbackResolved:false,
  userDecision:null,
  discardedExtras:[],
  flow:[],
  live:[]
};

const $=id=>document.getElementById(id);
const teamOf=id=>id&&id[0]==='B'?'blue':'green';
const other=t=>t==='blue'?'green':'blue';
const isGK=id=>id&&id.includes('KG');
const name=id=>id==='BKG'?'BLUE GK':id==='GKG'?'AI GK':id?.replace('B','BLUE ').replace('G','GREEN ');
const teamName=t=>t==='blue'?'BLUE':'GREEN';

function shuffle(a){
  a=[...a];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function has(id,card){return !!state.hands[id]?.includes(card)}
function removeCard(id,card){
  const h=state.hands[id]||[];
  const i=h.indexOf(card);
  if(i<0)return false;
  h.splice(i,1);
  return true;
}
function removeAt(id,idx){
  const h=state.hands[id]||[];
  if(idx<0||idx>=h.length)return null;
  return h.splice(idx,1)[0];
}
function randomDiscard(id){
  const h=state.hands[id]||[];
  if(!h.length)return null;
  return h.splice(Math.floor(Math.random()*h.length),1)[0];
}
function totalCards(team){return TEAM_SEATS[team].reduce((n,id)=>n+(state.hands[id]?.length||0),0)}
function teamHas(team,card){return TEAM_SEATS[team].some(id=>has(id,card))}
function teamCanAttack(team){return teamHas(team,'SHOOT')}

function log(msg){
  const d=document.createElement('div');
  d.textContent=msg;
  $('log').prepend(d);
}
function notice(msg,type=''){
  const n=$('notice');
  n.textContent=msg;
  n.className='notice'+(type?' '+type:'');
}
function fmt(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function updateClock(){
  $('clock').textContent=fmt(state.time);
  $('clockLabel').textContent=state.time<=60?'FINAL MINUTE':state.phase==='trade'?'TRADE TIME COUNTS':'MATCH CLOCK';
}
function addFlow(text,type=''){
  state.flow.push({text,type});
  state.flow=state.flow.slice(-12);
  $('flow').innerHTML=state.flow.map(x=>`<span class="chip ${x.type}">${x.text}</span>`).join('');
}
function liveCard(owner,card,label=''){
  state.live.push({owner,card,label});
  state.live=state.live.slice(-6);
  renderLive();
}
function liveEvent(label,type=''){
  state.live.push({event:label,type});
  state.live=state.live.slice(-6);
  renderLive();
}
function renderLive(){
  const box=$('liveCards');
  if(!box)return;
  if(!state.live.length){
    box.innerHTML='<div class="liveEmpty">Played cards appear here.</div>';
    return;
  }
  box.innerHTML=state.live.map((x,i)=>{
    if(x.event)return `<div class="liveEvent ${x.type||''}" style="--i:${i}">${x.event}</div>`;
    return `<div class="livePlayed" style="--i:${i}"><div class="liveOwner">${name(x.owner)}</div><img src="${CARD_IMG[x.card]}" alt="${x.card}"><div class="liveTag">${x.label||x.card}</div></div>`;
  }).join('');
}
function playVisual(owner,card,label=''){
  liveCard(owner,card,label);
  addFlow(`${name(owner)} ${label||card}`,teamOf(owner)==='blue'?'good':'bad');
  log(`${name(owner)} plays ${card}${label&&label!==card?` (${label})`:''}.`);
}
function markLastLiveCanceled(byOwner){
  const items=[...$('liveCards').querySelectorAll('.livePlayed')];
  const target=items.at(-2) || items.at(-1);
  if(target)target.classList.add('canceled');
  liveEvent(`YELLOW CANCELS PREVIOUS ACTION · ${name(byOwner)}`,'yellow');
}

function dealEqual(){
  const shuffled=shuffle(FULL_DECK);
  const dealt=shuffled.slice(0,DEAL_COUNT);
  state.discardedExtras=shuffled.slice(DEAL_COUNT);
  DEAL_ORDER.forEach(id=>state.hands[id]=[]);
  for(let round=0;round<HAND_SIZE;round++){
    for(const id of DEAL_ORDER)state.hands[id].push(dealt.shift());
  }
  log(`${HAND_SIZE} cards dealt to every player. ${EXTRA_COUNT} extra cards were discarded face-down.`);
  addFlow(`${HAND_SIZE} EACH · ${EXTRA_COUNT} EXTRAS DISCARDED`,'good');
}

function renderPlayers(){
  [...BLUE,...GREEN].forEach(id=>{
    const p=$(id);
    p.querySelector('.handCount').textContent=`${state.hands[id]?.length||0} CARDS`;
    p.classList.toggle('hasBall',state.ball===id);
    p.classList.toggle('active',state.ball===id);
    const missing=state.counterMissing[teamOf(id)]===id;
    const beaten=state.attack?.beaten?.includes(id) || state.openBeaten.includes(id);
    p.classList.toggle('missing',missing);
    p.classList.toggle('beaten',!!beaten);
  });
  $('blueScore').textContent=state.score.blue;
  $('greenScore').textContent=state.score.green;
}
function renderTabs(){
  $('handTabs').innerHTML=BLUE.map(id=>`<button class="tab ${state.selectedHand===id?'on':''}" data-tab="${id}">${id==='BKG'?'BLUE GK':id.replace('B','BLUE ')}</button>`).join('');
  [...$('handTabs').children].forEach(b=>b.onclick=()=>{
    state.selectedHand=b.dataset.tab;
    if(state.phase==='trade')state.tradePick=null;
    render();
  });
}
function cardButton(card,idx,id){
  let enabled=false;
  if(state.phase==='trade')enabled=true;
  else if(state.userDecision && state.userDecision.owner===id){
    enabled=state.userDecision.mode==='discard' || state.userDecision.legal.includes(card);
  }
  const cls=enabled?' playable':'';
  return `<button class="card${cls}" data-card="${card}" data-idx="${idx}" data-owner="${id}" ${enabled?'':'disabled'}><img src="${CARD_IMG[card]}" alt="${card}"><span class="cardTag">${card}</span></button>`;
}
function renderHand(){
  const id=state.selectedHand;
  const h=state.hands[id]||[];
  $('cards').innerHTML=h.map((c,i)=>cardButton(c,i,id)).join('');
  [...$('cards').querySelectorAll('.card')].forEach(b=>{
    if(state.phase==='trade')b.onclick=()=>tradeSelect(b);
    else if(!b.disabled)b.onclick=()=>handleUserCard(b.dataset.owner,b.dataset.card,Number(b.dataset.idx));
  });
}
function renderActions(){
  const a=$('actions');
  a.innerHTML='';
  if(state.phase==='trade'){
    actionButton('LOCK TEAM & PLAY RPS',lockTrade);
    actionButton('AUTO BALANCE',autoBalance,'dark');
    return;
  }
  if(state.userDecision){
    for(const x of state.userDecision.extras||[])actionButton(x.label,x.fn,x.cls||'dark');
    return;
  }
  if(state.phase==='ended')actionButton('NEW MATCH',()=>location.reload());
}
function actionButton(label,fn,cls=''){
  const b=document.createElement('button');
  b.className='action'+(cls?' '+cls:'');
  b.textContent=label;
  b.onclick=fn;
  $('actions').appendChild(b);
}
function render(){
  renderPlayers();
  renderTabs();
  renderHand();
  renderActions();
  renderLive();
  updateClock();
  const hint=$('roundHint');
  if(hint)hint.textContent=`${HAND_SIZE} CARDS EACH · ${EXTRA_COUNT} EXTRAS DISCARDED`;
}

function setUserDecision(owner,legal,help,onCard,extras=[],mode='play'){
  state.userDecision={owner,legal:[...new Set(legal)],onCard,extras,mode};
  state.selectedHand=owner;
  state.busy=true;
  $('phaseHelp').textContent=help;
  render();
}
function clearUserDecision(){state.userDecision=null;state.busy=false}
function handleUserCard(owner,card,idx){
  const d=state.userDecision;
  if(!d||d.owner!==owner)return;
  if(d.mode!=='discard'&&!d.legal.includes(card))return;
  const removed=removeAt(owner,idx);
  if(!removed)return;
  clearUserDecision();
  if(d.mode==='discard'){
    liveEvent(`${name(owner)} DISCARDS ${removed}`,'cost');
    addFlow(`${name(owner)} DISCARD ${removed}`,'good');
    log(`${name(owner)} discards ${removed} as the recovery cost.`);
  }else playVisual(owner,removed);
  render();
  d.onCard(removed);
}

function tradeSelect(btn){
  const pick={owner:btn.dataset.owner,idx:Number(btn.dataset.idx),card:btn.dataset.card};
  if(!state.tradePick){
    state.tradePick=pick;
    notice(`Selected ${pick.card} from ${name(pick.owner)}. Choose one card from another BLUE teammate.`);
    btn.classList.add('sel');
    return;
  }
  if(state.tradePick.owner===pick.owner){
    state.tradePick=pick;
    notice('The second card must come from a different teammate.','warn');
    render();
    return;
  }
  const a=state.tradePick,b=pick;
  [state.hands[a.owner][a.idx],state.hands[b.owner][b.idx]]=[state.hands[b.owner][b.idx],state.hands[a.owner][a.idx]];
  log(`1-for-1 trade: ${name(a.owner)} ${a.card} ↔ ${name(b.owner)} ${b.card}. Hand sizes stay ${HAND_SIZE}.`);
  state.tradePick=null;
  notice(`Trade complete. Everyone still has exactly ${HAND_SIZE} cards.`);
  render();
}
function autoBalanceTeam(team){
  const seats=TEAM_SEATS[team];
  const gk=GK[team];
  const players=FIELD[team];
  const pool=seats.flatMap(id=>state.hands[id]);
  const gkHand=[];
  while(gkHand.length<HAND_SIZE){
    let i=pool.indexOf('DEFENSE');
    if(i<0)i=0;
    gkHand.push(pool.splice(i,1)[0]);
  }
  state.hands[gk]=gkHand;
  for(const p of players){
    const hand=[];
    for(const preferred of ['TACKLE','DEFENSE','DRIBBLE','SHOOT','YELLOW']){
      while(hand.length<HAND_SIZE){
        const i=pool.indexOf(preferred);
        if(i<0)break;
        hand.push(pool.splice(i,1)[0]);
        if(hand.filter(x=>x===preferred).length>=2)break;
      }
    }
    while(hand.length<HAND_SIZE)hand.push(pool.shift());
    state.hands[p]=hand;
  }
}
function autoBalance(){
  autoBalanceTeam('blue');
  notice(`Auto-balance complete. BLUE players still have ${HAND_SIZE} cards each.`);
  log('BLUE auto-balance completed with equal hand sizes.');
  render();
}
function lockTrade(){
  state.tradePick=null;
  autoBalanceTeam('green');
  state.phase='rps';
  $('phaseTitle').textContent='FIRST POSSESSION';
  $('phaseHelp').textContent='Rock-Paper-Scissors decides which team receives Soccer first.';
  showRPS('FIRST POSSESSION',result=>{
    const holder=result==='win'?'B1':'G1';
    setPossession(holder,`${result==='win'?'BLUE':'GREEN'} wins the opening RPS.`);
    beginTurn();
  });
}

function showModal(title,text,options,cb){
  const modal=$('modal');
  $('modalTitle').textContent=title;
  $('modalText').innerHTML=text;
  $('modalActions').innerHTML='';
  options.forEach(([label,val,cls])=>{
    const b=document.createElement('button');
    b.className='action'+(cls?' '+cls:'');
    b.textContent=label;
    b.onclick=()=>{modal.classList.remove('on');cb(val)};
    $('modalActions').appendChild(b);
  });
  modal.classList.add('on');
}
function showRPS(title,cb){
  showModal(title,'Choose Rock, Paper, or Scissors.',[
    ['✊ ROCK','rock'],['✋ PAPER','paper'],['✌️ SCISSORS','scissors']
  ],choice=>{
    const ai=['rock','paper','scissors'][Math.floor(Math.random()*3)];
    const win=(choice==='rock'&&ai==='scissors')||(choice==='paper'&&ai==='rock')||(choice==='scissors'&&ai==='paper');
    const tie=choice===ai;
    log(`RPS: YOU ${choice.toUpperCase()} · AI ${ai.toUpperCase()}`);
    if(tie){
      liveEvent('RPS TIE · AGAIN');
      setTimeout(()=>showRPS(title,cb),250);
    }else cb(win?'win':'lose');
  });
}

function startTimer(){
  clearInterval(state.timer);
  state.timer=setInterval(()=>{
    if(state.ended)return;
    state.time=Math.max(0,state.time-1);
    updateClock();
    if(state.time===0){
      state.timeExpired=true;
      if(!state.attack&&!state.busy&&!state.userDecision)finishMatch('FULL TIME');
      else notice('FULL TIME reached. Finish the current action, then the match ends.','warn');
    }
  },1000);
}
function afterResolution(){
  render();
  if(state.ended)return true;
  if(state.timeExpired&&!state.attack&&!state.userDecision){finishMatch('FULL TIME');return true}
  if(checkDeadGame())return true;
  return false;
}
function checkDeadGame(){
  if(state.ended||state.phase==='trade'||state.phase==='rps')return false;
  if(totalCards('blue')===0&&totalCards('green')===0){finishMatch('BOTH TEAMS HAVE NO CARDS');return true}
  if(!teamCanAttack('blue')&&!teamCanAttack('green')){finishMatch('NO LEGAL ATTACKS REMAIN');return true}
  return false;
}

function setPossession(holder,reason=''){
  const oldTeam=teamOf(state.ball);
  const newTeam=teamOf(holder);
  state.ball=holder;
  state.openBeaten=[];
  state.trackbackResolved=false;
  if(newTeam)state.counterMissing[newTeam]=null;
  if(reason)log(reason);
  liveEvent(`⚽ ${name(holder)} HAS POSSESSION`,newTeam==='blue'?'good':'bad');
  if(oldTeam!==newTeam)notice(`${name(holder)} now has Soccer.`);
  render();
}
function firstActiveFieldDefender(team){
  for(const id of FIELD[team]){
    if(state.counterMissing[team]===id)continue;
    if(state.openBeaten.includes(id))continue;
    return id;
  }
  return null;
}
function prepareCounterTrackback(defTeam,done){
  const missing=state.counterMissing[defTeam];
  if(!missing||state.trackbackResolved){done();return}
  if(defTeam==='blue'){
    if(!state.hands[missing].length){state.trackbackResolved=true;done();return}
    $('phaseTitle').textContent='COUNTERATTACK';
    setUserDecision(missing,[],`${name(missing)} was the shooter when TACKLE won Soccer. Discard 1 card to recover the missing defensive line, or stay forward.`,()=>{},[
      {label:'TRACK BACK · DISCARD 1',fn:()=>chooseTrackbackDiscard(missing,done),cls:'blue'},
      {label:'STAY FORWARD',fn:()=>{clearUserDecision();state.trackbackResolved=true;notice(`${name(missing)} stays out of position. BLUE starts one defensive line short.`,'warn');render();done()}}
    ]);
  }else{
    state.trackbackResolved=true;
    if(state.hands[missing].length&&Math.random()<.58){
      const c=randomDiscard(missing);
      state.counterMissing[defTeam]=null;
      liveEvent(`${name(missing)} DISCARDS ${c} · TRACKS BACK`,'cost');
      log(`${name(missing)} spends ${c} to recover the defensive line.`);
    }else log(`${name(missing)} stays forward. GREEN is one line short on this counterattack.`);
    render();
    setTimeout(done,300);
  }
}
function chooseTrackbackDiscard(id,done){
  setUserDecision(id,[],`Choose any 1 card from ${name(id)} to discard as the track-back cost.`,()=>{},[], 'discard');
  state.userDecision.onCard=()=>{
    state.counterMissing.blue=null;
    state.trackbackResolved=true;
    notice(`${name(id)} recovered the defensive line.`);
    render();
    done();
  };
}

function beginTurn(){
  if(afterResolution())return;
  const team=teamOf(state.ball);
  if(!teamCanAttack(team)){
    const opp=other(team);
    if(teamCanAttack(opp)){
      const target=FIELD[opp][0];
      liveEvent(`${teamName(team)} HAS NO SHOOT · POSSESSION CHANGES`,'warn');
      setPossession(target,`${teamName(team)} has no SHOOT anywhere. Soccer goes to ${teamName(opp)}.`);
      setTimeout(beginTurn,350);
      return;
    }
    finishMatch('NO LEGAL ATTACKS REMAIN');
    return;
  }
  const defTeam=other(team);
  prepareCounterTrackback(defTeam,()=>{
    if(state.ended)return;
    if(team==='blue')startBlueTurn();
    else startAITurn();
  });
}
function startBlueTurn(){
  state.phase='play';
  state.busy=false;
  state.attack=null;
  state.selectedHand=state.ball;
  $('phaseTitle').textContent='YOUR POSSESSION';
  setUserDecision(state.ball,['SHOOT'],'Only the Soccer holder has the active move. Play SHOOT or PASS to any teammate.',card=>{
    if(card==='SHOOT')startShoot(state.ball,'green',true);
  },BLUE.filter(id=>id!==state.ball).map(id=>({label:`PASS → ${name(id)}`,fn:()=>{clearUserDecision();userPass(state.ball,id)},cls:'blue'})));
  setTimeout(()=>aiStandingTackle(),300);
}
function startAITurn(){
  state.phase='ai';
  state.busy=true;
  state.attack=null;
  state.selectedHand='B1';
  $('phaseTitle').textContent='AI POSSESSION';
  $('phaseHelp').textContent='Before AI acts, your first active defender may attempt TACKLE even if there is no pass.';
  render();
  setTimeout(userStandingTackleWindow,420);
}

function aiStandingTackle(){
  if(state.ended||state.phase!=='play'||!state.userDecision||teamOf(state.ball)!=='blue')return;
  const d=firstActiveFieldDefender('green');
  if(!d||!has(d,'TACKLE')||Math.random()>=.28)return;
  const holder=state.ball;
  removeCard(d,'TACKLE');
  playVisual(d,'TACKLE','STANDING TACKLE');
  clearUserDecision();
  resolveTackle(d,holder,'open',()=>{
    setPossession(d,`${name(d)} steals Soccer before BLUE can act.`);
    beginTurn();
  },()=>{
    if(!state.openBeaten.includes(d))state.openBeaten.push(d);
    notice(`${name(holder)} dribbled past ${name(d)} before the attack.`);
    startBlueTurn();
  },()=>{
    notice(`YELLOW cancels ${name(d)}'s TACKLE. BLUE keeps Soccer.`);
    startBlueTurn();
  });
}
function userStandingTackleWindow(){
  if(state.ended||teamOf(state.ball)!=='green')return;
  const d=firstActiveFieldDefender('blue');
  if(!d||!has(d,'TACKLE')){setTimeout(aiChooseAction,350);return}
  setUserDecision(d,['TACKLE'],`${name(d)} can TACKLE now—even though AI is not passing. Play it or hold position.`,card=>{
    if(card==='TACKLE')resolveTackle(d,state.ball,'open',()=>{
      setPossession(d,`${name(d)} steals Soccer before AI can act.`);
      beginTurn();
    },()=>{
      if(!state.openBeaten.includes(d))state.openBeaten.push(d);
      log(`AI dribbles past ${name(d)} before starting its attack.`);
      aiChooseAction();
    },()=>{
      log(`AI YELLOW cancels ${name(d)}'s TACKLE.`);
      aiChooseAction();
    });
  },[{label:'HOLD POSITION',fn:()=>{clearUserDecision();render();aiChooseAction()}}]);
}

function userPass(from,to){
  state.busy=true;
  liveEvent(`⚽ ${name(from)} PASS → ${name(to)}`,'good');
  log(`${name(from)} passes to ${name(to)}.`);
  const d=firstActiveFieldDefender('green');
  if(d&&has(d,'TACKLE')&&Math.random()<.52){
    removeCard(d,'TACKLE');
    playVisual(d,'TACKLE','INTERCEPT PASS');
    resolveTackle(d,from,'pass',()=>{
      setPossession(d,`${name(d)} intercepts the pass and wins Soccer.`);
      beginTurn();
    },()=>{
      if(!state.openBeaten.includes(d))state.openBeaten.push(d);
      state.ball=to;
      liveEvent(`⚽ PASS COMPLETED · ${name(to)}`,'good');
      log(`${name(from)} dribbles through the tackle and the pass reaches ${name(to)}.`);
      state.selectedHand=to;
      startBlueTurn();
    },()=>{
      state.ball=to;
      liveEvent(`⚽ PASS COMPLETED · ${name(to)}`,'good');
      log(`TACKLE was canceled. The pass reaches ${name(to)}.`);
      state.selectedHand=to;
      startBlueTurn();
    });
  }else{
    state.ball=to;
    state.selectedHand=to;
    liveEvent(`⚽ PASS COMPLETED · ${name(to)}`,'good');
    render();
    setTimeout(()=>startBlueTurn(),280);
  }
}
function aiPass(from,to){
  liveEvent(`⚽ ${name(from)} PASS → ${name(to)}`,'bad');
  log(`${name(from)} passes to ${name(to)}.`);
  const d=firstActiveFieldDefender('blue');
  if(d&&has(d,'TACKLE')){
    setUserDecision(d,['TACKLE'],`${name(d)} can TACKLE this pass and steal Soccer.`,card=>{
      if(card==='TACKLE')resolveTackle(d,from,'pass',()=>{
        setPossession(d,`${name(d)} intercepts the pass.`);
        beginTurn();
      },()=>{
        if(!state.openBeaten.includes(d))state.openBeaten.push(d);
        state.ball=to;
        log(`AI dribbles through ${name(d)} and completes the pass.`);
        liveEvent(`⚽ AI PASS COMPLETED · ${name(to)}`,'bad');
        render();
        setTimeout(aiChooseAction,300);
      },()=>{
        state.ball=to;
        log(`AI YELLOW cancels the TACKLE and completes the pass.`);
        liveEvent(`⚽ AI PASS COMPLETED · ${name(to)}`,'bad');
        render();
        setTimeout(aiChooseAction,300);
      });
    },[{label:'LET PASS GO',fn:()=>{clearUserDecision();state.ball=to;liveEvent(`⚽ AI PASS COMPLETED · ${name(to)}`,'bad');render();setTimeout(aiChooseAction,300)}}]);
  }else{
    state.ball=to;
    render();
    setTimeout(aiChooseAction,300);
  }
}
function aiChooseAction(){
  if(state.ended||teamOf(state.ball)!=='green')return;
  const holder=state.ball;
  if(!has(holder,'SHOOT')){
    const shooter=GREEN.find(id=>has(id,'SHOOT'));
    if(shooter){aiPass(holder,shooter);return}
    beginTurn();
    return;
  }
  const mates=GREEN.filter(id=>id!==holder);
  if(Math.random()<.22&&mates.some(id=>has(id,'SHOOT'))){
    const targets=mates.filter(id=>has(id,'SHOOT'));
    aiPass(holder,targets[Math.floor(Math.random()*targets.length)]);
    return;
  }
  removeCard(holder,'SHOOT');
  playVisual(holder,'SHOOT');
  startShoot(holder,'blue',true);
}

function startShoot(shooter,defTeam,alreadyPlayed=false){
  if(!alreadyPlayed)playVisual(shooter,'SHOOT');
  state.attack={shooter,atkTeam:teamOf(shooter),defTeam,index:0,beaten:[...state.openBeaten],current:null,lastDefense:null};
  state.openBeaten=[];
  state.busy=true;
  $('phaseTitle').textContent='ATTACK';
  notice(`${name(shooter)} shoots. ${teamName(defTeam)} can use YELLOW on SHOOT before the defensive line reacts.`);
  const responder=firstDefenderForAttack();
  if(responder&&!isGK(responder)){
    offerYellowOnAction('SHOOT',shooter,responder,()=>{
      defendStep();
    },()=>{
      liveEvent('SHOOT CANCELED BY YELLOW','yellow');
      state.attack=null;
      state.busy=false;
      notice('SHOOT is canceled. The same team keeps Soccer.','warn');
      resumePossessionAfterCanceledAction();
    });
  }else defendStep();
}
function resumePossessionAfterCanceledAction(){
  render();
  if(afterResolution())return;
  if(teamOf(state.ball)==='blue')startBlueTurn();
  else {state.phase='ai';state.busy=true;setTimeout(aiChooseAction,350)}
}
function firstDefenderForAttack(){
  if(!state.attack)return null;
  const team=state.attack.defTeam;
  for(const id of FIELD[team]){
    if(state.counterMissing[team]===id)continue;
    if(state.attack.beaten.includes(id))continue;
    return id;
  }
  return GK[team];
}
function currentDefender(){
  if(!state.attack)return null;
  const team=state.attack.defTeam;
  const order=[...FIELD[team],GK[team]];
  while(state.attack.index<order.length){
    const id=order[state.attack.index];
    if(state.counterMissing[team]===id||state.attack.beaten.includes(id)){
      state.attack.index++;
      continue;
    }
    return id;
  }
  return GK[team];
}
function defendStep(){
  if(!state.attack)return;
  const d=currentDefender();
  state.attack.current=d;
  if(isGK(d)){goalkeeperStage(d);return}
  if(teamOf(d)==='blue')userDefender(d);
  else setTimeout(()=>aiDefender(d),300);
}
function userDefender(d){
  const legal=[];
  if(has(d,'DEFENSE'))legal.push('DEFENSE');
  if(has(d,'TACKLE'))legal.push('TACKLE');
  if(!legal.length){
    state.attack.beaten.push(d);
    state.attack.index++;
    liveEvent(`${name(d)} HAS NO DEFENSIVE CARD`,'warn');
    setTimeout(defendStep,280);
    return;
  }
  setUserDecision(d,legal,`${name(state.attack.shooter)} is attacking ${name(d)}. Play DEFENSE, TACKLE, or let the shot through this line.`,card=>{
    state.attack.lastDefense=card;
    if(card==='DEFENSE')resolveDefense(d);
    else resolveTackle(d,state.attack.shooter,'shoot',()=>fieldDefenseWins(d,true),()=>defenderBeaten(d,true),()=>defenderBeaten(d,false));
  },[{label:'LET HIM THROUGH',fn:()=>{clearUserDecision();state.attack.beaten.push(d);state.attack.index++;liveEvent(`${name(d)} LETS ATTACK THROUGH`,'warn');render();setTimeout(defendStep,260)}}]);
}
function aiDefender(d){
  const options=[];
  if(has(d,'TACKLE'))options.push('TACKLE');
  if(has(d,'DEFENSE'))options.push('DEFENSE');
  if(!options.length){
    state.attack.beaten.push(d);
    state.attack.index++;
    liveEvent(`${name(d)} HAS NO DEFENSIVE CARD`,'warn');
    render();
    setTimeout(defendStep,280);
    return;
  }
  const card=options.includes('TACKLE')&&Math.random()<.55?'TACKLE':options[Math.floor(Math.random()*options.length)];
  removeCard(d,card);
  playVisual(d,card);
  state.attack.lastDefense=card;
  if(card==='DEFENSE')resolveDefense(d);
  else resolveTackle(d,state.attack.shooter,'shoot',()=>fieldDefenseWins(d,true),()=>defenderBeaten(d,true),()=>defenderBeaten(d,false));
}

function resolveDefense(defender){
  const shooter=state.attack.shooter;
  if(teamOf(shooter)==='blue'){
    if(has(shooter,'DRIBBLE')){
      setUserDecision(shooter,['DRIBBLE'],'DEFENSE cannot be canceled by YELLOW. Use DRIBBLE PAST to beat this defender, or let DEFENSE stop the attack.',()=>{
        offerYellowOnAction('DRIBBLE',shooter,defender,()=>defenderBeaten(defender,true),()=>fieldDefenseWins(defender,false));
      },[{label:'LET DEFENSE STOP ATTACK',fn:()=>{clearUserDecision();fieldDefenseWins(defender,false)}}]);
    }else fieldDefenseWins(defender,false);
  }else{
    if(has(shooter,'DRIBBLE')&&Math.random()<.68){
      removeCard(shooter,'DRIBBLE');
      playVisual(shooter,'DRIBBLE');
      offerYellowOnAction('DRIBBLE',shooter,defender,()=>defenderBeaten(defender,true),()=>fieldDefenseWins(defender,false));
    }else fieldDefenseWins(defender,false);
  }
}

function resolveTackle(defender,attacker,context,onSuccess,onDribbled,onCanceled){
  const attackerTeam=teamOf(attacker);
  const legal=[];
  if(has(attacker,'DRIBBLE'))legal.push('DRIBBLE');
  if(has(attacker,'YELLOW'))legal.push('YELLOW');
  if(attackerTeam==='blue'){
    if(!legal.length){onSuccess();return}
    setUserDecision(attacker,legal,`TACKLE will steal Soccer${context==='shoot'?' and stop the SHOOT':''}. Use DRIBBLE PAST, use YELLOW to cancel TACKLE, or let TACKLE win.`,card=>{
      if(card==='DRIBBLE'){
        offerYellowOnAction('DRIBBLE',attacker,defender,()=>onDribbled(),()=>onSuccess());
      }else{
        startYellowChain('TACKLE',defender,attacker,active=>{
          if(active){
            if(has(attacker,'DRIBBLE')){
              setUserDecision(attacker,['DRIBBLE'],'Your YELLOW was countered. TACKLE is active again. DRIBBLE now, or let TACKLE win.',()=>{
                offerYellowOnAction('DRIBBLE',attacker,defender,()=>onDribbled(),()=>onSuccess());
              },[{label:'LET TACKLE WIN',fn:()=>{clearUserDecision();onSuccess()}}]);
            }else onSuccess();
          }else onCanceled();
        });
      }
    },[{label:'LET TACKLE WIN',fn:()=>{clearUserDecision();onSuccess()}}]);
  }else{
    let choice='lose';
    if(has(attacker,'DRIBBLE')&&Math.random()<.6)choice='DRIBBLE';
    else if(has(attacker,'YELLOW')&&Math.random()<.55)choice='YELLOW';
    if(choice==='DRIBBLE'){
      removeCard(attacker,'DRIBBLE');
      playVisual(attacker,'DRIBBLE');
      offerYellowOnAction('DRIBBLE',attacker,defender,()=>onDribbled(),()=>onSuccess());
    }else if(choice==='YELLOW'){
      removeCard(attacker,'YELLOW');
      playVisual(attacker,'YELLOW');
      markLastLiveCanceled(attacker);
      startYellowChain('TACKLE',defender,attacker,active=>{
        if(active&&has(attacker,'DRIBBLE')&&Math.random()<.55){
          removeCard(attacker,'DRIBBLE');
          playVisual(attacker,'DRIBBLE');
          offerYellowOnAction('DRIBBLE',attacker,defender,()=>onDribbled(),()=>onSuccess());
        }else if(active)onSuccess();
        else onCanceled();
      },true);
    }else onSuccess();
  }
}

function offerYellowOnAction(actionCard,actor,responder,onActive,onCanceled){
  if(actionCard==='DEFENSE'){onActive();return}
  if(!has(responder,'YELLOW')){onActive();return}
  if(teamOf(responder)==='blue'){
    setUserDecision(responder,['YELLOW'],`${name(actor)} played ${actionCard}. YELLOW can cancel it. DEFENSE is the only Action that YELLOW cannot cancel.`,()=>{
      markLastLiveCanceled(responder);
      startYellowChain(actionCard,actor,responder,active=>active?onActive():onCanceled());
    },[{label:'DO NOT USE YELLOW',fn:()=>{clearUserDecision();onActive()}}]);
  }else if(Math.random()<.30){
    removeCard(responder,'YELLOW');
    playVisual(responder,'YELLOW');
    markLastLiveCanceled(responder);
    startYellowChain(actionCard,actor,responder,active=>active?onActive():onCanceled(),true);
  }else onActive();
}
function startYellowChain(originalCard,actor,canceler,onDone){
  let active=false;
  let next=actor;
  const participants=[actor,canceler];
  function loop(){
    if(state.ended)return;
    if(!has(next,'YELLOW')){onDone(active);return}
    const otherSeat=next===participants[0]?participants[1]:participants[0];
    if(teamOf(next)==='blue'){
      setUserDecision(next,['YELLOW'],`${name(next)} can play another YELLOW. Each YELLOW cancels the immediately previous YELLOW, so ${originalCard} will ${active?'be canceled again':'be restored'}.`,()=>{
        active=!active;
        liveEvent(`YELLOW CHAIN · ${originalCard} ${active?'RESTORED':'CANCELED'}`,'yellow');
        next=otherSeat;
        loop();
      },[{label:'STOP YELLOW CHAIN',fn:()=>{clearUserDecision();onDone(active)}}]);
    }else if(Math.random()<.46){
      removeCard(next,'YELLOW');
      playVisual(next,'YELLOW');
      active=!active;
      liveEvent(`YELLOW CHAIN · ${originalCard} ${active?'RESTORED':'CANCELED'}`,'yellow');
      next=otherSeat;
      setTimeout(loop,280);
    }else onDone(active);
  }
  setTimeout(loop,220);
}

function defenderBeaten(defender,byDribble){
  if(!state.attack)return;
  if(!state.attack.beaten.includes(defender))state.attack.beaten.push(defender);
  liveEvent(`${name(defender)} BEATEN${byDribble?' BY DRIBBLE':''}`,'good');
  log(`${name(defender)} is beaten and the attack moves deeper.`);
  render();
  offerChase(defender,()=>{
    state.attack.index++;
    render();
    setTimeout(defendStep,260);
  });
}
function offerChase(defender,moveOn){
  const canDef=has(defender,'DEFENSE')||has(defender,'TACKLE');
  if(!canDef||state.hands[defender].length<2){moveOn();return}
  if(teamOf(defender)==='blue'){
    setUserDecision(defender,[],`${name(defender)} was beaten. To defend again, first discard 1 extra card as stamina.`,()=>{},[
      {label:'CHASE BACK · DISCARD 1',fn:()=>chooseChaseDiscard(defender,moveOn),cls:'blue'},
      {label:'LET NEXT LINE DEFEND',fn:()=>{clearUserDecision();moveOn()}}
    ]);
  }else if(Math.random()<.38){
    const cost=randomDiscard(defender);
    liveEvent(`${name(defender)} DISCARDS ${cost} · CHASES BACK`,'cost');
    log(`${name(defender)} discards ${cost} to defend again.`);
    setTimeout(()=>aiChaseDefense(defender,moveOn),250);
  }else moveOn();
}
function chooseChaseDiscard(defender,moveOn){
  setUserDecision(defender,[],`Choose 1 card to discard. After paying the cost, ${name(defender)} may play DEFENSE or TACKLE again.`,()=>{},[], 'discard');
  state.userDecision.onCard=()=>{
    const legal=[];
    if(has(defender,'DEFENSE'))legal.push('DEFENSE');
    if(has(defender,'TACKLE'))legal.push('TACKLE');
    if(!legal.length){moveOn();return}
    setUserDecision(defender,legal,'Recovery cost paid. Now choose the defensive card.',card=>{
      state.attack.lastDefense=card;
      if(card==='DEFENSE')resolveDefense(defender);
      else resolveTackle(defender,state.attack.shooter,'shoot',()=>fieldDefenseWins(defender,true),()=>defenderBeaten(defender,true),()=>defenderBeaten(defender,false));
    },[{label:'STOP CHASING',fn:()=>{clearUserDecision();moveOn()}}]);
  };
}
function aiChaseDefense(defender,moveOn){
  let card=null;
  if(has(defender,'TACKLE')&&Math.random()<.5)card='TACKLE';
  else if(has(defender,'DEFENSE'))card='DEFENSE';
  else if(has(defender,'TACKLE'))card='TACKLE';
  if(!card){moveOn();return}
  removeCard(defender,card);
  playVisual(defender,card,'CHASE '+card);
  state.attack.lastDefense=card;
  if(card==='DEFENSE')resolveDefense(defender);
  else resolveTackle(defender,state.attack.shooter,'shoot',()=>fieldDefenseWins(defender,true),()=>defenderBeaten(defender,true),()=>defenderBeaten(defender,false));
}

function fieldDefenseWins(defender,tackle){
  const atk=state.attack;
  if(!atk)return;
  const shooter=atk.shooter;
  state.attack=null;
  state.busy=false;
  if(tackle){
    state.counterMissing[atk.atkTeam]=shooter;
    liveEvent('TACKLE WINS SOCCER · COUNTERATTACK','turnover');
    setPossession(defender,`${name(defender)} wins Soccer with TACKLE. ${name(shooter)} is caught out of position.`);
  }else{
    liveEvent('DEFENSE STOPS THE ATTACK','turnover');
    setPossession(defender,`${name(defender)} stops the attack with DEFENSE and takes Soccer.`);
  }
  beginTurn();
}

function goalkeeperStage(gk){
  if(!state.attack)return;
  if(!has(gk,'DEFENSE')){
    liveEvent(`${name(gk)} HAS NO DEFENSE · GOAL`,'goal');
    scoreGoal(state.attack.atkTeam,state.attack.shooter);
    return;
  }
  if(teamOf(gk)==='blue'){
    setUserDecision(gk,['DEFENSE'],'The shot reached your Goalkeeper. Only Goalkeeper DEFENSE starts the save duel. YELLOW cannot cancel DEFENSE.',()=>goalkeeperDuel(gk),[
      {label:'DO NOT USE DEFENSE',fn:()=>{clearUserDecision();scoreGoal(state.attack.atkTeam,state.attack.shooter)}}
    ]);
  }else{
    removeCard(gk,'DEFENSE');
    playVisual(gk,'DEFENSE','GK DEFENSE');
    setTimeout(()=>goalkeeperDuel(gk),280);
  }
}
function goalkeeperDuel(gk){
  if(!state.attack)return;
  if(teamOf(gk)==='blue'){
    showRPS('GOALKEEPER DUEL',res=>{
      if(res==='win')goalkeeperSave(gk);
      else scoreGoal(state.attack.atkTeam,state.attack.shooter);
    });
  }else{
    showRPS('GOALKEEPER DUEL',res=>{
      if(res==='win')scoreGoal(state.attack.atkTeam,state.attack.shooter);
      else goalkeeperSave(gk);
    });
  }
}
function goalkeeperSave(gk){
  const team=teamOf(gk);
  liveEvent(`${name(gk)} SAVE`,'save');
  state.attack=null;
  state.busy=false;
  state.counterMissing[team]=null;
  setPossession(gk,`${name(gk)} saves the shot and controls Soccer.`);
  beginTurn();
}
function scoreGoal(team,shooter){
  state.score[team]++;
  liveEvent(`${teamName(team)} GOAL +1`,'goal');
  log(`${name(shooter)} scores. BLUE ${state.score.blue} — ${state.score.green} GREEN.`);
  state.attack=null;
  state.busy=false;
  state.counterMissing.blue=null;
  state.counterMissing.green=null;
  const concede=other(team);
  const restart=FIELD[concede][0];
  setPossession(restart,`${teamName(concede)} restarts after conceding.`);
  beginTurn();
}

function finishMatch(reason){
  if(state.ended)return;
  state.ended=true;
  clearInterval(state.timer);
  state.phase='ended';
  state.userDecision=null;
  state.busy=true;
  state.attack=null;
  $('modal').classList.remove('on');
  notice(`${reason}. FINAL SCORE: BLUE ${state.score.blue} — ${state.score.green} GREEN.`);
  liveEvent(`FULL MATCH · BLUE ${state.score.blue} — ${state.score.green} GREEN`,'goal');
  log(`Match ends: ${reason}.`);
  render();
  if(state.score.blue===state.score.green)setTimeout(()=>penaltyShootout(1),450);
  else showModal('MATCH WINNER',`${state.score.blue>state.score.green?'BLUE':'GREEN'} wins the match, ${Math.max(state.score.blue,state.score.green)}–${Math.min(state.score.blue,state.score.green)}.`,[
    ['PLAY AGAIN','again'],['MATCH MENU','menu']
  ],v=>v==='again'?location.reload():location.href='match.html');
}
function penaltyShootout(round){
  const deck=shuffle(FULL_DECK);
  const draws={};
  [...BLUE,...GREEN].forEach(id=>draws[id]=deck.pop());
  const blueShot=FIELD.blue.reduce((n,id)=>n+(draws[id]==='SHOOT'?1:0),0);
  const greenShot=FIELD.green.reduce((n,id)=>n+(draws[id]==='SHOOT'?1:0),0);
  const blueSave=draws.BKG==='DEFENSE'?1:0;
  const greenSave=draws.GKG==='DEFENSE'?1:0;
  const blueNet=blueShot-greenSave;
  const greenNet=greenShot-blueSave;
  const cardLine=id=>`<div class="penDraw"><img src="${CARD_IMG[draws[id]]}" alt="${draws[id]}"><div><b>${name(id)}</b><br>${draws[id]} ${isGK(id)?(draws[id]==='DEFENSE'?'· -1 vs opponent':'· 0'):(draws[id]==='SHOOT'?'· +1':'· 0')}</div></div>`;
  const html=`<div class="penV2"><div><h3>BLUE</h3>${BLUE.map(cardLine).join('')}<b>SHOOTOUT SCORE ${blueNet}</b></div><div><h3>GREEN</h3>${GREEN.map(cardLine).join('')}<b>SHOOTOUT SCORE ${greenNet}</b></div></div>`;
  showModal(`PENALTY SHOOTOUT · DRAW ${round}`,`All 51 Action Cards are reshuffled. Every Player and Goalkeeper draws 1.<br><br>PLAYER: SHOOT = +1.<br>GOALKEEPER: DEFENSE = -1 against the opponent.${html}`,[['CONTINUE','go']],()=>{
    if(blueNet===greenNet)penaltyShootout(round+1);
    else showModal('MATCH WINNER',`${blueNet>greenNet?'BLUE':'GREEN'} wins the penalty shootout, ${Math.max(blueNet,greenNet)} to ${Math.min(blueNet,greenNet)}.`,[
      ['PLAY AGAIN','again'],['MATCH MENU','menu']
    ],v=>v==='again'?location.reload():location.href='match.html');
  });
}

function reset(){
  clearInterval(state.timer);
  state.hands={};
  state.score={blue:0,green:0};
  state.ball=null;
  state.phase='trade';
  state.selectedHand='B1';
  state.tradePick=null;
  state.time=600;
  state.ended=false;
  state.timeExpired=false;
  state.busy=false;
  state.attack=null;
  state.openBeaten=[];
  state.counterMissing={blue:null,green:null};
  state.trackbackResolved=false;
  state.userDecision=null;
  state.discardedExtras=[];
  state.flow=[];
  state.live=[];
  $('log').innerHTML='';
  dealEqual();
  startTimer();
  $('phaseTitle').textContent='TEAM TRADE';
  $('phaseHelp').textContent=`Everyone has exactly ${HAND_SIZE} cards. Swap 1-for-1 between BLUE teammates. The ${EXTRA_COUNT} extra cards were discarded face-down. The 10-minute clock is already running.`;
  notice(`${HAND_SIZE} cards each. ${EXTRA_COUNT} extra cards discarded. Trade quickly—the match clock already started.`);
  render();
}

reset();
})();
