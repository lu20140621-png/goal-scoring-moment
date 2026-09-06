(() => {
'use strict';

const $ = id => document.getElementById(id);
const START = ['DEFENSE','DRIBBLE','SHOOT','YELLOW','TACKLE'];
const IMG = {
  DEFENSE:'images/defense-card.webp',
  DRIBBLE:'images/dribble%20past-card.webp',
  SHOOT:'images/shoot-card.webp',
  YELLOW:'images/yellow-card.webp',
  TACKLE:'images/tackle.webp?v=20260904tackle2'
};

let lessonNo = 0;
let finalMode = false;
let finalPhase = 'idle';
let handCards = [...START];
let otherCounts = [0,4,5,3];
let drawHandled = false;
let opponentShootApplied = false;
let changeTimer = 0;

function addStyle(){
  if(document.getElementById('casualHandSyncStyle')) return;
  const s=document.createElement('style');
  s.id='casualHandSyncStyle';
  s.textContent=`
    #liveHandCount{font-weight:950;color:#ffd456;margin-left:auto}
    .cardBtn.handGained{animation:handGain .7s ease both}
    .cardBtn.handLeaving{opacity:.32;transform:translateY(-9px) scale(.92);transition:.42s ease}
    @keyframes handGain{0%{opacity:0;transform:translateY(-26px) scale(.72)}55%{opacity:1;transform:translateY(5px) scale(1.08)}100%{opacity:1;transform:none}}
  `;
  document.head.appendChild(s);
}

function ensureBadge(){
  const top=document.querySelector('.actionTop');
  if(!top) return null;
  let badge=$('liveHandCount');
  if(!badge){
    badge=document.createElement('span');
    badge.id='liveHandCount';
    badge.className='actionHint';
    top.insertBefore(badge,$('finalBadge')||null);
  }
  return badge;
}

function updateBadge(){
  const b=ensureBadge();
  if(b) b.textContent=`YOUR HAND: ${handCards.length}`;
}

function updateFan(i,count){
  const fan=$('P'+i)?.querySelector('.handFan');
  if(!fan) return;
  fan.innerHTML=Array.from({length:Math.max(0,count)},()=>'<i class="handBack"></i>').join('');
  fan.setAttribute('aria-label',`${count} cards`);
}

function syncFans(){
  updateFan(0,handCards.length);
  for(let i=1;i<4;i++) updateFan(i,otherCounts[i]);
  updateBadge();
}

function addFlowChip(text,kind='neutral'){
  const flow=$('flow');
  if(!flow) return;
  flow.querySelector('.flowEmpty')?.remove();
  const a=document.createElement('div');
  a.className='arrow'; a.textContent='→'; flow.appendChild(a);
  const c=document.createElement('div');
  c.className=`chip ${kind}`; c.textContent=text; flow.appendChild(c);
  flow.scrollLeft=flow.scrollWidth;
}

function cardNode(name,gained=false){
  const b=document.createElement('button');
  b.className=`cardBtn${gained?' handGained':''}`;
  b.dataset.card=name;
  b.setAttribute('aria-label',`Card in your hand: ${name==='DRIBBLE'?'DRIBBLE PAST':name}`);
  const img=document.createElement('img');
  img.src=IMG[name]; img.alt=name;
  b.appendChild(img);
  return b;
}

function removeVisualCard(name,chipIt=true){
  const hand=$('hand');
  if(!hand) return;
  const node=[...hand.querySelectorAll('.cardBtn[data-card]')].find(x=>x.dataset.card===name);
  const idx=handCards.indexOf(name);
  if(idx<0 || !node) return;
  const before=handCards.length;
  handCards.splice(idx,1);
  node.classList.add('handLeaving');
  setTimeout(()=>node.remove(),180);
  syncFans();
  if(chipIt) addFlowChip(`YOUR HAND ${before} → ${handCards.length}`,'neutral');
}

function addVisualCard(name,chipIt=true){
  const hand=$('hand');
  if(!hand) return;
  const before=handCards.length;
  handCards.push(name);
  hand.appendChild(cardNode(name,true));
  syncFans();
  if(chipIt) addFlowChip(`YOUR HAND ${before} → ${handCards.length}`,'good');
}

function rebuildFinalHand(){
  const hand=$('hand');
  if(!hand) return;
  handCards=[...START];
  hand.innerHTML='';
  START.forEach(n=>hand.appendChild(cardNode(n,false)));
  syncFans();
}

function clearVisualHand(){
  handCards=[];
  if($('hand')) $('hand').innerHTML='';
  syncFans();
}

function changeOther(i,delta,kind='good'){
  if(i<=0 || i>3) return;
  const before=otherCounts[i];
  otherCounts[i]=Math.max(0,before+delta);
  updateFan(i,otherCounts[i]);
  addFlowChip(`${i===1?'PLAYER 2':i===2?'PLAYER 3':'PLAYER 4'} HAND ${before} → ${otherCounts[i]}`,kind);
}

function parseLesson(){
  const text=$('lessonName')?.textContent||'';
  const isFinal=text.includes('FINAL CHALLENGE');
  const m=text.match(/LESSON\s+(\d+)\/9/);
  return {text,isFinal,no:m?Number(m[1]):(isFinal?9:0)};
}

function syncLesson(force=false){
  const p=parseLesson();
  if(!force && p.text===syncLesson.last) return;
  syncLesson.last=p.text;
  lessonNo=p.no;
  finalMode=p.isFinal;
  finalPhase=finalMode?'peek':'idle';
  handCards=[...START];
  otherCounts=[0,4,5,3];
  drawHandled=false;
  opponentShootApplied=false;
  setTimeout(()=>{
    if(finalMode){
      rebuildFinalHand();
    }else{
      handCards=[...START];
      syncFans();
    }
  },0);
}

function expectedCard(){
  return {4:'DEFENSE',5:'DRIBBLE',6:'SHOOT',7:'YELLOW',8:'TACKLE'}[lessonNo]||'';
}

function handleFrontBubble(e){
  if(finalMode) return;

  const card=e.target.closest?.('.cardBtn[data-card]');
  if(card){
    const name=card.dataset.card;
    if(name===expectedCard()){
      setTimeout(()=>removeVisualCard(name,true),545);
    }
    return;
  }

  const target=e.target.closest?.('#targetModal .targetBtn');
  if(target && lessonNo===6){
    const i=Number(target.dataset.player);
    setTimeout(()=>{
      if(i===0){
        addVisualCard('TACKLE',true);
        addFlowChip('SHOOT DRAW → CARD ADDED TO YOUR HAND','good');
      }else{
        changeOther(i,1,'good');
        addFlowChip('SHOOT DRAW → TARGET HAND +1','good');
      }
    },570);
    return;
  }

  if(target && lessonNo===8){
    const i=Number(target.dataset.player);
    if(i>0){
      setTimeout(()=>{
        changeOther(i,-1,'warn');
        addVisualCard('YELLOW',true);
        addFlowChip('TACKLE → STOLEN CARD ADDED TO YOUR HAND','good');
      },570);
    }
    return;
  }

  const drawBtn=e.target.closest?.('#actions .actionBtn');
  if(lessonNo===2 && drawBtn && /DRAW 1 CARD/i.test(drawBtn.textContent||'') && !drawHandled){
    drawHandled=true;
    setTimeout(()=>{
      addVisualCard('TACKLE',true);
      addFlowChip('DRAW → CARD ADDED TO YOUR HAND','good');
    },570);
  }
}

function handleFinalCapture(e){
  if(!finalMode) return;

  const card=e.target.closest?.('.cardBtn[data-card]');
  const target=e.target.closest?.('#targetModal .targetBtn');
  const draw=e.target.closest?.('#finalRoundDraw,#drawPile');

  if(card){
    const name=card.dataset.card;
    if(finalPhase==='peek' && name==='DRIBBLE'){
      setTimeout(()=>removeVisualCard('DRIBBLE',true),545);
      finalPhase='decide';
    }else if(finalPhase==='decide' && name==='SHOOT'){
      setTimeout(()=>removeVisualCard('SHOOT',true),545);
      finalPhase='target';
    }
    return;
  }

  if(target && finalPhase==='target'){
    const i=Number(target.dataset.player);
    if(i===0){
      finalPhase='resetting';
      setTimeout(()=>clearVisualHand(),700);
      setTimeout(()=>{rebuildFinalHand(); finalPhase='peek';},2900);
    }else{
      finalPhase='finish';
    }
    return;
  }

  if(draw){
    const label=(draw.textContent||'').toUpperCase();
    if(finalPhase==='finish' || label.includes('DRAW 1 TO END TURN')){
      finalPhase='done';
      setTimeout(()=>{
        addVisualCard('TACKLE',true);
        addFlowChip('END-OF-TURN DRAW → CARD ADDED TO YOUR HAND','good');
      },570);
    }else if(finalPhase==='peek' || finalPhase==='decide'){
      finalPhase='resetting';
      setTimeout(()=>clearVisualHand(),700);
      setTimeout(()=>{rebuildFinalHand(); finalPhase='peek';},2900);
    }
  }
}

document.addEventListener('click',handleFinalCapture,true);
document.addEventListener('click',handleFrontBubble,false);

const flowObserver=new MutationObserver(()=>{
  if(finalMode || lessonNo!==7 || opponentShootApplied) return;
  const text=$('flow')?.textContent||'';
  if(text.includes('PLAYER 2 PLAYS SHOOT')){
    opponentShootApplied=true;
    setTimeout(()=>{
      changeOther(1,-1,'warn');
      addFlowChip('PLAYER 2 PLAYED SHOOT → CARD LEFT THEIR HAND','warn');
    },80);
  }
});
if($('flow')) flowObserver.observe($('flow'),{subtree:true,childList:true,characterData:true});

const lessonObserver=new MutationObserver(()=>{
  clearTimeout(changeTimer);
  changeTimer=setTimeout(()=>syncLesson(),0);
});
if($('lessonName')) lessonObserver.observe($('lessonName'),{subtree:true,childList:true,characterData:true});

addStyle();
ensureBadge();
syncLesson(true);
})();