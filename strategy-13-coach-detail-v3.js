/* More explicit coach instructions for Lessons 4–13. */
(() => {
  'use strict';
  if (window.__gsmCoachDetailV3Installed) return;
  window.__gsmCoachDetailV3Installed = true;

  const guide = window.StrategyIntroGuide;
  if (!guide || typeof guide.stop !== 'function') return;

  const DETAIL = {
    3: 'Look at the field and find the Soccer Card. Then tap the player who is holding it. That player has possession and controls the ball.',
    4: 'You have the Soccer Card. PASS uses no card, but you may PASS only during your own turn. After your required draw, tap BLUE 2 to give the Soccer Card to your teammate. BLUE 2 gets possession, but does not get an immediate turn.',
    5: 'First, play the SHOOT card from your hand. Then tap a GREEN opponent to choose your target. You need possession plus SHOOT to attack.',
    6: 'GREEN 1 already has 2 Tokens. First, play SHOOT. Then tap GREEN 1 as your target. A successful attack gives the 3rd Token and eliminates that player. After elimination, reveal the Role Card. If it is PLAYER, the remaining Action Cards go to a living teammate, and the Soccer Card is immediately passed to a living teammate of their choice, even outside their turn. In this lesson, GREEN 2 receives it. The eliminated player may still give advice.',
    7: 'GREEN 1 has played SHOOT at you. Play DEFENSE to stop the attack. TACKLE only takes the Soccer Card from a player; it cannot stop an incoming SHOOT. YELLOW does not stop an attack.',
    8: 'GREEN 2 has the Soccer Card. Play TACKLE to take the Soccer Card and win possession. TACKLE is for taking possession, not for defending a SHOOT.',
    9: 'You played SHOOT, so only you may play DRIBBLE PAST to bypass the first DEFENSE. One final DEFENSE may follow. Maximum 1 DRIBBLE PAST and 2 DEFENSE cards per SHOOT.',
    10: 'New lesson. We are starting a fresh attack from the beginning so you can play the whole chain yourself. GREEN 1 plays SHOOT at you. First, YOU play DEFENSE. GREEN 1 will then use DRIBBLE PAST to bypass your first DEFENSE. After that, YOU play DEFENSE again as the second DEFENSE. Then discard 1 additional Action Card if your hand is not empty. Teammates may communicate and choose who plays each DEFENSE.',
    11: 'Turn order is 1 GREEN 1, 2 BLUE 2, 3 GREEN 2, 4 YOU. You are last in the cycle, so after your turn it loops back to GREEN 1. Play YELLOW on your own turn to skip GREEN 1, the next living player. Even multiple YELLOW cards this turn skip only GREEN 1’s one turn; they never skip extra players.',
    12: 'FINAL CHALLENGE: Stop the incoming SHOOT with DEFENSE. If GREEN uses DRIBBLE PAST, use DEFENSE again. Discard 1 additional Action Card if you still have one. After GREEN 2 ends their turn, draw 1 to start your own turn, then attack.'
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
