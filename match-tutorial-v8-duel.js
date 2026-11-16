(()=>{
'use strict';
// The coach's interactive flow is defined in match-tutorial-v6.js.
// This presentation patch deliberately does not override the coach's buttons.
const $=id=>document.getElementById(id);
function sync(){
  const title=$('lessonTitle'),note=$('note'),actions=$('actions');
  if(!title)return;
  if(title.textContent.includes('GOALKEEPER FLOW')){
    if(note&&/RPS|Rock.Paper|two official/i.test(note.textContent))note.textContent='At the Goalkeeper stage, DEFENSE starts the Left / Center / Right direction duel. Same direction = SAVE; different directions = GOAL.';
  }
  if(title.textContent.includes('PENALTY SHOOTOUT')){
    if(note&&/RPS|draw|either official|both official/i.test(note.textContent))note.textContent='Five penalties per team. Rotate D1 → D2 → GK, then repeat. Use Left / Center / Right only. No Action Cards are drawn.';
  }
  if(actions){
    actions.querySelectorAll('[data-dual-note],.dualPenaltyTutor').forEach(node=>node.remove());
  }
}
window.addEventListener('DOMContentLoaded',()=>{
  const title=$('lessonTitle');
  if(title)new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});
  sync();
});
})();