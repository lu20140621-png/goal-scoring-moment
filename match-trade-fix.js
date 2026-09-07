(()=>{
'use strict';
let savedPick=null;
let pendingRestore=false;
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
  box.innerHTML=`FIRST PICK: <b>${ownerName(savedPick.owner)} · ${savedPick.card}</b><br>Open another BLUE teammate and tap the card you want to swap with it.`;
}

function restorePick(){
  pendingRestore=false;
  if(!savedPick||!isTrade()||typeof savedPick.invoke!=='function')return;
  savedPick.invoke();
  paintStatus();
}

// Capture phase is intentional: the original Match script redraws the tabs/cards
// during its own click handlers. Capturing the click first prevents us from
// losing the element before we can preserve the first trade selection.
document.addEventListener('click',e=>{
  if(!isTrade())return;

  const raw=e.target;
  const card=raw.closest?.('.card');
  if(card && card.closest?.('#cards')){
    const owner=card.dataset.owner;
    const cardName=card.dataset.card;
    const invoke=card.onclick;

    if(!savedPick){
      savedPick={owner,card:cardName,invoke};
    }else if(savedPick.owner===owner){
      // Re-picking within the same teammate simply replaces the first choice.
      savedPick={owner,card:cardName,invoke};
    }else{
      // This is the second teammate's card. The original handler will complete
      // the 1-for-1 swap, so clear our visual pick immediately afterwards.
      setTimeout(()=>{
        savedPick=null;
        paintStatus();
      },0);
    }
    setTimeout(paintStatus,0);
    return;
  }

  const tab=raw.closest?.('.tab');
  if(tab && tab.closest?.('#handTabs') && savedPick){
    // The original tab handler clears its internal tradePick while switching
    // hands. Restore the first pick right after that redraw completes.
    if(!pendingRestore){
      pendingRestore=true;
      setTimeout(restorePick,0);
    }
    return;
  }

  const action=raw.closest?.('.action');
  if(action && action.closest?.('#actions') && (/LOCK TEAM|AUTO BALANCE/i.test(action.textContent||''))){
    savedPick=null;
    pendingRestore=false;
    setTimeout(paintStatus,0);
  }
},true);

const obs=new MutationObserver(()=>{
  if(isTrade())paintStatus();
  else if(savedPick){
    savedPick=null;
    pendingRestore=false;
    paintStatus();
  }
});
const phase=document.getElementById('phaseTitle');
if(phase)obs.observe(phase,{childList:true,subtree:true,characterData:true});
ensureStatus();
})();
