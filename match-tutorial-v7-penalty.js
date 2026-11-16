(()=>{
'use strict';
// The current Match Mode penalty lesson is implemented in match-tutorial-v6.js.
// Keep this compatibility layer limited to a current-rule summary.
const $=id=>document.getElementById(id);
function sync(){
  const title=$('lessonTitle'),note=$('note');
  if(!title||!title.textContent.includes('PENALTY SHOOTOUT')||!note)return;
  const correct='Five penalties per team, alternating GREEN and BLUE. In 3v3, rotate D1 → D2 → GK before repeating. All kicks use Left / Center / Right; no Action Cards are drawn.';
  if(note.textContent!==correct)note.textContent=correct;
}
window.addEventListener('DOMContentLoaded',()=>{
 const title=$('lessonTitle');
 if(title)new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});
 sync();
});
})();