(()=>{
'use strict';
const $=id=>document.getElementById(id);
const replacements=new Map([
  ['Each field Player draws 1: SHOOT = +1, everything else = 0.','Resolve four paired draws: GREEN 1 vs BLUE GK, GREEN 2 vs BLUE GK, BLUE 1 vs GREEN GK, and BLUE 2 vs GREEN GK.'],
  ['Each Goalkeeper draws 1: DEFENSE = -1 against the opponent total, everything else = 0.','The opposing Goalkeeper draws a fresh card for EACH opposing field Player. In 3v3, each Goalkeeper draws twice — one fresh draw against each opposing field Player. DEFENSE = -1 on that paired draw; every other card = 0.'],
  ['Higher total wins. If tied again, reshuffle all 51 and repeat.','Add the two paired results for each team. Higher total wins. If tied again, collect and reshuffle all 51, then repeat all four paired draws.']
]);
function syncLesson(){
  const title=$('lessonTitle'),note=$('note');if(!title||!note)return;
  if(title.textContent.includes('SETUP & FIRST POSSESSION'))note.textContent='3v3 · public roles · 8 cards each · 3 extras discarded · the 10-minute clock includes trading. GK YELLOW has no defending use at the goal, so trade it to D1/D2 before locking if you want to avoid a dead defensive card.';
  if(title.textContent.includes('GOALKEEPER FLOW'))note.textContent='At GK, field-line defensive YELLOW is over. A Goalkeeper cannot use YELLOW while defending the goal. After the GK receives Soccer and becomes an attacker, a GK who SHOOTs may use YELLOW offensively against the current defender’s TACKLE / YELLOW.';
  if(title.textContent.includes('PENALTY SHOOTOUT'))note.textContent='Tie-break uses four paired draws: GREEN 1 vs BLUE GK, GREEN 2 vs BLUE GK, BLUE 1 vs GREEN GK, BLUE 2 vs GREEN GK. Each field Player draws once; each opposing Goalkeeper draws a fresh card twice.';
}
function syncCoach(){const c=$('coachText');if(!c)return;const r=replacements.get(c.textContent);if(r)c.textContent=r}
window.addEventListener('DOMContentLoaded',()=>{
  const title=$('lessonTitle'),coach=$('coachText'),actions=$('actions');
  if(title)new MutationObserver(syncLesson).observe(title,{childList:true,subtree:true,characterData:true});
  if(coach)new MutationObserver(syncCoach).observe(coach,{childList:true,subtree:true,characterData:true});
  if(actions)actions.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||b.textContent.trim()!=='SHUFFLE ALL 51')return;
    setTimeout(()=>{
      if(!$('lessonTitle')?.textContent.includes('PENALTY SHOOTOUT'))return;
      $('flow').innerHTML=['GREEN 1 DRAW ↔ BLUE GK DRAW','GREEN 2 DRAW ↔ BLUE GK FRESH DRAW','BLUE 1 DRAW ↔ GREEN GK DRAW','BLUE 2 DRAW ↔ GREEN GK FRESH DRAW'].map((x,i)=>`<span class="chip ${i%2?'bad':'good'}">${x}</span>`).join('');
      $('coachText').textContent='Each field Player gets a separate paired draw against the opposing Goalkeeper. The Goalkeeper draws a NEW card for each opponent: BLUE GK draws once against GREEN 1 and again against GREEN 2; GREEN GK does the same against BLUE 1 and BLUE 2.';
    },0)
  });
  syncLesson();syncCoach();
});
})();
