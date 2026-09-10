(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

document.title='Match Mode — Visual Rulebook V13';
const topSmall=$('.topbar .brand small');
if(topSmall) topSmall.textContent='VISUAL RULEBOOK · V13';

const cards=$('#cards');
if(cards){
  for(const row of $$('.cardr',cards)){
    const name=$('b',row)?.textContent.trim();
    const text=$('span',row);
    if(name==='DEFENSE'&&text) text.textContent='Field: stops this SHOOT only. Goalkeeper: starts one official Goalkeeper Duel — choose RPS or Left / Center / Right.';
  }
}

const shoot=$('#shoot');
if(shoot){
  const gkStep=$$('.flowStep',shoot).find(x=>$('b',x)?.textContent.trim()==='GOALKEEPER');
  if(gkStep){const p=$('p',gkStep);if(p)p.textContent='GK DEFENSE starts a chosen duel: RPS or Left / Center / Right. No DEFENSE = automatic goal.';}
}

const gk=$('#gk');
if(gk){
  gk.innerHTML=`
  <h2>10. NORMAL GOALKEEPER FLOW — TWO OFFICIAL DUELS</h2>
  <div class="gkChoiceHero">
    <div class="gkChoiceCard"><img src="images/defense-card.webp" alt="Goalkeeper Defense"><div><b>GK PLAYS DEFENSE</b><span>The final save is not automatic. Resolve one Goalkeeper Duel using either official method below.</span></div></div>
    <div class="gkChoiceArrow">→</div>
    <div class="gkChoiceResult"><b>CHOOSE A DUEL</b><span>Both methods are official. Players agree which one to use before resolving that duel.</span></div>
  </div>
  <div class="duelMethods">
    <article class="duelMethod rpsMethod">
      <div class="methodTag">OPTION A</div><h3>✊ ✋ ✌️ ROCK · PAPER · SCISSORS</h3>
      <div class="rpsIcons"><span>✊<small>ROCK</small></span><span>✋<small>PAPER</small></span><span>✌️<small>SCISSORS</small></span></div>
      <div class="methodRules"><b>Shooter wins → GOAL</b><b>Goalkeeper wins → SAVE</b><b>Tie → repeat</b></div>
    </article>
    <article class="duelMethod directionMethod">
      <div class="methodTag">OPTION B</div><h3>🥅 LEFT · CENTER · RIGHT</h3>
      <div class="goalMouth"><span>←<small>LEFT</small></span><span>●<small>CENTER</small></span><span>→<small>RIGHT</small></span></div>
      <p>Shooter and Goalkeeper choose and call <b>Left, Center, or Right at the same time.</b></p>
      <div class="methodRules"><b>SAME call → SAVE</b><b>DIFFERENT calls → GOAL</b></div>
    </article>
  </div>
  <ol>
    <li>The Goalkeeper stage begins only after every active field defensive line has been cleared or chooses not to defend.</li>
    <li>If the Goalkeeper has no DEFENSE, the attack scores automatically.</li>
    <li>If the Goalkeeper plays DEFENSE, choose either <b>Rock / Paper / Scissors</b> or <b>Left / Center / Right</b>.</li>
    <li>RPS: Shooter wins = GOAL. Goalkeeper wins = SAVE. Tie = repeat.</li>
    <li>Left / Center / Right: both sides call at the same time. Same call = SAVE. Different calls = GOAL.</li>
    <li>After any Goalkeeper-stage result — SAVE, duel loss, or no-DEFENSE goal — Soccer ends in the defending Goalkeeper's hand.</li>
    <li>The Goalkeeper becomes the new ballholder and may PASS or personally SHOOT if holding SHOOT.</li>
  </ol>
  <p class="ruling"><b>TWO OFFICIAL METHODS:</b> Neither duel method is a bonus rule. Both are valid Match Mode Goalkeeper resolutions. Agree on the method before resolving the duel.</p>
  <p class="important"><b>GK POSSESSION RULE:</b> After the Goalkeeper stage, Soccer goes to the defending Goalkeeper whether the result is a SAVE or a GOAL.</p>`;
}

const penalty=$('#penalty');
if(penalty){
  penalty.innerHTML=`
  <h2>14. PENALTY SHOOTOUT — BEST OF 5 · CHOOSE THE DUEL</h2>
  <p>If the main match is tied, play a best-of-5 Penalty Shootout. Teams alternate one kick at a time. <b>No Action Card draw is used to decide the penalty.</b> Each penalty is resolved with one of the two official duel methods.</p>
  <div class="penaltyDuelChoice">
    <article><div class="methodTag">METHOD A</div><h3>✊ ✋ ✌️ RPS</h3><p>Shooter wins the RPS = <b>GOAL</b>.<br>Goalkeeper wins = <b>SAVE</b>.<br>Tie = repeat the same penalty duel.</p></article>
    <article><div class="methodTag">METHOD B</div><h3>🥅 LEFT · CENTER · RIGHT</h3><div class="miniGoal"><span>LEFT</span><span>CENTER</span><span>RIGHT</span></div><p>Both sides call simultaneously.<br><b>SAME = SAVE</b><br><b>DIFFERENT = GOAL</b></p></article>
  </div>
  <div class="penaltyRounds">
    <div class="duel"><b>ROUND 1</b><br>GREEN D1 ↔ BLUE GK<br>BLUE D1 ↔ GREEN GK</div>
    <div class="duel"><b>ROUND 2</b><br>GREEN D2 ↔ BLUE GK<br>BLUE D2 ↔ GREEN GK</div>
    <div class="duel"><b>ROUND 3</b><br>GREEN D1 ↔ BLUE GK<br>BLUE D1 ↔ GREEN GK</div>
    <div class="duel"><b>ROUND 4</b><br>GREEN D2 ↔ BLUE GK<br>BLUE D2 ↔ GREEN GK</div>
    <div class="duel"><b>ROUND 5</b><br>GREEN D1 ↔ BLUE GK<br>BLUE D1 ↔ GREEN GK</div>
  </div>
  <ol>
    <li>GREEN takes the first penalty, then BLUE takes the matching penalty.</li>
    <li>Before each penalty duel is resolved, use either official method: <b>RPS</b> or <b>Left / Center / Right</b>.</li>
    <li>Keep a running score. If one team becomes mathematically impossible to catch, the shootout ends early.</li>
    <li>If tied after five kicks each, continue to sudden death.</li>
    <li>Sudden death is resolved in paired rounds: GREEN takes one kick, then BLUE takes one matching kick. A winner is declared only after both kicks in that sudden-death round are complete.</li>
  </ol>
  <p class="ruling"><b>PENALTY CHOICE:</b> Both official Goalkeeper Duel methods remain available in the shootout. Use the one both sides agree to for that penalty.</p>`;
}

const rulings=$('#rulings');
if(rulings){
  const first=$('.line',rulings);
  if(first){
    const a=document.createElement('div');a.className='line';a.innerHTML='<div class="key">GK DUEL METHODS</div><div class="val">After GK plays DEFENSE, use either RPS or Left / Center / Right. Both are official.</div>';
    const b=document.createElement('div');b.className='line';b.innerHTML='<div class="key">LEFT / CENTER / RIGHT</div><div class="val">Both sides call at the same time. Same call = SAVE. Different calls = GOAL.</div>';
    first.insertAdjacentElement('beforebegin',b);first.insertAdjacentElement('beforebegin',a);
  }
}

const version=$('.version');
if(version) version.textContent='MATCH MODE · VISUAL PLAYTEST RULEBOOK V13 · DUAL GOALKEEPER DUELS · 2026-09-09';

const style=document.createElement('style');
style.textContent=`
.gkChoiceHero{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin:12px 0}.gkChoiceCard,.gkChoiceResult{min-height:128px;border:1px solid #5ea977;border-radius:16px;background:#082719;padding:13px;display:flex;align-items:center;gap:12px}.gkChoiceCard img{width:70px;height:104px;object-fit:contain;filter:drop-shadow(0 7px 10px #0007)}.gkChoiceCard b,.gkChoiceResult b{display:block;color:#dfff72;font-size:12px}.gkChoiceCard span,.gkChoiceResult span{display:block;margin-top:5px;font-size:9.5px;line-height:1.5;color:#e5f2e8}.gkChoiceResult{flex-direction:column;justify-content:center;text-align:center}.gkChoiceArrow{font-size:28px;color:#ffd83d;font-weight:1000}.duelMethods,.penaltyDuelChoice{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin:12px 0}.duelMethod,.penaltyDuelChoice article{border:1px solid #4e9564;border-radius:17px;background:linear-gradient(180deg,#0d321f,#071f14);padding:14px;box-shadow:inset 0 0 0 1px #ffffff08}.duelMethod h3,.penaltyDuelChoice h3{margin:6px 0 11px;color:#fff;font-size:14px}.methodTag{display:inline-block;padding:4px 7px;border-radius:999px;background:#ffd83d;color:#302000;font-size:8px;font-weight:1000;letter-spacing:.08em}.rpsIcons,.goalMouth{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.rpsIcons span,.goalMouth span{min-height:74px;border:1px solid #5d9d71;border-radius:12px;background:#041a10;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:28px;font-weight:1000}.rpsIcons small,.goalMouth small{font-size:7px;margin-top:5px;color:#cfe5d4}.goalMouth{padding:7px;border:3px solid #effff4;border-bottom-width:5px;border-radius:10px 10px 2px 2px;background:linear-gradient(180deg,#193d25,#0e2617)}.goalMouth span{min-height:60px;font-size:23px;border-color:#ffffff44}.methodRules{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.methodRules b{flex:1 1 120px;text-align:center;padding:7px;border-radius:9px;background:#143923;color:#f4fff7;font-size:8px}.directionMethod p,.penaltyDuelChoice p{font-size:9.5px;line-height:1.5}.penaltyDuelChoice article:first-child{border-color:#7db5ff}.penaltyDuelChoice article:last-child{border-color:#ffd15b}.miniGoal{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:7px;border:2px solid #fff;border-bottom-width:4px;border-radius:9px;background:#12351f}.miniGoal span{padding:9px 4px;border-radius:6px;background:#051d11;text-align:center;font-size:7px;font-weight:1000;color:#fff}
@media(max-width:760px){.gkChoiceHero{grid-template-columns:1fr}.gkChoiceArrow{transform:rotate(90deg);text-align:center;line-height:18px}.duelMethods,.penaltyDuelChoice{grid-template-columns:1fr}.gkChoiceCard,.gkChoiceResult{min-height:0}.rpsIcons span,.goalMouth span{min-height:58px}.duelMethod,.penaltyDuelChoice article{padding:12px}}
`;
document.head.appendChild(style);
})();