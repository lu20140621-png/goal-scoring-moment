(()=>{
'use strict';
const $=id=>document.getElementById(id);
function syncNote(){
  const title=$('lessonTitle'),note=$('note');if(!title||!note)return;
  if(title.textContent.includes('TACKLE WINS SOCCER')){
    note.textContent='TACKLE changes possession. VERY IMPORTANT: after any successful TACKLE turnover, the old attack is over. If the new ballholder later plays SHOOT, the new attack always starts at the opponent’s Defender 1 — never at Defender 2 or Goalkeeper.';
  }
}
function syncCoach(){
  const title=$('lessonTitle'),coach=$('coachText');if(!title||!coach||!title.textContent.includes('TACKLE WINS SOCCER'))return;
  if(coach.textContent.startsWith('Good. This example matches')){
    coach.textContent='Good. GREEN now owns Soccer. The old attack is completely over. If GREEN attacks next, the new SHOOT starts at BLUE Defender 1, then BLUE Defender 2, then BLUE Goalkeeper. A TACKLE turnover never resumes from the line where Soccer was won.';
    const flow=$('flow');if(flow&&!flow.textContent.includes('NEW SHOOT → OPPONENT D1'))flow.insertAdjacentHTML('beforeend','<span class="chip good">NEW SHOOT → OPPONENT D1</span>');
  }
}
window.addEventListener('DOMContentLoaded',()=>{
  const title=$('lessonTitle'),coach=$('coachText');
  if(title)new MutationObserver(()=>{syncNote();syncCoach()}).observe(title,{childList:true,subtree:true,characterData:true});
  if(coach)new MutationObserver(syncCoach).observe(coach,{childList:true,subtree:true,characterData:true});
  syncNote();syncCoach();
});
})();
