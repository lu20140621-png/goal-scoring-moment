(()=>{
'use strict';
const $=id=>document.getElementById(id);
const KICKERS={green:['GREEN 1','GREEN 2','GREEN 1','GREEN 2','GREEN 1'],blue:['BLUE 1','BLUE 2','BLUE 1','BLUE 2','BLUE 1']};
const RPS=['rock','paper','scissors'];
const DIR=['left','center','right'];
function rpsHumanWins(h,a){return (h==='rock'&&a==='scissors')||(h==='paper'&&a==='rock')||(h==='scissors'&&a==='paper')}
function runShootout(){
  const modal=$('modal'),title=$('modalTitle'),text=$('modalText'),actions=$('modalActions');if(!modal||!title||!text||!actions)return;
  const state={blue:0,green:0,blueTaken:0,greenTaken:0,turn:'green',sudden:false,suddenRound:0,history:[],done:false};
  function remaining(t){return Math.max(0,5-state[t+'Taken'])}
  function clinched(){if(state.green>state.blue+remaining('blue'))return 'green';if(state.blue>state.green+remaining('green'))return 'blue';return null}
  function currentKick(){const team=state.turn;if(state.sudden)return {team,kickNo:state.suddenRound,kicker:team==='green'?'GREEN 1':'BLUE 1',keeper:team==='green'?'BLUE GK':'GREEN GK'};const kickNo=state[team+'Taken']+1;return {team,kickNo,kicker:KICKERS[team][kickNo-1],keeper:team==='green'?'BLUE GK':'GREEN GK'}}
  function historyHtml(){return state.history.slice(-8).map(r=>`<div class="penKick ${r.goal?'goal':'miss'}"><h4>${r.team.toUpperCase()} · ${r.sudden?'SUDDEN '+r.kickNo:'KICK '+r.kickNo}</h4><div class="duelBadge">${r.method==='rps'?'✊✋✌️ RPS':'🥅 LEFT · CENTER · RIGHT'}</div><p>${r.detail}</p><b>${r.goal?'GOAL':'SAVE / NO GOAL'}</b></div>`).join('')}
  function render(message=''){
    const k=currentKick();title.textContent=state.sudden?`PENALTY SHOOTOUT · SUDDEN DEATH ${state.suddenRound||1}`:'PENALTY SHOOTOUT · BEST OF 5';
    text.innerHTML=`<p><b>Choose either official Goalkeeper Duel method for this penalty.</b> RPS and Left / Center / Right are both valid.</p><div class="penScore"><b>BLUE ${state.blue}</b><span>—</span><b>${state.green} GREEN</b></div>${message?`<p class="penMessage">${message}</p>`:''}<div class="penCurrent"><b>${k.team.toUpperCase()} TO KICK</b><span>${k.kicker} vs ${k.keeper}</span></div><div class="penHistory">${historyHtml()}</div><p><b>RPS:</b> shooter wins = GOAL; Goalkeeper wins = SAVE; tie = repeat. <b>Left / Center / Right:</b> same call = SAVE; different calls = GOAL.</p>`;
    actions.innerHTML='';
  }
  function addButton(label,fn,cls=''){const b=document.createElement('button');b.className='action'+(cls?' '+cls:'');b.textContent=label;b.onclick=fn;actions.appendChild(b)}
  function chooseMethod(message=''){render(message);addButton('✊ ✋ ✌️ USE RPS',()=>startRps());addButton('🥅 USE LEFT · CENTER · RIGHT',()=>startDirection(),'blue')}
  function resolve(goal,method,detail){
    const k=currentKick();if(!state.sudden)state[k.team+'Taken']++;
    state.history.push({...k,goal,method,detail,sudden:state.sudden});if(goal)state[k.team]++;
    if(!state.sudden){
      const winner=clinched();if(winner){finish(winner,'The other team cannot mathematically catch up with its remaining kicks.');return}
      if(state.greenTaken===5&&state.blueTaken===5){if(state.green!==state.blue){finish(state.green>state.blue?'green':'blue','Five kicks each are complete.');return}state.sudden=true;state.suddenRound=1;state.turn='green';chooseMethod('Five kicks each are tied. Sudden death begins. GREEN takes the first kick of the paired round.');return}
      state.turn=k.team==='green'?'blue':'green';chooseMethod(`${k.kicker}: ${goal?'GOAL':'SAVE / NO GOAL'}.`);return
    }
    if(k.team==='green'){state.turn='blue';chooseMethod(`GREEN sudden-death kick: ${goal?'GOAL':'SAVE / NO GOAL'}. BLUE now takes the matching kick.`);return}
    const greenLast=state.history[state.history.length-2],blueLast=state.history[state.history.length-1];if(!!greenLast.goal!==!!blueLast.goal){finish(greenLast.goal?'green':'blue',`Sudden death round ${state.suddenRound}: one team scored and the other did not.`);return}
    state.suddenRound++;state.turn='green';chooseMethod(`Sudden death remains tied after round ${state.suddenRound-1}.`)
  }
  function startRps(){
    const k=currentKick(),humanIsShooter=k.team==='blue';
    title.textContent='PENALTY · ROCK / PAPER / SCISSORS';text.innerHTML=`<p>${k.kicker} vs ${k.keeper}</p><p>Choose now. Shooter wins RPS = GOAL. Goalkeeper wins = SAVE. Tie = repeat.</p>`;actions.innerHTML='';
    [['✊ ROCK','rock'],['✋ PAPER','paper'],['✌️ SCISSORS','scissors']].forEach(([label,val])=>addButton(label,()=>{const ai=RPS[Math.floor(Math.random()*3)],tie=val===ai;if(tie){startRps();const msg=document.createElement('p');msg.className='penMessage';msg.textContent=`Tie: YOU ${val.toUpperCase()} · AI ${ai.toUpperCase()}. Repeat the same penalty.`;text.appendChild(msg);return}const humanWin=rpsHumanWins(val,ai),goal=humanIsShooter?humanWin:!humanWin;resolve(goal,'rps',`YOU ${val.toUpperCase()} · AI ${ai.toUpperCase()} · ${goal?'Shooter wins':'Goalkeeper wins'}`)}))
  }
  function startDirection(){
    const k=currentKick(),humanRole=k.team==='blue'?'SHOOTER':'GOALKEEPER',aiRole=k.team==='blue'?'GOALKEEPER':'SHOOTER';
    title.textContent='PENALTY · LEFT / CENTER / RIGHT';text.innerHTML=`<p>${k.kicker} vs ${k.keeper}</p><p>Both sides call at the same time. <b>SAME = SAVE.</b> <b>DIFFERENT = GOAL.</b></p><p>YOU are the <b>${humanRole}</b>.</p>`;actions.innerHTML='';
    [['← LEFT','left'],['● CENTER','center'],['RIGHT →','right']].forEach(([label,val])=>addButton(label,()=>{const ai=DIR[Math.floor(Math.random()*3)],same=val===ai,goal=!same;resolve(goal,'direction',`YOU ${humanRole} ${val.toUpperCase()} · AI ${aiRole} ${ai.toUpperCase()} · ${same?'SAME = SAVE':'DIFFERENT = GOAL'}`)}))
  }
  function finish(winner,why){state.done=true;render(`${why}<br><b>${winner.toUpperCase()} WINS ${state.blue}–${state.green}</b>`);actions.innerHTML='';addButton('PLAY AGAIN',()=>location.reload());addButton('MATCH MENU',()=>location.href='match.html?v=20260909m21','dark')}
  chooseMethod('GREEN takes the first penalty.');modal.classList.add('on')
}
function detect(){const modal=$('modal'),title=$('modalTitle');if(!modal||!title||!modal.classList.contains('on'))return;if(title.textContent.startsWith('PENALTY SHOOTOUT')&&!modal.dataset.dualPenaltyV5){modal.dataset.dualPenaltyV5='1';runShootout()}if(!title.textContent.startsWith('PENALTY SHOOTOUT'))delete modal.dataset.dualPenaltyV5}
const obs=new MutationObserver(detect);
window.addEventListener('DOMContentLoaded',()=>{const modal=$('modal');if(modal)obs.observe(modal,{attributes:true,childList:true,subtree:true,characterData:true});const style=document.createElement('style');style.textContent='.penScore{display:flex;justify-content:center;gap:18px;align-items:center;font-size:22px;font-weight:1000;margin:12px 0}.penCurrent{display:flex;flex-direction:column;gap:3px;padding:10px;border-radius:12px;background:#102f1c;border:1px solid #52865f;text-align:center}.penCurrent b{color:#dfff72}.penCurrent span{font-size:10px}.penHistory{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:330px;overflow:auto;margin-top:10px}.penKick{padding:10px;border-radius:12px;background:#0a2a19;border:1px solid #4e9b68}.penKick.goal{box-shadow:inset 0 0 0 1px #b9ff70}.penKick.miss{opacity:.9}.penKick h4{margin:0 0 7px}.penKick p{font-size:9px;line-height:1.45}.duelBadge{display:inline-block;padding:4px 7px;border-radius:999px;background:#183c27;color:#fff;font-size:8px;font-weight:900}.penMessage{padding:9px;border-radius:10px;background:#102f1c}@media(max-width:620px){.penHistory{grid-template-columns:1fr}.penScore{font-size:18px}}';document.head.appendChild(style)});
})();