(()=>{
'use strict';
function add(){
  document.title='Match Mode — Complete Rulebook V8';
  const small=document.querySelector('.brand small');if(small)small.textContent='COMPLETE RULEBOOK · V8';
  const turnover=document.querySelector('#turnover');
  if(turnover&&!document.querySelector('#turnoverResetRule')){
    const box=document.createElement('div');box.id='turnoverResetRule';box.className='important';
    box.innerHTML='<b>TURNOVER RESET — VERY IMPORTANT:</b> Any successful TACKLE that changes possession completely ends the old attack. The next time the new ballholder plays SHOOT, the attack ALWAYS starts again at the opponent\'s Defender 1. Never continue from Defender 2 or Goalkeeper just because the ball was won deep in the previous attack.<div class="flow" style="margin-top:10px"><span class="box">D2 TACKLE WINS SOCCER</span><span class="arr">→</span><span class="box">NEW POSSESSION</span><span class="arr">→</span><span class="box">NEW SHOOT</span><span class="arr">→</span><span class="box">OPPONENT D1</span><span class="arr">→</span><span class="box">D2</span><span class="arr">→</span><span class="box">GK</span></div>';
    const h=turnover.querySelector('h2');if(h)h.insertAdjacentElement('afterend',box);else turnover.prepend(box);
    const ex=document.createElement('p');ex.className='example';ex.innerHTML='<b>EXAMPLE:</b> BLUE attacks → GREEN D1 is cleared → GREEN D2 plays TACKLE and wins Soccer. GREEN D2 now has a completely new possession. If GREEN D2 plays SHOOT, BLUE D1 defends first, then BLUE D2, then BLUE GK. GREEN does NOT resume at BLUE D2 or BLUE GK.';turnover.appendChild(ex);
  }
  const tackle=document.querySelector('#tackle');
  if(tackle&&!document.querySelector('#tackleResetMini')){
    const p=document.createElement('p');p.id='tackleResetMini';p.className='ruling';p.innerHTML='<b>POSITION DOES NOT CARRY OVER:</b> D1 or D2 winning Soccer with TACKLE does not let the new attack skip defensive lines. A possession change resets the formation for the next SHOOT.';tackle.appendChild(p);
  }
  const gk=document.querySelector('#gk');
  if(gk&&!document.querySelector('#gkNoTackleReminder')){
    const p=document.createElement('p');p.id='gkNoTackleReminder';p.className='ruling';p.innerHTML='<b>3RD STAGE REMINDER:</b> In the current 3v3 format, the third stage is Goalkeeper. A Goalkeeper does not use TACKLE while defending the goal; the GK stage uses DEFENSE → RPS. If an attacking GK loses Soccer to an opponent field TACKLE, that turnover still resets the opponent\'s next SHOOT to D1 and the attacking GK becomes OUT OF POSITION.';gk.appendChild(p);
  }
  const v=document.querySelector('.version');if(v)v.textContent='MATCH MODE · PLAYTEST RULEBOOK V8 · TURNOVER RESET CLARIFIED';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
