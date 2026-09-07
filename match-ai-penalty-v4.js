(()=>{
'use strict';
const CARD_IMG={SHOOT:'images/shoot-card.webp',DEFENSE:'images/defense-card.webp',TACKLE:'images/tackle.webp?v=20260904tackle2',DRIBBLE:'images/dribble%20past-card.webp',YELLOW:'images/yellow-card.webp'};
const FULL_DECK=[...Array(10).fill('SHOOT'),...Array(12).fill('DEFENSE'),...Array(10).fill('TACKLE'),...Array(10).fill('DRIBBLE'),...Array(9).fill('YELLOW')];
const $=id=>document.getElementById(id);
const KICKERS={green:['GREEN 1','GREEN 2','GREEN 1','GREEN 2','GREEN 1'],blue:['BLUE 1','BLUE 2','BLUE 1','BLUE 2','BLUE 1']};
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let deck=[];
function freshDeck(){deck=shuffle(FULL_DECK)}
function draw(){if(deck.length<2)freshDeck();return deck.pop()}
function card(owner,card,role){const tag=role==='kicker'?(card==='SHOOT'?'SHOT':'MISS CARD'):(card==='DEFENSE'?'SAVE':'NO SAVE');return `<div class="penDraw"><img src="${CARD_IMG[card]}" alt="${card}"><div><b>${owner}</b><br>${card} · ${tag}</div></div>`}
function kickResult(team,kickNo,kicker,att,gk){const goal=att==='SHOOT'&&gk!=='DEFENSE';const keeper=team==='green'?'BLUE GK':'GREEN GK';return {team,kickNo,kicker,keeper,att,gk,goal}}
function resultHtml(r){return `<div class="penKick ${r.goal?'goal':'miss'}"><h4>${r.team.toUpperCase()} · KICK ${r.kickNo}</h4><div class="penPairCards">${card(r.kicker,r.att,'kicker')}${card(r.keeper,r.gk,'gk')}</div><b>${r.goal?'GOAL':'NO GOAL'}</b></div>`}
function runShootout(){
  const modal=$('modal'),title=$('modalTitle'),text=$('modalText'),actions=$('modalActions');if(!modal||!title||!text||!actions)return;
  freshDeck();
  const state={blue:0,green:0,blueTaken:0,greenTaken:0,turn:'green',sudden:false,suddenRound:0,history:[],done:false};
  function remaining(t){return Math.max(0,5-state[t+'Taken'])}
  function clinched(){if(state.green>state.blue+remaining('blue'))return 'green';if(state.blue>state.green+remaining('green'))return 'blue';return null}
  function render(message=''){title.textContent=state.sudden?`PENALTY SHOOTOUT · SUDDEN DEATH ${state.suddenRound||1}`:'PENALTY SHOOTOUT · BEST OF 5';text.innerHTML=`<p><b>Real-style 5-round shootout.</b> Teams alternate kicks. Every kick is a fresh duel: kicker draws 1 card and the opposing Goalkeeper draws 1 fresh card.</p><div class="penScore"><b>BLUE ${state.blue}</b><span>—</span><b>${state.green} GREEN</b></div>${message?`<p class="penMessage">${message}</p>`:''}<div class="penHistory">${state.history.slice(-6).map(resultHtml).join('')}</div><p><b>GOAL:</b> kicker draws SHOOT and opposing GK does not draw DEFENSE. Otherwise = no goal. Main five kicks use D1, D2, D1, D2, D1 for each team.</p>`;actions.innerHTML=''}
  function finish(winner,why){state.done=true;render(`${why}<br><b>${winner.toUpperCase()} WINS ${state.blue}–${state.green}</b>`);const again=document.createElement('button');again.className='action';again.textContent='PLAY AGAIN';again.onclick=()=>location.reload();const menu=document.createElement('button');menu.className='action dark';menu.textContent='MATCH MENU';menu.onclick=()=>location.href='match.html';actions.append(again,menu)}
  function takeKick(){if(state.done)return;const team=state.turn;let kickNo,kicker;if(!state.sudden){state[team+'Taken']++;kickNo=state[team+'Taken'];kicker=KICKERS[team][kickNo-1]}else{kickNo=state.suddenRound;kicker=team==='green'?'GREEN 1':'BLUE 1'}const att=draw(),gk=draw(),r=kickResult(team,kickNo,kicker,att,gk);state.history.push(r);if(r.goal)state[team]++;
    if(!state.sudden){const winner=clinched();if(winner){finish(winner,`The other team cannot mathematically catch up with its remaining kicks.`);return}
      if(state.greenTaken===5&&state.blueTaken===5){if(state.green!==state.blue){finish(state.green>state.blue?'green':'blue','Five kicks each are complete.');return}state.sudden=true;state.suddenRound=1;state.turn='green';render('Five kicks each are tied. Sudden death begins: both teams take one kick per round.');nextButton('START SUDDEN DEATH');return}
      state.turn=team==='green'?'blue':'green';render(`${r.kicker}: ${r.goal?'GOAL':'NO GOAL'}.`);nextButton(`${state.turn.toUpperCase()} NEXT KICK`);return}
    if(team==='green'){state.turn='blue';render(`GREEN sudden-death kick: ${r.goal?'GOAL':'NO GOAL'}. BLUE must now take its matching kick.`);nextButton('BLUE MATCHING KICK');return}
    const greenLast=state.history[state.history.length-2],blueLast=r;if(!!greenLast.goal!==!!blueLast.goal){finish(greenLast.goal?'green':'blue',`Sudden death round ${state.suddenRound}: one team scored and the other did not.`);return}
    state.suddenRound++;state.turn='green';render(`Sudden death remains tied after round ${state.suddenRound-1}.`);nextButton('NEXT SUDDEN-DEATH ROUND')
  }
  function nextButton(label){const b=document.createElement('button');b.className='action';b.textContent=label;b.onclick=takeKick;actions.appendChild(b)}
  render('GREEN takes the first kick.');nextButton('GREEN · KICK 1');modal.classList.add('on')
}
function detect(){const modal=$('modal'),title=$('modalTitle');if(!modal||!title||!modal.classList.contains('on'))return;if(title.textContent.startsWith('PENALTY SHOOTOUT')&&!modal.dataset.realPenaltyV4){modal.dataset.realPenaltyV4='1';runShootout()}if(!title.textContent.startsWith('PENALTY SHOOTOUT'))delete modal.dataset.realPenaltyV4}
const obs=new MutationObserver(detect);
window.addEventListener('DOMContentLoaded',()=>{const modal=$('modal');if(modal)obs.observe(modal,{attributes:true,childList:true,subtree:true,characterData:true});const style=document.createElement('style');style.textContent='.penScore{display:flex;justify-content:center;gap:18px;align-items:center;font-size:22px;font-weight:1000;margin:12px 0}.penHistory{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:360px;overflow:auto}.penKick{padding:10px;border-radius:12px;background:#0a2a19;border:1px solid #4e9b68}.penKick.goal{box-shadow:inset 0 0 0 1px #b9ff70}.penKick.miss{opacity:.9}.penKick h4{margin:0 0 7px}.penPairCards{display:grid;grid-template-columns:1fr 1fr;gap:6px}.penMessage{padding:9px;border-radius:10px;background:#102f1c}.penKick.goal>b{color:#c9ff26}.penKick.miss>b{color:#ffd37a}@media(max-width:620px){.penHistory{grid-template-columns:1fr}}';document.head.appendChild(style)});
})();
