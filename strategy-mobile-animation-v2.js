/* Goal-Scoring Moment - Mobile Strategy Tutorial Pitch Animation
 * Visual-only layer. Does not change tutorial/game logic.
 */
(function(){
  const frame=document.getElementById('game');
  if(!frame)return;

  function install(){
    try{
      const w=frame.contentWindow;
      const d=frame.contentDocument;
      if(!w||!d||!d.head||!d.body)return;
      if(!w.matchMedia('(max-width:760px)').matches)return;
      if(d.getElementById('gsm-mobile-match-animation-style'))return;

      const pitch=d.querySelector('.pitch');
      const played=d.getElementById('played');
      if(!pitch||!played)return;

      const style=d.createElement('style');
      style.id='gsm-mobile-match-animation-style';
      style.textContent=`
        @media(max-width:760px){
          .gsmMobileAnimLayer{
            position:absolute;
            inset:0;
            z-index:9;
            pointer-events:none;
            overflow:hidden;
          }

          .gsmPlayer{
            position:absolute;
            width:24px;
            height:34px;
            transform:translate(-50%,-50%);
            transition:left .42s ease,top .42s ease,transform .22s ease;
            filter:drop-shadow(0 3px 4px #0008);
          }

          .gsmPlayer .head{
            position:absolute;
            left:50%;
            top:0;
            width:10px;
            height:10px;
            border-radius:50%;
            transform:translateX(-50%);
            background:currentColor;
          }

          .gsmPlayer .body{
            position:absolute;
            left:50%;
            top:9px;
            width:8px;
            height:14px;
            border-radius:5px 5px 3px 3px;
            transform:translateX(-50%);
            background:currentColor;
          }

          .gsmPlayer .arm,
          .gsmPlayer .leg{
            position:absolute;
            width:4px;
            height:13px;
            border-radius:3px;
            background:currentColor;
            transform-origin:50% 0;
          }

          .gsmPlayer .arm.left{
            left:5px;
            top:11px;
            transform:rotate(24deg);
          }

          .gsmPlayer .arm.right{
            right:5px;
            top:11px;
            transform:rotate(-24deg);
          }

          .gsmPlayer .leg.left{
            left:8px;
            top:21px;
            transform:rotate(14deg);
          }

          .gsmPlayer .leg.right{
            right:8px;
            top:21px;
            transform:rotate(-14deg);
          }

          .gsmPlayer.blue{
            color:var(--blue);
          }

          .gsmPlayer.green{
            color:var(--green);
          }

          .gsmPlayer.active{
            filter:
              drop-shadow(0 0 6px var(--gold))
              drop-shadow(0 3px 4px #0008);
          }

          .gsmPlayer.blocking{
            transform:translate(-50%,-50%) scale(1.12);
          }

          .gsmPlayer.dribbleUp{
            transform:
              translate(-50%,-50%)
              translateY(-24px)
              rotate(-8deg);
          }

          .gsmPlayer.dribbleDown{
            transform:
              translate(-50%,-50%)
              translateY(24px)
              rotate(8deg);
          }

          .gsmSoccerVisual{
            position:absolute;
            width:30px;
            height:30px;
            object-fit:contain;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            transition:
              left .45s ease,
              top .45s ease,
              transform .25s ease;
            filter:drop-shadow(0 3px 5px #0008);
          }

          .gsmSoccerVisual.goal{
            transform:
              translate(-50%,-50%)
              scale(1.18)
              rotate(8deg);
          }

          .gsmAnimFlash{
            position:absolute;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            padding:4px 7px;
            border-radius:999px;
            background:var(--gold);
            color:var(--ink);
            font-size:8px;
            font-weight:950;
            opacity:0;
            transition:
              opacity .18s ease,
              transform .18s ease;
            white-space:nowrap;
          }

          .gsmAnimFlash.show{
            opacity:1;
            transform:
              translate(-50%,-50%)
              scale(1.06);
          }
        }
      `;
      d.head.appendChild(style);

      const layer=d.createElement('div');
      layer.className='gsmMobileAnimLayer';

      layer.innerHTML=`
        <div class="gsmPlayer blue" data-team="blue">
          <i class="head"></i>
          <i class="body"></i>
          <i class="arm left"></i>
          <i class="arm right"></i>
          <i class="leg left"></i>
          <i class="leg right"></i>
        </div>

        <div class="gsmPlayer green" data-team="green">
          <i class="head"></i>
          <i class="body"></i>
          <i class="arm left"></i>
          <i class="arm right"></i>
          <i class="leg left"></i>
          <i class="leg right"></i>
        </div>

        <img
          class="gsmSoccerVisual"
          src="images/soccer-card.png"
          alt=""
        >

        <div class="gsmAnimFlash"></div>
      `;

      pitch.appendChild(layer);

      const blue=layer.querySelector('[data-team="blue"]');
      const green=layer.querySelector('[data-team="green"]');
      const ball=layer.querySelector('.gsmSoccerVisual');
      const flash=layer.querySelector('.gsmAnimFlash');

      const state={
        blue:{x:30,y:66},
        green:{x:70,y:34},
        attacker:null,
        processed:new WeakSet()
      };

      function place(el,x,y){
        el.style.left=x+'%';
        el.style.top=y+'%';
      }

      function reset(){
        state.blue={x:30,y:66};
        state.green={x:70,y:34};
        state.attacker=null;
        state.processed=new WeakSet();

        blue.className='gsmPlayer blue';
        green.className='gsmPlayer green';

        place(blue,30,66);
        place(green,70,34);

        ball.classList.remove('goal');
        place(ball,50,50);
      }

      function teamFromOwner(owner){
        const t=(owner||'').toUpperCase();

        if(
          t.includes('YOU')||
          t.includes('BLUE')
        ){
          return'blue';
        }

        if(t.includes('GREEN')){
          return'green';
        }

        return null;
      }

      function player(team){
        return team==='blue'?blue:green;
      }

      function pos(team){
        return state[team];
      }

      function other(team){
        return team==='blue'?'green':'blue';
      }

      function showFlash(text){
        flash.textContent=text;
        flash.classList.add('show');

        clearTimeout(showFlash.timer);

        showFlash.timer=setTimeout(()=>{
          flash.classList.remove('show');
        },700);
      }

      function shoot(team){
        if(!team)return;

        state.attacker=team;

        const p=pos(team);

        p.x+=team==='blue'?12:-12;
        p.y=50;

        blue.classList.remove('active');
        green.classList.remove('active');

        player(team).classList.add('active');

        place(
          player(team),
          p.x,
          p.y
        );

        place(
          ball,
          p.x+(team==='blue'?4:-4),
          p.y
        );

        showFlash('SHOOT');
      }

      function defense(team){
        if(!team)return;

        const attacker=
          state.attacker||
          other(team);

        const ap=pos(attacker);
        const dp=pos(team);

        dp.x=
          ap.x+
          (attacker==='blue'?8:-8);

        dp.y=ap.y;

        blue.classList.remove('blocking');
        green.classList.remove('blocking');

        player(team).classList.add('blocking');

        place(
          player(team),
          dp.x,
          dp.y
        );

        showFlash('DEFENSE');
      }

      function dribble(team){
        if(!team)return;

        state.attacker=team;

        const p=pos(team);
        const el=player(team);

        const curve=
          p.y<=50?
          'dribbleDown':
          'dribbleUp';

        el.classList.add(curve);

        showFlash('DRIBBLE PAST');

        setTimeout(()=>{
          p.x+=team==='blue'?12:-12;
          p.y=50;

          place(
            el,
            p.x,
            p.y
          );

          place(
            ball,
            p.x+(team==='blue'?4:-4),
            p.y
          );
        },170);

        setTimeout(()=>{
          el.classList.remove(curve);
        },470);
      }

      function tackle(team){
        if(!team)return;

        state.attacker=team;

        const p=pos(team);

        place(
          ball,
          p.x,
          p.y-8
        );

        player(team)
          .classList
          .add('active');

        showFlash('TACKLE');
      }

      function goal(){
        const team=
          state.attacker||
          'blue';

        ball.classList.add('goal');

        place(
          ball,
          team==='blue'?96:4,
          50
        );

        showFlash('GOAL!');
      }

      function parseNode(node){
        if(state.processed.has(node)){
          return;
        }

        state.processed.add(node);

        const txt=
          (node.textContent||'')
          .trim()
          .toUpperCase();

        const owner=
          (
            node.querySelector('em')
            ?.textContent||
            ''
          ).trim();

        const team=
          teamFromOwner(owner);

        if(
          node
          .classList
          .contains('playNode')
        ){
          if(
            txt.includes('DRIBBLE PAST')
          ){
            dribble(team);
          }else if(
            txt.includes('DEFENSE')
          ){
            defense(team);
          }else if(
            txt.includes('SHOOT')
          ){
            shoot(team);
          }else if(
            txt.includes('TACKLE')
          ){
            tackle(team);
          }
        }else if(
          node
          .classList
          .contains('resultChip')
        ){
          if(
            /\bGOAL\b/.test(txt)&&
            !txt.includes('WOULD-BE')
          ){
            goal();
          }
        }
      }

      function process(){
        [...played.children]
          .forEach(parseNode);
      }

      new w.MutationObserver(
        process
      ).observe(
        played,
        {
          childList:true,
          subtree:true
        }
      );

      const lessonNo=
        d.getElementById('lessonNo');

      if(lessonNo){
        new w.MutationObserver(()=>{
          reset();

          setTimeout(
            process,
            30
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

      reset();
      process();

    }catch(err){
      console.error(
        'Mobile match animation install failed',
        err
      );
    }
  }

  frame.addEventListener(
    'load',
    ()=>{
      install();

      setTimeout(
        install,
        150
      );

      setTimeout(
        install,
        500
      );
    }
  );

  if(
    frame.contentDocument&&
    frame.contentDocument.readyState!==
    'loading'
  ){
    install();
  }

})();
