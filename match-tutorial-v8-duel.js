(()=>{
'use strict';
const $=id=>document.getElementById(id);
function patchGoalkeeperLesson(){
  const title=$('lessonTitle'),note=$('note'),coach=$('coachText');if(!title||!title.textContent.includes('GOALKEEPER FLOW'))return;
  if(note)note.textContent='At GK, field-line YELLOW ends. If GK plays DEFENSE, choose either official duel: RPS or Left / Center / Right. Soccer ends with the defending GK after every GK-stage result.';
  if(coach){
    const t=coach.textContent;
    if(t.includes('Rock-Paper-Scissors')||t.includes('RPS')) coach.textContent=t
      .replace('shooter and GK play Rock-Paper-Scissors. GK wins = SAVE; shooter wins = GOAL +1; tie = repeat.','choose either official duel. RPS: shooter wins = GOAL, Goalkeeper wins = SAVE, tie = repeat. Left / Center / Right: both call at the same time; SAME = SAVE, DIFFERENT = GOAL.')
      .replace('A separate DEFENSE is still required for the normal GK RPS save.','A separate DEFENSE is still required for the normal Goalkeeper Duel.');
  }
  const actions=$('actions');if(actions&&!actions.querySelector('[data-dual-note]')){
    const n=document.createElement('div');n.dataset.dualNote='1';n.className='dualTutorNote';n.innerHTML='<b>2 OFFICIAL GK DUELS</b><span>RPS: shooter wins = GOAL · GK wins = SAVE · tie repeats</span><span>LEFT / CENTER / RIGHT: SAME = SAVE · DIFFERENT = GOAL</span>';
    actions.prepend(n);
  }
}
function patchPenaltyLesson(){
  const title=$('lessonTitle'),note=$('note'),coach=$('coachText'),actions=$('actions'),flow=$('flow');if(!title||!title.textContent.includes('PENALTY SHOOTOUT'))return;
  if(note)note.textContent='Best of 5. Teams alternate penalties. Each penalty uses either official Goalkeeper Duel: RPS or Left / Center / Right. No card draw decides the penalty.';
  if(coach){
    const t=coach.textContent;
    if(/draw|51|SHOOT|DEFENSE|shuffle/i.test(t)) coach.textContent='Penalty Shootout uses the same two official Goalkeeper Duel methods. Choose RPS or Left / Center / Right. RPS: shooter wins = GOAL, Goalkeeper wins = SAVE, tie repeats. Direction duel: both call Left, Center, or Right at the same time; SAME = SAVE, DIFFERENT = GOAL.';
  }
  if(flow)flow.innerHTML=['ROUND 1','ROUND 2','ROUND 3','ROUND 4','ROUND 5','TIED? → SUDDEN DEATH'].map((x,i)=>`<span class="chip ${i===5?'bad':'good'}">${x}</span>`).join('');
  if(actions){
    const old=[...actions.querySelectorAll('button')];
    if(old.some(b=>/SHUFFLE ALL 51|FINISH 5-ROUND RULE/i.test(b.textContent))||!actions.dataset.dualPenalty){
      actions.dataset.dualPenalty='1';actions.innerHTML='';
      const box=document.createElement('div');box.className='dualPenaltyTutor';box.innerHTML='<div><b>✊ ✋ ✌️ RPS</b><span>Shooter wins → GOAL<br>Goalkeeper wins → SAVE<br>Tie → repeat</span></div><div><b>🥅 LEFT · CENTER · RIGHT</b><span>Same call → SAVE<br>Different calls → GOAL</span></div>';
      const done=document.createElement('a');done.className='action green';done.href='match.html?v=20260909m21';done.textContent='FINISH TUTORIAL →';actions.append(box,done);
    }
  }
}
function sync(){patchGoalkeeperLesson();patchPenaltyLesson()}
window.addEventListener('DOMContentLoaded',()=>{
  const title=$('lessonTitle'),coach=$('coachText'),actions=$('actions');
  if(title)new MutationObserver(()=>setTimeout(sync,0)).observe(title,{childList:true,subtree:true,characterData:true});
  if(coach)new MutationObserver(()=>setTimeout(sync,0)).observe(coach,{childList:true,subtree:true,characterData:true});
  if(actions)new MutationObserver(()=>setTimeout(sync,0)).observe(actions,{childList:true,subtree:true});
  const style=document.createElement('style');style.textContent='.dualTutorNote{width:100%;display:grid;gap:4px;padding:9px 11px;border-radius:11px;background:#132f20;border:1px solid #6ca97b;color:#fff}.dualTutorNote b{color:#dfff72;font-size:9px}.dualTutorNote span{font-size:8px;line-height:1.35}.dualPenaltyTutor{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}.dualPenaltyTutor>div{padding:10px;border-radius:12px;background:#0b2c1b;border:1px solid #5b966c}.dualPenaltyTutor b{display:block;color:#dfff72;font-size:10px;margin-bottom:5px}.dualPenaltyTutor span{font-size:8px;line-height:1.45}@media(max-width:620px){.dualPenaltyTutor{grid-template-columns:1fr}}';document.head.appendChild(style);sync();
});
})();