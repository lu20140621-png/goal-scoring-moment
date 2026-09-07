(()=>{
'use strict';
const $=id=>document.getElementById(id);
const replace=new Map([
['GREEN 1 draws 1 card and BLUE GK draws 1 fresh card against GREEN 1.','The shootout uses up to 5 rounds. GREEN takes a penalty, then BLUE takes the matching penalty for that round.'],
['GREEN 2 draws 1 card and BLUE GK draws a second fresh card against GREEN 2.','For this 3v3 version, the five-kick order is D1, D2, D1, D2, D1 for both teams.'],
['Then BLUE 1 draws against a fresh GREEN GK draw, and BLUE 2 draws against another fresh GREEN GK draw.','Every single penalty is a fresh duel: the kicker draws 1 card and the opposing Goalkeeper draws a brand-new 1 card.'],
['A duel scores 1 goal only when the field Player draws SHOOT and the opposing GK does NOT draw DEFENSE. Otherwise that duel scores 0. Scores never go negative.','A penalty scores only when the kicker draws SHOOT and the opposing Goalkeeper does NOT draw DEFENSE. Otherwise it is a MISS or SAVE worth 0.'],
['After all four duels, higher shootout score wins. If tied, collect and reshuffle all 51 and repeat all four duels.','Keep a running score. If one team becomes mathematically impossible to catch, the shootout ends early. If tied after 5 kicks each, continue to sudden death.']
]);
function sync(){
  const title=$('lessonTitle'),note=$('note'),coach=$('coachText');
  if(!title||!title.textContent.includes('PENALTY SHOOTOUT'))return;
  if(note)note.textContent='Real-style shootout: up to 5 kicks per team, alternating kicks, early clinch, then sudden death if still tied.';
  if(coach&&replace.has(coach.textContent))coach.textContent=replace.get(coach.textContent);
}
function afterShuffle(){
  if(!$('lessonTitle')?.textContent.includes('PENALTY SHOOTOUT'))return;
  const f=$('flow');if(f)f.innerHTML=['ROUND 1 · GREEN ↔ BLUE','ROUND 2 · GREEN ↔ BLUE','ROUND 3 · GREEN ↔ BLUE','ROUND 4 · GREEN ↔ BLUE','ROUND 5 · GREEN ↔ BLUE','TIED? → SUDDEN DEATH'].map((x,i)=>`<span class="chip ${i===5?'bad':'good'}">${x}</span>`).join('');
  const c=$('coachText');if(c)c.textContent='Five-round rule: teams alternate one penalty at a time and keep a running total. Each penalty uses a fresh kicker draw and fresh opposing-GK draw. The shootout may end early when the trailing team cannot catch up. If still tied after five kicks each, play sudden-death pairs until one scores and the other does not.';
  const buttons=[...document.querySelectorAll('#actions button')];for(const b of buttons)if(b.textContent.trim()==='FINISH')b.textContent='FINISH 5-ROUND RULE';
}
window.addEventListener('DOMContentLoaded',()=>{
  const title=$('lessonTitle'),coach=$('coachText'),actions=$('actions');
  if(title)new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});
  if(coach)new MutationObserver(sync).observe(coach,{childList:true,subtree:true,characterData:true});
  if(actions)actions.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.textContent.trim()==='SHUFFLE ALL 51')setTimeout(afterShuffle,0)});
  sync();
});
})();
