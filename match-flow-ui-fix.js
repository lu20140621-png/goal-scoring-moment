(()=>{
'use strict';

const qs=(s,p=document)=>p.querySelector(s);
const qsa=(s,p=document)=>[...p.querySelectorAll(s)];
let chaseOverlay=null;
let lastGoalText='';

function buildChaseOverlay(){
  if(chaseOverlay)return chaseOverlay;
  chaseOverlay=document.createElement('div');
  chaseOverlay.id='matchChasePrompt';
  chaseOverlay.style.cssText='position:fixed;inset:0;z-index:9999;background:#00150bcf;display:none;align-items:center;justify-content:center;padding:18px';
  chaseOverlay.innerHTML=`<div style="width:min(440px,100%);background:linear-gradient(180deg,#103c24,#071d12);border:2px solid #71d38d;border-radius:20px;padding:20px;box-shadow:0 20px 60px #000a;color:#fff;text-align:center">
    <div style="font-size:9px;letter-spacing:.18em;font-weight:1000;color:#dfff72">DRIBBLED PAST</div>
    <h2 style="margin:7px 0 8px;font:24px/1 'Arial Black',Arial,sans-serif">CHASE BACK?</h2>
    <p id="matchChaseText" style="margin:0 0 16px;font-size:12px;line-height:1.55;color:#deeee2">This defender was beaten. Discard 1 card to chase back and defend again, or let the next defensive line take over.</p>
    <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
      <button id="matchChaseYes" style="border:2px solid #07150a;border-radius:12px;padding:11px 14px;background:#c9ff26;color:#07150a;font-weight:1000;cursor:pointer">CHASE BACK · DISCARD 1</button>
      <button id="matchChaseNo" style="border:1px solid #7aa789;border-radius:12px;padding:11px 14px;background:#123624;color:#fff;font-weight:900;cursor:pointer">LET NEXT LINE DEFEND</button>
    </div>
  </div>`;
  document.body.appendChild(chaseOverlay);
  return chaseOverlay;
}

function closeChase(){
  if(chaseOverlay)chaseOverlay.style.display='none';
}

function maybePromptChase(){
  const actions=qs('#actions');
  if(!actions)return;
  const chase=qsa('.action',actions).find(b=>/CHASE BACK\s*·?\s*DISCARD 1/i.test(b.textContent||''));
  if(!chase||chase.dataset.explicitPrompted==='1')return;
  chase.dataset.explicitPrompted='1';
  const pass=qsa('.action',actions).find(b=>/LET NEXT LINE DEFEND|STOP CHASING/i.test(b.textContent||''));
  const help=qs('#phaseHelp')?.textContent?.trim();
  const overlay=buildChaseOverlay();
  const text=qs('#matchChaseText',overlay);
  if(help)text.textContent=help+' Choose now: chase back by discarding 1 card, or let the next defensive line defend.';
  qs('#matchChaseYes',overlay).onclick=()=>{closeChase();chase.click();};
  qs('#matchChaseNo',overlay).onclick=()=>{closeChase();if(pass)pass.click();};
  overlay.style.display='flex';
}

function ensureKickoffBanner(){
  let b=qs('#kickoffPossessionBanner');
  if(b)return b;
  const notice=qs('#notice');
  if(!notice)return null;
  b=document.createElement('div');
  b.id='kickoffPossessionBanner';
  b.style.cssText='display:none;margin:8px 0;padding:10px 12px;border-radius:12px;border:2px solid #ffd83d;background:#332a06;color:#fff6b0;font-size:10px;font-weight:1000;letter-spacing:.03em;text-align:center';
  notice.insertAdjacentElement('afterend',b);
  return b;
}

function maybeShowGoalRestart(){
  const events=qsa('#liveCards .liveEvent');
  if(!events.length)return;
  const latest=events.at(-1)?.textContent?.trim()||'';
  if(!/GOAL \+1/i.test(latest)||latest===lastGoalText)return;
  lastGoalText=latest;
  const scoringBlue=/BLUE GOAL/i.test(latest);
  const conceding=scoringBlue?'GREEN':'BLUE';
  const b=ensureKickoffBanner();
  if(!b)return;
  b.textContent=`GOAL — ${conceding} conceded, so ${conceding} receives Soccer for the restart.`;
  b.style.display='block';
  setTimeout(()=>{if(b.textContent.includes(conceding))b.style.display='none';},5000);
}

function run(){
  maybePromptChase();
  maybeShowGoalRestart();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{buildChaseOverlay();ensureKickoffBanner();run();},{once:true});
else {buildChaseOverlay();ensureKickoffBanner();run();}

const obs=new MutationObserver(run);
obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
