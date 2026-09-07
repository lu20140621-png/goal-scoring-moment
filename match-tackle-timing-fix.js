(()=>{
'use strict';

// Match Mode TACKLE timing hotfix.
// TACKLE may NOT be played immediately when a new possession begins.
// It becomes legal during a PASS or after the ballholder has played an Action Card.

const nativeSetTimeout=window.setTimeout.bind(window);

// The current AI prototype still schedules an old "standing tackle before the
// ballholder acts" routine. Suppress only that obsolete scheduled callback.
window.setTimeout=function(fn,delay,...args){
  if(typeof fn==='function'){
    const src=Function.prototype.toString.call(fn);
    if(src.includes('aiStandingTackle()')){
      return nativeSetTimeout(()=>{},delay,...args);
    }
  }
  return nativeSetTimeout(fn,delay,...args);
};

function fixAiPreActionWindow(){
  const help=document.getElementById('phaseHelp');
  if(!help)return;
  if(help.textContent.includes('can TACKLE now—even though AI is not passing') ||
     help.textContent.includes('Before AI acts, your first active defender may attempt TACKLE')){
    help.textContent='AI has possession. TACKLE is not legal yet. You may TACKLE during a PASS or after AI plays an Action Card.';
    const hold=[...document.querySelectorAll('#actions .action')].find(b=>/HOLD POSITION/i.test(b.textContent));
    if(hold)nativeSetTimeout(()=>hold.click(),0);
  }
}

function fixTutorialCopy(){
  const coach=document.getElementById('coachText');
  if(coach){
    const old='But TACKLE can steal Soccer even when you are not passing. It can also intercept a pass.';
    if(coach.textContent.includes(old)){
      coach.textContent='TACKLE can steal Soccer during a PASS, or after the ballholder has played an Action Card. It cannot be played before the ballholder acts.';
    }
  }
  const note=document.getElementById('note');
  if(note && note.textContent.includes('whether a pass is happening or not')){
    note.textContent='TACKLE can steal Soccer during a PASS or after the ballholder has played an Action Card. It cannot open a new possession.';
  }
}

function fixRulebookCopy(){
  document.querySelectorAll('.ruleVal,.example,.cardRule span').forEach(el=>{
    let t=el.textContent.trim();
    if(t==='The current outfield defender may use TACKLE to try to steal Soccer even when no pass is happening. TACKLE may also be used to intercept a PASS.'){
      el.textContent='TACKLE cannot be played at the instant a new possession begins. The current outfield defender may use TACKLE during a PASS, or after the Soccer holder has played an Action Card.';
    }
    if(t.includes('BLUE 1 holds Soccer. GREEN 1 may challenge with TACKLE before BLUE 1 shoots or passes.')){
      el.innerHTML='<b>Example:</b> BLUE 1 receives Soccer. GREEN 1 cannot immediately TACKLE. If BLUE 1 PASSes, GREEN 1 may TACKLE the pass. If BLUE 1 first plays an Action Card such as SHOOT, the legal defensive TACKLE window opens.';
    }
    if(t==='Challenges possession, intercepts passes, and can stop a SHOOT while stealing Soccer.'){
      el.textContent='Steals Soccer during a PASS or after the ballholder has played an Action Card. It can also stop a SHOOT and win possession.';
    }
  });
}

function runFixes(){
  fixAiPreActionWindow();
  fixTutorialCopy();
  fixRulebookCopy();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',runFixes,{once:true});
else runFixes();

const observer=new MutationObserver(runFixes);
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
