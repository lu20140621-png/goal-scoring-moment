(function(){
  const frame=document.getElementById('game');
  if(!frame)return;

  function applyDesktopPolish(){
    const w=frame.contentWindow,d=frame.contentDocument;
    if(!w||!d||!d.head||!d.body)return;
    const desktop=w.matchMedia('(min-width: 761px)');
    if(!desktop.matches)return;
    if(d.getElementById('gsm-desktop-polish'))return;

    const st=d.createElement('style');
    st.id='gsm-desktop-polish';
    st.textContent=`
      @media (min-width:761px){
        .shell{max-width:1260px;grid-template-columns:170px minmax(0,1fr) 170px;gap:12px;padding:10px 12px;align-items:start}
        .side{align-self:start;height:auto;min-height:0;padding:10px 9px;border-radius:14px}
        .side h3{font-size:12px;margin-bottom:10px}.mini{padding:9px;margin:8px 0;font-size:10px}.mini strong{font-size:12px}
        .status{min-height:40px;padding:8px 11px;margin-bottom:8px}
        .pitch{aspect-ratio:16/8.2;max-height:560px;border-radius:18px}
        .seat{width:116px;padding:6px}.seat.you{left:12%;bottom:10%}.seat.blue2{left:12%;top:10%}.seat.green1{right:12%;top:10%}.seat.green2{right:12%;bottom:10%}
        .lesson{top:36%;width:min(560px,58%);padding:11px 16px;border-radius:16px;box-shadow:0 10px 28px #0004}
        .lessonNo{font-size:10px}.lessonTitle{font-size:24px;margin-top:2px}.lessonHint{font-size:12px;line-height:1.45;margin-top:5px}.flow{font-size:10px;margin-top:8px}
        .playedPanel{margin-top:10px;min-height:142px;padding:10px 12px;border-radius:15px}
        .playedTitle{font-size:10px;margin-bottom:8px}.played{min-height:106px;gap:10px;padding:6px 4px}.playCard{width:58px;height:82px}.playText{max-width:125px;font-size:9px}.playText em{font-size:8px}.playArrow{font-size:25px}.resultChip{font-size:9px;padding:9px 12px}
        .controls{margin-top:10px;display:grid;grid-template-columns:minmax(210px,1fr) minmax(380px,1.7fr) minmax(190px,.75fr);grid-template-rows:auto 1fr;column-gap:16px;align-items:center;padding:12px 14px;min-height:178px;border-radius:15px}
        .log{grid-column:1;grid-row:1 / span 2;align-self:start;font-size:10px;line-height:1.55;padding-top:2px}.handLabel{grid-column:2;grid-row:1;margin:0 0 5px;font-size:10px}.hand{grid-column:2;grid-row:2;min-height:112px;gap:8px}.cardBtn{width:68px;height:96px}.actionBar{grid-column:3;grid-row:1 / span 2;margin:0;align-self:center}.mainAction{width:100%;min-width:0;padding:13px 16px;font-size:13px;border-radius:12px}.tapGuide{bottom:55px}
        .gsmSoccerFlow{display:flex;align-items:center;gap:7px;flex:0 0 auto}.gsmSoccerCard{width:58px;height:82px;border-radius:8px;border:2px solid #72d38f;background:linear-gradient(180deg,#0d6a3c,#073d25);box-shadow:0 5px 12px #0006;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px}.gsmSoccerCard strong{font-size:8px;color:#fff;letter-spacing:.05em}.gsmSoccerCard img{width:37px;height:37px;object-fit:contain;margin:3px 0}.gsmSoccerCard span{font-size:7px;color:#dff8e8;font-weight:900}.gsmSoccerText{max-width:125px;font-size:9px;line-height:1.25;font-weight:900;color:#e4eef8}
      }
    `;
    d.head.appendChild(st);

    function upgradeSoccerResults(){
      if(!desktop.matches)return;
      const played=d.getElementById('played');
      if(!played)return;
      [...played.querySelectorAll('.resultChip')].forEach(chip=>{
        const txt=(chip.textContent||'').trim();
        if(!txt.includes('SOCCER CARD')||chip.dataset.gsmSoccer==='1')return;
        chip.dataset.gsmSoccer='1';
        const wrap=d.createElement('div');
        wrap.className='gsmSoccerFlow';
        wrap.innerHTML=`<div class="gsmSoccerCard"><strong>SOCCER</strong><img src="images/soccer-ball.svg" alt="Soccer Card"><span>CARD</span></div><div class="gsmSoccerText">${txt}</div>`;
        chip.replaceWith(wrap);
      });
    }

    upgradeSoccerResults();
    const played=d.getElementById('played');
    if(played){
      new w.MutationObserver(upgradeSoccerResults).observe(played,{childList:true,subtree:true,characterData:true});
    }
  }

  frame.addEventListener('load',applyDesktopPolish);
  if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')applyDesktopPolish();
})();
