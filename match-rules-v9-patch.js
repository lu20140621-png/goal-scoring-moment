(()=>{
'use strict';
function apply(){
  document.title='Match Mode — Complete Rulebook V9';
  const small=document.querySelector('.brand small');if(small)small.textContent='COMPLETE RULEBOOK · V9';
  const penalty=document.querySelector('#penalty');
  if(penalty){
    penalty.innerHTML=`<h2>14. PENALTY SHOOTOUT — 5 ROUNDS</h2>
    <p>If the main match finishes tied, use a real-style five-round penalty shootout adapted for this 3v3 card game.</p>
    <div class="flow"><span class="box">GREEN KICK</span><span class="arr">→</span><span class="box">BLUE KICK</span><span class="arr">→</span><span class="box">ROUND 1</span><span class="arr">→</span><span class="box">...UP TO ROUND 5</span></div>
    <ol>
      <li>Collect all 51 Action Cards, including played cards, chase-cost discards, cards still in hands, and the 3 setup extras. Shuffle all 51.</li>
      <li>Teams alternate penalties. GREEN takes the first kick, then BLUE takes the matching kick for that round.</li>
      <li>Each team has up to 5 kicks in the main shootout.</li>
      <li>For the 3v3 adaptation, the field-player order is D1, D2, D1, D2, D1. Both teams use the same order.</li>
      <li>For every single kick, the kicker draws 1 card and the opposing Goalkeeper draws a fresh 1 card.</li>
      <li>If the kicker draws SHOOT and the opposing GK does NOT draw DEFENSE, that kick scores 1 GOAL.</li>
      <li>If the kicker does not draw SHOOT, the kick is a MISS and scores 0.</li>
      <li>If the kicker draws SHOOT but the opposing GK draws DEFENSE, it is a SAVE and scores 0.</li>
      <li>The same GK draws a brand-new card against every penalty. A previous DEFENSE never carries over to another kick.</li>
      <li>Keep a running penalty score. The team with more goals after 5 kicks each wins.</li>
    </ol>
    <p class="important"><b>EARLY WIN — LIKE REAL FOOTBALL:</b> If one team is already too far ahead for the opponent to catch with its remaining kicks, stop immediately. There is no need to force all 5 kicks.</p>
    <p class="example"><b>EXAMPLE:</b> After 4 kicks each, GREEN leads 4–1. BLUE has only 1 kick remaining, so BLUE can reach at most 2. GREEN has already won; the shootout ends immediately.</p>
    <h3>SUDDEN DEATH AFTER 5–5 ROUNDS</h3>
    <ol>
      <li>If the score is tied after both teams complete their 5 main kicks, enter Sudden Death.</li>
      <li>GREEN takes 1 kick, then BLUE takes 1 matching kick.</li>
      <li>If one scores and the other does not in the same sudden-death round, the scoring team wins immediately.</li>
      <li>If both score or both fail, play another sudden-death round.</li>
      <li>Every kick still uses a fresh kicker draw and a fresh opposing GK draw.</li>
    </ol>
    <p class="ruling"><b>NO NEGATIVE SCORES:</b> DEFENSE does not subtract a goal. It simply turns that specific SHOOT penalty into a SAVE worth 0.</p>`;
  }
  const v=document.querySelector('.version');if(v)v.textContent='MATCH MODE · PLAYTEST RULEBOOK V9 · 5-ROUND PENALTY SHOOTOUT';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
