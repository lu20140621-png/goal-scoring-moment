(()=>{
  'use strict';
  const hero=document.querySelector('.hero');
  if(!hero)return;

  const kicker=hero.querySelector('.heroKicker');
  const copy=hero.querySelector('p');
  const chips=[...hero.querySelectorAll('.heroChip')];

  if(kicker)kicker.textContent='ONE DECK · MORE MODES ON THE WAY';
  if(copy)copy.innerHTML='This site will keep growing with <strong>new ways to play</strong>. We’ll keep adding new game modes, new challenges, and interactive tutorials for the same deck. <strong>Bookmark this page and check back anytime to see what’s new!</strong>';

  const labels=[
    'MORE MODES WILL KEEP COMING!',
    'SAME DECK · MORE WAYS TO PLAY',
    'INTERACTIVE TUTORIALS',
    'CHECK BACK ANYTIME'
  ];
  chips.forEach((chip,i)=>{
    if(labels[i])chip.textContent=labels[i];
    chip.classList.toggle('homeUpdateChip',i===0);
  });

  const strategy2=document.querySelector('a.modeCard.strategy2');
  if(strategy2)strategy2.href='strategy2.html?v=20260907idcheck1';

  if(!document.getElementById('gsm-home-copy-style')){
    const style=document.createElement('style');
    style.id='gsm-home-copy-style';
    style.textContent=`
      .hero p strong{color:#f2ff8d;font-weight:1000}
      .heroChip.homeUpdateChip{
        background:#e7ff5a!important;
        color:#07150a!important;
        border-color:#07150a!important;
        box-shadow:0 4px 0 #00170a,0 0 22px rgba(231,255,90,.22)!important;
      }
      @media(max-width:760px){
        .hero p{max-width:620px!important;line-height:1.62!important}
        .heroChips{gap:7px!important}
        .heroChip.homeUpdateChip{width:auto}
      }
    `;
    document.head.appendChild(style);
  }
})();
