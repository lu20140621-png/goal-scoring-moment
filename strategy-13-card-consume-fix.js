/* Keep the visible hand synchronized with the real handCards array.
   Core lesson handlers consume cards in state, but some lesson completions did not repaint the hand. */
(() => {
  'use strict';
  if (window.__gsmStrategy13CardConsumeFixInstalled) return;
  window.__gsmStrategy13CardConsumeFixInstalled = true;

  if (typeof handleCard !== 'function') return;

  const previousHandleCard = handleCard;
  handleCard = function(name, index) {
    const beforeLength = Array.isArray(handCards) ? handCards.length : 0;
    const result = previousHandleCard(name, index);

    if (Array.isArray(handCards) && handCards.length < beforeLength && typeof renderHand === 'function') {
      renderHand();
    }
    return result;
  };
})();

/* SECOND DEFENSE lesson — replay the entire attack.
   The learner personally plays BOTH the first and second DEFENSE cards:
   GREEN 1 SHOOT → YOU DEFENSE → GREEN 1 DRIBBLE PAST → YOU DEFENSE → DISCARD 1. */
(() => {
  'use strict';
  if (window.__gsmSecondDefenseFullFlowInstalled) return;
  window.__gsmSecondDefenseFullFlowInstalled = true;
  if (typeof setupLesson !== 'function' || typeof handleCard !== 'function') return;

  let opponentReplyPending = false;
  let sequenceToken = 0;

  const lesson = Array.isArray(lessons) ? lessons.find(item => item && item.mode === 'secondDefense') : null;
  if (lesson) {
    lesson.sub = 'Play the complete two-DEFENSE chain yourself.';
    lesson.rule = 'A fresh SHOOT begins. You play the first DEFENSE. If the attacker answers with DRIBBLE PAST, the same SHOOT continues and you may play a second DEFENSE. After that second DEFENSE, discard 1 card.';
    lesson.prompt = 'GREEN 1 starts a fresh SHOOT at you. Play your FIRST DEFENSE.';
    lesson.hand = ['DEFENSE', 'DEFENSE', 'YELLOW', 'TACKLE'];
  }

  function isSecondDefenseLesson() {
    return typeof current === 'number' && lessons[current] && lessons[current].mode === 'secondDefense';
  }

  function sayCoach(text) {
    const scene = document.querySelector('.guideScene');
    const output = scene?.querySelector('.guideText');
    const button = scene?.querySelector('.guideContinue');
    const guideState = window.StrategyIntroGuide?.state;
    if (guideState?.timer) clearTimeout(guideState.timer);
    if (guideState) {
      guideState.fullText = text;
      guideState.typing = false;
      guideState.locked = false;
      guideState.waitForAction = true;
    }
    if (output) output.textContent = text;
    if (button) button.hidden = true;
  }

  function repaintHand() {
    if (typeof renderHand === 'function') renderHand(['DEFENSE']);
  }

  const previousSetupLesson = setupLesson;
  setupLesson = function() {
    const result = previousSetupLesson();
    sequenceToken++;
    opponentReplyPending = false;

    if (!isSecondDefenseLesson()) return result;

    stage = 0;
    ballOwner = 'A0';
    handCards = ['DEFENSE', 'DEFENSE', 'YELLOW', 'TACKLE'];

    if (typeof clearFlow === 'function') clearFlow();
    if (typeof renderPlayers === 'function') renderPlayers();
    document.querySelectorAll('.player.defending').forEach(el => el.classList.remove('defending'));
    if (typeof addCard === 'function') addCard('SHOOT', 'GREEN 1', 'SHOOT → YOU');
    if (typeof setTarget === 'function') setTarget('H0');
    repaintHand();

    const prompt = typeof $ === 'function' ? $('promptText') : null;
    if (prompt) prompt.textContent = 'GREEN 1 starts a fresh SHOOT at you. Play your FIRST DEFENSE.';
    const handNote = typeof $ === 'function' ? $('handNote') : null;
    if (handNote) handNote.textContent = 'STEP 1 · PLAY YOUR FIRST DEFENSE';
    if (typeof hideFeedback === 'function') hideFeedback();
    if (typeof setPitchEvent === 'function') setPitchEvent('GREEN 1 SHOOTS → YOUR FIRST DEFENSE', 'bad');
    return result;
  };

  const previousHandleCard = handleCard;
  handleCard = function(name, index) {
    if (!isSecondDefenseLesson()) return previousHandleCard(name, index);
    if (opponentReplyPending) return;

    if (stage === 0) {
      if (name !== 'DEFENSE') {
        if (typeof wrong === 'function') wrong('Start the new attack by playing your FIRST DEFENSE against GREEN 1’s SHOOT.');
        return;
      }

      if (typeof removeHandIndex === 'function') removeHandIndex(index);
      if (typeof addCard === 'function') addCard('DEFENSE', 'YOU', 'FIRST DEFENSE');
      if (typeof setDefender === 'function') setDefender('H0');
      if (typeof addResult === 'function') addResult('FIRST DEFENSE PLAYED', 'good');
      stage = 1;
      repaintHand();
      opponentReplyPending = true;

      const prompt = typeof $ === 'function' ? $('promptText') : null;
      if (prompt) prompt.textContent = 'Good. GREEN 1 now responds to your first DEFENSE.';
      const handNote = typeof $ === 'function' ? $('handNote') : null;
      if (handNote) handNote.textContent = 'GREEN 1 IS RESPONDING';
      if (typeof feedback === 'function') feedback('Good — that was your first DEFENSE. Watch GREEN 1 respond with DRIBBLE PAST.');
      if (typeof setPitchEvent === 'function') setPitchEvent('FIRST DEFENSE → GREEN 1 RESPONDS', 'warn');

      const myToken = sequenceToken;
      setTimeout(() => {
        if (!isSecondDefenseLesson() || sequenceToken !== myToken || stage !== 1) return;
        if (typeof addCard === 'function') addCard('DRIBBLE PAST', 'GREEN 1', 'BYPASS YOUR DEFENSE');
        if (typeof addResult === 'function') addResult('ATTACK CONTINUES', 'warn');
        stage = 2;
        opponentReplyPending = false;
        repaintHand();
        const nextPrompt = typeof $ === 'function' ? $('promptText') : null;
        if (nextPrompt) nextPrompt.textContent = 'GREEN 1 used DRIBBLE PAST. The SAME SHOOT is still live. Now play your SECOND DEFENSE.';
        const nextHandNote = typeof $ === 'function' ? $('handNote') : null;
        if (nextHandNote) nextHandNote.textContent = 'STEP 2 · PLAY YOUR SECOND DEFENSE';
        if (typeof setPitchEvent === 'function') setPitchEvent('DRIBBLE PAST → YOUR SECOND DEFENSE', 'bad');
        sayCoach('Exactly — you played the first DEFENSE yourself. GREEN 1 now uses DRIBBLE PAST to bypass it, so the original SHOOT becomes live again. Now YOU play DEFENSE one more time as the second DEFENSE.');
      }, 650);
      return;
    }

    if (stage === 2) {
      if (name !== 'DEFENSE') {
        if (typeof wrong === 'function') wrong('DRIBBLE PAST bypassed your first DEFENSE. The same SHOOT is live again, so play your SECOND DEFENSE.');
        return;
      }

      if (typeof removeHandIndex === 'function') removeHandIndex(index);
      if (typeof addCard === 'function') addCard('DEFENSE', 'YOU', 'SECOND DEFENSE');
      ballOwner = 'H0';
      stage = 3;
      if (typeof renderPlayers === 'function') renderPlayers();
      if (typeof setDefender === 'function') setDefender('H0');
      if (typeof addResult === 'function') addResult('SECOND DEFENSE SUCCESS', 'good');
      if (typeof addResult === 'function') addResult('SOCCER CARD → YOU', 'good');
      if (typeof renderHand === 'function') renderHand(handCards);

      const prompt = typeof $ === 'function' ? $('promptText') : null;
      if (prompt) prompt.textContent = 'Second DEFENSE succeeded. Now choose 1 remaining card to discard.';
      const handNote = typeof $ === 'function' ? $('handNote') : null;
      if (handNote) handNote.textContent = 'STEP 3 · DISCARD 1 REMAINING CARD';
      if (typeof setPitchEvent === 'function') setPitchEvent('SECOND DEFENSE → NOW DISCARD 1', 'good');
      if (typeof feedback === 'function') feedback('Good. You personally played both DEFENSE cards. Now discard any 1 remaining card.');
      sayCoach('Good — that was your second DEFENSE. You have now played both defensive responses yourself. To finish this rule, choose 1 remaining card from your hand and discard it.');
      return;
    }

    if (stage === 3) {
      if (typeof removeHandIndex === 'function') removeHandIndex(index);
      if (typeof addCard === 'function') addCard(name, 'YOU', 'DISCARD 1');
      stage = 4;
      if (typeof renderHand === 'function') renderHand([]);
      if (typeof addResult === 'function') addResult('DISCARD COMPLETE', 'warn');
      if (typeof complete === 'function') complete('You played the complete chain yourself: GREEN 1 SHOOT → your first DEFENSE → GREEN 1 DRIBBLE PAST → your second DEFENSE → discard 1.');
      return;
    }
  };
})();