(async()=>{
'use strict';
const SOURCE='match-ai-v5-loader.js?v=20260907m15';
function fail(msg){console.error('[Match V6 loader]',msg);const n=document.getElementById('notice');if(n){n.textContent='Match Mode failed to load the latest Goalkeeper Duel rules. Please refresh.';n.className='notice warn';}}
try{
  const res=await fetch(SOURCE,{cache:'no-store'});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  let loader=await res.text();
  const marker="  const style=document.createElement('style');";
  if(!loader.includes(marker))throw new Error('V5 injection point not found');
  const inject=`
  {
    const duelStart=src.indexOf("function goalkeeperDuel(gk){");
    const duelEnd=src.indexOf("\\nfunction goalkeeperSave(gk){",duelStart);
    if(duelStart<0||duelEnd<0)throw new Error('Goalkeeper Duel patch target not found');
    const replacement=[
      "function goalkeeperDuel(gk){",
      "  if(!state.attack)return;",
      "  showModal('CHOOSE GOALKEEPER DUEL','<b>Two official methods are available.</b><br>Choose Rock / Paper / Scissors or Left / Center / Right for this final save duel.',[['✊ ✋ ✌️ RPS','rps'],['🥅 LEFT · CENTER · RIGHT','direction']],method=>{if(method==='rps')goalkeeperDuelRPS(gk);else goalkeeperDuelDirection(gk)})",
      "}",
      "function goalkeeperDuelRPS(gk){",
      "  if(!state.attack)return;",
      "  if(teamOf(gk)==='blue')showRPS('GOALKEEPER DUEL · RPS',res=>res==='win'?goalkeeperSave(gk):scoreGoalAndGiveGK(gk,'SHOOTER WINS RPS'));",
      "  else showRPS('GOALKEEPER DUEL · RPS',res=>res==='win'?scoreGoalAndGiveGK(gk,'SHOOTER WINS RPS'):goalkeeperSave(gk));",
      "}",
      "function goalkeeperDuelDirection(gk){",
      "  if(!state.attack)return;",
      "  showModal('GOALKEEPER DUEL · LEFT / CENTER / RIGHT','Shooter and Goalkeeper choose at the same time. <b>SAME call = SAVE.</b> <b>DIFFERENT calls = GOAL.</b>',[['← LEFT','left'],['● CENTER','center'],['RIGHT →','right']],choice=>{",
      "    const ai=['left','center','right'][Math.floor(Math.random()*3)],same=choice===ai;",
      "    const humanRole=teamOf(gk)==='blue'?'GOALKEEPER':'SHOOTER',aiRole=teamOf(gk)==='blue'?'SHOOTER':'GOALKEEPER';",
      "    log('DIRECTION DUEL: YOU '+humanRole+' '+choice.toUpperCase()+' · AI '+aiRole+' '+ai.toUpperCase()+' · '+(same?'SAVE':'GOAL'));",
      "    liveEvent('LEFT/CENTER/RIGHT · '+(same?'SAME = SAVE':'DIFFERENT = GOAL'),same?'save':'goal');",
      "    if(same)goalkeeperSave(gk);else scoreGoalAndGiveGK(gk,'DIRECTION DUEL · DIFFERENT CALLS');",
      "  })",
      "}"
    ].join('\\n');
    src=src.slice(0,duelStart)+replacement+src.slice(duelEnd);
    src=src.replace(/GK DEFENSE starts Rock-Paper-Scissors\\./g,'GK DEFENSE starts a Goalkeeper Duel. Choose RPS or Left / Center / Right.');
    src=src.replace(/still need a separate DEFENSE card to start RPS/g,'still need a separate DEFENSE card to start the chosen Goalkeeper Duel');
  }
`;
  loader=loader.replace(marker,inject+marker);
  (0,eval)(loader+'\n//# sourceURL=match-ai-v6-inner-loader.js');
}catch(err){fail(err&&err.message?err.message:String(err));}
})();