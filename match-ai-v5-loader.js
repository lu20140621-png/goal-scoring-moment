(async()=>{
'use strict';
const SOURCE='match-ai-v4.js?v=20260907m15';
function fail(msg){
  console.error('[Match V5 loader]',msg);
  const n=document.getElementById('notice');
  if(n){n.textContent='Match Mode failed to load the latest GK attack rules. Please refresh.';n.className='notice warn';}
}
try{
  const res=await fetch(SOURCE,{cache:'no-store'});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  let src=await res.text();
  const replaceOnce=(from,to,label)=>{
    if(!src.includes(from))throw new Error(`Patch target not found: ${label}`);
    src=src.replace(from,to);
  };

  replaceOnce(
    "const state={hands:{},score:{blue:0,green:0},ball:null,phase:'trade',selectedHand:'B1',tradePick:null,time:600,timer:null,ended:false,timeExpired:false,busy:false,attack:null,userDecision:null,extras:[],flow:[],live:[]};",
    "const state={hands:{},score:{blue:0,green:0},ball:null,phase:'trade',selectedHand:'B1',tradePick:null,time:600,timer:null,ended:false,timeExpired:false,busy:false,attack:null,userDecision:null,extras:[],flow:[],live:[],gkOut:{blue:false,green:false}};",
    'state.gkOut'
  );

  replaceOnce(
    "function teamCanAttack(team){return teamHas(team,'SHOOT')}",
    "function teamCanAttack(team){return teamHas(team,'SHOOT')}\nfunction markGKOutOnTackle(id){if(!isGK(id))return;const t=teamOf(id);state.gkOut[t]=true;liveEvent(`${name(id)} LOST SOCCER TO TACKLE · GK OUT OF POSITION`,'warn');log(`${name(id)} joined the attack and lost Soccer to TACKLE. ${name(id)} is out of position until the team regains Soccer or the GK discards 1 card at the goal line to return.`);render()}\nfunction recoverGKWhenTeamRegains(id){const t=teamOf(id);if(!t||!state.gkOut[t]||isGK(id))return;state.gkOut[t]=false;liveEvent(`${teamName(t)} REGAINS SOCCER · GK RETURNS`,'good');log(`${teamName(t)} regains Soccer before the counterattack reaches goal. The Goalkeeper returns to position.`)}",
    'GK helper functions'
  );

  replaceOnce(
    "p.classList.remove('missing')",
    "p.classList.remove('missing');p.classList.toggle('outOfPosition',isGK(id)&&!!state.gkOut[teamOf(id)])",
    'GK out-of-position visual state'
  );

  replaceOnce(
    "function handleUserCard(owner,card,idx){const d=state.userDecision;if(!d||d.owner!==owner)return;if(d.mode!=='discard'&&!d.legal.includes(card))return;const removed=removeAt(owner,idx);if(!removed)return;clearUserDecision();if(d.mode==='discard'){liveEvent(`${name(owner)} DISCARDS ${removed}`,'cost');addFlow(`${name(owner)} DISCARD ${removed}`,'good');log(`${name(owner)} discards ${removed} as the chase-back cost.`)}else playVisual(owner,removed);render();d.onCard(removed)}",
    "function handleUserCard(owner,card,idx){const d=state.userDecision;if(!d||d.owner!==owner)return;if(d.mode!=='discard'&&!d.legal.includes(card))return;const removed=removeAt(owner,idx);if(!removed)return;clearUserDecision();if(d.mode==='discard'){liveEvent(`${name(owner)} DISCARDS ${removed}`,'cost');addFlow(`${name(owner)} DISCARD ${removed}`,'good');log(d.reason==='gk-return'?`${name(owner)} discards ${removed} to return to goal.`:`${name(owner)} discards ${removed} as the chase-back cost.`)}else playVisual(owner,removed);render();d.onCard(removed)}",
    'discard reason logging'
  );

  replaceOnce(
    "function setPossession(id,msg=''){state.ball=id;state.attack=null;state.busy=false;if(msg)notice(msg);addFlow(`⚽ ${name(id)} HAS SOCCER`,teamOf(id)==='blue'?'good':'bad');render()}",
    "function setPossession(id,msg=''){recoverGKWhenTeamRegains(id);state.ball=id;state.attack=null;state.busy=false;if(msg)notice(msg);addFlow(`⚽ ${name(id)} HAS SOCCER`,teamOf(id)==='blue'?'good':'bad');render()}",
    'team-regain recovery'
  );

  replaceOnce(
    "passTackleResponse(from,d,()=>{setPossession(d,`${name(d)} intercepts the PASS and wins Soccer.`);beginTurn()},",
    "passTackleResponse(from,d,()=>{markGKOutOnTackle(from);setPossession(d,`${name(d)} intercepts the PASS and wins Soccer.`);beginTurn()},",
    'AI intercepts GK pass'
  );

  replaceOnce(
    "passTackleResponse(from,d,()=>{setPossession(d,`${name(d)} intercepts the PASS and wins Soccer.`);beginTurn()},",
    "passTackleResponse(from,d,()=>{markGKOutOnTackle(from);setPossession(d,`${name(d)} intercepts the PASS and wins Soccer.`);beginTurn()},",
    'User intercepts AI GK pass'
  );

  replaceOnce(
    "function tackleWins(defender){if(!state.attack)return;liveEvent(`${name(defender)} TACKLE WINS SOCCER`,'turnover');state.attack=null;state.busy=false;setPossession(defender,`${name(defender)} wins Soccer with TACKLE. Possession changes.`);setTimeout(beginTurn,240)}",
    "function tackleWins(defender){if(!state.attack)return;const loser=state.attack.shooter;markGKOutOnTackle(loser);liveEvent(`${name(defender)} TACKLE WINS SOCCER`,'turnover');state.attack=null;state.busy=false;setPossession(defender,`${name(defender)} wins Soccer with TACKLE. Possession changes.`);setTimeout(beginTurn,240)}",
    'TACKLE beats attacking GK'
  );

  replaceOnce(
    "function goalkeeperStage(gk){if(!state.attack)return;if(!has(gk,'DEFENSE')){scoreGoalAndGiveGK(gk,'NO GK DEFENSE');return}if(teamOf(gk)==='blue')setUserDecision(gk,['DEFENSE'],'The SHOOT reached your Goalkeeper. Field-line YELLOW is over. GK DEFENSE starts Rock-Paper-Scissors. Soccer ends in the Goalkeeper hand either way.',()=>goalkeeperDuel(gk),[{label:'DO NOT USE DEFENSE',fn:()=>{clearUserDecision();scoreGoalAndGiveGK(gk,'GK DOES NOT USE DEFENSE')}}]);else{removeCard(gk,'DEFENSE');playVisual(gk,'DEFENSE','GK DEFENSE');setTimeout(()=>goalkeeperDuel(gk),240)}}",
    "function goalkeeperStage(gk){if(!state.attack)return;if(state.gkOut[teamOf(gk)]){offerGKReturn(gk);return}if(!has(gk,'DEFENSE')){scoreGoalAndGiveGK(gk,'NO GK DEFENSE');return}if(teamOf(gk)==='blue')setUserDecision(gk,['DEFENSE'],'The SHOOT reached your Goalkeeper. Field-line YELLOW is over. GK DEFENSE starts Rock-Paper-Scissors. Soccer ends in the Goalkeeper hand either way.',()=>goalkeeperDuel(gk),[{label:'DO NOT USE DEFENSE',fn:()=>{clearUserDecision();scoreGoalAndGiveGK(gk,'GK DOES NOT USE DEFENSE')}}]);else{removeCard(gk,'DEFENSE');playVisual(gk,'DEFENSE','GK DEFENSE');setTimeout(()=>goalkeeperDuel(gk),240)}}\nfunction offerGKReturn(gk){if(!state.attack)return;const t=teamOf(gk),h=state.hands[gk]||[];if(!h.length){emptyGoal(gk,'GK OUT OF POSITION · NO CARD TO RETURN');return}if(t==='blue'){setUserDecision(gk,[],`${name(gk)} joined the attack and lost Soccer to TACKLE. The counterattack has reached goal. Discard ANY 1 card to RETURN TO GOAL. That discard only pays the recovery cost; you still need a separate DEFENSE card to start RPS. If you do not return, this is an EMPTY GOAL and the opponent scores automatically.`,()=>{},[{label:'STAY OUT · EMPTY GOAL',fn:()=>{clearUserDecision();emptyGoal(gk,'GK STAYS OUT OF POSITION')}}],'discard');state.userDecision.reason='gk-return';state.userDecision.onCard=()=>{state.gkOut[t]=false;liveEvent(`${name(gk)} DISCARDS 1 · RETURNS TO GOAL`,'good');notice(`${name(gk)} returned to goal. Now resolve the normal Goalkeeper stage.`,'good');render();setTimeout(()=>goalkeeperStage(gk),220)}}else{const cost=randomDiscard(gk);if(cost){state.gkOut[t]=false;liveEvent(`${name(gk)} DISCARDS ${cost} · RETURNS TO GOAL`,'cost');log(`${name(gk)} discards ${cost} to return to goal.`);render();setTimeout(()=>goalkeeperStage(gk),220)}else emptyGoal(gk,'AI GK OUT OF POSITION · NO CARD TO RETURN')}}\nfunction emptyGoal(gk,reason){if(!state.attack)return;state.gkOut[teamOf(gk)]=false;liveEvent('EMPTY GOAL · AUTOMATIC GOAL','goal');scoreGoalAndGiveGK(gk,reason)}",
    'GK return decision'
  );

  replaceOnce(
    "function goalkeeperSave(gk){liveEvent(`${name(gk)} SAVE · GK KEEPS SOCCER`,'save');state.attack=null;state.busy=false;setPossession(gk,`${name(gk)} saves the SHOOT and keeps Soccer.`);setTimeout(beginTurn,240)}",
    "function goalkeeperSave(gk){state.gkOut[teamOf(gk)]=false;liveEvent(`${name(gk)} SAVE · GK KEEPS SOCCER`,'save');state.attack=null;state.busy=false;setPossession(gk,`${name(gk)} saves the SHOOT and keeps Soccer.`);setTimeout(beginTurn,240)}",
    'save clears GK out state'
  );

  replaceOnce(
    "function scoreGoalAndGiveGK(gk,reason='GOAL'){if(!state.attack)return;const atk=state.attack,team=atk.atkTeam;state.score[team]++;liveEvent(`${teamName(team)} GOAL +1`,'goal');log(`${name(atk.shooter)} scores. BLUE ${state.score.blue} — ${state.score.green} GREEN.`);state.attack=null;state.busy=false;setPossession(gk,`${reason}. GOAL for ${teamName(team)}. ${name(gk)} receives Soccer for the restart.`);setTimeout(beginTurn,260)}",
    "function scoreGoalAndGiveGK(gk,reason='GOAL'){if(!state.attack)return;const atk=state.attack,team=atk.atkTeam;state.score[team]++;state.gkOut[teamOf(gk)]=false;liveEvent(`${teamName(team)} GOAL +1`,'goal');log(`${name(atk.shooter)} scores. BLUE ${state.score.blue} — ${state.score.green} GREEN.`);state.attack=null;state.busy=false;setPossession(gk,`${reason}. GOAL for ${teamName(team)}. ${name(gk)} receives Soccer for the restart.`);setTimeout(beginTurn,260)}",
    'goal clears GK out state'
  );

  replaceOnce(
    "state.live=[];$('log').innerHTML='';dealEqual();",
    "state.live=[];state.gkOut={blue:false,green:false};$('log').innerHTML='';dealEqual();",
    'reset GK state'
  );

  const style=document.createElement('style');
  style.textContent='.player.outOfPosition{outline:3px solid #ffb21b!important;box-shadow:0 0 0 5px rgba(255,178,27,.16),0 0 22px rgba(255,88,42,.5)!important}.player.outOfPosition::after{content:"GK OUT";position:absolute;right:4px;top:4px;background:#ff8b22;color:#1d0c00;border:1px solid #4b1d00;border-radius:7px;padding:2px 5px;font-size:7px;font-weight:1000;letter-spacing:.05em;z-index:5}';
  document.head.appendChild(style);

  (0,eval)(src+'\n//# sourceURL=match-ai-v5-runtime.js');
}catch(err){fail(err&&err.message?err.message:String(err));}
})();
