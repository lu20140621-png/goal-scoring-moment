(()=>{
'use strict';
const CARD_IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const FULL_DECK=[...Array(10).fill('SHOOT'),...Array(12).fill('DEFENSE'),...Array(10).fill('TACKLE'),...Array(10).fill('DRIBBLE'),...Array(9).fill('YELLOW')];
const $=id=>document.getElementById(id);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function cardBox(owner,card,role){const score=role==='field'?(card==='SHOOT'?'+1':'0'):(card==='DEFENSE'?'-1':'0');return `<div class="penDraw"><img src="${CARD_IMG[card]}" alt="${card}"><div><b>${owner}</b><br>${card} · ${score}</div></div>`}
function duel(label,attacker,keeper,attCard,gkCard){const value=(attCard==='SHOOT'?1:0)-(gkCard==='DEFENSE'?1:0);return `<div class="penPair"><h4>${label}</h4><div class="penPairCards">${cardBox(attacker,attCard,'field')}${cardBox(keeper,gkCard,'gk')}</div><b>DUEL TOTAL ${value}</b></div>`}
function runPairedPenalty(round=1){
  const modal=$('modal'),title=$('modalTitle'),text=$('modalText'),actions=$('modalActions');if(!modal||!title||!text||!actions)return;
  const d=shuffle(FULL_DECK);const g1=d.pop(),bgk1=d.pop(),g2=d.pop(),bgk2=d.pop(),b1=d.pop(),ggk1=d.pop(),b2=d.pop(),ggk2=d.pop();
  const green=(g1==='SHOOT'?1:0)-(bgk1==='DEFENSE'?1:0)+(g2==='SHOOT'?1:0)-(bgk2==='DEFENSE'?1:0);
  const blue=(b1==='SHOOT'?1:0)-(ggk1==='DEFENSE'?1:0)+(b2==='SHOOT'?1:0)-(ggk2==='DEFENSE'?1:0);
  title.textContent=`PENALTY SHOOTOUT · ROUND ${round}`;
  text.innerHTML=`<p><b>Paired draw rule:</b> each field Player draws 1 card, and the opposing Goalkeeper draws a fresh card against that Player. In 3v3, each Goalkeeper therefore draws twice.</p><div class="penPairGrid">${duel('GREEN 1 vs BLUE GK','GREEN 1','BLUE GK',g1,bgk1)}${duel('GREEN 2 vs BLUE GK','GREEN 2','BLUE GK',g2,bgk2)}${duel('BLUE 1 vs GREEN GK','BLUE 1','GREEN GK',b1,ggk1)}${duel('BLUE 2 vs GREEN GK','BLUE 2','GREEN GK',b2,ggk2)}</div><div class="penTotals"><b>BLUE ${blue}</b><span>—</span><b>${green} GREEN</b></div><p>Field Player: SHOOT = +1. Opposing Goalkeeper: DEFENSE = -1 on that paired draw. Every other card = 0.</p>`;
  actions.innerHTML='';const b=document.createElement('button');b.className='action';
  if(blue===green){b.textContent='TIED · RESHUFFLE ALL 51 & DRAW AGAIN';b.onclick=()=>runPairedPenalty(round+1)}else{b.textContent='SHOW WINNER';b.onclick=()=>{title.textContent='MATCH WINNER';text.innerHTML=`<b>${blue>green?'BLUE':'GREEN'} wins the penalty shootout, ${Math.max(blue,green)} to ${Math.min(blue,green)}.</b>`;actions.innerHTML='';const again=document.createElement('button');again.className='action';again.textContent='PLAY AGAIN';again.onclick=()=>location.reload();const menu=document.createElement('button');menu.className='action dark';menu.textContent='MATCH MENU';menu.onclick=()=>location.href='match.html';actions.append(again,menu)}}
  actions.appendChild(b);
}
function detect(){const modal=$('modal'),title=$('modalTitle');if(!modal||!title||!modal.classList.contains('on'))return;if(title.textContent.startsWith('PENALTY SHOOTOUT')&&!modal.dataset.pairedPenalty){modal.dataset.pairedPenalty='1';const m=title.textContent.match(/(?:DRAW|ROUND)\s+(\d+)/i);runPairedPenalty(m?Number(m[1]):1)}if(!title.textContent.startsWith('PENALTY SHOOTOUT'))delete modal.dataset.pairedPenalty}
const obs=new MutationObserver(()=>detect());
window.addEventListener('DOMContentLoaded',()=>{const modal=$('modal');if(modal)obs.observe(modal,{attributes:true,childList:true,subtree:true,characterData:true});const style=document.createElement('style');style.textContent='.penPairGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.penPair{padding:10px;border-radius:12px;background:#0a2a19;border:1px solid #4e9b68}.penPair h4{margin:0 0 8px}.penPairCards{display:grid;grid-template-columns:1fr 1fr;gap:6px}.penTotals{display:flex;justify-content:center;gap:14px;align-items:center;font-size:18px;margin:12px 0;font-weight:900}@media(max-width:620px){.penPairGrid{grid-template-columns:1fr}.penPairCards{grid-template-columns:1fr 1fr}}';document.head.appendChild(style)});
})();
