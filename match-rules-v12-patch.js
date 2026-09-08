(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

document.title='Match Mode — Visual Rulebook V12';
const topSmall=$('.topbar .brand small');
if(topSmall) topSmall.textContent='VISUAL RULEBOOK · V12';

const heroText=$('.heroVisual .heroCopy > p');
if(heroText) heroText.textContent='Complete Match Mode rules for 2–8 human players, flexible 2v2 / 3v3 / 4v4 role formations, passing, every field defensive line, YELLOW timing, Goalkeeper attacks, turnovers, match endings, and the current Penalty Shootout.';

const quick=$('.quick');
if(quick) quick.innerHTML=`
  <div class="q"><span class="qi">👥</span><b>2–8 HUMANS</b><br>People and roles are separate.</div>
  <div class="q"><span class="qi">🧩</span><b>2v2–4v4 ROLES</b><br>1 GK + 1–3 field Players per team.</div>
  <div class="q"><span class="qi">🃏</span><b>EQUAL ROLE HANDS</b><br>48 dealt · 3 discarded.</div>
  <div class="q"><span class="qi">⏱️</span><b>10:00 TOTAL</b><br>Trading time counts.</div>
  <div class="q"><span class="qi">🛡️</span><b>DEFENSE ≠ TACKLE</b><br>Stop shot vs win Soccer.</div>
  <div class="q"><span class="qi">🤖</span><b>VS AI = 3v3</b><br>Digital playtest uses 3 roles per team.</div>`;

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
      <div><span class="peopleBig">2–8</span><b>HUMAN PLAYERS</b><small>Human count does not have to equal role count.</small></div>
      <div class="peopleRule"><b>FAIRNESS RULE</b><span>Both teams must use the same number of roles. Every team always has exactly <strong>1 Goalkeeper</strong> plus <strong>1–3 field Players</strong>.</span></div>
    </div>
    <div class="controlGrid">
      <article><span>2</span><b>2 PLAYERS</b><p>1 human per team. Each person controls the whole team: <strong>1 GK + 1–3 field Players</strong>. Decide the formation together before dealing.</p></article>
      <article><span>4</span><b>4 PLAYERS</b><p>2 humans per team. Each person may control <strong>1 or 2 roles</strong>, depending on whether you choose 2v2, 3v3, or 4v4 roles.</p></article>
      <article><span>6</span><b>6 PLAYERS</b><p>3 humans per team. In standard 3v3, each controls 1 role. In 4v4, <strong>one teammate on each team controls 2 roles</strong>.</p></article>
      <article><span>8</span><b>8 PLAYERS</b><p>4 humans per team. Use 4v4 roles and <strong>each person controls exactly 1 role</strong>.</p></article>
    </div>
    <div class="oddNote"><b>3 / 5 / 7 PLAYERS:</b> split the humans between the two teams as evenly as possible. Keep the <em>roles</em> equal on both teams; the side with fewer humans simply has one person control an extra role.</div>
    <div class="formationGrid">
      <article class="f2"><b>2v2 ROLES</b><span>GK + D1</span><small>4 total roles · 12 Action Cards per role</small><div>ATTACK: D1 → GK</div></article>
      <article class="f3"><b>3v3 ROLES</b><span>GK + D2 + D1</span><small>6 total roles · 8 Action Cards per role</small><div>ATTACK: D1 → D2 → GK</div></article>
      <article class="f4"><b>4v4 ROLES</b><span>GK + D3 + D2 + D1</span><small>8 total roles · 6 Action Cards per role</small><div>ATTACK: D1 → D2 → D3 → GK</div></article>
    </div>
    <div class="aiFormationNote"><b>🤖 VS AI:</b> The current website AI match is intentionally locked to the standard <strong>3v3 role formation</strong>: D1 + D2 + Goalkeeper on each team, 8 Action Cards per role.</div>`;
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
    if(key==='TEAMS') val.innerHTML='Two teams. Each team has <b>1 Goalkeeper + the same number of field Players (1, 2, or 3)</b>. Roles are public.';
    if(key==='DEAL') val.innerHTML='Use <b>48 of the 51 Action Cards</b> and set the remaining 3 face-down and out of play. Deal equally to every active role: <b>2v2 = 12 each · 3v3 = 8 each · 4v4 = 6 each</b>.';
  }
  const actionDeck=rows.find(r=>$('.key',r)?.textContent.trim()==='ACTION DECK');
  if(actionDeck){
    const extra=document.createElement('div');
    extra.className='line';
    extra.innerHTML='<div class="key">HUMANS vs ROLES</div><div class="val">A human may control more than one role. Each role still keeps its own hand and acts as its own position. Do not merge two role hands together.</div>';
    actionDeck.insertAdjacentElement('afterend',extra);
  }
}

const pass=$('#pass');
if(pass){
  const vf=$('.visualFlow',pass);
  if(vf) vf.innerHTML=`
    <div class="flowStep"><span class="stepNo">1</span><img src="images/soccer-card.webp?v=20260904fix1" alt="Soccer"><b>SOCCER HOLDER</b><p>Chooses a teammate and declares PASS.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">2</span><img src="images/tackle.webp?v=20260904tackle2" alt="Tackle"><b>D1 WINDOW</b><p>D1 gets the first TACKLE chance.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">3</span><img src="images/tackle.webp?v=20260904tackle2" alt="Tackle"><b>D2 IF USED</b><p>In 3v3 / 4v4, D2 gets the next window.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">4</span><img src="images/tackle.webp?v=20260904tackle2" alt="Tackle"><b>D3 IF USED</b><p>Only 4v4 has a D3 interception window.</p></div><div class="flowArrow">→</div>
    <div class="flowStep end"><span class="stepNo">5</span><img src="images/soccer-card.webp?v=20260904fix1" alt="Soccer"><b>PASS COMPLETE</b><p>If every active field line clears, the teammate receives Soccer.</p></div>`;
  const ol=$('ol',pass);
  if(ol) ol.innerHTML='<li>PASS costs no Action Card.</li><li>Resolve TACKLE interception windows in formation order: <b>D1 → D2 → D3</b>, skipping any defender position that is not part of your chosen formation.</li><li>If a TACKLE is beaten by DRIBBLE, continue to the next active field line.</li><li>If all active field lines clear, Soccer reaches the intended teammate.</li><li>Goalkeeper does not TACKLE a normal PASS while acting as Goalkeeper.</li><li>YELLOW is not active during a normal PASS.</li>';
}

const shoot=$('#shoot');
if(shoot){
  const vf=$('.visualFlow',shoot);
  if(vf) vf.innerHTML=`
    <div class="flowStep"><span class="stepNo">1</span><img src="images/shoot-card.webp" alt="Shoot"><b>SHOOT</b><p>The ballholder starts the scoring attack.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">2</span><img src="images/defense-card.webp" alt="Defense"><b>DEFENDER 1</b><p>D1 may DEFENSE, TACKLE, or do nothing.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">3</span><img src="images/defense-card.webp" alt="Defense"><b>D2 IF USED</b><p>3v3 / 4v4 continue through D2.</p></div><div class="flowArrow">→</div>
    <div class="flowStep window"><span class="stepNo">4</span><img src="images/tackle.webp?v=20260904tackle2" alt="Tackle"><b>D3 IF USED</b><p>4v4 continues through D3.</p></div><div class="flowArrow">→</div>
    <div class="flowStep end"><span class="stepNo">5</span><img src="images/defense-card.webp" alt="Goalkeeper defense"><b>GOALKEEPER</b><p>GK DEFENSE starts RPS. No DEFENSE = automatic goal.</p></div>`;
  const ol=$('ol',shoot);
  if(ol) ol.innerHTML='<li>Ballholder plays SHOOT. The SHOOT card is spent.</li><li>Resolve each active field defender in order: <b>D1 → D2 → D3</b>, skipping positions not used in your chosen formation.</li><li>Each current field defender may play DEFENSE, TACKLE, or choose not to defend.</li><li>Resolve the current defender completely before moving to the next line.</li><li>If a defender plays nothing, that line provided no defense and the attacker does not need DRIBBLE for it.</li><li>After the final active field line clears, the attack reaches Goalkeeper.</li>';
  const imp=$('.important',shoot);
  if(imp) imp.innerHTML='<b>FORMATION RULE:</b> 2v2 attacks use D1 → GK. 3v3 uses D1 → D2 → GK. 4v4 uses D1 → D2 → D3 → GK.';
}

const yellow=$('#yellow');
if(yellow){
  const can=$('.canBox ul',yellow);
  if(can) can.innerHTML='<li>Cancel DRIBBLE on the current SHOOT line.</li><li>Cancel the current defender\'s TACKLE when played by the attacker.</li><li>Cancel another YELLOW in the same live chain.</li><li>Follow the current field line: D1, then D2, then D3 if that formation uses D3.</li>';
  const d2=$$('.line',yellow).find(r=>$('.key',r)?.textContent.trim()==='D2 LINE');
  if(d2){
    const v=$('.val',d2); if(v) v.textContent='Once play moves to D2, D1’s window is over. If your formation uses D3, D2 is followed by D3; otherwise the next stage is Goalkeeper.';
    if(!$$('.line',yellow).some(r=>$('.key',r)?.textContent.trim()==='D3 LINE')){
      const d3=document.createElement('div'); d3.className='line'; d3.innerHTML='<div class="key">D3 LINE</div><div class="val">Only 4v4 uses D3. Once play reaches D3, D1 and D2 YELLOW windows are over. D3 now owns the defending-side YELLOW window for that line.</div>'; d2.insertAdjacentElement('afterend',d3);
    }
  }
}

for(const id of ['gkattack','turnover']){
  const sec=$(id.startsWith('#')?id:'#'+id);
  if(!sec) continue;
  const walker=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  for(const n of nodes){
    n.nodeValue=n.nodeValue
      .replace(/D1 → D2 in the normal order/g,'D1 → D2 → D3 in formation order, skipping unused positions')
      .replace(/through D1 → D2/g,'through every active field line in order')
      .replace(/D1 → D2/g,'D1 → D2 → D3 (as used by the formation)');
  }
}

const rulings=$('#rulings');
if(rulings){
  const d2=$$('.line',rulings).find(r=>$('.key',r)?.textContent.trim()==='D2 DOES NOTHING');
  if(d2){const v=$('.val',d2); if(v) v.textContent='D2 did not defend. No DRIBBLE required. In 4v4 go to D3; otherwise go straight to GK.';}
  const first=$('.line',rulings);
  if(first){
    const roles=document.createElement('div'); roles.className='line'; roles.innerHTML='<div class="key">HOW MANY ROLES?</div><div class="val">Both teams choose the same formation: 2v2, 3v3, or 4v4 roles. Human players may control multiple roles when needed.</div>'; first.insertAdjacentElement('beforebegin',roles);
  }
}

const version=$('.version');
if(version) version.textContent='MATCH MODE · VISUAL PLAYTEST RULEBOOK V12 · 2–8 PLAYER SETUP · 2026-09-07';

const style=document.createElement('style');
style.textContent=`
.peopleRulesV12{margin:4px 0 18px}.peopleIntro{display:grid;grid-template-columns:210px 1fr;gap:12px;margin-bottom:11px}.peopleIntro>div{border-radius:17px;border:1px solid #63b77a;background:#082719;padding:15px}.peopleIntro>div:first-child{text-align:center;background:linear-gradient(145deg,#174f2d,#092a19)}.peopleBig{display:block;font:1000 54px/.9 Impact,"Arial Black",Arial;color:#ffd83d}.peopleIntro b{display:block;color:#eaff9d;font-size:11px;margin-top:5px}.peopleIntro small{display:block;color:#d6e9da;font-size:9px;margin-top:4px}.peopleRule{display:flex;flex-direction:column;justify-content:center}.peopleRule span{font-size:11px;line-height:1.55;color:#e9f5ec;margin-top:5px}.controlGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.controlGrid article{position:relative;min-height:150px;padding:14px 12px 12px;border-radius:16px;background:#0a2d1b;border:1px solid #4b9a64;overflow:hidden}.controlGrid article>span{position:absolute;right:10px;top:4px;font:1000 54px/1 Impact,"Arial Black",Arial;color:#dfff7218}.controlGrid article b{display:block;color:#dfff72;font-size:11px;margin-bottom:7px;position:relative}.controlGrid article p{font-size:9.5px;line-height:1.52;margin:0;position:relative}.oddNote{margin-top:9px;padding:10px 12px;border-radius:13px;background:#102b3c;border:1px solid #4f99c8;color:#e9f6ff;font-size:9.5px;line-height:1.48}.oddNote b{color:#83cfff}.formationGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:11px}.formationGrid article{padding:14px;border-radius:16px;background:#0b321e;border:1px solid #5aab70;text-align:center}.formationGrid article b{display:block;font-size:13px;color:#fff}.formationGrid article span{display:block;margin:6px 0;color:#dfff72;font-size:10px;font-weight:1000}.formationGrid article small{display:block;color:#cae2d0;font-size:8.5px}.formationGrid article div{margin-top:9px;padding:7px;border-radius:9px;background:#041b10;color:#fff;font-size:8px;font-weight:1000}.formationGrid .f2{border-color:#75c8ff}.formationGrid .f3{border-color:#dfff72}.formationGrid .f4{border-color:#ffb21b}.aiFormationNote{margin-top:10px;padding:11px 12px;border-radius:13px;background:#302807;border:1px solid #d9b83f;color:#fff4bd;font-size:9.5px;line-height:1.48}.v12StandardTitle{margin-top:18px!important}
@media(max-width:900px){.controlGrid{grid-template-columns:1fr 1fr}.formationGrid{grid-template-columns:1fr}.peopleIntro{grid-template-columns:170px 1fr}}
@media(max-width:760px){.peopleIntro{grid-template-columns:1fr}.peopleIntro>div:first-child{display:grid;grid-template-columns:100px 1fr;align-items:center;text-align:left}.peopleBig{font-size:48px;grid-row:1/3}.peopleIntro>div:first-child b,.peopleIntro>div:first-child small{margin-left:8px}.controlGrid{display:flex;overflow-x:auto;gap:9px;padding:2px 1px 9px;scroll-snap-type:x mandatory}.controlGrid article{flex:0 0 220px;scroll-snap-align:start}.formationGrid{display:flex;overflow-x:auto;gap:9px;padding:2px 1px 9px;scroll-snap-type:x mandatory}.formationGrid article{flex:0 0 235px;scroll-snap-align:start}.oddNote,.aiFormationNote{font-size:9px}}
@media(max-width:430px){.controlGrid article{flex-basis:205px}.formationGrid article{flex-basis:218px}.peopleIntro>div:first-child{grid-template-columns:90px 1fr}.peopleBig{font-size:43px}}
`;
document.head.appendChild(style);
})();