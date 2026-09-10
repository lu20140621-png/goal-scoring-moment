/* Dedicated dialogue state machine for Lessons 1–3. Gameplay begins untouched at Lesson 4. */
(() => {
  'use strict';

  const TYPE_MS = 14;
  const PREP_TEXT = 'Before we start, take out the BLUE Team GOALKEEPER and PLAYER, the GREEN Team GOALKEEPER and PLAYER, 1 SOCCER card, and any 1 ACTION card. Put the GREEN Goalkeeper and Player on the opposite side. Keep the BLUE Goalkeeper, BLUE Player, SOCCER, and ACTION card closest to you — these are the four cards you’ll follow with me.';
  const state = { lesson: -1, step: 0, typing: false, locked: false, drawn: false, timer: 0, fullText: '' };
  let scene;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const player = id => document.querySelector(`[data-player="${id}"]`);

  function ensurePrepStyle() {
    if (document.getElementById('gsm-native-physical-prep-style')) return;
    const style = document.createElement('style');
    style.id = 'gsm-native-physical-prep-style';
    style.textContent = `
      .physicalPrepTray{max-width:100%;margin:10px 0 2px;padding:10px;border:2px solid #d7b33a;border-radius:14px;background:linear-gradient(180deg,#fff8d8,#f4f8fc);box-shadow:0 7px 18px #17324f24;overflow:hidden;animation:physicalPrepIn .28s ease-out}
      .physicalPrepTitle{display:block;margin-bottom:8px;color:#6d5100;font-size:9px;line-height:1.25;font-weight:950;letter-spacing:.06em;text-align:center;white-space:normal}
      .physicalPrepCards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;min-width:0}
      .physicalPrepCard{position:relative;min-width:0;padding:18px 4px 6px;border:1px solid #bfd0df;border-radius:10px;background:#fff;text-align:center;box-shadow:0 3px 8px #17324f1f;overflow:hidden}
      .physicalPrepCard.blueRole{border-color:#4c91d4;background:#f3f8ff}
      .physicalPrepTeam{position:absolute;left:4px;right:4px;top:4px;border-radius:999px;padding:2px 3px;color:#fff;font-size:6px;line-height:1;font-weight:950;letter-spacing:.08em;white-space:nowrap}
      .physicalPrepTeam.blue{background:#2876d2}.physicalPrepTeam.neutral{background:#526d82}
      .physicalPrepCard img{display:block;width:58px;height:80px;max-width:100%;margin:0 auto 4px;object-fit:contain;filter:drop-shadow(0 4px 5px #0003)}
      .physicalPrepCard b{display:block;color:#183c60;font-size:7px;line-height:1.15;font-weight:950}
      .physicalPrepHint{margin-top:7px;color:#496174;font-size:7.5px;line-height:1.35;font-weight:800;text-align:center}
      .guideDialogue.physicalPrepActive{padding-right:18px;padding-bottom:62px}
      .guideDialogue.physicalPrepActive .guideContinue{right:12px;bottom:10px;width:auto;min-width:94px;height:40px;padding:0 14px;border-radius:999px;font-size:10px;line-height:1;white-space:nowrap}
      @keyframes physicalPrepIn{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
      @media(max-width:760px){
        .guideScene.physicalPrepScene .guidePortrait{flex:0 0 76px!important;width:76px!important;height:96px!important}
        .guideDialogue.physicalPrepActive{padding:10px 8px 54px!important}
        .guideDialogue.physicalPrepActive .guideContinue{right:7px;bottom:7px;min-width:84px;height:36px;padding:0 12px;font-size:9px}
        .physicalPrepTray{margin:7px 0 1px;padding:7px 6px;border-radius:11px}
        .physicalPrepTitle{font-size:7px;margin-bottom:5px;letter-spacing:.04em}
        .physicalPrepCards{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}
        .physicalPrepCard{padding:16px 2px 4px}
        .physicalPrepCard img{width:44px;height:61px;margin-bottom:2px}
        .physicalPrepCard b{font-size:5.8px}
        .physicalPrepTeam{left:3px;right:3px;top:3px;font-size:5.5px;padding:2px}
        .physicalPrepHint{font-size:6.4px;margin-top:5px}
      }
      @media(max-width:350px){
        .guideScene.physicalPrepScene .guidePortrait{flex-basis:68px!important;width:68px!important;height:86px!important}
        .physicalPrepCard img{width:38px;height:53px}
      }
    `;
    document.head.appendChild(style);
  }

  function showPrepTray() {
    ensurePrepStyle();
    hidePrepTray();
    const dialogue = scene.querySelector('.guideDialogue');
    const text = scene.querySelector('.guideText');
    dialogue.classList.add('physicalPrepActive');
    scene.classList.add('physicalPrepScene');
    const tray = document.createElement('div');
    tray.className = 'physicalPrepTray';
    tray.setAttribute('aria-label','Four cards shown for guided practice');
    tray.innerHTML = `
      <div class="physicalPrepTitle">🃏 FOLLOW ALONG WITH THESE 4 CARDS</div>
      <div class="physicalPrepCards">
        <div class="physicalPrepCard blueRole"><span class="physicalPrepTeam blue">BLUE TEAM</span><img src="images/goalkeeper-card.webp" alt="Blue Team Goalkeeper"><b>GOALKEEPER</b></div>
        <div class="physicalPrepCard blueRole"><span class="physicalPrepTeam blue">BLUE TEAM</span><img src="images/player-card.webp" alt="Blue Team Player"><b>PLAYER</b></div>
        <div class="physicalPrepCard"><span class="physicalPrepTeam neutral">TAKE 1</span><img src="images/soccer-card.webp" alt="Soccer card"><b>SOCCER</b></div>
        <div class="physicalPrepCard"><span class="physicalPrepTeam neutral">ANY 1</span><img src="images/shoot-card.webp" alt="Example Action card"><b>ACTION CARD</b></div>
      </div>
      <div class="physicalPrepHint">Keep the GREEN Goalkeeper and Player on the opposite side. These four cards stay closest to you for the guided practice.</div>`;
    text.insertAdjacentElement('afterend', tray);
  }

  function hidePrepTray() {
    document.querySelector('.physicalPrepTray')?.remove();
    if (!scene) return;
    scene.classList.remove('physicalPrepScene');
    const dialogue = scene.querySelector('.guideDialogue');
    dialogue?.classList.remove('physicalPrepActive');
  }

  function ensureScene() {
    if (scene) return scene;
    scene = document.createElement('section');
    scene.className = 'guideScene';
    scene.innerHTML = '<div class="guidePortrait" role="img" aria-label="Football coach"></div><div class="guideDialogue" role="button" tabindex="0" aria-label="Coach dialogue"><span class="guideSpeaker">COACH</span><p class="guideText" aria-live="polite"></p><button class="guideContinue" type="button" aria-label="Continue">›</button></div>';
    document.querySelector('.board').after(scene);
    const portrait = scene.querySelector('.guidePortrait');
    const probe = new Image();
    probe.onload = () => { portrait.style.backgroundImage = `url("${probe.src}")`; portrait.classList.add('hasImage'); };
    probe.src = 'images/coach-guide.webp';
    const advance = event => {
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      onDialogueTap();
    };
    scene.querySelector('.guideDialogue').addEventListener('click', advance);
    scene.querySelector('.guideDialogue').addEventListener('keydown', advance);
    return scene;
  }

  function clearVisuals() {
    clearTimeout(state.timer);
    hidePrepTray();
    document.body.classList.remove('guideBright');
    playerEls().forEach(el => el.classList.remove('guideDim', 'guideFocus', 'guideWrong'));
    document.querySelectorAll('.teamChip').forEach(el => el.classList.remove('guideFocus'));
    document.querySelectorAll('.teamLink,.tokenDemo,.drawCardFlight').forEach(el => el.remove());
    setPitchEvent('');
  }

  function type(text, doneLabel = '', waitForAction = false) {
    clearTimeout(state.timer);
    state.fullText = text;
    state.typing = true;
    state.locked = false;
    const output = scene.querySelector('.guideText');
    const arrow = scene.querySelector('.guideContinue');
    output.textContent = '';
    arrow.hidden = true;
    arrow.textContent = doneLabel || '›';
    let index = 0;
    const tick = () => {
      output.textContent = text.slice(0, ++index);
      if (index < text.length) state.timer = setTimeout(tick, TYPE_MS);
      else { state.typing = false; arrow.hidden = waitForAction; }
    };
    tick();
  }

  function finishTyping() {
    clearTimeout(state.timer);
    scene.querySelector('.guideText').textContent = state.fullText;
    scene.querySelector('.guideContinue').hidden = state.step === 2 && state.lesson === 2 || state.step === 4 && state.lesson === 1;
    state.typing = false;
  }

  async function guarded(action) {
    if (state.locked) return;
    state.locked = true;
    scene.classList.add('locked');
    await action();
    await delay(120);
    state.locked = false;
    scene.classList.remove('locked');
  }

  function focus(ids) {
    playerEls().forEach(el => {
      el.classList.toggle('guideFocus', ids.includes(el.dataset.player));
      el.classList.toggle('guideDim', !ids.includes(el.dataset.player));
    });
  }

  function completeIntroLesson() {
    guarded(async () => {
      clearVisuals();
      current++;
      if (current === 3) {
        document.body.classList.remove('introGuide');
        scene.hidden = true;
      }
      setupLesson();
    });
  }

  function onDialogueTap() {
    if (state.locked) return;
    if (state.typing) { finishTyping(); return; }
    if (state.lesson === 0) lessonOneNext();
    else if (state.lesson === 1) lessonTwoNext();
    else if (state.lesson === 2) lessonThreeNext();
  }

  function lessonOneNext() {
    if (state.step === 0) {
      state.step = 1;
      showPrepTray();
      type(PREP_TEXT, 'READY →');
    } else if (state.step === 1) {
      state.step = 2;
      hidePrepTray();
      document.querySelectorAll('.teamChip').forEach(el => el.classList.add('guideFocus'));
      type('Your goal is to pressure the other team and find their hidden Goalkeeper.');
    } else if (state.step === 2) {
      guarded(async () => {
        state.step = 3;
        document.querySelectorAll('.teamChip').forEach(el => el.classList.remove('guideFocus'));
        focus(['A0']);
        type('A player is eliminated when they reach 3 Tokens.');
        const demo = document.createElement('div');
        demo.className = 'tokenDemo';
        $('pitch').appendChild(demo);
        for (const dots of ['○ ○ ○','● ○ ○','● ● ○','● ● ●']) { demo.textContent = dots; await delay(330); }
      });
    } else if (state.step === 3) {
      guarded(async () => {
        state.step = 4;
        document.querySelector('.tokenDemo')?.remove();
        const role = player('A0').querySelector('.role strong');
        role.textContent = 'GOALKEEPER';
        setPitchEvent('GOALKEEPER FOUND', 'good');
        type('If the eliminated player is the Goalkeeper, their team loses immediately.', 'GOT IT →');
        await delay(650);
      });
    } else completeIntroLesson();
  }

  function lessonTwoNext() {
    if (state.step === 0) { state.step=1; focus(['H1']); type('BLUE 2 is your teammate.'); const link=document.createElement('div');link.className='teamLink';link.textContent='YOU ← TEAMMATES → BLUE 2';$('pitch').appendChild(link);setTimeout(()=>link.remove(),1100); }
    else if (state.step === 1) { state.step=2; document.querySelector('.teamLink')?.remove();focus(['A0','A1']);type('GREEN 1 and GREEN 2 are your opponents.'); }
    else if (state.step === 2) { state.step=3;focus(['H0','H1','A0','A1']);type('Teams are public.\nRoles can stay hidden.'); }
    else if (state.step === 3) { state.step=4;playerEls().forEach(el=>{el.classList.remove('guideFocus','guideDim');el.disabled=false});type('Quick check.\nTap your teammate.','',true); }
    else if (state.step === 5) completeIntroLesson();
  }

  function handleTeammate(id) {
    if (state.lesson !== 1 || state.step !== 4 || state.locked) return;
    guarded(async () => {
      const chosen = player(id);
      if (id === 'H1') {
        state.step = 5;
        playerEls().forEach(el => el.disabled = true);
        chosen.classList.add('guideFocus');
        setPitchEvent('TEAMMATE FOUND ✓', 'good');
        type('Exactly. BLUE 2 is on your side.', 'CONTINUE →');
      } else {
        chosen.classList.remove('guideWrong'); void chosen.offsetWidth; chosen.classList.add('guideWrong');
        type(id === 'H0' ? 'That’s you. Who is your teammate?' : 'That’s the other team. Try again.','',true);
        await delay(380);
      }
    });
  }

  function lessonThreeNext() {
    if (state.step === 0) { state.step=1;setPitchEvent('YOUR TURN','good');type('Every turn includes one required draw.'); }
    else if (state.step === 1) {
      state.step=2;
      scene.querySelector('.guideContinue').hidden=true;
      type('Draw one card to continue.','',true);
      const button=addAction('DRAW 1 CARD',drawCard,'blue');button.id='introDrawButton';
    } else if (state.step === 3) { state.step=4;document.body.classList.add('guideBright');type('From here on, you’ll start making the decisions yourself.'); }
    else if (state.step === 4) { state.step=5;type('Ready? Let’s learn who controls the Soccer Card.','ENTER THE MATCH →'); }
    else if (state.step === 5) completeIntroLesson();
  }

  async function drawCard() {
    if (state.lesson !== 2 || state.step !== 2 || state.drawn || state.locked) return;
    state.drawn = true;
    await guarded(async () => {
      const button = $('introDrawButton');
      button.disabled = true;
      const start = button.getBoundingClientRect();
      const flight = document.createElement('img');
      flight.className = 'drawCardFlight'; flight.src = ASSETS.YELLOW; flight.alt = '';
      flight.style.left = `${start.left + start.width/2 - 36}px`; flight.style.top = `${start.top - 105}px`;
      document.body.appendChild(flight);
      await delay(30);
      const target = $('hand').getBoundingClientRect();
      flight.style.transform = `translate(${target.left+target.width/2-start.left-36}px,${target.top-start.top+70}px) scale(1.08)`;
      await delay(580);
      flight.remove(); handCards=['YELLOW']; renderHand([]); $('hand').querySelector('.cardBtn')?.classList.add('guideNewCard');
      $('contextActions').innerHTML=''; addResult('1 CARD DRAWN','good'); state.step=3;
      type('Nice. You completed the required draw.');
    });
  }

  function start(lesson) {
    ensureScene(); clearVisuals();
    state.lesson=lesson;state.step=0;state.typing=false;state.locked=false;state.drawn=false;
    document.body.classList.add('introGuide');
    scene.hidden=false;$('contextActions').innerHTML='';$('handNote').textContent='GUIDED INTRO';renderHand();
    if (lesson===0) type('Welcome to Goal-Scoring Moment.\nI’ll show you how the game works.');
    if (lesson===1) { focus(['H0']);type('You’re on the BLUE Team.'); }
    if (lesson===2) { setPitchEvent('YOUR TURN','good');type('Now let’s learn what happens on your turn.'); }
  }

  function stop() {
    clearVisuals();
    document.body.classList.remove('introGuide');
    if (scene) scene.hidden = true;
  }

  window.StrategyIntroGuide = { start, stop, player: handleTeammate, state };
})();
