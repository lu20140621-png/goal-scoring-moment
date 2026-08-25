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
        .lesson.gsmPassLesson{width:min(470px,50%)!important;height:122px;min-height:122px;max-height:122px;padding:11px 16px}
        .lesson.gsmPassLesson .lessonHint{max-width:320px;margin-left:auto;margin-right:auto}
        .lessonNo{font-size:10px}.lessonTitle{font-size:24px;margin-top:2px}.lessonHint{font-size:12px;line-height:1.45;margin-top:5px}.flow{font-size:10px;margin-top:8px}
        .playedPanel{margin-top:10px;min-height:142px;padding:10px 12px;border-radius:15px}
        .playedTitle{font-size:10px;margin-bottom:8px}.played{min-height:106px;gap:10px;padding:6px 4px}.playCard{width:58px;height:82px}.playText{max-width:125px;font-size:9px}.playText em{font-size:8px}.playArrow{font-size:25px}.resultChip{font-size:9px;padding:9px 12px}
        .controls{margin-top:10px;display:grid;grid-template-columns:minmax(210px,1fr) minmax(380px,1.7fr) minmax(190px,.75fr);grid-template-rows:auto 1fr;column-gap:16px;align-items:center;padding:12px 14px;min-height:178px;border-radius:15px}
        .log{grid-column:1;grid-row:1 / span 2;align-self:start;font-size:10px;line-height:1.55;padding-top:2px}.handLabel{grid-column:2;grid-row:1;margin:0 0 5px;font-size:10px}.hand{grid-column:2;grid-row:2;min-height:112px;gap:8px}.cardBtn{width:68px;height:96px}.actionBar{grid-column:3;grid-row:1 / span 2;margin:0;align-self:center}.mainAction{width:100%;min-width:0;padding:13px 16px;font-size:13px;border-radius:12px}.tapGuide{bottom:55px}
        .gsmSoccerFlow{display:flex;align-items:center;gap:7px;flex:0 0 auto}.gsmSoccerCardImage{width:82px;height:82px;object-fit:contain;display:block;filter:drop-shadow(0 5px 8px #0007)}.gsmSoccerText{max-width:138px;font-size:9px;line-height:1.25;font-weight:900;color:#e4eef8}.gsmSoccerStart .gsmSoccerText{color:#ffd456}.gsmSoccerStart{padding-right:2px}
      }
    `;
    d.head.appendChild(st);

    function polishPassLesson(){
      if(!desktop.matches)return;
      const lesson=d.querySelector('.lesson');
      const title=d.getElementById('lessonTitle');
      const hint=d.getElementById('lessonHint');
      if(!lesson||!title||!hint)return;
      const isPass=(title.textContent||'').trim()==='PASS';
      lesson.classList.toggle('gsmPassLesson',isPass);
      if(isPass){
        const desired='Pass the Soccer Card to BLUE 2.<br>Possession changes, but your turn does not end.';
        if(hint.innerHTML!==desired)hint.innerHTML=desired;
      }
    }

    function lessonNumber(){
      const t=(d.getElementById('lessonNo')?.textContent||'');
      const m=t.match(/LESSON\s+(\d+)/i);
      return m?Number(m[1]):1;
    }

    function startingOwner(){
      return ({1:'YOU',2:'YOU',3:'GREEN 1',4:'YOU',5:'GREEN 1',6:'GREEN 2',7:'YOU',8:'YOU'})[lessonNumber()]||'YOU';
    }

    function makeSoccerFlow(text,start){
      const wrap=d.createElement('div');
      wrap.className='gsmSoccerFlow'+(start?' gsmSoccerStart':'');
      wrap.innerHTML=`<img class="gsmSoccerCardImage" src="images/soccer-card.png" alt="Soccer Card"><div class="gsmSoccerText">${text}</div>`;
      return wrap;
    }

    function ensureStartingSoccerCard(){
      if(!desktop.matches)return;
      const played=d.getElementById('played');
      if(!played||played.querySelector('.gsmSoccerStart'))return;
      const empty=played.querySelector('.playedEmpty');
      if(empty)empty.remove();
      const hasExisting=played.children.length>0;
      const start=makeSoccerFlow(`SOCCER CARD • ${startingOwner()} STARTS WITH POSSESSION`,true);
      if(hasExisting){
        const arrow=d.createElement('div');
        arrow.className='playArrow gsmSoccerStartArrow';
        arrow.textContent='→';
        played.insertBefore(arrow,played.firstChild);
        played.insertBefore(start,played.firstChild);
      }else{
        played.appendChild(start);
      }
      const note=d.getElementById('playedNote');
      if(note)note.textContent='Full chain • left → right';
    }

    function upgradeSoccerResults(){
      if(!desktop.matches)return;
      const played=d.getElementById('played');
      if(!played)return;
      [...played.querySelectorAll('.resultChip')].forEach(chip=>{
        const txt=(chip.textContent||'').trim();
        if(!txt.includes('SOCCER CARD'))return;

        if(/^(YOU HAVE SOCCER CARD|GREEN 1 HAS SOCCER CARD|GREEN 2 HAS SOCCER CARD|BLUE 2 HAS SOCCER CARD)$/i.test(txt)&&played.querySelector('.gsmSoccerStart')){
          const prev=chip.previousElementSibling;
          chip.remove();
          if(prev&&prev.classList.contains('playArrow'))prev.remove();
          return;
        }

        const wrap=makeSoccerFlow(txt,false);
        chip.replaceWith(wrap);
      });
    }

    function refreshPlayedSoccer(){
      ensureStartingSoccerCard();
      upgradeSoccerResults();
    }

    polishPassLesson();
    refreshPlayedSoccer();

    const lesson=d.querySelector('.lesson');
    if(lesson){
      new w.MutationObserver(()=>{
        polishPassLesson();
        refreshPlayedSoccer();
      }).observe(lesson,{childList:true,subtree:true,characterData:true});
    }

    const played=d.getElementById('played');
    if(played){
      new w.MutationObserver(refreshPlayedSoccer).observe(played,{childList:true,subtree:true,characterData:true});
    }
  }

  frame.addEventListener('load',applyDesktopPolish);
  if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')applyDesktopPolish();
})();
