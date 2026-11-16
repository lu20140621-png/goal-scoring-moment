(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

document.title='Match Mode — Visual Rulebook V12';
const topSmall=$('.topbar .brand small');
if(topSmall) topSmall.textContent='VISUAL RULEBOOK · V12';

const heroText=$('.heroVisual .heroCopy > p');
if(heroText) heroText.textContent='Complete Match Mode rules for 4 players (2v2) or 6 players (3v3): passing, defending, YELLOW timing, Goalkeeper mind games, and the five-kick Penalty Shootout.';

const quick=$('.quick');
if(quick) quick.innerHTML=`
  <div class="q"><span class="qi">👥</span><b>4 OR 6 PLAYERS</b><br>Two equal teams.</div>
  <div class="q"><span class="qi">🧩</span><b>2v2 OR 3v3</b><br>1 GK + 1 or 2 defenders per team.</div>
  <div class="q"><span class="qi">🃏</span><b>EQUAL ROLE HANDS</b><br>2v2 = 12 cards each · 3v3 = 8 cards each.</div>
  <div class="q"><span class="qi">📱</span><b>PHONE TIMER · 10:00</b><br>Start after dealing. Teammate trading counts.</div>
  <div class="q"><span class="qi">⚽</span><b>GAME GOAL</b><br>Score more goals than your opponent.</div>
  <div class="q"><span class="qi">🥅</span><b>TIED SCORE</b><br>Use the Penalty Shootout.</div>`;

const setup=$('#setup');
if(setup){
  const h2=$('h2',setup);
  if(h2) h2.textContent='1. PLAYERS, ROLES, DEAL & CLOCK';
  const firstVisual=$('.visualTitle',setup);
  if(firstVisual) firstVisual.textContent='CHOOSE YOUR TEAM SIZE BEFORE DEALING';

  const people=document.createElement('div');
  people.className='peopleRulesV12';
  people.innerHTML=`
    <div class="peopleIntro">
      <div><span class="peopleBig">4 / 6</span><b>PLAYERS ONLY</b><small>Choose either 2v2 or 3v3 before dealing.</small></div>
      <div class="peopleRule"><b>FAIR TEAMS</b><span>Each person controls exactly one public role. <strong>4 players = 2v2</strong> and <strong>6 players = 3v3</strong>. There are no additional Match Mode team sizes.</span></div>
    </div>
    <div class="controlGrid">
      <article><span>4</span><b>4 PLAYERS · 2v2</b><p>Two people on each team: <strong>D1 + Goalkeeper</strong>. Deal <strong>12 Action Cards per person</strong>.</p></article>
      <article><span>6</span><b>6 PLAYERS · 3v3</b><p>Three people on each team: <strong>D1 + D2 + Goalkeeper</strong>. Deal <strong>8 Action Cards per person</strong>.</p></article>
    </div>
    <div class="formationGrid">
      <article class="f2"><b>2v2 · 4 PLAYERS</b><span>D1 + GK per team</span><small>4 total roles · 12 Action Cards each</small><div>ATTACK: D1 → GK</div></article>
      <article class="f3"><b>3v3 · 6 PLAYERS</b><span>D1 + D2 + GK per team</span><small>6 total roles · 8 Action Cards each</small><div>ATTACK: D1 → D2 → GK</div></article>
    </div>
    <div class="aiFormationNote"><b>🤖 VS AI / COACH TUTORIAL:</b> The interactive demo currently uses the <strong>3v3</strong> formation. The complete rulebook also covers <strong>2v2</strong>.</div>`;
  if(firstVisual) firstVisual.insertAdjacentElement('afterend',people); else h2?.insertAdjacentElement('afterend',people);

  const fieldTitle=document.createElement('div');
  fieldTitle.className='visualTitle v12StandardTitle';
  fieldTitle.textContent='STANDARD 3v3 POSITION EXAMPLE · ALSO USED BY VS AI';
  const field=$('.fieldMap',setup);
  if(field) field.insertAdjacentElement('beforebegin',fieldTitle);
  const arrows=$('.attackArrows',setup);
  if(arrows) arrows.textContent='STANDARD 3v3 ATTACK: D1 → D2 → GOALKEEPER';

  const rows=$$('.line',setup);
  for(const row of rows){
    const key=$('.key',row)?.textContent.trim();
    const val=$('.val',row);
    if(!val) continue;
    if(key==='TEAMS') val.innerHTML='Two equal teams: <b>4 players = 2v2 (D1 + GK)</b>, or <b>6 players = 3v3 (D1 + D2 + GK)</b>. All roles are public, one per player.';
    if(key==='DEAL') val.innerHTML='Use <b>48 of the 51 Action Cards</b> and set the remaining 3 face-down and out of play. Deal equally to every active role: <b>2v2 = 12 each · 3v3 = 8 each</b>.';
  }
  const actionDeck=rows.find(r=>$('.key',r)?.textContent.trim()==='ACTION DECK');
  if(actionDeck){
    const extra=document.createElement('div');
    extra.className='line';
    extra.innerHTML='<div class="key">ONE ROLE PER PLAYER</div><div class="val">In Match Mode, each player controls exactly one role with its own separate hand.</div>';
    actionDeck.insertAdjacentElement('afterend',extra);
  }
}

const pass=$('#pass');
if(pass){
  const h2=$('h2',pass); if(h2) h2.textContent='4. PASS — TACKLE INTERCEPTION';
  const title=$('.visualTitle',pass); if(title) title.textContent='PASS → TACKLE → YELLOW OR TURNOVER';
  const vf=$('.visualFlow',pass);
  if(vf) vf.innerHTML=`
    <div class="flowStep"><span class="stepNo">1</span><img src="images/soccer-card.webp?v=20260904fix1" alt="Soccer"><b>DECLARE PASS</b><p>Choose a teammate. PASS costs no Action Card.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">2</span><img src="images/tackle.webp?v=20260904tackle2" alt="Tackle"><b>OPPONENT MAY TACKLE</b><p>An opponent may play TACKLE during the pass to steal Soccer.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">3</span><img src="images/yellow-card.webp" alt="Yellow"><b>PASSER MAY YELLOW</b><p>YELLOW cancels that PASS TACKLE.</p></div><div class="flowArrow">→</div>
    <div class="flowStep end"><span class="stepNo">4</span><img src="images/soccer-card.webp?v=20260904fix1" alt="Result"><b>RESOLVE</b><p>YELLOW → pass completes. No YELLOW → tackler wins Soccer.</p></div>`;
  const ol=$('ol',pass);
  if(ol) ol.innerHTML='<li>Only the Soccer holder may PASS.</li><li>PASS is free.</li><li>During PASS, an opponent may play TACKLE to steal Soccer.</li><li><b>Only YELLOW cancels a PASS TACKLE.</b> DRIBBLE PAST does not cancel it.</li><li>YELLOW cancels the TACKLE → PASS completes.</li><li>No YELLOW → TACKLE succeeds and the tackler immediately takes Soccer.</li><li>A SHOOT by the new ballholder starts fresh at the opponent\'s D1.</li>';
  const ex=$('.example',pass); if(ex) ex.remove();
  let ruling=$('.ruling',pass);
  if(!ruling){ruling=document.createElement('p');ruling.className='ruling';pass.appendChild(ruling)}
  ruling.innerHTML='<b>KEY:</b> PASS is free, but an opponent may TACKLE it. YELLOW is the counter; DRIBBLE is not.';
}

const shoot=$('#shoot');
if(shoot){
  const h2=$('h2',shoot); if(h2) h2.textContent='5. COMPLETE SHOOT / ATTACK FLOW';
  let title=$('.visualTitle',shoot);
  if(!title){title=document.createElement('div');title.className='visualTitle';shoot.insertBefore(title,$('.visualFlow',shoot));}
  title.textContent='FIELD PLAYERS GET 3 CHOICES · GOALKEEPER GETS 1 DEFENSE CHOICE';

  const vf=$('.visualFlow',shoot);
  if(vf) vf.innerHTML=`
    <div class="flowStep"><span class="stepNo">1</span><img src="images/shoot-card.webp" alt="Shoot"><b>SHOOT</b><p>The Soccer holder plays SHOOT and starts one scoring attack.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">2</span><img src="images/defense-card.webp" alt="D1"><b>D1 CHOOSES</b><p><strong>DEFENSE</strong>, <strong>TACKLE</strong>, or <strong>NO DEFENSE</strong>. No card = this line is cleared.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">3</span><img src="images/tackle.webp?v=20260904tackle2" alt="D2"><b>D2 — IN 3v3 ONLY</b><p>Same 3 choices on every field line. No defense = move immediately to the next line.</p></div><div class="flowArrow">→</div>
    <div class="flowStep end"><span class="stepNo">4</span><img src="images/defense-card.webp" alt="Goalkeeper"><b>GOALKEEPER</b><p>Only DEFENSE may stop the shot here. DEFENSE → Goalkeeper Duel. No DEFENSE → automatic GOAL.</p></div>`;

  const existing=[...shoot.querySelectorAll('.line')];
  existing.forEach(x=>x.remove());
  const ol=$('ol',shoot);
  const detail=document.createElement('div');
  detail.innerHTML=`
    <div class="line"><div class="key">D1</div><div class="val"><b>3 choices:</b> play DEFENSE, play TACKLE, or choose NO DEFENSE. If D1 plays nothing, D1 is cleared immediately and no DRIBBLE PAST is needed.</div></div>
    <div class="line"><div class="key">D2 · 3v3 ONLY</div><div class="val">Every later field defender uses the <b>same 3 choices</b>. If they choose NO DEFENSE, the SHOOT continues immediately to the next active line.</div></div>
    <div class="line"><div class="key">GOALKEEPER</div><div class="val">The GK is different: at the goal the only defensive card choice is <b>DEFENSE</b>. Play DEFENSE → start the official Goalkeeper Duel. Do not play DEFENSE / have no DEFENSE → <b>automatic GOAL +1</b>.</div></div>`;
  if(ol) shoot.insertBefore(detail,ol);

  if(ol) ol.innerHTML='<li>Ballholder plays SHOOT and spends the SHOOT card.</li><li>Start at D1.</li><li>Every field defender chooses DEFENSE, TACKLE, or NO DEFENSE.</li><li>NO DEFENSE clears that line immediately; no DRIBBLE is needed.</li><li>DEFENSE or TACKLE must fully resolve before play moves forward.</li><li>After the final active field line is cleared, go to the Goalkeeper.</li><li>GK plays DEFENSE → Goalkeeper Duel. GK does not play DEFENSE → automatic GOAL.</li>';

  const imp=$('.important',shoot);
  if(imp) imp.innerHTML='<b>FORMATION ORDER:</b> 2v2 = D1 → GK. 3v3 = D1 → D2 → GK.';

  let ruling=$('.ruling',shoot);
  if(!ruling){ruling=document.createElement('p');ruling.className='ruling';shoot.appendChild(ruling);}
  ruling.innerHTML='<b>FIELD vs GK:</b> D1 / D2 may DEFENSE, TACKLE, or decline to defend. The Goalkeeper cannot TACKLE at the goal — the GK either plays DEFENSE or concedes.';
}

const yellow=$('#yellow');
if(yellow){
  const can=$('.canBox ul',yellow);
  if(can) can.innerHTML='<li><b>PASS exception:</b> the passer may cancel an opponent\'s TACKLE played during the PASS.</li><li>Cancel DRIBBLE on the current SHOOT line.</li><li>Cancel the current defender\'s TACKLE when played by the attacker.</li><li>Cancel another YELLOW in the same live SHOOT chain.</li><li>Follow the current SHOOT field line: D1, then D2 in 3v3.</li>';
  const d2=$$('.line',yellow).find(r=>$('.key',r)?.textContent.trim()==='D2 LINE');
  if(d2){
    const v=$('.val',d2);if(v)v.textContent='D2 exists only in 3v3. Once play moves to D2, the D1 YELLOW window closes. After D2, the next stage is Goalkeeper.';
  }

}

const rulings=$('#rulings');
if(rulings){
  const d2=$$('.line',rulings).find(r=>$('.key',r)?.textContent.trim()==='D2 DOES NOTHING');
  if(d2){const v=$('.val',d2); if(v) v.textContent='D2 did not defend, so no DRIBBLE PAST is required. Continue to the Goalkeeper.';}
  const first=$('.line',rulings);
  if(first){
    const roles=document.createElement('div'); roles.className='line'; roles.innerHTML='<div class="key">HOW MANY ROLES?</div><div class="val">Match Mode uses 4 players (2v2) or 6 players (3v3), with exactly one role per player.</div>'; first.insertAdjacentElement('beforebegin',roles);
  }
}

const version=$('.version');
if(version) version.textContent='MATCH MODE · 4 OR 6 PLAYERS · 2v2 / 3v3';

const style=document.createElement('style');
style.textContent=`
.peopleRulesV12{margin:4px 0 18px}.peopleIntro{display:grid;grid-template-columns:210px 1fr;gap:12px;margin-bottom:11px}.peopleIntro>div{border-radius:17px;border:1px solid #63b77a;background:#082719;padding:15px}.peopleIntro>div:first-child{text-align:center;background:linear-gradient(145deg,#174f2d,#092a19)}.peopleBig{display:block;font:1000 54px/.9 Impact,"Arial Black",Arial;color:#ffd83d}.peopleIntro b{display:block;color:#eaff9d;font-size:11px;margin-top:5px}.peopleIntro small{display:block;color:#d6e9da;font-size:9px;margin-top:4px}.peopleRule{display:flex;flex-direction:column;justify-content:center}.peopleRule span{font-size:11px;line-height:1.55;color:#e9f5ec;margin-top:5px}.controlGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.controlGrid article{position:relative;min-height:150px;padding:14px 12px 12px;border-radius:16px;background:#0a2d1b;border:1px solid #4b9a64;overflow:hidden}.controlGrid article>span{position:absolute;right:10px;top:4px;font:1000 54px/1 Impact,"Arial Black",Arial;color:#dfff7218}.controlGrid article b{display:block;color:#dfff72;font-size:11px;margin-bottom:7px;position:relative}.controlGrid article p{font-size:9.5px;line-height:1.52;margin:0;position:relative}.oddNote{margin-top:9px;padding:10px 12px;border-radius:13px;background:#102b3c;border:1px solid #4f99c8;color:#e9f6ff;font-size:9.5px;line-height:1.48}.oddNote b{color:#83cfff}.formationGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:11px}.formationGrid article{padding:14px;border-radius:16px;background:#0b321e;border:1px solid #5aab70;text-align:center}.formationGrid article b{display:block;font-size:13px;color:#fff}.formationGrid article span{display:block;margin:6px 0;color:#dfff72;font-size:10px;font-weight:1000}.formationGrid article small{display:block;color:#cae2d0;font-size:8.5px}.formationGrid article div{margin-top:9px;padding:7px;border-radius:9px;background:#041b10;color:#fff;font-size:8px;font-weight:1000}.formationGrid .f2{border-color:#75c8ff}.formationGrid .f3{border-color:#dfff72}.aiFormationNote{margin-top:10px;padding:11px 12px;border-radius:13px;background:#302807;border:1px solid #d9b83f;color:#fff4bd;font-size:9.5px;line-height:1.48}.v12StandardTitle{margin-top:18px!important}
@media(max-width:900px){.controlGrid{grid-template-columns:1fr 1fr}.formationGrid{grid-template-columns:1fr}.peopleIntro{grid-template-columns:170px 1fr}}
@media(max-width:760px){.peopleIntro{grid-template-columns:1fr}.peopleIntro>div:first-child{display:grid;grid-template-columns:100px 1fr;align-items:center;text-align:left}.peopleBig{font-size:48px;grid-row:1/3}.peopleIntro>div:first-child b,.peopleIntro>div:first-child small{margin-left:8px}.controlGrid{display:flex;overflow-x:auto;gap:9px;padding:2px 1px 9px;scroll-snap-type:x mandatory}.controlGrid article{flex:0 0 220px;scroll-snap-align:start}.formationGrid{display:flex;overflow-x:auto;gap:9px;padding:2px 1px 9px;scroll-snap-type:x mandatory}.formationGrid article{flex:0 0 235px;scroll-snap-align:start}.oddNote,.aiFormationNote{font-size:9px}}
@media(max-width:430px){.controlGrid article{flex-basis:205px}.formationGrid article{flex-basis:218px}.peopleIntro>div:first-child{grid-template-columns:90px 1fr}.peopleBig{font-size:43px}}
`;
document.head.appendChild(style);
})();