(()=>{
'use strict';
const ids=['B1','B2','BKG','G1','G2','GKG'];
const sync=()=>ids.forEach(id=>{
  const el=document.querySelector(`#${id} .handCount`);
  if(el)el.textContent='8 START';
});
sync();
const field=document.querySelector('.field');
if(field){
  const note=document.createElement('div');
  note.className='notice';
  note.style.marginTop='10px';
  note.textContent='REAL 3v3 DEAL: every player starts with exactly 8 Action Cards. The 3 extra cards are discarded face-down.';
  field.insertAdjacentElement('afterend',note);
}
const obs=new MutationObserver(sync);
ids.forEach(id=>{
  const el=document.querySelector(`#${id} .handCount`);
  if(el)obs.observe(el,{childList:true,characterData:true,subtree:true});
});
})();
