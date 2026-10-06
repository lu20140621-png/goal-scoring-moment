(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

document.title='Match Mode — Visual Rulebook V13';
const topSmall=$('.topbar .brand small');
if(topSmall) topSmall.textContent='VISUAL RULEBOOK · V13';

const firstSec=$('.sec');
if(firstSec&&!$('#matchBeginnerStart')){
  const beginner=document.createElement('section');
  beginner.className='sec matchBeginnerStart';
  beginner.id='matchBeginnerStart';
  beginner.innerHTML=`
  <h2>START HERE — FIRST MATCH, EXACT ORDER</h2>
  <div class="matchNoDraw"><b>IMPORTANT: DO NOT DRAW CARDS DURING THE 10-MINUTE MAIN MATCH.</b><span>Match Mode is different from Strategy and Casual. Your role receives its full hand during setup. There is no normal “draw 1” at the start or end of a turn.</span></div>
  <div class="matchStartGrid">
    <article><span class="n">1</span><b>MAKE TWO TEAMS</b><p>Split the human players into BLUE and GREEN teams as evenly as possible.</p></article>
    <article><span class="n">2</span><b>CHOOSE THE SAME ROLE FORMATION</b><p>Both teams must use the same number of roles: <strong>2v2 = GK + D1</strong>, <strong>3v3 = GK + D1 + D2</strong>, or <strong>4v4 = GK + D1 + D2 + D3</strong>.</p></article>
    <article><span class="n">3</span><b>ASSIGN HUMANS TO ROLES</b><p>One person may control more than one role when needed. Each role remains separate and keeps its own hand. Never combine the hands of two roles.</p></article>
    <article><span class="n">4</span><b>SHUFFLE THE 51 ACTION CARDS</b><p>SHOOT, DEFENSE, TACKLE, DRIBBLE PAST, and YELLOW make up the Action deck. Keep the Soccer Card separate; it represents possession.</p></article>
    <article><span class="n">5</span><b>SET ASIDE 3 ACTION CARDS FACE-DOWN</b><p>Do not look at them. These 3 cards are out of play during the main match, leaving exactly 48 Action Cards to deal.</p></article>
    <article><span class="n">6</span><b>DEAL ALL 48 CARDS EQUALLY TO THE ROLES</b><p><strong>2v2:</strong> 12 per role. <strong>3v3:</strong> 8 per role. <strong>4v4:</strong> 6 per role. There is no Draw Pile during the main match.</p></article>
    <article><span class="n">7</span><b>START THE 10:00 CLOCK</b><p>The clock starts immediately after the deal. Final setup and any legal 1-for-1 trades between teammates happen while the clock is running.</p></article>
    <article><span class="n">8</span><b>RPS FOR OPENING POSSESSION</b><p>Use Rock–Paper–Scissors to decide which team starts. Repeat any tie. The winning team receives the Soccer Card.</p></article>
    <article><span class="n">9</span><b>THE SOCCER HOLDER MAKES THE FIRST MOVE</b><p>The player with the Soccer Card may <strong>PASS for free</strong> to a teammate or play <strong>SHOOT</strong> to attack. Do not draw a card first.</p></article>
    <article><span class="n">10</span><b>FOLLOW THE DEFENSIVE LINES IN ORDER</b><p>2v2: D1 → GK. 3v3: D1 → D2 → GK. 4v4: D1 → D2 → D3 → GK. Fully resolve the current defensive line before moving to the next one.</p></article>
  </div>
  <div class="matchFirstPlay"><b>FIRST 3v3 EXAMPLE</b><span>BLUE D1 has the Soccer Card → BLUE D1 may PASS to a teammate for free or play SHOOT → GREEN D1 responds → if that line is cleared, GREEN D2 responds → if that line is cleared, the attack reaches GREEN GK → no GK DEFENSE = automatic GOAL; GK plays DEFENSE = resolve one official Goalkeeper Duel.</span></div>
  <p class="ruling"><b>REMEMBER:</b> In Match Mode, played cards leave the hand and are not normally replaced. There is no normal drawing or recycling during the 10-minute main match.</p>`;
  firstSec.insertAdjacentElement('beforebegin',beginner);
  const toc=$('.toc');
  if(toc&&!toc.querySelector('a[href="#matchBeginnerStart"]')){
    const a=document.createElement('a');a.href='#matchBeginnerStart';a.textContent='START HERE';toc.insertBefore(a,toc.firstChild);
  }
}

const cards=$('#cards');
if(cards){
  for(const row of $$('.cardr',cards)){
    const name=$('b',row)?.textContent.trim();
    const text=$('span',row);
    if(name==='DEFENSE'&&text) text.textContent='Field player: stops the current SHOOT only. Goalkeeper: starts one official Goalkeeper Duel — choose RPS or Left / Center / Right.';
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
    <div class="gkChoiceCard"><img src="images/defense-card.webp" alt="Goalkeeper Defense"><div><b>GK PLAYS DEFENSE</b><span>Playing GK DEFENSE does not guarantee a save. Resolve one Goalkeeper Duel using either official method below.</span></div></div>
    <div class="gkChoiceArrow">→</div>
    <div class="gkChoiceResult"><b>CHOOSE A DUEL</b><span>Both methods are official. Agree on which method to use before resolving the duel.</span></div>
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
      <p>The Shooter and Goalkeeper each choose <b>Left, Center, or Right</b> and call their choices at the same time.</p>
      <div class="methodRules"><b>SAME call → SAVE</b><b>DIFFERENT calls → GOAL</b></div>
    </article>
  </div>
  <ol>
    <li>The Goalkeeper stage begins only after every active field defensive line has either been cleared or chosen not to defend.</li>
    <li>If the Goalkeeper has no DEFENSE, the attack scores automatically.</li>
    <li>If the Goalkeeper plays DEFENSE, choose either <b>Rock / Paper / Scissors</b> or <b>Left / Center / Right</b>.</li>
    <li>RPS: Shooter wins = GOAL. Goalkeeper wins = SAVE. Tie = repeat.</li>
    <li>Left / Center / Right: both sides call at the same time. Same call = SAVE. Different calls = GOAL.</li>
    <li>After any Goalkeeper-stage result — SAVE, duel loss, or no-DEFENSE goal — the Soccer Card goes to the defending Goalkeeper.</li>
    <li>The Goalkeeper becomes the new ballholder and may PASS or play SHOOT if they have a SHOOT card.</li>
  </ol>
  <p class="ruling"><b>TWO OFFICIAL METHODS:</b> Neither duel method is a bonus rule. Both are valid Match Mode Goalkeeper resolutions. Agree on the method before the duel begins.</p>
  <p class="important"><b>GK POSSESSION RULE:</b> After the Goalkeeper stage, Soccer goes to the defending Goalkeeper whether the result is a SAVE or a GOAL.</p>`;
}

const penalty=$('#penalty');
if(penalty){
  penalty.innerHTML=`
  <h2>14. PENALTY SHOOTOUT — BEST OF 5 · CHOOSE THE DUEL</h2>
  <p>If the main match ends in a tie, play a best-of-5 Penalty Shootout. Teams alternate one kick at a time. <b>Do not draw Action Cards to resolve penalties.</b> Each penalty is resolved with one of the two official duel methods.</p>
  <div class="penaltyDuelChoice">
    <article><div class="methodTag">METHOD A</div><h3>✊ ✋ ✌️ RPS</h3><p>Shooter wins the RPS = <b>GOAL</b>.<br>Goalkeeper wins = <b>SAVE</b>.<br>Tie = repeat the same penalty duel.</p></article>
    <article><div class="methodTag">METHOD B</div><h3>🥅 LEFT · CENTER · RIGHT</h3><div class="miniGoal"><span>LEFT</span><span>CENTER</span><span>RIGHT</span></div><p>Both sides call their choices at the same time.<br><b>SAME = SAVE</b><br><b>DIFFERENT = GOAL</b></p></article>
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
    <li>Keep a running score. If one team can no longer mathematically catch the other, the shootout ends early.</li>
    <li>If tied after five kicks each, continue to sudden death.</li>
    <li>Sudden death is resolved in paired rounds: GREEN takes one kick, then BLUE takes one matching kick. Declare a winner only after both kicks in that sudden-death round are complete.</li>
  </ol>
  <p class="ruling"><b>PENALTY CHOICE:</b> Both official Goalkeeper Duel methods remain available in the shootout. Use whichever method both sides agree on for that penalty.</p>`;
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

const beginnerStyle=document.createElement('style');
beginnerStyle.textContent=`
.matchBeginnerStart{border-color:#ffd83d!important;background:linear-gradient(180deg,#123822,#071f14)!important}.matchNoDraw{padding:13px 14px;margin-bottom:12px;border-radius:14px;background:#3b1a0e;border:2px solid #ffb21b}.matchNoDraw b{display:block;color:#ffd83d;font-size:12px}.matchNoDraw span{display:block;margin-top:5px;color:#ffe8ca;font-size:9.5px;line-height:1.5;font-weight:800}.matchStartGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.matchStartGrid article{position:relative;min-height:110px;padding:14px 13px 13px 52px;border-radius:15px;background:#082719;border:1px solid #4f9e68}.matchStartGrid .n{position:absolute;left:12px;top:12px;width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#dfff72;color:#082214;font-size:10px;font-weight:1000}.matchStartGrid b{display:block;color:#eaff9d;font-size:10px}.matchStartGrid p{margin:5px 0 0;font-size:9.2px;line-height:1.5;color:#e4f2e7}.matchFirstPlay{margin-top:12px;padding:13px;border-radius:14px;background:#071d2c;border:1px solid #4a91ce}.matchFirstPlay b{display:block;color:#8fd0ff;font-size:10px}.matchFirstPlay span{display:block;margin-top:5px;font-size:9.2px;line-height:1.55;color:#e5f3ff;font-weight:800}@media(max-width:760px){.matchStartGrid{grid-template-columns:1fr}.matchStartGrid article{min-height:0}.matchNoDraw b{font-size:11px}}
`;
document.head.appendChild(beginnerStyle);
})();