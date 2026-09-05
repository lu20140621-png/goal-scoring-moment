/* More explicit coach instructions for Lessons 4–13. */
(() => {
  'use strict';
  if (window.__gsmCoachDetailV3Installed) return;
  window.__gsmCoachDetailV3Installed = true;

  const guide = window.StrategyIntroGuide;
  if (!guide || typeof guide.stop !== 'function') return;

  const DETAIL = {
    3: 'Look at the field and find the Soccer Card. Then tap the player who is holding it. That player has possession and controls the ball.',
    4: 'You have the Soccer Card. To PASS, tap BLUE 2, your teammate. Passing changes possession and does not use a PASS card.',
    5: 'First, play the SHOOT card from your hand. Then tap a GREEN opponent to choose your target. You need possession plus SHOOT to attack.',
    6: 'GREEN 1 already has 2 Tokens. First, play SHOOT. Then tap GREEN 1 as your target. A successful attack gives the 3rd Token and eliminates that player.',
    7: 'GREEN 1 has played SHOOT at you. Play DEFENSE to stop the attack. TACKLE only takes the Soccer Card from a player; it cannot stop an incoming SHOOT. YELLOW does not stop an attack.',
    8: 'GREEN 2 has the Soccer Card. Play TACKLE to take the Soccer Card and win possession. TACKLE is for taking possession, not for defending a SHOOT.',
    9: 'Your SHOOT was stopped by DEFENSE. Play DRIBBLE PAST from your hand to bypass that DEFENSE and continue the same attack.',
    10: 'The attack is still active after DRIBBLE PAST. First, play DEFENSE to stop the attack. Then choose one remaining card from your hand to discard.',
    11: 'It is your turn. Play YELLOW from your hand. YELLOW skips GREEN 1, the next living player, and changes the turn order.',
    12: 'FINAL CHALLENGE: Stop the incoming SHOOT with DEFENSE. If GREEN uses DRIBBLE PAST, use DEFENSE again. Then discard one card, play SHOOT, and tap the opponent you want to target.'
  };

  const originalStop = guide.stop.bind(guide);

  function speakDetailed(lesson) {
    const text = DETAIL[lesson];
    if (!text) return;
    const scene = document.querySelector('.guideScene');
    const output = scene?.querySelector('.guideText');
    const button = scene?.querySelector('.guideContinue');
    if (!scene || !output || !button) return;

    const state = guide.state;
    if (state?.timer) clearTimeout(state.timer);
    if (state) {
      state.lesson = lesson;
      state.step = 0;
      state.fullText = text;
      state.waitForAction = true;
      state.typing = true;
      state.locked = false;
    }

    button.hidden = true;
    button.classList.remove('wide');
    output.textContent = '';

    let i = 0;
    const tick = () => {
      output.textContent = text.slice(0, ++i);
      if (i < text.length) {
        if (state) state.timer = setTimeout(tick, 12);
        else setTimeout(tick, 12);
      } else if (state) {
        state.typing = false;
      }
    };
    tick();
  }

  guide.stop = function() {
    originalStop();
    if (typeof current === 'number' && current >= 3 && current < 13) {
      requestAnimationFrame(() => speakDetailed(current));
    }
  };
})();
