/* Goal-Scoring Moment - Mobile Strategy Tutorial Pitch Animation v3
 * Visual-only layer. Runs inside strategy.html.
 * Does not change tutorial/game logic.
 */
(function(){
  'use strict';

  const MOBILE_QUERY='(max-width:760px)';

  function install(){
    if(!window.matchMedia(MOBILE_QUERY).matches)return;
    if(document.getElementById('gsm-mobile-match-animation-v3-style'))return;

    const pitch=document.querySelector('.pitch');
    const played=document.getElementById('played');
    if(!pitch||!played)return;

    const style=document.createElement('style');
    style.id='gsm-mobile-match-animation-v3-style';
    style.textContent=`
      @media(max-width:760px){
        .gsmAnimV3Layer{
          position:absolute;
          inset:0;
          z-index:9;
          pointer-events:none;
          overflow:hidden;
        }

        .gsmAnimV3Player{
          position:absolute;
          width:30px;
          height:42px;
          transform:translate(-50%,-50%);
          transition:
            left .42s ease,
            top .42s ease,
            transform .25s ease,
            filter .2s ease;
          filter:drop-shadow(0 3px 4px #0008);
        }

        .gsmAnimV3Player .head{
          position:absolute;
          left:50%;
          top:0;
          width:11px;
          height:11px;
          border-radius:50%;
          transform:translateX(-50%);
          background:currentColor;
        }

        .gsmAnimV3Player .body{
          position:absolute;
          left:50%;
          top:10px;
          width:10px;
          height:17px;
          border-radius:5px 5px 3px 3px;
          transform:translateX(-50%);
          background:currentColor;
        }

        .gsmAnimV3Player .arm,
        .gsmAnimV3Player .leg{
          position:absolute;
          width:4px;
          height:14px;
          border-radius:4px;
          background:currentColor;
          transform-origin:50% 0;
        }

        .gsmAnimV3Player .arm.left{
          left:6px;
          top:12px;
          transform:rotate(28deg);
        }

        .gsmAnimV3Player .arm.right{
          right:6px;
          top:12px;
          transform:rotate(-28deg);
        }

        .gsmAnimV3Player .leg.left{
          left:9px;
          top:25px;
          transform:rotate(16deg);
        }

        .gsmAnimV3Player .leg.right{
          right:9px;
          top:25px;
          transform:rotate(-16deg);
        }

        .gsmAnimV3Player.blue{
          color:var(--blue);
        }

        .gsmAnimV3Player.green{
          color:var(--green);
        }

        .gsmAnimV3Player.active{
          filter:
            drop-shadow(0 0 7px var(--gold))
            drop-shadow(0 3px 4px #0008);
        }

        .gsmAnimV3Player.blocking{
          transform:translate(-50%,-50%) scale(1.14);
        }

        .gsmAnimV3Player.dribbleUp{
          transform:
            translate(-50%,-50%)
            translateY(-24px)
            rotate(-10deg);
        }

        .gsmAnimV3Player.dribbleDown{
          transform:
            translate(-50%,-50%)
            translateY(24px)
            rotate(10deg);
        }

        .gsmAnimV3Label{
          position:absolute;
          left:50%;
          top:39px;
          transform:translateX(-50%);
          padding:1px 4px;
          border-radius:999px;
          background:#071827dd;
          color:#fff;
          font-size:6px;
          line-height:1.25;
          font-weight:950;
          white-space:nowrap;
          border:1px solid #ffffff44;
        }

        .gsmAnimV3Ball{
          position:absolute;
          width:29px;
          height:29px;
          object-fit:contain;
          left:50%;
          top:50%;
          transform:translate(-50%,-50%);
          transition:
            left .42s ease,
            top .42s ease,
            transform .25s ease;
          filter:drop-shadow(0 3px 5px #0009);
          z-index:3;
        }

        .gsmAnimV3Ball.goal{
          transform:
            translate(-50%,-50%)
            scale(1.18)
            rotate(12deg);
        }

        .gsmAnimV3Flash{
          position:absolute;
          left:50%;
          top:72%;
          transform:translate(-50%,-50%) scale(.92);
          padding:4px 7px;
          border-radius:999px;
          background:var(--gold);
          color:var(--ink);
          font-size:7px;
          line-height:1;
          font-weight:950;
          opacity:0;
          transition:
            opacity .18s ease,
            transform .18s ease;
          white-space:nowrap;
          box-shadow:0 3px 8px #0006;
        }

        .gsmAnimV3Flash.show{
          opacity:1;
          transform:
            translate(-50%,-50%)
            scale(1);
        }
      }
    `;
    document.head.appendChild(style);

    const layer=document.createElement('div');
    layer.className='gsmAnimV3Layer';

    layer.innerHTML=`
      <div class="gsmAnimV3Player blue" data-player="YOU">
        <i class="head"></i>
        <i class="body"></i>
        <i class="arm left"></i>
        <i class="arm right"></i>
        <i class="leg left"></i>
        <i class="leg right"></i>
        <span class="gsmAnimV3Label">YOU</span>
      </div>

      <div class="gsmAnimV3Player blue" data-player="BLUE 2">
        <i class="head"></i>
        <i class="body"></i>
        <i class="arm left"></i>
        <i class="arm right"></i>
        <i class="leg left"></i>
        <i class="leg right"></i>
        <span class="gsmAnimV3Label">BLUE 2</span>
      </div>

      <div class="gsmAnimV3Player green" data-player="GREEN 1">
        <i class="head"></i>
        <i class="body"></i>
        <i class="arm left"></i>
        <i class="arm right"></i>
        <i class="leg left"></i>
        <i class="leg right"></i>
        <span class="gsmAnimV3Label">GREEN 1</span>
      </div>

      <div class="gsmAnimV3Player green" data-player="GREEN 2">
        <i class="head"></i>
        <i class="body"></i>
        <i class="arm left"></i>
        <i class="arm right"></i>
        <i class="leg left"></i>
        <i class="leg right"></i>
        <span class="gsmAnimV3Label">GREEN 2</span>
      </div>

      <img
        class="gsmAnimV3Ball"
        src="images/soccer-card.webp"
        alt=""
      >

      <div class="gsmAnimV3Flash"></div>
    `;

    pitch.appendChild(layer);

    const players={
      'YOU':layer.querySelector('[data-player="YOU"]'),
      'BLUE 2':layer.querySelector('[data-player="BLUE 2"]'),
      'GREEN 1':layer.querySelector('[data-player="GREEN 1"]'),
      'GREEN 2':layer.querySelector('[data-player="GREEN 2"]')
    };

    const ball=layer.querySelector('.gsmAnimV3Ball');
    const flash=layer.querySelector('.gsmAnimV3Flash');

    const base={
      'YOU':{x:28,y:66},
      'BLUE 2':{x:28,y:34},
      'GREEN 1':{x:72,y:34},
      'GREEN 2':{x:72,y:66}
    };

    const state={
      pos:{},
      attacker:null,
      lastDefender:null,
      ballOwner:null,
      processed:new WeakSet()
    };

    function cloneBase(){
      state.pos={};

      Object.keys(base).forEach(name=>{
        state.pos[name]={
          x:base[name].x,
          y:base[name].y
        };
      });
    }

    function place(el,x,y){
      el.style.left=x+'%';
      el.style.top=y+'%';
    }

    function teamOf(name){
      return name==='YOU'||name==='BLUE 2'
        ?'blue'
        :'green';
    }

    function opponentGoalX(name){
      return teamOf(name)==='blue'
        ?96
        :4;
    }

    function clearPlayerClasses(){
      Object.values(players).forEach(el=>{
        el.classList.remove(
          'active',
          'blocking',
          'dribbleUp',
          'dribbleDown'
        );
      });
    }

    function showFlash(text){
      flash.textContent=text;
      flash.classList.add('show');

      clearTimeout(showFlash.timer);

      showFlash.timer=setTimeout(()=>{
        flash.classList.remove('show');
      },650);
    }

    function detectCurrentBallOwner(){
      if(document.querySelector('#H0 .possessionCard')){
        return'YOU';
      }

      if(document.querySelector('#H1 .possessionCard')){
        return'BLUE 2';
      }

      if(document.querySelector('#A0 .possessionCard')){
        return'GREEN 1';
      }

      if(document.querySelector('#A1 .possessionCard')){
        return'GREEN 2';
      }

      return null;
    }

    function moveBallToPlayer(name){
      if(!players[name])return;

      state.ballOwner=name;
      ball.classList.remove('goal');

      const p=state.pos[name];

      place(
        ball,
        p.x+(teamOf(name)==='blue'?4:-4),
        p.y-7
      );
    }

    function reset(){
      cloneBase();

      state.attacker=null;
      state.lastDefender=null;
      state.processed=new WeakSet();

      clearPlayerClasses();

      Object.keys(players).forEach(name=>{
        place(
          players[name],
          state.pos[name].x,
          state.pos[name].y
        );
      });

      state.ballOwner=
        detectCurrentBallOwner();

      ball.classList.remove('goal');

      if(state.ballOwner){
        moveBallToPlayer(
          state.ballOwner
        );
      }else{
        place(ball,50,50);
      }
    }

    function normalizeOwner(raw){
      const t=
        (raw||'')
        .trim()
        .toUpperCase();

      if(
        t==='YOU'||
        t.includes('BLUE 1')
      ){
        return'YOU';
      }

      if(t.includes('BLUE 2')){
        return'BLUE 2';
      }

      if(t.includes('GREEN 1')){
        return'GREEN 1';
      }

      if(t.includes('GREEN 2')){
        return'GREEN 2';
      }

      return null;
    }

    function shoot(name){
      if(!players[name])return;

      state.attacker=name;
      state.lastDefender=null;

      const p=state.pos[name];

      p.x+=
        teamOf(name)==='blue'
        ?12
        :-12;

      p.y=50;

      clearPlayerClasses();

      players[name]
        .classList
        .add('active');

      place(
        players[name],
        p.x,
        p.y
      );

      moveBallToPlayer(name);

      showFlash('SHOOT');
    }

    function defense(name){
      if(
        !players[name]||
        !state.attacker
      ){
        return;
      }

      state.lastDefender=name;

      const ap=
        state.pos[state.attacker];

      const dp=
        state.pos[name];

      dp.x=
        ap.x+
        (
          teamOf(state.attacker)==='blue'
          ?8
          :-8
        );

      dp.y=ap.y;

      players[name]
        .classList
        .add('blocking');

      place(
        players[name],
        dp.x,
        dp.y
      );

      showFlash('DEFENSE');
    }

    function dribble(name){
      if(!players[name])return;

      state.attacker=name;

      const p=state.pos[name];
      const el=players[name];

      const defender=
        state.lastDefender&&
        state.pos[state.lastDefender];

      const goDown=
        defender
        ?defender.y<=50
        :p.y<=50;

      el.classList.add(
        goDown
        ?'dribbleDown'
        :'dribbleUp'
      );

      showFlash(
        'DRIBBLE PAST'
      );

      setTimeout(()=>{
        p.y=
          goDown
          ?64
          :36;

        p.x+=
          teamOf(name)==='blue'
          ?11
          :-11;

        place(
          el,
          p.x,
          p.y
        );

        moveBallToPlayer(name);
      },160);

      setTimeout(()=>{
        el.classList.remove(
          'dribbleDown',
          'dribbleUp'
        );

        p.y=50;

        place(
          el,
          p.x,
          p.y
        );

        moveBallToPlayer(name);
      },430);
    }

    function tackle(name){
      if(!players[name])return;

      const target=
        state.ballOwner&&
        players[state.ballOwner]
        ?state.ballOwner
        :state.attacker;

      if(
        target&&
        state.pos[target]
      ){
        const tp=
          state.pos[target];

        const p=
          state.pos[name];

        p.x=
          tp.x+
          (
            teamOf(name)==='blue'
            ?-7
            :7
          );

        p.y=tp.y;

        place(
          players[name],
          p.x,
          p.y
        );
      }

      clearPlayerClasses();

      players[name]
        .classList
        .add('active');

      setTimeout(()=>{
        moveBallToPlayer(name);
      },220);

      showFlash('TACKLE');
    }

    function goal(){
      const scorer=
        state.attacker||
        state.ballOwner;

      if(!scorer)return;

      ball.classList.add('goal');

      place(
        ball,
        opponentGoalX(scorer),
        50
      );

      showFlash('GOAL!');
    }

    function parseBallTransfer(text){
      const t=text.toUpperCase();

      if(
        !t.includes('SOCCER CARD')
      ){
        return false;
      }

      if(
        t.includes('→ YOU')||
        t.includes('TO YOU')
      ){
        moveBallToPlayer('YOU');
        return true;
      }

      if(
        t.includes('→ BLUE 2')||
        t.includes('TO BLUE 2')
      ){
        moveBallToPlayer('BLUE 2');
        return true;
      }

      if(
        t.includes('→ GREEN 1')||
        t.includes('TO GREEN 1')
      ){
        moveBallToPlayer('GREEN 1');
        return true;
      }

      if(
        t.includes('→ GREEN 2')||
        t.includes('TO GREEN 2')||
        t.includes('→ GOALKEEPER')||
        t.includes('TO GOALKEEPER')
      ){
        moveBallToPlayer('GREEN 2');
        return true;
      }

      return false;
    }

    function processNode(node){
      if(
        state.processed.has(node)
      ){
        return;
      }

      state.processed.add(node);

      const text=
        (node.textContent||'')
        .trim();

      const upper=
        text.toUpperCase();

      if(
        node.classList
        .contains('playNode')
      ){
        const owner=
          normalizeOwner(
            node.querySelector('em')
              ?.textContent||
            ''
          );

        if(!owner)return;

        if(
          upper.includes(
            'DRIBBLE PAST'
          )
        ){
          dribble(owner);

        }else if(
          upper.includes(
            'DEFENSE'
          )
        ){
          defense(owner);

        }else if(
          upper.includes(
            'SHOOT'
          )
        ){
          shoot(owner);

        }else if(
          upper.includes(
            'TACKLE'
          )
        ){
          tackle(owner);
        }

        return;
      }

      if(
        node.classList
        .contains('resultChip')
      ){
        if(
          parseBallTransfer(text)
        ){
          return;
        }

        if(
          /\bGOAL\b/.test(upper)&&
          !upper.includes('WOULD-BE')&&
          !upper.includes('GOALKEEPER')
        ){
          goal();
        }

        return;
      }

      if(
        node.classList
        .contains('gsmPlayedSoccer')
      ){
        const holder=
          normalizeOwner(text);

        if(holder){
          moveBallToPlayer(holder);
        }
      }
    }

    function process(){
      [...played.children]
        .forEach(processNode);
    }

    new MutationObserver(
      process
    ).observe(
      played,
      {
        childList:true,
        subtree:true
      }
    );

    const lessonNo=
      document.getElementById(
        'lessonNo'
      );

    if(lessonNo){
      new MutationObserver(()=>{
        reset();

        setTimeout(
          process,
          40
        );
      }).observe(
        lessonNo,
        {
          childList:true,
          characterData:true,
          subtree:true
        }
      );
    }

    const pitchObserver=
      new MutationObserver(()=>{
        const holder=
          detectCurrentBallOwner();

        if(
          holder&&
          holder!==state.ballOwner
        ){
          moveBallToPlayer(holder);
        }
      });

    pitchObserver.observe(
      pitch,
      {
        childList:true,
        subtree:true
      }
    );

    reset();
    process();
  }

  if(
    document.readyState===
    'loading'
  ){
    document.addEventListener(
      'DOMContentLoaded',
      ()=>{
        install();

        setTimeout(
          install,
          120
        );
      },
      {once:true}
    );
  }else{
    install();

    setTimeout(
      install,
      120
    );
  }
})();
