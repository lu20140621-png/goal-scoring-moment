(async()=>{
'use strict';
const SOURCE='match-tutorial-v6.js?v=20260909gkfix1';
function fail(msg){
  console.error('[Match Tutorial V10 loader]',msg);
  const n=document.getElementById('note');
  if(n)n.textContent='Tutorial failed to load the latest Goalkeeper return fix. Please refresh.';
}
try{
  const res=await fetch(SOURCE,{cache:'no-store'});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  let src=await res.text();
  const from="askAnyCard('Tap any one card in the BLUE GK hand to discard as the return-to-goal cost.',()=>{setGKOut('BKG',false);addFlow('BLUE GK RETURNS TO GOAL','good');typeText('BLUE GK is back, but recovery did not count as DEFENSE. You still need a separate DEFENSE card to start the save duel. Tap DEFENSE now.',false);askCard('DEFENSE','Tap the remaining DEFENSE card to defend the goal.',()=>{addFlow('GK DEFENSE → RPS','good');complete('GK ATTACK RISK COMPLETE')},'BLUE GK PLAYS DEFENSE')},'BLUE GK DISCARDS 1 TO RETURN')";
  const to="askAnyCard('Tap any one card in the BLUE GK hand to discard as the return-to-goal cost. Any card is legal — including DEFENSE, but discarding your last DEFENSE means you return to goal with no save card.',(discarded)=>{setGKOut('BKG',false);addFlow('BLUE GK RETURNS TO GOAL','good');if(discarded==='DEFENSE'){setScore(0,1);setBall('BKG');addFlow('NO DEFENSE LEFT → AUTOMATIC GOAL','bad');typeText('You legally discarded DEFENSE to pay the return cost. BLUE GK is back in goal, but now has no separate DEFENSE card, so GREEN scores automatically. Soccer still ends with BLUE GK. This is why keeping a DEFENSE can matter when the Goalkeeper joins the attack.',false);clearActions();btn('CONTINUE',()=>complete('GREEN GOAL · SOCCER → BLUE GK'));return}typeText('BLUE GK is back, but the return discard did not count as DEFENSE. Your DEFENSE card is still in hand. Tap it now, then use either official Goalkeeper Duel method: Rock-Paper-Scissors or Left / Center / Right.',false);askCard('DEFENSE','Tap the remaining DEFENSE card to defend the goal.',()=>{addFlow('GK DEFENSE → CHOOSE DUEL','good');complete('GK ATTACK RISK COMPLETE')},'BLUE GK PLAYS DEFENSE')},'BLUE GK DISCARDS 1 TO RETURN')";
  if(!src.includes(from))throw new Error('GK return patch target not found');
  src=src.replace(from,to);
  (0,eval)(src+'\n//# sourceURL=match-tutorial-v10-runtime.js');
}catch(err){fail(err&&err.message?err.message:String(err));}
})();