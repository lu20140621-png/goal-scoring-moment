(()=>{
'use strict';
let savedPick=null;
const $=s=>document.querySelector(s);
const isTrade=()=>$('#phaseTitle')?.textContent.trim()==='TEAM TRADE';

function ensureStatus(){
  let box=document.getElementById('tradePickStatus');
  if(box)return box;
  const tabs=document.getElementById('handTabs');
  if(!tabs)return null;
  box=document.createElement('div');
  box.id='tradePickStatus';
  box.style.cssText='margin:0 0 9px;padding:8px 10px;border-radius:11px;border:1px solid #69c987;background:#082718;color:#e8f7eb;font-size:10px;font-weight:850;line-height:1.45;display:none';
  tabs.insertAdjacentElement('afterend',box);
  return box;
}

function ownerName(id){
  if(id==='BKG')return 'BLUE GK';
  if(id==='B1')return 'BLUE 1';
  if(id==='B2')return 'BLUE 2';
  return id||'';
}

function paintStatus(){
  const box=ensureStatus();
  if(!box)return;
  if(!savedPick||!isTrade()){
    box.style.display='none';
    box.textContent='';
    return;
  }
  box.style.display='block';
  box.innerHTML=`FIRST PICK: <b>${ownerName(savedPick.owner)} · ${savedPick.card}</b><br>Now open another teammate's hand and choose the card to swap.`;
}

function restorePick(){
  if(!savedPick||!isTrade()||typeof savedPick.invoke!=='function')return;
  savedPick.invoke();
  paintStatus();
}

document.addEventListener('click',e=>{
  if(!isTrade())return;

  const card=e.target.closest('#cards .card');
  if(card){
    const owner=card.dataset.owner;
    const cardName=card.dataset.card;
    const invoke=card.onclick;
    if(!savedPick){
      savedPick={owner,card:cardName,invoke};
    }else if(savedPick.owner===owner){
      savedPick={owner,card:cardName,invoke};
    }else{
      savedPick=null;
    }
    setTimeout(paintStatus,0);
    return;
  }

  const tab=e.target.closest('#handTabs .tab');
  if(tab&&savedPick){
    setTimeout(restorePick,0);
    return;
  }

  const action=e.target.closest('#actions .action');
  if(action&&(/LOCK TEAM|AUTO BALANCE/i.test(action.textContent||''))){
    savedPick=null;
    setTimeout(paintStatus,0);
  }
});

const obs=new MutationObserver(()=>{
  if(isTrade())paintStatus();
  else if(savedPick){savedPick=null;paintStatus()}
});
const phase=document.getElementById('phaseTitle');
if(phase)obs.observe(phase,{childList:true,subtree:true,characterData:true});
ensureStatus();
})();
