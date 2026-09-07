(()=>{
'use strict';

const card=[...document.querySelectorAll('.modeCard')].find(el=>{
  const href=el.getAttribute('href')||'';
  return /^match\.html(?:\?|$)/.test(href);
});
if(!card||card.dataset.matchPolished==='1')return;
card.dataset.matchPolished='1';
card.classList.add('matchModeCard');

const top=card.querySelector('.modeTop');
if(top&&!top.querySelector('.matchDifficultyBadge')){
  const badge=document.createElement('span');
  badge.className='matchDifficultyBadge';
  badge.textContent='⚠ HIGH DIFFICULTY';
  top.appendChild(badge);
}

const copy=card.querySelector('.modeCopy');
const featureRow=copy?.querySelector('.featureRow');
if(copy&&!copy.querySelector('.matchDifficultyWarning')){
  const warning=document.createElement('div');
  warning.className='matchDifficultyWarning';
  warning.innerHTML='<b>HIGH DIFFICULTY</b><span>First time playing? Choose carefully — this mode has deeper team tactics and tougher decisions.</span>';
  if(featureRow)featureRow.insertAdjacentElement('afterend',warning);
  else copy.appendChild(warning);
}

const style=document.createElement('style');
style.id='gsmMatchModeHomePolish';
style.textContent=`
/* MODE 05 homepage feature card */
.matchModeCard{
  min-height:455px!important;
  --matchWarn:#ffb21b;
}
.matchModeCard .modeCopy{
  width:58%!important;
  max-width:58%!important;
  padding:28px 28px 105px!important;
}
.matchModeCard .modeCopy h2{
  font-size:clamp(48px,5vw,76px)!important;
}
.matchModeCard .modeCopy p{
  max-width:760px!important;
  font-size:14px!important;
  line-height:1.48!important;
}
.matchDifficultyBadge{
  display:inline-flex;
  align-items:center;
  padding:6px 10px;
  border-radius:999px;
  background:var(--matchWarn);
  color:#251200;
  border:2px solid #271300;
  box-shadow:0 3px 0 rgba(0,0,0,.35);
  font-size:9px;
  font-weight:1000;
  letter-spacing:.075em;
  white-space:nowrap;
}
.matchDifficultyWarning{
  display:flex;
  align-items:center;
  gap:10px;
  width:min(620px,100%);
  margin-top:14px;
  padding:10px 12px;
  border-radius:13px;
  background:linear-gradient(90deg,rgba(255,178,27,.98),rgba(255,221,84,.96));
  border:2px solid #311700;
  box-shadow:0 4px 0 rgba(0,0,0,.3);
  color:#251200;
  text-shadow:none;
}
.matchDifficultyWarning b{
  flex:0 0 auto;
  font-size:10px;
  font-weight:1000;
  letter-spacing:.075em;
}
.matchDifficultyWarning span{
  font-size:10px;
  line-height:1.35;
  font-weight:900;
}

/* Full-width MODE 05 gets a hero-sized card fan instead of the small 2-card preset. */
.matchModeCard .cardFan{
  position:absolute!important;
  right:2.5%!important;
  left:auto!important;
  top:42px!important;
  bottom:auto!important;
  width:38%!important;
  height:355px!important;
  margin:0!important;
}
.matchModeCard .cardFan img{
  width:220px!important;
  height:330px!important;
  filter:drop-shadow(0 20px 20px rgba(0,0,0,.52))!important;
}
.matchModeCard .cardFan img:nth-child(1){
  left:auto!important;
  right:155px!important;
  top:34px!important;
  transform:rotate(-12deg)!important;
  z-index:1!important;
}
.matchModeCard .cardFan img:nth-child(2){
  left:auto!important;
  right:5px!important;
  top:0!important;
  transform:rotate(10deg)!important;
  z-index:2!important;
}
@media(hover:hover) and (pointer:fine){
  .matchModeCard:hover .cardFan img:nth-child(1){transform:rotate(-16deg) translate(-13px,5px) scale(1.035)!important}
  .matchModeCard:hover .cardFan img:nth-child(2){transform:rotate(14deg) translate(10px,-7px) scale(1.055)!important}
}

@media(max-width:1080px) and (min-width:761px){
  .matchModeCard .modeCopy{width:55%!important;max-width:55%!important}
  .matchModeCard .cardFan{right:1.5%!important;width:42%!important}
  .matchModeCard .cardFan img{width:190px!important;height:285px!important}
  .matchModeCard .cardFan img:nth-child(1){right:130px!important;top:45px!important}
  .matchModeCard .cardFan img:nth-child(2){right:0!important;top:14px!important}
}

/* Mobile is deliberately re-composed, not just scaled down. */
@media(max-width:760px){
  .matchModeCard{
    min-height:0!important;
  }
  .matchModeCard .modeCopy{
    width:100%!important;
    max-width:100%!important;
    padding:22px 18px 8px!important;
  }
  .matchModeCard .modeTop{
    gap:6px!important;
    margin-bottom:10px!important;
  }
  .matchModeCard .modeCopy h2{
    font-size:46px!important;
    line-height:.86!important;
    margin-top:10px!important;
  }
  .matchModeCard .modeCopy p{
    font-size:11.5px!important;
    line-height:1.48!important;
  }
  .matchDifficultyBadge{
    font-size:8px;
    padding:6px 8px;
  }
  .matchDifficultyWarning{
    align-items:flex-start;
    flex-direction:column;
    gap:3px;
    margin-top:12px;
    padding:10px 11px;
    border-radius:12px;
  }
  .matchDifficultyWarning b{font-size:10px}
  .matchDifficultyWarning span{font-size:9.5px;line-height:1.38}
  .matchModeCard .cardFan{
    position:relative!important;
    right:auto!important;
    left:auto!important;
    top:auto!important;
    bottom:auto!important;
    width:100%!important;
    height:285px!important;
    margin:4px 0 76px!important;
  }
  .matchModeCard .cardFan img{
    width:162px!important;
    height:244px!important;
  }
  .matchModeCard .cardFan img:nth-child(1){
    left:calc(50% - 142px)!important;
    right:auto!important;
    top:34px!important;
    transform:rotate(-11deg)!important;
  }
  .matchModeCard .cardFan img:nth-child(2){
    left:calc(50% - 18px)!important;
    right:auto!important;
    top:5px!important;
    transform:rotate(9deg)!important;
  }
  .matchModeCard .enter{
    left:18px!important;
    right:18px!important;
    bottom:18px!important;
    width:calc(100% - 36px)!important;
    justify-content:space-between!important;
    padding:10px 12px 10px 14px!important;
  }
}

@media(max-width:420px){
  .matchModeCard .modeCopy{padding:20px 16px 7px!important}
  .matchModeCard .modeCopy h2{font-size:43px!important}
  .matchModeCard .cardFan{height:258px!important;margin-bottom:74px!important}
  .matchModeCard .cardFan img{width:145px!important;height:218px!important}
  .matchModeCard .cardFan img:nth-child(1){left:calc(50% - 128px)!important;top:32px!important}
  .matchModeCard .cardFan img:nth-child(2){left:calc(50% - 12px)!important;top:5px!important}
}

@media(max-width:350px){
  .matchModeCard .modeCopy h2{font-size:39px!important}
  .matchModeCard .cardFan{height:235px!important}
  .matchModeCard .cardFan img{width:132px!important;height:199px!important}
  .matchModeCard .cardFan img:nth-child(1){left:calc(50% - 118px)!important}
  .matchModeCard .cardFan img:nth-child(2){left:calc(50% - 8px)!important}
}
`;
document.head.appendChild(style);
})();
