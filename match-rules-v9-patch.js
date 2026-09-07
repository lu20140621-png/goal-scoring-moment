(()=>{
'use strict';
function apply(){
 document.title='Match Mode — Complete Rulebook V9';
 const small=document.querySelector('.brand small');
 if(small) small.textContent='COMPLETE RULEBOOK · V9';
 const main=document.body;
 const wrap=document.createElement('section');
 wrap.className='v9-expanded-rulebook';
 wrap.innerHTML=`
 <h1>GOAL-SCORING MOMENT — MATCH MODE V9 COMPLETE RULEBOOK</h1>
 <p>This rulebook explains every possible attack, defense, turnover, goalkeeper and penalty situation.</p>
 
 <h2>1. ATTACK ORDER</h2>
 <p>Every SHOOT follows the same order: Attacker SHOOT → Defender 1 → Defender 2 → Goalkeeper.</p>
 <p>A defender who does not play DEFENSE or TACKLE does not defend that line. The attack moves forward automatically. No DRIBBLE is required.</p>
 
 <h2>2. DEFENSE VS TACKLE</h2>
 <p><b>DEFENSE:</b> Stops the current SHOOT only. Soccer stays with the attacking team.</p>
 <p><b>TACKLE:</b> Stops the action and steals Soccer. The successful tackler becomes the new attacker.</p>
 <p>Any successful TACKLE resets the attack. The next SHOOT always starts from the opponent's Defender 1.</p>
 
 <h2>3. DRIBBLE PAST</h2>
 <p>DRIBBLE is only needed when a defender actually plays DEFENSE or TACKLE.</p>
 <p>After a successful DRIBBLE, that defender chooses: discard 1 card to CHASE BACK, or allow the next defensive line to act.</p>
 <p>Every defensive line must make its own decision.</p>
 
 <h2>4. YELLOW RULE</h2>
 <p>YELLOW belongs to the current defensive line.</p>
 <p>D1 can only use YELLOW against actions targeting D1. D2 can only use YELLOW against actions targeting D2.</p>
 <p>YELLOW may cancel DRIBBLE or YELLOW. It cannot cancel SHOOT or DEFENSE.</p>
 
 <h2>5. GOALKEEPER RULES</h2>
 <p>Goalkeeper DEFENSE uses the goalkeeper save system. If the goalkeeper attacks with Soccer, the goalkeeper follows normal SHOOT rules.</p>
 <p>If an attacking goalkeeper loses Soccer by TACKLE, the goalkeeper is OUT OF POSITION.</p>
 <p>When a counterattack reaches an out-of-position goalkeeper: discard 1 card to RETURN TO GOAL. Then DEFENSE may be used. Without returning, the goal is automatic.</p>
 
 <h2>6. POSSESSION RESET</h2>
 <p>After any successful TACKLE, all previous DRIBBLE progress and defensive positions are cleared. A new attack starts from D1.</p>
 
 <h2>7. MATCH END</h2>
 <p>The match does not end because only one team has no SHOOT cards. Both teams must be unable to create attacks, or time must expire.</p>
 
 <h2>8. PENALTY SHOOTOUT</h2>
 <p>Use five rounds like real football. Each kick: kicker draws one card, opposing goalkeeper draws one fresh card.</p>
 <p>SHOOT without GK DEFENSE = GOAL. SHOOT with GK DEFENSE = SAVE. No SHOOT = MISS.</p>
 <p>After five rounds, highest score wins. If tied, enter sudden death.</p>
 `;
 main.appendChild(wrap);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
