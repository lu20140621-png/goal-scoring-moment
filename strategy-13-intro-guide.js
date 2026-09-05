/* Dedicated dialogue state machine for Lessons 1–3. Gameplay begins untouched at Lesson 4. */
(() => {
  'use strict';

  const TYPE_MS = 14;
  const state = { lesson: -1, step: 0, typing: false, locked: false, drawn: false, timer: 0, fullText: '' };
  let scene;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const player = id => document.querySelector(`[data-player="${id}"]`);

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
      document.querySelectorAll('.teamChip').forEach(el => el.classList.add('guideFocus'));
      type('Your goal is to pressure the other team and find their hidden Goalkeeper.');
    } else if (state.step === 1) {
      guarded(async () => {
        state.step = 2;
        document.querySelectorAll('.teamChip').forEach(el => el.classList.remove('guideFocus'));
        focus(['A0']);
        type('A player is eliminated when they reach 3 Tokens.');
        const demo = document.createElement('div');
        demo.className = 'tokenDemo';
        $('pitch').appendChild(demo);
        for (const dots of ['○ ○ ○','● ○ ○','● ● ○','● ● ●']) { demo.textContent = dots; await delay(330); }
      });
    } else if (state.step === 2) {
      guarded(async () => {
        state.step = 3;
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
